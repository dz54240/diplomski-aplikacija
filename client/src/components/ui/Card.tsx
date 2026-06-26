import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-lg border border-line bg-white', className)} {...rest}>
      {children}
    </div>
  );
}
