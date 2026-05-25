import express from 'express';
import EntryComment from '../models/entryComment.js';

const router = express.Router();

// GET /api/v1/comments/:slug/:entryId — Get all comments for an entry
router.get('/:slug/:entryId', async (req, res) => {
  try {
    const comments = await EntryComment.find({ entryId: req.params.entryId, tenantId: req.tenant })
      .sort({ createdAt: -1 }).lean();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/v1/comments/:slug/:entryId — Add a comment
router.post('/:slug/:entryId', async (req, res) => {
  try {
    const { body, parentCommentId } = req.body;
    if (!body || !body.trim()) return res.status(400).json({ message: 'Comment body is required' });
    const comment = await EntryComment.create({
      entryId: req.params.entryId,
      contentTypeSlug: req.params.slug,
      tenantId: req.tenant,
      userId: req.user?.id || req.body.userId || 'unknown',
      userName: req.body.userName || req.user?.name || 'Unknown',
      body: body.trim(),
      parentCommentId: parentCommentId || null
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/v1/comments/:slug/:entryId/:commentId — Delete a comment (owner only)
router.delete('/:slug/:entryId/:commentId', async (req, res) => {
  try {
    const comment = await EntryComment.findOne({ _id: req.params.commentId, tenantId: req.tenant });
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.userId !== (req.user?.id || req.query.userId)) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    // Delete comment and its replies
    await EntryComment.deleteMany({ $or: [{ _id: comment._id }, { parentCommentId: comment._id }] });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
