import AuditLog from '../models/auditLog.js';

export const getAuditLogs = async (req, res) => {
    try {
        const tenantId = req.tenantId || req.tenant;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
        const { action, entityType, userId } = req.query;

        const filter = { tenantId: String(tenantId) };
        if (action && typeof action === 'string' && !action.startsWith('$')) filter.action = action;
        if (entityType && typeof entityType === 'string' && !entityType.startsWith('$')) filter.entityType = entityType;
        if (userId && typeof userId === 'string' && !userId.startsWith('$')) filter.userId = userId;

        const [logs, total] = await Promise.all([
          AuditLog.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
          AuditLog.countDocuments(filter),
        ]);

        res.json({ logs, total, page, totalPages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const exportAuditLogsCSV = async (req, res) => {
  try {
    const tenantId = req.tenantId || req.tenant;
    const filter = { tenantId: String(tenantId) };
    if (req.query.action && typeof req.query.action === 'string' && !req.query.action.startsWith('$')) filter.action = req.query.action;
    if (req.query.entityType && typeof req.query.entityType === 'string' && !req.query.entityType.startsWith('$')) filter.entityType = req.query.entityType;

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
        const tenantId = req.tenantId || req.tenant;

        const stats = await AuditLog.aggregate([
            { $match: { tenantId: String(tenantId) } },
            { $group: { _id: '$action', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
