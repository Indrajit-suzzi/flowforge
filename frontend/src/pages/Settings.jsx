import { useState, useEffect } from 'react';
import { FileText, Bell, Globe, Shield, Download, Sparkles, Palette, RotateCcw } from 'lucide-react';
import api from '../utils/api';
import PageShell from '../components/PageShell';

function Toggle({ checked, onChange, label }) {
  return (
    <label className="toggle" onClick={(e) => e.stopPropagation()} aria-label={label}>
      <input type="checkbox" checked={checked} onChange={onChange} aria-hidden="true" />
      <span className={`toggle-track ${checked ? 'on' : ''}`} />
      <span className={`toggle-thumb ${checked ? 'on' : ''}`} />
    </label>
  );
}

function ConfirmDialog({ open, title, message, confirmLabel, confirmClass, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onCancel}>
      <div className="glass-card" style={{ maxWidth: '420px', width: '90%', padding: '32px' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#f8fafc', marginBottom: '8px', fontFamily: "'Outfit', sans-serif" }}>{title}</h3>
        <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '24px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} className="btn-secondary" style={{ padding: '10px 20px', fontSize: '13px' }}>Cancel</button>
          <button onClick={onConfirm} className={confirmClass || 'btn-danger'} style={{ padding: '10px 20px', fontSize: '13px' }}>{confirmLabel || 'Confirm'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const [notifications, setNotifications] = useState({ email: true, webhook: false });
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState({ primaryColor: '#ff7e5f', accentColor: '#8b5cf6', borderRadius: 12, fontFamily: 'Outfit', logoUrl: '', customCss: '' });
  const [savingTheme, setSavingTheme] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    api.get('/api/v1/users/me').then(r => {
      const p = r.data.preferences || {};
      if (p.language) setLanguage(p.language);
      if (p.notifications) setNotifications({ email: true, webhook: false, ...p.notifications });
    }).catch(() => {});
    api.get('/api/v1/theme').then(r => setTheme(r.data || theme)).catch(() => {});
  }, [theme]);

  const savePreferences = async () => {
    setSavingPrefs(true);
    try {
      await api.put('/api/v1/users/me', { preferences: { language, notifications } });
    } finally {
      setSavingPrefs(false);
    }
  };

  const saveTheme = async () => {
    setSavingTheme(true);
    try {
      await api.put('/api/v1/theme', theme);
    } finally {
      setSavingTheme(false);
    }
  };

  const exportData = async () => {
    setExporting(true);
    try {
      const { data } = await api.get('/api/v1/stats/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flowforge-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const downloadLogs = async () => {
    try {
      const { data } = await api.get('/api/v1/audit-logs/export/csv');
      const blob = new Blob([data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* ignore */ }
  };

  const handleConfirm = () => {
    if (!confirm) return;
    confirm.action();
    setConfirm(null);
  };

  return (
    <PageShell
      title="Settings"
      subtitle="Manage your preferences and account settings"
      icon={<Sparkles style={{ width: '22px', height: '22px' }} />}
      maxWidth="900px"
    >
      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.label}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />

      {/* Notifications */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
        <div className="section-heading" style={{ marginBottom: '24px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255, 126, 95, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255, 126, 95, 0.2)' }}>
            <Bell style={{ width: '15px', height: '15px', color: '#ff7e5f' }} />
          </div>
          Notifications
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
          <div className="data-table-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '12px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#f8fafc' }}>Email Notifications</p>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Receive updates and alerts via email</p>
            </div>
            <Toggle checked={notifications.email} onChange={e => setNotifications({ ...notifications, email: e.target.checked })} label="Toggle email notifications" />
          </div>
          <div className="data-table-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '12px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#f8fafc' }}>Webhook Alerts</p>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Send real-time alerts to configured webhooks</p>
            </div>
            <Toggle checked={notifications.webhook} onChange={e => setNotifications({ ...notifications, webhook: e.target.checked })} label="Toggle webhook alerts" />
          </div>
        </div>
        <button onClick={savePreferences} disabled={savingPrefs} className="btn-primary" style={{ border: 'none' }}>
          {savingPrefs ? 'Saving...' : 'Save Preferences'}
        </button>
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
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select value={language} onChange={e => setLanguage(e.target.value)} className="select-field" style={{ maxWidth: '300px' }}>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
            </select>
            <button onClick={() => api.put('/api/v1/users/me', { preferences: { language, notifications } })} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '12px' }}>Apply</button>
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
        <div className="section-heading" style={{ marginBottom: '24px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,126,95,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,126,95,0.2)' }}>
            <Palette style={{ width: '15px', height: '15px', color: '#ff7e5f' }} />
          </div>
          Branding
        </div>
        <div className="grid-2" style={{ marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Primary Color</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="color" value={theme.primaryColor} onChange={e => setTheme({ ...theme, primaryColor: e.target.value })} style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', background: 'transparent' }} />
              <input type="text" value={theme.primaryColor} onChange={e => setTheme({ ...theme, primaryColor: e.target.value })} className="input-field" style={{ flex: 1 }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Accent Color</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="color" value={theme.accentColor} onChange={e => setTheme({ ...theme, accentColor: e.target.value })} style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', background: 'transparent' }} />
              <input type="text" value={theme.accentColor} onChange={e => setTheme({ ...theme, accentColor: e.target.value })} className="input-field" style={{ flex: 1 }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Border Radius</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="range" min="4" max="24" value={theme.borderRadius} onChange={e => setTheme({ ...theme, borderRadius: Number(e.target.value) })} style={{ flex: 1, accentColor: theme.primaryColor }} />
              <span style={{ fontSize: '13px', color: '#e2e8f0', minWidth: '30px' }}>{theme.borderRadius}px</span>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Font Family</label>
            <select value={theme.fontFamily} onChange={e => setTheme({ ...theme, fontFamily: e.target.value })} className="select-field">
              <option value="Outfit">Outfit</option>
              <option value="Inter">Inter</option>
              <option value="DM Sans">DM Sans</option>
              <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Logo URL (optional)</label>
            <input type="text" value={theme.logoUrl} onChange={e => setTheme({ ...theme, logoUrl: e.target.value })} placeholder="https://example.com/logo.png" className="input-field" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Custom CSS</label>
            <textarea value={theme.customCss} onChange={e => setTheme({ ...theme, customCss: e.target.value })} placeholder="--bg-dark: #0a0a0a;" className="input-field" style={{ minHeight: '80px', fontFamily: 'monospace', fontSize: '12px', resize: 'vertical' }} />
          </div>
        </div>
        <div style={{ marginBottom: '16px', padding: '16px', background: 'rgba(8,5,17,0.4)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>Preview</p>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: `${Math.min(12, theme.borderRadius)}px`, background: theme.primaryColor }} />
            <div style={{ width: '24px', height: '24px', borderRadius: `${Math.min(12, theme.borderRadius)}px`, background: theme.accentColor }} />
            <span style={{ fontSize: '14px', color: '#94a3b8', fontFamily: `'${theme.fontFamily}', sans-serif` }}>Aa</span>
          </div>
        </div>
        <button onClick={saveTheme} disabled={savingTheme} className="btn-primary" style={{ border: 'none' }}>
          {savingTheme ? 'Saving...' : 'Save Branding'}
        </button>
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
          <button onClick={exportData} disabled={exporting} className="btn-secondary" style={{ fontSize: '13px', padding: '10px 20px' }}>
            <Download style={{ width: '14px', height: '14px' }} /> {exporting ? 'Exporting...' : 'Export All Data'}
          </button>
          <button onClick={downloadLogs} className="btn-secondary" style={{ fontSize: '13px', padding: '10px 20px' }}>
            <FileText style={{ width: '14px', height: '14px' }} /> Download Logs
          </button>
          <button onClick={() => api.get('/api/v1/stats/seed').catch(() => {})} className="btn-secondary" style={{ fontSize: '13px', padding: '10px 20px' }}>
            <RotateCcw style={{ width: '14px', height: '14px' }} /> Re-seed Demo Data
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(8, 5, 17, 0.4)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.08)', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#f8fafc' }}>Delete Account</p>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Permanently delete your account and all associated data</p>
            </div>
            <button onClick={() => setConfirm({ title: 'Delete Account', message: 'This will permanently delete your account and all associated data. This action cannot be undone.', label: 'Delete', action: async () => { await api.delete('/api/v1/users/me'); window.location.href = '/sign-in'; } })} className="btn-danger" style={{ padding: '8px 18px', fontSize: '12px' }}>Delete</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(8, 5, 17, 0.4)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.08)', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#f8fafc' }}>Revoke All API Keys</p>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Invalidate all active API keys immediately</p>
            </div>
            <button onClick={() => setConfirm({ title: 'Revoke All API Keys', message: 'This will invalidate all active API keys. Any services using these keys will lose access immediately.', label: 'Revoke', action: async () => { await api.post('/api/v1/users/me/revoke-keys'); } })} className="btn-danger" style={{ padding: '8px 18px', fontSize: '12px' }}>Revoke</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(8, 5, 17, 0.4)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.08)', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#f8fafc' }}>Reset Scheduler</p>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Clear all scheduled publish/unpublish jobs</p>
            </div>
            <button onClick={() => setConfirm({ title: 'Reset Scheduler', message: 'This will clear all scheduled publish and unpublish jobs. Entries will remain in their current state.', label: 'Reset', action: async () => { await api.post('/api/v1/calendar/clear'); } })} className="btn-danger" style={{ padding: '8px 18px', fontSize: '12px' }}>Clear</button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
