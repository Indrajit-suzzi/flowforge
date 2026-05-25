import test from 'node:test';
import assert from 'node:assert';

const keyStore = new Map();

export const getKeyRateUsage = (apiKeyId) => {
  const record = keyStore.get(apiKeyId.toString());
  if (!record) return { used: 0, limit: 100, remaining: 100, resetsIn: 0 };
  const now = Date.now();
  if (now > record.resetTime) return { used: 0, limit: record.max, remaining: record.max, resetsIn: 0 };
  return {
    used: record.count,
    limit: record.max,
    remaining: record.max - record.count,
    resetsIn: Math.ceil((record.resetTime - now) / 1000),
  };
};

test('getKeyRateUsage - returns default for unknown key', () => {
  const result = getKeyRateUsage('unknown-key');
  assert.strictEqual(result.used, 0);
  assert.strictEqual(result.limit, 100);
  assert.strictEqual(result.remaining, 100);
  assert.strictEqual(result.resetsIn, 0);
});

test('getKeyRateUsage - returns usage for active record', () => {
  keyStore.set('key-1', { count: 3, max: 10, resetTime: Date.now() + 30000 });
  const result = getKeyRateUsage('key-1');
  assert.strictEqual(result.used, 3);
  assert.strictEqual(result.limit, 10);
  assert.strictEqual(result.remaining, 7);
  assert.ok(result.resetsIn > 0);
  keyStore.delete('key-1');
});

test('getKeyRateUsage - returns reset when window expired', () => {
  keyStore.set('key-2', { count: 8, max: 10, resetTime: Date.now() - 1000 });
  const result = getKeyRateUsage('key-2');
  assert.strictEqual(result.used, 0);
  assert.strictEqual(result.limit, 10);
  assert.strictEqual(result.remaining, 10);
  keyStore.delete('key-2');
});
