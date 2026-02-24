// src/modules/messaging/pages/ChatListPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './Messages.css';

const ChatListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listingsCache, setListingsCache] = useState({}); // cache listing titles

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadChats();
  }, [user]);

  const loadChats = async () => {
    try {
      setLoading(true);

      // Fetch chats where user is a participant
      // We'll use the participants JSONB column to check
      const { data: chatsData, error } = await supabase
        .from('chats')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Filter client-side: only chats where user is in participants.all_participants
      // Alternatively, you can use a Postgres function, but this is simpler for now.
      const userChats = chatsData.filter(chat => {
        const participants = chat.participants || {};
        const allParticipants = participants.all_participants || [];
        return allParticipants.includes(user.id);
      });

      // Get unique listing IDs
      const listingIds = [...new Set(userChats.map(c => c.listing_id))];

      // Fetch all relevant listings
      if (listingIds.length > 0) {
        const { data: listingsData, error: listingsError } = await supabase
          .from('listings')
          .select('id, title')
          .in('id', listingIds);

        if (listingsError) throw listingsError;

        const cache = {};
        listingsData.forEach(l => { cache[l.id] = l.title; });
        setListingsCache(cache);
      }

      // For each chat, fetch the last message
      const chatsWithLastMsg = await Promise.all(
        userChats.map(async (chat) => {
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('content, created_at, is_system')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...chat,
            lastMessage: lastMsg || null,
          };
        })
      );

      setChats(chatsWithLastMsg);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChatTitle = (chat) => {
    return listingsCache[chat.listing_id] || 'Unknown Listing';
  };

  const getLastMessageText = (chat) => {
    if (!chat.lastMessage) return 'No messages yet';
    if (chat.lastMessage.is_system) return 'System message';
    return chat.lastMessage.content;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getChatParticipantInfo = (chat) => {
    const participants = chat.participants || {};
    if (participants.landlord) return { role: 'Landlord', icon: '🏠' };
    if (participants.estateFirm) return { role: 'Estate Firm', icon: '🏢' };
    if (participants.manager) return { role: 'Manager', icon: '👨‍💼' };
    if (participants.tenant && participants.incomingTenant) return { role: 'Tenant Chat', icon: '👤' };
    return { role: 'Chat', icon: '💬' };
  };

  if (loading) return <div className="messages-loading">Loading chats...</div>;

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
            const participantInfo = getChatParticipantInfo(chat);
            const lastMsgTime = chat.lastMessage?.created_at ? formatDate(chat.lastMessage.created_at) : '';
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
                    <p className="chat-preview">{getLastMessageText(chat)}</p>
                  </div>
                  <span className="chat-time">{lastMsgTime}</span>
                </div>
                <div className="chat-meta">
                  <span className={`status-badge status-${chat.state}`}>
                    {chat.state?.replace('_', ' ') || 'unknown'}
                  </span>
                  <small>{participantInfo.role}</small>
                  {chat.estate_firm_listing && <small>🏢 No Commission</small>}
                  {chat.commission_applied && <small>💰 7.5% Commission</small>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatListPage;