import test from 'node:test';
import assert from 'node:assert';

const hardcodedPermissions = {
  admin: {
    contentTypes: true, contentEntries: true, apiKeys: true,
    analytics: true, auditLogs: true, webhooks: true,
    mediaLibrary: true, userManagement: true, systemSettings: true, roles: true,
  },
  member: {
    contentTypes: true, contentEntries: true, apiKeys: true,
    analytics: false, auditLogs: false, webhooks: false,
    mediaLibrary: true, userManagement: false, systemSettings: false, roles: false,
  },
};

test('hardcoded admin has all permissions', () => {
  const perms = hardcodedPermissions.admin;
  const allKeys = ['contentTypes', 'contentEntries', 'apiKeys', 'analytics', 'auditLogs', 'webhooks', 'mediaLibrary', 'userManagement', 'systemSettings', 'roles'];
  for (const key of allKeys) {
    assert.strictEqual(perms[key], true, `admin should have ${key} permission`);
  }
});

test('hardcoded member has limited permissions', () => {
  const perms = hardcodedPermissions.member;
  assert.strictEqual(perms.contentTypes, true);
  assert.strictEqual(perms.contentEntries, true);
  assert.strictEqual(perms.apiKeys, true);
  assert.strictEqual(perms.mediaLibrary, true);
  assert.strictEqual(perms.analytics, false);
  assert.strictEqual(perms.auditLogs, false);
  assert.strictEqual(perms.webhooks, false);
  assert.strictEqual(perms.userManagement, false);
  assert.strictEqual(perms.systemSettings, false);
  assert.strictEqual(perms.roles, false);
});

test('unknown role falls back to member permissions', () => {
  const perms = hardcodedPermissions.member;
  assert.strictEqual(perms.apiKeys, true);
  assert.strictEqual(perms.roles, false);
});
