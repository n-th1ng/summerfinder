'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { Icon, type IconName } from '@/components/Icon';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'dark' | 'lime' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'xl';

const base =
  'group relative inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-[transform,background-color,box-shadow,color] duration-200 ease-snap active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none select-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-ink-950';

const variants: Record<Variant, string> = {
  primary:
    'bg-coral-500 text-white hover:bg-coral-600 shadow-soft hover:shadow-lift active:shadow-soft',
  dark: 'bg-ink-900 text-white hover:bg-ink-800 shadow-soft hover:shadow-lift',
  secondary:
    'bg-ink-100 text-ink-900 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-50 dark:hover:bg-ink-700',
  ghost:
    'bg-transparent text-ink-900 hover:bg-ink-100 dark:text-ink-50 dark:hover:bg-ink-800',
  outline:
    'bg-transparent text-ink-900 border border-ink-200 hover:bg-ink-50 dark:text-ink-50 dark:border-ink-700 dark:hover:bg-ink-800',
  lime: 'bg-lime-400 text-ink-900 hover:bg-lime-300 shadow-soft hover:shadow-lift',
  danger: 'bg-red-500 text-white hover:bg-red-600 shadow-soft',
};

const sizes: Record<Size, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-5 text-[15px]',
  lg: 'h-14 px-6 text-base',
  xl: 'h-16 px-8 text-lg',
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  iconLeft?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  fullWidth?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    className = '',
    variant = 'primary',
    size = 'md',
    iconLeft,
    iconRight,
    loading,
    fullWidth,
    children,
    disabled,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          <span>Loading…</span>
        </span>
      ) : (
        <>
          {iconLeft && <Icon name={iconLeft} size={size === 'sm' ? 16 : size === 'xl' ? 22 : 18} className="-ml-0.5" />}
          {children}
          {iconRight && <Icon name={iconRight} size={size === 'sm' ? 16 : size === 'xl' ? 22 : 18} className="-mr-0.5 transition-transform group-hover:translate-x-0.5" />}
        </>
      )}
    </button>
  );
});