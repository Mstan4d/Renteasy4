// src/modules/messaging/pages/Messages.jsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../shared/context/AuthContext'
import './Messages.css'

const Messages = () => {
  const { listingId, chatId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [listing, setListing] = useState(null)
  const [chat, setChat] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)
  const [commissionCalculated, setCommissionCalculated] = useState(false)

  /* ---------------------------------------------
     INITIAL LOAD WITH BUSINESS LOGIC
  ----------------------------------------------*/
  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    // If we have chatId, load existing chat
    if (chatId) {
      loadExistingChat(chatId)
      return
    }

    // If we have listingId, create or load chat for this listing
    if (listingId) {
      const listings = JSON.parse(localStorage.getItem('listings') || '[]')
      const foundListing = listings.find(l => l.id === listingId)

      if (!foundListing) {
        alert('Listing not found')
        navigate('/listings')
        return
      }

      setListing(foundListing)
      loadOrCreateChat(foundListing)
      checkCommissionRules(foundListing)
    } else {
      // No parameters, redirect to chat list
      navigate('/dashboard/messages')
    }
  }, [listingId, chatId, user, navigate])

  /* ---------------------------------------------
     LOAD EXISTING CHAT
  ----------------------------------------------*/
  const loadExistingChat = (chatId) => {
    const chats = JSON.parse(localStorage.getItem('chats') || '[]')
    const foundChat = chats.find(c => c.id === chatId)

    if (!foundChat) {
      alert('Chat not found')
      navigate('/listings')
      return
    }

    const listings = JSON.parse(localStorage.getItem('listings') || '[]')
    const foundListing = listings.find(l => l.id === foundChat.listingId)
    
    if (!shouldUserHaveAccess(foundChat, user)) {
      alert('You do not have permission to access this chat')
      navigate('/listings')
      return
    }

    setListing(foundListing)
    setChat(foundChat)
    setLoading(false)
  }

  /* ---------------------------------------------
     CHECK COMMISSION RULES (CRITICAL BUSINESS LOGIC)
  ----------------------------------------------*/
  const checkCommissionRules = (listing) => {
    // RULE: Estate firm listings have 0% commission
    if (listing.posterRole === 'estate_firm') {
      console.log('ESTATE FIRM LISTING: 0% commission applied')
      return
    }

    // RULE: Tenant and landlord listings must have 7.5% commission
    const rentalPrice = listing.price || 0
    const totalCommission = rentalPrice * 0.075
    const managerShare = rentalPrice * 0.025
    const referrerShare = rentalPrice * 0.01
    const platformShare = rentalPrice * 0.04

    console.log(`COMMISSION BREAKDOWN for ₦${rentalPrice.toLocaleString()}:`)
    console.log(`- Total: ₦${totalCommission.toLocaleString()} (7.5%)`)
    console.log(`- Manager: ₦${managerShare.toLocaleString()} (2.5%)`)
    console.log(`- Referrer: ₦${referrerShare.toLocaleString()} (1%)`)
    console.log(`- RentEasy: ₦${platformShare.toLocaleString()} (4%)`)

    setCommissionCalculated(true)
  }

  /* ---------------------------------------------
     LOAD OR CREATE CHAT WITH PROPER BUSINESS RULES
  ----------------------------------------------*/
  const loadOrCreateChat = (listing) => {
    const chats = JSON.parse(localStorage.getItem('chats') || '[]')
    let existingChat = chats.find(c => c.listingId === listing.id)

    if (!existingChat) {
      // CRITICAL BUSINESS LOGIC: Determine chat participants based on listing origin
      let participants = {
        tenant: null,
        landlord: null,
        estateFirm: null,
        manager: null,
        incomingTenant: null
      }

      let initialState = 'pending_availability'
      let managerRequired = false

      // RULE 1: Outgoing Tenant Listing → Manager Required
      if (listing.posterRole === 'tenant') {
        participants.tenant = listing.posterId // Outgoing tenant
        managerRequired = true
        
        // Check if manager already assigned via proximity notification
        const assignedManager = getAssignedManager(listing.id)
        participants.manager = assignedManager
        
        initialState = assignedManager ? 'active' : 'waiting_for_manager'
      }
      
      // RULE 2: Landlord Listing → Direct Chat
      else if (listing.posterRole === 'landlord') {
        participants.landlord = listing.posterId
        // Manager assigned only when chat starts (for commission monitoring)
        participants.manager = null
        initialState = 'pending_availability'
      }
      
      // RULE 3: Estate Firm Listing → No Manager, No Commission
      else if (listing.posterRole === 'estate_firm') {
        participants.estateFirm = listing.posterId
        participants.manager = null // No manager for estate firms
        initialState = 'pending_availability'
      }

      // Set current user as participant if they're initiating contact
      if (user.role === 'tenant' && user.id !== listing.posterId) {
        participants.incomingTenant = user.id
      }

      existingChat = {
        id: `chat_${Date.now()}_${listing.id}`,
        listingId: listing.id,
        listingTitle: listing.title,
        listingPrice: listing.price,
        posterRole: listing.posterRole,
        participants,
        messages: [],
        state: initialState,
        managerRequired,
        managerAssigned: !!participants.manager,
        estateFirmListing: listing.posterRole === 'estate_firm',
        commissionApplied: listing.posterRole !== 'estate_firm',
        commissionDetails: listing.posterRole !== 'estate_firm' ? {
          totalPercentage: 7.5,
          managerPercentage: 2.5,
          referrerPercentage: 1.0,
          platformPercentage: 4.0,
          calculated: false,
          amount: 0
        } : null,
        availabilityConfirmed: false,
        managerLocked: false,
        adminLocked: false,
        dispute: null,
        rented: false,
        createdAt: new Date().toISOString(),
        // Track commission collection
        commissionCollected: false,
        managerPaid: false,
        referrerPaid: false
      }

      chats.push(existingChat)
      localStorage.setItem('chats', JSON.stringify(chats))
    }

    // RULE: Check if user should have access to this chat
    if (!shouldUserHaveAccess(existingChat, user)) {
      alert('You do not have permission to access this chat')
      navigate('/listings')
      return
    }

    setChat(existingChat)
    setLoading(false)
  }

  /* ---------------------------------------------
     GET ASSIGNED MANAGER (Proximity Notification Logic)
  ----------------------------------------------*/
  const getAssignedManager = (listingId) => {
    const managerAssignments = JSON.parse(localStorage.getItem('managerAssignments') || '[]')
    const assignment = managerAssignments.find(a => a.listingId === listingId)
    
    if (assignment) {
      console.log(`Manager ${assignment.managerName} already assigned via proximity notification`)
      return assignment.managerId
    }
    
    // Simulate proximity notification for demo
    if (Math.random() > 0.5) {
      const mockManagerId = 'manager_demo_001'
      const mockAssignment = {
        listingId,
        managerId: mockManagerId,
        managerName: 'Demo Manager',
        assignedAt: new Date().toISOString(),
        acceptedViaProximity: true
      }
      
      managerAssignments.push(mockAssignment)
      localStorage.setItem('managerAssignments', JSON.stringify(managerAssignments))
      return mockManagerId
    }
    
    return null
  }

  /* ---------------------------------------------
     ACCESS CONTROL BUSINESS RULES
  ----------------------------------------------*/
  const shouldUserHaveAccess = (chat, user) => {
    const { participants, posterRole, managerRequired } = chat
    
    // RULE: Super Admin and Admin can access all chats
    if (user.role === 'super-admin' || user.role === 'admin') {
      return true
    }

    // RULE: Managers can only access chats they're assigned to
    if (user.role === 'manager') {
      return participants.manager === user.id
    }

    // RULE: Incoming tenants can access
    if (user.role === 'tenant') {
      // If they're the outgoing tenant who posted
      if (participants.tenant === user.id) return true
      
      // If they're an incoming tenant interested in the property
      if (participants.incomingTenant === user.id) return true
      
      // New incoming tenant trying to access
      if (!participants.incomingTenant && user.id !== participants.tenant) {
        return true // Allow them to initiate contact
      }
    }

    // RULE: Landlords can access their own chats
    if (user.role === 'landlord' && participants.landlord === user.id) {
      return true
    }

    // RULE: Estate firms can access their own chats
    if (user.role === 'estate-firm' && participants.estateFirm === user.id) {
      return true
    }

    return false
  }

  /* ---------------------------------------------
     SAVE CHAT FUNCTION
  ----------------------------------------------*/
  const saveChat = (updatedChat) => {
    const chats = JSON.parse(localStorage.getItem('chats') || '[]')
    const index = chats.findIndex(c => c.id === updatedChat.id)
    
    if (index !== -1) {
      chats[index] = updatedChat
    } else {
      chats.push(updatedChat)
    }
    
    localStorage.setItem('chats', JSON.stringify(chats))
    setChat(updatedChat)
  }

  /* ---------------------------------------------
     ACCEPT AS MANAGER FUNCTION
  ----------------------------------------------*/
  const acceptAsManager = () => {
    if (user.role !== 'manager') return
    
    const updatedChat = {
      ...chat,
      participants: {
        ...chat.participants,
        manager: user.id
      },
      managerAssigned: true,
      state: 'active'
    }

    const systemMessage = {
      senderId: 'system',
      senderRole: 'system',
      text: `👨‍💼 Manager ${user.name} has accepted this listing via proximity notification.`,
      timestamp: new Date().toISOString(),
      isSystem: true
    }

    updatedChat.messages.push(systemMessage)
    saveChat(updatedChat)
  }

  /* ---------------------------------------------
     AVAILABILITY RESPONSE WITH BUSINESS RULES
  ----------------------------------------------*/
  const respondAvailability = (isAvailable) => {
    if (chat.state !== 'pending_availability') return

    let updatedChat = { ...chat }
    
    if (isAvailable) {
      // RULE: If outgoing tenant listing, assign manager if not already assigned
      if (listing.posterRole === 'tenant' && !chat.participants.manager) {
        const assignedManager = getAssignedManager(listing.id)
        if (!assignedManager) {
          alert('Waiting for manager assignment. A manager must accept this listing first.')
          return
        }
        
        updatedChat.participants.manager = assignedManager
        updatedChat.managerAssigned = true
      }
      
      updatedChat.state = 'active'
      updatedChat.availabilityConfirmed = true
      
      // Add system message
      const systemMessage = {
        senderId: 'system',
        senderRole: 'system',
        text: `${user.role === 'landlord' ? 'Landlord' : 'Estate Firm'} confirmed property is available. Chat is now active.`,
        timestamp: new Date().toISOString(),
        isSystem: true
      }
      
      updatedChat.messages.push(systemMessage)
      
    } else {
      updatedChat.state = 'locked'
      updatedChat.availabilityConfirmed = false
      
      // Add system message
      const systemMessage = {
        senderId: 'system',
        senderRole: 'system',
        text: `${user.role === 'landlord' ? 'Landlord' : 'Estate Firm'} indicated property is not available. Chat locked.`,
        timestamp: new Date().toISOString(),
        isSystem: true
      }
      
      updatedChat.messages.push(systemMessage)
    }

    saveChat(updatedChat)
  }

  /* ---------------------------------------------
     SEND MESSAGE WITH BUSINESS RULES
  ----------------------------------------------*/
  const sendMessage = () => {
    if (!messageText.trim()) return
    if (chat.adminLocked || chat.state === 'locked') return

    // RULE: For outgoing tenant listings, incoming tenants must chat with manager
    if (listing.posterRole === 'tenant' && user.role === 'tenant') {
      if (user.id === chat.participants.tenant) {
        // Outgoing tenant can message directly
      } else {
        // Incoming tenant - their messages go to manager
        console.log('Incoming tenant messaging through manager system')
      }
    }

    const updatedChat = {
      ...chat,
      messages: [
        ...chat.messages,
        {
          senderId: user.id,
          senderRole: user.role,
          text: messageText,
          timestamp: new Date().toISOString(),
          isSystem: false
        }
      ]
    }

    saveChat(updatedChat)
    setMessageText('')
  }

  /* ---------------------------------------------
     RAISE DISPUTE FUNCTION
  ----------------------------------------------*/
  const raiseDispute = () => {
    const disputeReason = window.prompt('Please describe the dispute:')
    if (!disputeReason) return

    const updatedChat = {
      ...chat,
      state: 'dispute',
      dispute: {
        reason: disputeReason,
        raisedBy: user.id,
        raisedAt: new Date().toISOString(),
        status: 'pending'
      }
    }

    const systemMessage = {
      senderId: 'system',
      senderRole: 'system',
      text: `⚖️ Dispute raised by ${user.role}: ${disputeReason}`,
      timestamp: new Date().toISOString(),
      isSystem: true
    }

    updatedChat.messages.push(systemMessage)
    saveChat(updatedChat)
  }

  /* ---------------------------------------------
     MARK AS RENTED WITH COMMISSION LOGIC
  ----------------------------------------------*/
  const markAsRented = () => {
    if (user.role !== 'manager' || chat.participants.manager !== user.id) {
      alert('Only assigned manager can mark as rented')
      return
    }

    if (!chat.availabilityConfirmed) {
      alert('Availability must be confirmed first')
      return
    }

    // CRITICAL: Calculate commission for non-estate firm listings
    let commissionDetails = null
    if (chat.commissionApplied && listing.price) {
      const rentalAmount = listing.price
      commissionDetails = {
        rentalAmount,
        totalCommission: rentalAmount * 0.075,
        managerShare: rentalAmount * 0.025,
        referrerShare: rentalAmount * 0.01,
        platformShare: rentalAmount * 0.04,
        calculatedAt: new Date().toISOString()
      }
      
      console.log('COMMISSION CALCULATED:', commissionDetails)
    }

    const updatedChat = {
      ...chat,
      state: 'rented',
      rented: true,
      rentedAt: new Date().toISOString(),
      rentedBy: user.id,
      commissionDetails: commissionDetails || chat.commissionDetails
    }

    // Add system message about rental
    const systemMessage = {
      senderId: 'system',
      senderRole: 'system',
      text: `✅ Property marked as RENTED by manager. ${commissionDetails ? `Commission of ₦${commissionDetails.totalCommission.toLocaleString()} calculated.` : 'No commission (Estate Firm listing).'}`,
      timestamp: new Date().toISOString(),
      isSystem: true
    }
    
    updatedChat.messages.push(systemMessage)

    saveChat(updatedChat)
    
    // Prompt incoming tenant to confirm
    if (chat.participants.incomingTenant) {
      const confirmRental = window.confirm('Manager marked property as rented. Do you confirm you have rented this property?')
      if (confirmRental) {
        // Update chat with tenant confirmation
        const confirmedChat = {
          ...updatedChat,
          tenantConfirmedRental: true,
          rentalConfirmedAt: new Date().toISOString()
        }
        
        const confirmationMessage = {
          senderId: 'system',
          senderRole: 'system',
          text: '✅ Incoming tenant confirmed rental.',
          timestamp: new Date().toISOString(),
          isSystem: true
        }
        
        confirmedChat.messages.push(confirmationMessage)
        saveChat(confirmedChat)
      }
    }
  }

  /* ---------------------------------------------
     ADMIN OVERRIDE FUNCTIONS
  ----------------------------------------------*/
  const adminOverride = (action) => {
    let updatedChat = { ...chat }
    
    switch(action) {
      case 'active':
        updatedChat.state = 'active'
        updatedChat.adminLocked = false
        break
      case 'locked':
        updatedChat.state = 'locked'
        updatedChat.adminLocked = true
        break
      case 'rented':
        updatedChat.state = 'rented'
        updatedChat.rented = true
        updatedChat.rentedAt = new Date().toISOString()
        updatedChat.rentedBy = user.id
        break
    }

    const systemMessage = {
      senderId: 'system',
      senderRole: 'system',
      text: `👑 Admin override: Chat ${action} by ${user.role} ${user.name}`,
      timestamp: new Date().toISOString(),
      isSystem: true
    }

    updatedChat.messages.push(systemMessage)
    saveChat(updatedChat)
  }

  /* ---------------------------------------------
     COPY REFERRAL LINK FUNCTION
  ----------------------------------------------*/
  const copyReferralLink = () => {
    // This should be connected to user's referral system
    const referralLink = `${window.location.origin}/signup?ref=${user.id || 'user'}`
    navigator.clipboard.writeText(referralLink)
      .then(() => alert('Referral link copied!'))
      .catch(() => alert('Failed to copy referral link'))
  }

  /* ---------------------------------------------
     RENDER WITH BUSINESS RULE CHECKS
  ----------------------------------------------*/
  if (loading) return <div className="messages-loading">Loading chat…</div>

  if (!chat || !listing) {
    return (
      <div className="not-found-container">
        <h2>Chat Not Found</h2>
        <p>The chat you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/listings')} className="btn-primary">
          Back to Listings
        </button>
      </div>
    )
  }

  /* CRITICAL BUSINESS RULE: Block tenant bypass for outgoing tenant listings */
  if (
    listing.posterRole === 'tenant' &&
    !chat.managerAssigned &&
    user.role === 'tenant' &&
    user.id !== chat.participants.tenant && // Not the outgoing tenant
    user.role !== 'admin' &&
    user.role !== 'super-admin'
  ) {
    return (
      <div className="messages-locked">
        <h3>⏳ Waiting for RentEasy Manager Assignment</h3>
        <p>
          <strong>Business Rule:</strong> For listings posted by outgoing tenants, 
          incoming tenants must communicate through an assigned RentEasy manager.
        </p>
        <p>A manager will be assigned via proximity notification shortly.</p>
        <div className="commission-notice">
          <strong>Note:</strong> 7.5% commission will apply when rented:
          <ul>
            <li>Manager: 2.5%</li>
            <li>Referrer: 1% (to outgoing tenant)</li>
            <li>RentEasy: 4%</li>
          </ul>
        </div>
      </div>
    )
  }

  /* BUSINESS RULE: Show commission info */
  const showCommissionInfo = chat.commissionApplied && !chat.estateFirmListing
  const isManager = user?.role === 'manager'

  return (
    <div className="messages-page">
      <header className="messages-header">
        <div className="header-top">
          <h2>{listing.title}</h2>
          <div className="listing-tags">
            <span className={`tag tag-${listing.posterRole}`}>
              {listing.posterRole === 'tenant' ? '👤 Outgoing Tenant' :
               listing.posterRole === 'landlord' ? '🏠 Landlord' :
               '🏢 Estate Firm'}
            </span>
            {showCommissionInfo && (
              <span className="tag tag-commission">💰 7.5% Commission</span>
            )}
            {chat.estateFirmListing && (
              <span className="tag tag-estate">🏢 No Commission</span>
            )}
          </div>
        </div>
        
        <div className="header-status">
          <span className={`status-badge status-${chat.state}`}>
            Status: {chat.state.replace('_', ' ').toUpperCase()}
          </span>
          
          {chat.managerAssigned && (
            <span className="manager-badge">
              👨‍💼 Manager Assigned
            </span>
          )}
          
          {chat.commissionDetails?.calculated && (
            <span className="commission-badge">
              💸 Commission: ₦{chat.commissionDetails.totalCommission?.toLocaleString() || '0'}
            </span>
          )}
        </div>
      </header>

      {/* MANAGER ACCEPT (Proximity Notification) */}
      {user.role === 'manager' && !chat.managerLocked && !chat.managerAssigned && (
        <div className="manager-accept-box">
          <h4>📱 Proximity Notification Received</h4>
          <p>You are the first manager to receive notification for this listing.</p>
          <button onClick={acceptAsManager} className="btn primary">
            ✅ Accept Listing as Manager
          </button>
          <small>First to accept gets 2.5% commission when rented</small>
        </div>
      )}

      {/* AVAILABILITY PROMPT - BUSINESS RULE */}
      {chat.state === 'pending_availability' &&
        (user.role === 'landlord' || user.role === 'estate-firm') && (
          <div className="availability-box">
            <h4>❓ Is this property still available?</h4>
            <p>Please confirm availability to unlock chat</p>
            <div className="availability-buttons">
              <button 
                onClick={() => respondAvailability(true)} 
                className="btn success"
              >
                ✅ Yes, Available
              </button>
              <button 
                onClick={() => respondAvailability(false)} 
                className="btn danger"
              >
                ❌ No, Not Available
              </button>
            </div>
            <small>
              {user.role === 'landlord' 
                ? 'Chat will include RentEasy manager for commission monitoring'
                : 'Estate firm listings have no commission or manager involvement'}
            </small>
          </div>
      )}

      {/* COMMISSION DISPLAY */}
      {showCommissionInfo && (
        <div className="commission-display">
          <h4>💰 Commission Breakdown</h4>
          <div className="commission-breakdown">
            <div className="commission-item">
              <span className="label">Total Commission:</span>
              <span className="value">7.5%</span>
            </div>
            <div className="commission-item">
              <span className="label">Manager (You):</span>
              <span className="value">2.5%</span>
            </div>
            <div className="commission-item">
              <span className="label">Referrer (Outgoing Tenant):</span>
              <span className="value">1%</span>
            </div>
            <div className="commission-item">
              <span className="label">RentEasy Platform:</span>
              <span className="value">4%</span>
            </div>
          </div>
        </div>
      )}

      {/* CHAT MESSAGES */}
      <div className="messages-thread">
        {chat.messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`msg ${msg.senderId === user.id ? 'own' : ''} ${msg.isSystem ? 'system' : ''}`}
          >
            <div className="msg-header">
              <small className="msg-sender">
                {msg.isSystem ? '⚙️ SYSTEM' : 
                 msg.senderRole === 'manager' ? '👨‍💼 MANAGER' :
                 msg.senderRole === 'tenant' ? '👤 TENANT' :
                 msg.senderRole === 'landlord' ? '🏠 LANDLORD' :
                 msg.senderRole === 'estate-firm' ? '🏢 ESTATE FIRM' :
                 msg.senderRole.toUpperCase()}
              </small>
              <small className="msg-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </small>
            </div>
            <p className="msg-text">{msg.text}</p>
          </div>
        ))}
      </div>

      {/* MESSAGE INPUT WITH BUSINESS RULES */}
      {chat.state === 'active' && !chat.adminLocked && (
        <div className="message-input">
          <input
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            placeholder={
              listing.posterRole === 'tenant' && user.role === 'tenant' && user.id !== chat.participants.tenant
                ? "Message will be sent to RentEasy manager..."
                : "Type message…"
            }
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage} disabled={!messageText.trim()}>
            Send
          </button>
        </div>
      )}

      {/* ACTIONS WITH BUSINESS LOGIC */}
      <div className="chat-actions">
        {/* Manager can mark as rented (triggers commission) */}
        {user.role === 'manager' && 
         chat.participants.manager === user.id && 
         chat.state === 'active' && (
          <button onClick={markAsRented} className="btn success">
            ✅ Mark as Rented (Triggers Commission)
          </button>
        )}
        
        {/* Raise dispute */}
        {chat.state !== 'rented' && chat.state !== 'locked' && (
          <button onClick={raiseDispute} className="btn warning">
            ⚖️ Raise Dispute
          </button>
        )}
        
        {/* Show commission calculation if rented */}
        {chat.state === 'rented' && chat.commissionDetails && (
          <div className="rented-info">
            <h4>✅ Property Rented</h4>
            <p>Commission of ₦{chat.commissionDetails.totalCommission?.toLocaleString() || '0'} calculated.</p>
            <div className="commission-split">
              <span>Manager: ₦{chat.commissionDetails.managerShare?.toLocaleString() || '0'}</span>
              <span>Referrer: ₦{chat.commissionDetails.referrerShare?.toLocaleString() || '0'}</span>
              <span>RentEasy: ₦{chat.commissionDetails.platformShare?.toLocaleString() || '0'}</span>
            </div>
          </div>
        )}
      </div>

      {/* ADMIN OVERRIDE PANEL */}
      {(user.role === 'admin' || user.role === 'super-admin') && (
        <div className="admin-panel">
          <h4>👑 Admin Override Panel</h4>
          <div className="admin-actions">
            <button onClick={() => adminOverride('active')}>Force Chat Active</button>
            <button onClick={() => adminOverride('locked')}>Lock Chat</button>
            <button onClick={() => adminOverride('rented')}>Force Mark as Rented</button>
            <button onClick={() => {
              // Override commission
              if (chat.commissionDetails) {
                const newCommission = window.prompt('Enter new total commission amount:')
                if (newCommission) {
                  const updatedChat = {
                    ...chat,
                    commissionDetails: {
                      ...chat.commissionDetails,
                      totalCommission: parseFloat(newCommission),
                      overridden: true,
                      overriddenBy: user.id,
                      overriddenAt: new Date().toISOString()
                    }
                  }
                  saveChat(updatedChat)
                }
              }
            }}>
              Override Commission
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Messages