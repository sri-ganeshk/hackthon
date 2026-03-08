import mongoose, { Schema } from 'mongoose';
import type { IResource } from '@/types/models';

const ResourceSchema = new Schema<IResource>(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    userId: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['processing', 'ready', 'failed'],
      default: 'processing',
    },
  },
  { collection: 'resources' },
);

export default mongoose.models.Resource ??
  mongoose.model<IResource>('Resource', ResourceSchema);
