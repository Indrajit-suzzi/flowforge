import mongoose from 'mongoose';

const webhookLogSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  webhookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Webhook', required: true },
  webhookName: { type: String },
  webhookUrl: { type: String },
  event: { type: String, required: true },
  contentType: { type: String },
  status: { type: String, enum: ['success', 'failed'], required: true },
  responseCode: { type: Number },
  responseBody: { type: String, maxlength: 5000 },
  duration: { type: Number },
  error: { type: String },
  payload: { type: String, maxlength: 10000 },
  attempt: { type: Number, default: 1 },
  retryOf: { type: mongoose.Schema.Types.ObjectId, ref: 'WebhookLog', default: null }
}, { timestamps: true });

webhookLogSchema.index({ tenantId: 1, webhookId: 1, createdAt: -1 });
webhookLogSchema.index({ tenantId: 1, event: 1 });

const WebhookLog = mongoose.models.WebhookLog || mongoose.model('WebhookLog', webhookLogSchema);
export default WebhookLog;
