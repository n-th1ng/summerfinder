'use client';

import type { IconName } from '@/components/Icon';

type Tone = 'coral' | 'lime' | 'sky' | 'magenta' | 'ink' | 'success' | 'danger';

const tones: Record<Tone, string> = {
  coral: 'bg-coral-50 text-coral-700 ring-coral-200 dark:bg-coral-500/15 dark:text-coral-300 dark:ring-coral-400/30',
  lime: 'bg-lime-50 text-lime-700 ring-lime-200 dark:bg-lime-400/15 dark:text-lime-300 dark:ring-lime-400/30',
  sky: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-400/15 dark:text-sky-300 dark:ring-sky-400/30',
  magenta: 'bg-magenta-50 text-magenta-700 ring-magenta-200 dark:bg-magenta-500/15 dark:text-magenta-300 dark:ring-magenta-400/30',
  ink: 'bg-ink-100 text-ink-700 ring-ink-200 dark:bg-ink-800 dark:text-ink-200 dark:ring-ink-700',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-400/15 dark:text-emerald-300 dark:ring-emerald-400/30',
  danger: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-400/15 dark:text-red-300 dark:ring-red-400/30',
};

export function Badge({
  tone = 'ink',
  children,
  className = '',
}: {
  tone?: Tone;
  icon?: IconName;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ring-inset ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}