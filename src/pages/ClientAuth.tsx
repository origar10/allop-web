import { CheckCircle, LogIn, LogOut, RotateCcw, ShieldCheck, UserPlus } from 'lucide-react';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
import { trackEvent } from '../lib/analytics';
import { formatBookingDate } from '../lib/dateFormat';
import { useToast } from '../lib/useToast';
import { normalizePhone } from '../shared/formatters';

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
const RESEND_SECONDS = 60;

function getSafeNext(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/mi-cuenta';
  return value;
}

export default function ClientAuth({ mode }: ClientAuthProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isRegister = mode === 'register';
  const purpose: ClientAuthPurpose = isRegister ? 'REGISTER' : 'LOGIN';
  const nextPath = getSafeNext(searchParams.get('next'));
  const [salons, setSalons] = useState<SalonOption[]>(FALLBACK_SALONS);
  const [salonSlug, setSalonSlug] = useState(INITIAL_SALON_SLUG);
  const [step, setStep] = useState<AuthStep>(() => (loadClientSession() ? 'done' : 'phone'));
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [challengeId, setChallengeId] = useState<number | null>(null);
  const [debugCode, setDebugCode] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<ClientSession | null>(() => loadClientSession());
  const [bookings, setBookings] = useState<ClientBooking[]>([]);
  const { notify } = useToast();

  const selectedSalon = useMemo(
    () => salons.find((salon) => salon.slug === salonSlug) || salons[0],
    [salonSlug, salons],
  );

  const title = isRegister ? 'Crea tu cuenta de cliente' : 'Accede a tu cuenta';
  const Icon = isRegister ? UserPlus : LogIn;
  const subtitle = isRegister
    ? 'Registra tu cuenta global por teléfono para reservar más rápido en Allop.'
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

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    listPublicSalons(controller.signal)
      .then((items) => {
        if (!mounted || !items.length) return;

        const options = items
          .filter((salon) => salon.slug && salon.nombre)
          .map((salon) => ({ slug: salon.slug, name: salon.nombre, city: salon.ciudad }));

        if (!options.length) return;

        setSalons(options);
        setSalonSlug((current) => current || options[0].slug);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (resendCountdown <= 0) return undefined;

    const timer = window.setInterval(() => {
      setResendCountdown((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCountdown]);

  function authErrorText(error: unknown, fallback: string) {
    const text = error instanceof Error ? error.message : fallback;
    const normalized = text.toLowerCase();

    if (normalized.includes('otp') || normalized.includes('code') || normalized.includes('código')) {
      return 'El código no es correcto o ha caducado. Revisa el SMS o solicita uno nuevo.';
    }

    if (normalized.includes('phone') || normalized.includes('tel')) {
      return 'El teléfono no parece válido. Usa prefijo si estás fuera de España.';
    }

    if (normalized.includes('network') || normalized.includes('fetch')) {
      return 'No hay conexión con Allop ahora mismo. Inténtalo de nuevo en unos segundos.';
    }

    return text || fallback;
  }

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
      setMessage({ ok: false, text: 'Acepta los términos y la política de privacidad para crear la cuenta.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await requestClientOtp(selectedSalon.slug, telefono, purpose);
      setPhone(telefono);
      setChallengeId(response.challengeId);
      setDebugCode(import.meta.env.DEV ? response.debugCode || '' : '');
      setCode(import.meta.env.DEV ? response.debugCode || '' : '');
      setStep('code');
      setResendCountdown(RESEND_SECONDS);
      setMessage({
        ok: true,
        text: import.meta.env.DEV && response.debugCode
          ? `Código generado para pruebas: ${response.debugCode}`
          : 'Te hemos enviado un código por SMS. Puede tardar unos segundos.',
      });
    } catch (error) {
      setMessage({ ok: false, text: authErrorText(error, 'No se pudo enviar el código.') });
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
          email: email.trim() || undefined,
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
      if (isRegister) {
        trackEvent('registration_completed', { salonSlug: selectedSalon.slug, hasEmail: Boolean(email.trim()) });
      }
      await refreshSession(nextSession);
      navigate(nextPath, { replace: true });
    } catch (error) {
      setMessage({ ok: false, text: authErrorText(error, 'No se pudo iniciar la sesión.') });
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
    clearClientSession();
    setSession(null);
    setBookings([]);
    setStep('phone');
    setMessage({ ok: true, text: 'Sesión cerrada.' });
    notify('Sesión cerrada.', 'success');
  };

  const startGoogleLogin = () => {
    const googleAuthUrl = import.meta.env.VITE_GOOGLE_AUTH_URL as string | undefined;

    if (!googleAuthUrl) {
      setMessage({
        ok: false,
        text: 'Login con Google preparado. Falta configurar VITE_GOOGLE_AUTH_URL para activar OAuth.',
      });
      return;
    }

    window.location.href = `${googleAuthUrl}?next=${encodeURIComponent(nextPath)}`;
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
            <span><CheckCircle size={16} /> Historial global</span>
          </div>
        </div>

        <form className="client-auth-card" onSubmit={submit}>
          <div className="client-auth-icon"><Icon size={22} /></div>
          <h2>{isRegister ? 'Registro cliente' : 'Inicio de sesión'}</h2>
          <button className="btn btn-ghost btn-lg auth-google" type="button" onClick={startGoogleLogin} disabled={loading}>
            <span>G</span>
            Continuar con Google
          </button>

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

              {isRegister && (
                <label>
                  Email opcional
                  <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" disabled={loading || step === 'code'} />
                </label>
              )}

              <label>
                Teléfono
                <input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" autoComplete="tel" disabled={loading || step === 'code'} />
                <span className="auth-help">Usaremos este número para enviarte un código SMS de un solo uso.</span>
              </label>

              {isRegister && step === 'phone' && (
                <label className="auth-check">
                  <input
                    checked={acceptedTerms}
                    onChange={(event) => setAcceptedTerms(event.target.checked)}
                    type="checkbox"
                    disabled={loading}
                  />
                  <span>
                    Acepto los <Link to="/terminos">términos</Link> y la <Link to="/privacidad">política de privacidad</Link>.
                  </span>
                </label>
              )}

              {step === 'code' && (
                <label>
                  Código SMS
                  <input value={code} onChange={(event) => setCode(event.target.value)} inputMode="numeric" autoComplete="one-time-code" disabled={loading} />
                  <span className="auth-help">Introduce el código recibido por SMS. Caduca por seguridad.</span>
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

          {message && (
            <p
              className={`auth-message ${message.ok ? 'ok' : 'err'}`}
              role={message.ok ? 'status' : 'alert'}
              aria-live={message.ok ? 'polite' : 'assertive'}
            >
              {message.text}
            </p>
          )}

          {step === 'phone' && (
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
              {loading && <span className="inline-spinner" aria-hidden="true" />}
              {loading ? 'Enviando...' : 'Enviar código'}
            </button>
          )}

          {step === 'code' && (
            <div className="auth-actions">
              <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
                {loading && <span className="inline-spinner" aria-hidden="true" />}
                {loading ? 'Verificando...' : isRegister ? 'Crear cuenta' : 'Entrar'}
              </button>
              <button className="btn btn-ghost btn-lg" type="button" onClick={() => setStep('phone')} disabled={loading}>
                <RotateCcw size={16} />
                Cambiar teléfono
              </button>
              <button className="btn btn-ghost btn-lg" type="button" onClick={requestCode} disabled={loading || resendCountdown > 0}>
                {resendCountdown > 0 ? `Reenviar en ${resendCountdown}s` : 'Reenviar código'}
              </button>
            </div>
          )}

          {step === 'done' && (
            <div className="auth-actions">
              <button className="btn btn-primary btn-lg" type="button" onClick={() => navigate('/')}>
                Ir al marketplace
              </button>
              <button className="btn btn-ghost btn-lg" type="button" onClick={() => navigate('/mi-cuenta')}>
                Mi cuenta
              </button>
              <button className="btn btn-ghost btn-lg" type="button" onClick={logout}>
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          )}

          {import.meta.env.DEV && debugCode && step === 'code' && <p className="auth-debug">Código de entorno de pruebas: {debugCode}</p>}

          <p className="auth-switch">
            {isRegister ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'}{' '}
            <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Inicia sesión' : 'Regístrate'}</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

