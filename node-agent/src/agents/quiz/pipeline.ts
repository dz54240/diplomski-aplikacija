import { sampleStratifiedChunks } from '../../persistence/chunks.js';
import { loadWeakTopics, insertQuiz, type QuizMetadata } from '../../persistence/quizzes.js';
import { embedQuery } from '../../lib/embeddings.js';
import { retrieve } from '../../retrieval/retrieve.js';
import { runPlannerAgent } from './planner.js';
import { runStemWriterAgent } from './stem-writer.js';
import { runDistractorWriterAgent } from './distractor-writer.js';
import { MODEL_NAMES } from '../../lib/ai-model.js';
import { logger } from '../../lib/logger.js';
import type { BloomLevel, QuizQuestionDraft } from '../../types/quiz.js';
import { REMEMBER_EXAMPLES } from '../../prompts/quiz/8shot/remember.js';
import { UNDERSTAND_EXAMPLES } from '../../prompts/quiz/8shot/understand.js';
import { APPLY_EXAMPLES } from '../../prompts/quiz/8shot/apply.js';
import { ANALYZE_EXAMPLES } from '../../prompts/quiz/8shot/analyze.js';
import type { ShotExample } from '../../prompts/quiz/8shot/types.js';

export const LLM_CALL_TIMEOUT_MS = 30_000;
export const SAMPLE_SIZE = 30;
export const STEM_RETRIEVE_TOP_K = 5;

export type PipelineEvent =
  | { type: 'stage'; stage: 'search' | 'plan' | 'drafting' | 'save' }
  | { type: 'question_progress'; n: number; total: number }
  | { type: 'quiz_done'; id: string; title: string };

export interface RunQuizPipelineArgs {
  userId: string;
  subjectId: string;
  subjectLanguage: 'hr' | 'en' | 'mixed';
  count: number;
  bloomFocus: Array<'Remember' | 'Understand' | 'Apply' | 'Analyze'>;
  abortSignal?: AbortSignal;
  onEvent: (e: PipelineEvent) => void;
}

export class PipelineError extends Error {
  constructor(
    public code: 'planner_no_topics' | 'llm_timeout' | 'llm_failure',
    message: string,
  ) {
    super(message);
    this.name = 'PipelineError';
  }
}

const EXAMPLES_BY_LEVEL: Record<BloomLevel, ShotExample[]> = {
  Remember: REMEMBER_EXAMPLES,
  Understand: UNDERSTAND_EXAMPLES,
  Apply: APPLY_EXAMPLES,
  Analyze: ANALYZE_EXAMPLES,
};

function withTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  ms: number,
  outerSignal?: AbortSignal,
): Promise<T> {
  const timer = new AbortController();
  const t = setTimeout(() => timer.abort(new Error('llm_timeout')), ms);
  const onOuterAbort = () => timer.abort();
  if (outerSignal?.aborted) {
    timer.abort();
  } else {
    outerSignal?.addEventListener('abort', onOuterAbort);
  }
  return fn(timer.signal).finally(() => {
    clearTimeout(t);
    outerSignal?.removeEventListener('abort', onOuterAbort);
  });
}

export async function runQuizPipeline(args: RunQuizPipelineArgs): Promise<void> {
  return runQuizPipelineInternal(args, LLM_CALL_TIMEOUT_MS);
}

