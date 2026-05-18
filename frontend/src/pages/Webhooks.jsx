import { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Check, Webhook, Activity } from 'lucide-react';
import api from '../utils/api';
import LoadingScreen from '../components/LoadingScreen';
import LoadingButton from '../components/LoadingButton';

export default function Webhooks() {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', url: '', events: [], contentType: '' });
  const [copied, setCopied] = useState(false);

  useEffect(() => { 
    api.get('/api/v1/webhooks').then(r => { setWebhooks(r.data || []); setLoading(false); }).catch(() => setLoading(false)); 
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/v1/webhooks', form);
      setForm({ name: '', url: '', events: [], contentType: '' });
      setShowForm(false);
      const r = await api.get('/api/v1/webhooks');
      setWebhooks(r.data || []);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this webhook?')) return;
    await api.delete(`/api/v1/webhooks/${id}`);
    setWebhooks(webhooks.filter(w => w._id !== id));
  };

  const toggleEvent = (event) => {
    setForm({
      ...form,
      events: form.events.includes(event) ? form.events.filter(e => e !== event) : [...form.events, event]
    });
  };

  if (loading) return <LoadingScreen message="Loading webhooks" />;

  const allEvents = ['content.create', 'content.update', 'content.delete', 'content.publish', 'content.unpublish'];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9' }}>Webhooks</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Trigger external URLs on content changes</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: 'white', background: 'linear-gradient(90deg, #3b82f6, #6366f1)', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
          <Plus style={{ width: '14px', height: '14px' }} /> New Webhook
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px' }}>Create Webhook</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" style={{ padding: '10px 12px', background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px' }} required />
              <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://example.com/webhook" style={{ padding: '10px 12px', background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px' }} required />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Events</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {allEvents.map(event => (
                  <button key={event} type="button" onClick={() => toggleEvent(event)} style={{ padding: '6px 12px', fontSize: '11px', background: form.events.includes(event) ? '#1e3a5f' : '#0a0f1e', border: `1px solid ${form.events.includes(event) ? '#3b82f6' : '#1e293b'}`, borderRadius: '6px', color: form.events.includes(event) ? '#60a5fa' : '#64748b', cursor: 'pointer' }}>
                    {event}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <LoadingButton type="submit" loading={saving}>Create</LoadingButton>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #334155', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {webhooks.length === 0 ? (
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '60px', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8', marginBottom: '16px' }}>No webhooks yet</p>
          <button onClick={() => setShowForm(true)} style={{ padding: '10px 20px', background: 'linear-gradient(90deg, #3b82f6, #6366f1)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Create Webhook</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {webhooks.map(w => (
            <div key={w._id} style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Webhook style={{ width: '16px', height: '16px', color: '#64748b' }} />
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>{w.name}</span>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', background: w.isActive ? '#064e3b' : '#7f1d1d', color: w.isActive ? '#34d399' : '#fca5a5' }}>{w.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace', marginTop: '4px' }}>{w.url}</p>
                </div>
                <button onClick={() => handleDelete(w._id)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><Trash2 style={{ width: '14px', height: '14px' }} /></button>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {w.events.map(e => (
                  <span key={e} style={{ padding: '2px 8px', background: '#1e293b', borderRadius: '4px', fontSize: '10px', color: '#94a3b8' }}>{e}</span>
                ))}
              </div>
              {w.lastTriggered && (
                <p style={{ fontSize: '10px', color: '#475569', marginTop: '8px' }}>
                  Last triggered: {new Date(w.lastTriggered).toLocaleString()} (Status: {w.lastStatus || 'failed'})
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}