import mongoose, { Schema } from 'mongoose';
import type { INotebookChapter } from '@/types/models';

const NotebookChapterSchema = new Schema<INotebookChapter>(
  {
    userId: { type: String, required: true },
    topic: { type: String, required: true },
    title: { type: String, required: true },
    sections: [
      {
        heading: { type: String, required: true },
        bullets: [{ type: String }],
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'notebookChapters' },
);

export default mongoose.models.NotebookChapter ??
  mongoose.model<INotebookChapter>('NotebookChapter', NotebookChapterSchema);
