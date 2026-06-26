import express from 'express';
import ContentVersion from '../models/contentVersion.js';
import getModel from '../models/genericModel.js';
import { logAudit } from '../utils/auditLogger.js';
import { triggerWebhooks } from '../utils/webhookTrigger.js';
import { cacheControl } from '../utils/cacheControl.js';
import { validateEntry } from '../utils/fieldValidation.js';
import { getContentType } from '../utils/contentTypeCache.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

import { typeMap, saveVersion } from '../utils/contentUtils.js';

const META_FIELDS = ['status', 'locale', 'translations', 'tags', 'accessPassword', 'notes', 'workflowStage'];

const hasProtectedEntryAccess = (req, entry) => {
  if (!entry.accessPassword || req.userRole === 'admin') return true;
  const token = req.headers['x-entry-access-token'];
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { audience: 'entry-access' });
    return decoded.entryId === entry._id.toString() && decoded.tenantId === req.tenant;
  } catch {
    return false;
  }
};

const autoSlug = (ct, body) => {
  const slugField = ct.fields.find(f => f.name === 'slug' && (f.type === 'String' || f.type === 'RichText'));
  if (!slugField || body[slugField.name]) return;
  const firstStrField = ct.fields.find(f => f.type === 'String' && f.name !== 'slug');
  if (firstStrField && body[firstStrField.name]) {
    body[slugField.name] = body[firstStrField.name].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
  }
};

