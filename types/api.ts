import { z } from 'zod';

/** Standard API success response */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/** Standard API error response */
export interface ApiErrorResponse {
  success: false;
  error: string;
}

/** Union type for API responses */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/** Generate endpoint request schema */
export const GenerateRequestSchema = z.object({
  sourceText: z.string().min(1),
  topic: z.string().min(1),
  types: z.array(z.enum(['chapter', 'flashcards', 'audio'])).min(1),
});
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

/** Generate endpoint response */
export interface GenerateResponse {
  chapter?: string;
  flashcards?: string;
  audio?: string;
}

/** Job status response */
export const JobStatusQuerySchema = z.object({
  jobId: z.string().min(1),
  type: z.enum(['chapter', 'flashcards', 'audio']),
});
export type JobStatusQuery = z.infer<typeof JobStatusQuerySchema>;

export interface JobStatusResponse {
  status: 'waiting' | 'active' | 'completed' | 'failed';
  result?: unknown;
  error?: string;
}

/** Chat request schema */
export const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })),
  resourceId: z.string().optional(),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
