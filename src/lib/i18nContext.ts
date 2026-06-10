import { createContext } from 'react';
import type { TranslationKey } from './translations';

export interface I18nContextValue {
  t: (key: TranslationKey) => string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);
