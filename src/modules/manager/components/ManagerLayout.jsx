// src/modules/manager/components/ManagerLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import ManagerSidebar from './ManagerSidebar';
import { Bell, User, Menu, X } from 'lucide-react';
import './ManagerLayout.css';

const ManagerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // On desktop, sidebar should be open by default
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="manager-layout">
      {/* Fixed Header */}
      <header className="manager-header">
        <div className="header-left">
          <button 
            className="header-menu-toggle"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
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

      {/* Sidebar – placed below header */}
      <ManagerSidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Overlay for mobile */}
      {sidebarOpen && window.innerWidth < 1024 && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className={`manager-main ${sidebarOpen ? 'sidebar-visible' : ''}`}>
        <div className="manager-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ManagerLayout;