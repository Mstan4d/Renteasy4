// src/modules/manager/pages/ManagerChats.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './ManagerChats.css';

const ManagerChats = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    rented: 0,
    pending: 0
  });

  useEffect(() => {
    if (user) loadChats();
  }, [user]);

  const loadChats = async () => {
  setLoading(true);
  try {
    // Get all listings assigned to this manager
    const { data: myListings, error: listingsError } = await supabase
      .from('listings')
      .select('id, title, price, status, images, address, city, state')
      .eq('assigned_manager_id', user.id);

    if (listingsError) throw listingsError;
    
    const listingIds = myListings?.map(l => l.id) || [];
    
    if (listingIds.length === 0) {
      setChats([]);
      setLoading(false);
      return;
    }
    
    // Get chats for these listings
    const { data: chatsData, error: chatsError } = await supabase
      .from('chats')
      .select(`
        *,
        participant1:participant1_id (id, full_name, name, avatar_url),
        participant2:participant2_id (id, full_name, name, avatar_url)
      `)
      .in('listing_id', listingIds)
      .order('updated_at', { ascending: false });

    if (chatsError) throw chatsError;

    // For each chat, get the last message
    const enrichedChats = await Promise.all(
      (chatsData || []).map(async (chat) => {
        const listing = myListings.find(l => l.id === chat.listing_id);
        
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('content, created_at, is_system_message, sender_id')
          .eq('chat_id', chat.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', chat.id)
          .eq('read_at', null)
          .neq('sender_id', user.id);

        return {
          ...chat,
          listingTitle: listing?.title || 'Unknown Property',
          listingPrice: listing?.price || 0,
          listingStatus: listing?.status || 'unknown',
          listingImage: listing?.images?.[0] || null,
          listingLocation: `${listing?.city || ''} ${listing?.state || ''}`.trim() || 'Location not set',
          lastMessage: lastMsg,
          unreadCount: unreadCount || 0,
          isMonitoring: chat.monitoring_manager_id === user.id
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
    const stats = {
      total: chatsData.length,
      active: chatsData.filter(c => c.state === 'active' && !c.rented && c.isMonitoring).length,
      rented: chatsData.filter(c => c.rented === true).length,
      pending: chatsData.filter(c => c.state === 'pending_availability' && c.isMonitoring).length
    };
    setStats(stats);
  };

  const getFilteredChats = () => {
    switch (filter) {
      case 'active':
        return chats.filter(c => c.state === 'active' && !c.rented);
      case 'rented':
        return chats.filter(c => c.rented === true);
      case 'pending':
        return chats.filter(c => c.state === 'pending_availability');
      default:
        return chats;
    }
  };

  const getStatusInfo = (chat) => {
    if (chat.rented) {
      return { label: 'Rented', class: 'status-rented', icon: '✅' };
    }
    switch (chat.state) {
      case 'active':
        return { label: 'Active', class: 'status-active', icon: '💬' };
      case 'pending_availability':
        return { label: 'Awaiting Response', class: 'status-pending', icon: '⏳' };
      default:
        return { label: chat.state || 'Unknown', class: 'status-default', icon: '📝' };
    }
  };

  const openChat = (chatId) => {
    navigate(`/dashboard/messages/chat/${chatId}`);
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

  if (loading) {
    return (
      <div className="manager-chats">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manager-chats">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Chat Monitoring</h1>
          <p>Manage conversations and track commission opportunities</p>
        </div>
        <button className="btn-outline" onClick={() => navigate('/dashboard/manager')}>
          Back to Dashboard
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className={`stat-card ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          <div className="stat-icon">💬</div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Chats</div>
          </div>
        </div>
        <div className={`stat-card ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>
          <div className="stat-icon">🟢</div>
          <div className="stat-info">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Active</div>
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
          All
        </button>
        <button className={`filter-tab ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>
          Active
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
        {getFilteredChats().length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {filter === 'all' ? '💬' : filter === 'active' ? '🔍' : filter === 'rented' ? '✅' : '⏳'}
            </div>
            <h3>No {filter} chats found</h3>
            <p>
              {filter === 'all' ? 'Accept a listing to start managing chats' :
               filter === 'active' ? 'No active chats at the moment' :
               filter === 'rented' ? 'No completed rentals yet' :
               'No pending availability checks'}
            </p>
            {filter !== 'all' && (
              <button className="btn-outline" onClick={() => setFilter('all')}>
                View All Chats
              </button>
            )}
          </div>
        ) : (
          getFilteredChats().map(chat => {
            const status = getStatusInfo(chat);
            const commission = chat.listingPrice * 0.025;
            const hasUnread = chat.unreadCount > 0;
            
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
                    <h4 className="chat-title">{chat.listingTitle}</h4>
                    <div className="chat-badges">
                      <span className={`status-badge ${status.class}`}>
                        {status.icon} {status.label}
                      </span>
                      {chat.isMonitoring && (
                        <span className="monitoring-badge">👁️ Monitoring</span>
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
                    <div className="detail-row">
                      <span className="detail-label">Commission:</span>
                      <span className="detail-value commission">{formatCurrency(commission)}</span>
                      <span className="commission-rate">(2.5%)</span>
                    </div>
                  </div>

                  {/* Last Message Preview */}
                  {chat.lastMessage && (
                    <div className="last-message">
                      <span className="message-preview">
                        {chat.lastMessage.is_system_message ? '🔔 System: ' : '💬 '}
                        {chat.lastMessage.content?.length > 80 
                          ? `${chat.lastMessage.content.substring(0, 80)}...` 
                          : chat.lastMessage.content}
                      </span>
                      <span className="message-time">{formatRelativeTime(chat.lastMessage.created_at)}</span>
                    </div>
                  )}
                </div>

                {/* Right Section - Actions */}
                <div className="chat-actions">
                  <div className="action-buttons">
                    <button className="btn-monitor" onClick={(e) => { e.stopPropagation(); openChat(chat.id); }}>
                      {chat.isMonitoring ? '👁️ Monitor Chat' : '💬 Join Chat'}
                    </button>
                    <button className="btn-view" onClick={(e) => { e.stopPropagation(); navigate(`/listings/${chat.listing_id}`); }}>
                      📍 View Property
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

      {/* Commission Summary */}
      <div className="commission-summary">
        <div className="summary-header">
          <h3>💰 Commission Summary</h3>
        </div>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Your Rate</span>
            <span className="summary-value">2.5%</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Potential Earnings</span>
            <span className="summary-value">
              {formatCurrency(chats.reduce((sum, chat) => sum + (chat.listingPrice * 0.025), 0))}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Confirmed Earnings</span>
            <span className="summary-value highlight">
              {formatCurrency(chats.filter(c => c.rented).reduce((sum, chat) => sum + (chat.listingPrice * 0.025), 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerChats;