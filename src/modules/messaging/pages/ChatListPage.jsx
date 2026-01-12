// src/modules/messaging/pages/ChatListPage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../shared/context/AuthContext'
import './Messages.css'

const ChatListPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    loadChats()
  }, [user, navigate])

  const loadChats = () => {
    const allChats = JSON.parse(localStorage.getItem('chats') || '[]')
    const userChats = allChats.filter(chat => shouldUserHaveAccess(chat, user))
    setChats(userChats)
    setLoading(false)
  }

  const shouldUserHaveAccess = (chat, user) => {
    const { participants } = chat
    
    if (user.role === 'super-admin' || user.role === 'admin') return true
    if (user.role === 'manager' && participants.manager === user.id) return true
    if (user.role === 'tenant') {
      if (participants.tenant === user.id) return true
      if (participants.incomingTenant === user.id) return true
      // New incoming tenant trying to access
      if (!participants.incomingTenant && user.id !== participants.tenant) {
        return false // Don't show empty chats they haven't initiated
      }
    }
    if (user.role === 'landlord' && participants.landlord === user.id) return true
    if (user.role === 'estate-firm' && participants.estateFirm === user.id) return true
    
    return false
  }

  const getChatTitle = (chat) => {
    const listings = JSON.parse(localStorage.getItem('listings') || '[]')
    const listing = listings.find(l => l.id === chat.listingId)
    return listing ? listing.title : 'Unknown Listing'
  }

  const getLastMessage = (chat) => {
    const messages = chat.messages || []
    if (messages.length === 0) return 'No messages yet'
    const lastMsg = messages[messages.length - 1]
    return lastMsg.isSystem ? 'System message' : lastMsg.text
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getChatParticipantInfo = (chat) => {
    const { participants } = chat
    if (participants.landlord) return { role: 'Landlord', icon: '🏠' }
    if (participants.estateFirm) return { role: 'Estate Firm', icon: '🏢' }
    if (participants.tenant && participants.incomingTenant) return { role: 'Tenant Chat', icon: '👤' }
    if (participants.manager) return { role: 'Manager Chat', icon: '👨‍💼' }
    return { role: 'Chat', icon: '💬' }
  }

  if (loading) return <div className="messages-loading">Loading chats...</div>

  return (
    <div className="chat-list-page">
      <header className="messages-header">
        <h2>Your Conversations</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/listings')}
        >
          Browse Listings
        </button>
      </header>

      <div className="chat-list">
        {chats.length === 0 ? (
          <div className="empty-chats">
            <div className="empty-icon">💬</div>
            <h3>No conversations yet</h3>
            <p>Start a conversation by contacting a listing or replying to a message</p>
            <button onClick={() => navigate('/listings')} className="btn primary">
              Browse Listings to Start Chat
            </button>
          </div>
        ) : (
          chats.map(chat => {
            const participantInfo = getChatParticipantInfo(chat)
            return (
              <div 
                key={chat.id} 
                className="chat-item"
                onClick={() => navigate(`/dashboard/messages/chat/${chat.id}`)}
              >
                <div className="chat-item-header">
                  <div className="chat-icon">{participantInfo.icon}</div>
                  <div className="chat-info">
                    <h4>{getChatTitle(chat)}</h4>
                    <p className="chat-preview">{getLastMessage(chat)}</p>
                  </div>
                  <span className="chat-time">{formatDate(chat.createdAt)}</span>
                </div>
                <div className="chat-meta">
                  <span className={`status-badge status-${chat.state}`}>
                    {chat.state.replace('_', ' ')}
                  </span>
                  <small>{participantInfo.role}</small>
                  {chat.estateFirmListing && <small>🏢 No Commission</small>}
                  {chat.commissionApplied && <small>💰 7.5% Commission</small>}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default ChatListPage