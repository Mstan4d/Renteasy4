// src/modules/manager/components/ManagerQuickActions.jsx
import React from 'react'

const ManagerQuickActions = ({ 
  kycStatus, 
  onViewNotifications, 
  onViewChats, 
  onViewProperties, 
  onViewEarnings,
  navigate 
}) => {
  const quickActions = [
    {
      icon: '🔍',
      label: 'Find Listings',
      description: 'View available properties',
      onClick: onViewNotifications,
      color: '#007bff'
    },
    {
      icon: '💬',
      label: 'View Chats',
      description: 'Manage conversations',
      onClick: onViewChats,
      color: '#17a2b8'
    },
    {
      icon: '✅',
      label: 'Verify Properties',
      description: 'On-site verification',
      onClick: onViewProperties,
      color: '#28a745',
      disabled: kycStatus !== 'approved'
    },
    {
      icon: '💰',
      label: 'View Earnings',
      description: 'Check commissions',
      onClick: onViewEarnings,
      color: '#ffc107'
    }
  ]

  return (
    <div style={{ margin: '30px 0' }}>
      <h3 style={{ marginBottom: '20px' }}>Quick Actions</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px'
      }}>
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            disabled={action.disabled}
            style={{
              background: 'white',
              border: `2px solid ${action.color}`,
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              cursor: action.disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: action.disabled ? 0.6 : 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}
            onMouseEnter={(e) => {
              if (!action.disabled) {
                e.currentTarget.style.transform = 'translateY(-5px)'
                e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)'
              }
            }}
            onMouseLeave={(e) => {
              if (!action.disabled) {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }
            }}
          >
            <span style={{ fontSize: '32px' }}>{action.icon}</span>
            <div>
              <div style={{ 
                fontWeight: 'bold', 
                color: action.color,
                marginBottom: '5px'
              }}>
                {action.label}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {action.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ManagerQuickActions