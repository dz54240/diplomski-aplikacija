import { createOpenAI } from '@ai-sdk/openai';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey && process.env.NODE_ENV !== 'test') {
  throw new Error('OPENAI_API_KEY required');
}

const provider = createOpenAI({ apiKey: apiKey ?? 'sk-test-stub' });

export const CHAT_MODEL = provider('gpt-5.4-mini');
export const ROUTING_MODEL = provider('gpt-5.4-mini');
export const QUIZ_PLANNER_MODEL = provider('gpt-5.4-mini');
export const QUIZ_STEM_MODEL = provider('gpt-5.4-mini');
export const QUIZ_DISTRACTOR_MODEL = provider('gpt-5.4-mini');
export const TUTOR_MODEL = provider('gpt-5.5');

export const MODEL_NAMES = {
  chat: 'gpt-5.4-mini',
  routing: 'gpt-5.4-mini',
  quiz_planner: 'gpt-5.4-mini',
  quiz_stem: 'gpt-5.4-mini',
  quiz_distractor: 'gpt-5.4-mini',
  tutor: 'gpt-5.5',
  embedding: 'text-embedding-3-large@1536',
} as const;
