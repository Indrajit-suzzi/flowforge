import mongoose from 'mongoose';

const keyUsageSchema = new mongoose.Schema({
  keyId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiKey', required: true },
  tenantId: { type: String, required: true },
  method: { type: String },
  path: { type: String },
  statusCode: { type: Number },
  timestamp: { type: Date, default: Date.now }
});

keyUsageSchema.index({ keyId: 1, timestamp: -1 });
keyUsageSchema.index({ tenantId: 1, timestamp: -1 });

const KeyUsage = mongoose.models.KeyUsage || mongoose.model('KeyUsage', keyUsageSchema);
export default KeyUsage;
