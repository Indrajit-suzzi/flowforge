import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
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
      <main style={{ position: 'relative', zIndex: 1, flex: 1 }}><TenantThemeProvider>{children}</TenantThemeProvider></main>
      <Footer />
    </div>
  );
}

function PageBoundary({ children }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
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
      <div className="spinner" />
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
        <Route path="/sign-in" element={<ErrorBoundary><AuthPage /></ErrorBoundary>} />
        <Route path="/auth/callback" element={<ErrorBoundary><OAuthCallback /></ErrorBoundary>} />
        <Route path="/dashboard" element={<ProtectedLayout><PageBoundary><Dashboard /></PageBoundary></ProtectedLayout>} />
        <Route path="/content-types" element={<ProtectedLayout><PageBoundary><ContentTypes /></PageBoundary></ProtectedLayout>} />
        <Route path="/content/:slug" element={<ProtectedLayout><PageBoundary><ContentEntries /></PageBoundary></ProtectedLayout>} />
        <Route path="/api-keys" element={<ProtectedLayout><PageBoundary><ApiKeys /></PageBoundary></ProtectedLayout>} />
        <Route path="/media" element={<ProtectedLayout><PageBoundary><MediaLibrary /></PageBoundary></ProtectedLayout>} />
        <Route path="/api-docs" element={<ProtectedLayout><PageBoundary><ApiDocs /></PageBoundary></ProtectedLayout>} />
        <Route path="/analytics" element={<ProtectedLayout><AdminRoute><PageBoundary><Analytics /></PageBoundary></AdminRoute></ProtectedLayout>} />
        <Route path="/audit-logs" element={<ProtectedLayout><AdminRoute><PageBoundary><AuditLogs /></PageBoundary></AdminRoute></ProtectedLayout>} />
        <Route path="/webhooks" element={<ProtectedLayout><AdminRoute><PageBoundary><Webhooks /></PageBoundary></AdminRoute></ProtectedLayout>} />
        <Route path="/users" element={<ProtectedLayout><AdminRoute><PageBoundary><UsersRoles /></PageBoundary></AdminRoute></ProtectedLayout>} />
        <Route path="/roles" element={<ProtectedLayout><AdminRoute><PageBoundary><Roles /></PageBoundary></AdminRoute></ProtectedLayout>} />
        <Route path="/forms" element={<ProtectedLayout><PageBoundary><Forms /></PageBoundary></ProtectedLayout>} />
        <Route path="/tags" element={<ProtectedLayout><PageBoundary><Tags /></PageBoundary></ProtectedLayout>} />
        <Route path="/calendar" element={<ProtectedLayout><PageBoundary><ContentCalendar /></PageBoundary></ProtectedLayout>} />
        <Route path="/search" element={<ProtectedLayout><PageBoundary><SearchResults /></PageBoundary></ProtectedLayout>} />
        <Route path="/profile" element={<ProtectedLayout><PageBoundary><Profile /></PageBoundary></ProtectedLayout>} />
        <Route path="/settings" element={<ProtectedLayout><PageBoundary><Settings /></PageBoundary></ProtectedLayout>} />
      </Routes>
      </Suspense>
    </>
  );
}
