export type ChunkModality = 'text' | 'image_caption' | 'table' | 'formula';

export interface ChunkMeta {
  id: string;
  document_id: string;
  document_title: string;
  page: number | null;
  section_path: string[];
  content: string;
  modality: ChunkModality;
  image_uri: string | null;
}

function isChunkMeta(x: unknown): x is ChunkMeta {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.document_id === 'string' &&
    typeof o.document_title === 'string' &&
    (o.page === null || typeof o.page === 'number') &&
    Array.isArray(o.section_path) &&
    typeof o.content === 'string' &&
    typeof o.modality === 'string' &&
    (o.image_uri === null || typeof o.image_uri === 'string')
  );
}

export function parseChunkPart(part: unknown): ChunkMeta | null {
  if (typeof part !== 'object' || part === null) return null;
  const p = part as { type?: string; data?: unknown };
  if (p.type !== 'data-chunk') return null;
  if (!isChunkMeta(p.data)) return null;
  return p.data;
}
