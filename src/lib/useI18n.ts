import { useContext } from 'react';
import { I18nContext } from './i18nContext';

import { tr } from './tr';
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error(tr('useI18n must be used inside I18nProvider'));
  return context;
}
