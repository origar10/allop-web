import { type ReactNode, useMemo } from 'react';
import { I18nContext, type I18nContextValue } from './i18nContext';
import { translations } from './translations';
import { tr } from './tr';

export function I18nProvider({ children }: { children: ReactNode }) {
  const value = useMemo<I18nContextValue>(() => ({
    // Las claves se resuelven a su texto en español y ese texto es la clave de los diccionarios.
    t: (key) => tr(translations.es[key]),
  }), []);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
