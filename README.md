# FlowForge

A multi-tenant headless CMS with dynamic schema generation, API key management, role-based access control, and a React admin dashboard.

## Features

### Core
- **Dynamic Schema Generation** - Create content types on the fly with custom fields
- **Multi-Tenant Architecture** - Isolated data per tenant with automatic scoping
- **Role-Based Access Control** - Admin, SubAdmin, and User roles with granular permissions
- **API Key Management** - Scoped keys with read/write/delete permissions for external access
- **Draft/Publish Workflow** - Content versioning with status tracking

### Dashboard
- **Analytics** - API usage stats, top endpoints, period filtering
- **Audit Logs** - Track all actions with user, action, and timestamp
- **Media Library** - Upload, filter, and manage media files
- **Webhooks** - Trigger external endpoints on content events
- **Content Templates** - 8 pre-built schemas (Blog, Portfolio, E-commerce, etc.)
- **Bulk Operations** - Select, publish, or delete multiple entries at once
- **Search & Filter** - Quick search across entries and content types

### Security
- JWT authentication for dashboard access
- API key authentication for external integrations
- Rate limiting on all endpoints
- Input validation with Joi schemas
- CORS configuration with header whitelisting

## Tech Stack

- **Backend:** Node.js, Express 5, MongoDB (Mongoose), JWT, Joi
- **Frontend:** React 19, Vite, React Router, Axios, Lucide Icons
- **Styling:** Inline styles (dark theme, no external CSS frameworks)

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
│   │   ├── components/      # Navbar, loading states, rich text editor
│   │   ├── context/         # Auth context with permissions
│   │   ├── pages/           # Dashboard, content, settings, etc.
│   │   └── utils/           # API client with auto-auth headers
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
cp .env.example .env  # or edit .env directly
npm install
npm run dev
```

**Environment Variables:**

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/flowforge
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies `/api` requests to the backend.

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
- `user@flowforge.com` / `user123` (User role)

## API Usage

### Authentication

**JWT (Dashboard):**
```
Authorization: Bearer <token>
```

**API Key (External):**
```
X-API-Key: flow_xxxxx...
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
| Auth | `/api/auth/register`, `/api/auth/login` |
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
