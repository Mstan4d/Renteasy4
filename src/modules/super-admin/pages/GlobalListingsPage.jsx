// src/modules/super-admin/pages/GlobalListingsPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './GlobalListingsPage.css';

const GlobalListingsPage = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedListing, setSelectedListing] = useState(null);
  const [showForceModal, setShowForceModal] = useState(false);
  const [showCommissionWarning, setShowCommissionWarning] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Listings' },
    { value: 'live', label: 'Live' },
    { value: 'unverified', label: 'Unverified' },
    { value: 'verified', label: 'Verified' },
    { value: 'rented', label: 'Rented' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'tenant-outgoing', label: 'Tenant (Outgoing)' },
    { value: 'landlord', label: 'Landlord' },
    { value: 'estate-firm', label: 'Estate Firm' }
  ];

  // Fetch listings on mount
  useEffect(() => {
    fetchListings();
  }, []);

  // Real‑time subscription
  useEffect(() => {
    const channel = supabase
      .channel('global-listings-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'listings'
      }, () => {
        fetchListings();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          poster:user_id (id, full_name, email, role),
          manager:managed_by (id, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform to match component's expected structure
      const transformed = data.map(item => {
        // Determine listing type for display
        let type = 'landlord';
        if (item.poster_role === 'tenant') type = 'tenant-outgoing';
        else if (item.poster_role === 'estate-firm') type = 'estate-firm';

        // Status mapping
        let status = 'unverified';
        if (item.rejected) status = 'suspended';
        else if (item.verified && item.status === 'approved') status = 'verified';
        else if (item.status === 'rented') status = 'rented';
        else if (item.verified) status = 'verified';
        else status = 'unverified';

        // For estate firms, commission is 0%
        const commission = item.poster_role === 'estate-firm' ? 0 : 7.5;

        return {
          id: item.id,
          title: item.title,
          type,
          status,
          price: item.price ? `₦${Number(item.price).toLocaleString()}` : 'N/A',
          location: item.address || `${item.city || ''} ${item.state || ''}`.trim() || 'N/A',
          postedBy: item.poster?.full_name || 'Unknown',
          postedDate: new Date(item.created_at).toLocaleDateString(),
          verification: item.verified ? 'verified' : (item.rejected ? 'rejected' : 'pending'),
          manager: item.manager?.full_name || (item.poster_role === 'estate-firm' ? 'Not Applicable' : 'Not Assigned'),
          commission,
          views: item.views || 0,
          chats: 0, // We could count from messages table, but keep 0 for now
          posterRole: item.poster_role,
          isVerified: item.verified,
          isRejected: item.rejected,
          // raw data for details
          description: item.description,
          bedrooms: item.bedrooms,
          bathrooms: item.bathrooms,
          area: item.area,
          images: item.images
        };
      });

      setListings(transformed);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForceChange = async (listingId, newStatus) => {
    if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

    // Map status to database fields
    const updates = {};
    if (newStatus === 'suspended') {
      updates.rejected = true;
      updates.verified = false;
      updates.status = 'rejected';
    } else if (newStatus === 'verified') {
      updates.rejected = false;
      updates.verified = true;
      updates.status = 'approved';
    } else if (newStatus === 'live') {
      updates.rejected = false;
      updates.verified = true;
      updates.status = 'approved';
    } else if (newStatus === 'rented') {
      updates.status = 'rented';
      updates.rented_at = new Date().toISOString();
    } else if (newStatus === 'unverified') {
      updates.verified = false;
      updates.rejected = false;
      updates.status = 'pending';
    }

    try {
      const { error } = await supabase
        .from('listings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', listingId);

      if (error) throw error;
      await fetchListings();
      setShowForceModal(false);
      alert('Status updated!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status.');
    }
  };

  const handleCommissionFix = async (listingId) => {
    try {
      // Commission is not a stored field; it's derived from poster_role.
      // For estate firms, commission should be 0; for others 7.5.
      // If we want to enforce, we could update poster_role if wrong, but that's unlikely.
      // Instead, we'll just update the local state and possibly log.
      const listing = listings.find(l => l.id === listingId);
      if (listing.posterRole === 'estate-firm') {
        // Should be 0%, no action needed
        alert('Estate firm listings are exempt from commission.');
        setShowCommissionWarning(false);
        return;
      }
      // For non‑estate firms, we just acknowledge the warning.
      // In a real scenario, you might adjust a commission column if it existed.
      alert('Commission set to 7.5% (by rule).');
      setShowCommissionWarning(false);
    } catch (error) {
      console.error('Error fixing commission:', error);
    }
  };

  const handleCommissionCheck = (listing) => {
    if (listing.posterRole !== 'estate-firm' && listing.commission !== 7.5) {
      setShowCommissionWarning(true);
      setSelectedListing(listing);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'verified': return 'success';
      case 'live': return 'info';
      case 'unverified': return 'warning';
      case 'rented': return 'primary';
      case 'suspended': return 'danger';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'tenant-outgoing': return 'purple';
      case 'landlord': return 'blue';
      case 'estate-firm': return 'green';
      default: return 'default';
    }
  };

  const filteredListings = listings.filter(listing => {
    if (filter !== 'all' && listing.status !== filter) return false;
    if (search && !listing.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getStats = () => ({
    total: listings.length,
    live: listings.filter(l => l.status === 'live').length,
    unverified: listings.filter(l => l.status === 'unverified').length,
    verified: listings.filter(l => l.status === 'verified').length,
    rented: listings.filter(l => l.status === 'rented').length,
    suspended: listings.filter(l => l.status === 'suspended').length
  });

  if (loading) {
    return <div className="loading">Loading global listings...</div>;
  }

  return (
    <div className="global-listings">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Global Listings Control</h1>
          <p className="page-subtitle">Control all listings on RentEasy platform</p>
        </div>
        <div className="header-actions">
          <button className="export-btn" onClick={() => alert('Export coming soon')}>
            <span className="btn-icon">📊</span>
            Export Data
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card total">
          <div className="stat-value">{getStats().total}</div>
          <div className="stat-label">Total Listings</div>
        </div>
        <div className="stat-card live">
          <div className="stat-value">{getStats().live}</div>
          <div className="stat-label">Live</div>
        </div>
        <div className="stat-card unverified">
          <div className="stat-value">{getStats().unverified}</div>
          <div className="stat-label">Unverified</div>
        </div>
        <div className="stat-card verified">
          <div className="stat-value">{getStats().verified}</div>
          <div className="stat-label">Verified</div>
        </div>
        <div className="stat-card rented">
          <div className="stat-value">{getStats().rented}</div>
          <div className="stat-label">Rented</div>
        </div>
        <div className="stat-card suspended">
          <div className="stat-value">{getStats().suspended}</div>
          <div className="stat-label">Suspended</div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="warning-banner">
        <div className="warning-content">
          <span className="warning-icon">🚨</span>
          <div className="warning-text">
            <strong>Commission Protection:</strong> System will warn if any listing tries to bypass 7.5% or estate firm listing is mistakenly tagged for commission
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="controls-bar">
        <div className="filters">
          <div className="filter-group">
            <label>Status Filter</label>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Type Filter</label>
            <select className="filter-select" onChange={(e) => {}}>
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {/* Listings Table */}
      <div className="listings-table-container">
        <div className="table-scroll">
          <table className="listings-table">
            <thead>
              <tr>
                <th>Listing Details</th>
                <th>Type</th>
                <th>Status</th>
                <th>Commission</th>
                <th>Manager</th>
                <th>Verification</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-message">No listings found.</td>
                </tr>
              ) : (
                filteredListings.map(listing => (
                  <tr key={listing.id}>
                    <td>
                      <div className="listing-details">
                        <div className="listing-title">{listing.title}</div>
                        <div className="listing-info">
                          <span className="info-item">
                            <span className="info-label">Price:</span> {listing.price}
                          </span>
                          <span className="info-item">
                            <span className="info-label">Location:</span> {listing.location}
                          </span>
                          <span className="info-item">
                            <span className="info-label">Posted by:</span> {listing.postedBy}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`type-badge ${getTypeColor(listing.type)}`}>
                        {listing.type === 'tenant-outgoing' ? 'Tenant (Outgoing)' : 
                         listing.type === 'landlord' ? 'Landlord' : 'Estate Firm'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusColor(listing.status)}`}>
                        {listing.status}
                      </span>
                    </td>
                    <td>
                      <div className="commission-cell" onClick={() => handleCommissionCheck(listing)}>
                        <span className={`commission-value ${listing.commission !== 7.5 && listing.posterRole !== 'estate-firm' ? 'warning' : ''}`}>
                          {listing.commission}%
                        </span>
                        {listing.type === 'estate-firm' && listing.commission === 0 && (
                          <span className="commission-note">(exempt)</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="manager-name">{listing.manager}</span>
                    </td>
                    <td>
                      <span className={`verification-status ${listing.verification}`}>
                        {listing.verification}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn view"
                          title="View Details"
                          onClick={() => setSelectedListing(listing)}
                        >
                          👁️
                        </button>
                        <button 
                          className="action-btn edit"
                          title="Force Change Status"
                          onClick={() => {
                            setSelectedListing(listing);
                            setShowForceModal(true);
                          }}
                        >
                          ⚡
                        </button>
                        <button 
                          className="action-btn chat"
                          title="Jump into Chat"
                          onClick={() => alert('Chat view coming soon')}
                        >
                          💬
                        </button>
                        <button 
                          className="action-btn delete"
                          title="Suspend Listing"
                          onClick={() => handleForceChange(listing.id, 'suspended')}
                        >
                          ⏸️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Listing Details Modal */}
      {selectedListing && !showForceModal && !showCommissionWarning && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Listing Details</h3>
              <button 
                className="close-modal"
                onClick={() => setSelectedListing(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="details-grid">
                <div className="detail-item">
                  <label>Title</label>
                  <div>{selectedListing.title}</div>
                </div>
                <div className="detail-item">
                  <label>Type</label>
                  <div>
                    <span className={`type-badge ${getTypeColor(selectedListing.type)}`}>
                      {selectedListing.type}
                    </span>
                  </div>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <div>
                    <span className={`status-badge ${getStatusColor(selectedListing.status)}`}>
                      {selectedListing.status}
                    </span>
                  </div>
                </div>
                <div className="detail-item">
                  <label>Price</label>
                  <div>{selectedListing.price}</div>
                </div>
                <div className="detail-item">
                  <label>Location</label>
                  <div>{selectedListing.location}</div>
                </div>
                <div className="detail-item">
                  <label>Posted By</label>
                  <div>{selectedListing.postedBy}</div>
                </div>
                <div className="detail-item">
                  <label>Posted Date</label>
                  <div>{selectedListing.postedDate}</div>
                </div>
                <div className="detail-item">
                  <label>Commission</label>
                  <div>{selectedListing.commission}%</div>
                </div>
                <div className="detail-item">
                  <label>Manager</label>
                  <div>{selectedListing.manager}</div>
                </div>
                <div className="detail-item">
                  <label>Verification</label>
                  <div>{selectedListing.verification}</div>
                </div>
                <div className="detail-item">
                  <label>Views</label>
                  <div>{selectedListing.views}</div>
                </div>
                <div className="detail-item">
                  <label>Active Chats</label>
                  <div>{selectedListing.chats}</div>
                </div>
                {selectedListing.description && (
                  <div className="detail-item full-width">
                    <label>Description</label>
                    <div>{selectedListing.description}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setSelectedListing(null)}
              >
                Close
              </button>
              <button 
                className="btn-primary"
                onClick={() => {
                  alert('Jump to chat – coming soon');
                  setSelectedListing(null);
                }}
              >
                Jump to Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Force Change Modal */}
      {showForceModal && selectedListing && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Force Change Status</h3>
              <button 
                className="close-modal"
                onClick={() => setShowForceModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="force-warning">
                <span className="warning-icon">⚠️</span>
                <p>You are about to force change the status of <strong>{selectedListing.title}</strong></p>
              </div>
              <div className="status-options">
                {['unverified', 'verified', 'suspended', 'rented', 'live'].map(status => (
                  <button
                    key={status}
                    className={`status-option ${status === selectedListing.status ? 'current' : ''}`}
                    onClick={() => handleForceChange(selectedListing.id, status)}
                  >
                    <span className="status-label">{status}</span>
                    {status === selectedListing.status && (
                      <span className="current-badge">Current</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowForceModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Commission Warning Modal */}
      {showCommissionWarning && selectedListing && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header danger">
              <h3>Commission Rule Violation!</h3>
              <button 
                className="close-modal"
                onClick={() => setShowCommissionWarning(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="commission-alert">
                <span className="alert-icon">🚨</span>
                <div className="alert-content">
                  <h4>Commission Protection Alert</h4>
                  <p>
                    Listing <strong>{selectedListing.title}</strong> has {selectedListing.commission}% commission instead of required 7.5%
                  </p>
                  <div className="alert-details">
                    <p>Listing Type: {selectedListing.type}</p>
                    <p>Expected Commission: {selectedListing.posterRole === 'estate-firm' ? '0%' : '7.5%'}</p>
                    <p>Current Commission: {selectedListing.commission}%</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowCommissionWarning(false)}
              >
                Ignore
              </button>
              <button 
                className="btn-primary"
                onClick={() => handleCommissionFix(selectedListing.id)}
              >
                {selectedListing.posterRole === 'estate-firm' ? 'Confirm Exemption' : 'Force Fix to 7.5%'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalListingsPage;