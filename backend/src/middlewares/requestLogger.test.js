import test from 'node:test';
import assert from 'node:assert';
import requestLogger from './requestLogger.js';

test('requestLogger - calls next()', () => {
  const req = { method: 'GET', url: '/api/test', headers: {}, ip: '127.0.0.1' };
  const res = { statusCode: 200, on: (event, cb) => { res._finish = cb; }, getHeader: () => null };
  let called = false;
  requestLogger(req, res, () => { called = true; });
  assert.strictEqual(called, true);
});

test('requestLogger - registers finish handler', () => {
  const req = { method: 'GET', url: '/api/test', headers: {}, ip: '127.0.0.1' };
  let handlerRegistered = false;
  const res = {
    statusCode: 200,
    on: (event, _cb) => { if (event === 'finish') handlerRegistered = true; },
    getHeader: () => null,
  };
  requestLogger(req, res, () => {});
  assert.strictEqual(handlerRegistered, true);
});
