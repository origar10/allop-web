import { type FormEvent, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { completeProfileClient } from '../lib/platformApi';
import { loadClientSession } from '../lib/clientSession';
import { useToast } from '../lib/useToast';
import { normalizePhone } from '../shared/formatters';

function getSafeNext(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/mi-cuenta';
  return value;
}

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = getSafeNext(searchParams.get('next'));
  const { notify } = useToast();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loadClientSession()) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const telefono = normalizePhone(phone);
    if (telefono.length < 8) {
      setError('Introduce un teléfono válido.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const session = loadClientSession();
      await completeProfileClient({ telefono, password }, session!.token);
      notify('Perfil completado correctamente.', 'success');
      navigate(next, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el perfil.');
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
          <h2>Completa tu perfil</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            Añade tu teléfono y elige una contraseña para poder acceder con email o teléfono en el futuro.
          </p>

          <label>
            Teléfono
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              autoComplete="tel"
              disabled={loading}
            />
            <span className="auth-help">Con prefijo internacional si estás fuera de España (+34…).</span>
          </label>

          <label>
            Contraseña
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              disabled={loading}
            />
            <span className="auth-help">Mínimo 8 caracteres.</span>
          </label>

          {error && (
            <p className="auth-message err" role="alert" aria-live="assertive">{error}</p>
          )}

          <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
            {loading && <span className="inline-spinner" aria-hidden="true" />}
            {loading ? 'Guardando...' : 'Continuar'}
          </button>
        </form>
      </div>
    </section>
  );
}
