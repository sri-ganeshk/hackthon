import mongoose, { Schema } from 'mongoose';
import type { IDocumentChunk } from '@/types/models';

const DocumentChunkSchema = new Schema<IDocumentChunk>(
  {
    resourceId: { type: Schema.Types.ObjectId, ref: 'Resource', required: true, index: true },
    chunkIndex: { type: Number, required: true },
    text: { type: String, required: true },
    embedding: { type: [Number], required: true },
    metadata: {
      filename: { type: String, required: true },
      pageEstimate: { type: Number },
    },
  },
  { collection: 'documentChunks' },
);

export default mongoose.models.DocumentChunk ??
  mongoose.model<IDocumentChunk>('DocumentChunk', DocumentChunkSchema);
