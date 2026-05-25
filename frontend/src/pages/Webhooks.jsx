import { useState, useEffect } from 'react';
import { Plus, Trash2, Webhook as WebhookIcon, Check, X, Clock, AlertCircle, List, RotateCw, Play, Shield } from 'lucide-react';
import api from '../utils/api';
import LoadingButton from '../components/LoadingButton';
import PageShell from '../components/PageShell';

function WebhookLogViewer({ webhookId, webhookName, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [retrying, setRetrying] = useState(null);

  const loadLogs = () => {
    api.get(`/api/v1/webhooks/${webhookId}/logs?limit=50`)
      .then(r => { setLogs(r.data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(loadLogs, [webhookId]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="glass-card" style={{ width: '90%', maxWidth: '800px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'fadeIn 0.2s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(245,158,11,0.2)' }}>
              <List style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>Delivery Logs</h2>
              <p style={{ fontSize: '12px', color: '#64748b' }}>{webhookName}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '8px' }}>
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
          {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '13px' }}>Loading logs...</div>}

          {!loading && logs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '13px' }}>No delivery logs yet.</div>
          )}

          {logs.map(log => {
            const isSuccess = log.status === 'success';
            const isSelected = selectedLog?._id === log._id;
            return (
              <div key={log._id} style={{
                marginBottom: '8px', borderRadius: '10px',
                border: isSelected ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.06)',
                background: isSelected ? 'rgba(245,158,11,0.06)' : 'rgba(8,5,17,0.3)', overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', cursor: 'pointer' }} onClick={() => setSelectedLog(isSelected ? null : log)}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                    background: isSuccess ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                    border: isSuccess ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(239,68,68,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {isSuccess ? <Check style={{ width: '12px', height: '12px', color: '#34d399' }} /> : <X style={{ width: '12px', height: '12px', color: '#fca5a5' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: isSuccess ? '#34d399' : '#fca5a5' }}>
                        {isSuccess ? 'Success' : 'Failed'}
                      </span>
                      {log.responseCode && <span style={{ fontSize: '11px', color: '#64748b' }}>HTTP {log.responseCode}</span>}
                      <span style={{ fontSize: '11px', color: '#475569' }}>Attempt {log.attempt || 1}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock style={{ width: '10px', height: '10px' }} />
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', gap: '12px' }}>
                      <span>{log.event}</span>
                      <span>{log.duration}ms</span>
                      {log.contentType && <span>/{log.contentType}</span>}
                    </div>
                  </div>
                  {!isSuccess && (
                    <button
                      onClick={e => { e.stopPropagation(); (async () => { setRetrying(log._id); try { await api.post(`/api/v1/webhooks/${webhookId}/logs/${log._id}/retry`); loadLogs(); } catch (err) { alert(err.response?.data?.error || 'Retry failed'); } finally { setRetrying(null); } })(); }}
                      className="btn-ghost"
                      style={{ padding: '6px', flexShrink: 0 }}
                      title="Retry delivery"
                      disabled={retrying === log._id}
                    >
                      <RotateCw style={{ width: '14px', height: '14px', color: retrying === log._id ? '#f59e0b' : '#94a3b8' }} />
                    </button>
                  )}
                </div>

                {isSelected && (
                  <div style={{ padding: '0 14px 14px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ marginTop: '12px', fontSize: '11px', color: '#64748b', display: 'flex', gap: '16px' }}>
                      <span>Attempt {log.attempt || 1}</span>
                      <span>{log.duration}ms</span>
                      {log.retryOf && <span>Retry of previous attempt</span>}
                    </div>
                    {log.error && (
                      <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.15)', color: '#fca5a5', fontSize: '12px' }}>
                        <AlertCircle style={{ width: '12px', height: '12px', display: 'inline', marginRight: '6px' }} />
                        {log.error}
                      </div>
                    )}
                    {log.responseBody && (
                      <div style={{ marginTop: '12px' }}>
                        <p style={{ fontSize: '10px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Response Body</p>
                        <pre style={{ margin: 0, padding: '10px', background: 'rgba(8,5,17,0.6)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '11px', lineHeight: '1.5', color: '#94a3b8', overflowX: 'auto', maxHeight: '200px', fontFamily: 'ui-monospace, monospace' }}>
                          {log.responseBody}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default function Webhooks() {
  const [webhooks, setWebhooks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', url: '', events: [], contentType: '', maxRetries: 3, retryDelayMs: 5000, conditions: [] });
  const [conditionField, setConditionField] = useState('');
  const [conditionOp, setConditionOp] = useState('equals');
  const [conditionVal, setConditionVal] = useState('');

  const addCondition = () => {
    if (!conditionField.trim()) return;
    setForm({ ...form, conditions: [...form.conditions, { field: conditionField.trim(), operator: conditionOp, value: conditionVal }] });
    setConditionField('');
    setConditionOp('equals');
    setConditionVal('');
  };
  const [logViewer, setLogViewer] = useState(null);
  const [testing, setTesting] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [rotating, setRotating] = useState(null);
  const [rotateResult, setRotateResult] = useState(null);

  useEffect(() => { 
    api.get('/api/v1/webhooks').then(r => { setWebhooks(r.data || []); }).catch(() => {}); 
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
            <div style={{ marginBottom: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Retry Configuration</label>
              <div className="grid-2" style={{ marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#475569', marginBottom: '4px' }}>Max Retries</label>
                  <input type="number" min="0" max="10" value={form.maxRetries} onChange={e => setForm({ ...form, maxRetries: Number(e.target.value) })} className="input-field" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#475569', marginBottom: '4px' }}>Delay (ms)</label>
                  <input type="number" min="1000" max="300000" step="1000" value={form.retryDelayMs} onChange={e => setForm({ ...form, retryDelayMs: Number(e.target.value) })} className="input-field" />
                </div>
              </div>
            </div>
            <div style={{ marginBottom: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Event Conditions <span style={{ color: '#475569', fontWeight: 400 }}>(optional — filter which entries trigger this webhook)</span></label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input value={conditionField} onChange={e => setConditionField(e.target.value)} placeholder="Field name (e.g. status)" className="input-field" style={{ flex: '1' }} />
                <select value={conditionOp} onChange={e => setConditionOp(e.target.value)} className="select-field" style={{ width: '120px' }}>
                  <option value="equals">equals</option>
                  <option value="not_equals">not equals</option>
                  <option value="contains">contains</option>
                  <option value="exists">exists</option>
                  <option value="not_exists">not exists</option>
                </select>
                {conditionOp !== 'exists' && conditionOp !== 'not_exists' && (
                  <input value={conditionVal} onChange={e => setConditionVal(e.target.value)} placeholder="Value" className="input-field" style={{ flex: '1' }} />
                )}
                <button type="button" onClick={addCondition} className="btn-secondary" style={{ padding: '10px 16px' }}>Add</button>
              </div>
              {form.conditions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {form.conditions.map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: 'rgba(8,5,17,0.4)', borderRadius: '6px', fontSize: '12px' }}>
                      <code style={{ color: '#ff7e5f' }}>{c.field}</code>
                      <span style={{ color: '#64748b' }}>{c.operator}</span>
                      {c.value && <code style={{ color: '#34d399' }}>"{c.value}"</code>}
                      <button type="button" onClick={() => setForm({ ...form, conditions: form.conditions.filter((_, j) => j !== i) })} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: '2px' }}>×</button>
                    </div>
                  ))}
                </div>
              )}
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
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={async () => { setTesting(w._id); try { const r = await api.post(`/api/v1/webhooks/${w._id}/test`); setTestResult({ webhookName: w.name, ...r.data.test }); } catch { setTestResult({ webhookName: w.name, status: 'failed', error: 'Request failed' }); } finally { setTesting(null); } }} className="btn-ghost" style={{ padding: '8px' }} title="Test webhook" disabled={testing === w._id}>
                    <Play style={{ width: '14px', height: '14px', color: testing === w._id ? '#f59e0b' : '#94a3b8' }} />
                  </button>
                  <button onClick={async () => { setRotating(w._id); try { const r = await api.post(`/api/v1/webhooks/${w._id}/rotate-secret`); setRotateResult({ webhookName: w.name, secret: r.data.secret }); setWebhooks(webhooks.map(x => x._id === w._id ? { ...x, secretLastRotated: r.data.secretLastRotated } : x)); } catch (err) { alert(err.response?.data?.error || 'Rotation failed'); } finally { setRotating(null); } }} className="btn-ghost" style={{ padding: '8px' }} title="Rotate secret" disabled={rotating === w._id}>
                    <Shield style={{ width: '14px', height: '14px', color: rotating === w._id ? '#f59e0b' : '#94a3b8' }} />
                  </button>
                  <button onClick={() => setLogViewer(w)} className="btn-ghost" style={{ padding: '8px' }} title="View delivery logs">
                    <List style={{ width: '14px', height: '14px' }} />
                  </button>
                  <button onClick={() => handleDelete(w._id)} className="btn-ghost" style={{ padding: '8px', color: '#fca5a5' }}>
                    <Trash2 style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {w.events.map(e => (
                  <span key={e} className="badge badge-draft" style={{ border: '1px solid rgba(100,116,139,0.2)' }}>{e}</span>
                ))}
              </div>
              {w.conditions?.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {w.conditions.map((c, i) => (
                    <span key={i} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                      {c.field} {c.operator}{c.value ? ` "${c.value}"` : ''}
                    </span>
                  ))}
                </div>
              )}
              {w.lastTriggered && (
                <p style={{ fontSize: '10px', color: '#475569', marginTop: '8px' }}>
                  Last triggered: {new Date(w.lastTriggered).toLocaleString()} (Status: {w.lastStatus || 'failed'})
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {logViewer && (
        <WebhookLogViewer
          webhookId={logViewer._id}
          webhookName={logViewer.name}
          onClose={() => setLogViewer(null)}
        />
      )}

      {testResult && (
        <div className="modal-backdrop" onClick={() => setTestResult(null)}>
          <div className="glass-card" style={{ maxWidth: '480px', width: '90%', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                background: testResult.status === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                border: testResult.status === 'success' ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(239,68,68,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {testResult.status === 'success' ? <Check style={{ width: '16px', height: '16px', color: '#34d399' }} /> : <X style={{ width: '16px', height: '16px', color: '#fca5a5' }} />}
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>Test {testResult.status === 'success' ? 'Successful' : 'Failed'}</h3>
                <p style={{ fontSize: '12px', color: '#64748b' }}>{testResult.webhookName}</p>
              </div>
              <button onClick={() => setTestResult(null)} className="btn-ghost" style={{ marginLeft: 'auto', padding: '6px' }}>
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '12px', color: '#94a3b8' }}>
              <span>HTTP {testResult.responseCode || '—'}</span>
              <span>{testResult.duration}ms</span>
            </div>
            {testResult.error && (
              <div style={{ padding: '10px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', fontSize: '12px', color: '#fca5a5', marginBottom: '12px' }}>
                {testResult.error}
              </div>
            )}
            {testResult.responseBody && (
              <pre style={{ margin: 0, padding: '10px', background: 'rgba(8,5,17,0.6)', borderRadius: '8px', fontSize: '11px', color: '#94a3b8', maxHeight: '200px', overflow: 'auto', fontFamily: 'monospace' }}>
                {testResult.responseBody}
              </pre>
            )}
          </div>
        </div>
      )}

      {rotateResult && (
        <div className="modal-backdrop" onClick={() => setRotateResult(null)}>
          <div className="glass-card" style={{ maxWidth: '480px', width: '90%', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>Secret Rotated</h3>
                <p style={{ fontSize: '12px', color: '#64748b' }}>{rotateResult.webhookName}</p>
              </div>
              <button onClick={() => setRotateResult(null)} className="btn-ghost" style={{ marginLeft: 'auto', padding: '6px' }}>
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>New signing secret — copy it now. You won't see it again.</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <code style={{ flex: 1, padding: '10px', background: 'rgba(8,5,17,0.6)', borderRadius: '8px', fontSize: '12px', color: '#f59e0b', fontFamily: 'monospace', wordBreak: 'break-all' }}>{rotateResult.secret}</code>
              <button onClick={() => { navigator.clipboard.writeText(rotateResult.secret); setRotateResult(null); }} className="btn-primary" style={{ padding: '10px 16px', border: 'none', fontSize: '12px' }}>Copy</button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
