import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { tokenStore } from '../api/client.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const homeFor = (role) => ({ ADMIN: '/admin', USER: '/stores', OWNER: '/owner' }[role] || '/login');

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!tokenStore.get());

  useEffect(() => {
    if (!tokenStore.get()) return;
    api.get('/auth/me')
      .then((r) => setUser(r.data.user))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const authenticate = useCallback(async (path, body) => {
    const { data } = await api.post(path, body);
    tokenStore.set(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const login = (body) => authenticate('/auth/login', body);
  const signup = (body) => authenticate('/auth/signup', body);
  const logout = () => { tokenStore.clear(); setUser(null); };

  return <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>;
}
