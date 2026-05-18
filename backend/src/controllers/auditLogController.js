import AuditLog from '../models/auditLog.js';
import mongoose from 'mongoose';

export const getAuditLogs = async (req, res) => {
    try {
        const tenantId = req.tenantId;
        const { page = 1, limit = 50, action, entityType } = req.query;

        const filter = { tenantId: new mongoose.Types.ObjectId(tenantId) };
        if (action) filter.action = action;
        if (entityType) filter.entityType = entityType;

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