import ContentType from '../models/contentType.js';

const cache = new Map();
const TTL = 30000;

const key = (tenantId, slug) => `${tenantId}:${slug}`;

export const getContentType = async (tenantId, slug) => {
  const k = key(tenantId, slug);
  const entry = cache.get(k);
  if (entry && Date.now() < entry.expires) return entry.data;
  const ct = await ContentType.findOne({ slug, tenantId }).lean();
  if (ct) cache.set(k, { data: ct, expires: Date.now() + TTL });
  return ct;
};

export const getAllContentTypes = async (tenantId) => {
  const k = `all:${tenantId}`;
  const entry = cache.get(k);
  if (entry && Date.now() < entry.expires) return entry.data;
  const cts = await ContentType.find({ tenantId }).lean();
  cache.set(k, { data: cts, expires: Date.now() + TTL });
  for (const ct of cts) {
    cache.set(key(tenantId, ct.slug), { data: ct, expires: Date.now() + TTL });
  }
  return cts;
};

export const invalidateContentType = (tenantId, slug) => {
  if (slug) cache.delete(key(tenantId, slug));
  cache.delete(`all:${tenantId}`);
};

export const invalidateAll = (tenantId) => {
  for (const k of cache.keys()) {
    if (k.startsWith(`${tenantId}:`) || k.startsWith(`all:${tenantId}`)) cache.delete(k);
  }
};
