import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseStorage } from '@/lib/supabase/storage';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '@/lib/logger';

export const config = {
  api: { bodyParser: false },
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const msg = formData.get('msg') as string | null;
    const pdfFiles = formData.getAll('pdfFiles');
    const courseType = formData.get('courseType') as string | null;
    const difficultyLevel = formData.get('difficultyLevel') as string | null;
    const userName = formData.get('userName') as string | null;

    const supabase = getSupabaseStorage();

    const processFile = async (pdfFile: FormDataEntryValue) => {
      if (typeof pdfFile === 'string') throw new Error('Invalid file');
      const fileBuffer = Buffer.from(await pdfFile.arrayBuffer());
      const fileName = `${Date.now()}-${pdfFile.name}`;

      const { error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(fileName, fileBuffer, { contentType: pdfFile.type });

      if (uploadError) {
        logger.error({ error: uploadError }, 'Error uploading to Supabase');
        throw new Error('Error uploading file to Supabase');
      }

      const { data: urlData } = supabase.storage
        .from('pdfs')
        .getPublicUrl(fileName);

      return { publicURL: urlData?.publicUrl, fileName };
    };

    const publicUrlsArray = await Promise.all(
      Array.from(pdfFiles).map((pdfFile) => processFile(pdfFile)),
    );

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY ?? '';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });

    async function remotePdfToPart(url: string) {
      const pdfBuffer = await fetch(url).then((response) => response.arrayBuffer());
      return {
        inlineData: {
          data: Buffer.from(pdfBuffer).toString('base64'),
          mimeType: 'application/pdf',
        },
      };
    }

    const parts = await Promise.all(
      publicUrlsArray.map(({ publicURL }) => remotePdfToPart(publicURL)),
    );

    const promptText = `Please analyze the content of the provided PDFs and generate a natural, back-and-forth conversation between two individuals: one male and one female. Output the final conversation in JSON format with each turn as an object with "speaker" and "message" fields.`;

    const result = await model.generateContent([...parts, promptText]);
    let extractedText = result.response.text();
    extractedText = extractedText.replace('```json', '').replace('```', '');
    const parsed = JSON.parse(extractedText) as unknown;

    return NextResponse.json({ success: true, data: parsed });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    logger.error({ error: err }, 'Sound generation failed');
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
