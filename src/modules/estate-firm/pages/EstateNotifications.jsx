// src/modules/estate-firm/pages/EstateNotifications.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import { 
  Bell, CheckCircle, Clock, AlertCircle, DollarSign, 
  UserPlus, Home, RefreshCw, Send, FileText, Calendar,
  Building, Users, Eye, Trash2
} from 'lucide-react';
import './EstateNotifications.css';

const EstateNotifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendForm, setSendForm] = useState({
    tenant_id: '',
    title: '',
    message: '',
    type: 'general'
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
      loadTenants();
    }
  }, [user]);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get estate firm profile ID
      const { data: profile, error: profileError } = await supabase
        .from('estate_firm_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (profileError) throw profileError;

      // Fetch notifications from estate_firm_notifications
      const { data, error } = await supabase
        .from('estate_firm_notifications')
        .select(`
          *,
          tenant:tenant_id (
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq('estate_firm_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTenants = async () => {
    try {
      // Get estate firm profile ID
      const { data: profile } = await supabase
        .from('estate_firm_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        // Get all tenants from units managed by this estate firm
        const { data: units } = await supabase
          .from('units')
          .select(`
            tenant_id,
            tenant_name,
            tenant_email,
            tenant_phone,
            property:property_id (title)
          `)
          .eq('property.estate_firm_id', profile.id);

        // Deduplicate tenants
        const uniqueTenants = {};
        units?.forEach(unit => {
          if (unit.tenant_id && !uniqueTenants[unit.tenant_id]) {
            uniqueTenants[unit.tenant_id] = {
              id: unit.tenant_id,
              name: unit.tenant_name,
              email: unit.tenant_email,
              phone: unit.tenant_phone,
              property: unit.property?.title
            };
          }
        });
        setTenants(Object.values(uniqueTenants));
      }
    } catch (err) {
      console.error('Error loading tenants:', err);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('estate_firm_notifications')
        .update({ read: true })
        .eq('id', notificationId);
      if (error) throw error;
      
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => prev - 1);
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('estate_firm_notifications')
        .update({ read: true })
        .in('id', unreadIds);
      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!window.confirm('Delete this notification?')) return;
    
    try {
      const { error } = await supabase
        .from('estate_firm_notifications')
        .delete()
        .eq('id', notificationId);
      if (error) throw error;
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const sendNotification = async (e) => {
    e.preventDefault();
    if (!sendForm.tenant_id || !sendForm.title || !sendForm.message) {
      alert('Please fill all required fields');
      return;
    }

    setSending(true);
    try {
      // Get estate firm profile ID
      const { data: profile } = await supabase
        .from('estate_firm_profiles')
        .select('id, firm_name')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Insert notification
      const { error } = await supabase
        .from('estate_firm_notifications')
        .insert({
          estate_firm_id: profile.id,
          tenant_id: sendForm.tenant_id,
          title: sendForm.title,
          message: sendForm.message,
          type: sendForm.type,
          read: false,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      alert('Notification sent successfully!');
      setShowSendModal(false);
      setSendForm({ tenant_id: '', title: '', message: '', type: 'general' });
      loadNotifications(); // Refresh
    } catch (err) {
      console.error('Error sending notification:', err);
      alert('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'rent_payment': return <DollarSign size={20} className="icon-payment" />;
      case 'new_tenant': return <UserPlus size={20} className="icon-tenant" />;
      case 'property_listed': return <Home size={20} className="icon-property" />;
      case 'listing_rented': return <CheckCircle size={20} className="icon-rented" />;
      case 'document': return <FileText size={20} className="icon-document" />;
      case 'lease_renewal': return <Calendar size={20} className="icon-lease" />;
      default: return <Bell size={20} className="icon-default" />;
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (loading) return <RentEasyLoader message="Loading notifications..." fullScreen />;
  if (error) return <div className="error-state">Error: {error}</div>;

  return (
    <div className="estate-notifications">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>Send and manage notifications to your tenants</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowSendModal(true)}>
            <Send size={18} /> Send Notification
          </button>
          <button className="btn-outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
            Mark all as read
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="notification-stats">
        <div className="stat-card">
          <Bell size={20} />
          <div>
            <span className="stat-value">{notifications.length}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="unread-icon">
            <Bell size={20} />
          </div>
          <div>
            <span className="stat-value">{unreadCount}</span>
            <span className="stat-label">Unread</span>
          </div>
        </div>
        <div className="stat-card">
          <Users size={20} />
          <div>
            <span className="stat-value">{tenants.length}</span>
            <span className="stat-label">Tenants</span>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="empty-state">
          <Bell size={48} />
          <h3>No notifications yet</h3>
          <p>Send notifications to your tenants to keep them updated.</p>
          <button className="btn-primary" onClick={() => setShowSendModal(true)}>
            <Send size={18} /> Send First Notification
          </button>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map(notif => (
            <div
              key={notif.id}
              className={`notification-item ${!notif.read ? 'unread' : ''}`}
            >
              <div className="notification-icon">{getIcon(notif.type)}</div>
              <div className="notification-content">
                <div className="notification-header">
                  <div className="notification-title">{notif.title}</div>
                  <div className="notification-meta">
                    <span className="notification-time">{formatDate(notif.created_at)}</span>
                    <span className="tenant-badge">
                      {notif.tenant?.full_name || 'Tenant'}
                    </span>
                  </div>
                </div>
                <div className="notification-message">{notif.message}</div>
              </div>
              <div className="notification-actions">
                {!notif.read && (
                  <button
                    className="mark-read-btn"
                    onClick={() => markAsRead(notif.id)}
                    title="Mark as read"
                  >
                    <CheckCircle size={16} />
                  </button>
                )}
                <button
                  className="delete-btn"
                  onClick={() => deleteNotification(notif.id)}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Send Notification Modal */}
      {showSendModal && (
        <div className="modal-overlay" onClick={() => setShowSendModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><Send size={20} /> Send Notification</h2>
              <button className="close-btn" onClick={() => setShowSendModal(false)}>×</button>
            </div>
            <form onSubmit={sendNotification}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Tenant *</label>
                  <select
                    value={sendForm.tenant_id}
                    onChange={(e) => setSendForm({...sendForm, tenant_id: e.target.value})}
                    required
                  >
                    <option value="">Select a tenant</option>
                    {tenants.map(tenant => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.name} - {tenant.property || 'No property'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Notification Type</label>
                  <select
                    value={sendForm.type}
                    onChange={(e) => setSendForm({...sendForm, type: e.target.value})}
                  >
                    <option value="general">General Announcement</option>
                    <option value="rent_reminder">Rent Reminder</option>
                    <option value="payment_confirmation">Payment Confirmation</option>
                    <option value="lease_renewal">Lease Renewal</option>
                    <option value="maintenance">Maintenance Update</option>
                    <option value="document">New Document Available</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={sendForm.title}
                    onChange={(e) => setSendForm({...sendForm, title: e.target.value})}
                    placeholder="e.g., Rent Reminder - March 2024"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    value={sendForm.message}
                    onChange={(e) => setSendForm({...sendForm, message: e.target.value})}
                    placeholder="Write your message to the tenant..."
                    rows="5"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowSendModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={sending}>
                  {sending ? 'Sending...' : <><Send size={16} /> Send Notification</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstateNotifications;