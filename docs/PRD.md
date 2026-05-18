# Product Requirements Document: FlowForge

## Document Info
- **Version:** 1.0.0
- **Created:** 2026-05-18
- **Status:** Active

---

## 1. Product Overview

**FlowForge** is a multi-tenant headless CMS backend with dynamic schema generation, scoped API key management, and a web-based admin dashboard. It enables developers and content teams to define custom content types, manage content entries, and expose data via a secure REST API — all without writing backend code.

### Vision
A reusable, self-hosted CMS platform that combines the flexibility of a headless CMS with multi-tenant SaaS architecture.

---

## 2. Target Users

| Persona | Description |
|---|---|
| **Developers** | Integrate FlowForge API into frontend apps, mobile apps, or third-party services |
| **Content Managers** | Use the admin dashboard to define content types and manage entries |
| **Admins/Owners** | Manage tenants, API keys, and monitor system usage |

---

## 3. Architecture

### Backend (Completed)
- **Runtime:** Node.js 20, Express 5
- **Database:** MongoDB with Mongoose ODM
- **Auth:** JWT (user dashboard) + API Keys (external apps)
- **Multi-tenancy:** Shared DB with `tenantId` discriminator
- **Dynamic Schemas:** Runtime model generation from ContentType definitions

### Frontend (In Progress)
- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **State:** React Context + hooks
- **Routing:** React Router v6
- **HTTP Client:** Axios

---

## 4. Completed Features (Phase 1 & 2)

### 4.1 Authentication
- [x] User registration with bcrypt password hashing
- [x] Login with JWT token (1h expiry)
- [x] Protected routes with JWT middleware
- [x] API Key authentication via `X-API-KEY` header
- [x] Unified auth middleware supporting both JWT and API keys

### 4.2 Multi-Tenancy
- [x] Tenant middleware injecting `req.tenant` from JWT/API key
- [x] All CRUD operations scoped to tenant automatically
- [x] Tenant isolation enforced at model and controller level

### 4.3 Content Type Management
- [x] Define custom content types with name, slug, and fields
- [x] Field types: String, Number, Date, Boolean
- [x] Unique slug per tenant
- [x] CRUD API at `/api/v1/content-types`

### 4.4 Dynamic Content CRUD
- [x] Runtime model generation from ContentType definitions
- [x] Dynamic routes at `/api/v1/dynamic/:modelName`
- [x] Scope enforcement for API key access

### 4.5 API Key Management
- [x] Generate scoped API keys with one-time raw key display
- [x] Granular scopes: per content type with read/write/delete permissions
- [x] Wildcard scope (`*`) for full access
- [x] CRUD API at `/api/v1/api-keys`

---

## 5. Proposed Future Features

### Phase 3: Core Enhancements
| Feature | Description | Priority |
|---|---|---|
| **Field Type Expansion** | Add RichText, Image, File, Relation, JSON, Enum types | High |
| **Validation Rules** | Min/max length, regex patterns, unique fields, custom validators | High |
| **Pagination & Filtering** | Query params: `page`, `limit`, `sort`, `filter[field]=value` | High |
| **Soft Deletes** | `deletedAt` field instead of hard delete | Medium |
| **Content Versioning** | Track changes to content entries with revision history | Medium |
| **Webhooks** | Trigger HTTP callbacks on create/update/delete events | Medium |

### Phase 4: Developer Experience
| Feature | Description | Priority |
|---|---|---|
| **API Documentation** | Auto-generated OpenAPI/Swagger docs per tenant | High |
| **Rate Limiting** | Per-API-key rate limits to prevent abuse | High |
| **Bulk Operations** | Bulk create, update, delete endpoints | Medium |
| **Import/Export** | CSV/JSON import and export for content entries | Medium |
| **GraphQL Support** | Optional GraphQL layer alongside REST | Low |

### Phase 5: Admin & Operations
| Feature | Description | Priority |
|---|---|---|
| **Role-Based Access Control** | Admin, Editor, Viewer roles per tenant | High |
| **Audit Logging** | Track who did what and when | Medium |
| **Analytics Dashboard** | API usage stats, content metrics | Low |
| **Tenant Management** | Super-admin panel for managing all tenants | Low |
| **Backup & Restore** | Automated database backups per tenant | Low |

