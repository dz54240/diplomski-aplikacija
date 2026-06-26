import type { Request, Response } from 'express';
import { query } from '../lib/db.js';
import { loadChunksByIds } from '../persistence/chunks.js';
import { presignImageUri } from '../lib/minio-presign.js';
import { logger } from '../lib/logger.js';
import type { ChunkMeta } from '../types/chunk.js';

const MARKER_REGEX = /\[chunk:(\d+)\]/g;

interface AssistantMessageRow {
  id: string;
  content: string;
}

export async function historyChunksHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const userId = req.userContext?.user_id;
  if (!userId) {
    res.status(401).json({ error: 'unauthenticated' });
    return;
  }

  const conversationId = req.params.id;

  const owned = await query<{ id: string }>(
    `SELECT id::text FROM conversations
     WHERE id = $1 AND user_id = $2 AND archived_at IS NULL`,
    [conversationId, userId],
  );
  if (owned.length === 0) {
    res.status(404).json({ error: 'conversation not found or not owned by user' });
    return;
  }

  const messages = await query<AssistantMessageRow>(
    `SELECT id::text, content
     FROM messages
     WHERE conversation_id = $1 AND role = 'assistant'
     ORDER BY created_at ASC`,
    [conversationId],
  );

  const messageMarkers = new Map<string, string[]>();
  const allIds = new Set<string>();

  for (const m of messages) {
    const seenInMsg = new Set<string>();
    const ordered: string[] = [];
    for (const match of m.content.matchAll(MARKER_REGEX)) {
      const id = match[1];
      if (!seenInMsg.has(id)) {
        seenInMsg.add(id);
        ordered.push(id);
        allIds.add(id);
      }
    }
    if (ordered.length > 0) {
      messageMarkers.set(m.id, ordered);
    }
  }

  const chunks = await loadChunksByIds({
    ids: Array.from(allIds),
    userId,
  });

  const presigned: ChunkMeta[] = await Promise.all(
    chunks.map(async (c) => {
      if (c.modality !== 'image_caption' || !c.image_uri) return c;
      try {
        const url = await presignImageUri(c.image_uri);
        return { ...c, image_uri: url };
      } catch (e) {
        logger.warn(
          { err: e, chunk_id: c.id },
          'history-chunks: presign failed, returning null',
        );
        return { ...c, image_uri: null };
      }
    }),
  );

  const presignedById = new Map(presigned.map((c) => [c.id, c]));

  const result: Record<string, ChunkMeta[]> = {};
  for (const [msgId, ids] of messageMarkers.entries()) {
    const list = ids
      .map((id) => presignedById.get(id))
      .filter((c): c is ChunkMeta => c !== undefined);
    if (list.length > 0) {
      result[msgId] = list;
    }
  }

  res.json({ messages: result });
}
