import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, ArrowLeft, Trash2, Eye, EyeOff, Download, Upload, FileText, History, Clock, Globe, X, RotateCw, Copy, Lock, Edit3, AlertTriangle, MessageSquare, BarChart3, Loader } from 'lucide-react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';
import RichTextEditor from '../components/RichTextEditor';
import LoadingButton from '../components/LoadingButton';
import PageShell from '../components/PageShell';
import FilterBar from '../components/FilterBar';
import DataTable from '../components/DataTable';
import VersionHistory from '../components/VersionHistory';
import TranslationEditor from '../components/TranslationEditor';
import EntryComments from '../components/EntryComments';
import { useEntryLock } from '../hooks/useEntryLock';
import Pagination from '../components/Pagination';

export default function ContentEntries() {
  const toast = useToast();
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
  const [showTrash, setShowTrash] = useState(false);
  const [versionEntry, setVersionEntry] = useState(null);
  const [translateEntry, setTranslateEntry] = useState(null);
  const [commentEntry, setCommentEntry] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showImport, setShowImport] = useState(false);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [bulkEditForm, setBulkEditForm] = useState({});
  const [bulkEditing, setBulkEditing] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [bulkLoading, setBulkLoading] = useState(false);
  const [refData, setRefData] = useState({});
  const [editingEntry, setEditingEntry] = useState(null);
  const [tagFilter, setTagFilter] = useState('');
  const [allTags, setAllTags] = useState([]);
  const currentUser = useCurrentUser();
  const userId = currentUser.userId;
  const userName = currentUser.displayName || currentUser.email || 'Unknown';
  const { lock, acquireLock, releaseLock } = useEntryLock(slug, editingEntry?._id, userId, userName);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const trashParam = showTrash ? 'trash=true' : '';
    const statusParam = statusFilter ? `status=${statusFilter}` : '';
    const tagParam = tagFilter ? `tag=${tagFilter}` : '';
    const pageParam = `page=${page}`;
    const searchParam = search ? `q=${encodeURIComponent(search)}` : '';
    const params = [trashParam, statusParam, tagParam, pageParam, searchParam].filter(Boolean).join('&');
    Promise.all([
      api.get('/api/v1/content-types').then(r => r.data),
      api.get(`/api/v1/dynamic/${slug}${params ? `?${params}` : ''}`).then(r => r.data).catch(() => ({ data: [], total: 0, page: 1, totalPages: 1 })),
      api.get('/api/v1/tags').then(r => r.data.data).catch(() => [])
    ]).then(([cts, resp, tags]) => {
      if (cancelled) return;
      const ct = cts?.find(c => c.slug === slug);
      setContentType(ct);
      setEntries((resp.data || resp) || []);
      if (resp.totalPages) setTotalPages(resp.totalPages);
      setAllTags(tags || []);
      if (ct) {
        const initialForm = { status: 'draft', locale: ct.locales?.[0] || 'en', scheduledPublishAt: '', scheduledUnpublishAt: '', accessPassword: '', notes: '', tags: [] };
        ct.fields.forEach(f => initialForm[f.name] = f.type === 'Boolean' ? false : '');
        setForm(initialForm);

        const refFields = ct.fields.filter(f => f.type === 'Reference' && f.refContentType);
        if (refFields.length > 0) {
          Promise.all(refFields.map(f =>
            api.get(`/api/v1/dynamic/${f.refContentType}`).then(r => ({ slug: f.refContentType, data: r.data?.data || r.data || [] })).catch(() => ({ slug: f.refContentType, data: [] }))
          )).then(results => {
            if (cancelled) return;
            const map = {};
            results.forEach(r => { map[r.slug] = r.data; });
            setRefData(map);
          });
        }
      }
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug, statusFilter, showTrash, tagFilter, page, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingEntry) {
        await api.put(`/api/v1/dynamic/${slug}/${editingEntry._id}`, form);
      } else {
        await api.post(`/api/v1/dynamic/${slug}`, form);
      }
      if (editingEntry) {
        try { await releaseLock(); } catch { /* best-effort */ }
      }
      setShowForm(false);
      setEditingEntry(null);
      const r = await api.get(`/api/v1/dynamic/${slug}?page=1&limit=50`);
      setEntries(r.data?.data || r.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (entry) => {
    const id = entry._id;
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      const action = entry.status === 'published' ? 'unpublish' : 'publish';
      await api.patch(`/api/v1/dynamic/${slug}/${entry._id}/${action}`);
      const r = await api.get(`/api/v1/dynamic/${slug}`);
      setEntries(r.data?.data || r.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to toggle status');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.length} entries?`)) return;
    setBulkLoading(true);
    try {
      await api.post(`/api/v1/dynamic/${slug}/bulk-delete`, { ids: selected });
      setSelected([]);
      const r = await api.get(`/api/v1/dynamic/${slug}?page=${page}&limit=50`);
      setEntries(r.data?.data || r.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete entries');
    } finally {
      setBulkLoading(false);
    }
  };

  const bulkPublish = async () => {
    setBulkLoading(true);
    try {
      await api.post(`/api/v1/dynamic/${slug}/bulk-publish`, { ids: selected });
      setSelected([]);
      const r = await api.get(`/api/v1/dynamic/${slug}?page=${page}&limit=50`);
      setEntries(r.data?.data || r.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to publish entries');
    } finally {
      setBulkLoading(false);
    }
  };

  const startEdit = async (entry) => {
    try {
      const result = await acquireLock();
      if (!result || !result.acquired) return;
      setEditingEntry(entry);
      const editForm = { status: entry.status, locale: entry.locale || contentType.locales?.[0] || 'en', scheduledPublishAt: entry.scheduledPublishAt || '', scheduledUnpublishAt: entry.scheduledUnpublishAt || '', accessPassword: '', notes: entry.notes || '', tags: entry.tags || [] };
      contentType.fields.forEach(f => editForm[f.name] = entry[f.name] ?? (f.type === 'Boolean' ? false : ''));
      setForm(editForm);
      setShowForm(true);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to start editing');
    }
  };

  const cancelEdit = async () => {
    try {
      if (editingEntry) await releaseLock();
    } catch {
      // best-effort lock release
    }
    setEditingEntry(null);
    setShowForm(false);
  };

  const debouncedSearch = useRef(null);
  useEffect(() => {
    clearTimeout(debouncedSearch.current);
    debouncedSearch.current = setTimeout(() => setPage(1), 300);
    return () => clearTimeout(debouncedSearch.current);
  }, [search]);

  if (!contentType) {
    if (loading) return <PageShell title="Loading..." loading><div /></PageShell>;
    return <div style={{ padding: '32px', color: '#fca5a5' }}>Content type not found</div>;
  }

  const columns = [
    {
      key: 'status',
      label: 'Status',
      width: '80px',
      render: (item) => {
        if (contentType?.workflowEnabled && item.workflowStage) {
          const stage = contentType.workflowStages?.find(s => s.name === item.workflowStage);
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {item.passwordProtected && <Lock style={{ width: '10px', height: '10px', color: '#f59e0b' }} />}
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: `${stage?.color || '#64748b'}22`, color: stage?.color || '#64748b', fontWeight: '600', width: 'fit-content' }}>
                {item.workflowStage}
              </span>
            </div>
          );
        }
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {item.passwordProtected && <Lock style={{ width: '10px', height: '10px', color: '#f59e0b' }} />}
            <span className={`badge ${item.status === 'published' ? 'badge-published' : item.status === 'scheduled' ? 'badge-scheduled' : 'badge-draft'}`} style={{ width: 'fit-content' }}>
              {item.status || 'draft'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'tags',
      label: 'Tags',
      width: '100px',
      render: (item) => (
        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
          {(item.tags || []).slice(0, 3).map((tag, i) => (
            <span key={i} style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '3px', background: 'rgba(139,92,246,0.12)', color: '#c4b5fd', fontWeight: '600', textTransform: 'lowercase' }}>{tag}</span>
          ))}
          {(item.tags || []).length > 3 && <span style={{ fontSize: '9px', color: '#475569' }}>+{item.tags.length - 3}</span>}
        </div>
      ),
    },
    {
      key: 'locale',
      label: 'Locale',
      width: '60px',
      render: (item) => (
        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,126,95,0.1)', color: '#ff7e5f', fontWeight: '600', textTransform: 'uppercase' }}>
          {item.locale || 'en'}
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
                {f.type === 'Reference' && item[`${f.name}_data`]
                  ? (Object.values(item[`${f.name}_data`]).filter(v => typeof v === 'string' && v !== item[`${f.name}_data`]._id && v !== item[`${f.name}_data`].tenantId && v !== item[`${f.name}_data`].status)[0] || item[f.name])
                  : String(item[f.name] || '-').substring(0, 50)}
                {f.type !== 'Reference' && String(item[f.name] || '').length > 50 ? '...' : ''}
              </p>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '100px',
      render: (item) => (
        <div style={{ display: 'flex', gap: '4px' }}>
          {showTrash ? (
            <>
              <button onClick={async (e) => { e.stopPropagation(); const id = item._id; setActionLoading(prev => ({ ...prev, [id]: 'restore' })); try { await api.patch(`/api/v1/dynamic/${slug}/${item._id}/restore`); setEntries(entries.filter(x => x._id !== item._id)); setSelected(selected.filter(x => x !== item._id)); } catch { toast.error('Failed to restore'); } finally { setActionLoading(prev => ({ ...prev, [id]: false })); } }} className="btn-ghost" style={{ padding: '6px', color: '#34d399' }} title="Restore" disabled={actionLoading[item._id]}>
                {actionLoading[item._id] === 'restore' ? <Loader className="spin" style={{ width: '14px', height: '14px' }} /> : <RotateCw style={{ width: '14px', height: '14px' }} />}
              </button>
              <button onClick={async (e) => { e.stopPropagation(); if (!confirm('Permanently delete this entry?')) return; const id = item._id; setActionLoading(prev => ({ ...prev, [id]: 'perma' })); try { await api.delete(`/api/v1/dynamic/${slug}/${item._id}/permanent`); setEntries(entries.filter(x => x._id !== item._id)); setSelected(selected.filter(x => x !== item._id)); } catch { toast.error('Failed to delete'); } finally { setActionLoading(prev => ({ ...prev, [id]: false })); } }} className="btn-ghost" style={{ padding: '6px', color: '#fca5a5' }} title="Delete permanently" disabled={actionLoading[item._id]}>
                {actionLoading[item._id] === 'perma' ? <Loader className="spin" style={{ width: '14px', height: '14px' }} /> : <Trash2 style={{ width: '14px', height: '14px' }} />}
              </button>
            </>
          ) : (
            <>
              <button onClick={(e) => { e.stopPropagation(); startEdit(item); }} className="btn-ghost" style={{ padding: '6px' }} title="Edit">
                <Edit3 style={{ width: '14px', height: '14px' }} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setCommentEntry(item); }} className="btn-ghost" style={{ padding: '6px' }} title="Comments">
                <MessageSquare style={{ width: '14px', height: '14px' }} />
              </button>
              <button onClick={async (e) => { e.stopPropagation(); const id = item._id; setActionLoading(prev => ({ ...prev, [id]: 'dup' })); try { await api.post(`/api/v1/dynamic/${slug}/${item._id}/duplicate`); const r = await api.get(`/api/v1/dynamic/${slug}`); setEntries(r.data?.data || r.data || []); } catch { toast.error('Failed to duplicate'); } finally { setActionLoading(prev => ({ ...prev, [id]: false })); } }} className="btn-ghost" style={{ padding: '6px' }} title="Duplicate" disabled={actionLoading[item._id]}>
                {actionLoading[item._id] === 'dup' ? <Loader className="spin" style={{ width: '14px', height: '14px' }} /> : <Copy style={{ width: '14px', height: '14px' }} />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); setVersionEntry(item); }} className="btn-ghost" style={{ padding: '6px' }} title="Version history">
                <History style={{ width: '14px', height: '14px' }} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setTranslateEntry(item); }} className="btn-ghost" style={{ padding: '6px' }} title="Translations">
                <Globe style={{ width: '14px', height: '14px' }} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); toggleStatus(item); }} className="btn-ghost" style={{ padding: '6px' }} disabled={actionLoading[item._id]}>
                {actionLoading[item._id] ? <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> : item.status === 'published' ? <EyeOff style={{ width: '14px', height: '14px' }} /> : <Eye style={{ width: '14px', height: '14px' }} />}
              </button>
              <button onClick={async (e) => { e.stopPropagation(); const id = item._id; setActionLoading(prev => ({ ...prev, [id]: 'del' })); try { await api.delete(`/api/v1/dynamic/${slug}/${item._id}`); setEntries(entries.filter(x => x._id !== item._id)); setSelected(selected.filter(x => x !== item._id)); } catch { toast.error('Failed to delete'); } finally { setActionLoading(prev => ({ ...prev, [id]: false })); } }} className="btn-ghost" style={{ padding: '6px', color: '#fca5a5' }} disabled={actionLoading[item._id]}>
                {actionLoading[item._id] === 'del' ? <Loader className="spin" style={{ width: '14px', height: '14px' }} /> : <Trash2 style={{ width: '14px', height: '14px' }} />}
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
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
            value: showTrash ? 'trash' : statusFilter,
            onChange: (v) => { if (v === 'trash') { setShowTrash(true); setStatusFilter(''); setTagFilter(''); } else { setShowTrash(false); setStatusFilter(v); } setPage(1); },
            options: [
              { value: '', label: 'All' },
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
              { value: 'trash', label: 'Trash' },
            ],
          },
          {
            type: 'select',
            value: tagFilter,
            onChange: (v) => { setTagFilter(v); setPage(1); },
            options: [
              { value: '', label: 'All Tags' },
              ...allTags.map(t => ({ value: t.slug, label: t.name })),
            ],
          },
        ]}
        actions={
          <>
            <button onClick={() => setShowImport(true)} className="btn-ghost">
              <Upload style={{ width: '12px', height: '12px' }} /> Import
            </button>
            <button onClick={() => window.open(`/api/v1/dynamic/${slug}/export/json`, '_blank')} className="btn-ghost">
              <Download style={{ width: '12px', height: '12px' }} /> JSON
            </button>
            <button onClick={() => window.open(`/api/v1/dynamic/${slug}/export/csv`, '_blank')} className="btn-ghost">
              <Download style={{ width: '12px', height: '12px' }} /> CSV
            </button>
            <button onClick={() => { if (editingEntry) cancelEdit(); setShowForm(true); }} className="btn-primary" style={{ padding: '9px 18px', fontSize: '13px' }}>
              <Plus style={{ width: '14px', height: '14px' }} /> New Entry
            </button>
          </>
        }
      />

      {selected.length > 0 && !showTrash && (
        <div className="batch-bar">
          <span style={{ fontSize: '13px', color: '#f8fafc' }}>{selected.length} selected</span>
          <button onClick={bulkPublish} className="btn-ghost" style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', borderColor: 'rgba(16,185,129,0.2)' }} disabled={bulkLoading}>{bulkLoading ? <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> : 'Publish'}</button>
          <button onClick={() => { setShowBulkEdit(true); setBulkEditForm({}); }} className="btn-ghost">Edit</button>
          <button onClick={bulkDelete} className="btn-danger" disabled={bulkLoading}>{bulkLoading ? <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> : 'Delete'}</button>
          <button onClick={() => setSelected([])} className="btn-ghost">Clear</button>
        </div>
      )}

      {showTrash && (
        <div className="batch-bar">
          <span style={{ fontSize: '13px', color: '#fca5a5' }}>Trash — entries can be restored or permanently deleted</span>
        </div>
      )}

      {showForm && (
        <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
          {editingEntry && lock && !lock.acquired && (
            <div style={{ padding: '12px 16px', marginBottom: '16px', borderRadius: '8px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#fbbf24' }}>
              <AlertTriangle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              Locked by <strong>{lock.userName}</strong> — editing disabled
            </div>
          )}
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)", marginBottom: '20px' }}>
            {editingEntry ? 'Edit Entry' : 'Create Entry'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              {contentType.fields.map(f => (
                <div key={f.name} style={f.type === 'RichText' ? { gridColumn: '1 / -1' } : {}}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>{f.name}{f.required && ' *'}</label>
                  {f.type === 'Boolean' ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={form[f.name] || false} onChange={e => setForm({ ...form, [f.name]: e.target.checked })} disabled={editingEntry && lock && !lock.acquired} style={{ accentColor: '#ff7e5f' }} />
                      <span style={{ fontSize: '12px', color: form[f.name] ? '#34d399' : '#64748b' }}>{form[f.name] ? 'Yes' : 'No'}</span>
                    </label>
                  ) : f.type === 'RichText' ? (
                    <RichTextEditor value={form[f.name] || ''} onChange={(html) => setForm({ ...form, [f.name]: html })} placeholder={`Enter ${f.name}...`} />
                  ) : f.type === 'Number' ? (
                    <input type="number" value={form[f.name] || ''} onChange={e => setForm({ ...form, [f.name]: Number(e.target.value) })} className="input-field" required={f.required} disabled={editingEntry && lock && !lock.acquired} />
                  ) : f.type === 'Reference' ? (
                    <select value={form[f.name] || ''} onChange={e => setForm({ ...form, [f.name]: e.target.value })} className="select-field" required={f.required} disabled={editingEntry && lock && !lock.acquired}>
                      <option value="">Select...</option>
                      {(refData[f.refContentType] || []).map(ref => (
                        <option key={ref._id} value={ref._id}>
                          {Object.values(ref).filter(v => typeof v === 'string' && v !== ref._id && v !== ref.tenantId && v !== ref.status)[0] || ref._id}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input type={f.type === 'Date' ? 'date' : 'text'} value={form[f.name] || ''} onChange={e => setForm({ ...form, [f.name]: e.target.value })} className="input-field" required={f.required} disabled={editingEntry && lock && !lock.acquired} />
                  )}
                </div>
              ))}
            </div>

            {contentType.locales?.length > 1 && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Globe style={{ width: '14px', height: '14px' }} /> Locale
                </h4>
                <select value={form.locale} onChange={e => setForm({ ...form, locale: e.target.value })} className="select-field" style={{ maxWidth: '200px' }} disabled={editingEntry && lock && !lock.acquired}>
                  {contentType.locales.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            )}

            {contentType?.workflowEnabled && editingEntry && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BarChart3 style={{ width: '14px', height: '14px' }} /> Workflow Stage
                </h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {contentType.workflowStages.map(stage => {
                    const current = form.workflowStage === stage.name;
                    return (
                      <button
                        key={stage.name}
                        type="button"
                        disabled={current || (lock && !lock.acquired)}
                        onClick={async () => {
                          try {
                            await api.post(`/api/v1/dynamic/${slug}/${editingEntry._id}/transition`, { stage: stage.name });
                            setForm({ ...form, workflowStage: stage.name, status: stage.name === 'Published' ? 'published' : 'draft' });
                          } catch (err) {
                            toast.error(err.response?.data?.message || 'Transition failed');
                          }
                        }}
                        style={{
                          padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                          border: current ? `2px solid ${stage.color}` : '2px solid transparent',
                          background: current ? `${stage.color}22` : 'rgba(255,255,255,0.03)',
                          color: current ? stage.color : '#64748b',
                          cursor: current || (lock && !lock.acquired) ? 'default' : 'pointer',
                          opacity: current ? 1 : 0.6,
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { if (!current && !(lock && !lock.acquired)) { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = `${stage.color}15`; }}}
                        onMouseLeave={e => { if (!current) { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}}
                      >
                        {stage.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock style={{ width: '14px', height: '14px' }} /> Scheduled Publishing
              </h4>
              <div className="grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Publish at</label>
                  <input type="datetime-local" value={form.scheduledPublishAt || ''} onChange={e => setForm({ ...form, scheduledPublishAt: e.target.value })} className="input-field" disabled={editingEntry && lock && !lock.acquired} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Unpublish at</label>
                  <input type="datetime-local" value={form.scheduledUnpublishAt || ''} onChange={e => setForm({ ...form, scheduledUnpublishAt: e.target.value })} className="input-field" disabled={editingEntry && lock && !lock.acquired} />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock style={{ width: '14px', height: '14px' }} /> Access Control
              </h4>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Access Password (leave empty for public)</label>
                <input type="password" value={form.accessPassword || ''} onChange={e => setForm({ ...form, accessPassword: e.target.value })} className="input-field" placeholder="Set a password to protect this entry" disabled={editingEntry && lock && !lock.acquired} />
              </div>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#8b5cf6', display: 'inline-block' }} /> Tags
              </h4>
              <div>
                <input
                  type="text"
                  value={(form.tags || []).join(', ')}
                  onChange={e => setForm({ ...form, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                  className="input-field"
                  placeholder="tag1, tag2, tag3"
                  disabled={editingEntry && lock && !lock.acquired}
                />
                {form.tags?.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {form.tags.map((tag, i) => (
                      <span key={i} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(139,92,246,0.12)', color: '#c4b5fd', fontWeight: '600' }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText style={{ width: '14px', height: '14px' }} /> Internal Notes
              </h4>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Editor notes (not publicly visible)</label>
                <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} className="input-field" style={{ minHeight: '80px', resize: 'vertical' }} placeholder="Internal notes for editors..." disabled={editingEntry && lock && !lock.acquired} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <LoadingButton type="submit" loading={saving} className="btn-primary" style={{ border: 'none' }} disabled={editingEntry && lock && !lock.acquired}>{editingEntry ? 'Save Changes' : 'Create'}</LoadingButton>
              <button type="button" onClick={cancelEdit} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        columns={columns}
        data={entries}
        onRowClick={(item) => startEdit(item)}
        selectable
        selected={selected}
        allSelected={selected.length === entries.length && entries.length > 0}
        onToggleSelect={(id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
        onSelectAll={() => setSelected(selected.length === entries.length ? [] : entries.map(e => e._id))}
        emptyState={<p style={{ color: '#94a3b8' }}>{search ? 'No matching entries' : showTrash ? 'Trash is empty' : 'No entries yet'}</p>}
        loading={loading}
      />
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </PageShell>

    {versionEntry && (
      <VersionHistory
        slug={slug}
        entryId={versionEntry._id}
        entryName={contentType.fields.map(f => versionEntry[f.name]).filter(Boolean)[0] || versionEntry._id}
        onClose={() => setVersionEntry(null)}
        onRollback={async () => {
          try {
            const r = await api.get(`/api/v1/dynamic/${slug}`);
            setEntries(r.data?.data || r.data || []);
          } catch {
            // best-effort refresh after rollback
          }
        }}
      />
    )}

    {translateEntry && (
      <TranslationEditor
        slug={slug}
        entry={translateEntry}
        contentType={contentType}
        onClose={() => setTranslateEntry(null)}
      />
    )}

    {commentEntry && (
      <EntryComments
        slug={slug}
        entryId={commentEntry._id}
        entryName={contentType.fields.map(f => commentEntry[f.name]).filter(Boolean)[0] || commentEntry._id}
        onClose={() => setCommentEntry(null)}
      />
    )}

    {showBulkEdit && (
      <div className="modal-backdrop" onClick={() => setShowBulkEdit(false)}>
        <div className="glass-card" style={{ maxWidth: '480px', width: '90%', padding: '28px' }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>
              Edit {selected.length} entries
            </h3>
            <button onClick={() => setShowBulkEdit(false)} className="btn-ghost" style={{ padding: '6px' }}>
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
            Set the fields below — only filled fields will be applied.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {contentType.fields.map(f => {
              if (f.type === 'RichText' || f.type === 'Reference') return null;
              return (
                <div key={f.name}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>{f.label || f.name}</label>
                  {f.type === 'Boolean' ? (
                    <select value={bulkEditForm[f.name] ?? ''} onChange={e => setBulkEditForm({ ...bulkEditForm, [f.name]: e.target.value === '' ? undefined : e.target.value === 'true' })} className="select-field">
                      <option value="">— No change —</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  ) : (
                    <input type={f.type === 'Number' ? 'number' : 'text'} value={bulkEditForm[f.name] ?? ''} onChange={e => setBulkEditForm({ ...bulkEditForm, [f.name]: e.target.value || undefined })} className="input-field" placeholder={`— No change —`} />
                  )}
                </div>
              );
            })}
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Status</label>
              <select value={bulkEditForm.status ?? ''} onChange={e => setBulkEditForm({ ...bulkEditForm, status: e.target.value || undefined })} className="select-field">
                <option value="">— No change —</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <LoadingButton
              loading={bulkEditing}
              onClick={async () => {
                const updates = Object.fromEntries(Object.entries(bulkEditForm).filter(([, v]) => v !== undefined && v !== '' && v !== null));
                if (!Object.keys(updates).length) { toast.warning('No fields to update'); return; }
                setBulkEditing(true);
                try {
                  await api.patch(`/api/v1/dynamic/${slug}/bulk`, { ids: selected, updates });
                  setShowBulkEdit(false);
                  setSelected([]);
                  const r = await api.get(`/api/v1/dynamic/${slug}`);
                  setEntries(r.data?.data || r.data || []);
                } catch (err) {
                  toast.error(err.response?.data?.error || 'Bulk edit failed');
                } finally {
                  setBulkEditing(false);
                }
              }}
              className="btn-primary"
              style={{ border: 'none' }}
            >
              Apply Changes
            </LoadingButton>
            <button onClick={() => setShowBulkEdit(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    )}

    {showImport && (
      <div className="modal-backdrop" onClick={() => { setShowImport(false); setImportResult(null); setImportJson(''); }}>
        <div className="glass-card" style={{ maxWidth: '640px', width: '90%', padding: '28px', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>Import Entries</h3>
            <button onClick={() => { setShowImport(false); setImportResult(null); setImportJson(''); }} className="btn-ghost" style={{ padding: '6px' }}>
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>

          {importResult ? (
            <div>
              <div style={{ padding: '16px', borderRadius: '8px', background: importResult.errors?.length > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', border: `1px solid ${importResult.errors?.length > 0 ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}`, marginBottom: '16px' }}>
                <p style={{ fontSize: '14px', color: importResult.errors?.length > 0 ? '#fbbf24' : '#34d399', fontWeight: '600' }}>
                  {importResult.message}
                </p>
              </div>
              {importResult.errors?.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '13px', color: '#fca5a5', marginBottom: '8px' }}>Errors ({importResult.errors.length})</h4>
                  {importResult.errors.map((err, i) => (
                    <div key={i} style={{ padding: '8px', background: 'rgba(252,165,165,0.06)', borderRadius: '6px', marginBottom: '4px', fontSize: '12px', color: '#fca5a5' }}>
                      Row {err.index}: {err.error}
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => { setShowImport(false); setImportResult(null); setImportJson(''); window.location.reload(); }} className="btn-primary" style={{ border: 'none' }}>
                Done
              </button>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                Paste JSON or select a JSON file to import. Each entry should be an object with fields matching the content type.
              </p>

              <button onClick={() => fileInputRef.current?.click()} className="btn-ghost" style={{ marginBottom: '12px' }}>
                <Upload style={{ width: '12px', height: '12px' }} /> Select JSON File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => setImportJson(ev.target?.result || '');
                  reader.readAsText(file);
                }}
              />

              <textarea
                value={importJson}
                onChange={e => setImportJson(e.target.value)}
                placeholder='[{"title": "Example", "body": "Hello"}]'
                style={{
                  width: '100%', minHeight: '240px', padding: '14px', fontSize: '12px',
                  fontFamily: 'monospace', background: 'rgba(8,5,17,0.6)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px', color: '#e2e8f0', outline: 'none', resize: 'vertical'
                }}
              />

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <LoadingButton
                  loading={importing}
                  onClick={async () => {
                    let data;
                    try { data = JSON.parse(importJson); } catch { toast.error('Invalid JSON'); return; }
                    setImporting(true);
                    try {
                      const res = await api.post(`/api/v1/dynamic/${slug}/import`, data);
                      setImportResult(res.data);
                    } catch (err) {
                      setImportResult({ message: 'Import failed', errors: [{ index: 0, error: err.response?.data?.error || err.message }] });
                    } finally {
                      setImporting(false);
                    }
                  }}
                  className="btn-primary"
                  style={{ border: 'none' }}
                >
                  Import
                </LoadingButton>
                <button onClick={() => { setShowImport(false); setImportResult(null); setImportJson(''); }} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )}
  </>
  );
}
