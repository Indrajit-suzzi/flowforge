import test from 'node:test';
import assert from 'node:assert';
import { googleLoginSchema, createContentTypeSchema, createRoleSchema, createWebhookSchema } from './validationSchemas.js';

test('googleLoginSchema - accepts a Google credential', () => {
  const { error, value } = googleLoginSchema.validate({ credential: 'google-id-token' });
  assert.strictEqual(error, undefined);
  assert.strictEqual(value.credential, 'google-id-token');
});

test('googleLoginSchema - rejects missing credential', () => {
  const { error } = googleLoginSchema.validate({});
  assert.notStrictEqual(error, undefined);
  assert.ok(error.message.includes('credential'));
});

test('createContentTypeSchema - accepts valid input', () => {
  const { error } = createContentTypeSchema.validate({
    name: 'Post',
    slug: 'posts',
    fields: [{ name: 'title', type: 'String', required: true }],
    locales: ['en'],
  });
  assert.strictEqual(error, undefined);
});

test('createContentTypeSchema - rejects empty fields', () => {
  const { error } = createContentTypeSchema.validate({
    name: 'Post',
    slug: 'posts',
    fields: [],
  });
  assert.notStrictEqual(error, undefined);
});

test('createContentTypeSchema - rejects invalid field type', () => {
  const { error } = createContentTypeSchema.validate({
    name: 'Post',
    slug: 'posts',
    fields: [{ name: 'bad', type: 'InvalidType' }],
  });
  assert.notStrictEqual(error, undefined);
});

test('createContentTypeSchema - rejects bad slug format', () => {
  const { error } = createContentTypeSchema.validate({
    name: 'Post',
    slug: 'MY POST!!',
    fields: [{ name: 'title', type: 'String' }],
  });
  assert.notStrictEqual(error, undefined);
});

test('createRoleSchema - accepts valid input', () => {
  const { error } = createRoleSchema.validate({
    name: 'Editor',
    slug: 'editor',
    permissions: { contentEntries: true, mediaLibrary: true },
  });
  assert.strictEqual(error, undefined);
});

test('createWebhookSchema - accepts valid input', () => {
  const { error } = createWebhookSchema.validate({
    name: 'Deploy Hook',
    url: 'https://example.com/hooks/deploy',
    events: ['entry.create', 'entry.update'],
    secret: 'supersecretkey12345678',
  });
  assert.strictEqual(error, undefined);
});

test('createWebhookSchema - rejects invalid URL', () => {
  const { error } = createWebhookSchema.validate({
    name: 'Bad Hook',
    url: 'not-a-url',
    events: ['entry.create'],
    secret: 'supersecretkey12345678',
  });
  assert.notStrictEqual(error, undefined);
});
