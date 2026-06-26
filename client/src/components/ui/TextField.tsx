import { type InputHTMLAttributes, type ReactNode, useState } from 'react';
import { cn } from '@/lib/cn';
import { IEye, IEyeOff } from '@/components/icons';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  hint?: ReactNode;
  error?: string | null;
  type?: string;
  icon?: ReactNode;
  rightSlot?: ReactNode;
}

export function TextField({
  label,
  hint,
  error,
  type = 'text',
  icon,
  rightSlot,
  className,
  ...rest
}: TextFieldProps) {
  const [show, setShow] = useState(false);
  const isPwd = type === 'password';
  const t = isPwd ? (show ? 'text' : 'password') : type;
  return (
    <label className={cn('block', className)}>
      {label ? <span className="block mb-1.5 text-[13px] font-medium text-ink">{label}</span> : null}
      <div
        className={cn(
          'relative flex items-center rounded-md border bg-white transition-colors',
          error
            ? 'border-[#FCA5A5]'
            : 'border-line hover:border-ink-soft focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent-50)]',
        )}
      >
        {icon ? <span className="pl-3 text-ink-soft">{icon}</span> : null}
        <input
          type={t}
          className="flex-1 bg-transparent px-3 py-2 text-[14px] outline-none placeholder:text-ink-soft"
          {...rest}
        />
        {isPwd ? (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="px-2.5 text-ink-soft hover:text-ink"
          >
            {show ? <IEyeOff size={16} /> : <IEye size={16} />}
          </button>
        ) : null}
        {rightSlot}
      </div>
      {error ? (
        <span className="mt-1 block text-[12px] text-[#B42318]">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-[12px] text-ink-soft">{hint}</span>
      ) : null}
    </label>
  );
}
