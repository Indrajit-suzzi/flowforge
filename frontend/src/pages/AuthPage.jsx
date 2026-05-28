import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Code } from 'lucide-react';
import { useLocalAuth } from '../contexts/useLocalAuth';
import './AuthPage.css';

export default function AuthPage() {
  const location = useLocation();
  const isSignUp = location.pathname.includes('sign-up');
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, googleLogin } = useLocalAuth();
  const [error, setError] = useState(searchParams.get('error') || '');
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const displayedError = error || (!googleClientId ? 'Google auth is not configured.' : '');
  const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
      return;
    }
    if (!googleClientId) return;

    const renderButton = () => {
      if (!window.google || !buttonRef.current) return;
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
        text: isSignUp ? 'signup_with' : 'signin_with',
        width: 320,
      });
    };

    if (window.google) {
      renderButton();
    } else {
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
        <h1>{isSignUp ? 'Create your account' : 'Welcome back'}</h1>
        <p className="auth-subtitle">
          {isSignUp 
            ? 'Join FlowForge and start building your first workflow.' 
            : 'Access your automated workflows and creative tools with one click.'}
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
        
        <div className="auth-footer">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={() => navigate(isSignUp ? '/sign-in' : '/sign-up')}>
            {isSignUp ? 'Sign in' : 'Get started'}
          </button>
        </div>
      </div>
    </div>
  );
}
