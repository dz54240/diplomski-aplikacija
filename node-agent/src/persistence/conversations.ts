import { randomUUID } from 'node:crypto';
import { query } from '../lib/db.js';

export interface EnsureArgs {
  conversationId: string | null;
  userId: string;
  subjectId: string;
}

export interface EnsureResult {
  id: string;
  created: boolean;
}

export async function ensureConversation(args: EnsureArgs): Promise<EnsureResult> {
  if (args.conversationId) {
    const rows = await query<{ id: string }>(
      `SELECT id::text FROM conversations
       WHERE id = $1 AND user_id = $2 AND subject_id = $3 AND archived_at IS NULL`,
      [args.conversationId, args.userId, args.subjectId],
    );
    if (rows.length === 0) {
      throw new Error('conversation not found or not owned by user');
    }
    return { id: rows[0].id, created: false };
  }
  const newId = randomUUID();
  await query(
    `INSERT INTO conversations (id, user_id, subject_id, created_at, updated_at)
     VALUES ($1, $2, $3, now(), now())`,
    [newId, args.userId, args.subjectId],
  );
  return { id: newId, created: true };
}

export interface AppendArgs {
  conversationId: string;
  userId: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  parts?: unknown;
}

export async function appendMessage(args: AppendArgs): Promise<{ id: number }> {
  const rows = await query<{ id: number }>(
    `INSERT INTO messages (conversation_id, user_id, role, content, parts, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5::jsonb, now(), now())
     RETURNING id`,
    [args.conversationId, args.userId, args.role, args.content, JSON.stringify(args.parts ?? null)],
  );
  const titleSeed = args.role === 'user' ? args.content.slice(0, 60) : null;
  await query(
    `UPDATE conversations
     SET title = COALESCE(title, $2),
         updated_at = now()
     WHERE id = $1`,
    [args.conversationId, titleSeed],
  );
  return { id: rows[0].id };
}

export interface LoadArgs {
  conversationId: string;
  limit?: number;
}

export interface LoadedMessage {
  id: number;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  parts: unknown;
}

export async function loadRecentMessages(args: LoadArgs): Promise<LoadedMessage[]> {
  const limit = args.limit ?? 20;
  const rows = await query<LoadedMessage>(
    `SELECT id, role, content, parts FROM (
       SELECT id, role, content, parts, created_at
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at DESC
       LIMIT $2
     ) AS recent
     ORDER BY created_at ASC`,
    [args.conversationId, limit],
  );
  return rows;
}
