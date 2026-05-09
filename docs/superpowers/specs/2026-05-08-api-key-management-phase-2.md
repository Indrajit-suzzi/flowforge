# Spec: API Key Management (Phase 2)

## Overview
Enable external applications to interact with the Headless CMS using scoped API keys.

## Architecture
- **Unified Authentication:** `authMiddleware` updated to support both JWT and API Keys.
- **Header:** API Keys are passed via `X-API-KEY`.
- **Granular Scopes:** Keys can be restricted to specific content types and operations.

## Components

### 1. Models
- **ApiKey Model (`src/models/apiKey.js`):**
    - `tenantId` (ObjectId, ref: 'User')
    - `name` (String)
    - `key` (String, Hashed)
    - `keyPreview` (String, e.g., "flow_...")
    - `scopes` (Array of objects: `{ contentType: String, permissions: [String] }`)
    - `isActive` (Boolean)

### 2. Middlewares
- **Updated Auth Middleware (`src/middlewares/authMiddleware.js`):**
    - Logic: 
        1. Check `Authorization` (JWT). If valid, set `req.user` and proceed.
        2. Else, check `X-API-KEY`. 
        3. If key exists, hash it and verify in `ApiKey` collection.
        4. If valid, set `req.tenant = apiKey.tenantId` and `req.apiKey = apiKey`.
        5. proceed.
- **Scope Middleware (`src/middlewares/scopeMiddleware.js`):**
    - Verify `req.apiKey.scopes` allows the requested operation on the requested content type.

### 3. Controllers
- **ApiKey Controller (`src/controllers/apiKeyController.js`):**
    - `create`: Generate a random string, hash it, save hashed version, return raw key to user *once*.
    - `getAll`/`remove`: Standard generic operations scoped to `tenantId`.

## Success Criteria
- [ ] Users can generate multiple API keys.
- [ ] External apps can GET/POST data using `X-API-KEY`.
- [ ] API keys correctly isolate data by `tenantId`.
- [ ] API keys cannot perform operations outside their defined `scopes`.
