import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import CourseOutline from '@/models/CourseOutline';

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

    return NextResponse.json({ success: true, data: course });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
