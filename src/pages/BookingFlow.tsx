import {
  CalendarDays,
  CheckCircle,
  Clock,
  LogIn,
  MapPin,
  Phone,
  Scissors,
  ShieldCheck,
  UserRound,
  Users,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { SALONS, type Salon } from '../data/salons';
import { getSalonBySlug } from '../lib/salonsApi';
import {
  createBooking,
  listApiServices,
  listAvailabilityRange,
  listDaySlots,
  listProfessionals,
  type BookingConfirmation,
  type RangeDay,
} from '../lib/bookingApi';
import { addStoredBooking, cancelStoredBooking, createLocalBooking } from '../lib/accountStore';
import { loadClientSession } from '../lib/clientSession';
import { cancelClientBooking } from '../lib/platformApi';
import {
  ANY_PROFESSIONAL,
  formatPrice,
  getAvailableDates,
  getServices,
  groupByCategory,
  type ProfessionalItem,
  type ServiceItem,
  WEEK_DAYS,
} from '../lib/salonDetails';
import { trackEvent } from '../lib/analytics';
import { useToast } from '../lib/useToast';
import { captureError } from '../lib/monitoring';
import { ApiError } from '../shared/apiClient';

type BookingStep = 1 | 2 | 3 | 4 | 5;
const STEP_LABELS = ['Servicio', 'Profesional', 'Día y hora', 'Confirmar'];

function buildIdempotencyKey() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

interface BookingDraft {
  step: BookingStep;
  selectedServiceId: string;
  selectedProfessionalId: string;
  selectedDate: string;
  selectedTime: string;
}

function loadDraft(key: string): BookingDraft | null {
  try {
    const raw = sessionStorage.getItem(key);
    const draft = raw ? (JSON.parse(raw) as BookingDraft) : null;
    // La pantalla final no se restaura: la reserva ya se hizo.
    return draft && draft.step < 5 ? draft : null;
  } catch { return null; }
}

const weekdayFmt = new Intl.DateTimeFormat('es-ES', { weekday: 'short' });
const monthFmt = new Intl.DateTimeFormat('es-ES', { month: 'short' });
const longDateFmt = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

function longDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return longDateFmt.format(new Date(y, m - 1, d));
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
}

function ProfessionalAvatar({ professional }: { professional: ProfessionalItem }) {
  if (professional.id === 'any') return <span className="pro-avatar pro-avatar-any"><Users size={18} /></span>;
  if (professional.avatarUrl) return <img className="pro-avatar" src={professional.avatarUrl} alt="" />;
  return (
    <span className="pro-avatar" style={professional.avatarColor ? { background: professional.avatarColor, color: '#fff' } : undefined}>
      {initials(professional.name)}
    </span>
  );
}

