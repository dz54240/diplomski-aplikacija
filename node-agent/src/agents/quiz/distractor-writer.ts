import { generateObject } from 'ai';
import { QUIZ_DISTRACTOR_MODEL } from '../../lib/ai-model.js';
import { DISTRACTOR_SYSTEM_PROMPT, buildDistractorPrompt } from '../../prompts/quiz/distractor.js';
import { DistractorOutputSchema, type DistractorOutput, type BloomLevel } from '../../types/quiz.js';

export interface RunDistractorWriterArgs {
  topic: string;
  stem: string;
  correct: string;
  bloomLevel: BloomLevel;
  abortSignal?: AbortSignal;
}

export interface DistractorWriterResult {
  output: DistractorOutput;
  usage: { inputTokens: number; outputTokens: number };
}

export async function runDistractorWriterAgent(
  args: RunDistractorWriterArgs,
): Promise<DistractorWriterResult> {
  const prompt = buildDistractorPrompt({
    topic: args.topic,
    stem: args.stem,
    correct: args.correct,
    bloomLevel: args.bloomLevel,
  });

  const result = await generateObject({
    model: QUIZ_DISTRACTOR_MODEL,
    system: DISTRACTOR_SYSTEM_PROMPT,
    prompt,
    schema: DistractorOutputSchema,
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
