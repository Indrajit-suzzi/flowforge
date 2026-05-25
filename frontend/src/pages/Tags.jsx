import { useState, useEffect } from 'react';
import { Plus, Trash2, Tag as TagIcon } from 'lucide-react';
import api from '../utils/api';
import PageShell from '../components/PageShell';
import LoadingButton from '../components/LoadingButton';

const TAG_COLORS = ['#8b5cf6', '#ff7e5f', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#14b8a6', '#f97316'];

export default function Tags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#8b5cf6');
  const [creating, setCreating] = useState(false);

  const loadTags = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/v1/tags');
      setTags(data || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/api/v1/tags');
        setTags(data || []);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const slug = newName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      await api.post('/api/v1/tags', { name: newName.trim(), slug, color: newColor });
      setNewName('');
      await loadTags();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || `Request failed (${err.response?.status || 'network error'})`;
      alert(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this tag? Entries using it will keep the tag name but it will no longer be managed.')) return;
    try {
      await api.delete(`/api/v1/tags/${id}`);
      await loadTags();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || `Request failed (${err.response?.status || 'network error'})`;
      alert(msg);
    }
  };

  return (
    <PageShell
      title="Tags"
      subtitle="Manage entry tags across all content types"
      icon={<TagIcon style={{ width: '22px', height: '22px' }} />}
      maxWidth="800px"
    >
      <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)", marginBottom: '20px' }}>Create Tag</h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Tag name..."
            className="input-field"
            style={{ flex: 1, minWidth: '160px' }}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          <div style={{ display: 'flex', gap: '4px' }}>
            {TAG_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                style={{
                  width: '24px', height: '24px', borderRadius: '6px', background: c, border: newColor === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer', padding: 0
                }}
              />
            ))}
          </div>
          <LoadingButton loading={creating} onClick={handleCreate} className="btn-primary" style={{ border: 'none', padding: '9px 18px', fontSize: '13px' }}>
            <Plus style={{ width: '14px', height: '14px' }} /> Add Tag
          </LoadingButton>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)", marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TagIcon style={{ width: '16px', height: '16px', color: '#8b5cf6' }} /> All Tags ({tags.length})
        </h3>
        {loading ? (
          <p style={{ color: '#64748b', fontSize: '13px' }}>Loading tags...</p>
        ) : tags.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '24px' }}>No tags created yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {tags.map(tag => (
              <div key={tag._id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: tag.color || '#8b5cf6' }} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>{tag.name}</span>
                  <code style={{ fontSize: '11px', color: '#475569' }}>{tag.slug}</code>
                </div>
                <button onClick={() => handleDelete(tag._id)} className="btn-ghost" style={{ padding: '6px', color: '#64748b' }}>
                  <Trash2 style={{ width: '13px', height: '13px' }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
