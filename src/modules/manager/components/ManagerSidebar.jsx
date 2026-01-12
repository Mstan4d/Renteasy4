// src/modules/manager/components/ManagerSidebar.jsx - UPDATED
import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../shared/context/AuthContext'
import './ManagerSidebar.css'

const ManagerSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

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
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      path: '/dashboard/manager',
      exact: true
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: '🔔',
      path: '/dashboard/manager/notifications',
      badge: () => {
        const listings = JSON.parse(localStorage.getItem('listings') || '[]')
        const chats = JSON.parse(localStorage.getItem('chats') || '[]')
        const managerAssignments = JSON.parse(localStorage.getItem('managerAssignments') || '[]')
        
        // Count available listings within 1km radius
        const availableListings = listings.filter(listing => {
          if (listing.posterRole === 'estate_firm') return false
          const hasManager = chats.some(chat => 
            chat.listingId === listing.id && chat.managerAssigned
          )
          const alreadyAccepted = managerAssignments.some(
            assignment => assignment.listingId === listing.id && assignment.managerId === user.id
          )
          return !hasManager && !alreadyAccepted
        })
        
        return availableListings.length > 0 ? availableListings.length : null
      }
    },
    {
      id: 'chats',
      label: 'My Chats',
      icon: '💬',
      path: '/dashboard/manager/chats',
      badge: () => {
        const chats = JSON.parse(localStorage.getItem('chats') || '[]')
        const managerAssignments = JSON.parse(localStorage.getItem('managerAssignments') || '[]')
        
        const managerChats = chats.filter(chat => {
          if (chat.participants.manager === user.id) return true
          const assignment = managerAssignments.find(a => 
            a.listingId === chat.listingId && a.managerId === user.id
          )
          return assignment
        })
        
        return managerChats.length > 0 ? managerChats.length : null
      }
    },
    {
      id: 'properties',
      label: 'Properties',
      icon: '🏠',
      path: '/dashboard/manager/properties',
      badge: () => {
        const listings = JSON.parse(localStorage.getItem('listings') || '[]')
        const managerListings = listings.filter(l => l.managerId === user.id)
        return managerListings.length > 0 ? managerListings.length : null
      }
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: '💰',
      path: '/dashboard/manager/payments',
      badge: () => {
        const payments = JSON.parse(localStorage.getItem('payments') || '[]')
        const pendingPayments = payments.filter(p => 
          p.managerId === user.id && !p.paidToManager
        )
        return pendingPayments.length > 0 ? pendingPayments.length : null
      }
    },
    {
      id: 'kyc',
      label: 'KYC',
      icon: '🆔',
      path: '/dashboard/manager/kyc',
      status: () => {
        const kycVerifications = JSON.parse(localStorage.getItem('kycVerifications') || '[]')
        const userKYC = kycVerifications.find(k => k.userId === user.id)
        return userKYC?.status || 'not_submitted'
      }
    },
    {
      id: 'radius',
      label: 'Area Settings',
      icon: '📍',
      path: '/dashboard/manager/radius'
    },
    {
      id: 'commission',
      label: 'Commission',
      icon: '📈',
      path: '/dashboard/manager/commission'
    },
    
    {
      id: 'analytics',
      label: 'Analytics',
      icon: '📊',
      path: '/dashboard/manager/analytics'
    },
    {
      id: 'setup',
      label: 'Setup',
      icon: '⚙️',
      path: '/dashboard/manager/setup'
    }
  ]

  const getKYCStatusIcon = (status) => {
    switch(status) {
      case 'approved':
        return '✅'
      case 'pending':
        return '⏳'
      case 'rejected':
        return '❌'
      default:
        return '⚠️'
    }
  }

  const getKYCStatusColor = (status) => {
    switch(status) {
      case 'approved':
        return '#28a745'
      case 'pending':
        return '#ffc107'
      case 'rejected':
        return '#dc3545'
      default:
        return '#856404'
    }
  }

  return (
    <aside className={`manager-sidebar ${isOpen ? 'open' : ''}`}>
      {/* HEADER */}
      <div className="sidebar-header">
        <div className="manager-info">
          <div className="manager-avatar">
            {user.name?.charAt(0).toUpperCase() || 'M'}
          </div>
          <div className="manager-details">
            <h3>{user.name || 'Manager'}</h3>
            <div className="manager-role">
              <span className="role-badge">👨‍💼 Manager</span>
              <span className="commission-rate">2.5%</span>
            </div>
          </div>
        </div>

        {/* KYC STATUS */}
        <div className="kyc-status-sidebar">
          {(() => {
            const kycVerifications = JSON.parse(localStorage.getItem('kycVerifications') || '[]')
            const userKYC = kycVerifications.find(k => k.userId === user.id)
            const status = userKYC?.status || 'not_submitted'
            
            return (
              <div 
                className="kyc-badge"
                style={{ 
                  backgroundColor: getKYCStatusColor(status) + '20',
                  color: getKYCStatusColor(status)
                }}
                onClick={() => {
                  navigate('/dashboard/manager/kyc');
                  handleLinkClick();
                }}
              >
                <span className="kyc-icon">{getKYCStatusIcon(status)}</span>
                <span className="kyc-text">
                  {status === 'approved' ? 'Verified' : 
                   status === 'pending' ? 'Pending' : 
                   status === 'rejected' ? 'Rejected' : 'KYC Required'}
                </span>
              </div>
            )
          })()}
        </div>
      </div>

      {/* NAVIGATION MENU - ALWAYS VISIBLE (just labels hide on mobile) */}
      <nav className="sidebar-nav">
        <ul className="nav-menu">
          {menuItems.map(item => {
            const badgeCount = item.badge?.() || null
            const kycStatus = item.status?.() || null
            
            return (
              <li key={item.id} className="nav-item">
                <NavLink
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) => 
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                  onClick={handleLinkClick}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  
                  {/* BADGES */}
                  {badgeCount && badgeCount > 0 && (
                    <span className="nav-badge">{badgeCount}</span>
                  )}
                  
                  {kycStatus && (
                    <span 
                      className="kyc-status-indicator"
                      style={{ color: getKYCStatusColor(kycStatus) }}
                    >
                      {getKYCStatusIcon(kycStatus)}
                    </span>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* FOOTER - Only Logout Button */}
      <div className="sidebar-footer">
        <button 
          className="logout-btn"
          onClick={handleLogout}
        >
          <span className="logout-icon">🚪</span>
          <span className="logout-label">Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default ManagerSidebar