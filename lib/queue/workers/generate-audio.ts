import { Worker, type Job } from 'bullmq';
import { getGeminiModel } from '@/lib/ai/gemini';
import { connectDB } from '@/lib/db/mongodb';
import AudioOverview from '@/models/AudioOverview';
import { getSupabaseStorage } from '@/lib/supabase/storage';
import { logger } from '@/lib/logger';
import type { AudioJobInput } from '@/types/ai';

const connection = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : { host: '127.0.0.1', port: 6379 };

/** BullMQ worker for generating audio overviews using Gemini + Google TTS */
export const audioWorker = new Worker(
  'generate-audio-overview',
  async (job: Job<AudioJobInput>) => {
    const { userId, sourceText, topic } = job.data;
    logger.info({ jobId: job.id, topic }, 'Starting audio overview generation');

    const model = getGeminiModel('gemini-1.5-flash');
    const prompt = `Generate a friendly, conversational audio script summarizing the following source material on the topic "${topic}".
The script should be suitable for text-to-speech conversion and should be engaging and easy to listen to.

Source material:
${sourceText}`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const script = result.response.text();

    const MAX_TTS_SCRIPT_LENGTH = 5000;
    let audioUrl = '';
    try {
      const ttsApiKey = process.env.GOOGLE_CLOUD_TTS_KEY;
      if (ttsApiKey) {
        const ttsResponse = await fetch(
          `https://texttospeech.googleapis.com/v1/text:synthesize?key=${ttsApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              input: { text: script.substring(0, MAX_TTS_SCRIPT_LENGTH) },
              voice: { languageCode: 'en-US', name: 'en-US-Casual-K' },
              audioConfig: { audioEncoding: 'MP3' },
            }),
          },
        );

        const ttsData = (await ttsResponse.json()) as { audioContent?: string };
        if (ttsData.audioContent) {
          const audioBuffer = Buffer.from(ttsData.audioContent, 'base64');
          const fileName = `audio-${userId}-${Date.now()}.mp3`;

          const supabase = getSupabaseStorage();
          const { error: uploadError } = await supabase.storage
            .from('audio-overviews')
            .upload(fileName, audioBuffer, { contentType: 'audio/mpeg' });

          if (uploadError) {
            logger.error({ error: uploadError }, 'Failed to upload audio to Supabase');
          } else {
            const { data: urlData } = supabase.storage
              .from('audio-overviews')
              .getPublicUrl(fileName);
            audioUrl = urlData?.publicUrl ?? '';
          }
        }
      }
    } catch (err) {
      logger.error({ error: err }, 'TTS generation failed');
    }

    await connectDB();
    const doc = await AudioOverview.create({
      userId,
      topic,
      script,
      audioUrl,
    });

    logger.info({ jobId: job.id, docId: doc._id }, 'Audio overview generation complete');
    return { id: doc._id };
  },
  { connection },
);
