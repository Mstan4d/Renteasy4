import React, { useState, useEffect } from 'react';
import './GlobalManagersPage.css';

const GlobalManagersPage = () => {
  const [managers, setManagers] = useState([
    {
      id: 1,
      name: 'Michael Manager',
      email: 'michael@renteasy.com',
      status: 'online',
      location: 'Lekki, Lagos',
      listings: 12,
      earnings: 1250000,
      rating: 4.8,
      assignments: 5,
      joined: '2024-01-01',
      lastActive: '2 mins ago',
      proximityRadius: '5km',
      performance: 95
    },
    {
      id: 2,
      name: 'Sarah Manager',
      email: 'sarah@renteasy.com',
      status: 'offline',
      location: 'Ikeja, Lagos',
      listings: 8,
      earnings: 850000,
      rating: 4.5,
      assignments: 3,
      joined: '2024-01-05',
      lastActive: '2 hours ago',
      proximityRadius: '3km',
      performance: 87
    },
    {
      id: 3,
      name: 'John Manager',
      email: 'john@renteasy.com',
      status: 'online',
      location: 'Victoria Island, Lagos',
      listings: 15,
      earnings: 1850000,
      rating: 4.9,
      assignments: 7,
      joined: '2023-12-15',
      lastActive: 'Just now',
      proximityRadius: '7km',
      performance: 98
    },
    {
      id: 4,
      name: 'David Manager',
      email: 'david@renteasy.com',
      status: 'suspended',
      location: 'Yaba, Lagos',
      listings: 5,
      earnings: 450000,
      rating: 3.8,
      assignments: 2,
      joined: '2024-01-10',
      lastActive: '3 days ago',
      proximityRadius: '4km',
      performance: 45
    },
    {
      id: 5,
      name: 'Jessica Manager',
      email: 'jessica@renteasy.com',
      status: 'online',
      location: 'Surulere, Lagos',
      listings: 10,
      earnings: 950000,
      rating: 4.7,
      assignments: 4,
      joined: '2024-01-08',
      lastActive: '5 mins ago',
      proximityRadius: '6km',
      performance: 91
    }
  ]);

  const [selectedManager, setSelectedManager] = useState(null);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [mapView, setMapView] = useState(false);

  const stats = {
    total: managers.length,
    online: managers.filter(m => m.status === 'online').length,
    offline: managers.filter(m => m.status === 'offline').length,
    suspended: managers.filter(m => m.status === 'suspended').length,
    totalListings: managers.reduce((sum, m) => sum + m.listings, 0),
    totalEarnings: managers.reduce((sum, m) => sum + m.earnings, 0)
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'online': return 'success';
      case 'offline': return 'warning';
      case 'suspended': return 'danger';
      default: return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleSuspendManager = (managerId) => {
    if (window.confirm('Are you sure you want to suspend this manager?')) {
      setManagers(managers.map(manager => 
        manager.id === managerId ? { ...manager, status: 'suspended' } : manager
      ));
    }
  };

  const handleActivateManager = (managerId) => {
    setManagers(managers.map(manager => 
      manager.id === managerId ? { ...manager, status: 'online' } : manager
    ));
  };

  const handleReassignListings = (fromManagerId, toManagerId) => {
    // In production, this would make an API call
    alert(`Reassigning listings from Manager ${fromManagerId} to Manager ${toManagerId}`);
    setShowReassignModal(false);
  };

  const handleOverrideFirstAccept = (managerId) => {
    // In production, this would make an API call
    alert(`Overriding first accept decision for Manager ${managerId}`);
    setShowOverrideModal(false);
  };

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'danger';
  };

  const filteredManagers = managers.filter(manager => {
    if (filter === 'all') return true;
    return manager.status === filter;
  });

  return (
    <div className="global-managers">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Global Managers Control</h1>
          <p className="page-subtitle">Monitor and control all RentEasy managers</p>
        </div>
        <div className="header-actions">
          <button 
            className={`view-toggle ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            📋 List
          </button>
          <button 
            className={`view-toggle ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            🗺️ Map View
          </button>
        </div>
      </div>

      {/* System Warning */}
      <div className="system-warning">
        <div className="warning-content">
          <span className="warning-icon">🚫</span>
          <div className="warning-text">
            <strong>System Enforcement:</strong> Two managers can NEVER monitor the same chat. Even Super Admin must explicitly force override.
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card total">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Managers</div>
        </div>
        <div className="stat-card online">
          <div className="stat-icon">🟢</div>
          <div className="stat-value">{stats.online}</div>
          <div className="stat-label">Online</div>
        </div>
        <div className="stat-card offline">
          <div className="stat-icon">⚫</div>
          <div className="stat-value">{stats.offline}</div>
          <div className="stat-label">Offline</div>
        </div>
        <div className="stat-card listings">
          <div className="stat-icon">🏠</div>
          <div className="stat-value">{stats.totalListings}</div>
          <div className="stat-label">Total Listings</div>
        </div>
        <div className="stat-card earnings">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{formatCurrency(stats.totalEarnings)}</div>
          <div className="stat-label">Total Earnings</div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-bar">
        <div className="filters">
          <div className="filter-group">
            <label>Status Filter</label>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Managers</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search managers..."
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {/* Managers Grid */}
      {viewMode === 'list' ? (
        <div className="managers-grid">
          {filteredManagers.map(manager => (
            <div key={manager.id} className="manager-card">
              <div className="manager-header">
                <div className="manager-info">
                  <div className="manager-avatar">
                    {manager.name.charAt(0)}
                  </div>
                  <div className="manager-details">
                    <h3 className="manager-name">{manager.name}</h3>
                    <p className="manager-email">{manager.email}</p>
                    <div className="manager-meta">
                      <span className="meta-item">
                        <span className="meta-label">Joined:</span> {manager.joined}
                      </span>
                      <span className="meta-item">
                        <span className="meta-label">Last Active:</span> {manager.lastActive}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="manager-status">
                  <span className={`status-badge ${getStatusColor(manager.status)}`}>
                    {manager.status.toUpperCase()}
                  </span>
                  <div className="rating">
                    <span className="rating-stars">{"★".repeat(Math.floor(manager.rating))}</span>
                    <span className="rating-value">{manager.rating}</span>
                  </div>
                </div>
              </div>

              <div className="manager-stats">
                <div className="stat-item">
                  <span className="stat-label">Listings</span>
                  <span className="stat-value">{manager.listings}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Earnings</span>
                  <span className="stat-value">{formatCurrency(manager.earnings)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Active Assignments</span>
                  <span className="stat-value">{manager.assignments}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Performance</span>
                  <span className={`stat-value ${getPerformanceColor(manager.performance)}`}>
                    {manager.performance}%
                  </span>
                </div>
              </div>

              <div className="manager-details-row">
                <div className="detail">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{manager.location}</span>
                </div>
                <div className="detail">
                  <span className="detail-label">Proximity Radius:</span>
                  <span className="detail-value">{manager.proximityRadius}</span>
                </div>
              </div>

              <div className="manager-actions">
                <button 
                  className="action-btn view-listings"
                  onClick={() => setSelectedManager(manager)}
                >
                  View Listings
                </button>
                <button 
                  className="action-btn chat"
                  title="Jump to Manager's Chats"
                >
                  💬
                </button>
                {manager.status !== 'suspended' ? (
                  <button 
                    className="action-btn suspend"
                    onClick={() => handleSuspendManager(manager.id)}
                  >
                    ⏸️ Suspend
                  </button>
                ) : (
                  <button 
                    className="action-btn activate"
                    onClick={() => handleActivateManager(manager.id)}
                  >
                    ▶️ Activate
                  </button>
                )}
                <button 
                  className="action-btn override"
                  onClick={() => {
                    setSelectedManager(manager);
                    setShowOverrideModal(true);
                  }}
                  title="Override First Accept"
                >
                  ⚡
                </button>
                <button 
                  className="action-btn reassign"
                  onClick={() => {
                    setSelectedManager(manager);
                    setShowReassignModal(true);
                  }}
                  title="Reassign Listings"
                >
                  🔄
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="map-view">
          <div className="map-placeholder">
            <div className="map-mock">
              {/* This would be a real map in production */}
              <div className="map-grid">
                {managers.map(manager => (
                  <div 
                    key={manager.id}
                    className={`map-marker ${manager.status}`}
                    style={{
                      left: `${Math.random() * 80 + 10}%`,
                      top: `${Math.random() * 80 + 10}%`
                    }}
                    title={`${manager.name} - ${manager.location}`}
                  >
                    <span className="marker-icon">📍</span>
                    <div className="marker-tooltip">
                      <strong>{manager.name}</strong>
                      <p>{manager.location}</p>
                      <p>{manager.listings} listings</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="map-legend">
              <div className="legend-item">
                <span className="legend-dot online"></span>
                <span>Online Managers</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot offline"></span>
                <span>Offline Managers</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot suspended"></span>
                <span>Suspended Managers</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manager Details Modal */}
      {selectedManager && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Manager Details</h3>
              <button 
                className="close-modal"
                onClick={() => setSelectedManager(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="manager-details-modal">
                <div className="manager-profile">
                  <div className="profile-avatar">
                    {selectedManager.name.charAt(0)}
                  </div>
                  <div className="profile-info">
                    <h3>{selectedManager.name}</h3>
                    <p>{selectedManager.email}</p>
                    <span className={`status-badge ${getStatusColor(selectedManager.status)}`}>
                      {selectedManager.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="details-grid">
                  <div className="detail-item">
                    <label>Location</label>
                    <div>{selectedManager.location}</div>
                  </div>
                  <div className="detail-item">
                    <label>Proximity Radius</label>
                    <div>{selectedManager.proximityRadius}</div>
                  </div>
                  <div className="detail-item">
                    <label>Joined Date</label>
                    <div>{selectedManager.joined}</div>
                  </div>
                  <div className="detail-item">
                    <label>Last Active</label>
                    <div>{selectedManager.lastActive}</div>
                  </div>
                  <div className="detail-item">
                    <label>Rating</label>
                    <div>{selectedManager.rating} ⭐</div>
                  </div>
                  <div className="detail-item">
                    <label>Performance Score</label>
                    <div>
                      <span className={`performance-score ${getPerformanceColor(selectedManager.performance)}`}>
                        {selectedManager.performance}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="stats-section">
                  <h4>Manager Statistics</h4>
                  <div className="stats-row">
                    <div className="stat-box">
                      <div className="stat-label">Total Listings</div>
                      <div className="stat-value">{selectedManager.listings}</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-label">Active Assignments</div>
                      <div className="stat-value">{selectedManager.assignments}</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-label">Total Earnings</div>
                      <div className="stat-value">{formatCurrency(selectedManager.earnings)}</div>
                    </div>
                  </div>
                </div>

                <div className="assigned-listings">
                  <h4>Assigned Listings ({selectedManager.listings})</h4>
                  <div className="listings-list">
                    {/* Mock listings data */}
                    {Array.from({ length: Math.min(selectedManager.listings, 3) }).map((_, index) => (
                      <div key={index} className="listing-item">
                        <span className="listing-title">Listing #{selectedManager.id * 100 + index + 1}</span>
                        <button className="jump-to-listing">→</button>
                      </div>
                    ))}
                    {selectedManager.listings > 3 && (
                      <div className="more-listings">
                        + {selectedManager.listings - 3} more listings
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setSelectedManager(null)}
              >
                Close
              </button>
              <button 
                className="btn-primary"
                onClick={() => {
                  // Jump to manager's dashboard
                  setSelectedManager(null);
                }}
              >
                Jump to Manager Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reassign Listings Modal */}
      {showReassignModal && selectedManager && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Reassign Listings</h3>
              <button 
                className="close-modal"
                onClick={() => setShowReassignModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="reassign-warning">
                <span className="warning-icon">⚠️</span>
                <p>
                  You are about to reassign <strong>{selectedManager.listings}</strong> listings from 
                  <strong> {selectedManager.name}</strong>. This action will transfer all listings to another manager.
                </p>
              </div>
              <div className="form-group">
                <label>Select Target Manager</label>
                <select className="form-select">
                  <option value="">Select a manager...</option>
                  {managers
                    .filter(m => m.id !== selectedManager.id && m.status !== 'suspended')
                    .map(manager => (
                      <option key={manager.id} value={manager.id}>
                        {manager.name} - {manager.location} ({manager.listings} listings)
                      </option>
                    ))
                  }
                </select>
              </div>
              <div className="confirmation-check">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  I understand this action cannot be undone
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowReassignModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary danger"
                onClick={() => {
                  const targetManagerId = document.querySelector('.form-select').value;
                  if (targetManagerId) {
                    handleReassignListings(selectedManager.id, parseInt(targetManagerId));
                  }
                }}
              >
                Reassign Listings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Override First Accept Modal */}
      {showOverrideModal && selectedManager && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Override First Accept Decision</h3>
              <button 
                className="close-modal"
                onClick={() => setShowOverrideModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="override-warning">
                <span className="warning-icon">🚨</span>
                <div className="warning-content">
                  <h4>CRITICAL SYSTEM OVERRIDE</h4>
                  <p>
                    You are about to override the "first accept" decision for 
                    <strong> {selectedManager.name}</strong>. This violates the normal system flow.
                  </p>
                  <div className="override-rules">
                    <p><strong>System Rule:</strong> First manager to accept notification becomes listing manager</p>
                    <p><strong>Override Impact:</strong> This will reassign listings that were not originally assigned to this manager</p>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Override Reason</label>
                <textarea 
                  className="form-textarea"
                  placeholder="Explain why this override is necessary..."
                  rows="3"
                ></textarea>
              </div>
              <div className="confirmation-check">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  I confirm this override is necessary and will be logged for audit
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowOverrideModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary danger"
                onClick={() => handleOverrideFirstAccept(selectedManager.id)}
              >
                Force Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalManagersPage;