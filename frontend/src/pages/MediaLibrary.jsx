import { useState, useEffect, useRef } from 'react';
import { Trash2, Image, FileText, Video, Music, Upload, Copy, Check, ImageIcon } from 'lucide-react';
import api from '../utils/api';
import PageShell from '../components/PageShell';
import FilterBar from '../components/FilterBar';

const typeIcons = { image: Image, document: FileText, video: Video, audio: Music, other: FileText };

export default function MediaLibrary() {
  const [media, setMedia] = useState([]);
  const [filter, setFilter] = useState('');
  const [copied, setCopied] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => { 
    api.get(`/api/v1/media${filter ? `?type=${filter}` : ''}`).then(r => { setMedia(r.data || []); }).catch(() => {}); 
  }, [filter]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    await api.post('/api/v1/media', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    const r = await api.get('/api/v1/media');
    setMedia(r.data || []);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this file?')) return;
    await api.delete(`/api/v1/media/${id}`);
    setMedia(media.filter(m => m._id !== id));
  };

  const copyUrl = async (url, id) => {
    await navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filterActions = (
    <>
      <div className="filter-group">
        {['', 'image', 'document', 'video', 'audio'].map(t => (
          <button key={t} onClick={() => setFilter(t)} className={`filter-btn ${filter === t ? 'active' : ''}`}>{t || 'All'}</button>
        ))}
      </div>
      <button onClick={() => fileInputRef.current?.click()} className="btn-primary" style={{ padding: '9px 18px', fontSize: '13px' }}>
        <Upload style={{ width: '14px', height: '14px' }} /> Upload
      </button>
      <input ref={fileInputRef} type="file" onChange={handleUpload} style={{ display: 'none' }} />
    </>
  );

  return (
    <PageShell
      title="Media Library"
      subtitle="Upload and manage your files"
      icon={<ImageIcon style={{ width: '22px', height: '22px' }} />}
      iconColor="#34d399"
    >
      <FilterBar
        filters={[]}
        actions={filterActions}
      />

      {media.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
          <Upload style={{ width: '40px', height: '40px', color: '#475569', marginBottom: '16px', margin: '0 auto 16px', display: 'block' }} />
          <p className="empty-state-text">No files uploaded yet</p>
          <button onClick={() => fileInputRef.current?.click()} className="btn-primary">Upload File</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {media.map(m => {
            const Icon = typeIcons[m.type] || FileText;
            return (
              <div key={m._id} className="glass-card-sm" style={{ overflow: 'hidden' }}>
                {m.type === 'image' ? (
                  <div style={{ height: '140px', background: 'rgba(8,5,17,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img src={m.url} alt={m.alt || m.originalName} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} />
                  </div>
                ) : (
                  <div style={{ height: '140px', background: 'rgba(8,5,17,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon style={{ width: '40px', height: '40px', color: '#475569' }} />
                  </div>
                )}
                <div style={{ padding: '14px' }}>
                  <p style={{ fontSize: '13px', color: '#f8fafc', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.originalName}</p>
                  <p style={{ fontSize: '10px', color: '#475569', marginTop: '4px' }}>{(m.size / 1024).toFixed(1)} KB</p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button onClick={() => copyUrl(m.url, m._id)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: '11px', color: copied === m._id ? '#34d399' : '#94a3b8' }}>
                      {copied === m._id ? <Check style={{ width: '12px', height: '12px' }} /> : <Copy style={{ width: '12px', height: '12px' }} />} {copied === m._id ? 'Copied' : 'Copy URL'}
                    </button>
                    <button onClick={() => handleDelete(m._id)} className="btn-ghost" style={{ padding: '6px 10px', color: '#fca5a5' }}>
                      <Trash2 style={{ width: '12px', height: '12px' }} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
