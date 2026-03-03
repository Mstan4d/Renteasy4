// src/modules/manager/pages/ManagerProperties.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './ManagerProperties.css';

const ManagerProperties = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [filter, setFilter] = useState('all'); // all, verified, pending, rented
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rented: 0
  });

  useEffect(() => {
    if (!user) return;
    loadProperties();
  }, [user]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      // 1. Fetch all listings managed by this manager
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .eq('managed_by', user.id)
        .order('created_at', { ascending: false });

      if (listingsError) throw listingsError;

      // 2. For each listing, find associated chat (if any)
      const listingsWithChats = await Promise.all(
        (listings || []).map(async (listing) => {
          const { data: chat } = await supabase
            .from('chats')
            .select('id, chat_type')
            .eq('listing_id', listing.id)
            .maybeSingle();
          return {
            ...listing,
            chat: chat || null
          };
        })
      );

      // 3. Calculate stats
      const total = listingsWithChats.length;
      const verified = listingsWithChats.filter(p => p.verified).length;
      const pending = listingsWithChats.filter(p => !p.verified && p.status !== 'rented').length;
      const rented = listingsWithChats.filter(p => p.status === 'rented').length;

      setStats({ total, verified, pending, rented });
      setProperties(listingsWithChats);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProperties = () => {
    switch (filter) {
      case 'verified':
        return properties.filter(p => p.verified);
      case 'pending':
        return properties.filter(p => !p.verified && p.status !== 'rented');
      case 'rented':
        return properties.filter(p => p.status === 'rented');
      default:
        return properties;
    }
  };

  const getPropertyStatus = (property) => {
    if (property.status === 'rented') {
      return { label: 'Rented', color: '#155724', bgColor: '#d4edda', icon: '✅' };
    }
    if (property.verified) {
      return { label: 'Verified', color: '#0c5460', bgColor: '#d1ecf1', icon: '✅' };
    }
    return { label: 'Pending', color: '#856404', bgColor: '#fff3cd', icon: '⏳' };
  };

  const verifyProperty = async (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;

    if (!window.confirm('Verify this property after onsite inspection?')) return;

    try {
      // Update listing as verified
      const { error } = await supabase
        .from('listings')
        .update({
          verified: true,
          verified_by: user.id,
          verification_date: new Date().toISOString(),
          permanent_manager: true
        })
        .eq('id', propertyId);

      if (error) throw error;

      // Optionally update chat to reflect permanent assignment (if needed)
      // Not all listings have a chat; we can skip or update if exists

      alert('✅ Property verified! You are now permanently assigned.');
      loadProperties(); // refresh
    } catch (error) {
      console.error('Error verifying property:', error);
      alert('Failed to verify property.');
    }
  };

  const getCommissionEarned = async (listingId) => {
    // This could be computed per property; for now we'll just return a placeholder
    // In a real scenario, you'd sum from commissions where status = paid
    // But for display in the card, we can fetch per property.
    // However, to avoid many queries, we might load commissions separately.
    // We'll keep it simple for now – maybe a static value or fetch on demand.
    // Here we return 0, and the UI will show nothing.
    return 0;
  };

  const getAssociatedChat = (property) => property.chat;

  const getPosterTypeLabel = (property) => {
    switch (property.poster_role) {
      case 'tenant':
        return { label: 'Tenant Post', icon: '👤', color: '#6c757d' };
      case 'landlord':
        return { label: 'Landlord Post', icon: '🏠', color: '#17a2b8' };
      case 'estate_firm':
        return { label: 'Estate Firm', icon: '🏢', color: '#007bff' };
      default:
        return { label: 'Unknown', icon: '❓', color: '#6c757d' };
    }
  };

  if (loading) {
    return <div className="loading">Loading properties...</div>;
  }

  return (
    <div className="manager-properties">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>🏠 Managed Properties</h1>
          <p>Properties you're managing or have verified</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/dashboard/manager')}
        >
          Back to Dashboard
        </button>
      </div>

      {/* STATS */}
      <div className="properties-stats">
        <div className="stat-card" onClick={() => setFilter('all')}>
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Properties</div>
        </div>
        <div className="stat-card" onClick={() => setFilter('verified')}>
          <div className="stat-number">{stats.verified}</div>
          <div className="stat-label">Verified</div>
          <div className="stat-sub">Permanent</div>
        </div>
        <div className="stat-card" onClick={() => setFilter('pending')}>
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending</div>
          <div className="stat-sub">Needs verification</div>
        </div>
        <div className="stat-card" onClick={() => setFilter('rented')}>
          <div className="stat-number">{stats.rented}</div>
          <div className="stat-label">Rented</div>
          <div className="stat-sub">Commission earned</div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="properties-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Properties
        </button>
        <button
          className={`filter-btn ${filter === 'verified' ? 'active' : ''}`}
          onClick={() => setFilter('verified')}
        >
          Verified
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button
          className={`filter-btn ${filter === 'rented' ? 'active' : ''}`}
          onClick={() => setFilter('rented')}
        >
          Rented
        </button>
      </div>

      {/* PROPERTIES GRID */}
      <div className="properties-grid">
        {getFilteredProperties().length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {filter === 'all' ? '🏠' :
                filter === 'verified' ? '✅' :
                  filter === 'pending' ? '⏳' : '💰'}
            </div>
            <h3>No {filter} properties found</h3>
            <p>
              {filter === 'all' ? 'Accept listings to start managing properties' :
                filter === 'verified' ? 'No verified properties yet' :
                  filter === 'pending' ? 'All properties are verified' :
                    'No rented properties yet'}
            </p>
            {filter !== 'all' && (
              <button
                className="btn btn-outline"
                onClick={() => setFilter('all')}
              >
                View All Properties
              </button>
            )}
          </div>
        ) : (
          getFilteredProperties().map(property => {
            const status = getPropertyStatus(property);
            const posterType = getPosterTypeLabel(property);
            const associatedChat = getAssociatedChat(property);
            const isPermanent = property.permanent_manager;

            return (
              <div key={property.id} className="property-card">
                <div className="property-header">
                  <div className="property-badges">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: status.bgColor, color: status.color }}
                    >
                      {status.icon} {status.label}
                    </span>
                    <span
                      className="poster-badge"
                      style={{ color: posterType.color }}
                    >
                      {posterType.icon} {posterType.label}
                    </span>
                    {isPermanent && (
                      <span className="badge permanent">👨‍💼 Permanent</span>
                    )}
                  </div>

                  <div className="property-price">
                    ₦{property.price?.toLocaleString()}/year
                  </div>
                </div>

                <div className="property-body">
                  <h4>{property.title}</h4>

                  <div className="property-details">
                    <div className="detail">
                      <span className="label">Location:</span>
                      <span className="value">{property.address}</span>
                    </div>
                    <div className="detail">
                      <span className="label">State/LGA:</span>
                      <span className="value">{property.state}, {property.lga}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Property Type:</span>
                      <span className="value">{property.type || 'Residential'}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Bedrooms:</span>
                      <span className="value">{property.bedrooms || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="commission-info">
                    <div className="commission-item">
                      <span className="label">Your Commission:</span>
                      <span className="value highlight">
                        ₦{(property.price * 0.025).toLocaleString()}
                      </span>
                    </div>
                    {/* Optionally show earned if we fetch commissions */}
                  </div>

                  {property.verification_date && (
                    <div className="verification-info">
                      <div className="verified-date">
                        <span className="label">Verified on:</span>
                        <span className="value">
                          {new Date(property.verification_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="property-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/listings/${property.id}`)}
                  >
                    View Listing
                  </button>

                  {associatedChat && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => navigate(`/dashboard/manager/chat/${associatedChat.id}/monitor`)}
                    >
                      {associatedChat.chat_type === 'manager_intermediary' ? 'Join Chat' : 'Monitor Chat'}
                    </button>
                  )}

                  {!property.verified && property.status !== 'rented' && (
                    <button
                      className="btn btn-warning"
                      onClick={() => verifyProperty(property.id)}
                    >
                      Verify Property
                    </button>
                  )}

                  {property.verified && !property.permanent_manager && (
                    <button
                      className="btn btn-info"
                      onClick={async () => {
                        try {
                          const { error } = await supabase
                            .from('listings')
                            .update({ permanent_manager: true })
                            .eq('id', property.id);
                          if (error) throw error;
                          alert('✅ Property marked as permanently assigned!');
                          loadProperties();
                        } catch (error) {
                          console.error('Error marking permanent:', error);
                          alert('Failed to update.');
                        }
                      }}
                    >
                      Mark as Permanent
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* VERIFICATION GUIDELINES */}
      <div className="verification-guidelines">
        <div className="guidelines-header">
          <h3>📋 Property Verification Guidelines</h3>
        </div>
        <div className="guidelines-content">
          <div className="guideline">
            <span className="guideline-icon">✅</span>
            <div className="guideline-text">
              <strong>Onsite Inspection Required</strong>
              <p>Visit the property in person to verify its existence and condition</p>
            </div>
          </div>
          <div className="guideline">
            <span className="guideline-icon">✅</span>
            <div className="guideline-text">
              <strong>Document Verification</strong>
              <p>Check property documents and ownership details</p>
            </div>
          </div>
          <div className="guideline">
            <span className="guideline-icon">✅</span>
            <div className="guideline-text">
              <strong>Permanent Assignment</strong>
              <p>After verification, you become the permanent manager for this property</p>
            </div>
          </div>
          <div className="guideline">
            <span className="guideline-icon">✅</span>
            <div className="guideline-text">
              <strong>Admin Oversight</strong>
              <p>All verifications can be reviewed and overridden by administrators</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerProperties;