// src/modules/manager/components/ManagerLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ManagerSidebar from './ManagerSidebar';
import './ManagerLayout.css';

const ManagerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="manager-layout">
      {/* Mobile Sidebar Toggle Button */}
      <button 
        className="manager-sidebar-toggle"
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        aria-expanded={sidebarOpen}
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>
      
      {/* Manager Sidebar - Pass isOpen prop */}
      <ManagerSidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}
      
      <main className="manager-main">
        <div className="manager-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ManagerLayout;