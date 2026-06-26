import { cn } from '@/lib/cn';

export interface ProgressBarProps {
  value?: number;
  indeterminate?: boolean;
  className?: string;
}

export function ProgressBar({ value = 0, indeterminate = false, className }: ProgressBarProps) {
  return (
    <div className={cn('h-1 w-full rounded-full bg-line-soft overflow-hidden', className)}>
      {indeterminate ? (
        <div className="ind-bar h-full w-full" />
      ) : (
        <div
          className="h-full bg-[var(--accent)] transition-[width] duration-300"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      )}
    </div>
  );
}
