import Analytics from '../models/analytics.js';
import mongoose from 'mongoose';

export const getAnalytics = async (req, res) => {
    try {
        const tenantId = req.tenant;
        const { period = '7d' } = req.query;

        const now = new Date();
        let startDate;
        switch (period) {
            case '24h': startDate = new Date(now - 24 * 60 * 60 * 1000); break;
            case '7d': startDate = new Date(now - 7 * 24 * 60 * 60 * 1000); break;
            case '30d': startDate = new Date(now - 30 * 24 * 60 * 60 * 1000); break;
            case '90d': startDate = new Date(now - 90 * 24 * 60 * 60 * 1000); break;
            default: startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        }

        const isValidId = mongoose.Types.ObjectId.isValid(String(tenantId));
        const tid = isValidId ? new mongoose.Types.ObjectId(String(tenantId)) : tenantId;
        const totalRequests = await Analytics.countDocuments({ tenantId: tid, createdAt: { $gte: startDate } });
        const successfulRequests = await Analytics.countDocuments({ tenantId: tid, statusCode: { $gte: 200, $lt: 400 }, createdAt: { $gte: startDate } });
        const failedRequests = await Analytics.countDocuments({ tenantId: tid, statusCode: { $gte: 400 }, createdAt: { $gte: startDate } });
        const avgResponseTime = await Analytics.aggregate([
            { $match: { tenantId: tid, createdAt: { $gte: startDate } } },
            { $group: { _id: null, avg: { $avg: '$responseTime' } } }
        ]);

        const requestsByDay = await Analytics.aggregate([
            { $match: { tenantId: tid, createdAt: { $gte: startDate } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const requestsByEndpoint = await Analytics.aggregate([
            { $match: { tenantId: tid, createdAt: { $gte: startDate } } },
            { $group: { _id: '$endpoint', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        const requestsByMethod = await Analytics.aggregate([
            { $match: { tenantId: tid, createdAt: { $gte: startDate } } },
            { $group: { _id: '$method', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const recentRequests = await Analytics.find({ tenantId })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('apiKeyId', 'name');

        res.json({
            totalRequests,
            successfulRequests,
            failedRequests,
            avgResponseTime: avgResponseTime[0]?.avg || 0,
            requestsByDay,
            requestsByEndpoint,
            requestsByMethod,
            recentRequests
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getTopEndpoints = async (req, res) => {
    try {
        const tenantId = req.tenant;
        const { period = '7d' } = req.query;

        const now = new Date();
        let startDate;
        switch (period) {
            case '24h': startDate = new Date(now - 24 * 60 * 60 * 1000); break;
            case '7d': startDate = new Date(now - 7 * 24 * 60 * 60 * 1000); break;
            case '30d': startDate = new Date(now - 30 * 24 * 60 * 60 * 1000); break;
            default: startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        }

        const isValidId = mongoose.Types.ObjectId.isValid(String(tenantId));
        const tid = isValidId ? new mongoose.Types.ObjectId(String(tenantId)) : tenantId;
        const topEndpoints = await Analytics.aggregate([
            { $match: { tenantId: tid, createdAt: { $gte: startDate } } },
            { $group: { _id: '$endpoint', count: { $sum: 1 }, avgResponseTime: { $avg: '$responseTime' } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        res.json(topEndpoints);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};