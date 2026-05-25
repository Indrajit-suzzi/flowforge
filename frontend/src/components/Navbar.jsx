import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Zap, LayoutDashboard, Layers, Key, BarChart3, FileText, Webhook, Image, Users, Settings, User, Book, ChevronDown, LogOut, Shield, Search, Code, ClipboardList, CalendarDays, Tag } from 'lucide-react';
import { useClerk, useUser } from '@clerk/clerk-react';
import { useRole } from '../hooks/useRole';
import './Navbar.css';

const categories = [
  {
    label: 'Content', icon: FileText,
    links: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/content-types', label: 'Content Types', icon: Layers },
      { to: '/media', label: 'Media', icon: Image },
      { to: '/calendar', label: 'Calendar', icon: CalendarDays },
    ]
  },
  {
    label: 'Develop', icon: Code,
    links: [
      { to: '/api-keys', label: 'API Keys', icon: Key },
      { to: '/api-docs', label: 'API Docs', icon: Book },
      { to: '/webhooks', label: 'Webhooks', icon: Webhook },
      { to: '/forms', label: 'Forms', icon: ClipboardList },
      { to: '/tags', label: 'Tags', icon: Tag },
    ]
  },
  {
    label: 'Admin', icon: Shield, adminOnly: true,
    links: [
      { to: '/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/audit-logs', label: 'Audit Logs', icon: FileText },
      { to: '/users', label: 'Users', icon: Users },
      { to: '/roles', label: 'Roles', icon: Shield },
    ]
  },
];

