import React, { useState, useEffect } from 'react';
import './ChatsOversightPage.css';

const ChatsOversightPage = () => {
  const [chats, setChats] = useState([
    {
      id: 1,
      participants: ['Tenant: John Doe', 'Landlord: Sarah Smith'],
      type: 'tenant-landlord',
      listing: '3-Bedroom Duplex, Lekki',
      status: 'active',
      manager: 'Michael Manager',
      lastMessage: 'When can I come for inspection?',
      lastActive: '2 mins ago',
      messages: 45,
      flagged: false,
      locked: false
    },
    {
      id: 2,
      participants: ['Tenant: Jane Wilson', 'Manager: Sarah Manager'],
      type: 'tenant-manager',
      listing: '2-Bedroom Apartment, Ikeja',
      status: 'active',
      manager: 'Sarah Manager',
      lastMessage: 'Payment confirmed. Keys will be handed over tomorrow.',
      lastActive: '5 mins ago',
      messages: 128,
      flagged: true,
      locked: false
    },
    {
      id: 3,
      participants: ['Tenant: David Brown', 'Landlord: Mike Johnson'],
      type: 'tenant-landlord',
      listing: 'Studio Apartment, Yaba',
      status: 'disputed',
      manager: 'John Manager',
      lastMessage: 'The landlord is not responding to maintenance requests.',
      lastActive: '1 hour ago',
      messages: 89,
      flagged: true,
      locked: true
    },
    {
      id: 4,
      participants: ['Estate Firm: Prime Properties', 'Tenant: Lisa Taylor'],
      type: 'estate-firm',
      listing: 'Office Space, Victoria Island',
      status: 'completed',
      manager: 'Not Applicable',
      lastMessage: 'Lease agreement signed and submitted.',
      lastActive: '2 days ago',
      messages: 56,
      flagged: false,
      locked: true
    },
    {
      id: 5,
      participants: ['Tenant: Robert Chen', 'Landlord: Emily Davis'],
      type: 'tenant-landlord',
      listing: '4-Bedroom House, GRA',
      status: 'active',
      manager: 'David Manager',
      lastMessage: 'Yes, the house is still available.',
      lastActive: 'Just now',
      messages: 12,
      flagged: false,
      locked: false
    }
  ]);

  const [selectedChat, setSelectedChat] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [auditMode, setAuditMode] = useState(false);
  const [activeView, setActiveView] = useState('list'); // 'list' or 'live'

  const chatTypes = {
    'tenant-landlord': 'Tenant ↔ Landlord',
    'tenant-manager': 'Tenant ↔ Manager',
    'estate-firm': 'Estate Firm Chat'
  };

  const systemRules = [
    '✅ Tenant cannot bypass manager for outgoing-tenant listings',
    '✅ Landlord cannot reveal contact before manager verification',
    '✅ Estate firm chats are excluded from commission logic',
    '❌ Two managers can NEVER monitor the same chat',
    '⚠️ Super Admin must explicitly force override for special cases'
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'success';
      case 'disputed': return 'danger';
      case 'completed': return 'primary';
      case 'locked': return 'warning';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'tenant-landlord': return 'blue';
      case 'tenant-manager': return 'purple';
      case 'estate-firm': return 'green';
      default: return 'default';
    }
  };

  const handleLockChat = (chatId) => {
    setChats(chats.map(chat => 
      chat.id === chatId ? { ...chat, locked: !chat.locked } : chat
    ));
  };

  const handleFlagChat = (chatId) => {
    setChats(chats.map(chat => 
      chat.id === chatId ? { ...chat, flagged: !chat.flagged } : chat
    ));
  };

  const handleTransferChat = (chatId, newManagerId) => {
    // In production, this would make an API call
    alert(`Transferring chat ${chatId} to manager ${newManagerId}`);
    setShowTransferModal(false);
  };

  const handleJoinChat = (chatId) => {
    // In production, this would establish WebSocket connection in audit mode
    setAuditMode(true);
    setSelectedChat(chats.find(chat => chat.id === chatId));
    setShowJoinModal(false);
    
    // Simulate joining chat
    setTimeout(() => {
      alert(`Joined chat ${chatId} in audit mode. All messages are being monitored.`);
    }, 500);
  };

  const filteredChats = chats.filter(chat => {
    if (filter !== 'all' && chat.status !== filter) return false;
    if (search && !chat.participants.some(p => p.toLowerCase().includes(search.toLowerCase()))) {
      if (!chat.listing.toLowerCase().includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const getChatStats = () => {
    return {
      total: chats.length,
      active: chats.filter(c => c.status === 'active').length,
      disputed: chats.filter(c => c.status === 'disputed').length,
      completed: chats.filter(c => c.status === 'completed').length,
      flagged: chats.filter(c => c.flagged).length,
      locked: chats.filter(c => c.locked).length
    };
  };

  return (
    <div className="chats-oversight">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Chats & Communications Oversight</h1>
          <p className="page-subtitle">Monitor and control all platform communications</p>
        </div>
        <div className="header-right">
          <div className="view-controls">
            <button 
              className={`view-toggle ${activeView === 'list' ? 'active' : ''}`}
              onClick={() => setActiveView('list')}
            >
              📋 List View
            </button>
            <button 
              className={`view-toggle ${activeView === 'live' ? 'active' : ''}`}
              onClick={() => setActiveView('live')}
            >
              🔴 Live Monitor
            </button>
          </div>
          {auditMode && (
            <div className="audit-mode-indicator">
              <span className="audit-dot"></span>
              AUDIT MODE: Invisible
            </div>
          )}
        </div>
      </div>

      {/* System Rules */}
      <div className="system-rules-card">
        <div className="rules-header">
          <span className="rules-icon">📜</span>
          <h3>System Rules & Enforcement</h3>
        </div>
        <div className="rules-list">
          {systemRules.map((rule, index) => (
            <div key={index} className="rule-item">
              {rule}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-value">{getChatStats().total}</div>
          <div className="stat-label">Total Chats</div>
        </div>
        <div className="stat-card active">
          <div className="stat-value">{getChatStats().active}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card disputed">
          <div className="stat-value">{getChatStats().disputed}</div>
          <div className="stat-label">Disputed</div>
        </div>
        <div className="stat-card flagged">
          <div className="stat-value">{getChatStats().flagged}</div>
          <div className="stat-label">Flagged</div>
        </div>
        <div className="stat-card locked">
          <div className="stat-value">{getChatStats().locked}</div>
          <div className="stat-label">Locked</div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-bar">
        <div className="controls-left">
          <div className="filter-group">
            <label>Filter by Status</label>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Chats</option>
              <option value="active">Active</option>
              <option value="disputed">Disputed</option>
              <option value="completed">Completed</option>
              <option value="locked">Locked</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Filter by Type</label>
            <select className="filter-select">
              <option value="all">All Types</option>
              <option value="tenant-landlord">Tenant ↔ Landlord</option>
              <option value="tenant-manager">Tenant ↔ Manager</option>
              <option value="estate-firm">Estate Firm</option>
            </select>
          </div>
        </div>
        <div className="controls-right">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search participants or listing..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          {auditMode && (
            <button 
              className="exit-audit-btn"
              onClick={() => setAuditMode(false)}
            >
              Exit Audit Mode
            </button>
          )}
        </div>
      </div>

      {/* Chats Table */}
      <div className="chats-table-container">
        <table className="chats-table">
          <thead>
            <tr>
              <th>Chat Participants</th>
              <th>Type</th>
              <th>Listing</th>
              <th>Manager</th>
              <th>Status</th>
              <th>Last Activity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredChats.map(chat => (
              <tr key={chat.id} className={chat.flagged ? 'flagged' : ''}>
                <td>
                  <div className="participants-cell">
                    <div className="participants-list">
                      {chat.participants.map((participant, index) => (
                        <span key={index} className="participant">
                          {participant}
                        </span>
                      ))}
                    </div>
                    <div className="chat-meta">
                      <span className="message-count">{chat.messages} messages</span>
                      {chat.flagged && (
                        <span className="flag-indicator" title="Flagged for review">
                          🚩
                        </span>
                      )}
                      {chat.locked && (
                        <span className="lock-indicator" title="Chat is locked">
                          🔒
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`type-badge ${getTypeColor(chat.type)}`}>
                    {chatTypes[chat.type]}
                  </span>
                </td>
                <td>
                  <div className="listing-cell">
                    <span className="listing-title">{chat.listing}</span>
                    <span className="listing-id">ID: {chat.id}</span>
                  </div>
                </td>
                <td>
                  <span className="manager-name">{chat.manager}</span>
                </td>
                <td>
                  <span className={`status-badge ${getStatusColor(chat.status)}`}>
                    {chat.status}
                  </span>
                </td>
                <td>
                  <div className="activity-cell">
                    <div className="last-message" title={chat.lastMessage}>
                      {chat.lastMessage.length > 30 
                        ? chat.lastMessage.substring(0, 30) + '...' 
                        : chat.lastMessage}
                    </div>
                    <div className="last-active">{chat.lastActive}</div>
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="action-btn join"
                      onClick={() => {
                        setSelectedChat(chat);
                        setShowJoinModal(true);
                      }}
                      title="Join Chat (Invisible)"
                    >
                      👁️
                    </button>
                    <button 
                      className="action-btn lock"
                      onClick={() => handleLockChat(chat.id)}
                      title={chat.locked ? "Unlock Chat" : "Lock Chat"}
                    >
                      {chat.locked ? '🔓' : '🔒'}
                    </button>
                    <button 
                      className="action-btn flag"
                      onClick={() => handleFlagChat(chat.id)}
                      title={chat.flagged ? "Unflag Chat" : "Flag Chat"}
                    >
                      {chat.flagged ? '🚫' : '🚩'}
                    </button>
                    <button 
                      className="action-btn transfer"
                      onClick={() => {
                        setSelectedChat(chat);
                        setShowTransferModal(true);
                      }}
                      title="Transfer to Another Manager"
                    >
                      🔄
                    </button>
                    <button 
                      className="action-btn override"
                      onClick={() => setSelectedChat(chat)}
                      title="Override Chat Outcomes"
                    >
                      ⚡
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Live Monitor View */}
      {activeView === 'live' && (
        <div className="live-monitor">
          <div className="monitor-header">
            <h3>🔴 Live Chat Monitor</h3>
            <div className="monitor-controls">
              <button className="control-btn">Start Recording</button>
              <button className="control-btn">Export Transcript</button>
              <button className="control-btn danger">Force Disconnect</button>
            </div>
          </div>
          <div className="monitor-content">
            <div className="chat-window">
              <div className="chat-header">
                <div className="chat-info">
                  <h4>Tenant: Jane Wilson ↔ Manager: Sarah Manager</h4>
                  <p>Listing: 2-Bedroom Apartment, Ikeja</p>
                </div>
                <div className="chat-status">
                  <span className="status-dot"></span>
                  <span>LIVE</span>
                </div>
              </div>
              <div className="messages-container">
                <div className="message incoming">
                  <div className="message-sender">Tenant</div>
                  <div className="message-content">
                    Hello, is the apartment still available?
                  </div>
                  <div className="message-time">10:30 AM</div>
                </div>
                <div className="message outgoing">
                  <div className="message-sender">Manager</div>
                  <div className="message-content">
                    Yes, it's available. When would you like to view it?
                  </div>
                  <div className="message-time">10:31 AM</div>
                </div>
                <div className="message incoming">
                  <div className="message-sender">Tenant</div>
                  <div className="message-content">
                    Can we schedule for tomorrow afternoon?
                  </div>
                  <div className="message-time">10:32 AM</div>
                </div>
                <div className="super-admin-note">
                  <span className="note-icon">👑</span>
                  <span className="note-text">Super Admin monitoring in audit mode (invisible to participants)</span>
                </div>
              </div>
              <div className="chat-input-container">
                <input 
                  type="text" 
                  className="chat-input"
                  placeholder="Type to send message as Super Admin (visible)"
                  disabled={!auditMode}
                />
                <button className="send-btn">Send</button>
              </div>
            </div>
            <div className="chat-sidebar">
              <div className="sidebar-section">
                <h5>Chat Details</h5>
                <div className="detail-item">
                  <span>Chat ID:</span>
                  <span>CHAT-456</span>
                </div>
                <div className="detail-item">
                  <span>Started:</span>
                  <span>2024-01-15</span>
                </div>
                <div className="detail-item">
                  <span>Messages:</span>
                  <span>128</span>
                </div>
                <div className="detail-item">
                  <span>Status:</span>
                  <span className="status-active">Active</span>
                </div>
              </div>
              <div className="sidebar-section">
                <h5>Quick Actions</h5>
                <button className="sidebar-btn">
                  <span className="btn-icon">📁</span>
                  Export Chat Log
                </button>
                <button className="sidebar-btn">
                  <span className="btn-icon">🔒</span>
                  Lock This Chat
                </button>
                <button className="sidebar-btn">
                  <span className="btn-icon">🚩</span>
                  Flag for Review
                </button>
                <button className="sidebar-btn">
                  <span className="btn-icon">📞</span>
                  Request Call Recording
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join Chat Modal */}
      {showJoinModal && selectedChat && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Join Chat in Audit Mode</h3>
              <button 
                className="close-modal"
                onClick={() => setShowJoinModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="join-warning">
                <span className="warning-icon">👁️</span>
                <div className="warning-content">
                  <h4>Invisible Audit Mode</h4>
                  <p>You will join this chat as an invisible observer. Participants will not know you're monitoring.</p>
                  <div className="audit-details">
                    <p><strong>Chat:</strong> {selectedChat.participants.join(' ↔ ')}</p>
                    <p><strong>Listing:</strong> {selectedChat.listing}</p>
                    <p><strong>Manager:</strong> {selectedChat.manager}</p>
                  </div>
                </div>
              </div>
              <div className="audit-options">
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span className="checkmark"></span>
                  <span>Enable message recording</span>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span className="checkmark"></span>
                  <span>Get notifications for flagged messages</span>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  <span>Intervene if rules are violated</span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowJoinModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={() => handleJoinChat(selectedChat.id)}
              >
                Join Invisibly
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Chat Modal */}
      {showTransferModal && selectedChat && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Transfer Chat to Another Manager</h3>
              <button 
                className="close-modal"
                onClick={() => setShowTransferModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="transfer-warning">
                <span className="warning-icon">🔄</span>
                <p>
                  Transferring <strong>Chat {selectedChat.id}</strong> from 
                  <strong> {selectedChat.manager}</strong> to another manager.
                </p>
              </div>
              <div className="form-group">
                <label>Select New Manager</label>
                <select className="form-select">
                  <option value="">Select a manager...</option>
                  <option value="1">Michael Manager (Lekki)</option>
                  <option value="2">Sarah Manager (Ikeja)</option>
                  <option value="3">John Manager (Victoria Island)</option>
                  <option value="4">David Manager (Yaba)</option>
                </select>
              </div>
              <div className="confirmation-check">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  I confirm this transfer is necessary
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowTransferModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={() => handleTransferChat(selectedChat.id, 2)}
              >
                Transfer Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Details Modal */}
      {selectedChat && !showJoinModal && !showTransferModal && (
        <div className="modal-overlay">
          <div className="modal large">
            <div className="modal-header">
              <h3>Chat Details & Override</h3>
              <button 
                className="close-modal"
                onClick={() => setSelectedChat(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="chat-details-grid">
                <div className="detail-section">
                  <h4>Chat Information</h4>
                  <div className="detail-row">
                    <span className="detail-label">Chat ID:</span>
                    <span className="detail-value">{selectedChat.id}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Participants:</span>
                    <span className="detail-value">{selectedChat.participants.join(', ')}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Listing:</span>
                    <span className="detail-value">{selectedChat.listing}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Manager:</span>
                    <span className="detail-value">{selectedChat.manager}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Type:</span>
                    <span className={`type-badge ${getTypeColor(selectedChat.type)}`}>
                      {chatTypes[selectedChat.type]}
                    </span>
                  </div>
                </div>
                <div className="detail-section">
                  <h4>Status & Controls</h4>
                  <div className="status-controls">
                    <div className="status-display">
                      <span className="status-label">Current Status:</span>
                      <span className={`status-badge ${getStatusColor(selectedChat.status)}`}>
                        {selectedChat.status}
                      </span>
                    </div>
                    <div className="override-options">
                      <h5>Override Options:</h5>
                      <div className="option-buttons">
                        <button className="option-btn">
                          Mark as Disputed
                        </button>
                        <button className="option-btn">
                          Mark as Completed
                        </button>
                        <button className="option-btn">
                          Force Unlock
                        </button>
                        <button className="option-btn danger">
                          Delete Chat
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="message-history">
                <h4>Recent Messages</h4>
                <div className="messages-list">
                  <div className="message-item">
                    <div className="message-header">
                      <span className="message-sender">Tenant</span>
                      <span className="message-time">10:30 AM</span>
                    </div>
                    <div className="message-content">
                      Hello, is the apartment still available?
                    </div>
                  </div>
                  <div className="message-item">
                    <div className="message-header">
                      <span className="message-sender">Manager</span>
                      <span className="message-time">10:31 AM</span>
                    </div>
                    <div className="message-content">
                      Yes, it's available. When would you like to view it?
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setSelectedChat(null)}
              >
                Close
              </button>
              <button 
                className="btn-primary"
                onClick={() => {
                  setSelectedChat(null);
                  setShowJoinModal(true);
                }}
              >
                Join Chat
              </button>
              <button 
                className="btn-primary danger"
                onClick={() => {
                  // Force override action
                  setSelectedChat(null);
                }}
              >
                Force Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatsOversightPage;