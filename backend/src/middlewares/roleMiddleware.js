import Role from '../models/role.js';

const hardcodedPermissions = {
  admin: {
    contentTypes: true, contentEntries: true, apiKeys: true,
    analytics: true, auditLogs: true, webhooks: true,
    mediaLibrary: true, userManagement: true, systemSettings: true, roles: true
  },
  member: {
    contentTypes: true, contentEntries: true, apiKeys: true,
    analytics: false, auditLogs: false, webhooks: false,
    mediaLibrary: true, userManagement: false, systemSettings: false, roles: false
  }
};

const permissionCache = {};

export const roleMiddleware = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (req.apiKey) return next();

      if (req.user && req.user.id) {
        const roleSlug = req.userRole || 'member';

        let permissions = permissionCache[`${req.tenant}-${roleSlug}`];
        if (!permissions) {
          const role = await Role.findOne({ tenantId: req.tenant, slug: roleSlug });
          permissions = role?.permissions?.toObject?.() || hardcodedPermissions[roleSlug] || hardcodedPermissions.member;
          permissionCache[`${req.tenant}-${roleSlug}`] = permissions;
        }

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

export const getRolePermissions = async (tenantId, roleSlug) => {
  const role = await Role.findOne({ tenantId, slug: roleSlug });
  return role?.permissions?.toObject?.() || hardcodedPermissions[roleSlug] || hardcodedPermissions.member;
};
