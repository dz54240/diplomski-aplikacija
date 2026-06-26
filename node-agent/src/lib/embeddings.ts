import { openai, EMBEDDING_MODEL, EMBEDDING_DIM } from './openai.js';

export async function embedQuery(query: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    dimensions: EMBEDDING_DIM,
    input: query,
  });
  const vec = response.data[0]?.embedding;
  if (!vec || vec.length !== EMBEDDING_DIM) {
    throw new Error(`embedding dim mismatch: expected ${EMBEDDING_DIM}, got ${vec?.length}`);
  }
  return vec;
}
