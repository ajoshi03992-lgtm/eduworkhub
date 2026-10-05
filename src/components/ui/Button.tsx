import React from 'react';
import { classNames } from '../../lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-navy-900 text-white hover:bg-navy-800 active:bg-navy-950 shadow-sm shadow-navy-900/10',
  secondary: 'bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-700 shadow-sm shadow-accent-600/10',
  outline: 'bg-white text-ink border border-border hover:bg-bg active:bg-navy-100/50',
  ghost: 'bg-transparent text-ink hover:bg-black/[0.04] active:bg-black/[0.06]',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-700 shadow-sm shadow-red-600/10',
};

const sizeStyles: Record<Size, string> = {
  sm: 'text-[13px] px-3 py-1.5 gap-1.5 rounded-lg',
  md: 'text-sm px-4 py-2 gap-2 rounded-lg',
  lg: 'text-[15px] px-5 py-2.5 gap-2 rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading,
  fullWidth,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={classNames(
        'inline-flex items-center justify-center font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        icon && iconPosition === 'left' && <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>}
    </button>
  );
}
