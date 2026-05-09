# API Key Management (Phase 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement scoped API Key authentication for external app integration.

**Architecture:** Update `authMiddleware` to support `X-API-KEY`. Add `ApiKey` model and controller. Implement `scopeMiddleware` for granular access control.

**Tech Stack:** Node.js, Express, Mongoose, bcryptjs (for hashing keys).

---

### Task 1: ApiKey Model

**Files:**
- Create: `src/models/apiKey.js`

- [ ] **Step 1: Define ApiKey schema**
```javascript
import mongoose from 'mongoose';

const apiKeySchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true }, // Hashed
    keyPreview: { type: String, required: true }, // e.g. "flow_abc..."
    scopes: [{
        contentType: { type: String, required: true }, // e.g. "blog" or "*"
        permissions: [{ type: String, enum: ['read', 'write', 'delete'] }]
    }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

apiKeySchema.index({ tenantId: 1 });

export default mongoose.model('ApiKey', apiKeySchema);
```

- [ ] **Step 2: Commit**
```bash
git add src/models/apiKey.js
git commit -m "feat: add ApiKey model"
```

### Task 2: Unified Auth Middleware

**Files:**
- Modify: `src/middlewares/authMiddleware.js`

- [ ] **Step 1: Update authMiddleware to handle API keys**
```javascript
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
      // For performance, you'd ideally use a faster lookup than full bcrypt comparison on every request
      // But for Phase 1, we'll find by preview or similar if possible, or just hash and compare
      const keys = await ApiKey.find({ isActive: true });
      for (const apiKey of keys) {
        const isMatch = await bcrypt.compare(xApiKey, apiKey.key);
        if (isMatch) {
          req.tenant = apiKey.tenantId;
          req.apiKey = apiKey;
          return next();
        }
      }
      return res.status(401).json({ message: "Invalid API Key" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(401).json({ message: "Authentication required" });
};

export default authMiddleware;
```

- [ ] **Step 2: Commit**
```bash
git add src/middlewares/authMiddleware.js
git commit -m "feat: update auth middleware to support API keys"
```

### Task 3: Scope Middleware

**Files:**
- Create: `src/middlewares/scopeMiddleware.js`

- [ ] **Step 1: Create scope check logic**
```javascript
const scopeMiddleware = (requiredPermission) => (req, res, next) => {
  if (req.user) return next(); // Dashboard users have full access

  if (!req.apiKey) return res.status(403).json({ message: "Forbidden" });

  const modelName = req.params.modelName; // from dynamic routes
  const scopes = req.apiKey.scopes;

  const hasScope = scopes.find(s => 
    (s.contentType === '*' || s.contentType === modelName) && 
    s.permissions.includes(requiredPermission)
  );

  if (!hasScope) {
    return res.status(403).json({ message: `Insufficient permissions for ${modelName}` });
  }

  next();
};

export default scopeMiddleware;
```

- [ ] **Step 2: Commit**
```bash
git add src/middlewares/scopeMiddleware.js
git commit -m "feat: add scope middleware for API key permissions"
```

### Task 4: ApiKey Controller and Routes

**Files:**
- Create: `src/controllers/apiKeyController.js`
- Create: `src/routes/apiKeyRoutes.js`
- Modify: `src/app.js`

- [ ] **Step 1: Implement ApiKey creation with raw key return**
Generate raw key using `crypto.randomBytes(32).toString('hex')`. Hash with `bcrypt`.

- [ ] **Step 2: Mount routes at /api/v1/api-keys**

- [ ] **Step 3: Commit**
```bash
git add src/controllers/apiKeyController.js src/routes/apiKeyRoutes.js src/app.js
git commit -m "feat: add API key management routes and controller"
```

### Task 5: Secure Dynamic Routes

**Files:**
- Modify: `src/routes/dynamicRoutes.js`

- [ ] **Step 1: Apply scopeMiddleware to each operation**
- GET: `scopeMiddleware('read')`
- POST: `scopeMiddleware('write')`
- PUT: `scopeMiddleware('write')`
- DELETE: `scopeMiddleware('delete')`

- [ ] **Step 2: Commit**
```bash
git add src/routes/dynamicRoutes.js
git commit -m "feat: enforce scopes on dynamic routes"
```
