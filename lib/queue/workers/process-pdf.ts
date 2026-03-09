import { Worker, type Job } from 'bullmq';
import { generateEmbedding } from '@/lib/ai/embeddings';
import { connectDB } from '@/lib/db/mongodb';
import DocumentChunk from '@/models/DocumentChunk';
import Resource from '@/models/Resource';
import { logger } from '@/lib/logger';
import type { PdfJobInput } from '@/types/ai';
import type { TaskType } from '@google/generative-ai';
import * as pdfParseModule from 'pdf-parse';

const pdfParse = pdfParseModule as unknown as (
  buffer: Buffer,
) => Promise<{ text: string; numpages: number }>;

const connection = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : { host: '127.0.0.1', port: 6379 };

/** Split text into chunks of ~500 tokens with 50-token overlap */
function splitIntoChunks(text: string, chunkSize = 500, overlap = 50): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    chunks.push(words.slice(start, end).join(' '));
    start += chunkSize - overlap;
  }

  return chunks;
}

/** BullMQ worker for processing PDFs for RAG */
export const pdfWorker = new Worker(
  'process-pdf-for-rag',
  async (job: Job<PdfJobInput>) => {
    const { resourceId, url } = job.data;
    logger.info({ jobId: job.id, resourceId }, 'Starting PDF processing');

    await connectDB();

    try {
      const pdfResponse = await fetch(url);
      const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());

      const pdfData = await pdfParse(pdfBuffer);
      const fullText = pdfData.text;

      const chunks = splitIntoChunks(fullText);
      const resource = await Resource.findById(resourceId);
      if (!resource) {
        throw new Error(`Resource ${resourceId} not found`);
      }

      for (let i = 0; i < chunks.length; i++) {
        const embedding = await generateEmbedding(chunks[i], 'RETRIEVAL_DOCUMENT' as TaskType);
        await DocumentChunk.create({
          resourceId: resource._id,
          chunkIndex: i,
          text: chunks[i],
          embedding,
          metadata: {
            filename: resource.filename,
            pageEstimate: Math.floor((i * pdfData.numpages) / chunks.length) + 1,
          },
        });
        await job.updateProgress(Math.round(((i + 1) / chunks.length) * 100));
      }

      resource.status = 'ready';
      await resource.save();

      logger.info({ jobId: job.id, resourceId, chunks: chunks.length }, 'PDF processing complete');
      return { resourceId, chunksCreated: chunks.length };
    } catch (err) {
      await Resource.findByIdAndUpdate(resourceId, { status: 'failed' });
      throw err;
    }
  },
  { connection },
);
