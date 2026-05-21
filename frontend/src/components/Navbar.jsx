import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, LayoutDashboard, Layers, Key, BarChart3, FileText, Webhook, Image, Users, Settings, User, Book, ChevronDown, LogOut, Shield } from 'lucide-react';
import { useClerk, useUser } from '@clerk/clerk-react';
import { useRole } from '../hooks/useRole';

const allNavLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { to: '/content-types', label: 'Content Types', icon: Layers, adminOnly: false },
  { to: '/media', label: 'Media', icon: Image, adminOnly: false },
  { to: '/api-keys', label: 'API Keys', icon: Key, adminOnly: false },
  { to: '/api-docs', label: 'API Docs', icon: Book, adminOnly: false },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, adminOnly: true },
  { to: '/audit-logs', label: 'Audit Logs', icon: FileText, adminOnly: true },
  { to: '/webhooks', label: 'Webhooks', icon: Webhook, adminOnly: true },
  { to: '/users', label: 'Users', icon: Users, adminOnly: true },
];

export default function Navbar() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { isAdmin } = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => { signOut({ redirectUrl: '/' }); };
  const isActive = (to) => location.pathname === to || (to === '/content-types' && location.pathname.startsWith('/content'));

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.firstName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U';
  const displayName = user?.firstName || user?.username || 'User';
  const email = user?.primaryEmailAddress?.emailAddress || '';

  const navLinks = isAdmin ? allNavLinks : allNavLinks.filter(link => !link.adminOnly);

  return (
    <nav style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 100, 
      background: scrolled 
        ? 'rgba(8, 5, 17, 0.92)' 
        : 'rgba(8, 5, 17, 0.75)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: scrolled 
        ? '1px solid rgba(255, 126, 95, 0.10)' 
        : '1px solid rgba(255, 255, 255, 0.06)',
      boxShadow: scrolled 
        ? '0 10px 40px -15px rgba(0, 0, 0, 0.6), 0 0 20px rgba(139, 92, 246, 0.03)'
        : '0 4px 20px -10px rgba(0, 0, 0, 0.3)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '0 24px', 
        height: scrolled ? '56px' : '64px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '10px', 
              background: 'linear-gradient(135deg, #ff7e5f, #8b5cf6)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(255, 126, 95, 0.35)',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1) rotate(-5deg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1) rotate(0deg)'; }}
            >
              <Zap style={{ width: '16px', height: '16px', color: '#080511' }} />
            </div>
            <span style={{ 
              fontFamily: "'Outfit', sans-serif",
              fontSize: '18px', 
              fontWeight: '800', 
              letterSpacing: '-0.02em',
              background: 'linear-gradient(90deg, #fff, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>FlowForge</span>
          </Link>
          <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '3px' }}>
            {navLinks.map((link) => (
              <Link 
                key={link.to} 
                to={link.to} 
                title={link.label}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '36px', 
                  height: '36px',
                  fontSize: '12px', 
                  fontWeight: '500',
                  color: isActive(link.to) ? '#f8fafc' : '#64748b',
                  background: isActive(link.to) 
                    ? 'linear-gradient(135deg, rgba(255, 126, 95, 0.15), rgba(139, 92, 246, 0.10))' 
                    : 'transparent',
                  border: isActive(link.to) 
                    ? '1px solid rgba(255, 126, 95, 0.2)' 
                    : '1px solid transparent',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  transition: 'all 0.25s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => { 
                  if (!isActive(link.to)) { 
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; 
                    e.currentTarget.style.color = '#e2e8f0'; 
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  } 
                }}
                onMouseLeave={(e) => { 
                  if (!isActive(link.to)) { 
                    e.currentTarget.style.background = 'transparent'; 
                    e.currentTarget.style.color = '#64748b';
                    e.currentTarget.style.transform = 'translateY(0px)';
                  } 
                }}
              >
                <link.icon style={{ width: '17px', height: '17px' }} />
                {isActive(link.to) && (
                  <span style={{
                    position: 'absolute',
                    bottom: '-4px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '14px',
                    height: '2px',
                    borderRadius: '1px',
                    background: 'linear-gradient(90deg, #ff7e5f, #8b5cf6)',
                  }} />
                )}
              </Link>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative' }} ref={menuRef}>
          <button 
            onClick={() => setUserMenuOpen(!userMenuOpen)} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '4px 8px 4px 4px',
              background: userMenuOpen 
                ? 'linear-gradient(135deg, rgba(255,126,95,0.10), rgba(139,92,246,0.08))' 
                : 'transparent',
              border: userMenuOpen 
                ? '1px solid rgba(255,126,95,0.2)' 
                : '1px solid rgba(255,255,255,0.06)',
              borderRadius: '24px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (!userMenuOpen) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              }
            }}
            onMouseLeave={(e) => {
              if (!userMenuOpen) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              }
            }}
          >
            <div style={{ 
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff7e5f, #feb47b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: '700', color: '#080511',
              boxShadow: '0 2px 10px rgba(255,126,95,0.3)'
            }}>{initials}</div>
            <ChevronDown style={{ 
              width: '14px', height: '14px', color: '#64748b',
              transform: userMenuOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
          </button>

          {userMenuOpen && (
            <div style={{ 
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              width: '240px',
              background: 'rgba(12, 8, 22, 0.96)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '18px',
              padding: '8px',
              boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 40px rgba(139,92,246,0.08)',
              opacity: 0,
              transform: 'translateY(-8px)',
              animation: 'dropdown-enter 0.2s forwards ease-out'
            }}>
              <style>{`
                @keyframes dropdown-enter {
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>
              <div style={{ 
                padding: '14px 16px', 
                marginBottom: '4px', 
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff7e5f, #feb47b)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', fontWeight: '700', color: '#080511',
                  fontFamily: "'Outfit', sans-serif",
                  flexShrink: 0
                }}>{initials}</div>
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ 
                    fontSize: '14px', fontWeight: '700', color: '#f8fafc', 
                    fontFamily: "'Outfit', sans-serif",
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>{displayName}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <p style={{ 
                      fontSize: '11px', color: '#64748b',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>{email}</p>
                    {isAdmin && (
                      <span style={{ 
                        padding: '1px 6px', borderRadius: '4px', 
                        background: 'rgba(255,126,95,0.15)', 
                        border: '1px solid rgba(255,126,95,0.25)',
                        fontSize: '9px', fontWeight: '700', color: '#ff7e5f',
                        textTransform: 'uppercase', letterSpacing: '0.5px'
                      }}>Admin</span>
                    )}
                  </div>
                </div>
              </div>
              <Link 
                to="/profile" 
                onClick={() => setUserMenuOpen(false)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', fontSize: '13px',
                  color: '#94a3b8', borderRadius: '10px',
                  textDecoration: 'none', transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#f8fafc'; e.currentTarget.style.paddingLeft = '18px'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.paddingLeft = '14px'; }}
              >
                <User style={{ width: '14px', height: '14px' }} /> Profile
              </Link>
              <Link 
                to="/settings" 
                onClick={() => setUserMenuOpen(false)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', fontSize: '13px',
                  color: '#94a3b8', borderRadius: '10px',
                  textDecoration: 'none', transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#f8fafc'; e.currentTarget.style.paddingLeft = '18px'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.paddingLeft = '14px'; }}
              >
                <Settings style={{ width: '14px', height: '14px' }} /> Settings
              </Link>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '4px', paddingTop: '4px' }}>
                <button 
                  onClick={handleLogout} 
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%', padding: '10px 14px', fontSize: '13px',
                    color: '#fca5a5', background: 'transparent',
                    border: 'none', borderRadius: '10px',
                    cursor: 'pointer', transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.paddingLeft = '18px'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.paddingLeft = '14px'; }}
                >
                  <LogOut style={{ width: '14px', height: '14px' }} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
