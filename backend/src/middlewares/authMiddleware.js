import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import ApiKey from '../models/apiKey.js';
import User from '../models/user.js';
import logger from '../utils/logger.js';
import { seedDefaultRoles } from '../utils/seedRoles.js';

const seededTenants = new Set();

const ensureRoles = (tenantId) => {
  if (!seededTenants.has(tenantId)) {
    seededTenants.add(tenantId);
    seedDefaultRoles(tenantId).catch(err => logger.error({ err }, 'seedDefaultRoles failed'));
  }
};

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const xApiKey = req.headers['x-api-key'];

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.jti) {
        const user = await User.findOne({ _id: decoded.id }, { activeSessions: 1 });
        if (!user) return res.status(401).json({ message: "User not found" });
        const session = user.activeSessions?.find(s => s.jti === decoded.jti);
        if (!session) return res.status(401).json({ message: "Session expired or revoked" });
      }
      req.user = { id: decoded.id, jti: decoded.jti };
      req.tenant = decoded.id;
      req.userRole = decoded.role || 'member';
      ensureRoles(req.tenant);
      return next();
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }
  }

  if (xApiKey) {
    try {
      const keyHash = crypto.createHash('sha256').update(xApiKey).digest('hex');
      let matchedKey = await ApiKey.findOne({ keyHash, isActive: true });
      if (!matchedKey) {
        const allKeys = await ApiKey.find({ isActive: true });
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