export default function Navbar() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { isAdmin } = useRole();
  const location = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [openCat, setOpenCat] = useState(null);
  const [userOpen, setUserOpen] = useState(false);
  const [search, setSearch] = useState('');
  const btns = useRef({});
  const userBtn = useRef(null);
  const [userPos, setUserPos] = useState({});

  const closeAll = useCallback(() => { setOpenCat(null); setUserOpen(false); }, []);

  useEffect(() => { closeAll(); }, [location.pathname, closeAll]);

  useEffect(() => {
    if (userOpen && userBtn.current) {
      const r = userBtn.current.getBoundingClientRect();
      setUserPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    }
  }, [userOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const initials = user?.firstName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U';
  const displayName = user?.firstName || user?.username || 'User';
  const email = user?.primaryEmailAddress?.emailAddress || '';
  const visibleCategories = categories.filter(c => !c.adminOnly || isAdmin);

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      <nav style={{
        background: scrolled ? 'rgba(8,5,17,0.85)' : 'rgba(8,5,17,0.5)',
        backdropFilter: scrolled ? 'blur(16px)' : 'blur(8px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        transition: 'all 0.3s',
      }}>
        <div style={{
          maxWidth: '1400px', margin: '0 auto', padding: '0 24px',
          height: scrolled ? '56px' : '64px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'height 0.3s',
        }}>
          {/* Logo */}
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #ff7e5f, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(255,126,95,0.35)' }}>
              <Zap style={{ width: '16px', height: '16px', color: '#080511' }} />
            </div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FlowForge</span>
          </Link>

          {/* Category trigger buttons */}
          <div style={{ display: 'flex', gap: '4px', flex: 1, marginLeft: '24px' }}>
            {visibleCategories.map((cat, i) => {
              const isOpen = openCat === cat.label;
              const isLast = i === visibleCategories.length - 1;
              return (
                <div key={cat.label} style={{ position: 'relative' }}>
                  <button
                    ref={el => btns.current[cat.label] = el}
                    onClick={() => setOpenCat(isOpen ? null : cat.label)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', fontSize: '13px', fontWeight: 600,
                      color: isOpen ? '#fff' : '#94a3b8',
                      background: isOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
                      border: 'none', borderRadius: '8px', cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!isOpen) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; } }}
                    onMouseLeave={e => { if (!isOpen) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; } }}
                  >
                    <cat.icon style={{ width: '16px', height: '16px' }} />
                    <span>{cat.label}</span>
                    <ChevronDown style={{ width: '12px', height: '12px', opacity: 0.6, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>

                  {/* Dropdown rendered inside so we keep the ref available */}
                </div>
              );
            })}
          </div>

          {/* Search + User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <form onSubmit={e => { e.preventDefault(); if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`); }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#475569' }} />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{
                  width: '140px', fontSize: '12px', padding: '6px 10px 6px 30px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px', color: '#e2e8f0', outline: 'none', transition: 'all 0.2s',
                }}
                  onFocus={e => { e.target.style.width = '200px'; e.target.style.borderColor = 'rgba(255,126,95,0.3)'; }}
                  onBlur={e => { e.target.style.width = '140px'; e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                />
              </div>
            </form>

            <div style={{ position: 'relative' }}>
              <button ref={userBtn} onClick={() => setUserOpen(o => !o)} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '4px 8px 4px 4px', borderRadius: '24px',
                border: userOpen ? '1px solid rgba(255,126,95,0.2)' : '1px solid rgba(255,255,255,0.06)',
                background: userOpen ? 'linear-gradient(135deg, rgba(255,126,95,0.10), rgba(139,92,246,0.08))' : 'transparent',
                cursor: 'pointer', transition: 'all 0.3s',
              }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff7e5f, #feb47b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#080511', boxShadow: '0 2px 10px rgba(255,126,95,0.3)' }}>{initials}</div>
                <ChevronDown style={{ width: '14px', height: '14px', color: '#64748b', transform: userOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Backdrop: closes everything on outside click */}
      {(openCat || userOpen) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={closeAll} />
      )}

      {/* Category dropdowns — fixed positioned, no parent clipping */}
      {visibleCategories.map((cat, i) => {
        if (openCat !== cat.label) return null;
        const btn = btns.current[cat.label];
        if (!btn) return null;
        const rect = btn.getBoundingClientRect();
        const isLast = i === visibleCategories.length - 1;
        return (
          <div key={cat.label} style={{
            position: 'fixed',
            top: rect.bottom + 6,
            left: isLast ? rect.right - 200 : rect.left,
            zIndex: 999,
            minWidth: '200px',
            background: 'rgba(12, 8, 22, 0.96)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px', padding: '6px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
          }} onClick={e => e.stopPropagation()}>
            {cat.links.map(link => {
              const active = link.to === location.pathname || (link.to === '/content-types' && location.pathname.startsWith('/content'));
              return (
                <Link key={link.to} to={link.to} onClick={closeAll} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', fontSize: '13px',
                  color: active ? '#f8fafc' : '#94a3b8',
                  background: active ? 'rgba(255,126,95,0.08)' : 'transparent',
                  borderRadius: '10px', textDecoration: 'none',
                  transition: 'all 0.15s', fontWeight: active ? 600 : 400,
                }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#f8fafc'; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; } }}
                >
                  <link.icon style={{ width: '14px', height: '14px', color: active ? '#ff7e5f' : '#475569' }} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        );
      })}

      {/* User dropdown */}
      {userOpen && (
        <div style={{
          position: 'fixed', top: userPos.top, right: userPos.right, zIndex: 999,
          width: '240px',
          background: 'rgba(12, 8, 22, 0.96)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '18px', padding: '8px',
          boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
        }} onClick={e => e.stopPropagation()}>
          <div style={{ padding: '14px 16px', marginBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff7e5f, #feb47b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: '#080511', flexShrink: 0 }}>{initials}</div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</p>
              <p style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</p>
            </div>
          </div>
          <Link to="/profile" onClick={closeAll} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', fontSize: '13px', color: '#94a3b8', borderRadius: '10px', textDecoration: 'none', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#f8fafc'; e.currentTarget.style.paddingLeft = '18px'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.paddingLeft = '14px'; }}>
            <User style={{ width: '14px', height: '14px' }} /> Profile
          </Link>
          <Link to="/settings" onClick={closeAll} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', fontSize: '13px', color: '#94a3b8', borderRadius: '10px', textDecoration: 'none', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#f8fafc'; e.currentTarget.style.paddingLeft = '18px'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.paddingLeft = '14px'; }}>
            <Settings style={{ width: '14px', height: '14px' }} /> Settings
          </Link>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '4px', paddingTop: '4px' }}>
            <button onClick={() => signOut({ redirectUrl: '/' })} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', fontSize: '13px', color: '#fca5a5', background: 'transparent', border: 'none', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.paddingLeft = '18px'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.paddingLeft = '14px'; }}>
              <LogOut style={{ width: '14px', height: '14px' }} /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
