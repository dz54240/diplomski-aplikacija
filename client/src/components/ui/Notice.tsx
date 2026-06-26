import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { IX } from '@/components/icons';
import { IconButton } from './IconButton';

export type NoticeTone = 'info' | 'success' | 'warn' | 'danger';

export interface NoticeProps {
  tone?: NoticeTone;
  icon?: ReactNode;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const tones: Record<NoticeTone, string> = {
  info: 'border-[var(--accent-100)] bg-[var(--accent-50)] text-[var(--accent-700)]',
  success: 'border-[#A6F4C5] bg-[#ECFDF3] text-[#027A48]',
  warn: 'border-[#FEDF89] bg-[#FFFAEB] text-[#B54708]',
  danger: 'border-[#FECDCA] bg-[#FEF3F2] text-[#B42318]',
};

export function Notice({
  tone = 'info',
  icon,
  title,
  children,
  action,
  onDismiss,
  className,
}: NoticeProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-md border px-3.5 py-2.5 text-[13px]',
        tones[tone],
        className,
      )}
    >
      {icon ? <span className="mt-0.5">{icon}</span> : null}
      <div className="flex-1">
        {title ? <div className="font-medium">{title}</div> : null}
        {children ? <div className="mt-0.5 text-ink/80">{children}</div> : null}
      </div>
      {action}
      {onDismiss ? <IconButton size="sm" icon={<IX size={14} />} onClick={onDismiss} /> : null}
    </div>
  );
}
