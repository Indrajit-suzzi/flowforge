import test from 'node:test';
import assert from 'node:assert';
import { AppError, errorHandler, notFoundHandler } from './errorHandler.js';

function mockReq(path = '/test', method = 'GET') {
  return { path, method };
}

function mockRes() {
  const state = { statusCode: 200, body: null };
  return {
    state,
    status(code) { state.statusCode = code; return this; },
    json(obj) { state.body = obj; return this; },
  };
}

test('AppError - sets properties correctly', () => {
  const err = new AppError('Not found', 404, { field: 'id' });
  assert.strictEqual(err.message, 'Not found');
  assert.strictEqual(err.statusCode, 404);
  assert.deepStrictEqual(err.details, { field: 'id' });
  assert.strictEqual(err.isOperational, true);
});

test('AppError - defaults to 500', () => {
  const err = new AppError('Server error');
  assert.strictEqual(err.statusCode, 500);
});

test('errorHandler - operational error returns status and message', () => {
  const err = new AppError('Bad request', 400);
  const req = mockReq();
  const res = mockRes();
  errorHandler(err, req, res, () => {});
  assert.strictEqual(res.state.statusCode, 400);
  assert.strictEqual(res.state.body.error, 'Bad request');
});

test('errorHandler - operational error with details', () => {
  const err = new AppError('Validation failed', 400, [{ field: 'name', message: 'Required' }]);
  const req = mockReq();
  const res = mockRes();
  errorHandler(err, req, res, () => {});
  assert.strictEqual(res.state.statusCode, 400);
  assert.ok(res.state.body.details);
  assert.strictEqual(res.state.body.details[0].field, 'name');
});

test('errorHandler - Mongoose ValidationError', () => {
  const err = new Error('Validation failed');
  err.name = 'ValidationError';
  err.errors = { name: { message: 'Name is required' }, email: { message: 'Invalid email' } };
  const req = mockReq();
  const res = mockRes();
  errorHandler(err, req, res, () => {});
  assert.strictEqual(res.state.statusCode, 400);
  assert.strictEqual(res.state.body.error, 'Validation failed');
  assert.strictEqual(res.state.body.details.length, 2);
});

test('errorHandler - duplicate key error (11000)', () => {
  const err = new Error('Duplicate key');
  err.code = 11000;
  err.keyPattern = { slug: 1 };
  const req = mockReq();
  const res = mockRes();
  errorHandler(err, req, res, () => {});
  assert.strictEqual(res.state.statusCode, 409);
  assert.ok(res.state.body.error.includes('slug'));
});

test('errorHandler - duplicate key error without keyPattern', () => {
  const err = new Error('Duplicate key');
  err.code = 11000;
  const req = mockReq();
  const res = mockRes();
  errorHandler(err, req, res, () => {});
  assert.strictEqual(res.state.statusCode, 409);
  assert.ok(res.state.body.error.includes('field'));
});

test('errorHandler - CastError', () => {
  const err = new Error('Invalid id');
  err.name = 'CastError';
  err.path = '_id';
  err.value = 'bad-id';
  const req = mockReq();
  const res = mockRes();
  errorHandler(err, req, res, () => {});
  assert.strictEqual(res.state.statusCode, 400);
  assert.ok(res.state.body.error.includes('_id'));
});

test('errorHandler - JSON parse error', () => {
  const err = new Error('Invalid JSON');
  err.type = 'entity.parse.failed';
  const req = mockReq();
  const res = mockRes();
  errorHandler(err, req, res, () => {});
  assert.strictEqual(res.state.statusCode, 400);
  assert.strictEqual(res.state.body.error, 'Invalid JSON in request body');
});

test('errorHandler - unknown error returns status 500', () => {
  const err = new Error('Sensitive details');
  const req = mockReq();
  const res = mockRes();
  errorHandler(err, req, res, () => {});
  assert.strictEqual(res.state.statusCode, 500);
});

test('notFoundHandler - returns 404 with route info', () => {
  const req = mockReq('/api/unknown', 'POST');
  const res = mockRes();
  notFoundHandler(req, res);
  assert.strictEqual(res.state.statusCode, 404);
  assert.ok(res.state.body.error.includes('POST'));
  assert.ok(res.state.body.error.includes('/api/unknown'));
});
