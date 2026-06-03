import { CheckCircle, LogIn, LogOut, RotateCcw, ShieldCheck, UserPlus } from 'lucide-react';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SALONS } from '../data/salons';
import {
  getClientBookings,
  getClientMe,
  listPublicSalons,
  loginClient,
  registerClient,
  requestClientOtp,
  verifyClientOtp,
  type ClientBooking,
  type ClientAuthPurpose,
} from '../lib/platformApi';
import {
  clearClientSession,
  loadClientSession,
  saveClientSession,
  type ClientSession,
} from '../lib/clientSession';

interface ClientAuthProps {
  mode: 'login' | 'register';
}

interface SalonOption {
  slug: string;
  name: string;
  city?: string | null;
}

type AuthStep = 'phone' | 'code' | 'done';

const FALLBACK_SALONS: SalonOption[] = SALONS.map((salon) => ({
  slug: salon.slug,
  name: salon.name,
  city: salon.location,
}));
const INITIAL_SALON_SLUG = FALLBACK_SALONS[0]?.slug || '';

function normalizePhone(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith('+')) {
    return `+${trimmed.slice(1).replace(/\D/g, '')}`;
  }

  return trimmed.replace(/\D/g, '');
}

function formatBookingDate(value?: string) {
  if (!value) return 'Fecha pendiente';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function ClientAuth({ mode }: ClientAuthProps) {
  const navigate = useNavigate();
  const isRegister = mode === 'register';
  const purpose: ClientAuthPurpose = isRegister ? 'REGISTER' : 'LOGIN';
  const [salons, setSalons] = useState<SalonOption[]>(FALLBACK_SALONS);
  const [salonSlug, setSalonSlug] = useState(INITIAL_SALON_SLUG);
  const [step, setStep] = useState<AuthStep>(() => (loadClientSession(INITIAL_SALON_SLUG) ? 'done' : 'phone'));
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [challengeId, setChallengeId] = useState<number | null>(null);
  const [debugCode, setDebugCode] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<ClientSession | null>(() => loadClientSession(INITIAL_SALON_SLUG));
  const [bookings, setBookings] = useState<ClientBooking[]>([]);

  const selectedSalon = useMemo(
    () => salons.find((salon) => salon.slug === salonSlug) || salons[0],
    [salonSlug, salons],
  );

  const title = isRegister ? 'Crea tu cuenta de cliente' : 'Accede a tu cuenta';
  const Icon = isRegister ? UserPlus : LogIn;
  const subtitle = isRegister
    ? 'Registra tu cuenta por teléfono para reservar más rápido en tu salón.'
    : 'Entra con código SMS para ver tus reservas y continuar como cliente.';

  async function refreshSession(currentSession: ClientSession) {
    const [profile, nextBookings] = await Promise.all([
      getClientMe(currentSession.salonSlug, currentSession.token),
      getClientBookings(currentSession.salonSlug, currentSession.token).catch(() => []),
    ]);

    const updatedSession = { ...currentSession, cliente: profile };
    saveClientSession(updatedSession);
    setSession(updatedSession);
    setBookings(nextBookings);
  }

  function syncStoredSession(slug: string) {
    const storedSession = loadClientSession(slug);
    setSession(storedSession);

    if (!storedSession) {
      setBookings([]);
      setStep('phone');
      return;
    }

    setStep('done');
    refreshSession(storedSession).catch(() => undefined);
  }

  useEffect(() => {
    let mounted = true;

    listPublicSalons()
      .then((items) => {
        if (!mounted || !items.length) return;

        const options = items
          .filter((salon) => salon.slug && salon.nombre)
          .map((salon) => ({ slug: salon.slug, name: salon.nombre, city: salon.ciudad }));

        if (!options.length) return;

        setSalons(options);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  const requestCode = async () => {
    const telefono = normalizePhone(phone);

    if (!selectedSalon) {
      setMessage({ ok: false, text: 'Selecciona un salón.' });
      return;
    }

    if (telefono.length < 8) {
      setMessage({ ok: false, text: 'Introduce un teléfono válido.' });
      return;
    }

    if (isRegister && name.trim().length < 2) {
      setMessage({ ok: false, text: 'Introduce tu nombre.' });
      return;
    }

    if (isRegister && !acceptedTerms) {
      setMessage({ ok: false, text: 'Acepta el tratamiento de datos para crear la cuenta.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await requestClientOtp(selectedSalon.slug, telefono, purpose);
      setPhone(telefono);
      setChallengeId(response.challengeId);
      setDebugCode(response.debugCode || '');
      setCode(response.debugCode || '');
      setStep('code');
      setMessage({
        ok: true,
        text: response.debugCode
          ? `Código generado para pruebas: ${response.debugCode}`
          : 'Te hemos enviado un código por SMS.',
      });
    } catch (error) {
      setMessage({ ok: false, text: error instanceof Error ? error.message : 'No se pudo enviar el código.' });
    } finally {
      setLoading(false);
    }
  };

  const completeAuth = async () => {
    if (!selectedSalon || !challengeId) {
      setMessage({ ok: false, text: 'Vuelve a solicitar el código.' });
      return;
    }

    if (code.trim().length < 4) {
      setMessage({ ok: false, text: 'Introduce el código recibido.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const verified = await verifyClientOtp(selectedSalon.slug, {
        challengeId,
        telefono: phone,
        code: code.trim(),
        purpose,
      });

      const auth = isRegister
        ? await registerClient(selectedSalon.slug, {
          nombre: name.trim(),
          apellidos: lastName.trim() || undefined,
          telefono: phone,
          verificationToken: verified.verificationToken,
        })
        : await loginClient(selectedSalon.slug, {
          telefono: phone,
          verificationToken: verified.verificationToken,
        });

      const nextSession: ClientSession = {
        ...auth,
        salonSlug: selectedSalon.slug,
        salonName: selectedSalon.name,
        createdAt: new Date().toISOString(),
      };

      saveClientSession(nextSession);
      setSession(nextSession);
      setStep('done');
      setMessage({ ok: true, text: `Sesión iniciada como ${auth.cliente.nombre}.` });
      await refreshSession(nextSession);
    } catch (error) {
      setMessage({ ok: false, text: error instanceof Error ? error.message : 'No se pudo iniciar la sesión.' });
    } finally {
      setLoading(false);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === 'phone') {
      requestCode();
      return;
    }

    if (step === 'code') {
      completeAuth();
    }
  };

  const logout = () => {
    clearClientSession(salonSlug);
    setSession(null);
    setBookings([]);
    setStep('phone');
    setMessage({ ok: true, text: 'Sesión cerrada.' });
  };

  return (
    <section className="client-auth">
      <div className="container client-auth-grid">
        <div className="client-auth-copy">
          <p className="eyebrow">Allop clientes</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
          <div className="client-auth-points">
            <span><CheckCircle size={16} /> Reservas más rápidas</span>
            <span><ShieldCheck size={16} /> Acceso con código SMS</span>
            <span><CheckCircle size={16} /> Historial por salón</span>
          </div>
        </div>

        <form className="client-auth-card" onSubmit={submit}>
          <div className="client-auth-icon"><Icon size={22} /></div>
          <h2>{isRegister ? 'Registro cliente' : 'Inicio de sesión'}</h2>

          <label>
            Salón
            <select
              value={salonSlug}
              onChange={(event) => {
                setSalonSlug(event.target.value);
                syncStoredSession(event.target.value);
              }}
              disabled={loading}
            >
              {salons.map((salon) => (
                <option value={salon.slug} key={salon.slug}>
                  {salon.name}{salon.city ? ` - ${salon.city}` : ''}
                </option>
              ))}
            </select>
          </label>

          {step !== 'done' && (
            <>
              {isRegister && (
                <div className="auth-two-cols">
                  <label>
                    Nombre
                    <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="given-name" disabled={loading || step === 'code'} />
                  </label>
                  <label>
                    Apellidos
                    <input value={lastName} onChange={(event) => setLastName(event.target.value)} autoComplete="family-name" disabled={loading || step === 'code'} />
                  </label>
                </div>
              )}

              <label>
                Teléfono
                <input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" autoComplete="tel" disabled={loading || step === 'code'} />
              </label>

              {isRegister && step === 'phone' && (
                <label className="auth-check">
                  <input
                    checked={acceptedTerms}
                    onChange={(event) => setAcceptedTerms(event.target.checked)}
                    type="checkbox"
                    disabled={loading}
                  />
                  Acepto el tratamiento de mis datos para gestionar reservas.
                </label>
              )}

              {step === 'code' && (
                <label>
                  Código SMS
                  <input value={code} onChange={(event) => setCode(event.target.value)} inputMode="numeric" autoComplete="one-time-code" disabled={loading} />
                </label>
              )}
            </>
          )}

          {step === 'done' && session && (
            <div className="auth-session">
              <strong>{session.cliente.nombre} {session.cliente.apellidos || ''}</strong>
              <span>{session.cliente.telefono || phone}</span>
              <span>{session.salonName}</span>
              <div className="auth-bookings">
                <strong>Reservas</strong>
                {bookings.length ? bookings.slice(0, 3).map((booking) => (
                  <p key={booking.id}>
                    {booking.servicio?.nombre || 'Reserva'} · {formatBookingDate(booking.fecha_hora_inicio)} · {booking.estado || 'pendiente'}
                  </p>
                )) : <p>Aún no tienes reservas en este salón.</p>}
              </div>
            </div>
          )}

          {message && <p className={`auth-message ${message.ok ? 'ok' : 'err'}`}>{message.text}</p>}

          {step === 'phone' && (
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar código'}
            </button>
          )}

          {step === 'code' && (
            <div className="auth-actions">
              <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
                {loading ? 'Verificando...' : isRegister ? 'Crear cuenta' : 'Entrar'}
              </button>
              <button className="btn btn-ghost btn-lg" type="button" onClick={() => setStep('phone')} disabled={loading}>
                <RotateCcw size={16} />
                Cambiar teléfono
              </button>
            </div>
          )}

          {step === 'done' && (
            <div className="auth-actions">
              <button className="btn btn-primary btn-lg" type="button" onClick={() => navigate('/')}>
                Ir al marketplace
              </button>
              <button className="btn btn-ghost btn-lg" type="button" onClick={logout}>
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          )}

          {debugCode && step === 'code' && <p className="auth-debug">Código de entorno de pruebas: {debugCode}</p>}

          <p className="auth-switch">
            {isRegister ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'}{' '}
            <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Inicia sesión' : 'Regístrate'}</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
