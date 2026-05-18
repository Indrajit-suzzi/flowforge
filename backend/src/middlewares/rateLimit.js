const rateLimitStore = new Map();

const rateLimit = ({ windowMs = 60 * 1000, max = 100, keyGenerator = (req) => req.ip }) => {
    return async (req, res, next) => {
        const key = keyGenerator(req);
        const now = Date.now();
        
        if (!rateLimitStore.has(key)) {
            rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
            return next();
        }
        
        const record = rateLimitStore.get(key);
        
        if (now > record.resetTime) {
            rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
            return next();
        }
        
        if (record.count >= max) {
            res.setHeader('X-RateLimit-Limit', max);
            res.setHeader('X-RateLimit-Remaining', 0);
            res.setHeader('X-RateLimit-Reset', record.resetTime);
            return res.status(429).json({ error: 'Too many requests', retryAfter: Math.ceil((record.resetTime - now) / 1000) });
        }
        
        record.count++;
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', max - record.count);
        res.setHeader('X-RateLimit-Reset', record.resetTime);
        
        next();
    };
};

setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
        if (now > record.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 60 * 1000);

export default rateLimit;