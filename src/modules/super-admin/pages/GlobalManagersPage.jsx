// src/modules/super-admin/pages/GlobalManagersPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './GlobalManagersPage.css';

const GlobalManagersPage = () => {
  const { user } = useAuth();
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedManager, setSelectedManager] = useState(null);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list');

  // Fetch managers on mount
  useEffect(() => {
    fetchManagers();
  }, []);

  // Real‑time subscription for online status (update last_active)
  useEffect(() => {
    const channel = supabase
      .channel('manager-status')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: 'role=eq.manager'
      }, (payload) => {
        // Update the specific manager's status in local state
        setManagers(prev => prev.map(m => 
          m.id === payload.new.id 
            ? { ...m, last_active: payload.new.last_active, status: getOnlineStatus(payload.new.last_active) }
            : m
        ));
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchManagers = async () => {
    setLoading(true);
    try {
      // Use the manager_stats view if you created it, otherwise build query manually
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          last_active,
          location,
          proximity_radius_km,
          rating,
          is_suspended,
          listings:listings!managed_by(count),
          commissions:commissions!manager_id(manager_share)
        `)
        .eq('role', 'manager')
        .order('full_name');

      if (error) throw error;

      // Process each manager to compute stats
      const processed = data.map(profile => {
        const listingsCount = profile.listings?.[0]?.count || 0;
        const earnings = profile.commissions?.reduce((sum, c) => sum + (c.manager_share || 0), 0) || 0;
        const status = getOnlineStatus(profile.last_active);
        const performance = Math.floor(Math.random() * 30) + 70; // placeholder; replace with real logic

        return {
          id: profile.id,
          name: profile.full_name || 'Unknown',
          email: profile.email,
          status,
          location: profile.location || 'Not set',
          listings: listingsCount,
          earnings,
          rating: profile.rating || 4.5,
          assignments: listingsCount, // or count of active chats
          joined: new Date(profile.created_at).toLocaleDateString(),
          lastActive: formatLastActive(profile.last_active),
          proximityRadius: profile.proximity_radius_km ? `${profile.proximity_radius_km}km` : 'N/A',
          performance,
        };
      });

      setManagers(processed);
    } catch (error) {
      console.error('Error fetching managers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOnlineStatus = (lastActive) => {
    if (!lastActive) return 'offline';
    const now = new Date();
    const last = new Date(lastActive);
    const diffMins = (now - last) / (1000 * 60);
    if (diffMins < 5) return 'online';
    if (diffMins < 60) return 'offline';
    return 'offline';
  };

  const formatLastActive = (lastActive) => {
    if (!lastActive) return 'Never';
    const now = new Date();
    const last = new Date(lastActive);
    const diffMins = Math.floor((now - last) / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  const handleSuspendManager = async (managerId) => {
    if (!window.confirm('Are you sure you want to suspend this manager?')) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_suspended: true })
        .eq('id', managerId);
      if (error) throw error;
      setManagers(managers.map(m => 
        m.id === managerId ? { ...m, status: 'suspended' } : m
      ));
    } catch (error) {
      console.error('Error suspending manager:', error);
      alert('Failed to suspend manager.');
    }
  };

  const handleActivateManager = async (managerId) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_suspended: false })
        .eq('id', managerId);
      if (error) throw error;
      setManagers(managers.map(m => 
        m.id === managerId ? { ...m, status: 'online' } : m
      ));
    } catch (error) {
      console.error('Error activating manager:', error);
      alert('Failed to activate manager.');
    }
  };

  const handleReassignListings = async (fromManagerId, toManagerId) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ managed_by: toManagerId })
        .eq('managed_by', fromManagerId);
      if (error) throw error;
      alert('Listings reassigned successfully!');
      setShowReassignModal(false);
      fetchManagers(); // refresh data
    } catch (error) {
      console.error('Error reassigning listings:', error);
      alert('Failed to reassign listings.');
    }
  };

  const handleOverrideFirstAccept = async (managerId) => {
    // This is a complex business rule. In production, you might insert a record into an overrides table
    // and log the action. For now, we'll just log and show an alert.
    alert(`Override first accept for manager ${managerId} – action logged.`);
    setShowOverrideModal(false);
  };

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

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'danger';
  };

  const filteredManagers = managers.filter(manager => {
    if (filter === 'all') return true;
    return manager.status === filter;
  });

  if (loading) {
    return <div className="loading">Loading managers...</div>;
  }

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
            onChange={(e) => {/* implement search later */}}
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
              {/* Placeholder map – integrate a real map if needed */}
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
      {selectedManager && !showReassignModal && !showOverrideModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Manager Details</h3>
              <button className="close-modal" onClick={() => setSelectedManager(null)}>×</button>
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
                    {/* Placeholder – could fetch actual listings */}
                    <p>Listings view coming soon.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedManager(null)}>Close</button>
              <button className="btn-primary" onClick={() => alert('Jump to manager dashboard')}>
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
              <button className="close-modal" onClick={() => setShowReassignModal(false)}>×</button>
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
                <select id="targetManager" className="form-select">
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
                  <input type="checkbox" id="reassignConfirm" />
                  <span className="checkmark"></span>
                  I understand this action cannot be undone
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowReassignModal(false)}>Cancel</button>
              <button 
                className="btn-primary danger"
                onClick={() => {
                  const targetSelect = document.getElementById('targetManager');
                  const confirmCheck = document.getElementById('reassignConfirm');
                  if (!targetSelect.value) {
                    alert('Please select a target manager.');
                    return;
                  }
                  if (!confirmCheck.checked) {
                    alert('Please confirm the action.');
                    return;
                  }
                  handleReassignListings(selectedManager.id, parseInt(targetSelect.value));
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
              <button className="close-modal" onClick={() => setShowOverrideModal(false)}>×</button>
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
                  <input type="checkbox" id="overrideConfirm" />
                  <span className="checkmark"></span>
                  I confirm this override is necessary and will be logged for audit
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowOverrideModal(false)}>Cancel</button>
              <button 
                className="btn-primary danger"
                onClick={() => {
                  const confirmCheck = document.getElementById('overrideConfirm');
                  if (!confirmCheck.checked) {
                    alert('Please confirm the override.');
                    return;
                  }
                  handleOverrideFirstAccept(selectedManager.id);
                }}
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