// src/modules/manager/pages/ManagerDashboard.jsx - UPDATED
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../shared/context/AuthContext'
import ManagerKYCStatus from '../components/ManagerKYCStatus'
import ManagerNotificationsPanel from '../components/ManagerNotificationsPanel'
import ManagerQuickActions from '../components/ManagerQuickActions'
import ManagerCommissionSummary from '../components/ManagerCommissionSummary'
import ProximityAlert from '../components/ProximityAlert';
import './ManagerDashboard.css'

const ManagerDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [assignedChats, setAssignedChats] = useState([])
  const [availableListings, setAvailableListings] = useState([])
  const [verifiedProperties, setVerifiedProperties] = useState([])
  const [earnings, setEarnings] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [kycStatus, setKycStatus] = useState(null)
  const [proximityNotifications, setProximityNotifications] = useState([])

  /* ---------------------------------------------
     CHECK KYC STATUS
  ----------------------------------------------*/
  useEffect(() => {
    if (!user || user.role !== 'manager') {
      navigate('/login')
      return
    }

    // Check KYC status from localStorage
    const kycData = JSON.parse(localStorage.getItem('kycVerifications') || '[]')
    const userKYC = kycData.find(k => k.userId === user.id)
    setKycStatus(userKYC?.status || 'not_submitted')

    initializeDashboard()
  }, [user, navigate])

  /* ---------------------------------------------
     LOAD PROXIMITY NOTIFICATIONS (1km radius)
  ----------------------------------------------*/
 useEffect(() => {
  if (!user) return;

  // 1. Initial Load of active notifications
  const fetchInitialNotifications = async () => {
    const { data } = await supabase
      .from('manager_notifications')
      .select('*')
      .eq('manager_id', user.id)
      .eq('accepted', false)
      .gt('expires_at', new Date().toISOString());
    
    setProximityNotifications(data || []);
  };

  fetchInitialNotifications();

  // 2. Realtime Subscription for NEW notifications
  const channel = supabase
    .channel('manager_alerts')
    .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'manager_notifications',
        filter: `manager_id=eq.${user.id}` 
      }, 
      (payload) => {
        setProximityNotifications(prev => [payload.new, ...prev]);
        // Optional: Play a notification sound here
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user.id]);

  /* ---------------------------------------------
     INITIALIZE DASHBOARD DATA
  ----------------------------------------------*/
  const initializeDashboard = () => {
    setLoading(true)

    const chats = JSON.parse(localStorage.getItem('chats') || '[]')
    const listings = JSON.parse(localStorage.getItem('listings') || '[]')
    const payments = JSON.parse(localStorage.getItem('payments') || '[]')
    const managerAssignments = JSON.parse(localStorage.getItem('managerAssignments') || '[]')

    /* ---------------------------------------------
       ASSIGNED CHATS (PERMANENT)
       BUSINESS RULE: Different chat types based on posting role
    ----------------------------------------------*/
    const myChats = chats.filter(chat => {
      // Manager is participant
      if (chat.participants.manager === user.id) return true
      
      // Check manager assignments
      const assignment = managerAssignments.find(a => 
        a.listingId === chat.listingId && a.managerId === user.id
      )
      return assignment
    })

    setAssignedChats(myChats)

    /* ---------------------------------------------
       AVAILABLE LISTINGS WITH PROXIMITY CHECK
    ----------------------------------------------*/
    loadProximityNotifications()

    /* ---------------------------------------------
       VERIFIED PROPERTIES (PERMANENT ASSIGNMENT)
    ----------------------------------------------*/
    const verified = listings.filter(l => 
      l.managerId === user.id && l.verified === true
    )
    setVerifiedProperties(verified)

    /* ---------------------------------------------
       EARNINGS CALCULATION (2.5% COMMISSION)
    ----------------------------------------------*/
    const myPayments = payments.filter(p => 
      p.managerId === user.id && p.status === 'confirmed'
    )

    const totalEarnings = myPayments.reduce((sum, p) => sum + p.managerCommission, 0)
    setEarnings(totalEarnings)

    setLoading(false)
  }

  /* ---------------------------------------------
     ACCEPT LISTING WITH KYC CHECK
     BUSINESS RULE: Must have KYC approved to manage
  ----------------------------------------------*/
  const acceptListing = (listingId) => {
    // Check KYC status
    if (kycStatus !== 'approved') {
      alert('⚠️ KYC Verification Required\n\nYou must complete KYC verification before managing properties.')
      navigate('/dashboard/manager/kyc')
      return
    }

    const chats = JSON.parse(localStorage.getItem('chats') || '[]')
    const listings = JSON.parse(localStorage.getItem('listings') || '[]')
    const managerAssignments = JSON.parse(localStorage.getItem('managerAssignments') || '[]')

    const listing = listings.find(l => l.id === listingId)
    if (!listing) return

    // BUSINESS RULE: Skip estate firms
    if (listing.posterRole === 'estate_firm') {
      alert('Estate firm listings do not require managers')
      return
    }

    const chatIndex = chats.findIndex(c => c.listingId === listingId)
    
    if (chatIndex === -1) {
      // Create new chat based on posting role
      const chatTemplate = {
        id: `chat_${Date.now()}_${listingId}`,
        listingId,
        listingTitle: listing.title,
        listingPrice: listing.price,
        posterRole: listing.posterRole,
        participants: {
          tenant: listing.posterRole === 'tenant' ? listing.posterId : null,
          landlord: listing.posterRole === 'landlord' ? listing.posterId : null,
          manager: user.id,
          incomingTenant: null
        },
        messages: [],
        state: 'pending_availability',
        managerAssigned: true,
        managerLocked: true,
        managerAssignedAt: new Date().toISOString(),
        chatType: listing.posterRole === 'tenant' ? 'manager_intermediary' : 'monitoring',
        adminCanOverride: true,
        createdAt: new Date().toISOString()
      }

      // Add initial system message based on chat type
      if (listing.posterRole === 'tenant') {
        chatTemplate.messages.push({
          senderId: 'system',
          senderRole: 'system',
          text: `🏠 Manager ${user.name} assigned to this property. All communications between incoming tenants and property owner will go through the manager.`,
          timestamp: new Date().toISOString(),
          isSystem: true
        })
      } else {
        chatTemplate.messages.push({
          senderId: 'system',
          senderRole: 'system',
          text: `👨‍💼 Manager ${user.name} assigned to monitor this conversation and ensure commission collection.`,
          timestamp: new Date().toISOString(),
          isSystem: true
        })
      }

      chats.push(chatTemplate)
      
      // Record assignment
      const assignment = {
        id: `assign_${Date.now()}`,
        listingId,
        managerId: user.id,
        managerName: user.name,
        assignedAt: new Date().toISOString(),
        acceptedViaProximity: true,
        isPermanent: false // Will become permanent after verification
      }
      managerAssignments.push(assignment)
      
      // Update listing
      const listingIndex = listings.findIndex(l => l.id === listingId)
      if (listingIndex !== -1) {
        listings[listingIndex].managerId = user.id
        listings[listingIndex].managerName = user.name
        listings[listingIndex].managerAssigned = true
        listings[listingIndex].managerAssignedAt = new Date().toISOString()
      }
      
      // Save all changes
      localStorage.setItem('chats', JSON.stringify(chats))
      localStorage.setItem('managerAssignments', JSON.stringify(managerAssignments))
      localStorage.setItem('listings', JSON.stringify(listings))
      
      // Remove from notifications
      setProximityNotifications(prev => 
        prev.filter(n => n.listingId !== listingId)
      )
      
      alert(`✅ You are now managing "${listing.title}"\n\n📊 Commission: ₦${(listing.price * 0.025).toLocaleString()} (2.5%)\n\n${listing.posterRole === 'tenant' ? '💬 You will act as intermediary between tenant and landlord' : '👁️ You will monitor landlord-tenant chat for commission collection'}`)
      
    } else {
      if (chats[chatIndex].managerLocked) {
        alert('This listing already has a manager')
        return
      }

      // Assign manager to existing chat
      chats[chatIndex].participants.manager = user.id
      chats[chatIndex].managerLocked = true
      chats[chatIndex].managerAssigned = true
      chats[chatIndex].managerAssignedAt = new Date().toISOString()
      
      // Record assignment
      const assignment = {
        id: `assign_${Date.now()}`,
        listingId,
        managerId: user.id,
        managerName: user.name,
        assignedAt: new Date().toISOString(),
        acceptedViaProximity: true,
        isPermanent: false
      }
      managerAssignments.push(assignment)
      
      localStorage.setItem('chats', JSON.stringify(chats))
      localStorage.setItem('managerAssignments', JSON.stringify(managerAssignments))
      
      alert(`✅ You are now managing "${listing.title}"`)
    }

    initializeDashboard()
  }

  /* ---------------------------------------------
     VERIFY PROPERTY (PERMANENT ASSIGNMENT)
     BUSINESS RULE: Must have KYC approval
  ----------------------------------------------*/
  const verifyProperty = (listingId) => {
    if (kycStatus !== 'approved') {
      alert('Complete KYC verification first')
      navigate('/dashboard/manager/kyc')
      return
    }

    const listings = JSON.parse(localStorage.getItem('listings') || '[]')
    const index = listings.findIndex(l => l.id === listingId)

    if (index === -1) return

    // Check if manager is assigned to this property
    const isAssigned = assignedChats.some(chat => 
      chat.listingId === listingId && chat.participants.manager === user.id
    )

    if (!isAssigned) {
      alert('You can only verify properties you are managing')
      return
    }

    // BUSINESS RULE: Permanent assignment upon verification
    listings[index].verified = true
    listings[index].verificationDate = new Date().toISOString()
    listings[index].verifiedBy = user.id
    listings[index].verificationMethod = 'onsite'
    listings[index].permanentManager = true
    listings[index].managerId = user.id
    listings[index].managerName = user.name

    localStorage.setItem('listings', JSON.stringify(listings))
    
    // Update chat to reflect permanent assignment
    const chats = JSON.parse(localStorage.getItem('chats') || '[]')
    const chatIndex = chats.findIndex(c => c.listingId === listingId)
    if (chatIndex !== -1) {
      chats[chatIndex].permanentAssignment = true
      
      chats[chatIndex].messages.push({
        senderId: 'system',
        senderRole: 'system',
        text: `✅ Property verified on-site by manager ${user.name}. Manager is now permanently assigned to this property.`,
        timestamp: new Date().toISOString(),
        isSystem: true
      })
      
      localStorage.setItem('chats', JSON.stringify(chats))
    }
    
    alert('✅ Property verified successfully!\n\nYou are now permanently assigned as the manager for this property.')
    initializeDashboard()
  }

  /* ---------------------------------------------
     CONFIRM PAYMENT & MARK AS RENTED
     BUSINESS RULE: Different confirmation flow for tenant vs landlord posts
  ----------------------------------------------*/
  const confirmRental = (chat) => {
    const listings = JSON.parse(localStorage.getItem('listings') || '[]')
    const listing = listings.find(l => l.id === chat.listingId)

    if (!listing) {
      alert('Listing not found')
      return
    }

    // Calculate commission
    const rentalAmount = listing.price || 0
    const totalCommission = rentalAmount * 0.075
    const managerCommission = rentalAmount * 0.025
    const referrerCommission = rentalAmount * 0.01
    const platformCommission = rentalAmount * 0.04

    // Update payment records
    const payments = JSON.parse(localStorage.getItem('payments') || '[]')
    const payment = {
      id: `pay_${Date.now()}`,
      chatId: chat.id,
      listingId: chat.listingId,
      listingTitle: chat.listingTitle,
      managerId: user.id,
      managerName: user.name,
      rentalAmount,
      totalCommission,
      managerCommission,
      referrerCommission,
      platformCommission,
      status: 'confirmed',
      confirmedAt: new Date().toISOString(),
      paidToManager: false,
      paidToReferrer: false,
      commissionSplit: {
        total: 7.5,
        manager: 2.5,
        referrer: 1.0,
        platform: 4.0
      }
    }

    payments.push(payment)
    localStorage.setItem('payments', JSON.stringify(payments))
    
    // Update chat and listing status
    const chats = JSON.parse(localStorage.getItem('chats') || '[]')
    const chatIndex = chats.findIndex(c => c.id === chat.id)
    
    if (chatIndex !== -1) {
      chats[chatIndex].state = 'rented'
      chats[chatIndex].rented = true
      chats[chatIndex].rentedAt = new Date().toISOString()
      chats[chatIndex].confirmedBy = user.id
      chats[chatIndex].commissionPaid = true
      
      // Add commission breakdown message
      chats[chatIndex].messages.push({
        senderId: 'system',
        senderRole: 'system',
        text: `🏠 PROPERTY RENTED - COMMISSION CONFIRMED\n\n` +
              `Rental Amount: ₦${rentalAmount.toLocaleString()}\n` +
              `Total Commission: ₦${totalCommission.toLocaleString()} (7.5%)\n` +
              `• Manager (You): ₦${managerCommission.toLocaleString()} (2.5%)\n` +
              `• Referrer: ₦${referrerCommission.toLocaleString()} (1%)\n` +
              `• RentEasy: ₦${platformCommission.toLocaleString()} (4%)\n\n` +
              `✅ Property removed from market listings`,
        timestamp: new Date().toISOString(),
        isSystem: true
      })
      
      localStorage.setItem('chats', JSON.stringify(chats))
    }

    // Update listing status
    const listingIndex = listings.findIndex(l => l.id === chat.listingId)
    if (listingIndex !== -1) {
      listings[listingIndex].status = 'rented'
      listings[listingIndex].rentedAt = new Date().toISOString()
      listings[listingIndex].rentedBy = chat.participants.incomingTenant
      listings[listingIndex].commissionCollected = true
      localStorage.setItem('listings', JSON.stringify(listings))
    }

    alert(`✅ Rental confirmed!\n\n` +
          `Commission breakdown recorded.\n` +
          `Your earnings: ₦${managerCommission.toLocaleString()}`)
    
    initializeDashboard()
  }

  /* ---------------------------------------------
     RENDER
  ----------------------------------------------*/
  if (loading) {
    return <div className="manager-loading">Loading dashboard...</div>
  }

  return (
    <div className="manager-dashboard">
      {/* HEADER WITH KYC STATUS */}
      <ProximityAlert managerId={user.id} managerState={user.state} />
      <header className="manager-header">
        <div className="header-left">
          <h1>👨‍💼 RentEasy Manager Dashboard</h1>
          <p className="manager-subtitle">
            {user.name} • 2.5% Commission • {kycStatus === 'approved' ? '✅ KYC Verified' : '⚠️ KYC Required'}
          </p>
        </div>
        <ManagerKYCStatus status={kycStatus} />
      </header>

      {/* KYC WARNING BANNER */}
      {kycStatus !== 'approved' && (
        <div className="kyc-warning-banner">
          <div className="warning-content">
            <span className="warning-icon">⚠️</span>
            <div>
              <strong>KYC Verification Required</strong>
              <p>You must complete KYC verification before managing properties and earning commissions.</p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/dashboard/manager/kyc')}
            >
              Complete KYC Now
            </button>
          </div>
        </div>
      )}

      {/* PROXIMITY NOTIFICATIONS */}
      {proximityNotifications.length > 0 && (
        <ManagerNotificationsPanel 
          notifications={proximityNotifications}
          onAccept={acceptListing}
          onDismiss={(id) => setProximityNotifications(prev => prev.filter(n => n.id !== id))}
        />
      )}

      {/* TABS */}
      <div className="manager-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          🔔 Notifications ({proximityNotifications.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'chats' ? 'active' : ''}`}
          onClick={() => setActiveTab('chats')}
        >
          💬 My Chats ({assignedChats.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'properties' ? 'active' : ''}`}
          onClick={() => setActiveTab('properties')}
        >
          🏠 Properties ({verifiedProperties.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'earnings' ? 'active' : ''}`}
          onClick={() => setActiveTab('earnings')}
        >
          💰 Earnings (₦{earnings.toLocaleString()})
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="manager-content">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="overview-container">
            {/* QUICK STATS */}
            <div className="overview-stats">
              <div className="stat-card">
                <div className="stat-icon">💬</div>
                <div className="stat-content">
                  <h3>{assignedChats.length}</h3>
                  <p>Active Chats</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🏠</div>
                <div className="stat-content">
                  <h3>{verifiedProperties.length}</h3>
                  <p>Verified Properties</p>
                </div>
              </div>
              
              <div className="stat-card earnings">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h3>₦{earnings.toLocaleString()}</h3>
                  <p>Total Earnings</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🔔</div>
                <div className="stat-content">
                  <h3>{proximityNotifications.length}</h3>
                  <p>New Listings</p>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <ManagerQuickActions 
              kycStatus={kycStatus}
              onViewNotifications={() => setActiveTab('notifications')}
              onViewChats={() => setActiveTab('chats')}
              onViewProperties={() => setActiveTab('properties')}
              onViewEarnings={() => setActiveTab('earnings')}
              navigate={navigate}
            />

            {/* COMMISSION SUMMARY */}
            <ManagerCommissionSummary earnings={earnings} />

            {/* RECENT ACTIVITY */}
            <div className="recent-activity">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                {assignedChats.slice(0, 3).map(chat => (
                  <div key={chat.id} className="activity-item">
                    <div className="activity-icon">
                      {chat.chatType === 'manager_intermediary' ? '💬' : '👁️'}
                    </div>
                    <div className="activity-details">
                      <strong>{chat.listingTitle}</strong>
                      <p>{chat.chatType === 'manager_intermediary' ? 'Intermediary Chat' : 'Monitoring Chat'}</p>
                      <small>{chat.state.replace('_', ' ')}</small>
                    </div>
                    <button 
                      className="btn btn-sm"
                      onClick={() => navigate(`/dashboard/manager/chat/${chat.id}/monitor`)}
                    >
                      Open
                    </button>
                  </div>
                ))}
                
                {assignedChats.length === 0 && (
                  <div className="empty-activity">
                    <p>No active chats. Accept a listing to get started!</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setActiveTab('notifications')}
                    >
                      View Available Listings
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="notifications-container">
            <div className="section-header">
              <h2>🔔 Proximity Notifications</h2>
              <p>New listings within 1km radius - First to accept gets 2.5% commission</p>
            </div>

            {proximityNotifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔕</div>
                <h3>No new notifications</h3>
                <p>New listings in your area will appear here automatically</p>
              </div>
            ) : (
              <div className="notifications-grid">
                {proximityNotifications.map(notification => (
                  <div key={notification.id} className="notification-card">
                    <div className="notification-header">
                      <span className="notification-type">📍 Proximity Alert</span>
                      <span className="notification-time">15 min remaining</span>
                    </div>
                    
                    <div className="notification-body">
                      <h4>{notification.title}</h4>
                      <div className="notification-details">
                        <div className="detail">
                          <span className="label">Location:</span>
                          <span className="value">{notification.location}</span>
                        </div>
                        <div className="detail">
                          <span className="label">Price:</span>
                          <span className="value">₦{notification.price.toLocaleString()}</span>
                        </div>
                        <div className="detail">
                          <span className="label">Posted by:</span>
                          <span className="value">
                            {notification.posterRole === 'tenant' ? '👤 Outgoing Tenant' : '🏠 Landlord'}
                          </span>
                        </div>
                        <div className="detail">
                          <span className="label">Your Commission:</span>
                          <span className="value highlight">₦{notification.commission.toLocaleString()} (2.5%)</span>
                        </div>
                        <div className="detail">
                          <span className="label">Distance:</span>
                          <span className="value">{notification.distance}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="notification-actions">
                      <button 
                        className="btn btn-accept"
                        onClick={() => acceptListing(notification.listingId)}
                        disabled={kycStatus !== 'approved'}
                      >
                        {kycStatus === 'approved' ? 'Accept Listing' : 'Complete KYC First'}
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => navigate(`/listings/${notification.listingId}`)}
                      >
                        View Details
                      </button>
                      <button 
                        className="btn btn-outline"
                        onClick={() => setProximityNotifications(prev => 
                          prev.filter(n => n.id !== notification.id)
                        )}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CHATS TAB */}
        {activeTab === 'chats' && (
          <div className="chats-container">
            <div className="section-header">
              <h2>💬 My Chats</h2>
              <p>Manage conversations and confirm rentals</p>
            </div>

            {assignedChats.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <h3>No active chats</h3>
                <p>Accept a listing from notifications to start managing chats</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveTab('notifications')}
                >
                  View Available Listings
                </button>
              </div>
            ) : (
              <div className="chats-grid">
                {assignedChats.map(chat => {
                  const listing = verifiedProperties.find(l => l.id === chat.listingId) || 
                                JSON.parse(localStorage.getItem('listings') || '[]')
                                  .find(l => l.id === chat.listingId)
                  
                  return (
                    <div key={chat.id} className="chat-card">
                      <div className="chat-header">
                        <div className="chat-type-indicator">
                          {chat.chatType === 'manager_intermediary' ? (
                            <span className="badge intermediary">💬 Intermediary</span>
                          ) : (
                            <span className="badge monitoring">👁️ Monitoring</span>
                          )}
                        </div>
                        <div className="chat-status">
                          <span className={`status-badge ${chat.state}`}>
                            {chat.state.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="chat-body">
                        <h4>{chat.listingTitle}</h4>
                        <div className="chat-details">
                          <div className="detail">
                            <span className="label">Price:</span>
                            <span className="value">₦{chat.listingPrice?.toLocaleString()}</span>
                          </div>
                          <div className="detail">
                            <span className="label">Commission:</span>
                            <span className="value highlight">
                              ₦{(chat.listingPrice * 0.025).toLocaleString()}
                            </span>
                          </div>
                          <div className="detail">
                            <span className="label">Messages:</span>
                            <span className="value">{chat.messages?.length || 0}</span>
                          </div>
                        </div>
                        
                        <div className="chat-participants">
                          <div className="participant">
                            <span className="label">Poster:</span>
                            <span className="value">{chat.posterRole}</span>
                          </div>
                          <div className="participant">
                            <span className="label">Your Role:</span>
                            <span className="value">
                              {chat.chatType === 'manager_intermediary' ? 'Intermediary' : 'Monitor'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="chat-actions">
                        <button 
                          className="btn btn-primary"
                          onClick={() => navigate(`/dashboard/manager/chat/${chat.id}/monitor`)}
                        >
                          {chat.chatType === 'manager_intermediary' ? 'Join Chat' : 'Monitor Chat'}
                        </button>
                        
                        {chat.state === 'active' && !chat.rented && (
                          <button 
                            className="btn btn-success"
                            onClick={() => confirmRental(chat)}
                          >
                            Mark as Rented
                          </button>
                        )}
                        
                        {!listing?.verified && (
                          <button 
                            className="btn btn-warning"
                            onClick={() => verifyProperty(chat.listingId)}
                          >
                            Verify Property
                          </button>
                        )}
                        
                        {chat.rented && (
                          <span className="badge success">✅ Rented</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* PROPERTIES TAB */}
        {activeTab === 'properties' && (
          <div className="properties-container">
            <div className="section-header">
              <h2>🏠 Managed Properties</h2>
              <p>Properties you're managing or have verified</p>
            </div>

            {verifiedProperties.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏠</div>
                <h3>No verified properties</h3>
                <p>Verify properties you're managing to get permanently assigned</p>
              </div>
            ) : (
              <div className="properties-grid">
                {verifiedProperties.map(property => (
                  <div key={property.id} className="property-card">
                    <div className="property-header">
                      <div className="property-badges">
                        <span className="badge verified">✅ Verified</span>
                        <span className="badge permanent">👨‍💼 Permanent</span>
                      </div>
                      <div className="property-status">
                        {property.status === 'rented' ? (
                          <span className="badge rented">🏠 Rented</span>
                        ) : (
                          <span className="badge available">🔓 Available</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="property-body">
                      <h4>{property.title}</h4>
                      <div className="property-details">
                        <div className="detail">
                          <span className="label">Location:</span>
                          <span className="value">{property.address}</span>
                        </div>
                        <div className="detail">
                          <span className="label">Rent:</span>
                          <span className="value">₦{property.price?.toLocaleString()}/year</span>
                        </div>
                        <div className="detail">
                          <span className="label">Commission:</span>
                          <span className="value highlight">
                            ₦{(property.price * 0.025).toLocaleString()}/rental
                          </span>
                        </div>
                        <div className="detail">
                          <span className="label">Verified on:</span>
                          <span className="value">
                            {new Date(property.verificationDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="property-actions">
                      <button 
                        className="btn btn-primary"
                        onClick={() => navigate(`/listings/${property.id}`)}
                      >
                        View Listing
                      </button>
                      
                      <button 
                        className="btn btn-secondary"
                        onClick={() => {
                          const chat = assignedChats.find(c => c.listingId === property.id)
                          if (chat) navigate(`/dashboard/manager/chat/${chat.id}/monitor`)
                        }}
                      >
                        View Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EARNINGS TAB */}
        {activeTab === 'earnings' && (
          <div className="earnings-container">
            <div className="section-header">
              <h2>💰 Your Earnings</h2>
              <p>2.5% commission on successful rentals</p>
            </div>

            <div className="earnings-summary">
              <div className="summary-card total">
                <h4>Total Earnings</h4>
                <h2>₦{earnings.toLocaleString()}</h2>
                <p>Lifetime commission earnings</p>
              </div>
              
              <div className="summary-card pending">
                <h4>Pending Withdrawal</h4>
                <h2>₦{(earnings * 0.8).toLocaleString()}</h2>
                <p>Available for withdrawal</p>
              </div>
              
              <div className="summary-card month">
                <h4>This Month</h4>
                <h2>₦{(earnings * 0.1).toLocaleString()}</h2>
                <p>Commission earned this month</p>
              </div>
            </div>

            <div className="commission-breakdown-card">
              <h3>Commission Breakdown</h3>
              <div className="breakdown-bars">
                <div className="breakdown-bar manager">
                  <div className="bar-label">
                    <span>Manager (You)</span>
                    <span>2.5%</span>
                  </div>
                  <div className="bar-fill" style={{ width: '33%' }}></div>
                </div>
                
                <div className="breakdown-bar referrer">
                  <div className="bar-label">
                    <span>Referrer</span>
                    <span>1%</span>
                  </div>
                  <div className="bar-fill" style={{ width: '13%' }}></div>
                </div>
                
                <div className="breakdown-bar renteasy">
                  <div className="bar-label">
                    <span>RentEasy Platform</span>
                    <span>4%</span>
                  </div>
                  <div className="bar-fill" style={{ width: '54%' }}></div>
                </div>
                
                <div className="breakdown-bar total">
                  <div className="bar-label">
                    <span>Total Commission</span>
                    <span>7.5%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="withdrawal-section">
              <h3>Withdraw Earnings</h3>
              <div className="withdrawal-card">
                <div className="withdrawal-info">
                  <div className="info-item">
                    <span className="label">Available Balance:</span>
                    <span className="value">₦{earnings.toLocaleString()}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Minimum Withdrawal:</span>
                    <span className="value">₦5,000</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Processing Time:</span>
                    <span className="value">24-48 hours</span>
                  </div>
                </div>
                
                <div className="withdrawal-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => alert('Withdrawal feature coming soon!')}
                  >
                    Request Withdrawal
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => navigate('/dashboard/manager/payments')}
                  >
                    View Payment History
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManagerDashboard