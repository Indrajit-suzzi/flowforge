# FlowForge

**Multi-tenant headless CMS** — create custom content types, manage entries, and serve data via REST/GraphQL APIs without writing backend code.

## What It Offers

- **Dynamic schemas** — create content types on the fly (String, Number, Date, Boolean, RichText, Reference, etc.)
- **REST + GraphQL APIs** — full CRUD with pagination, filtering, sorting, caching
- **Role-based access control** — custom roles with granular permissions
- **API key management** — scoped keys with per-content-type permissions + rate limiting
- **Content lifecycle** — draft/publish/scheduled workflow, versioning with rollback, soft-delete/trash
- **Localization** — multi-language content with per-field translations
- **Webhooks** — trigger external endpoints on content events with retries and delivery logs
- **Media library** — upload, filter, and manage media files
- **Forms builder** — create public-facing forms with field builder and submission viewer
- **Auth** — Google/GitHub OAuth, JWT sessions, API keys
- **Dashboard** — React admin panel with analytics, audit logs, content calendar, comments, entry locking
- **Search, sitemap, import/export, templates, tagging, branding** — and more

## How It Works

1. **Define content types** via API or dashboard (like creating a DB schema)
2. **Manage entries** — add, edit, version, translate, publish content
3. **Consume via API** — use REST or GraphQL with API keys or JWT
4. **Extend** — webhooks, custom roles, forms, public endpoints

Each tenant gets isolated data (multi-tenant via `tenantId`), auto-generated API docs, and a customizable dashboard.

## Tech Stack

- **Backend:** Node.js, Express 5, MongoDB (Mongoose), GraphQL, JWT
- **Frontend:** React 19, Vite, TipTap (rich text)
- **Auth:** Google OAuth, GitHub OAuth, API keys

## Quick Start

```bash
# Backend
cd backend
cp .env.example .env   # edit with your config
npm install
npm run dev

# Frontend
cd frontend
cp .env.example .env
npm install
npm run dev
```

Or run with Docker:

```bash
docker-compose up -d
```

The dashboard runs on `http://localhost:5173`, API on `http://localhost:3000`.

## Why FlowForge?

- **Self-hosted** — your data, your infrastructure
- **No backend code** — dynamic schemas mean zero API coding
- **Multi-tenant by design** — one deployment, many tenants
- **Feature-rich** — versioning, localization, RBAC, webhooks, forms, media — built-in
- **Developer-friendly** — REST, GraphQL, scoped API keys, auto-generated docs

## License

ISC
