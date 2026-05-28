import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Layers, Key, FileText, ArrowRight, BarChart3, Sparkles, Download, Activity, Clock, CheckCircle, Shield, User, Eye } from 'lucide-react';
import api from '../utils/api';
import PageShell from '../components/PageShell';
import { SkeletonStats } from '../components/Skeleton';
import { useRole } from '../hooks/useRole';

export default function Dashboard() {
  const { isAdmin } = useRole();
  const [loading, setLoading] = useState(true);
  const [contentTypes, setContentTypes] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/api/v1/content-types').then(r => r.data),
      api.get('/api/v1/api-keys').then(r => r.data).catch(() => []),
      api.get('/api/v1/stats').then(r => r.data).catch(() => null),
      api.get('/api/v1/audit-logs?limit=8').then(r => r.data).catch(() => ({ logs: [] })),
      api.get('/api/v1/health').then(r => r.data).catch(() => null),
    ]).then(([ct, keys, s, audit, h]) => {
      setContentTypes(ct || []);
      setApiKeys(keys || []);
      setStats(s);
      setActivities(audit.logs || []);
      setHealth(h);
    }).catch(() => {
      setContentTypes([]);
      setApiKeys([]);
    }).finally(() => setLoading(false));
  }, []);

  const actionLabel = (action) => {
    const map = {
      create: 'Created', update: 'Updated', delete: 'Deleted',
      publish: 'Published', unpublish: 'Unpublished',
      bulk_update: 'Bulk edited', duplicate: 'Duplicated',
      restore: 'Restored', permanent_delete: 'Deleted permanently',
      import: 'Imported'
    };
    return map[action] || action;
  };

  return (
    <PageShell
      title="Dashboard"
      subtitle="Overview of your content and activity"
      icon={<Sparkles style={{ width: '22px', height: '22px' }} />}
      actions={
        <>
          <button onClick={() => window.open('/api/v1/stats/export', '_blank')} className="btn-secondary" style={{ padding: '9px 18px', fontSize: '13px', textDecoration: 'none' }}>
            <Download style={{ width: '14px', height: '14px' }} /> Export All
          </button>
          <Link to="/content-types" className="btn-secondary" style={{ padding: '9px 18px', fontSize: '13px', textDecoration: 'none' }}>
            <Plus style={{ width: '14px', height: '14px' }} /> Content Type
          </Link>
          <Link to="/api-keys" className="btn-primary" style={{ padding: '9px 18px', fontSize: '13px', textDecoration: 'none' }}>
            <Key style={{ width: '14px', height: '14px' }} /> API Key
          </Link>
        </>
      }
    >
      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <Link to="/content-types" className="btn-primary" style={{ padding: '10px 18px', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus style={{ width: '14px', height: '14px' }} /> New Content Type
        </Link>
        <Link to="/calendar" className="btn-secondary" style={{ padding: '10px 18px', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BarChart3 style={{ width: '14px', height: '14px' }} /> Content Calendar
        </Link>
        <Link to="/forms" className="btn-secondary" style={{ padding: '10px 18px', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FileText style={{ width: '14px', height: '14px' }} /> Forms
        </Link>
        <Link to="/search" className="btn-secondary" style={{ padding: '10px 18px', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Eye style={{ width: '14px', height: '14px' }} /> Search
        </Link>
        {isAdmin && (
          <Link to="/audit-logs" className="btn-secondary" style={{ padding: '10px 18px', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity style={{ width: '14px', height: '14px' }} /> Audit Logs
          </Link>
        )}
      </div>

      {loading ? (
        <>
          <SkeletonStats count={4} />
          <div style={{ marginTop: '40px' }} />
          <div className="grid-2" style={{ marginBottom: '24px' }}>
            <div className="glass-card" style={{ padding: '24px', height: '200px' }}>
              <div className="skeleton skeleton-heading" style={{ width: '150px' }} />
              <div style={{ marginTop: '16px' }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton skeleton-row" style={{ marginBottom: '8px' }} />
                ))}
              </div>
            </div>
            <div className="glass-card" style={{ padding: '24px', height: '200px' }}>
              <div className="skeleton skeleton-heading" style={{ width: '120px' }} />
              <div style={{ marginTop: '16px' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton skeleton-row" style={{ marginBottom: '8px' }} />
                ))}
              </div>
            </div>
          </div>
          <div className="glass-card" style={{ padding: '28px' }}>
            <div className="skeleton skeleton-heading" style={{ width: '120px', marginBottom: '20px' }} />
            <div className="grid-auto-fill">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass-card-sm" style={{ padding: '20px', height: '140px' }}>
                  <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '10px', marginBottom: '14px' }} />
                  <div className="skeleton skeleton-text-sm" style={{ width: '100px' }} />
                  <div className="skeleton skeleton-text-sm" style={{ width: '60px', marginTop: '4px' }} />
                  <div className="skeleton skeleton-text-sm" style={{ width: '80px', marginTop: '12px' }} />
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
      <>
      {/* Stats Cards */}
      <div className="grid-4" style={{ marginBottom: '40px' }}>
        <Link to="/content-types" style={{ textDecoration: 'none' }}>
          <div className="glass-card stat-card" style={{ cursor: 'pointer' }}>
            <p className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers style={{ width: '14px', height: '14px', color: '#ff7e5f' }} /> Content Types
            </p>
            <p className="stat-value" style={{ fontSize: '36px' }}>{contentTypes.length}</p>
            <p style={{ fontSize: '12px', color: '#ff7e5f', marginTop: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Manage <ArrowRight style={{ width: '12px', height: '12px' }} />
            </p>
          </div>
        </Link>
        <Link to="/content-types" style={{ textDecoration: 'none' }}>
          <div className="glass-card stat-card" style={{ cursor: 'pointer' }}>
            <p className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText style={{ width: '14px', height: '14px', color: '#10b981' }} /> Total Entries
            </p>
            <p className="stat-value" style={{ fontSize: '36px' }}>{stats ? stats.totalEntries : '-'}</p>
            <p style={{ fontSize: '12px', color: '#10b981', marginTop: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {stats ? `${stats.totalPublished} published · ${stats.totalDrafts} drafts` : ''}
            </p>
          </div>
        </Link>
        <Link to="/calendar" style={{ textDecoration: 'none' }}>
          <div className="glass-card stat-card" style={{ cursor: 'pointer' }}>
            <p className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 style={{ width: '14px', height: '14px', color: '#f59e0b' }} /> Scheduled
            </p>
            <p className="stat-value" style={{ fontSize: '36px' }}>{stats ? stats.totalScheduled : '-'}</p>
            <p style={{ fontSize: '12px', color: '#f59e0b', marginTop: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View Calendar <ArrowRight style={{ width: '12px', height: '12px' }} />
            </p>
          </div>
        </Link>
        <Link to="/api-keys" style={{ textDecoration: 'none' }}>
          <div className="glass-card stat-card" style={{ cursor: 'pointer' }}>
            <p className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key style={{ width: '14px', height: '14px', color: '#8b5cf6' }} /> API Keys
            </p>
            <p className="stat-value" style={{ fontSize: '36px' }}>{apiKeys.length}</p>
            <p style={{ fontSize: '12px', color: '#8b5cf6', marginTop: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Manage <ArrowRight style={{ width: '12px', height: '12px' }} />
            </p>
          </div>
        </Link>
      </div>

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Content Breakdown */}
        {stats && stats.breakdown && (
          <div className="glass-card" style={{ padding: '24px' }}>
            <h2 className="section-heading" style={{ marginBottom: '16px' }}>
              <FileText style={{ width: '16px', height: '16px', color: '#10b981' }} /> Content Breakdown
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th style={{ padding: '6px 10px', textAlign: 'left', color: '#64748b', fontWeight: '500', fontSize: '10px' }}>Type</th>
                  <th style={{ padding: '6px 10px', textAlign: 'center', color: '#64748b', fontWeight: '500', fontSize: '10px' }}>Total</th>
                  <th style={{ padding: '6px 10px', textAlign: 'center', color: '#64748b', fontWeight: '500', fontSize: '10px' }}>Pub</th>
                  <th style={{ padding: '6px 10px', textAlign: 'center', color: '#64748b', fontWeight: '500', fontSize: '10px' }}>Sch</th>
                  <th style={{ padding: '6px 10px', textAlign: 'center', color: '#64748b', fontWeight: '500', fontSize: '10px' }}>Dft</th>
                </tr>
              </thead>
              <tbody>
                {stats.breakdown.map(b => (
                  <tr key={b.slug} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '6px 10px', color: '#e2e8f0' }}>{b.name}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'center', color: '#e2e8f0', fontWeight: '600' }}>{b.all}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'center', color: '#34d399' }}>{b.published}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'center', color: '#fbbf24' }}>{b.scheduled}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'center', color: '#94a3b8' }}>{b.drafts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Recent Activity */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 className="section-heading" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity style={{ width: '16px', height: '16px', color: '#8b5cf6' }} /> Recent Activity
            </span>
            <Link to="/audit-logs" style={{ fontSize: '11px', color: '#64748b', textDecoration: 'none' }}>View all</Link>
          </h2>
          {activities.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '16px' }}>No recent activity</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {activities.map(log => (
                <div key={log._id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 10px', borderRadius: '6px',
                  background: 'rgba(255,255,255,0.01)',
                  borderBottom: '1px solid rgba(255,255,255,0.03)'
                }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '6px',
                    background: 'rgba(139,92,246,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {log.action === 'create' || log.action === 'restore' ? (
                      <CheckCircle style={{ width: '12px', height: '12px', color: '#34d399' }} />
                    ) : (
                      <Activity style={{ width: '12px', height: '12px', color: '#c4b5fd' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '12px', color: '#e2e8f0', margin: 0 }}>
                      <strong>{actionLabel(log.action)}</strong> {log.entityType}
                    </p>
                  </div>
                  <span style={{ fontSize: '10px', color: '#475569', whiteSpace: 'nowrap' }}>
                    {new Date(log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System Status */}
      {health && (
        <div className="glass-card" style={{ padding: '16px 24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield style={{ width: '14px', height: '14px', color: health.status === 'ok' ? '#34d399' : '#fca5a5' }} />
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>System:</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: health.status === 'ok' ? '#34d399' : '#fca5a5' }}>
                {health.status === 'ok' ? 'Healthy' : 'Unhealthy'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock style={{ width: '14px', height: '14px', color: '#64748b' }} />
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>DB:</span>
              <span style={{ fontSize: '13px', color: health.db === 'connected' ? '#34d399' : '#fca5a5', fontWeight: '600' }}>
                {health.db}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User style={{ width: '14px', height: '14px', color: '#64748b' }} />
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Role:</span>
              <span style={{ fontSize: '13px', color: '#e2e8f0', textTransform: 'capitalize' }}>{isAdmin ? 'admin' : 'member'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock style={{ width: '14px', height: '14px', color: '#64748b' }} />
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Uptime:</span>
              <span style={{ fontSize: '13px', color: '#e2e8f0' }}>{Math.floor(health.uptime / 60)}m</span>
            </div>
          </div>
        </div>
      )}

      {/* Content Types */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <h2 className="section-heading" style={{ marginBottom: '20px' }}>
          <FileText style={{ width: '16px', height: '16px', color: '#ff7e5f' }} /> Content Types
        </h2>
        {contentTypes.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-text">No content types yet</p>
            <Link to="/content-types" className="btn-primary" style={{ textDecoration: 'none' }}>
              <Plus style={{ width: '14px', height: '14px' }} /> Create Content Type
            </Link>
          </div>
        ) : (
          <div className="grid-auto-fill">
            {contentTypes.map((ct) => {
              const b = stats?.breakdown?.find(x => x.slug === ct.slug);
              return (
                <Link key={ct._id} to={`/content/${ct.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="glass-card-sm" style={{ padding: '20px', cursor: 'pointer', height: '100%' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255, 126, 95, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', border: '1px solid rgba(255, 126, 95, 0.2)' }}>
                      <Layers style={{ width: '16px', height: '16px', color: '#ff7e5f' }} />
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>{ct.name}</h3>
                    <p style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace', marginTop: '4px' }}>/{ct.slug}</p>
                    <p style={{ fontSize: '11px', color: '#64748b', marginTop: '12px' }}>{ct.fields.length} fields · {b ? `${b.all} entries` : '-'}</p>
                    <p style={{ fontSize: '10px', color: '#475569', marginTop: '4px' }}>{new Date(ct.createdAt).toLocaleDateString()}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
        </>
      )}
    </PageShell>
  );
}
