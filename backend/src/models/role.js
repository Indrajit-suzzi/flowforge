import mongoose from 'mongoose';

const featurePermissions = {
  contentTypes: { type: Boolean, default: true },
  contentEntries: { type: Boolean, default: true },
  apiKeys: { type: Boolean, default: true },
  analytics: { type: Boolean, default: false },
  auditLogs: { type: Boolean, default: false },
  webhooks: { type: Boolean, default: false },
  mediaLibrary: { type: Boolean, default: true },
  userManagement: { type: Boolean, default: false },
  systemSettings: { type: Boolean, default: false },
  roles: { type: Boolean, default: false },
  branding: { type: Boolean, default: false }
};

const roleSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  description: { type: String, default: '' },
  isSystem: { type: Boolean, default: false },
  permissions: { type: featurePermissions, default: () => ({}) }
}, { timestamps: true });

roleSchema.index({ tenantId: 1, slug: 1 }, { unique: true });

const Role = mongoose.models.Role || mongoose.model('Role', roleSchema);

export default Role;
