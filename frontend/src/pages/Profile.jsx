import { useState, useEffect } from 'react';
import { User, Mail, Edit2, X, Activity, FileText, Shield, Calendar, Key, Layers, CheckCircle, XCircle } from 'lucide-react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useLocalAuth } from '../contexts/AuthContext';
import LoadingButton from '../components/LoadingButton';
import PageShell from '../components/PageShell';
import api from '../utils/api';

export default function Profile() {
  const current = useCurrentUser();
  const localAuth = useLocalAuth();
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', email: '' });
  const [message, setMessage] = useState('');
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    if (current.isLoaded && current.user) {
      setForm({ username: current.displayName, email: current.email });
      loadActivity();
      loadStats();
    }
  }, [current.isLoaded, current.user]);

  const loadActivity = async () => {
    try {
      const { data } = await api.get(`/api/v1/audit-logs?limit=20&userId=${current.userId}`);
      setActivities(data.logs || []);
    } catch { /* ignore */ }
    setLoadingActivity(false);
  };

  const loadStats = async () => {
    try {
      const { data: cts } = await api.get('/api/v1/content-types');
      const { data: statsData } = await api.get('/api/v1/stats');
      setStats({
        contentTypes: cts?.length || 0,
        entries: statsData?.totalEntries || 0,
        role: current.user?.publicMetadata?.role || localAuth.user?.role || 'member',
        memberSince: current.user?.createdAt ? new Date(current.user.createdAt).toLocaleDateString() : localAuth.user?.createdAt ? new Date(localAuth.user.createdAt).toLocaleDateString() : 'N/A',
      });
    } catch { /* ignore */ }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (current.isClerk) {
        await current.user.update({ firstName: form.username });
      } else {
        await api.put('/api/v1/users/me', { username: form.username });
      }
      setMessage('Profile updated');
      setEditing(false);
    } catch (err) {
      setMessage('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const actionLabel = (action) => {
    const map = {
      create: 'Created', update: 'Updated', delete: 'Deleted',
      publish: 'Published', unpublish: 'Unpublished',
      bulk_update: 'Bulk edited', duplicate: 'Duplicated',
      restore: 'Restored', permanent_delete: 'Permanently deleted',
      import: 'Imported', create_key: 'Created API key', delete_key: 'Deleted API key'
    };
    return map[action] || action;
  };

  const entityIcon = (type) => {
    const map = { contentType: Layers, entry: FileText, apiKey: Key, user: User };
    const Icon = map[type] || Activity;
    return <Icon style={{ width: '12px', height: '12px' }} />;
  };

  if (!current.isLoaded) return <div style={{ padding: '32px', color: '#64748b' }}>Loading profile...</div>;

  return (
    <PageShell
      title="Profile"
      subtitle="Manage your account details"
      icon={<User style={{ width: '22px', height: '22px' }} />}
      maxWidth="900px"
    >
      {message && (
        <div style={{
          padding: '12px 16px', borderRadius: '12px',
          background: message.includes('Failed') ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
          border: `1px solid ${message.includes('Failed') ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
          color: message.includes('Failed') ? '#fca5a5' : '#34d399',
          marginBottom: '20px', fontSize: '13px'
        }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>Account Details</h3>
            <button onClick={() => setEditing(!editing)} className="btn-ghost">
              {editing ? <X style={{ width: '12px', height: '12px' }} /> : <Edit2 style={{ width: '12px', height: '12px' }} />} {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff7e5f, #feb47b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', fontWeight: '800', color: '#080511',
              fontFamily: "var(--font-heading)",
              boxShadow: '0 4px 15px rgba(255,126,95,0.3)'
            }}>
              {form.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: '20px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>{form.username}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                <User style={{ width: '12px', height: '12px' }} /> Username
              </label>
              {editing ? (
                <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="input-field" />
              ) : (
                <p style={{ fontSize: '14px', color: '#f8fafc' }}>{form.username}</p>
              )}
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                <Mail style={{ width: '12px', height: '12px' }} /> Email
              </label>
              <p style={{ fontSize: '14px', color: '#f8fafc' }}>{form.email}</p>
            </div>
          </div>

          {editing && (
            <div style={{ marginTop: '24px' }}>
              <LoadingButton onClick={handleSave} loading={saving} className="btn-primary" style={{ border: 'none' }}>Save Changes</LoadingButton>
            </div>
          )}
        </div>

        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)", marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity style={{ width: '18px', height: '18px', color: '#ff7e5f' }} /> Stats
          </h3>
          {stats ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <p style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Content Types</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <Layers style={{ width: '16px', height: '16px', color: '#ff7e5f' }} />
                  <span style={{ fontSize: '24px', fontWeight: '700', color: '#f8fafc' }}>{stats.contentTypes}</span>
                </div>
              </div>
              <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <p style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Entries</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <FileText style={{ width: '16px', height: '16px', color: '#8b5cf6' }} />
                  <span style={{ fontSize: '24px', fontWeight: '700', color: '#f8fafc' }}>{stats.entries}</span>
                </div>
              </div>
              <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <p style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <Shield style={{ width: '16px', height: '16px', color: '#34d399' }} />
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#f8fafc', textTransform: 'capitalize' }}>{stats.role}</span>
                </div>
              </div>
              <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <p style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Member Since</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <Calendar style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc' }}>{stats.memberSince}</span>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: '13px' }}>Loading stats...</p>
          )}
        </div>
      </div>

      <div className="glass-card" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)", marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity style={{ width: '18px', height: '18px', color: '#ff7e5f' }} /> Recent Activity
        </h3>
        {loadingActivity ? (
          <p style={{ color: '#64748b', fontSize: '13px' }}>Loading activity...</p>
        ) : activities.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '24px' }}>No recent activity</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {activities.map((log) => {
              const ActionIcon = log.action === 'create' || log.action === 'restore' ? CheckCircle :
                                 log.action === 'delete' || log.action === 'permanent_delete' ? XCircle : Activity;
              return (
                <div key={log._id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 12px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.01)',
                  borderBottom: '1px solid rgba(255,255,255,0.03)'
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: log.action === 'create' || log.action === 'restore' ? 'rgba(16,185,129,0.1)' :
                                log.action === 'delete' || log.action === 'permanent_delete' ? 'rgba(239,68,68,0.1)' :
                                'rgba(139,92,246,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <ActionIcon style={{
                      width: '13px', height: '13px',
                      color: log.action === 'create' || log.action === 'restore' ? '#34d399' :
                             log.action === 'delete' || log.action === 'permanent_delete' ? '#fca5a5' : '#c4b5fd'
                    }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', color: '#e2e8f0' }}>
                      <strong>{actionLabel(log.action)}</strong> {log.entityType}
                      {log.entityName && <> <span style={{ color: '#64748b' }}>—</span> {log.entityName}</>}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {entityIcon(log.entityType)}
                    <span style={{ fontSize: '11px', color: '#475569', whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}
