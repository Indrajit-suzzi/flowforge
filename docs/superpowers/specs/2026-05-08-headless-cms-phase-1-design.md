# Spec: SaaS-Level Headless CMS (Phase 1)

## Overview
Transform existing generic CRUD backend into a multi-tenant Headless CMS.

## Architecture
- **Multi-tenancy:** Shared database with discriminator (`tenantId`).
- **Isolation:** Middleware-level injection of `tenantId` into request object.
- **Dynamic Content:** A central `ContentType` registry to define custom schemas per tenant.

## Components

### 1. Middlewares
- **Tenant Middleware (`src/middlewares/tenantMiddleware.js`):**
    - Extract `tenantId` from `req.user` (populated by `authMiddleware`).
    - Attach to `req.tenant`.
    - Reject if missing on protected routes.

### 2. Models
- **ContentType Model (`src/models/contentType.js`):**
    - `tenantId` (ObjectId, ref: 'User')
    - `name` (String, e.g., "Blog Post")
    - `slug` (String, e.g., "blog-post")
    - `fields` (Array of field objects: `{ name, type, required }`)
- **Dynamic Content:** Use existing `genericModel` factory but ensure every document includes `tenantId`.

### 3. Controllers
- **Generic Controller (`src/controllers/genericController.js`):**
    - Update all CRUD methods:
        - `create`: Inject `req.tenant` into body.
        - `getAll`/`getOne`: Add `{ tenantId: req.tenant }` to filter.
        - `update`/`remove`: Ensure document belongs to `req.tenant` before action.

## Data Flow
1. Client registers/logins -> Receives JWT containing `tenantId`.
2. Client defines "Product" content type -> Saved to `ContentType` collection with `tenantId`.
3. Client posts "Product" entry -> Saved to dynamic collection with `tenantId`.
4. Client fetches entries -> Returns only those matching their `tenantId`.

## Success Criteria
- [ ] User A cannot see User B's content types.
- [ ] User A cannot see User B's content entries.
- [ ] CRUD operations automatically handle tenant isolation without explicit client-side filtering.
