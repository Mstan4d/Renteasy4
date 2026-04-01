// src/modules/manager/pages/ManagerChats.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import './ManagerChats.css';

const ManagerChats = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    uniqueListings: 0,
    active: 0,
    rented: 0,
    pending: 0,
    monitoring: 0
  });

  // Load chats when component mounts
  useEffect(() => {
    if (user) {
      loadChats();
      subscribeToNewMessages();
    }
    
    return () => {
      if (window.chatSubscription) {
        supabase.removeChannel(window.chatSubscription);
      }
    };
  }, [user]);

  const subscribeToNewMessages = () => {
    if (window.chatSubscription) {
      supabase.removeChannel(window.chatSubscription);
    }

    const channel = supabase
      .channel('manager-chats')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new;
          setChats(prevChats => 
            prevChats.map(chat => {
              if (chat.id === newMessage.chat_id) {
                return {
                  ...chat,
                  lastMessage: newMessage,
                  unreadCount: chat.unreadCount + (newMessage.sender_id !== user.id ? 1 : 0),
                  updated_at: newMessage.created_at
                };
              }
              return chat;
            })
          );
        }
      )
      .subscribe();

    window.chatSubscription = channel;
  };

  const loadChats = async () => {
    setLoading(true);
    try {
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select(`
          *,
          participant1:participant1_id (id, full_name, name, avatar_url, role),
          participant2:participant2_id (id, full_name, name, avatar_url, role),
          listing:listing_id (id, title, images, price, address, city, state, poster_role, status, user_id)
        `)
        .or(`monitoring_manager_id.eq.${user.id},participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (chatsError) throw chatsError;

      if (!chatsData || chatsData.length === 0) {
        setChats([]);
        setStats({ total: 0, uniqueListings: 0, active: 0, rented: 0, pending: 0, monitoring: 0 });
        setLoading(false);
        return;
      }

      const enrichedChats = await Promise.all(
        chatsData.map(async (chat) => {
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('chat_id', chat.id)
            .is('read_at', null)
            .neq('sender_id', user.id);

          const isMonitoring = chat.monitoring_manager_id === user.id;
          const isParticipant = chat.participant1_id === user.id || chat.participant2_id === user.id;
          
          let otherParty = null;
          if (isParticipant) {
            otherParty = chat.participant1_id === user.id ? chat.participant2 : chat.participant1;
          } else if (isMonitoring && chat.participant2) {
            otherParty = chat.participant2;
          }

          const listingPrice = chat.listing?.price || 0;
          const commission = listingPrice * 0.025;

          return {
            ...chat,
            listingTitle: chat.listing?.title || 'Unknown Property',
            listingPrice: listingPrice,
            listingStatus: chat.listing?.status || 'unknown',
            listingImage: chat.listing?.images?.[0] || null,
            listingLocation: `${chat.listing?.city || ''} ${chat.listing?.state || ''}`.trim() || 'Location not set',
            listingPosterRole: chat.listing?.poster_role,
            lastMessage: lastMsg,
            unreadCount: unreadCount || 0,
            isMonitoring: isMonitoring,
            isParticipant: isParticipant,
            otherParty: otherParty,
            commission: commission,
            canVerify: chat.listing?.verification_status === 'pending_verification' && isMonitoring,
            canConfirmRental: chat.listing?.status !== 'rented' && isMonitoring
          };
        })
      );

      setChats(enrichedChats);
      calculateStats(enrichedChats);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (chatsData) => {
    // Group by listing_id to avoid double counting
    const uniqueListings = {};
    chatsData.forEach(chat => {
      if (!uniqueListings[chat.listing_id]) {
        uniqueListings[chat.listing_id] = chat;
      }
    });
    
    const uniqueListingsArray = Object.values(uniqueListings);
    
    const stats = {
      total: chatsData.length,
      uniqueListings: uniqueListingsArray.length,
      active: uniqueListingsArray.filter(c => c.state === 'active' && c.listingStatus !== 'rented').length,
      rented: uniqueListingsArray.filter(c => c.listingStatus === 'rented').length,
      pending: uniqueListingsArray.filter(c => c.state === 'pending_availability' || c.state === 'pending_manager').length,
      monitoring: uniqueListingsArray.filter(c => c.isMonitoring && c.listingStatus !== 'rented').length
    };
    setStats(stats);
  };

  const getFilteredChats = () => {
    switch (filter) {
      case 'active':
        return chats.filter(c => c.state === 'active' && c.listingStatus !== 'rented');
      case 'rented':
        return chats.filter(c => c.listingStatus === 'rented');
      case 'pending':
        return chats.filter(c => c.state === 'pending_availability' || c.state === 'pending_manager');
      case 'monitoring':
        return chats.filter(c => c.isMonitoring && c.listingStatus !== 'rented');
      default:
        return chats;
    }
  };

  const getStatusInfo = (chat) => {
    if (chat.listingStatus === 'rented') {
      return { label: 'Rented', class: 'status-rented', icon: '✅' };
    }
    switch (chat.state) {
      case 'active':
        return { label: 'Active', class: 'status-active', icon: '💬' };
      case 'pending_availability':
        return { label: 'Awaiting Availability', class: 'status-pending', icon: '⏳' };
      case 'pending_manager':
        return { label: 'Awaiting Manager', class: 'status-pending', icon: '👨‍💼' };
      default:
        return { label: chat.state || 'Unknown', class: 'status-default', icon: '📝' };
    }
  };

  const openChat = (chatId) => {
    navigate(`/dashboard/messages/chat/${chatId}`);
  };

  const startVerification = (listingId) => {
    navigate(`/dashboard/manager/verify/${listingId}`);
  };

  const formatCurrency = (amount) => `₦${(amount || 0).toLocaleString()}`;
  
  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getLastMessagePreview = (chat) => {
    if (!chat.lastMessage) return 'No messages yet';
    
    const content = chat.lastMessage.is_system_message ? '🔔 System message' : chat.lastMessage.content;
    const isOwn = chat.lastMessage.sender_id === user.id;
    const sender = isOwn ? 'You: ' : `${chat.otherParty?.full_name?.split(' ')[0] || 'User'}: `;
    
    return `${sender}${content.substring(0, 60)}${content.length > 60 ? '...' : ''}`;
  };

  // Get unique listings count for a specific listing (multiple chats)
  const getMultipleChatsCount = (listingId) => {
    return chats.filter(c => c.listing_id === listingId).length;
  };

  if (loading) {
    return <RentEasyLoader message="Loading your chats..." fullScreen />;
  }

  const filteredChats = getFilteredChats();

  return (
    <div className="manager-chats">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>💬 Chat Management</h1>
          <p>Monitor conversations, track commission opportunities, and manage rentals</p>
        </div>
        <button className="btn-outline" onClick={() => navigate('/dashboard/manager')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className={`stat-card ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <div className="stat-value">{stats.uniqueListings}</div>
            <div className="stat-label">Active Listings</div>
          </div>
        </div>
        <div className={`stat-card ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>
          <div className="stat-icon">💬</div>
          <div className="stat-info">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
        <div className={`stat-card ${filter === 'monitoring' ? 'active' : ''}`} onClick={() => setFilter('monitoring')}>
          <div className="stat-icon">👁️</div>
          <div className="stat-info">
            <div className="stat-value">{stats.monitoring}</div>
            <div className="stat-label">Monitoring</div>
          </div>
        </div>
        <div className={`stat-card ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className={`stat-card ${filter === 'rented' ? 'active' : ''}`} onClick={() => setFilter('rented')}>
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value">{stats.rented}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All Chats
        </button>
        <button className={`filter-tab ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>
          Active
        </button>
        <button className={`filter-tab ${filter === 'monitoring' ? 'active' : ''}`} onClick={() => setFilter('monitoring')}>
          Monitoring
        </button>
        <button className={`filter-tab ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
          Pending
        </button>
        <button className={`filter-tab ${filter === 'rented' ? 'active' : ''}`} onClick={() => setFilter('rented')}>
          Completed
        </button>
      </div>

      {/* Chats List */}
      <div className="chats-list">
        {filteredChats.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {filter === 'all' ? '💬' : filter === 'active' ? '🔍' : filter === 'rented' ? '✅' : '⏳'}
            </div>
            <h3>No {filter} chats found</h3>
            <p>
              {filter === 'all' ? 'When you accept listings or monitor chats, they will appear here' :
               filter === 'active' ? 'No active chats at the moment' :
               filter === 'rented' ? 'No completed rentals yet' :
               filter === 'monitoring' ? 'No chats you are monitoring' :
               'No pending availability checks'}
            </p>
            {filter !== 'all' && (
              <button className="btn-outline" onClick={() => setFilter('all')}>
                View All Chats
              </button>
            )}
          </div>
        ) : (
          filteredChats.map(chat => {
            const status = getStatusInfo(chat);
            const hasUnread = chat.unreadCount > 0;
            const multipleChats = getMultipleChatsCount(chat.listing_id);
            
            return (
              <div key={chat.id} className={`chat-card ${hasUnread ? 'unread' : ''}`} onClick={() => openChat(chat.id)}>
                {/* Left Section - Property Image */}
                <div className="chat-image">
                  {chat.listingImage ? (
                    <img src={chat.listingImage} alt={chat.listingTitle} />
                  ) : (
                    <div className="image-placeholder">🏠</div>
                  )}
                </div>

                {/* Middle Section - Chat Info */}
                <div className="chat-info">
                  <div className="chat-header">
                    <div className="chat-title-section">
                      <h4 className="chat-title">{chat.listingTitle}</h4>
                      {multipleChats > 1 && (
                        <span className="multiple-chats-badge">{multipleChats} conversations</span>
                      )}
                    </div>
                    <div className="chat-badges">
                      <span className={`status-badge ${status.class}`}>
                        {status.icon} {status.label}
                      </span>
                      {chat.isMonitoring && (
                        <span className="monitoring-badge">👁️ Monitoring</span>
                      )}
                      {chat.isParticipant && !chat.isMonitoring && (
                        <span className="participant-badge">💬 Participant</span>
                      )}
                      {chat.listingPosterRole === 'estate-firm' && (
                        <span className="estate-badge">🏢 Estate Firm</span>
                      )}
                    </div>
                  </div>

                  <div className="chat-details">
                    <div className="detail-row">
                      <span className="detail-label">Price:</span>
                      <span className="detail-value price">{formatCurrency(chat.listingPrice)}/year</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">{chat.listingLocation || 'Location not set'}</span>
                    </div>
                    {chat.commission > 0 && chat.listingPosterRole !== 'estate-firm' && (
                      <div className="detail-row">
                        <span className="detail-label">Your Commission:</span>
                        <span className="detail-value commission">{formatCurrency(chat.commission)}</span>
                        <span className="commission-rate">(2.5%)</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="detail-label">With:</span>
                      <span className="detail-value">
                        {chat.otherParty?.full_name || 'Unknown'}
                        <span className="role-tag">({chat.otherParty?.role || 'User'})</span>
                      </span>
                    </div>
                  </div>

                  {/* Last Message Preview */}
                  <div className="last-message">
                    <span className="message-preview">
                      {getLastMessagePreview(chat)}
                    </span>
                    <span className="message-time">{formatRelativeTime(chat.updated_at)}</span>
                  </div>
                </div>

                {/* Right Section - Actions */}
                <div className="chat-actions">
                  <div className="action-buttons">
                    <button 
                      className="btn-monitor" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        openChat(chat.id); 
                      }}
                    >
                      {chat.isMonitoring ? '👁️ Monitor Chat' : '💬 Open Chat'}
                    </button>
                    
                    {chat.canVerify && (
                      <button 
                        className="btn-verify" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          startVerification(chat.listing_id); 
                        }}
                      >
                        🔍 Verify Property
                      </button>
                    )}
                    
                    <button 
                      className="btn-view" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        navigate(`/listings/${chat.listing_id}`); 
                      }}
                    >
                      📍 View Listing
                    </button>
                  </div>
                  
                  {hasUnread && (
                    <div className="unread-indicator">
                      <span className="unread-dot"></span>
                      <span className="unread-count">{chat.unreadCount} new</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Commission Summary - Grouped by listing */}
      <div className="commission-summary">
        <div className="summary-header">
          <h3>💰 Commission Summary</h3>
          <p>2.5% on every successful rental you manage</p>
        </div>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Your Rate</span>
            <span className="summary-value">2.5%</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Potential Earnings</span>
            <span className="summary-value">
              {(() => {
                // Group by listing_id and sum commission once per listing
                const uniqueListings = {};
                chats.forEach(chat => {
                  if (chat.listingStatus !== 'rented' && chat.listingPosterRole !== 'estate-firm') {
                    if (!uniqueListings[chat.listing_id]) {
                      uniqueListings[chat.listing_id] = chat.commission;
                    }
                  }
                });
                const total = Object.values(uniqueListings).reduce((sum, val) => sum + val, 0);
                return formatCurrency(total);
              })()}
            </span>
            <span className="summary-note">From active listings</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Confirmed Earnings</span>
            <span className="summary-value highlight">
              {(() => {
                // Group by listing_id for completed rentals
                const uniqueRented = {};
                chats.forEach(chat => {
                  if (chat.listingStatus === 'rented') {
                    if (!uniqueRented[chat.listing_id]) {
                      uniqueRented[chat.listing_id] = chat.commission;
                    }
                  }
                });
                const total = Object.values(uniqueRented).reduce((sum, val) => sum + val, 0);
                return formatCurrency(total);
              })()}
            </span>
            <span className="summary-note">From completed rentals</span>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="tips-section">
        <h4>💡 Tips for Managers</h4>
        <div className="tips-grid">
          <div className="tip-card">
            <span className="tip-icon">👁️</span>
            <div>
              <strong>Monitor Chats</strong>
              <p>You're notified when tenants contact landlords. Ensure smooth communication.</p>
            </div>
          </div>
          <div className="tip-card">
            <span className="tip-icon">🔍</span>
            <div>
              <strong>Verify Properties</strong>
              <p>Visit properties, take photos, and submit verification reports.</p>
            </div>
          </div>
          <div className="tip-card">
            <span className="tip-icon">💰</span>
            <div>
              <strong>Earn Commission</strong>
              <p>2.5% on every successful rental you manage or verify.</p>
            </div>
          </div>
          <div className="tip-card">
            <span className="tip-icon">⚡</span>
            <div>
              <strong>First Come, First Served</strong>
              <p>Be the first to accept proximity notifications for new listings.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerChats;