'use client';

import { useEffect, useState } from 'react';

export function StreakBadge() {
  const [days, setDays] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('sf-streak');
      const data = raw ? JSON.parse(raw) : { days: 0, last: '' };
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (data.last === today) {
        setDays(data.days);
      } else if (data.last === yesterday) {
        const next = { days: data.days + 1, last: today };
        localStorage.setItem('sf-streak', JSON.stringify(next));
        setDays(next.days);
      } else {
        const next = { days: 1, last: today };
        localStorage.setItem('sf-streak', JSON.stringify(next));
        setDays(1);
      }
    } catch {}
  }, []);

  if (!days) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
      aria-label={`${days} day streak`}
    >
      🔥 {days}-day streak
    </span>
  );
}