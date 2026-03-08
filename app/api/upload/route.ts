import { NextResponse, type NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { getSupabaseStorage } from '@/lib/supabase/storage';
import Resource from '@/models/Resource';
import { getPdfQueue } from '@/lib/queue/index';
import { logger } from '@/lib/logger';

/** POST /api/upload - Upload PDF for RAG processing */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const userId = (formData.get('userId') as string) ?? 'anonymous';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const supabase = getSupabaseStorage();
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, fileBuffer, { contentType: file.type });

    if (uploadError) {
      logger.error({ error: uploadError }, 'Failed to upload to Supabase');
      return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName);
    const url = urlData?.publicUrl ?? '';

    await connectDB();
    const resource = await Resource.create({
      filename: file.name,
      url,
      userId,
      status: 'processing',
    });

    await getPdfQueue().add('process-pdf-for-rag', {
      resourceId: resource._id.toString(),
      url,
    });

    logger.info({ resourceId: resource._id, fileName }, 'PDF uploaded and queued for processing');

    return NextResponse.json({
      success: true,
      data: { resourceId: resource._id, url },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    logger.error({ error: err }, 'Upload failed');
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
