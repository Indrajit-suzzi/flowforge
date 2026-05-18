import Analytics from '../models/analytics.js';

const analyticsMiddleware = async (req, res, next) => {
    const start = Date.now();
    
    const originalJson = res.json.bind(res);
    res.json = (body) => {
        const responseTime = Date.now() - start;
        
        Analytics.create({
            tenantId: req.tenant || req.user?.id,
            endpoint: req.originalUrl,
            method: req.method,
            statusCode: res.statusCode,
            apiKeyId: req.apiKeyId,
            responseTime,
            userAgent: req.headers['user-agent'],
            ip: req.ip || req.connection.remoteAddress
        }).catch(() => {});
        
        return originalJson(body);
    };
    
    next();
};

export default analyticsMiddleware;