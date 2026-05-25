import mongoose from 'mongoose';

const entryCommentSchema = new mongoose.Schema({
    entryId: { type: mongoose.Schema.Types.ObjectId, required: true },
    contentTypeSlug: { type: String, required: true },
    tenantId: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, default: 'Unknown' },
    body: { type: String, required: true },
    parentCommentId: { type: mongoose.Schema.Types.ObjectId, default: null }
}, { timestamps: true });

entryCommentSchema.index({ entryId: 1, tenantId: 1, createdAt: -1 });

const EntryComment = mongoose.models.EntryComment || mongoose.model('EntryComment', entryCommentSchema);

export default EntryComment;
