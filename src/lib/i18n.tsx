import { type ReactNode, useMemo } from 'react';
import { I18nContext, type I18nContextValue } from './i18nContext';
import { translations } from './translations';

export function I18nProvider({ children }: { children: ReactNode }) {
  const value = useMemo<I18nContextValue>(() => ({
    t: (key) => translations.es[key],
  }), []);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
