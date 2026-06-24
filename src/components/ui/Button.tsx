'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none';

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-500 text-white hover:bg-brand-600 shadow-sm shadow-brand-500/30',
  secondary:
    'bg-stone-100 text-stone-900 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700',
  ghost:
    'bg-transparent text-stone-900 hover:bg-stone-100 dark:text-stone-100 dark:hover:bg-stone-800',
  danger:
    'bg-red-500 text-white hover:bg-red-600',
};

const sizes: Record<Size, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-5 text-base',
  lg: 'h-14 px-6 text-lg',
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className = '', variant = 'primary', size = 'md', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    />
  );
});