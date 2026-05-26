import mongoose from 'mongoose';
import express from 'express';
import ContentType from '../models/contentType.js';
import getModel from '../models/genericModel.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import tenantMiddleware from '../middlewares/tenantMiddleware.js';

const router = express.Router();

const typeMap = { String: String, Number: Number, Date: Date, Boolean: Boolean, RichText: String, Reference: String };
const MAX_SEARCH_LIMIT = 100;

router.get('/', authMiddleware, tenantMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    const limit = Math.min(parseInt(req.query.limit) || 20, MAX_SEARCH_LIMIT);
    if (!q || q.trim().length < 2) {
      return res.json({ status: 'success', data: [], total: 0 });
    }

    const contentTypes = await ContentType.find({ tenantId: req.tenant });
    const results = [];
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');

    for (const ct of contentTypes) {
      const stringFields = ct.fields.filter(f => f.type === 'String' || f.type === 'RichText');
      if (stringFields.length === 0) continue;

      const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));
      const orConditions = stringFields.map(f => ({ [f.name]: regex }));
      orConditions.push({ _id: mongoose.Types.ObjectId.isValid(q) ? q : null });

      const entries = await Model.find({
        tenantId: req.tenant,
        $or: orConditions.filter(Boolean)
      })
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .lean();

      if (entries.length > 0) {
        const labelField = ct.fields[0]?.name || 'title';
        results.push({
          contentTypeName: ct.name,
          contentTypeSlug: ct.slug,
          total: entries.length,
          entries: entries.map(e => ({
            _id: e._id,
            label: e[labelField] || e._id,
            status: e.status,
            locale: e.locale,
            createdAt: e.createdAt,
            updatedAt: e.updatedAt
          }))
        });
      }

      if (results.length >= Number(limit)) break;
    }

    const total = results.reduce((sum, r) => sum + r.total, 0);
    res.json({ status: 'success', data: results, total, query: q });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
