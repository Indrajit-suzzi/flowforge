import express from 'express';
import ContentType from '../models/contentType.js';
import getModel from '../models/genericModel.js';
import { logAudit } from '../utils/auditLogger.js';
import { triggerWebhooks } from '../utils/webhookTrigger.js';

const router = express.Router();

const typeMap = { String: String, Number: Number, Date: Date, Boolean: Boolean, RichText: String };

router.post('/:modelName', async (req, res) => {
  try {
    const ct = await ContentType.findOne({ slug: req.params.modelName, tenantId: req.tenant });
    if (!ct) return res.status(404).json({ message: "Content type not found" });
    const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));
    req.body.tenantId = req.tenant;
    const data = await Model.create(req.body);
    
    await logAudit({
      tenantId: req.tenant,
      userId: req.user?.id,
      action: 'create',
      entityType: 'entry',
      entityId: data._id.toString(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    triggerWebhooks({ tenantId: req.tenant, event: 'content.create', contentType: req.params.modelName, data });
    
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:modelName', async (req, res) => {
  try {
    const ct = await ContentType.findOne({ slug: req.params.modelName, tenantId: req.tenant });
    if (!ct) return res.status(404).json({ message: "Content type not found" });
    const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));
    
    const filter = { tenantId: req.tenant };
    if (req.query.status) filter.status = req.query.status;
    
    const data = await Model.find(filter).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:modelName/:id', async (req, res) => {
  try {
    const ct = await ContentType.findOne({ slug: req.params.modelName, tenantId: req.tenant });
    if (!ct) return res.status(404).json({ message: "Content type not found" });
    const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));
    const data = await Model.findOne({ _id: req.params.id, tenantId: req.tenant });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:modelName/:id', async (req, res) => {
  try {
    const ct = await ContentType.findOne({ slug: req.params.modelName, tenantId: req.tenant });
    if (!ct) return res.status(404).json({ message: "Content type not found" });
    const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));
    const data = await Model.findOneAndUpdate({ _id: req.params.id, tenantId: req.tenant }, req.body, { new: true });
    
    await logAudit({
      tenantId: req.tenant,
      userId: req.user?.id,
      action: 'update',
      entityType: 'entry',
      entityId: data._id.toString(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    triggerWebhooks({ tenantId: req.tenant, event: 'content.update', contentType: req.params.modelName, data });
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:modelName/:id', async (req, res) => {
  try {
    const ct = await ContentType.findOne({ slug: req.params.modelName, tenantId: req.tenant });
    if (!ct) return res.status(404).json({ message: "Content type not found" });
    const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));
    const data = await Model.findOneAndDelete({ _id: req.params.id, tenantId: req.tenant });
    
    await logAudit({
      tenantId: req.tenant,
      userId: req.user?.id,
      action: 'delete',
      entityType: 'entry',
      entityId: data?._id.toString(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    triggerWebhooks({ tenantId: req.tenant, event: 'content.delete', contentType: req.params.modelName, data });
    
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:modelName/:id/publish', async (req, res) => {
  try {
    const ct = await ContentType.findOne({ slug: req.params.modelName, tenantId: req.tenant });
    if (!ct) return res.status(404).json({ message: "Content type not found" });
    const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));
    const data = await Model.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenant },
      { status: 'published', publishedAt: new Date() },
      { new: true }
    );
    triggerWebhooks({ tenantId: req.tenant, event: 'content.publish', contentType: req.params.modelName, data });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:modelName/:id/unpublish', async (req, res) => {
  try {
    const ct = await ContentType.findOne({ slug: req.params.modelName, tenantId: req.tenant });
    if (!ct) return res.status(404).json({ message: "Content type not found" });
    const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));
    const data = await Model.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenant },
      { status: 'draft', publishedAt: null },
      { new: true }
    );
    triggerWebhooks({ tenantId: req.tenant, event: 'content.unpublish', contentType: req.params.modelName, data });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:modelName/export/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const ct = await ContentType.findOne({ slug: req.params.modelName, tenantId: req.tenant });
    if (!ct) return res.status(404).json({ message: "Content type not found" });
    const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));
    const data = await Model.find({ tenantId: req.tenant });

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=${req.params.modelName}.json`);
      return res.json(data);
    }

    if (format === 'csv') {
      const fields = ct.fields.map(f => f.name);
      const header = fields.join(',');
      const rows = data.map(entry => fields.map(f => `"${(entry[f] || '').toString().replace(/"/g, '""')}"`).join(','));
      const csv = [header, ...rows].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${req.params.modelName}.csv`);
      return res.send(csv);
    }

    res.status(400).json({ error: "Invalid format. Use 'json' or 'csv'" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;