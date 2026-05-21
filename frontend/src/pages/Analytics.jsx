import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, Activity, Clock, BarChart3, TrendingUp, Zap } from 'lucide-react';
import api from '../utils/api';
import PageShell from '../components/PageShell';
import FilterBar from '../components/FilterBar';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    setLoading(true);
    api.get(`/api/v1/analytics?period=${period}`).then(r => {
      setData(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [period]);

  const successRate = data?.totalRequests ? ((data.successfulRequests / data.totalRequests) * 100).toFixed(1) : 0;
  const maxDayCount = Math.max(...(data?.requestsByDay?.map(d => d.count) || [1]));

  return (
    <PageShell
      title="Analytics"
      subtitle="Monitor your API usage and performance"
      icon={<BarChart3 style={{ width: '22px', height: '22px' }} />}
      iconColor="#8b5cf6"
      actions={
        <div className="filter-group">
          {['24h', '7d', '30d', '90d'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`filter-btn ${period === p ? 'active' : ''}`}>{p}</button>
          ))}
        </div>
      }
    >
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <div className="glass-card stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <Activity style={{ width: '14px', height: '14px', color: '#3b82f6' }} />
            </div>
            <span className="stat-label">Total Requests</span>
          </div>
          <p className="stat-value">{data?.totalRequests || 0}</p>
        </div>
        <div className="glass-card stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <TrendingUp style={{ width: '14px', height: '14px', color: '#10b981' }} />
            </div>
            <span className="stat-label">Success Rate</span>
          </div>
          <p className="stat-value" style={{ color: '#10b981' }}>{successRate}%</p>
        </div>
        <div className="glass-card stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <Clock style={{ width: '14px', height: '14px', color: '#f59e0b' }} />
            </div>
            <span className="stat-label">Avg Response</span>
          </div>
          <p className="stat-value" style={{ color: '#f59e0b' }}>{data?.avgResponseTime?.toFixed(0) || 0}ms</p>
        </div>
        <div className="glass-card stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <Zap style={{ width: '14px', height: '14px', color: '#ef4444' }} />
            </div>
            <span className="stat-label">Failed</span>
          </div>
          <p className="stat-value" style={{ color: '#ef4444' }}>{data?.failedRequests || 0}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 className="section-heading" style={{ marginBottom: '16px' }}>
            <BarChart3 style={{ width: '14px', height: '14px', color: '#ff7e5f' }} /> Requests by Day
          </h3>
          <div style={{ display: 'flex', alignItems: 'end', gap: '8px', height: '120px' }}>
            {data?.requestsByDay?.map(d => (
              <div key={d._id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '100%', background: 'linear-gradient(180deg, #ff7e5f, #feb47b)', borderRadius: '4px 4px 0 0', height: `${(d.count / maxDayCount) * 100}%`, minHeight: d.count > 0 ? '4px' : '0', transition: 'height 0.3s' }} />
                <span style={{ fontSize: '9px', color: '#475569' }}>{d._id.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 className="section-heading" style={{ marginBottom: '16px' }}>
            <TrendingUp style={{ width: '14px', height: '14px', color: '#8b5cf6' }} /> By Method
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data?.requestsByMethod?.map(m => (
              <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', minWidth: '50px' }}>{m._id}</span>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${(m.count / data.totalRequests) * 100}%`, height: '100%', background: m._id === 'GET' ? '#ff7e5f' : m._id === 'POST' ? '#34d399' : '#f59e0b', borderRadius: '4px', transition: 'width 0.5s' }} />
                </div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{m.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 className="section-heading" style={{ marginBottom: '16px' }}>Top Endpoints</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data?.requestsByEndpoint?.map(e => (
              <div key={e._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(8,5,17,0.4)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <code style={{ fontSize: '11px', color: '#ff7e5f', fontFamily: 'monospace' }}>{e._id}</code>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{e.count} requests</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 className="section-heading" style={{ marginBottom: '16px' }}>Recent Requests</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data?.recentRequests?.slice(0, 10).map(r => (
              <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(8,5,17,0.4)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: r.statusCode < 400 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: r.statusCode < 400 ? '#34d399' : '#fca5a5', border: `1px solid ${r.statusCode < 400 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>{r.statusCode}</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>{r.method} {r.endpoint}</span>
                </div>
                <span style={{ fontSize: '10px', color: '#475569' }}>{r.responseTime}ms</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
