import { CheckCircle, LogIn, RotateCcw, ShieldCheck, UserPlus } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  requestClientOtp,
  verifyClientOtp,
  emailLoginClient,
  emailRegisterClient,
  type ClientAuthPurpose,
} from '../lib/platformApi';
import {
  loadClientSession,
  saveClientSession,
} from '../lib/clientSession';
import { trackEvent } from '../lib/analytics';
import { useToast } from '../lib/useToast';
import { normalizePhone } from '../shared/formatters';

interface ClientAuthProps {
  mode: 'login' | 'register';
}

// register steps: 'form' → fill all fields, 'otp' → verify SMS code
type RegisterStep = 'form' | 'otp';

const MARKETPLACE_SLUG = 'marketplace';
const RESEND_SECONDS = 60;

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI as string | undefined;
const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID as string | undefined;
const APPLE_REDIRECT_URI = import.meta.env.VITE_APPLE_REDIRECT_URI as string | undefined;

function getSafeNext(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/mi-cuenta';
  return value;
}

export default function ClientAuth({ mode }: ClientAuthProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isRegister = mode === 'register';
  const purpose: ClientAuthPurpose = 'REGISTER';
  const nextPath = getSafeNext(searchParams.get('next'));

  // form fields
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // register OTP step
  const [registerStep, setRegisterStep] = useState<RegisterStep>('form');
  const [otpCode, setOtpCode] = useState('');
  const [challengeId, setChallengeId] = useState<number | null>(null);
  const [debugCode, setDebugCode] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const { notify } = useToast();

  const title = isRegister ? 'Crea tu cuenta de cliente' : 'Accede a tu cuenta';
  const Icon = isRegister ? UserPlus : LogIn;

  useEffect(() => {
    if (loadClientSession()) navigate(nextPath, { replace: true });
  }, [navigate, nextPath]);

  useEffect(() => {
    if (resendCountdown <= 0) return undefined;
    const timer = window.setInterval(() => setResendCountdown((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendCountdown]);

  function authErrorText(error: unknown, fallback: string) {
    const text = error instanceof Error ? error.message : fallback;
    const normalized = text.toLowerCase();
    if (normalized.includes('network') || normalized.includes('fetch')) {
      return 'No hay conexión con Allop ahora mismo. Inténtalo de nuevo en unos segundos.';
    }
    return text || fallback;
  }

  // ── Login ────────────────────────────────────────────────────────────────

  const submitLogin = async () => {
    if (!email.trim() || !password) {
      setMessage({ ok: false, text: 'Introduce tu email o teléfono y contraseña.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const auth = await emailLoginClient({ identifier: email.trim(), password });
      saveClientSession({ ...auth, salonSlug: MARKETPLACE_SLUG, salonName: 'Allop', createdAt: new Date().toISOString() });
      notify(`Sesión iniciada como ${auth.cliente.nombre}.`, 'success');
      navigate(nextPath, { replace: true });
    } catch (error) {
      setMessage({ ok: false, text: authErrorText(error, 'Email/teléfono o contraseña incorrectos.') });
    } finally {
      setLoading(false);
    }
  };

  // ── Register: step 1 — send OTP ──────────────────────────────────────────

  const sendOtp = async () => {
    if (!name.trim() || name.trim().length < 2) {
      setMessage({ ok: false, text: 'Introduce tu nombre.' });
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMessage({ ok: false, text: 'Email no válido.' });
      return;
    }
    const tel = normalizePhone(phone);
    if (tel.length < 8) {
      setMessage({ ok: false, text: 'Introduce un teléfono válido.' });
      return;
    }
    if (password.length < 8) {
      setMessage({ ok: false, text: 'La contraseña debe tener al menos 8 caracteres.' });
      return;
    }
    if (!acceptedTerms) {
      setMessage({ ok: false, text: 'Acepta los términos y la política de privacidad para crear la cuenta.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const response = await requestClientOtp(MARKETPLACE_SLUG, tel, purpose);
      setPhone(tel);
      setChallengeId(response.challengeId);
      setDebugCode(import.meta.env.DEV ? response.debugCode || '' : '');
      setOtpCode(import.meta.env.DEV ? response.debugCode || '' : '');
      setRegisterStep('otp');
      setResendCountdown(RESEND_SECONDS);
      setMessage({
        ok: true,
        text: import.meta.env.DEV && response.debugCode
          ? `Código generado para pruebas: ${response.debugCode}`
          : 'Te hemos enviado un código de verificación por SMS.',
      });
    } catch (error) {
      setMessage({ ok: false, text: authErrorText(error, 'No se pudo enviar el código.') });
    } finally {
      setLoading(false);
    }
  };

  // ── Register: step 2 — verify OTP + create account ───────────────────────

  const confirmRegister = async () => {
    if (!challengeId || otpCode.trim().length < 4) {
      setMessage({ ok: false, text: 'Introduce el código recibido por SMS.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const verified = await verifyClientOtp(MARKETPLACE_SLUG, {
        challengeId,
        telefono: phone,
        code: otpCode.trim(),
        purpose,
      });
      const auth = await emailRegisterClient({
        nombre: name.trim(),
        apellidos: lastName.trim() || undefined,
        email: email.trim(),
        telefono: phone,
        password,
        verificationToken: verified.verificationToken,
      });
      saveClientSession({ ...auth, salonSlug: MARKETPLACE_SLUG, salonName: 'Allop', createdAt: new Date().toISOString() });
      trackEvent('registration_completed', { salonSlug: MARKETPLACE_SLUG, hasEmail: true });
      notify(`Cuenta creada. Bienvenido/a, ${auth.cliente.nombre}.`, 'success');
      navigate(nextPath, { replace: true });
    } catch (error) {
      setMessage({ ok: false, text: authErrorText(error, 'No se pudo verificar el código.') });
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await requestClientOtp(MARKETPLACE_SLUG, phone, purpose);
      setChallengeId(response.challengeId);
      setDebugCode(import.meta.env.DEV ? response.debugCode || '' : '');
      setResendCountdown(RESEND_SECONDS);
      setMessage({ ok: true, text: 'Nuevo código enviado por SMS.' });
    } catch (error) {
      setMessage({ ok: false, text: authErrorText(error, 'No se pudo reenviar el código.') });
    } finally {
      setLoading(false);
    }
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isRegister) { submitLogin(); return; }
    if (registerStep === 'form') { sendOtp(); return; }
    confirmRegister();
  };

  const startGoogleLogin = () => {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: GOOGLE_CLIENT_ID!,
      redirect_uri: GOOGLE_REDIRECT_URI!,
      scope: 'openid email profile',
      state: nextPath,
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  const startAppleLogin = () => {
    const params = new URLSearchParams({
      response_type: 'code id_token',
      client_id: APPLE_CLIENT_ID!,
      redirect_uri: APPLE_REDIRECT_URI!,
      scope: 'name email',
      response_mode: 'form_post',
      state: nextPath,
    });
    window.location.href = `https://appleid.apple.com/auth/authorize?${params.toString()}`;
  };

  return (
    <section className="client-auth">
      <div className="container client-auth-grid">
        <div className="client-auth-copy">
          <p className="eyebrow">Allop clientes</p>
          <h1>{title}</h1>
          <p>
            {isRegister
              ? 'Registra tu cuenta con email, teléfono y contraseña. Verificamos el teléfono una sola vez.'
              : 'Entra con tu email o teléfono y contraseña para ver tus reservas y continuar como cliente.'}
          </p>
          <div className="client-auth-points">
            <span><CheckCircle size={16} /> Reservas más rápidas</span>
            <span><ShieldCheck size={16} /> Teléfono verificado</span>
            <span><CheckCircle size={16} /> Historial global</span>
          </div>
        </div>

        <form className="client-auth-card" onSubmit={submit}>
          <div className="client-auth-icon"><Icon size={22} /></div>
          <h2>{isRegister ? 'Registro cliente' : 'Inicio de sesión'}</h2>

          {GOOGLE_CLIENT_ID && GOOGLE_REDIRECT_URI && (
            <button className="btn btn-ghost btn-lg auth-google" type="button" onClick={startGoogleLogin} disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continuar con Google
            </button>
          )}

          {APPLE_CLIENT_ID && APPLE_REDIRECT_URI && (
            <button className="btn btn-ghost btn-lg auth-apple" type="button" onClick={startAppleLogin} disabled={loading}>
              <svg width="17" height="20" viewBox="0 0 814 1000" aria-hidden="true" focusable="false">
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-47.4-148.2-107.8c-50.2-70.8-102.3-181.9-102.3-287.7 0-219.1 143.6-335.2 284.2-335.2 74.9 0 137.5 49.2 184.1 49.2 44.6 0 115.7-52.6 201.7-52.6 32.8 0 134.2 2.6 198.4 101.9zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
              </svg>
              Continuar con Apple
            </button>
          )}

          {/* ── Login form ── */}
          {!isRegister && (
            <>
              <label>
                Email o teléfono
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="text"
                  autoComplete="email"
                  disabled={loading}
                />
              </label>
              <label>
                Contraseña
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  autoComplete="current-password"
                  disabled={loading}
                />
              </label>
            </>
          )}

          {/* ── Register: step 1 — form ── */}
          {isRegister && registerStep === 'form' && (
            <>
              <div className="auth-two-cols">
                <label>
                  Nombre
                  <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" disabled={loading} />
                </label>
                <label>
                  Apellidos
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" disabled={loading} />
                </label>
              </div>
              <label>
                Email
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" disabled={loading} />
              </label>
              <label>
                Teléfono
                <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" disabled={loading} />
                <span className="auth-help">Con prefijo si estás fuera de España (+34…). Recibirás un código de verificación.</span>
              </label>
              <label>
                Contraseña
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="new-password" disabled={loading} />
                <span className="auth-help">Mínimo 8 caracteres.</span>
              </label>
              <label className="auth-check">
                <input checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} type="checkbox" disabled={loading} />
                <span>
                  Acepto los <Link to="/terminos">términos</Link> y la <Link to="/privacidad">política de privacidad</Link>.
                </span>
              </label>
            </>
          )}

          {/* ── Register: step 2 — OTP verification ── */}
          {isRegister && registerStep === 'otp' && (
            <>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
                Hemos enviado un código de 6 dígitos al número <strong>{phone}</strong>. Introdúcelo para verificar tu teléfono.
              </p>
              <label>
                Código SMS
                <input
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  disabled={loading}
                />
              </label>
            </>
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

          {/* ── Submit button ── */}
          {(!isRegister || registerStep === 'form') && (
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
              {loading && <span className="inline-spinner" aria-hidden="true" />}
              {loading
                ? (isRegister ? 'Enviando código...' : 'Entrando...')
                : (isRegister ? 'Continuar' : 'Entrar')}
            </button>
          )}

          {isRegister && registerStep === 'otp' && (
            <div className="auth-actions">
              <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
                {loading && <span className="inline-spinner" aria-hidden="true" />}
                {loading ? 'Verificando...' : 'Crear cuenta'}
              </button>
              <button className="btn btn-ghost btn-lg" type="button" onClick={() => { setRegisterStep('form'); setMessage(null); }} disabled={loading}>
                <RotateCcw size={16} />
                Cambiar datos
              </button>
              <button className="btn btn-ghost btn-lg" type="button" onClick={resendOtp} disabled={loading || resendCountdown > 0}>
                {resendCountdown > 0 ? `Reenviar en ${resendCountdown}s` : 'Reenviar código'}
              </button>
            </div>
          )}

          {import.meta.env.DEV && debugCode && isRegister && registerStep === 'otp' && (
            <p className="auth-debug">Código de entorno de pruebas: {debugCode}</p>
          )}

          <p className="auth-switch">
            {isRegister ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'}{' '}
            <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Inicia sesión' : 'Regístrate'}</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
