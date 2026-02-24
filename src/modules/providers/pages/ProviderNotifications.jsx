// src/modules/providers/pages/ProviderNotifications.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
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
import './ProviderNotifications.css'; // external CSS

const ProviderNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
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
  const [loading, setLoading] = useState(true);

  // Fetch notifications on mount
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      fetchNotificationSettings();
    }
  }, [user]);

  // Calculate unread count
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('notification_settings')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data?.notification_settings) {
        setNotificationSettings(data.notification_settings);
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev => prev.filter(notification => notification.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications([]);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const toggleNotificationSetting = async (setting) => {
    const newSettings = {
      ...notificationSettings,
      [setting]: !notificationSettings[setting]
    };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ notification_settings: newSettings })
        .eq('id', user.id);

      if (error) throw error;

      setNotificationSettings(newSettings);
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };

  const saveSettings = () => {
    // Settings are saved per toggle, so no extra action needed
    setShowSettings(false);
    alert('Notification settings saved');
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

  const getFilteredNotifications = () => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter(n => !n.read);
    return notifications.filter(n => n.type === filter);
  };

  const filteredNotifications = getFilteredNotifications();

  const notificationStats = {
    total: notifications.length,
    unread: unreadCount,
    today: notifications.filter(n => {
      const date = new Date(n.created_at);
      const today = new Date();
      return date.toDateString() === today.toDateString();
    }).length,
    highPriority: notifications.filter(n => n.priority === 'high').length
  };

  if (loading) {
    return <div className="loading">Loading notifications...</div>;
  }

  return (
    <div className="provider-notifications-container">
      {/* Header */}
      <div className="notifications-header">
        <div className="title-section">
          <div>
            <h1 className="page-title">Notifications</h1>
            <p className="page-subtitle">
              Stay updated with bookings, payments, messages, and system alerts
            </p>
          </div>
          <div className="header-stats">
            {unreadCount > 0 && (
              <span className="badge unread-badge">
                <Bell size={14} />
                {unreadCount} unread
              </span>
            )}
            <button className="action-button" onClick={() => setShowSettings(true)}>
              <Settings size={16} />
              Settings
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-text">
                <div className="stat-label">Total Notifications</div>
                <div className="stat-value">{notificationStats.total}</div>
              </div>
              <div className="stat-icon" style={{ background: '#dbeafe' }}>
                <Bell size={20} color="#2563eb" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-text">
                <div className="stat-label">Unread</div>
                <div className="stat-value">{notificationStats.unread}</div>
              </div>
              <div className="stat-icon" style={{ background: '#fee2e2' }}>
                <EyeOff size={20} color="#dc2626" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-text">
                <div className="stat-label">Today</div>
                <div className="stat-value">{notificationStats.today}</div>
              </div>
              <div className="stat-icon" style={{ background: '#fef3c7' }}>
                <Clock size={20} color="#d97706" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-text">
                <div className="stat-label">High Priority</div>
                <div className="stat-value">{notificationStats.highPriority}</div>
              </div>
              <div className="stat-icon" style={{ background: '#fce7f3' }}>
                <AlertTriangle size={20} color="#db2777" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        <div className="filter-buttons">
          {filters.map((filterItem) => (
            <button
              key={filterItem.id}
              className={`filter-button ${filter === filterItem.id ? 'active' : ''}`}
              onClick={() => setFilter(filterItem.id)}
            >
              {filterItem.label}
              {filterItem.count > 0 && (
                <span className="filter-count">
                  {filterItem.count}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="action-buttons">
          <button
            className="action-button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>
          <button
            className="action-button clear-button"
            onClick={clearAll}
          >
            <Trash2 size={16} />
            Clear all
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={64} className="empty-icon" />
            <h3>No notifications</h3>
            <p>
              {filter === 'unread'
                ? 'You have no unread notifications'
                : 'No notifications match your current filter'}
            </p>
            {filter !== 'all' && (
              <button className="filter-button active" onClick={() => setFilter('all')}>
                View all notifications
              </button>
            )}
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card ${!notification.read ? 'unread' : ''}`}
            >
              <div className="notification-header">
                <div
                  className="notification-icon"
                  style={{ background: `${getPriorityColor(notification.priority)}15` }}
                >
                  <div style={{ color: getPriorityColor(notification.priority) }}>
                    {/* You can map icon based on type, but for simplicity use a default */}
                    <Bell size={20} />
                  </div>
                </div>
                <div className="notification-content">
                  <div className="notification-title">
                    {notification.title}
                    <span
                      className="priority-indicator"
                      style={{ background: getPriorityColor(notification.priority) }}
                    />
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  <div className="notification-footer">
                    <div className="notification-time">
                      <Clock size={12} />
                      {formatTimeAgo(notification.created_at)}
                      <span className="full-time">({formatDateTime(notification.created_at)})</span>
                    </div>
                    <div className="notification-actions">
                      {!notification.read && (
                        <button
                          className="small-button mark-read"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <CheckCircle size={12} />
                          Mark read
                        </button>
                      )}
                      {notification.action_url && (
                        <button
                          className="small-button view-details"
                          onClick={() => window.location.href = notification.action_url}
                        >
                          View details
                        </button>
                      )}
                      <button
                        className="small-button delete-button"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                {!notification.read && (
                  <div className="unread-dot" />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Notification Settings</h2>
              <button className="modal-close" onClick={() => setShowSettings(false)}>✕</button>
            </div>
            <div className="modal-body">
              <h3 className="settings-section-title">Delivery Methods</h3>
              <div className="setting-item">
                <div className="setting-label">
                  <Mail size={18} color="#2563eb" />
                  <span>Email Notifications</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notificationSettings.email}
                    onChange={() => toggleNotificationSetting('email')}
                  />
                  <span className="toggle-slider">
                    <span className="toggle-knob" />
                  </span>
                </label>
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <Bell size={18} color="#7c3aed" />
                  <span>Push Notifications</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notificationSettings.push}
                    onChange={() => toggleNotificationSetting('push')}
                  />
                  <span className="toggle-slider">
                    <span className="toggle-knob" />
                  </span>
                </label>
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <Phone size={18} color="#059669" />
                  <span>SMS Notifications</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notificationSettings.sms}
                    onChange={() => toggleNotificationSetting('sms')}
                  />
                  <span className="toggle-slider">
                    <span className="toggle-knob" />
                  </span>
                </label>
              </div>
              <h3 className="settings-section-title">Notification Types</h3>
              <div className="setting-item">
                <div className="setting-label">
                  <Calendar size={18} color="#2563eb" />
                  <span>Booking Requests</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notificationSettings.bookingRequests}
                    onChange={() => toggleNotificationSetting('bookingRequests')}
                  />
                  <span className="toggle-slider">
                    <span className="toggle-knob" />
                  </span>
                </label>
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <DollarSign size={18} color="#059669" />
                  <span>Payment Updates</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notificationSettings.payments}
                    onChange={() => toggleNotificationSetting('payments')}
                  />
                  <span className="toggle-slider">
                    <span className="toggle-knob" />
                  </span>
                </label>
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <Star size={18} color="#d97706" />
                  <span>Review Notifications</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notificationSettings.reviews}
                    onChange={() => toggleNotificationSetting('reviews')}
                  />
                  <span className="toggle-slider">
                    <span className="toggle-knob" />
                  </span>
                </label>
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <MessageSquare size={18} color="#7c3aed" />
                  <span>New Messages</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notificationSettings.messages}
                    onChange={() => toggleNotificationSetting('messages')}
                  />
                  <span className="toggle-slider">
                    <span className="toggle-knob" />
                  </span>
                </label>
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <AlertCircle size={18} color="#dc2626" />
                  <span>System Alerts</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notificationSettings.system}
                    onChange={() => toggleNotificationSetting('system')}
                  />
                  <span className="toggle-slider">
                    <span className="toggle-knob" />
                  </span>
                </label>
              </div>
              <div className="setting-item">
                <div className="setting-label">
                  <Bell size={18} color="#8b5cf6" />
                  <span>Marketing Updates</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notificationSettings.marketing}
                    onChange={() => toggleNotificationSetting('marketing')}
                  />
                  <span className="toggle-slider">
                    <span className="toggle-knob" />
                  </span>
                </label>
              </div>
              <div className="settings-footer">
                <button className="save-button" onClick={saveSettings}>
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