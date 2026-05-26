import { logAudit } from '../utils/auditLogger.js';

const SYSTEM_FIELDS = new Set(['tenantId', 'status', 'publishedAt', 'scheduledPublishAt', 'scheduledUnpublishAt', 'locale', 'translations', 'isDeleted', 'deletedAt', 'accessPassword', 'notes', 'tags', 'workflowStage', 'passwordProtected', '_id', '__v', 'createdAt', 'updatedAt']);

const stripSystemFields = (body) => {
  const clean = {};
  for (const key of Object.keys(body)) {
    if (!SYSTEM_FIELDS.has(key)) clean[key] = body[key];
  }
  return clean;
};

export const create = (Model) => async (req, res) => {
  try {
    const body = stripSystemFields(req.body);
    body.tenantId = req.tenant;
    const data = await Model.create(body);
    
    await logAudit({
      tenantId: req.tenant,
      userId: req.user?.id,
      action: 'create',
      entityType: 'entry',
      entityId: data._id.toString(),
      changes: req.body,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAll = (Model) => async (req, res) => {
  try {
    const data = await Model.find({ tenantId: req.tenant });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOne = (Model) => async (req, res) => {
  try {
    const data = await Model.findOne({ _id: req.params.id, tenantId: req.tenant });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const update = (Model) => async (req, res) => {
  try {
    const oldData = await Model.findOne({ _id: req.params.id, tenantId: req.tenant });
    const body = stripSystemFields(req.body);
    const data = await Model.findOneAndUpdate({ _id: req.params.id, tenantId: req.tenant }, body, {
      new: true,
    });
    
    await logAudit({
      tenantId: req.tenant,
      userId: req.user?.id,
      action: 'update',
      entityType: 'entry',
      entityId: data._id.toString(),
      changes: { old: oldData, new: req.body },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const remove = (Model) => async (req, res) => {
  try {
    const data = await Model.findOneAndDelete({ _id: req.params.id, tenantId: req.tenant });
    
    await logAudit({
      tenantId: req.tenant,
      userId: req.user?.id,
      action: 'delete',
      entityType: 'entry',
      entityId: data?._id.toString(),
      entityName: data?.title || 'Unknown',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};