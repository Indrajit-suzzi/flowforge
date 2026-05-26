import mongoose from 'mongoose';

const entryLockSchema = new mongoose.Schema({
    entryId: { type: mongoose.Schema.Types.ObjectId, required: true },
    contentTypeSlug: { type: String, required: true },
    tenantId: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, default: 'Unknown' },
    lockedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 15 * 60 * 1000) }
}, { timestamps: true });

entryLockSchema.index({ entryId: 1, tenantId: 1 }, { unique: true });
entryLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
entryLockSchema.index({ tenantId: 1, contentTypeSlug: 1 });

const EntryLock = mongoose.models.EntryLock || mongoose.model('EntryLock', entryLockSchema);

export default EntryLock;
