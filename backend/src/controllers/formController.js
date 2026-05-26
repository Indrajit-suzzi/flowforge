import Form from '../models/form.js';
import FormSubmission from '../models/formSubmission.js';
import { logAudit } from '../utils/auditLogger.js';

export const create = async (req, res) => {
  try {
    const { name, slug, description, fields, submitButtonText, successMessage, notificationEmail } = req.body;
    const existing = await Form.findOne({ slug });
    if (existing) return res.status(409).json({ error: `A form with slug "${slug}" already exists` });
    const form = await Form.create({
      tenantId: req.tenant, name, slug, description,
      fields: (fields || []).map((f, i) => ({ ...f, order: i })),
      submitButtonText, successMessage, notificationEmail
    });
    await logAudit({ tenantId: req.tenant, userId: req.user?.id, action: 'create', entityType: 'form', entityId: form._id.toString(), entityName: name, ipAddress: req.ip, userAgent: req.headers['user-agent'] });
    res.status(201).json(form);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const forms = await Form.find({ tenantId: req.tenant }).sort({ createdAt: -1 });
    res.json(forms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOne = async (req, res) => {
  try {
    const form = await Form.findOne({ _id: req.params.id, tenantId: req.tenant });
    if (!form) return res.status(404).json({ message: 'Form not found' });
    res.json(form);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const { fields, slug, ...rest } = req.body;
    const updates = { ...rest };
    if (slug) {
      const existing = await Form.findOne({ slug, _id: { $ne: req.params.id } });
      if (existing) return res.status(409).json({ error: `A form with slug "${slug}" already exists` });
      updates.slug = slug;
    }
    if (fields) updates.fields = fields.map((f, i) => ({ ...f, order: i }));
    const form = await Form.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenant },
      { $set: updates },
      { new: true }
    );
    if (!form) return res.status(404).json({ message: 'Form not found' });
    res.json(form);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const form = await Form.findOneAndDelete({ _id: req.params.id, tenantId: req.tenant });
    if (!form) return res.status(404).json({ message: 'Form not found' });
    await FormSubmission.deleteMany({ formId: req.params.id, tenantId: req.tenant });
    await logAudit({ tenantId: req.tenant, userId: req.user?.id, action: 'delete', entityType: 'form', entityId: form._id.toString(), ipAddress: req.ip, userAgent: req.headers['user-agent'] });
    res.json({ message: 'Form deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const submit = async (req, res) => {
  try {
    const form = await Form.findOne({ slug: req.params.slug, isActive: true });
    if (!form) return res.status(404).json({ message: 'Form not found or inactive' });
    const data = {};
    for (const field of form.fields) {
      const val = req.body[field.name];
      if (field.required && !val) return res.status(400).json({ error: `Field "${field.label}" is required` });
      if (val) data[field.name] = String(val);
    }
    await FormSubmission.create({
      tenantId: form.tenantId, formId: form._id, formSlug: form.slug,
      data, ipAddress: req.ip, userAgent: req.headers['user-agent']
    });
    await Form.findByIdAndUpdate(form._id, { $inc: { submissionCount: 1 } });
    res.json({ status: 'success', message: form.successMessage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const submissions = await FormSubmission.find({ tenantId: req.tenant, formId: req.params.id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await FormSubmission.countDocuments({ tenantId: req.tenant, formId: req.params.id });
    res.json({ data: submissions, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
