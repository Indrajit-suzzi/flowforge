import express from 'express';
import ContentType from '../models/contentType.js';
import getModel, { clearModelCache } from '../models/genericModel.js';
import ContentVersion from '../models/contentVersion.js';
import EntryComment from '../models/entryComment.js';
import EntryLock from '../models/entryLock.js';
import { contentTemplates } from '../utils/contentTemplates.js';
import { logAudit } from '../utils/auditLogger.js';
import { invalidateContentType, invalidateAll } from '../utils/contentTypeCache.js';
import validate from '../middlewares/validateMiddleware.js';
import { createContentTypeSchema, updateContentTypeSchema } from '../utils/validationSchemas.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import tenantMiddleware from '../middlewares/tenantMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = express.Router();

const CONTENT_TYPE_ALLOWED = ['name', 'slug', 'fields', 'locales', 'description', 'cacheTTL', 'workflowEnabled', 'workflowStages'];

// Protected endpoints
router.post('/', authMiddleware, tenantMiddleware, roleMiddleware('contentTypes'), validate(createContentTypeSchema), async (req, res) => {
    try {
        const body = {};
        for (const key of CONTENT_TYPE_ALLOWED) {
            if (req.body[key] !== undefined) body[key] = req.body[key];
        }
        body.tenantId = req.tenant;
        if (!body.locales || body.locales.length === 0) body.locales = ['en'];
        const ct = await ContentType.create(body);
        invalidateAll(req.tenant);
        await logAudit({ tenantId: req.tenant, userId: req.user?.id, action: 'create', entityType: 'contentType', entityId: ct._id.toString(), ipAddress: req.ip, userAgent: req.headers['user-agent'] });
        res.status(201).json(ct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', authMiddleware, tenantMiddleware, async (req, res) => {
    try {
        const cts = await ContentType.find({ tenantId: req.tenant });
        res.json(cts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/from-template', authMiddleware, tenantMiddleware, roleMiddleware('contentTypes'), async (req, res) => {
    try {
        const { templateSlug } = req.body;
        const template = contentTemplates.find(t => t.slug === templateSlug);
        if (!template) return res.status(404).json({ message: 'Template not found' });

        const ct = await ContentType.create({
            tenantId: req.tenant,
            name: template.name,
            slug: template.slug,
            fields: template.fields.map(f => ({ ...f, localizable: false })),
            locales: ['en']
        });

        invalidateAll(req.tenant);
        await logAudit({ tenantId: req.tenant, userId: req.user?.id, action: 'create', entityType: 'contentType', entityId: ct._id.toString(), ipAddress: req.ip, userAgent: req.headers['user-agent'] });
        res.status(201).json(ct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', authMiddleware, tenantMiddleware, async (req, res) => {
    try {
        const ct = await ContentType.findOne({ _id: req.params.id, tenantId: req.tenant });
        if (!ct) return res.status(404).json({ message: 'Not found' });
        res.json(ct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', authMiddleware, tenantMiddleware, roleMiddleware('contentTypes'), validate(updateContentTypeSchema), async (req, res) => {
    try {
        const body = {};
        for (const key of CONTENT_TYPE_ALLOWED) {
            if (req.body[key] !== undefined) body[key] = req.body[key];
        }
        const oldCt = await ContentType.findOne({ _id: req.params.id, tenantId: req.tenant });
        if (!oldCt) return res.status(404).json({ message: 'Not found' });
        if (body.fields || body.name) clearModelCache(oldCt.name);
        invalidateContentType(req.tenant, oldCt.slug);
        if (body.slug && body.slug !== oldCt.slug) invalidateContentType(req.tenant, body.slug);
        const ct = await ContentType.findOneAndUpdate({ _id: req.params.id, tenantId: req.tenant }, body, { new: true });
        res.json(ct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:id/duplicate', authMiddleware, tenantMiddleware, roleMiddleware('contentTypes'), async (req, res) => {
  try {
    const ct = await ContentType.findOne({ _id: req.params.id, tenantId: req.tenant });
    if (!ct) return res.status(404).json({ message: 'Not found' });
    const dup = await ContentType.create({
      ...ct.toObject(),
      _id: undefined,
      name: `${ct.name} (Copy)`,
      slug: `${ct.slug}-copy-${Date.now()}`,
      createdAt: undefined,
      updatedAt: undefined,
    });
    invalidateAll(req.tenant);
    await logAudit({ tenantId: req.tenant, userId: req.user?.id, action: 'create', entityType: 'contentType', entityId: dup._id.toString(), ipAddress: req.ip, userAgent: req.headers['user-agent'] });
    res.status(201).json(dup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, tenantMiddleware, roleMiddleware('contentTypes'), async (req, res) => {
    try {
        const ct = await ContentType.findOneAndDelete({ _id: req.params.id, tenantId: req.tenant });
        if (!ct) return res.status(404).json({ message: 'Not found' });
        const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, String])));
        await Model.deleteMany({ tenantId: req.tenant });
        await ContentVersion.deleteMany({ tenantId: req.tenant, contentTypeSlug: ct.slug });
        await EntryComment.deleteMany({ tenantId: req.tenant, contentTypeSlug: ct.slug });
        await EntryLock.deleteMany({ tenantId: req.tenant, contentTypeSlug: ct.slug });
        clearModelCache(ct.name);
        invalidateContentType(req.tenant, ct.slug);
        await logAudit({ tenantId: req.tenant, userId: req.user?.id, action: 'delete', entityType: 'contentType', entityId: ct._id.toString(), ipAddress: req.ip, userAgent: req.headers['user-agent'] });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id/export/json', authMiddleware, tenantMiddleware, async (req, res) => {
  try {
    const ct = await ContentType.findOne({ _id: req.params.id, tenantId: req.tenant });
    if (!ct) return res.status(404).json({ message: 'Not found' });
    const obj = ct.toObject();
    delete obj._id;
    delete obj.__v;
    delete obj.tenantId;
    delete obj.createdAt;
    delete obj.updatedAt;
    res.setHeader('Content-Disposition', `attachment; filename="${ct.slug}-schema.json"`);
    res.json(obj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/import/json', authMiddleware, tenantMiddleware, roleMiddleware('contentTypes'), async (req, res) => {
  try {
    const { name, slug, fields, locales, cacheTTL } = req.body;
    if (!name || !slug || !fields) return res.status(400).json({ message: 'name, slug, and fields are required' });
    const existing = await ContentType.findOne({ slug, tenantId: req.tenant });
    if (existing) return res.status(409).json({ message: `Content type with slug "${slug}" already exists` });
    const FIELD_ALLOWED = ['name', 'type', 'required', 'localizable', 'refContentType', 'pattern', 'patternMessage', 'minLength', 'maxLength', 'min', 'max', 'defaultValue'];
    const ct = await ContentType.create({
      tenantId: req.tenant,
      name,
      slug,
      fields: (fields || []).map(f => {
        const sanitized = {};
        for (const key of FIELD_ALLOWED) {
          if (f[key] !== undefined) sanitized[key] = f[key];
        }
        sanitized.required = f.required || false;
        sanitized.localizable = f.localizable || false;
        return sanitized;
      }),
      locales: locales || ['en'],
      cacheTTL: typeof cacheTTL === 'number' ? cacheTTL : 0
    });
    invalidateAll(req.tenant);
    await logAudit({ tenantId: req.tenant, userId: req.user?.id, action: 'create', entityType: 'contentType', entityId: ct._id.toString(), ipAddress: req.ip, userAgent: req.headers['user-agent'] });
    res.status(201).json(ct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;