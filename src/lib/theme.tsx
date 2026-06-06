import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { ThemeContext, type ThemeContextValue, type ThemeMode } from './themeContext';

const THEME_STORAGE_KEY = 'allop.theme';

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

function getInitialTheme(): ThemeMode {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return isThemeMode(stored) ? stored : 'system';
}

function resolveTheme(theme: ThemeMode): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => resolveTheme(getInitialTheme()));

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setResolvedTheme(resolveTheme(theme));

    update();
    mediaQuery.addEventListener('change', update);
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    return () => mediaQuery.removeEventListener('change', update);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme: () => setTheme((current) => {
      const next = resolveTheme(current) === 'dark' ? 'light' : 'dark';
      return next;
    }),
  }), [resolvedTheme, theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
