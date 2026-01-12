import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import './SuperAdminLayout.css';

const SuperAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { path: '/super-admin/command-center', icon: '📊', label: 'Command Center' },
    { path: '/super-admin/admin-management', icon: '👥', label: 'Admin Management' },
    { path: '/super-admin/global-listings', icon: '🏠', label: 'Global Listings' },
    { path: '/super-admin/global-managers', icon: '🛡️', label: 'Global Managers' },
    { path: '/super-admin/chats-oversight', icon: '💬', label: 'Chats Oversight' },
    { path: '/super-admin/payments-commission', icon: '💰', label: 'Payments & Commission' },
    { path: '/super-admin/disputes', icon: '⚖️', label: 'Disputes & Overrides' },
    { path: '/super-admin/verification-authority', icon: '✅', label: 'Verification Authority' },
    { path: '/super-admin/system-rules', icon: '⚙️', label: 'System Rules' },
    { path: '/super-admin/audit-logs', icon: '📝', label: 'Audit Logs' },
    { path: '/super-admin/emergency-controls', icon: '🚨', label: 'Emergency Controls', warning: true },
  ];

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

      {/* Sidebar */}
      <aside className={`super-admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="security-status">
            <div className="security-badge-large">🔐</div>
            <div className="security-info">
              <h2>Super Admin Console</h2>
              <p className="security-level">ROOT ACCESS • PROTECTED</p>
            </div>
          </div>
          <button 
            className="close-sidebar" 
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

    <nav className="super-admin-nav">
  {navItems.map((item) => (
    <NavLink
      key={item.path}
      to={item.path}
      className={({ isActive }) => 
        `nav-item ${isActive ? 'active' : ''} ${item.warning ? 'warning-item' : ''}`  // ADD BACKTICKS HERE
      }
      onClick={() => setSidebarOpen(false)}
    >
      <span className="nav-icon">{item.icon}</span>
      <span className="nav-label">{item.label}</span>
      {item.warning && <span className="warning-dot">⚠️</span>}
    </NavLink>
  ))}
</nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">👑</div>
            <div>
              <p className="user-name">Super Administrator</p>
              <p className="user-role">Root Access</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span className="logout-icon">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content - NO FOOTER */}
      <main className="super-admin-main">
        <div className="content-wrapper">
          <Outlet />
        </div>
        {/* NO SECURITY FOOTER HERE */}
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