import { Link } from 'react-router-dom';
import { fechaGratis, tr } from '../lib/tr';

/** Franja de la promoción de lanzamiento (Noruega: gratis mientras estamos en pruebas). */
export default function BannerGratis() {
  const fecha = fechaGratis();
  if (!fecha) return null;
  return (
    <div role="note" style={{
      background: 'var(--accent, #4F46E5)', color: '#fff', textAlign: 'center',
      fontSize: 14, lineHeight: 1.4, padding: '8px 16px',
    }}>
      <strong>{tr('Gratis hasta el {fecha}.', { fecha })}</strong>{' '}
      {tr('Estamos en fase de pruebas: crea tu cuenta y úsala sin pagar nada, sin tarjeta.')}{' '}
      <Link to="/business/alta" style={{ color: '#fff', textDecoration: 'underline' }}>{tr('Crear cuenta')}</Link>
    </div>
  );
}
