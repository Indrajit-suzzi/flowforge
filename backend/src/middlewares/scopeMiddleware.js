const PERM_HIERARCHY = { read: 1, write: 2, delete: 1 };
const methodMap = { GET: 'read', POST: 'write', PUT: 'write', PATCH: 'write', DELETE: 'delete' };

const hasPermission = (permissions, required) => {
  const level = Math.max(...permissions.map(p => PERM_HIERARCHY[p] || 0));
  const requiredLevel = PERM_HIERARCHY[required] || 0;
  return level >= requiredLevel;
};

export const scopeMiddleware = () => {
  return (req, res, next) => {
    if (!req.apiKey) return next();

    const requiredPerm = methodMap[req.method] || 'read';
    const scopes = req.apiKey.scopes || [];

    const wildcard = scopes.find(s => s.contentType === '*');
    if (wildcard && hasPermission(wildcard.permissions, requiredPerm)) return next();

    const slug = req.params.modelName || req.params.slug || req.baseUrl.split('/').pop();
    const scope = scopes.find(s => s.contentType === slug);
    if (scope && hasPermission(scope.permissions, requiredPerm)) return next();

    return res.status(403).json({ error: 'API key does not have permission for this resource' });
  };
};
