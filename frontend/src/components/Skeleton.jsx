export function SkeletonCard({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton skeleton-card" style={{ marginBottom: count > 1 ? '12px' : 0 }} />
      ))}
    </>
  );
}

export function SkeletonTable({ rows = 4 }) {
  return (
    <div className="glass-card" style={{ padding: '4px 0' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-glass)' }}>
        <div className="skeleton skeleton-heading" style={{ margin: 0 }} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton skeleton-row" style={{ margin: '4px 16px' }} />
      ))}
    </div>
  );
}

export function SkeletonForm({ fields = 3 }) {
  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} style={{ marginBottom: '16px' }}>
          <div className="skeleton skeleton-text-sm" />
          <div className="skeleton" style={{ height: '40px', width: '100%' }} />
        </div>
      ))}
      <div className="skeleton" style={{ height: '38px', width: '120px', marginTop: '8px' }} />
    </div>
  );
}

export function SkeletonStats({ count = 3 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: '16px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card" style={{ padding: '20px' }}>
          <div className="skeleton skeleton-text-sm" />
          <div className="skeleton" style={{ height: '28px', width: '60px', marginTop: '8px' }} />
        </div>
      ))}
    </div>
  );
}
