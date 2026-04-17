// src/shared/context/WebSocketContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext(null);

// Only one declaration, with error checking
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(true); // Mock: always connected
  const [notifications, setNotifications] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});

  // Mock: Simulate receiving messages
  const simulateIncomingMessage = useCallback((conversationId) => {
    const mockMessages = [
      "Thanks for your message! I'll get back to you shortly.",
      "Got it! I'll check the availability.",
      "Received! I'll send you more details.",
      "Can you clarify your question?",
      "The property is available for viewing."
    ];
    
    const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)];
    
    setTimeout(() => {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'message',
        message: `New message in conversation ${conversationId}`,
        data: {
          id: Date.now().toString(),
          text: randomMessage,
          senderId: 'other_user',
          senderName: 'Property Owner',
          conversationId,
          timestamp: new Date().toISOString(),
          type: 'text',
          read: false
        },
        timestamp: new Date(),
      }]);
    }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds
  }, []);

  const sendMessage = (messageData) => {
    console.log('📤 Mock WebSocket: Sending message', messageData);
    
    // Auto-reply simulation
    if (messageData.conversationId) {
      simulateIncomingMessage(messageData.conversationId);
    }
    
    return true;
  };

  const markAsRead = (messageId) => {
    console.log('✅ Mock WebSocket: Marking as read', messageId);
  };

  const sendTyping = (conversationId, isTyping) => {
    console.log('⌨️ Mock WebSocket: Typing', { conversationId, isTyping });
    
    setTypingUsers(prev => ({
      ...prev,
      [conversationId]: isTyping ? user?.id : null
    }));

    // Clear typing after 3 seconds
    if (isTyping) {
      setTimeout(() => {
        setTypingUsers(prev => ({
          ...prev,
          [conversationId]: null
        }));
      }, 3000);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const simulateNotification = (type, data) => {
    const notificationsMap = {
      message: {
        type: 'message',
        message: 'New message received',
        data
      },
      verification: {
        type: 'verification',
        message: 'Listing verification required',
        data
      },
      payment: {
        type: 'payment',
        message: 'Payment received',
        data
      }
    };

    const notification = notificationsMap[type] || {
      type: 'info',
      message: 'New notification',
      data
    };

    setNotifications(prev => [...prev, {
      id: Date.now(),
      ...notification,
      timestamp: new Date(),
    }]);
  };

  const value = {
    socket: null,
    isConnected,
    sendMessage,
    markAsRead,
    sendTyping,
    notifications,
    clearNotifications,
    simulateNotification, // Extra utility for testing
    typingUsers,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};