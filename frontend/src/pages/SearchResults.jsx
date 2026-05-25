import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, FileText, ArrowRight, Layers } from 'lucide-react';
import api from '../utils/api';
import PageShell from '../components/PageShell';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query || query.length < 2) return;
    api.get(`/api/v1/search?q=${encodeURIComponent(query)}`)
      .then(r => {
        setResults(r.data.data || []);
        setTotal(r.data.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query]);

  return (
    <PageShell
      title="Search"
      subtitle={query ? `Results for "${query}"` : 'Search across all content'}
      icon={<Search style={{ width: '22px', height: '22px' }} />}
      maxWidth="900px"
    >
      {!query && (
        <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
          <Search style={{ width: '40px', height: '40px', color: '#475569', marginBottom: '16px' }} />
          <p style={{ color: '#64748b', fontSize: '14px' }}>Enter a search term to find content across all types.</p>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Searching...</div>
      )}

      {!loading && query && total === 0 && (
        <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '14px' }}>No results found for "{query}"</p>
        </div>
      )}

      {results.map(group => (
        <div key={group.contentTypeSlug} className="glass-card" style={{ padding: '24px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,126,95,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,126,95,0.2)' }}>
                <Layers style={{ width: '14px', height: '14px', color: '#ff7e5f' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>{group.contentTypeName}</h3>
                <code style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace' }}>/{group.contentTypeSlug}</code>
              </div>
            </div>
            <Link to={`/content/${group.contentTypeSlug}`} className="btn-ghost" style={{ fontSize: '12px', padding: '6px 12px', textDecoration: 'none' }}>
              View all <ArrowRight style={{ width: '12px', height: '12px' }} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {group.entries.map(entry => (
              <Link key={entry._id} to={`/content/${group.contentTypeSlug}`} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px',
                background: 'rgba(8,5,17,0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)',
                textDecoration: 'none', transition: 'all 0.15s ease'
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(8,5,17,0.4)'}
              >
                <FileText style={{ width: '14px', height: '14px', color: '#475569', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#e2e8f0', flex: 1 }}>{entry.label}</span>
                <span className={`badge ${entry.status === 'published' ? 'badge-published' : entry.status === 'scheduled' ? 'badge-scheduled' : 'badge-draft'}`} style={{ fontSize: '9px' }}>
                  {entry.status || 'draft'}
                </span>
                <span style={{ fontSize: '10px', color: '#475569' }}>
                  {new Date(entry.updatedAt || entry.createdAt).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </PageShell>
  );
}
