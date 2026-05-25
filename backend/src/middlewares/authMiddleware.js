import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import ApiKey from '../models/apiKey.js';
import { seedDefaultRoles } from '../utils/seedRoles.js';

const clerkSecret = process.env.CLERK_SECRET_KEY;
const useClerk = clerkSecret && clerkSecret !== 'your_clerk_secret_key_here';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const xApiKey = req.headers['x-api-key'];

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    if (useClerk) {
      try {
        const { getAuth } = await import('@clerk/express');
        const auth = getAuth(req);
        if (auth.userId) {
          req.user = { id: auth.userId };
          req.tenant = auth.userId;
          req.userRole = auth.sessionClaims?.metadata?.role || auth.sessionClaims?.public_metadata?.role || 'member';
          seedDefaultRoles(req.tenant).catch(() => {});
          return next();
        }
      } catch {
        // Fall through to direct token verification below.
      }

      try {
        const { verifyToken } = await import('@clerk/backend');
        const claims = await verifyToken(token, { secretKey: clerkSecret });
        req.user = { id: claims.sub };
        req.tenant = claims.sub;
        req.userRole = claims.metadata?.role || claims.public_metadata?.role || 'member';
        return next();
      } catch (err) {
        return res.status(401).json({
          message: "Invalid token",
          reason: process.env.NODE_ENV === 'production' ? undefined : err.reason || err.message
        });
      }
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.id };
      req.tenant = decoded.id;
      req.userRole = decoded.role || 'member';
      seedDefaultRoles(req.tenant).catch(() => {});
      return next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  }

  if (xApiKey) {
    try {
      const keys = await ApiKey.find({ isActive: true });
      for (const apiKey of keys) {
        const isMatch = await bcrypt.compare(xApiKey, apiKey.key);
        if (isMatch) {
          req.tenant = apiKey.tenantId.toString();
          req.apiKey = apiKey;
          req.apiKeyId = apiKey._id;
          seedDefaultRoles(req.tenant).catch(() => {});
          return next();
        }
      }
      return res.status(401).json({ message: "Invalid API Key" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(401).json({ message: "Authentication required. Use 'Authorization: Bearer <token>' or 'X-API-Key: <key>'" });
};

export default authMiddleware;
