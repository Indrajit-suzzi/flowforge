# SaaS-Level Headless CMS (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the backend into a multi-tenant Headless CMS with dynamic content types and tenant isolation.

**Architecture:** Shared MongoDB database using a `tenantId` discriminator. Middleware extracts `tenantId` from JWT and scopes all CRUD operations in a generic controller.

**Tech Stack:** Node.js, Express, Mongoose, Joi, JWT.

---

### Task 1: Tenant Middleware

**Files:**
- Create: `src/middlewares/tenantMiddleware.js`
- Modify: `src/app.js`

- [ ] **Step 1: Create tenant middleware**
```javascript
const tenantMiddleware = (req, res, next) => {
    // req.user is populated by authMiddleware
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Authentication required for tenant context' });
    }
    req.tenant = req.user.id; // Using User ID as Tenant ID for now
    next();
};

module.exports = tenantMiddleware;
```

- [ ] **Step 2: Mount middleware in app.js**
Modify `src/app.js` to use `tenantMiddleware` on dynamic routes.

- [ ] **Step 3: Commit**
```bash
git add src/middlewares/tenantMiddleware.js src/app.js
git commit -m "feat: add tenant middleware for request scoping"
```

### Task 2: ContentType Model

**Files:**
- Create: `src/models/contentType.js`

- [ ] **Step 1: Define ContentType schema**
```javascript
const mongoose = require('mongoose');

const contentTypeSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    fields: [{
        name: { type: String, required: true },
        type: { type: String, enum: ['String', 'Number', 'Date', 'Boolean'], required: true },
        required: { type: Boolean, default: false }
    }]
}, { timestamps: true });

// Ensure slug is unique per tenant
contentTypeSchema.index({ tenantId: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('ContentType', contentTypeSchema);
```

- [ ] **Step 2: Commit**
```bash
git add src/models/contentType.js
git commit -m "feat: add ContentType model for custom schemas"
```

### Task 3: Tenant-Aware Generic Controller

**Files:**
- Modify: `src/controllers/genericController.js`

- [ ] **Step 1: Update getAll to filter by tenant**
Modify `getAll` to include `{ tenantId: req.tenant }`.

- [ ] **Step 2: Update create to inject tenantId**
Modify `create` to set `req.body.tenantId = req.tenant`.

- [ ] **Step 3: Update getOne, update, and remove**
Ensure all queries include `tenantId`.

- [ ] **Step 4: Commit**
```bash
git add src/controllers/genericController.js
git commit -m "feat: make generic controller tenant-aware"
```

### Task 4: Dynamic Model Enhancement

**Files:**
- Modify: `src/models/genericModel.js`

- [ ] **Step 1: Ensure tenantId in dynamic schemas**
Update `getModel` to always include a `tenantId` field in the generated schema.

- [ ] **Step 2: Commit**
```bash
git add src/models/genericModel.js
git commit -m "feat: ensure dynamic models include tenantId"
```

### Task 5: ContentType API Routes

**Files:**
- Create: `src/routes/contentTypeRoutes.js`
- Modify: `src/app.js`

- [ ] **Step 1: Create ContentType routes**
Use `genericController` with the `ContentType` model.

- [ ] **Step 2: Mount routes in app.js**
Mount at `/api/v1/content-types`.

- [ ] **Step 3: Commit**
```bash
git add src/routes/contentTypeRoutes.js src/app.js
git commit -m "feat: add API routes for content type management"
```
