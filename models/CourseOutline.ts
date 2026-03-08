import mongoose, { Schema } from 'mongoose';
import type { ICourseOutline } from '@/types/models';

const CourseOutlineSchema = new Schema<ICourseOutline>(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true },
    courseType: { type: String, required: true },
    difficultyLevel: { type: String, required: true },
    outline: { type: Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'courseOutlines' },
);

export default mongoose.models.CourseOutline ??
  mongoose.model<ICourseOutline>('CourseOutline', CourseOutlineSchema);
