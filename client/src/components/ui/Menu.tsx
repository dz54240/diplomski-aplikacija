import { type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

export interface MenuItem {
  label?: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  divider?: boolean;
}

export interface MenuProps {
  trigger: ReactNode;
  items: MenuItem[];
  align?: 'left' | 'right';
  direction?: 'down' | 'up';
}

export function Menu({ trigger, items, align = 'right', direction = 'down' }: MenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <span onClick={() => setOpen((o) => !o)}>{trigger}</span>
      {open ? (
        <div
          className={cn(
            'absolute min-w-[180px] rounded-lg border border-line bg-white shadow-pop z-40 py-1 fade-up',
            align === 'right' ? 'right-0' : 'left-0',
            direction === 'up' ? 'bottom-full mb-1.5' : 'mt-1.5',
          )}
        >
          {items.map((it, i) =>
            it.divider ? (
              <div key={i} className="my-1 border-t border-line-soft" />
            ) : (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  it.onClick?.();
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-[13px] transition-colors',
                  it.danger
                    ? 'text-[#B42318] hover:bg-[#FEF3F2]'
                    : 'text-ink hover:bg-surface-sunken',
                )}
              >
                {it.icon ? <span className="text-ink-muted">{it.icon}</span> : null}
                {it.label}
              </button>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}
