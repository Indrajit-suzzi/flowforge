import { Search } from 'lucide-react';

export default function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  searchWidth = '200px',
  filters = [],
  actions,
  style,
}) {
  const hasSearch = onSearchChange !== undefined;
  const hasFilters = filters.length > 0;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px',
        ...style,
      }}
    >
      {(hasSearch || hasFilters) && (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {hasSearch && (
            <div className="search-wrapper" style={{ minWidth: '160px', position: 'relative' }}>
              <Search className="search-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#64748b' }} />
              <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="search-input"
                style={{
                  width: searchWidth,
                  padding: '10px 12px 10px 36px',
                  background: 'rgba(8, 5, 17, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '13px',
                  outline: 'none',
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}
              />
            </div>
          )}
          {filters.map((filter, idx) => {
            if (filter.type === 'buttons') {
              return (
                <div key={idx} className="filter-group" style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', padding: '3px' }}>
                  {filter.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => filter.onChange(opt.value)}
                      className={`filter-btn ${filter.value === opt.value ? 'active' : ''}`}
                      className={`filter-btn ${filter.value === opt.value ? 'active' : ''}`}
                      style={{
                        padding: '7px 14px',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: filter.value === opt.value ? '#f8fafc' : '#64748b',
                        background: filter.value === opt.value 
                          ? 'linear-gradient(135deg, rgba(255,126,95,0.15), rgba(139,92,246,0.10))' 
                          : 'transparent',
                        border: filter.value === opt.value 
                          ? '1px solid rgba(255,126,95,0.2)' 
                          : '1px solid transparent',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textTransform: 'capitalize'
                      }}
                    >
                      {opt.label || opt.value || 'All'}
                    </button>
                  ))}
                </div>
              );
            }

            if (filter.type === 'select') {
              return (
                <select
                  key={idx}
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className="filter-select"
                  style={{
                    padding: '9px 14px',
                    background: 'rgba(8, 5, 17, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    fontSize: '12px',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    outline: 'none',
                    cursor: 'pointer',
                    minWidth: '120px'
                  }}
                >
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label || opt.value || 'All'}
                    </option>
                  ))}
                </select>
              );
            }

            return null;
          })}
        </div>
      )}

      {actions && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {actions}
        </div>
      )}
    </div>
  );
}
