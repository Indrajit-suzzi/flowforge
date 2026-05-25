import test from 'node:test';
import assert from 'node:assert';
import sanitize from './sanitize.js';

function mockReq(body = {}, query = {}) {
  return { body, query };
}

function mockRes() {
  const state = { statusCode: 200, body: null };
  return {
    state,
    status(code) { state.statusCode = code; return this; },
    json(obj) { state.body = obj; return this; },
  };
}

test('sanitize middleware - blocks $where in body', () => {
  const req = mockReq({ $where: '1=1' });
  const res = mockRes();
  let called = false;
  sanitize(req, res, () => { called = true; });
  assert.strictEqual(res.state.statusCode, 400);
  assert.ok(res.state.body.error.includes('forbidden'));
  assert.strictEqual(called, false);
});

test('sanitize middleware - blocks $regex in body', () => {
  const req = mockReq({ email: { $regex: '.*' } });
  const res = mockRes();
  let called = false;
  sanitize(req, res, () => { called = true; });
  assert.strictEqual(res.state.statusCode, 400);
  assert.strictEqual(called, false);
});

test('sanitize middleware - blocks $ne in query', () => {
  const req = mockReq({}, { status: { $ne: 'published' } });
  const res = mockRes();
  let called = false;
  sanitize(req, res, () => { called = true; });
  assert.strictEqual(res.state.statusCode, 400);
  assert.strictEqual(called, false);
});

test('sanitize middleware - passes clean request', () => {
  const req = mockReq({ name: 'test', email: 'user@test.com' }, { page: '1' });
  const res = mockRes();
  let called = false;
  sanitize(req, res, () => { called = true; });
  assert.strictEqual(res.state.statusCode, 200);
  assert.strictEqual(called, true);
});

test('sanitize middleware - passes empty request', () => {
  const req = mockReq({}, {});
  const res = mockRes();
  let called = false;
  sanitize(req, res, () => { called = true; });
  assert.strictEqual(called, true);
});

test('sanitize middleware - detects deep nesting', () => {
  const req = mockReq({ a: { b: { c: { $exists: true } } } });
  const res = mockRes();
  let called = false;
  sanitize(req, res, () => { called = true; });
  assert.strictEqual(res.state.statusCode, 400);
  assert.strictEqual(called, false);
});