const populateReferences = async (entries, ct, _locale) => {
  const refFields = ct.fields.filter(f => f.type === 'Reference');
  if (!refFields.length) return entries;

  const isArray = Array.isArray(entries);
  const list = isArray ? entries : [entries];

  for (const refField of refFields) {
    const refCt = await getContentType(ct.tenantId, refField.refContentType);
    if (!refCt) continue;
    const refModel = getModel(refCt.name, Object.fromEntries(refCt.fields.map(f => [f.name, typeMap[f.type] || String])));
    const ids = [...new Set(list.map(e => e[refField.name]).filter(Boolean))];
    if (!ids.length) continue;
    const refEntries = await refModel.find({ _id: { $in: ids }, tenantId: ct.tenantId });
    const refMap = {};
    for (const ref of refEntries) {
      const _display = ref[refCt.fields[0]?.name] || ref._id;
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
    const ct = await getContentType(req.tenant, req.params.modelName);
    if (!ct) return res.status(404).json({ message: "Content type not found" });

    const validationErrors = validateEntry(ct.fields, req.body);
    if (validationErrors.length) return res.status(400).json({ error: 'Validation failed', details: validationErrors });

    const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));
    const body = {};
    for (const key of META_FIELDS) {
      if (req.body[key] !== undefined) body[key] = req.body[key];
    }
    if (body.accessPassword) {
      body.accessPassword = await bcrypt.hash(body.accessPassword, 10);
    }
    autoSlug(ct, body);
    if (body.scheduledPublishAt) body.status = 'scheduled';
    body.tenantId = req.tenant;
    const data = await Model.create(body);
    
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
    
    triggerWebhooks({ tenantId: req.tenant, event: 'content.create', contentType: req.params.modelName, data }).catch(() => {});
    
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:modelName', cacheControl, async (req, res) => {
  try {
    const ct = await getContentType(req.tenant, req.params.modelName);
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
    if (req.query.q) {
      const searchRegex = new RegExp(req.query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const searchFields = ct.fields.filter(f => f.type === 'String' || f.type === 'RichText').map(f => f.name);
      if (searchFields.length) {
        filter.$or = searchFields.map(f => ({ [f]: searchRegex }));
      }
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;
    
    const [total, docs] = await Promise.all([
      Model.countDocuments(filter),
      Model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
    ]);
    
    let data = docs.map(e => {
      const o = e.toObject();
      const passwordProtected = !!o.accessPassword;
      const canAccess = hasProtectedEntryAccess(req, e);
      delete o.accessPassword;
      delete o.notes;
      if (passwordProtected && !canAccess) {
        for (const field of ct.fields) delete o[field.name];
      }
      return { ...o, passwordProtected, accessRequired: passwordProtected && !canAccess };
    });
    if (req.query.locale) {
      data = data.map(e => applyLocale(e, req.query.locale));
    }
    if (req.query.populate === 'true') {
      data = await populateReferences(data, ct);
    }
    res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:modelName/:id', cacheControl, async (req, res) => {
  try {
    const ct = await getContentType(req.tenant, req.params.modelName);
    if (!ct) return res.status(404).json({ message: "Content type not found" });
    const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));
    let data = await Model.findOne({ _id: req.params.id, tenantId: req.tenant, isDeleted: { $ne: true } });
    if (!data) return res.status(404).json({ message: 'Entry not found' });
    if (!hasProtectedEntryAccess(req, data)) {
      return res.status(403).json({ message: 'Entry password required', passwordProtected: true });
    }
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
    const ct = await getContentType(req.tenant, req.params.modelName);
    if (!ct) return res.status(404).json({ message: "Content type not found" });

    const validationErrors = validateEntry(ct.fields, req.body);
    if (validationErrors.length) return res.status(400).json({ error: 'Validation failed', details: validationErrors });

    const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));
    const body = {};
    for (const f of ct.fields) {
      if (req.body[f.name] !== undefined) {
        body[f.name] = req.body[f.name];
      }
    }
    for (const key of META_FIELDS) {
      if (req.body[key] !== undefined) body[key] = req.body[key];
    }
    if (body.accessPassword) {
      body.accessPassword = await bcrypt.hash(body.accessPassword, 10);
    } else if (body.accessPassword === '') {
      body.accessPassword = null;
    }
    if (req.body.changeDescription) body.changeDescription = req.body.changeDescription;
    autoSlug(ct, body);
    if (body.scheduledPublishAt && !body.scheduledUnpublishAt) body.status = 'scheduled';
    const data = await Model.findOneAndUpdate({ _id: req.params.id, tenantId: req.tenant }, body, { new: true });
    
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
    
    triggerWebhooks({ tenantId: req.tenant, event: 'content.update', contentType: req.params.modelName, data }).catch(() => {});
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:modelName/:id', async (req, res) => {
  try {
    const ct = await getContentType(req.tenant, req.params.modelName);
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
    
    triggerWebhooks({ tenantId: req.tenant, event: 'content.delete', contentType: req.params.modelName, data }).catch(() => {});
    
    res.json({ message: "Moved to trash" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:modelName/:id/permanent', async (req, res) => {
  try {
    const ct = await getContentType(req.tenant, req.params.modelName);
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
    const ct = await getContentType(req.tenant, req.params.modelName);
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
    const ct = await getContentType(req.tenant, req.params.modelName);
    if (!ct) return res.status(404).json({ message: "Content type not found" });
    const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));
    const data = await Model.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenant },
      { status: 'published', publishedAt: new Date(), $unset: { scheduledPublishAt: 1 } },
      { new: true }
    );
    if (!data) return res.status(404).json({ message: 'Entry not found' });
    await saveVersion({
      tenantId: req.tenant, contentTypeSlug: ct.slug, contentTypeName: ct.name,
      entryId: data._id, data: data.toObject(), status: 'published',
      userId: req.user?.id, description: 'Published'
    });
    triggerWebhooks({ tenantId: req.tenant, event: 'content.publish', contentType: req.params.modelName, data }).catch(() => {});
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:modelName/:id/unpublish', async (req, res) => {
  try {
    const ct = await getContentType(req.tenant, req.params.modelName);
    if (!ct) return res.status(404).json({ message: "Content type not found" });
    const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));
    const data = await Model.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenant },
      { status: 'draft', $unset: { publishedAt: 1, scheduledUnpublishAt: 1 } },
      { new: true }
    );
    if (!data) return res.status(404).json({ message: 'Entry not found' });

    await saveVersion({
      tenantId: req.tenant, contentTypeSlug: ct.slug, contentTypeName: ct.name,
      entryId: data._id, data: data.toObject(), status: 'draft',
      userId: req.user?.id, description: 'Unpublished'
    });

    await logAudit({
      tenantId: req.tenant, userId: req.user?.id, action: 'unpublish',
      entityType: 'entry', entityId: data._id.toString(),
      ipAddress: req.ip, userAgent: req.headers['user-agent']
    });

    triggerWebhooks({ tenantId: req.tenant, event: 'content.unpublish', contentType: req.params.modelName, data }).catch(() => {});

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:modelName/import', async (req, res) => {
  try {
    const ct = await getContentType(req.tenant, req.params.modelName);
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
    const ct = await getContentType(req.tenant, req.params.modelName);
    if (!ct) return res.status(404).json({ message: "Content type not found" });
    const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));

    const { ids, updates } = req.body;
    if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: 'No IDs provided' });
    if (!updates || typeof updates !== 'object') return res.status(400).json({ error: 'No updates provided' });

    const allowedFields = [...ct.fields.map(f => f.name), ...META_FIELDS];
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
      const entry = await Model.findOne({ _id: id, tenantId: req.tenant });
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
    const ct = await getContentType(req.tenant, req.params.modelName);
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

