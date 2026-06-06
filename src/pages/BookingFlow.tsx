import {
  CalendarDays,
  CheckCircle,
  Clock,
  LogIn,
  Phone,
  Scissors,
  ShieldCheck,
  UserRound,
  XCircle,
} from 'lucide-react';
import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { SALONS } from '../data/salons';
import { createBooking, listAvailability, type AvailabilityDay, type BookingConfirmation } from '../lib/bookingApi';
import { addStoredBooking, createLocalBooking } from '../lib/accountStore';
import { loadClientSession } from '../lib/clientSession';
import { getAvailableDates, getProfessionals, getServices, TIME_SLOTS } from '../lib/salonDetails';
import { trackEvent } from '../lib/analytics';
import { useToast } from '../lib/useToast';

type BookingStep = 1 | 2 | 3 | 4 | 5 | 6;

function normalizePhone(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith('+')) return `+${trimmed.slice(1).replace(/\D/g, '')}`;
  return trimmed.replace(/\D/g, '');
}

function buildIdempotencyKey() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function BookingFlow() {
  const { salonSlug = '' } = useParams();
  const salon = useMemo(() => SALONS.find((item) => item.slug === salonSlug), [salonSlug]);
  const session = salon ? loadClientSession(salon.slug) : null;
  const services = useMemo(() => salon ? getServices(salon) : [], [salon]);
  const professionals = useMemo(() => salon ? getProfessionals(salon) : [], [salon]);
  const fallbackDates = useMemo<AvailabilityDay[]>(() => getAvailableDates().map((date) => ({
    ...date,
    times: salon ? [salon.nextSlot, ...TIME_SLOTS].slice(0, 7) : TIME_SLOTS,
  })), [salon]);
  const [dates, setDates] = useState<AvailabilityDay[]>(fallbackDates);
  const [step, setStep] = useState<BookingStep>(1);
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [selectedProfessionalId, setSelectedProfessionalId] = useState('any');
  const [selectedDate, setSelectedDate] = useState(dates[0]?.id || '');
  const [selectedTime, setSelectedTime] = useState(salon?.nextSlot || TIME_SLOTS[0]);
  const [guestName, setGuestName] = useState(session?.cliente.nombre || '');
  const [guestPhone, setGuestPhone] = useState(session?.cliente.telefono || '');
  const [guestEmail, setGuestEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const trackedStart = useRef(false);
  const { notify } = useToast();

  useEffect(() => {
    if (!salon) return;

    const controller = new AbortController();

    listAvailability(
      salon.slug,
      { serviceId: selectedServiceId, professionalId: selectedProfessionalId },
      fallbackDates,
      controller.signal,
    ).then((items) => {
      setDates(items);
      if (!items.some((item) => item.id === selectedDate)) {
        setSelectedDate(items[0]?.id || '');
      }
      if (!items.some((item) => item.times.includes(selectedTime))) {
        setSelectedTime(items[0]?.times[0] || salon.nextSlot);
      }
    }).catch(() => undefined);

    return () => controller.abort();
  }, [fallbackDates, salon, selectedDate, selectedProfessionalId, selectedServiceId, selectedTime]);

  useEffect(() => {
    if (!salon || trackedStart.current) return;
    trackedStart.current = true;
    trackEvent('booking_started', { salonSlug: salon.slug, source: 'booking_flow' });
  }, [salon]);

  if (!salon) {
    return <Navigate to="/404" replace />;
  }

  const selectedService = services.find((service) => service.id === selectedServiceId) || services[0];
  const selectedProfessional = professionals.find((professional) => professional.id === selectedProfessionalId) || professionals[0];
  const selectedDateLabel = dates.find((date) => date.id === selectedDate)?.label || selectedDate;
  const availableTimes = dates.find((date) => date.id === selectedDate)?.times || TIME_SLOTS;
  const canUseSession = Boolean(session);

  const goNext = () => setStep((current) => Math.min(current + 1, 6) as BookingStep);
  const goBack = () => setStep((current) => Math.max(current - 1, 1) as BookingStep);

  const submitBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const phone = normalizePhone(guestPhone);

    if (!selectedService || !selectedProfessional) {
      setError('Selecciona servicio y profesional.');
      return;
    }

    if (!canUseSession && guestName.trim().length < 2) {
      setError('Introduce tu nombre para reservar como invitado.');
      return;
    }

    if (!canUseSession && phone.length < 8) {
      setError('Introduce un teléfono válido para confirmar la reserva.');
      return;
    }

    setLoading(true);

    const result = await createBooking({
      salonSlug: salon.slug,
      service: selectedService,
      professional: selectedProfessional,
      date: selectedDate,
      time: selectedTime,
      clientName: canUseSession ? session?.cliente.nombre || guestName : guestName.trim(),
      phone: canUseSession ? session?.cliente.telefono || phone : phone,
      email: guestEmail.trim() || undefined,
      notes: notes.trim() || undefined,
      token: session?.token,
      idempotencyKey: buildIdempotencyKey(),
    });

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
    setConfirmation(result);
    setStep(6);
    setLoading(false);
    notify('Reserva guardada.', 'success');
  };

  const cancelFromConfirmation = () => {
    if (!window.confirm('Cancelar esta reserva?')) return;
    setCancelled(true);
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
                {dates.map((date) => (
                  <button
                    key={date.id}
                    className={selectedDate === date.id ? 'active' : ''}
                    type="button"
                    onClick={() => setSelectedDate(date.id)}
                  >
                    {date.label}
                  </button>
                ))}
              </div>
              <div className="booking-nav">
                <button className="btn btn-ghost btn-lg" type="button" onClick={goBack}>Atrás</button>
                <button className="btn btn-primary btn-lg" type="button" onClick={goNext}>Continuar</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="booking-card">
              <h2><Clock size={20} /> Elige hora</h2>
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
              <div className="booking-nav">
                <button className="btn btn-ghost btn-lg" type="button" onClick={goBack}>Atrás</button>
                <button className="btn btn-primary btn-lg" type="button" onClick={goNext}>Continuar</button>
              </div>
            </div>
          )}

          {step === 5 && (
            <form className="booking-card" onSubmit={submitBooking}>
              <h2><ShieldCheck size={20} /> Confirma la reserva</h2>
              {canUseSession ? (
                <div className="booking-session">
                  <CheckCircle size={18} />
                  Reservarás como {session?.cliente.nombre}. También puedes añadir un email de confirmación.
                </div>
              ) : (
                <div className="booking-guest">
                  <div className="booking-session muted">
                    <LogIn size={18} />
                    Puedes reservar como invitado o iniciar sesión para guardar el historial.
                    <Link to={`/login?next=/reservar/${salon.slug}`}>Entrar</Link>
                  </div>
                  <label>
                    Nombre
                    <input value={guestName} onChange={(event) => setGuestName(event.target.value)} autoComplete="given-name" />
                  </label>
                  <label>
                    Teléfono
                    <input value={guestPhone} onChange={(event) => setGuestPhone(event.target.value)} type="tel" autoComplete="tel" />
                  </label>
                </div>
              )}
              <label>
                Email opcional
                <input value={guestEmail} onChange={(event) => setGuestEmail(event.target.value)} type="email" autoComplete="email" />
              </label>
              <label>
                Notas para el salón
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
              </label>
              <div className="booking-policy-box">
                <strong>Estado y políticas antes de confirmar</strong>
                <p>La reserva puede quedar pendiente hasta que el salón confirme disponibilidad. Puedes cancelar desde la confirmación o desde Mi cuenta mientras esté pendiente/confirmada.</p>
                <p>Si llegas tarde o no acudes, el salón puede aplicar sus reglas internas si fueron comunicadas. Consulta <Link to="/terminos">términos</Link>, <Link to="/privacidad">privacidad</Link> y <Link to="/confianza">confianza</Link>.</p>
              </div>
              {error && <p className="auth-message err" role="alert" aria-live="assertive">{error}</p>}
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
                </>
              )}
              <div className="booking-nav">
                <Link className="btn btn-primary btn-lg" to={`/salones/${salon.slug}`}>Volver al salón</Link>
                {!cancelled && (
                  <button className="btn btn-ghost btn-lg" type="button" onClick={cancelFromConfirmation}>Cancelar reserva</button>
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
          <p><Phone size={15} /> Confirmación por SMS/email según datos disponibles.</p>
          <p><ShieldCheck size={15} /> Estado inicial: pendiente hasta confirmación del salón.</p>
        </aside>
      </div>
    </section>
  );
}
