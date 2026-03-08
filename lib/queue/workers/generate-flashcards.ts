import { Worker, type Job } from 'bullmq';
import { getGeminiModel } from '@/lib/ai/gemini';
import { connectDB } from '@/lib/db/mongodb';
import Flashcard from '@/models/Flashcard';
import { logger } from '@/lib/logger';
import type { FlashcardJobInput } from '@/types/ai';

const connection = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : { host: '127.0.0.1', port: 6379 };

/** BullMQ worker for generating flashcards using Gemini */
export const flashcardWorker = new Worker(
  'generate-flashcards',
  async (job: Job<FlashcardJobInput>) => {
    const { userId, sourceText, topic } = job.data;
    logger.info({ jobId: job.id, topic }, 'Starting flashcard generation');

    const model = getGeminiModel('gemini-1.5-flash');
    const prompt = `Generate an array of flashcard objects for the topic "${topic}" based on the following source material.
Output as a JSON array where each element has "question" and "answer" keys.

Source material:
${sourceText}`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    });

    const responseText = result.response.text();
    const cards = JSON.parse(responseText) as Array<{ question: string; answer: string }>;

    await connectDB();
    const doc = await Flashcard.create({ userId, topic, cards });

    logger.info({ jobId: job.id, docId: doc._id }, 'Flashcard generation complete');
    return { id: doc._id };
  },
  { connection },
);
