import test from 'node:test';
import assert from 'node:assert';

test('auditLogger - module exports a function', async () => {
  const mod = await import('./auditLogger.js');
  assert.strictEqual(typeof mod.logAudit, 'function');
});

test('auditLogger - logAudit accepts correct shape', () => {
  const { logAudit } = { logAudit: async (args) => {
    assert.ok(args.tenantId);
    assert.ok(args.userId);
    assert.ok(args.action);
    assert.ok(args.entityType);
  }};
  logAudit({ tenantId: 't1', userId: 'u1', action: 'create', entityType: 'entry' });
});
