// src/modules/messaging/pages/ChatListPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import { messagesService } from '../../../shared/services/messagesService';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import { Shield, MessageSquare, Home, Users, Building, ChevronRight } from 'lucide-react';
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

  // Load chats on mount and set up real-time subscription
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadChats();
    
    // Subscribe to new messages for real-time updates
    const subscription = supabase
      .channel('chat-list-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => loadChats()
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chats'
        },
        () => loadChats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const loadChats = async () => {
    try {
      setLoading(true);

      // Role‑based query conditions
      let condition;
      if (userRole === 'manager') {
        // Managers: see chats they monitor OR they participate in
        condition = `monitoring_manager_id.eq.${user.id},participant1_id.eq.${user.id},participant2_id.eq.${user.id}`;
      } else {
        // Tenants, landlords, estate‑firm, etc.: only chats they directly participate in
        condition = `participant1_id.eq.${user.id},participant2_id.eq.${user.id}`;
      }

      const { data: chatsData, error } = await supabase
        .from('chats')
        .select('*')
        .or(condition)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (!chatsData || chatsData.length === 0) {
        setChats([]);
        setLoading(false);
        return;
      }

      // Get all unique participant IDs from both sides
      const participantIds = new Set();
      chatsData.forEach(chat => {
        if (chat.participant1_id) participantIds.add(chat.participant1_id);
        if (chat.participant2_id) participantIds.add(chat.participant2_id);
      });

      // Fetch profiles for all participants
      let profilesMap = {};
      if (participantIds.size > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, name, avatar_url, role')
          .in('id', Array.from(participantIds));
        if (!profilesError && profiles) {
          profilesMap = profiles.reduce((map, p) => {
            map[p.id] = p;
            return map;
          }, {});
        }
      }

      // Get listing IDs and fetch listings
      const listingIds = [...new Set(chatsData.map(c => c.listing_id).filter(Boolean))];
      let listingsMap = {};
      if (listingIds.length > 0) {
        const { data: listingsData, error: listingsError } = await supabase
          .from('listings')
          .select('id, title, images, poster_role, price, status, address, city, state, created_by_staff_id')
          .in('id', listingIds);
        if (!listingsError && listingsData) {
          listingsMap = listingsData.reduce((map, l) => {
            map[l.id] = l;
            return map;
          }, {});
        }
      }

      // Get last message for each chat
      const chatsWithLastMsg = await Promise.all(
        chatsData.map(async (chat) => {
          const lastMsg = await messagesService.getChatMessages(chat.id).then(msgs => msgs[msgs.length - 1]);
          return {
            ...chat,
            listing: listingsMap[chat.listing_id] || null,
            participant1: profilesMap[chat.participant1_id] || null,
            participant2: profilesMap[chat.participant2_id] || null,
            lastMessage: lastMsg || null,
            lastMessageTime: lastMsg?.created_at || chat.updated_at
          };
        })
      );

      // Sort by last message time
      chatsWithLastMsg.sort((a, b) => 
        new Date(b.lastMessageTime || b.updated_at) - new Date(a.lastMessageTime || a.updated_at)
      );

      setChats(chatsWithLastMsg);
      setListingsCache(listingsMap);
      setUserProfiles(profilesMap);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChatTitle = (chat) => chat.listing?.title || 'Unknown Property';
  const getOtherParticipant = (chat) => {
    if (chat.participant1_id === user.id) return chat.participant2;
    if (chat.participant2_id === user.id) return chat.participant1;
    return null;
  };
  const getOtherParticipantName = (chat) => {
    const other = getOtherParticipant(chat);
    return other?.full_name || other?.name || 'User';
  };
  const getOtherParticipantRole = (chat) => {
    const other = getOtherParticipant(chat);
    return other?.role || 'User';
  };
  const getChatPreview = (chat) => {
    if (!chat.lastMessage) return 'No messages yet';
    const isOwn = chat.lastMessage.sender_id === user.id;
    const content = chat.lastMessage.is_system_message ? '🔔 System message' : chat.lastMessage.content;
    const sender = isOwn ? 'You: ' : `${getOtherParticipantName(chat)}: `;
    return `${sender}${content.substring(0, 60)}${content.length > 60 ? '...' : ''}`;
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };
  const getChatIcon = (chat) => {
    const listing = chat.listing;
    if (listing?.poster_role === 'estate-firm') return '🏢';
    if (listing?.poster_role === 'landlord') return '🏠';
    if (listing?.poster_role === 'tenant') return '👤';
    if (chat.monitoring_manager_id === user.id) return '👨‍💼';
    return '💬';
  };
  const getUnreadCount = (chat) => chat.unread_count || 0;
  const canAccessChat = (chat) => {
    // Admin can access all
    if (user.role === 'admin' || user.role === 'super-admin') return true;
    // Associate staff: only chats from their listings
    if (user.role === 'estate-firm' && isStaff && staffRole === 'associate') {
      const listing = chat.listing;
      return listing?.created_by_staff_id === user.id;
    }
    // Executive staff: all firm chats
    if (user.role === 'estate-firm' && isStaff && staffRole === 'executive') return true;
    // Regular users: already filtered by the OR condition, but we keep this for safety
    return true;
  };

  if (loading) return <RentEasyLoader message="Loading conversations..." fullScreen />;

  return (
    <div className="chat-list-page">
      {/* Role Banner for Staff */}
      {user.role === 'estate-firm' && isStaff && staffRole === 'associate' && (
        <div className="role-banner"><Shield size={16} /><span>Associate View - You can only see conversations from listings you created</span></div>
      )}
      {user.role === 'estate-firm' && isStaff && staffRole === 'executive' && (
        <div className="role-banner executive"><Shield size={16} /><span>Executive View - You can see all conversations for your firm</span></div>
      )}

      <header className="chat-list-header">
        <div className="header-content">
          <h1><MessageSquare size={24} /> Messages</h1>
          <p>Manage your conversations and inquiries</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/listings')}>Browse Listings</button>
      </header>

      <div className="chat-list-container">
        {chats.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h3>No conversations yet</h3>
            <p>{user.role === 'estate-firm' && isStaff && staffRole === 'associate'
              ? 'When tenants contact your listings, conversations will appear here.'
              : 'Start a conversation by contacting a listing'}</p>
            <button onClick={() => navigate('/listings')} className="btn btn-primary">Browse Listings to Start Chat</button>
          </div>
        ) : (
          <div className="chat-list">
            {chats.map(chat => {
              const unreadCount = getUnreadCount(chat);
              const otherRole = getOtherParticipantRole(chat);
              if (!canAccessChat(chat)) return null;
              return (
                <div
                  key={chat.id}
                  className={`chat-item ${unreadCount > 0 ? 'unread' : ''}`}
                  onClick={() => navigate(`/dashboard/messages/chat/${chat.id}`)}
                >
                  <div className="chat-avatar">
                    <div className="avatar-icon">{getChatIcon(chat)}</div>
                    {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
                  </div>
                  <div className="chat-content">
                    <div className="chat-header">
                      <div className="chat-title-section">
                        <h4 className="chat-title">{getChatTitle(chat)}</h4>
                        <span className={`chat-role-badge ${otherRole.toLowerCase()}`}>{otherRole}</span>
                      </div>
                      <span className="chat-time">{formatDate(chat.lastMessageTime || chat.updated_at)}</span>
                    </div>
                    <div className="chat-preview"><span className="preview-text">{getChatPreview(chat)}</span></div>
                    <div className="chat-meta">
                      <span className="chat-with"><Users size={12} /> With: {getOtherParticipantName(chat)}</span>
                      {chat.listing?.poster_role === 'estate-firm' && <span className="tag-estate">🏢 No Commission</span>}
                      {chat.listing?.poster_role !== 'estate-firm' && chat.listing?.price && <span className="tag-commission">💰 7.5% Commission</span>}
                      {chat.monitoring_manager_id === user.id && <span className="tag-monitoring">👁️ Monitoring</span>}
                    </div>
                  </div>
                  <ChevronRight size={18} className="chevron-icon" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {chats.length > 0 && (
        <div className="chat-stats">
          <div className="stat-item"><span className="stat-value">{chats.length}</span><span className="stat-label">Total Conversations</span></div>
          <div className="stat-item"><span className="stat-value">{chats.filter(c => c.unread_count > 0).length}</span><span className="stat-label">Unread</span></div>
          <div className="stat-item"><span className="stat-value">{chats.filter(c => c.state === 'active').length}</span><span className="stat-label">Active</span></div>
        </div>
      )}
    </div>
  );
};

export default ChatListPage;