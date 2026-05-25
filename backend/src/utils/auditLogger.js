import AuditLog from '../models/auditLog.js';
import logger from './logger.js';

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
        logger.error({ err }, 'Audit log error');
    }
};