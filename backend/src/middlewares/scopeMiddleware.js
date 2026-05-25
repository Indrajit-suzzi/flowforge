const methodMap = { GET: 'read', POST: 'write', PUT: 'write', PATCH: 'write', DELETE: 'delete' };

export const scopeMiddleware = () => {
  return (req, res, next) => {
    if (!req.apiKey) return next();

    const method = req.method;
    const requiredPerm = methodMap[method] || 'read';

    const scopes = req.apiKey.scopes || [];
    const wildcard = scopes.find(s => s.contentType === '*');
    if (wildcard && wildcard.permissions.includes(requiredPerm)) return next();
    if (wildcard && wildcard.permissions.includes('write') && (requiredPerm === 'write' || requiredPerm === 'delete')) return next();

    const slug = req.params.modelName || req.params.slug || req.baseUrl.split('/').pop();
    const scope = scopes.find(s => s.contentType === slug);
    if (scope && scope.permissions.includes(requiredPerm)) return next();
    if (scope && scope.permissions.includes('write') && (requiredPerm === 'write' || requiredPerm === 'delete')) return next();

    return res.status(403).json({ error: 'API key does not have permission for this resource' });
  };
};
