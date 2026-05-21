import { useState } from 'react';
import { FileText, Bell, Globe, Shield, Download, Sparkles } from 'lucide-react';
import PageShell from '../components/PageShell';

export default function Settings() {
  const [notifications, setNotifications] = useState({ email: true, webhook: false });
  const [language, setLanguage] = useState('en');

  const Toggle = ({ checked, onChange }) => (
    <label className="toggle" onClick={(e) => e.stopPropagation()}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className={`toggle-track ${checked ? 'on' : ''}`} />
      <span className={`toggle-thumb ${checked ? 'on' : ''}`} />
    </label>
  );

  return (
    <PageShell
      title="Settings"
      subtitle="Manage your preferences and account settings"
      icon={<Sparkles style={{ width: '22px', height: '22px' }} />}
      maxWidth="900px"
    >
      {/* Notifications */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
        <div className="section-heading" style={{ marginBottom: '24px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255, 126, 95, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255, 126, 95, 0.2)' }}>
            <Bell style={{ width: '15px', height: '15px', color: '#ff7e5f' }} />
          </div>
          Notifications
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div className="data-table-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '12px' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#f8fafc' }}>Email Notifications</p>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Receive updates and alerts via email</p>
            </div>
            <Toggle checked={notifications.email} onChange={e => setNotifications({ ...notifications, email: e.target.checked })} />
          </div>
          <div className="data-table-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '12px' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#f8fafc' }}>Webhook Alerts</p>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Send real-time alerts to configured webhooks</p>
            </div>
            <Toggle checked={notifications.webhook} onChange={e => setNotifications({ ...notifications, webhook: e.target.checked })} />
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
        <div className="section-heading" style={{ marginBottom: '24px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <Globe style={{ width: '15px', height: '15px', color: '#8b5cf6' }} />
          </div>
          Language & Region
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Interface Language</label>
          <select value={language} onChange={e => setLanguage(e.target.value)} className="select-field" style={{ maxWidth: '300px' }}>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="ja">Japanese</option>
          </select>
        </div>
      </div>

      {/* Data */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
        <div className="section-heading" style={{ marginBottom: '24px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(251, 191, 36, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
            <Download style={{ width: '15px', height: '15px', color: '#f59e0b' }} />
          </div>
          Data Management
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn-secondary" style={{ fontSize: '13px', padding: '10px 20px' }}>
            <Download style={{ width: '14px', height: '14px' }} /> Export All Data
          </button>
          <button className="btn-secondary" style={{ fontSize: '13px', padding: '10px 20px' }}>
            <FileText style={{ width: '14px', height: '14px' }} /> Download Logs
          </button>
        </div>
        <p style={{ fontSize: '11px', color: '#475569', marginTop: '12px' }}>Data exports include all your content types, entries, and settings.</p>
      </div>

      {/* Danger Zone */}
      <div className="glass-card" style={{ padding: '28px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <div className="section-heading" style={{ marginBottom: '20px', color: '#fca5a5' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <Shield style={{ width: '15px', height: '15px', color: '#fca5a5' }} />
          </div>
          Danger Zone
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(8, 5, 17, 0.4)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.08)' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#f8fafc' }}>Delete Account</p>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Permanently delete your account and all associated data</p>
            </div>
            <button className="btn-danger" style={{ padding: '8px 18px', fontSize: '12px' }}>Delete</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(8, 5, 17, 0.4)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.08)' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#f8fafc' }}>Revoke All API Keys</p>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Invalidate all active API keys immediately</p>
            </div>
            <button className="btn-danger" style={{ padding: '8px 18px', fontSize: '12px' }}>Revoke</button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
