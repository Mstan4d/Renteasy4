// src/modules/super-admin/pages/ChatsOversightPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './ChatsOversightPage.css';

const ChatsOversightPage = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [auditMode, setAuditMode] = useState(false);
  const [activeView, setActiveView] = useState('list');
  const [messages, setMessages] = useState([]); // for live view

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

  // Fetch chats on mount
  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          id,
          created_at,
          updated_at,
          listing_id,
          participant1_id,
          participant2_id,
          monitoring_manager_id,
          state,
          chat_type,
          flagged,
          locked,
          listing:listings (id, title, address, state, city),
          manager:monitoring_manager_id (id, full_name),
          participant1:participant1_id (id, full_name, role),
          participant2:participant2_id (id, full_name, role)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // For each chat, get message count and last message
      const enrichedChats = await Promise.all(
        data.map(async (chat) => {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('chat_id', chat.id);

          const { data: lastMsg } = await supabase
            .from('messages')
            .select('content, created_at, sender_id')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Build participant list
          const participants = [];
          if (chat.participant1) participants.push(`${chat.participant1.role}: ${chat.participant1.full_name}`);
          if (chat.participant2) participants.push(`${chat.participant2.role}: ${chat.participant2.full_name}`);

          return {
            id: chat.id,
            participants,
            type: chat.chat_type,
            listing: chat.listing?.title || 'Unknown',
            status: chat.state || 'active',
            manager: chat.manager?.full_name || 'Not Assigned',
            lastMessage: lastMsg?.content || '',
            lastActive: lastMsg ? new Date(lastMsg.created_at).toLocaleString() : new Date(chat.updated_at).toLocaleString(),
            messages: count || 0,
            flagged: chat.flagged || false,
            locked: chat.locked || false,
            listingId: chat.listing_id,
            managerId: chat.monitoring_manager_id,
          };
        })
      );

      setChats(enrichedChats);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleLockChat = async (chatId) => {
    try {
      const { error } = await supabase
        .from('chats')
        .update({ locked: true })
        .eq('id', chatId);
      if (error) throw error;
      setChats(chats.map(chat => 
        chat.id === chatId ? { ...chat, locked: true } : chat
      ));
    } catch (error) {
      console.error('Error locking chat:', error);
      alert('Failed to lock chat.');
    }
  };

  const handleUnlockChat = async (chatId) => {
    try {
      const { error } = await supabase
        .from('chats')
        .update({ locked: false })
        .eq('id', chatId);
      if (error) throw error;
      setChats(chats.map(chat => 
        chat.id === chatId ? { ...chat, locked: false } : chat
      ));
    } catch (error) {
      console.error('Error unlocking chat:', error);
      alert('Failed to unlock chat.');
    }
  };

  const handleFlagChat = async (chatId, flag) => {
    try {
      const { error } = await supabase
        .from('chats')
        .update({ flagged: flag })
        .eq('id', chatId);
      if (error) throw error;
      setChats(chats.map(chat => 
        chat.id === chatId ? { ...chat, flagged: flag } : chat
      ));
    } catch (error) {
      console.error('Error flagging chat:', error);
      alert('Failed to update flag.');
    }
  };

  const handleJoinChat = (chatId) => {
    // In a real app, you'd open a chat viewer with real-time messages
    setAuditMode(true);
    const chat = chats.find(c => c.id === chatId);
    setSelectedChat(chat);
    setShowJoinModal(false);
    // Load messages for that chat
    fetchMessages(chatId);
  };

  const fetchMessages = async (chatId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    if (!error) setMessages(data || []);
  };

  const filteredChats = chats.filter(chat => {
    if (filter !== 'all' && chat.status !== filter) return false;
    if (search) {
      const searchTerm = search.toLowerCase();
      return (
        chat.participants.some(p => p.toLowerCase().includes(searchTerm)) ||
        chat.listing.toLowerCase().includes(searchTerm) ||
        chat.manager.toLowerCase().includes(searchTerm)
      );
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

  if (loading) return <div className="loading">Loading chats...</div>;

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
                    {chatTypes[chat.type] || chat.type}
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
                      onClick={() => chat.locked ? handleUnlockChat(chat.id) : handleLockChat(chat.id)}
                      title={chat.locked ? "Unlock Chat" : "Lock Chat"}
                    >
                      {chat.locked ? '🔓' : '🔒'}
                    </button>
                    <button 
                      className="action-btn flag"
                      onClick={() => handleFlagChat(chat.id, !chat.flagged)}
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

      {/* Live Monitor View (simplified – you can keep your existing mock UI or fetch messages) */}
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
                  <h4>{selectedChat ? selectedChat.participants.join(' ↔ ') : 'Select a chat to monitor'}</h4>
                  <p>{selectedChat?.listing || ''}</p>
                </div>
                <div className="chat-status">
                  <span className="status-dot"></span>
                  <span>{selectedChat ? 'LIVE' : 'No chat selected'}</span>
                </div>
              </div>
              <div className="messages-container">
                {selectedChat ? (
                  messages.length > 0 ? (
                    messages.map((msg, idx) => (
                      <div key={idx} className={`message ${msg.sender_id === selectedChat.participant1_id ? 'incoming' : 'outgoing'}`}>
                        <div className="message-sender">{msg.sender_id}</div>
                        <div className="message-content">{msg.content}</div>
                        <div className="message-time">{new Date(msg.created_at).toLocaleTimeString()}</div>
                      </div>
                    ))
                  ) : (
                    <p>No messages yet.</p>
                  )
                ) : (
                  <div className="empty-live">
                    <p>Click "Join Chat" on any chat to start monitoring.</p>
                  </div>
                )}
                {auditMode && (
                  <div className="super-admin-note">
                    <span className="note-icon">👑</span>
                    <span className="note-text">Super Admin monitoring in audit mode (invisible to participants)</span>
                  </div>
                )}
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
              {/* ... keep your existing sidebar or simplify */}
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
              <button className="close-modal" onClick={() => setShowJoinModal(false)}>×</button>
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
                  <span>Enable message recording</span>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span>Get notifications for flagged messages</span>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>Intervene if rules are violated</span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowJoinModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => handleJoinChat(selectedChat.id)}>Join Invisibly</button>
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
              <button className="close-modal" onClick={() => setShowTransferModal(false)}>×</button>
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
                <select className="form-select" id="newManager">
                  <option value="">Select a manager...</option>
                  {/* You could fetch managers from profiles where role='manager' */}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowTransferModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => {
                const newManagerId = document.getElementById('newManager').value;
                alert(`Transfer chat to manager ${newManagerId} – implement via Supabase update`);
                setShowTransferModal(false);
              }}>Transfer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatsOversightPage;