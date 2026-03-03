// src/modules/super-admin/components/SuperAdminSideBar.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './SuperAdminSideBar.css';

const SuperAdminSideBar = ({ isOpen, onClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'COMMAND CENTER',
      path: '/super-admin/command-center',
      icon: '📊',
      color: '#2196F3'
    },
    {
      title: 'ADMIN MANAGEMENT',
      path: '/super-admin/admin-management',
      icon: '👥',
      color: '#4CAF50'
    },
    {
      title: 'GLOBAL LISTINGS',
      path: '/super-admin/global-listings',
      icon: '🏠',
      color: '#FF9800'
    },
    {
      title: 'GLOBAL MANAGERS',
      path: '/super-admin/global-managers',
      icon: '👨‍💼',
      color: '#9C27B0'
    },
    {
      title: 'CHATS OVERSIGHT',
      path: '/super-admin/chats-oversight',
      icon: '💬',
      color: '#00BCD4'
    },
    {
      title: 'PAYMENTS & COMMISSION',
      path: '/super-admin/payments-commission',
      icon: '💰',
      color: '#8BC34A'
    },
    {
      title: 'DISPUTES & OVERRIDES',
      path: '/super-admin/disputes',
      icon: '⚖️',
      color: '#F44336'
    },
    {
      title: 'MANAGE STATES',
      path: '/super-admin/states',
      icon: '⚖️',
      color: '#042127'
    },
    {
      title: 'VERIFICATION AUTHORITY',
      path: '/super-admin/verification-authority',
      icon: '✅',
      color: '#3F51B5'
    },
    {
      title: 'SYSTEM RULES',
      path: '/super-admin/system-rules',
      icon: '⚙️',
      color: '#607D8B'
    },
    {
      title: 'AUDIT LOGS',
      path: '/super-admin/audit-logs',
      icon: '📜',
      color: '#795548'
    },
    {
      title: 'EMERGENCY CONTROLS',
      path: '/super-admin/emergency-controls',
      icon: '🚨',
      color: '#E91E63'
    }
  ];

  const handleLogout = () => {
    // Clear session – adjust to your auth method
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const handleLinkClick = () => {
    // Close sidebar on mobile after clicking a link
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <div className={`super-admin-sidebar ${collapsed ? 'collapsed' : ''} ${isOpen ? 'mobile-open' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        {!collapsed && (
          <div className="brand-section">
            <div className="logo">🔐</div>
            <div className="brand-info">
              <h2 className="brand-title">RentEasy</h2>
              <p className="brand-subtitle">Super Admin Console</p>
            </div>
          </div>
        )}
        <button 
          className="collapse-btn" 
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `nav-item ${isActive ? 'active' : ''}`
            }
            title={collapsed ? item.title : ''}
            onClick={handleLinkClick}
          >
            <span className="nav-icon" style={{ color: item.color }}>
              {item.icon}
            </span>
            {!collapsed && <span className="nav-text">{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="admin-status">
          <div className="status-indicator active"></div>
          {!collapsed && <span className="status-text">Super Admin Active</span>}
        </div>
        <button 
          className="logout-btn"
          onClick={handleLogout}
          title="Logout"
        >
          <span className="logout-icon">🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Security Badge */}
      <div className="security-badge">
        <div className="shield-icon">🛡️</div>
        {!collapsed && (
          <div className="security-info">
            <div className="security-level">LEVEL 5</div>
            <div className="security-desc">Highest Privilege</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminSideBar;