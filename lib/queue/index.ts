import { Queue } from 'bullmq';
import { logger } from '@/lib/logger';

const connection = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : { host: '127.0.0.1', port: 6379 };

/** BullMQ queue for chapter generation jobs */
export const chapterQueue = new Queue('generate-notebook-chapter', {
  connection,
});

/** BullMQ queue for flashcard generation jobs */
export const flashcardQueue = new Queue('generate-flashcards', {
  connection,
});

/** BullMQ queue for audio overview generation jobs */
export const audioQueue = new Queue('generate-audio-overview', {
  connection,
});

/** BullMQ queue for PDF processing jobs */
export const pdfQueue = new Queue('process-pdf-for-rag', {
  connection,
});

logger.info('BullMQ queues initialized');
