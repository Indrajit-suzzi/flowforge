import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, User, Mail } from 'lucide-react';
import { useLocalAuth } from '../contexts/useLocalAuth';
import api from '../utils/api';
import './AuthPage.css';
import './CompleteProfile.css';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { user, refreshUser } = useLocalAuth();
  const [username, setUsername] = useState(user?.username?.startsWith('user_') ? '' : user?.username || '');
  const [email, setEmail] = useState(user?.email?.endsWith('@phone.flowforge.app') ? '' : user?.email || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.profileComplete) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await api.post('/api/v1/auth/phone/complete-profile', { username, email });
      await refreshUser();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cp-page-container">
      <div className="auth-grid-bg" />
      <div className="auth-blob auth-blob-peach" />
      <div className="auth-blob auth-blob-purple" />

      <div className="auth-card cp-card">
        <div className="cp-icon">
          <User size={36} />
        </div>
        <h1>Complete Your Profile</h1>
        <p className="auth-subtitle">
          Set your name and email to finish creating your account.
        </p>

        <form onSubmit={handleSubmit} className="cp-form">
          <div className="cp-field">
            <label className="cp-label" htmlFor="username">
              <User size={14} />
              Username
            </label>
            <input
              id="username"
              type="text"
              className="cp-input"
              placeholder="Your display name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div className="cp-field">
            <label className="cp-label" htmlFor="email">
              <Mail size={14} />
              Email
            </label>
            <input
              id="email"
              type="email"
              className="cp-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="wa-send-btn" disabled={saving || !username || !email}>
            {saving ? <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> : <CheckCircle size={18} />}
            Continue to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
