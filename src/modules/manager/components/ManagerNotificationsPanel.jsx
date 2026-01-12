// src/modules/manager/components/ManagerNotificationsPanel.jsx
import React from 'react'
import './ManagerNotificationsPanel.css'

const ManagerNotificationsPanel = ({ notifications, onAccept, onDismiss }) => {
  if (notifications.length === 0) return null
  
  return (
    <div className="notifications-panel">
      <div className="panel-header">
        <h3>🎯 New Listings in Your Area ({notifications.length})</h3>
        <p>First come, first served - 2.5% commission each</p>
      </div>
      
      <div className="notifications-scroll">
        {notifications.slice(0, 3).map(notification => (
          <div key={notification.id} className="notification-item">
            <div className="notification-content">
              <span className="notification-badge">📍 1km</span>
              <div className="notification-details">
                <strong>{notification.title}</strong>
                <p>₦{notification.price?.toLocaleString()} • {notification.posterRole === 'tenant' ? 'Tenant Post' : 'Landlord Post'}</p>
              </div>
            </div>
            <div className="notification-actions">
              <button 
                className="btn btn-sm btn-accept"
                onClick={() => onAccept(notification.listingId)}
              >
                Accept
              </button>
              <button 
                className="btn btn-sm btn-outline"
                onClick={() => onDismiss(notification.id)}
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {notifications.length > 3 && (
        <div className="panel-footer">
          <span>+{notifications.length - 3} more listings available</span>
        </div>
      )}
    </div>
  )
}

export default ManagerNotificationsPanel