import {
  Bell,
  CalendarDays,
  CheckCircle,
  Clock,
  LogIn,
  Mail,
  MessageSquare,
  Phone,
  Scissors,
  ShieldCheck,
  UserRound,
  XCircle,
} from 'lucide-react';
import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { SALONS, type Salon } from '../data/salons';
import { getSalonBySlug } from '../lib/salonsApi';
import { createBooking, listAvailabilityRange, listDaySlots, listApiServices, type RangeDay, type BookingConfirmation } from '../lib/bookingApi';
import { addCommsHistoryEntry, addStoredBooking, createLocalBooking, loadNotificationPreferences } from '../lib/accountStore';
import { loadClientSession } from '../lib/clientSession';
import { getAvailableDates, getProfessionals, getServices, TIME_SLOTS } from '../lib/salonDetails';
import { trackEvent } from '../lib/analytics';
import { useToast } from '../lib/useToast';
import {
  confirmationChannelSummary,
  getCancellationChannels,
  getConfirmationChannels,
  reminderChannelSummary,
} from '../lib/notificationTemplates';
import { captureError } from '../lib/monitoring';
import { ApiError } from '../shared/apiClient';

type BookingStep = 1 | 2 | 3 | 4 | 5 | 6;


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
    return raw ? (JSON.parse(raw) as BookingDraft) : null;
  } catch { return null; }
}

