// src/modules/super-admin/components/SuperAdminLayout.jsx
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SuperAdminSideBar from './SuperAdminSideBar';
import './SuperAdminLayout.css';

const SuperAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('superAdminData');
    navigate('/login');
  };

  return (
    <div className="super-admin-container">
      {/* Mobile Header */}
      <header className="super-admin-mobile-header">
        <button 
          className="menu-toggle" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          <span className="menu-icon">☰</span>
        </button>
        <div className="mobile-brand">
          <span className="security-badge">🔒</span>
          <h1>RentEasy Super Admin</h1>
        </div>
        <button className="mobile-logout" onClick={handleLogout} aria-label="Logout">
          <span className="logout-icon">🚪</span>
        </button>
      </header>

      {/* Sidebar with props */}
      <SuperAdminSideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <main className="super-admin-main">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default SuperAdminLayout;