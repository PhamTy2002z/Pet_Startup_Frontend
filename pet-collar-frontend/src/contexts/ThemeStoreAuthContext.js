import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  getCurrentThemeStoreUser,
  loginThemeStoreUser,
  logoutThemeStoreUser,
  registerThemeStoreUser,
} from '../api/themeStoreAuthService';

const ThemeStoreAuthContext = createContext();
export const useThemeStoreAuth = () => useContext(ThemeStoreAuthContext);

export const ThemeStoreAuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  /* Auto get /auth/me nếu có token */
  useEffect(() => {
    const token = localStorage.getItem('theme_store_token');
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const u = await getCurrentThemeStoreUser();
        setUser(u);
      } catch (e) {
        console.error(e);
        logoutThemeStoreUser();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* Actions */
  const login = useCallback(async (payload) => {
    const { user: u } = await loginThemeStoreUser(payload);
    setUser(u);
  }, []);

  const register = useCallback(async (payload) => {
    const { user: u } = await registerThemeStoreUser(payload);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    logoutThemeStoreUser();
    setUser(null);
  }, []);

  return (
    <ThemeStoreAuthContext.Provider
      value={{ user, loading, login, register, logout }}
    >
      {children}
    </ThemeStoreAuthContext.Provider>
  );
};
