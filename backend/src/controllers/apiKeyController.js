import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import ApiKey from '../models/apiKey.js';
import { logAudit } from '../utils/auditLogger.js';

export const create = async (req, res) => {
  try {
    const { name, scopes, rateLimit } = req.body;
    const hasWildcard = scopes?.some(s => s.contentType === '*');
    if (hasWildcard && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create API keys with wildcard scope' });
    }
    const rawKey = `flow_${crypto.randomBytes(32).toString('hex')}`;
    const hashedKey = await bcrypt.hash(rawKey, 10);
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const keyPreview = rawKey.slice(0, 12) + '...';

    const apiKey = await ApiKey.create({
      tenantId: req.tenant,
      name,
      key: hashedKey,
      keyHash,
      keyPreview,
      scopes: scopes || [],
      rateLimit: rateLimit || { maxRequests: 100, windowMs: 60000 },
    });

    await logAudit({
      tenantId: req.tenant,
      userId: req.user?.id,
      action: 'create_key',
      entityType: 'apiKey',
      entityId: apiKey._id.toString(),
      entityName: name,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({
      message: "API key created",
      key: rawKey,
      apiKey: {
        id: apiKey._id,
        name: apiKey.name,
        keyPreview: apiKey.keyPreview,
        scopes: apiKey.scopes,
        isActive: apiKey.isActive,
        createdAt: apiKey.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const keys = await ApiKey.find({ tenantId: req.tenant }).lean();
    const { getKeyRateUsage } = await import('../middlewares/keyRateLimit.js');
    const withUsage = keys.map(k => {
      const usage = getKeyRateUsage(k._id);
      return { ...k, rateUsage: usage };
    });
    res.json(withUsage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const key = await ApiKey.findOneAndDelete({ _id: req.params.id, tenantId: req.tenant });
    if (!key) return res.status(404).json({ message: "API key not found" });
    await logAudit({
      tenantId: req.tenant,
      userId: req.user?.id,
      action: 'delete_key',
      entityType: 'apiKey',
      entityId: key._id.toString(),
      entityName: key.name,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    res.json({ message: "API key deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUsage = async (req, res) => {
  try {
    const key = await ApiKey.findOne({ _id: req.params.id, tenantId: req.tenant });
    if (!key) return res.status(404).json({ message: 'API key not found' });

    const days = parseInt(req.query.days) || 7;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const KeyUsage = (await import('../models/keyUsage.js')).default;
    const raw = await KeyUsage.find({ keyId: key._id, timestamp: { $gte: since } }).sort({ timestamp: 1 }).lean();

    const byDay = {};
    const byEndpoint = {};
    for (const r of raw) {
      const day = r.timestamp.toISOString().slice(0, 10);
      byDay[day] = (byDay[day] || 0) + 1;
      const ep = `${r.method} ${r.path}`;
      byEndpoint[ep] = (byEndpoint[ep] || 0) + 1;
    }

    res.json({
      total: raw.length,
      days,
      byDay: Object.entries(byDay).map(([date, count]) => ({ date, count })),
      byEndpoint: Object.entries(byEndpoint).map(([endpoint, count]) => ({ endpoint, count })).sort((a, b) => b.count - a.count)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
