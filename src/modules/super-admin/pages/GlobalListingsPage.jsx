import React, { useState, useEffect } from 'react';
import './GlobalListingsPage.css';

const GlobalListingsPage = () => {
  const [listings, setListings] = useState([
    {
      id: 1,
      title: '3-Bedroom Duplex in Lekki',
      type: 'landlord',
      status: 'verified',
      price: '₦750,000',
      location: 'Lekki Phase 1, Lagos',
      postedBy: 'John Doe',
      postedDate: '2024-01-15',
      verification: 'verified',
      manager: 'Michael Manager',
      commission: 7.5,
      views: 245,
      chats: 12
    },
    {
      id: 2,
      title: '2-Bedroom Apartment',
      type: 'tenant-outgoing',
      status: 'unverified',
      price: '₦350,000',
      location: 'Ikeja, Lagos',
      postedBy: 'Jane Smith (Tenant)',
      postedDate: '2024-01-16',
      verification: 'pending',
      manager: 'Not Assigned',
      commission: 7.5,
      views: 89,
      chats: 3
    },
    {
      id: 3,
      title: 'Office Space in VI',
      type: 'estate-firm',
      status: 'suspended',
      price: '₦1,200,000',
      location: 'Victoria Island, Lagos',
      postedBy: 'Prime Estates Ltd',
      postedDate: '2024-01-10',
      verification: 'verified',
      manager: 'Not Applicable',
      commission: 0,
      views: 156,
      chats: 8
    },
    {
      id: 4,
      title: 'Studio Apartment',
      type: 'landlord',
      status: 'rented',
      price: '₦250,000',
      location: 'Yaba, Lagos',
      postedBy: 'David Brown',
      postedDate: '2024-01-05',
      verification: 'verified',
      manager: 'Sarah Manager',
      commission: 7.5,
      views: 312,
      chats: 18
    },
    {
      id: 5,
      title: '5-Bedroom Mansion',
      type: 'estate-firm',
      status: 'live',
      price: '₦2,500,000',
      location: 'Banana Island, Lagos',
      postedBy: 'Elite Properties',
      postedDate: '2024-01-18',
      verification: 'verified',
      manager: 'Not Applicable',
      commission: 0,
      views: 189,
      chats: 5
    }
  ]);

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

  const handleForceChange = (listingId, newStatus) => {
    if (window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      setListings(listings.map(listing => 
        listing.id === listingId ? { ...listing, status: newStatus } : listing
      ));
      setShowForceModal(false);
    }
  };

  const handleCommissionCheck = (listing) => {
    if (listing.type !== 'estate-firm' && listing.commission !== 7.5) {
      setShowCommissionWarning(true);
      setSelectedListing(listing);
    }
  };

  const filteredListings = listings.filter(listing => {
    if (filter !== 'all' && listing.status !== filter) return false;
    if (search && !listing.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getStats = () => {
    return {
      total: listings.length,
      live: listings.filter(l => l.status === 'live').length,
      unverified: listings.filter(l => l.status === 'unverified').length,
      verified: listings.filter(l => l.status === 'verified').length,
      rented: listings.filter(l => l.status === 'rented').length,
      suspended: listings.filter(l => l.status === 'suspended').length
    };
  };

  return (
    <div className="global-listings">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Global Listings Control</h1>
          <p className="page-subtitle">Control all listings on RentEasy platform</p>
        </div>
        <div className="header-actions">
          <button className="export-btn">
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
            <select className="filter-select">
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
              {filteredListings.map(listing => (
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
                      <span className={`commission-value ${listing.commission !== 7.5 ? 'warning' : ''}`}>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Listing Details Modal */}
      {selectedListing && (
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
                  // Jump to chat
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
                    <p>Expected Commission: 7.5%</p>
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
                onClick={() => {
                  setListings(listings.map(l => 
                    l.id === selectedListing.id ? { ...l, commission: 7.5 } : l
                  ));
                  setShowCommissionWarning(false);
                }}
              >
                Force Fix to 7.5%
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalListingsPage;