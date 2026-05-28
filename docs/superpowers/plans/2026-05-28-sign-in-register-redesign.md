# Sign-In and Register Redesign (Immersive Glow) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Sign In and Register pages with a premium "Immersive Glow" aesthetic while maintaining existing OAuth logic.

**Architecture:** 
- Extract the `SignInPage` component from `App.jsx` into a dedicated file for better maintainability.
- Use CSS Modules or dedicated CSS files for the complex animations and glassmorphism styles.
- Implement route-aware content rendering using `react-router-dom`'s `useLocation`.

**Tech Stack:** React (Vite), CSS (Vanilla), Lucide React (Icons).

---

### Task 1: Component Extraction & Route Awareness

Extract `SignInPage` to its own file and add logic to detect `/sign-up`.

**Files:**
- Create: `frontend/src/pages/AuthPage.jsx`
- Create: `frontend/src/pages/AuthPage.css`
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Create `AuthPage.jsx` with basic structure and route awareness**
Extract the current `SignInPage` logic from `App.jsx` and add a `isSignUp` check.

```jsx
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
  const apiBaseUrl = import.meta.env.VITE_API_URL || '';

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
        text: 'signin_with',
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
```

- [ ] **Step 2: Create initial `AuthPage.css` with layout only**
```css
.auth-page-container {
  min-height: 100vh;
  background: #080511;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  position: relative;
  overflow: hidden;
}

.auth-card {
  position: relative;
  z-index: 10;
  width: 100%;
  maxWidth: 420px;
  padding: 48px;
  text-align: center;
}
```

- [ ] **Step 3: Update `App.jsx` to use the new `AuthPage` component**
```jsx
// Replace SignInPage definition and update Routes
import AuthPage from './pages/AuthPage';
// ... in App() ...
<Route path="/sign-in/*" element={<ErrorBoundary><AuthPage /></ErrorBoundary>} />
<Route path="/sign-up/*" element={<ErrorBoundary><AuthPage /></ErrorBoundary>} />
```

- [ ] **Step 4: Verify route awareness works**
Navigate to `/sign-in` and `/sign-up` to ensure titles change correctly.

- [ ] **Step 5: Commit**
```bash
git add frontend/src/pages/AuthPage.jsx frontend/src/pages/AuthPage.css frontend/src/App.jsx
git commit -m "feat(auth): extract AuthPage and implement route-aware content"
```

---

### Task 2: Implementing "Immersive Glow" Visuals

Apply the glassmorphism, background grid, and glow blobs.

**Files:**
- Modify: `frontend/src/pages/AuthPage.css`

- [ ] **Step 1: Add background grid and glow blobs styles**
```css
.auth-grid-bg {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 50px 50px;
  z-index: 1;
}

.auth-blob {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(120px);
  z-index: 2;
  opacity: 0.6;
}

.auth-blob-peach {
  background: radial-gradient(circle, rgba(255, 126, 95, 0.15) 0%, transparent 70%);
  top: -150px;
  left: -150px;
}

.auth-blob-purple {
  background: radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%);
  bottom: -150px;
  right: -150px;
}
```

- [ ] **Step 2: Add glassmorphism to `auth-card`**
```css
.auth-card {
  background: rgba(18, 11, 28, 0.7);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.auth-card h1 {
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 800;
  color: #f8fafc;
  margin-bottom: 12px;
}

.auth-subtitle {
  color: #94a3b8;
  font-size: 15px;
  margin-bottom: 40px;
}
```

- [ ] **Step 3: Style OAuth buttons and divider**
```css
.google-btn-wrapper {
  display: flex;
  justify-content: center;
  min-height: 44px;
  margin-bottom: 16px;
}

.github-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #f8fafc;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.auth-divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 24px 0;
  color: #475569;
  font-size: 12px;
  text-transform: uppercase;
}

.auth-divider::before, .auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
}

.auth-footer {
  margin-top: 32px;
  font-size: 14px;
  color: #64748b;
}

.auth-footer button {
  background: none;
  border: none;
  color: #ff7e5f;
  font-weight: 600;
  cursor: pointer;
  margin-left: 6px;
}
```

- [ ] **Step 4: Commit**
```bash
git add frontend/src/pages/AuthPage.css
git commit -m "style(auth): implement Immersive Glow visuals and glassmorphism"
```

---

### Task 3: Adding Animations & Final Polish

Implement the "Subtle & Elegant" motion design.

**Files:**
- Modify: `frontend/src/pages/AuthPage.css`

- [ ] **Step 1: Add entry animation to `auth-card`**
```css
@keyframes authFadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-card {
  animation: authFadeInUp 0.6s ease-out forwards;
}
```

- [ ] **Step 2: Add breathing animation to background blobs**
```css
@keyframes blobPulse {
  0% { transform: scale(1) translate(0, 0); }
  50% { transform: scale(1.05) translate(20px, 10px); }
  100% { transform: scale(0.95) translate(-10px, 20px); }
}

.auth-blob-peach {
  animation: blobPulse 15s infinite alternate ease-in-out;
}

.auth-blob-purple {
  animation: blobPulse 18s infinite alternate-reverse ease-in-out;
}
```

- [ ] **Step 3: Add hover/active states for GitHub button**
```css
.github-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.02);
}

.github-btn:active {
  transform: scale(0.98);
}
```

- [ ] **Step 4: Final visual check**
Ensure all colors, blurs, and animations match the approved mockup.

- [ ] **Step 5: Commit**
```bash
git add frontend/src/pages/AuthPage.css
git commit -m "style(auth): add subtle entry and breathing animations"
```

---

### Task 4: Final Verification

Run a final pass to ensure all acceptance criteria are met.

**Files:**
- N/A

- [ ] **Step 1: Verify all ACs from `docs/superpowers/acceptance/2026-05-28-sign-in-register-redesign.md`**
  - AC-001 to AC-010 checked.
- [ ] **Step 2: Run project lint/build**
Run: `npm run lint` and `npm run build` in `frontend/`
- [ ] **Step 3: Final Commit**
```bash
git commit --allow-empty -m "chore(auth): final verification pass complete"
```
