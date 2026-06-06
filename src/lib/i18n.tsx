import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { I18nContext, type I18nContextValue } from './i18nContext';
import { type Locale, translations } from './translations';

const LANGUAGE_STORAGE_KEY = 'allop.locale';

function isLocale(value: string | null): value is Locale {
  return value === 'es' || value === 'ca';
}

function getInitialLocale(): Locale {
  const storedLocale = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (isLocale(storedLocale)) return storedLocale;

  return navigator.language.toLowerCase().startsWith('ca') ? 'ca' : 'es';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale: setLocaleState,
    t: (key) => translations[locale][key] || translations.es[key],
  }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
