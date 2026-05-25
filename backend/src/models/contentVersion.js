import mongoose from 'mongoose';

const contentVersionSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  contentTypeSlug: { type: String, required: true },
  contentTypeName: { type: String, required: true },
  entryId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  version: { type: Number, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  createdBy: { type: String },
  changeDescription: { type: String, default: '' }
}, { timestamps: true });

contentVersionSchema.index({ tenantId: 1, entryId: 1, version: -1 });

export default mongoose.model('ContentVersion', contentVersionSchema);
