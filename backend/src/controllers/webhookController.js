import crypto from 'crypto';
import Webhook from '../models/webhook.js';

export const create = async (req, res) => {
    try {
        const { name, url, events, contentType, secret, maxRetries, retryDelayMs, conditions } = req.body;
        const webhook = await Webhook.create({
            tenantId: req.tenant,
            name,
            url,
            events: events || ['content.create', 'content.update', 'content.delete'],
            contentType,
            secret: secret || crypto.randomBytes(32).toString('hex'),
            maxRetries: maxRetries ?? 3,
            retryDelayMs: retryDelayMs ?? 5000,
            conditions: conditions || []
        });
        res.status(201).json(webhook);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAll = async (req, res) => {
    try {
        const webhooks = await Webhook.find({ tenantId: req.tenant }).sort({ createdAt: -1 });
        res.json(webhooks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const update = async (req, res) => {
    try {
        const webhook = await Webhook.findOneAndUpdate(
            { _id: req.params.id, tenantId: req.tenant },
            req.body,
            { new: true }
        );
        res.json(webhook);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const remove = async (req, res) => {
    try {
        await Webhook.findOneAndDelete({ _id: req.params.id, tenantId: req.tenant });
        res.json({ message: "Webhook deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};