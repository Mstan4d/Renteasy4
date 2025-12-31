// src/shared/components/layout/DashboardSidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './DashboardSidebar.css';

const DashboardSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const tenantMenuItems = [
    { path: '/dashboard/tenant', icon: '📊', label: 'Overview' },
    { path: '/dashboard/tenant/profile', icon: '👤', label: 'Profile' },
    { path: '/dashboard/tenant/applications', icon: '📋', label: 'Applications' },
    { path: '/dashboard/tenant/saved', icon: '⭐', label: 'Saved Properties' },
    { path: '/dashboard/tenant/rental-history', icon: '📅', label: 'Rental History' },
    { path: '/dashboard/tenant/payments', icon: '💳', label: 'Payments' },
    { path: '/dashboard/tenant/maintenance', icon: '🔧', label: 'Maintenance' },
    { path: '/dashboard/tenant/documents', icon: '📄', label: 'Documents' },
    { path: '/dashboard/tenant/referrals', icon: '🤝', label: 'Referrals' },
    { path: '/dashboard/tenant/settings', icon: '⚙️', label: 'Settings' },
    { path: '/dashboard/messages', icon: '💬', label: 'Messages' },
    { path: '/verify', icon: '✅', label: 'Get Verified' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-sidebar">
      <div className="sidebar-header">
        <h2>RentEasy</h2>
        <div className="user-brief">
          <div className="user-avatar-small">
            {user?.name?.charAt(0)}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role}</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-menu">
          {tenantMenuItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="btn-logout" onClick={handleLogout}>
          <span className="logout-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;