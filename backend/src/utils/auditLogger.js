import AuditLog from '../models/auditLog.js';
import logger from './logger.js';

const SENSITIVE_FIELDS = new Set(['password', 'accessPassword', 'token', 'secret', 'credential']);

const sanitizeChanges = (data) => {
  if (!data || typeof data !== 'object') return data;
  const sanitized = Array.isArray(data) ? [...data] : { ...data };
  for (const key of Object.keys(sanitized)) {
    if (SENSITIVE_FIELDS.has(key) || key.endsWith('Password') || key.endsWith('Secret')) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeChanges(sanitized[key]);
    }
  }
  return sanitized;
};

export const logAudit = async ({ tenantId, userId, action, entityType, entityId, entityName, changes, ipAddress, userAgent }) => {
    try {
        await AuditLog.create({
            tenantId,
            userId,
            action,
            entityType,
            entityId,
            entityName,
            changes: sanitizeChanges(changes),
            ipAddress,
            userAgent
        });
    } catch (err) {
        logger.error({ err }, 'Audit log error');
    }
};