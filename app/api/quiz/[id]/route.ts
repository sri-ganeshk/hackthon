import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectDB } from '@/lib/db/mongodb';
import CourseOutline from '@/models/CourseOutline';

function extractJSONFromCodeBlock(text: string): string {
  const regex = /```json\s*([\s\S]*?)\s*```/;
  const match = text.match(regex);
  return match ? match[1] : text;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    await connectDB();

    const course = await CourseOutline.findById(id).lean();
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 },
      );
    }

    const outline = course.outline as {
      courseTitle?: string;
      courseSummary?: string;
      chapters: Array<{
        chapterTitle: string;
        chapterSummary: string;
        topics: string[];
      }>;
    };

    const prompt = `
You are provided with a course outline and details below. Your task is to generate a set of quiz questions that test understanding of the course content.

Course Title: ${outline.courseTitle}
Course Summary: ${outline.courseSummary}
Chapters and Topics:
${outline.chapters
  .map(
    (chapter) => `
Chapter: ${chapter.chapterTitle}
Summary: ${chapter.chapterSummary}
Topics: ${chapter.topics.join(', ')}
`,
  )
  .join('\n')}

Please generate quiz questions as a JSON array. Each quiz question should be an object with the following keys:
- "question": The quiz question text.
- "options": An array of possible answer options.
- "correctAnswer": The correct answer from the options.
    `.trim();

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY ?? '';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonString = extractJSONFromCodeBlock(responseText);
    const quizQuestions = JSON.parse(jsonString) as unknown;

    return NextResponse.json({ success: true, data: { quizQuestions } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
