import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import ManagerSidebar from './ManagerSidebarNew';
import { Bell, User, Menu, X } from 'lucide-react';
import './ManagerLayout.css';

const ManagerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

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
          <div className="notifications">
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </div>
          <div className="user-profile">
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