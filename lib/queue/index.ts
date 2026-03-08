import { Queue } from 'bullmq';

function getConnection() {
  return process.env.REDIS_URL ? { url: process.env.REDIS_URL } : { host: '127.0.0.1', port: 6379 };
}

let _chapterQueue: Queue | null = null;
let _flashcardQueue: Queue | null = null;
let _audioQueue: Queue | null = null;
let _pdfQueue: Queue | null = null;

/** BullMQ queue for chapter generation jobs */
export function getChapterQueue(): Queue {
  if (!_chapterQueue) {
    _chapterQueue = new Queue('generate-notebook-chapter', { connection: getConnection() });
  }
  return _chapterQueue;
}

/** BullMQ queue for flashcard generation jobs */
export function getFlashcardQueue(): Queue {
  if (!_flashcardQueue) {
    _flashcardQueue = new Queue('generate-flashcards', { connection: getConnection() });
  }
  return _flashcardQueue;
}

/** BullMQ queue for audio overview generation jobs */
export function getAudioQueue(): Queue {
  if (!_audioQueue) {
    _audioQueue = new Queue('generate-audio-overview', { connection: getConnection() });
  }
  return _audioQueue;
}

/** BullMQ queue for PDF processing jobs */
export function getPdfQueue(): Queue {
  if (!_pdfQueue) {
    _pdfQueue = new Queue('process-pdf-for-rag', { connection: getConnection() });
  }
  return _pdfQueue;
}
