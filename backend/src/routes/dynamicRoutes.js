import express from 'express';
import ContentType from '../models/contentType.js';
import ContentVersion from '../models/contentVersion.js';
import getModel from '../models/genericModel.js';
import { logAudit } from '../utils/auditLogger.js';
import { triggerWebhooks } from '../utils/webhookTrigger.js';
import { cacheControl } from '../utils/cacheControl.js';
import { validateEntry } from '../utils/fieldValidation.js';

const router = express.Router();

const typeMap = { String: String, Number: Number, Date: Date, Boolean: Boolean, RichText: String, Reference: String };

const autoSlug = (ct, body) => {
  const slugField = ct.fields.find(f => f.name === 'slug' && (f.type === 'String' || f.type === 'RichText'));
  if (!slugField || body[slugField.name]) return;
  const firstStrField = ct.fields.find(f => f.type === 'String' && f.name !== 'slug');
  if (firstStrField && body[firstStrField.name]) {
    body[slugField.name] = body[firstStrField.name].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
  }
};

const saveVersion = async ({ tenantId, contentTypeSlug, contentTypeName, entryId, data, status, userId, description }) => {
  const lastVersion = await ContentVersion.findOne({ tenantId, entryId }).sort({ version: -1 });
  const version = (lastVersion?.version || 0) + 1;
  await ContentVersion.create({
    tenantId, contentTypeSlug, contentTypeName, entryId,
    version, data, status: status || data.status || 'draft',
    createdBy: userId, changeDescription: description || ''
  });
};

const populateReferences = async (entries, ct, locale) => {
  const refFields = ct.fields.filter(f => f.type === 'Reference');
  if (!refFields.length) return entries;

  const isArray = Array.isArray(entries);
  const list = isArray ? entries : [entries];

  for (const refField of refFields) {
    const refCt = await ContentType.findOne({ slug: refField.refContentType, tenantId: ct.tenantId });
    if (!refCt) continue;
    const refModel = getModel(refCt.name, Object.fromEntries(refCt.fields.map(f => [f.name, typeMap[f.type] || String])));
    const ids = [...new Set(list.map(e => e[refField.name]).filter(Boolean))];
    if (!ids.length) continue;
    const refEntries = await refModel.find({ _id: { $in: ids }, tenantId: ct.tenantId });
    const refMap = {};
    for (const ref of refEntries) {
      let display = ref[refCt.fields[0]?.name] || ref._id;
      refMap[ref._id.toString()] = { _id: ref._id, ...(ref.toObject ? ref.toObject() : ref) };
    }
    for (const entry of list) {
      if (entry[refField.name] && refMap[entry[refField.name]]) {
        entry[`${refField.name}_data`] = refMap[entry[refField.name]];
      }
    }
  }

  return isArray ? list : list[0];
};

const applyLocale = (entry, locale) => {
  if (!locale || locale === entry.locale || !entry.translations?.length) return entry;
  const translation = entry.translations.find(t => t.locale === locale);
  if (!translation) return entry;
  const merged = entry.toObject ? entry.toObject() : { ...entry };
  for (const [key, value] of (translation.fields || new Map())) {
    if (key !== '_id' && key !== 'tenantId' && key !== 'locale' && key !== 'translations') {
      merged[key] = value;
    }
  }
  return merged;
};

