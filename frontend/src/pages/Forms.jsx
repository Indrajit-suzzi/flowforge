import { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Eye, List, FileText, ArrowLeft } from 'lucide-react';
import api from '../utils/api';
import LoadingButton from '../components/LoadingButton';
import PageShell from '../components/PageShell';

const fieldTypes = ['text', 'textarea', 'email', 'number', 'select', 'checkbox', 'radio'];

export default function Forms() {
  const [forms, setForms] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewSubmissions, setViewSubmissions] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [form, setForm] = useState({
    name: '', slug: '', description: '', fields: [],
    submitButtonText: 'Submit', successMessage: 'Thank you!', notificationEmail: ''
  });
  const [newField, setNewField] = useState({ name: '', type: 'text', label: '', placeholder: '', required: false, options: '' });

  useEffect(() => {
    api.get('/api/v1/forms').then(r => { setForms(r.data || []); }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (editingId) {
        await api.put(`/api/v1/forms/${editingId}`, payload);
      } else {
        await api.post('/api/v1/forms', payload);
      }
      setForm({ name: '', slug: '', description: '', fields: [], submitButtonText: 'Submit', successMessage: 'Thank you!', notificationEmail: '' });
      setShowForm(false);
      setEditingId(null);
      const r = await api.get('/api/v1/forms');
      setForms(r.data || []);
    } finally {
      setSaving(false);
    }
  };

  const addField = () => {
    if (!newField.name || !newField.label) return;
    const field = {
      name: newField.name,
      type: newField.type,
      label: newField.label,
      placeholder: newField.placeholder,
      required: newField.required,
      options: newField.type === 'select' || newField.type === 'radio' || newField.type === 'checkbox'
        ? newField.options.split(',').map(s => s.trim()).filter(Boolean)
        : []
    };
    setForm({ ...form, fields: [...form.fields, field] });
    setNewField({ name: '', type: 'text', label: '', placeholder: '', required: false, options: '' });
  };

  const removeField = (i) => {
    setForm({ ...form, fields: form.fields.filter((_, j) => j !== i) });
  };

  const loadSubmissions = async (formId) => {
    const r = await api.get(`/api/v1/forms/${formId}/submissions`);
    setSubmissions(r.data.data || []);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this form and all submissions?')) return;
    await api.delete(`/api/v1/forms/${id}`);
    setForms(forms.filter(f => f._id !== id));
  };

  return (
    <PageShell
      title="Forms"
      subtitle="Build and manage forms for your websites"
      icon={<FileText style={{ width: '22px', height: '22px' }} />}
      iconColor="#34d399"
      actions={
        <button onClick={() => { setEditingId(null); setForm({ name: '', slug: '', description: '', fields: [], submitButtonText: 'Submit', successMessage: 'Thank you!', notificationEmail: '' }); setShowForm(true); }} className="btn-primary" style={{ padding: '9px 18px', fontSize: '13px' }}>
          <Plus style={{ width: '14px', height: '14px' }} /> New Form
        </button>
      }
    >
      {showForm && (
        <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)", marginBottom: '20px' }}>
            {editingId ? 'Edit Form' : 'Create Form'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid-2" style={{ marginBottom: '16px' }}>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: editingId ? form.slug : e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="Form name" className="input-field" required />
              <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="slug" className="input-field" required />
            </div>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description (optional)" className="input-field" style={{ marginBottom: '16px' }} />

            <div style={{ marginBottom: '16px', padding: '16px', background: 'rgba(8,5,17,0.4)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Form Fields</label>
              {form.fields.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <GripVertical style={{ width: '12px', height: '12px', color: '#475569', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#e2e8f0', minWidth: '80px' }}>{f.label}</span>
                  <code style={{ fontSize: '10px', color: '#64748b' }}>{f.type}</code>
                  {f.required && <span style={{ fontSize: '10px', color: '#fca5a5' }}>required</span>}
                  <span style={{ fontSize: '10px', color: '#475569', marginLeft: 'auto' }}>{f.name}</span>
                  <button type="button" onClick={() => removeField(i)} className="btn-ghost" style={{ padding: '4px', color: '#fca5a5' }}>
                    <Trash2 style={{ width: '12px', height: '12px' }} />
                  </button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input value={newField.name} onChange={e => setNewField({ ...newField, name: e.target.value })} placeholder="Field name" className="input-field" style={{ width: '140px' }} />
                <input value={newField.label} onChange={e => setNewField({ ...newField, label: e.target.value })} placeholder="Label" className="input-field" style={{ width: '140px' }} />
                <select value={newField.type} onChange={e => setNewField({ ...newField, type: e.target.value })} className="select-field" style={{ width: '110px' }}>
                  {fieldTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input value={newField.placeholder} onChange={e => setNewField({ ...newField, placeholder: e.target.value })} placeholder="Placeholder" className="input-field" style={{ width: '120px' }} />
                {(newField.type === 'select' || newField.type === 'radio' || newField.type === 'checkbox') && (
                  <input value={newField.options} onChange={e => setNewField({ ...newField, options: e.target.value })} placeholder="Option1,Option2" className="input-field" style={{ width: '160px' }} />
                )}
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b', cursor: 'pointer' }}>
                  <input type="checkbox" checked={newField.required} onChange={e => setNewField({ ...newField, required: e.target.checked })} style={{ accentColor: '#ff7e5f' }} /> Req
                </label>
                <button type="button" onClick={addField} className="btn-secondary" style={{ padding: '8px 14px' }}>Add</button>
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: '16px' }}>
              <input value={form.submitButtonText} onChange={e => setForm({ ...form, submitButtonText: e.target.value })} placeholder="Submit button text" className="input-field" />
              <input value={form.successMessage} onChange={e => setForm({ ...form, successMessage: e.target.value })} placeholder="Success message" className="input-field" />
            </div>
            <input value={form.notificationEmail} onChange={e => setForm({ ...form, notificationEmail: e.target.value })} placeholder="Notification email (optional)" type="email" className="input-field" style={{ marginBottom: '16px' }} />

            <div style={{ display: 'flex', gap: '12px' }}>
              <LoadingButton type="submit" loading={saving} className="btn-primary" style={{ border: 'none' }}>
                {editingId ? 'Update' : 'Create'}
              </LoadingButton>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {forms.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
          <p className="empty-state-text">No forms yet</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">Create Form</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {forms.map(f => (
            <div key={f._id} className="glass-card-sm" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <FileText style={{ width: '14px', height: '14px', color: '#34d399' }} />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>{f.name}</span>
                    <span className={`badge ${f.isActive ? 'badge-active' : 'badge-inactive'}`}>{f.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <code style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace', marginTop: '4px', display: 'block' }}>/{f.slug}</code>
                  {f.description && <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>{f.description}</p>}
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => { setViewSubmissions(f); loadSubmissions(f._id); }} className="btn-ghost" style={{ padding: '8px' }} title="View submissions">
                    <List style={{ width: '14px', height: '14px' }} />
                  </button>
                  <button onClick={() => { setEditingId(f._id); setForm({ name: f.name, slug: f.slug, description: f.description || '', fields: f.fields || [], submitButtonText: f.submitButtonText || 'Submit', successMessage: f.successMessage || 'Thank you!', notificationEmail: f.notificationEmail || '' }); setShowForm(true); }} className="btn-ghost" style={{ padding: '8px' }} title="Edit">
                    <Eye style={{ width: '14px', height: '14px' }} />
                  </button>
                  <button onClick={() => handleDelete(f._id)} className="btn-ghost" style={{ padding: '8px', color: '#fca5a5' }}>
                    <Trash2 style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#64748b' }}>
                <span>{f.fields?.length || 0} fields</span>
                <span>{f.submissionCount || 0} submissions</span>
                <span>POST /api/v1/forms/submit/{f.slug}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewSubmissions && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '800px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>Submissions — {viewSubmissions.name}</h2>
              <button onClick={() => setViewSubmissions(null)} className="btn-ghost" style={{ padding: '8px' }}><ArrowLeft style={{ width: '16px', height: '16px' }} /></button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
              {submissions.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '40px', fontSize: '13px' }}>No submissions yet.</p>
              ) : (
                submissions.map(s => (
                  <div key={s._id} style={{ padding: '14px', background: 'rgba(8,5,17,0.3)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#475569' }}>{new Date(s.createdAt).toLocaleString()}</span>
                      {s.ipAddress && <span style={{ fontSize: '10px', color: '#475569' }}>{s.ipAddress}</span>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {Object.entries(s.data || {}).map(([key, val]) => (
                        <div key={key} style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                          <span style={{ color: '#94a3b8', minWidth: '100px', fontWeight: '500' }}>{key}:</span>
                          <span style={{ color: '#e2e8f0', wordBreak: 'break-word' }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
