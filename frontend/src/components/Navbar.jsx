import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, LayoutDashboard, Layers, Key, BarChart3, FileText, Webhook, Image, Users, Settings, User, Book, ChevronDown, LogOut } from 'lucide-react';
import { useClerk, useUser } from '@clerk/clerk-react';
import { useRole } from '../hooks/useRole';
import './Navbar.css';

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
    <nav className="navbar-container" style={{ 
      background: scrolled ? 'rgba(8, 5, 17, 0.8)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent',
    }}>
      <div className="navbar-inner" style={{ height: scrolled ? '56px' : '64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link to="/dashboard" className="navbar-logo-link">
            <div className="navbar-logo-icon">
              <Zap style={{ width: '16px', height: '16px', color: '#080511' }} />
            </div>
            <span className="navbar-logo-text">FlowForge</span>
          </Link>
          <div className="navbar-links-wrapper">
            {navLinks.map((link) => (
              <Link 
                key={link.to} 
                to={link.to} 
                className="navbar-link"
                style={{ 
                  color: isActive(link.to) ? '#fff' : '#94a3b8',
                  background: isActive(link.to) ? 'rgba(255,255,255,0.08)' : 'transparent',
                }}
                onMouseEnter={(e) => { 
                  if (!isActive(link.to)) { 
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; 
                    e.currentTarget.style.color = '#fff'; 
                  } 
                }}
                onMouseLeave={(e) => { 
                  if (!isActive(link.to)) { 
                    e.currentTarget.style.background = 'transparent'; 
                    e.currentTarget.style.color = '#94a3b8';
                  } 
                }}
              >
                <link.icon style={{ width: '16px', height: '16px' }} />
                <span className="navbar-link-label">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative' }} ref={menuRef}>
          <button 
            onClick={() => setUserMenuOpen(!userMenuOpen)} 
            className="user-menu-button"
            style={{ 
              background: userMenuOpen 
                ? 'linear-gradient(135deg, rgba(255,126,95,0.10), rgba(139,92,246,0.08))' 
                : 'transparent',
              border: userMenuOpen 
                ? '1px solid rgba(255,126,95,0.2)' 
                : '1px solid rgba(255,255,255,0.06)',
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
            <div className="user-avatar-small">{initials}</div>
            <ChevronDown style={{ 
              width: '14px', height: '14px', color: '#64748b',
              transform: userMenuOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -20, rotateX: -15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, rotateX: -15, scale: 0.95 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="user-menu-dropdown"
              >
                <div className="user-menu-header">
                  <div className="user-avatar-large">{initials}</div>
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
                  className="user-menu-item"
                >
                  <User style={{ width: '14px', height: '14px' }} /> Profile
                </Link>
                <Link 
                  to="/settings" 
                  onClick={() => setUserMenuOpen(false)}
                  className="user-menu-item"
                >
                  <Settings style={{ width: '14px', height: '14px' }} /> Settings
                </Link>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '4px', paddingTop: '4px' }}>
                  <button onClick={handleLogout} className="logout-button">
                    <LogOut style={{ width: '14px', height: '14px' }} /> Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
