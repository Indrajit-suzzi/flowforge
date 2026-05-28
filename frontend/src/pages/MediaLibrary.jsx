import { useState, useEffect, useRef } from 'react';
import { Trash2, Image, FileText, Video, Music, Upload, Copy, Check, ImageIcon } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';
import PageShell from '../components/PageShell';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';

const typeIcons = { image: Image, document: FileText, video: Video, audio: Music, other: FileText };

export default function MediaLibrary() {
  const toast = useToast();
  const [media, setMedia] = useState([]);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [copied, setCopied] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => { 
    api.get(`/api/v1/media?page=${page}${filter ? `&type=${filter}` : ''}`).then(r => { 
      const resp = r.data || { data: [], total: 0, page: 1, totalPages: 1 };
      setMedia(resp.data || resp || []);
      if (resp.totalPages) setTotalPages(resp.totalPages);
    }).catch(() => {}); 
  }, [filter, page]);

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'application/pdf', 'application/json', 'text/plain', 'text/csv'];
  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
      alert(`File type "${file.type}" is not allowed.`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert(`File is too large. Maximum size is 50MB.`);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/api/v1/media', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const r = await api.get(`/api/v1/media?page=${page}`);
      setMedia(r.data?.data || r.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Upload failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this file?')) return;
    try {
      await api.delete(`/api/v1/media/${id}`);
      setMedia(media.filter(m => m._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete file');
    }
  };

  const copyUrl = async (url, id) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('Failed to copy URL');
    }
  };

  const filterActions = (
    <>
      <div className="filter-group">
        {['', 'image', 'document', 'video', 'audio'].map(t => (
          <button key={t} onClick={() => { setFilter(t); setPage(1); }} className={`filter-btn ${filter === t ? 'active' : ''}`}>{t || 'All'}</button>
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
                    <img src={m.url} alt={m.alt || m.originalName} className="media-thumb-img" />
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
      <Pagination page={page} totalPages={totalPages} onChange={p => { setPage(p); }} />
    </PageShell>
  );
}
