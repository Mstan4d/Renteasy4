import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ 
  children, 
  allowedRoles = [],
  redirectTo = '/login'
}) => {
  const location = useLocation();
  const [authState, setAuthState] = useState({
    loading: true,
    user: null,
    isAuthenticated: false
  });

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      const currentPath = location.pathname;
      console.log('=== AUTH DEBUG START ===');
      console.log('Checking auth for path:', currentPath);
      
      // ========== CHECK SUPER ADMIN FIRST ==========
      if (currentPath.includes('/super-admin')) {
        console.log('Super admin route detected');
        const superAdminToken = localStorage.getItem('superAdminToken');
        const superAdminData = localStorage.getItem('superAdminData');
        console.log('superAdminToken:', !!superAdminToken);
        console.log('superAdminData:', !!superAdminData);
        
        if (superAdminToken && superAdminData) {
          try {
            const adminData = JSON.parse(superAdminData);
            console.log('Super admin data parsed:', adminData);
            
            if (adminData.role === 'super-admin') {
              console.log('✅ Super admin authentication SUCCESS');
              setAuthState({
                loading: false,
                user: adminData,
                isAuthenticated: true
              });
              return;
            }
          } catch (error) {
            console.error('Error parsing super admin data:', error);
          }
        }
        
        console.log('❌ Super admin authentication FAILED');
        setAuthState({
          loading: false,
          user: null,
          isAuthenticated: false
        });
        return;
      }
      
      // ========== CHECK REGULAR USER (RENTEASY KEYS) ==========
      console.log('Regular route - checking renteasy auth');
      
      // Check AuthContext keys (renteasy_user and renteasy_token)
      const renteasyToken = localStorage.getItem('renteasy_token');
      const renteasyUser = localStorage.getItem('renteasy_user');
      
      console.log('renteasy_token exists:', !!renteasyToken);
      console.log('renteasy_user exists:', !!renteasyUser);
      
      // FIXED: User is required, token is optional (for demo/mock logins)
      if (renteasyUser) {
        try {
          const user = JSON.parse(renteasyUser);
          console.log('✅ Regular user authentication SUCCESS:', user.role);
          
          setAuthState({
            loading: false,
            user: user,
            isAuthenticated: true
          });
          return;
        } catch (error) {
          console.error('Error parsing renteasy_user:', error);
        }
      }
      
      // ========== FALLBACK: Check legacy keys (for backward compatibility) ==========
      console.log('Checking legacy keys...');
      const legacyToken = localStorage.getItem('token');
      const legacyUserData = localStorage.getItem('userData');
      
      console.log('legacy token:', !!legacyToken);
      console.log('legacy userData:', !!legacyUserData);
      
      if (legacyUserData) {
        try {
          const user = JSON.parse(legacyUserData);
          console.log('✅ Legacy auth SUCCESS');
          
          // Migrate to new keys
          localStorage.setItem('renteasy_user', legacyUserData);
          if (legacyToken) {
            localStorage.setItem('renteasy_token', legacyToken);
          }
          
          setAuthState({
            loading: false,
            user: user,
            isAuthenticated: true
          });
          return;
        } catch (error) {
          console.error('Error parsing legacy userData:', error);
        }
      }
      
      // ========== NO AUTH FOUND ==========
      console.log('❌ ALL authentication attempts FAILED');
      setAuthState({
        loading: false,
        user: null,
        isAuthenticated: false
      });
      
      console.log('=== AUTH DEBUG END ===');
    };

    checkAuth();
  }, [location.pathname]);

  // Show loading state
  if (authState.loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  console.log('=== PROVIDER ROUTE DEBUG ===');
console.log('Path:', location.pathname);
console.log('User role:', authState.user?.role);
console.log('Is authenticated:', authState.isAuthenticated);
console.log('Allowed roles:', allowedRoles);

  console.log('=== ROUTE CHECK START ===');
  console.log('Current path:', location.pathname);
  console.log('Auth state:', authState);
  console.log('Allowed roles:', allowedRoles);

 // console.log('PrivateRoute user:', authState.user);
//console.log('Allowed roles:', allowedRoles);
//console.log('Redirecting:', !user || (allowedRoles && !allowedRoles.includes(authState.user.role)));

  // ========== ROUTE HANDLING ==========
  
  // Super Admin Routes
  if (location.pathname.includes('/super-admin')) {
    console.log('Processing super admin route');
    
    if (!authState.isAuthenticated || !authState.user) {
      console.log('Not authenticated for super admin, redirecting to login');
      return <Navigate to="/super-admin/login" replace />;
    }
    
    if (authState.user.role !== 'super-admin') {
      console.log('User is not super admin, redirecting to login');
      return <Navigate to="/login" replace />;
    }
    
    console.log('Super admin access GRANTED');
    return children;
  }
  
  // Admin Routes
  if (location.pathname.includes('/admin')) {
    console.log('Processing admin route');
    
    if (!authState.isAuthenticated || !authState.user) {
      console.log('Not authenticated for admin');
      return <Navigate to="/login" replace />;
    }
    
    if (authState.user.role !== 'admin') {
      console.log('User is not admin');
      return <Navigate to="/dashboard" replace />;
    }
    
    console.log('Admin access GRANTED');
    return children;
  }
  
  // Dashboard Routes
  if (location.pathname.includes('/dashboard')) {
    console.log('=== DASHBOARD DEBUG ===');
    console.log('Full URL:', window.location.href);
    console.log('Location pathname:', location.pathname);
    console.log('Auth state:', authState);
    
    // Check what's in localStorage
    console.log('LocalStorage renteasy_user:', localStorage.getItem('renteasy_user'));
    
    // Parse and display the exact role
    try {
      const user = JSON.parse(localStorage.getItem('renteasy_user') || '{}');
      console.log('Parsed user role:', user.role);
      console.log('Parsed user role type:', typeof user.role);
      console.log('Role length:', user.role ? user.role.length : 0);
      console.log('Role char codes:', user.role ? [...user.role].map(c => c.charCodeAt(0)) : []);
    } catch (e) {
      console.error('Error parsing user:', e);
    }
    
    console.log('Processing dashboard route');
    
    if (!authState.isAuthenticated || !authState.user) {
      console.log('❌ DASHBOARD AUTH FAILED - Redirecting to login');
      return <Navigate to="/login" replace />;
    }
    
    console.log('✅ DASHBOARD ACCESS GRANTED for user:', authState.user.role);
    
    // Check role-specific access for dashboard sections
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    console.log('Path segments:', pathSegments);
    
    if (pathSegments.length > 1) {
      const dashboardSection = pathSegments[1]; // 'tenant', 'landlord', 'estate-firm', 'messages', etc.
      const userRole = authState.user.role;
      
      console.log('Dashboard section requested:', dashboardSection);
      console.log('User role:', userRole);
      
      // SPECIAL CASE: Allow common routes for all roles
      const commonRoutes = ['messages', 'post-property', 'support', 'profile'];
      
      if (commonRoutes.includes(dashboardSection)) {
        console.log('✅ Common route access approved');
        return children;
      }
      
      // FIX: Add provider to the role check
  if (dashboardSection === 'provider') {
    // User must have 'provider' role
    if (userRole === 'provider') {
      console.log('✅ Provider access approved');
      return children;
    } else {
      console.log(`❌ Provider access denied. User role is ${userRole}`);
      return <Navigate to={`/dashboard/${userRole}`} replace />;
    }
  }
      // SPECIAL CASE: Handle estate-firm variations
      if (dashboardSection === 'estate-firm') {
        // Accept both 'estate-firm' and 'estate_firm' roles
        if (userRole === 'estate-firm' || userRole === 'estate_firm') {
          console.log('✅ Estate firm access approved');
          return children;
        } else {
          console.log(`❌ Estate firm access denied. User role is ${userRole}`);
          return <Navigate to={`/dashboard/${userRole}`} replace />;
        }
      }
      
      // For other roles - exact match required
      if (dashboardSection && dashboardSection !== userRole) {
        console.log(`Role mismatch - redirecting to /dashboard/${userRole}`);
        return <Navigate to={`/dashboard/${userRole}`} replace />;
      }
    }
    
    console.log('Rendering dashboard children');
    return children;
  }
  
  // Default authentication check for other protected routes
  if (!authState.isAuthenticated || !authState.user) {
    console.log('Default route auth failed');
    return <Navigate to={redirectTo} replace />;
  }
  
  // Role-based access control
  if (allowedRoles.length > 0 && !allowedRoles.includes(authState.user.role)) {
    console.log('Role not allowed for this route');
    return <Navigate to={`/dashboard/${authState.user.role}`} replace />;
  }
  
  console.log('✅ Default access GRANTED');
  console.log('=== ROUTE CHECK END ===');
  
  return children;
};

export default PrivateRoute;