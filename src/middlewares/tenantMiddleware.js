const tenantMiddleware = (req, res, next) => {
  // req.user is populated by authMiddleware
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Authentication required for tenant context' });
  }
  req.tenant = req.user.id; // Using User ID as Tenant ID for now
  next();
};

export default tenantMiddleware;
