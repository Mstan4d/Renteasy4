import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import ProviderPageTemplate from '../templates/ProviderPageTemplate';
import { FaSearch, FaPaperPlane, FaPaperclip, FaImage, FaSmile, FaVideo, FaPhone } from 'react-icons/fa';
import './ProviderMessages.css'; // external CSS

const ProviderMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const subscriptionRef = useRef(null);

  // Fetch conversations (chats) for the current user
  useEffect(() => {
    if (!user?.id) return;
    fetchConversations();
    // Cleanup subscription on unmount
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      // Get chats where current user is a participant
      const { data: chats, error } = await supabase
        .from('chats')
        .select('*')
        .contains('participant_ids', [user.id])
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // For each chat, fetch the other participant's profile and last message
      const conversationsData = await Promise.all(
        chats.map(async (chat) => {
          // Get other participant ID (assuming 2 participants)
          const otherParticipantId = chat.participant_ids.find(id => id !== user.id);
          let profile = { full_name: 'Unknown', role: 'user', avatar_url: null };
          if (otherParticipantId) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name, role, avatar_url')
              .eq('id', otherParticipantId)
              .single();
            profile = profileData || profile;
          }

          // Get last message
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Count unread messages (sent by other participant, not read)
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('chat_id', chat.id)
            .eq('sender_id', otherParticipantId)
            .is('read_at', null);

          return {
            id: chat.id,
            name: profile.full_name,
            avatar: profile.avatar_url ? null : profile.full_name?.charAt(0) || '?',
            type: profile.role || 'user',
            lastMessage: lastMsg?.content || 'No messages yet',
            time: formatTime(lastMsg?.created_at),
            unread: unreadCount || 0,
            otherParticipantId,
          };
        })
      );

      setConversations(conversationsData);
      if (conversationsData.length > 0 && !activeChat) {
        setActiveChat(conversationsData[0].id);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Format messages
      const formattedMessages = data.map(msg => ({
        id: msg.id,
        sender: msg.sender_id === user.id ? 'provider' : 'client',
        text: msg.content,
        time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));

      setMessages(formattedMessages);

      // Mark messages as read if they are from other participant
      const unreadMessages = data.filter(msg => msg.sender_id !== user.id && !msg.read_at);
      if (unreadMessages.length > 0) {
        const unreadIds = unreadMessages.map(msg => msg.id);
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', unreadIds);

        // Update unread count in conversation list
        setConversations(prev =>
          prev.map(conv =>
            conv.id === chatId ? { ...conv, unread: 0 } : conv
          )
        );
      }

      // Set up real-time subscription for new messages in this chat
      subscribeToMessages(chatId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const subscribeToMessages = (chatId) => {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }

    const subscription = supabase
      .channel(`chat-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const newMsg = payload.new;
          if (newMsg.sender_id !== user.id) {
            // Add to messages
            setMessages(prev => [
              ...prev,
              {
                id: newMsg.id,
                sender: 'client',
                text: newMsg.content,
                time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
            // Update conversation last message and unread count
            setConversations(prev =>
              prev.map(conv =>
                conv.id === chatId
                  ? {
                      ...conv,
                      lastMessage: newMsg.content,
                      time: formatTime(newMsg.created_at),
                      unread: conv.unread + 1,
                    }
                  : conv
              )
            );
          }
        }
      )
      .subscribe();

    subscriptionRef.current = subscription;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    const chat = conversations.find(c => c.id === activeChat);
    if (!chat) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: activeChat,
          sender_id: user.id,
          content: newMessage.trim(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update messages state
      const newMsg = {
        id: data.id,
        sender: 'provider',
        text: data.content,
        time: new Date(data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, newMsg]);

      // Update conversation last message and time
      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeChat
            ? {
                ...conv,
                lastMessage: data.content,
                time: formatTime(data.created_at),
              }
            : conv
        )
      );

      // Update chat's last_message_at
      await supabase
        .from('chats')
        .update({ last_message_at: data.created_at })
        .eq('id', activeChat);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getAvatarColor = (type) => {
    switch(type) {
      case 'tenant': return '#2196f3';
      case 'landlord': return '#4caf50';
      case 'estate-firm': return '#9c27b0';
      case 'manager': return '#ff9800';
      default: return '#757575';
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'tenant': return 'Tenant';
      case 'landlord': return 'Landlord';
      case 'estate-firm': return 'Estate Firm';
      case 'manager': return 'Manager';
      default: return 'User';
    }
  };

  // Filter conversations by search term
  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeConversation = conversations.find(c => c.id === activeChat);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat);
    }
  }, [activeChat]);

  return (
    <ProviderPageTemplate
      title="Messages"
      subtitle="Communicate with clients and partners"
    >
      <div className="messages-container">
        {/* Conversations Sidebar */}
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <div style={{ position: 'relative', width: '100%' }}>
              <FaSearch style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#666'
              }} />
              <input
                type="text"
                placeholder="Search conversations..."
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="conversations-list">
            {filteredConversations.length === 0 ? (
              <div className="empty-conversations">
                {loading ? 'Loading...' : 'No conversations yet'}
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`conversation-item ${activeChat === conversation.id ? 'active' : ''}`}
                  onClick={() => setActiveChat(conversation.id)}
                >
                  <div className="conversation-avatar" style={{ background: getAvatarColor(conversation.type) }}>
                    {conversation.avatar || conversation.name.charAt(0)}
                  </div>
                  
                  <div className="conversation-info">
                    <div className="conversation-header">
                      <h4 style={{ margin: 0 }}>{conversation.name}</h4>
                      <span className="conversation-time">{conversation.time}</span>
                    </div>
                    
                    <div className="conversation-preview">
                      <p style={{ margin: 0, color: '#666' }}>{conversation.lastMessage}</p>
                      {conversation.unread > 0 && (
                        <span className="unread-badge">{conversation.unread}</span>
                      )}
                    </div>
                    
                    <div className="conversation-type">
                      <span style={{
                        fontSize: '0.8rem',
                        color: getAvatarColor(conversation.type),
                        fontWeight: '600'
                      }}>
                        {getTypeLabel(conversation.type)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="chat-avatar" style={{ background: getAvatarColor(activeConversation.type) }}>
                    {activeConversation.avatar || activeConversation.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ margin: 0 }}>{activeConversation.name}</h3>
                    <p style={{ margin: '0.2rem 0 0', color: '#666', fontSize: '0.9rem' }}>
                      {getTypeLabel(activeConversation.type)} • Online
                    </p>
                  </div>
                </div>
                
                <div className="chat-actions">
                  <button className="chat-action-btn" title="Voice Call">
                    <FaPhone />
                  </button>
                  <button className="chat-action-btn" title="Video Call">
                    <FaVideo />
                  </button>
                </div>
              </div>

              {/* Messages Container */}
              <div className="messages-list">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.sender === 'provider' ? 'sent' : 'received'}`}
                  >
                    <div className="message-bubble">
                      <p style={{ margin: 0 }}>{message.text}</p>
                      <span className="message-time">{message.time}</span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="message-input-area">
                <div className="input-actions">
                  <button className="input-action-btn">
                    <FaPaperclip />
                  </button>
                  <button className="input-action-btn">
                    <FaImage />
                  </button>
                  <button className="input-action-btn">
                    <FaSmile />
                  </button>
                </div>
                
                <textarea
                  className="message-input"
                  placeholder="Type your message here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows="1"
                />
                
                <button 
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <FaPaperPlane />
                </button>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="empty-state">
                <div className="empty-state-icon">💬</div>
                <h3>Select a conversation</h3>
                <p>Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProviderPageTemplate>
  );
};

export default ProviderMessages;