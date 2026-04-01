// src/modules/dashboard/components/landlord/LandlordLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import {
  Home, Building, DollarSign, MessageSquare, 
  User, Settings, Bell, Wallet, Share2, 
  BarChart3, Receipt, LogOut, PlusCircle, Menu, X
} from 'lucide-react';
import './LandlordLayout.css';

const LandlordLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count for the bell badge
  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      // Count unread landlord_notifications (from estate firms)
      const { count, error } = await supabase
        .from('landlord_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('landlord_id', user.id)
        .eq('read', false);

      if (!error && count !== null) {
        setUnreadCount(count);
      }
    };

    fetchUnreadCount();

    // Subscribe to real-time notifications
    const subscription = supabase
      .channel('landlord-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'landlord_notifications',
          filter: `landlord_id=eq.${user.id}`
        },
        (payload) => {
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const navItems = [
    { id: 'overview', path: '/dashboard/landlord', label: 'Overview', icon: <Home size={20} /> },
    { id: 'properties', path: '/dashboard/landlord/properties', label: 'Properties', icon: <Building size={20} /> },
    { id: 'earnings', path: '/dashboard/landlord/earnings', label: 'Earnings', icon: <DollarSign size={20} /> },
    { id: 'wallet', path: '/dashboard/landlord/wallet', label: 'Wallet', icon: <Wallet size={20} /> },
    { id: 'referrals', path: '/dashboard/landlord/referrals', label: 'Referrals', icon: <Share2 size={20} /> },
    { id: 'rent-tracking', path: '/dashboard/landlord/rent-tracking', label: 'Rents', icon: <Receipt size={20} /> },
    { id: 'messages', path: '/dashboard/messages', label: 'Messages', icon: <MessageSquare size={20} /> },
    { id: 'analytics', path: '/dashboard/landlord/analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
  ];

  return (
    <div className="landlord-app-wrapper">
      {/* Sidebar */}
      <aside className={`landlord-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon"><Building size={24} color="white" /></div>
          <span>RentEasy<span className="pro-tag">PRO</span></span>
        </div>

        <div className="sidebar-nav-container">
          <div className="nav-group">
            <p className="nav-group-label">Main Menu</p>
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
                end={item.path === '/dashboard/landlord'}
              >
                <span className="link-icon">{item.icon}</span>
                <span className="link-label">{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="nav-group secondary">
            <p className="nav-group-label">Account</p>
            <NavLink to="/dashboard/landlord/profile" className="nav-link-item">
              <User size={20} /> <span>Profile</span>
            </NavLink>
            <NavLink to="/dashboard/landlord/settings" className="nav-link-item">
              <Settings size={20} /> <span>Settings</span>
            </NavLink>
            <button onClick={logout} className="nav-link-item logout-btn-sidebar">
              <LogOut size={20} /> <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="landlord-content-stack">
        {/* Modern Header with Notifications Bell */}
        <header className="landlord-navbar">
          <div className="navbar-left">
            <button className="mobile-menu-trigger" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h2 className="page-context-title">Landlord Portal</h2>
          </div>

          <div className="navbar-right">
            {/* Notifications Bell with Badge */}
            <button 
              className="nav-icon-btn notification-bell"
              onClick={() => navigate('/dashboard/landlord/notifications')}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </button>
            
            <div className="nav-user-pill">
              <div className="user-avatar-sm">{user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'L'}</div>
              <span className="user-name-sm">{user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Landlord'}</span>
            </div>
          </div>
        </header>

        <main className="landlord-main-viewport">
          <Outlet />
        </main>
      </div>
      
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
};

export default LandlordLayout;