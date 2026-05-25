import test from 'node:test';
import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import authMiddleware from './authMiddleware.js';

const JWT_SECRET = 'test-secret-for-testing-only';

function mockReq(headers = {}) {
  return { headers };
}

function mockRes() {
  const state = { statusCode: 200, body: null };
  return {
    state,
    status(code) { state.statusCode = code; return this; },
    json(obj) { state.body = obj; return this; },
  };
}

test('auth - rejects missing auth header and API key', async () => {
  const req = mockReq({});
  const res = mockRes();
  let called = false;
  await authMiddleware(req, res, () => { called = true; });
  assert.strictEqual(res.state.statusCode, 401);
  assert.ok(res.state.body.message.includes('Authentication required'));
  assert.strictEqual(called, false);
});

test('auth - rejects invalid JWT token', async () => {
  const req = mockReq({ authorization: 'Bearer invalid-token-here' });
  const res = mockRes();
  let called = false;
  await authMiddleware(req, res, () => { called = true; });
  assert.strictEqual(res.state.statusCode, 401);
  assert.strictEqual(res.state.body.message, 'Invalid token');
  assert.strictEqual(called, false);
});

test('auth - accepts valid JWT token', async () => {
  const token = jwt.sign({ id: 'user-123', role: 'admin' }, JWT_SECRET);
  const req = mockReq({ authorization: `Bearer ${token}` });
  const res = mockRes();
  let called = false;

  const origSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = JWT_SECRET;
  try {
    await authMiddleware(req, res, () => { called = true; });
    assert.strictEqual(res.state.statusCode, 200);
    assert.strictEqual(called, true);
    assert.strictEqual(req.user.id, 'user-123');
    assert.strictEqual(req.tenant, 'user-123');
    assert.strictEqual(req.userRole, 'admin');
  } finally {
    process.env.JWT_SECRET = origSecret;
  }
});

test('auth - valid token assigns default member role', async () => {
  const token = jwt.sign({ id: 'user-456' }, JWT_SECRET);
  const req = mockReq({ authorization: `Bearer ${token}` });
  const res = mockRes();
  let called = false;

  const origSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = JWT_SECRET;
  try {
    await authMiddleware(req, res, () => { called = true; });
    assert.strictEqual(called, true);
    assert.strictEqual(req.userRole, 'member');
  } finally {
    process.env.JWT_SECRET = origSecret;
  }
});

test('auth - rejects malformed Authorization header', async () => {
  const req = mockReq({ authorization: 'Basic credentials' });
  const res = mockRes();
  let called = false;
  await authMiddleware(req, res, () => { called = true; });
  assert.strictEqual(res.state.statusCode, 401);
  assert.strictEqual(called, false);
});
