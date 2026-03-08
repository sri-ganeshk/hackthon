import mongoose, { Schema } from 'mongoose';
import type { INote } from '@/types/models';

const NoteSchema = new Schema<INote>(
  {
    courseId: { type: String, required: true, index: true },
    note: { type: Schema.Types.Mixed, required: true },
    generatedAt: { type: String },
  },
  { collection: 'notes' },
);

export default mongoose.models.Note ??
  mongoose.model<INote>('Note', NoteSchema);
