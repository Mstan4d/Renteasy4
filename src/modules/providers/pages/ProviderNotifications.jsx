// src/modules/providers/pages/ProviderNotifications.jsx
import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  DollarSign, 
  Calendar, 
  MessageSquare,
  UserPlus,
  Star,
  Clock,
  XCircle,
  Settings,
  Trash2,
  Filter,
  CheckCheck,
  Archive,
  Eye,
  EyeOff,
  Mail,
  Phone,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

const ProviderNotifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'booking',
      title: 'New Booking Request',
      message: 'John D. requested "Professional Cleaning Service" for tomorrow at 2:00 PM',
      timestamp: '2024-01-15T10:30:00Z',
      read: false,
      priority: 'high',
      actionUrl: '/dashboard/provider/bookings/123',
      icon: <Calendar size={20} />,
      color: '#2563eb'
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment Received',
      message: '₦45,000 payment for cleaning service has been credited to your wallet',
      timestamp: '2024-01-15T09:15:00Z',
      read: true,
      priority: 'high',
      actionUrl: '/dashboard/provider/transactions',
      icon: <DollarSign size={20} />,
      color: '#059669'
    },
    {
      id: 3,
      type: 'review',
      title: 'New Review Received',
      message: 'Sarah M. gave you a 5-star rating for your painting service',
      timestamp: '2024-01-14T16:45:00Z',
      read: false,
      priority: 'medium',
      actionUrl: '/dashboard/provider/reviews',
      icon: <Star size={20} />,
      color: '#d97706'
    },
    {
      id: 4,
      type: 'message',
      title: 'New Message',
      message: 'Client: "Can we reschedule the service to Friday?"',
      timestamp: '2024-01-14T14:20:00Z',
      read: true,
      priority: 'medium',
      actionUrl: '/dashboard/provider/messages',
      icon: <MessageSquare size={20} />,
      color: '#7c3aed'
    },
    {
      id: 5,
      type: 'verification',
      title: 'Verification Update',
      message: 'Your KYC verification has been approved by the admin team',
      timestamp: '2024-01-14T11:10:00Z',
      read: true,
      priority: 'high',
      actionUrl: '/dashboard/provider/verification-status',
      icon: <CheckCircle size={20} />,
      color: '#059669'
    },
    {
      id: 6,
      type: 'subscription',
      title: 'Subscription Reminder',
      message: 'Your marketplace subscription will expire in 3 days',
      timestamp: '2024-01-13T18:30:00Z',
      read: false,
      priority: 'high',
      actionUrl: '/dashboard/provider/subscription',
      icon: <AlertCircle size={20} />,
      color: '#dc2626'
    },
    {
      id: 7,
      type: 'referral',
      title: 'Referral Bonus',
      message: 'You earned ₦5,000 for referring a new provider to RentEasy',
      timestamp: '2024-01-13T12:45:00Z',
      read: true,
      priority: 'medium',
      actionUrl: '/dashboard/provider/referral',
      icon: <UserPlus size={20} />,
      color: '#8b5cf6'
    },
    {
      id: 8,
      type: 'boost',
      title: 'Boost Performance',
      message: 'Your premium boost generated 42 inquiries this week',
      timestamp: '2024-01-12T15:20:00Z',
      read: true,
      priority: 'low',
      actionUrl: '/dashboard/provider/boost-history',
      icon: <TrendingUp size={20} />,
      color: '#0ea5e9'
    },
    {
      id: 9,
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance on Jan 20th, 2:00 AM - 4:00 AM',
      timestamp: '2024-01-12T10:00:00Z',
      read: true,
      priority: 'low',
      actionUrl: null,
      icon: <Settings size={20} />,
      color: '#6b7280'
    },
    {
      id: 10,
      type: 'booking',
      title: 'Booking Cancelled',
      message: 'The cleaning service scheduled for Jan 16th has been cancelled',
      timestamp: '2024-01-11T19:15:00Z',
      read: true,
      priority: 'medium',
      actionUrl: '/dashboard/provider/bookings',
      icon: <XCircle size={20} />,
      color: '#ef4444'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
    bookingRequests: true,
    payments: true,
    reviews: true,
    messages: true,
    system: true,
    marketing: false
  });

  // Calculate unread count
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Styles object
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '1.5rem'
    },
    header: {
      marginBottom: '2rem'
    },
    titleSection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1.5rem'
    },
    title: {
      fontSize: '1.875rem',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '1rem'
    },
    headerStats: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center'
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: '600'
    },
    unreadBadge: {
      background: '#ef4444',
      color: 'white'
    },
    controls: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      padding: '1rem',
      background: 'white',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb'
    },
    filterButtons: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap'
    },
    filterButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      border: '1px solid #d1d5db',
      background: 'white',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    filterButtonActive: {
      background: '#2563eb',
      color: 'white',
      borderColor: '#2563eb'
    },
    actionButtons: {
      display: 'flex',
      gap: '0.5rem'
    },
    actionButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      border: '1px solid #d1d5db',
      background: 'white',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    notificationsContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    },
    notificationCard: {
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '0.75rem',
      padding: '1.25rem',
      transition: 'all 0.3s ease',
      position: 'relative'
    },
    notificationCardUnread: {
      background: '#f0f9ff',
      borderColor: '#bae6fd'
    },
    notificationHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      marginBottom: '0.75rem'
    },
    notificationIcon: {
      width: '2.5rem',
      height: '2.5rem',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    notificationContent: {
      flex: 1
    },
    notificationTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '0.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    notificationMessage: {
      fontSize: '0.875rem',
      color: '#6b7280',
      lineHeight: '1.5',
      marginBottom: '0.5rem'
    },
    notificationFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '0.75rem',
      paddingTop: '0.75rem',
      borderTop: '1px solid #f3f4f6'
    },
    notificationTime: {
      fontSize: '0.75rem',
      color: '#9ca3af',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    notificationActions: {
      display: 'flex',
      gap: '0.5rem'
    },
    smallButton: {
      padding: '0.25rem 0.75rem',
      fontSize: '0.75rem',
      borderRadius: '0.375rem',
      border: '1px solid #d1d5db',
      background: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    priorityIndicator: {
      width: '0.5rem',
      height: '0.5rem',
      borderRadius: '50%',
      display: 'inline-block',
      marginLeft: '0.5rem'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem',
      background: 'white',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb'
    },
    emptyIcon: {
      margin: '0 auto 1rem',
      color: '#d1d5db'
    },
    settingsModal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      zIndex: 50
    },
    settingsContent: {
      background: 'white',
      borderRadius: '1rem',
      maxWidth: '500px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    settingsHeader: {
      padding: '1.5rem',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    settingsTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#111827'
    },
    settingsBody: {
      padding: '1.5rem'
    },
    settingItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 0',
      borderBottom: '1px solid #f3f4f6'
    },
    settingLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    toggleSwitch: {
      position: 'relative',
      display: 'inline-block',
      width: '3rem',
      height: '1.5rem'
    },
    toggleSlider: {
      position: 'absolute',
      cursor: 'pointer',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#d1d5db',
      transition: '0.4s',
      borderRadius: '1.5rem'
    },
    toggleSliderActive: {
      background: '#2563eb'
    },
    toggleKnob: {
      position: 'absolute',
      height: '1.25rem',
      width: '1.25rem',
      left: '0.125rem',
      bottom: '0.125rem',
      background: 'white',
      transition: '0.4s',
      borderRadius: '50%'
    },
    toggleKnobActive: {
      transform: 'translateX(1.5rem)'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    statCard: {
      background: 'white',
      padding: '1.25rem',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb'
    },
    statContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    statText: {
      display: 'flex',
      flexDirection: 'column'
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '0.25rem'
    },
    statValue: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#111827'
    },
    statIcon: {
      width: '3rem',
      height: '3rem',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  };

  const filters = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'booking', label: 'Bookings', count: notifications.filter(n => n.type === 'booking').length },
    { id: 'payment', label: 'Payments', count: notifications.filter(n => n.type === 'payment').length },
    { id: 'message', label: 'Messages', count: notifications.filter(n => n.type === 'message').length },
    { id: 'system', label: 'System', count: notifications.filter(n => n.type === 'system').length }
  ];

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#6b7280'
    };
    return colors[priority] || colors.low;
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short'
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }
  };

  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
    }
  };

  const getFilteredNotifications = () => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter(n => !n.read);
    return notifications.filter(n => n.type === filter);
  };

  const toggleNotificationSetting = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const filteredNotifications = getFilteredNotifications();

  const notificationStats = {
    total: notifications.length,
    unread: unreadCount,
    today: notifications.filter(n => {
      const date = new Date(n.timestamp);
      const today = new Date();
      return date.toDateString() === today.toDateString();
    }).length,
    highPriority: notifications.filter(n => n.priority === 'high').length
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <div>
            <h1 style={styles.title}>Notifications</h1>
            <p style={styles.subtitle}>
              Stay updated with bookings, payments, messages, and system alerts
            </p>
          </div>
          
          <div style={styles.headerStats}>
            {unreadCount > 0 && (
              <span style={{ ...styles.badge, ...styles.unreadBadge }}>
                <Bell size={14} />
                {unreadCount} unread
              </span>
            )}
            
            <button
              onClick={() => setShowSettings(true)}
              style={styles.actionButton}
            >
              <Settings size={16} />
              Settings
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statContent}>
              <div style={styles.statText}>
                <div style={styles.statLabel}>Total Notifications</div>
                <div style={styles.statValue}>{notificationStats.total}</div>
              </div>
              <div style={{ ...styles.statIcon, background: '#dbeafe' }}>
                <Bell size={20} color="#2563eb" />
              </div>
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statContent}>
              <div style={styles.statText}>
                <div style={styles.statLabel}>Unread</div>
                <div style={styles.statValue}>{notificationStats.unread}</div>
              </div>
              <div style={{ ...styles.statIcon, background: '#fee2e2' }}>
                <EyeOff size={20} color="#dc2626" />
              </div>
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statContent}>
              <div style={styles.statText}>
                <div style={styles.statLabel}>Today</div>
                <div style={styles.statValue}>{notificationStats.today}</div>
              </div>
              <div style={{ ...styles.statIcon, background: '#fef3c7' }}>
                <Clock size={20} color="#d97706" />
              </div>
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statContent}>
              <div style={styles.statText}>
                <div style={styles.statLabel}>High Priority</div>
                <div style={styles.statValue}>{notificationStats.highPriority}</div>
              </div>
              <div style={{ ...styles.statIcon, background: '#fce7f3' }}>
                <AlertTriangle size={20} color="#db2777" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <div style={styles.filterButtons}>
          {filters.map((filterItem) => (
            <button
              key={filterItem.id}
              onClick={() => setFilter(filterItem.id)}
              style={{
                ...styles.filterButton,
                ...(filter === filterItem.id && styles.filterButtonActive)
              }}
            >
              {filterItem.label}
              {filterItem.count > 0 && (
                <span style={{
                  padding: '0.125rem 0.375rem',
                  fontSize: '0.75rem',
                  background: filter === filterItem.id ? 'rgba(255,255,255,0.2)' : '#e5e7eb',
                  borderRadius: '9999px'
                }}>
                  {filterItem.count}
                </span>
              )}
            </button>
          ))}
        </div>
        
        <div style={styles.actionButtons}>
          <button
            onClick={markAllAsRead}
            style={styles.actionButton}
            disabled={unreadCount === 0}
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>
          
          <button
            onClick={clearAll}
            style={{
              ...styles.actionButton,
              background: '#fee2e2',
              color: '#dc2626',
              borderColor: '#fca5a5'
            }}
          >
            <Trash2 size={16} />
            Clear all
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div style={styles.notificationsContainer}>
        {filteredNotifications.length === 0 ? (
          <div style={styles.emptyState}>
            <Bell size={64} style={styles.emptyIcon} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              No notifications
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              {filter === 'unread' 
                ? 'You have no unread notifications' 
                : 'No notifications match your current filter'}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                style={{
                  ...styles.filterButton,
                  ...styles.filterButtonActive
                }}
              >
                View all notifications
              </button>
            )}
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                ...styles.notificationCard,
                ...(!notification.read && styles.notificationCardUnread)
              }}
            >
              <div style={styles.notificationHeader}>
                <div style={{
                  ...styles.notificationIcon,
                  background: `${notification.color}15`
                }}>
                  <div style={{ color: notification.color }}>
                    {notification.icon}
                  </div>
                </div>
                
                <div style={styles.notificationContent}>
                  <div style={styles.notificationTitle}>
                    {notification.title}
                    <span style={{
                      ...styles.priorityIndicator,
                      background: getPriorityColor(notification.priority)
                    }} />
                  </div>
                  
                  <p style={styles.notificationMessage}>
                    {notification.message}
                  </p>
                  
                  <div style={styles.notificationFooter}>
                    <div style={styles.notificationTime}>
                      <Clock size={12} />
                      {formatTimeAgo(notification.timestamp)}
                      <span style={{ marginLeft: '0.5rem', color: '#9ca3af' }}>
                        ({formatDateTime(notification.timestamp)})
                      </span>
                    </div>
                    
                    <div style={styles.notificationActions}>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          style={{
                            ...styles.smallButton,
                            background: '#d1fae5',
                            color: '#065f46',
                            borderColor: '#a7f3d0'
                          }}
                        >
                          <CheckCircle size={12} />
                          Mark read
                        </button>
                      )}
                      
                      {notification.actionUrl && (
                        <button
                          onClick={() => window.location.href = notification.actionUrl}
                          style={{
                            ...styles.smallButton,
                            background: '#dbeafe',
                            color: '#1e40af',
                            borderColor: '#93c5fd'
                          }}
                        >
                          View details
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        style={{
                          ...styles.smallButton,
                          background: '#fee2e2',
                          color: '#991b1b',
                          borderColor: '#fca5a5'
                        }}
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                
                {!notification.read && (
                  <div style={{
                    width: '0.5rem',
                    height: '0.5rem',
                    borderRadius: '50%',
                    background: '#2563eb',
                    position: 'absolute',
                    top: '1.25rem',
                    right: '1.25rem'
                  }} />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div style={styles.settingsModal} onClick={() => setShowSettings(false)}>
          <div style={styles.settingsContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.settingsHeader}>
              <h2 style={styles.settingsTitle}>Notification Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#6b7280' }}
              >
                ✕
              </button>
            </div>
            
            <div style={styles.settingsBody}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
                Delivery Methods
              </h3>
              
              <div style={styles.settingItem}>
                <div style={styles.settingLabel}>
                  <Mail size={18} color="#2563eb" />
                  <span>Email Notifications</span>
                </div>
                <label style={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={notificationSettings.email}
                    onChange={() => toggleNotificationSetting('email')}
                    style={{ display: 'none' }}
                  />
                  <span style={{
                    ...styles.toggleSlider,
                    ...(notificationSettings.email && styles.toggleSliderActive)
                  }}>
                    <span style={{
                      ...styles.toggleKnob,
                      ...(notificationSettings.email && styles.toggleKnobActive)
                    }} />
                  </span>
                </label>
              </div>
              
              <div style={styles.settingItem}>
                <div style={styles.settingLabel}>
                  <Bell size={18} color="#7c3aed" />
                  <span>Push Notifications</span>
                </div>
                <label style={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={notificationSettings.push}
                    onChange={() => toggleNotificationSetting('push')}
                    style={{ display: 'none' }}
                  />
                  <span style={{
                    ...styles.toggleSlider,
                    ...(notificationSettings.push && styles.toggleSliderActive)
                  }}>
                    <span style={{
                      ...styles.toggleKnob,
                      ...(notificationSettings.push && styles.toggleKnobActive)
                    }} />
                  </span>
                </label>
              </div>
              
              <div style={styles.settingItem}>
                <div style={styles.settingLabel}>
                  <Phone size={18} color="#059669" />
                  <span>SMS Notifications</span>
                </div>
                <label style={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={notificationSettings.sms}
                    onChange={() => toggleNotificationSetting('sms')}
                    style={{ display: 'none' }}
                  />
                  <span style={{
                    ...styles.toggleSlider,
                    ...(notificationSettings.sms && styles.toggleSliderActive)
                  }}>
                    <span style={{
                      ...styles.toggleKnob,
                      ...(notificationSettings.sms && styles.toggleKnobActive)
                    }} />
                  </span>
                </label>
              </div>
              
              <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: '1.5rem 0 1rem', color: '#374151' }}>
                Notification Types
              </h3>
              
              <div style={styles.settingItem}>
                <div style={styles.settingLabel}>
                  <Calendar size={18} color="#2563eb" />
                  <span>Booking Requests</span>
                </div>
                <label style={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={notificationSettings.bookingRequests}
                    onChange={() => toggleNotificationSetting('bookingRequests')}
                    style={{ display: 'none' }}
                  />
                  <span style={{
                    ...styles.toggleSlider,
                    ...(notificationSettings.bookingRequests && styles.toggleSliderActive)
                  }}>
                    <span style={{
                      ...styles.toggleKnob,
                      ...(notificationSettings.bookingRequests && styles.toggleKnobActive)
                    }} />
                  </span>
                </label>
              </div>
              
              <div style={styles.settingItem}>
                <div style={styles.settingLabel}>
                  <DollarSign size={18} color="#059669" />
                  <span>Payment Updates</span>
                </div>
                <label style={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={notificationSettings.payments}
                    onChange={() => toggleNotificationSetting('payments')}
                    style={{ display: 'none' }}
                  />
                  <span style={{
                    ...styles.toggleSlider,
                    ...(notificationSettings.payments && styles.toggleSliderActive)
                  }}>
                    <span style={{
                      ...styles.toggleKnob,
                      ...(notificationSettings.payments && styles.toggleKnobActive)
                    }} />
                  </span>
                </label>
              </div>
              
              <div style={styles.settingItem}>
                <div style={styles.settingLabel}>
                  <Star size={18} color="#d97706" />
                  <span>Review Notifications</span>
                </div>
                <label style={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={notificationSettings.reviews}
                    onChange={() => toggleNotificationSetting('reviews')}
                    style={{ display: 'none' }}
                  />
                  <span style={{
                    ...styles.toggleSlider,
                    ...(notificationSettings.reviews && styles.toggleSliderActive)
                  }}>
                    <span style={{
                      ...styles.toggleKnob,
                      ...(notificationSettings.reviews && styles.toggleKnobActive)
                    }} />
                  </span>
                </label>
              </div>
              
              <div style={styles.settingItem}>
                <div style={styles.settingLabel}>
                  <MessageSquare size={18} color="#7c3aed" />
                  <span>New Messages</span>
                </div>
                <label style={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={notificationSettings.messages}
                    onChange={() => toggleNotificationSetting('messages')}
                    style={{ display: 'none' }}
                  />
                  <span style={{
                    ...styles.toggleSlider,
                    ...(notificationSettings.messages && styles.toggleSliderActive)
                  }}>
                    <span style={{
                      ...styles.toggleKnob,
                      ...(notificationSettings.messages && styles.toggleKnobActive)
                    }} />
                  </span>
                </label>
              </div>
              
              <div style={styles.settingItem}>
                <div style={styles.settingLabel}>
                  <AlertCircle size={18} color="#dc2626" />
                  <span>System Alerts</span>
                </div>
                <label style={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={notificationSettings.system}
                    onChange={() => toggleNotificationSetting('system')}
                    style={{ display: 'none' }}
                  />
                  <span style={{
                    ...styles.toggleSlider,
                    ...(notificationSettings.system && styles.toggleSliderActive)
                  }}>
                    <span style={{
                      ...styles.toggleKnob,
                      ...(notificationSettings.system && styles.toggleKnobActive)
                    }} />
                  </span>
                </label>
              </div>
              
              <div style={{ ...styles.settingItem, borderBottom: 'none' }}>
                <div style={styles.settingLabel}>
                  <Bell size={18} color="#8b5cf6" />
                  <span>Marketing Updates</span>
                </div>
                <label style={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={notificationSettings.marketing}
                    onChange={() => toggleNotificationSetting('marketing')}
                    style={{ display: 'none' }}
                  />
                  <span style={{
                    ...styles.toggleSlider,
                    ...(notificationSettings.marketing && styles.toggleSliderActive)
                  }}>
                    <span style={{
                      ...styles.toggleKnob,
                      ...(notificationSettings.marketing && styles.toggleKnobActive)
                    }} />
                  </span>
                </label>
              </div>
              
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                <button
                  onClick={() => {
                    // Save settings logic here
                    setShowSettings(false);
                    alert('Notification settings saved');
                  }}
                  style={{
                    ...styles.filterButton,
                    ...styles.filterButtonActive,
                    width: '100%',
                    justifyContent: 'center'
                  }}
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderNotifications;