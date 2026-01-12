import React, { useState, useEffect } from 'react';
import ProviderPageTemplate from '../templates/ProviderPageTemplate';
import { FaSearch, FaPaperPlane, FaPaperclip, FaImage, FaSmile, FaVideo, FaPhone } from 'react-icons/fa';

const ProviderMessages = () => {
  const [conversations, setConversations] = useState([
    { id: 1, name: 'John Doe', lastMessage: 'Can you send me a quote?', time: '10:30 AM', unread: 2, avatar: 'JD', type: 'tenant' },
    { id: 2, name: 'Jane Smith', lastMessage: 'Thanks for the great service!', time: 'Yesterday', unread: 0, avatar: 'JS', type: 'landlord' },
    { id: 3, name: 'Mike Johnson', lastMessage: 'Are you available tomorrow?', time: '2 days ago', unread: 1, avatar: 'MJ', type: 'tenant' },
    { id: 4, name: 'Sarah Williams', lastMessage: 'I need cleaning service', time: '3 days ago', unread: 0, avatar: 'SW', type: 'estate-firm' },
    { id: 5, name: 'David Brown', lastMessage: 'Payment sent', time: '1 week ago', unread: 0, avatar: 'DB', type: 'landlord' },
  ]);

  const [activeChat, setActiveChat] = useState(1);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'tenant', text: 'Hello, I need cleaning service for my 3-bedroom apartment', time: '10:00 AM' },
    { id: 2, sender: 'provider', text: 'Hi John! I\'d be happy to help. What date do you need the service?', time: '10:05 AM' },
    { id: 3, sender: 'tenant', text: 'This Friday, January 15th', time: '10:10 AM' },
    { id: 4, sender: 'tenant', text: 'Can you send me a quote?', time: '10:30 AM' },
  ]);

  const [newMessage, setNewMessage] = useState('');

  const activeConversation = conversations.find(c => c.id === activeChat);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const newMsg = {
      id: messages.length + 1,
      sender: 'provider',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
    
    // Update conversation last message
    setConversations(prev => prev.map(conv => 
      conv.id === activeChat 
        ? { ...conv, lastMessage: newMessage, time: 'Just now', unread: 0 }
        : conv
    ));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
              />
            </div>
          </div>

          <div className="conversations-list">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`conversation-item ${activeChat === conversation.id ? 'active' : ''}`}
                onClick={() => setActiveChat(conversation.id)}
              >
                <div className="conversation-avatar" style={{ background: getAvatarColor(conversation.type) }}>
                  {conversation.avatar}
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
            ))}
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
                    {activeConversation.avatar}
                  </div>
                  <div>
                    <h3 style={{ margin: 0 }}>{activeConversation.name}</h3>
                    <p style={{ margin: '0.2rem 0 0', color: '#666', fontSize: '0.9rem' }}>
                      {getTypeLabel(activeConversation.type)} • Last seen recently
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

      <style jsx>{`
        .messages-container {
          display: grid;
          grid-template-columns: 350px 1fr;
          height: calc(100vh - 200px);
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .conversations-sidebar {
          border-right: 1px solid #e0e0e0;
          display: flex;
          flex-direction: column;
        }
        
        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .conversations-list {
          flex: 1;
          overflow-y: auto;
        }
        
        .conversation-item {
          display: flex;
          padding: 1rem 1.5rem;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .conversation-item:hover {
          background: #f8f9fa;
        }
        
        .conversation-item.active {
          background: #e8f0fe;
          border-left: 4px solid #1a237e;
        }
        
        .conversation-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1.2rem;
          flex-shrink: 0;
        }
        
        .conversation-info {
          flex: 1;
          min-width: 0;
        }
        
        .conversation-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.3rem;
        }
        
        .conversation-time {
          font-size: 0.8rem;
          color: #666;
          white-space: nowrap;
        }
        
        .conversation-preview {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.3rem;
        }
        
        .conversation-preview p {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .unread-badge {
          background: #1a237e;
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 600;
          flex-shrink: 0;
        }
        
        .chat-area {
          display: flex;
          flex-direction: column;
        }
        
        .chat-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          z-index: 10;
        }
        
        .chat-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1.2rem;
        }
        
        .chat-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .chat-action-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid #ddd;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .chat-action-btn:hover {
          background: #f8f9fa;
          border-color: #1a237e;
          color: #1a237e;
        }
        
        .messages-list {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: #f8f9fa;
        }
        
        .message {
          display: flex;
        }
        
        .message.sent {
          justify-content: flex-end;
        }
        
        .message.received {
          justify-content: flex-start;
        }
        
        .message-bubble {
          max-width: 70%;
          padding: 0.8rem 1rem;
          border-radius: 18px;
          position: relative;
        }
        
        .message.sent .message-bubble {
          background: #1a237e;
          color: white;
          border-bottom-right-radius: 4px;
        }
        
        .message.received .message-bubble {
          background: white;
          color: #333;
          border: 1px solid #e0e0e0;
          border-bottom-left-radius: 4px;
        }
        
        .message-time {
          display: block;
          font-size: 0.7rem;
          opacity: 0.7;
          margin-top: 0.3rem;
          text-align: right;
        }
        
        .message-input-area {
          padding: 1rem 1.5rem;
          border-top: 1px solid #e0e0e0;
          display: flex;
          align-items: flex-end;
          gap: 1rem;
          background: white;
        }
        
        .input-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .input-action-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid #ddd;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .input-action-btn:hover {
          background: #f8f9fa;
          border-color: #1a237e;
          color: #1a237e;
        }
        
        .message-input {
          flex: 1;
          border: 1px solid #ddd;
          border-radius: 24px;
          padding: 0.8rem 1rem;
          font-size: 1rem;
          resize: none;
          max-height: 120px;
          min-height: 40px;
          outline: none;
          transition: all 0.3s ease;
        }
        
        .message-input:focus {
          border-color: #1a237e;
          box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
        }
        
        .send-button {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #1a237e;
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .send-button:hover:not(:disabled) {
          background: #283593;
          transform: scale(1.05);
        }
        
        .send-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        .no-chat-selected {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: #f8f9fa;
        }
        
        @media (max-width: 992px) {
          .messages-container {
            grid-template-columns: 1fr;
          }
          
          .conversations-sidebar {
            display: none;
          }
        }
        
        @media (max-width: 768px) {
          .chat-header {
            padding: 1rem;
          }
          
          .message-input-area {
            padding: 1rem;
          }
          
          .message-bubble {
            max-width: 85%;
          }
        }
      `}</style>
    </ProviderPageTemplate>
  );
};

export default ProviderMessages;