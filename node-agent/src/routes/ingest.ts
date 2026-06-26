import type { Request, Response } from 'express';
import pLimit from 'p-limit';
import { ParsedOutputSchema } from '../types/parsed-output.js';
import type { DraftChunk } from '../types/chunk.js';
import { recursiveSplit } from '../ingestion/chunker.js';
import { caption } from '../ingestion/captioner.js';
import { embed } from '../ingestion/embedder.js';
import { persistChunks } from '../ingestion/persister.js';
import { EMBEDDING_MODEL_VERSION } from '../lib/openai.js';
import { logger } from '../lib/logger.js';

const CAPTION_CONCURRENCY = 5;

interface IngestBody {
  document_id: string;
  user_id: string;
  subject_id: string;
  parsed_output: unknown;
  language: string;
}

export async function ingestHandler(
  req: Request<unknown, unknown, IngestBody>,
  res: Response,
): Promise<void> {
  const { document_id, user_id, subject_id, parsed_output, language } =
    req.body;
  if (!document_id || !user_id || !subject_id) {
    res.status(400).json({ error: 'missing required fields' });
    return;
  }

  const start = Date.now();
  let validated;
  try {
    validated = ParsedOutputSchema.parse(parsed_output);
  } catch (e) {
    logger.error(
      { document_id, err: e },
      'ingest: parsed_output schema validation failed',
    );
    res
      .status(400)
      .json({ error: 'invalid parsed_output shape', detail: (e as Error).message });
    return;
  }

  const drafts: DraftChunk[] = [];
  let position = 0;
  let captions = 0;

  const limit = pLimit(CAPTION_CONCURRENCY);
  const captionPromises: Promise<void>[] = [];

  for (const block of validated.blocks) {
    if (block.type === 'text') {
      const parts = recursiveSplit(block.md, { chunkSize: 512, overlap: 64 });
      for (const content of parts) {
        drafts.push({
          modality: 'text',
          content,
          page: block.page ?? null,
          section_path: block.section_path,
          position: position++,
          image_uri: null,
          image_is_critical: false,
          metadata: { block_type: 'text' },
        });
      }
    } else if (block.type === 'table') {
      drafts.push({
        modality: 'table',
        content: block.md_table,
        page: block.page ?? null,
        section_path: block.section_path,
        position: position++,
        image_uri: null,
        image_is_critical: false,
        metadata: { block_type: 'table' },
      });
    } else if (block.type === 'formula') {
      drafts.push({
        modality: 'formula',
        content: block.latex,
        page: block.page ?? null,
        section_path: block.section_path,
        position: position++,
        image_uri: null,
        image_is_critical: false,
        metadata: { block_type: 'formula' },
      });
    } else if (block.type === 'figure') {
      const draftIdx = drafts.length;
      drafts.push({
        modality: 'image_caption',
        content: '',
        page: block.page ?? null,
        section_path: block.section_path,
        position: position++,
        image_uri: block.image_id,
        image_is_critical: false,
        metadata: { block_type: 'figure' },
      });
      captions++;
      captionPromises.push(
        limit(async () => {
          const result = await caption(block.image_url, language);
          drafts[draftIdx].content = result.combined;
          drafts[draftIdx].image_is_critical = result.is_critical;
          drafts[draftIdx].metadata = {
            ...drafts[draftIdx].metadata,
            caption_model: 'gpt-5.4-nano',
            transcribed_text: result.transcribed_text,
            formulas_latex: result.formulas_latex,
          };
        }),
      );
    }
  }

  await Promise.all(captionPromises);

  if (drafts.length === 0) {
    res.json({ chunks_inserted: 0, took_ms: Date.now() - start, captions: 0 });
    return;
  }

  const embeddings = await embed(drafts.map((d) => d.content));

  const { inserted } = await persistChunks({
    documentId: document_id,
    userId: user_id,
    subjectId: subject_id,
    drafts,
    embeddings,
    embeddingModel: EMBEDDING_MODEL_VERSION,
  });

  const took = Date.now() - start;
  logger.info(
    { document_id, inserted, captions, took_ms: took },
    'ingest: done',
  );
  res.json({ chunks_inserted: inserted, took_ms: took, captions });
}
