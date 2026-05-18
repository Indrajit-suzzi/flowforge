import mongoose from 'mongoose';

const webhookSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    events: [{ type: String, enum: ['content.create', 'content.update', 'content.delete', 'content.publish', 'content.unpublish'] }],
    contentType: { type: String },
    secret: { type: String },
    isActive: { type: Boolean, default: true },
    lastTriggered: { type: Date },
    lastStatus: { type: Number }
}, { timestamps: true });

webhookSchema.index({ tenantId: 1, isActive: 1 });

const Webhook = mongoose.models.Webhook || mongoose.model('Webhook', webhookSchema);

export default Webhook;