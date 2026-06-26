import ContentType from '../models/contentType.js';
import ContentVersion from '../models/contentVersion.js';
import EntryComment from '../models/entryComment.js';
import EntryLock from '../models/entryLock.js';
import getModel, { clearModelCache } from '../models/genericModel.js';
import ApiKey from '../models/apiKey.js';
import User from '../models/user.js';
import Media from '../models/media.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { getRolePermissions } from '../middlewares/roleMiddleware.js';
import { typeMap, saveVersion } from '../utils/contentUtils.js';

const getModelForCt = (ct) => getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));

const requirePermission = async (req, permission) => {
  if (!req.user) throw new Error('User authentication required');
  const permissions = await getRolePermissions(req.tenant, req.userRole || 'member');
  if (!permissions[permission]) throw new Error('Insufficient permissions');
};

const protectEntry = (req, entry, fields = null) => {
  const result = entry.toObject ? entry.toObject() : { ...entry };
  const passwordProtected = !!result.accessPassword;
  let canAccess = !passwordProtected || req.userRole === 'admin';
  const token = req.headers['x-entry-access-token'];
  if (!canAccess && token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { audience: 'entry-access' });
      canAccess = decoded.entryId === result._id.toString() && decoded.tenantId === req.tenant;
    } catch {
      canAccess = false;
    }
  }
  delete result.accessPassword;
  delete result.notes;
  if (!canAccess) {
    if (!fields) throw new Error('Entry password required');
    for (const field of fields) delete result[field.name];
  }
  return { ...result, passwordProtected, accessRequired: passwordProtected && !canAccess };
};

