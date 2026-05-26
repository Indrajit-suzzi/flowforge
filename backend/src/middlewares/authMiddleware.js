import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import ApiKey from '../models/apiKey.js';
import User from '../models/user.js';
import logger from '../utils/logger.js';
import { seedDefaultRoles } from '../utils/seedRoles.js';

const clerkSecret = process.env.CLERK_SECRET_KEY;
const useClerk = clerkSecret && clerkSecret !== 'your_clerk_secret_key_here';

const resolveClerkUser = async (clerkId, sessionClaims) => {
  let user = await User.findOne({ clerkId });
  if (!user) {
    const email = sessionClaims?.email || sessionClaims?.private_email || `${clerkId}@clerk.placeholder`;
    user = await User.create({
      clerkId,
      username: clerkId.length > 30 ? clerkId.slice(0, 30) : clerkId,
      email,
      password: crypto.randomBytes(32).toString('hex'),
      role: 'member',
    });
    logger.info({ clerkId }, 'Auto-created local user for Clerk ID');
  }
  return user;
};

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
          const user = await resolveClerkUser(auth.userId, auth.sessionClaims);
          req.user = { id: user._id.toString(), clerkUserId: auth.userId };
          req.clerkSessionId = auth.sessionId;
          req.tenant = user._id.toString();
          req.userRole = auth.sessionClaims?.metadata?.role || auth.sessionClaims?.public_metadata?.role || user.role || 'member';
          seedDefaultRoles(req.tenant).catch(err => logger.error({ err }, 'seedDefaultRoles failed'));
          return next();
        }
      } catch {
        // Clerk session not available — try direct token verify below
      }

      try {
        const { verifyToken } = await import('@clerk/backend');
        const claims = await verifyToken(token, { secretKey: clerkSecret });
        const user = await resolveClerkUser(claims.sub, claims);
        req.user = { id: user._id.toString(), clerkUserId: claims.sub };
        req.clerkSessionId = claims.sid;
        req.tenant = user._id.toString();
        req.userRole = claims.metadata?.role || claims.public_metadata?.role || user.role || 'member';
        return next();
      } catch {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.id };
      req.tenant = decoded.id;
      req.userRole = decoded.role || 'member';
      seedDefaultRoles(req.tenant).catch(err => logger.error({ err }, 'seedDefaultRoles failed'));
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
        seedDefaultRoles(req.tenant).catch(err => logger.error({ err }, 'seedDefaultRoles failed'));
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
