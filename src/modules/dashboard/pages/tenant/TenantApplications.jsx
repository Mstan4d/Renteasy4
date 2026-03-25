import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../shared/lib/supabaseClient';
import { useAuth } from '../../../../shared/context/AuthContext';
import RentEasyLoader from '../../../../shared/components/RentEasyLoader';
import './TenantApplications.css';

const TenantApplications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); 

  useEffect(() => {
    if (user) fetchApplications();
  }, [user, activeTab]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      // Fetch all chats where tenant is participant
      const { data: chats, error } = await supabase
        .from('chats')
        .select(`
          id,
          last_message,
          last_message_at,
          listing_id,
          state,
          created_at,
          listings:listing_id (
            id,
            title,
            price,
            images,
            status,
            city,
            state,
            poster_name,
            poster_role,
            is_managed,
            managed_by,
            verification_status
          )
        `)
        .eq('participant1_id', user.id)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Process and filter applications based on active tab
      let processedApps = (chats || []).map(chat => {
        const listing = chat.listings;
        const isActive = listing?.status === 'approved' || listing?.status === 'pending';
        const isRented = listing?.status === 'rented' || listing?.status === 'taken' || chat.state === 'rented';
        const isHistory = listing?.status === 'rejected' || listing?.status === 'inactive' || 
                          (listing?.status === 'rented' && new Date(listing.rented_at) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
        
        return {
          ...chat,
          listing,
          isActive,
          isRented,
          isHistory,
          lastMessage: chat.last_message || 'No messages yet',
          lastMessageDate: chat.last_message_at || chat.created_at
        };
      });

      // Filter based on active tab
      let filteredApps = [];
      if (activeTab === 'active') {
        filteredApps = processedApps.filter(app => app.isActive && !app.isRented);
      } else if (activeTab === 'rented') {
        filteredApps = processedApps.filter(app => app.isRented && !app.isHistory);
      } else if (activeTab === 'history') {
        filteredApps = processedApps.filter(app => app.isHistory);
      }

      setApplications(filteredApps);
    } catch (err) {
      console.error("Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getStatusBadge = (application) => {
    const listing = application.listing;
    if (listing?.status === 'rented' || application.state === 'rented') {
      return <span className="status-badge rented">🏠 Rented</span>;
    }
    if (listing?.status === 'approved') {
      return <span className="status-badge active">✅ Active</span>;
    }
    if (listing?.status === 'pending') {
      return <span className="status-badge pending">⏳ Pending</span>;
    }
    if (listing?.status === 'rejected') {
      return <span className="status-badge rejected">❌ Rejected</span>;
    }
    return <span className="status-badge">📋 {listing?.status || 'Unknown'}</span>;
  };

  const getListingStatusMessage = (application) => {
    const listing = application.listing;
    if (listing?.status === 'rented') {
      return 'This property has been rented successfully!';
    }
    if (listing?.status === 'approved') {
      return 'This listing is still available. You can contact the owner.';
    }
    if (listing?.status === 'pending') {
      return 'This listing is pending verification. Check back soon!';
    }
    if (listing?.status === 'rejected') {
      return 'This listing was not approved.';
    }
    return '';
  };

  const getImageUrl = (images) => {
    if (!images) return 'https://via.placeholder.com/120x120?text=No+Image';
    if (Array.isArray(images) && images.length > 0) return images[0];
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        return parsed[0] || 'https://via.placeholder.com/120x120?text=No+Image';
      } catch {
        return images;
      }
    }
    return 'https://via.placeholder.com/120x120?text=No+Image';
  };

  const getCounts = () => {
    const active = applications.filter(a => a.isActive && !a.isRented).length;
    const rented = applications.filter(a => a.isRented && !a.isHistory).length;
    const history = applications.filter(a => a.isHistory).length;
    return { active, rented, history };
  };

  const counts = getCounts();

  if (loading) {
  return <RentEasyLoader message="Loading your dashboard..." fullScreen />;
}
  return (
    <div className="tenant-container">
      <header className="mobile-header">
        <h1>My Applications</h1>
        <button className="fab-add" onClick={() => navigate('/listings')}>+</button>
      </header>

      <div className="tab-pill-container">
        <button 
          className={`tab-pill ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active ({counts.active})
        </button>
        <button 
          className={`tab-pill ${activeTab === 'rented' ? 'active' : ''}`}
          onClick={() => setActiveTab('rented')}
        >
          Rented ({counts.rented})
        </button>
        <button 
          className={`tab-pill ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History ({counts.history})
        </button>
      </div>

      <div className="apps-feed">
        {loading ? (
          <div className="loader-container"><div className="spinner"></div></div>
        ) : applications.length > 0 ? (
          applications.map((app) => (
            <div key={app.id} className="app-card-modern">
              <div className="card-main" onClick={() => navigate(`/listings/${app.listing_id}`)}>
                <img 
                  src={getImageUrl(app.listings?.images)} 
                  alt={app.listings?.title || 'Property'} 
                />
                <div className="card-details">
                  <div className="price-status-row">
                    <span className="price-tag">₦{app.listings?.price?.toLocaleString() || '0'}/year</span>
                    {getStatusBadge(app)}
                  </div>
                  <h3>{app.listings?.title || 'Untitled Property'}</h3>
                  <p className="loc-text">{app.listings?.city}, {app.listings?.state}</p>
                  <p className="status-message">{getListingStatusMessage(app)}</p>
                </div>
              </div>

              <div className="card-footer-modern">
                <div className="msg-preview">
                  <div className={`msg-dot ${app.lastMessage !== 'No messages yet' ? 'has-message' : ''}`}></div>
                  <p>{app.lastMessage}</p>
                  <span className="msg-time">{formatDate(app.lastMessageDate)}</span>
                </div>
                <div className="action-row">
                  {app.listing?.status !== 'rented' && app.listing?.status !== 'rejected' ? (
                    <button className="btn-msg" onClick={() => navigate(`/dashboard/messages/chat/${app.id}`)}>
                      💬 Continue Chat
                    </button>
                  ) : app.listing?.status === 'rented' ? (
                    <button className="btn-msg rented" onClick={() => navigate(`/dashboard/tenant/rental-history`)}>
                      📜 View Rental Details
                    </button>
                  ) : (
                    <button className="btn-msg disabled" disabled>
                      🔒 Chat Closed
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state-v2">
            <div className="empty-icon">
              {activeTab === 'active' && '🏠'}
              {activeTab === 'rented' && '✅'}
              {activeTab === 'history' && '📜'}
            </div>
            <h3>
              {activeTab === 'active' && 'No active applications'}
              {activeTab === 'rented' && 'No rented properties yet'}
              {activeTab === 'history' && 'No application history'}
            </h3>
            <p>
              {activeTab === 'active' && 'Start browsing properties to find your next home!'}
              {activeTab === 'rented' && 'When you rent a property, it will appear here.'}
              {activeTab === 'history' && 'Your past applications and rentals will show up here.'}
            </p>
            {activeTab !== 'rented' && (
              <button onClick={() => navigate('/listings')}>
                Browse Available Houses
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantApplications;