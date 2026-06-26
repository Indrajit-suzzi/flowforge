import Analytics from '../models/analytics.js';

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

        const tid = String(tenantId);
        const match = { tenantId: tid, createdAt: { $gte: startDate } };
        const [
          totalRequests,
          successfulRequests,
          failedRequests,
          avgResponseTime,
          requestsByDay,
          requestsByEndpoint,
          requestsByMethod,
          recentRequests,
        ] = await Promise.all([
          Analytics.countDocuments(match),
          Analytics.countDocuments({ ...match, statusCode: { $gte: 200, $lt: 400 } }),
          Analytics.countDocuments({ ...match, statusCode: { $gte: 400 } }),
          Analytics.aggregate([
            { $match: match },
            { $group: { _id: null, avg: { $avg: '$responseTime' } } },
          ]),
          Analytics.aggregate([
            { $match: match },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ]),
          Analytics.aggregate([
            { $match: match },
            { $group: { _id: '$endpoint', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ]),
          Analytics.aggregate([
            { $match: match },
            { $group: { _id: '$method', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ]),
          Analytics.find({ tenantId: tid })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('apiKeyId', 'name')
            .lean(),
        ]);

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

        const tid = String(tenantId);
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
