import { type ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ icon, title, body, action }: EmptyStateProps) {
  return (
    <div className="mx-auto max-w-md text-center py-16 px-6 fade-up">
      {icon ? (
        <div className="mx-auto mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-surface-sunken text-ink-muted">
          {icon}
        </div>
      ) : null}
      <h3 className="text-[16px] font-semibold text-ink">{title}</h3>
      {body ? (
        <p className="mt-1.5 text-[14px] text-ink-muted leading-relaxed">{body}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
