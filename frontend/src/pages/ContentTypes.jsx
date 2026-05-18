import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ArrowLeft, LayoutTemplate, Search } from 'lucide-react';
import api from '../utils/api';
import LoadingScreen from '../components/LoadingScreen';
import LoadingButton from '../components/LoadingButton';

export default function ContentTypes() {
  const [contentTypes, setContentTypes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', fields: [] });
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('String');
  const [search, setSearch] = useState('');

  useEffect(() => { 
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

  if (loading) return <LoadingScreen message="Loading content types" />;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9' }}>Content Types</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Define schemas for your content</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setShowTemplates(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '500', color: '#e2e8f0', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer' }}>
            <LayoutTemplate style={{ width: '14px', height: '14px' }} /> From Template
          </button>
          <button onClick={() => setShowForm(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: 'white', background: 'linear-gradient(90deg, #3b82f6, #6366f1)', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
            <Plus style={{ width: '14px', height: '14px' }} /> New Content Type
          </button>
        </div>
      </div>

      {showTemplates && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setShowTemplates(false)}>
          <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', maxWidth: '700px', width: '100%', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px' }}>Choose a Template</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {templates.map(t => (
                <button key={t.slug} onClick={() => handleTemplate(t.slug)} style={{ background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px', cursor: 'pointer', textAlign: 'left' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>{t.name}</p>
                  <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{t.description}</p>
                  <p style={{ fontSize: '10px', color: '#475569', marginTop: '8px' }}>{t.fields.length} fields</p>
                </button>
              ))}
            </div>
            <button onClick={() => setShowTemplates(false)} style={{ marginTop: '16px', width: '100%', padding: '10px', background: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {showForm && (
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px' }}>Create Content Type</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" style={{ padding: '10px 12px', background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px' }} required />
              <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s/g, '-') })} placeholder="Slug" style={{ padding: '10px 12px', background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px' }} required />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input value={fieldName} onChange={e => setFieldName(e.target.value)} placeholder="Field name" style={{ flex: 1, padding: '10px 12px', background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px' }} />
              <select value={fieldType} onChange={e => setFieldType(e.target.value)} style={{ padding: '10px 12px', background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px' }}>
                {['String', 'Number', 'Date', 'Boolean', 'RichText'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button type="button" onClick={addField} style={{ padding: '10px 16px', background: '#1e293b', border: 'none', borderRadius: '8px', color: '#e2e8f0', cursor: 'pointer' }}>Add</button>
            </div>
            {form.fields.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {form.fields.map((f, i) => (
                  <span key={i} style={{ padding: '4px 10px', background: '#1e293b', borderRadius: '6px', fontSize: '12px', color: '#e2e8f0' }}>
                    {f.name} <span style={{ color: '#64748b' }}>({f.type})</span>
                  </span>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <LoadingButton type="submit" loading={saving}>Create</LoadingButton>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #334155', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <div style={{ position: 'relative', maxWidth: '300px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#475569' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search content types..." style={{ width: '100%', padding: '8px 12px 8px 36px', background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9', fontSize: '13px' }} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '60px', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8', marginBottom: '16px' }}>{search ? 'No matching content types' : 'No content types yet'}</p>
          {!search && <button onClick={() => setShowForm(true)} style={{ padding: '10px 20px', background: 'linear-gradient(90deg, #3b82f6, #6366f1)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Create Content Type</button>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {filtered.map((ct) => (
            <div key={ct._id} style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Link to={`/content/${ct.slug}`} style={{ textDecoration: 'none' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>{ct.name}</h3>
                  <p style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace', marginTop: '4px' }}>/{ct.slug}</p>
                </Link>
                <button onClick={() => handleDelete(ct._id)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><Trash2 style={{ width: '14px', height: '14px' }} /></button>
              </div>
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '12px' }}>{ct.fields.length} fields</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}