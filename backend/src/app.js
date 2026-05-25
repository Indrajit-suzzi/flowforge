import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import fileUpload from 'express-fileupload';
import { contentTemplates } from "./utils/contentTemplates.js";
import logger from "./utils/logger.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import requestLogger from "./middlewares/requestLogger.js";

import dynamicRoutes from "./routes/dynamicRoutes.js";
import contentTypeRoutes from "./routes/contentTypeRoutes.js";
import apiKeyRoutes from './routes/apiKeyRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import userRoutes from './routes/userRoutes.js';
import docsRoutes from './routes/docsRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import themeRoutes from './routes/themeRoutes.js';
import formRoutes from './routes/formRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import lockRoutes from './routes/lockRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import tagRoutes from './routes/tagRoutes.js';
import { graphqlHandler } from './routes/graphqlRoutes.js';
import authMiddleware from './middlewares/authMiddleware.js';
import tenantMiddleware from './middlewares/tenantMiddleware.js';
import analyticsMiddleware from './middlewares/analyticsMiddleware.js';
import { roleMiddleware } from './middlewares/roleMiddleware.js';
import rateLimit from './middlewares/rateLimit.js';
import keyRateLimit from './middlewares/keyRateLimit.js';
import { scopeMiddleware } from './middlewares/scopeMiddleware.js';

const app = express();

const corsOrigins = process.env.CORS_ORIGINS;
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(cors({
  origin: corsOrigins ? corsOrigins.split(',').map(s => s.trim()) : ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Tenant-Id'],
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));
app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }));
app.use(rateLimit({ windowMs: 60000, max: 1000 }));

