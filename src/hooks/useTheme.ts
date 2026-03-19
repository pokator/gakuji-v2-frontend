import { useEffect, useState } from 'react';

const THEME_KEY = 'gakuji:theme';

export type ThemeName = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<ThemeName>(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY) as ThemeName | null;
      return stored ?? 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      document.documentElement.dataset.theme = theme;
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return { theme, setTheme, toggle } as const;
}
