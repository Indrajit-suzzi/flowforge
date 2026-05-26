import Role from '../models/role.js';
import logger from './logger.js';

export const runSeed = async (tenantId) => {
  if (tenantId) {
    await Role.deleteMany({ tenantId, isSystem: true });
    const { seedDefaultRoles } = await import('./seedRoles.js');
    await seedDefaultRoles(tenantId);
    logger.info({ tenant: tenantId }, 'Roles re-seeded for tenant');
    return;
  }

  const tenants = await Role.distinct('tenantId');
  await Role.deleteMany({ isSystem: true });
  const { seedDefaultRoles } = await import('./seedRoles.js');
  for (const tid of tenants) {
    await seedDefaultRoles(tid);
  }
  logger.info('Database re-seeded for all tenants');
};
