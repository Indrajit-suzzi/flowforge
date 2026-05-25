import ContentType from '../models/contentType.js';

export const cacheControl = async (req, res, next) => {
  const modelName = req.params.modelName;
  if (!modelName) return next();

  try {
    const ct = await ContentType.findOne({ slug: modelName, tenantId: req.tenant });
    if (!ct || !ct.cacheTTL || ct.cacheTTL <= 0) return next();

    res.setHeader('Cache-Control', `public, max-age=${ct.cacheTTL}`);
    res.setHeader('Vary', 'Accept-Encoding');

    if (req.query.locale) {
      res.setHeader('Vary', 'Accept-Encoding, Accept-Language');
    }

    if (req.method === 'GET') {
      const { default: getModel } = await import('../models/genericModel.js');
      const typeMap = { String: String, Number: Number, Date: Date, Boolean: Boolean, RichText: String, Reference: String };
      const schema = Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String]));
      const Model = getModel(ct.name, schema);
      const lastEntry = await Model.findOne({ tenantId: req.tenant }).sort({ updatedAt: -1 }).select('updatedAt');
      if (lastEntry?.updatedAt) {
        const lastModified = lastEntry.updatedAt.toUTCString();
        res.setHeader('Last-Modified', lastModified);

        const ifModifiedSince = req.headers['if-modified-since'];
        if (ifModifiedSince) {
          const since = new Date(ifModifiedSince);
          if (lastEntry.updatedAt <= since) {
            return res.status(304).end();
          }
        }
      }
    }
  } catch {
    // Cache control is best-effort
  }

  next();
};
