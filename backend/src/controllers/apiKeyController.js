import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import ApiKey from '../models/apiKey.js';
import { logAudit } from '../utils/auditLogger.js';

export const create = async (req, res) => {
  try {
    const { name, scopes } = req.body;
    const rawKey = `flow_${crypto.randomBytes(32).toString('hex')}`;
    const hashedKey = await bcrypt.hash(rawKey, 10);
    const keyPreview = rawKey.slice(0, 12) + '...';

    const apiKey = await ApiKey.create({
      tenantId: req.tenant,
      name,
      key: hashedKey,
      keyPreview,
      scopes: scopes || [],
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
    const keys = await ApiKey.find({ tenantId: req.tenant });
    res.json(keys);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const key = await ApiKey.findOneAndDelete({ _id: req.params.id, tenantId: req.tenant });
    
    await logAudit({
      tenantId: req.tenant,
      userId: req.user?.id,
      action: 'delete_key',
      entityType: 'apiKey',
      entityId: key?._id.toString(),
      entityName: key?.name,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ message: "API key deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};