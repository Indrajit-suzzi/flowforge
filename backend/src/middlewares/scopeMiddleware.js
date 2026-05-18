const scopeMiddleware = (requiredPermission) => (req, res, next) => {
  if (req.user) return next();

  if (!req.apiKey) return res.status(403).json({ message: "Forbidden" });

  const modelName = req.params.modelName;
  const scopes = req.apiKey.scopes;

  const hasScope = scopes.find(s =>
    (s.contentType === '*' || s.contentType === modelName) &&
    s.permissions.includes(requiredPermission)
  );

  if (!hasScope) {
    return res.status(403).json({ message: `Insufficient permissions for ${modelName}` });
  }

  next();
};

export default scopeMiddleware;
