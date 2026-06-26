import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import ApiKey from '../models/apiKey.js';
import User from '../models/user.js';
import logger from '../utils/logger.js';
import { seedDefaultRoles } from '../utils/seedRoles.js';

const seededTenants = new Set();

const ensureRoles = (tenantId) => {
  if (User.db.readyState !== 1) return;
  if (!seededTenants.has(tenantId)) {
    seededTenants.add(tenantId);
    seedDefaultRoles(tenantId).catch(err => logger.error({ err }, 'seedDefaultRoles failed'));
  }
};

const authMiddleware = async (req, res, next) => {
  if (req.user || req.apiKey) return next();

  const authHeader = req.headers.authorization;
  const xApiKey = req.headers['x-api-key'];

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.jti) {
        const user = await User.findOne(
          { _id: decoded.id },
          { activeSessions: 1, role: 1, tenantId: 1, isActive: 1 },
        ).lean();
        if (!user) return res.status(401).json({ message: "User not found" });
        if (!user.isActive) return res.status(403).json({ message: "Account is disabled" });
        const session = user.activeSessions?.find(s => s.jti === decoded.jti);
        if (!session) return res.status(401).json({ message: "Session expired or revoked" });
        req.userRole = user.role || 'member';
        req.tenant = user.tenantId || user._id.toString();
        if (!user.tenantId) {
          User.updateOne({ _id: user._id }, { $set: { tenantId: req.tenant } })
            .catch(err => logger.error({ err }, 'Tenant backfill failed'));
        }
      } else {
        // Legacy tokens predate server-side sessions. Newly issued tokens always use jti.
        req.userRole = decoded.role || 'member';
        req.tenant = decoded.tenantId || decoded.id;
      }
      req.user = { id: decoded.id, jti: decoded.jti };
      ensureRoles(req.tenant);
      return next();
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }
  }

  if (xApiKey) {
    try {
      const keyHash = crypto.createHash('sha256').update(xApiKey).digest('hex');
      let matchedKey = await ApiKey.findOne({ keyHash, isActive: true }).select('+key +keyHash');
      if (!matchedKey) {
        const allKeys = await ApiKey.find({ isActive: true }).select('+key +keyHash');
        for (const k of allKeys) {
          if (await bcrypt.compare(xApiKey, k.key)) {
            matchedKey = k;
            if (!k.keyHash) {
              await ApiKey.updateOne({ _id: k._id }, { keyHash });
            }
            break;
          }
        }
      }
      if (matchedKey) {
        req.tenant = matchedKey.tenantId.toString();
        req.apiKey = matchedKey;
        req.apiKeyId = matchedKey._id;
        ensureRoles(req.tenant);
        return next();
      }
      return res.status(401).json({ message: "Invalid API Key" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(401).json({ message: "Authentication required. Use 'Authorization: Bearer <token>' or 'X-API-Key: <key>'" });
};

export default authMiddleware;
