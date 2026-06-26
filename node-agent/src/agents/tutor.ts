import { streamText } from 'ai';
import { TUTOR_MODEL } from '../lib/ai-model.js';
import { TUTOR_SYSTEM_PROMPT, buildTutorPrompt } from '../prompts/tutor.js';
import type { ChunkMeta } from '../types/chunk.js';

export interface AgentStubResult {
  type: 'agent_stub';
  agent: 'quiz' | 'tutor';
  status: 'not_implemented';
  message: string;
  payload: Record<string, unknown>;
}

export interface TutorStubInput {
  userMessage: string;
  userId: string;
  subjectId: string;
}

const HR_PATTERN = /[čćžšđ]/i;

export function runTutorStub(input: TutorStubInput): AgentStubResult {
  const isHr = HR_PATTERN.test(input.userMessage);
  const message = isHr
    ? 'Objašnjenja tutora dostupna su u rezultatima kviza: otvori kviz i klikni na pitanje za detaljno objašnjenje.'
    : 'Tutor explanations are available from quiz results: open a quiz and click a question for a detailed explanation.';
  return {
    type: 'agent_stub',
    agent: 'tutor',
    status: 'not_implemented',
    message,
    payload: { explanation_segments: [] },
  };
}

export interface TutorAgentArgs {
  stem: string;
  options: string[];
  correctAnswer: string;
  selectedAnswer: string;
  bloomLevel: string;
  topic: string;
  chunks: ChunkMeta[];
  abortSignal?: AbortSignal;
}

export function runTutorAgent(args: TutorAgentArgs) {
  return streamText({
    model: TUTOR_MODEL,
    system: TUTOR_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildTutorPrompt(args) }],
    providerOptions: { openai: { reasoningEffort: 'high' } },
    abortSignal: args.abortSignal,
  });
}
