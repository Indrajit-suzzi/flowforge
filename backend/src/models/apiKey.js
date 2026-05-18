import mongoose from 'mongoose';

const apiKeySchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    keyPreview: { type: String, required: true },
    scopes: [{
        contentType: { type: String, required: true },
        permissions: [{ type: String, enum: ['read', 'write', 'delete'] }]
    }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

apiKeySchema.index({ tenantId: 1 });

const ApiKey = mongoose.models.ApiKey || mongoose.model('ApiKey', apiKeySchema);

export default ApiKey;
