import KeyUsage from '../models/keyUsage.js';
import logger from '../utils/logger.js';

const keyStore = new Map();

export const getKeyRateUsage = (apiKeyId) => {
  const record = keyStore.get(apiKeyId.toString());
  if (!record) return { used: 0, limit: 100, remaining: 100, resetsIn: 0 };
  const now = Date.now();
  if (now > record.resetTime) return { used: 0, limit: record.max, remaining: record.max, resetsIn: 0 };
  return {
    used: record.count,
    limit: record.max,
    remaining: record.max - record.count,
    resetsIn: Math.ceil((record.resetTime - now) / 1000)
  };
};

const keyRateLimit = () => {
  return (req, res, next) => {
    if (!req.apiKey) return next();

    const apiKeyId = req.apiKey._id.toString();
    const max = req.apiKey.rateLimit?.maxRequests || 100;
    const windowMs = req.apiKey.rateLimit?.windowMs || 60000;
    const now = Date.now();

    if (!keyStore.has(apiKeyId)) {
      keyStore.set(apiKeyId, { count: 1, max, resetTime: now + windowMs });
    } else {
      const record = keyStore.get(apiKeyId);
      if (now > record.resetTime) {
        keyStore.set(apiKeyId, { count: 1, max, resetTime: now + windowMs });
      } else {
        if (record.count >= max) {
          res.setHeader('X-RateLimit-Limit', max);
          res.setHeader('X-RateLimit-Remaining', 0);
          res.setHeader('X-RateLimit-Reset', record.resetTime);
          return res.status(429).json({
            error: 'API key rate limit exceeded',
            retryAfter: Math.ceil((record.resetTime - now) / 1000)
          });
        }
        record.count++;
      }
    }

    const current = keyStore.get(apiKeyId);
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - current.count));
    res.setHeader('X-RateLimit-Reset', current.resetTime);

    const originalSend = res.send;
    const _start = Date.now();
    res.send = function (...args) {
      KeyUsage.create({ keyId: apiKeyId, tenantId: req.apiKey.tenantId, method: req.method, path: req.originalUrl, statusCode: res.statusCode, timestamp: new Date() }).catch(err => logger.error({ err }, 'KeyUsage create failed'));
      return originalSend.apply(this, args);
    };

    next();
  };
};

setInterval(() => {
  const now = Date.now();
  for (const [key, record] of keyStore.entries()) {
    if (now > record.resetTime) keyStore.delete(key);
  }
}, 60_000);

export default keyRateLimit;
