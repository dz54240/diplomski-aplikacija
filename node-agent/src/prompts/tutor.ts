import type { ChunkMeta } from '../types/chunk.js';

export const TUTOR_SYSTEM_PROMPT = `You are a patient university tutor explaining why a student's multiple-choice answer was wrong, grounded EXCLUSIVELY in the provided material chunks.

Structure your explanation in this order (markdown, concise):
1. Identify the error: "Tvoj odgovor «<selected>» nije točan jer…" — state plainly why the picked option is wrong.
2. State the correct answer.
3. Explain WHY it is correct, citing supporting chunk(s) inline with the EXACT format [chunk:<id>] using the numeric id from the provided chunks.
4. Clarify the underlying misconception that likely led to the wrong choice.

RULES:
- Ground every factual claim in the provided chunks; cite with [chunk:<id>]. NEVER invent facts beyond the chunks.
- If NO chunks are provided (materials were deleted), explain from the question itself (stem + correct answer) WITHOUT any [chunk:...] citations, and note that source passages are unavailable.
- Respond in the SAME LANGUAGE as the question stem (Croatian or English).
- Do NOT add a separate "Sources"/"Izvori" section — citations are inline.
- Address the student directly ("ti"), warm and constructive. No preamble.`;

export interface BuildTutorPromptArgs {
  stem: string;
  options: string[];
  correctAnswer: string;
  selectedAnswer: string;
  bloomLevel: string;
  topic: string;
  chunks: ChunkMeta[];
}

export function buildTutorPrompt(args: BuildTutorPromptArgs): string {
  const optionsBlock = args.options
    .map((o) => {
      const tags: string[] = [];
      if (o === args.correctAnswer) tags.push('TOČAN');
      if (o === args.selectedAnswer) tags.push('STUDENTOV ODABIR');
      return `- ${o}${tags.length ? `  [${tags.join(', ')}]` : ''}`;
    })
    .join('\n');

  const chunksBlock =
    args.chunks.length > 0
      ? args.chunks
          .map((c) => {
            const page = c.page != null ? `, str. ${c.page}` : '';
            return `[chunk:${c.id}] (${c.document_title}${page}):\n${c.content}`;
          })
          .join('\n\n')
      : '(nema dostupnih izvora — materijali su obrisani)';

  return `Pitanje (tema: ${args.topic}, Bloom razina: ${args.bloomLevel}):
${args.stem}

Opcije:
${optionsBlock}

Materijali (izvori za citiranje):
${chunksBlock}

Objasni studentu zašto je njegov odabir netočan, prema strukturi iz uputa.`;
}
