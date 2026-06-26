import { IconButton } from '@/components/ui';
import { IExternal, IX } from '@/components/icons';
import type { ChunkMeta } from '@/lib/citations';

export interface CitationPanelProps {
  cite: ChunkMeta & { n: number };
  onClose: () => void;
}

export function CitationPanel({ cite, onClose }: CitationPanelProps) {
  const sectionLabel = cite.section_path.join(' › ');
  const pageLabel = cite.page != null ? `str. ${cite.page}` : '(bez stranice)';
  const modalityBadge =
    cite.modality === 'image_caption'
      ? 'IMG'
      : cite.modality === 'table'
        ? 'TAB'
        : cite.modality === 'formula'
          ? 'FORM'
          : 'TXT';

  return (
    <aside className="w-[380px] shrink-0 border-l border-line bg-white flex flex-col fade-up">
      <div className="px-4 h-12 border-b border-line-soft flex items-center gap-2">
        <span className="cite-mark">{cite.n}</span>
        <span className="text-[13px] font-medium truncate">Izvor</span>
        <div className="flex-1" />
        <IconButton size="sm" icon={<IExternal size={14} />} />
        <IconButton size="sm" icon={<IX size={14} />} onClick={onClose} />
      </div>
      <div className="px-4 py-4 border-b border-line-soft">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10.5px] font-semibold tracking-wider bg-[#FEF3F2] text-[#B42318]">
            {modalityBadge}
          </span>
          <span className="text-[12px] text-ink-soft">{pageLabel}</span>
        </div>
        <h4 className="text-[14px] font-semibold leading-snug">{cite.document_title}</h4>
        {sectionLabel ? <div className="mt-1 text-[12.5px] text-ink-muted">{sectionLabel}</div> : null}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {cite.modality === 'image_caption' && cite.image_uri ? (
          <>
            <div className="text-[11px] font-medium uppercase tracking-wider text-ink-soft mb-2">
              Slika
            </div>
            <div className="rounded-md border border-line bg-surface-sunken/40 p-2 flex justify-center">
              <img
                src={cite.image_uri}
                alt={cite.content}
                loading="lazy"
                className="max-h-[400px] max-w-full object-contain"
              />
            </div>
            <div className="mt-3 text-[11px] font-medium uppercase tracking-wider text-ink-soft mb-2">
              Opis (caption)
            </div>
            <div className="rounded-md border border-line bg-surface-sunken/40 p-3.5 text-[13.5px] leading-[1.7] text-ink whitespace-pre-wrap">
              {cite.content}
            </div>
          </>
        ) : (
          <>
            <div className="text-[11px] font-medium uppercase tracking-wider text-ink-soft mb-2">
              Citirani odlomak
            </div>
            <div className="rounded-md border border-line bg-surface-sunken/40 p-3.5 text-[13.5px] leading-[1.7] text-ink whitespace-pre-wrap">
              {cite.content}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
