import mongoose from 'mongoose';

const apiKeySchema = new mongoose.Schema({
    tenantId: { type: String, required: true },
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    keyHash: { type: String, default: '' },
    keyPreview: { type: String, required: true },
    scopes: [{
        contentType: { type: String, required: true },
        permissions: [{ type: String, enum: ['read', 'write', 'delete'] }]
    }],
    isActive: { type: Boolean, default: true },
    rateLimit: {
      maxRequests: { type: Number, default: 100, min: 1, max: 100000 },
      windowMs: { type: Number, default: 60000, min: 1000, max: 3600000 }
    }
}, { timestamps: true });

apiKeySchema.index({ tenantId: 1 });
apiKeySchema.index({ keyHash: 1 });

const ApiKey = mongoose.models.ApiKey || mongoose.model('ApiKey', apiKeySchema);

export default ApiKey;
