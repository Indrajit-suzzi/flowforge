import express from 'express';
import ContentType from '../models/contentType.js';
import { contentTemplates } from '../utils/contentTemplates.js';
import { logAudit } from '../utils/auditLogger.js';

const router = express.Router();

// Protected endpoints
router.post('/', async (req, res) => {
    try {
        req.body.tenantId = req.tenant;
        if (!req.body.locales || req.body.locales.length === 0) req.body.locales = ['en'];
        const ct = await ContentType.create(req.body);
        await logAudit({ tenantId: req.tenant, userId: req.user?.id, action: 'create', entityType: 'contentType', entityId: ct._id.toString(), ipAddress: req.ip, userAgent: req.headers['user-agent'] });
        res.status(201).json(ct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const cts = await ContentType.find({ tenantId: req.tenant });
        res.json(cts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/from-template', async (req, res) => {
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

        await logAudit({ tenantId: req.tenant, userId: req.user?.id, action: 'create', entityType: 'contentType', entityId: ct._id.toString(), ipAddress: req.ip, userAgent: req.headers['user-agent'] });
        res.status(201).json(ct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const ct = await ContentType.findOne({ _id: req.params.id, tenantId: req.tenant });
        if (!ct) return res.status(404).json({ message: 'Not found' });
        res.json(ct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const ct = await ContentType.findOneAndUpdate({ _id: req.params.id, tenantId: req.tenant }, req.body, { new: true });
        if (!ct) return res.status(404).json({ message: 'Not found' });
        res.json(ct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:id/duplicate', async (req, res) => {
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
    await logAudit({ tenantId: req.tenant, userId: req.user?.id, action: 'create', entityType: 'contentType', entityId: dup._id.toString(), ipAddress: req.ip, userAgent: req.headers['user-agent'] });
    res.status(201).json(dup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
    try {
        const ct = await ContentType.findOneAndDelete({ _id: req.params.id, tenantId: req.tenant });
        if (!ct) return res.status(404).json({ message: 'Not found' });
        await logAudit({ tenantId: req.tenant, userId: req.user?.id, action: 'delete', entityType: 'contentType', entityId: ct._id.toString(), ipAddress: req.ip, userAgent: req.headers['user-agent'] });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id/export/json', async (req, res) => {
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

router.post('/import/json', async (req, res) => {
  try {
    const { name, slug, fields, locales } = req.body;
    if (!name || !slug || !fields) return res.status(400).json({ message: 'name, slug, and fields are required' });
    const existing = await ContentType.findOne({ slug, tenantId: req.tenant });
    if (existing) return res.status(409).json({ message: `Content type with slug "${slug}" already exists` });
    const ct = await ContentType.create({
      tenantId: req.tenant,
      name,
      slug,
      fields: fields.map(f => ({
        name: f.name, type: f.type, required: f.required || false,
        localizable: f.localizable || false, refContentType: f.refContentType,
        pattern: f.pattern, patternMessage: f.patternMessage,
        minLength: f.minLength, maxLength: f.maxLength,
        min: f.min, max: f.max, defaultValue: f.defaultValue
      })),
      locales: locales || ['en'],
      cacheTTL: req.body.cacheTTL || 0
    });
    await logAudit({ tenantId: req.tenant, userId: req.user?.id, action: 'create', entityType: 'contentType', entityId: ct._id.toString(), ipAddress: req.ip, userAgent: req.headers['user-agent'] });
    res.status(201).json(ct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;