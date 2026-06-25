'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    if (next) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    try {
      localStorage.setItem('sf-theme', next ? 'dark' : 'light');
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white text-ink-700 ring-1 ring-inset ring-ink-200 hover:bg-ink-50 hover:ring-ink-300 transition-all active:scale-90 dark:bg-ink-800 dark:text-ink-100 dark:ring-ink-700 dark:hover:bg-ink-700"
    >
      <Icon name={dark ? 'sunBright' : 'moon'} size={18} />
    </button>
  );
}