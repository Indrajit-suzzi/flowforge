const stripNested = (obj) => {
  if (typeof obj === 'string') {
    return obj
      .replace(/\$where/g, '')
      .replace(/\$regex/g, '')
      .replace(/\$ne/g, '')
      .replace(/\$gt/g, '')
      .replace(/\$lt/g, '')
      .replace(/\$gte/g, '')
      .replace(/\$lte/g, '')
      .replace(/\$in/g, '')
      .replace(/\$nin/g, '')
      .replace(/\$exists/g, '')
      .trim();
  }
  if (Array.isArray(obj)) {
    return obj.map(stripNested);
  }
  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('$')) continue;
      sanitized[key] = stripNested(value);
    }
    return sanitized;
  }
  return obj;
};

const sanitize = (req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = stripNested(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = stripNested(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = stripNested(req.params);
  }
  next();
};

export default sanitize;
