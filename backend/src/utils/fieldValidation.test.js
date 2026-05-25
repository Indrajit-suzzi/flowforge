import test from 'node:test';
import assert from 'node:assert';
import { validateField, validateEntry } from './fieldValidation.js';

test('validateField - required field with no value returns error', () => {
  const field = { name: 'title', label: 'Title', type: 'String', required: true };
  assert.strictEqual(validateField(field, undefined).length, 1);
  assert.strictEqual(validateField(field, null).length, 1);
  assert.strictEqual(validateField(field, '').length, 1);
});

test('validateField - non-required empty field returns no errors', () => {
  const field = { name: 'title', label: 'Title', type: 'String', required: false };
  assert.strictEqual(validateField(field, undefined).length, 0);
  assert.strictEqual(validateField(field, '').length, 0);
});

test('validateField - required field with value returns no errors', () => {
  const field = { name: 'title', label: 'Title', type: 'String', required: true };
  assert.strictEqual(validateField(field, 'Hello').length, 0);
});

test('validateField - minLength validation', () => {
  const field = { name: 'slug', label: 'Slug', type: 'String', minLength: 3 };
  assert.strictEqual(validateField(field, 'ab').length, 1);
  assert.strictEqual(validateField(field, 'abc').length, 0);
});

test('validateField - maxLength validation', () => {
  const field = { name: 'code', label: 'Code', type: 'String', maxLength: 5 };
  assert.strictEqual(validateField(field, 'abcdef').length, 1);
  assert.strictEqual(validateField(field, 'abcde').length, 0);
});

test('validateField - pattern validation passes matching value', () => {
  const field = { name: 'email', label: 'Email', type: 'String', pattern: '^[^@]+@[^@]+$' };
  assert.strictEqual(validateField(field, 'user@test.com').length, 0);
});

test('validateField - pattern validation rejects non-matching value', () => {
  const field = { name: 'email', label: 'Email', type: 'String', pattern: '^[^@]+@[^@]+$' };
  assert.strictEqual(validateField(field, 'not-an-email').length, 1);
});

test('validateField - uses patternMessage for pattern errors', () => {
  const field = { name: 'code', label: 'Code', type: 'String', pattern: '^[A-Z]+$', patternMessage: 'Must be uppercase' };
  const errors = validateField(field, 'abc');
  assert.ok(errors[0].includes('uppercase'));
});

test('validateField - Number type min validation', () => {
  const field = { name: 'count', label: 'Count', type: 'Number', min: 0 };
  assert.strictEqual(validateField(field, -1).length, 1);
  assert.strictEqual(validateField(field, 0).length, 0);
  assert.strictEqual(validateField(field, 5).length, 0);
});

test('validateField - Number type max validation', () => {
  const field = { name: 'score', label: 'Score', type: 'Number', max: 100 };
  assert.strictEqual(validateField(field, 101).length, 1);
  assert.strictEqual(validateField(field, 100).length, 0);
});

test('validateField - RichText type respects min/max length', () => {
  const field = { name: 'body', label: 'Body', type: 'RichText', minLength: 10 };
  assert.strictEqual(validateField(field, 'Short').length, 1);
  assert.strictEqual(validateField(field, 'Ten chars!').length, 0);
});

test('validateField - empty string for optional field with no validations', () => {
  const field = { name: 'desc', label: 'Description', type: 'String' };
  assert.strictEqual(validateField(field, '').length, 0);
});

test('validateEntry - aggregates errors across fields', () => {
  const fields = [
    { name: 'title', label: 'Title', type: 'String', required: true },
    { name: 'body', label: 'Body', type: 'String', minLength: 10 },
  ];
  const data = { title: '', body: 'short' };
  const errors = validateEntry(fields, data);
  assert.strictEqual(errors.length, 2);
});

test('validateEntry - returns empty for valid entry', () => {
  const fields = [
    { name: 'title', label: 'Title', type: 'String', required: true },
    { name: 'body', label: 'Body', type: 'String', minLength: 5 },
  ];
  const data = { title: 'My Post', body: 'Full content here' };
  assert.strictEqual(validateEntry(fields, data).length, 0);
});
