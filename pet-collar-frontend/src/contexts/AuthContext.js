import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { loginAdmin as apiLoginAdmin } from '../api/authService';

const TOKEN_KEY = 'admin_token';          // <—  dùng nhất quán
const AuthContext = createContext();

/* -------------------------------------------------- */
/*                Provider component                  */
/* -------------------------------------------------- */
export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  /* -------- auto-attach Authorization to ALL requests -------- */
  useEffect(() => {
    const id = axios.interceptors.request.use((cfg) => {
      const t = localStorage.getItem(TOKEN_KEY);
      if (t) cfg.headers.Authorization = `Bearer ${t}`;
      return cfg;
    });
    return () => axios.interceptors.request.eject(id);
  }, []);

  /* -------- helper: decode & check expiry -------- */
  const isExpired = (jwt) => {
    try {
      const { exp } = JSON.parse(atob(jwt.split('.')[1]));
      return Date.now() > exp * 1000;
    } catch {
      return true;
    }
  };

  /* -------- login -------- */
  const login = async (username, password) => {
    const newToken = await apiLoginAdmin({ username, password });
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    if (isExpired(newToken)) logout();
    else navigate('/admin', { replace: true });
  };

  /* -------- logout -------- */
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    navigate('/login', { replace: true });
  };

  /* -------- auto-logout if token expired on mount/refresh -------- */
  useEffect(() => {
    if (token && isExpired(token)) logout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/* -------------------------------------------------- */
/*                custom hook                         */
/* -------------------------------------------------- */
export const useAuth = () => useContext(AuthContext);