router.post('/:modelName', async (req, res) => {
  try {
    const ct = await ContentType.findOne({ slug: req.params.modelName, tenantId: req.tenant });
    if (!ct) return res.status(404).json({ message: "Content type not found" });

    const validationErrors = validateEntry(ct.fields, req.body);
    if (validationErrors.length) return res.status(400).json({ error: 'Validation failed', details: validationErrors });

    const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));
    autoSlug(ct, req.body);
    for (const f of ct.fields) {
      if (f.defaultValue !== undefined && req.body[f.name] === undefined) {
        req.body[f.name] = f.defaultValue;
      }
    }
    if (req.body.scheduledPublishAt) req.body.status = 'scheduled';
    req.body.tenantId = req.tenant;
    const data = await Model.create(req.body);
    
    await saveVersion({
      tenantId: req.tenant, contentTypeSlug: ct.slug, contentTypeName: ct.name,
      entryId: data._id, data: data.toObject(), status: data.status,
      userId: req.user?.id, description: 'Initial version'
    });
    
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

router.get('/:modelName', cacheControl, async (req, res) => {
  try {
    const ct = await ContentType.findOne({ slug: req.params.modelName, tenantId: req.tenant });
    if (!ct) return res.status(404).json({ message: "Content type not found" });
    const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));
    
    const filter = { tenantId: req.tenant };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.tag) filter.tags = { $in: [req.query.tag] };
    if (req.query.trash === 'true') {
      filter.isDeleted = true;
    } else {
      filter.isDeleted = { $ne: true };
    }
    
    let data = await Model.find(filter).sort({ createdAt: -1 });
    data = data.map(e => { const o = e.toObject(); const p = !!o.accessPassword; delete o.accessPassword; delete o.notes; return { ...o, passwordProtected: p }; });
    if (req.query.locale) {
      data = data.map(e => applyLocale(e, req.query.locale));
    }
    if (req.query.populate === 'true') {
      data = await populateReferences(data, ct);
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:modelName/:id', cacheControl, async (req, res) => {
  try {
    const ct = await ContentType.findOne({ slug: req.params.modelName, tenantId: req.tenant });
    if (!ct) return res.status(404).json({ message: "Content type not found" });
    const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));
    let data = await Model.findOne({ _id: req.params.id, tenantId: req.tenant, isDeleted: { $ne: true } });
    if (!data) return res.status(404).json({ message: 'Entry not found' });
    data = data.toObject();
    const p = !!data.accessPassword;
    delete data.accessPassword;
    delete data.notes;
    data.passwordProtected = p;
    if (req.query.locale) data = applyLocale(data, req.query.locale);
    if (req.query.populate === 'true') {
      data = await populateReferences(data, ct);
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:modelName/:id', async (req, res) => {
  try {
    const ct = await ContentType.findOne({ slug: req.params.modelName, tenantId: req.tenant });
    if (!ct) return res.status(404).json({ message: "Content type not found" });

    const validationErrors = validateEntry(ct.fields, req.body);
    if (validationErrors.length) return res.status(400).json({ error: 'Validation failed', details: validationErrors });

    const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));
    autoSlug(ct, req.body);
    if (req.body.scheduledPublishAt && !req.body.scheduledUnpublishAt) req.body.status = 'scheduled';
    const data = await Model.findOneAndUpdate({ _id: req.params.id, tenantId: req.tenant }, req.body, { new: true });
    
    await saveVersion({
      tenantId: req.tenant, contentTypeSlug: ct.slug, contentTypeName: ct.name,
      entryId: data._id, data: data.toObject(), status: data.status,
      userId: req.user?.id, description: req.body.changeDescription || 'Updated'
    });
    
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
    const data = await Model.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenant },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    
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
    
    res.json({ message: "Moved to trash" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:modelName/:id/permanent', async (req, res) => {
  try {
    const ct = await ContentType.findOne({ slug: req.params.modelName, tenantId: req.tenant });
    if (!ct) return res.status(404).json({ message: "Content type not found" });
    const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));
    const data = await Model.findOneAndDelete({ _id: req.params.id, tenantId: req.tenant, isDeleted: true });
    if (!data) return res.status(404).json({ message: "Deleted entry not found" });
    
    await ContentVersion.deleteMany({ entryId: req.params.id, tenantId: req.tenant });
    
    await logAudit({
      tenantId: req.tenant, userId: req.user?.id, action: 'permanent_delete',
      entityType: 'entry', entityId: req.params.id,
      ipAddress: req.ip, userAgent: req.headers['user-agent']
    });
    
    res.json({ message: "Permanently deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:modelName/:id/restore', async (req, res) => {
  try {
    const ct = await ContentType.findOne({ slug: req.params.modelName, tenantId: req.tenant });
    if (!ct) return res.status(404).json({ message: "Content type not found" });
    const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));
    const data = await Model.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenant, isDeleted: true },
      { isDeleted: false, $unset: { deletedAt: 1 } },
      { new: true }
    );
    if (!data) return res.status(404).json({ message: "Deleted entry not found" });
    
    await saveVersion({
      tenantId: req.tenant, contentTypeSlug: ct.slug, contentTypeName: ct.name,
      entryId: data._id, data: data.toObject(), status: data.status,
      userId: req.user?.id, description: 'Restored from trash'
    });
    
    await logAudit({
      tenantId: req.tenant, userId: req.user?.id, action: 'restore',
      entityType: 'entry', entityId: data._id.toString(),
      ipAddress: req.ip, userAgent: req.headers['user-agent']
    });
    
    res.json({ message: "Restored successfully", data });
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
      { status: 'published', publishedAt: new Date(), $unset: { scheduledPublishAt: 1 } },
      { new: true }
    );
    await saveVersion({
      tenantId: req.tenant, contentTypeSlug: ct.slug, contentTypeName: ct.name,
      entryId: data._id, data: data.toObject(), status: 'published',
      userId: req.user?.id, description: 'Published'
    });
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
      { status: 'draft', publishedAt: null, $unset: { scheduledUnpublishAt: 1 } },
      { new: true }
    );
    await saveVersion({
      tenantId: req.tenant, contentTypeSlug: ct.slug, contentTypeName: ct.name,
      entryId: data._id, data: data.toObject(), status: 'draft',
      userId: req.user?.id, description: 'Unpublished'
    });
    triggerWebhooks({ tenantId: req.tenant, event: 'content.unpublish', contentType: req.params.modelName, data });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:modelName/:id/versions', async (req, res) => {
  try {
    const ct = await ContentType.findOne({ slug: req.params.modelName, tenantId: req.tenant });
    if (!ct) return res.status(404).json({ message: "Content type not found" });
    const versions = await ContentVersion.find({ tenantId: req.tenant, entryId: req.params.id })
      .sort({ version: -1 })
      .select('-data');
    res.json({ status: 'success', count: versions.length, data: versions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:modelName/:id/versions/diff', async (req, res) => {
  try {
    const ct = await ContentType.findOne({ slug: req.params.modelName, tenantId: req.tenant });
    if (!ct) return res.status(404).json({ message: "Content type not found" });

    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ message: "Both 'from' and 'to' version IDs are required" });

    const fromVersion = await ContentVersion.findOne({ _id: from, tenantId: req.tenant, entryId: req.params.id });
    const toVersion = await ContentVersion.findOne({ _id: to, tenantId: req.tenant, entryId: req.params.id });
    if (!fromVersion || !toVersion) return res.status(404).json({ message: "Version not found" });

    const fromData = fromVersion.data || {};
    const toData = toVersion.data || {};
    const allKeys = new Set([...Object.keys(fromData), ...Object.keys(toData)]);
    const systemKeys = new Set(['_id', '__v', 'tenantId', 'createdAt', 'updatedAt', 'isDeleted', 'deletedAt']);

    const added = {};
    const removed = {};
    const changed = {};
    const unchanged = {};

    for (const key of allKeys) {
      if (systemKeys.has(key)) continue;
      if (!(key in fromData) && (key in toData)) added[key] = { new: toData[key] };
      else if ((key in fromData) && !(key in toData)) removed[key] = { old: fromData[key] };
      else if (fromData[key] !== toData[key]) changed[key] = { old: fromData[key], new: toData[key] };
      else unchanged[key] = toData[key];
    }

    res.json({
      status: 'success',
      diff: { added, removed, changed, unchanged },
      fromVersion: { version: fromVersion.version, createdAt: fromVersion.createdAt, changeDescription: fromVersion.changeDescription, createdBy: fromVersion.createdBy, status: fromVersion.status },
      toVersion: { version: toVersion.version, createdAt: toVersion.createdAt, changeDescription: toVersion.changeDescription, createdBy: toVersion.createdBy, status: toVersion.status }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:modelName/:id/versions/:versionId', async (req, res) => {
  try {
    const ct = await ContentType.findOne({ slug: req.params.modelName, tenantId: req.tenant });
    if (!ct) return res.status(404).json({ message: "Content type not found" });
    const version = await ContentVersion.findOne({ _id: req.params.versionId, tenantId: req.tenant, entryId: req.params.id });
    if (!version) return res.status(404).json({ message: "Version not found" });
    res.json({ status: 'success', data: version });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:modelName/:id/rollback/:versionId', async (req, res) => {
  try {
    const ct = await ContentType.findOne({ slug: req.params.modelName, tenantId: req.tenant });
    if (!ct) return res.status(404).json({ message: "Content type not found" });
    const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));
    const version = await ContentVersion.findOne({ _id: req.params.versionId, tenantId: req.tenant, entryId: req.params.id });
    if (!version) return res.status(404).json({ message: "Version not found" });

    const restoredData = { ...version.data };
    delete restoredData._id;
    delete restoredData.__v;
    delete restoredData.tenantId;
    delete restoredData.createdAt;
    delete restoredData.updatedAt;

    const data = await Model.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenant },
      { ...restoredData },
      { new: true }
    );

    await saveVersion({
      tenantId: req.tenant, contentTypeSlug: ct.slug, contentTypeName: ct.name,
      entryId: data._id, data: data.toObject(), status: data.status,
      userId: req.user?.id, description: `Rolled back to version ${version.version}`
    });

    await logAudit({
      tenantId: req.tenant, userId: req.user?.id, action: 'update',
      entityType: 'entry', entityId: data._id.toString(),
      ipAddress: req.ip, userAgent: req.headers['user-agent']
    });

    res.json({ status: 'success', message: `Rolled back to version ${version.version}`, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:modelName/import', async (req, res) => {
  try {
    const ct = await ContentType.findOne({ slug: req.params.modelName, tenantId: req.tenant });
    if (!ct) return res.status(404).json({ message: "Content type not found" });

    const schema = Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String]));
    const Model = getModel(ct.name, schema);
    const entries = Array.isArray(req.body) ? req.body : req.body?.entries;
    if (!entries || !entries.length) return res.status(400).json({ error: 'No entries provided' });

    const created = [];
    const errors = [];
    for (let i = 0; i < entries.length; i++) {
      try {
        const doc = { ...entries[i], tenantId: req.tenant, status: entries[i].status || 'draft' };
        delete doc._id;
        delete doc.__v;
        const entry = await Model.create(doc);
        await saveVersion({
          tenantId: req.tenant, contentTypeSlug: ct.slug, contentTypeName: ct.name,
          entryId: entry._id, data: doc, status: doc.status, userId: req.user.id,
          description: 'Imported'
        });
        await logAudit({ tenantId: req.tenant, userId: req.user.id, action: 'import',
          entityType: 'entry', entityId: entry._id.toString(), metadata: { contentType: ct.name },
          ipAddress: req.ip, userAgent: req.headers['user-agent']
        });
        created.push(entry._id);
      } catch (err) {
        errors.push({ index: i, error: err.message });
      }
    }

    await triggerWebhooks({ tenantId: req.tenant, event: 'content.import', contentType: ct.slug,
      data: { contentTypeName: ct.name, count: created.length, errors: errors.length }
    });

    res.json({ status: 'success', message: `Imported ${created.length} entries`, created: created.length, errors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:modelName/bulk', async (req, res) => {
  try {
    const ct = await ContentType.findOne({ slug: req.params.modelName, tenantId: req.tenant });
    if (!ct) return res.status(404).json({ message: "Content type not found" });
    const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));

    const { ids, updates } = req.body;
    if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: 'No IDs provided' });
    if (!updates || typeof updates !== 'object') return res.status(400).json({ error: 'No updates provided' });

    const allowedFields = ct.fields.map(f => f.name);
    allowedFields.push('status', 'locale');
    const cleanUpdates = {};
    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) cleanUpdates[key] = updates[key];
    }
    if (cleanUpdates.scheduledPublishAt) cleanUpdates.status = 'scheduled';

    const result = await Model.updateMany(
      { _id: { $in: ids }, tenantId: req.tenant, isDeleted: { $ne: true } },
      { $set: cleanUpdates }
    );

    for (const id of ids) {
      const entry = await Model.findById(id);
      if (entry) {
        await saveVersion({
          tenantId: req.tenant, contentTypeSlug: ct.slug, contentTypeName: ct.name,
          entryId: id, data: entry.toObject(), status: entry.status,
          userId: req.user?.id, description: 'Bulk edit'
        });
      }
    }

    await logAudit({
      tenantId: req.tenant, userId: req.user?.id, action: 'bulk_update',
      entityType: 'entry', entityId: `${ids.length} entries`,
      metadata: { contentType: ct.name, count: ids.length, fields: Object.keys(cleanUpdates) },
      ipAddress: req.ip, userAgent: req.headers['user-agent']
    });

    res.json({ status: 'success', message: `Updated ${result.modifiedCount} entries`, modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:modelName/:id/duplicate', async (req, res) => {
  try {
    const ct = await ContentType.findOne({ slug: req.params.modelName, tenantId: req.tenant });
    if (!ct) return res.status(404).json({ message: "Content type not found" });
    const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));
    const original = await Model.findOne({ _id: req.params.id, tenantId: req.tenant, isDeleted: { $ne: true } });
    if (!original) return res.status(404).json({ message: "Entry not found" });

    const cloneData = original.toObject();
    delete cloneData._id;
    delete cloneData.__v;
    delete cloneData.createdAt;
    delete cloneData.updatedAt;
    delete cloneData.publishedAt;
    delete cloneData.scheduledPublishAt;
    delete cloneData.scheduledUnpublishAt;
    cloneData.status = 'draft';
    cloneData.locale = original.locale || 'en';

    const labelField = ct.fields[0]?.name;
    if (labelField && typeof cloneData[labelField] === 'string') {
      cloneData[labelField] = `${cloneData[labelField]} (Copy)`;
    }

    const cloned = await Model.create(cloneData);

    await saveVersion({
      tenantId: req.tenant, contentTypeSlug: ct.slug, contentTypeName: ct.name,
      entryId: cloned._id, data: cloned.toObject(), status: 'draft',
      userId: req.user?.id, description: 'Duplicated'
    });

    await logAudit({
      tenantId: req.tenant, userId: req.user?.id, action: 'duplicate',
      entityType: 'entry', entityId: cloned._id.toString(),
      metadata: { contentType: ct.name, originalId: req.params.id },
      ipAddress: req.ip, userAgent: req.headers['user-agent']
    });

    res.status(201).json({ message: 'Duplicated successfully', data: cloned });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:modelName/:id/verify-password', async (req, res) => {
  try {
    const ct = await ContentType.findOne({ slug: req.params.modelName, tenantId: req.tenant });
    if (!ct) return res.status(404).json({ message: 'Content type not found' });
    const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));
    const entry = await Model.findOne({ _id: req.params.id, tenantId: req.tenant, isDeleted: { $ne: true } });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    if (!entry.accessPassword) return res.json({ accessGranted: true });
    if (req.body.password === entry.accessPassword) return res.json({ accessGranted: true });
    res.status(403).json({ accessGranted: false, message: 'Incorrect password' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:modelName/:id/transition — Transition an entry to a workflow stage
router.post('/:modelName/:id/transition', async (req, res) => {
  try {
    const ct = await ContentType.findOne({ slug: req.params.modelName, tenantId: req.tenant });
    if (!ct) return res.status(404).json({ message: 'Content type not found' });
    if (!ct.workflowEnabled) return res.status(400).json({ message: 'Workflow is not enabled for this content type' });
    const { stage } = req.body;
    if (!stage) return res.status(400).json({ message: 'Stage is required' });
    const validStage = ct.workflowStages.find(s => s.name === stage);
    if (!validStage) return res.status(400).json({ message: `Invalid stage: ${stage}` });

    const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));
    const data = await Model.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenant },
      { workflowStage: stage, status: stage === 'Published' ? 'published' : 'draft' },
      { new: true }
    );
    if (!data) return res.status(404).json({ message: 'Entry not found' });

    await saveVersion({
      tenantId: req.tenant, contentTypeSlug: ct.slug, contentTypeName: ct.name,
      entryId: data._id, data: data.toObject(), status: data.status,
      userId: req.user?.id, description: `Transitioned to "${stage}"`
    });

    await logAudit({
      tenantId: req.tenant, userId: req.user?.id, action: 'update',
      entityType: 'entry', entityId: data._id.toString(),
      metadata: { transition: stage, contentType: ct.name },
      ipAddress: req.ip, userAgent: req.headers['user-agent']
    });

    const o = data.toObject();
    delete o.accessPassword;
    delete o.notes;
    res.json({ ...o, passwordProtected: !!data.accessPassword });
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