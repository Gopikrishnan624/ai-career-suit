import { useEffect, useMemo, useState } from 'react';
import { ThemeContext } from './theme-context';

const THEME_KEY = 'pathpilot-theme';

function getInitialTheme() {
  const storedTheme = localStorage.getItem(THEME_KEY);
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    isDark: theme === 'dark',
    toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    sidebarCollapsed,
    toggleSidebar: () => setSidebarCollapsed((current) => !current),
  }), [theme, sidebarCollapsed]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
