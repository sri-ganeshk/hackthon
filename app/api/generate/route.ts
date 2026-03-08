import { NextResponse, type NextRequest } from 'next/server';
import { GenerateRequestSchema } from '@/types/api';
import { getChapterQueue, getFlashcardQueue, getAudioQueue } from '@/lib/queue/index';
import { logger } from '@/lib/logger';

/** POST /api/generate - Enqueue AI generation jobs */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = GenerateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues.map((i) => i.message).join(', ') },
        { status: 400 },
      );
    }

    const { sourceText, topic, types } = parsed.data;
    const userId = 'anonymous'; // In production, extract from auth

    const jobIds: Record<string, string> = {};

    const promises = types.map(async (type) => {
      const jobData = { userId, sourceText, topic };
      switch (type) {
        case 'chapter': {
          const job = await getChapterQueue().add('generate-notebook-chapter', jobData);
          jobIds.chapter = job.id ?? '';
          break;
        }
        case 'flashcards': {
          const job = await getFlashcardQueue().add('generate-flashcards', jobData);
          jobIds.flashcards = job.id ?? '';
          break;
        }
        case 'audio': {
          const job = await getAudioQueue().add('generate-audio-overview', jobData);
          jobIds.audio = job.id ?? '';
          break;
        }
      }
    });

    await Promise.all(promises);

    logger.info({ jobIds }, 'Generation jobs enqueued');
    return NextResponse.json({ success: true, data: { jobIds } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    logger.error({ error: err }, 'Failed to enqueue generation jobs');
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
