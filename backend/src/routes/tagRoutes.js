import express from 'express';
import Tag from '../models/tag.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import tenantMiddleware from '../middlewares/tenantMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// GET /api/v1/tags — List all tags (paginated)
router.get('/', authMiddleware, tenantMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 100, search } = req.query;
    const query = { tenantId: req.tenant };
    if (search) query.name = { $regex: search, $options: 'i' };
    const [tags, total] = await Promise.all([
      Tag.find(query).sort({ name: 1 }).skip((page - 1) * limit).limit(Number(limit)).lean(),
      Tag.countDocuments(query)
    ]);
    res.json({ data: tags, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/v1/tags — Create a tag
router.post('/', authMiddleware, tenantMiddleware, roleMiddleware('contentTypes'), async (req, res) => {
  try {
    const { name, slug, color } = req.body;
    if (!name || !slug) return res.status(400).json({ message: 'name and slug are required' });
    const existing = await Tag.findOne({ slug, tenantId: req.tenant });
    if (existing) return res.status(409).json({ message: 'Tag with this slug already exists' });
    const tag = await Tag.create({ tenantId: req.tenant, name, slug, color: color || '#8b5cf6' });
    res.status(201).json(tag);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/v1/tags/:id — Delete a tag
router.delete('/:id', authMiddleware, tenantMiddleware, roleMiddleware('contentTypes'), async (req, res) => {
  try {
    const tag = await Tag.findOneAndDelete({ _id: req.params.id, tenantId: req.tenant });
    if (!tag) return res.status(404).json({ message: 'Tag not found' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
