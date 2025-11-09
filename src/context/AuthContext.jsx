import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || '');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('auth_email') || '');
  const [userName, setUserName] = useState(() => localStorage.getItem('auth_name') || '');

  useEffect(() => {
    if (token) localStorage.setItem('auth_token', token); else localStorage.removeItem('auth_token');
  }, [token]);
  useEffect(() => {
    if (userEmail) localStorage.setItem('auth_email', userEmail); else localStorage.removeItem('auth_email');
  }, [userEmail]);
  useEffect(() => {
    if (userName) localStorage.setItem('auth_name', userName); else localStorage.removeItem('auth_name');
  }, [userName]);

  useEffect(() => {
    function onAutoLogout() {
      logout();
    }
    window.addEventListener('auth:logout', onAutoLogout);
    return () => window.removeEventListener('auth:logout', onAutoLogout);
  }, []);

  const value = useMemo(() => ({ token, setToken, userEmail, setUserEmail, userName, setUserName, logout: () => { setToken(''); setUserEmail(''); setUserName(''); } }), [token, userEmail, userName]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}