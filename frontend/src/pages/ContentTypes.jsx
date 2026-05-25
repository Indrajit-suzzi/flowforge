import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, LayoutTemplate, Layers, Globe, ArrowUp, ArrowDown, Copy, Download, X, BarChart3, Search, Asterisk } from 'lucide-react';
import api from '../utils/api';
import LoadingButton from '../components/LoadingButton';
import PageShell from '../components/PageShell';
import FilterBar from '../components/FilterBar';

const FIELD_TYPE_COLORS = {
  String: '#34d399',
  RichText: '#60a5fa',
  Number: '#f59e0b',
  Boolean: '#a78bfa',
  Date: '#f472b6',
  Reference: '#fb923c',
};

export default function ContentTypes() {
  const [contentTypes, setContentTypes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', fields: [], locales: ['en'], cacheTTL: 0, workflowEnabled: false, workflowStages: [] });
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('String');
  const [fieldRef, setFieldRef] = useState('');
  const [localeInput, setLocaleInput] = useState('');
  const [search, setSearch] = useState('');
  const [showImportSchema, setShowImportSchema] = useState(false);
  const [importSchemaJson, setImportSchemaJson] = useState('');
  const [importingSchema, setImportingSchema] = useState(false);
  const [importSchemaResult, setImportSchemaResult] = useState(null);
  const [templateSearch, setTemplateSearch] = useState('');
  const [expandedTemplate, setExpandedTemplate] = useState(null);

  useEffect(() => { 
    Promise.all([
      api.get('/api/v1/content-types').then(r => r.data || []),
      api.get('/api/v1/content-types/templates').then(r => r.data || [])
    ]).then(([cts, temps]) => {
      setContentTypes(cts);
      setTemplates(temps);
    }).catch(() => {}); 
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/v1/content-types', form);
      setForm({ name: '', slug: '', fields: [], locales: ['en'] });
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

  const handleDuplicate = async (id) => {
    await api.post(`/api/v1/content-types/${id}/duplicate`);
    const r = await api.get('/api/v1/content-types');
    setContentTypes(r.data || []);
  };

  const addField = () => {
    if (!fieldName) return;
    const field = { name: fieldName, type: fieldType, required: false, localizable: false };
    if (fieldType === 'Reference') field.refContentType = fieldRef;
    setForm({ ...form, fields: [...form.fields, field] });
    setFieldName('');
    setFieldType('String');
    setFieldRef('');
  };

  const updateField = (i, updates) => {
    const newFields = [...form.fields];
    newFields[i] = { ...newFields[i], ...updates };
    setForm({ ...form, fields: newFields });
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
          <button onClick={() => setShowImportSchema(true)} className="btn-ghost">
            <Download style={{ width: '12px', height: '12px' }} /> Import Schema
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary" style={{ padding: '9px 18px', fontSize: '13px' }}>
            <Plus style={{ width: '14px', height: '14px' }} /> New Content Type
          </button>
        </>
      }
    >
      {/* Templates Modal */}
      {showTemplates && (
        <div className="modal-overlay" onClick={() => { setShowTemplates(false); setTemplateSearch(''); setExpandedTemplate(null); }}>
          <div className="glass-card modal-content" style={{ padding: '28px', maxWidth: '800px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>Choose a Template</h3>
              <div style={{ position: 'relative', width: '100%', maxWidth: '260px' }}>
                <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#475569' }} />
                <input
                  value={templateSearch}
                  onChange={e => setTemplateSearch(e.target.value)}
                  placeholder="Filter templates..."
                  className="input-field"
                  style={{ paddingLeft: '30px', fontSize: '12px', width: '100%' }}
                />
              </div>
            </div>
            <div style={{ overflow: 'auto', flex: 1 }}>
              <div className="grid-auto-fill" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
                {templates.filter(t => !templateSearch || t.name.toLowerCase().includes(templateSearch.toLowerCase()) || t.slug.toLowerCase().includes(templateSearch.toLowerCase()) || t.description.toLowerCase().includes(templateSearch.toLowerCase())).map(t => {
                  const required = t.fields.filter(f => f.required).length;
                  const optional = t.fields.length - required;
                  const isExpanded = expandedTemplate === t.slug;
                  return (
                    <div key={t.slug} className="glass-card-sm" style={{ padding: 0, background: 'rgba(8, 5, 17, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
                      <div style={{ padding: '16px 16px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '6px' }}>
                          <p style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>{t.name}</p>
                          <button onClick={() => handleTemplate(t.slug)} className="btn-primary" style={{ padding: '5px 12px', fontSize: '11px', border: 'none', whiteSpace: 'nowrap' }}>
                            <Plus style={{ width: '11px', height: '11px' }} /> Use
                          </button>
                        </div>
                        <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>{t.description}</p>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontWeight: '500' }}>
                            {t.fields.length} fields
                          </span>
                          {required > 0 && (
                            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: 'rgba(251,191,36,0.1)', color: '#fbbf24', fontWeight: '500' }}>
                              {required} required
                            </span>
                          )}
                          {optional > 0 && (
                            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: 'rgba(100,116,139,0.15)', color: '#64748b', fontWeight: '500' }}>
                              {optional} optional
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ borderTop: isExpanded ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                        <button
                          onClick={() => setExpandedTemplate(isExpanded ? null : t.slug)}
                          style={{ width: '100%', padding: '8px 16px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
                        >
                          {isExpanded ? 'Hide fields' : 'Show fields'}
                        </button>
                        {isExpanded && (
                          <div style={{ padding: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {t.fields.map((f, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.03)' }}>
                                <span style={{ 
                                  display: 'inline-block', padding: '1px 6px', borderRadius: '4px', 
                                  fontSize: '9px', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap',
                                  background: FIELD_TYPE_COLORS[f.type] || '#64748b' 
                                }}>
                                  {f.type}
                                </span>
                                <span style={{ fontSize: '12px', color: '#e2e8f0', flex: 1 }}>{f.name}</span>
                                {f.required ? (
                                  <span style={{ fontSize: '10px', color: '#fbbf24', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    <Asterisk style={{ width: '10px', height: '10px' }} /> req
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '9px', color: '#475569' }}>opt</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <button onClick={() => { setShowTemplates(false); setTemplateSearch(''); setExpandedTemplate(null); }} className="btn-secondary" style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }}>Cancel</button>
          </div>
        </div>
      )}

      {showImportSchema && (
        <div className="modal-backdrop" onClick={() => { setShowImportSchema(false); setImportSchemaResult(null); setImportSchemaJson(''); }}>
          <div className="glass-card" style={{ maxWidth: '640px', width: '90%', padding: '28px', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>Import Schema</h3>
              <button onClick={() => { setShowImportSchema(false); setImportSchemaResult(null); setImportSchemaJson(''); }} className="btn-ghost" style={{ padding: '6px' }}>
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            {importSchemaResult ? (
              <div>
                <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '16px' }}>
                  <p style={{ fontSize: '14px', color: '#34d399', fontWeight: '600' }}>{importSchemaResult.message}</p>
                </div>
                <button onClick={() => { setShowImportSchema(false); setImportSchemaResult(null); setImportSchemaJson(''); window.location.reload(); }} className="btn-primary" style={{ border: 'none' }}>
                  Done
                </button>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                  Paste a JSON schema exported from another content type. Requires <code style={{ color: '#e2e8f0' }}>name</code>, <code style={{ color: '#e2e8f0' }}>slug</code>, and <code style={{ color: '#e2e8f0' }}>fields</code>.
                </p>
                <textarea
                  value={importSchemaJson}
                  onChange={e => setImportSchemaJson(e.target.value)}
                  placeholder='{"name": "Blog Post", "slug": "posts", "fields": [{"name": "title", "type": "String", "required": true}]}'
                  style={{
                    width: '100%', minHeight: '240px', padding: '14px', fontSize: '12px',
                    fontFamily: 'monospace', background: 'rgba(8,5,17,0.6)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px', color: '#e2e8f0', outline: 'none', resize: 'vertical'
                  }}
                />
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <LoadingButton
                    loading={importingSchema}
                    onClick={async () => {
                      let data;
                      try { data = JSON.parse(importSchemaJson); } catch { alert('Invalid JSON'); return; }
                      if (!data.name || !data.slug || !data.fields) { alert('Schema must include name, slug, and fields'); return; }
                      setImportingSchema(true);
                      try {
                        const res = await api.post('/api/v1/content-types/import/json', data);
                        setImportSchemaResult(res.data);
                      } catch (err) {
                        alert(err.response?.data?.message || 'Import failed');
                      } finally {
                        setImportingSchema(false);
                      }
                    }}
                    className="btn-primary"
                    style={{ border: 'none' }}
                  >
                    Import
                  </LoadingButton>
                  <button onClick={() => { setShowImportSchema(false); setImportSchemaResult(null); setImportSchemaJson(''); }} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </>
            )}
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

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                <Globe style={{ width: '12px', height: '12px', marginRight: '4px' }} /> Locales
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input value={localeInput} onChange={e => setLocaleInput(e.target.value)} onKeyDown={e => {
                  if (e.key === 'Enter' && localeInput.trim()) {
                    e.preventDefault();
                    if (!form.locales.includes(localeInput.trim())) {
                      setForm({ ...form, locales: [...form.locales, localeInput.trim()] });
                    }
                    setLocaleInput('');
                  }
                }} placeholder="Add locale (e.g. fr, es, de)" className="input-field" style={{ flex: 1 }} />
                <button type="button" onClick={() => {
                  if (localeInput.trim() && !form.locales.includes(localeInput.trim())) {
                    setForm({ ...form, locales: [...form.locales, localeInput.trim()] });
                  }
                  setLocaleInput('');
                }} className="btn-secondary" style={{ padding: '10px 16px' }}>Add</button>
              </div>
              {form.locales.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {form.locales.map((loc, i) => (
                    <span key={i} className="glass-card-sm" style={{ padding: '4px 10px', fontSize: '12px', color: '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {loc}
                      <button type="button" onClick={() => setForm({ ...form, locales: form.locales.filter((_, j) => j !== i) })} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: 0, fontSize: '14px', lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <input value={fieldName} onChange={e => setFieldName(e.target.value)} placeholder="Field name" className="input-field" style={{ flex: 1 }} />
              <select value={fieldType} onChange={e => setFieldType(e.target.value)} className="select-field">
                {['String', 'Number', 'Date', 'Boolean', 'RichText', 'Reference'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {fieldType === 'Reference' && (
                <select value={fieldRef} onChange={e => setFieldRef(e.target.value)} className="select-field">
                  <option value="">Select content type...</option>
                  {contentTypes.map(ct => <option key={ct.slug} value={ct.slug}>{ct.name} ({ct.slug})</option>)}
                </select>
              )}
              <button type="button" onClick={addField} className="btn-secondary" style={{ padding: '10px 16px' }}>Add</button>
            </div>
            {form.fields.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                {form.fields.map((f, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(8,5,17,0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <button type="button" onClick={() => { const nf = [...form.fields]; const t = nf[i]; nf[i] = nf[i - 1]; nf[i - 1] = t; setForm({ ...form, fields: nf }); }} disabled={i === 0} className="btn-ghost" style={{ padding: '1px 4px', opacity: i === 0 ? 0.2 : 1 }}><ArrowUp style={{ width: '11px', height: '11px' }} /></button>
                        <button type="button" onClick={() => { const nf = [...form.fields]; const t = nf[i]; nf[i] = nf[i + 1]; nf[i + 1] = t; setForm({ ...form, fields: nf }); }} disabled={i === form.fields.length - 1} className="btn-ghost" style={{ padding: '1px 4px', opacity: i === form.fields.length - 1 ? 0.2 : 1 }}><ArrowDown style={{ width: '11px', height: '11px' }} /></button>
                      </div>
                      <span style={{ fontSize: '13px', color: '#e2e8f0', flex: 1 }}>{f.name} <span style={{ color: '#64748b' }}>({f.type}{f.refContentType ? ` → ${f.refContentType}` : ''})</span></span>
                      {(f.pattern || f.minLength || f.maxLength) && <span style={{ fontSize: '10px', color: '#f59e0b' }}>✓ rules</span>}
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b', cursor: 'pointer' }}>
                        <input type="checkbox" checked={f.localizable} onChange={e => updateField(i, { localizable: e.target.checked })} style={{ accentColor: '#ff7e5f' }} />
                        L10n
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b', cursor: 'pointer' }}>
                        <input type="checkbox" checked={f.required} onChange={e => updateField(i, { required: e.target.checked })} style={{ accentColor: '#ff7e5f' }} />
                        Req
                      </label>
                      <button type="button" onClick={() => setForm({ ...form, fields: form.fields.filter((_, j) => j !== i) })} className="btn-ghost" style={{ padding: '4px', color: '#fca5a5' }}>
                        <Trash2 style={{ width: '12px', height: '12px' }} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', padding: '6px 12px 8px', flexWrap: 'wrap' }}>
                      <input value={f.pattern || ''} onChange={e => updateField(i, { pattern: e.target.value })} placeholder="Regex pattern" className="input-field" style={{ width: '160px', fontSize: '11px', padding: '4px 8px' }} />
                      <input value={f.patternMessage || ''} onChange={e => updateField(i, { patternMessage: e.target.value })} placeholder="Pattern error message" className="input-field" style={{ width: '180px', fontSize: '11px', padding: '4px 8px' }} />
                      {(f.type === 'String' || f.type === 'RichText') && (
                        <>
                          <input type="number" value={f.minLength || ''} onChange={e => updateField(i, { minLength: e.target.value ? Number(e.target.value) : undefined })} placeholder="Min len" className="input-field" style={{ width: '70px', fontSize: '11px', padding: '4px 8px' }} />
                          <input type="number" value={f.maxLength || ''} onChange={e => updateField(i, { maxLength: e.target.value ? Number(e.target.value) : undefined })} placeholder="Max len" className="input-field" style={{ width: '70px', fontSize: '11px', padding: '4px 8px' }} />
                        </>
                      )}
                      {f.type === 'Number' && (
                        <>
                          <input type="number" value={f.min ?? ''} onChange={e => updateField(i, { min: e.target.value ? Number(e.target.value) : undefined })} placeholder="Min" className="input-field" style={{ width: '70px', fontSize: '11px', padding: '4px 8px' }} />
                          <input type="number" value={f.max ?? ''} onChange={e => updateField(i, { max: e.target.value ? Number(e.target.value) : undefined })} placeholder="Max" className="input-field" style={{ width: '70px', fontSize: '11px', padding: '4px 8px' }} />
                        </>
                      )}
                      <input value={f.defaultValue ?? ''} onChange={e => updateField(i, { defaultValue: e.target.value || undefined })} placeholder="Default value" className="input-field" style={{ width: '120px', fontSize: '11px', padding: '4px 8px' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Response Caching</label>
              <div className="grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#475569', marginBottom: '4px' }}>Cache TTL (seconds, 0 = disabled)</label>
                  <select value={form.cacheTTL} onChange={e => setForm({ ...form, cacheTTL: Number(e.target.value) })} className="select-field">
                    <option value={0}>Disabled</option>
                    <option value={30}>30 seconds</option>
                    <option value={60}>1 minute</option>
                    <option value={300}>5 minutes</option>
                    <option value={600}>10 minutes</option>
                    <option value={3600}>1 hour</option>
                    <option value={86400}>24 hours</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BarChart3 style={{ width: '14px', height: '14px' }} /> Publishing Workflow
              </h4>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '12px' }}>
                <input type="checkbox" checked={form.workflowEnabled} onChange={e => setForm({ ...form, workflowEnabled: e.target.checked, workflowStages: e.target.checked ? [{ name: 'Draft', color: '#64748b' }, { name: 'Review', color: '#f59e0b' }, { name: 'Approved', color: '#8b5cf6' }, { name: 'Published', color: '#34d399' }] : [] })} style={{ accentColor: '#ff7e5f' }} />
                <span style={{ fontSize: '12px', color: '#e2e8f0' }}>Enable workflow stages</span>
              </label>
              {form.workflowEnabled && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {form.workflowStages.map((stage, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <input type="color" value={stage.color} onChange={e => { const s = [...form.workflowStages]; s[i] = { ...s[i], color: e.target.value }; setForm({ ...form, workflowStages: s }); }} style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', cursor: 'pointer', padding: 0 }} />
                      <input value={stage.name} onChange={e => { const s = [...form.workflowStages]; s[i] = { ...s[i], name: e.target.value }; setForm({ ...form, workflowStages: s }); }} placeholder="Stage name" className="input-field" style={{ flex: 1, fontSize: '12px', padding: '6px 10px' }} />
                      {i === form.workflowStages.length - 1 ? (
                        <button type="button" onClick={() => setForm({ ...form, workflowStages: [...form.workflowStages, { name: '', color: '#64748b' }] })} className="btn-ghost" style={{ padding: '4px 8px', fontSize: '11px' }}>+ Add</button>
                      ) : (
                        <button type="button" onClick={() => setForm({ ...form, workflowStages: form.workflowStages.filter((_, j) => j !== i) })} className="btn-ghost" style={{ padding: '4px', color: '#fca5a5' }}><Trash2 style={{ width: '12px', height: '12px' }} /></button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
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
        searchWidth="200px"
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
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => window.open(`/api/v1/content-types/${ct._id}/export/json`, '_blank')} className="btn-ghost" style={{ padding: '6px' }} title="Export schema">
                      <Download style={{ width: '14px', height: '14px' }} />
                    </button>
                    <button onClick={() => handleDuplicate(ct._id)} className="btn-ghost" style={{ padding: '6px' }}>
                      <Copy style={{ width: '14px', height: '14px' }} />
                    </button>
                    <button onClick={() => handleDelete(ct._id)} className="btn-ghost" style={{ padding: '6px' }}>
                      <Trash2 style={{ width: '14px', height: '14px' }} />
                    </button>
                  </div>
                </div>
              <Link to={`/content/${ct.slug}`} style={{ textDecoration: 'none' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>{ct.name}</h3>
                <p style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace', marginTop: '4px' }}>/{ct.slug}</p>
              </Link>
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '12px' }}>{ct.fields.length} fields</p>
              <p style={{ fontSize: '10px', color: '#475569', marginTop: '4px' }}>Created {new Date(ct.createdAt).toLocaleDateString()}</p>
              {ct.cacheTTL > 0 && (
                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16,185,129,0.1)', color: '#34d399', fontWeight: '600', display: 'inline-block', marginTop: '6px' }}>
                  Cache: {ct.cacheTTL}s
                </span>
              )}
              {ct.workflowEnabled && (
                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(139,92,246,0.1)', color: '#c4b5fd', fontWeight: '600', display: 'inline-block', marginTop: '6px', marginLeft: '4px' }}>
                  Workflow
                </span>
              )}
              {ct.locales && ct.locales.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {ct.locales.map(loc => (
                    <span key={loc} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,126,95,0.1)', color: '#ff7e5f', fontWeight: '600' }}>{loc}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
