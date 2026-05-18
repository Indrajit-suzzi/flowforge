import { useState, useEffect } from 'react';
import { Plus, Trash2, Shield, User, UserCheck, Ban, Edit2 } from 'lucide-react';
import api from '../utils/api';
import LoadingScreen from '../components/LoadingScreen';
import LoadingButton from '../components/LoadingButton';

const roleColors = {
  admin: { bg: '#7f1d1d', text: '#fca5a5', label: 'Admin' },
  subadmin: { bg: '#1e3a5f', text: '#60a5fa', label: 'Sub Admin' },
  user: { bg: '#064e3b', text: '#34d399', label: 'User' }
};

const permissionLabels = {
  contentTypes: 'Content Types',
  contentEntries: 'Content Entries',
  apiKeys: 'API Keys',
  analytics: 'Analytics',
  auditLogs: 'Audit Logs',
  webhooks: 'Webhooks',
  mediaLibrary: 'Media Library',
  userManagement: 'User Management',
  systemSettings: 'System Settings'
};

export default function UsersRoles() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'user' });
  const [showPermissions, setShowPermissions] = useState(null);

  useEffect(() => {
    api.get('/api/v1/users').then(r => { setUsers(r.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingUser) {
        await api.put(`/api/v1/users/${editingUser._id}`, { role: form.role });
      } else {
        await api.post('/api/v1/users', form);
      }
      setForm({ username: '', email: '', password: '', role: 'user' });
      setShowForm(false);
      setEditingUser(null);
      const r = await api.get('/api/v1/users');
      setUsers(r.data || []);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    await api.delete(`/api/v1/users/${id}`);
    setUsers(users.filter(u => u._id !== id));
  };

  const toggleActive = async (user) => {
    await api.put(`/api/v1/users/${user._id}`, { isActive: !user.isActive });
    setUsers(users.map(u => u._id === user._id ? { ...u, isActive: !u.isActive } : u));
  };

  const updatePermission = async (userId, permission, value) => {
    const user = users.find(u => u._id === userId);
    const newPermissions = { ...user.permissions, [permission]: value };
    await api.put(`/api/v1/users/${userId}`, { permissions: newPermissions });
    setUsers(users.map(u => u._id === userId ? { ...u, permissions: newPermissions } : u));
  };

  if (loading) return <LoadingScreen message="Loading users" />;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9' }}>Users & Roles</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Manage users and their permissions</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingUser(null); setForm({ username: '', email: '', password: '', role: 'user' }); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: 'white', background: 'linear-gradient(90deg, #3b82f6, #6366f1)', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
          <Plus style={{ width: '14px', height: '14px' }} /> Add User
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px' }}>{editingUser ? 'Edit User' : 'Create User'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: editingUser ? '1fr 1fr' : '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Username" style={{ padding: '10px 12px', background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px' }} required disabled={!!editingUser} />
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" style={{ padding: '10px 12px', background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px' }} required disabled={!!editingUser} />
              {!editingUser && <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Password" type="password" style={{ padding: '10px 12px', background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px' }} required />}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ padding: '10px 12px', background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px' }}>
                <option value="user">User</option>
                <option value="subadmin">Sub Admin</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <LoadingButton type="submit" loading={saving}>{editingUser ? 'Update' : 'Create'}</LoadingButton>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #334155', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b', display: 'grid', gridTemplateColumns: '200px 120px 100px 100px 100px', gap: '12px', fontSize: '11px', color: '#475569', textTransform: 'uppercase' }}>
          <span>User</span>
          <span>Role</span>
          <span>Status</span>
          <span>Permissions</span>
          <span>Actions</span>
        </div>
        {users.map(u => (
          <div key={u._id} style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b', display: 'grid', gridTemplateColumns: '200px 120px 100px 100px 100px', gap: '12px', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '13px', color: '#f1f5f9', fontWeight: '500' }}>{u.username}</p>
              <p style={{ fontSize: '11px', color: '#475569' }}>{u.email}</p>
            </div>
            <span style={{ padding: '3px 8px', borderRadius: '4px', background: roleColors[u.role]?.bg, color: roleColors[u.role]?.text, fontSize: '11px', display: 'inline-block', width: 'fit-content' }}>{roleColors[u.role]?.label}</span>
            <span style={{ padding: '3px 8px', borderRadius: '4px', background: u.isActive ? '#064e3b' : '#7f1d1d', color: u.isActive ? '#34d399' : '#fca5a5', fontSize: '11px', display: 'inline-block', width: 'fit-content' }}>{u.isActive ? 'Active' : 'Disabled'}</span>
            <button onClick={() => setShowPermissions(showPermissions === u._id ? null : u._id)} style={{ padding: '4px 8px', background: '#1e293b', border: 'none', borderRadius: '4px', color: '#94a3b8', cursor: 'pointer', fontSize: '11px' }}>
              <Shield style={{ width: '12px', height: '12px', display: 'inline', marginRight: '4px' }} /> View
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { setEditingUser(u); setForm({ ...u, password: '' }); setShowForm(true); }} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><Edit2 style={{ width: '14px', height: '14px' }} /></button>
              <button onClick={() => toggleActive(u)} style={{ background: 'transparent', border: 'none', color: u.isActive ? '#f59e0b' : '#10b981', cursor: 'pointer' }}>{u.isActive ? <Ban style={{ width: '14px', height: '14px' }} /> : <UserCheck style={{ width: '14px', height: '14px' }} />}</button>
              <button onClick={() => handleDelete(u._id)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><Trash2 style={{ width: '14px', height: '14px' }} /></button>
            </div>
          </div>
        ))}
      </div>

      {showPermissions && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setShowPermissions(null)}>
          <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', maxWidth: '400px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px' }}>Permissions</h3>
            {Object.entries(permissionLabels).map(([key, label]) => {
              const user = users.find(u => u._id === showPermissions);
              const canEdit = user?.role === 'admin';
              return (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1e293b' }}>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>{label}</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: canEdit ? 'pointer' : 'not-allowed' }}>
                    <input type="checkbox" checked={user?.permissions[key] || false} onChange={e => canEdit && updatePermission(showPermissions, key, e.target.checked)} disabled={!canEdit} style={{ accentColor: '#3b82f6' }} />
                    <span style={{ fontSize: '12px', color: user?.permissions[key] ? '#34d399' : '#64748b' }}>{user?.permissions[key] ? 'Yes' : 'No'}</span>
                  </label>
                </div>
              );
            })}
            <button onClick={() => setShowPermissions(null)} style={{ marginTop: '16px', width: '100%', padding: '10px', background: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}