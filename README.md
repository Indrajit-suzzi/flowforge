# FlowForge

A multi-tenant headless CMS with dynamic schema generation, API key management, role-based access control, and a React admin dashboard.

## Features

### Core
- **Dynamic Schema Generation** - Create content types on the fly with custom fields
- **Multi-Tenant Architecture** - Isolated data per tenant with automatic scoping
- **Role-Based Access Control** - Admin and Member roles with feature-level access
- **API Key Management** - Scoped keys with read/write/delete permissions for external access
- **Draft/Publish Workflow** - Content versioning with status tracking

### Dashboard
- **Analytics** - API usage stats, top endpoints, period filtering (Admin only)
- **Audit Logs** - Track all actions with user, action, and timestamp (Admin only)
- **Media Library** - Upload, filter, and manage media files
- **Webhooks** - Trigger external endpoints on content events (Admin only)
- **Content Templates** - 8 pre-built schemas (Blog, Portfolio, E-commerce, etc.)
- **Bulk Operations** - Select, publish, or delete multiple entries at once
- **Search & Filter** - Quick search across entries and content types
- **API Documentation** - Interactive docs with expandable endpoints, request/response examples

### Authentication
- **Clerk** - Modern auth with email, social login, and session management
- **JWT Fallback** - Works without Clerk by setting `JWT_SECRET` only
- **API Keys** - For external integrations and server-to-server calls

## Tech Stack

- **Backend:** Node.js, Express 5, MongoDB (Mongoose), Clerk, JWT, Joi
- **Frontend:** React 19, Vite, React Router, Axios, Lucide Icons, Clerk
- **Styling:** CSS variables + inline styles (dark theme, glass morphism)

## Project Structure

```
flowforge/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection
│   │   ├── controllers/     # Route handlers
│   │   ├── middlewares/     # Auth, tenant, role, rate limit, validation
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routers
│   │   └── utils/           # Helpers, templates, webhooks
│   ├── uploads/             # Media files (gitignored)
│   ├── .env                 # Environment variables
│   ├── server.js            # Entry point
│   ├── seed.js              # Seed script for dummy users
│   ├── Dockerfile
│   └── docker-compose.yml
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, loading states, rich text editor, page shell
│   │   ├── hooks/           # useRole (admin/member check)
│   │   ├── pages/           # Landing, dashboard, content, settings, API docs, etc.
│   │   └── utils/           # API client with Clerk token injection
│   └── vite.config.js
├── docs/
│   └── PRD.md               # Product requirements document
└── example-integration.html # Standalone integration example
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

# Optional: Clerk authentication
CLERK_SECRET_KEY=sk_test_...
```

If `CLERK_SECRET_KEY` is not set, the backend automatically falls back to JWT authentication.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

**Environment Variables (frontend/.env):**

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:3000
```

The frontend runs on `http://localhost:5173`.

### Docker (Backend)

```bash
cd backend
docker-compose up -d
```

### Seed Data

```bash
cd backend
node seed.js
```

Creates dummy users for testing:
- `admin@flowforge.com` / `admin123` (Admin role)
- `john@example.com` / `john123` (Member role)
- `jane@example.com` / `jane123` (Member role)

## Roles

| Feature | Admin | Member |
|---|---|---|
| Dashboard | ✅ | ✅ |
| Content Types | ✅ | ✅ |
| Content Entries | ✅ | ✅ |
| Media Library | ✅ | ✅ |
| API Keys | ✅ | ✅ |
| API Docs | ✅ | ✅ |
| Analytics | ✅ | ❌ |
| Audit Logs | ✅ | ❌ |
| Webhooks | ✅ | ❌ |
| User Management | ✅ | ❌ |

## API Usage

### Authentication

**Clerk Session (Dashboard):**
Automatic — tokens are injected via the Clerk React SDK.

**API Key (External):**
```
X-API-Key: flow_xxxxx...
```

**JWT (Fallback):**
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
| Dynamic Content | `/api/v1/dynamic/:slug` |
| API Keys | `/api/v1/api-keys` |
| Media | `/api/v1/media` |
| Analytics | `/api/v1/analytics`, `/api/v1/analytics/top-endpoints` |
| Audit Logs | `/api/v1/audit-logs`, `/api/v1/audit-logs/stats` |
| Users | `/api/v1/users`, `/api/v1/users/:id` |
| Webhooks | `/api/v1/webhooks` |
| API Docs | `/api/v1/docs`, `/api/v1/docs/markdown` |

Full documentation available in the dashboard under **API Docs** or via `/api/v1/docs`.

## License

ISC
