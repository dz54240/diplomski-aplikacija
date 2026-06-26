import type { Request, Response } from 'express';
import {
  createUIMessageStream,
  pipeUIMessageStreamToResponse,
  type ModelMessage,
} from 'ai';
import { randomUUID } from 'node:crypto';
import { query } from '../lib/db.js';
import {
  ensureConversation,
  appendMessage,
  loadRecentMessages,
} from '../persistence/conversations.js';
import { routeMessage } from '../agents/orchestrator.js';
import { runQaAgent } from '../agents/qa.js';
import { runTutorStub } from '../agents/tutor.js';
import { logger } from '../lib/logger.js';

interface ChatBody {
  subject_id: string;
  conversation_id?: string | null;
  message: string;
}

export async function chatHandler(
  req: Request<unknown, unknown, ChatBody>,
  res: Response,
): Promise<void> {
  const userId = req.userContext?.user_id;
  if (!userId) {
    res.status(401).json({ error: 'unauthenticated' });
    return;
  }
  const { subject_id, conversation_id, message } = req.body;
  if (!subject_id || !message || typeof message !== 'string') {
    res.status(400).json({ error: 'subject_id and message required' });
    return;
  }

  const owned = await query<{ id: string }>(
    `SELECT id::text FROM subjects WHERE id = $1 AND user_id = $2`,
    [subject_id, userId],
  );
  if (owned.length === 0) {
    res.status(403).json({ error: 'subject not found or not owned' });
    return;
  }

  let conversation: { id: string; created: boolean };
  try {
    conversation = await ensureConversation({
      conversationId: conversation_id ?? null,
      userId,
      subjectId: subject_id,
    });
  } catch (e) {
    res.status(404).json({ error: (e as Error).message });
    return;
  }

  await appendMessage({
    conversationId: conversation.id,
    userId,
    role: 'user',
    content: message,
    parts: [{ type: 'text', text: message }],
  });

  const previousRows = await loadRecentMessages({
    conversationId: conversation.id,
    limit: 20,
  });
  const previousMessages: ModelMessage[] = previousRows.slice(0, -1).map((m) => ({
    role: m.role === 'tool' ? 'assistant' : m.role,
    content: m.content,
  }));

  const routing = await routeMessage(message);
  logger.info(
    { user_id: userId, route: routing.agent, conversation_id: conversation.id },
    'chat: routed',
  );

  if (routing.agent === 'quiz') {
    const message_text =
      'Za generaciju kviza koristi "Novi kviz" gumb u sekciji Kvizovi predmeta.';
    await appendMessage({
      conversationId: conversation.id,
      userId,
      role: 'assistant',
      content: message_text,
      parts: [{ type: 'text', text: message_text }],
    });
    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        writer.write({ type: 'data-conversation', data: { id: conversation.id } });
        const id = randomUUID();
        writer.write({ type: 'text-start', id });
        writer.write({ type: 'text-delta', id, delta: message_text });
        writer.write({ type: 'text-end', id });
      },
    });
    pipeUIMessageStreamToResponse({ response: res, stream });
    return;
  }

  if (routing.agent === 'tutor') {
    const stub = runTutorStub({ userMessage: message, userId, subjectId: subject_id });

    await appendMessage({
      conversationId: conversation.id,
      userId,
      role: 'assistant',
      content: stub.message,
      parts: [
        { type: 'text', text: stub.message },
        { type: 'data-agent_stub', data: stub },
      ],
    });

    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        writer.write({ type: 'data-conversation', data: { id: conversation.id } });
        writer.write({ type: 'data-agent_stub', data: stub });
        const id = randomUUID();
        writer.write({ type: 'text-start', id });
        writer.write({ type: 'text-delta', id, delta: stub.message });
        writer.write({ type: 'text-end', id });
      },
    });

    pipeUIMessageStreamToResponse({ response: res, stream });
    return;
  }

  const abortController = new AbortController();
  req.on('close', () => abortController.abort());

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.write({ type: 'data-conversation', data: { id: conversation.id } });
      writer.write({ type: 'data-status', data: { stage: 'search' } });

      const result = runQaAgent({
        userMessage: message,
        userId,
        subjectId: subject_id,
        previousMessages,
        abortSignal: abortController.signal,
        onChunkMeta: (chunks) => {
          for (const c of chunks) {
            writer.write({ type: 'data-chunk', data: c });
          }
        },
      });

      writer.merge(result.toUIMessageStream({ sendStart: false }));

      try {
        const finalText = await result.text;
        await appendMessage({
          conversationId: conversation.id,
          userId,
          role: 'assistant',
          content: finalText,
          parts: [{ type: 'text', text: finalText }],
        });
      } catch (e) {
        logger.error(
          { err: e, conversation_id: conversation.id },
          'chat: stream error',
        );
        writer.write({
          type: 'data-error',
          data: { message: (e as Error).message },
        });
      }
    },
  });

  pipeUIMessageStreamToResponse({ response: res, stream });
}
