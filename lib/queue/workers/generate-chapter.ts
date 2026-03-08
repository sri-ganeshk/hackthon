import { Worker, type Job } from 'bullmq';
import { getGeminiModel } from '@/lib/ai/gemini';
import { connectDB } from '@/lib/db/mongodb';
import NotebookChapter from '@/models/NotebookChapter';
import { logger } from '@/lib/logger';
import type { ChapterJobInput } from '@/types/ai';

const connection = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : { host: '127.0.0.1', port: 6379 };

/** BullMQ worker for generating notebook chapters using Gemini */
export const chapterWorker = new Worker(
  'generate-notebook-chapter',
  async (job: Job<ChapterJobInput>) => {
    const { userId, sourceText, topic } = job.data;
    logger.info({ jobId: job.id, topic }, 'Starting chapter generation');

    const model = getGeminiModel('gemini-1.5-flash');
    const prompt = `Generate a structured notebook chapter on the topic "${topic}" based on the following source material.
Output as JSON with this structure:
{
  "title": "Chapter Title",
  "sections": [
    { "heading": "Section Heading", "bullets": ["bullet point 1", "bullet point 2"] }
  ]
}

Source material:
${sourceText}`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    });

    const responseText = result.response.text();
    const parsed = JSON.parse(responseText) as { title: string; sections: Array<{ heading: string; bullets: string[] }> };

    await connectDB();
    const doc = await NotebookChapter.create({
      userId,
      topic,
      title: parsed.title,
      sections: parsed.sections,
    });

    logger.info({ jobId: job.id, docId: doc._id }, 'Chapter generation complete');
    return { id: doc._id };
  },
  { connection },
);
