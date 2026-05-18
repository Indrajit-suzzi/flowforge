import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, ArrowLeft, Clock, User, Activity, Filter } from 'lucide-react';
import api from '../utils/api';
import LoadingScreen from '../components/LoadingScreen';

const actionColors = {
  create: { bg: '#064e3b', text: '#34d399' },
  update: { bg: '#1e3a5f', text: '#60a5fa' },
  delete: { bg: '#7f1d1d', text: '#fca5a5' },
  login: { bg: '#3b1e5f', text: '#a78bfa' },
  logout: { bg: '#334155', text: '#94a3b8' },
  create_key: { bg: '#064e3b', text: '#34d399' },
  delete_key: { bg: '#7f1d1d', text: '#fca5a5' }
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({ action: '', entityType: '' });

  useEffect(() => {
    const params = new URLSearchParams({ page, limit: 50, ...filter });
    api.get(`/api/v1/audit-logs?${params}`).then(r => {
      setLogs(r.data.logs || []);
      setTotalPages(r.data.totalPages || 1);
      setLoading(false);
    }).catch(() => setLoading(false));

    api.get('/api/v1/audit-logs/stats').then(r => {
      setStats(r.data || []);
    });
  }, [page, filter]);

  if (loading) return <LoadingScreen message="Loading audit logs" />;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9' }}>Audit Logs</h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Track all actions in your workspace</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {stats.map(s => (
          <div key={s._id} style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px' }}>
            <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'capitalize' }}>{s._id}</p>
            <p style={{ fontSize: '20px', fontWeight: '700', color: actionColors[s._id]?.text || '#f1f5f9', marginTop: '4px' }}>{s.count}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <select value={filter.action} onChange={e => { setFilter({ ...filter, action: e.target.value }); setPage(1); }} style={{ padding: '8px 12px', background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9', fontSize: '13px' }}>
          <option value="">All Actions</option>
          {['create', 'update', 'delete', 'login', 'create_key', 'delete_key'].map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={filter.entityType} onChange={e => { setFilter({ ...filter, entityType: e.target.value }); setPage(1); }} style={{ padding: '8px 12px', background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9', fontSize: '13px' }}>
          <option value="">All Types</option>
          {['entry', 'contentType', 'apiKey'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b', display: 'grid', gridTemplateColumns: '100px 100px 1fr 120px 100px', gap: '12px', fontSize: '11px', color: '#475569', textTransform: 'uppercase' }}>
          <span>Action</span>
          <span>Type</span>
          <span>Details</span>
          <span>Time</span>
          <span>IP</span>
        </div>
        {logs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No audit logs found</div>
        ) : (
          logs.map(log => (
            <div key={log._id} style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b', display: 'grid', gridTemplateColumns: '100px 100px 1fr 120px 100px', gap: '12px', alignItems: 'center', fontSize: '13px' }}>
              <span style={{ padding: '3px 8px', borderRadius: '4px', background: actionColors[log.action]?.bg, color: actionColors[log.action]?.text, fontSize: '11px', textTransform: 'capitalize', display: 'inline-block', width: 'fit-content' }}>{log.action}</span>
              <span style={{ color: '#94a3b8', fontSize: '12px' }}>{log.entityType}</span>
              <span style={{ color: '#e2e8f0', fontSize: '12px', fontFamily: 'monospace' }}>{log.entityName || log.entityId || '-'}</span>
              <span style={{ color: '#64748b', fontSize: '11px' }}>{new Date(log.createdAt).toLocaleString()}</span>
              <span style={{ color: '#475569', fontSize: '11px', fontFamily: 'monospace' }}>{log.ipAddress || '-'}</span>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 12px', background: '#1e293b', border: 'none', borderRadius: '6px', color: page === 1 ? '#475569' : '#f1f5f9', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '12px' }}>Previous</button>
          <span style={{ padding: '6px 12px', color: '#64748b', fontSize: '12px' }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '6px 12px', background: '#1e293b', border: 'none', borderRadius: '6px', color: page === totalPages ? '#475569' : '#f1f5f9', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '12px' }}>Next</button>
        </div>
      )}
    </div>
  );
}