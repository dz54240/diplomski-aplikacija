import { z } from 'zod';

export const TextBlockSchema = z.object({
  type: z.literal('text'),
  page: z.number().int().nullable().optional(),
  section_path: z.array(z.string()).default([]),
  md: z.string(),
});

export const FigureBlockSchema = z.object({
  type: z.literal('figure'),
  page: z.number().int().nullable().optional(),
  section_path: z.array(z.string()).default([]),
  image_id: z.string(),
  image_url: z.string().url(),
  bbox: z.array(z.number()).nullish(),
  surrounding_text: z.string().nullish(),
});

export const TableBlockSchema = z.object({
  type: z.literal('table'),
  page: z.number().int().nullable().optional(),
  section_path: z.array(z.string()).default([]),
  md_table: z.string(),
});

export const FormulaBlockSchema = z.object({
  type: z.literal('formula'),
  page: z.number().int().nullable().optional(),
  section_path: z.array(z.string()).default([]),
  latex: z.string(),
});

export const BlockSchema = z.discriminatedUnion('type', [
  TextBlockSchema,
  FigureBlockSchema,
  TableBlockSchema,
  FormulaBlockSchema,
]);

export const ParsedOutputSchema = z.object({
  blocks: z.array(BlockSchema),
  pages: z.number().int().optional(),
  parser: z.string().optional(),
  parser_version: z.string().optional(),
  language_detected: z.string().nullish(),
});

export type TextBlock = z.infer<typeof TextBlockSchema>;
export type FigureBlock = z.infer<typeof FigureBlockSchema>;
export type TableBlock = z.infer<typeof TableBlockSchema>;
export type FormulaBlock = z.infer<typeof FormulaBlockSchema>;
export type Block = z.infer<typeof BlockSchema>;
export type ParsedOutput = z.infer<typeof ParsedOutputSchema>;
