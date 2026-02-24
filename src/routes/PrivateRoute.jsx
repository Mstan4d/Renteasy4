import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../shared/context/AuthContext';

const PrivateRoute = ({ 
  children, 
  allowedRoles = [],
  redirectTo = '/login'
}) => {
  const location = useLocation();
  const { user, loading, isAuthenticated } = useAuth();

  // ---------- Role Normalization ----------
  // Convert any provider variations to the canonical role
  const normalizeRole = (role) => {
    if (!role) return null;
    // If role is 'provider' or any variation, map to 'service-provider'
    if (role === 'provider' || role === 'service_provider' || role === 'service-provider') {
      return 'service-provider';
    }
    // Handle estate-firm variations
    if (role === 'estate_firm') return 'estate-firm';
    // Replace underscores with hyphens for consistency
    return role.replace('_', '-');
  };

  // Get the canonical role of the current user
  const userRole = user?.role ? normalizeRole(user.role) : null;

  // Role → Dashboard path mapping (canonical roles only)
  const rolePathMap = {
    'tenant': '/dashboard/tenant',
    'landlord': '/dashboard/landlord',
    'manager': '/dashboard/manager',
    'service-provider': '/dashboard/provider',  // ✅ single source of truth
    'estate-firm': '/dashboard/estate-firm',
    'admin': '/admin'
  };

  // Show loading while auth initializes
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Debug
  console.log('🔐 PrivateRoute Check:', {
    path: location.pathname,
    isAuthenticated,
    userRole,
    allowedRoles,
    user
  });

  // Not authenticated → login
  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login');
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Shared routes – accessible to all authenticated users
  const sharedRoutes = [
    '/post-property',
    '/dashboard/messages',
    '/listings',
    '/services',
    '/marketplace',
    '/verify',
    '/verify/form',
    '/verify/status'
  ];

  if (sharedRoutes.some(route => location.pathname.startsWith(route))) {
    console.log('✅ Shared route access granted:', location.pathname);
    return children;
  }

  // ---------- ROLE-BASED ACCESS CONTROL ----------
  if (allowedRoles.length > 0 && userRole) {
    // Normalize allowed roles as well
    const normalizedAllowedRoles = allowedRoles.map(role => normalizeRole(role));
    
    // Check if user's canonical role is in the allowed roles
    const hasRole = normalizedAllowedRoles.includes(userRole);
    
    if (!hasRole) {
      console.log(`❌ Role ${user.role} (normalized: ${userRole}) not allowed for ${location.pathname}. Allowed: ${allowedRoles}`);
      const fallbackPath = rolePathMap[userRole] || '/dashboard';
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // ---------- DASHBOARD REDIRECTION LOGIC ----------
  if (userRole) {
    const userTargetPath = rolePathMap[userRole];
    const currentPath = location.pathname;

    // 1. Redirect from generic /dashboard
    if (currentPath === '/dashboard' && userTargetPath) {
      console.log(`🔄 Redirecting from generic /dashboard to ${userTargetPath}`);
      return <Navigate to={userTargetPath} replace />;
    }

    // 2. Redirect if user is on another role's exact dashboard root
    //    BUT only if that path is NOT the user's own dashboard path
    const isTryingWrongRoleDashboard = Object.entries(rolePathMap).some(([role, path]) => {
      // Skip if this path is the user's own dashboard
      if (path === userTargetPath) return false;
      // If current path matches this path, it's wrong
      return currentPath === path;
    });

    if (isTryingWrongRoleDashboard && userTargetPath) {
      console.log(`🔄 Redirecting from ${currentPath} (wrong role) to ${userTargetPath}`);
      return <Navigate to={userTargetPath} replace />;
    }
  }

  console.log('✅ Access granted to:', location.pathname);
  return children;
};

export default PrivateRoute;