export async function runQuizPipelineInternal(
  args: RunQuizPipelineArgs,
  timeoutMs: number,
): Promise<void> {
  const startTime = Date.now();
  let totalTokensIn = 0;
  let totalTokensOut = 0;
  let llmCalls = 0;

  args.onEvent({ type: 'stage', stage: 'search' });
  const sampleChunks = await sampleStratifiedChunks({
    userId: args.userId,
    subjectId: args.subjectId,
    sampleSize: SAMPLE_SIZE,
  });
  const weakTopics = await loadWeakTopics({ userId: args.userId, subjectId: args.subjectId });

  args.onEvent({ type: 'stage', stage: 'plan' });
  const plannerStart = Date.now();
  const plannerResult = await withTimeout(
    (signal) => runPlannerAgent({
      // SampleChunk lacks image_uri / similarity / metadata — add defaults to
      // satisfy ChunkResult type that runPlannerAgent expects.
      sampleChunks: sampleChunks.map((s) => ({
        id: s.id,
        document_id: s.document_id,
        document_title: s.document_title,
        modality: 'text' as const,
        content: s.content,
        page: s.page,
        section_path: s.section_path,
        image_uri: null,
        similarity: 0,
        metadata: {} as Record<string, unknown>,
      })),
      count: args.count,
      bloomFocus: args.bloomFocus,
      weakTopics: weakTopics.map((w) => ({ topic: w.topic, accuracy: w.accuracy })),
      subjectLanguage: args.subjectLanguage,
      abortSignal: signal,
    }),
    timeoutMs,
    args.abortSignal,
  );
  llmCalls++;
  totalTokensIn += plannerResult.usage.inputTokens;
  totalTokensOut += plannerResult.usage.outputTokens;
  logger.info(
    {
      event: 'quiz.llm_call',
      stage: 'planner',
      user_id: args.userId,
      subject_id: args.subjectId,
      model: MODEL_NAMES.quiz_planner,
      tokens_in: plannerResult.usage.inputTokens,
      tokens_out: plannerResult.usage.outputTokens,
      duration_ms: Date.now() - plannerStart,
    },
    'quiz: llm_call',
  );

  if (plannerResult.output.topics.length === 0) {
    throw new PipelineError('planner_no_topics', 'planner_no_topics: Planner returned no topics');
  }

  const effectiveCount = Math.min(args.count, plannerResult.output.topics.length);
  const topics = plannerResult.output.topics.slice(0, effectiveCount);
  if (effectiveCount < args.count) {
    logger.warn(
      {
        event: 'quiz.count_reduced',
        user_id: args.userId,
        requested: args.count,
        actual: effectiveCount,
      },
      'quiz: count reduced due to planner topic shortage',
    );
  }

  args.onEvent({ type: 'stage', stage: 'drafting' });
  const questions: QuizQuestionDraft[] = [];

  for (let n = 0; n < topics.length; n++) {
    const topic = topics[n];
    args.onEvent({ type: 'question_progress', n: n + 1, total: topics.length });

    const queryEmbedding = await embedQuery(topic.name);
    const retrievedChunks = await retrieve({
      queryEmbedding,
      userId: args.userId,
      subjectId: args.subjectId,
      topK: STEM_RETRIEVE_TOP_K,
    });

    const stemStart = Date.now();
    const stemResult = await withTimeout(
      (signal) => runStemWriterAgent({
        topic: topic.name,
        bloomLevel: topic.bloom_level,
        retrievedChunks: retrievedChunks.map((c) => ({
          content: c.content,
          section_path: c.section_path,
          page: c.page,
        })),
        examples: EXAMPLES_BY_LEVEL[topic.bloom_level],
        abortSignal: signal,
      }),
      timeoutMs,
      args.abortSignal,
    );
    llmCalls++;
    totalTokensIn += stemResult.usage.inputTokens;
    totalTokensOut += stemResult.usage.outputTokens;
    logger.info(
      {
        event: 'quiz.llm_call',
        stage: 'stem',
        user_id: args.userId,
        subject_id: args.subjectId,
        question_n: n + 1,
        topic: topic.name,
        bloom_level: topic.bloom_level,
        model: MODEL_NAMES.quiz_stem,
        tokens_in: stemResult.usage.inputTokens,
        tokens_out: stemResult.usage.outputTokens,
        duration_ms: Date.now() - stemStart,
      },
      'quiz: llm_call',
    );

    const distractorStart = Date.now();
    const distractorResult = await withTimeout(
      (signal) => runDistractorWriterAgent({
        topic: topic.name,
        stem: stemResult.output.stem,
        correct: stemResult.output.correct_answer,
        bloomLevel: topic.bloom_level,
        abortSignal: signal,
      }),
      timeoutMs,
      args.abortSignal,
    );
    llmCalls++;
    totalTokensIn += distractorResult.usage.inputTokens;
    totalTokensOut += distractorResult.usage.outputTokens;
    logger.info(
      {
        event: 'quiz.llm_call',
        stage: 'distractor',
        user_id: args.userId,
        subject_id: args.subjectId,
        question_n: n + 1,
        topic: topic.name,
        bloom_level: topic.bloom_level,
        model: MODEL_NAMES.quiz_distractor,
        tokens_in: distractorResult.usage.inputTokens,
        tokens_out: distractorResult.usage.outputTokens,
        duration_ms: Date.now() - distractorStart,
      },
      'quiz: llm_call',
    );

    questions.push({
      position: n + 1,
      stem: stemResult.output.stem,
      correct_answer: stemResult.output.correct_answer,
      distractors: [...distractorResult.output.distractors],
      bloom_level: topic.bloom_level,
      topic: topic.name,
      citation_chunk_ids: retrievedChunks
        .map((c) => parseInt(c.id, 10))
        .filter((num) => Number.isFinite(num)),
    });
  }

  args.onEvent({ type: 'stage', stage: 'save' });
  const metadata: QuizMetadata = {
    total_tokens_input: totalTokensIn,
    total_tokens_output: totalTokensOut,
    total_duration_ms: Date.now() - startTime,
    llm_calls: llmCalls,
    planner_topic_count: plannerResult.output.topics.length,
    model: MODEL_NAMES.quiz_planner,
    embedding_model: MODEL_NAMES.embedding,
  };
  const saved = await insertQuiz({
    userId: args.userId,
    subjectId: args.subjectId,
    title: plannerResult.output.title,
    bloomFocus: args.bloomFocus,
    metadata,
    questions,
  });

  args.onEvent({ type: 'quiz_done', id: saved.id, title: plannerResult.output.title });
}
