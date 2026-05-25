const DANGEROUS_KEYS = ['$where', '$regex', '$ne', '$gt', '$lt', '$gte', '$lte', '$in', '$nin', '$exists'];

const hasDangerousKeys = (obj) => {
  if (typeof obj === 'string') {
    return DANGEROUS_KEYS.some(k => obj.includes(k));
  }
  if (Array.isArray(obj)) {
    return obj.some(hasDangerousKeys);
  }
  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$')) return true;
      if (hasDangerousKeys(obj[key])) return true;
    }
  }
  return false;
};

const sanitize = (req, res, next) => {
  if (hasDangerousKeys(req.body)) {
    return res.status(400).json({ error: 'Request body contains forbidden MongoDB operators' });
  }
  if (hasDangerousKeys(req.query)) {
    return res.status(400).json({ error: 'Query contains forbidden MongoDB operators' });
  }
  next();
};

export default sanitize;
