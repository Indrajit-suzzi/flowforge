const adminPermissions = {
  contentTypes: true,
  contentEntries: true,
  apiKeys: true,
  analytics: true,
  auditLogs: true,
  webhooks: true,
  mediaLibrary: true,
  userManagement: true,
  systemSettings: true
};

const memberPermissions = {
  contentTypes: true,
  contentEntries: true,
  apiKeys: true,
  analytics: false,
  auditLogs: false,
  webhooks: false,
  mediaLibrary: true,
  userManagement: false,
  systemSettings: false
};

export const roleMiddleware = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (req.apiKey) {
        return next();
      }

      if (req.user && req.user.id) {
        const role = req.userRole || 'member';
        const permissions = role === 'admin' ? adminPermissions : memberPermissions;

        if (requiredPermission && !permissions[requiredPermission]) {
          return res.status(403).json({ message: "Insufficient permissions" });
        }

        return next();
      }

      return res.status(401).json({ message: "Authentication required" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
};

export const getRolePermissions = (role) => role === 'admin' ? adminPermissions : memberPermissions;
