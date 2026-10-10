import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, homeFor } from '../context/AuthContext.jsx';
import { Skeleton } from './ui.jsx';

// <ProtectedRoute roles={['ADMIN']} /> wraps child routes. No roles = any logged-in user.
export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="mx-auto max-w-md space-y-3 p-10"><Skeleton className="h-8 w-1/2" /><Skeleton className="h-32" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />;
  return <Outlet />;
}
