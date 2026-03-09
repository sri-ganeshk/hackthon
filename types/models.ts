import { z } from 'zod';
import type { Document, Types } from 'mongoose';

/** Zod schema for course chapter */
export const ChapterSchema = z.object({
  chapterTitle: z.string(),
  chapterSummary: z.string(),
  emoji: z.string().optional(),
  topics: z.array(z.string()),
});

/** Zod schema for course outline */
export const CourseOutlineSchema = z.object({
  courseTitle: z.string().optional(),
  courseSummary: z.string().optional(),
  chapters: z.array(ChapterSchema),
});

/** Zod schema for course outline document */
export const CourseOutlineDocSchema = z.object({
  userName: z.string(),
  email: z.string().email(),
  courseType: z.string(),
  difficultyLevel: z.string(),
  outline: CourseOutlineSchema,
  createdAt: z.date().optional(),
});

/** Zod schema for chapter note page */
export const NotePageSchema = z.object({
  pageNumber: z.number(),
  title: z.string(),
  content: z.string(),
});

/** Zod schema for chapter note article */
export const NoteArticleSchema = z.object({
  topic: z.string(),
  pages: z.array(NotePageSchema),
});

/** Zod schema for chapter note chapter entry */
export const NoteChapterSchema = z.object({
  chapter: z.string(),
  articles: z.array(NoteArticleSchema),
});

/** Zod schema for note document */
export const NoteDocSchema = z.object({
  courseId: z.string(),
  note: z.object({ chapters: z.array(NoteChapterSchema) }),
  generatedAt: z.string().optional(),
});

/** Zod schema for notebook chapter (Task 2a) */
export const NotebookChapterSchema = z.object({
  userId: z.string(),
  topic: z.string(),
  title: z.string(),
  sections: z.array(z.object({
    heading: z.string(),
    bullets: z.array(z.string()),
  })),
  createdAt: z.date().optional(),
});

/** Zod schema for flashcard (Task 2b) */
export const FlashcardSchema = z.object({
  userId: z.string(),
  topic: z.string(),
  cards: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })),
  createdAt: z.date().optional(),
});

/** Zod schema for audio overview (Task 2c) */
export const AudioOverviewSchema = z.object({
  userId: z.string(),
  topic: z.string(),
  script: z.string(),
  audioUrl: z.string(),
  createdAt: z.date().optional(),
});

/** Zod schema for resource (Task 4a) */
export const ResourceSchema = z.object({
  filename: z.string(),
  url: z.string(),
  userId: z.string(),
  uploadedAt: z.date().optional(),
  status: z.enum(['processing', 'ready', 'failed']),
});

/** Zod schema for document chunk (Task 4b) */
export const DocumentChunkSchema = z.object({
  resourceId: z.string(),
  chunkIndex: z.number(),
  text: z.string(),
  embedding: z.array(z.number()),
  metadata: z.object({
    filename: z.string(),
    pageEstimate: z.number().optional(),
  }),
});

export type Chapter = z.infer<typeof ChapterSchema>;
export type CourseOutline = z.infer<typeof CourseOutlineSchema>;
export type CourseOutlineDoc = z.infer<typeof CourseOutlineDocSchema>;
export type NotePage = z.infer<typeof NotePageSchema>;
export type NoteArticle = z.infer<typeof NoteArticleSchema>;
export type NoteChapter = z.infer<typeof NoteChapterSchema>;
export type NoteDoc = z.infer<typeof NoteDocSchema>;
export type NotebookChapterType = z.infer<typeof NotebookChapterSchema>;
export type FlashcardType = z.infer<typeof FlashcardSchema>;
export type AudioOverviewType = z.infer<typeof AudioOverviewSchema>;
export type ResourceType = z.infer<typeof ResourceSchema>;
export type DocumentChunkType = z.infer<typeof DocumentChunkSchema>;

/** Mongoose document interfaces */
export interface ICourseOutline extends Document {
  userName: string;
  email: string;
  courseType: string;
  difficultyLevel: string;
  outline: CourseOutline;
  createdAt: Date;
}

export interface INote extends Document {
  courseId: string;
  note: { chapters: NoteChapter[] };
  generatedAt: string;
}

export interface INotebookChapter extends Document {
  userId: string;
  topic: string;
  title: string;
  sections: Array<{ heading: string; bullets: string[] }>;
  createdAt: Date;
}

export interface IFlashcard extends Document {
  userId: string;
  topic: string;
  cards: Array<{ question: string; answer: string }>;
  createdAt: Date;
}

export interface IAudioOverview extends Document {
  userId: string;
  topic: string;
  script: string;
  audioUrl: string;
  createdAt: Date;
}

export interface IResource extends Document {
  filename: string;
  url: string;
  userId: string;
  uploadedAt: Date;
  status: 'processing' | 'ready' | 'failed';
}

export interface IDocumentChunk extends Document {
  resourceId: Types.ObjectId;
  chunkIndex: number;
  text: string;
  embedding: number[];
  metadata: { filename: string; pageEstimate?: number };
}
