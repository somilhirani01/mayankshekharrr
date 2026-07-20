import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('scopelock_token'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('scopelock_user');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('scopelock_token', token);
    } else {
      localStorage.removeItem('scopelock_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('scopelock_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('scopelock_user');
    }
  }, [user]);

  const login = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
