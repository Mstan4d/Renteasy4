// src/modules/messaging/pages/ChatListPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import { Shield } from 'lucide-react';
import './ChatListPage.css';

const ChatListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listingsCache, setListingsCache] = useState({});
  const [userProfiles, setUserProfiles] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [isStaff, setIsStaff] = useState(false);
  const [staffRole, setStaffRole] = useState(null);

  // Get user role on mount
  useEffect(() => {
    const getUserRole = async () => {
      if (!user) return;
      try {
        const { data: roleData } = await supabase
          .from('estate_firm_profiles')
          .select('staff_role, is_staff_account')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (roleData) {
          setIsStaff(roleData.is_staff_account || false);
          setStaffRole(roleData.staff_role);
        }
        setUserRole(user.role);
      } catch (err) {
        console.warn('Could not fetch user role:', err);
        setUserRole(user.role);
      }
    };
    getUserRole();
  }, [user]);

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

      // Build base query
      let query = supabase
        .from('chats')
        .select('*')
        .order('updated_at', { ascending: false });

      // Role-based filtering
      if (user.role === 'estate-firm' && isStaff && staffRole === 'associate') {
        // Associates: only see chats from listings they created
        // First get all listings created by this associate
        const { data: myListings } = await supabase
          .from('listings')
          .select('id')
          .eq('created_by_staff_id', user.id);
        
        const myListingIds = myListings?.map(l => l.id) || [];
        
        if (myListingIds.length > 0) {
          query = query.in('listing_id', myListingIds);
        } else {
          // No listings created, return empty
          setChats([]);
          setLoading(false);
          return;
        }
      } else if (user.role === 'estate-firm' && isStaff && staffRole === 'executive') {
        // Executives: see all chats for the firm
        // Get the main firm ID first
        const { data: firmData } = await supabase
          .from('estate_firm_profiles')
          .select('parent_estate_firm_id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        const firmId = firmData?.parent_estate_firm_id;
        
        if (firmId) {
          // Get all listings for this firm
          const { data: firmListings } = await supabase
            .from('listings')
            .select('id')
            .eq('estate_firm_id', firmId);
          
          const firmListingIds = firmListings?.map(l => l.id) || [];
          
          if (firmListingIds.length > 0) {
            query = query.in('listing_id', firmListingIds);
          }
        }
      } else {
        // Principal or non-staff: see all chats where they are participant
        query = query.or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id},monitoring_manager_id.eq.${user.id}`);
      }

      const { data: chatsData, error } = await query;

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
          .select('id, title, images, poster_role, created_by_staff_id')
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
            .select('content, created_at, is_system_message, sender_id')
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
    const content = chat.lastMessage.is_system_message ? 'System message' : chat.lastMessage.content;
    
    if (chat.lastMessage.is_system_message && content.includes('You\'ve contacted')) {
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
      {/* Role Banner for Associates */}
      {user.role === 'estate-firm' && isStaff && staffRole === 'associate' && (
        <div className="role-banner">
          <Shield size={16} />
          <span>Associate View - You can only see conversations from your listings</span>
        </div>
      )}
      
      {user.role === 'estate-firm' && isStaff && staffRole === 'executive' && (
        <div className="role-banner executive">
          <Shield size={16} />
          <span>Executive View - You can see all conversations for your firm</span>
        </div>
      )}

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
            <p>
              {user.role === 'estate-firm' && isStaff && staffRole === 'associate'
                ? 'When tenants contact your listings, conversations will appear here.'
                : 'Start a conversation by contacting a listing'}
            </p>
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