export const resolvers = {
  Query: {
    contentTypes: async (_, __, { req }) => {
      return ContentType.find({ tenantId: req.tenant });
    },
    contentType: async (_, { slug }, { req }) => {
      return ContentType.findOne({ tenantId: req.tenant, slug });
    },
    entries: async (_, { contentTypeSlug, status, locale, search }, { req }) => {
      const ct = await ContentType.findOne({ tenantId: req.tenant, slug: contentTypeSlug });
      if (!ct) throw new Error('Content type not found');
      const Model = getModelForCt(ct);
      const filter = { tenantId: req.tenant };
      if (status) filter.status = status;
      if (search) {
        filter.$or = ct.fields.filter(f => f.type === 'String').map(f => ({ [f.name]: { $regex: search, $options: 'i' } }));
      }
      let data = await Model.find(filter).sort({ createdAt: -1 }).lean();
      data = data.map(entry => protectEntry(req, entry, ct.fields));
      if (locale) {
        data = data.map(e => {
          if (!e.translations?.length) return { ...e, data: e };
          const t = e.translations.find(t => t.locale === locale);
          if (!t) return { ...e, data: e };
          const merged = { ...e, ...Object.fromEntries(t.fields || new Map()) };
          return { ...merged, data: e };
        });
      } else {
        data = data.map(e => ({ ...e, data: e }));
      }
      return data;
    },
    entry: async (_, { contentTypeSlug, id, locale }, { req }) => {
      const ct = await ContentType.findOne({ tenantId: req.tenant, slug: contentTypeSlug });
      if (!ct) throw new Error('Content type not found');
      const Model = getModelForCt(ct);
      let entry = await Model.findOne({ _id: id, tenantId: req.tenant }).lean();
      if (!entry) throw new Error('Entry not found');
      if (locale && entry.translations?.length) {
        const t = entry.translations.find(t => t.locale === locale);
        if (t) entry = { ...entry, ...Object.fromEntries(t.fields || new Map()) };
      }
      entry = protectEntry(req, entry);
      return { ...entry, data: entry };
    },
    apiKeys: async (_, __, { req }) => {
      await requirePermission(req, 'apiKeys');
      const keys = await ApiKey.find({ tenantId: req.tenant });
      return keys.map(k => ({
        _id: k._id, name: k.name, keyPreview: k.keyPreview,
        isActive: k.isActive, scopes: k.scopes, rateLimit: k.rateLimit,
        createdAt: k.createdAt, updatedAt: k.updatedAt
      }));
    },
    me: async (_, __, { req }) => {
      if (req.user?.id) return User.findById(req.user.id).lean();
      return null;
    },
    users: async (_, __, { req }) => {
      await requirePermission(req, 'userManagement');
      return User.find({ tenantId: req.tenant }).lean();
    },
    media: async (_, __, { req }) => {
      return Media.find({ tenantId: req.tenant }).sort({ createdAt: -1 }).lean();
    },
    docs: async (_, __, { req }) => {
      const contentTypes = await ContentType.find({ tenantId: req.tenant });
      const baseUrl = `${req.protocol}://${req.get('host')}/api/v1`;
      return { baseUrl, contentTypes };
    },
  },

  Mutation: {
    createEntry: async (_, { contentTypeSlug, data }, { req }) => {
      await requirePermission(req, 'contentEntries');
      const ct = await ContentType.findOne({ tenantId: req.tenant, slug: contentTypeSlug });
      if (!ct) throw new Error('Content type not found');
      const Model = getModelForCt(ct);
      const fieldNames = ct.fields.map(f => f.name);
      const allowed = ['status', 'locale', 'translations', 'scheduledPublishAt', 'scheduledUnpublishAt', 'publishedAt', 'tags', 'changeDescription', ...fieldNames];
      const sanitized = {};
      for (const key of allowed) {
        if (data[key] !== undefined) sanitized[key] = data[key];
      }
      if (sanitized.scheduledPublishAt) sanitized.status = 'scheduled';
      sanitized.tenantId = req.tenant;
      const entry = await Model.create(sanitized);
      await saveVersion({
        tenantId: req.tenant, contentTypeSlug: ct.slug, contentTypeName: ct.name,
        entryId: entry._id, data: entry.toObject(), status: entry.status,
        userId: req.user?.id, description: 'Initial version'
      });
      return { ...entry.toObject(), data: entry.toObject() };
    },
    updateEntry: async (_, { contentTypeSlug, id, data }, { req }) => {
      await requirePermission(req, 'contentEntries');
      const ct = await ContentType.findOne({ tenantId: req.tenant, slug: contentTypeSlug });
      if (!ct) throw new Error('Content type not found');
      const Model = getModelForCt(ct);
      const fieldNames = ct.fields.map(f => f.name);
      const allowed = ['status', 'locale', 'translations', 'scheduledPublishAt', 'scheduledUnpublishAt', 'publishedAt', 'tags', 'changeDescription', ...fieldNames];
      const sanitized = {};
      for (const key of allowed) {
        if (data[key] !== undefined) sanitized[key] = data[key];
      }
      if (sanitized.scheduledPublishAt && !sanitized.scheduledUnpublishAt) sanitized.status = 'scheduled';
      const entry = await Model.findOneAndUpdate({ _id: id, tenantId: req.tenant }, sanitized, { new: true });
      if (!entry) throw new Error('Entry not found');
      await saveVersion({
        tenantId: req.tenant, contentTypeSlug: ct.slug, contentTypeName: ct.name,
        entryId: entry._id, data: entry.toObject(), status: entry.status,
        userId: req.user?.id, description: data.changeDescription || 'Updated via GraphQL'
      });
      return { ...entry.toObject(), data: entry.toObject() };
    },
    deleteEntry: async (_, { contentTypeSlug, id }, { req }) => {
      await requirePermission(req, 'contentEntries');
      const ct = await ContentType.findOne({ tenantId: req.tenant, slug: contentTypeSlug });
      if (!ct) throw new Error('Content type not found');
      const Model = getModelForCt(ct);
      await Model.findOneAndDelete({ _id: id, tenantId: req.tenant });
      return { message: 'Entry deleted' };
    },
    publishEntry: async (_, { contentTypeSlug, id }, { req }) => {
      await requirePermission(req, 'contentEntries');
      const ct = await ContentType.findOne({ tenantId: req.tenant, slug: contentTypeSlug });
      if (!ct) throw new Error('Content type not found');
      const Model = getModelForCt(ct);
      const entry = await Model.findOneAndUpdate(
        { _id: id, tenantId: req.tenant },
        { status: 'published', publishedAt: new Date(), $unset: { scheduledPublishAt: 1 } },
        { new: true }
      );
      if (!entry) throw new Error('Entry not found');
      await saveVersion({
        tenantId: req.tenant, contentTypeSlug: ct.slug, contentTypeName: ct.name,
        entryId: entry._id, data: entry.toObject(), status: 'published',
        userId: req.user?.id, description: 'Published'
      });
      return { ...entry.toObject(), data: entry.toObject() };
    },
    unpublishEntry: async (_, { contentTypeSlug, id }, { req }) => {
      await requirePermission(req, 'contentEntries');
      const ct = await ContentType.findOne({ tenantId: req.tenant, slug: contentTypeSlug });
      if (!ct) throw new Error('Content type not found');
      const Model = getModelForCt(ct);
      const entry = await Model.findOneAndUpdate(
        { _id: id, tenantId: req.tenant },
        { status: 'draft', publishedAt: null, $unset: { scheduledUnpublishAt: 1 } },
        { new: true }
      );
      if (!entry) throw new Error('Entry not found');
      await saveVersion({
        tenantId: req.tenant, contentTypeSlug: ct.slug, contentTypeName: ct.name,
        entryId: entry._id, data: entry.toObject(), status: 'draft',
        userId: req.user?.id, description: 'Unpublished'
      });
      return { ...entry.toObject(), data: entry.toObject() };
    },
    createApiKey: async (_, { name }, { req }) => {
      await requirePermission(req, 'apiKeys');
      const rawKey = `flow_${crypto.randomBytes(24).toString('hex')}`;
      const hashed = await bcrypt.hash(rawKey, 10);
      const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
      const preview = rawKey.substring(0, 10) + '...' + rawKey.substring(rawKey.length - 4);
      const key = await ApiKey.create({
        tenantId: req.tenant,
        name,
        key: hashed,
        keyHash,
        keyPreview: preview,
        isActive: true,
        scopes: [{ contentType: '*', permissions: ['read'] }],
      });
      return { _id: key._id, name: key.name, key: rawKey, isActive: true, createdAt: key.createdAt, updatedAt: key.updatedAt };
    },
    revokeApiKey: async (_, { id }, { req }) => {
      await requirePermission(req, 'apiKeys');
      await ApiKey.findOneAndUpdate({ _id: id, tenantId: req.tenant }, { isActive: false });
      return { message: 'API key revoked' };
    },
    createContentType: async (_, { name, slug, fields, locales }, { req }) => {
      await requirePermission(req, 'contentTypes');
      const FIELD_ALLOWED = ['name', 'type', 'required', 'localizable', 'refContentType', 'pattern', 'patternMessage', 'minLength', 'maxLength', 'min', 'max', 'defaultValue'];
      const ct = await ContentType.create({
        tenantId: req.tenant, name, slug,
        fields: (fields || []).map(f => {
          const sanitized = {};
          for (const key of FIELD_ALLOWED) {
            if (f[key] !== undefined) sanitized[key] = f[key];
          }
          sanitized.required = f.required || false;
          sanitized.localizable = f.localizable || false;
          return sanitized;
        }),
        locales: locales || ['en']
      });
      return ct.toObject();
    },
    deleteContentType: async (_, { id }, { req }) => {
      await requirePermission(req, 'contentTypes');
      const ct = await ContentType.findOneAndDelete({ _id: id, tenantId: req.tenant });
      if (!ct) throw new Error('Content type not found');
      const Model = getModelForCt(ct);
      await Model.deleteMany({ tenantId: req.tenant });
      await ContentVersion.deleteMany({ tenantId: req.tenant, contentTypeSlug: ct.slug });
      await EntryComment.deleteMany({ tenantId: req.tenant, contentTypeSlug: ct.slug });
      await EntryLock.deleteMany({ tenantId: req.tenant, contentTypeSlug: ct.slug });
      clearModelCache(ct.name);
      return { message: 'Content type deleted' };
    },
  },
};
