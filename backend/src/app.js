import express from "express";
import cors from "cors";
import fileUpload from 'express-fileupload';
import { contentTemplates } from "./utils/contentTemplates.js";

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

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));
app.use(express.json());
app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }));
app.use(rateLimit({ windowMs: 60000, max: 1000 }));

const clerkSecret = process.env.CLERK_SECRET_KEY;
const clerkPublishable = process.env.CLERK_PUBLISHABLE_KEY;
if (clerkSecret && clerkSecret !== 'your_clerk_secret_key_here' && clerkPublishable && clerkPublishable !== 'your_clerk_publishable_key_here') {
  const { clerkMiddleware } = await import('@clerk/express');
  app.use(clerkMiddleware({ publishableKey: clerkPublishable, secretKey: clerkSecret }));
  console.log('Clerk authentication enabled');
} else {
  console.log('Clerk not configured — using JWT fallback');
}

// Public templates endpoint
app.get("/api/v1/content-types/templates", (req, res) => {
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
    const state = mongoose.connection.readyState;
    res.json({ status: 'ok', db: state === 1 ? 'connected' : 'disconnected', uptime: process.uptime(), timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

app.get("/api/v1/sitemap.xml", async (req, res) => {
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
      const labelField = ct.fields[0]?.name || 'id';
      for (const entry of entries) {
        const updated = entry.updatedAt ? new Date(entry.updatedAt).toISOString() : '';
        urls += `<url><loc>https://flowforge.app/${ct.slug}/${entry._id}</loc><lastmod>${updated}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`;
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
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
  res.send("FlowForge API running 🚀");
});

export default app;
