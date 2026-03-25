import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import { Bell } from 'lucide-react';
import './TenantSidebar.css';

const TenantSidebarLayout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileId, setProfileId] = useState(null);

  // Fetch profile ID and unread notifications
  useEffect(() => {
    if (!user) return;

    const fetchProfileId = async () => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (!error && profile) {
        setProfileId(profile.id);
        
        // Fetch unread count from tenant notifications
        const { count } = await supabase
          .from('estate_firm_notifications')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', profile.id)
          .eq('read', false);
        
        setUnreadCount(count || 0);
      }
    };
    
    fetchProfileId();
  }, [user]);

  // Subscribe to new notifications
  useEffect(() => {
    if (!profileId) return;

    const subscription = supabase
      .channel('tenant-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'estate_firm_notifications',
        filter: `tenant_id=eq.${profileId}`
      }, () => {
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [profileId]);

  const menuItems = [
    { name: 'Dashboard', icon: '📊', path: '/dashboard/tenant' },
    { name: 'Profile', icon: '👤', path: '/dashboard/tenant/profile' },
    { name: 'My Applications', icon: '📝', path: '/dashboard/tenant/applications' },
    { name: 'Saved Properties', icon: '⭐', path: '/dashboard/tenant/saved' },
    { name: 'Rent Management', icon: '💰', path: '/dashboard/tenant/rent-management' },
    { name: 'Documents', icon: '📄', path: '/dashboard/tenant/documents' },
    { name: 'Rental History', icon: '📜', path: '/dashboard/tenant/rental-history' },
    { name: 'Payments', icon: '💰', path: '/dashboard/tenant/payments' },
    { name: 'Maintenance', icon: '🔧', path: '/dashboard/tenant/maintenance' },
    { name: 'Referrals', icon: '🎁', path: '/dashboard/tenant/referrals' },
    { name: 'Notifications', icon: '🔔', path: '/dashboard/tenant/notifications', badge: unreadCount },
    { name: 'KYC', icon: '⚠️', path: '/dashboard/tenant/kyc' },
    { name: 'Settings', icon: '⚙️', path: '/dashboard/tenant/settings' },
  ];

  const getNotificationsRoute = () => {
    return '/dashboard/tenant/notifications';
  };

  const getProfileRoute = () => {
    return '/dashboard/tenant/profile';
  };

  const getUserDisplayName = () => {
    if (!user) return 'Tenant';
    return user.full_name || user.email?.split('@')[0] || 'Tenant';
  };

  return (
    <div className={`tenant-layout ${isOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile Header */}
      <div className="mobile-nav-header">
        <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>☰</button>
        <span className="brand-name">RentEasy</span>
        <div className="header-actions">
          {/* Notification Bell */}
          <button 
            className="notification-bell" 
            onClick={() => navigate(getNotificationsRoute())}
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>
          <div className="user-dot" onClick={() => navigate(getProfileRoute())}>
            {getUserDisplayName().charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* The Sidebar */}
      <aside className={`tenant-sidebar ${isOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-text">RentEasy</span>
          </div>
          <button className="close-menu" onClick={() => setIsOpen(false)}>×</button>
        </div>

        <div className="user-info">
          <div className="user-avatar">
            {getUserDisplayName().charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <h4>{getUserDisplayName()}</h4>
            <span>Tenant</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <div 
              key={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => { navigate(item.path); setIsOpen(false); }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
              {item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={signOut}>
            <span>🚪 Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="tenant-main-content">
        <div className="content-container">
          <Outlet />
        </div>
      </main>

      {/* Backdrop for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
    </div>
  );
};

export default TenantSidebarLayout;