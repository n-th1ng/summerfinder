'use client';

import { useEffect, useState } from 'react';

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value), 50);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-2 text-xs text-stone-600 dark:text-stone-400">
          <span>{label}</span>
          <span>{Math.round(value)}%</span>
        </div>
      )}
      <div
        className="h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-400 via-sun-400 to-sky-400 transition-all duration-500 ease-out"
          style={{ width: `${w}%` }}
        />
      </div>
    </div>
  );
}