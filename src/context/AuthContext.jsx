import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || '');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('auth_email') || '');

  useEffect(() => {
    if (token) localStorage.setItem('auth_token', token); else localStorage.removeItem('auth_token');
  }, [token]);
  useEffect(() => {
    if (userEmail) localStorage.setItem('auth_email', userEmail); else localStorage.removeItem('auth_email');
  }, [userEmail]);

  const value = useMemo(() => ({ token, setToken, userEmail, setUserEmail, logout: () => { setToken(''); setUserEmail(''); } }), [token, userEmail]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}