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
  const [filter, setFilter] = useState('all'); // all, active, rented, pending
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
      // Get all chats where manager is involved
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select(`
          *,
          listing:listings!listing_id (
            title,
            price,
            status
          ),
          messages:messages!chat_id (
            content,
            created_at,
            is_system
          )
        `)
        .or(`monitoring_manager_id.eq.${user.id},participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (chatsError) throw chatsError;

      // For each chat, get the last message
      const enrichedChats = await Promise.all(
        (chatsData || []).map(async (chat) => {
          // Fetch last message (if not already in messages array)
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('content, created_at, is_system')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Determine chat type
          const isIntermediary = chat.participant1_id && chat.participant2_id && chat.monitoring_manager_id === user.id;
          const chatType = isIntermediary ? 'manager_intermediary' : 'monitoring';

          return {
            ...chat,
            listingTitle: chat.listing?.title || 'Unknown',
            listingPrice: chat.listing?.price || 0,
            listingStatus: chat.listing?.status || 'unknown',
            messages: chat.messages || [],
            lastMessage: lastMsg,
            chatType
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
      active: chatsData.filter(c => c.state === 'active' && !c.rented).length,
      rented: chatsData.filter(c => c.rented === true).length,
      pending: chatsData.filter(c => c.state === 'pending_availability').length
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

  const getChatTypeLabel = (chat) => {
    return chat.chatType === 'manager_intermediary'
      ? { label: 'Intermediary', color: '#0c5460', bgColor: '#d1ecf1', icon: '💬' }
      : { label: 'Monitoring', color: '#721c24', bgColor: '#f8d7da', icon: '👁️' };
  };

  const getStatusLabel = (chat) => {
    if (chat.rented) {
      return { label: 'Rented', color: '#155724', bgColor: '#d4edda', icon: '✅' };
    }
    switch (chat.state) {
      case 'active':
        return { label: 'Active', color: '#004085', bgColor: '#cce5ff', icon: '💬' };
      case 'pending_availability':
        return { label: 'Pending', color: '#856404', bgColor: '#fff3cd', icon: '⏳' };
      default:
        return { label: chat.state, color: '#6c757d', bgColor: '#f8f9fa', icon: '📝' };
    }
  };

  const openChat = (chatId) => {
    navigate(`/dashboard/manager/chat/${chatId}/monitor`);
  };

  const confirmRental = async (chatId) => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    if (!window.confirm('Mark this property as rented and confirm commission payment?')) return;

    try {
      // Update chat state
      const { error: chatError } = await supabase
        .from('chats')
        .update({
          state: 'rented',
          rented: true,
          rented_at: new Date().toISOString()
        })
        .eq('id', chatId);

      if (chatError) throw chatError;

      // Add system message
      const { error: msgError } = await supabase
        .from('messages')
        .insert([{
          chat_id: chatId,
          sender_id: '00000000-0000-0000-0000-000000000000',
          content: `✅ Property marked as rented by manager ${user.name}. Commission confirmed.`,
          is_system: true
        }]);

      if (msgError) throw msgError;

      // Update listing status
      const { error: listingError } = await supabase
        .from('listings')
        .update({ status: 'rented' })
        .eq('id', chat.listing_id);

      if (listingError) throw listingError;

      // Record commission (pending admin approval)
      const rentalAmount = chat.listingPrice || 0;
      const managerShare = rentalAmount * 0.025;
      const referrerShare = rentalAmount * 0.015;
      const platformShare = rentalAmount * 0.035;

      const { error: commError } = await supabase
        .from('commissions')
        .insert([{
          listing_id: chat.listing_id,
          manager_id: user.id,
          rental_amount: rentalAmount,
          manager_share: managerShare,
          referrer_share: referrerShare,
          platform_share: platformShare,
          status: 'pending'
        }]);

      if (commError) throw commError;

      alert(`✅ Rental confirmed! Your commission: ₦${managerShare.toLocaleString()}`);
      loadChats(); // refresh
    } catch (error) {
      console.error('Error confirming rental:', error);
      alert('Failed to confirm rental.');
    }
  };

  const verifyProperty = async (chatId) => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    if (!window.confirm('Verify this property after onsite inspection?')) return;

    try {
      // Update listing as verified
      const { error: listingError } = await supabase
        .from('listings')
        .update({
          verified: true,
          verified_by: user.id,
          verification_date: new Date().toISOString(),
          permanent_manager: true,
          managed_by: user.id
        })
        .eq('id', chat.listing_id);

      if (listingError) throw listingError;

      // Optionally update chat to reflect permanent assignment
      const { error: chatError } = await supabase
        .from('chats')
        .update({ permanent_assignment: true })
        .eq('id', chatId);

      if (chatError) throw chatError;

      // Add system message
      await supabase.from('messages').insert([{
        chat_id: chatId,
        sender_id: '00000000-0000-0000-0000-000000000000',
        content: `✅ Property verified on-site by manager ${user.name}. Permanent assignment confirmed.`,
        is_system: true
      }]);

      alert('✅ Property verified! You are now permanently assigned.');
      loadChats();
    } catch (error) {
      console.error('Error verifying property:', error);
      alert('Failed to verify property.');
    }
  };

  if (loading) {
    return <div className="loading">Loading chats...</div>;
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
            const chatType = getChatTypeLabel(chat);
            const status = getStatusLabel(chat);
            const messagesCount = chat.messages?.length || 0;
            const lastMessage = chat.lastMessage;
            const isPermanent = chat.permanent_assignment;

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
                          {new Date(lastMessage.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="chat-body">
                  {lastMessage && (
                    <div className="last-message">
                      <span className="message-preview">
                        {lastMessage.content.length > 100
                          ? lastMessage.content.substring(0, 100) + '...'
                          : lastMessage.content}
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
                    onClick={() => navigate(`/listings/${chat.listing_id}`)}
                  >
                    View Property
                  </button>
                </div>
              </div>
            );
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
  );
};

export default ManagerChats;