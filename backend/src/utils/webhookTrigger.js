import Webhook from '../models/webhook.js';
import crypto from 'crypto';

export const triggerWebhooks = async ({ tenantId, event, contentType, data }) => {
    try {
        const webhooks = await Webhook.find({
            tenantId,
            isActive: true,
            events: event,
            $or: [{ contentType: null }, { contentType: '' }, { contentType }]
        });

        for (const webhook of webhooks) {
            try {
                const payload = JSON.stringify({ event, contentType, data, timestamp: new Date().toISOString() });
                const signature = crypto.createHmac('sha256', webhook.secret).update(payload).digest('hex');

                const response = await fetch(webhook.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-FlowForge-Signature': `sha256=${signature}`,
                        'X-FlowForge-Event': event
                    },
                    body: payload,
                    signal: AbortSignal.timeout(10000)
                });

                await Webhook.findByIdAndUpdate(webhook._id, {
                    lastTriggered: new Date(),
                    lastStatus: response.status
                });
            } catch (err) {
                console.error(`Webhook ${webhook._id} failed:`, err.message);
                await Webhook.findByIdAndUpdate(webhook._id, {
                    lastTriggered: new Date(),
                    lastStatus: 0
                });
            }
        }
    } catch (err) {
        console.error('Trigger webhooks error:', err.message);
    }
};