import format from 'pg-format';
import { pool } from '../lib/db.js';
import type { DraftChunk } from '../types/chunk.js';

export interface PersistArgs {
  documentId: string;
  userId: string;
  subjectId: string;
  drafts: DraftChunk[];
  embeddings: number[][];
  embeddingModel: string;
}

export async function persistChunks(
  args: PersistArgs,
): Promise<{ inserted: number }> {
  if (args.drafts.length !== args.embeddings.length) {
    throw new Error(
      `drafts/embeddings length mismatch: ${args.drafts.length} vs ${args.embeddings.length}`,
    );
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM chunks WHERE document_id = $1', [
      args.documentId,
    ]);

    if (args.drafts.length === 0) {
      await client.query('COMMIT');
      return { inserted: 0 };
    }

    const now = new Date();
    const rows = args.drafts.map((c, i) => [
      args.userId,
      args.subjectId,
      args.documentId,
      c.modality,
      c.content,
      `[${args.embeddings[i].join(',')}]`,
      args.embeddingModel,
      c.page,
      pgTextArrayLiteral(c.section_path),
      c.position,
      c.image_uri,
      c.image_is_critical,
      JSON.stringify(c.metadata),
      now,
      now,
    ]);

    const sql = format(
      `INSERT INTO chunks
         (user_id, subject_id, document_id, modality, content, embedding,
          embedding_model, page, section_path, "position", image_uri,
          image_is_critical, metadata, created_at, updated_at)
       VALUES %L`,
      rows,
    );
    await client.query(sql);
    await client.query('COMMIT');

    return { inserted: args.drafts.length };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

function pgTextArrayLiteral(arr: string[]): string {
  if (arr.length === 0) return '{}';
  const escaped = arr.map(
    (s) => `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`,
  );
  return `{${escaped.join(',')}}`;
}
