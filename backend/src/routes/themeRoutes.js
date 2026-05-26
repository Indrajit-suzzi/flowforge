import express from 'express';
import TenantTheme from '../models/tenantTheme.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import tenantMiddleware from '../middlewares/tenantMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, tenantMiddleware, async (req, res) => {
  try {
    let theme = await TenantTheme.findOne({ tenantId: req.tenant });
    if (!theme) {
      theme = await TenantTheme.create({ tenantId: req.tenant });
    }
    res.json(theme);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', authMiddleware, tenantMiddleware, roleMiddleware('systemSettings'), async (req, res) => {
  try {
    const allowed = ['logoUrl', 'primaryColor', 'accentColor', 'borderRadius', 'fontFamily'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const theme = await TenantTheme.findOneAndUpdate(
      { tenantId: req.tenant },
      { $set: updates },
      { new: true, upsert: true }
    );
    res.json(theme);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
