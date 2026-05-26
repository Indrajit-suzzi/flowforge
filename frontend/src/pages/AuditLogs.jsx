import { useState, useEffect } from 'react';
import { Shield, Download } from 'lucide-react';
import api from '../utils/api';
import PageShell from '../components/PageShell';
import FilterBar from '../components/FilterBar';
import DataTable from '../components/DataTable';

const actionColors = {
  create: { bg: 'rgba(16,185,129,0.12)', text: '#34d399', border: 'rgba(16,185,129,0.2)' },
  update: { bg: 'rgba(59,130,246,0.12)', text: '#60a5fa', border: 'rgba(59,130,246,0.2)' },
  delete: { bg: 'rgba(239,68,68,0.12)', text: '#fca5a5', border: 'rgba(239,68,68,0.2)' },
  login: { bg: 'rgba(139,92,246,0.12)', text: '#a78bfa', border: 'rgba(139,92,246,0.2)' },
  logout: { bg: 'rgba(100,116,139,0.12)', text: '#94a3b8', border: 'rgba(100,116,139,0.2)' },
  create_key: { bg: 'rgba(16,185,129,0.12)', text: '#34d399', border: 'rgba(16,185,129,0.2)' },
  delete_key: { bg: 'rgba(239,68,68,0.12)', text: '#fca5a5', border: 'rgba(239,68,68,0.2)' }
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
    }).catch(() => {});
  }, [page, filter]);

  const columns = [
    {
      key: 'action',
      label: 'Action',
      width: '90px',
      render: (log) => {
        const ac = actionColors[log.action] || { bg: 'rgba(100,116,139,0.12)', text: '#94a3b8', border: 'rgba(100,116,139,0.2)' };
        return (
          <span style={{ padding: '3px 8px', borderRadius: '6px', background: ac.bg, color: ac.text, fontSize: '11px', textTransform: 'capitalize', display: 'inline-block', width: 'fit-content', border: `1px solid ${ac.border}` }}>
            {log.action.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      key: 'entityType',
      label: 'Type',
      width: '90px',
      render: (log) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{log.entityType}</span>,
    },
    {
      key: 'details',
      label: 'Details',
      render: (log) => (
        <span style={{ color: '#e2e8f0', fontSize: '12px', fontFamily: 'monospace' }}>
          {log.entityName || log.entityId || '-'}
        </span>
      ),
    },
    {
      key: 'time',
      label: 'Time',
      width: '140px',
      render: (log) => <span style={{ color: '#64748b', fontSize: '11px' }}>{new Date(log.createdAt).toLocaleString()}</span>,
    },
    {
      key: 'ip',
      label: 'IP',
      width: '100px',
      render: (log) => <span style={{ color: '#475569', fontSize: '11px', fontFamily: 'monospace' }}>{log.ipAddress || '-'}</span>,
    },
  ];

  return (
    <PageShell
      title="Audit Logs"
      subtitle="Track all actions in your workspace"
      icon={<Shield style={{ width: '22px', height: '22px' }} />}
      iconColor="#a78bfa"
      actions={
        <button onClick={() => { const p = new URLSearchParams(filter); window.open(`/api/v1/audit-logs/export/csv?${p}`, '_blank'); }} className="btn-secondary" style={{ padding: '9px 16px', fontSize: '13px', textDecoration: 'none' }}>
          <Download style={{ width: '14px', height: '14px' }} /> Export CSV
        </button>
      }
    >
      <div className="grid-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', marginBottom: '24px' }}>
        {stats.map(s => (
          <div key={s._id} className="glass-card-sm" style={{ padding: '16px' }}>
            <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'capitalize', marginBottom: '8px' }}>{s._id.replace('_', ' ')}</p>
            <p style={{ fontSize: '24px', fontWeight: '800', color: actionColors[s._id]?.text || '#f8fafc', fontFamily: "var(--font-heading)" }}>{s.count}</p>
          </div>
        ))}
      </div>

      <FilterBar
        filters={[
          {
            type: 'select',
            value: filter.action,
            onChange: (val) => { setFilter({ ...filter, action: val }); setPage(1); },
            options: [
              { value: '', label: 'All Actions' },
              ...['create', 'update', 'delete', 'login', 'create_key', 'delete_key'].map(a => ({
                value: a,
                label: a.replace('_', ' '),
              })),
            ],
          },
          {
            type: 'select',
            value: filter.entityType,
            onChange: (val) => { setFilter({ ...filter, entityType: val }); setPage(1); },
            options: [
              { value: '', label: 'All Types' },
              { value: 'entry', label: 'entry' },
              { value: 'contentType', label: 'contentType' },
              { value: 'apiKey', label: 'apiKey' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={logs}
        emptyState={<p style={{ color: '#64748b' }}>No audit logs found</p>}
        loading={loading}
      />

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="page-btn">Previous</button>
          <span style={{ padding: '6px 12px', color: '#64748b', fontSize: '12px' }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="page-btn">Next</button>
        </div>
      )}
    </PageShell>
  );
}
