'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? (theme === 'system' ? resolvedTheme : theme) : 'dark';
  const isDark = currentTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100/80 dark:bg-surface-darkCard border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-primary-500/50 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 transition-all duration-200 shadow-2xs group focus:outline-none focus:ring-2 focus:ring-primary-500/40"
      aria-label="Toggle dark mode"
      title={mounted ? `Switch to ${isDark ? 'light' : 'dark'} mode` : 'Toggle theme'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-spark transition-transform duration-300 group-hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 transition-transform duration-300 group-hover:-rotate-12" />
      )}
    </button>
  );
}

