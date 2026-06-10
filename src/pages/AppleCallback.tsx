import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { exchangeAppleBridge } from '../lib/platformApi';
import { saveClientSession } from '../lib/clientSession';
import { useToast } from '../lib/useToast';

function getSafeNext(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/mi-cuenta';
  return value;
}

export default function AppleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [error, setError] = useState<string | null>(null);
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    async function run() {
      const errorParam = searchParams.get('error');
      if (errorParam) {
        if (errorParam === 'cancelled') {
          navigate('/login', { replace: true });
          return;
        }
        setError('No se pudo iniciar sesión con Apple. Por favor, inténtalo de nuevo.');
        return;
      }

      const bridgeToken = searchParams.get('t');
      const next = getSafeNext(searchParams.get('next'));

      if (!bridgeToken) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        const auth = await exchangeAppleBridge(bridgeToken);
        saveClientSession({
          ...auth,
          salonSlug: 'marketplace',
          salonName: 'Allop',
          createdAt: new Date().toISOString(),
        });
        notify(`Sesión iniciada como ${auth.cliente.nombre}.`, 'success');
        navigate(next, { replace: true });
      } catch {
        setError('Error al completar el inicio de sesión con Apple. Inténtalo de nuevo.');
      }
    }

    run();
  }, [navigate, notify, searchParams]);

  if (error) {
    return (
      <section className="client-auth">
        <div className="container client-auth-grid">
          <div className="client-auth-card" style={{ gridColumn: '1 / -1', maxWidth: 480, margin: '0 auto' }}>
            <p className="auth-message err" role="alert">{error}</p>
            <Link to="/login" className="btn btn-primary btn-lg" style={{ marginTop: '1rem', display: 'inline-flex' }}>
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="client-auth">
      <div className="container client-auth-grid">
        <div className="client-auth-card" style={{ gridColumn: '1 / -1', maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
          <span className="inline-spinner" aria-hidden="true" style={{ width: 28, height: 28 }} />
          <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Iniciando sesión con Apple…</p>
        </div>
      </div>
    </section>
  );
}
