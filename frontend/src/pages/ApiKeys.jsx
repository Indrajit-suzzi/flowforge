import { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Check, Key, BarChart3, X, Loader } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';
import PageShell from '../components/PageShell';
import { SkeletonTable } from '../components/Skeleton';

const allPerms = ['read', 'write', 'delete'];

export default function ApiKeys() {
  const toast = useToast();
  const [apiKeys, setApiKeys] = useState([]);
  const [contentTypes, setContentTypes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', scopes: [], maxRequests: 100, windowMs: 60000 });
  const [newKey, setNewKey] = useState(null);
  const [copied, setCopied] = useState(false);
  const [usageData, setUsageData] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/api/v1/api-keys'),
      api.get('/api/v1/content-types'),
    ]).then(([keys, cts]) => {
      setApiKeys(keys.data || []);
      setContentTypes(cts.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggleScope = (slug, perm) => {
    const existing = form.scopes.find(s => s.contentType === slug);
    let newScopes;
    if (existing) {
      if (existing.permissions.includes(perm)) {
        const filtered = existing.permissions.filter(p => p !== perm);
        if (filtered.length === 0) {
          newScopes = form.scopes.filter(s => s.contentType !== slug);
        } else {
          newScopes = form.scopes.map(s => s.contentType === slug ? { ...s, permissions: filtered } : s);
        }
      } else {
        newScopes = form.scopes.map(s => s.contentType === slug ? { ...s, permissions: [...s.permissions, perm] } : s);
      }
    } else {
      newScopes = [...form.scopes, { contentType: slug, permissions: [perm] }];
    }
    setForm({ ...form, scopes: newScopes });
  };

  const hasScope = (slug, perm) => {
    const s = form.scopes.find(x => x.contentType === slug);
    return s?.permissions.includes(perm) || false;
  };

  const getScopeSummary = (scopes) => {
    if (scopes.length === 0) return 'No access';
    const wild = scopes.find(s => s.contentType === '*');
    if (wild) return `All content types (${wild.permissions.join(', ')})`;
    return `${scopes.length} content type${scopes.length > 1 ? 's' : ''}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const scopes = form.scopes.length === 0
        ? [{ contentType: '*', permissions: ['read', 'write', 'delete'] }]
        : form.scopes;
      const res = await api.post('/api/v1/api-keys', { name: form.name, scopes, rateLimit: { maxRequests: form.maxRequests, windowMs: form.windowMs } });
      setNewKey(res.data);
      setForm({ name: '', scopes: [], maxRequests: 100, windowMs: 60000 });
      setShowForm(false);
      const r = await api.get('/api/v1/api-keys');
      setApiKeys(r.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create API key');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Revoke this key?')) return;
    try {
      await api.delete(`/api/v1/api-keys/${id}`);
      setApiKeys(apiKeys.filter(k => k._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to revoke API key');
    }
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

            <div style={{ marginBottom: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                Content Type Access <span style={{ color: '#475569', fontWeight: 400 }}>(leave empty for full access)</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflow: 'auto' }}>
                {contentTypes.map(ct => (
                  <div key={ct._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 10px', borderRadius: '8px', background: 'rgba(8,5,17,0.4)', fontSize: '13px' }}>
                    <span style={{ color: '#e2e8f0', flex: 1, minWidth: 0 }}>{ct.name}</span>
                    {allPerms.map(p => (
                      <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b', cursor: 'pointer' }}>
                        <input type="checkbox" checked={hasScope(ct.slug, p)} onChange={() => toggleScope(ct.slug, p)} style={{ accentColor: '#8b5cf6' }} />
                        {p}
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Rate Limit</label>
              <div className="grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#475569', marginBottom: '4px' }}>Max Requests</label>
                  <input type="number" min="1" max="100000" value={form.maxRequests} onChange={e => setForm({ ...form, maxRequests: Number(e.target.value) })} className="input-field" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#475569', marginBottom: '4px' }}>Window (ms)</label>
                  <select value={form.windowMs} onChange={e => setForm({ ...form, windowMs: Number(e.target.value) })} className="select-field">
                    <option value={60000}>1 minute</option>
                    <option value={300000}>5 minutes</option>
                    <option value={600000}>10 minutes</option>
                    <option value={3600000}>1 hour</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? <Loader className="spin" style={{ width: '14px', height: '14px' }} /> : 'Create'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <SkeletonTable rows={4} />
      ) : apiKeys.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
          <p className="empty-state-text">No API keys yet</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">Create API Key</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {apiKeys.map(k => (
            <div key={k._id} className="glass-card-sm" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                    <Key style={{ width: '14px', height: '14px', color: '#8b5cf6' }} />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>{k.name}</span>
                  <span className={`badge ${k.isActive ? 'badge-active' : 'badge-inactive'}`}>{k.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <p style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace', marginTop: '6px' }}>{k.keyPreview}</p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: '#818cf8', fontWeight: 600 }}>{getScopeSummary(k.scopes)}</span>
                  {k.rateUsage && (
                    <>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>
                        Rate: {k.rateUsage.used}/{k.rateUsage.limit}
                      </span>
                      <div style={{ width: '80px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(100, (k.rateUsage.used / k.rateUsage.limit) * 100)}%`,
                          height: '100%',
                          background: k.rateUsage.remaining > 20 ? '#34d399' : k.rateUsage.remaining > 5 ? '#f59e0b' : '#fca5a5',
                          borderRadius: '2px',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </>
                  )}
                  <span style={{ fontSize: '10px', color: '#475569' }}>
                    Limit: {k.rateLimit?.maxRequests || 100}/{((k.rateLimit?.windowMs || 60000) / 1000)}s
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={async () => { setUsageData(null); try { const r = await api.get(`/api/v1/api-keys/${k._id}/usage?days=7`); setUsageData(r.data); } catch (err) { toast.error(err.response?.data?.message || err.message || 'Failed to load usage'); } }} className="btn-ghost" style={{ padding: '8px', color: '#8b5cf6' }}>
                  <BarChart3 style={{ width: '14px', height: '14px' }} />
                </button>
                <button onClick={() => handleDelete(k._id)} className="btn-ghost" style={{ padding: '8px', color: '#fca5a5' }}>
                  <Trash2 style={{ width: '14px', height: '14px' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {usageData && (
        <div className="modal-backdrop" onClick={() => setUsageData(null)}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '90%', padding: '28px', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>
                API Key Usage (7 days)
              </h3>
              <button onClick={() => setUsageData(null)} className="btn-ghost" style={{ padding: '6px' }}>
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
            <p style={{ fontSize: '24px', fontWeight: '800', color: '#8b5cf6', marginBottom: '20px', fontFamily: "var(--font-heading)" }}>
              {usageData.total} requests
            </p>
            {usageData.byDay && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>By Day</h4>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'end', height: '60px' }}>
                  {usageData.byDay.map(d => {
                    const max = Math.max(...usageData.byDay.map(x => x.count), 1);
                    return (
                      <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <div style={{ width: '100%', height: `${(d.count / max) * 50}px`, background: '#8b5cf6', borderRadius: '4px 4px 0 0', minHeight: '4px' }} />
                        <span style={{ fontSize: '8px', color: '#475569' }}>{d.date.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {usageData.byEndpoint && (
              <div>
                <h4 style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>By Endpoint</h4>
                {usageData.byEndpoint.slice(0, 10).map(ep => (
                  <div key={ep.endpoint} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ color: '#e2e8f0', fontFamily: 'monospace', fontSize: '11px' }}>{ep.endpoint}</span>
                    <span style={{ color: '#64748b' }}>{ep.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}
