import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import './TenantSidebar.css';

const TenantSidebarLayout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: '📊', path: '/dashboard/tenant' },
    { name: 'Profile', icon: '👤', path: '/dashboard/tenant/profile' },
    { name: 'My Applications', icon: '📝', path: '/dashboard/tenant/applications' },
    { name: 'Saved Properties', icon: '⭐', path: '/dashboard/tenant/saved' },
    { name: 'Rental History', icon: '📜', path: '/dashboard/tenant/rental-history' },
    { name: 'Payments', icon: '💰', path: '/dashboard/tenant/payments' },
    { name: 'Maintenance', icon: '🔧', path: '/dashboard/tenant/maintenance' },
    { name: 'Referrals', icon: '🎁', path: '/dashboard/tenant/referrals' },
    { name: 'KYC', icon: '⚠️', path: '../verification/components/NewTenantKycForm'},
    { name: 'Settings', icon: '⚙️', path: '/dashboard/tenant/settings' },
  ];

  return (
    <div className={`tenant-layout ${isOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile Header */}
      <div className="mobile-nav-header">
        <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>☰</button>
        <span className="brand-name">RentEasy</span>
        <div className="user-dot"></div>
      </div>

      {/* The Sidebar */}
      <aside className={`tenant-sidebar ${isOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">RentEasy</div>
          <button className="close-menu" onClick={() => setIsOpen(false)}>×</button>
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
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={signOut}>
            <span>Logout</span>
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