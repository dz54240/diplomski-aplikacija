import { randomUUID } from 'node:crypto';
import { type PoolClient } from 'pg';
import { pool, query } from '../lib/db.js';

export interface WeakTopicRow {
  topic: string;
  accuracy: number;
  attempts: number;
}

export async function loadWeakTopics(args: {
  userId: string;
  subjectId: string;
  limit?: number;
}): Promise<WeakTopicRow[]> {
  const limit = args.limit ?? 10;
  const rows = await query<{ topic: string; accuracy: number; attempts: number }>(
    `SELECT topic, accuracy, attempts::int AS attempts
     FROM weak_topics
     WHERE user_id = $1 AND subject_id = $2
     ORDER BY accuracy ASC
     LIMIT $3`,
    [args.userId, args.subjectId, limit],
  );
  return rows;
}

export interface InsertQuizQuestion {
  position: number;
  stem: string;
  correct_answer: string;
  distractors: string[];
  bloom_level: string;
  topic: string;
  citation_chunk_ids: number[];
}

export interface QuizMetadata {
  total_tokens_input: number;
  total_tokens_output: number;
  total_duration_ms: number;
  llm_calls: number;
  planner_topic_count: number;
  model: string;
  embedding_model: string;
}

export interface InsertQuizArgs {
  userId: string;
  subjectId: string;
  title: string;
  bloomFocus: string[];
  metadata: QuizMetadata;
  questions: InsertQuizQuestion[];
}

export async function insertQuiz(args: InsertQuizArgs): Promise<{ id: string }> {
  if (args.questions.length === 0) {
    throw new Error('insertQuiz: questions array must not be empty');
  }
  const quizId = randomUUID();
  let client: PoolClient | undefined;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO quizzes (id, user_id, subject_id, title, bloom_focus, metadata, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, now(), now())`,
      [
        quizId,
        args.userId,
        args.subjectId,
        args.title,
        args.bloomFocus,
        JSON.stringify(args.metadata),
      ],
    );

    // Parameterized bulk INSERT — avoids pg-format array escaping issues.
    const placeholders = args.questions
      .map((_, i) => {
        const base = i * 9;
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}::text[], $${base + 7}, $${base + 8}, $${base + 9}::bigint[], '{}'::jsonb, now(), now())`;
      })
      .join(', ');

    const params = args.questions.flatMap((q) => [
      randomUUID(),
      quizId,
      q.position,
      q.stem,
      q.correct_answer,
      q.distractors,
      q.bloom_level,
      q.topic,
      q.citation_chunk_ids,
    ]);

    await client.query(
      `INSERT INTO quiz_questions
         (id, quiz_id, position, stem, correct_answer, distractors,
          bloom_level, topic, citation_chunk_ids, metadata, created_at, updated_at)
       VALUES ${placeholders}`,
      params,
    );

    await client.query('COMMIT');
    return { id: quizId };
  } catch (e) {
    if (client) await client.query('ROLLBACK');
    throw e;
  } finally {
    client?.release();
  }
}

export interface TutorQuestionRow {
  id: string;
  stem: string;
  correct_answer: string;
  distractors: string[];
  bloom_level: string;
  topic: string;
  citation_chunk_ids: string[];
}

export async function loadQuizQuestionForUser(args: {
  questionId: string;
  userId: string;
}): Promise<TutorQuestionRow | null> {
  const rows = await query<{
    id: string;
    stem: string;
    correct_answer: string;
    distractors: string[];
    bloom_level: string;
    topic: string;
    citation_chunk_ids: (string | number)[] | null;
  }>(
    `SELECT qq.id::text,
            qq.stem,
            qq.correct_answer,
            qq.distractors,
            qq.bloom_level,
            qq.topic,
            qq.citation_chunk_ids
     FROM quiz_questions qq
     JOIN quizzes q ON q.id = qq.quiz_id
     WHERE qq.id = $1 AND q.user_id = $2`,
    [args.questionId, args.userId],
  );
  const r = rows[0];
  if (!r) return null;
  return {
    id: r.id,
    stem: r.stem,
    correct_answer: r.correct_answer,
    distractors: r.distractors,
    bloom_level: r.bloom_level,
    topic: r.topic,
    citation_chunk_ids: (r.citation_chunk_ids ?? []).map(String),
  };
}
