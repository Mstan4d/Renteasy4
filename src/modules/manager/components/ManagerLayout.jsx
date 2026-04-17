import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import ManagerSidebar from './ManagerSidebarNew';
import { Bell, User, Menu, X } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import './ManagerLayout.css';

const ManagerLayout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Check mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch live notification count from manager_notifications table
  useEffect(() => {
    if (!user) return;

    const fetchNotificationCount = async () => {
      const { count, error } = await supabase
        .from('manager_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('manager_id', user.id)
        .eq('is_read', false);

      if (!error) setNotificationCount(count || 0);
    };

    fetchNotificationCount();

    // Subscribe to realtime changes on manager_notifications
    const channel = supabase
      .channel('manager-notifications-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'manager_notifications',
          filter: `manager_id=eq.${user.id}`,
        },
        () => {
          fetchNotificationCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="manager-layout">
      <header className="manager-header">
        <div className="header-left">
          <button 
            className="header-menu-toggle"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="header-title">RentEasy Manager</h1>
        </div>
        <div className="header-right">
          <div 
            className="notifications"
            onClick={() => navigate('/dashboard/manager/notifications')}
            style={{ cursor: 'pointer' }}
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
          </div>
          <div 
            className="user-profile"
            onClick={() => navigate('/dashboard/manager/profile')}
            style={{ cursor: 'pointer' }}
          >
            <User size={20} />
            <span className="user-name">Profile</span>
          </div>
        </div>
      </header>

      <ManagerSidebar 
        isOpen={sidebarOpen}
        isMobile={isMobile}
        onClose={() => setSidebarOpen(false)}
      />

      {sidebarOpen && isMobile && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className={`manager-main ${!sidebarOpen ? 'sidebar-collapsed' : ''}`}>
        <div className="manager-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ManagerLayout;