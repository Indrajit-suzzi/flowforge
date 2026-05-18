import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Layers, Key, FileText, Zap, Pencil, Trash2, Shield } from 'lucide-react';
import api from '../utils/api';
import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../context/AuthContext';

const roleLabels = { admin: 'Admin', subadmin: 'Sub Admin', user: 'User' };
const roleColors = { admin: '#fca5a5', subadmin: '#60a5fa', user: '#34d399' };

export default function Dashboard() {
  const { user, hasPermission } = useAuth();
  const [contentTypes, setContentTypes] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const requests = [api.get('/api/v1/content-types').then(r => r.data)];
    if (hasPermission('apiKeys')) {
      requests.push(api.get('/api/v1/api-keys').then(r => r.data));
    } else {
      requests.push(Promise.resolve([]));
    }

    Promise.all(requests).then(([ct, keys]) => {
      setContentTypes(ct || []);
      setApiKeys(keys || []);
    }).catch(() => {
      setContentTypes([]);
      setApiKeys([]);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen message="Loading dashboard" />;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9' }}>Dashboard</h1>
            {user && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 10px', background: '#1e293b', borderRadius: '6px', fontSize: '12px', color: roleColors[user.role] || '#94a3b8' }}>
                <Shield style={{ width: '12px', height: '12px' }} /> {roleLabels[user.role] || user.role}
              </span>
            )}
          </div>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Overview of your content and API keys</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {hasPermission('contentTypes') && (
            <Link to="/content-types" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '500', color: '#e2e8f0', background: '#1e293b', borderRadius: '8px', textDecoration: 'none' }}>
              <Plus style={{ width: '14px', height: '14px' }} /> Content Type
            </Link>
          )}
          {hasPermission('apiKeys') && (
            <Link to="/api-keys" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: 'white', background: 'linear-gradient(90deg, #3b82f6, #6366f1)', borderRadius: '8px', textDecoration: 'none' }}>
              <Key style={{ width: '14px', height: '14px' }} /> API Key
            </Link>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {hasPermission('contentTypes') && (
          <Link to="/content-types" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', cursor: 'pointer' }}>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Content Types</p>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#f1f5f9', marginTop: '8px' }}>{contentTypes.length}</p>
              <p style={{ fontSize: '12px', color: '#60a5fa', marginTop: '12px' }}>Manage →</p>
            </div>
          </Link>
        )}
        {hasPermission('apiKeys') && (
          <Link to="/api-keys" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', cursor: 'pointer' }}>
              <p style={{ fontSize: '13px', color: '#64748b' }}>API Keys</p>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#f1f5f9', marginTop: '8px' }}>{apiKeys.length}</p>
              <p style={{ fontSize: '12px', color: '#34d399', marginTop: '12px' }}>Manage →</p>
            </div>
          </Link>
        )}
        {hasPermission('analytics') && (
          <Link to="/analytics" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', cursor: 'pointer' }}>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Analytics</p>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#f1f5f9', marginTop: '8px' }}>→</p>
              <p style={{ fontSize: '12px', color: '#f59e0b', marginTop: '12px' }}>View →</p>
            </div>
          </Link>
        )}
      </div>

      <div>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText style={{ width: '16px', height: '16px', color: '#64748b' }} /> Content Types
        </h2>
        {contentTypes.length === 0 ? (
          <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', marginBottom: '16px' }}>No content types yet</p>
            {hasPermission('contentTypes') && (
              <Link to="/content-types" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: 'white', background: 'linear-gradient(90deg, #3b82f6, #6366f1)', borderRadius: '8px', textDecoration: 'none' }}>
                <Plus style={{ width: '14px', height: '14px' }} /> Create Content Type
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {contentTypes.map((ct) => (
              <Link key={ct._id} to={`/content/${ct.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', cursor: 'pointer' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>{ct.name}</h3>
                  <p style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace', marginTop: '4px' }}>/{ct.slug}</p>
                  <p style={{ fontSize: '11px', color: '#64748b', marginTop: '12px' }}>{ct.fields.length} fields</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}