import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Globe, Shield, Trash2, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState({ email: true, webhook: false });
  const [language, setLanguage] = useState('en');
  const [dangerZone, setDangerZone] = useState(false);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9' }}>Settings</h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Manage your preferences</p>
      </div>

      <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell style={{ width: '16px', height: '16px', color: '#64748b' }} /> Notifications
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#f1f5f9' }}>Email Notifications</p>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Receive updates via email</p>
            </div>
            <label style={{ position: 'relative', width: '44px', height: '24px', cursor: 'pointer' }}>
              <input type="checkbox" checked={notifications.email} onChange={e => setNotifications({ ...notifications, email: e.target.checked })} style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={{ position: 'absolute', inset: 0, background: notifications.email ? '#3b82f6' : '#334155', borderRadius: '12px', transition: '0.2s' }} />
              <span style={{ position: 'absolute', top: '2px', left: notifications.email ? '22px' : '2px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: '0.2s' }} />
            </label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#f1f5f9' }}>Webhook Alerts</p>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Send alerts to webhooks</p>
            </div>
            <label style={{ position: 'relative', width: '44px', height: '24px', cursor: 'pointer' }}>
              <input type="checkbox" checked={notifications.webhook} onChange={e => setNotifications({ ...notifications, webhook: e.target.checked })} style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={{ position: 'absolute', inset: 0, background: notifications.webhook ? '#3b82f6' : '#334155', borderRadius: '12px', transition: '0.2s' }} />
              <span style={{ position: 'absolute', top: '2px', left: notifications.webhook ? '22px' : '2px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: '0.2s' }} />
            </label>
          </div>
        </div>
      </div>

      <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe style={{ width: '16px', height: '16px', color: '#64748b' }} /> Language
        </h3>
        <select value={language} onChange={e => setLanguage(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px' }}>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </div>

      <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download style={{ width: '16px', height: '16px', color: '#64748b' }} /> Data
        </h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ padding: '10px 16px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', cursor: 'pointer', fontSize: '13px' }}>Export All Data</button>
          <button style={{ padding: '10px 16px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', cursor: 'pointer', fontSize: '13px' }}>Download Logs</button>
        </div>
      </div>

      <div style={{ background: '#111827', border: '1px solid #7f1d1d', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fca5a5', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield style={{ width: '16px', height: '16px' }} /> Danger Zone
        </h3>
        {!dangerZone ? (
          <button onClick={() => setDangerZone(true)} style={{ padding: '10px 16px', background: '#7f1d1d', border: 'none', borderRadius: '8px', color: '#fca5a5', cursor: 'pointer', fontSize: '13px' }}>Show Dangerous Actions</button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', background: '#0a0f1e', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#f1f5f9' }}>Delete Account</p>
                <p style={{ fontSize: '12px', color: '#64748b' }}>Permanently delete your account and all data</p>
              </div>
              <button style={{ padding: '8px 16px', background: '#dc2626', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Delete</button>
            </div>
            <div style={{ padding: '12px', background: '#0a0f1e', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#f1f5f9' }}>Revoke All API Keys</p>
                <p style={{ fontSize: '12px', color: '#64748b' }}>Invalidate all active API keys</p>
              </div>
              <button style={{ padding: '8px 16px', background: '#dc2626', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Revoke</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}