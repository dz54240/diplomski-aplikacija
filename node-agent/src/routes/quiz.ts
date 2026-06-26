import type { Request, Response } from 'express';
import { z } from 'zod';
import { createUIMessageStream, pipeUIMessageStreamToResponse } from 'ai';
import { query } from '../lib/db.js';
import { runQuizPipeline, PipelineError, type PipelineEvent } from '../agents/quiz/pipeline.js';
import { logger } from '../lib/logger.js';

const BloomFocusSchema = z.enum(['Remember', 'Understand', 'Apply', 'Analyze']);

const QuizRequestSchema = z.object({
  subject_id: z.string().uuid(),
  count: z.number().int().min(5).max(20),
  bloom_focus: z.array(BloomFocusSchema).default([]),
});

interface SubjectRow {
  id: string;
  language: 'hr' | 'en' | 'mixed';
}

export async function quizHandler(req: Request, res: Response): Promise<void> {
  const userId = req.userContext?.user_id;
  if (!userId) {
    res.status(401).json({ error: { code: 'unauthorized', message: 'not authenticated' } });
    return;
  }

  const parsed = QuizRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({
      error: {
        code: 'validation_error',
        message: parsed.error.issues.map((i) => i.message).join('; '),
      },
    });
    return;
  }
  const { subject_id, count, bloom_focus } = parsed.data;

  const subjectRows = await query<SubjectRow>(
    `SELECT id::text, language FROM subjects WHERE id = $1 AND user_id = $2`,
    [subject_id, userId],
  );
  if (subjectRows.length === 0) {
    res.status(401).json({ error: { code: 'unauthorized', message: 'subject not found or not owned' } });
    return;
  }
  const subjectLanguage = subjectRows[0].language;

  const countRows = await query<{ count: string }>(
    `SELECT count(*)::text FROM chunks WHERE user_id = $1 AND subject_id = $2`,
    [userId, subject_id],
  );
  const chunkCount = parseInt(countRows[0].count, 10);
  if (chunkCount < 10) {
    res.status(422).json({
      error: {
        code: 'insufficient_materials',
        message: `subject has ${chunkCount} chunks (< 10 required)`,
      },
    });
    return;
  }

  const abortController = new AbortController();
  req.on('close', () => abortController.abort());

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      try {
        await runQuizPipeline({
          userId,
          subjectId: subject_id,
          subjectLanguage,
          count,
          bloomFocus: bloom_focus,
          abortSignal: abortController.signal,
          onEvent: (e: PipelineEvent) => {
            if (e.type === 'stage') {
              writer.write({ type: 'data-stage', data: { stage: e.stage } });
            } else if (e.type === 'question_progress') {
              writer.write({ type: 'data-question-progress', data: { n: e.n, total: e.total } });
            } else if (e.type === 'quiz_done') {
              writer.write({ type: 'data-quiz', data: { id: e.id, title: e.title } });
            }
          },
        });
      } catch (e) {
        const err = e as Error;
        if (abortController.signal.aborted) {
          logger.info({ user_id: userId, subject_id }, 'quiz: aborted by client');
          return;
        }
        let code: 'planner_no_topics' | 'llm_timeout' | 'llm_failure' = 'llm_failure';
        if (e instanceof PipelineError) {
          code = e.code;
        } else if (err.name === 'AbortError' || /timeout/i.test(err.message)) {
          code = 'llm_timeout';
        }
        logger.error({ err, user_id: userId, subject_id, code }, 'quiz: pipeline error');
        writer.write({ type: 'data-error', data: { code, message: err.message } });
      }
    },
  });

  pipeUIMessageStreamToResponse({ response: res, stream });
}
