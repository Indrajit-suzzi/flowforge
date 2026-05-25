import { Zap } from 'lucide-react';

export default function Footer({ maxWidth = '1400px' }) {
  return (
    <footer style={{ 
      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      background: 'rgba(8, 5, 17, 0.8)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      position: 'relative',
      zIndex: 10,
      marginTop: '60px'
    }}>
      <div style={{ 
        maxWidth, 
        margin: '0 auto', 
        padding: '24px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '28px', height: '28px', borderRadius: '8px', 
            background: 'linear-gradient(135deg, #ff7e5f, #8b5cf6)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px rgba(255, 126, 95, 0.3)'
          }}>
            <Zap style={{ width: '14px', height: '14px', color: '#080511' }} />
          </div>
          <span style={{ 
            fontFamily: "'Outfit', sans-serif",
            fontSize: '15px', 
            fontWeight: '700', 
            letterSpacing: '-0.02em',
            background: 'linear-gradient(90deg, #fff, #94a3b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            FlowForge
          </span>
        </div>

        <span style={{ 
          fontSize: '12px', 
          color: '#64748b',
          textAlign: 'center'
        }}>
          © 2026 FlowForge Headless CMS. MIT License.
        </span>

        <a 
          href="https://github.com/Indrajit-suzzi/flowforge" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            fontSize: '12px', 
            color: '#94a3b8', 
            textDecoration: 'none',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#f8fafc'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg> GitHub
        </a>
      </div>
    </footer>
  );
}
