import express from 'express';
import ContentType from '../models/contentType.js';
import getModel from '../models/genericModel.js';

const router = express.Router();
const typeMap = { String: String, Number: Number, Date: Date, Boolean: Boolean, RichText: String, Reference: String };

router.get('/', async (req, res) => {
  try {
    const cts = await ContentType.find({ tenantId: req.tenant });
    const breakdown = [];
    let totalEntries = 0, totalPublished = 0, totalScheduled = 0, totalDrafts = 0, totalForms = 0, totalWebhooks = 0;

    for (const ct of cts) {
      const schema = Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String]));
      const Model = getModel(ct.name, schema);
      const all = await Model.countDocuments({ tenantId: req.tenant, isDeleted: { $ne: true } });
      const published = await Model.countDocuments({ tenantId: req.tenant, status: 'published', isDeleted: { $ne: true } });
      const scheduled = await Model.countDocuments({ tenantId: req.tenant, status: 'scheduled', isDeleted: { $ne: true } });
      const drafts = await Model.countDocuments({ tenantId: req.tenant, status: 'draft', isDeleted: { $ne: true } });
      totalEntries += all;
      totalPublished += published;
      totalScheduled += scheduled;
      totalDrafts += drafts;
      breakdown.push({ name: ct.name, slug: ct.slug, fields: ct.fields.length, all, published, scheduled, drafts });
    }

    const { default: Form } = await import('../models/form.js');
    totalForms = await Form.countDocuments({ tenantId: req.tenant });

    const { default: Webhook } = await import('../models/webhook.js');
    totalWebhooks = await Webhook.countDocuments({ tenantId: req.tenant });

    res.json({
      totalContentTypes: cts.length,
      totalEntries, totalPublished, totalScheduled, totalDrafts,
      totalForms, totalWebhooks,
      breakdown
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/export', async (req, res) => {
  try {
    const cts = await ContentType.find({ tenantId: req.tenant });
    const result = {};
    for (const ct of cts) {
      const schema = Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String]));
      const Model = getModel(ct.name, schema);
      const entries = await Model.find({ tenantId: req.tenant, isDeleted: { $ne: true } }).lean();
      result[ct.slug] = { name: ct.name, fields: ct.fields.map(f => f.name), entries: entries.map(e => { const { _id, __v, tenantId: _tenantId, ...rest } = e; return rest; }) };
    }
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="all-content.json"');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/seed', async (req, res) => {
  try {
    const { execSync } = await import('child_process');
    execSync('node seed.js --force', { cwd: process.cwd(), stdio: 'pipe' });
    res.json({ message: 'Database re-seeded' });
  } catch (_err) {
    res.status(500).json({ error: 'Seed failed, check server logs' });
  }
});

export default router;
