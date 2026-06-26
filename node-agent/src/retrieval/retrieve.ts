import { query } from '../lib/db.js';
import type { ChunkResult, Modality } from '../types/chunk.js';

export interface RetrieveArgs {
  queryEmbedding: number[];
  userId: string;
  subjectId: string;
  topK?: number;
}

interface RawRow {
  id: string;
  document_id: string;
  document_title: string;
  modality: Modality;
  content: string;
  page: number | null;
  section_path: string[];
  image_uri: string | null;
  metadata: Record<string, unknown>;
  distance: number;
}

export async function retrieve(args: RetrieveArgs): Promise<ChunkResult[]> {
  const topK = args.topK ?? 8;
  const vec = `[${args.queryEmbedding.join(',')}]`;

  const rows = await query<RawRow>(
    `SELECT c.id::text,
            c.document_id::text,
            COALESCE(d.title, '(deleted document)') AS document_title,
            c.modality,
            c.content,
            c.page,
            c.section_path,
            c.image_uri,
            c.metadata,
            (c.embedding <=> $1::vector) AS distance
     FROM chunks c
     LEFT JOIN documents d ON d.id = c.document_id
     WHERE c.user_id = $2 AND c.subject_id = $3
     ORDER BY c.embedding <=> $1::vector
     LIMIT $4`,
    [vec, args.userId, args.subjectId, topK],
  );

  return rows.map((r) => ({
    id: r.id,
    document_id: r.document_id,
    document_title: r.document_title,
    modality: r.modality,
    content: r.content,
    page: r.page,
    section_path: r.section_path,
    image_uri: r.image_uri,
    metadata: r.metadata,
    similarity: 1 - r.distance,
  }));
}
