// src/modules/manager/components/ManagerChatMonitoring.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../shared/context/AuthContext'
import './ManagerChatMonitoring.css'

const ManagerChatMonitoring = () => {
  const { chatId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [chat, setChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCommissionModal, setShowCommissionModal] = useState(false)
  
  useEffect(() => {
    loadChat()
  }, [chatId])
  
  const loadChat = () => {
    const chats = JSON.parse(localStorage.getItem('chats') || '[]')
    const foundChat = chats.find(c => c.id === chatId)
    
    if (!foundChat) {
      alert('Chat not found')
      navigate('/dashboard/manager')
      return
    }
    
    // Check if manager has access
    if (foundChat.participants.manager !== user.id) {
      alert('You are not assigned to this chat')
      navigate('/dashboard/manager')
      return
    }
    
    setChat(foundChat)
    setMessages(foundChat.messages || [])
    setLoading(false)
  }
  
  const sendMessage = () => {
    if (!newMessage.trim()) return
    
    const chats = JSON.parse(localStorage.getItem('chats') || '[]')
    const chatIndex = chats.findIndex(c => c.id === chatId)
    
    if (chatIndex === -1) return
    
    const message = {
      id: `msg_${Date.now()}`,
      senderId: user.id,
      senderRole: 'manager',
      text: newMessage,
      timestamp: new Date().toISOString(),
      isSystem: false
    }
    
    // Add message to chat
    chats[chatIndex].messages.push(message)
    localStorage.setItem('chats', JSON.stringify(chats))
    
    // Update state
    setMessages(prev => [...prev, message])
    setNewMessage('')
    
    // Auto-reply for system messages
    if (chat.chatType === 'manager_intermediary') {
      setTimeout(() => {
        const systemReply = {
          id: `sys_${Date.now()}`,
          senderId: 'system',
          senderRole: 'system',
          text: 'This is an automated reply from the property owner. Please contact the manager for viewing arrangements.',
          timestamp: new Date().toISOString(),
          isSystem: true
        }
        
        chats[chatIndex].messages.push(systemReply)
        localStorage.setItem('chats', JSON.stringify(chats))
        setMessages(prev => [...prev, systemReply])
      }, 2000)
    }
  }
  
  const sendAvailabilityCheck = () => {
    const chats = JSON.parse(localStorage.getItem('chats') || '[]')
    const chatIndex = chats.findIndex(c => c.id === chatId)
    
    const availabilityMessage = {
      id: `avail_${Date.now()}`,
      senderId: user.id,
      senderRole: 'manager',
      text: 'Is this property still available for rent?',
      timestamp: new Date().toISOString(),
      isSystem: false,
      isAvailabilityCheck: true
    }
    
    chats[chatIndex].messages.push(availabilityMessage)
    localStorage.setItem('chats', JSON.stringify(chats))
    setMessages(prev => [...prev, availabilityMessage])
    
    // Update chat state
    chats[chatIndex].state = 'availability_check_sent'
    localStorage.setItem('chats', JSON.stringify(chats))
    setChat(chats[chatIndex])
  }
  
  const markAsRented = () => {
    if (!window.confirm('Mark this property as rented and confirm commission payment?')) return
    
    const listings = JSON.parse(localStorage.getItem('listings') || '[]')
    const listing = listings.find(l => l.id === chat.listingId)
    
    if (!listing) return
    
    // Calculate commission
    const rentalAmount = listing.price || 0
    const managerCommission = rentalAmount * 0.025
    
    // Update payments
    const payments = JSON.parse(localStorage.getItem('payments') || '[]')
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
    
    // Update chat
    const chats = JSON.parse(localStorage.getItem('chats') || '[]')
    const chatIndex = chats.findIndex(c => c.id === chatId)
    chats[chatIndex].state = 'rented'
    chats[chatIndex].rented = true
    chats[chatIndex].rentedAt = new Date().toISOString()
    
    // Add system message
    chats[chatIndex].messages.push({
      id: `sys_rented_${Date.now()}`,
      senderId: 'system',
      senderRole: 'system',
      text: `✅ Property marked as rented by manager ${user.name}. Commission of ₦${managerCommission.toLocaleString()} (2.5%) confirmed.`,
      timestamp: new Date().toISOString(),
      isSystem: true
    })
    
    localStorage.setItem('chats', JSON.stringify(chats))
    
    // Update listing
    const listingIndex = listings.findIndex(l => l.id === chat.listingId)
    listings[listingIndex].status = 'rented'
    localStorage.setItem('listings', JSON.stringify(listings))
    
    alert(`✅ Property marked as rented!\n\nYour commission: ₦${managerCommission.toLocaleString()}`)
    navigate('/dashboard/manager')
  }
  
  const verifyProperty = () => {
    if (!window.confirm('Verify this property after onsite inspection?')) return
    
    const listings = JSON.parse(localStorage.getItem('listings') || '[]')
    const listingIndex = listings.findIndex(l => l.id === chat.listingId)
    
    if (listingIndex === -1) return
    
    listings[listingIndex].verified = true
    listings[listingIndex].verifiedBy = user.id
    listings[listingIndex].verificationDate = new Date().toISOString()
    listings[listingIndex].permanentManager = true
    
    localStorage.setItem('listings', JSON.stringify(listings))
    
    // Update chat
    const chats = JSON.parse(localStorage.getItem('chats') || '[]')
    const chatIndex = chats.findIndex(c => c.id === chatId)
    chats[chatIndex].permanentAssignment = true
    
    chats[chatIndex].messages.push({
      id: `sys_verify_${Date.now()}`,
      senderId: 'system',
      senderRole: 'system',
      text: `✅ Property verified onsite by manager ${user.name}. Manager is now permanently assigned.`,
      timestamp: new Date().toISOString(),
      isSystem: true
    })
    
    localStorage.setItem('chats', JSON.stringify(chats))
    
    alert('✅ Property verified! You are now permanently assigned.')
    loadChat()
  }
  
  if (loading) {
    return <div className="chat-loading">Loading chat...</div>
  }
  
  return (
    <div className="chat-monitoring-container">
      {/* CHAT HEADER */}
      <div className="chat-header">
        <button 
          className="btn-back"
          onClick={() => navigate('/dashboard/manager')}
        >
          ← Back
        </button>
        
        <div className="chat-title">
          <h3>{chat.listingTitle}</h3>
          <div className="chat-subtitle">
            <span className={`chat-type ${chat.chatType}`}>
              {chat.chatType === 'manager_intermediary' ? '💬 Intermediary Chat' : '👁️ Monitoring Chat'}
            </span>
            <span className="chat-price">₦{chat.listingPrice?.toLocaleString()}</span>
            <span className={`chat-status ${chat.state}`}>{chat.state}</span>
          </div>
        </div>
        
        <div className="chat-actions">
          {chat.state !== 'rented' && (
            <button 
              className="btn btn-success"
              onClick={markAsRented}
            >
              Mark as Rented
            </button>
          )}
          
          {!chat.permanentAssignment && (
            <button 
              className="btn btn-warning"
              onClick={verifyProperty}
            >
              Verify Property
            </button>
          )}
        </div>
      </div>
      
      {/* COMMISSION INFO */}
      <div className="commission-info-banner">
        <div className="commission-details">
          <span className="commission-label">Your Commission:</span>
          <span className="commission-amount">
            ₦{(chat.listingPrice * 0.025).toLocaleString()} (2.5%)
          </span>
        </div>
        <div className="commission-notes">
          {chat.chatType === 'manager_intermediary' 
            ? 'You act as intermediary between tenant and property owner'
            : 'You monitor this chat for commission collection'}
        </div>
      </div>
      
      {/* MESSAGES AREA */}
      <div className="messages-container">
        {messages.map(message => (
          <div 
            key={message.id}
            className={`message ${message.senderRole === 'manager' ? 'sent' : 'received'} ${message.isSystem ? 'system' : ''}`}
          >
            <div className="message-header">
              <span className="message-sender">
                {message.senderRole === 'manager' ? 'You' : 
                 message.senderRole === 'system' ? 'System' : 
                 message.senderRole}
              </span>
              <span className="message-time">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="message-content">{message.text}</div>
            {message.isAvailabilityCheck && (
              <div className="availability-check">
                ⚠️ Availability check sent
              </div>
            )}
          </div>
        ))}
        
        {messages.length === 0 && (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
            {chat.chatType === 'manager_intermediary' && (
              <button 
                className="btn btn-primary"
                onClick={sendAvailabilityCheck}
              >
                Send Availability Check
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* MESSAGE INPUT (only for intermediary chats) */}
      {chat.chatType === 'manager_intermediary' && chat.state !== 'rented' && (
        <div className="message-input-container">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
            rows="3"
          />
          <div className="input-actions">
            <button 
              className="btn btn-send"
              onClick={sendMessage}
              disabled={!newMessage.trim()}
            >
              Send Message
            </button>
            <button 
              className="btn btn-secondary"
              onClick={sendAvailabilityCheck}
            >
              Ask Availability
            </button>
          </div>
        </div>
      )}
      
      {/* MONITORING INFO (for monitoring chats) */}
      {chat.chatType === 'monitoring' && (
        <div className="monitoring-info">
          <div className="monitoring-alert">
            <span className="alert-icon">👁️</span>
            <div className="alert-content">
              <strong>Monitoring Mode</strong>
              <p>You are monitoring this chat between landlord and tenant. Your role is to ensure commission collection when the property is rented.</p>
            </div>
          </div>
          
          <div className="monitoring-actions">
            <button 
              className="btn btn-primary"
              onClick={() => setShowCommissionModal(true)}
            >
              View Commission Details
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate(`/listings/${chat.listingId}`)}
            >
              View Property Details
            </button>
          </div>
        </div>
      )}
      
      {/* COMMISSION MODAL */}
      {showCommissionModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Commission Breakdown</h3>
              <button 
                className="btn-close"
                onClick={() => setShowCommissionModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="commission-breakdown">
                <div className="breakdown-item total">
                  <span>Total Rental:</span>
                  <span>₦{chat.listingPrice?.toLocaleString()}</span>
                </div>
                <div className="breakdown-item">
                  <span>Total Commission (7.5%):</span>
                  <span>₦{(chat.listingPrice * 0.075).toLocaleString()}</span>
                </div>
                <div className="breakdown-item manager">
                  <span>Your Share (2.5%):</span>
                  <span>₦{(chat.listingPrice * 0.025).toLocaleString()}</span>
                </div>
                <div className="breakdown-item">
                  <span>Referrer (1%):</span>
                  <span>₦{(chat.listingPrice * 0.01).toLocaleString()}</span>
                </div>
                <div className="breakdown-item platform">
                  <span>RentEasy (4%):</span>
                  <span>₦{(chat.listingPrice * 0.04).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="commission-notes">
                <p><strong>Note:</strong> Commission is collected when you confirm the property has been rented.</p>
                <p>Click "Mark as Rented" when the rental is confirmed.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-primary"
                onClick={markAsRented}
              >
                Confirm Rental & Commission
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => setShowCommissionModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManagerChatMonitoring