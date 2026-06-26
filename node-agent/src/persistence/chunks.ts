import { query } from '../lib/db.js';
import type { ChunkMeta, Modality } from '../types/chunk.js';

export interface SampleStratifiedChunksArgs {
  userId: string;
  subjectId: string;
  sampleSize: number;
}

export interface SampleChunk {
  id: string;
  document_id: string;
  document_title: string;
  modality: 'text';
  content: string;
  page: number | null;
  section_path: string[];
}

export async function sampleStratifiedChunks(
  args: SampleStratifiedChunksArgs,
): Promise<SampleChunk[]> {
  const rows = await query<{
    id: string;
    document_id: string;
    document_title: string;
    modality: 'text';
    content: string;
    page: number | null;
    section_path: string[];
  }>(
    `SELECT c.id::text,
            c.document_id::text,
            COALESCE(d.title, '(deleted document)') AS document_title,
            c.modality,
            c.content,
            c.page,
            c.section_path
     FROM (
       SELECT id, document_id, modality, content, page, section_path,
              ROW_NUMBER() OVER (PARTITION BY (section_path)[1] ORDER BY random()) AS rn
       FROM chunks
       WHERE user_id = $1 AND subject_id = $2 AND modality = 'text'
     ) c
     LEFT JOIN documents d ON d.id = c.document_id
     ORDER BY c.rn, random()
     LIMIT $3`,
    [args.userId, args.subjectId, args.sampleSize],
  );
  return rows.map((r) => ({
    id: r.id,
    document_id: r.document_id,
    document_title: r.document_title,
    modality: r.modality,
    content: r.content,
    page: r.page,
    section_path: r.section_path,
  }));
}

export interface LoadChunksByIdsArgs {
  ids: string[];
  userId: string;
}

interface RawRow {
  id: string;
  document_id: string;
  document_title: string;
  page: number | null;
  section_path: string[];
  content: string;
  modality: Modality;
  image_uri: string | null;
}

export async function loadChunksByIds(
  args: LoadChunksByIdsArgs,
): Promise<ChunkMeta[]> {
  if (args.ids.length === 0) return [];

  const numericIds = args.ids
    .map((id) => parseInt(id, 10))
    .filter((n) => Number.isFinite(n));
  if (numericIds.length === 0) return [];

  const rows = await query<RawRow>(
    `SELECT c.id::text,
            c.document_id::text,
            COALESCE(d.title, '(deleted document)') AS document_title,
            c.page,
            c.section_path,
            c.content,
            c.modality,
            c.image_uri
     FROM chunks c
     LEFT JOIN documents d ON d.id = c.document_id
     WHERE c.user_id = $1 AND c.id = ANY($2::bigint[])`,
    [args.userId, numericIds],
  );

  return rows.map((r) => ({
    id: r.id,
    document_id: r.document_id,
    document_title: r.document_title,
    page: r.page,
    section_path: r.section_path,
    content: r.content,
    modality: r.modality,
    image_uri: r.image_uri,
  }));
}
