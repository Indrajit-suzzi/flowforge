import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Layers, Key, FileText, ArrowRight, BarChart3, Sparkles } from 'lucide-react';
import api from '../utils/api';
import PageShell from '../components/PageShell';
import { useRole } from '../hooks/useRole';

export default function Dashboard() {
  const { isAdmin } = useRole();
  const [contentTypes, setContentTypes] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/api/v1/content-types').then(r => r.data),
      api.get('/api/v1/api-keys').then(r => r.data).catch(() => []),
    ]).then(([ct, keys]) => {
      setContentTypes(ct || []);
      setApiKeys(keys || []);
    }).catch(() => {
      setContentTypes([]);
      setApiKeys([]);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <PageShell
      title="Dashboard"
      subtitle="Overview of your content and API keys"
      icon={<Sparkles style={{ width: '22px', height: '22px' }} />}
      actions={
        <>
          <Link to="/content-types" className="btn-secondary" style={{ padding: '9px 18px', fontSize: '13px', textDecoration: 'none' }}>
            <Plus style={{ width: '14px', height: '14px' }} /> Content Type
          </Link>
          <Link to="/api-keys" className="btn-primary" style={{ padding: '9px 18px', fontSize: '13px', textDecoration: 'none' }}>
            <Key style={{ width: '14px', height: '14px' }} /> API Key
          </Link>
        </>
      }
    >
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
        {isAdmin && (
          <Link to="/analytics" style={{ textDecoration: 'none' }}>
            <div className="glass-card stat-card" style={{ cursor: 'pointer' }}>
              <p className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 style={{ width: '14px', height: '14px', color: '#f59e0b' }} /> Analytics
              </p>
              <p className="stat-value" style={{ fontSize: '36px' }}>→</p>
              <p style={{ fontSize: '12px', color: '#f59e0b', marginTop: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View <ArrowRight style={{ width: '12px', height: '12px' }} />
              </p>
            </div>
          </Link>
        )}
      </div>

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
            {contentTypes.map((ct) => (
              <Link key={ct._id} to={`/content/${ct.slug}`} style={{ textDecoration: 'none' }}>
                <div className="glass-card-sm" style={{ padding: '20px', cursor: 'pointer', height: '100%' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255, 126, 95, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', border: '1px solid rgba(255, 126, 95, 0.2)' }}>
                    <Layers style={{ width: '16px', height: '16px', color: '#ff7e5f' }} />
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>{ct.name}</h3>
                  <p style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace', marginTop: '4px' }}>/{ct.slug}</p>
                  <p style={{ fontSize: '11px', color: '#64748b', marginTop: '12px' }}>{ct.fields.length} fields</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
