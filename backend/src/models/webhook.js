import mongoose from 'mongoose';

const webhookSchema = new mongoose.Schema({
    tenantId: { type: String, required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    events: [{ type: String, enum: ['content.create', 'content.update', 'content.delete', 'content.publish', 'content.unpublish'] }],
    contentType: { type: String },
    secret: { type: String, select: false },
    isActive: { type: Boolean, default: true },
    conditions: [{
      field: { type: String },
      operator: { type: String, enum: ['equals', 'not_equals', 'contains', 'exists', 'not_exists'], default: 'equals' },
      value: { type: String }
    }],
    maxRetries: { type: Number, default: 3, min: 0, max: 10 },
    retryDelayMs: { type: Number, default: 5000, min: 1000, max: 300000 },
    lastTriggered: { type: Date },
    lastStatus: { type: Number },
    secretLastRotated: { type: Date }
}, { timestamps: true });

webhookSchema.index({ tenantId: 1, isActive: 1 });
webhookSchema.index({ tenantId: 1, events: 1, isActive: 1 });

const Webhook = mongoose.models.Webhook || mongoose.model('Webhook', webhookSchema);

export default Webhook;