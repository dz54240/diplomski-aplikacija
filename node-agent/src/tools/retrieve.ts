import { tool } from 'ai';
import { z } from 'zod';
import { embedQuery } from '../lib/embeddings.js';
import { retrieve } from '../retrieval/retrieve.js';
import { presignImageUri } from '../lib/minio-presign.js';
import type { ChunkResult, ChunkMeta } from '../types/chunk.js';

export interface RetrieveToolArgs {
  userId: string;
  subjectId: string;
}

export function retrieveTool(args: RetrieveToolArgs) {
  return tool({
    description:
      "Retrieves relevant chunks from the student's uploaded materials for the given subject. Returns top-K most semantically similar text/image-caption/table/formula chunks with their chunk id, document id, page number, content, and similarity score.",
    inputSchema: z.object({
      query: z.string().describe('Natural language query to search for in the materials'),
      topK: z
        .number()
        .int()
        .min(1)
        .max(20)
        .optional()
        .describe('How many chunks to return (default 8)'),
    }),
    execute: async ({ query, topK }) => {
      const queryEmbedding = await embedQuery(query);
      const chunks: ChunkResult[] = await retrieve({
        queryEmbedding,
        userId: args.userId,
        subjectId: args.subjectId,
        topK: topK ?? 8,
      });

      const chunks_meta: ChunkMeta[] = await Promise.all(
        chunks.map(async (c) => ({
          id: c.id,
          document_id: c.document_id,
          document_title: c.document_title,
          page: c.page,
          section_path: c.section_path,
          content: c.content,
          modality: c.modality,
          image_uri:
            c.modality === 'image_caption'
              ? await presignImageUri(c.image_uri)
              : null,
        })),
      );

      return { chunks, chunks_meta };
    },
  });
}
