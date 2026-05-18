import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, ArrowLeft, Pencil, Trash2, Eye, EyeOff, Download, Search, CheckSquare, Square } from 'lucide-react';
import api from '../utils/api';
import RichTextEditor from '../components/RichTextEditor';
import LoadingScreen from '../components/LoadingScreen';
import LoadingButton from '../components/LoadingButton';

export default function ContentEntries() {
  const { slug } = useParams();
  const [contentType, setContentType] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/api/v1/content-types').then(r => r.data),
      api.get(`/api/v1/dynamic/${slug}${statusFilter ? `?status=${statusFilter}` : ''}`).then(r => r.data).catch(() => [])
    ]).then(([cts, ents]) => {
      const ct = cts?.find(c => c.slug === slug);
      setContentType(ct);
      setEntries(ents || []);
      if (ct) {
        const initialForm = { status: 'draft' };
        ct.fields.forEach(f => initialForm[f.name] = f.type === 'Boolean' ? false : '');
        setForm(initialForm);
      }
    }).finally(() => setLoading(false));
  }, [slug, statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/api/v1/dynamic/${slug}`, form);
      setShowForm(false);
      const r = await api.get(`/api/v1/dynamic/${slug}`);
      setEntries(r.data || []);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (entry) => {
    const action = entry.status === 'published' ? 'unpublish' : 'publish';
    await api.patch(`/api/v1/dynamic/${slug}/${entry._id}/${action}`);
    const r = await api.get(`/api/v1/dynamic/${slug}`);
    setEntries(r.data || []);
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    setSelected(selected.length === filtered.length ? [] : filtered.map(e => e._id));
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.length} entries?`)) return;
    for (const id of selected) {
      await api.delete(`/api/v1/dynamic/${slug}/${id}`);
    }
    setSelected([]);
    const r = await api.get(`/api/v1/dynamic/${slug}`);
    setEntries(r.data || []);
  };

  const bulkPublish = async () => {
    for (const id of selected) {
      await api.patch(`/api/v1/dynamic/${slug}/${id}/publish`);
    }
    setSelected([]);
    const r = await api.get(`/api/v1/dynamic/${slug}`);
    setEntries(r.data || []);
  };

  const filtered = entries.filter(e => {
    if (!search) return true;
    const s = search.toLowerCase();
    return Object.values(e).some(v => String(v).toLowerCase().includes(s));
  });

  if (loading) return <LoadingScreen message="Loading content entries" />;
  if (!contentType) return <div style={{ padding: '32px', color: '#fca5a5' }}>Content type not found</div>;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Link to="/content-types" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', textDecoration: 'none', marginBottom: '8px' }}>
          <ArrowLeft style={{ width: '12px', height: '12px' }} /> Back to Content Types
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9' }}>{contentType.name}</h1>
        <p style={{ fontSize: '12px', color: '#475569', fontFamily: 'monospace' }}>/{slug}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <button onClick={() => setShowForm(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: 'white', background: 'linear-gradient(90deg, #3b82f6, #6366f1)', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
          <Plus style={{ width: '14px', height: '14px' }} /> New Entry
        </button>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#475569' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search entries..." style={{ padding: '8px 12px 8px 32px', background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9', fontSize: '13px', width: '200px' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['', 'draft', 'published'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '500', color: statusFilter === s ? '#f1f5f9' : '#64748b', background: statusFilter === s ? '#1e293b' : 'transparent', border: '1px solid #1e293b', borderRadius: '6px', cursor: 'pointer', textTransform: 'capitalize' }}>
                {s || 'All'}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => window.open(`/api/v1/dynamic/${slug}/export/json`, '_blank')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '500', color: '#94a3b8', background: '#1e293b', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
              <Download style={{ width: '12px', height: '12px' }} /> JSON
            </button>
            <button onClick={() => window.open(`/api/v1/dynamic/${slug}/export/csv`, '_blank')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '500', color: '#94a3b8', background: '#1e293b', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
              <Download style={{ width: '12px', height: '12px' }} /> CSV
            </button>
          </div>
        </div>
      </div>

      {selected.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#1e293b', borderRadius: '8px', marginBottom: '16px' }}>
          <span style={{ fontSize: '13px', color: '#f1f5f9' }}>{selected.length} selected</span>
          <button onClick={bulkPublish} style={{ padding: '6px 12px', fontSize: '12px', background: '#064e3b', border: 'none', borderRadius: '6px', color: '#34d399', cursor: 'pointer' }}>Publish</button>
          <button onClick={bulkDelete} style={{ padding: '6px 12px', fontSize: '12px', background: '#7f1d1d', border: 'none', borderRadius: '6px', color: '#fca5a5', cursor: 'pointer' }}>Delete</button>
          <button onClick={() => setSelected([])} style={{ padding: '6px 12px', fontSize: '12px', background: 'transparent', border: '1px solid #334155', borderRadius: '6px', color: '#94a3b8', cursor: 'pointer' }}>Clear</button>
        </div>
      )}

      {showForm && (
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px' }}>Create Entry</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              {contentType.fields.map(f => (
                <div key={f.name} style={f.type === 'RichText' ? { gridColumn: '1 / -1' } : {}}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>{f.name}{f.required && ' *'}</label>
                  {f.type === 'Boolean' ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={form[f.name] || false} onChange={e => setForm({ ...form, [f.name]: e.target.checked })} style={{ accentColor: '#3b82f6' }} />
                      <span style={{ fontSize: '12px', color: form[f.name] ? '#34d399' : '#64748b' }}>{form[f.name] ? 'Yes' : 'No'}</span>
                    </label>
                  ) : f.type === 'RichText' ? (
                    <RichTextEditor value={form[f.name] || ''} onChange={(html) => setForm({ ...form, [f.name]: html })} placeholder={`Enter ${f.name}...`} />
                  ) : f.type === 'Number' ? (
                    <input type="number" value={form[f.name] || ''} onChange={e => setForm({ ...form, [f.name]: Number(e.target.value) })} style={{ width: '100%', padding: '10px 12px', background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px' }} required={f.required} />
                  ) : (
                    <input type={f.type === 'Date' ? 'date' : 'text'} value={form[f.name] || ''} onChange={e => setForm({ ...form, [f.name]: e.target.value })} style={{ width: '100%', padding: '10px 12px', background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px' }} required={f.required} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <LoadingButton type="submit" loading={saving}>Create</LoadingButton>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #334155', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8' }}>{search ? 'No matching entries' : 'No entries yet'}</p>
        </div>
      ) : (
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={selectAll} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
              {selected.length === filtered.length ? <CheckSquare style={{ width: '16px', height: '16px' }} /> : <Square style={{ width: '16px', height: '16px' }} />}
            </button>
            <span style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase' }}>{filtered.length} entries</span>
          </div>
          {filtered.map(e => (
            <div key={e._id} style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button onClick={() => toggleSelect(e._id)} style={{ background: 'transparent', border: 'none', color: selected.includes(e._id) ? '#3b82f6' : '#475569', cursor: 'pointer' }}>
                {selected.includes(e._id) ? <CheckSquare style={{ width: '16px', height: '16px' }} /> : <Square style={{ width: '16px', height: '16px' }} />}
              </button>
              <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '10px', background: e.status === 'published' ? '#064e3b' : '#334155', color: e.status === 'published' ? '#34d399' : '#94a3b8', textTransform: 'capitalize', minWidth: '50px', textAlign: 'center' }}>
                {e.status || 'draft'}
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '20px', flex: 1 }}>
                {contentType.fields.map(f => (
                  <div key={f.name}>
                    <p style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase' }}>{f.name}</p>
                    <p style={{ fontSize: '13px', color: '#e2e8f0' }}>{String(e[f.name] || '-').substring(0, 50)}{String(e[f.name] || '').length > 50 ? '...' : ''}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => toggleStatus(e)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                  {e.status === 'published' ? <EyeOff style={{ width: '14px', height: '14px' }} /> : <Eye style={{ width: '14px', height: '14px' }} />}
                </button>
                <button onClick={async () => { await api.delete(`/api/v1/dynamic/${slug}/${e._id}`); setEntries(entries.filter(x => x._id !== e._id)); setSelected(selected.filter(x => x !== e._id)); }} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                  <Trash2 style={{ width: '14px', height: '14px' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}