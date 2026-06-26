import { openai, EMBEDDING_MODEL, EMBEDDING_DIM } from '../lib/openai.js';
import { logger } from '../lib/logger.js';

const BATCH_SIZE = 100;
const MAX_RETRIES = 3;

export async function embed(texts: string[]): Promise<number[][]> {
  const out: number[][] = new Array(texts.length);
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const vectors = await embedBatch(batch);
    for (let j = 0; j < vectors.length; j++) {
      out[i + j] = vectors[j];
    }
  }
  return out;
}

async function embedBatch(batch: string[], attempt = 1): Promise<number[][]> {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
      dimensions: EMBEDDING_DIM,
    });
    return response.data
      .sort((a, b) => a.index - b.index)
      .map((d) => d.embedding);
  } catch (e) {
    const err = e as Error & { status?: number };
    const status = err.status ?? 0;
    const retriable = status === 429 || status === 503 || status >= 500;
    if (retriable && attempt < MAX_RETRIES) {
      const delay = 2 ** attempt * 500;
      logger.warn(
        { attempt, delay, status },
        'embedder: retrying after error',
      );
      await sleep(delay);
      return embedBatch(batch, attempt + 1);
    }
    throw e;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
