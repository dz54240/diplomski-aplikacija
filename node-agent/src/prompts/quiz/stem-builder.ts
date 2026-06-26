import type { ShotExample } from './8shot/types.js';

export const STEM_SYSTEM_PROMPT = `You write MCQ stems (questions) and correct answers from educational materials.
- Output language MUST match the language of the source material.
- Stem is a single clear question, NOT a fill-in-the-blank.
- Stem MUST NOT contain negation ("all of the following EXCEPT...").
- Stem is grounded in the provided material chunks — answer must be derivable from the materials.
- Correct answer is 1-2 sentences, factually precise.
- Correct answer length should NOT be systematically longer than typical distractors (avoid length-bias).
- Match the Bloom level pattern shown in the examples below.`;

export interface BuildStemPromptArgs {
  topic: string;
  bloomLevel: 'Remember' | 'Understand' | 'Apply' | 'Analyze';
  retrievedChunks: Array<{ content: string; section_path: string[]; page: number | null }>;
  examples: ShotExample[];
}

function formatExamples(examples: ShotExample[]): string {
  return examples
    .map((ex, i) => {
      return `EXAMPLE ${i + 1} (${ex.language}):
Materijal: "${ex.context}"
Pitanje: ${ex.stem}
Točan odgovor: ${ex.correct}
Distraktori:
- ${ex.distractors[0]}
- ${ex.distractors[1]}
- ${ex.distractors[2]}`;
    })
    .join('\n\n');
}

function formatChunks(chunks: BuildStemPromptArgs['retrievedChunks']): string {
  return chunks
    .map((c, i) => {
      const path = c.section_path.slice(0, 2).join(' > ') || '(no section)';
      const page = c.page != null ? ` (str. ${c.page})` : '';
      return `[${i + 1}] section: "${path}"${page}\n${c.content}`;
    })
    .join('\n\n');
}

export function buildStemPrompt(args: BuildStemPromptArgs): string {
  return `${formatExamples(args.examples)}

---

Now write a stem + correct answer for the following:

Topic: ${args.topic}
Bloom level: ${args.bloomLevel}

Source material chunks:
${formatChunks(args.retrievedChunks)}`;
}
