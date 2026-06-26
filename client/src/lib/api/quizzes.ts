import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from './client';
import { NODE_AGENT_URL } from '@/lib/api';
import { parseChunkPart, type ChunkMeta } from '@/lib/citations';

export interface QuizListItem {
  id: string;
  subject_id: string;
  title: string;
  bloom_focus: string[];
  completed_at: string | null;
  created_at: string;
  question_count: number;
}

export interface QuizQuestionView {
  id: string;
  position: number;
  stem: string;
  options: string[];
  bloom_level: string;
  topic: string;
  correct_answer?: string;
}

export interface QuizAttemptAnswer {
  question_id: string;
  selected: string;
  is_correct: boolean;
}

export interface QuizAttemptSummary {
  score: number;
  total: number;
  answers: QuizAttemptAnswer[];
}

export interface QuizDetail extends QuizListItem {
  questions: QuizQuestionView[];
  attempt?: QuizAttemptSummary | null;
}

export interface AttemptSubmit {
  question_id: string;
  selected: string | null;
  time_taken_ms: number | null;
}

export interface AttemptResult {
  question_id: string;
  is_correct: boolean;
}

export interface SubmitAttemptsResponse {
  quiz_id: string;
  score: number;
  total: number;
  results: AttemptResult[];
}

export interface QuizResultsNavState {
  resultsData: SubmitAttemptsResponse;
  answers: (number | null)[];
}

export interface ResultsView {
  score: number;
  total: number;
  results: AttemptResult[];
  userAnswers: (number | null)[];
}

export function resolveResultsView(
  quiz: QuizDetail,
  navState: Partial<QuizResultsNavState> | undefined,
): ResultsView | null {
  if (navState?.resultsData) {
    return {
      score: navState.resultsData.score,
      total: navState.resultsData.total,
      results: navState.resultsData.results,
      userAnswers: navState.answers ?? quiz.questions.map(() => null),
    };
  }
  if (quiz.attempt) {
    const selectedByQuestion = new Map(
      quiz.attempt.answers.map((a) => [a.question_id, a.selected] as const),
    );
    return {
      score: quiz.attempt.score,
      total: quiz.attempt.total,
      results: quiz.attempt.answers.map((a) => ({
        question_id: a.question_id,
        is_correct: a.is_correct,
      })),
      userAnswers: quiz.questions.map((q) => {
        const selected = selectedByQuestion.get(q.id);
        const i = selected != null ? q.options.indexOf(selected) : -1;
        return i >= 0 ? i : null;
      }),
    };
  }
  return null;
}

export function useSubjectQuizzes(subjectId: string) {
  return useQuery({
    queryKey: ['quizzes', 'subject', subjectId],
    queryFn: () => apiFetch<QuizListItem[]>(`/api/subjects/${subjectId}/quizzes`),
  });
}

export function useQuiz(quizId: string | null) {
  return useQuery({
    queryKey: ['quiz', quizId],
    enabled: !!quizId,
    queryFn: () => apiFetch<QuizDetail>(`/api/quizzes/${quizId}`),
  });
}

export function useSubmitQuizAttempts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { quizId: string; attempts: AttemptSubmit[] }) =>
      apiFetch<SubmitAttemptsResponse>(
        `/api/quizzes/${vars.quizId}/attempts`,
        { method: 'POST', body: JSON.stringify({ attempts: vars.attempts }) },
      ),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['quiz', vars.quizId] });
      qc.invalidateQueries({ queryKey: ['quizzes', 'subject'] });
    },
  });
}

export type QuizErrorCode =
  | 'unauthorized'
  | 'validation_error'
  | 'insufficient_materials'
  | 'planner_no_topics'
  | 'llm_timeout'
  | 'llm_failure';

export type QuizStreamEvent =
  | { type: 'stage'; stage: 'search' | 'plan' | 'drafting' | 'save' }
  | { type: 'question_progress'; n: number; total: number }
  | { type: 'quiz_done'; id: string; title: string };

export class QuizGenerationError extends Error {
  constructor(public code: QuizErrorCode, message: string) {
    super(message);
    this.name = 'QuizGenerationError';
  }
}

export interface StreamQuizGenerationArgs {
  subjectId: string;
  count: number;
  bloomFocus: string[];
  token: string;
  onEvent: (e: QuizStreamEvent) => void;
}

