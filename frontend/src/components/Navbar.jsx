import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, LayoutDashboard, Layers, Key, LogOut, BarChart3, FileText, Webhook, Image, Users, Settings, User, Book, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const allNavLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: null },
  { to: '/content-types', label: 'Content Types', icon: Layers, permission: 'contentTypes' },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, permission: 'analytics' },
  { to: '/audit-logs', label: 'Audit Logs', icon: FileText, permission: 'auditLogs' },
  { to: '/webhooks', label: 'Webhooks', icon: Webhook, permission: 'webhooks' },
  { to: '/media', label: 'Media', icon: Image, permission: 'mediaLibrary' },
  { to: '/api-keys', label: 'API Keys', icon: Key, permission: 'apiKeys' },
  { to: '/api-docs', label: 'API Docs', icon: Book, permission: null },
  { to: '/users', label: 'Users', icon: Users, permission: 'userManagement' },
];

export default function Navbar() {
  const { logout, hasPermission, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (to) => location.pathname === to || (to === '/content-types' && location.pathname.startsWith('/content'));
  const navLinks = allNavLinks.filter(link => !link.permission || hasPermission(link.permission));

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.username?.charAt(0).toUpperCase() || 'U';

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: '#0a0f1e', borderBottom: '1px solid #1e293b' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap style={{ width: '14px', height: '14px', color: 'white' }} />
            </div>
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#f1f5f9' }}>FlowForge</span>
          </Link>
          <div style={{ display: 'flex', gap: '2px' }}>
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} title={link.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', fontSize: '13px', fontWeight: '500', color: isActive(link.to) ? '#f1f5f9' : '#64748b', background: isActive(link.to) ? '#1e293b' : 'transparent', borderRadius: '8px', textDecoration: 'none', transition: 'all 0.15s' }}>
                <link.icon style={{ width: '16px', height: '16px' }} />
              </Link>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative' }} ref={menuRef}>
          <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px 4px 4px', background: userMenuOpen ? '#1e293b' : 'transparent', border: '1px solid #1e293b', borderRadius: '20px', cursor: 'pointer' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'white' }}>{initials}</div>
            <ChevronDown style={{ width: '14px', height: '14px', color: '#64748b', transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {userMenuOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '200px', background: '#111827', border: '1px solid #1e293b', borderRadius: '10px', padding: '8px', boxShadow: '0 10px 40px rgba(0,0,0,0.4)' }}>
              <div style={{ padding: '8px 12px', marginBottom: '8px', borderBottom: '1px solid #1e293b' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>{user?.username || 'User'}</p>
                <p style={{ fontSize: '11px', color: '#64748b' }}>{user?.email || ''}</p>
              </div>
              <Link to="/profile" onClick={() => setUserMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '13px', color: '#94a3b8', borderRadius: '6px', textDecoration: 'none' }}>
                <User style={{ width: '14px', height: '14px' }} /> Profile
              </Link>
              <Link to="/settings" onClick={() => setUserMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '13px', color: '#94a3b8', borderRadius: '6px', textDecoration: 'none' }}>
                <Settings style={{ width: '14px', height: '14px' }} /> Settings
              </Link>
              <div style={{ borderTop: '1px solid #1e293b', marginTop: '8px', paddingTop: '8px' }}>
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', fontSize: '13px', color: '#fca5a5', background: 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
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