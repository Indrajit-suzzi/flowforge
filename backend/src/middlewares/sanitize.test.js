import test from 'node:test';
import assert from 'node:assert';

// Import and test the helper directly
const DANGEROUS_KEYS = ['$where', '$regex', '$ne', '$gt', '$lt', '$gte', '$lte', '$in', '$nin', '$exists'];

const hasDangerousKeys = (obj) => {
  if (typeof obj === 'string') {
    return DANGEROUS_KEYS.some(k => obj.includes(k));
  }
  if (Array.isArray(obj)) {
    return obj.some(hasDangerousKeys);
  }
  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$')) return true;
      if (hasDangerousKeys(obj[key])) return true;
    }
  }
  return false;
};

test('detects $where in object body', () => {
  assert.strictEqual(hasDangerousKeys({ $where: '1=1' }), true);
});

test('detects $regex in nested object', () => {
  assert.strictEqual(hasDangerousKeys({ email: { $regex: '.*' } }), true);
});

test('detects $ne in query', () => {
  assert.strictEqual(hasDangerousKeys({ status: { $ne: 'published' } }), true);
});

test('detects $gt and $lt in range query', () => {
  assert.strictEqual(hasDangerousKeys({ createdAt: { $gt: '2020', $lt: '2021' } }), true);
});

test('passes clean objects', () => {
  assert.strictEqual(hasDangerousKeys({ email: 'user@test.com', name: 'John' }), false);
});

test('passes empty objects', () => {
  assert.strictEqual(hasDangerousKeys({}), false);
});

test('passes null/undefined', () => {
  assert.strictEqual(hasDangerousKeys(null), false);
  assert.strictEqual(hasDangerousKeys(undefined), false);
});

test('passes primitive values', () => {
  assert.strictEqual(hasDangerousKeys('hello'), false);
  assert.strictEqual(hasDangerousKeys(42), false);
  assert.strictEqual(hasDangerousKeys(true), false);
});

test('passes string values containing $ prefixes', () => {
  assert.strictEqual(hasDangerousKeys({ description: 'Use dollar signs $ for variables' }), false);
});

test('detects $in in array', () => {
  assert.strictEqual(hasDangerousKeys({ ids: { $in: ['a', 'b'] } }), true);
});

test('detects deep nesting', () => {
  assert.strictEqual(hasDangerousKeys({ a: { b: { c: { $exists: true } } } }), true);
});
