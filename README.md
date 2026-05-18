# 🚀 FlowForge

FlowForge is a reusable backend system with dynamic schema handling and secure authentication with a full admin dashboard.

---

## 🧠 Features

- 🔐 JWT Authentication (Login/Register)
- 🔒 Password hashing using bcrypt
- 🛡️ Protected routes with middleware
- ⚙️ Dynamic API generation (generic controllers)
- 🔑 Scoped API key management
- 🐳 Docker-ready backend setup
- 🖥️ React admin dashboard

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express 5, MongoDB (Mongoose), JWT, Joi
- **Frontend:** React 19, Vite, Tailwind CSS 4, React Router, Axios
- **Infrastructure:** Docker, Docker Compose

---

## 📦 Project Structure

```
flowforge/
├── backend/          # Express API server
│   ├── src/
│   │   ├── config/       # DB connection
│   │   ├── controllers/  # Route handlers
│   │   ├── middlewares/  # Auth, tenant, scope, validation
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # Express routers
│   │   └── utils/        # Helpers
│   ├── .env              # Environment variables
│   ├── server.js         # Entry point
│   └── docker-compose.yml
├── frontend/         # React admin dashboard
│   ├── src/
│   │   ├── components/ # Shared UI components
│   │   ├── context/    # Auth context
│   │   ├── pages/      # Route pages
│   │   └── utils/      # API client
│   └── vite.config.js
└── docs/             # PRD, specs, plans
```

---

## 🚀 Getting Started

### Backend

```bash
cd backend
cp .env.example .env  # or edit .env directly
npm install
npm run dev
```

**Environment Variables (`.env`):**
```
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

The frontend runs on `http://localhost:5173` and proxies `/api` requests to the backend at `http://localhost:3000`.

### Docker (Backend)

```bash
cd backend
docker-compose up -d
```

---

## 📡 API Endpoints

### Auth
| Method | Path | Body |
|---|---|---|
| POST | `/api/auth/register` | `{ username, email, password }` |
| POST | `/api/auth/login` | `{ email, password }` → `{ token }` |

### Content Types (JWT required)
| Method | Path |
|---|---|
| POST | `/api/v1/content-types` |
| GET | `/api/v1/content-types` |
| GET | `/api/v1/content-types/:id` |
| PUT | `/api/v1/content-types/:id` |
| DELETE | `/api/v1/content-types/:id` |

### Dynamic Content (JWT or API Key)
| Method | Path | Scope |
|---|---|---|
| POST | `/api/v1/dynamic/:slug` | `write` |
| GET | `/api/v1/dynamic/:slug` | `read` |
| GET | `/api/v1/dynamic/:slug/:id` | `read` |
| PUT | `/api/v1/dynamic/:slug/:id` | `write` |
| DELETE | `/api/v1/dynamic/:slug/:id` | `delete` |

### API Keys (JWT required)
| Method | Path |
|---|---|
| POST | `/api/v1/api-keys` |
| GET | `/api/v1/api-keys` |
| DELETE | `/api/v1/api-keys/:id` |

---

## 📄 License

ISC
