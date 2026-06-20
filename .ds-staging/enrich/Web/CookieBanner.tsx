import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAnalyticsConsent, setAnalyticsConsent } from '../lib/analytics';
import { useI18n } from '../lib/useI18n';

export default function CookieBanner() {
  const [consent, setConsent] = useState(() => getAnalyticsConsent());
  const { t } = useI18n();

  if (consent) return null;

  const choose = (value: 'accepted' | 'rejected') => {
    setAnalyticsConsent(value);
    setConsent(value);
  };

  return (
    <aside className="cookie-banner" aria-label={t('cookie.label')}>
      <div>
        <strong>{t('cookie.title')}</strong>
        <p>{t('cookie.text')}</p>
        <Link to="/cookies">{t('cookie.link')}</Link>
      </div>
      <div className="cookie-actions">
        <button className="btn btn-ghost" type="button" onClick={() => choose('rejected')}>{t('cookie.reject')}</button>
        <button className="btn btn-primary" type="button" onClick={() => choose('accepted')}>{t('cookie.accept')}</button>
      </div>
    </aside>
  );
}
