import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const isAuthenticated = !!localStorage.getItem('token');
  return !isAuthenticated ? <Navigate to="/login" replace /> : <Outlet />;
}
