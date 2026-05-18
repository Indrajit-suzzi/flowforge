import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ContentTypes from './pages/ContentTypes';
import ContentEntries from './pages/ContentEntries';
import ApiKeys from './pages/ApiKeys';
import Analytics from './pages/Analytics';
import AuditLogs from './pages/AuditLogs';
import Webhooks from './pages/Webhooks';
import MediaLibrary from './pages/MediaLibrary';
import UsersRoles from './pages/UsersRoles';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ApiDocs from './pages/ApiDocs';

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050810', color: '#64748b' }}>Loading...</div>;
  return token ? children : <Navigate to="/login" />;
}

function PermissionRoute({ permission, children }) {
  const { hasPermission, token, loading } = useAuth();
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050810', color: '#64748b' }}>Loading...</div>;
  if (!token) return <Navigate to="/login" />;
  if (!hasPermission(permission)) return <Navigate to="/dashboard" />;
  return children;
}

function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#050810' }}>
      <Navbar />
      {children}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/content-types" element={<ProtectedRoute><Layout><ContentTypes /></Layout></ProtectedRoute>} />
          <Route path="/content/:slug" element={<ProtectedRoute><Layout><ContentEntries /></Layout></ProtectedRoute>} />
          <Route path="/api-keys" element={<PermissionRoute permission="apiKeys"><Layout><ApiKeys /></Layout></PermissionRoute>} />
          <Route path="/analytics" element={<PermissionRoute permission="analytics"><Layout><Analytics /></Layout></PermissionRoute>} />
          <Route path="/audit-logs" element={<PermissionRoute permission="auditLogs"><Layout><AuditLogs /></Layout></PermissionRoute>} />
          <Route path="/webhooks" element={<PermissionRoute permission="webhooks"><Layout><Webhooks /></Layout></PermissionRoute>} />
          <Route path="/media" element={<PermissionRoute permission="mediaLibrary"><Layout><MediaLibrary /></Layout></PermissionRoute>} />
          <Route path="/users" element={<PermissionRoute permission="userManagement"><Layout><UsersRoles /></Layout></PermissionRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
          <Route path="/api-docs" element={<ProtectedRoute><Layout><ApiDocs /></Layout></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}