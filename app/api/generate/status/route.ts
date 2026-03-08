import { NextResponse, type NextRequest } from 'next/server';
import { chapterQueue, flashcardQueue, audioQueue } from '@/lib/queue/index';
import { logger } from '@/lib/logger';

/** GET /api/generate/status?jobId=<id>&type=<chapter|flashcards|audio> */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const type = searchParams.get('type');

    if (!jobId || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing jobId or type query parameter' },
        { status: 400 },
      );
    }

    let queue;
    switch (type) {
      case 'chapter':
        queue = chapterQueue;
        break;
      case 'flashcards':
        queue = flashcardQueue;
        break;
      case 'audio':
        queue = audioQueue;
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type parameter' },
          { status: 400 },
        );
    }

    const job = await queue.getJob(jobId);
    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 },
      );
    }

    const state = await job.getState();
    const result = job.returnvalue as unknown;
    const failedReason = job.failedReason;

    return NextResponse.json({
      success: true,
      data: {
        status: state,
        result: state === 'completed' ? result : undefined,
        error: state === 'failed' ? failedReason : undefined,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    logger.error({ error: err }, 'Failed to get job status');
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
