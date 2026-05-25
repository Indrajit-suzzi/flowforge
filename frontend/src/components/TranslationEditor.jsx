import { useState, useEffect, useMemo } from 'react';
import { Globe, X, Save, Check } from 'lucide-react';
import api from '../utils/api';
import RichTextEditor from './RichTextEditor';

export default function TranslationEditor({ slug, entry, contentType, onClose }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [refData, setRefData] = useState({});

  const otherLocales = (contentType.locales || ['en']).filter(l => l !== entry.locale);
  const localizableFields = contentType.fields.filter(f => f.localizable);

  const defaultTranslations = useMemo(() => {
    const locs = (contentType.locales || ['en']).filter(l => l !== entry.locale);
    const fields = contentType.fields.filter(f => f.localizable);
    const initial = {};
    if (entry.translations) {
      for (const t of entry.translations) {
        initial[t.locale] = {};
        for (const f of fields) {
          initial[t.locale][f.name] = (t.fields && t.fields[f.name]) || entry[f.name] || '';
        }
      }
    }
    for (const loc of locs) {
      if (!initial[loc]) {
        initial[loc] = {};
        for (const f of fields) {
          initial[loc][f.name] = entry[f.name] || '';
        }
      }
    }
    return initial;
  }, [entry, contentType]);

  const [translations, setTranslations] = useState(defaultTranslations);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTranslations(defaultTranslations);
  }, [defaultTranslations]);

  useEffect(() => {
    const refFields = contentType.fields.filter(f => f.type === 'Reference' && f.refContentType);
    if (refFields.length > 0) {
      Promise.all(refFields.map(f =>
        api.get(`/api/v1/dynamic/${f.refContentType}`).then(r => ({ slug: f.refContentType, data: r.data || [] })).catch(() => ({ slug: f.refContentType, data: [] }))
      )).then(results => {
        const map = {};
        results.forEach(r => { map[r.slug] = r.data; });
        setRefData(map);
      });
    }
  }, [contentType]);

  const handleChange = (locale, field, value) => {
    setTranslations(prev => ({
      ...prev,
      [locale]: { ...prev[locale], [field]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const translationsArray = otherLocales
        .filter(loc => translations[loc])
        .map(loc => ({
          locale: loc,
          fields: translations[loc]
        }));

      await api.put(`/api/v1/dynamic/${slug}/${entry._id}`, {
        translations: translationsArray,
        changeDescription: 'Updated translations'
      });

      setSaved(true);
      setTimeout(() => { setSaved(false); onClose?.(); }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save translations');
    } finally {
      setSaving(false);
    }
  };

  if (localizableFields.length === 0) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
        <div className="glass-card" style={{ padding: '40px', maxWidth: '500px', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '14px' }}>No localizable fields on this content type. Edit the content type to mark fields as localizable.</p>
          <button onClick={onClose} className="btn-secondary" style={{ marginTop: '20px' }}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="glass-card" style={{ width: '90%', maxWidth: '800px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'fadeIn 0.2s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255, 126, 95, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255, 126, 95, 0.2)' }}>
              <Globe style={{ width: '16px', height: '16px', color: '#ff7e5f' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>Translations</h2>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Primary locale: <strong style={{ color: '#f8fafc' }}>{entry.locale}</strong></p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '8px' }}>
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {error && (
            <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#fca5a5', fontSize: '13px', marginBottom: '16px' }}>{error}</div>
          )}

          {otherLocales.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No additional locales configured. Edit the content type to add more locales.</p>
          ) : (
            otherLocales.map(locale => (
              <div key={locale} style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', padding: '8px 12px', background: 'rgba(255,126,95,0.06)', borderRadius: '8px', border: '1px solid rgba(255,126,95,0.12)' }}>
                  <Globe style={{ width: '14px', height: '14px', color: '#ff7e5f' }} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc' }}>{locale}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                  {localizableFields.map(f => (
                    <div key={f.name} style={f.type === 'RichText' ? { gridColumn: '1 / -1' } : {}}>
                      <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>{f.name}</label>
                      {f.type === 'Boolean' ? (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={translations[locale]?.[f.name] || false} onChange={e => handleChange(locale, f.name, e.target.checked)} style={{ accentColor: '#ff7e5f' }} />
                          <span style={{ fontSize: '12px', color: translations[locale]?.[f.name] ? '#34d399' : '#64748b' }}>{translations[locale]?.[f.name] ? 'Yes' : 'No'}</span>
                        </label>
                      ) : f.type === 'RichText' ? (
                        <RichTextEditor value={translations[locale]?.[f.name] || ''} onChange={(html) => handleChange(locale, f.name, html)} placeholder={`${f.name} (${locale})...`} />
                      ) : f.type === 'Number' ? (
                        <input type="number" value={translations[locale]?.[f.name] || ''} onChange={e => handleChange(locale, f.name, Number(e.target.value))} className="input-field" />
                      ) : f.type === 'Reference' ? (
                        <select value={translations[locale]?.[f.name] || ''} onChange={e => handleChange(locale, f.name, e.target.value)} className="select-field">
                          <option value="">Select...</option>
                          {(refData[f.refContentType] || []).map(ref => (
                            <option key={ref._id} value={ref._id}>
                              {Object.values(ref).filter(v => typeof v === 'string' && v !== ref._id && v !== ref.tenantId && v !== ref.status)[0] || ref._id}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input type={f.type === 'Date' ? 'date' : 'text'} value={translations[locale]?.[f.name] || ''} onChange={e => handleChange(locale, f.name, e.target.value)} className="input-field" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {otherLocales.length > 0 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button onClick={onClose} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving || saved} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', border: 'none' }}>
              {saved ? <Check style={{ width: '14px', height: '14px' }} /> : <Save style={{ width: '14px', height: '14px' }} />}
              {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Translations'}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
