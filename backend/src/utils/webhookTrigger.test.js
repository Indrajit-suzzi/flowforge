import test from 'node:test';
import assert from 'node:assert';
import { isBlockedAddress, assertPublicWebhookUrl } from './webhookTrigger.js';

const evaluateConditions = (conditions, data) => {
  if (!conditions || !conditions.length) return true;
  const entry = data?.data || data || {};
  return conditions.every(c => {
    const val = String(entry[c.field] ?? '');
    switch (c.operator) {
      case 'equals': return val === c.value;
      case 'not_equals': return val !== c.value;
      case 'contains': return val.toLowerCase().includes((c.value || '').toLowerCase());
      case 'exists': return entry[c.field] !== undefined && entry[c.field] !== null && entry[c.field] !== '';
      case 'not_exists': return entry[c.field] === undefined || entry[c.field] === null || entry[c.field] === '';
      default: return true;
    }
  });
};

test('evaluateConditions - null conditions returns true', () => {
  assert.strictEqual(evaluateConditions(null, { status: 'published' }), true);
});

test('evaluateConditions - empty conditions returns true', () => {
  assert.strictEqual(evaluateConditions([], { status: 'published' }), true);
});

test('evaluateConditions - equals operator matches', () => {
  const conditions = [{ field: 'status', operator: 'equals', value: 'published' }];
  assert.strictEqual(evaluateConditions(conditions, { status: 'published' }), true);
});

test('evaluateConditions - equals operator does not match', () => {
  const conditions = [{ field: 'status', operator: 'equals', value: 'published' }];
  assert.strictEqual(evaluateConditions(conditions, { status: 'draft' }), false);
});

test('evaluateConditions - not_equals operator matches', () => {
  const conditions = [{ field: 'status', operator: 'not_equals', value: 'draft' }];
  assert.strictEqual(evaluateConditions(conditions, { status: 'published' }), true);
});

test('evaluateConditions - not_equals operator does not match', () => {
  const conditions = [{ field: 'status', operator: 'not_equals', value: 'draft' }];
  assert.strictEqual(evaluateConditions(conditions, { status: 'draft' }), false);
});

test('evaluateConditions - contains operator matches', () => {
  const conditions = [{ field: 'title', operator: 'contains', value: 'hello' }];
  assert.strictEqual(evaluateConditions(conditions, { title: 'Hello World' }), true);
});

test('evaluateConditions - contains operator is case-insensitive', () => {
  const conditions = [{ field: 'title', operator: 'contains', value: 'WORLD' }];
  assert.strictEqual(evaluateConditions(conditions, { title: 'Hello world' }), true);
});

test('evaluateConditions - contains operator does not match', () => {
  const conditions = [{ field: 'title', operator: 'contains', value: 'xyz' }];
  assert.strictEqual(evaluateConditions(conditions, { title: 'Hello World' }), false);
});

test('evaluateConditions - exists operator matches when field has value', () => {
  const conditions = [{ field: 'email', operator: 'exists' }];
  assert.strictEqual(evaluateConditions(conditions, { email: 'user@test.com' }), true);
});

test('evaluateConditions - exists operator fails when field is undefined', () => {
  const conditions = [{ field: 'email', operator: 'exists' }];
  assert.strictEqual(evaluateConditions(conditions, { name: 'John' }), false);
});

test('evaluateConditions - exists operator fails when field is empty string', () => {
  const conditions = [{ field: 'email', operator: 'exists' }];
  assert.strictEqual(evaluateConditions(conditions, { email: '' }), false);
});

test('evaluateConditions - not_exists operator matches when field is missing', () => {
  const conditions = [{ field: 'email', operator: 'not_exists' }];
  assert.strictEqual(evaluateConditions(conditions, { name: 'John' }), true);
});

test('evaluateConditions - not_exists operator fails when field has value', () => {
  const conditions = [{ field: 'email', operator: 'not_exists' }];
  assert.strictEqual(evaluateConditions(conditions, { email: 'user@test.com' }), false);
});

test('evaluateConditions - all conditions must match (AND logic)', () => {
  const conditions = [
    { field: 'status', operator: 'equals', value: 'published' },
    { field: 'category', operator: 'equals', value: 'tech' },
  ];
  assert.strictEqual(evaluateConditions(conditions, { status: 'published', category: 'tech' }), true);
  assert.strictEqual(evaluateConditions(conditions, { status: 'published', category: 'news' }), false);
});

test('evaluateConditions - unknown operator returns true', () => {
  const conditions = [{ field: 'status', operator: 'unknown_op', value: 'x' }];
  assert.strictEqual(evaluateConditions(conditions, { status: 'anything' }), true);
});

test('evaluateConditions - handles nested data object', () => {
  const conditions = [{ field: 'status', operator: 'equals', value: 'published' }];
  assert.strictEqual(evaluateConditions(conditions, { data: { status: 'published' } }), true);
});

test('evaluateConditions - handles missing field gracefully', () => {
  const conditions = [{ field: 'nonexistent', operator: 'equals', value: 'anything' }];
  assert.strictEqual(evaluateConditions(conditions, { status: 'published' }), false);
});

test('webhook security - blocks private and metadata IPv4 ranges', () => {
  assert.strictEqual(isBlockedAddress('127.0.0.1'), true);
  assert.strictEqual(isBlockedAddress('10.1.2.3'), true);
  assert.strictEqual(isBlockedAddress('169.254.169.254'), true);
  assert.strictEqual(isBlockedAddress('8.8.8.8'), false);
});

test('webhook security - blocks loopback, local IPv6, and non-http URLs', async () => {
  await assert.rejects(assertPublicWebhookUrl('http://localhost/hook'), /private|internal/);
  await assert.rejects(assertPublicWebhookUrl('http://[::1]/hook'), /private|reserved/);
  await assert.rejects(assertPublicWebhookUrl('file:///etc/passwd'), /HTTP or HTTPS/);
});
