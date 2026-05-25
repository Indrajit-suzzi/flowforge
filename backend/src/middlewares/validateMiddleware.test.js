import test from 'node:test';
import assert from 'node:assert';
import Joi from 'joi';
import validate from './validateMiddleware.js';

function mockReq(body = {}) {
  return { body };
}

function mockRes() {
  const state = { statusCode: 200, body: null };
  return {
    state,
    status(code) { state.statusCode = code; return this; },
    json(obj) { state.body = obj; return this; },
  };
}

const testSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  age: Joi.number().min(0).max(150),
});

test('validate - passes valid data', () => {
  const middleware = validate(testSchema);
  const req = mockReq({ name: 'John', email: 'john@test.com', age: 30 });
  const res = mockRes();
  let called = false;
  middleware(req, res, () => { called = true; });
  assert.strictEqual(called, true);
  assert.strictEqual(res.state.statusCode, 200);
  assert.strictEqual(req.body.name, 'John');
});

test('validate - strips unknown fields', () => {
  const middleware = validate(testSchema);
  const req = mockReq({ name: 'John', email: 'john@test.com', extra: 'should-be-stripped' });
  const res = mockRes();
  let called = false;
  middleware(req, res, () => { called = true; });
  assert.strictEqual(called, true);
  assert.strictEqual(req.body.extra, undefined);
});

test('validate - rejects missing required field', () => {
  const middleware = validate(testSchema);
  const req = mockReq({ name: 'John' });
  const res = mockRes();
  let called = false;
  middleware(req, res, () => { called = true; });
  assert.strictEqual(res.state.statusCode, 400);
  assert.strictEqual(res.state.body.error, 'Validation failed');
  assert.ok(res.state.body.details.length > 0);
  assert.strictEqual(called, false);
});

test('validate - rejects invalid email', () => {
  const middleware = validate(testSchema);
  const req = mockReq({ name: 'John', email: 'not-an-email' });
  const res = mockRes();
  let called = false;
  middleware(req, res, () => { called = true; });
  assert.strictEqual(res.state.statusCode, 400);
  assert.strictEqual(called, false);
});

test('validate - rejects short name', () => {
  const middleware = validate(testSchema);
  const req = mockReq({ name: 'J', email: 'john@test.com' });
  const res = mockRes();
  let called = false;
  middleware(req, res, () => { called = true; });
  assert.strictEqual(res.state.statusCode, 400);
  assert.strictEqual(called, false);
});

test('validate - returns field-level error details', () => {
  const middleware = validate(testSchema);
  const req = mockReq({ name: 'J', email: 'bad' });
  const res = mockRes();
  middleware(req, res, () => {});
  assert.strictEqual(res.state.statusCode, 400);
  assert.strictEqual(res.state.body.details.length, 2);
  const fields = res.state.body.details.map(d => d.field);
  assert.ok(fields.includes('name'));
  assert.ok(fields.includes('email'));
});
