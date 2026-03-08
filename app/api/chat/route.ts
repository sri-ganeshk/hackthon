import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { retrieveRelevantChunks } from '@/lib/ai/rag';
import { logger } from '@/lib/logger';

/** POST /api/chat - AI chat with optional RAG context */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, resourceId } = body as {
      messages: Array<{ role: string; content: string }>;
      resourceId?: string;
    };

    let systemPrompt =
      "You are a helpful study assistant. Answer the user's questions clearly and concisely. When context is provided, base your answers on it and cite your sources.";

    let sources: Array<{ chunkIndex: number; text: string }> = [];

    if (resourceId && messages.length > 0) {
      const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
      if (lastUserMessage) {
        try {
          const chunks = await retrieveRelevantChunks(lastUserMessage.content, resourceId, 5);
          sources = chunks.map((c) => ({ chunkIndex: c.chunkIndex, text: c.text }));

          if (chunks.length > 0) {
            const context = chunks.map((c, i) => `[Source ${i + 1}]: ${c.text}`).join('\n\n');
            systemPrompt += `\n\nRelevant context from the document:\n${context}`;
          }
        } catch (ragErr) {
          logger.error({ error: ragErr }, 'RAG retrieval failed, proceeding without context');
        }
      }
    }

    const result = streamText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      })),
    });

    return result.toTextStreamResponse({
      headers: {
        'X-Sources': JSON.stringify(sources),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    logger.error({ error: err }, 'Chat failed');
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
