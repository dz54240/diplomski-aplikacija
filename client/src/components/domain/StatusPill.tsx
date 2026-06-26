import { type DocumentStatus } from '@/lib/api/documents';

interface StatusConfig {
  label: string;
  cls: string;
  dot: string;
  anim?: boolean;
}

const map: Record<DocumentStatus, StatusConfig> = {
  uploaded: { label: 'Učitano', cls: 'bg-surface-sunken text-ink-muted', dot: 'bg-ink-soft' },
  parsing: {
    label: 'Obrađuje se',
    cls: 'bg-[var(--accent-50)] text-[var(--accent-700)]',
    dot: 'bg-[var(--accent)]',
    anim: true,
  },
  embedding: {
    label: 'Indeksira se',
    cls: 'bg-[#F4F3FF] text-[#5925DC]',
    dot: 'bg-[#7A5AF8]',
    anim: true,
  },
  ready: { label: 'Spremno', cls: 'bg-[#ECFDF3] text-[#067647]', dot: 'bg-[#12B76A]' },
  failed: { label: 'Neuspjelo', cls: 'bg-[#FEF3F2] text-[#B42318]', dot: 'bg-[#F04438]' },
};

export interface StatusPillProps {
  status: DocumentStatus;
}

export function StatusPill({ status }: StatusPillProps) {
  const s = map[status] ?? map.uploaded;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11.5px] font-medium ${s.cls}`}
    >
      <span className={`relative inline-block w-1.5 h-1.5 rounded-full ${s.dot}`}>
        {s.anim ? (
          <span className="absolute inset-0 rounded-full animate-ping opacity-60 bg-current" />
        ) : null}
      </span>
      {s.label}
    </span>
  );
}
