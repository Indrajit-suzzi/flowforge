import mongoose from 'mongoose';

const contentTypeSchema = new mongoose.Schema({
    tenantId: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    fields: [{
        name: { type: String, required: true },
        type: { type: String, enum: ['String', 'Number', 'Date', 'Boolean', 'RichText', 'Reference'], required: true },
        required: { type: Boolean, default: false },
        localizable: { type: Boolean, default: false },
        refContentType: { type: String },
        pattern: { type: String },
        patternMessage: { type: String },
        minLength: { type: Number },
        maxLength: { type: Number },
        min: { type: mongoose.Schema.Types.Mixed },
        max: { type: mongoose.Schema.Types.Mixed },
        defaultValue: { type: mongoose.Schema.Types.Mixed }
    }],
    locales: [{ type: String }],
    cacheTTL: { type: Number, default: 0, min: 0, max: 86400 },
    workflowEnabled: { type: Boolean, default: false },
    workflowStages: [{ name: String, color: { type: String, default: '#64748b' } }]
}, { timestamps: true });

// Ensure slug is unique per tenant
contentTypeSchema.index({ tenantId: 1, slug: 1 }, { unique: true });

const ContentType = mongoose.models.ContentType || mongoose.model('ContentType', contentTypeSchema);

export default ContentType;
