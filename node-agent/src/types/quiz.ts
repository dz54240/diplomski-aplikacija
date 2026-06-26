import { z } from 'zod';

export const BloomLevelSchema = z.enum(['Remember', 'Understand', 'Apply', 'Analyze']);
export type BloomLevel = z.infer<typeof BloomLevelSchema>;

export const PlannerOutputSchema = z.object({
  title: z.string().min(5).max(120),
  topics: z.array(
    z.object({
      name: z.string().min(2).max(80),
      bloom_level: BloomLevelSchema,
    }),
  ),
});
export type PlannerOutput = z.infer<typeof PlannerOutputSchema>;

export const StemOutputSchema = z.object({
  stem: z.string().min(5).max(500),
  correct_answer: z.string().min(1).max(400),
});
export type StemOutput = z.infer<typeof StemOutputSchema>;

export const DistractorOutputSchema = z.object({
  // Must be a fixed-length array (not z.tuple): OpenAI's response_format rejects
  // tuple-style `items` (an array of schemas).
  distractors: z.array(z.string().min(1).max(400)).length(3),
});
export type DistractorOutput = z.infer<typeof DistractorOutputSchema>;

export interface QuizQuestionDraft {
  position: number;
  stem: string;
  correct_answer: string;
  distractors: string[];
  bloom_level: BloomLevel;
  topic: string;
  citation_chunk_ids: number[];
}
