import Role from '../models/role.js';

const hardcodedPermissions = {
  admin: {
    contentTypes: true, contentEntries: true, apiKeys: true,
    analytics: true, auditLogs: true, webhooks: true,
    mediaLibrary: true, userManagement: true, systemSettings: true,
    roles: true, branding: true
  },
  member: {
    contentTypes: true, contentEntries: true, apiKeys: true,
    analytics: false, auditLogs: false, webhooks: false,
    mediaLibrary: true, userManagement: false, systemSettings: false,
    roles: false, branding: false
  }
};

const CACHE_TTL = 60_000;
const permissionCache = new Map();

export const invalidateRolePermissions = (tenantId, roleSlug = null) => {
  if (roleSlug) {
    permissionCache.delete(`${tenantId}-${roleSlug}`);
    return;
  }
  for (const key of permissionCache.keys()) {
    if (key.startsWith(`${tenantId}-`)) permissionCache.delete(key);
  }
};

const getCachedPermissions = async (tenantId, roleSlug) => {
  const key = `${tenantId}-${roleSlug}`;
  const cached = permissionCache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.permissions;
  }
  const role = await Role.findOne({ tenantId, slug: roleSlug });
  const permissions = role?.permissions?.toObject?.() || hardcodedPermissions[roleSlug] || hardcodedPermissions.member;
  permissionCache.set(key, { permissions, ts: Date.now() });
  return permissions;
};

export const roleMiddleware = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (req.apiKey) {
        const scopePerm = scopeToPermission(requiredPermission);
        if (scopePerm && !hasScopePermission(req.apiKey, scopePerm)) {
          return res.status(403).json({ message: 'Insufficient permissions' });
        }
        return next();
      }

      if (req.user && req.user.id) {
        const roleSlug = req.userRole || 'member';
        const permissions = await getCachedPermissions(req.tenant, roleSlug);

        if (requiredPermission && !permissions[requiredPermission]) {
          return res.status(403).json({ message: 'Insufficient permissions' });
        }

        req.permissions = permissions;
        return next();
      }

      return res.status(401).json({ message: 'Authentication required' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
};

const scopeToPermission = (perm) => {
  const map = {
    contentTypes: 'write', contentEntries: 'write', apiKeys: 'write',
    analytics: 'read', auditLogs: 'read', webhooks: 'write',
    mediaLibrary: 'write', userManagement: 'write', roles: 'write',
    branding: 'write', systemSettings: 'write'
  };
  return map[perm] || 'write';
};

const hasScopePermission = (apiKey, requiredPerm) => {
  const scopes = apiKey.scopes || [];
  for (const scope of scopes) {
    if (scope.contentType === '*') {
      if (scope.permissions.includes(requiredPerm)) return true;
      if (scope.permissions.includes('write') && (requiredPerm === 'write' || requiredPerm === 'delete')) return true;
    }
  }
  return false;
};

export const getRolePermissions = async (tenantId, roleSlug) => {
  const role = await Role.findOne({ tenantId, slug: roleSlug });
  return role?.permissions?.toObject?.() || hardcodedPermissions[roleSlug] || hardcodedPermissions.member;
};
