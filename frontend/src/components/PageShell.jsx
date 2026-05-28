import { Sparkles } from 'lucide-react';

export default function PageShell({
  title,
  subtitle,
  icon,
  iconColor = '#ff7e5f',
  actions,
  children,
  maxWidth = '1400px',
  loading = false,
  error = null,
  className = '',
  showGlow = true,
}) {
  return (
    <div className={`page-container ${className}`} style={{ maxWidth, position: 'relative' }}>
      {/* Decorative glow blobs (subtle) */}
      {showGlow && (
        <>
          <div className="admin-glow-blob peach" style={{ top: '-10%', left: '-8%', width: '350px', height: '350px' }} />
          <div className="admin-glow-blob purple" style={{ bottom: '5%', right: '-5%', width: '300px', height: '300px' }} />
        </>
      )}

      {/* Page header */}
      <div className="page-header" style={{ marginBottom: '36px' }}>
        <div>
          <h1 className="page-title" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            fontSize: '28px',
            fontWeight: '800',
            letterSpacing: '-0.02em'
          }}>
            {icon ? (
              <span style={{ 
                color: iconColor, 
                display: 'flex', 
                padding: '6px',
                background: `${iconColor}12`,
                borderRadius: '12px',
                border: `1px solid ${iconColor}25`,
              }}>
                {icon}
              </span>
            ) : (
              <span style={{ 
                color: iconColor, 
                display: 'flex', 
                padding: '6px',
                background: `${iconColor}12`,
                borderRadius: '12px',
                border: `1px solid ${iconColor}25`,
              }}>
                <Sparkles style={{ width: '22px', height: '22px' }} />
              </span>
            )}
            {title}
          </h1>
          {subtitle && (
            <p className="page-subtitle" style={{ 
              fontSize: '14px', 
              color: '#94a3b8', 
              marginTop: '6px',
              marginLeft: '56px',
              lineHeight: '1.5'
            }}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {actions}
          </div>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          padding: '14px 18px', borderRadius: '14px',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.15)',
          color: '#fca5a5', marginBottom: '24px', fontSize: '13px',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ 
            width: '6px', height: '6px', borderRadius: '50%', 
            background: '#ef4444', flexShrink: 0,
            boxShadow: '0 0 8px rgba(239,68,68,0.5)'
          }} />
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="glass-card" style={{ 
          padding: '80px 40px', 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderRadius: '12px' }} />
          <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Loading...</p>
        </div>
      ) : (
        children
      )}

      {/* Divider at bottom for pages with lots of content */}
      {!loading && !error && <div className="section-separator" style={{ marginTop: '48px', marginBottom: 0 }} />}
    </div>
  );
}
