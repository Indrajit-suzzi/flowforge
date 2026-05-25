const createStore = () => {
  const store = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) store.delete(key);
    }
  }, 60_000);
  return store;
};

const createLimiter = ({ windowMs = 60 * 1000, max = 100, keyGenerator = (req) => req.ip } = {}) => {
  const store = createStore();
  return async (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();

    if (!store.has(key)) {
      store.set(key, { count: 1, resetTime: now + windowMs });
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - 1);
      res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
      return next();
    }

    const record = store.get(key);

    if (now > record.resetTime) {
      store.set(key, { count: 1, resetTime: now + windowMs });
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - 1);
      res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
      return next();
    }

    if (record.count >= max) {
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
      res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000));
      return res.status(429).json({ error: 'Too many requests', retryAfter: Math.ceil((record.resetTime - now) / 1000) });
    }

    record.count++;
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', max - record.count);
    res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());

    next();
  };
};

export const authLimiter = createLimiter({ windowMs: 15 * 60 * 1000, max: 10 });
export const apiLimiter = createLimiter({ windowMs: 15 * 60 * 1000, max: 100 });
export const webhookLimiter = createLimiter({ windowMs: 15 * 60 * 1000, max: 30 });
export const generousLimiter = createLimiter({ windowMs: 60 * 1000, max: 1000 });

export default createLimiter;
