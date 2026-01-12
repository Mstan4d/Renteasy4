// src/modules/manager/pages/ManagerChats.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../shared/context/AuthContext'
import './ManagerChats.css'

const ManagerChats = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [chats, setChats] = useState([])
  const [filter, setFilter] = useState('all') // all, active, rented, pending
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    rented: 0,
    pending: 0
  })

  useEffect(() => {
    loadChats()
  }, [])

  const loadChats = () => {
    const allChats = JSON.parse(localStorage.getItem('chats') || '[]')
    const managerAssignments = JSON.parse(localStorage.getItem('managerAssignments') || '[]')
    
    // Filter chats where manager is assigned
    const managerChats = allChats.filter(chat => {
      // Direct assignment
      if (chat.participants.manager === user.id) return true
      
      // Check assignments
      const assignment = managerAssignments.find(a => 
        a.listingId === chat.listingId && a.managerId === user.id
      )
      return assignment
    })

    // Calculate stats
    const statsData = {
      total: managerChats.length,
      active: managerChats.filter(c => c.state === 'active').length,
      rented: managerChats.filter(c => c.rented).length,
      pending: managerChats.filter(c => c.state === 'pending_availability').length
    }

    setStats(statsData)
    setChats(managerChats)
    setLoading(false)
  }

  const getFilteredChats = () => {
    switch(filter) {
      case 'active':
        return chats.filter(c => c.state === 'active' && !c.rented)
      case 'rented':
        return chats.filter(c => c.rented)
      case 'pending':
        return chats.filter(c => c.state === 'pending_availability')
      default:
        return chats
    }
  }

  const getChatTypeLabel = (chat) => {
    return chat.chatType === 'manager_intermediary' 
      ? { label: 'Intermediary', color: '#0c5460', bgColor: '#d1ecf1', icon: '💬' }
      : { label: 'Monitoring', color: '#721c24', bgColor: '#f8d7da', icon: '👁️' }
  }

  const getStatusLabel = (chat) => {
    if (chat.rented) {
      return { label: 'Rented', color: '#155724', bgColor: '#d4edda', icon: '✅' }
    }
    
    switch(chat.state) {
      case 'active':
        return { label: 'Active', color: '#004085', bgColor: '#cce5ff', icon: '💬' }
      case 'pending_availability':
        return { label: 'Pending', color: '#856404', bgColor: '#fff3cd', icon: '⏳' }
      default:
        return { label: chat.state, color: '#6c757d', bgColor: '#f8f9fa', icon: '📝' }
    }
  }

  const openChat = (chatId) => {
    navigate(`/dashboard/manager/chat/${chatId}/monitor`)
  }

  const confirmRental = (chatId) => {
    const chat = chats.find(c => c.id === chatId)
    if (!chat) return

    if (window.confirm('Mark this property as rented and confirm commission payment?')) {
      // Update chat status
      const allChats = JSON.parse(localStorage.getItem('chats') || '[]')
      const chatIndex = allChats.findIndex(c => c.id === chatId)
      
      if (chatIndex !== -1) {
        allChats[chatIndex].rented = true
        allChats[chatIndex].state = 'rented'
        allChats[chatIndex].rentedAt = new Date().toISOString()
        
        // Add system message
        allChats[chatIndex].messages.push({
          senderId: 'system',
          senderRole: 'system',
          text: `✅ Property marked as rented by manager ${user.name}. Commission confirmed.`,
          timestamp: new Date().toISOString(),
          isSystem: true
        })
        
        localStorage.setItem('chats', JSON.stringify(allChats))
        
        // Update listing
        const listings = JSON.parse(localStorage.getItem('listings') || '[]')
        const listingIndex = listings.findIndex(l => l.id === chat.listingId)
        if (listingIndex !== -1) {
          listings[listingIndex].status = 'rented'
          localStorage.setItem('listings', JSON.stringify(listings))
        }
        
        // Record payment
        const payments = JSON.parse(localStorage.getItem('payments') || '[]')
        const rentalAmount = chat.listingPrice || 0
        const managerCommission = rentalAmount * 0.025
        
        payments.push({
          id: `pay_${Date.now()}`,
          chatId: chat.id,
          listingId: chat.listingId,
          managerId: user.id,
          managerCommission,
          status: 'confirmed',
          date: new Date().toISOString()
        })
        
        localStorage.setItem('payments', JSON.stringify(payments))
        
        alert(`✅ Rental confirmed!\nYour commission: ₦${managerCommission.toLocaleString()}`)
        loadChats()
      }
    }
  }

  const verifyProperty = (chatId) => {
    const chat = chats.find(c => c.id === chatId)
    if (!chat) return

    if (window.confirm('Verify this property after onsite inspection?')) {
      const listings = JSON.parse(localStorage.getItem('listings') || '[]')
      const listingIndex = listings.findIndex(l => l.id === chat.listingId)
      
      if (listingIndex !== -1) {
        listings[listingIndex].verified = true
        listings[listingIndex].verifiedBy = user.id
        listings[listingIndex].verificationDate = new Date().toISOString()
        listings[listingIndex].permanentManager = true
        
        localStorage.setItem('listings', JSON.stringify(listings))
        
        // Update chat
        const allChats = JSON.parse(localStorage.getItem('chats') || '[]')
        const chatIndex = allChats.findIndex(c => c.id === chatId)
        allChats[chatIndex].permanentAssignment = true
        
        localStorage.setItem('chats', JSON.stringify(allChats))
        
        alert('✅ Property verified! You are now permanently assigned.')
        loadChats()
      }
    }
  }

  if (loading) {
    return <div className="loading">Loading chats...</div>
  }

  return (
    <div className="manager-chats">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>💬 My Chats</h1>
          <p>Manage conversations and track commission opportunities</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/dashboard/manager')}
        >
          Back to Dashboard
        </button>
      </div>

      {/* STATS */}
      <div className="chats-stats">
        <div className="stat-card" onClick={() => setFilter('all')}>
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Chats</div>
        </div>
        <div className="stat-card" onClick={() => setFilter('active')}>
          <div className="stat-number">{stats.active}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card" onClick={() => setFilter('rented')}>
          <div className="stat-number">{stats.rented}</div>
          <div className="stat-label">Rented</div>
        </div>
        <div className="stat-card" onClick={() => setFilter('pending')}>
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="chats-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Chats
        </button>
        <button 
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button 
          className={`filter-btn ${filter === 'rented' ? 'active' : ''}`}
          onClick={() => setFilter('rented')}
        >
          Rented
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
      </div>

      {/* CHATS LIST */}
      <div className="chats-list">
        {getFilteredChats().length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {filter === 'all' ? '💬' : 
               filter === 'active' ? '🔍' : 
               filter === 'rented' ? '✅' : '⏳'}
            </div>
            <h3>No {filter} chats found</h3>
            <p>
              {filter === 'all' ? 'Accept a listing to start managing chats' :
               filter === 'active' ? 'No active chats at the moment' :
               filter === 'rented' ? 'No rented properties yet' :
               'No pending availability checks'}
            </p>
            {filter !== 'all' && (
              <button 
                className="btn btn-outline"
                onClick={() => setFilter('all')}
              >
                View All Chats
              </button>
            )}
          </div>
        ) : (
          getFilteredChats().map(chat => {
            const chatType = getChatTypeLabel(chat)
            const status = getStatusLabel(chat)
            const messagesCount = chat.messages?.length || 0
            const lastMessage = chat.messages?.[messagesCount - 1]
            const isPermanent = chat.permanentAssignment
            
            return (
              <div key={chat.id} className="chat-card">
                <div className="chat-header">
                  <div className="chat-title">
                    <h4>{chat.listingTitle}</h4>
                    <div className="chat-subtitle">
                      <span className="chat-price">₦{chat.listingPrice?.toLocaleString()}</span>
                      <span 
                        className="chat-type"
                        style={{ backgroundColor: chatType.bgColor, color: chatType.color }}
                      >
                        {chatType.icon} {chatType.label}
                      </span>
                      <span 
                        className="chat-status"
                        style={{ backgroundColor: status.bgColor, color: status.color }}
                      >
                        {status.icon} {status.label}
                      </span>
                      {isPermanent && (
                        <span className="badge permanent">👨‍💼 Permanent</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="chat-meta">
                    <div className="meta-item">
                      <span className="meta-label">Messages:</span>
                      <span className="meta-value">{messagesCount}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Commission:</span>
                      <span className="meta-value highlight">
                        ₦{(chat.listingPrice * 0.025).toLocaleString()}
                      </span>
                    </div>
                    {lastMessage && (
                      <div className="meta-item">
                        <span className="meta-label">Last activity:</span>
                        <span className="meta-value">
                          {new Date(lastMessage.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="chat-body">
                  {lastMessage && (
                    <div className="last-message">
                      <span className="message-preview">
                        {lastMessage.text.length > 100 
                          ? lastMessage.text.substring(0, 100) + '...' 
                          : lastMessage.text}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="chat-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => openChat(chat.id)}
                  >
                    {chatType.label === 'Intermediary' ? 'Join Chat' : 'Monitor Chat'}
                  </button>
                  
                  {!chat.rented && chat.state === 'active' && (
                    <button 
                      className="btn btn-success"
                      onClick={() => confirmRental(chat.id)}
                    >
                      Mark as Rented
                    </button>
                  )}
                  
                  {!isPermanent && !chat.rented && (
                    <button 
                      className="btn btn-warning"
                      onClick={() => verifyProperty(chat.id)}
                    >
                      Verify Property
                    </button>
                  )}
                  
                  <button 
                    className="btn btn-secondary"
                    onClick={() => navigate(`/listings/${chat.listingId}`)}
                  >
                    View Property
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* COMMISSION INFO */}
      <div className="commission-info">
        <div className="info-header">
          <h3>💰 Commission Information</h3>
        </div>
        <div className="info-content">
          <div className="info-item">
            <span className="info-label">Your Commission Rate:</span>
            <span className="info-value">2.5% per rental</span>
          </div>
          <div className="info-item">
            <span className="info-label">Total Potential:</span>
            <span className="info-value">
              ₦{chats.reduce((sum, chat) => sum + (chat.listingPrice * 0.025), 0).toLocaleString()}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Confirmed Earnings:</span>
            <span className="info-value">
              ₦{chats
                .filter(c => c.rented)
                .reduce((sum, chat) => sum + (chat.listingPrice * 0.025), 0)
                .toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManagerChats