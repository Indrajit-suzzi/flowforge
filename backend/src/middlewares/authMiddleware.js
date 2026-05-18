import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import ApiKey from '../models/apiKey.js';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const xApiKey = req.headers['x-api-key'];

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      req.tenant = decoded.id;
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