router.get('/:modelName/:id/versions', async (req, res) => {
  try {
    const ct = await getContentType(req.tenant, req.params.modelName);
    if (!ct) return res.status(404).json({ message: 'Content type not found' });
    const versions = await ContentVersion.find({ entryId: req.params.id, tenantId: req.tenant })
      .sort({ version: -1 })
      .select('version status createdAt createdBy changeDescription')
      .lean();
    res.json(versions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:modelName/:id/versions/:versionId', async (req, res) => {
  try {
    const ct = await getContentType(req.tenant, req.params.modelName);
    if (!ct) return res.status(404).json({ message: 'Content type not found' });
    const version = await ContentVersion.findOne({ _id: req.params.versionId, entryId: req.params.id, tenantId: req.tenant });
    if (!version) return res.status(404).json({ message: 'Version not found' });
    res.json(version);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:modelName/:id/versions/diff', async (req, res) => {
  try {
    const ct = await getContentType(req.tenant, req.params.modelName);
    if (!ct) return res.status(404).json({ message: 'Content type not found' });
    const versions = await ContentVersion.find({ entryId: req.params.id, tenantId: req.tenant })
      .sort({ version: -1 })
      .limit(2)
      .lean();
    if (versions.length < 2) return res.json({ left: null, right: null, message: 'Not enough versions for diff' });
    res.json({ left: versions[1], right: versions[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:modelName/:id/verify-password', async (req, res) => {
  try {
    const ct = await getContentType(req.tenant, req.params.modelName);
    if (!ct) return res.status(404).json({ message: 'Content type not found' });
    const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));
    const entry = await Model.findOne({ _id: req.params.id, tenantId: req.tenant, isDeleted: { $ne: true } });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    if (!entry.accessPassword) return res.json({ accessGranted: true });
    const isMatch = await bcrypt.compare(req.body.password || '', entry.accessPassword);
    if (isMatch) {
      const accessToken = jwt.sign(
        { entryId: entry._id.toString(), tenantId: req.tenant },
        process.env.JWT_SECRET,
        { expiresIn: '10m', audience: 'entry-access' },
      );
      return res.json({ accessGranted: true, accessToken, expiresIn: 600 });
    }
    res.status(403).json({ accessGranted: false, message: 'Incorrect password' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:modelName/:id/rollback/:versionId', async (req, res) => {
  try {
    const ct = await getContentType(req.tenant, req.params.modelName);
    if (!ct) return res.status(404).json({ message: 'Content type not found' });
    const version = await ContentVersion.findOne({ _id: req.params.versionId, tenantId: req.tenant, entryId: req.params.id });
    if (!version) return res.status(404).json({ message: 'Version not found' });
    const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));
    const entry = await Model.findOne({ _id: req.params.id, tenantId: req.tenant, isDeleted: { $ne: true } });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    const body = {};
    for (const f of ct.fields) {
      if (version.data[f.name] !== undefined) body[f.name] = version.data[f.name];
    }
    for (const key of META_FIELDS) {
      if (version.data[key] !== undefined) body[key] = version.data[key];
    }
    body.status = version.status || entry.status;
    const data = await Model.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenant },
      body,
      { new: true }
    );
    if (!data) return res.status(404).json({ message: 'Entry not found' });

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

router.post('/:modelName/bulk-delete', async (req, res) => {
  try {
    const ct = await getContentType(req.tenant, req.params.modelName);
    if (!ct) return res.status(404).json({ message: "Content type not found" });
    const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: 'No IDs provided' });

    const result = await Model.updateMany(
      { _id: { $in: ids }, tenantId: req.tenant },
      { isDeleted: true, deletedAt: new Date() }
    );

    await logAudit({
      tenantId: req.tenant, userId: req.user?.id, action: 'bulk_update',
      entityType: 'entry', entityId: `${ids.length} entries`,
      metadata: { contentType: ct.name, action: 'bulk_delete' },
      ipAddress: req.ip, userAgent: req.headers['user-agent']
    });

    res.json({ status: 'success', message: `Deleted ${result.modifiedCount} entries`, modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:modelName/bulk-publish', async (req, res) => {
  try {
    const ct = await getContentType(req.tenant, req.params.modelName);
    if (!ct) return res.status(404).json({ message: "Content type not found" });
    const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: 'No IDs provided' });

    await Model.updateMany(
      { _id: { $in: ids }, tenantId: req.tenant, isDeleted: { $ne: true } },
      { $set: { status: 'published', publishedAt: new Date() }, $unset: { scheduledPublishAt: 1 } }
    );

    await logAudit({
      tenantId: req.tenant, userId: req.user?.id, action: 'bulk_update',
      entityType: 'entry', entityId: `${ids.length} entries`,
      metadata: { contentType: ct.name, action: 'bulk_publish' },
      ipAddress: req.ip, userAgent: req.headers['user-agent']
    });

    res.json({ status: 'success', message: `Published ${ids.length} entries` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:modelName/:id/transition', async (req, res) => {
  try {
    const ct = await getContentType(req.tenant, req.params.modelName);
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
    const ct = await getContentType(req.tenant, req.params.modelName);
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
      const sanitizeCsv = (val) => {
        const str = (val || '').toString();
        const sanitized = str.replace(/"/g, '""');
        if (/^[=+\-@]/.test(sanitized)) return `"'${sanitized}"`;
        return `"${sanitized}"`;
      };
      const rows = data.map(entry => fields.map(f => sanitizeCsv(entry[f])).join(','));
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
