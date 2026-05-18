import { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Check } from 'lucide-react';
import api from '../utils/api';
import LoadingScreen from '../components/LoadingScreen';

export default function ApiKeys() {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) return <LoadingScreen message="Loading API keys" />;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9' }}>API Keys</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Manage access keys for external applications</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: 'white', background: 'linear-gradient(90deg, #3b82f6, #6366f1)', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
          <Plus style={{ width: '14px', height: '14px' }} /> New API Key
        </button>
      </div>

      {newKey && (
        <div style={{ background: '#064e3b', border: '1px solid #10b981', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Check style={{ width: '20px', height: '20px', color: '#34d399' }} />
            <span style={{ fontSize: '16px', fontWeight: '600', color: '#34d399' }}>API Key Created</span>
          </div>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>Copy this key now — it will only be shown once.</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <code style={{ flex: 1, padding: '12px', background: '#050810', borderRadius: '8px', fontSize: '13px', fontFamily: 'monospace', color: '#34d399', wordBreak: 'break-all' }}>{newKey.key}</code>
            <button onClick={() => { navigator.clipboard.writeText(newKey.key); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ padding: '12px', background: '#1e293b', border: 'none', borderRadius: '8px', color: copied ? '#34d399' : '#94a3b8', cursor: 'pointer' }}>
              {copied ? <Check style={{ width: '16px', height: '16px' }} /> : <Copy style={{ width: '16px', height: '16px' }} />}
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px' }}>Create API Key</h3>
          <form onSubmit={handleSubmit}>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Key name (e.g., Production App)" style={{ width: '100%', padding: '12px', background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', marginBottom: '16px' }} required />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" style={{ padding: '10px 20px', background: 'linear-gradient(90deg, #3b82f6, #6366f1)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Create</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #334155', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {apiKeys.length === 0 ? (
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '60px', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8', marginBottom: '16px' }}>No API keys yet</p>
          <button onClick={() => setShowForm(true)} style={{ padding: '10px 20px', background: 'linear-gradient(90deg, #3b82f6, #6366f1)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Create API Key</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {apiKeys.map(k => (
            <div key={k._id} style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>{k.name}</span>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', background: k.isActive ? '#064e3b' : '#7f1d1d', color: k.isActive ? '#34d399' : '#fca5a5' }}>{k.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <p style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace', marginTop: '4px' }}>{k.keyPreview}</p>
              </div>
              <button onClick={() => handleDelete(k._id)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><Trash2 style={{ width: '14px', height: '14px' }} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}