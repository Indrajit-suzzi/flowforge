const hasDangerousKeys = (obj) => {
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
  if (hasDangerousKeys(req.params)) {
    return res.status(400).json({ error: 'URL parameters contain forbidden MongoDB operators' });
  }
  next();
};

export default sanitize;
