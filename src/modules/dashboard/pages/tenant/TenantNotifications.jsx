// src/modules/dashboard/pages/tenant/TenantNotifications.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import {
  Bell, CheckCircle, Clock, AlertCircle, DollarSign, Home,
  MessageSquare, FileText, Download, Eye, Trash2,
  Calendar, User, Building, Mail, Phone
} from 'lucide-react';
import './TenantNotifications.css';

const TenantNotifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notifications');
  const [unreadCount, setUnreadCount] = useState(0);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (user) {
      fetchData();
      subscribeToNotifications();
    }
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch tenant's units with property info
      const { data: units, error: unitsError } = await supabase
        .from('units')
        .select(`
          id,
          unit_number,
          property_id,
          property:property_id (
            id,
            title,
            estate_firm_id,
            landlord_id
          )
        `)
        .eq('tenant_id', user.id);

      if (unitsError) throw unitsError;

      const propertyIds = units?.map(u => u.property_id).filter(Boolean) || [];
      const estateFirmIds = units?.map(u => u.property?.estate_firm_id).filter(Boolean) || [];
      const landlordIds = units?.map(u => u.property?.landlord_id).filter(Boolean) || [];

      // Fetch notifications from estate_firm_notifications (if table exists)
      let estateNotifications = [];
      if (estateFirmIds.length > 0) {
        const { data } = await supabase
          .from('estate_firm_notifications')
          .select('*')
          .in('estate_firm_id', estateFirmIds)
          .eq('read', false)
          .order('created_at', { ascending: false });
        estateNotifications = data || [];
      }

      // Fetch notifications from landlord_notifications (if table exists)
      let landlordNotifications = [];
      if (landlordIds.length > 0) {
        const { data } = await supabase
          .from('landlord_notifications')
          .select('*')
          .in('landlord_id', landlordIds)
          .order('created_at', { ascending: false });
        landlordNotifications = data || [];
      }

      // Fetch documents from tenant_documents (if table exists)
      let tenantDocs = [];
      const { data: docsData } = await supabase
        .from('tenant_documents')
        .select('*')
        .eq('tenant_id', user.id)
        .order('created_at', { ascending: false });
      tenantDocs = docsData || [];

      // Combine and format notifications
      const allNotifications = [
        ...estateNotifications.map(n => ({
          ...n,
          sender_type: 'estate_firm',
          sender_name: n.sender_name || 'Estate Firm',
          icon: <Building size={18} />,
          color: '#8b5cf6'
        })),
        ...landlordNotifications.map(n => ({
          ...n,
          sender_type: 'landlord',
          sender_name: n.sender_name || 'Landlord',
          icon: <Home size={18} />,
          color: '#10b981'
        }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setNotifications(allNotifications);
      setDocuments(tenantDocs);
      setUnreadCount(allNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    // Check if tables exist before subscribing
    if (!user?.id) return;

    const channel = supabase
      .channel('tenant-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'tenant_documents',
        filter: `tenant_id=eq.${user.id}`
      }, (payload) => {
        setDocuments(prev => [payload.new, ...prev]);
      })
      .subscribe();

    setSubscription(channel);
  };

  const markAsRead = async (notificationId, type) => {
    const table = type === 'estate_firm' ? 'estate_firm_notifications' : 'landlord_notifications';
    try {
      await supabase
        .from(table)
        .update({ read: true })
        .eq('id', notificationId);
      
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => prev - 1);
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const downloadDocument = (doc) => {
    if (doc.file_url) {
      window.open(doc.file_url, '_blank');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'rent_reminder': <DollarSign size={18} />,
      'payment_confirmation': <CheckCircle size={18} />,
      'lease_renewal': <Calendar size={18} />,
      'maintenance': <AlertCircle size={18} />,
      'document': <FileText size={18} />,
      'general': <Bell size={18} />
    };
    return icons[type] || <Bell size={18} />;
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="tenant-notifications-page">
      <div className="page-header">
        <h1>Notifications & Documents</h1>
        <p>Stay updated with messages and documents from your property manager</p>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <Bell size={18} />
          Notifications
          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </button>
        <button
          className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <FileText size={18} />
          Documents
          {documents.length > 0 && <span className="badge">{documents.length}</span>}
        </button>
      </div>

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div className="empty-state">
              <Bell size={48} />
              <h3>No notifications yet</h3>
              <p>When your property manager sends updates, they'll appear here.</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-card ${!notification.read ? 'unread' : ''}`}
                onClick={() => !notification.read && markAsRead(notification.id, notification.sender_type)}
              >
                <div className="notification-icon" style={{ backgroundColor: `${notification.color}15` }}>
                  <span style={{ color: notification.color }}>
                    {getNotificationIcon(notification.type)}
                  </span>
                </div>
                <div className="notification-content">
                  <div className="notification-header">
                    <div className="sender-info">
                      <span className="sender-name">{notification.sender_name}</span>
                      <span className="sender-badge">
                        {notification.sender_type === 'estate_firm' ? '🏢 Estate Firm' : '🏠 Landlord'}
                      </span>
                    </div>
                    <span className="notification-time">{formatDate(notification.created_at)}</span>
                  </div>
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>
                  {notification.link && (
                    <button
                      className="view-link"
                      onClick={() => navigate(notification.link)}
                    >
                      View Details →
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="documents-list">
          {documents.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} />
              <h3>No documents yet</h3>
              <p>Documents uploaded by your property manager will appear here.</p>
            </div>
          ) : (
            documents.map(doc => (
              <div key={doc.id} className="document-card">
                <div className="document-icon">
                  <FileText size={32} />
                </div>
                <div className="document-info">
                  <h4>{doc.title}</h4>
                  <p>{doc.description}</p>
                  <div className="document-meta">
                    <span><Calendar size={12} /> {formatDate(doc.created_at)}</span>
                    <span><FileText size={12} /> {doc.file_size || 'N/A'}</span>
                  </div>
                </div>
                <div className="document-actions">
                  <button
                    className="btn-icon"
                    onClick={() => downloadDocument(doc)}
                    title="Download"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => window.open(doc.file_url, '_blank')}
                    title="View"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TenantNotifications;