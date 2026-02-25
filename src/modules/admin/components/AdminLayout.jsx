// src/modules/admin/components/AdminLayout.jsx
import React, { useState, useEffect } from 'react'; // ADD useEffect
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'; // ADD useLocation
import { useAuth } from '../../../shared/context/AuthContext';
import { 
  LayoutDashboard, Users, Home, Building, ShieldCheck, 
  BarChart3, Settings, LogOut, Menu, X, Bell, Search,
  FileText, AlertCircle, DollarSign, CreditCard, Plus, ToolCase, ToolBox
} from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // ADD to track current location
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false); // ADD state for dropdown

  // FIX: Initialize sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // FIX: Load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, []);

  // FIX: Close sidebar on mobile when clicking a link
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/users', label: 'Users', icon: <Users size={20} /> },
    { path: '/admin/listings', label: 'Listings', icon: <Home size={20} /> },
    { path: '/admin/services', label: 'Services', icon: <Building size={20} /> },
    { path: '/admin/verifications', label: 'Verifications', icon: <ShieldCheck size={20} /> },
    { path: '/admin/reports', label: 'Reports', icon: <FileText size={20} /> },
    { path: '/admin/issues', label: 'Issues', icon: <AlertCircle size={20} /> },
    { path: '/admin/transactions', label: 'Transactions', icon: <CreditCard size={20} /> },
    { path: '/admin/revenue', label: 'Revenue', icon: <DollarSign size={20} /> },
    { path: '/admin/analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
    { path: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
    { path: '/admin/provider-overview', label: 'Providers', icon: <ToolCase size={20} /> },
    { path: '/admin/service-categories', label: 'Services', icon: <ToolBox size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    // Search across different entities
    const allListings = JSON.parse(localStorage.getItem('listings') || '[]');
    const allUsers = JSON.parse(localStorage.getItem('rentEasyUsers') || '[]');
    
    const matchingListings = allListings.filter(listing => 
      listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchingUsers = allUsers.filter(user => 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (matchingListings.length > 0) {
      navigate('/admin/listings', { state: { searchTerm } });
    } else if (matchingUsers.length > 0) {
      navigate('/admin/users', { state: { searchTerm } });
    } else {
      alert(`No results found for "${searchTerm}"`);
    }
  };

  const loadNotifications = () => {
    const notificationsData = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    const unreadNotifications = notificationsData.filter(n => !n.read);
    setNotifications(unreadNotifications.slice(0, 5));
  };

  const markNotificationAsRead = (id) => {
    const allNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    const updatedNotifications = allNotifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    localStorage.setItem('adminNotifications', JSON.stringify(updatedNotifications));
    loadNotifications();
  };

  // FIX: Add proper handlers for verify and add buttons
  const handleVerifyClick = () => {
    navigate('/admin/verifications');
  };

  const handleAddClick = () => {
    // Check if user can add listings or need to choose type
    navigate('/admin/listings/new');
  };

  const markAllNotificationsAsRead = () => {
    const allNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    const updatedNotifications = allNotifications.map(n => ({ ...n, read: true }));
    localStorage.setItem('adminNotifications', JSON.stringify(updatedNotifications));
    setNotifications([]);
    setNotificationsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsOpen && !event.target.closest('.notifications-dropdown')) {
        setNotificationsOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [notificationsOpen]);

  if (user?.role !== 'admin') {
    return (
      <div className="admin-access-denied">
        <h2>⛔ Admin Access Required</h2>
        <p>You need administrator privileges to access this page.</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Go to Homepage
        </button>
      </div>
    );
  }

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="logo-section">
            <h2>RentEasy</h2>
            <span className="logo-badge">Admin</span>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Admin Profile */}
        <div className="admin-profile">
          <div className="admin-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="admin-details">
            <strong>{user?.name || 'Administrator'}</strong>
            <span className="admin-role">Super Admin</span>
            <small>{user?.email}</small>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="admin-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `nav-link ${isActive ? 'active' : ''}`
              }
              end={item.path === '/admin'}
              onClick={() => window.innerWidth < 768 && setSidebarOpen(false)} // Close on mobile click
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* System Status */}
        <div className="system-status">
          <div className="status-indicator online"></div>
          <span>System Online</span>
        </div>

        {/* Logout Button */}
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Top Navigation Bar */}
        <header className="admin-header">
          <div className="header-left">
            <button 
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              <Menu size={24} />
            </button>
            
            <form onSubmit={handleSearch} className="search-bar">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search users, listings, reports..."
                className="admin-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  type="button" 
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </form>
          </div>
          
          <div className="header-right">
            {/* Notifications Dropdown */}
            <div className="notifications-dropdown">
              <button 
                className="notification-btn"
                onClick={() => {
                  loadNotifications();
                  setNotificationsOpen(!notificationsOpen);
                }}
                aria-label="Notifications"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="notification-count">{notifications.length}</span>
                )}
              </button>
              
              {notificationsOpen && notifications.length > 0 && (
                <div className="notifications-menu">
                  <div className="notifications-header">
                    <h4>Notifications ({notifications.length})</h4>
                    <button 
                      className="mark-all-read"
                      onClick={markAllNotificationsAsRead}
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="notifications-list">
                    {notifications.map(notification => (
                      <div key={notification.id} className="notification-item">
                        <div className="notification-content">
                          <strong>{notification.title}</strong>
                          <p>{notification.message}</p>
                          <small>{new Date(notification.timestamp).toLocaleTimeString()}</small>
                        </div>
                        <button 
                          className="mark-read-btn"
                          onClick={() => {
                            markNotificationAsRead(notification.id);
                            if (notifications.length === 1) {
                              setNotificationsOpen(false);
                            }
                          }}
                          aria-label="Mark as read"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Status */}
            <div className="admin-indicator">
              <span className="online-dot"></span>
              <div className="admin-status">
                <span className="status-text">Admin Mode</span>
                <small>Last login: {new Date().toLocaleDateString()}</small>
              </div>
            </div>

            {/* Quick Actions Menu - FIXED buttons */}
            <div className="quick-actions">
              <button 
                className="btn-quick-action verify-btn"
                onClick={handleVerifyClick}
              >
                <ShieldCheck size={18} />
                <span>Verify</span>
              </button>
              <button 
                className="btn-quick-action add-btn"
                onClick={handleAddClick}
              >
                <Plus size={18} />
                <span>Add</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content Area */}
        <div className="admin-content">
          <Outlet />
        </div>

        {/* Footer */}
        <footer className="admin-footer">
          <div className="footer-content">
            <div className="footer-left">
              <p>RentEasy Admin Panel • v1.0.0 • {new Date().getFullYear()}</p>
              <span className="footer-links">
                <a href="#privacy">Privacy Policy</a> • 
                <a href="#terms">Terms of Service</a> • 
                <a href="#help">Help Center</a>
              </span>
            </div>
            <div className="footer-right">
              <span className="server-status">
                <span className="status-dot online"></span>
                Server: Online
              </span>
              <span className="update-time">
                Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <button 
                className="refresh-btn"
                onClick={() => window.location.reload()}
                aria-label="Refresh page"
              >
                ↻ Refresh
              </button>
            </div>
          </div>
        </footer>
      </main>

      {/* Mobile Overlay - FIX: Added to close sidebar on mobile */}
      {sidebarOpen && window.innerWidth < 768 && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;