export default function BookingFlow() {
  const { salonSlug = '' } = useParams();
  const [searchParams] = useSearchParams();
  const staticSalon = useMemo(() => SALONS.find((item) => item.slug === salonSlug), [salonSlug]);
  const [apiSalon, setApiSalon] = useState<Salon | null>(null);
  const [salonLoading, setSalonLoading] = useState(!staticSalon);
  const [salonError, setSalonError] = useState(false);
  const fetchedSlug = useRef('');

  useEffect(() => {
    if (staticSalon || fetchedSlug.current === salonSlug || !salonSlug) return;
    fetchedSlug.current = salonSlug;
    const controller = new AbortController();
    setSalonLoading(true);
    getSalonBySlug(salonSlug, controller.signal)
      .then((s) => { setApiSalon(s); setSalonLoading(false); })
      .catch(() => { setSalonError(true); setSalonLoading(false); });
    return () => controller.abort();
  }, [staticSalon, salonSlug]);

  const salon = staticSalon ?? apiSalon;
  const session = salon ? loadClientSession(salon.slug) : null;
  const staticServices = useMemo(() => salon ? getServices(salon) : [], [salon]);
  const [apiServices, setApiServices] = useState<import('../lib/salonDetails').ServiceItem[]>([]);
  const fetchedServicesSlug = useRef('');

  const draftKey = `booking_draft_${salonSlug}`;
  const [draft] = useState(() => loadDraft(draftKey));

  const services = apiServices.length ? apiServices : staticServices;
  const [selectedServiceId, setSelectedServiceId] = useState(
    searchParams.get('service') || draft?.selectedServiceId || services[0]?.id || '',
  );

  useEffect(() => {
    if (!salonSlug || fetchedServicesSlug.current === salonSlug) return;
    fetchedServicesSlug.current = salonSlug;
    const controller = new AbortController();
    listApiServices(salonSlug, controller.signal).then((s) => {
      if (s.length) {
        setApiServices(s);
        setSelectedServiceId((prev) => {
          const ids = s.map((x) => x.id);
          return ids.includes(prev) ? prev : (s[0]?.id ?? prev);
        });
      }
    });
    return () => controller.abort();
  }, [salonSlug]);

  const professionals = useMemo(() => salon ? getProfessionals(salon) : [], [salon]);
  // Días candidatos (próximas 2 semanas). El estado real de cada día (abierto/lleno/cerrado)
  // y las horas concretas las resuelve el core, igual que la app móvil del salón.
  const dates = useMemo(() => getAvailableDates(14), []);

  const [step, setStep] = useState<BookingStep>(draft?.step ?? 1);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState(draft?.selectedProfessionalId ?? 'any');
  const [selectedDate, setSelectedDate] = useState(draft?.selectedDate || dates[0]?.id || '');
  const [selectedTime, setSelectedTime] = useState(draft?.selectedTime || '');
  // Disponibilidad real
  const [dayStatus, setDayStatus] = useState<Record<string, RangeDay>>({});
  const [daySlots, setDaySlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [errorTraceId, setErrorTraceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const trackedStart = useRef(false);
  const bookingFinished = useRef(false);
  const abandonmentState = useRef({
    step,
    selectedServiceId,
    selectedProfessionalId,
    selectedDate,
    selectedTime,
  });
  const { notify } = useToast();
  const notifPrefs = useMemo(() => loadNotificationPreferences(), []);

  // Estado de los días del rango (qué días abre / tienen hueco), para el paso "Elige fecha".
  useEffect(() => {
    if (!salon || !selectedServiceId || dates.length === 0) return;

    const controller = new AbortController();
    listAvailabilityRange(
      salon.slug,
      {
        serviceId: selectedServiceId,
        professionalId: selectedProfessionalId,
        desde: dates[0].id,
        hasta: dates[dates.length - 1].id,
      },
      controller.signal,
    ).then((map) => {
      setDayStatus(map);
      // Si el día seleccionado no abre, saltar al primer día con disponibilidad.
      if (map[selectedDate] && map[selectedDate].status !== 'available') {
        const firstOpen = dates.find((d) => map[d.id]?.status === 'available');
        if (firstOpen) setSelectedDate(firstOpen.id);
      }
    }).catch(() => setDayStatus({}));

    return () => controller.abort();
  }, [salon, selectedServiceId, selectedProfessionalId, dates, selectedDate]);

  // Horas reales del día seleccionado (sólo huecos libres), para el paso "Elige hora".
  useEffect(() => {
    if (!salon || !selectedServiceId || !selectedDate) {
      setDaySlots([]);
      return;
    }

    const controller = new AbortController();
    setSlotsLoading(true);
    setSlotsError(false);
    listDaySlots(
      salon.slug,
      { serviceId: selectedServiceId, professionalId: selectedProfessionalId, date: selectedDate },
      controller.signal,
    ).then((result) => {
      setDaySlots(result.slots);
      setSlotsLoading(false);
      // Mantener la hora elegida si sigue disponible; si no, limpiar la selección.
      setSelectedTime((prev) => (prev && result.slots.includes(prev) ? prev : ''));
    }).catch((err) => {
      if (controller.signal.aborted) return;
      setSlotsLoading(false);
      if (err instanceof ApiError && err.status) {
        // El salón respondió con un error real: no inventamos horas.
        setDaySlots([]);
        setSlotsError(true);
      } else {
        // Sin conexión / timeout: modo degradado. Permitimos elegir una hora orientativa
        // para crear la reserva como "pendiente" (el salón confirmará disponibilidad).
        setDaySlots(TIME_SLOTS);
        setSelectedTime((prev) => (prev && TIME_SLOTS.includes(prev) ? prev : TIME_SLOTS[0]));
      }
    });

    return () => controller.abort();
  }, [salon, selectedServiceId, selectedProfessionalId, selectedDate]);

  useEffect(() => {
    if (!salon || trackedStart.current) return;
    trackedStart.current = true;
    trackEvent('booking_started', { salonSlug: salon.slug, source: 'booking_flow' });
  }, [salon]);

  useEffect(() => {
    abandonmentState.current = {
      step,
      selectedServiceId,
      selectedProfessionalId,
      selectedDate,
      selectedTime,
    };
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

  useEffect(() => {
    if (step <= 1) return;
    try {
      sessionStorage.setItem(draftKey, JSON.stringify({
        step, selectedServiceId, selectedProfessionalId, selectedDate, selectedTime,
      } satisfies BookingDraft));
    } catch { /* quota exceeded, ignore */ }
  }, [draftKey, step, selectedServiceId, selectedProfessionalId, selectedDate, selectedTime]);

  if (salonLoading) return null;
  if (!salon || salonError) {
    return <Navigate to="/404" replace />;
  }

  const selectedService = services.find((service) => service.id === selectedServiceId) || services[0];
  const selectedProfessional = professionals.find((professional) => professional.id === selectedProfessionalId) || professionals[0];
  const selectedDateLabel = dates.find((date) => date.id === selectedDate)?.label || selectedDate;
  const availableTimes = daySlots;
  const canUseSession = Boolean(session);

  const goNext = () => setStep((current) => {
    const next = Math.min(current + 1, 6) as BookingStep;
    trackEvent('booking_step', { salonSlug: salon.slug, step: next });
    return next;
  });
  const goBack = () => setStep((current) => Math.max(current - 1, 1) as BookingStep);

  const submitBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!selectedService || !selectedProfessional) {
      setError('Selecciona servicio y profesional.');
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
        phone: session?.cliente.telefono || '',
        email: guestEmail.trim() || undefined,
        notes: notes.trim() || undefined,
        token: session?.token,
        idempotencyKey: buildIdempotencyKey(),
      });
    } catch (err) {
      const traceId = err instanceof ApiError && err.traceId
        ? err.traceId
        : captureError(err, 'manual');
      setErrorTraceId(traceId);
      setError(err instanceof Error ? err.message : 'No se pudo confirmar la reserva.');
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
      guest: !canUseSession,
    });
    bookingFinished.current = true;
    sessionStorage.removeItem(draftKey);

    // Register confirmation comms history entries for each active channel
    const confirmChannels = getConfirmationChannels(notifPrefs);
    for (const channel of confirmChannels) {
      addCommsHistoryEntry({
        event: 'confirmacion',
        channel,
        salonName: salon.name,
        serviceName: selectedService.name,
        bookingDate: selectedDate,
        bookingTime: selectedTime,
        locator: result.locator,
      });
    }

    setConfirmation(result);
    setStep(6);
    setLoading(false);
    notify('Reserva guardada.', 'success');
  };

  const cancelFromConfirmation = () => {
    setCancelConfirm(false);
    setCancelled(true);
    sessionStorage.removeItem(draftKey);
    bookingFinished.current = true;
    trackEvent('booking_cancelled', { salonSlug: salon.slug, step: 6 });

    // Register cancellation comms history entries
    if (confirmation) {
      const cancelChannels = getCancellationChannels(notifPrefs);
      for (const channel of cancelChannels) {
        addCommsHistoryEntry({
          event: 'cancelacion',
          channel,
          salonName: salon.name,
          serviceName: selectedService?.name || 'Reserva',
          bookingDate: selectedDate,
          bookingTime: selectedTime,
          locator: confirmation.locator,
        });
      }
    }

    notify('Reserva cancelada.', 'success');
  };

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
            <p className="eyebrow">Reserva en Allop</p>
            <h1>{salon.name}</h1>
            <p>{salon.category} en {salon.location} · próximo hueco {salon.nextSlot}</p>
          </div>

          <div className="booking-steps" aria-label="Progreso de reserva">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <span key={item} className={step >= item ? 'active' : ''}>{item}</span>
            ))}
          </div>

          {step === 1 && (
            <div className="booking-card">
              <h2><Scissors size={20} /> Elige servicio</h2>
              <div className="booking-options">
                {services.map((service) => (
                  <button
                    key={service.id}
                    className={selectedServiceId === service.id ? 'active' : ''}
                    type="button"
                    onClick={() => setSelectedServiceId(service.id)}
                  >
                    <strong>{service.name}</strong>
                    <span>{service.duration} · {service.price} €</span>
                  </button>
                ))}
              </div>
              <button className="btn btn-primary btn-lg" type="button" onClick={goNext}>Continuar</button>
            </div>
          )}

          {step === 2 && (
            <div className="booking-card">
              <h2><UserRound size={20} /> Elige profesional</h2>
              <div className="booking-options">
                {professionals.map((professional) => (
                  <button
                    key={professional.id}
                    className={selectedProfessionalId === professional.id ? 'active' : ''}
                    type="button"
                    onClick={() => setSelectedProfessionalId(professional.id)}
                  >
                    <strong>{professional.name}</strong>
                    <span>{professional.role} · {professional.services}</span>
                  </button>
                ))}
              </div>
              <div className="booking-nav">
                <button className="btn btn-ghost btn-lg" type="button" onClick={goBack}>Atrás</button>
                <button className="btn btn-primary btn-lg" type="button" onClick={goNext}>Continuar</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="booking-card">
              <h2><CalendarDays size={20} /> Elige fecha</h2>
              <div className="booking-date-grid">
                {dates.map((date) => {
                  const info = dayStatus[date.id];
                  // Sin datos de rango aún → permitir seleccionar (se valida al cargar las horas).
                  const cerrado = info ? info.status === 'closed' : false;
                  const lleno = info ? info.status === 'full' : false;
                  const deshabilitado = cerrado || lleno;
                  return (
                    <button
                      key={date.id}
                      className={selectedDate === date.id ? 'active' : ''}
                      type="button"
                      disabled={deshabilitado}
                      title={cerrado ? 'Cerrado' : lleno ? 'Sin huecos' : undefined}
                      onClick={() => setSelectedDate(date.id)}
                    >
                      {date.label}
                      {lleno && <span className="booking-date-tag">Completo</span>}
                      {cerrado && <span className="booking-date-tag">Cerrado</span>}
                    </button>
                  );
                })}
              </div>
              <div className="booking-nav">
                <button className="btn btn-ghost btn-lg" type="button" onClick={goBack}>Atrás</button>
                <button
                  className="btn btn-primary btn-lg"
                  type="button"
                  onClick={goNext}
                  disabled={!selectedDate || dayStatus[selectedDate]?.status === 'closed' || dayStatus[selectedDate]?.status === 'full'}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="booking-card">
              <h2><Clock size={20} /> Elige hora</h2>
              {slotsLoading ? (
                <p className="booking-slots-state"><span className="inline-spinner" aria-hidden="true" /> Buscando horas disponibles…</p>
              ) : slotsError ? (
                <p className="booking-slots-state err">No se pudo cargar la disponibilidad. Inténtalo de nuevo.</p>
              ) : availableTimes.length === 0 ? (
                <p className="booking-slots-state">No quedan horas disponibles este día. Prueba con otra fecha.</p>
              ) : (
                <div className="booking-time-grid">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      className={selectedTime === time ? 'active' : ''}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
              <div className="booking-nav">
                <button className="btn btn-ghost btn-lg" type="button" onClick={goBack}>Atrás</button>
                <button className="btn btn-primary btn-lg" type="button" onClick={goNext} disabled={!selectedTime}>Continuar</button>
              </div>
            </div>
          )}

          {step === 5 && !canUseSession && (
            <div className="booking-card">
              <h2><LogIn size={20} /> Inicia sesión para reservar</h2>
              <div className="booking-session">
                <LogIn size={18} />
                Necesitas una cuenta de cliente para completar la reserva.
              </div>
              <div className="booking-nav">
                <button className="btn btn-ghost btn-lg" type="button" onClick={goBack}>Atrás</button>
                <Link className="btn btn-primary btn-lg" to={`/login?next=/reservar/${salon.slug}`}>Iniciar sesión</Link>
              </div>
            </div>
          )}

          {step === 5 && canUseSession && (
            <form className="booking-card" onSubmit={submitBooking}>
              <h2><ShieldCheck size={20} /> Confirma la reserva</h2>
              <div className="booking-session">
                <CheckCircle size={18} />
                Reservarás como {session?.cliente.nombre}. También puedes añadir un email de confirmación.
              </div>
              <label>
                Email opcional
                <input value={guestEmail} onChange={(event) => setGuestEmail(event.target.value)} type="email" autoComplete="email" />
              </label>
              <label>
                Notas para el salón
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
              </label>
              {/* Notification preview */}
              <div className="booking-notif-preview">
                <div className="booking-notif-row">
                  {notifPrefs.sms && <span className="booking-notif-chip"><Phone size={12} /> SMS</span>}
                  {notifPrefs.email && <span className="booking-notif-chip"><Mail size={12} /> Email</span>}
                  {notifPrefs.whatsapp && <span className="booking-notif-chip"><MessageSquare size={12} /> WhatsApp</span>}
                  {!notifPrefs.sms && !notifPrefs.email && !notifPrefs.whatsapp && (
                    <span className="booking-notif-chip muted"><Bell size={12} /> Sin notificaciones</span>
                  )}
                </div>
                <p>
                  {notifPrefs.confirmaciones
                    ? `Recibirás confirmación ${confirmationChannelSummary(notifPrefs)}.`
                    : 'No recibirás confirmación (desactivada en preferencias).'}
                  {notifPrefs.recordatorios && reminderChannelSummary(notifPrefs)
                    ? ` ${reminderChannelSummary(notifPrefs)}`
                    : ''}
                </p>
                <Link to="/mi-cuenta/perfil" className="booking-notif-edit">Cambiar preferencias</Link>
              </div>

              <div className="booking-policy-box">
                <strong>Estado y políticas antes de confirmar</strong>
                <p>La reserva puede quedar pendiente hasta que el salón confirme disponibilidad. Puedes cancelar desde la confirmación o desde Mi cuenta mientras esté pendiente/confirmada.</p>
                <p>Si llegas tarde o no acudes, el salón puede aplicar sus reglas internas si fueron comunicadas. Consulta <Link to="/terminos">términos</Link>, <Link to="/privacidad">privacidad</Link> y <Link to="/confianza">confianza</Link>.</p>
              </div>
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
                <button className="btn btn-ghost btn-lg" type="button" onClick={goBack} disabled={loading}>Atrás</button>
                <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
                  {loading && <span className="inline-spinner" aria-hidden="true" />}
                  {loading ? 'Confirmando...' : 'Confirmar reserva'}
                </button>
              </div>
            </form>
          )}

          {step === 6 && confirmation && (
            <div className={`booking-card booking-confirmation ${cancelled ? 'cancelled' : ''}`}>
              {cancelled ? <XCircle size={34} /> : <CheckCircle size={34} />}
              <h2>{cancelled ? 'Reserva cancelada' : 'Reserva recibida'}</h2>
              <p>{cancelled ? 'La solicitud queda cancelada desde esta pantalla de confirmación.' : confirmation.message}</p>
              {!cancelled && (
                <>
                  <div className="booking-locator">{confirmation.locator}</div>
                  <p>{confirmation.notification}</p>
                  {reminderChannelSummary(notifPrefs) && (
                    <p className="booking-confirmation-reminder">
                      <Bell size={14} />
                      {reminderChannelSummary(notifPrefs)}
                    </p>
                  )}
                </>
              )}
              {cancelled && notifPrefs.cancelaciones && (
                <p className="booking-confirmation-reminder">
                  <Bell size={14} />
                  Notificación de cancelación enviada {confirmationChannelSummary(notifPrefs)}.
                </p>
              )}
              <div className="booking-nav">
                <Link className="btn btn-primary btn-lg" to={`/salones/${salon.slug}`}>Volver al salón</Link>
                {!cancelled && (
                  cancelConfirm ? (
                    <div className="confirm-row">
                      <span>¿Cancelar esta reserva?</span>
                      <button className="btn btn-sm danger" type="button" onClick={cancelFromConfirmation}>Sí, cancelar</button>
                      <button className="btn btn-sm btn-ghost" type="button" onClick={() => setCancelConfirm(false)}>No</button>
                    </div>
                  ) : (
                    <button className="btn btn-ghost btn-lg" type="button" onClick={() => setCancelConfirm(true)}>Cancelar reserva</button>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        <aside className="booking-summary-card">
          <div className={`booking-summary-media ${salon.imageClass}`} />
          <h2>Resumen</h2>
          <dl>
            <div>
              <dt>Salón</dt>
              <dd>{salon.name}</dd>
            </div>
            <div>
              <dt>Servicio</dt>
              <dd>{selectedService?.name || 'Pendiente'}</dd>
            </div>
            <div>
              <dt>Profesional</dt>
              <dd>{selectedProfessional?.name || 'Cualquiera disponible'}</dd>
            </div>
            <div>
              <dt>Fecha y hora</dt>
              <dd>{selectedDateLabel} · {selectedTime}</dd>
            </div>
            <div>
              <dt>Precio</dt>
              <dd>{selectedService?.price || salon.desde} €</dd>
            </div>
          </dl>
          <p><Bell size={15} /> Confirmación {confirmationChannelSummary(notifPrefs)}.</p>
          <p><ShieldCheck size={15} /> Estado inicial: pendiente hasta confirmación del salón.</p>
        </aside>
      </div>
    </section>
  );
}
