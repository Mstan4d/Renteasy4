import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient'; // adjust import path as needed
import { 
  Menu, X, User, Bell, MessageSquare, PlusCircle, 
  ChevronDown, Search, Shield, Home, Building
} from 'lucide-react';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isPostDropdownOpen, setIsPostDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // Fetch unread count and subscribe to new notifications
  useEffect(() => {
    if (!user) return;

    let notificationUserId = null;
    let fetchUserId = async () => {
      // Determine the user_id used in notifications table
      if (user.role === 'estate-firm') {
        const { data: profile } = await supabase
          .from('estate_firm_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        if (profile) notificationUserId = profile.id;
      } else {
        notificationUserId = user.id;
      }

      if (notificationUserId) {
        // Fetch initial unread count
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', notificationUserId)
          .eq('read', false);
        setUnreadCount(count || 0);

        // Subscribe to new notifications
        const subscription = supabase
          .channel('notifications')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${notificationUserId}`
          }, () => {
            setUnreadCount(prev => prev + 1);
          })
          .subscribe();

        return () => supabase.removeChannel(subscription);
      }
    };

    fetchUserId();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsUserDropdownOpen(false);
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.name || user.fullName || user.email?.split('@')[0] || 'User';
  };

  const getDashboardRoute = () => {
  if (!user) return '/dashboard';
  switch(user.role) {
    case 'tenant': return '/dashboard/tenant';
    case 'landlord': return '/dashboard/landlord';
    case 'admin': return '/admin';
    case 'estate-firm': return '/dashboard/estate-firm';
    default: return '/dashboard';
  }
};

const getProfileRoute = () => {
  if (!user) return '/login';
  switch(user.role) {
    case 'tenant': return '/dashboard/tenant/profile';
    case 'landlord': return '/dashboard/landlord/profile';
    case 'admin': return '/admin/profile';
    case 'estate-firm': return '/dashboard/estate-firm/profile';
    default: return '/dashboard/profile';
  }
};
  const getNotificationsRoute = () => {
    if (!user) return '/notifications';
    switch(user.role) {
      case 'estate-firm': return '/dashboard/estate-firm/notifications';
      default: return '/dashboard/notifications';
    }
  };

  // Navigation links
  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/services', label: 'Services', icon: Building },
    { path: '/listings', label: 'Search', icon: Search },
  ];
  if (user) {
    navLinks.push({ 
      path: '/dashboard/messages', 
      label: 'Messages', 
      icon: MessageSquare, 
      badge: 0 // we might track unread messages later
    });
  }

  const postOptions = [
    {
      path: '/dashboard/post-property',
      label: 'Post Property',
      description: 'List apartment for rent or takeover',
      icon: <PlusCircle size={16} />
    }
  ];

  const getUserMenuItems = () => {
    const items = [
      { path: getProfileRoute(), label: 'Profile', icon: <User size={16} /> },
      { path: getDashboardRoute(), label: 'Dashboard', icon: <Home size={16} /> },
      { path: '/listings', label: 'Search Listings', icon: <Search size={16} /> },
      { 
        path: '/dashboard/messages', 
        label: 'Messages', 
        icon: <MessageSquare size={16} />,
        badge: null
      }
    ];
    if (user?.role === 'admin') {
      items.push({ 
        path: '/admin', 
        label: 'Admin Panel', 
        icon: <Shield size={16} />,
        className: 'admin-menu-item'
      });
    }
    return items;
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserDropdownOpen && !event.target.closest('.user-dropdown-container')) {
        setIsUserDropdownOpen(false);
      }
      if (isPostDropdownOpen && !event.target.closest('.post-dropdown-container')) {
        setIsPostDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isUserDropdownOpen, isPostDropdownOpen]);

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo – custom "R" design */}
        <div className="logo">
          <Link to="/" className="logo-link">
            <div className="custom-logo">R</div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <ul className="nav-list">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link 
                  to={link.path} 
                  className="nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.icon && <link.icon size={18} className="nav-icon" />}
                  <span className="nav-label">{link.label}</span>
                  {link.badge > 0 && (
                    <span className="nav-badge">{link.badge}</span>
                  )}
                </Link>
              </li>
            ))}
            
            {user && (
              <li className="post-dropdown-container">
                <button 
                  className="nav-link post-dropdown-trigger"
                  onClick={() => setIsPostDropdownOpen(!isPostDropdownOpen)}
                >
                  <PlusCircle size={18} className="nav-icon" />
                  <span className="nav-label">Post</span>
                  <ChevronDown size={14} className={`dropdown-arrow ${isPostDropdownOpen ? 'rotated' : ''}`} />
                </button>
                
                {isPostDropdownOpen && (
                  <div className="post-dropdown">
                    <div className="post-dropdown-header">
                      <h4>Create Listing</h4>
                      <p>Choose what you want to post</p>
                    </div>
                    <div className="post-dropdown-options">
                      {postOptions.map((option) => (
                        <Link
                          key={option.path}
                          to={option.path}
                          className="post-dropdown-option"
                          onClick={() => {
                            setIsPostDropdownOpen(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <div className="post-option-icon">
                            {option.icon}
                          </div>
                          <div className="post-option-content">
                            <span className="post-option-title">{option.label}</span>
                            <span className="post-option-description">{option.description}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            )}
          </ul>
        </nav>

        {/* User Actions */}
        <div className="user-actions">
          {user ? (
            <>
              {user.role === 'admin' && (
                <div className="admin-badge-header">
                  <Shield size={18} />
                  <span className="admin-label">Admin</span>
                </div>
              )}

              <Link to="/dashboard/messages" className="messages-link">
                <MessageSquare size={20} />
                {/* message unread count can be added later */}
              </Link>
              
              {/* Notifications Bell */}
              <Link to={getNotificationsRoute()} className="notification-bell">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="badge">{unreadCount}</span>
                )}
              </Link>
              
              {/* User Dropdown */}
              <div className="user-dropdown-container">
                <button 
                  className="user-button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                >
                  <div className="user-avatar">
                    {user.role === 'admin' ? (
                      <Shield size={20} className="admin-icon" />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <span className="user-name">
                    Hi, {getUserDisplayName()}
                  </span>
                  <ChevronDown size={14} className={`dropdown-arrow ${isUserDropdownOpen ? 'rotated' : ''}`} />
                </button>
                
                {isUserDropdownOpen && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-info">
                      <div className="user-dropdown-avatar">
                        {user.role === 'admin' ? '👑' : '👤'}
                      </div>
                      <div className="user-dropdown-details">
                        <strong>{getUserDisplayName()}</strong>
                        <span className="user-role-badge">{user.role}</span>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    {getUserMenuItems().map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`dropdown-item ${item.className || ''}`}
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                        {item.badge && <span className="dropdown-badge">{item.badge}</span>}
                      </Link>
                    ))}
                    <div className="dropdown-divider"></div>
                    <button 
                      onClick={handleLogout}
                      className="dropdown-item logout-button"
                    >
                      <span>🚪</span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-button">
                Login
              </Link>
              <Link to="/signup" className="signup-button">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation (unchanged) */}
      {isMobileMenuOpen && (
        <div className="mobile-nav">
          <ul className="mobile-nav-list">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className="mobile-nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.icon && <link.icon size={18} className="mobile-nav-icon" />}
                  <span className="mobile-nav-label">{link.label}</span>
                  {link.badge > 0 && (
                    <span className="mobile-nav-badge">{link.badge}</span>
                  )}
                </Link>
              </li>
            ))}
            {user ? (
              <>
                <li className="mobile-user-section">
                  <div className="mobile-user-info">
                    <div className="mobile-user-avatar">
                      {user.role === 'admin' ? '👑' : '👤'}
                    </div>
                    <div className="mobile-user-details">
                      <strong>{getUserDisplayName()}</strong>
                      <span className="mobile-user-role">{user.role}</span>
                    </div>
                  </div>
                </li>
                <li>
                  <Link
                    to={getProfileRoute()}
                    className="mobile-nav-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User size={18} />
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    to={getDashboardRoute()}
                    className="mobile-nav-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Home size={18} />
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/messages"
                    className="mobile-nav-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <MessageSquare size={18} />
                    Messages
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="mobile-logout-button"
                  >
                    <span>🚪</span>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/login"
                    className="mobile-login-button"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className="mobile-signup-button"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;