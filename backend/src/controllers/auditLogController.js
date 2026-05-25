import AuditLog from '../models/auditLog.js';
import mongoose from 'mongoose';

export const getAuditLogs = async (req, res) => {
    try {
        const tenantId = req.tenantId || req.tenant;
        const { page = 1, limit = 50, action, entityType, userId } = req.query;

        const filter = { tenantId: new mongoose.Types.ObjectId(tenantId) };
        if (action) filter.action = action;
        if (entityType) filter.entityType = entityType;
        if (userId) filter.userId = userId;

        const logs = await AuditLog.find(filter)
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        const total = await AuditLog.countDocuments(filter);

        res.json({ logs, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const exportAuditLogsCSV = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const filter = { tenantId: new mongoose.Types.ObjectId(tenantId) };
    if (req.query.action) filter.action = req.query.action;
    if (req.query.entityType) filter.entityType = req.query.entityType;

    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).lean();

    const headers = ['Timestamp', 'User ID', 'Action', 'Entity Type', 'Entity ID', 'Entity Name', 'IP Address', 'User Agent', 'Changes'];
    const rows = logs.map(l => [
      new Date(l.createdAt).toISOString(),
      l.userId || '',
      l.action,
      l.entityType,
      l.entityId,
      l.entityName || '',
      l.ipAddress || '',
      `"${(l.userAgent || '').replace(/"/g, '""')}"`,
      `"${JSON.stringify(l.changes || {}).replace(/"/g, '""')}"`
    ]);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');
    res.status(200).send([headers.join(','), ...rows.map(r => r.join(','))].join('\n'));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAuditStats = async (req, res) => {
    try {
        const tenantId = req.tenantId;

        const stats = await AuditLog.aggregate([
            { $match: { tenantId: new mongoose.Types.ObjectId(tenantId) } },
            { $group: { _id: '$action', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};