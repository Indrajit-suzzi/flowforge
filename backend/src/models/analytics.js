import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
    tenantId: { type: String, required: true },
    endpoint: { type: String, required: true },
    method: { type: String, required: true },
    statusCode: { type: Number, required: true },
    apiKeyId: { type: String },
    responseTime: { type: Number, required: true },
    userAgent: { type: String },
    ip: { type: String }
}, { timestamps: true });

analyticsSchema.index({ tenantId: 1, createdAt: -1 });
analyticsSchema.index({ tenantId: 1, endpoint: 1 });
analyticsSchema.index({ tenantId: 1, method: 1, createdAt: -1 });
analyticsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 3600 });

const Analytics = mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);

export default Analytics;