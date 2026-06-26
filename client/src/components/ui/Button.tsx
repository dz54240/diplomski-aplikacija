import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'subtle'
  | 'danger'
  | 'accentSoft';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-md',
  md: 'h-9 px-3.5 text-[13.5px] gap-2 rounded-md',
  lg: 'h-10 px-4 text-[14px] gap-2 rounded-md',
};

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--accent)] text-white hover:bg-[var(--accent-700)] disabled:bg-ink-soft disabled:text-white',
  secondary: 'bg-ink text-white hover:bg-ink/90 disabled:bg-ink-soft',
  outline:
    'bg-white text-ink border border-line hover:bg-surface-sunken disabled:text-ink-soft',
  ghost: 'bg-transparent text-ink hover:bg-surface-sunken disabled:text-ink-soft',
  subtle: 'bg-surface-sunken text-ink hover:bg-surface-tint disabled:text-ink-soft',
  danger: 'bg-white text-[#B42318] border border-[#FCA5A5] hover:bg-[#FEF2F2]',
  accentSoft:
    'bg-[var(--accent-50)] text-[var(--accent-700)] hover:bg-[var(--accent-100)]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors disabled:cursor-not-allowed',
        sizes[size],
        variants[variant],
        className,
      )}
      {...rest}
    >
      {icon ? <span className="-ml-0.5 inline-flex">{icon}</span> : null}
      {children}
      {iconRight ? <span className="-mr-0.5 inline-flex">{iconRight}</span> : null}
    </button>
  );
}
