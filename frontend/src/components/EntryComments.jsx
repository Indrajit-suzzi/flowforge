import { useState, useEffect } from 'react';
import { X, Send, Trash2, MessageSquare, Reply } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';
import { useCurrentUser } from '../hooks/useCurrentUser';

export default function EntryComments({ slug, entryId, entryName, onClose }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBody, setNewBody] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const currentUser = useCurrentUser();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/api/v1/comments/${slug}/${entryId}`);
        setComments(data);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, [slug, entryId]);

  const handleSubmit = async () => {
    if (!newBody.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/api/v1/comments/${slug}/${entryId}`, {
        body: newBody.trim(),
        parentCommentId: replyTo?._id || null,
      });
      setNewBody('');
      setReplyTo(null);
      const { data: updated } = await api.get(`/api/v1/comments/${slug}/${entryId}`);
      setComments(updated);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await api.delete(`/api/v1/comments/${slug}/${entryId}/${commentId}`);
      const { data: updated } = await api.get(`/api/v1/comments/${slug}/${entryId}`);
      setComments(updated);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  const topLevel = comments.filter(c => !c.parentCommentId);
  const replies = (parentId) => comments.filter(c => c.parentCommentId === parentId);

  const formatTime = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="glass-card" style={{ maxWidth: '600px', width: '90%', padding: '28px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare style={{ width: '18px', height: '18px', color: '#ff7e5f' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>
              Comments
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              on {entryName}
            </span>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px' }}>
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', marginBottom: '16px' }}>
          {loading ? (
            <p style={{ color: '#64748b', fontSize: '13px' }}>Loading comments...</p>
          ) : topLevel.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '32px' }}>
              No comments yet. Start the conversation.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {topLevel.map(comment => (
                <CommentCard
                  key={comment._id}
                  comment={comment}
                  replies={replies(comment._id)}
                  replyTo={replyTo}
                  setReplyTo={setReplyTo}
                  userId={currentUser.userId}
                  onDelete={handleDelete}
                  formatTime={formatTime}
                  slug={slug}
                  entryId={entryId}
                />
              ))}
            </div>
          )}
        </div>

        {replyTo && (
          <div style={{ padding: '8px 12px', marginBottom: '8px', borderRadius: '8px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#c4b5fd' }}>
            <Reply style={{ width: '12px', height: '12px', flexShrink: 0 }} />
            Replying to <strong>{replyTo.userName}</strong>
            <button onClick={() => setReplyTo(null)} className="btn-ghost" style={{ padding: '2px', marginLeft: 'auto', color: '#fca5a5' }}>
              <X style={{ width: '12px', height: '12px' }} />
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <textarea
            value={newBody}
            onChange={e => setNewBody(e.target.value)}
            placeholder="Write a comment..."
            rows="2"
            style={{
              flex: 1, padding: '10px 14px', fontSize: '13px', fontFamily: 'inherit',
              background: 'rgba(8,5,17,0.6)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px', color: '#e2e8f0', outline: 'none', resize: 'none'
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!newBody.trim() || submitting}
            className="btn-primary"
            style={{ padding: '10px 16px', border: 'none', opacity: !newBody.trim() || submitting ? 0.5 : 1 }}
          >
            <Send style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CommentCard({ comment, replies, replyTo, setReplyTo, userId, onDelete, formatTime }) {
  const [showReplies, setShowReplies] = useState(true);
  return (
    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff7e5f, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: '#fff' }}>
            {comment.userName.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#e2e8f0' }}>{comment.userName}</span>
          <span style={{ fontSize: '11px', color: '#475569' }}>{formatTime(comment.createdAt)}</span>
        </div>
        {comment.userId === userId && (
          <button onClick={() => onDelete(comment._id)} className="btn-ghost" style={{ padding: '3px', color: '#64748b' }}>
            <Trash2 style={{ width: '11px', height: '11px' }} />
          </button>
        )}
      </div>
      <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5', margin: '0 0 8px 30px', whiteSpace: 'pre-wrap' }}>{comment.body}</p>
      <div style={{ marginLeft: '30px' }}>
        <button onClick={() => setReplyTo(replyTo?._id === comment._id ? null : comment)} className="btn-ghost" style={{ padding: '2px 6px', fontSize: '11px', color: '#64748b' }}>
          <Reply style={{ width: '10px', height: '10px' }} /> Reply
        </button>
      </div>
      {replies.length > 0 && (
        <div style={{ marginLeft: '30px', marginTop: '8px' }}>
          <button onClick={() => setShowReplies(!showReplies)} className="btn-ghost" style={{ padding: '2px 6px', fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
            {showReplies ? 'Hide' : 'Show'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          </button>
          {showReplies && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '2px solid rgba(255,255,255,0.06)', paddingLeft: '12px' }}>
              {replies.map(reply => (
                <div key={reply._id} style={{ padding: '8px', borderRadius: '6px', background: 'rgba(255,255,255,0.01)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#c4b5fd' }}>{reply.userName}</span>
                      <span style={{ fontSize: '10px', color: '#475569' }}>{formatTime(reply.createdAt)}</span>
                    </div>
                    {reply.userId === userId && (
                      <button onClick={() => onDelete(reply._id)} className="btn-ghost" style={{ padding: '2px', color: '#64748b' }}>
                        <Trash2 style={{ width: '10px', height: '10px' }} />
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0, whiteSpace: 'pre-wrap' }}>{reply.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
