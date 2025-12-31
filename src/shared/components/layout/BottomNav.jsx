// src/shared/components/layout/BottomNav.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './BottomNav.css';

/**
 * BottomNav - Fixed bottom navigation bar for mobile devices
 * Mobile-only navigation for RentEasy
 */
const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  /**
   * Determine active state
   */
  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname.startsWith('/dashboard') || location.pathname === '/';
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  /**
   * Navigation items (EXACTLY 5)
   */
  const NAV_ITEMS = [
    {
      id: 'home',
      path: '/',
      icon: '🏠',
      label: 'Home',
      requiresAuth: false,
      roles: [],
      isPrimary: false,
      description: 'Return to homepage'
    },
    {
      id: 'search',
      path: '/listings',
      icon: '🔍',
      label: 'Search',
      requiresAuth: false,
      roles: [],
      isPrimary: false,
      description: 'Search properties'
    },
    {
      id: 'post',
      path: '/dashboard/post-property',
      icon: '➕',
      label: 'Post',
      requiresAuth: true,
      roles: ['landlord', 'tenant', 'estate-firm', 'admin'],
      isPrimary: true,
      description: 'Create new listing'
    },
    {
      id: 'services',
      path: '/services',
      icon: '🛠️',
      label: 'Services',
      requiresAuth: false,
      roles: [],
      isPrimary: false,
      description: 'Service providers'
    },
    {
      id: 'dashboard',
      path: '/dashboard',
      icon: '📊',
      label: 'Dashboard',
      requiresAuth: true,
      roles: ['tenant', 'landlord', 'manager', 'provider', 'estate-firm', 'admin'],
      isPrimary: false,
      description: 'Your dashboard'
    }
  ];

  /**
   * Handle navigation with auth & role checks
   */
  const handleNavigation = (item) => {
    if (item.requiresAuth && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (item.roles.length > 0 && user && !item.roles.includes(user.role)) {
      alert(`This feature is only available for: ${item.roles.join(', ')}`);
      return;
    }

    navigate(item.path);
  };

  /**
   * Determine visibility
   */
  const shouldShowItem = (item) => {
    if (!item.requiresAuth) return true;
    if (!isAuthenticated) return false;
    if (item.roles.length === 0) return true;
    return item.roles.includes(user?.role);
  };

  const visibleItems = NAV_ITEMS.filter(shouldShowItem);

  /**
   * Mobile-only rendering
   */
  if (window.innerWidth > 768) {
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
            title={item.description}
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