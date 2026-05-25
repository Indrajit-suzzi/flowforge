import express from 'express';
import EntryLock from '../models/entryLock.js';

const router = express.Router();

const LOCK_DURATION_MS = 15 * 60 * 1000;

// GET /api/v1/locks/:slug/:id - Check lock status
router.get('/:slug/:id', async (req, res) => {
  try {
    const lock = await EntryLock.findOne({ entryId: req.params.id, tenantId: req.tenant });
    if (!lock || lock.expiresAt < new Date()) {
      if (lock) await EntryLock.deleteOne({ _id: lock._id });
      return res.json({ locked: false });
    }
    res.json({ locked: true, userId: lock.userId, userName: lock.userName, lockedAt: lock.lockedAt, expiresAt: lock.expiresAt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/v1/locks/:slug/:id/acquire - Acquire a lock
router.post('/:slug/:id/acquire', async (req, res) => {
  try {
    const { userId, userName } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    // Clean expired locks
    await EntryLock.deleteMany({ expiresAt: { $lt: new Date() } });

    const existing = await EntryLock.findOne({ entryId: req.params.id, tenantId: req.tenant });

    if (existing) {
      if (existing.userId === userId) {
        // Same user — extend the lock
        existing.expiresAt = new Date(Date.now() + LOCK_DURATION_MS);
        existing.lockedAt = new Date();
        await existing.save();
        return res.json({ acquired: true, userName: existing.userName, expiresAt: existing.expiresAt });
      }
      return res.status(409).json({
        message: 'Entry is locked by another user',
        locked: true,
        userId: existing.userId,
        userName: existing.userName,
        lockedAt: existing.lockedAt,
        expiresAt: existing.expiresAt
      });
    }

    const lock = await EntryLock.create({
      entryId: req.params.id,
      contentTypeSlug: req.params.slug,
      tenantId: req.tenant,
      userId,
      userName: userName || 'Unknown',
      lockedAt: new Date(),
      expiresAt: new Date(Date.now() + LOCK_DURATION_MS)
    });
    res.status(201).json({ acquired: true, userName: lock.userName, expiresAt: lock.expiresAt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/v1/locks/:slug/:id/release — Release a lock
router.delete('/:slug/:id/release', async (req, res) => {
  try {
    await EntryLock.deleteOne({ entryId: req.params.id, tenantId: req.tenant, userId: req.body.userId || req.query.userId });
    res.json({ released: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/v1/locks/:slug/:id/heartbeat — Extend lock
router.post('/:slug/:id/heartbeat', async (req, res) => {
  try {
    const lock = await EntryLock.findOne({ entryId: req.params.id, tenantId: req.tenant, userId: req.body.userId });
    if (!lock) return res.status(404).json({ message: 'Lock not found' });
    lock.expiresAt = new Date(Date.now() + LOCK_DURATION_MS);
    lock.lockedAt = new Date();
    await lock.save();
    res.json({ extended: true, expiresAt: lock.expiresAt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
