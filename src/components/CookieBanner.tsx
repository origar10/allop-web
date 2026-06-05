import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAnalyticsConsent, setAnalyticsConsent } from '../lib/analytics';

export default function CookieBanner() {
  const [consent, setConsent] = useState(() => getAnalyticsConsent());

  if (consent) return null;

  const choose = (value: 'accepted' | 'rejected') => {
    setAnalyticsConsent(value);
    setConsent(value);
  };

  return (
    <aside className="cookie-banner" aria-label="Preferencias de cookies">
      <div>
        <strong>Cookies y analitica</strong>
        <p>Usamos cookies tecnicas para que la web funcione. La analitica privacy-first solo se carga si aceptas.</p>
        <Link to="/cookies">Ver politica de cookies</Link>
      </div>
      <div className="cookie-actions">
        <button className="btn btn-ghost" type="button" onClick={() => choose('rejected')}>Rechazar</button>
        <button className="btn btn-primary" type="button" onClick={() => choose('accepted')}>Aceptar analitica</button>
      </div>
    </aside>
  );
}
