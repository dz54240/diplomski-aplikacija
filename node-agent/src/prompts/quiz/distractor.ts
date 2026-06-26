export const DISTRACTOR_SYSTEM_PROMPT = `You generate plausible WRONG answers (distractors) for multiple-choice questions.
- Generate EXACTLY 3 distractors.
- Distractors must be plausible — a student who hasn't mastered the material could pick one.
- Distractors must NOT be obviously wrong, joke answers, or "all of the above" style.
- Distractors must have PARALLEL form to the correct answer (similar length, similar grammatical structure).
- Distractors should NOT contain the correct answer text as a substring.
- Output language MUST match the language of the stem/correct answer.
- For Bloom level "Remember": distractors are factual near-misses (similar terms, swapped acronym meanings).
- For "Understand": distractors are alternate plausible interpretations.
- For "Apply": distractors are applications of wrong technique or wrong parameters.
- For "Analyze": distractors are superficial or off-focus comparisons.`;

export interface BuildDistractorPromptArgs {
  topic: string;
  stem: string;
  correct: string;
  bloomLevel: 'Remember' | 'Understand' | 'Apply' | 'Analyze';
}

export function buildDistractorPrompt(args: BuildDistractorPromptArgs): string {
  return `Topic: ${args.topic}
Bloom level: ${args.bloomLevel}

Stem (question):
${args.stem}

Correct answer:
${args.correct}

Generate 3 plausible distractors following the rules above.`;
}
