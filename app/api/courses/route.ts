import { NextResponse, type NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import CourseOutline from '@/models/CourseOutline';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Missing email query parameter' },
        { status: 400 },
      );
    }

    await connectDB();
    const courses = await CourseOutline.find({ email }).lean();

    return NextResponse.json({ success: true, data: courses });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
