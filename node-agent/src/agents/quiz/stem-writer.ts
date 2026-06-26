import { generateObject } from 'ai';
import { QUIZ_STEM_MODEL } from '../../lib/ai-model.js';
import { STEM_SYSTEM_PROMPT, buildStemPrompt } from '../../prompts/quiz/stem-builder.js';
import { StemOutputSchema, type StemOutput, type BloomLevel } from '../../types/quiz.js';
import type { ShotExample } from '../../prompts/quiz/8shot/types.js';

export interface RunStemWriterArgs {
  topic: string;
  bloomLevel: BloomLevel;
  retrievedChunks: Array<{ content: string; section_path: string[]; page: number | null }>;
  examples: ShotExample[];
  abortSignal?: AbortSignal;
}

export interface StemWriterResult {
  output: StemOutput;
  usage: { inputTokens: number; outputTokens: number };
}

export async function runStemWriterAgent(args: RunStemWriterArgs): Promise<StemWriterResult> {
  const prompt = buildStemPrompt({
    topic: args.topic,
    bloomLevel: args.bloomLevel,
    retrievedChunks: args.retrievedChunks,
    examples: args.examples,
  });

  const result = await generateObject({
    model: QUIZ_STEM_MODEL,
    system: STEM_SYSTEM_PROMPT,
    prompt,
    schema: StemOutputSchema,
    abortSignal: args.abortSignal,
  });

  return {
    output: result.object,
    usage: {
      inputTokens: result.usage?.inputTokens ?? 0,
      outputTokens: result.usage?.outputTokens ?? 0,
    },
  };
}
