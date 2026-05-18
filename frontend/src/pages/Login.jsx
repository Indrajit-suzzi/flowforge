import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      setTimeout(() => navigate('/dashboard'), 50);
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || err.message || 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050810', display: 'flex' }}>
      <div style={{ display: 'none', width: '50%', background: 'linear-gradient(135deg, #0d1321, #111827)', borderRight: '1px solid #1e293b', position: 'relative' }} className="lg:flex">
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0px, transparent 1px, transparent 40px)', backgroundSize: '40px 40px' }} />
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px', maxWidth: '480px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
            <span style={{ fontSize: '20px', fontWeight: '700', color: '#f1f5f9' }}>FlowForge</span>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#f1f5f9', marginBottom: '16px', lineHeight: '1.2' }}>Welcome back to your CMS</h1>
          <p style={{ fontSize: '16px', color: '#64748b', lineHeight: '1.6' }}>Manage your content types, entries, and API keys from one place.</p>
          <div style={{ marginTop: '40px', display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#475569' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />Multi-tenant
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }} />Dynamic schemas
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8b5cf6' }} />Scoped keys
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }} className="lg:hidden">
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap style={{ width: '16px', height: '16px', color: 'white' }} />
            </div>
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9' }}>FlowForge</span>
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9' }}>Sign in</h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Enter your credentials to continue</p>

          {error && (
            <div style={{ marginTop: '24px', padding: '12px', borderRadius: '10px', background: '#450a0a', border: '1px solid #7f1d1d', fontSize: '13px', color: '#fca5a5' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#475569' }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={{ width: '100%', padding: '12px 12px 12px 40px', background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', outline: 'none' }} required />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#475569' }} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '12px 12px 12px 40px', background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', outline: 'none' }} required />
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'linear-gradient(90deg, #3b82f6, #6366f1)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : <>Sign in <ArrowRight style={{ width: '14px', height: '14px' }} /></>}
            </button>
          </form>

          <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#60a5fa', textDecoration: 'none' }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}