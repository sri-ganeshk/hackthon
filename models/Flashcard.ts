import mongoose, { Schema } from 'mongoose';
import type { IFlashcard } from '@/types/models';

const FlashcardSchema = new Schema<IFlashcard>(
  {
    userId: { type: String, required: true },
    topic: { type: String, required: true },
    cards: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'flashcards' },
);

export default mongoose.models.Flashcard ??
  mongoose.model<IFlashcard>('Flashcard', FlashcardSchema);
