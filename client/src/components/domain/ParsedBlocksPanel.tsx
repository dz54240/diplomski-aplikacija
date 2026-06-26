import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import type { ParsedBlock } from '@/lib/api/documents';

export interface ParsedBlocksPanelProps {
  blocks: ParsedBlock[];
}

export function ParsedBlocksPanel({ blocks }: ParsedBlocksPanelProps) {
  if (blocks.length === 0) {
    return <div className="text-ink-muted">Nema parsiranog sadržaja.</div>;
  }

  let lastPage: number | null = null;

  return (
    <article className="prose prose-sm sm:prose-base max-w-none prose-headings:font-semibold prose-headings:text-ink prose-p:text-ink prose-li:text-ink prose-strong:text-ink prose-code:text-ink prose-pre:bg-surface-sunken prose-pre:text-ink prose-table:text-ink">
      {blocks.map((b, i) => {
        const showPageMarker = b.page !== lastPage;
        lastPage = b.page;
        return (
          <div key={i}>
            {showPageMarker ? <PageMarker page={b.page} /> : null}
            <BlockBody block={b} />
          </div>
        );
      })}
    </article>
  );
}

function PageMarker({ page }: { page: number }) {
  return (
    <div className="not-prose my-6 flex items-center gap-3 text-[11px] uppercase tracking-wider text-ink-muted">
      <span className="h-px flex-1 bg-line-soft" />
      <span>Stranica {page}</span>
      <span className="h-px flex-1 bg-line-soft" />
    </div>
  );
}

function BlockBody({ block }: { block: ParsedBlock }) {
  switch (block.type) {
    case 'text':
      return <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.md}</ReactMarkdown>;
    case 'figure':
      return (
        <figure className="not-prose my-4 rounded-md border border-line-soft bg-surface-sunken p-3">
          {block.image_url ? (
            <img
              src={block.image_url}
              alt={block.surrounding_text ?? 'Slika'}
              className="mx-auto max-w-full rounded"
              loading="lazy"
            />
          ) : (
            <div className="text-[12px] text-ink-muted">Slika ({block.image_id})</div>
          )}
          {block.surrounding_text ? (
            <figcaption className="mt-1.5 text-center text-[13px] italic text-ink-muted">
              {block.surrounding_text}
            </figcaption>
          ) : null}
        </figure>
      );
    case 'table':
      return <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.md_table}</ReactMarkdown>;
    case 'formula':
      return (
        <pre className="not-prose my-3 rounded-md border border-line-soft bg-surface-sunken p-3 text-[13px] font-mono text-ink overflow-x-auto">
          {block.latex}
        </pre>
      );
  }
}
