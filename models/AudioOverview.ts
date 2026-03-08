import mongoose, { Schema } from 'mongoose';
import type { IAudioOverview } from '@/types/models';

const AudioOverviewSchema = new Schema<IAudioOverview>(
  {
    userId: { type: String, required: true },
    topic: { type: String, required: true },
    script: { type: String, required: true },
    audioUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'audioOverviews' },
);

export default mongoose.models.AudioOverview ??
  mongoose.model<IAudioOverview>('AudioOverview', AudioOverviewSchema);
