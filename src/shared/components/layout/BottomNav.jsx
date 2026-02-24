import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './BottomNav.css';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  /**
   * Determine active state - FIXED VERSION
   */
  const isActive = (path) => {
    // Special case for dashboard paths
    if (path === '/dashboard') {
      // Check if current path starts with any dashboard path
      return location.pathname.startsWith('/dashboard');
    }
    
    // For role-specific dashboard paths
    if (path.startsWith('/dashboard/')) {
      return location.pathname.startsWith(path);
    }
    
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };

  /**
   * Get correct dashboard path based on user role
   */
  const getDashboardPath = () => {
    if (!user) return '/login';
    
    const rolePaths = {
      'tenant': '/dashboard/tenant',
      'landlord': '/dashboard/landlord',
      'manager': '/dashboard/manager',
      'provider': '/dashboard/provider',
      'service-provider': '/dashboard/provider',
      'estate-firm': '/dashboard/estate-firm',
      'estate_firm': '/dashboard/estate-firm',
      'admin': '/admin'
    };
    
    return rolePaths[user.role] || '/dashboard';
  };

  const NAV_ITEMS = [
    { 
      id: 'home', 
      path: '/', 
      icon: '🏠', 
      label: 'Home',
      requiresAuth: false,
      roles: []
    },
    { 
      id: 'search', 
      path: '/listings', 
      icon: '🔍', 
      label: 'Search',
      requiresAuth: false,
      roles: []
    },
    { 
      id: 'post', 
      path: '/post-property',
      icon: '➕', 
      label: 'Post', 
      isPrimary: true,
      requiresAuth: true,
      roles: ['tenant', 'landlord', 'estate-firm', 'estate_firm']
    },
    { 
      id: 'services', 
      path: '/services', 
      icon: '🛠️', 
      label: 'Pros',
      requiresAuth: false,
      roles: []
    },
    { 
      id: 'dashboard', 
      path: getDashboardPath(), // Dynamic path based on role
      icon: '👤', 
      label: 'Me', 
      requiresAuth: true,
      roles: [] // All authenticated users can access their dashboard
    }
  ];

  /**
   * Handle navigation with auth & role checks
   */
  const handleNavigation = (item) => {
    console.log('Navigating to:', item.path, 'User role:', user?.role);
    
    if (item.requiresAuth && !isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      navigate('/login', { state: { from: item.path } });
      return;
    }

    if (item.requiresAuth && isAuthenticated && item.roles && item.roles.length > 0) {
      if (!item.roles.includes(user?.role)) {
        console.log(`Role ${user?.role} not allowed for ${item.path}`);
        alert(`This feature is only available for: ${item.roles.join(', ')}`);
        return;
      }
    }

    navigate(item.path);
  };

  /**
   * Determine visibility - FIXED VERSION
   */
  const shouldShowItem = (item) => {
    // 1. If it doesn't require auth, show it to everyone
    if (!item.requiresAuth) return true;

    // 2. If it requires auth but user isn't logged in, hide it
    if (!isAuthenticated) return false;

    // 3. If it requires auth and has specific roles, check the user's role
    const roles = item.roles || [];
    
    if (roles.length === 0) return true; // No role restriction
    
    return roles.includes(user?.role);
  };

  const visibleItems = NAV_ITEMS.filter(shouldShowItem);

  /**
   * Mobile-only rendering
   */
  if (typeof window !== 'undefined' && window.innerWidth > 768) {
    return null;
  }

  return (
    <nav
      className="bottom-nav"
      role="navigation"
      aria-label="Main navigation"
    >
      {visibleItems.map((item) => {
        const active = isActive(item.path);

        return (
          <button
            key={item.id}
            className={`nav-btn ${active ? 'active' : ''} ${
              item.isPrimary ? 'primary-action' : ''
            }`}
            onClick={() => handleNavigation(item)}
            title={item.label}
            aria-label={`${item.label} ${active ? '(current page)' : ''}`}
            aria-current={active ? 'page' : undefined}
            type="button"
          >
            <span className="nav-icon" aria-hidden="true">
              {item.icon}
            </span>

            <span className="nav-label">{item.label}</span>

            {active && <span className="active-indicator" />}
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;