import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from './ui/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'IC' | 'LEADER' | 'ADMIN'>;
  requireAdmin?: boolean;
  redirectTo?: string;
}

/**
 * ProtectedRoute - Wraps routes that require authentication
 *
 * Features:
 * - Redirects to login if not authenticated
 * - Optional role-based access control
 * - Optional admin access control (isAdmin flag)
 * - Shows loading spinner while checking auth state
 * - Preserves intended destination for redirect after login
 */
function ProtectedRoute({
  children,
  allowedRoles,
  requireAdmin = false,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading screen while checking auth state
  if (isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the intended destination
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check admin access if required
  if (requireAdmin && user && !user.isAdmin) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate default page based on role
    const defaultRoute = user.role === 'LEADER' ? '/team' : '/workspace';
    return <Navigate to={defaultRoute} replace />;
  }

  return <>{children}</>;
}

export { ProtectedRoute };
