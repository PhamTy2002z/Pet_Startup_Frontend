import { Navigate, Outlet } from 'react-router-dom';
import { useThemeStoreAuth } from '../contexts/ThemeStoreAuthContext';

const ThemeStorePrivateRoute = () => {
  const { user, loading } = useThemeStoreAuth();

  if (loading) return <p style={{ textAlign: 'center' }}>Loading...</p>;

  return user ? <Outlet /> : <Navigate to="/theme-store/login" replace />;
};

export default ThemeStorePrivateRoute;
