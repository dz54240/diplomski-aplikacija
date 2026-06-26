import { type ReactNode } from 'react';

export function renderAssistantText(
  text: string,
  onCite?: (chunkId: string, n: number) => void,
  chunkIdToOrdinal?: Map<string, number>,
): ReactNode {
  const out: ReactNode[] = [];
  const lines = text.split(/\n/);
  lines.forEach((line, li) => {
    const tokens = line.split(/(\[\[\d+\]\]|\[chunk:\d+\]|\*\*[^*]+\*\*|`[^`]+`)/g);
    const lineNodes = tokens.map((tok, i) => {
      const legacy = tok.match(/^\[\[(\d+)\]\]$/);
      if (legacy) {
        const n = parseInt(legacy[1], 10);
        return (
          <span key={`m-${li}-${i}`} className="cite-mark">
            {n}
          </span>
        );
      }
      const chunk = tok.match(/^\[chunk:(\d+)\]$/);
      if (chunk) {
        const id = chunk[1];
        const n = chunkIdToOrdinal?.get(id);
        if (!n) return <span key={`ch-${li}-${i}`}>{tok}</span>;
        return (
          <span
            key={`m-${li}-${i}`}
            role="button"
            tabIndex={0}
            className="cite-mark"
            onClick={() => onCite?.(id, n)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCite?.(id, n);
            }}
          >
            {n}
          </span>
        );
      }
      const b = tok.match(/^\*\*([^*]+)\*\*$/);
      if (b) {
        return (
          <strong key={`b-${li}-${i}`} className="font-semibold text-ink">
            {b[1]}
          </strong>
        );
      }
      const c = tok.match(/^`([^`]+)`$/);
      if (c) {
        return (
          <code
            key={`c-${li}-${i}`}
            className="font-mono text-[12.5px] bg-surface-sunken text-ink rounded px-1 py-px"
          >
            {c[1]}
          </code>
        );
      }
      return <span key={`t-${li}-${i}`}>{tok}</span>;
    });
    out.push(<span key={`l-${li}`}>{lineNodes}</span>);
    if (li < lines.length - 1) out.push(<br key={`br-${li}`} />);
  });
  return out;
}
