// src/modules/manager/pages/ManagerNotifications.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../shared/context/AuthContext'
import './ManagerNotifications.css'

const ManagerNotifications = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = () => {
    // Load proximity notifications from localStorage
    const allListings = JSON.parse(localStorage.getItem('listings') || '[]')
    const allChats = JSON.parse(localStorage.getItem('chats') || '[]')
    const managerAssignments = JSON.parse(localStorage.getItem('managerAssignments') || '[]')

    const proximityListings = allListings.filter(listing => {
      if (listing.posterRole === 'estate_firm') return false
      
      const hasManager = allChats.some(chat => 
        chat.listingId === listing.id && chat.managerAssigned
      )
      
      if (hasManager) return false
      
      const alreadyAccepted = managerAssignments.some(
        assignment => assignment.listingId === listing.id && assignment.managerId === user.id
      )
      
      return !alreadyAccepted
    })

    const notifs = proximityListings.map(listing => ({
      id: `notif_${listing.id}`,
      type: 'proximity',
      listingId: listing.id,
      title: listing.title,
      location: `${listing.state}, ${listing.lga}`,
      price: listing.price,
      posterRole: listing.posterRole,
      distance: '1km radius',
      commission: listing.price * 0.025,
      expiresAt: new Date(Date.now() + 15 * 60000).toISOString(), // 15 minutes
      createdAt: new Date().toISOString()
    }))

    setNotifications(notifs)
    setLoading(false)
  }

  const acceptNotification = (notificationId) => {
    const notification = notifications.find(n => n.id === notificationId)
    if (!notification) return

    // Navigate to dashboard which will handle acceptance
    navigate('/dashboard/manager', { 
      state: { acceptListing: notification.listingId }
    })
  }

  const dismissNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const clearAll = () => {
    setNotifications([])
  }

  if (loading) {
    return <div className="loading">Loading notifications...</div>
  }

  return (
    <div className="manager-notifications">
      <div className="page-header">
        <h1>🔔 Notifications Center</h1>
        <p>New listings within your 1km radius</p>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔕</div>
          <h3>No new notifications</h3>
          <p>New listings in your area will appear here automatically</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/dashboard/manager')}
          >
            Return to Dashboard
          </button>
        </div>
      ) : (
        <>
          <div className="notifications-header">
            <div className="header-info">
              <h3>{notifications.length} Available Listings</h3>
              <p>First manager to accept gets 2.5% commission</p>
            </div>
            <button 
              className="btn btn-outline"
              onClick={clearAll}
            >
              Clear All
            </button>
          </div>

          <div className="notifications-list">
            {notifications.map(notification => {
              const timeRemaining = Math.max(0, Math.floor(
                (new Date(notification.expiresAt) - new Date()) / 60000
              ))

              return (
                <div key={notification.id} className="notification-item">
                  <div className="notification-badge">
                    <span className="badge proximity">📍 1km</span>
                    <span className="badge time">
                      {timeRemaining}min remaining
                    </span>
                  </div>

                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    
                    <div className="notification-details">
                      <div className="detail-row">
                        <span className="label">Location:</span>
                        <span className="value">{notification.location}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Price:</span>
                        <span className="value">₦{notification.price?.toLocaleString()}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Posted by:</span>
                        <span className="value">
                          {notification.posterRole === 'tenant' 
                            ? '👤 Outgoing Tenant' 
                            : '🏠 Landlord'}
                        </span>
                      </div>
                      <div className="detail-row highlight">
                        <span className="label">Your Commission:</span>
                        <span className="value">₦{notification.commission.toLocaleString()} (2.5%)</span>
                      </div>
                    </div>

                    <div className="notification-actions">
                      <button 
                        className="btn btn-accept"
                        onClick={() => acceptNotification(notification.id)}
                      >
                        Accept Listing
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => navigate(`/listings/${notification.listingId}`)}
                      >
                        View Details
                      </button>
                      <button 
                        className="btn btn-outline"
                        onClick={() => dismissNotification(notification.id)}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="notifications-footer">
            <div className="commission-reminder">
              <span className="reminder-icon">💰</span>
              <div className="reminder-content">
                <strong>Commission Reminder</strong>
                <p>Each successful rental earns you 2.5% commission. First to accept gets the listing!</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ManagerNotifications