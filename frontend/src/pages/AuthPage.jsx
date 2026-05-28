import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Code } from 'lucide-react';
import { useLocalAuth } from '../contexts/useLocalAuth';
import './AuthPage.css';

export default function AuthPage() {
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, googleLogin } = useLocalAuth();
  const [error, setError] = useState(searchParams.get('error') || '');
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const displayedError = error || (!googleClientId ? 'Google auth is not configured.' : '');
  const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const scriptAdded = useRef(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
      return;
    }
    if (!googleClientId) return;

    const initialized = buttonRef.current?.dataset?.gisInitialized;
    if (initialized) return;

    const renderButton = () => {
      if (!window.google || !buttonRef.current) return;
      if (buttonRef.current.dataset.gisInitialized) return;
      buttonRef.current.dataset.gisInitialized = 'true';
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
          try {
            await googleLogin(credential);
            navigate('/dashboard', { replace: true });
          } catch (err) {
            setError(err.response?.data?.message || 'Google sign-in failed');
          }
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'filled_black',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        width: 320,
      });
    };

    if (window.google) {
      renderButton();
    } else if (!scriptAdded.current) {
      scriptAdded.current = true;
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = renderButton;
      script.onerror = () => setError('Could not load Google sign-in.');
      document.head.appendChild(script);
    }
  }, [googleClientId, googleLogin, navigate, user]);

  const startGithubLogin = () => {
    window.location.href = `${apiBaseUrl}/api/v1/auth/github`;
  };

  return (
    <div className="auth-page-container">
      <div className="auth-grid-bg" />
      <div className="auth-blob auth-blob-peach" />
      <div className="auth-blob auth-blob-purple" />
      
      <div className="auth-card">
        <h1>Sign in to FlowForge</h1>
        <p className="auth-subtitle">
          Use your Google or GitHub account to get started. New accounts are created automatically.
        </p>
        
        {displayedError && <div className="auth-error">{displayedError}</div>}
        
        <div ref={buttonRef} className="google-btn-wrapper" />
        
        <div className="auth-divider">
          <span>or</span>
        </div>
        
        <button type="button" onClick={startGithubLogin} className="github-btn">
          <Code size={18} />
          Continue with GitHub
        </button>
      </div>
    </div>
  );
}
