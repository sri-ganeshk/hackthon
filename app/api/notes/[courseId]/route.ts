import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectDB } from '@/lib/db/mongodb';
import CourseOutline from '@/models/CourseOutline';
import Note from '@/models/Note';
import { logger } from '@/lib/logger';

function extractJSONFromCodeBlock(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith('```json')) {
    const withoutStart = trimmed.substring(7);
    const withoutEnd = withoutStart.substring(0, withoutStart.lastIndexOf('```'));
    return withoutEnd.trim();
  }
  return text;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ courseId: string }> },
) {
  try {
    const { courseId } = await context.params;
    await connectDB();

    const course = await CourseOutline.findById(courseId).lean();
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 },
      );
    }

    const existingNote = await Note.findOne({ courseId }).lean();
    if (existingNote) {
      return NextResponse.json({ success: true, data: existingNote });
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
        You are provided with the following chapter details:
        
        Course Title: ${outline.courseTitle}
        Course Summary: ${outline.courseSummary}
        Chapters:
        ${outline.chapters
          .map(
            (chapter) => `
        Chapter: ${chapter.chapterTitle}
        Summary: ${chapter.chapterSummary}
        Topics: ${chapter.topics.join(', ')}
        `,
          )
          .join('\n')}
        
        For each chapter and for each topic in that chapter, generate a structured response according to these strict instructions:
        
        1. Output exactly a valid JSON array and nothing else.
        2. Each element of the JSON array must be an object with exactly two keys:
           - "chapter": a string representing the chapter title.
           - "articles": an array of article objects.
        3. Each article object must have exactly two keys:
           - "topic": a string representing the topic name.
           - "pages": an array of page objects.
        4. Each page object must have exactly three keys:
           - "pageNumber": an integer (starting at 1).
           - "title": a string that includes an HTML <h3> tag.
           - "content": a string that includes an HTML <h4> tag for a subheading followed by a <p> tag with a detailed explanation.
        
        Now, using the provided chapter details above, produce only the JSON array in your response, with no additional text or formatting.
    `.trim();

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY ?? '';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonString = extractJSONFromCodeBlock(responseText);

    let parsedChapterResponses: unknown;
    try {
      parsedChapterResponses = JSON.parse(jsonString);
    } catch (parseErr) {
      logger.error({ error: parseErr }, 'Failed to parse Gemini response JSON');
      throw new Error('Failed to parse Gemini response JSON');
    }

    const noteObject = {
      courseId,
      note: { chapters: parsedChapterResponses },
      generatedAt: new Date().toISOString(),
    };

    await Note.create(noteObject);

    return NextResponse.json({ success: true, data: noteObject });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
