import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type PillTone = 'neutral' | 'accent' | 'success' | 'warn' | 'danger' | 'outline';

export interface PillProps {
  children: ReactNode;
  tone?: PillTone;
  className?: string;
  icon?: ReactNode;
}

const tones: Record<PillTone, string> = {
  neutral: 'bg-surface-sunken text-ink-muted',
  accent: 'bg-[var(--accent-50)] text-[var(--accent-700)]',
  success: 'bg-[#ECFDF3] text-[#067647]',
  warn: 'bg-[#FFF8EB] text-[#B54708]',
  danger: 'bg-[#FEF3F2] text-[#B42318]',
  outline: 'bg-white text-ink-muted border border-line',
};

export function Pill({ children, tone = 'neutral', className, icon }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11.5px] font-medium',
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
