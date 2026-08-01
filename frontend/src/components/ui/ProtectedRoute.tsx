import type { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: ReactElement;
  requireAdmin?: boolean;
}) {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-text-muted">
          <span className="w-5 h-5 border-2 border-text-primary/20 border-t-[#090909] rounded-full animate-spin" />
          <span className="uppercase tracking-widest text-xs">Checking session</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
