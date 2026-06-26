import type { ChunkResult } from '../../types/chunk.js';

export interface WeakTopicHint {
  topic: string;
  accuracy: number;
}

export interface BuildPlannerPromptArgs {
  sampleChunks: ChunkResult[];
  count: number;
  bloomFocus: Array<'Remember' | 'Understand' | 'Apply' | 'Analyze'>;
  weakTopics: WeakTopicHint[];
  subjectLanguage: 'hr' | 'en' | 'mixed';
}

export const PLANNER_SYSTEM_PROMPT = `You are a quiz topic planner for an educational MCQ system.
Given a sample of student materials, produce a list of topics for an MCQ quiz.
- Topic names are noun-phrases (1-5 words). Examples: "Gradient descent", "SQL JOIN syntax".
- DO NOT use section identifiers ("Section 3.2") or full questions as topic names.
- Each topic gets a Bloom level: Remember, Understand, Apply, or Analyze.
- Output a quiz title (5-120 chars) in the materials' language.
- If the materials are in Croatian, write the title and topics in Croatian.
- If the materials are mixed (hr + en), choose the dominant language for the title.
- Return EXACTLY the requested count of topics. If materials lack thematic breadth for that many distinct topics, return as many distinct topics as you can find (we will reduce the count).
- If no meaningful topics can be extracted, return an empty topics array.`;

export function buildPlannerPrompt(args: BuildPlannerPromptArgs): string {
  const chunkBlock = args.sampleChunks
    .map((c, i) => {
      const path = (c.section_path ?? []).slice(0, 2).join(' > ') || '(no section)';
      const page = c.page != null ? ` (str. ${c.page})` : '';
      const content = c.content.length > 200 ? c.content.slice(0, 200) + '...' : c.content;
      return `[${i + 1}] section: "${path}"${page}\n    ${content}`;
    })
    .join('\n');

  const bloomFocusLabel =
    args.bloomFocus.length > 0
      ? args.bloomFocus.join(', ')
      : 'mixed (Remember, Understand, Apply, Analyze)';

  const weakBlock =
    args.weakTopics.length > 0
      ? `\n\nKorisnik ima slabo poznavanje sljedećih tema (prošli kvizovi pokazuju < 50% točnost):\n` +
        args.weakTopics.map((w) => `- ${w.topic} (točnost ${Math.round(w.accuracy * 100)}%)`).join('\n') +
        `\nBias-iraj 30-50% pitanja prema tim temama AKO su pokrivene u materijalima.`
      : '';

  return `Materijali (sample):
${chunkBlock}

Generiraj kviz s točno ${args.count} pitanja.
Bloom razine: ${bloomFocusLabel}.
Jezik materijala: ${args.subjectLanguage}.${weakBlock}`;
}