export default function BookingFlow() {
  const { salonSlug = '' } = useParams();
  const [searchParams] = useSearchParams();
  const staticSalon = useMemo(() => SALONS.find((item) => item.slug === salonSlug), [salonSlug]);
  const [apiSalon, setApiSalon] = useState<Salon | null>(null);
  const [salonLoading, setSalonLoading] = useState(!staticSalon);
  const [salonError, setSalonError] = useState(false);
  useEffect(() => {
    if (staticSalon || !salonSlug) return undefined;
    const controller = new AbortController();
    getSalonBySlug(salonSlug, controller.signal)
      .then((s) => { setApiSalon(s); setSalonError(false); setSalonLoading(false); })
      .catch(() => {
        // Un abort (desmontaje o StrictMode) no es "salón inexistente".
        if (controller.signal.aborted) return;
        setSalonError(true);
        setSalonLoading(false);
      });
    return () => controller.abort();
  }, [staticSalon, salonSlug]);

  const salon = staticSalon ?? apiSalon;
  const session = salon ? loadClientSession(salon.slug) : null;

  const draftKey = `booking_draft_${salonSlug}`;
  const [draft] = useState(() => loadDraft(draftKey));
  const serviceFromUrl = searchParams.get('service');

  // Servicios de la ficha (al instante) y luego los de la API, que es lo que se puede reservar.
  const [apiServices, setApiServices] = useState<ServiceItem[] | null>(null);
  const fichaServices = useMemo(() => salon ? getServices(salon) : [], [salon]);
  const services = apiServices ?? fichaServices;
  const serviceGroups = useMemo(() => groupByCategory(services), [services]);

  const [step, setStep] = useState<BookingStep>(draft?.step ?? (serviceFromUrl ? 2 : 1));
  const [selectedServiceId, setSelectedServiceId] = useState(serviceFromUrl || draft?.selectedServiceId || '');
  const [selectedProfessionalId, setSelectedProfessionalId] = useState(draft?.selectedProfessionalId ?? 'any');
  const dates = useMemo(() => getAvailableDates(21), []);
  const opensToday = useMemo(() => {
    const today = WEEK_DAYS[(new Date().getDay() + 6) % 7];
    return salon?.horarioApertura?.find((d) => d.dia === today)?.abierto ?? false;
  }, [salon]);
  const [selectedDate, setSelectedDate] = useState(draft?.selectedDate || '');
  const [selectedTime, setSelectedTime] = useState(draft?.selectedTime || '');

  const [professionals, setProfessionals] = useState<ProfessionalItem[] | null>(null);
  const [dayStatus, setDayStatus] = useState<Record<string, RangeDay>>({});
  const [rangeLoading, setRangeLoading] = useState(false);
  const [rangeError, setRangeError] = useState(false);
  const [daySlots, setDaySlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(false);
  const [error, setError] = useState('');
  const [errorTraceId, setErrorTraceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const trackedStart = useRef(false);
  const bookingFinished = useRef(false);
  const abandonmentState = useRef({ step, selectedServiceId, selectedProfessionalId, selectedDate, selectedTime });
  const { notify } = useToast();

  useEffect(() => {
    if (!salonSlug) return;
    const controller = new AbortController();
    listApiServices(salonSlug, controller.signal).then((s) => {
      // Si la API falla (lista vacía) se sigue con los servicios de la ficha.
      if (controller.signal.aborted || s.length === 0) return;
      setApiServices(s);
      // Si el servicio de la URL/borrador ya no se puede reservar, se vuelve a elegir.
      setSelectedServiceId((prev) => {
        if (s.some((x) => x.id === prev)) return prev;
        setStep((current) => (current > 1 && current < 5 ? 1 : current));
        return '';
      });
    });
    return () => controller.abort();
  }, [salonSlug]);

  // Profesionales reales que hacen el servicio elegido.
  useEffect(() => {
    if (!salon || !selectedServiceId) return;
    const controller = new AbortController();
    Promise.resolve()
      .then(() => {
        setProfessionals(null);
        return listProfessionals(salon.slug, selectedServiceId, controller.signal);
      })
      .then((list) => {
        if (controller.signal.aborted) return;
        setProfessionals(list);
        setSelectedProfessionalId((prev) => (prev === 'any' || list.some((p) => p.id === prev) ? prev : 'any'));
        // Con un solo profesional no hay nada que elegir.
        if (list.length <= 1) setStep((current) => (current === 2 ? 3 : current));
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setProfessionals([]);
        setStep((current) => (current === 2 ? 3 : current));
      });
    return () => controller.abort();
  }, [salon, selectedServiceId]);

  // Qué días abre el salón y cuáles tienen hueco para este servicio/profesional.
  useEffect(() => {
    if (!salon || !selectedServiceId || dates.length === 0) return;
    const controller = new AbortController();
    Promise.resolve().then(() => {
      setRangeLoading(true);
      setRangeError(false);
      return listAvailabilityRange(
        salon.slug,
        { serviceId: selectedServiceId, professionalId: selectedProfessionalId, desde: dates[0].id, hasta: dates[dates.length - 1].id },
        controller.signal,
      );
    }).then((map) => {
      if (controller.signal.aborted) return;
      setDayStatus(map);
      setSelectedDate((prev) => {
        if (prev && map[prev]?.status === 'available') return prev;
        return dates.find((d) => map[d.id]?.status === 'available')?.id ?? prev ?? '';
      });
    }).catch(() => {
      if (controller.signal.aborted) return;
      setDayStatus({});
      setRangeError(true);
    }).finally(() => {
      if (!controller.signal.aborted) setRangeLoading(false);
    });
    return () => controller.abort();
  }, [salon, selectedServiceId, selectedProfessionalId, dates]);

  // Horas libres reales del día elegido (las calcula el core, igual que en la app del salón).
  useEffect(() => {
    if (!salon || !selectedServiceId || !selectedDate) return;
    const controller = new AbortController();
    let active = true;

    (async () => {
      setSlotsLoading(true);
      setSlotsError(false);
      try {
        const result = await listDaySlots(
          salon.slug,
          { serviceId: selectedServiceId, professionalId: selectedProfessionalId, date: selectedDate },
          controller.signal,
        );
        if (!active) return;
        setDaySlots(result.slots);
        setSelectedTime((prev) => (prev && result.slots.includes(prev) ? prev : ''));
      } catch {
        if (!active || controller.signal.aborted) return;
        // Sin disponibilidad real no se inventan horas.
        setDaySlots([]);
        setSlotsError(true);
      } finally {
        if (active) setSlotsLoading(false);
      }
    })();

    return () => { active = false; controller.abort(); };
  }, [salon, selectedServiceId, selectedProfessionalId, selectedDate]);

  useEffect(() => {
    if (!salon || trackedStart.current) return;
    trackedStart.current = true;
    trackEvent('booking_started', { salonSlug: salon.slug, source: 'booking_flow' });
  }, [salon]);

  useEffect(() => {
    abandonmentState.current = { step, selectedServiceId, selectedProfessionalId, selectedDate, selectedTime };
  }, [selectedDate, selectedProfessionalId, selectedServiceId, selectedTime, step]);

  useEffect(() => {
    if (!salon) return undefined;
    return () => {
      const state = abandonmentState.current;
      if (!trackedStart.current || bookingFinished.current || state.step <= 1) return;
      trackEvent('booking_abandoned', {
        salonSlug: salon.slug,
        step: state.step,
        serviceId: state.selectedServiceId || null,
        professionalId: state.selectedProfessionalId || null,
        date: state.selectedDate || null,
        time: state.selectedTime || null,
      });
    };
  }, [salon]);

  // Borrador para volver aquí tras iniciar sesión.
  useEffect(() => {
    if (step <= 1 || step >= 5) return;
    try {
      sessionStorage.setItem(draftKey, JSON.stringify({
        step, selectedServiceId, selectedProfessionalId, selectedDate, selectedTime,
      } satisfies BookingDraft));
    } catch { /* quota exceeded, ignore */ }
  }, [draftKey, step, selectedServiceId, selectedProfessionalId, selectedDate, selectedTime]);

  if (salonLoading) return null;
  if (!salon || salonError) return <Navigate to="/404" replace />;

  const selectedService = services.find((service) => service.id === selectedServiceId);
  const professionalOptions = [ANY_PROFESSIONAL, ...(professionals ?? [])];
  const selectedProfessional = professionalOptions.find((p) => p.id === selectedProfessionalId) ?? ANY_PROFESSIONAL;
  // Con un solo profesional no hay nada que elegir: se salta ese paso.
  const skipProfessional = professionals !== null && professionals.length <= 1;
  const phone = session?.cliente.telefono?.trim() || '';
  const morning = daySlots.filter((t) => t < '14:00');
  const afternoon = daySlots.filter((t) => t >= '14:00');
  const hasAnyAvailability = Object.values(dayStatus).some((d) => d.status === 'available');

  const goTo = (next: BookingStep) => {
    trackEvent('booking_step', { salonSlug: salon.slug, step: next });
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goNext = () => {
    if (step === 1 && skipProfessional) return goTo(3);
    goTo(Math.min(step + 1, 5) as BookingStep);
  };
  const goBack = () => {
    if (step === 3 && skipProfessional) return goTo(1);
    goTo(Math.max(step - 1, 1) as BookingStep);
  };

  const chooseService = (id: string) => {
    setSelectedServiceId(id);
    setSelectedTime('');
  };

  const submitBooking = async () => {
    setError('');
    if (!selectedService || !selectedDate || !selectedTime) {
      setError('Elige servicio, día y hora.');
      return;
    }

    setLoading(true);
    setErrorTraceId('');

    let result;
    try {
      result = await createBooking({
        salonSlug: salon.slug,
        service: selectedService,
        professional: selectedProfessional,
        date: selectedDate,
        time: selectedTime,
        clientName: session?.cliente.nombre || '',
        phone,
        token: session?.token,
        idempotencyKey: buildIdempotencyKey(),
      });
    } catch (err) {
      const traceId = err instanceof ApiError && err.traceId ? err.traceId : captureError(err, 'manual');
      setErrorTraceId(traceId);
      const status = err instanceof ApiError ? err.status : undefined;
      setError(
        status === 409 || (err instanceof Error && /ocupad|disponib|solap/i.test(err.message))
          ? 'Esa hora se acaba de ocupar. Elige otra, por favor.'
          : status ? (err as Error).message || 'No se pudo confirmar la reserva.'
            : 'No hay conexión con el salón. Revisa tu conexión y vuelve a intentarlo.',
      );
      setLoading(false);
      return;
    }

    addStoredBooking(createLocalBooking({
      id: result.id,
      salonSlug: salon.slug,
      salonName: salon.name,
      service: selectedService,
      date: selectedDate,
      time: selectedTime,
      locator: result.locator,
    }));
    trackEvent('booking_completed', {
      salonSlug: salon.slug,
      serviceId: selectedService.id,
      professionalId: selectedProfessional.id,
      status: result.status,
    });
    bookingFinished.current = true;
    sessionStorage.removeItem(draftKey);
    setConfirmation(result);
    setStep(5);
    setLoading(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelFromConfirmation = async () => {
    if (!confirmation || !session) return;
    setCancelling(true);
    try {
      await cancelClientBooking(salon.slug, confirmation.id, session.token);
      cancelStoredBooking(confirmation.id);
      setCancelled(true);
      setCancelConfirm(false);
      trackEvent('booking_cancelled', { salonSlug: salon.slug, step: 5 });
      notify('Cita cancelada.', 'success');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'No se pudo cancelar la cita.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const visibleSteps = skipProfessional ? [1, 3, 4] : [1, 2, 3, 4];

  return (
    <section className="booking-flow">
      <div className="container booking-layout">
        <div className="booking-main">
          <nav className="breadcrumb-chain" aria-label="Miga de pan">
            <Link to="/">Marketplace</Link>
            <span>/</span>
            <Link to={`/salones/${salon.slug}`}>{salon.name}</Link>
            <span>/</span>
            <span>Reserva</span>
          </nav>
          <div className="booking-heading">
            <p className="eyebrow">Reserva online</p>
            <h1>{salon.name}</h1>
            {salon.address && <p><MapPin size={14} /> {salon.address}</p>}
          </div>

          {step < 5 && (
            <ol className="booking-steps-labeled" aria-label="Progreso de reserva">
              {visibleSteps.map((item, index) => (
                <li key={item} className={step === item ? 'current' : step > item ? 'done' : ''}>
                  <span>{index + 1}</span>
                  {STEP_LABELS[item - 1]}
                </li>
              ))}
            </ol>
          )}

          {step === 1 && (
            <div className="booking-card">
              <h2><Scissors size={20} /> ¿Qué te quieres hacer?</h2>
              {services.length === 0 ? (
                <p className="booking-slots-state">
                  {apiServices === null ? 'Cargando servicios…' : 'Este salón todavía no tiene servicios para reservar online.'}
                </p>
              ) : (
                serviceGroups.map((group) => (
                  <div key={group.category ?? '_'} className="booking-service-group">
                    {serviceGroups.length > 1 && <h3>{group.category ?? 'Otros servicios'}</h3>}
                    <div className="booking-options">
                      {group.items.map((service) => (
                        <button
                          key={service.id}
                          className={selectedServiceId === service.id ? 'active' : ''}
                          type="button"
                          aria-pressed={selectedServiceId === service.id}
                          onClick={() => chooseService(service.id)}
                        >
                          <strong>{service.name}</strong>
                          <span>
                            <Clock size={13} /> {service.duration}
                            {service.price !== null && <> · {formatPrice(service.price)}</>}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
              <button className="btn btn-primary btn-lg" type="button" onClick={goNext} disabled={!selectedService}>
                Continuar
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="booking-card">
              <h2><UserRound size={20} /> ¿Con quién?</h2>
              {professionals === null ? (
                <p className="booking-slots-state"><span className="inline-spinner" aria-hidden="true" /> Cargando el equipo…</p>
              ) : (
                <div className="booking-options booking-pros">
                  {professionalOptions.map((professional) => (
                    <button
                      key={professional.id}
                      className={selectedProfessionalId === professional.id ? 'active' : ''}
                      type="button"
                      aria-pressed={selectedProfessionalId === professional.id}
                      onClick={() => { setSelectedProfessionalId(professional.id); setSelectedTime(''); }}
                    >
                      <ProfessionalAvatar professional={professional} />
                      <span className="pro-text">
                        <strong>{professional.name}</strong>
                        <span>{professional.id === 'any' ? 'Más horas disponibles' : professional.role}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <div className="booking-nav">
                <button className="btn btn-ghost btn-lg" type="button" onClick={goBack}>Atrás</button>
                <button className="btn btn-primary btn-lg" type="button" onClick={goNext}>Continuar</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="booking-card">
              <h2><CalendarDays size={20} /> ¿Cuándo te va bien?</h2>
              <div className="booking-day-strip" role="listbox" aria-label="Días">
                {dates.map((date, index) => {
                  const info = dayStatus[date.id];
                  // Hoy, pasada la última hora, la agenda lo da por "cerrado" aunque el salón abra: para el cliente está completo.
                  const pastClosing = index === 0 && info?.status === 'closed' && opensToday;
                  const closed = info?.status === 'closed' && !pastClosing;
                  const full = info?.status === 'full' || pastClosing;
                  const disabled = rangeLoading || !info || closed || full;
                  return (
                    <button
                      key={date.id}
                      role="option"
                      aria-selected={selectedDate === date.id}
                      className={selectedDate === date.id ? 'active' : ''}
                      type="button"
                      disabled={disabled}
                      title={closed ? 'Cerrado' : full ? 'Sin huecos' : undefined}
                      onClick={() => { setSelectedDate(date.id); setSelectedTime(''); }}
                    >
                      <small>{index === 0 ? 'Hoy' : index === 1 ? 'Mañana' : weekdayFmt.format(date.value)}</small>
                      <strong>{date.value.getDate()}</strong>
                      <small>{closed ? 'Cerrado' : full ? 'Completo' : monthFmt.format(date.value)}</small>
                    </button>
                  );
                })}
              </div>

              {rangeLoading ? (
                <p className="booking-slots-state"><span className="inline-spinner" aria-hidden="true" /> Consultando la agenda…</p>
              ) : rangeError ? (
                <p className="booking-slots-state err">
                  No se pudo consultar la agenda del salón. Revisa tu conexión y vuelve a intentarlo.
                  {salon.phone && <> También puedes llamar al <a href={`tel:${salon.phone.replace(/\s/g, '')}`}>{salon.phone}</a>.</>}
                </p>
              ) : !hasAnyAvailability ? (
                <p className="booking-slots-state">
                  No quedan huecos online en las próximas semanas{selectedProfessionalId !== 'any' ? ' con este profesional' : ''}.
                  {selectedProfessionalId !== 'any' && <> <button className="btn-link-inline" type="button" onClick={() => setSelectedProfessionalId('any')}>Probar con cualquiera</button></>}
                  {salon.phone && <> También puedes llamar al <a href={`tel:${salon.phone.replace(/\s/g, '')}`}>{salon.phone}</a>.</>}
                </p>
              ) : slotsLoading ? (
                <p className="booking-slots-state"><span className="inline-spinner" aria-hidden="true" /> Buscando horas libres…</p>
              ) : slotsError ? (
                <p className="booking-slots-state err">No se pudo cargar la disponibilidad. Inténtalo de nuevo en un momento.</p>
              ) : daySlots.length === 0 ? (
                <p className="booking-slots-state">No quedan horas libres este día. Prueba con otro.</p>
              ) : (
                <div className="booking-slot-groups">
                  {[['Mañana', morning], ['Tarde', afternoon]].map(([label, times]) => (times as string[]).length > 0 && (
                    <div key={label as string}>
                      <h3>{label as string}</h3>
                      <div className="booking-time-grid">
                        {(times as string[]).map((time) => (
                          <button
                            key={time}
                            className={selectedTime === time ? 'active' : ''}
                            type="button"
                            aria-pressed={selectedTime === time}
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="booking-nav">
                <button className="btn btn-ghost btn-lg" type="button" onClick={goBack}>Atrás</button>
                <button className="btn btn-primary btn-lg" type="button" onClick={goNext} disabled={!selectedTime}>Continuar</button>
              </div>
            </div>
          )}

          {step === 4 && !session && (
            <div className="booking-card">
              <h2><LogIn size={20} /> Entra para confirmar</h2>
              <p className="booking-lead">
                Guardamos tu selección. Entra o crea tu cuenta de Allop (es gratis) y vuelves aquí para confirmar.
              </p>
              <div className="booking-nav">
                <button className="btn btn-ghost btn-lg" type="button" onClick={goBack}>Atrás</button>
                <Link className="btn btn-primary btn-lg" to={`/login?next=/reservar/${salon.slug}`}>Entrar o registrarme</Link>
              </div>
            </div>
          )}

          {step === 4 && session && !phone && (
            <div className="booking-card">
              <h2><Phone size={20} /> Falta tu teléfono</h2>
              <p className="booking-lead">
                El salón necesita tu móvil para reconocerte y avisarte de la cita. Solo lo tienes que añadir una vez.
              </p>
              <div className="booking-nav">
                <button className="btn btn-ghost btn-lg" type="button" onClick={goBack}>Atrás</button>
                <Link className="btn btn-primary btn-lg" to={`/completar-perfil?next=/reservar/${salon.slug}`}>Añadir teléfono</Link>
              </div>
            </div>
          )}

          {step === 4 && session && phone && (
            <div className="booking-card">
              <h2><ShieldCheck size={20} /> Revisa y confirma</h2>
              <dl className="booking-review">
                <div><dt>Servicio</dt><dd>{selectedService?.name}</dd></div>
                <div><dt>Profesional</dt><dd>{selectedProfessional.name}</dd></div>
                <div><dt>Cuándo</dt><dd>{longDate(selectedDate)} a las {selectedTime}</dd></div>
                <div><dt>Duración</dt><dd>{selectedService?.duration}</dd></div>
                {selectedService?.price !== null && selectedService?.price !== undefined && (
                  <div><dt>Precio</dt><dd>{formatPrice(selectedService.price)}</dd></div>
                )}
                <div><dt>A nombre de</dt><dd>{session.cliente.nombre} · {phone}</dd></div>
              </dl>
              <p className="booking-lead">
                Pagas en el salón. Si luego no puedes ir, cancela desde <Link to="/mi-cuenta/reservas">Mi cuenta</Link> o llamando al salón.
              </p>
              {error && (
                <div role="alert" aria-live="assertive">
                  <p className="auth-message err">{error}</p>
                  {errorTraceId && (
                    <p className="error-trace-id">
                      Referencia: <code>{errorTraceId}</code>
                      {' '}·{' '}
                      <a href={`/contacto?motivo=error-reserva&traza=${errorTraceId}`} className="btn-link-inline">Contactar soporte</a>
                    </p>
                  )}
                </div>
              )}
              <div className="booking-nav">
                <button className="btn btn-ghost btn-lg" type="button" onClick={goBack} disabled={loading}>Cambiar hora</button>
                <button className="btn btn-primary btn-lg" type="button" onClick={submitBooking} disabled={loading}>
                  {loading && <span className="inline-spinner" aria-hidden="true" />}
                  {loading ? 'Reservando…' : 'Confirmar cita'}
                </button>
              </div>
            </div>
          )}

          {step === 5 && confirmation && (
            <div className={`booking-card booking-confirmation ${cancelled ? 'cancelled' : ''}`}>
              {cancelled ? <XCircle size={40} /> : <CheckCircle size={40} />}
              <h2>{cancelled ? 'Cita cancelada' : '¡Cita reservada!'}</h2>
              <p>
                {cancelled
                  ? 'Hemos liberado el hueco en la agenda del salón.'
                  : `${selectedService?.name ?? 'Tu cita'} · ${longDate(selectedDate)} a las ${selectedTime}`}
              </p>
              {!cancelled && (
                <>
                  <p>{confirmation.message}</p>
                  <div className="booking-locator">{confirmation.locator}</div>
                  <p>{confirmation.notification}</p>
                </>
              )}
              <div className="booking-nav">
                <Link className="btn btn-primary btn-lg" to="/mi-cuenta/reservas">Mis reservas</Link>
                <Link className="btn btn-ghost btn-lg" to={`/salones/${salon.slug}`}>Volver al salón</Link>
              </div>
              {!cancelled && (
                cancelConfirm ? (
                  <div className="confirm-row">
                    <span>¿Seguro que quieres cancelarla?</span>
                    <button className="btn btn-sm danger" type="button" onClick={cancelFromConfirmation} disabled={cancelling}>
                      {cancelling ? 'Cancelando…' : 'Sí, cancelar'}
                    </button>
                    <button className="btn btn-sm btn-ghost" type="button" onClick={() => setCancelConfirm(false)} disabled={cancelling}>No</button>
                  </div>
                ) : (
                  <button className="btn-link-inline" type="button" onClick={() => setCancelConfirm(true)}>Cancelar esta cita</button>
                )
              )}
            </div>
          )}
        </div>

        <aside className="booking-summary-card">
          {salon.photos?.[0]
            ? <img className="booking-summary-media" src={salon.photos[0]} alt="" />
            : <div className="booking-summary-media salon-photo-empty" aria-hidden="true"><span>{initials(salon.name)}</span></div>}
          <h2>Tu cita</h2>
          <dl>
            <div>
              <dt>Salón</dt>
              <dd>{salon.name}</dd>
            </div>
            <div>
              <dt>Servicio</dt>
              <dd>{selectedService?.name || '—'}</dd>
            </div>
            <div>
              <dt>Profesional</dt>
              <dd>{selectedProfessional.name}</dd>
            </div>
            <div>
              <dt>Cuándo</dt>
              <dd>{selectedDate && selectedTime ? `${longDate(selectedDate)} · ${selectedTime}` : '—'}</dd>
            </div>
            {selectedService?.price !== null && selectedService?.price !== undefined && (
              <div>
                <dt>Precio</dt>
                <dd>{formatPrice(selectedService.price)}</dd>
              </div>
            )}
          </dl>
          <p><ShieldCheck size={15} /> Reserva gratis. Pagas en el salón.</p>
        </aside>
      </div>
    </section>
  );
}
