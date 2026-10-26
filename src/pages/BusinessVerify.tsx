import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiGet } from '../shared/apiClient';
import { setSeo } from '../lib/seo';
import { getLocale, tr } from '../lib/tr';

/** Enlace del email de bienvenida: confirma el email del salón recién dado de alta. */
export default function BusinessVerify({ dashboardUrl }: { dashboardUrl: string }) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [state, setState] = useState<'checking' | 'ok' | 'error'>(token ? 'checking' : 'error');
  // Prueba gratis sin tarjeta (Noruega): al verificar, la cuenta ya está activa.
  const [pruebaHasta, setPruebaHasta] = useState<string | null>(null);
  const [message, setMessage] = useState(token ? '' : 'Falta el código del enlace. Ábrelo de nuevo desde el email.');

  useEffect(() => {
    setSeo({ title: 'Verificar email | Allop', description: 'Confirma el email de tu salón en Allop.', canonicalPath: '/business/verificar' });
    if (!token) return;
    apiGet<{ ok: boolean; prueba_hasta?: string | null }>(`/auth/verificar-email?token=${encodeURIComponent(token)}`)
      .then((r) => { setPruebaHasta(r?.prueba_hasta ?? null); setState('ok'); })
      .catch((err: unknown) => {
        setState('error');
        setMessage(err instanceof Error && err.message ? err.message : 'El enlace no es válido o ya se ha usado.');
      });
  }, [token]);

  return (
    <section className="billing-page">
      <div className="container billing-result">
        {state === 'ok' ? <CheckCircle size={38} /> : state === 'error' ? <AlertTriangle size={36} /> : <span className="inline-spinner" aria-hidden="true" />}
        <p className="eyebrow">Alta de salón</p>
        <h1>{state === 'ok' ? 'Email verificado.' : state === 'error' ? 'No hemos podido verificarlo.' : 'Verificando tu email…'}</h1>
        {state === 'ok' && (pruebaHasta
          ? <p>{tr('Tu cuenta ya está activa. Tienes prueba gratis hasta el {fecha}. Entra en tu panel o en la app Allop Pro con tu email y tu contraseña.', { fecha: new Date(pruebaHasta).toLocaleDateString(getLocale(), { day: 'numeric', month: 'long' }) })}</p>
          : <p>Gracias. Cuando completes el pago tu cuenta quedará activa y podrás entrar en tu panel o en la app Allop Pro con tu email y tu contraseña.</p>
        )}
        {state === 'error' && (
          <p>{message} Si ya habías verificado el email o completado el alta, entra directamente en tu panel.</p>
        )}
        <div className="billing-result-actions">
          <a className="btn btn-primary btn-lg" href={dashboardUrl}>Ir a mi panel</a>
          <Link className="btn btn-ghost btn-lg" to="/business">Volver a Business</Link>
        </div>
      </div>
    </section>
  );
}
