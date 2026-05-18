import { useState, useEffect } from 'react';
import { User, Mail, Shield, Edit2, Save, X, Eye, EyeOff } from 'lucide-react';
import api from '../utils/api';
import LoadingScreen from '../components/LoadingScreen';
import LoadingButton from '../components/LoadingButton';
import { useAuth } from '../context/AuthContext';

const roleLabels = { admin: 'Admin', subadmin: 'Sub Admin', user: 'User' };
const roleColors = { admin: '#fca5a5', subadmin: '#60a5fa', user: '#34d399' };

export default function Profile() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/api/v1/users/me').then(r => {
      setForm({ username: r.data.username, email: r.data.email, currentPassword: '', newPassword: '' });
      setUser(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/api/v1/users/${user._id}`, { username: form.username });
      setMessage('Profile updated');
      setEditing(false);
      const r = await api.get('/api/v1/users/me');
      setUser(r.data);
    } catch (err) {
      setMessage('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!form.currentPassword || !form.newPassword) {
      setMessage('Enter both passwords');
      return;
    }
    setSaving(true);
    try {
      const loginRes = await api.post('/api/auth/login', { email: form.email, password: form.currentPassword });
      if (loginRes.data.token) {
        await api.put(`/api/v1/users/${user._id}`, { password: form.newPassword });
        setMessage('Password changed');
        setForm({ ...form, currentPassword: '', newPassword: '' });
      }
    } catch (err) {
      setMessage('Current password incorrect');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingScreen message="Loading profile" />;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9' }}>Profile</h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Manage your account details</p>
      </div>

      {message && (
        <div style={{ padding: '12px', borderRadius: '8px', background: message.includes('Failed') || message.includes('incorrect') ? '#7f1d1d' : '#064e3b', border: `1px solid ${message.includes('Failed') || message.includes('incorrect') ? '#991b1b' : '#059669'}`, color: message.includes('Failed') || message.includes('incorrect') ? '#fca5a5' : '#34d399', marginBottom: '20px', fontSize: '13px' }}>
          {message}
        </div>
      )}

      <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9' }}>Account Details</h3>
          <button onClick={() => setEditing(!editing)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: editing ? '#1e293b' : 'transparent', border: '1px solid #334155', borderRadius: '6px', color: '#94a3b8', cursor: 'pointer', fontSize: '12px' }}>
            {editing ? <X style={{ width: '12px', height: '12px' }} /> : <Edit2 style={{ width: '12px', height: '12px' }} />} {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700', color: 'white' }}>
            {form.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9' }}>{form.username}</p>
            <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#1e293b', color: roleColors[user?.role], fontSize: '11px' }}>{roleLabels[user?.role]}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}><User style={{ width: '12px', height: '12px' }} /> Username</label>
            {editing ? (
              <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} style={{ width: '100%', padding: '10px 12px', background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px' }} />
            ) : (
              <p style={{ fontSize: '14px', color: '#f1f5f9' }}>{form.username}</p>
            )}
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}><Mail style={{ width: '12px', height: '12px' }} /> Email</label>
            <p style={{ fontSize: '14px', color: '#f1f5f9' }}>{form.email}</p>
          </div>
        </div>

        {editing && (
          <div style={{ marginTop: '20px' }}>
            <LoadingButton onClick={handleSave} loading={saving}>Save Changes</LoadingButton>
          </div>
        )}
      </div>

      <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', marginBottom: '20px' }}>Change Password</h3>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>Current Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} value={form.currentPassword} onChange={e => setForm({ ...form, currentPassword: e.target.value })} style={{ width: '100%', padding: '10px 40px 10px 12px', background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px' }} />
              <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                {showPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
              </button>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>New Password</label>
            <input type="password" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} style={{ width: '100%', padding: '10px 12px', background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px' }} />
          </div>
          <LoadingButton onClick={handleChangePassword} loading={saving}>Update Password</LoadingButton>
        </div>
      </div>
    </div>
  );
}