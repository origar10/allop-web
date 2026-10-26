import { type FormEvent, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { completeProfileClient, requestClientOtp, verifyClientOtp } from '../lib/platformApi';
import { loadClientSession, saveClientSession } from '../lib/clientSession';
import { useToast } from '../lib/useToast';
import { normalizePhone } from '../shared/formatters';
import { getSafeNext } from '../lib/safeNext';

import { tr } from '../lib/tr';
const MARKETPLACE_SLUG = 'marketplace';


export default function CompleteProfile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = getSafeNext(searchParams.get('next'));
  const isGoogle = searchParams.get('provider') === 'google';
  const { notify } = useToast();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // El teléfono identifica al cliente en cada salón, así que se verifica por SMS.
  const [challenge, setChallenge] = useState<{ id: number; telefono: string; debugCode?: string } | null>(null);
  const [code, setCode] = useState('');

  useEffect(() => {
    if (!loadClientSession()) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (challenge) {
      await confirm();
      return;
    }
    const telefono = normalizePhone(phone);
    if (telefono.length < 8) {
      setError(tr('Introduce un teléfono válido.'));
      return;
    }
    if (!isGoogle && password.length < 8) {
      setError(tr('La contraseña debe tener al menos 8 caracteres.'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await requestClientOtp(MARKETPLACE_SLUG, telefono, 'REGISTER');
      const debugCode = import.meta.env.DEV ? response.debugCode : undefined;
      setChallenge({ id: response.challengeId, telefono, debugCode });
      setCode(debugCode ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('No se pudo enviar el código.'));
    } finally {
      setLoading(false);
    }
  };

  const confirm = async () => {
    if (!challenge) return;
    if (code.trim().length < 4) {
      setError(tr('Introduce el código que te hemos enviado por SMS.'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const session = loadClientSession();
      if (!session) {
        navigate('/login', { replace: true });
        return;
      }
      const { verificationToken } = await verifyClientOtp(MARKETPLACE_SLUG, {
        challengeId: challenge.id,
        telefono: challenge.telefono,
        code: code.trim(),
        purpose: 'REGISTER',
      });
      const cliente = await completeProfileClient(
        { telefono: challenge.telefono, verificationToken, ...(isGoogle ? {} : { password }) },
        session.token,
      );
      // Sin esto la sesión seguiría sin teléfono y la reserva lo volvería a pedir.
      saveClientSession({ ...session, cliente: { ...session.cliente, ...cliente } });
      notify('Perfil completado correctamente.', 'success');
      navigate(next, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('No se pudo verificar el código.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="client-auth">
      <div className="container client-auth-grid">
        <form
          className="client-auth-card"
          onSubmit={submit}
          style={{ gridColumn: '1 / -1', maxWidth: 480, margin: '0 auto' }}
        >
          <div className="client-auth-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2>{tr('Completa tu perfil')}</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            {isGoogle
              ? tr('Añade tu teléfono para completar el registro.')
              : tr('Añade tu teléfono y elige una contraseña para poder acceder con email o teléfono en el futuro.')}
          </p>

          <label>
            {tr('Teléfono')}
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              autoComplete="tel"
              disabled={loading || Boolean(challenge)}
            />
            <span className="auth-help">{tr('Te enviaremos un código por SMS para confirmarlo.')}</span>
          </label>

          {challenge && (
            <label>
              {tr('Código SMS')}
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                disabled={loading}
              />
              <span className="auth-help">
                {tr('Enviado al')}{' '}{challenge.telefono}.{' '}
                <button type="button" className="btn-link-inline" disabled={loading} onClick={() => { setChallenge(null); setCode(''); setError(null); }}>
                  {tr('Cambiar teléfono')}
                </button>
              </span>
              {challenge.debugCode && <span className="auth-debug">{tr('Código de entorno de pruebas:')}{' '}{challenge.debugCode}</span>}
            </label>
          )}

          {!isGoogle && !challenge && (
            <label>
              {tr('Contraseña')}
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="new-password"
                disabled={loading}
              />
              <span className="auth-help">{tr('Mínimo 8 caracteres.')}</span>
            </label>
          )}

          {error && (
            <p className="auth-message err" role="alert" aria-live="assertive">{error}</p>
          )}

          <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
            {loading && <span className="inline-spinner" aria-hidden="true" />}
            {loading ? tr('Un momento…') : challenge ? tr('Confirmar teléfono') : tr('Enviar código')}
          </button>
        </form>
      </div>
    </section>
  );
}
