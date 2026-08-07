import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api, getToken, setToken } from '../lib/api.js';

/* ============================================================
   Auth state — the logged-in client, persisted via a token in
   localStorage and rehydrated from GET /api/auth/me on load.
   ============================================================ */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => !!getToken());

  useEffect(() => {
    if (!getToken()) return;
    api.get('/api/auth/me')
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: u, token } = await api.post('/api/auth/login', { email, password });
    setToken(token);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (payload) => {
    const { user: u, token } = await api.post('/api/auth/register', payload);
    setToken(token);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!getToken()) return null;
    const u = await api.get('/api/auth/me');
    setUser(u);
    return u;
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh, setUser }),
    [user, loading, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
