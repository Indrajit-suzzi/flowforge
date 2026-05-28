import { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Edit2, Check, X, Save } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import Field, { fieldClass } from '../components/Field';
import { SkeletonTable } from '../components/Skeleton';
import { validate } from '../utils/validate';
import api from '../utils/api';
import LoadingButton from '../components/LoadingButton';
import PageShell from '../components/PageShell';

const allFeatures = [
  { key: 'contentTypes', label: 'Content Types' },
  { key: 'contentEntries', label: 'Content Entries' },
  { key: 'apiKeys', label: 'API Keys' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'auditLogs', label: 'Audit Logs' },
  { key: 'webhooks', label: 'Webhooks' },
  { key: 'mediaLibrary', label: 'Media Library' },
  { key: 'userManagement', label: 'User Management' },
  { key: 'systemSettings', label: 'System Settings' },
  { key: 'roles', label: 'Roles' },
];

export default function Roles() {
  const toast = useToast();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', permissions: {} });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    api.get('/api/v1/roles').then(r => {
      setRoles(r.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form, { name: { required: true, label: 'Name' }, slug: { required: true, label: 'Slug', pattern: /^[a-z0-9-]+$/, patternMessage: 'Slug must be lowercase letters, numbers, and hyphens' } });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/api/v1/roles/${editing._id}`, form);
      } else {
        await api.post('/api/v1/roles', form);
      }
      setShowForm(false);
      setEditing(null);
      const r = await api.get('/api/v1/roles');
      setRoles(r.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role) => {
    if (role.isSystem) { toast.warning('Cannot delete system roles'); return; }
    if (!confirm(`Delete role "${role.name}"?`)) return;
    try {
      await api.delete(`/api/v1/roles/${role._id}`);
      setRoles(roles.filter(r => r._id !== role._id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete role');
    }
  };

  const startEdit = (role) => {
    setEditing(role);
    setForm({
      name: role.name,
      slug: role.slug,
      description: role.description || '',
      permissions: role.permissions || {}
    });
    setShowForm(true);
  };

  const togglePermission = (key) => {
    setForm({ ...form, permissions: { ...form.permissions, [key]: !form.permissions[key] } });
  };

  return (
    <PageShell
      title="Roles"
      subtitle="Define custom roles and permissions"
      icon={<Shield style={{ width: '22px', height: '22px' }} />}
      actions={
        <button onClick={() => { setEditing(null); setForm({ name: '', slug: '', description: '', permissions: {} }); setShowForm(true); }} className="btn-primary" style={{ padding: '9px 18px', fontSize: '13px' }}>
          <Plus style={{ width: '14px', height: '14px' }} /> New Role
        </button>
      }
    >
      {showForm && (
        <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)", marginBottom: '20px' }}>
            {editing ? 'Edit Role' : 'Create Role'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid-2" style={{ marginBottom: '20px' }}>
              <Field label="Role Name" error={errors.name} required>
                <input value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: '' }); }} placeholder="Enter role name" className={fieldClass(errors.name)} />
              </Field>
              <Field label="Slug" error={errors.slug} required>
                <input value={form.slug} onChange={e => { setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s/g, '-') }); setErrors({ ...errors, slug: '' }); }} placeholder="role-slug" className={fieldClass(errors.slug)} disabled={editing?.isSystem} />
              </Field>
            </div>
            <Field label="Description">
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description (optional)" className="input-field" style={{ width: '100%' }} />
            </Field>

            <p style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Permissions</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px', marginBottom: '20px' }}>
              {allFeatures.map(f => (
                <label key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'rgba(8,5,17,0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.permissions[f.key] || false} onChange={() => togglePermission(f.key)} style={{ accentColor: '#ff7e5f' }} />
                  <span style={{ fontSize: '13px', color: '#e2e8f0' }}>{f.label}</span>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <LoadingButton type="submit" loading={saving} className="btn-primary" style={{ border: 'none' }}>
                <Save style={{ width: '14px', height: '14px' }} /> {editing ? 'Update' : 'Create'}
              </LoadingButton>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <SkeletonTable rows={4} />
      ) : roles.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
          <p className="empty-state-text">No roles defined</p>
          <button onClick={() => { setEditing(null); setForm({ name: '', slug: '', description: '', permissions: {} }); setShowForm(true); }} className="btn-primary" style={{ marginTop: '16px' }}>Create Role</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {roles.map(role => (
            <div key={role._id} className="glass-card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,126,95,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,126,95,0.2)' }}>
                    <Shield style={{ width: '16px', height: '16px', color: role.isSystem ? '#60a5fa' : '#ff7e5f' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>
                      {role.name}
                      {role.isSystem && <span style={{ marginLeft: '8px', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', fontWeight: '600' }}>System</span>}
                    </h3>
                    {role.description && <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{role.description}</p>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => startEdit(role)} className="btn-ghost" style={{ padding: '6px' }}>
                    <Edit2 style={{ width: '14px', height: '14px' }} />
                  </button>
                  {!role.isSystem && (
                    <button onClick={() => handleDelete(role)} className="btn-ghost" style={{ padding: '6px', color: '#fca5a5' }}>
                      <Trash2 style={{ width: '14px', height: '14px' }} />
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {allFeatures.map(f => {
                  const enabled = role.permissions?.[f.key];
                  return (
                    <span key={f.key} style={{
                      padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                      background: enabled ? 'rgba(16,185,129,0.12)' : 'rgba(100,116,139,0.08)',
                      color: enabled ? '#34d399' : '#475569',
                      border: enabled ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.04)'
                    }}>
                      {enabled ? <Check style={{ width: '10px', height: '10px', display: 'inline', marginRight: '4px' }} /> : <X style={{ width: '10px', height: '10px', display: 'inline', marginRight: '4px' }} />}
                      {f.label}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
