import type { Request, Response } from 'express';
import { z } from 'zod';
import { createUIMessageStream, pipeUIMessageStreamToResponse } from 'ai';
import { loadQuizQuestionForUser } from '../persistence/quizzes.js';
import { loadChunksByIds } from '../persistence/chunks.js';
import { presignImageUri } from '../lib/minio-presign.js';
import { runTutorAgent } from '../agents/tutor.js';
import { MODEL_NAMES } from '../lib/ai-model.js';
import { logger } from '../lib/logger.js';
import type { ChunkMeta } from '../types/chunk.js';

export const TUTOR_TIMEOUT_MS = 60_000;

const TutorRequestSchema = z.object({
  quiz_question_id: z.string().uuid(),
  selected_answer: z.string().min(1),
});

export async function tutorHandler(req: Request, res: Response): Promise<void> {
  const userId = req.userContext?.user_id;
  if (!userId) {
    res.status(401).json({ error: { code: 'unauthorized', message: 'not authenticated' } });
    return;
  }

  const parsed = TutorRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({
      error: { code: 'validation_error', message: parsed.error.issues.map((i) => i.message).join('; ') },
    });
    return;
  }
  const { quiz_question_id, selected_answer } = parsed.data;

  const question = await loadQuizQuestionForUser({ questionId: quiz_question_id, userId });
  if (!question) {
    res.status(404).json({ error: { code: 'not_found', message: 'quiz question not found or not owned' } });
    return;
  }

  const options = [question.correct_answer, ...question.distractors];
  if (!options.includes(selected_answer)) {
    res.status(422).json({
      error: { code: 'validation_error', message: 'selected_answer is not one of the question options' },
    });
    return;
  }

  const rawChunks = await loadChunksByIds({ ids: question.citation_chunk_ids, userId });
  const chunks: ChunkMeta[] = await Promise.all(
    rawChunks.map(async (c) => {
      if (c.modality !== 'image_caption' || !c.image_uri) return c;
      try {
        return { ...c, image_uri: await presignImageUri(c.image_uri) };
      } catch (e) {
        logger.warn({ err: e, chunk_id: c.id }, 'tutor: presign failed, returning null');
        return { ...c, image_uri: null };
      }
    }),
  );

  const abort = new AbortController();
  req.on('close', () => abort.abort());
  const timer = setTimeout(() => abort.abort(new Error('llm_timeout')), TUTOR_TIMEOUT_MS);
  const started = Date.now();

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      for (const c of chunks) {
        writer.write({ type: 'data-chunk', data: c });
      }

      const result = runTutorAgent({
        stem: question.stem,
        options,
        correctAnswer: question.correct_answer,
        selectedAnswer: selected_answer,
        bloomLevel: question.bloom_level,
        topic: question.topic,
        chunks,
        abortSignal: abort.signal,
      });

      writer.merge(result.toUIMessageStream({ sendStart: false }));

      try {
        const text = await result.text;
        const usage = await Promise.resolve(result.usage).catch(() => undefined);
        logger.info(
          {
            event: 'tutor.llm_call',
            user_id: userId,
            quiz_question_id,
            model: MODEL_NAMES.tutor,
            tokens_in: usage?.inputTokens,
            tokens_out: usage?.outputTokens,
            duration_ms: Date.now() - started,
            text_len: text.length,
          },
          'tutor: llm_call',
        );
      } catch (e) {
        const err = e as Error;
        const code = abort.signal.aborted || /timeout/i.test(err.message) ? 'llm_timeout' : 'llm_failure';
        logger.error({ err, user_id: userId, quiz_question_id, code }, 'tutor: stream error');
        writer.write({ type: 'data-error', data: { code, message: err.message } });
      } finally {
        clearTimeout(timer);
      }
    },
  });

  pipeUIMessageStreamToResponse({ response: res, stream });
}
