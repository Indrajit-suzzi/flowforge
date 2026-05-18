const tenantMiddleware = (req, res, next) => {
  if (req.tenant) {
    return next();
  }
  if (req.user && req.user.id) {
    req.tenant = req.user.id;
    return next();
  }
  return res.status(401).json({ message: 'Authentication required for tenant context' });
};

export default tenantMiddleware;