export async function streamQuizGeneration(args: StreamQuizGenerationArgs): Promise<void> {
  const headers = new Headers({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${args.token}`,
  });
  const res = await fetch(`${NODE_AGENT_URL}/quiz`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      subject_id: args.subjectId,
      count: args.count,
      bloom_focus: args.bloomFocus,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const code = (body?.error?.code as QuizErrorCode) ?? 'llm_failure';
    const message = body?.error?.message ?? `quiz generation failed (${res.status})`;
    throw new QuizGenerationError(code, message);
  }

  if (!res.body) {
    throw new QuizGenerationError('llm_failure', 'empty response body');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx = buffer.indexOf('\n\n');
    while (idx !== -1) {
      const rawEvent = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      idx = buffer.indexOf('\n\n');

      // AI SDK 6 UIMessageStream serializes each part as a single `data:` line
      // (`data: {"type":"data-stage","data":{...}}`); `type` is inline in the
      // JSON, the payload sits under `.data`, and the stream ends with `[DONE]`.
      // No `event:` line is emitted.
      let dataLine = '';
      for (const line of rawEvent.split('\n')) {
        if (line.startsWith('data:')) dataLine = line.slice(5).trim();
      }
      if (!dataLine) continue;
      if (dataLine === '[DONE]') return;

      let part: { type?: string; data?: Record<string, unknown> } | null = null;
      try {
        part = JSON.parse(dataLine);
      } catch {
        continue;
      }
      if (!part) continue;
      const data = part.data ?? {};
      switch (part.type) {
        case 'data-stage':
          args.onEvent({ type: 'stage', stage: data.stage as 'search' | 'plan' | 'drafting' | 'save' });
          break;
        case 'data-question-progress':
          args.onEvent({ type: 'question_progress', n: data.n as number, total: data.total as number });
          break;
        case 'data-quiz':
          args.onEvent({ type: 'quiz_done', id: data.id as string, title: data.title as string });
          break;
        case 'data-error':
          throw new QuizGenerationError(data.code as QuizErrorCode, data.message as string);
        default:
          break;
      }
    }
  }
}

export class TutorError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'TutorError';
  }
}

export interface StreamTutorExplanationArgs {
  quizQuestionId: string;
  selectedAnswer: string;
  token: string;
  onText: (delta: string) => void;
  onChunk: (chunk: ChunkMeta) => void;
  signal?: AbortSignal;
}

// Parses the AI SDK 6 UIMessageStream from POST /tutor: one `data:` line per event,
// `type` inline, `[DONE]` terminator, and text-delta parts carry the chunk in `.delta`.
export async function streamTutorExplanation(args: StreamTutorExplanationArgs): Promise<void> {
  const res = await fetch(`${NODE_AGENT_URL}/tutor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${args.token}` },
    body: JSON.stringify({ quiz_question_id: args.quizQuestionId, selected_answer: args.selectedAnswer }),
    signal: args.signal,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new TutorError(body?.error?.code ?? 'llm_failure', body?.error?.message ?? `tutor failed (${res.status})`);
  }
  if (!res.body) throw new TutorError('llm_failure', 'empty response body');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx = buffer.indexOf('\n\n');
    while (idx !== -1) {
      const rawEvent = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      idx = buffer.indexOf('\n\n');

      let dataLine = '';
      for (const line of rawEvent.split('\n')) {
        if (line.startsWith('data:')) dataLine = line.slice(5).trim();
      }
      if (!dataLine) continue;
      if (dataLine === '[DONE]') return;

      let part: { type?: string; delta?: string; data?: Record<string, unknown> } | null = null;
      try {
        part = JSON.parse(dataLine);
      } catch {
        continue;
      }
      if (!part) continue;

      switch (part.type) {
        case 'text-delta':
          if (typeof part.delta === 'string') args.onText(part.delta);
          break;
        case 'data-chunk': {
          const meta = parseChunkPart(part);
          if (meta) args.onChunk(meta);
          break;
        }
        case 'data-error':
          throw new TutorError(
            (part.data?.code as string) ?? 'llm_failure',
            (part.data?.message as string) ?? 'tutor stream error',
          );
        default:
          break;
      }
    }
  }
}
