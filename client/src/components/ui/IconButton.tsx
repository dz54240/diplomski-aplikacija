import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'h-7 w-7', md: 'h-8 w-8', lg: 'h-9 w-9' };

export function IconButton({ icon, size = 'md', className, ...rest }: IconButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md text-ink-muted hover:text-ink hover:bg-surface-sunken transition-colors',
        sizes[size],
        className,
      )}
      {...rest}
    >
      {icon}
    </button>
  );
}
