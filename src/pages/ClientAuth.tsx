import { CheckCircle, LogIn, RotateCcw, ShieldCheck, UserPlus } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  loginClient,
  registerClient,
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

type AuthStep = 'phone' | 'code';
type AuthMethod = 'sms' | 'email';

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
  const purpose: ClientAuthPurpose = isRegister ? 'REGISTER' : 'LOGIN';
  const nextPath = getSafeNext(searchParams.get('next'));
  const [method, setMethod] = useState<AuthMethod>('email');
  const [step, setStep] = useState<AuthStep>('phone');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [challengeId, setChallengeId] = useState<number | null>(null);
  const [debugCode, setDebugCode] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const { notify } = useToast();

  const title = isRegister ? 'Crea tu cuenta de cliente' : 'Accede a tu cuenta';
  const Icon = isRegister ? UserPlus : LogIn;
  const subtitle = isRegister
    ? 'Registra tu cuenta con email, teléfono y contraseña para reservar más rápido en Allop.'
    : 'Entra con tu email o teléfono para ver tus reservas y continuar como cliente.';

  // Redirect if already logged in
  useEffect(() => {
    if (loadClientSession()) {
      navigate(nextPath, { replace: true });
    }
  }, [navigate, nextPath]);

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
      const response = await requestClientOtp(MARKETPLACE_SLUG, telefono, purpose);
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
    if (!challengeId) {
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
      const verified = await verifyClientOtp(MARKETPLACE_SLUG, {
        challengeId,
        telefono: phone,
        code: code.trim(),
        purpose,
      });

      const auth = isRegister
        ? await registerClient(MARKETPLACE_SLUG, {
          nombre: name.trim(),
          apellidos: lastName.trim() || undefined,
          email: email.trim() || undefined,
          telefono: phone,
          verificationToken: verified.verificationToken,
        })
        : await loginClient(MARKETPLACE_SLUG, {
          telefono: phone,
          verificationToken: verified.verificationToken,
        });

      saveClientSession({
        ...auth,
        salonSlug: MARKETPLACE_SLUG,
        salonName: 'Allop',
        createdAt: new Date().toISOString(),
      });

      if (isRegister) {
        trackEvent('registration_completed', { salonSlug: MARKETPLACE_SLUG, hasEmail: Boolean(email.trim()) });
      }

      notify(`Sesión iniciada como ${auth.cliente.nombre}.`, 'success');
      navigate(nextPath, { replace: true });
    } catch (error) {
      setMessage({ ok: false, text: authErrorText(error, 'No se pudo iniciar la sesión.') });
    } finally {
      setLoading(false);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (method === 'email') {
      completeEmailAuth();
      return;
    }
    if (step === 'phone') {
      requestCode();
      return;
    }
    completeAuth();
  };

  const completeEmailAuth = async () => {
    if (isRegister) {
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
    }

    setLoading(true);
    setMessage(null);
    try {
      const auth = isRegister
        ? await emailRegisterClient({
            nombre: name.trim(),
            apellidos: lastName.trim() || undefined,
            email: email.trim(),
            telefono: normalizePhone(phone),
            password,
          })
        : await emailLoginClient({ identifier: email.trim(), password });

      saveClientSession({ ...auth, salonSlug: MARKETPLACE_SLUG, salonName: 'Allop', createdAt: new Date().toISOString() });
      if (isRegister) trackEvent('registration_completed', { salonSlug: MARKETPLACE_SLUG, hasEmail: true });
      notify(`Sesión iniciada como ${auth.cliente.nombre}.`, 'success');
      navigate(nextPath, { replace: true });
    } catch (error) {
      setMessage({ ok: false, text: authErrorText(error, isRegister ? 'No se pudo crear la cuenta.' : 'Email/teléfono o contraseña incorrectos.') });
    } finally {
      setLoading(false);
    }
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

          <div className="auth-method-tabs" role="tablist">
            <button
              className={`auth-method-tab${method === 'email' ? ' active' : ''}`}
              type="button"
              role="tab"
              aria-selected={method === 'email'}
              onClick={() => { setMethod('email'); setMessage(null); }}
              disabled={loading}
            >
              Email y contraseña
            </button>
            <button
              className={`auth-method-tab${method === 'sms' ? ' active' : ''}`}
              type="button"
              role="tab"
              aria-selected={method === 'sms'}
              onClick={() => { setMethod('sms'); setMessage(null); }}
              disabled={loading}
            >
              Código SMS
            </button>
          </div>

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

          {method === 'email' && (
            <label>
              {isRegister ? 'Email' : 'Email o teléfono'}
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type={isRegister ? 'email' : 'text'}
                autoComplete="email"
                disabled={loading}
              />
            </label>
          )}

          {method === 'email' && isRegister && (
            <label>
              Teléfono
              <input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" autoComplete="tel" disabled={loading} />
              <span className="auth-help">Con prefijo si estás fuera de España (+34…).</span>
            </label>
          )}

          {method === 'email' && (
            <label>
              Contraseña
              <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} disabled={loading} />
              {isRegister && <span className="auth-help">Mínimo 8 caracteres.</span>}
            </label>
          )}

          {method === 'sms' && (
            <label>
              Teléfono
              <input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" autoComplete="tel" disabled={loading || step === 'code'} />
              <span className="auth-help">Usaremos este número para enviarte un código SMS de un solo uso.</span>
            </label>
          )}

          {isRegister && (method === 'email' || (method === 'sms' && step === 'phone')) && (
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

          {method === 'sms' && step === 'code' && (
            <label>
              Código SMS
              <input value={code} onChange={(event) => setCode(event.target.value)} inputMode="numeric" autoComplete="one-time-code" disabled={loading} />
              <span className="auth-help">Introduce el código recibido por SMS. Caduca por seguridad.</span>
            </label>
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

          {method === 'email' && (
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
              {loading && <span className="inline-spinner" aria-hidden="true" />}
              {loading ? (isRegister ? 'Creando cuenta...' : 'Entrando...') : isRegister ? 'Crear cuenta' : 'Entrar'}
            </button>
          )}

          {method === 'sms' && step === 'phone' && (
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
              {loading && <span className="inline-spinner" aria-hidden="true" />}
              {loading ? 'Enviando...' : 'Enviar código'}
            </button>
          )}

          {method === 'sms' && step === 'code' && (
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

          {import.meta.env.DEV && debugCode && method === 'sms' && step === 'code' && <p className="auth-debug">Código de entorno de pruebas: {debugCode}</p>}

          <p className="auth-switch">
            {isRegister ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'}{' '}
            <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Inicia sesión' : 'Regístrate'}</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
