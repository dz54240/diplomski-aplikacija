import { type ReactNode, useEffect } from 'react';
import { IX } from '@/components/icons';
import { IconButton } from './IconButton';

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}

export function Modal({ open, onClose, title, children, footer, width = 480 }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <div
        className="relative bg-white rounded-xl border border-line shadow-modal w-full fade-up"
        style={{ maxWidth: width }}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-line-soft">
          <h3 className="text-[15px] font-semibold">{title}</h3>
          <IconButton icon={<IX size={16} />} onClick={onClose} />
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer ? (
          <div className="px-5 py-3.5 border-t border-line-soft flex items-center justify-end gap-2">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
