import { useState, useEffect } from 'react';
import { Plus, Trash2, Webhook as WebhookIcon, Check } from 'lucide-react';
import api from '../utils/api';
import LoadingButton from '../components/LoadingButton';
import PageShell from '../components/PageShell';

export default function Webhooks() {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', url: '', events: [], contentType: '' });
  const [successCopied, setSuccessCopied] = useState(false);

  useEffect(() => { 
    setLoading(true);
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

  const allEvents = ['content.create', 'content.update', 'content.delete', 'content.publish', 'content.unpublish'];

  return (
    <PageShell
      title="Webhooks"
      subtitle="Trigger external URLs on content changes"
      icon={<WebhookIcon style={{ width: '22px', height: '22px' }} />}
      iconColor="#f59e0b"
      actions={
        <button onClick={() => setShowForm(true)} className="btn-primary" style={{ padding: '9px 18px', fontSize: '13px' }}>
          <Plus style={{ width: '14px', height: '14px' }} /> New Webhook
        </button>
      }
    >
      {showForm && (
        <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)", marginBottom: '20px' }}>Create Webhook</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid-2" style={{ marginBottom: '16px' }}>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" className="input-field" required />
              <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://example.com/webhook" className="input-field" required />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Events</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {allEvents.map(event => (
                  <button key={event} type="button" onClick={() => toggleEvent(event)} style={{
                    padding: '6px 14px', fontSize: '11px',
                    background: form.events.includes(event) ? 'rgba(255,126,95,0.12)' : 'rgba(8,5,17,0.6)',
                    border: `1px solid ${form.events.includes(event) ? 'rgba(255,126,95,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '8px',
                    color: form.events.includes(event) ? '#ff7e5f' : '#64748b',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}>
                    {event}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <LoadingButton type="submit" loading={saving} className="btn-primary" style={{ border: 'none' }}>Create</LoadingButton>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {webhooks.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
          <p className="empty-state-text">No webhooks yet</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">Create Webhook</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {webhooks.map(w => (
            <div key={w._id} className="glass-card-sm" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                      <WebhookIcon style={{ width: '14px', height: '14px', color: '#f59e0b' }} />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>{w.name}</span>
                    <span className={`badge ${w.isActive ? 'badge-active' : 'badge-inactive'}`}>{w.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace', marginTop: '6px' }}>{w.url}</p>
                </div>
                <button onClick={() => handleDelete(w._id)} className="btn-ghost" style={{ padding: '8px', color: '#fca5a5' }}>
                  <Trash2 style={{ width: '14px', height: '14px' }} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {w.events.map(e => (
                  <span key={e} className="badge badge-draft" style={{ border: '1px solid rgba(100,116,139,0.2)' }}>{e}</span>
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
    </PageShell>
  );
}
