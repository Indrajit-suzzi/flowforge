import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
    tenantId: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    color: { type: String, default: '#8b5cf6' }
}, { timestamps: true });

tagSchema.index({ tenantId: 1, slug: 1 }, { unique: true });

const Tag = mongoose.models.Tag || mongoose.model('Tag', tagSchema);

export default Tag;