### Phase 6: Advanced
| Feature | Description | Priority |
|---|---|---|
| **Media Library** | File upload with S3/cloud storage integration | High |
| **Draft & Publish** | Content workflow with draft/published states | Medium |
| **Localization** | Multi-language content support | Medium |
| **Plugins System** | Extensible plugin architecture | Low |
| **Real-time Updates** | WebSocket/SSE for live content updates | Low |

---

## 6. API Reference

### Base URLs
- Auth: `/api/auth`
- Content Types: `/api/v1/content-types`
- Dynamic Content: `/api/v1/dynamic/:modelName`
- API Keys: `/api/v1/api-keys`

### Authentication
| Method | Header | Purpose |
|---|---|---|
| JWT | `Authorization: Bearer <token>` | Dashboard users |
| API Key | `X-API-KEY: flow_<key>` | External applications |

### Key Endpoints

#### Auth
```
POST /api/auth/register   { username, email, password }
POST /api/auth/login      { email, password } → { token }
```

#### Content Types
```
POST   /api/v1/content-types       Create content type definition
GET    /api/v1/content-types       List all content types (tenant-scoped)
GET    /api/v1/content-types/:id   Get single content type
PUT    /api/v1/content-types/:id   Update content type
DELETE /api/v1/content-types/:id   Delete content type
```

#### Dynamic Content
```
POST   /api/v1/dynamic/:slug       Create entry (scope: write)
GET    /api/v1/dynamic/:slug       List entries (scope: read)
GET    /api/v1/dynamic/:slug/:id   Get entry (scope: read)
PUT    /api/v1/dynamic/:slug/:id   Update entry (scope: write)
DELETE /api/v1/dynamic/:slug/:id   Delete entry (scope: delete)
```

#### API Keys
```
POST   /api/v1/api-keys       Create key (returns raw key once)
GET    /api/v1/api-keys       List keys (tenant-scoped)
DELETE /api/v1/api-keys/:id   Delete key
```

---

## 7. Data Models

### User
```
{ username, email, password (hashed), timestamps }
```

### ContentType
```
{ tenantId, name, slug, fields: [{ name, type, required }], timestamps }
```

### ApiKey
```
{ tenantId, name, key (hashed), keyPreview, scopes: [{ contentType, permissions }], isActive, timestamps }
```

### Dynamic Content (runtime)
```
{ tenantId, ...customFields, timestamps }
```

---

## 8. Security Considerations

- Passwords hashed with bcrypt (cost factor 10)
- API keys hashed with bcrypt, raw key shown only once at creation
- JWT expiry: 1 hour
- All queries scoped to `tenantId` — cross-tenant data leakage prevented
- API key scopes restrict operations per content type
- CORS enabled (configure allowed origins for production)

---

## 9. Deployment

### Docker
```bash
docker-compose up -d
```

### Environment Variables
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/flowforge
JWT_SECRET=<your-secret>
```

---

## 10. Frontend Requirements

### Pages
1. **Login / Register** — Auth forms with validation
2. **Dashboard** — Overview with content type list, recent activity
3. **Content Types** — CRUD UI for defining schemas with field builder
4. **Content Entries** — Dynamic forms generated from content type definitions
5. **API Keys** — Generate, view, revoke keys with scope selector
6. **Settings** — Profile, password change

### UX Principles
- Forms auto-generate from content type definitions
- Inline validation with clear error messages
- Confirmation dialogs for destructive actions
- Copy-to-clipboard for API keys
- Responsive design (mobile-friendly)

---

## 11. Success Metrics

- Zero cross-tenant data leaks
- API response time < 200ms for CRUD operations
- Support 100+ concurrent tenants
- Frontend page load < 2s

---

## 12. Changelog

| Version | Date | Changes |
|---|---|---|
| 1.0.0 | 2026-05-18 | Initial PRD covering Phase 1-2 completion and Phase 3+ roadmap |
