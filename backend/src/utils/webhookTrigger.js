import Webhook from '../models/webhook.js';
import WebhookLog from '../models/webhookLog.js';
import crypto from 'crypto';
import logger from './logger.js';

const isPrivateIP = (urlStr) => {
  try {
    const url = new URL(urlStr);
    const hostname = url.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0' || hostname === '[::1]') return true;
    if (hostname.startsWith('10.') || hostname.startsWith('192.168.')) return true;
    if (/^172\.(1[6-9]|2[0-9]|3[01])\./.test(hostname)) return true;
    if (hostname.endsWith('.local') || hostname.endsWith('.internal')) return true;
    return false;
  } catch {
    return true;
  }
};

const deliver = async ({ webhook, event, contentType, payload, attempt = 1, retryOf = null }) => {
  const start = Date.now();
  const signature = crypto.createHmac('sha256', webhook.secret).update(payload).digest('hex');
  let error = null;

  if (isPrivateIP(webhook.url)) {
    error = 'Blocked: webhook URL points to a private or internal address';
    logger.warn({ url: webhook.url, webhookId: webhook._id }, error);
    await WebhookLog.create({ tenantId: webhook.tenantId, webhookId: webhook._id, webhookName: webhook.name, webhookUrl: webhook.url, event, contentType, status: 'failed', error, payload: payload.substring(0, 5000), attempt, retryOf });
    return;
  }

  let status = 'failed';
  let responseCode = null;
  let responseBody = null;

  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-FlowForge-Signature': `sha256=${signature}`,
        'X-FlowForge-Event': event,
        'X-FlowForge-Attempt': String(attempt)
      },
      body: payload,
      signal: AbortSignal.timeout(10000)
    });

    status = 'success';
    responseCode = response.status;
    responseBody = (await response.text()).substring(0, 2000);

    await Webhook.findByIdAndUpdate(webhook._id, {
      lastTriggered: new Date(),
      lastStatus: response.status
    });
  } catch (err) {
    error = err.message?.substring(0, 500);
    await Webhook.findByIdAndUpdate(webhook._id, {
      lastTriggered: new Date(),
      lastStatus: 0
    });
  }

  try {
    await WebhookLog.create({
      tenantId: webhook.tenantId,
      webhookId: webhook._id,
      webhookName: webhook.name,
      webhookUrl: webhook.url,
      event,
      contentType,
      status,
      responseCode,
      responseBody,
      duration: Date.now() - start,
      error,
      payload: payload.substring(0, 5000),
      attempt,
      retryOf
    });
  } catch (logErr) {
    logger.error({ err: logErr }, 'Failed to save webhook log');
  }

  if (status === 'failed' && attempt < webhook.maxRetries) {
    const delay = webhook.retryDelayMs * Math.pow(2, attempt - 1);
    setTimeout(() => {
      deliver({ webhook, event, contentType, payload, attempt: attempt + 1, retryOf });
    }, delay);
  }
};

const evaluateConditions = (conditions, data) => {
  if (!conditions || !conditions.length) return true;
  const entry = data?.data || data || {};
  return conditions.every(c => {
    const val = String(entry[c.field] ?? '');
    switch (c.operator) {
      case 'equals': return val === c.value;
      case 'not_equals': return val !== c.value;
      case 'contains': return val.toLowerCase().includes((c.value || '').toLowerCase());
      case 'exists': return entry[c.field] !== undefined && entry[c.field] !== null && entry[c.field] !== '';
      case 'not_exists': return entry[c.field] === undefined || entry[c.field] === null || entry[c.field] === '';
      default: return true;
    }
  });
};

export const triggerWebhooks = async ({ tenantId, event, contentType, data }) => {
  try {
    const webhooks = await Webhook.find({
      tenantId,
      isActive: true,
      events: event,
      $or: [{ contentType: null }, { contentType: '' }, { contentType }]
    }).select('+secret');

    for (const webhook of webhooks) {
      if (!evaluateConditions(webhook.conditions, data)) continue;
      const payload = JSON.stringify({ event, contentType, data, timestamp: new Date().toISOString() });
      deliver({ webhook, event, contentType, payload });
    }
  } catch (err) {
    logger.error({ err }, 'Trigger webhooks error');
  }
};

const sendPayload = async ({ webhook, event, payload }) => {
  const start = Date.now();
  if (isPrivateIP(webhook.url)) {
    return { status: 'failed', error: 'Blocked: webhook URL points to a private or internal address', duration: Date.now() - start };
  }
  const signature = crypto.createHmac('sha256', webhook.secret).update(payload).digest('hex');
  let status = 'failed', responseCode = null, responseBody = null, error = null;
  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-FlowForge-Signature': `sha256=${signature}`,
        'X-FlowForge-Event': event,
        'X-FlowForge-Attempt': 'test'
      },
      body: payload,
      signal: AbortSignal.timeout(10000)
    });
    status = 'success';
    responseCode = response.status;
    responseBody = (await response.text()).substring(0, 2000);
  } catch (err) {
    error = err.message?.substring(0, 500);
  }
  return { status, responseCode, responseBody, error, duration: Date.now() - start };
};

export const testWebhook = async ({ webhook }) => {
  const payload = JSON.stringify({
    event: 'test',
    contentType: '*',
    data: { title: 'Test entry', body: 'This is a test payload from FlowForge.' },
    timestamp: new Date().toISOString()
  });
  return sendPayload({ webhook, event: 'test', contentType: '*', payload });
};

export const retryWebhook = async ({ tenantId, logId }) => {
  const log = await WebhookLog.findOne({ _id: logId, tenantId });
  if (!log) throw new Error('Log not found');
  if (log.status === 'success') throw new Error('Cannot retry a successful delivery');

  const webhook = await Webhook.findOne({ _id: log.webhookId, tenantId }).select('+secret');
  if (!webhook) throw new Error('Webhook not found');
  if (!webhook.isActive) throw new Error('Webhook is inactive');

  const payload = log.payload;
  if (!payload) throw new Error('No payload data to retry');

  deliver({
    webhook,
    event: log.event,
    contentType: log.contentType,
    payload,
    attempt: log.attempt + 1,
    retryOf: log._id
  });

  return { message: 'Retry initiated', webhookName: webhook.name, event: log.event };
};
