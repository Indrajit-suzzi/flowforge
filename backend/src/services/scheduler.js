import ContentType from '../models/contentType.js';
import getModel from '../models/genericModel.js';
import ContentVersion from '../models/contentVersion.js';
import { triggerWebhooks } from '../utils/webhookTrigger.js';
import logger from '../utils/logger.js';

const typeMap = { String: String, Number: Number, Date: Date, Boolean: Boolean, RichText: String, Reference: String };

const saveVersion = async ({ tenantId, contentTypeSlug, contentTypeName, entryId, data, status, description }) => {
  const lastVersion = await ContentVersion.findOne({ tenantId, entryId }).sort({ version: -1 });
  const version = (lastVersion?.version || 0) + 1;
  await ContentVersion.create({
    tenantId, contentTypeSlug, contentTypeName, entryId,
    version, data, status: status || data.status || 'draft',
    createdBy: 'scheduler', changeDescription: description || ''
  });
};

const processTenantContentType = async (ct) => {
  const Model = getModel(ct.name, Object.fromEntries(ct.fields.map(f => [f.name, typeMap[f.type] || String])));
  const now = new Date();

  const toPublish = await Model.find({
    tenantId: ct.tenantId,
    scheduledPublishAt: { $lte: now, $ne: null },
    status: { $ne: 'published' },
    $or: [
      { scheduledUnpublishAt: null },
      { scheduledUnpublishAt: { $gt: now } }
    ]
  });

  for (const entry of toPublish) {
    entry.status = 'published';
    entry.publishedAt = now;
    entry.scheduledPublishAt = undefined;
    await entry.save();

    await saveVersion({
      tenantId: ct.tenantId, contentTypeSlug: ct.slug, contentTypeName: ct.name,
      entryId: entry._id, data: entry.toObject(), status: 'published',
      description: 'Auto-published by scheduler'
    });

    try { await triggerWebhooks({ tenantId: ct.tenantId.toString(), event: 'content.publish', contentType: ct.slug, data: entry }); } catch { /* best-effort */ }
  }

  const toUnpublish = await Model.find({
    tenantId: ct.tenantId,
    scheduledUnpublishAt: { $lte: now, $ne: null },
    status: { $ne: 'draft' }
  });

  for (const entry of toUnpublish) {
    entry.status = 'draft';
    entry.publishedAt = null;
    entry.scheduledUnpublishAt = undefined;
    await entry.save();

    await saveVersion({
      tenantId: ct.tenantId, contentTypeSlug: ct.slug, contentTypeName: ct.name,
      entryId: entry._id, data: entry.toObject(), status: 'draft',
      description: 'Auto-unpublished by scheduler'
    });

    try { await triggerWebhooks({ tenantId: ct.tenantId.toString(), event: 'content.unpublish', contentType: ct.slug, data: entry }); } catch { /* best-effort */ }
  }

  return { published: toPublish.length, unpublished: toUnpublish.length };
};

export const runScheduler = async () => {
  try {
    const contentTypes = await ContentType.find({});
    let totalPublished = 0;
    let totalUnpublished = 0;

    for (const ct of contentTypes) {
      try {
        const result = await processTenantContentType(ct);
        totalPublished += result.published;
        totalUnpublished += result.unpublished;
      } catch (err) {
        logger.error({ err, contentType: ct.name, tenantId: ct.tenantId }, 'Scheduler error for content type');
      }
    }

    if (totalPublished > 0 || totalUnpublished > 0) {
      logger.info({ published: totalPublished, unpublished: totalUnpublished }, 'Scheduler completed');
    }
  } catch (err) {
    logger.error({ err }, 'Scheduler error');
  }
};

let intervalId = null;

export const startScheduler = () => {
  runScheduler();
  intervalId = setInterval(runScheduler, 60 * 1000);
  logger.info('Scheduler started (checking every 60s)');
};

export const stopScheduler = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    logger.info('Scheduler stopped');
  }
};
