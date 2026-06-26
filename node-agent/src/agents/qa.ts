import { streamText, stepCountIs, type ModelMessage } from 'ai';
import { CHAT_MODEL } from '../lib/ai-model.js';
import { retrieveTool } from '../tools/retrieve.js';
import { QA_SYSTEM_PROMPT } from '../prompts/qa.js';
import type { ChunkMeta } from '../types/chunk.js';

export interface QaAgentArgs {
  userMessage: string;
  userId: string;
  subjectId: string;
  previousMessages: ModelMessage[];
  abortSignal?: AbortSignal;
  onChunkMeta?: (chunks: ChunkMeta[]) => void;
}

export function runQaAgent(args: QaAgentArgs) {
  return streamText({
    model: CHAT_MODEL,
    system: QA_SYSTEM_PROMPT,
    messages: [
      ...args.previousMessages,
      { role: 'user', content: args.userMessage },
    ],
    tools: {
      retrieve: retrieveTool({ userId: args.userId, subjectId: args.subjectId }),
    },
    stopWhen: stepCountIs(5),
    abortSignal: args.abortSignal,
    onStepFinish: ({ toolResults }: { toolResults?: Array<{ toolName: string; output: unknown }> }) => {
      if (!args.onChunkMeta) return;
      for (const tr of toolResults ?? []) {
        if (tr.toolName !== 'retrieve') continue;
        const out = tr.output as { chunks_meta?: ChunkMeta[] } | undefined;
        if (out?.chunks_meta && out.chunks_meta.length > 0) {
          args.onChunkMeta(out.chunks_meta);
        }
      }
    },
  });
}
