import { useState, useEffect } from 'react';
import { Plus, Trash2, Shield, User, Ban, Edit2, Users } from 'lucide-react';
import api from '../utils/api';
import LoadingButton from '../components/LoadingButton';
import { useRole } from '../hooks/useRole';

const roleColors = {
  admin: { bg: 'rgba(255,126,95,0.12)', text: '#ff7e5f', border: 'rgba(255,126,95,0.2)', label: 'Admin' },
  member: { bg: 'rgba(59,130,246,0.12)', text: '#60a5fa', border: 'rgba(59,130,246,0.2)', label: 'Member' },
};

export default function UsersRoles() {
  const { isAdmin } = useRole();
  const [users, setUsers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'member' });

  useEffect(() => {
    api.get('/api/v1/users').then(r => { setUsers(r.data || []); }).catch(() => {});
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
      setForm({ username: '', email: '', password: '', role: 'member' });
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

  if (!isAdmin) {
    return (
      <div className="page-container">
        <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
          <Shield style={{ width: '48px', height: '48px', color: '#475569', marginBottom: '16px' }} />
          <p style={{ color: '#64748b', fontSize: '14px' }}>Only admins can manage users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users style={{ width: '22px', height: '22px', color: '#ff7e5f' }} />
            Users
          </h1>
          <p className="page-subtitle">Manage users and their roles</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingUser(null); setForm({ username: '', email: '', password: '', role: 'member' }); }} className="btn-primary" style={{ padding: '9px 18px', fontSize: '13px' }}>
          <Plus style={{ width: '14px', height: '14px' }} /> Add User
        </button>
      </div>

      {showForm && (
        <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)", marginBottom: '20px' }}>{editingUser ? 'Edit User' : 'Create User'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: editingUser ? '1fr 1fr' : '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Username" className="input-field" required disabled={!!editingUser} />
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" className="input-field" required disabled={!!editingUser} />
              {!editingUser && <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Password" type="password" className="input-field" required />}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="select-field" style={{ width: '200px' }}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <LoadingButton type="submit" loading={saving} className="btn-primary" style={{ border: 'none' }}>{editingUser ? 'Update' : 'Create'}</LoadingButton>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card data-table">
        <div className="data-table-header" style={{ gridTemplateColumns: '1fr 100px 90px 100px' }}>
          <span>User</span>
          <span>Role</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {users.map(u => {
          const rc = roleColors[u.role] || roleColors.member;
          return (
            <div key={u._id} className="data-table-row" style={{ gridTemplateColumns: '1fr 100px 90px 100px' }}>
              <div>
                <p style={{ fontSize: '13px', color: '#f8fafc', fontWeight: '500' }}>{u.username}</p>
                <p style={{ fontSize: '11px', color: '#475569' }}>{u.email}</p>
              </div>
              <span style={{ padding: '3px 8px', borderRadius: '6px', background: rc.bg, color: rc.text, fontSize: '11px', display: 'inline-block', width: 'fit-content', border: `1px solid ${rc.border}` }}>{rc.label}</span>
              <span className={`badge ${u.isActive ? 'badge-active' : 'badge-inactive'}`} style={{ width: 'fit-content' }}>{u.isActive ? 'Active' : 'Disabled'}</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => { setEditingUser(u); setForm({ ...u, password: '' }); setShowForm(true); }} className="btn-ghost" style={{ padding: '6px' }}>
                  <Edit2 style={{ width: '14px', height: '14px' }} />
                </button>
                <button onClick={() => toggleActive(u)} className="btn-ghost" style={{ padding: '6px', color: u.isActive ? '#f59e0b' : '#10b981' }}>
                  {u.isActive ? <Ban style={{ width: '14px', height: '14px' }} /> : <User style={{ width: '14px', height: '14px' }} />}
                </button>
                <button onClick={() => handleDelete(u._id)} className="btn-ghost" style={{ padding: '6px', color: '#fca5a5' }}>
                  <Trash2 style={{ width: '14px', height: '14px' }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
