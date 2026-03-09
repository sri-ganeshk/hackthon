import { NextResponse, type NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { getSupabaseStorage } from '@/lib/supabase/storage';
import { courseOutlineAIModel } from '@/configs/AiModel';
import { GoogleGenerativeAI } from '@google/generative-ai';
import CourseOutline from '@/models/CourseOutline';
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
    const email = formData.get('email') as string | null;

    if (!msg || !userName || !courseType || !difficultyLevel || !email || pdfFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 },
      );
    }

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

      const publicURL = urlData?.publicUrl;
      return { publicURL, fileName };
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

    const promptText =
      'Please analyze the following PDFS content and extract a comprehensive list of topics, keywords, and key subtopics related to the subject matter. Additionally, identify any important names, dates, or references mentioned in the document. Your output should include: 1. A list of main topics. 2. A set of associated keywords for each topic. 3. Any notable subtopics or details that could help in understanding the overall subject.';

    const result = await model.generateContent([...parts, promptText]);
    const extractedText = result.response.text();

    const PROMPT = `
      generate a study material for '${msg + extractedText}' for '${courseType}' 
      and level of Difficulty will be '${difficultyLevel}' 
      with course title, summary of course, List of chapters along with the summary and Emoji icon for each chapter, 
      Topic list in each chapter in JSON format
    `;

    const aiResp = await courseOutlineAIModel.sendMessage(PROMPT);
    const aiResult = JSON.parse(aiResp.response.text()) as Record<string, unknown>;

    await connectDB();
    const doc = await CourseOutline.create({
      userName,
      email,
      courseType,
      difficultyLevel,
      outline: aiResult,
    });

    return NextResponse.json({ success: true, data: { insertedId: doc._id } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    logger.error({ error: err }, 'Course outline generation failed');
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
