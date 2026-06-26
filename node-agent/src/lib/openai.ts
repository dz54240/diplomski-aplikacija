import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey && process.env.NODE_ENV !== 'test') {
  throw new Error('OPENAI_API_KEY required');
}

export const openai = new OpenAI({ apiKey: apiKey ?? 'sk-test-stub' });

export const EMBEDDING_MODEL = 'text-embedding-3-large';
export const EMBEDDING_DIM = 1536;
export const EMBEDDING_MODEL_VERSION = 'text-embedding-3-large@1536@2024-01';

export const VISION_MODEL = 'gpt-5.4-nano';
