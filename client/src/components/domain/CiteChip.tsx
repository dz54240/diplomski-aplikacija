export type CiteChipModality = 'text' | 'image_caption' | 'table' | 'formula';

export interface CiteChipProps {
  n: number;
  doc: string;
  page: number;
  modality?: CiteChipModality;
  section?: string;
  onOpen?: () => void;
}

export function CiteChip({ n, doc, page, modality, section, onOpen }: CiteChipProps) {
  const icon =
    modality === 'image_caption'
      ? '📷'
      : modality === 'table'
        ? '📊'
        : modality === 'formula'
          ? '∑'
          : null;
  const title = section ? `${section} · str. ${page}` : `str. ${page}`;
  return (
    <button
      onClick={onOpen}
      title={title}
      className="group inline-flex items-center gap-2 rounded-md border border-line bg-white px-2.5 py-1.5 text-left text-[12px] text-ink hover:border-[var(--accent)] hover:bg-[var(--accent-50)] transition-colors min-w-0 max-w-full"
    >
      <span className="cite-mark shrink-0">{n}</span>
      {icon ? <span className="text-[12px] shrink-0">{icon}</span> : null}
      <span className="truncate min-w-0">
        <span className="font-medium truncate inline-block max-w-[200px] align-bottom">{doc}</span>
        <span className="text-ink-soft"> · str. {page}</span>
      </span>
    </button>
  );
}
