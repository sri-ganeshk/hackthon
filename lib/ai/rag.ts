import { generateEmbedding } from '@/lib/ai/embeddings';
import { connectDB } from '@/lib/db/mongodb';
import DocumentChunk from '@/models/DocumentChunk';
import type { RagChunk } from '@/types/ai';
import type { TaskType } from '@google/generative-ai';

/** Retrieve relevant document chunks using MongoDB Atlas vector search */
export async function retrieveRelevantChunks(
  query: string,
  resourceId: string,
  topK = 5,
): Promise<RagChunk[]> {
  await connectDB();

  const queryEmbedding = await generateEmbedding(
    query,
    'RETRIEVAL_QUERY' as TaskType,
  );

  const results = await DocumentChunk.aggregate([
    {
      $vectorSearch: {
        index: 'vector_index',
        path: 'embedding',
        queryVector: queryEmbedding,
        numCandidates: topK * 10,
        limit: topK,
        filter: { resourceId },
      },
    },
    {
      $project: {
        chunkIndex: 1,
        text: 1,
        score: { $meta: 'vectorSearchScore' },
      },
    },
  ]);

  return results.map((r: { chunkIndex: number; text: string; score: number }) => ({
    chunkIndex: r.chunkIndex,
    text: r.text,
    score: r.score,
  }));
}
