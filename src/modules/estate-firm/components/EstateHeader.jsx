import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Building, Briefcase, DollarSign, 
  MessageSquare, Settings, Users, BarChart,
  FileText, Shield, Upload, LogOut,
  Menu, X, ChevronDown, Bell, User
} from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './EstateHeader.css';

const EstateHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  // Fetch notifications on mount and subscribe to new ones
  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    
    // Subscribe to new notifications
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) {
      console.error('Error fetching notifications:', error);
      return;
    }
    setNotifications(data || []);
    setUnreadCount(data.filter(n => !n.read).length);
  };

  const markAsRead = async (id) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    if (!error) {
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => prev - 1);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', unreadIds);
    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePostProperty = () => {
    navigate('/post-property?type=estate-firm');
    setMobileMenuOpen(false);
  };

  const handlePostService = () => {
    navigate('/dashboard/estate-firm/post-service');
    setMobileMenuOpen(false);
  };

  const handleBulkUpload = () => {
    navigate('/dashboard/estate-firm/bulk-upload');
    setMobileMenuOpen(false);
  };

  const navItems = [
    { path: '/dashboard/estate-firm', icon: Home, label: 'Overview' },
    { path: '/dashboard/estate-firm/properties', icon: Building, label: 'Portfolio' },
    { path: '/dashboard/estate-firm/services', icon: Briefcase, label: 'Services' },
    { path: '/dashboard/estate-firm/clients', icon: Users, label: 'Clients' },
    { path: '/dashboard/estate-firm/analytics', icon: BarChart, label: 'Analytics' },
    { path: '/dashboard/estate-firm/documents', icon: FileText, label: 'Documents' },
    { path: '/dashboard/estate-firm/verification', icon: Shield, label: 'Verification' },
    { path: '/dashboard/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/dashboard/estate-firm/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <header className="estate-header">
      <div className="header-container">
        {/* Left: Logo & Mobile Menu Button */}
        <div className="header-left">
          <button 
            className="mobile-menu-btn d-lg-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link to="/dashboard/estate-firm" className="logo">
            
            <span className="logo-text">RentEasy</span>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="desktop-nav d-none d-lg-flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions & Profile */}
        <div className="header-right">
          <button className="action-btn" onClick={handlePostProperty} title="Post Property">
            <Building size={20} />
          </button>
          <button className="action-btn" onClick={handlePostService} title="Post Service">
            <Briefcase size={20} />
          </button>
          <button className="action-btn" onClick={handleBulkUpload} title="Bulk Upload">
            <Upload size={20} />
          </button>

          {/* Notifications */}
          <div className="notifications-dropdown" ref={notifRef}>
            <button 
              className="action-btn" 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="badge">{unreadCount}</span>
              )}
            </button>
            {notificationsOpen && (
              <div className="dropdown-menu notifications-menu">
                <div className="notifications-header">
                  <h4>Notifications</h4>
                  {unreadCount > 0 && (
                    <button className="mark-read" onClick={markAllAsRead}>
                      Mark all read
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <p className="empty">No notifications</p>
                ) : (
                  <>
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        className={`notification-item ${!n.read ? 'unread' : ''}`}
                        onClick={() => !n.read && markAsRead(n.id)}
                      >
                        <p>{n.message}</p>
                        <small>{new Date(n.created_at).toLocaleString()}</small>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="user-dropdown" ref={userMenuRef}>
            <button 
              className="user-btn" 
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <User size={20} />
              <span className="user-name">{user?.name || 'Profile'}</span>
              <ChevronDown size={16} />
            </button>
            {userMenuOpen && (
              <div className="dropdown-menu user-menu">
                <Link to="/dashboard/estate-firm/settings" className="menu-item">
                  <Settings size={16} /> Settings
                </Link>
                <button onClick={handleLogout} className="menu-item">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-header">
          <h3>Menu</h3>
          <button onClick={() => setMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <nav className="mobile-nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="mobile-actions">
            <button className="btn btn-primary" onClick={handlePostProperty}>
              <Building size={18} /> Post Property
            </button>
            <button className="btn btn-outline" onClick={handlePostService}>
              <Briefcase size={18} /> Post Service
            </button>
            <button className="btn btn-outline" onClick={handleBulkUpload}>
              <Upload size={18} /> Bulk Upload
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-nav-overlay d-lg-none"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default EstateHeader;