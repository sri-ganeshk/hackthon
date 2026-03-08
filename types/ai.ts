import { z } from 'zod';

/** Input for chapter generation job */
export const ChapterJobInputSchema = z.object({
  userId: z.string(),
  sourceText: z.string(),
  topic: z.string(),
});
export type ChapterJobInput = z.infer<typeof ChapterJobInputSchema>;

/** Input for flashcard generation job */
export const FlashcardJobInputSchema = z.object({
  userId: z.string(),
  sourceText: z.string(),
  topic: z.string(),
});
export type FlashcardJobInput = z.infer<typeof FlashcardJobInputSchema>;

/** Input for audio overview generation job */
export const AudioJobInputSchema = z.object({
  userId: z.string(),
  sourceText: z.string(),
  topic: z.string(),
});
export type AudioJobInput = z.infer<typeof AudioJobInputSchema>;

/** Input for PDF processing job */
export const PdfJobInputSchema = z.object({
  resourceId: z.string(),
  url: z.string(),
});
export type PdfJobInput = z.infer<typeof PdfJobInputSchema>;

/** RAG chunk result */
export interface RagChunk {
  chunkIndex: number;
  text: string;
  score: number;
}
