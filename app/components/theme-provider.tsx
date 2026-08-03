'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { THEMES } from '@/lib/game-data';

interface ThemeContextType {
  theme: string;
  setTheme: (t: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'steel',
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children, initialTheme }: { children: React.ReactNode; initialTheme?: string }) {
  const [theme, setThemeState] = useState(initialTheme ?? 'steel');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('bozer-theme');
    if (saved && THEMES.some((t: any) => t?.value === saved)) {
      setThemeState(saved);
    }
  }, []);

  const setTheme = useCallback((t: string) => {
    setThemeState(t);
    localStorage.setItem('bozer-theme', t);
    document.documentElement.setAttribute('data-theme', t);
    // Also save to server if logged in
    fetch('/api/profile/theme', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: t }),
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
