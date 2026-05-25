import test from 'node:test';
import assert from 'node:assert';
import getModel from './genericModel.js';

test('getModel includes tenantId in schema', () => {
  const schemaDefinition = {
    title: { type: String, required: true }
  };
  // Use a unique name to avoid cache issues in tests if they run multiple times
  const model = getModel('TestModel_TenantCheck', schemaDefinition);
  
  const tenantIdField = model.schema.paths.tenantId;
  assert.ok(tenantIdField, 'tenantId field should exist');
  assert.strictEqual(tenantIdField.instance, 'ObjectId');
  assert.strictEqual(tenantIdField.options.required, true);
  assert.strictEqual(tenantIdField.options.ref, 'User');
});
