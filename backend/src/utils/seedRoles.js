import Role from '../models/role.js';
import logger from './logger.js';

const defaultRoles = [
  {
    name: 'Admin',
    slug: 'admin',
    description: 'Full access to all features',
    isSystem: true,
    permissions: {
      contentTypes: true, contentEntries: true, apiKeys: true,
      analytics: true, auditLogs: true, webhooks: true,
      mediaLibrary: true, userManagement: true, systemSettings: true, roles: true
    }
  },
  {
    name: 'Member',
    slug: 'member',
    description: 'Standard access to content and media',
    isSystem: true,
    permissions: {
      contentTypes: true, contentEntries: true, apiKeys: true,
      analytics: false, auditLogs: false, webhooks: false,
      mediaLibrary: true, userManagement: false, systemSettings: false, roles: false
    }
  }
];

export const seedDefaultRoles = async (tenantId) => {
  for (const roleData of defaultRoles) {
    const existing = await Role.findOne({ tenantId, slug: roleData.slug });
    if (!existing) {
      await Role.create({ ...roleData, tenantId });
      logger.info({ role: roleData.name, tenant: tenantId }, 'Default role created');
    }
  }
};
