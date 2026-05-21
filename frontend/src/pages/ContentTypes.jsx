import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ArrowLeft, LayoutTemplate, Search, Layers, Sparkles } from 'lucide-react';
import api from '../utils/api';
import LoadingButton from '../components/LoadingButton';
import PageShell from '../components/PageShell';
import FilterBar from '../components/FilterBar';

export default function ContentTypes() {
  const [contentTypes, setContentTypes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', fields: [] });
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('String');
  const [search, setSearch] = useState('');

  useEffect(() => { 
    setLoading(true);
    Promise.all([
      api.get('/api/v1/content-types').then(r => r.data || []),
      api.get('/api/v1/content-types/templates').then(r => r.data || [])
    ]).then(([cts, temps]) => {
      setContentTypes(cts);
      setTemplates(temps);
      setLoading(false);
    }).catch(() => setLoading(false)); 
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/v1/content-types', form);
      setForm({ name: '', slug: '', fields: [] });
      setShowForm(false);
      const r = await api.get('/api/v1/content-types');
      setContentTypes(r.data || []);
    } finally {
      setSaving(false);
    }
  };

  const handleTemplate = async (templateSlug) => {
    setSaving(true);
    try {
      await api.post('/api/v1/content-types/from-template', { templateSlug });
      setShowTemplates(false);
      const r = await api.get('/api/v1/content-types');
      setContentTypes(r.data || []);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this content type?')) return;
    await api.delete(`/api/v1/content-types/${id}`);
    const r = await api.get('/api/v1/content-types');
    setContentTypes(r.data || []);
  };

  const addField = () => {
    if (!fieldName) return;
    setForm({ ...form, fields: [...form.fields, { name: fieldName, type: fieldType, required: false }] });
    setFieldName('');
  };

  const filtered = contentTypes.filter(ct => 
    ct.name.toLowerCase().includes(search.toLowerCase()) || 
    ct.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageShell
      title="Content Types"
      subtitle="Define schemas for your content"
      icon={<Layers style={{ width: '22px', height: '22px' }} />}
      actions={
        <>
          <button onClick={() => setShowTemplates(true)} className="btn-secondary" style={{ padding: '9px 18px', fontSize: '13px' }}>
            <LayoutTemplate style={{ width: '14px', height: '14px' }} /> From Template
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary" style={{ padding: '9px 18px', fontSize: '13px' }}>
            <Plus style={{ width: '14px', height: '14px' }} /> New Content Type
          </button>
        </>
      }
    >
      {/* Templates Modal */}
      {showTemplates && (
        <div className="modal-overlay" onClick={() => setShowTemplates(false)}>
          <div className="glass-card modal-content" style={{ padding: '28px', maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)", marginBottom: '20px' }}>Choose a Template</h3>
            <div className="grid-auto-fill" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              {templates.map(t => (
                <button key={t.slug} onClick={() => handleTemplate(t.slug)} className="glass-card-sm" style={{ padding: '16px', cursor: 'pointer', textAlign: 'left', background: 'rgba(8, 5, 17, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>{t.name}</p>
                  <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{t.description}</p>
                  <p style={{ fontSize: '10px', color: '#475569', marginTop: '8px' }}>{t.fields.length} fields</p>
                </button>
              ))}
            </div>
            <button onClick={() => setShowTemplates(false)} className="btn-secondary" style={{ marginTop: '20px', width: '100%', justifyContent: 'center' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)", marginBottom: '20px' }}>Create Content Type</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid-2" style={{ marginBottom: '16px' }}>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" className="input-field" required />
              <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s/g, '-') })} placeholder="Slug" className="input-field" required />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input value={fieldName} onChange={e => setFieldName(e.target.value)} placeholder="Field name" className="input-field" style={{ flex: 1 }} />
              <select value={fieldType} onChange={e => setFieldType(e.target.value)} className="select-field">
                {['String', 'Number', 'Date', 'Boolean', 'RichText'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button type="button" onClick={addField} className="btn-secondary" style={{ padding: '10px 16px' }}>Add</button>
            </div>
            {form.fields.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {form.fields.map((f, i) => (
                  <span key={i} className="glass-card-sm" style={{ padding: '4px 10px', fontSize: '12px', color: '#e2e8f0', borderRadius: '8px' }}>
                    {f.name} <span style={{ color: '#64748b' }}>({f.type})</span>
                  </span>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <LoadingButton type="submit" loading={saving} className="btn-primary" style={{ border: 'none' }}>Create</LoadingButton>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search content types..."
        searchWidth="300px"
        filters={[]}
      />

      {/* Content Types List */}
      {filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
          <p className="empty-state-text">{search ? 'No matching content types' : 'No content types yet'}</p>
          {!search && <button onClick={() => setShowForm(true)} className="btn-primary">Create Content Type</button>}
        </div>
      ) : (
        <div className="grid-auto-fill">
          {filtered.map((ct) => (
            <div key={ct._id} className="glass-card-sm" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255, 126, 95, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', border: '1px solid rgba(255, 126, 95, 0.2)' }}>
                  <Layers style={{ width: '16px', height: '16px', color: '#ff7e5f' }} />
                </div>
                <button onClick={() => handleDelete(ct._id)} className="btn-ghost" style={{ padding: '6px' }}>
                  <Trash2 style={{ width: '14px', height: '14px' }} />
                </button>
              </div>
              <Link to={`/content/${ct.slug}`} style={{ textDecoration: 'none' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>{ct.name}</h3>
                <p style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace', marginTop: '4px' }}>/{ct.slug}</p>
              </Link>
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '12px' }}>{ct.fields.length} fields</p>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
