import express from 'express';
import TenantTheme from '../models/tenantTheme.js';

const router = express.Router();

router.get('/', async (req, res) => {
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

router.put('/', async (req, res) => {
  try {
    const allowed = ['logoUrl', 'primaryColor', 'accentColor', 'borderRadius', 'fontFamily', 'customCss'];
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
