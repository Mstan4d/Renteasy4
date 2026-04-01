// src/modules/dashboard/pages/landlord/LandlordNotifications.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import {
  Bell, CheckCircle, Clock, AlertCircle, DollarSign,
  Home, RefreshCw, Eye, Trash2, Building, Users,
  FileText, Calendar, Send, X
} from 'lucide-react';
import './LandlordNotifications.css';

const LandlordNotifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
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
    try {
      // Fetch notifications - simplified without nested join
      const { data, error } = await supabase
        .from('landlord_notifications')
        .select('*')
        .eq('landlord_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // If there are estate_firm_ids, fetch the firm names separately
      let enhancedNotifications = data || [];
      
      if (enhancedNotifications.length > 0) {
        const estateFirmIds = [...new Set(enhancedNotifications.map(n => n.estate_firm_id).filter(Boolean))];
        
        if (estateFirmIds.length > 0) {
          const { data: firms, error: firmsError } = await supabase
            .from('estate_firm_profiles')
            .select('id, firm_name')
            .in('id', estateFirmIds);
          
          if (!firmsError && firms) {
            const firmMap = {};
            firms.forEach(f => { firmMap[f.id] = f; });
            
            enhancedNotifications = enhancedNotifications.map(n => ({
              ...n,
              estate_firm: firmMap[n.estate_firm_id] || null
            }));
          }
        }
      }
      
      setNotifications(enhancedNotifications);
      setUnreadCount(enhancedNotifications.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTenants = async () => {
    try {
      // Get all listings posted by this landlord that have tenants
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('id, title, tenant_id')
        .eq('user_id', user.id)
        .eq('poster_role', 'landlord')
        .not('tenant_id', 'is', null);

      if (listingsError) throw listingsError;

      if (!listings || listings.length === 0) {
        setTenants([]);
        return;
      }

      // Get tenant IDs
      const tenantIds = [...new Set(listings.map(l => l.tenant_id).filter(Boolean))];

      // Fetch tenant profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .in('id', tenantIds);

      if (profilesError) throw profilesError;

      // Create a map of profiles
      const profileMap = {};
      profiles?.forEach(p => {
        profileMap[p.id] = p;
      });

      // Build tenants list with property info
      const uniqueTenants = {};
      listings.forEach(listing => {
        if (listing.tenant_id && !uniqueTenants[listing.tenant_id]) {
          const profile = profileMap[listing.tenant_id];
          uniqueTenants[listing.tenant_id] = {
            id: listing.tenant_id,
            name: profile?.full_name || 'Tenant',
            email: profile?.email,
            phone: profile?.phone,
            property: listing.title
          };
        }
      });
      
      setTenants(Object.values(uniqueTenants));
    } catch (error) {
      console.error('Error loading tenants:', error);
      setTenants([]);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('landlord_notifications')
        .update({ read: true })
        .eq('id', notificationId);
      if (error) throw error;
      
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('landlord_notifications')
        .update({ read: true })
        .in('id', unreadIds);
      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!window.confirm('Delete this notification?')) return;
    
    try {
      const { error } = await supabase
        .from('landlord_notifications')
        .delete()
        .eq('id', notificationId);
      if (error) throw error;
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
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
      // First, check if tenant_notifications table exists
      const { error: insertError } = await supabase
        .from('tenant_notifications')
        .insert({
          tenant_id: sendForm.tenant_id,
          landlord_id: user.id,
          title: sendForm.title,
          message: sendForm.message,
          type: sendForm.type,
          read: false,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        // If tenant_notifications doesn't exist, try inserting into a different table
        console.warn('tenant_notifications table may not exist:', insertError);
        alert('The notifications system is not fully configured. Please contact support.');
        setSending(false);
        return;
      }

      alert('Notification sent successfully!');
      setShowSendModal(false);
      setSendForm({ tenant_id: '', title: '', message: '', type: 'general' });
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'rent_payment': return <DollarSign size={20} />;
      case 'rent_reminder': return <Bell size={20} />;
      case 'property_update': return <Home size={20} />;
      case 'document': return <FileText size={20} />;
      case 'lease_renewal': return <Calendar size={20} />;
      case 'maintenance': return <AlertCircle size={20} />;
      default: return <Bell size={20} />;
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

  if (loading) {
    return <div className="loading">Loading notifications...</div>;
  }

  return (
    <div className="landlord-notifications-page">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>Messages from estate firms and your tenants</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowSendModal(true)}>
            <Send size={18} /> Send to Tenant
          </button>
          <button className="btn-outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
            Mark all as read
          </button>
          <button className="btn-outline" onClick={loadNotifications}>
            <RefreshCw size={16} /> Refresh
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
          <p>When estate firms or tenants send you messages, they'll appear here.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map(notif => (
            <div
              key={notif.id}
              className={`notification-item ${!notif.read ? 'unread' : ''}`}
              onClick={() => !notif.read && markAsRead(notif.id)}
            >
              <div className="notification-icon">{getIcon(notif.type)}</div>
              <div className="notification-content">
                <div className="notification-header">
                  <div className="notification-title">{notif.title}</div>
                  <div className="notification-meta">
                    <span className="notification-time">{formatDate(notif.created_at)}</span>
                    <span className="sender-badge">
                      {notif.estate_firm?.firm_name || 'Estate Firm'}
                    </span>
                  </div>
                </div>
                <div className="notification-message">{notif.message}</div>
              </div>
              <div className="notification-actions">
                {!notif.read && (
                  <button
                    className="mark-read-btn"
                    onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                    title="Mark as read"
                  >
                    <CheckCircle size={16} />
                  </button>
                )}
                <button
                  className="delete-btn"
                  onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
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
              <h2><Send size={20} /> Send to Tenant</h2>
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
                  {tenants.length === 0 && (
                    <small className="warning-text">No tenants found. Add tenants to your properties first.</small>
                  )}
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

export default LandlordNotifications;