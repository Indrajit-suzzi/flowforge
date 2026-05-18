import mongoose from 'mongoose';

const contentTypeSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    fields: [{
        name: { type: String, required: true },
        type: { type: String, enum: ['String', 'Number', 'Date', 'Boolean', 'RichText'], required: true },
        required: { type: Boolean, default: false }
    }]
}, { timestamps: true });

// Ensure slug is unique per tenant
contentTypeSchema.index({ tenantId: 1, slug: 1 }, { unique: true });

const ContentType = mongoose.models.ContentType || mongoose.model('ContentType', contentTypeSchema);

export default ContentType;
