// src/modules/manager/components/ManagerSidebarNew.jsx
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import NotificationBadge from './NotificationBadge';
import './ManagerSidebarNew.css';

const ManagerSidebarNew = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle click outside to close sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close on mobile devices (not desktop)
      if (!isDesktop && isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, isDesktop, onClose]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (!isDesktop && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isDesktop]);

  if (!user) return null;

  const handleLinkClick = () => {
    if (onClose && !isDesktop) {
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard/manager', exact: true },
    { id: 'notifications', label: 'Notifications', icon: '🔔', path: '/dashboard/manager/notifications', hasBadge: true },
    { id: 'chats', label: 'My Chats', icon: '💬', path: '/dashboard/manager/chats' },
    { id: 'properties', label: 'Properties', icon: '🏠', path: '/dashboard/manager/properties' },
    { id: 'payments', label: 'Payments', icon: '💰', path: '/dashboard/manager/payments' },
    { id: 'kyc', label: 'KYC', icon: '🆔', path: '/dashboard/manager/kyc' },
    { id: 'radius', label: 'Area Settings', icon: '📍', path: '/dashboard/manager/radius' },
    { id: 'commission', label: 'Commission', icon: '📈', path: '/dashboard/manager/commission' },
    { id: 'analytics', label: 'Analytics', icon: '📊', path: '/dashboard/manager/analytics' },
    { id: 'setup', label: 'Setup', icon: '⚙️', path: '/dashboard/manager/setup' }
  ];

  const sidebarStyle = {
    position: 'fixed',
    top: '0',
    left: 0,
    bottom: 0,
    width: '280px',
    background: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 1000,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    boxShadow: isOpen && !isDesktop ? '2px 0 8px rgba(0,0,0,0.1)' : 'none'
  };

  return (
    <>
      {/* Overlay for mobile */}
      {!isDesktop && isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            animation: 'fadeIn 0.3s ease'
          }}
        />
      )}
      
      <div ref={sidebarRef} style={sidebarStyle}>
        {/* Sidebar Header */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: '600'
            }}>
              {user.name?.charAt(0).toUpperCase() || 'M'}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>{user.name || 'Manager'}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                <span style={{ background: '#eef2ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '500' }}>👨‍💼 Manager</span>
                <span style={{ background: '#fef9c3', color: '#ca8a04', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '500' }}>2.5% Commission</span>
              </div>
            </div>
          </div>

          {/* Close button for mobile */}
          {!isDesktop && (
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#64748b',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          )}

          {/* Notification Bell */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <NotificationBadge />
          </div>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, padding: '20px 12px' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {menuItems.map(item => (
              <li key={item.id} style={{ margin: '4px 0', position: 'relative' }}>
                <NavLink
                  to={item.path}
                  end={item.exact}
                  onClick={handleLinkClick}
                  className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    background: isActive ? '#eef2ff' : 'transparent',
                    color: isActive ? '#4f46e5' : '#1f2937'
                  })}
                >
                  <span className="nav-link-icon" style={{ fontSize: '1.2rem', width: '24px', textAlign: 'center' }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.hasBadge && (
                    <NotificationBadge />
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <span style={{ fontSize: '1.2rem', width: '24px', textAlign: 'center' }}>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .sidebar-nav-link {
          transition: all 0.2s ease;
        }
        
        .sidebar-nav-link:hover {
          background: #f8fafc;
          transform: translateX(4px);
        }
        
        .sidebar-nav-link.active {
          background: #eef2ff;
          color: #4f46e5;
          border-left: 3px solid #4f46e5;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 4px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </>
  );
};

export default ManagerSidebarNew;