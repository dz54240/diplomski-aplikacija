import { generateObject } from 'ai';
import { QUIZ_PLANNER_MODEL } from '../../lib/ai-model.js';
import {
  PLANNER_SYSTEM_PROMPT,
  buildPlannerPrompt,
  type WeakTopicHint,
} from '../../prompts/quiz/planner.js';
import { PlannerOutputSchema, type PlannerOutput } from '../../types/quiz.js';
import type { ChunkResult } from '../../types/chunk.js';

export interface RunPlannerArgs {
  sampleChunks: ChunkResult[];
  count: number;
  bloomFocus: Array<'Remember' | 'Understand' | 'Apply' | 'Analyze'>;
  weakTopics: WeakTopicHint[];
  subjectLanguage: 'hr' | 'en' | 'mixed';
  abortSignal?: AbortSignal;
}

export interface PlannerResult {
  output: PlannerOutput;
  usage: { inputTokens: number; outputTokens: number };
}

export async function runPlannerAgent(args: RunPlannerArgs): Promise<PlannerResult> {
  const prompt = buildPlannerPrompt({
    sampleChunks: args.sampleChunks,
    count: args.count,
    bloomFocus: args.bloomFocus,
    weakTopics: args.weakTopics,
    subjectLanguage: args.subjectLanguage,
  });

  const result = await generateObject({
    model: QUIZ_PLANNER_MODEL,
    system: PLANNER_SYSTEM_PROMPT,
    prompt,
    schema: PlannerOutputSchema,
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
