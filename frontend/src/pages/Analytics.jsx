import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, Activity, Clock, BarChart3, TrendingUp, Zap } from 'lucide-react';
import api from '../utils/api';
import LoadingScreen from '../components/LoadingScreen';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    api.get(`/api/v1/analytics?period=${period}`).then(r => {
      setData(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [period]);

  if (loading) return <LoadingScreen message="Loading analytics" />;

  const successRate = data?.totalRequests ? ((data.successfulRequests / data.totalRequests) * 100).toFixed(1) : 0;
  const maxDayCount = Math.max(...(data?.requestsByDay?.map(d => d.count) || [1]));

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9' }}>Analytics</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Monitor your API usage and performance</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['24h', '7d', '30d', '90d'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '500', color: period === p ? '#f1f5f9' : '#64748b', background: period === p ? '#1e293b' : 'transparent', border: '1px solid #1e293b', borderRadius: '6px', cursor: 'pointer' }}>{p}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Activity style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
            <span style={{ fontSize: '12px', color: '#64748b' }}>Total Requests</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#f1f5f9' }}>{data?.totalRequests || 0}</p>
        </div>
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <TrendingUp style={{ width: '16px', height: '16px', color: '#10b981' }} />
            <span style={{ fontSize: '12px', color: '#64748b' }}>Success Rate</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>{successRate}%</p>
        </div>
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Clock style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
            <span style={{ fontSize: '12px', color: '#64748b' }}>Avg Response</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>{data?.avgResponseTime?.toFixed(0) || 0}ms</p>
        </div>
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Zap style={{ width: '16px', height: '16px', color: '#8b5cf6' }} />
            <span style={{ fontSize: '12px', color: '#64748b' }}>Failed</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#ef4444' }}>{data?.failedRequests || 0}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 style={{ width: '14px', height: '14px', color: '#64748b' }} /> Requests by Day
          </h3>
          <div style={{ display: 'flex', alignItems: 'end', gap: '8px', height: '120px' }}>
            {data?.requestsByDay?.map(d => (
              <div key={d._id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '100%', background: 'linear-gradient(180deg, #3b82f6, #6366f1)', borderRadius: '4px 4px 0 0', height: `${(d.count / maxDayCount) * 100}%`, minHeight: d.count > 0 ? '4px' : '0' }} />
                <span style={{ fontSize: '9px', color: '#475569' }}>{d._id.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp style={{ width: '14px', height: '14px', color: '#64748b' }} /> By Method
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data?.requestsByMethod?.map(m => (
              <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', minWidth: '50px' }}>{m._id}</span>
                <div style={{ flex: 1, background: '#1e293b', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${(m.count / data.totalRequests) * 100}%`, height: '100%', background: m._id === 'GET' ? '#3b82f6' : m._id === 'POST' ? '#10b981' : '#f59e0b', borderRadius: '4px' }} />
                </div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{m.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px' }}>Top Endpoints</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data?.requestsByEndpoint?.map(e => (
              <div key={e._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#0a0f1e', borderRadius: '8px' }}>
                <code style={{ fontSize: '11px', color: '#60a5fa', fontFamily: 'monospace' }}>{e._id}</code>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{e.count} requests</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px' }}>Recent Requests</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data?.recentRequests?.slice(0, 10).map(r => (
              <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#0a0f1e', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: r.statusCode < 400 ? '#064e3b' : '#7f1d1d', color: r.statusCode < 400 ? '#34d399' : '#fca5a5' }}>{r.statusCode}</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>{r.method} {r.endpoint}</span>
                </div>
                <span style={{ fontSize: '10px', color: '#475569' }}>{r.responseTime}ms</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}