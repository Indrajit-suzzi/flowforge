import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(!!localStorage.getItem('auth_token'));

  useEffect(() => {
    if (!token) return;
    api.defaults.headers.Authorization = `Bearer ${token}`;
    api.get('/api/v1/users/me')
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const googleLogin = useCallback(async (credential) => {
    const res = await api.post('/api/v1/auth/google', { credential });
    localStorage.setItem('auth_token', res.data.token);
    api.defaults.headers.Authorization = `Bearer ${res.data.token}`;
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  }, []);

  const completeOAuth = useCallback((nextToken) => {
    localStorage.setItem('auth_token', nextToken);
    api.defaults.headers.Authorization = `Bearer ${nextToken}`;
    setToken(nextToken);
    setLoading(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    setLoading(false);
    delete api.defaults.headers.Authorization;
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, googleLogin, completeOAuth, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
