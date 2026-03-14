import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const readStored = () => {
  const token = localStorage.getItem('auth_token');
  const role = localStorage.getItem('auth_role');
  const user = localStorage.getItem('auth_user');
  return {
    token: token || '',
    role: role || '',
    user: user ? JSON.parse(user) : null
  };
};

export const AuthProvider = ({ children }) => {
  const stored = readStored();
  const [token, setToken] = useState(stored.token);
  const [role, setRole] = useState(stored.role);
  const [user, setUser] = useState(stored.user);

  const login = (payload) => {
    setToken(payload.token);
    setRole(payload.role);
    setUser(payload.user);
    localStorage.setItem('auth_token', payload.token);
    localStorage.setItem('auth_role', payload.role);
    localStorage.setItem('auth_user', JSON.stringify(payload.user));
  };

  const logout = () => {
    setToken('');
    setRole('');
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_role');
    localStorage.removeItem('auth_user');
  };

  const value = useMemo(() => ({ token, role, user, login, logout }), [token, role, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('AuthContext missing');
  }
  return ctx;
};
