import express from "express";
import cors from "cors";
import fileUpload from 'express-fileupload';

import dynamicRoutes from "./routes/dynamicRoutes.js";
import contentTypeRoutes from "./routes/contentTypeRoutes.js";
import authRoutes from './routes/authRoutes.js';
import apiKeyRoutes from './routes/apiKeyRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import userRoutes from './routes/userRoutes.js';
import docsRoutes from './routes/docsRoutes.js';
import authMiddleware from './middlewares/authMiddleware.js';
import tenantMiddleware from './middlewares/tenantMiddleware.js';
import analyticsMiddleware from './middlewares/analyticsMiddleware.js';
import { roleMiddleware } from './middlewares/roleMiddleware.js';
import rateLimit from './middlewares/rateLimit.js';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));
app.use(express.json());
app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 1000 }));

app.use("/api/v1/dynamic", authMiddleware, tenantMiddleware, roleMiddleware('contentEntries'), analyticsMiddleware, dynamicRoutes);
app.use("/api/v1/content-types", authMiddleware, tenantMiddleware, roleMiddleware('contentTypes'), analyticsMiddleware, contentTypeRoutes);
app.use("/api/v1/api-keys", authMiddleware, tenantMiddleware, roleMiddleware('apiKeys'), analyticsMiddleware, apiKeyRoutes);
app.use("/api/v1/analytics", authMiddleware, roleMiddleware('analytics'), analyticsRoutes);
app.use("/api/v1/audit-logs", authMiddleware, roleMiddleware('auditLogs'), auditLogRoutes);
app.use("/api/v1/webhooks", authMiddleware, roleMiddleware('webhooks'), webhookRoutes);
app.use("/api/v1/media", authMiddleware, roleMiddleware('mediaLibrary'), mediaRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/docs", docsRoutes);
app.use('/api/auth', authRoutes);

app.get("/", (req, res) => {
  res.send("FlowForge API running 🚀");
});

export default app;
