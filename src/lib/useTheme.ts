import { useContext } from 'react';
import { ThemeContext } from './themeContext';

import { tr } from './tr';
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error(tr('useTheme must be used inside ThemeProvider'));
  return context;
}
