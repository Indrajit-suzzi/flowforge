import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  if (start > 1) pages.push(1);
  if (start > 2) pages.push('...');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push('...');
  if (end < totalPages) pages.push(totalPages);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '20px 0' }}>
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="btn-ghost"
        aria-label="Previous page"
        style={{ padding: '8px 12px', opacity: page <= 1 ? 0.3 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
      >
        <ChevronLeft style={{ width: '16px', height: '16px' }} />
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} style={{ padding: '4px 8px', fontSize: '13px', color: '#475569' }}>...</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
            style={{
              minWidth: '32px', height: '32px', borderRadius: '8px', border: 'none',
              background: p === page ? 'rgba(255,126,95,0.15)' : 'transparent',
              color: p === page ? '#ff7e5f' : '#94a3b8',
              fontWeight: p === page ? 700 : 400,
              fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (p !== page) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { if (p !== page) e.currentTarget.style.background = 'transparent'; }}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="btn-ghost"
        aria-label="Next page"
        style={{ padding: '8px 12px', opacity: page >= totalPages ? 0.3 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
      >
        <ChevronRight style={{ width: '16px', height: '16px' }} />
      </button>
    </div>
  );
}
