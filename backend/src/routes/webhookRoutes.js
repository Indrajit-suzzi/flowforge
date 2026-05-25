import express from 'express';
import crypto from 'crypto';
import Webhook from '../models/webhook.js';
import WebhookLog from '../models/webhookLog.js';
import { logAudit } from '../utils/auditLogger.js';
import { create, getAll, update, remove } from '../controllers/webhookController.js';
import { retryWebhook, testWebhook } from '../utils/webhookTrigger.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import tenantMiddleware from '../middlewares/tenantMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, tenantMiddleware, create);
router.get('/', authMiddleware, tenantMiddleware, getAll);
router.put('/:id', authMiddleware, tenantMiddleware, update);
router.delete('/:id', authMiddleware, tenantMiddleware, remove);

router.get('/:id/logs', authMiddleware, tenantMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = { tenantId: req.tenant, webhookId: req.params.id };
    if (status) filter.status = status;
    const logs = await WebhookLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-payload');
    const total = await WebhookLog.countDocuments(filter);
    res.json({ status: 'success', data: logs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/logs/:logId/retry', authMiddleware, tenantMiddleware, async (req, res) => {
  try {
    const result = await retryWebhook({ tenantId: req.tenant, logId: req.params.logId });
    res.json({ status: 'success', ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/test', authMiddleware, tenantMiddleware, async (req, res) => {
  try {
    const { default: Webhook } = await import('../models/webhook.js');
    const webhook = await Webhook.findOne({ _id: req.params.id, tenantId: req.tenant });
    if (!webhook) return res.status(404).json({ message: 'Webhook not found' });
    const result = await testWebhook({ webhook });
    res.json({ status: 'success', test: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/logs/:logId', authMiddleware, tenantMiddleware, async (req, res) => {
  try {
    const log = await WebhookLog.findOne({ _id: req.params.logId, tenantId: req.tenant, webhookId: req.params.id });
    if (!log) return res.status(404).json({ message: 'Log not found' });
    res.json({ status: 'success', data: log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/rotate-secret', authMiddleware, tenantMiddleware, async (req, res) => {
  try {
    const webhook = await Webhook.findOne({ _id: req.params.id, tenantId: req.tenant });
    if (!webhook) return res.status(404).json({ message: 'Webhook not found' });
    const newSecret = crypto.randomBytes(24).toString('hex');
    webhook.secret = newSecret;
    webhook.secretLastRotated = new Date();
    await webhook.save();
    await logAudit({ tenantId: req.tenant, userId: req.user?.id, action: 'update', entityType: 'webhook', entityId: webhook._id.toString(), entityName: webhook.name, ipAddress: req.ip, userAgent: req.headers['user-agent'] });
    res.json({ status: 'success', secret: newSecret, secretLastRotated: webhook.secretLastRotated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;