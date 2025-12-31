import React, { useEffect, useMemo, useState } from 'react'

/**
 * ROLES:
 * tenant | landlord | manager | admin
 */

const Messages = ({ user }) => {
  /* =========================
     STATE
  ========================== */
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)

  const [notifications, setNotifications] = useState([])

  // dispute / admin
  const [disputeModalOpen, setDisputeModalOpen] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')

  /* =========================
     LOAD INITIAL DATA
  ========================== */
  useEffect(() => {
    // 🔌 replace with API later
    setConversations([])
    setNotifications([])
    setLoading(false)
  }, [])

  /* =========================
     PERMISSIONS
  ========================== */
  const canInitiateConversation = useMemo(() => {
    if (!user) return false
    if (user.role !== 'tenant') return false
    if (!user.isVerified) return false
    return true
  }, [user])

  const isChatLocked = useMemo(() => {
    if (!activeConversation) return true
    return ['disputed', 'frozen', 'closed'].includes(
      activeConversation.status
    )
  }, [activeConversation])

  /* =========================
     START CONVERSATION
     Tenant → Landlord
  ========================== */
  const startNewConversation = (listing) => {
    if (!canInitiateConversation) {
      alert('You must be a verified tenant to start a chat.')
      return
    }

    const newConversation = {
      id: Date.now(),
      listingId: listing.id,
      tenantId: user.id,
      landlordId: listing.landlordId,
      managerId: null,
      status: 'pending-landlord',
      createdAt: new Date(),
      dispute: null
    }

    setConversations((prev) => [newConversation, ...prev])
    setActiveConversation(newConversation)
    setMessages([])
  }

  /* =========================
     LANDLORD RESPONSE
     triggers MANAGER NOTIFY
  ========================== */
  const landlordRespondsAvailable = () => {
    if (!activeConversation) return

    const updated = {
      ...activeConversation,
      status: 'awaiting-manager'
    }

    setActiveConversation(updated)
    setConversations((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    )

    notifyManagers(updated)
  }

  /* =========================
     MANAGER NOTIFICATION
  ========================== */
  const notifyManagers = (conversation) => {
    // 🔔 socket / backend later
    console.log('Notify managers near listing:', conversation.listingId)
  }

  /* =========================
     MANAGER ACCEPTS CHAT
     FIRST COME = OWNER
  ========================== */
  const managerAcceptChat = () => {
    if (user.role !== 'manager') return
    if (activeConversation?.managerId) return

    const updated = {
      ...activeConversation,
      managerId: user.id,
      status: 'managed'
    }

    setActiveConversation(updated)
    setConversations((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    )
  }

  /* =========================
     SEND MESSAGE
  ========================== */
  const sendMessage = () => {
    if (!messageText.trim()) return
    if (isChatLocked) {
      alert('Chat is locked.')
      return
    }

    const msg = {
      id: Date.now(),
      senderId: user.id,
      senderRole: user.role,
      text: messageText,
      createdAt: new Date()
    }

    setMessages((prev) => [...prev, msg])
    setMessageText('')
  }

  /* =========================
     DISPUTE SYSTEM
  ========================== */
  const raiseDispute = () => {
    if (!disputeReason.trim()) return

    const updated = {
      ...activeConversation,
      status: 'disputed',
      dispute: {
        raisedBy: user.role,
        reason: disputeReason,
        raisedAt: new Date()
      }
    }

    setActiveConversation(updated)
    setConversations((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    )

    setDisputeModalOpen(false)
    setDisputeReason('')
  }

  /* =========================
     ADMIN CONTROLS
  ========================== */
  const adminOverrideManager = (newManagerId = null) => {
    if (user.role !== 'admin') return

    const updated = {
      ...activeConversation,
      managerId: newManagerId,
      status: newManagerId ? 'managed' : 'awaiting-manager'
    }

    setActiveConversation(updated)
    setConversations((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    )
  }

  const resolveDispute = (note, closeChat = false) => {
    if (user.role !== 'admin') return

    const updated = {
      ...activeConversation,
      status: closeChat ? 'closed' : 'managed',
      dispute: {
        ...activeConversation.dispute,
        resolvedBy: user.id,
        resolutionNote: note,
        resolvedAt: new Date()
      }
    }

    setActiveConversation(updated)
    setConversations((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    )
  }

  /* =========================
     UI
  ========================== */
  if (loading) return <div>Loading messages...</div>

  return (
    <div className="messages-page">
      <aside className="conversation-list">
        {conversations.map((c) => (
          <div
            key={c.id}
            onClick={() => setActiveConversation(c)}
            className={`conversation-item ${
              activeConversation?.id === c.id ? 'active' : ''
            }`}
          >
            <div>Status: {c.status}</div>
            {c.dispute && <span className="dispute-tag">DISPUTE</span>}
          </div>
        ))}
      </aside>

      <main className="chat-area">
        {!activeConversation ? (
          <div>Select a conversation</div>
        ) : (
          <>
            <header>
              <h3>Conversation</h3>

              {user.role === 'manager' &&
                activeConversation.status === 'awaiting-manager' && (
                  <button onClick={managerAcceptChat}>
                    Accept & Monitor
                  </button>
                )}

              {['tenant', 'landlord'].includes(user.role) &&
                activeConversation.status === 'managed' && (
                  <button onClick={() => setDisputeModalOpen(true)}>
                    Raise Dispute
                  </button>
                )}
            </header>

            <div className="messages">
              {messages.map((m) => (
                <div key={m.id} className="message">
                  <strong>{m.senderRole}:</strong> {m.text}
                </div>
              ))}
            </div>

            {!isChatLocked && (
              <footer>
                <input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type message..."
                />
                <button onClick={sendMessage}>Send</button>
              </footer>
            )}

            {/* ADMIN PANEL */}
            {user.role === 'admin' && (
              <section className="admin-panel">
                <h4>Admin Controls</h4>
                <button onClick={() => adminOverrideManager(null)}>
                  Remove Manager
                </button>
                <button
                  onClick={() =>
                    resolveDispute('Resolved by admin')
                  }
                >
                  Resolve Dispute
                </button>
                <button
                  onClick={() =>
                    resolveDispute('Fraud detected', true)
                  }
                >
                  Close Chat
                </button>
              </section>
            )}
          </>
        )}
      </main>

      {/* DISPUTE MODAL */}
      {disputeModalOpen && (
        <div className="modal">
          <textarea
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            placeholder="Explain issue..."
          />
          <button onClick={raiseDispute}>Submit Dispute</button>
        </div>
      )}
    </div>
  )
}

export default Messages