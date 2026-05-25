import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
    tenantId: { type: String, required: true },
    name: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'document', 'video', 'audio', 'other'], required: true },
    width: { type: Number },
    height: { type: Number },
    alt: { type: String }
}, { timestamps: true });

mediaSchema.index({ tenantId: 1, createdAt: -1 });
mediaSchema.index({ tenantId: 1, mimeType: 1 });
mediaSchema.index({ tenantId: 1, type: 1 });
mediaSchema.index({ tenantId: 1, name: 1 });

const Media = mongoose.models.Media || mongoose.model('Media', mediaSchema);

export default Media;