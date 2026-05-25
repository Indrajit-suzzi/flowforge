import { CheckSquare, Square } from 'lucide-react';

export default function DataTable({
  columns = [],
  data = [],
  onRowClick,
  selectable = false,
  selected = [],
  onToggleSelect,
  onSelectAll,
  allSelected = false,
  emptyState,
  loading = false,
}) {
  if (loading) return null;

  if (data.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
        {emptyState || <p style={{ color: '#64748b' }}>No data found</p>}
      </div>
    );
  }

  const gridTemplateColumns = columns
    .map((c) => c.width || '1fr')
    .join(' ');

  const hasSelection = selectable && onToggleSelect;
  const headerGridCols = hasSelection ? `40px ${gridTemplateColumns}` : gridTemplateColumns;
  const rowGridCols = hasSelection ? `40px ${gridTemplateColumns}` : gridTemplateColumns;

  return (
    <div className="glass-card data-table" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      {/* Table header */}
      <div
        className="data-table-header"
        style={{ 
          gridTemplateColumns: headerGridCols,
          background: 'rgba(255, 255, 255, 0.02)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '14px 18px',
          fontSize: '10px',
          letterSpacing: '0.8px',
          textTransform: 'uppercase',
          color: '#64748b'
        }}
      >
        {hasSelection && (
          <button
            onClick={onSelectAll}
            className="btn-ghost"
            style={{
              padding: '0',
              border: 'none',
              width: 'fit-content',
              color: allSelected || selected.length === data.length ? '#ff7e5f' : '#64748b',
              transition: 'color 0.2s ease'
            }}
          >
            {allSelected || (selected.length === data.length && data.length > 0) ? (
              <CheckSquare style={{ width: '15px', height: '15px' }} />
            ) : (
              <Square style={{ width: '15px', height: '15px' }} />
            )}
          </button>
        )}
        {columns.map((col) => (
          <span key={col.key} style={{ fontWeight: '600' }}>{col.label}</span>
        ))}
      </div>

      {/* Table rows */}
      {data.map((item, idx) => (
        <div
          key={item._id || item.id}
          className="data-table-row"
          style={{
            gridTemplateColumns: rowGridCols,
            cursor: onRowClick ? 'pointer' : 'default',
            padding: '13px 18px',
            borderBottom: idx < data.length - 1 ? '1px solid rgba(255, 255, 255, 0.04)' : 'none',
            background: selected.includes(item._id || item.id) 
              ? 'rgba(255, 126, 95, 0.04)' 
              : idx % 2 === 0 
                ? 'rgba(255, 255, 255, 0.01)' 
                : 'transparent',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
          onClick={() => onRowClick?.(item)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = selected.includes(item._id || item.id) 
              ? 'rgba(255, 126, 95, 0.04)' 
              : idx % 2 === 0 
                ? 'rgba(255, 255, 255, 0.01)' 
                : 'transparent';
          }}
        >
          {hasSelection && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(item._id || item.id);
              }}
              className="btn-ghost"
              style={{
                padding: '0',
                border: 'none',
                width: 'fit-content',
                color: selected.includes(item._id || item.id) ? '#ff7e5f' : '#475569',
                transition: 'color 0.2s ease'
              }}
            >
              {selected.includes(item._id || item.id) ? (
                <CheckSquare style={{ width: '15px', height: '15px' }} />
              ) : (
                <Square style={{ width: '15px', height: '15px' }} />
              )}
            </button>
          )}
          {columns.map((col) => (
            <div key={col.key} style={{ fontSize: '13px', color: '#e2e8f0' }}>
              {col.render ? col.render(item) : item[col.key] ?? <span style={{ color: '#475569' }}>—</span>}
            </div>
          ))}
        </div>
      ))}

      {/* Row count footer */}
      <div style={{
        padding: '10px 18px',
        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        fontSize: '11px',
        color: '#475569',
        textAlign: 'right'
      }}>
        {data.length} {data.length === 1 ? 'row' : 'rows'}
      </div>
    </div>
  );
}
