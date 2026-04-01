import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Building, Briefcase, DollarSign, 
  MessageSquare, Receipt, Settings, Users, BarChart,
  FileText, Shield, Upload, LogOut,
  Menu, X, ChevronDown, Bell, User, UserPlus, UserCircle
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
  const [unreadCount, setUnreadCount] = useState(0);
  const [userRole, setUserRole] = useState('principal');
  
  const userMenuRef = useRef(null);

  // Fetch user role
  useEffect(() => {
    const getUserRole = async () => {
      if (!user) return;
      try {
        const { data: roleData, error } = await supabase
          .from('estate_firm_profiles')
          .select('staff_role')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (!error && roleData) {
          setUserRole(roleData.staff_role || 'principal');
        }
      } catch (err) {
        console.warn('Could not fetch user role:', err);
      }
    };
    getUserRole();
  }, [user]);

  // Fetch initial unread count and subscribe to new notifications
  useEffect(() => {
    if (!user) return;
    
    const fetchUnreadCount = async () => {
      const { data: profile } = await supabase
        .from('estate_firm_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (profile) {
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id)
          .eq('read', false);
        setUnreadCount(count || 0);
      }
    };
    fetchUnreadCount();

    // Subscribe to new notifications
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
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
    // Only Principal and Executive can post services
    if (userRole === 'associate') {
      alert('Associates cannot post services. Please contact your firm principal.');
      return;
    }
    navigate('/dashboard/estate-firm/post-service');
    setMobileMenuOpen(false);
  };

  const handleBulkUpload = () => {
    // Only Principal and Executive can bulk upload
    if (userRole === 'associate') {
      alert('Associates cannot use bulk upload. Please contact your firm principal.');
      return;
    }
    navigate('/dashboard/estate-firm/bulk-upload');
    setMobileMenuOpen(false);
  };

  // Define navigation items based on role
  const getNavItems = () => {
    // Base items - everyone sees
    const baseItems = [
      { path: '/dashboard/estate-firm', icon: Home, label: 'Overview' },
      { path: '/dashboard/estate-firm/profile', icon: UserCircle, label: 'Profile' },
      { path: '/dashboard/estate-firm/properties', icon: Building, label: 'Portfolio' },
      { path: '/dashboard/estate-firm/clients', icon: Users, label: 'Clients' },
      { path: '/dashboard/estate-firm/analytics', icon: BarChart, label: 'Analytics' },
      { path: '/dashboard/estate-firm/documents', icon: FileText, label: 'Documents' },
      { path: '/dashboard/messages', icon: MessageSquare, label: 'Messages' },
      { path: '/dashboard/estate-firm/rent-tracking', icon: Receipt, label: 'Rents' },
    ];
    
    // Items for Principal and Executive (not for Associate)
    const principalExecutiveItems = [
      { path: '/dashboard/estate-firm/services', icon: Briefcase, label: 'Services' },
      { path: '/dashboard/estate-firm/verification', icon: Shield, label: 'Verification' },
      { path: '/dashboard/estate-firm/settings', icon: Settings, label: 'Settings' },
    ];
    
    // Items only for Principal
    const principalOnlyItems = [
      { path: '/dashboard/estate-firm/staff-manager', icon: UserPlus, label: 'Team' },
    ];
    
    if (userRole === 'associate') {
      return baseItems;
    } else if (userRole === 'executive') {
      return [...baseItems, ...principalExecutiveItems];
    } else {
      // Principal
      return [...baseItems, ...principalExecutiveItems, ...principalOnlyItems];
    }
  };

  const navItems = getNavItems();

  // Get role badge text
  const getRoleBadge = () => {
    switch(userRole) {
      case 'principal': return '👑 Principal';
      case 'executive': return '⭐ Executive';
      case 'associate': return '🤝 Associate';
      default: return '';
    }
  };

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
            <span className="role-badge">{getRoleBadge()}</span>
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
          
          {/* Only show Post Service for Principal and Executive */}
          {userRole !== 'associate' && (
            <button className="action-btn" onClick={handlePostService} title="Post Service">
              <Briefcase size={20} />
            </button>
          )}
          
          {/* Only show Bulk Upload for Principal and Executive */}
          {userRole !== 'associate' && (
            <button className="action-btn" onClick={handleBulkUpload} title="Bulk Upload">
              <Upload size={20} />
            </button>
          )}

          {/* Notifications Bell - navigates to notifications page */}
          <Link 
            to="/dashboard/estate-firm/notifications" 
            className="action-btn notification-bell"
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="badge">{unreadCount}</span>
            )}
          </Link>

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
            {userRole !== 'associate' && (
              <>
                <button className="btn btn-outline" onClick={handlePostService}>
                  <Briefcase size={18} /> Post Service
                </button>
                <button className="btn btn-outline" onClick={handleBulkUpload}>
                  <Upload size={18} /> Bulk Upload
                </button>
              </>
            )}
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