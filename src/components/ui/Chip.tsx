'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import type { IconName } from '@/components/Icon';

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  icon?: IconName;
};

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { active, className = '', children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 px-3.5 h-9 rounded-full text-sm font-semibold transition-all duration-200 ease-snap whitespace-nowrap active:scale-95 ${
        active
          ? 'bg-ink-900 text-white shadow-soft dark:bg-white dark:text-ink-900'
          : 'bg-white text-ink-700 ring-1 ring-inset ring-ink-200 hover:bg-ink-50 dark:bg-ink-800 dark:text-ink-100 dark:ring-ink-700 dark:hover:bg-ink-700'
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
});