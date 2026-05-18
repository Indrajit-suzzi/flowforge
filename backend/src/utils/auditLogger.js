import AuditLog from '../models/auditLog.js';

export const logAudit = async ({ tenantId, userId, action, entityType, entityId, entityName, changes, ipAddress, userAgent }) => {
    try {
        await AuditLog.create({
            tenantId,
            userId,
            action,
            entityType,
            entityId,
            entityName,
            changes,
            ipAddress,
            userAgent
        });
    } catch (err) {
        console.error('Audit log error:', err.message);
    }
};