# FlowForge

A multi-tenant headless CMS with dynamic schema generation, API key management, role-based access control, GraphQL, forms builder, and a React admin dashboard.

## Features

### Content Management
- **Dynamic Schema Generation** — Create content types on the fly with 7 field types (String, Number, Date, Boolean, RichText, Reference)
- **Draft/Publish/Scheduled Workflow** — Content versioning with publish scheduling and auto-publish scheduler
- **Content Versioning** — Track changes, view diffs, rollback to any previous version
- **Localization** — Multi-language content with per-field translation editor
- **Soft Deletes & Trash** — Move to trash with restore and permanent delete
- **Bulk Operations** — Select, publish, unpublish, or bulk-edit multiple entries
- **Duplicate Entries** — One-click content duplication
- **Import/Export** — JSON import and export for content entries and schemas
- **Search** — Cross-content-type search with regex matching
- **Content Calendar** — Calendar view of published, scheduled, and created entries

### Developer Experience
- **REST API** — Full CRUD with pagination, filtering, sorting, caching
- **GraphQL Endpoint** — Query and mutation support with interactive playground
- **API Key Management** — Scoped keys with per-content-type read/write/delete permissions + rate limiting
- **Webhooks** — Trigger external endpoints on content events with conditions, retries, and delivery logs
- **Interactive API Docs** — Auto-generated documentation per tenant
- **Field Validation** — Min/max length, regex patterns, required fields, default values
- **Cache Control** — HTTP cache headers with ETag/304 support

### Admin & Operations
- **Role-Based Access Control** — Custom roles with granular feature-level permissions (DB-backed)
- **Audit Logs** — Track all actions with CSV export
- **Analytics** — API usage stats with top endpoints and period filtering
- **Forms Builder** — Create public-facing forms with field builder and submission viewer
- **Tags** — Color-coded tagging across all content types
- **Entry Locking** — Cooperative editing with automatic lock expiry and heartbeat
- **Entry Comments** — Threaded comments on entries with replies
- **Tenant Branding** — Custom primary/accent colors, font, logo, and CSS
- **Media Library** — Upload, filter, and manage media files
- **Content Templates** — 8 pre-built schemas (Blog, Portfolio, E-commerce, etc.)
- **Sitemap Generator** — Auto-generated XML sitemap for all published content

### Authentication
- **Google/GitHub OAuth** — OAuth dashboard sign-in
- **JWT Sessions** — Backend-issued app JWTs after Google verification
- **API Keys** — For external integrations and server-to-server calls

## Tech Stack

- **Backend:** Node.js, Express 5, MongoDB (Mongoose), Google Auth, JWT, GraphQL, Joi
- **Frontend:** React 19, Vite, React Router, Axios, Lucide Icons, TipTap
- **Styling:** CSS variables + inline styles (dark theme, glass morphism)

## Project Structure

```
flowforge/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection
│   │   ├── controllers/     # Route handlers
│   │   ├── middlewares/     # Auth, tenant, role, scope, rate limit, analytics, cache
│   │   ├── models/          # Mongoose schemas (16 models)
│   │   ├── routes/          # Express routers (15 route files)
│   │   ├── graphql/         # GraphQL schema and resolvers
│   │   ├── services/        # Scheduler for auto-publish/unpublish
│   │   └── utils/           # Helpers, templates, webhooks, validation, seeding
│   ├── uploads/             # Media files (gitignored)
│   ├── .env                 # Environment variables
│   ├── server.js            # Entry point
│   ├── Dockerfile
│   └── docker-compose.yml
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Footer, PageShell, RichTextEditor, etc.
│   │   ├── contexts/        # AuthContext for JWT sessions
│   │   ├── hooks/           # useRole, useEntryLock
│   │   ├── pages/           # 20+ pages (dashboard, content, settings, etc.)
│   │   └── utils/           # API client with JWT token injection
│   └── vite.config.js
├── docs/
│   └── PRD.md               # Product requirements document
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB

### Backend

```bash
cd backend
npm install
npm run dev
```

**Environment Variables (backend/.env):**

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/flowforge
JWT_SECRET=your-super-secret-jwt-key-change-in-production

GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-client-secret
FRONTEND_URL=http://localhost:5173
API_PUBLIC_URL=http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

**Environment Variables (frontend/.env):**

```env
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
VITE_API_URL=http://localhost:3000
```

The frontend runs on `http://localhost:5173`.

### Docker (Backend)

```bash
cd backend
docker-compose up -d
```

### Default Roles

On first login, the system automatically seeds two default roles per tenant:
- **Admin** — Full access to all features
- **Member** — Standard access to content and media

Custom roles can be created via the **Roles** page in the admin dashboard or the `/api/v1/roles` API.

## Default Roles

| Feature | Admin | Member |
|---|---|---|
| Content Types | ✅ | ✅ |
| Content Entries | ✅ | ✅ |
| Media Library | ✅ | ✅ |
| API Keys | ✅ | ✅ |
| API Docs | ✅ | ✅ |
| Analytics | ✅ | ❌ |
| Audit Logs | ✅ | ❌ |
| Webhooks | ✅ | ❌ |
| User Management | ✅ | ❌ |
| System Settings | ✅ | ❌ |
| Roles | ✅ | ❌ |
| Branding | ✅ | ❌ |

Custom roles can be created with any combination of permissions via the Roles management page.

## API Usage

### Authentication

**API Key (External):**
```
X-API-Key: flow_xxxxx...
```

**JWT (Dashboard):**
```
Authorization: Bearer <token>
```

### Quick Start

```javascript
const API_KEY = 'your-api-key';
const BASE_URL = 'http://localhost:3000/api/v1';

// Fetch content
const response = await fetch(`${BASE_URL}/dynamic/blog`, {
  headers: { 'X-API-Key': API_KEY }
});
const posts = await response.json();
```

### Endpoints Overview

| Category | Routes |
|---|---|
| Content Types | `/api/v1/content-types`, `/api/v1/content-types/templates` |
| Dynamic Content | `/api/v1/dynamic/:slug` (+ versions, diff, rollback, bulk, import, duplicate) |
| API Keys | `/api/v1/api-keys`, `/api/v1/api-keys/:id/usage` |
| Media | `/api/v1/media` |
| Analytics | `/api/v1/analytics`, `/api/v1/analytics/top-endpoints` |
| Audit Logs | `/api/v1/audit-logs`, `/api/v1/audit-logs/stats`, `/api/v1/audit-logs/export/csv` |
| Webhooks | `/api/v1/webhooks` (+ logs, retry, test, rotate-secret) |
| Roles | `/api/v1/roles` |
| Forms | `/api/v1/forms`, `/api/v1/forms/submit/:slug` (public) |
| Tags | `/api/v1/tags` |
| Search | `/api/v1/search?q=...` |
| Calendar | `/api/v1/calendar?year=&month=` |
| Stats | `/api/v1/stats`, `/api/v1/stats/export` |
| Locks | `/api/v1/locks/:slug/:id` (+ acquire, release, heartbeat) |
| Comments | `/api/v1/comments/:slug/:entryId` |
| Theme | `/api/v1/theme`, `/api/v1/theme.css` |
| GraphQL | `/api/v1/graphql` (playground at `/api/v1/graphql` in browser) |
| Users | `/api/v1/users`, `/api/v1/users/:id` |
| Docs | `/api/v1/docs`, `/api/v1/docs/markdown` |
| Health | `/api/v1/health` |
| Sitemap | `/api/v1/sitemap.xml` |

Full documentation available in the dashboard under **API Docs** or via `/api/v1/docs`.

## License

ISC
