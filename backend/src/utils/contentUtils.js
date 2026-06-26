import ContentVersion from '../models/contentVersion.js';

export const typeMap = { String: String, Number: Number, Date: Date, Boolean: Boolean, RichText: String, Reference: String };

export const saveVersion = async ({ tenantId, contentTypeSlug, contentTypeName, entryId, data, status, userId, description }) => {
  const lastVersion = await ContentVersion.findOne({ tenantId, entryId }).sort({ version: -1 });
  const version = (lastVersion?.version || 0) + 1;
  await ContentVersion.create({
    tenantId, contentTypeSlug, contentTypeName, entryId,
    version, data, status: status || data.status || 'draft',
    createdBy: userId || 'system', changeDescription: description || ''
  });
};
