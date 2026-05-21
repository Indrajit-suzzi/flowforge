import { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Check, Key } from 'lucide-react';
import api from '../utils/api';
import PageShell from '../components/PageShell';

export default function ApiKeys() {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', scopes: [] });
  const [newKey, setNewKey] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { 
    api.get('/api/v1/api-keys').then(r => { setApiKeys(r.data || []); setLoading(false); }).catch(() => setLoading(false)); 
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await api.post('/api/v1/api-keys', { ...form, scopes: [{ contentType: '*', permissions: ['read', 'write', 'delete'] }] });
    setNewKey(res.data);
    setForm({ name: '', scopes: [] });
    setShowForm(false);
    const r = await api.get('/api/v1/api-keys');
    setApiKeys(r.data || []);
  };

  const handleDelete = async (id) => {
    if (!confirm('Revoke this key?')) return;
    await api.delete(`/api/v1/api-keys/${id}`);
    setApiKeys(apiKeys.filter(k => k._id !== id));
  };

  return (
    <PageShell
      title="API Keys"
      subtitle="Manage access keys for external applications"
      icon={<Key style={{ width: '22px', height: '22px' }} />}
      iconColor="#8b5cf6"
      actions={
        <button onClick={() => setShowForm(true)} className="btn-primary" style={{ padding: '9px 18px', fontSize: '13px' }}>
          <Plus style={{ width: '14px', height: '14px' }} /> New API Key
        </button>
      }
    >
      {newKey && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Check style={{ width: '20px', height: '20px', color: '#34d399' }} />
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#34d399', fontFamily: "var(--font-heading)" }}>API Key Created</span>
          </div>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>Copy this key now — it will only be shown once.</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <code style={{ flex: 1, padding: '12px', background: 'rgba(8,5,17,0.6)', borderRadius: '10px', fontSize: '13px', fontFamily: 'monospace', color: '#34d399', wordBreak: 'break-all', border: '1px solid rgba(255,255,255,0.06)' }}>{newKey.key}</code>
            <button onClick={() => { navigator.clipboard.writeText(newKey.key); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="btn-ghost" style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              {copied ? <Check style={{ width: '16px', height: '16px', color: '#34d399' }} /> : <Copy style={{ width: '16px', height: '16px' }} />}
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)", marginBottom: '20px' }}>Create API Key</h3>
          <form onSubmit={handleSubmit}>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Key name (e.g., Production App)" className="input-field" style={{ marginBottom: '16px' }} required />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn-primary">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {apiKeys.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
          <p className="empty-state-text">No API keys yet</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">Create API Key</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {apiKeys.map(k => (
            <div key={k._id} className="glass-card-sm" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                    <Key style={{ width: '14px', height: '14px', color: '#8b5cf6' }} />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>{k.name}</span>
                  <span className={`badge ${k.isActive ? 'badge-active' : 'badge-inactive'}`}>{k.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <p style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace', marginTop: '6px' }}>{k.keyPreview}</p>
              </div>
              <button onClick={() => handleDelete(k._id)} className="btn-ghost" style={{ padding: '8px', color: '#fca5a5' }}>
                <Trash2 style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
