import User from '../models/user.js';

const rolePermissions = {
  user: {
    contentTypes: true,
    contentEntries: true,
    apiKeys: true,
    analytics: true,
    auditLogs: false,
    webhooks: false,
    mediaLibrary: true,
    userManagement: false,
    systemSettings: false
  },
  subadmin: {
    contentTypes: true,
    contentEntries: true,
    apiKeys: true,
    analytics: true,
    auditLogs: true,
    webhooks: true,
    mediaLibrary: true,
    userManagement: false,
    systemSettings: false
  },
  admin: {
    contentTypes: true,
    contentEntries: true,
    apiKeys: true,
    analytics: true,
    auditLogs: true,
    webhooks: true,
    mediaLibrary: true,
    userManagement: true,
    systemSettings: true
  }
};

export const roleMiddleware = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // If authenticated via API key, allow access (API keys have their own scope permissions)
      if (req.apiKey) {
        return next();
      }

      // If authenticated via JWT token, check user roles
      if (req.user && req.user.id) {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (!user.isActive) return res.status(403).json({ message: "Account disabled" });

        req.userRole = user.role;
        req.userPermissions = user.permissions;

        if (requiredPermission && !user.permissions[requiredPermission]) {
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

export const getRolePermissions = (role) => rolePermissions[role] || rolePermissions.user;

export const applyDefaultPermissions = async (userId, role) => {
  const permissions = getRolePermissions(role);
  await User.findByIdAndUpdate(userId, { role, permissions });
};