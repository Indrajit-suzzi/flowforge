import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, ArrowLeft, Trash2, Eye, EyeOff, Download, ArrowUpRight, FileText } from 'lucide-react';
import api from '../utils/api';
import RichTextEditor from '../components/RichTextEditor';
import LoadingButton from '../components/LoadingButton';
import PageShell from '../components/PageShell';
import FilterBar from '../components/FilterBar';
import DataTable from '../components/DataTable';

export default function ContentEntries() {
  const { slug } = useParams();
  const [contentType, setContentType] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setLoading(true);
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

  if (!contentType) return <div style={{ padding: '32px', color: '#fca5a5' }}>Content type not found</div>;

  const columns = [
    {
      key: 'status',
      label: 'Status',
      width: '80px',
      render: (item) => (
        <span className={`badge ${item.status === 'published' ? 'badge-published' : 'badge-draft'}`} style={{ width: 'fit-content' }}>
          {item.status || 'draft'}
        </span>
      ),
    },
    {
      key: 'fields',
      label: 'Fields',
      render: (item) => (
        <div className="scroll-x" style={{ display: 'flex', gap: '20px' }}>
          {contentType.fields.map(f => (
            <div key={f.name} style={{ minWidth: '120px' }}>
              <p style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', marginBottom: '2px' }}>{f.name}</p>
              <p style={{ fontSize: '13px', color: '#e2e8f0' }}>
                {String(item[f.name] || '-').substring(0, 50)}{String(item[f.name] || '').length > 50 ? '...' : ''}
              </p>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '80px',
      render: (item) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={(e) => { e.stopPropagation(); toggleStatus(item); }} className="btn-ghost" style={{ padding: '6px' }}>
            {item.status === 'published' ? <EyeOff style={{ width: '14px', height: '14px' }} /> : <Eye style={{ width: '14px', height: '14px' }} />}
          </button>
          <button onClick={async (e) => { e.stopPropagation(); await api.delete(`/api/v1/dynamic/${slug}/${item._id}`); setEntries(entries.filter(x => x._id !== item._id)); setSelected(selected.filter(x => x !== item._id)); }} className="btn-ghost" style={{ padding: '6px', color: '#fca5a5' }}>
            <Trash2 style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageShell
      title={contentType.name}
      subtitle={<code style={{ color: '#475569', fontFamily: 'monospace', fontSize: '12px' }}>/{slug}</code>}
      icon={<FileText style={{ width: '22px', height: '22px' }} />}
      maxWidth="1400px"
    >
      <div style={{ marginBottom: '32px' }}>
        <Link to="/content-types" className="btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', textDecoration: 'none' }}>
          <ArrowLeft style={{ width: '12px', height: '12px' }} /> Back to Content Types
        </Link>
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search entries..."
        searchWidth="200px"
        filters={[
          {
            type: 'buttons',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: '', label: 'All' },
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
            ],
          },
        ]}
        actions={
          <>
            <button onClick={() => window.open(`/api/v1/dynamic/${slug}/export/json`, '_blank')} className="btn-ghost">
              <Download style={{ width: '12px', height: '12px' }} /> JSON
            </button>
            <button onClick={() => window.open(`/api/v1/dynamic/${slug}/export/csv`, '_blank')} className="btn-ghost">
              <Download style={{ width: '12px', height: '12px' }} /> CSV
            </button>
            <button onClick={() => setShowForm(true)} className="btn-primary" style={{ padding: '9px 18px', fontSize: '13px' }}>
              <Plus style={{ width: '14px', height: '14px' }} /> New Entry
            </button>
          </>
        }
      />

      {selected.length > 0 && (
        <div className="batch-bar">
          <span style={{ fontSize: '13px', color: '#f8fafc' }}>{selected.length} selected</span>
          <button onClick={bulkPublish} className="btn-ghost" style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', borderColor: 'rgba(16,185,129,0.2)' }}>Publish</button>
          <button onClick={bulkDelete} className="btn-danger">Delete</button>
          <button onClick={() => setSelected([])} className="btn-ghost">Clear</button>
        </div>
      )}

      {showForm && (
        <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)", marginBottom: '20px' }}>Create Entry</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              {contentType.fields.map(f => (
                <div key={f.name} style={f.type === 'RichText' ? { gridColumn: '1 / -1' } : {}}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>{f.name}{f.required && ' *'}</label>
                  {f.type === 'Boolean' ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={form[f.name] || false} onChange={e => setForm({ ...form, [f.name]: e.target.checked })} style={{ accentColor: '#ff7e5f' }} />
                      <span style={{ fontSize: '12px', color: form[f.name] ? '#34d399' : '#64748b' }}>{form[f.name] ? 'Yes' : 'No'}</span>
                    </label>
                  ) : f.type === 'RichText' ? (
                    <RichTextEditor value={form[f.name] || ''} onChange={(html) => setForm({ ...form, [f.name]: html })} placeholder={`Enter ${f.name}...`} />
                  ) : f.type === 'Number' ? (
                    <input type="number" value={form[f.name] || ''} onChange={e => setForm({ ...form, [f.name]: Number(e.target.value) })} className="input-field" required={f.required} />
                  ) : (
                    <input type={f.type === 'Date' ? 'date' : 'text'} value={form[f.name] || ''} onChange={e => setForm({ ...form, [f.name]: e.target.value })} className="input-field" required={f.required} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <LoadingButton type="submit" loading={saving} className="btn-primary" style={{ border: 'none' }}>Create</LoadingButton>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        columns={columns}
        data={filtered}
        selectable
        selected={selected}
        allSelected={selected.length === filtered.length && filtered.length > 0}
        onToggleSelect={(id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
        onSelectAll={() => setSelected(selected.length === filtered.length ? [] : filtered.map(e => e._id))}
        emptyState={<p style={{ color: '#94a3b8' }}>{search ? 'No matching entries' : 'No entries yet'}</p>}
        loading={loading}
      />
    </PageShell>
  );
}
