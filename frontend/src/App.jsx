import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn, SignIn, SignUp, useAuth } from '@clerk/clerk-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import TenantThemeProvider from './components/TenantThemeProvider';
import { useRole } from './hooks/useRole';
import { setAuthTokenGetter } from './utils/api';

const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ContentTypes = lazy(() => import('./pages/ContentTypes'));
const ContentEntries = lazy(() => import('./pages/ContentEntries'));
const ApiKeys = lazy(() => import('./pages/ApiKeys'));
const Analytics = lazy(() => import('./pages/Analytics'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const Webhooks = lazy(() => import('./pages/Webhooks'));
const MediaLibrary = lazy(() => import('./pages/MediaLibrary'));
const UsersRoles = lazy(() => import('./pages/UsersRoles'));
const Roles = lazy(() => import('./pages/Roles'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const ApiDocs = lazy(() => import('./pages/ApiDocs'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const Forms = lazy(() => import('./pages/Forms'));
const Tags = lazy(() => import('./pages/Tags'));
const ContentCalendar = lazy(() => import('./pages/ContentCalendar'));
const LocalLogin = lazy(() => import('./pages/LocalLogin'));

function AuthTokenBridge() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  setAuthTokenGetter(isLoaded && isSignedIn ? getToken : null);

  return null;
}

function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#080511', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <div className="admin-glow-blob peach" style={{ top: '5%', left: '-5%', width: '500px', height: '500px' }} />
      <div className="admin-glow-blob purple" style={{ bottom: '10%', right: '-8%', width: '600px', height: '600px' }} />
      <div className="page-grid-bg" />
      <Navbar />
      <main style={{ position: 'relative', zIndex: 1, flex: 1 }}><TenantThemeProvider><ErrorBoundary>{children}</ErrorBoundary></TenantThemeProvider></main>
      <Footer />
    </div>
  );
}

function AdminRoute({ children }) {
  const { isAdmin } = useRole();
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

const clerkAppearance = {
  variables: {
    colorBackground: '#080511',
    colorInputBackground: '#080511',
    colorPrimary: '#ff7e5f',
    colorText: '#f8fafc',
    colorTextSecondary: '#94a3b8',
    colorInputText: '#f8fafc',
    colorTextOnPrimaryBackground: '#080511',
    colorDanger: '#ef4444',
    colorSuccess: '#10b981',
    borderRadius: '10px',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontFamilyButtons: "'Outfit', sans-serif",
  },
  elements: {
    rootBox: { width: '100%', maxWidth: '420px', margin: '0 auto' },
    card: { background: 'rgba(18, 11, 28, 0.45)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)' },
    headerTitle: { color: '#f8fafc', fontSize: '24px', fontWeight: '700', fontFamily: "'Outfit', sans-serif" },
    headerSubtitle: { color: '#64748b' },
    formButtonPrimary: { background: 'linear-gradient(135deg, #ff7e5f, #feb47b)', fontWeight: '700', color: '#080511', borderRadius: '12px', fontFamily: "'Outfit', sans-serif" },
    footerActionLink: { color: '#ff7e5f' },
    socialButtonsBlockButton: { borderColor: 'rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '10px' },
    socialButtonsBlockButtonText: { color: '#f8fafc' },
    dividerLine: { background: 'rgba(255,255,255,0.08)' },
    dividerText: { color: '#64748b' },
    formFieldLabel: { color: '#94a3b8' },
    formFieldInput: { background: '#080511', borderColor: 'rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '10px' },
    identityPreviewText: { color: '#f8fafc' },
    identityPreviewEditButton: { color: '#ff7e5f' },
    identityPreviewEditButtonIcon: { color: '#ff7e5f' },
    formFieldErrorText: { color: '#fca5a5' },
    alertText: { color: '#fca5a5' },
    resendCodeLink: { color: '#ff7e5f' },
    otpCodeFieldInput: { borderColor: 'rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '10px' },
    profileSectionPrimaryButton: { color: '#f8fafc', fontFamily: "'Outfit', sans-serif" },
    menuButton: { color: '#94a3b8' },
    profileSectionTitle: { color: '#f8fafc', fontFamily: "'Outfit', sans-serif" },
    profileSectionContent: { color: '#f8fafc' },
    tableHeader: { color: '#94a3b8' },
    tableCell: { color: '#f8fafc' },
    selectButton: { background: '#080511', borderColor: 'rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '10px' },
    selectSearchInput: { background: '#080511', borderColor: 'rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '10px' },
  },
};

function SignInPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#080511', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', position: 'relative' }}>
      <div className="page-grid-bg" />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <SignedIn>
          <Navigate to="/dashboard" replace />
        </SignedIn>
        <SignedOut>
          <SignIn routing="path" path="/sign-in" forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard" signUpUrl="/sign-up" appearance={clerkAppearance} />
        </SignedOut>
      </div>
    </div>
  );
}

function SignUpPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#080511', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', position: 'relative' }}>
      <div className="page-grid-bg" />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <SignedIn>
          <Navigate to="/dashboard" replace />
        </SignedIn>
        <SignedOut>
          <SignUp routing="path" path="/sign-up" forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard" signInUrl="/sign-in" appearance={clerkAppearance} />
        </SignedOut>
      </div>
    </div>
  );
}

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        border: '3px solid rgba(255,126,95,0.2)', borderTopColor: '#ff7e5f',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>
    </div>
  );
}

export default function App() {
  return (
    <>
      <AuthTokenBridge />
      <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<ErrorBoundary><Landing /></ErrorBoundary>} />
        <Route path="/sign-in/*" element={<ErrorBoundary><SignInPage /></ErrorBoundary>} />
        <Route path="/sign-up/*" element={<ErrorBoundary><SignUpPage /></ErrorBoundary>} />
        <Route path="/local-login" element={<ErrorBoundary><LocalLogin /></ErrorBoundary>} />
        <Route path="/dashboard" element={<><SignedIn><Layout><Dashboard /></Layout></SignedIn><SignedOut><RedirectToSignIn /></SignedOut></>} />
        <Route path="/content-types" element={<><SignedIn><Layout><ContentTypes /></Layout></SignedIn><SignedOut><RedirectToSignIn /></SignedOut></>} />
        <Route path="/content/:slug" element={<><SignedIn><Layout><ContentEntries /></Layout></SignedIn><SignedOut><RedirectToSignIn /></SignedOut></>} />
        <Route path="/api-keys" element={<><SignedIn><Layout><ApiKeys /></Layout></SignedIn><SignedOut><RedirectToSignIn /></SignedOut></>} />
        <Route path="/media" element={<><SignedIn><Layout><MediaLibrary /></Layout></SignedIn><SignedOut><RedirectToSignIn /></SignedOut></>} />
        <Route path="/api-docs" element={<><SignedIn><Layout><ApiDocs /></Layout></SignedIn><SignedOut><RedirectToSignIn /></SignedOut></>} />
        <Route path="/analytics" element={<><SignedIn><Layout><AdminRoute><Analytics /></AdminRoute></Layout></SignedIn><SignedOut><RedirectToSignIn /></SignedOut></>} />
        <Route path="/audit-logs" element={<><SignedIn><Layout><AdminRoute><AuditLogs /></AdminRoute></Layout></SignedIn><SignedOut><RedirectToSignIn /></SignedOut></>} />
        <Route path="/webhooks" element={<><SignedIn><Layout><AdminRoute><Webhooks /></AdminRoute></Layout></SignedIn><SignedOut><RedirectToSignIn /></SignedOut></>} />
        <Route path="/users" element={<><SignedIn><Layout><AdminRoute><UsersRoles /></AdminRoute></Layout></SignedIn><SignedOut><RedirectToSignIn /></SignedOut></>} />
        <Route path="/roles" element={<><SignedIn><Layout><AdminRoute><Roles /></AdminRoute></Layout></SignedIn><SignedOut><RedirectToSignIn /></SignedOut></>} />
        <Route path="/forms" element={<><SignedIn><Layout><Forms /></Layout></SignedIn><SignedOut><RedirectToSignIn /></SignedOut></>} />
        <Route path="/tags" element={<><SignedIn><Layout><Tags /></Layout></SignedIn><SignedOut><RedirectToSignIn /></SignedOut></>} />
        <Route path="/calendar" element={<><SignedIn><Layout><ContentCalendar /></Layout></SignedIn><SignedOut><RedirectToSignIn /></SignedOut></>} />
        <Route path="/search" element={<><SignedIn><Layout><SearchResults /></Layout></SignedIn><SignedOut><RedirectToSignIn /></SignedOut></>} />
        <Route path="/profile" element={<><SignedIn><Layout><Profile /></Layout></SignedIn><SignedOut><RedirectToSignIn /></SignedOut></>} />
        <Route path="/settings" element={<><SignedIn><Layout><Settings /></Layout></SignedIn><SignedOut><RedirectToSignIn /></SignedOut></>} />
      </Routes>
      </Suspense>
    </>
  );
}
