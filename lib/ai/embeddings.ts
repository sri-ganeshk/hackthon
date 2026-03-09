import { getGeminiClient } from '@/lib/ai/gemini';
import type { TaskType } from '@google/generative-ai';

/** Generate an embedding for the given text using Gemini text-embedding-004 */
export async function generateEmbedding(
  text: string,
  taskType: TaskType = 'RETRIEVAL_DOCUMENT' as TaskType,
): Promise<number[]> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  const result = await model.embedContent({
    content: { parts: [{ text }], role: 'user' },
    taskType,
  });
  return result.embedding.values;
}
