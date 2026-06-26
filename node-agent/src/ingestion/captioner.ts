import { z } from 'zod';
import { openai, VISION_MODEL } from '../lib/openai.js';
import { logger } from '../lib/logger.js';

export const CaptionSchema = z.object({
  summary: z.string(),
  transcribed_text: z.string(),
  formulas_latex: z.array(z.string()),
  is_critical: z.boolean(),
});

export type Caption = z.infer<typeof CaptionSchema>;
export type CaptionResult = Caption & { combined: string };

const SYSTEM_PROMPT = `You analyze images extracted from academic study materials.
Return structured JSON with:
- summary: 1-2 sentence description of what the image shows.
- transcribed_text: all readable text in the image, verbatim.
- formulas_latex: array of LaTeX strings for any mathematical formulas visible.
- is_critical: true if image is essential to understand surrounding content
  (diagrams, plots, formulas as image, photographs of key apparatus);
  false if decorative or redundant with surrounding text.
Respond in the language requested by the user.`;

function detectImageMime(url: string): string {
  const pathname = (() => {
    try {
      return new URL(url).pathname.toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  })();
  if (pathname.endsWith('.png')) return 'image/png';
  if (pathname.endsWith('.webp')) return 'image/webp';
  if (pathname.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

async function fetchAsDataUrl(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl);
  if (!res.ok) {
    throw new Error(
      `captioner: failed to download image (${res.status} ${res.statusText})`,
    );
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const mime = detectImageMime(imageUrl);
  return `data:${mime};base64,${buf.toString('base64')}`;
}

export async function caption(
  imageUrl: string,
  language: string,
): Promise<CaptionResult> {
  const userPrompt = `Analyze this image. Respond in ${language === 'hr' ? 'Croatian' : 'English'}.`;

  const dataUrl = await fetchAsDataUrl(imageUrl);

  const response = await openai.chat.completions.parse({
    model: VISION_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: userPrompt },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'CaptionResult',
        schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            transcribed_text: { type: 'string' },
            formulas_latex: { type: 'array', items: { type: 'string' } },
            is_critical: { type: 'boolean' },
          },
          required: [
            'summary',
            'transcribed_text',
            'formulas_latex',
            'is_critical',
          ],
          additionalProperties: false,
        },
        strict: true,
      },
    },
  });

  const parsed = response.choices[0]?.message.parsed;
  if (!parsed) {
    logger.error({ imageUrl }, 'captioner: empty parsed response');
    throw new Error('captioner returned no parsed content');
  }

  const validated = CaptionSchema.parse(parsed);
  return { ...validated, combined: buildCaptionText(validated) };
}

export function buildCaptionText(c: Caption): string {
  const parts = [c.summary];
  if (c.transcribed_text.trim()) parts.push(c.transcribed_text);
  if (c.formulas_latex.length > 0) parts.push(c.formulas_latex.join('\n'));
  return parts.join('\n\n');
}
