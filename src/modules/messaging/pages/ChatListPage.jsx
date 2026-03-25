// src/modules/messaging/pages/ChatListPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import './ChatListPage.css';

const ChatListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listingsCache, setListingsCache] = useState({});
  const [userProfiles, setUserProfiles] = useState({});

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

      // Fetch chats where user is participant1, participant2, or monitoring_manager
      const { data: chatsData, error } = await supabase
        .from('chats')
        .select('*')
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id},monitoring_manager_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (!chatsData || chatsData.length === 0) {
        setChats([]);
        setLoading(false);
        return;
      }

      // Get unique listing IDs
      const listingIds = [...new Set(chatsData.map(c => c.listing_id).filter(Boolean))];

      // Fetch all relevant listings
      if (listingIds.length > 0) {
        const { data: listingsData, error: listingsError } = await supabase
          .from('listings')
          .select('id, title, images, poster_role')
          .in('id', listingIds);

        if (!listingsError && listingsData) {
          const cache = {};
          listingsData.forEach(l => { cache[l.id] = l; });
          setListingsCache(cache);
        }
      }

      // Get all participant IDs
      const participantIds = new Set();
      chatsData.forEach(chat => {
        if (chat.participant1_id) participantIds.add(chat.participant1_id);
        if (chat.participant2_id) participantIds.add(chat.participant2_id);
        if (chat.monitoring_manager_id) participantIds.add(chat.monitoring_manager_id);
      });

      // Fetch participant profiles
      if (participantIds.size > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, role, avatar_url')
          .in('id', Array.from(participantIds));

        if (!profilesError && profiles) {
          const profileMap = {};
          profiles.forEach(p => { profileMap[p.id] = p; });
          setUserProfiles(profileMap);
        }
      }

      // For each chat, fetch the last message
      const chatsWithLastMsg = await Promise.all(
        chatsData.map(async (chat) => {
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('content, created_at, is_system, sender_id')
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
    return listingsCache[chat.listing_id]?.title || 'Unknown Listing';
  };

  const getOtherParticipantName = (chat) => {
    // Determine who the other participant is (not the current user)
    if (chat.participant1_id === user.id) {
      const other = userProfiles[chat.participant2_id];
      return other?.full_name || 'User';
    }
    if (chat.participant2_id === user.id) {
      const other = userProfiles[chat.participant1_id];
      return other?.full_name || 'User';
    }
    return 'System';
  };

 const getChatPreview = (chat) => {
  if (!chat.lastMessage) return 'No messages yet';
  const isOwn = chat.lastMessage.sender_id === user.id;
  const content = chat.lastMessage.is_system ? 'System message' : chat.lastMessage.content;
  
  // For system messages, customize the preview
  if (chat.lastMessage.is_system && content.includes('You\'ve contacted')) {
    if (chat.participant2_id === user.id) {
      return 'A tenant has contacted you';
    }
    return content;
  }
  
  const sender = isOwn ? 'You: ' : `${getOtherParticipantName(chat)}: `;
  return `${sender}${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`;
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

  const getChatRoleIcon = (chat) => {
    const listing = listingsCache[chat.listing_id];
    if (listing?.poster_role === 'estate-firm') return '🏢';
    if (listing?.poster_role === 'landlord') return '🏠';
    if (listing?.poster_role === 'tenant') return '👤';
    if (chat.monitoring_manager_id === user.id) return '👨‍💼';
    return '💬';
  };

 if (loading) {
  return <RentEasyLoader message="Loading Messages..." fullScreen />;
}

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
            <p>Start a conversation by contacting a listing</p>
            <button onClick={() => navigate('/listings')} className="btn primary">
              Browse Listings to Start Chat
            </button>
          </div>
        ) : (
          chats.map(chat => {
            const lastMsgTime = chat.lastMessage?.created_at ? formatDate(chat.lastMessage.created_at) : '';
            const listing = listingsCache[chat.listing_id];
            
            return (
              <div 
                key={chat.id} 
                className="chat-item"
                onClick={() => navigate(`/dashboard/messages/chat/${chat.id}`)}
              >
                <div className="chat-item-header">
                  <div className="chat-icon">{getChatRoleIcon(chat)}</div>
                  <div className="chat-info">
                    <h4>{getChatTitle(chat)}</h4>
                    <p className="chat-preview">{getChatPreview(chat)}</p>
                  </div>
                  <span className="chat-time">{lastMsgTime}</span>
                </div>
                <div className="chat-meta">
                  <span className={`status-badge status-${chat.state}`}>
                    {chat.state?.replace('_', ' ') || 'active'}
                  </span>
                  <span className="chat-with">With: {getOtherParticipantName(chat)}</span>
                  {chat.estate_firm_listing && <span className="tag-estate">🏢 No Commission</span>}
                  {chat.commission_applied && !chat.estate_firm_listing && <span className="tag-commission">💰 7.5% Commission</span>}
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