import test from 'node:test';
import assert from 'node:assert';

const REQUIRED_VARS = [
  { name: 'MONGO_URI', hint: 'mongodb://...' },
  { name: 'JWT_SECRET', hint: 'random string' },
];

const OPTIONAL_VARS = [
  { name: 'PORT', default: '3000' },
  { name: 'NODE_ENV', default: 'development' },
  { name: 'LOG_LEVEL', default: 'debug' },
];

test('passes when all required vars are set', () => {
  process.env.MONGO_URI = 'mongodb://localhost:27017/test';
  process.env.JWT_SECRET = 'test-secret';
  const missing = REQUIRED_VARS.filter(({ name }) => !process.env[name]);
  assert.strictEqual(missing.length, 0);
  delete process.env.MONGO_URI;
  delete process.env.JWT_SECRET;
});

test('fails when MONGO_URI is missing', () => {
  delete process.env.MONGO_URI;
  process.env.JWT_SECRET = 'test-secret';
  const missing = REQUIRED_VARS.filter(({ name }) => !process.env[name]);
  assert.strictEqual(missing.length, 1);
  assert.strictEqual(missing[0].name, 'MONGO_URI');
  delete process.env.JWT_SECRET;
});

test('fails when JWT_SECRET is missing', () => {
  process.env.MONGO_URI = 'mongodb://localhost:27017/test';
  delete process.env.JWT_SECRET;
  const missing = REQUIRED_VARS.filter(({ name }) => !process.env[name]);
  assert.strictEqual(missing.length, 1);
  assert.strictEqual(missing[0].name, 'JWT_SECRET');
  delete process.env.MONGO_URI;
});

test('fails when both are missing', () => {
  delete process.env.MONGO_URI;
  delete process.env.JWT_SECRET;
  const missing = REQUIRED_VARS.filter(({ name }) => !process.env[name]);
  assert.strictEqual(missing.length, 2);
});

test('sets defaults for optional vars', () => {
  delete process.env.PORT;
  delete process.env.NODE_ENV;
  delete process.env.LOG_LEVEL;
  for (const { name, default: def } of OPTIONAL_VARS) {
    if (!process.env[name]) process.env[name] = def;
  }
  assert.strictEqual(process.env.PORT, '3000');
  assert.strictEqual(process.env.NODE_ENV, 'development');
  assert.strictEqual(process.env.LOG_LEVEL, 'debug');
});
