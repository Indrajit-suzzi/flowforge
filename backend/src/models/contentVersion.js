import mongoose from 'mongoose';

const contentVersionSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  contentTypeSlug: { type: String, required: true },
  contentTypeName: { type: String, required: true },
  entryId: { type: mongoose.Schema.Types.ObjectId, required: true },
  version: { type: Number, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  createdBy: { type: String },
  changeDescription: { type: String, default: '' }
}, { timestamps: true });

contentVersionSchema.index({ tenantId: 1, entryId: 1, version: -1 });

const ContentVersion = mongoose.models.ContentVersion || mongoose.model('ContentVersion', contentVersionSchema);
export default ContentVersion;
