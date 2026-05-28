import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Code } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import TenantThemeProvider from './components/TenantThemeProvider';
import { useRole } from './hooks/useRole';
import { setNavigationHandler } from './utils/api';
import { useLocalAuth } from './contexts/useLocalAuth';
import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
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

function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeOAuth } = useLocalAuth();

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const token = hashParams.get('token') || searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      completeOAuth(token);
      navigate('/dashboard', { replace: true });
      return;
    }

    navigate(`/sign-in${error ? `?error=${encodeURIComponent(error)}` : ''}`, { replace: true });
  }, [completeOAuth, navigate, searchParams]);

  return <PageLoader />;
}

function ProtectedRoute({ children }) {
  const { user, loading } = useLocalAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/sign-in" replace />;
  return children;
}

function ProtectedLayout({ children }) {
  return <ProtectedRoute><Layout>{children}</Layout></ProtectedRoute>;
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

function NavigationBridge() {
  const navigate = useNavigate();
  useEffect(() => {
    setNavigationHandler((path) => navigate(path));
    return () => setNavigationHandler(null);
  }, [navigate]);
  return null;
}

export default function App() {
  return (
    <>
      <NavigationBridge />
      <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<ErrorBoundary><Landing /></ErrorBoundary>} />
        <Route path="/sign-in/*" element={<ErrorBoundary><AuthPage /></ErrorBoundary>} />
        <Route path="/auth/callback" element={<ErrorBoundary><OAuthCallback /></ErrorBoundary>} />
        <Route path="/sign-up/*" element={<ErrorBoundary><AuthPage /></ErrorBoundary>} />
        <Route path="/local-login" element={<Navigate to="/sign-in" replace />} />
        <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
        <Route path="/content-types" element={<ProtectedLayout><ContentTypes /></ProtectedLayout>} />
        <Route path="/content/:slug" element={<ProtectedLayout><ContentEntries /></ProtectedLayout>} />
        <Route path="/api-keys" element={<ProtectedLayout><ApiKeys /></ProtectedLayout>} />
        <Route path="/media" element={<ProtectedLayout><MediaLibrary /></ProtectedLayout>} />
        <Route path="/api-docs" element={<ProtectedLayout><ApiDocs /></ProtectedLayout>} />
        <Route path="/analytics" element={<ProtectedLayout><AdminRoute><Analytics /></AdminRoute></ProtectedLayout>} />
        <Route path="/audit-logs" element={<ProtectedLayout><AdminRoute><AuditLogs /></AdminRoute></ProtectedLayout>} />
        <Route path="/webhooks" element={<ProtectedLayout><AdminRoute><Webhooks /></AdminRoute></ProtectedLayout>} />
        <Route path="/users" element={<ProtectedLayout><AdminRoute><UsersRoles /></AdminRoute></ProtectedLayout>} />
        <Route path="/roles" element={<ProtectedLayout><AdminRoute><Roles /></AdminRoute></ProtectedLayout>} />
        <Route path="/forms" element={<ProtectedLayout><Forms /></ProtectedLayout>} />
        <Route path="/tags" element={<ProtectedLayout><Tags /></ProtectedLayout>} />
        <Route path="/calendar" element={<ProtectedLayout><ContentCalendar /></ProtectedLayout>} />
        <Route path="/search" element={<ProtectedLayout><SearchResults /></ProtectedLayout>} />
        <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />
        <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
      </Routes>
      </Suspense>
    </>
  );
}