app.use((req, _res, next) => {
  req.log = logger.child({ reqId: req.headers['x-request-id'] || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` });
  next();
});

app.use(requestLogger);

if (process.env.TRUST_PROXY) {
  app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1);
}

const clerkSecret = process.env.CLERK_SECRET_KEY;
const clerkPublishable = process.env.CLERK_PUBLISHABLE_KEY;
if (clerkSecret && clerkSecret !== 'your_clerk_secret_key_here' && clerkPublishable && clerkPublishable !== 'your_clerk_publishable_key_here') {
  const { clerkMiddleware } = await import('@clerk/express');
  app.use(clerkMiddleware({ publishableKey: clerkPublishable, secretKey: clerkSecret }));
  logger.info('Clerk authentication enabled');
} else {
  logger.info('Clerk not configured — using JWT fallback');
}

// Public templates endpoint
app.get("/api/v1/content-types/templates", (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.json(contentTemplates);
});

app.use("/api/v1/dynamic", authMiddleware, keyRateLimit(), scopeMiddleware(), tenantMiddleware, roleMiddleware('contentEntries'), analyticsMiddleware, dynamicRoutes);
app.use("/api/v1/content-types", authMiddleware, keyRateLimit(), scopeMiddleware(), tenantMiddleware, roleMiddleware('contentTypes'), analyticsMiddleware, contentTypeRoutes);
app.use("/api/v1/api-keys", authMiddleware, keyRateLimit(), tenantMiddleware, roleMiddleware('apiKeys'), analyticsMiddleware, apiKeyRoutes);
app.use("/api/v1/analytics", authMiddleware, keyRateLimit(), roleMiddleware('analytics'), analyticsRoutes);
app.use("/api/v1/audit-logs", authMiddleware, keyRateLimit(), roleMiddleware('auditLogs'), auditLogRoutes);
app.use("/api/v1/webhooks", authMiddleware, keyRateLimit(), roleMiddleware('webhooks'), webhookRoutes);
app.use("/api/v1/media", authMiddleware, keyRateLimit(), roleMiddleware('mediaLibrary'), mediaRoutes);
app.use("/api/v1/users", authMiddleware, keyRateLimit(), tenantMiddleware, userRoutes);
app.use("/api/v1/roles", authMiddleware, keyRateLimit(), tenantMiddleware, roleMiddleware('roles'), roleRoutes);
app.use("/api/v1/graphql", authMiddleware, keyRateLimit(), tenantMiddleware, graphqlHandler);
app.use("/api/v1/search", authMiddleware, keyRateLimit(), tenantMiddleware, searchRoutes);
app.use("/api/v1/theme", authMiddleware, keyRateLimit(), tenantMiddleware, roleMiddleware('branding'), themeRoutes);
app.use("/api/v1/forms", authMiddleware, keyRateLimit(), tenantMiddleware, formRoutes);
app.use("/api/v1/calendar", authMiddleware, keyRateLimit(), tenantMiddleware, calendarRoutes);
app.use("/api/v1/stats", authMiddleware, keyRateLimit(), tenantMiddleware, statsRoutes);
app.use("/api/v1/locks", authMiddleware, keyRateLimit(), tenantMiddleware, lockRoutes);
app.use("/api/v1/comments", authMiddleware, keyRateLimit(), tenantMiddleware, commentRoutes);
app.use("/api/v1/tags", authMiddleware, keyRateLimit(), tenantMiddleware, tagRoutes);
app.use("/api/v1/docs", docsRoutes);

app.get("/api/v1/health", async (req, res) => {
  try {
    const mongoose = (await import('mongoose')).default;
    const dbState = mongoose.connection.readyState;
    const dbStatus = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' }[dbState] || 'unknown';
    const mem = process.memoryUsage();
    res.json({
      status: dbState === 1 ? 'ok' : 'degraded',
      version: process.env.npm_package_version || '1.0.0',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      node: process.version,
      env: process.env.NODE_ENV || 'development',
      db: dbStatus,
      memory: {
        rss: `${Math.round(mem.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)} MB`,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

app.get("/api/v1/sitemap.xml", async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('Vary', 'Accept-Encoding');
  try {
    const { default: ContentType } = await import('./models/contentType.js');
    const { default: getModel } = await import('./models/genericModel.js');
    const tenantId = req.query.tenant || req.headers['x-tenant-id'];
    if (!tenantId) return res.status(400).send('Tenant ID required');
    const typeMap = { String: String, Number: Number, Date: Date, Boolean: Boolean, RichText: String, Reference: String };

    const cts = await ContentType.find({ tenantId });
    let urls = `<url><loc>https://flowforge.app/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`;

    for (const ct of cts) {
      const schema = Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String]));
      const Model = getModel(ct.name, schema);
      const entries = await Model.find({ tenantId, status: 'published', isDeleted: { $ne: true } }).sort({ updatedAt: -1 }).lean();
      const _labelField = ct.fields[0]?.name || 'id';
      for (const entry of entries) {
        const updated = entry.updatedAt ? new Date(entry.updatedAt).toISOString() : '';
        urls += `<url><loc>https://flowforge.app/${ct.slug}/${entry._id}</loc><lastmod>${updated}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`;
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  } catch {
    res.status(500).send('Error generating sitemap');
  }
});

app.get("/api/v1/theme.css", async (req, res) => {
  try {
    const { default: TenantTheme } = await import('./models/tenantTheme.js');
    const tenantId = req.headers['x-tenant-id'] || req.query.tenant || '';
    const theme = tenantId ? await TenantTheme.findOne({ tenantId }) : null;
    const css = `
:root {
  --color-primary: ${theme?.primaryColor || '#ff7e5f'};
  --color-accent: ${theme?.accentColor || '#8b5cf6'};
  --border-radius: ${theme?.borderRadius || 12}px;
  --font-heading: '${theme?.fontFamily || 'Outfit'}', sans-serif;
  ${theme?.customCss || ''}
}
`;
    res.setHeader('Content-Type', 'text/css');
    res.send(css);
  } catch {
    res.setHeader('Content-Type', 'text/css');
    res.send(':root {}');
  }
});

app.get("/", (req, res) => {
  res.json({ name: 'FlowForge API', version: '1.0.0', status: 'running' });
});

app.use('/uploads', express.static('uploads'));

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
