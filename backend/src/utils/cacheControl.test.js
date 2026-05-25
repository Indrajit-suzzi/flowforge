import test from 'node:test';
import assert from 'node:assert';
import { cacheControl } from './cacheControl.js';

function mockReq(params = {}, headers = {}, method = 'GET') {
  return { params, headers, method, tenant: 'tenant-123' };
}

function mockRes() {
  const state = { headers: {}, statusCode: 200 };
  return {
    state,
    setHeader(key, value) { state.headers[key] = value; },
    status(code) { state.statusCode = code; return this; },
    end() { state.ended = true; return this; },
  };
}

test('cacheControl - passes through when no modelName', async () => {
  const req = mockReq({});
  const res = mockRes();
  let called = false;
  await cacheControl(req, res, () => { called = true; });
  assert.strictEqual(called, true);
  assert.strictEqual(Object.keys(res.state.headers).length, 0);
});
