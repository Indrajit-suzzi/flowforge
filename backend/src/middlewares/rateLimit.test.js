import test from 'node:test';
import assert from 'node:assert';

const createStore = () => {
  const store = new Map();
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) store.delete(key);
    }
  }, 60_000);
  return { store, cleanup };
};

const createLimiter = ({ windowMs = 60 * 1000, max = 100, keyGenerator = (req) => req.ip } = {}) => {
  const { store, cleanup } = createStore();
  const middleware = async (req, res, next) => {
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
  middleware._cleanup = cleanup;
  return middleware;
};

function mockReq(ip = '127.0.0.1') {
  return { ip };
}

function mockRes() {
  const state = { statusCode: 200, headers: {}, body: null };
  return {
    state,
    status(code) { state.statusCode = code; return this; },
    json(obj) { state.body = obj; return this; },
    setHeader(key, value) { state.headers[key] = value; },
  };
}

test('createLimiter - first request passes', async () => {
  const limiter = createLimiter({ max: 5 });
  const req = mockReq();
  const res = mockRes();
  let called = false;
  await limiter(req, res, () => { called = true; });
  assert.strictEqual(called, true);
  assert.strictEqual(res.state.body, null);
  clearInterval(limiter._cleanup);
});

test('createLimiter - first request sets rate limit headers', async () => {
  const limiter = createLimiter({ max: 5 });
  const req = mockReq();
  const res = mockRes();
  await limiter(req, res, () => {});
  assert.strictEqual(res.state.headers['X-RateLimit-Limit'], 5);
  assert.strictEqual(res.state.headers['X-RateLimit-Remaining'], 4);
  assert.ok(res.state.headers['X-RateLimit-Reset']);
  clearInterval(limiter._cleanup);
});

test('createLimiter - blocks when limit exceeded', async () => {
  const limiter = createLimiter({ max: 2, windowMs: 60000 });
  const req = mockReq();
  const res = mockRes();

  let calls = 0;
  const next = () => { calls++; };

  await limiter(req, res, next);
  assert.strictEqual(calls, 1);

  await limiter(req, res, next);
  assert.strictEqual(calls, 2);

  await limiter(req, res, next);
  assert.strictEqual(calls, 2);
  assert.strictEqual(res.state.statusCode, 429);
  assert.strictEqual(res.state.body.error, 'Too many requests');
  assert.ok(res.state.body.retryAfter > 0);
  clearInterval(limiter._cleanup);
});

test('createLimiter - different IPs have separate counters', async () => {
  const limiter = createLimiter({ max: 1, windowMs: 60000 });

  const req1 = mockReq('1.1.1.1');
  const res1 = mockRes();
  await limiter(req1, res1, () => {});
  assert.strictEqual(res1.state.statusCode, 200);

  const req2 = mockReq('2.2.2.2');
  const res2 = mockRes();
  await limiter(req2, res2, () => {});
  assert.strictEqual(res2.state.statusCode, 200);
  clearInterval(limiter._cleanup);
});

test('createLimiter - block is per-IP', async () => {
  const limiter = createLimiter({ max: 1, windowMs: 60000 });

  const req1 = mockReq('1.1.1.1');
  const res1 = mockRes();
  await limiter(req1, res1, () => {});
  assert.strictEqual(res1.state.statusCode, 200);

  await limiter(req1, res1, () => {});
  assert.strictEqual(res1.state.statusCode, 429);
  clearInterval(limiter._cleanup);
});

test('createLimiter - resets after window expires', async () => {
  const limiter = createLimiter({ max: 1, windowMs: 50 });

  const req = mockReq();
  const res = mockRes();
  let calls = 0;
  const next = () => { calls++; };

  await limiter(req, res, next);
  assert.strictEqual(calls, 1);

  await limiter(req, res, next);
  assert.strictEqual(calls, 1);
  assert.strictEqual(res.state.statusCode, 429);

  await new Promise(r => setTimeout(r, 60));

  const res2 = mockRes();
  await limiter(req, res2, next);
  assert.strictEqual(calls, 2);
  assert.strictEqual(res2.state.statusCode, 200);
  clearInterval(limiter._cleanup);
});
