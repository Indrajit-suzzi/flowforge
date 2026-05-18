import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, enum: ['create', 'update', 'delete', 'login', 'logout', 'create_key', 'delete_key'], required: true },
    entityType: { type: String, enum: ['contentType', 'entry', 'apiKey', 'user'], required: true },
    entityId: { type: String },
    entityName: { type: String },
    changes: { type: Map, of: mongoose.Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String }
}, { timestamps: true });

auditLogSchema.index({ tenantId: 1, createdAt: -1 });
auditLogSchema.index({ tenantId: 1, action: 1 });

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;