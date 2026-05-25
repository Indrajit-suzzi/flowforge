import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalAuth } from '../contexts/useLocalAuth';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import PageShell from '../components/PageShell';

export default function LocalLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useLocalAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell title="Sign In" subtitle="Access your FlowForge dashboard" maxWidth="400px">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#fca5a5', fontSize: '14px' }}>
            {error}
          </div>
        )}
        
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#94a3b8' }}>Email</label>
          <div style={{ position: 'relative' }}>
            <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#64748b' }} />
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="input-field"
              style={{ paddingLeft: '40px' }}
              required
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#94a3b8' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#64748b' }} />
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="input-field"
              style={{ paddingLeft: '40px' }}
              required
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Signing in...' : <>Sign In <ArrowRight style={{ width: '14px', height: '14px' }} /></>}
        </button>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
          Don't have an account? Contact your admin to create one.
        </p>
      </form>
    </PageShell>
  );
}