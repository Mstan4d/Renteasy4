// src/modules/dashboard/pages/tenant/TenantApplications.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../shared/lib/supabaseClient';
import { useAuth } from '../../../../shared/context/AuthContext';
import RentEasyLoader from '../../../../shared/components/RentEasyLoader';
import { Calendar, MessageSquare, Home, CheckCircle, Clock, XCircle } from 'lucide-react';
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
      // 1. Get all active leases for this tenant (rented properties)
      const { data: activeLeases, error: leasesError } = await supabase
        .from('leases')
        .select(`
          *,
          property:property_id (
            id,
            title,
            price,
            images,
            city,
            state,
            address,
            estate_firm_id,
            landlord_id
          ),
          unit:unit_id (
            id,
            unit_number,
            rent_amount,
            rent_frequency
          )
        `)
        .eq('tenant_id', user.id)
        .eq('status', 'active');

      if (leasesError) console.error('Leases fetch error:', leasesError);

      // 2. Get all chats where tenant is participant (active applications)
      const { data: chats, error: chatsError } = await supabase
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
            address,
            poster_name,
            poster_role,
            is_managed,
            managed_by,
            verification_status
          )
        `)
        .eq('participant1_id', user.id)
        .order('last_message_at', { ascending: false });

      if (chatsError) throw chatsError;

      // 3. Get estate firm and landlord profiles for proper names
      const allPropertyIds = [
        ...(chats || []).map(c => c.listings?.id).filter(Boolean),
        ...(activeLeases || []).map(l => l.property_id).filter(Boolean)
      ];
      
      let estateFirmMap = {};
      let landlordMap = {};
      
      if (allPropertyIds.length > 0) {
        // Get property details to find estate firm and landlord IDs
        const { data: properties } = await supabase
          .from('properties')
          .select('id, estate_firm_id, landlord_id')
          .in('id', allPropertyIds);
        
        const estateFirmIds = [...new Set(properties?.map(p => p.estate_firm_id).filter(Boolean))];
        const landlordIds = [...new Set(properties?.map(p => p.landlord_id).filter(Boolean))];
        
        // Fetch estate firm profiles
        if (estateFirmIds.length > 0) {
          const { data: firms } = await supabase
            .from('estate_firm_profiles')
            .select('id, firm_name, logo_url')
            .in('id', estateFirmIds);
          if (firms) {
            estateFirmMap = Object.fromEntries(firms.map(f => [f.id, f]));
          }
        }
        
        // Fetch landlord profiles
        if (landlordIds.length > 0) {
          const { data: landlords } = await supabase
            .from('profiles')
            .select('id, full_name, name, avatar_url')
            .in('id', landlordIds);
          if (landlords) {
            landlordMap = Object.fromEntries(landlords.map(l => [l.id, l]));
          }
        }
      }

      // 4. Process chat applications (active/pending applications)
      const chatApps = (chats || []).map(chat => {
        const listing = chat.listings;
        const isActive = listing?.status === 'approved' || listing?.status === 'pending';
        const isRented = listing?.status === 'rented' || listing?.status === 'taken' || chat.state === 'rented';
        const isHistory = listing?.status === 'rejected' || listing?.status === 'inactive';
        
        // Get proper poster name from estate firm or landlord
        let posterName = listing?.poster_name || 'Anonymous';
        let posterRole = listing?.poster_role;
        
        return {
          id: chat.id,
          type: 'chat',
          listing_id: chat.listing_id,
          listing: {
            id: listing?.id,
            title: listing?.title,
            price: listing?.price, // Annual rent in ₦
            images: listing?.images,
            status: listing?.status,
            city: listing?.city,
            state: listing?.state,
            address: listing?.address,
            poster_name: posterName,
            poster_role: posterRole,
            unit_number: listing?.unit_number
          },
          lastMessage: chat.last_message || 'No messages yet',
          lastMessageDate: chat.last_message_at || chat.created_at,
          isActive,
          isRented,
          isHistory,
          status: listing?.status,
          created_at: chat.created_at
        };
      });

      // 5. Process active leases as "rented" applications
      const leaseApps = (activeLeases || []).map(lease => {
        const property = lease.property;
        const unit = lease.unit;
        
        // Get proper property images
        const propertyImages = property?.images;
        const imageUrl = propertyImages && Array.isArray(propertyImages) && propertyImages.length > 0 
          ? propertyImages[0] 
          : (typeof propertyImages === 'string' ? propertyImages : null);
        
        // Get estate firm or landlord name
        let posterName = 'Property Manager';
        let posterRole = 'landlord';
        
        if (property?.estate_firm_id && estateFirmMap[property.estate_firm_id]) {
          posterName = estateFirmMap[property.estate_firm_id].firm_name;
          posterRole = 'estate-firm';
        } else if (property?.landlord_id && landlordMap[property.landlord_id]) {
          posterName = landlordMap[property.landlord_id].full_name || landlordMap[property.landlord_id].name;
          posterRole = 'landlord';
        }
        
        return {
          id: lease.id,
          type: 'lease',
          listing_id: property?.id,
          listing: {
            id: property?.id,
            title: property?.title || 'Property',
            price: property?.price || lease.monthly_rent, // Annual rent
            images: imageUrl ? [imageUrl] : [],
            status: 'rented',
            city: property?.city || '',
            state: property?.state || '',
            address: property?.address || '',
            poster_name: posterName,
            poster_role: posterRole,
            unit_number: unit?.unit_number
          },
          lastMessage: '🏠 Lease agreement active',
          lastMessageDate: lease.created_at,
          isActive: false,
          isRented: true,
          isHistory: false,
          status: 'rented',
          created_at: lease.created_at,
          unit: unit
        };
      });

      // 6. Combine all applications
      let allApps = [...chatApps, ...leaseApps];
      
      // Sort by most recent first
      allApps.sort((a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate));
      
      // Filter based on active tab
      let filteredApps = [];
      if (activeTab === 'active') {
        filteredApps = allApps.filter(app => app.isActive && !app.isRented);
      } else if (activeTab === 'rented') {
        filteredApps = allApps.filter(app => app.isRented && !app.isHistory);
      } else if (activeTab === 'history') {
        filteredApps = allApps.filter(app => app.isHistory);
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
    if (listing?.status === 'rented' || application.status === 'rented') {
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
    if (listing?.status === 'rented' || application.status === 'rented') {
      return '✅ This property has been rented successfully! Your lease is active.';
    }
    if (listing?.status === 'approved') {
      return '🏠 This listing is still available. You can contact the owner.';
    }
    if (listing?.status === 'pending') {
      return '⏳ This listing is pending verification. Check back soon!';
    }
    if (listing?.status === 'rejected') {
      return '❌ This listing was not approved.';
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

  const formatCurrency = (amount) => {
    if (!amount) return '₦0';
    return `₦${amount.toLocaleString()}`;
  };

  const getCounts = () => {
    const active = applications.filter(a => a.isActive && !a.isRented).length;
    const rented = applications.filter(a => a.isRented && !a.isHistory).length;
    const history = applications.filter(a => a.isHistory).length;
    return { active, rented, history };
  };

  const counts = getCounts();

  if (loading) {
    return <RentEasyLoader message="Loading your applications..." fullScreen />;
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
        {applications.length > 0 ? (
          applications.map((app) => (
            <div key={app.id} className="app-card-modern">
              <div className="card-main" onClick={() => navigate(`/listings/${app.listing_id}`)}>
                <img 
                  src={getImageUrl(app.listing?.images)} 
                  alt={app.listing?.title || 'Property'} 
                />
                <div className="card-details">
                  <div className="price-status-row">
                    <span className="price-tag">
                      {formatCurrency(app.listing?.price)}/year
                    </span>
                    {getStatusBadge(app)}
                  </div>
                  <h3>{app.listing?.title || 'Untitled Property'}</h3>
                  <p className="loc-text">
                    {app.listing?.city}, {app.listing?.state}
                    {app.listing?.unit_number && ` • Unit ${app.listing.unit_number}`}
                  </p>
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
                  {app.status !== 'rented' && app.status !== 'rejected' && app.status !== 'rented' ? (
                    <button 
                      className="btn-msg" 
                      onClick={() => navigate(`/dashboard/messages/chat/${app.id}`)}
                    >
                      <MessageSquare size={14} /> Continue Chat
                    </button>
                  ) : app.status === 'rented' ? (
                    <button 
                      className="btn-msg rented" 
                      onClick={() => navigate(`/dashboard/tenant/rental-history`)}
                    >
                      <Home size={14} /> View Rental Details
                    </button>
                  ) : (
                    <button className="btn-msg disabled" disabled>
                      <XCircle size={14} /> Chat Closed
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
              <button onClick={() => navigate('/listings')} className="btn-primary">
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