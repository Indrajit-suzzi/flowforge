import express from 'express';
import ContentType from '../models/contentType.js';
import getModel from '../models/genericModel.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import tenantMiddleware from '../middlewares/tenantMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = express.Router();
const typeMap = { String: String, Number: Number, Date: Date, Boolean: Boolean, RichText: String, Reference: String };

router.get('/', authMiddleware, tenantMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const year = parseInt(req.query.year) || now.getFullYear();
    const month = parseInt(req.query.month) || (now.getMonth() + 1);
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const contentTypes = await ContentType.find({ tenantId: req.tenant });
    const results = [];

    for (const ct of contentTypes) {
      const schema = Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String]));
      const Model = getModel(ct.name, schema);
      const labelField = ct.fields[0]?.name || 'title';

      const entries = await Model.find({
        tenantId: req.tenant,
        isDeleted: { $ne: true },
        $or: [
          { publishedAt: { $gte: startOfMonth, $lte: endOfMonth } },
          { scheduledPublishAt: { $gte: startOfMonth, $lte: endOfMonth } },
          { scheduledUnpublishAt: { $gte: startOfMonth, $lte: endOfMonth } },
          { createdAt: { $gte: startOfMonth, $lte: endOfMonth } }
        ]
      })
        .sort({ createdAt: -1 })
        .lean();

      for (const entry of entries) {
        const dates = [];
        if (entry.publishedAt) dates.push({ date: entry.publishedAt, type: 'published' });
        if (entry.scheduledPublishAt) dates.push({ date: entry.scheduledPublishAt, type: 'scheduled_publish' });
        if (entry.scheduledUnpublishAt) dates.push({ date: entry.scheduledUnpublishAt, type: 'scheduled_unpublish' });
        if (!entry.publishedAt && !entry.scheduledPublishAt) dates.push({ date: entry.createdAt, type: 'created' });

        for (const d of dates) {
          const day = new Date(d.date).getDate();
          results.push({
            _id: entry._id,
            contentTypeName: ct.name,
            contentTypeSlug: ct.slug,
            label: entry[labelField] || entry._id,
            status: entry.status,
            date: d.date,
            day,
            type: d.type
          });
        }
      }
    }

    results.sort((a, b) => new Date(a.date) - new Date(b.date));
    res.json({ data: results, year, month });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/clear', authMiddleware, tenantMiddleware, roleMiddleware('contentEntries'), async (req, res) => {
  try {
    const contentTypes = await ContentType.find({ tenantId: req.tenant });
    let cleared = 0;
    for (const ct of contentTypes) {
      const schema = Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String]));
      const Model = getModel(ct.name, schema);
      const r = await Model.updateMany(
        { tenantId: req.tenant, isDeleted: { $ne: true } },
        { $set: { scheduledPublishAt: null, scheduledUnpublishAt: null } }
      );
      cleared += r.modifiedCount;
    }
    res.json({ message: `Cleared scheduling for ${cleared} entries` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
