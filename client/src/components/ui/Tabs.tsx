import { cn } from '@/lib/cn';

export interface TabItem<T extends string = string> {
  value: T;
  label: string;
  count?: number;
}

export interface TabsProps<T extends string = string> {
  value: T;
  onChange: (v: T) => void;
  items: TabItem<T>[];
}

export function Tabs<T extends string = string>({ value, onChange, items }: TabsProps<T>) {
  return (
    <div className="border-b border-line">
      <div className="flex gap-1 -mb-px">
        {items.map((it) => (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            className={cn(
              'px-3 py-2 text-[13.5px] font-medium border-b-2 transition-colors',
              value === it.value
                ? 'border-[var(--accent)] text-ink'
                : 'border-transparent text-ink-muted hover:text-ink',
            )}
          >
            {it.label}
            {typeof it.count === 'number' ? (
              <span className="ml-1.5 text-ink-soft">{it.count}</span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
