import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../shared/context/AuthContext'
import './ManagerSidebarNew.css'

const ManagerSidebarNew = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const handleLinkClick = () => {
    if (onClose && window.innerWidth < 768) {
      onClose();
    }
  };

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard/manager', exact: true },
    { id: 'notifications', label: 'Notifications', icon: '🔔', path: '/dashboard/manager/notifications' },
    { id: 'chats', label: 'My Chats', icon: '💬', path: '/dashboard/manager/chats' },
    { id: 'properties', label: 'Properties', icon: '🏠', path: '/dashboard/manager/properties' },
    { id: 'payments', label: 'Payments', icon: '💰', path: '/dashboard/manager/payments' },
    { id: 'kyc', label: 'KYC', icon: '🆔', path: '/dashboard/manager/kyc' },
    { id: 'radius', label: 'Area Settings', icon: '📍', path: '/dashboard/manager/radius' },
    { id: 'commission', label: 'Commission', icon: '📈', path: '/dashboard/manager/commission' },
    { id: 'analytics', label: 'Analytics', icon: '📊', path: '/dashboard/manager/analytics' },
    { id: 'setup', label: 'Setup', icon: '⚙️', path: '/dashboard/manager/setup' }
  ]

  const sidebarStyle = {
    position: 'fixed',
    top: '64px',
    left: 0,
    bottom: 0,
    width: '260px',
    background: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    transition: 'transform 0.3s ease',
    zIndex: 900,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)'
  }

  // Desktop always visible
  if (window.innerWidth >= 1024 && !isOpen) {
    sidebarStyle.transform = 'translateX(-260px)'
  } else if (window.innerWidth >= 1024 && isOpen) {
    sidebarStyle.transform = 'translateX(0)'
  }

  return (
    <div style={sidebarStyle}>
      {/* Sidebar Header */}
      <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '0.75rem' }}>
              <span style={{ background: '#eef2ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '12px', fontWeight: '500' }}>👨‍💼 Manager</span>
              <span style={{ background: '#fef9c3', color: '#ca8a04', padding: '2px 8px', borderRadius: '12px', fontWeight: '500' }}>2.5%</span>
            </div>
          </div>
        </div>

        {/* KYC Status */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '0.8rem',
          fontWeight: '500',
          cursor: 'pointer',
          background: '#f1f5f9',
          color: '#334155'
        }}>
          <span>⚠️</span>
          <span>KYC Required</span>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, padding: '20px 0' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {menuItems.map(item => (
            <li key={item.id} style={{ margin: '4px 12px' }}>
              <NavLink
                to={item.path}
                end={item.exact}
                onClick={handleLinkClick}
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
                <span style={{ fontSize: '1.2rem', width: '24px', textAlign: 'center' }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
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
  )
}

export default ManagerSidebarNew