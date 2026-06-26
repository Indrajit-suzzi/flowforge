import express from 'express';
import ContentType from '../models/contentType.js';
import getModel from '../models/genericModel.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import tenantMiddleware from '../middlewares/tenantMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { typeMap } from '../utils/contentUtils.js';

const router = express.Router();

router.get('/', authMiddleware, tenantMiddleware, async (req, res) => {
  try {
    const cts = await ContentType.find({ tenantId: req.tenant });
    const breakdown = [];
    let totalEntries = 0, totalPublished = 0, totalScheduled = 0, totalDrafts = 0, totalForms = 0, totalWebhooks = 0;

    const contentStats = await Promise.all(cts.map(async (ct) => {
      const schema = Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String]));
      const Model = getModel(ct.name, schema);
      const [all, published, scheduled, drafts] = await Promise.all([
        Model.countDocuments({ tenantId: req.tenant, isDeleted: { $ne: true } }),
        Model.countDocuments({ tenantId: req.tenant, status: 'published', isDeleted: { $ne: true } }),
        Model.countDocuments({ tenantId: req.tenant, status: 'scheduled', isDeleted: { $ne: true } }),
        Model.countDocuments({ tenantId: req.tenant, status: 'draft', isDeleted: { $ne: true } }),
      ]);
      return { name: ct.name, slug: ct.slug, fields: ct.fields.length, all, published, scheduled, drafts };
    }));

    for (const stats of contentStats) {
      const { all, published, scheduled, drafts } = stats;
      totalEntries += all;
      totalPublished += published;
      totalScheduled += scheduled;
      totalDrafts += drafts;
      breakdown.push(stats);
    }

    const { default: Form } = await import('../models/form.js');
    const { default: Webhook } = await import('../models/webhook.js');
    [totalForms, totalWebhooks] = await Promise.all([
      Form.countDocuments({ tenantId: req.tenant }),
      Webhook.countDocuments({ tenantId: req.tenant }),
    ]);

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

router.get('/export', authMiddleware, tenantMiddleware, async (req, res) => {
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

router.post('/seed', authMiddleware, tenantMiddleware, roleMiddleware('systemSettings'), async (req, res) => {
  try {
    const { runSeed } = await import('../utils/seeder.js');
    await runSeed(req.tenant);
    res.json({ message: 'Database re-seeded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
