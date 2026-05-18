import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Image, FileText, Video, Music, Upload, Copy, Check } from 'lucide-react';
import api from '../utils/api';
import LoadingScreen from '../components/LoadingScreen';

const typeIcons = { image: Image, document: FileText, video: Video, audio: Music, other: FileText };

export default function MediaLibrary() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [copied, setCopied] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => { 
    api.get(`/api/v1/media${filter ? `?type=${filter}` : ''}`).then(r => { setMedia(r.data || []); setLoading(false); }).catch(() => setLoading(false)); 
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

  if (loading) return <LoadingScreen message="Loading media library" />;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9' }}>Media Library</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Upload and manage your files</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['', 'image', 'document', 'video', 'audio'].map(t => (
              <button key={t} onClick={() => setFilter(t)} style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '500', color: filter === t ? '#f1f5f9' : '#64748b', background: filter === t ? '#1e293b' : 'transparent', border: '1px solid #1e293b', borderRadius: '6px', cursor: 'pointer', textTransform: 'capitalize' }}>
                {t || 'All'}
              </button>
            ))}
          </div>
          <button onClick={() => fileInputRef.current?.click()} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: 'white', background: 'linear-gradient(90deg, #3b82f6, #6366f1)', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
            <Upload style={{ width: '14px', height: '14px' }} /> Upload
          </button>
          <input ref={fileInputRef} type="file" onChange={handleUpload} style={{ display: 'none' }} />
        </div>
      </div>

      {media.length === 0 ? (
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '60px', textAlign: 'center' }}>
          <Upload style={{ width: '32px', height: '32px', color: '#475569', marginBottom: '16px' }} />
          <p style={{ color: '#94a3b8', marginBottom: '16px' }}>No files uploaded yet</p>
          <button onClick={() => fileInputRef.current?.click()} style={{ padding: '10px 20px', background: 'linear-gradient(90deg, #3b82f6, #6366f1)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Upload File</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {media.map(m => {
            const Icon = typeIcons[m.type] || FileText;
            return (
              <div key={m._id} style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '10px', overflow: 'hidden' }}>
                {m.type === 'image' ? (
                  <div style={{ height: '120px', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img src={m.url} alt={m.alt || m.originalName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{ height: '120px', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon style={{ width: '32px', height: '32px', color: '#475569' }} />
                  </div>
                )}
                <div style={{ padding: '12px' }}>
                  <p style={{ fontSize: '12px', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.originalName}</p>
                  <p style={{ fontSize: '10px', color: '#475569', marginTop: '4px' }}>{(m.size / 1024).toFixed(1)} KB</p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button onClick={() => copyUrl(m.url, m._id)} style={{ flex: 1, padding: '4px', background: '#1e293b', border: 'none', borderRadius: '4px', color: copied === m._id ? '#34d399' : '#94a3b8', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      {copied === m._id ? <Check style={{ width: '10px', height: '10px' }} /> : <Copy style={{ width: '10px', height: '10px' }} />} {copied === m._id ? 'Copied' : 'Copy'}
                    </button>
                    <button onClick={() => handleDelete(m._id)} style={{ padding: '4px 8px', background: '#1e293b', border: 'none', borderRadius: '4px', color: '#fca5a5', cursor: 'pointer', fontSize: '10px' }}>
                      <Trash2 style={{ width: '10px', height: '10px' }} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}