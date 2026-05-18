import express from 'express';
import ContentType from '../models/contentType.js';
import { contentTemplates } from '../utils/contentTemplates.js';
import { logAudit } from '../utils/auditLogger.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        req.body.tenantId = req.tenant;
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

router.get('/templates', (req, res) => {
    res.json(contentTemplates);
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
            fields: template.fields
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

export default router;