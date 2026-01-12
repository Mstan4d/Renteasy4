import React, { useState, useEffect } from 'react';
import './CommandCenterPage.css';

const CommandCenterPage = () => {
  const [metrics, setMetrics] = useState({
    totalListings: { live: 145, unverified: 23, verified: 89, rented: 33, suspended: 5 },
    activeChats: { tenantLandlord: 45, tenantManager: 67, total: 112 },
    managerStatus: { online: 28, offline: 12, total: 40 },
    disputes: { pending: 8, resolved: 24, escalated: 3 },
    revenue: { today: 125000, thisMonth: 1850000, lifetime: 45200000 },
    commissionSummary: { manager: 1250000, referrer: 500000, rentEasy: 2000000 }
  });

  const [liveUpdates, setLiveUpdates] = useState([
    { id: 1, type: 'listing', action: 'New listing posted', location: 'Lekki Phase 1', time: '2 mins ago' },
    { id: 2, type: 'payment', action: 'Payment confirmed', amount: '₦750,000', time: '5 mins ago' },
    { id: 3, type: 'chat', action: 'New chat started', parties: 'Tenant ↔ Landlord', time: '10 mins ago' },
    { id: 4, type: 'verification', action: 'Property verified', manager: 'John Manager', time: '15 mins ago' },
    { id: 5, type: 'dispute', action: 'Dispute escalated', listing: '3-bedroom duplex', time: '25 mins ago' },
  ]);

  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // Simulate live updates
    const interval = setInterval(() => {
      if (isLive) {
        // In production, this would fetch real data
        console.log('Fetching live data...');
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

  // In src/modules/super-admin/components/CommandCenter.jsx
//useEffect(() => {
   // console.log('CommandCenter mounted');
   // console.log('platformData:', platformData);
  //  console.log('recentActivities:', recentActivities);
 // }, [platformData, recentActivities]);

  return (
    <div className="command-center">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Command Center</h1>
          <p className="page-subtitle">Live operational snapshot of the entire platform</p>
        </div>
        <div className="header-right">
          <div className="live-status">
            <span className={`status-indicator ${isLive ? 'live' : 'paused'}`}></span>
            <span className="status-text">{isLive ? 'LIVE' : 'PAUSED'}</span>
            <button 
              className="toggle-live-btn"
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? 'Pause' : 'Resume'}
            </button>
          </div>
          <div className="last-update">
            Last update: Just now
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="stats-grid">
        {/* Total Listings Card */}
        <div className="stat-card listings-card">
          <div className="stat-header">
            <span className="stat-icon">🏠</span>
            <h3>Total Listings</h3>
          </div>
          <div className="stat-content">
            <div className="stat-main">
              <span className="stat-value">{metrics.totalListings.live + metrics.totalListings.rented}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-breakdown">
              <div className="breakdown-item">
                <span className="breakdown-label">Unverified</span>
                <span className="breakdown-value">{metrics.totalListings.unverified}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Verified</span>
                <span className="breakdown-value">{metrics.totalListings.verified}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Rented</span>
                <span className="breakdown-value">{metrics.totalListings.rented}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Chats Card */}
        <div className="stat-card chats-card">
          <div className="stat-header">
            <span className="stat-icon">💬</span>
            <h3>Active Chats</h3>
          </div>
          <div className="stat-content">
            <div className="stat-main">
              <span className="stat-value">{metrics.activeChats.total}</span>
              <span className="stat-label">Total Conversations</span>
            </div>
            <div className="stat-breakdown">
              <div className="breakdown-item">
                <span className="breakdown-label">Tenant ↔ Landlord</span>
                <span className="breakdown-value">{metrics.activeChats.tenantLandlord}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Tenant ↔ Manager</span>
                <span className="breakdown-value">{metrics.activeChats.tenantManager}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Managers Status Card */}
        <div className="stat-card managers-card">
          <div className="stat-header">
            <span className="stat-icon">🛡️</span>
            <h3>Managers Status</h3>
          </div>
          <div className="stat-content">
            <div className="stat-main">
              <span className="stat-value">{metrics.managerStatus.online}</span>
              <span className="stat-label">Online Now</span>
            </div>
            <div className="stat-details">
              <div className="status-meter">
                <div className="meter-bar">
                  <div 
                    className="meter-fill" 
                    style={{ 
                      width: `${(metrics.managerStatus.online / metrics.managerStatus.total) * 100}%`,
                      backgroundColor: getStatusColor((metrics.managerStatus.online / metrics.managerStatus.total) * 100) === 'success' ? '#38a169' : 
                                     getStatusColor((metrics.managerStatus.online / metrics.managerStatus.total) * 100) === 'warning' ? '#dd6b20' : '#e53e3e'
                    }}
                  ></div>
                </div>
                <span className="meter-label">
                  {Math.round((metrics.managerStatus.online / metrics.managerStatus.total) * 100)}% Online
                </span>
              </div>
              <div className="total-managers">
                Total: {metrics.managerStatus.total} managers
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="stat-card revenue-card">
          <div className="stat-header">
            <span className="stat-icon">💰</span>
            <h3>Revenue</h3>
          </div>
          <div className="stat-content">
            <div className="revenue-main">
              <div className="revenue-item">
                <span className="revenue-label">Today</span>
                <span className="revenue-value">{formatCurrency(metrics.revenue.today)}</span>
              </div>
              <div className="revenue-item">
                <span className="revenue-label">This Month</span>
                <span className="revenue-value">{formatCurrency(metrics.revenue.thisMonth)}</span>
              </div>
              <div className="revenue-item">
                <span className="revenue-label">Lifetime</span>
                <span className="revenue-value">{formatCurrency(metrics.revenue.lifetime)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Disputes Card */}
        <div className="stat-card disputes-card">
          <div className="stat-header">
            <span className="stat-icon">⚖️</span>
            <h3>Disputes</h3>
          </div>
          <div className="stat-content">
            <div className="dispute-summary">
              <div className="dispute-item pending">
                <span className="dispute-count">{metrics.disputes.pending}</span>
                <span className="dispute-label">Pending</span>
              </div>
              <div className="dispute-item resolved">
                <span className="dispute-count">{metrics.disputes.resolved}</span>
                <span className="dispute-label">Resolved</span>
              </div>
              <div className="dispute-item escalated">
                <span className="dispute-count">{metrics.disputes.escalated}</span>
                <span className="dispute-label">Escalated</span>
              </div>
            </div>
            <div className="dispute-actions">
              <button className="action-btn view-all">View All Disputes</button>
              <button className="action-btn escalate">Escalate New</button>
            </div>
          </div>
        </div>

        {/* Commission Split Card */}
        <div className="stat-card commission-card">
          <div className="stat-header">
            <span className="stat-icon">📊</span>
            <h3>Commission Split</h3>
          </div>
          <div className="stat-content">
            <div className="commission-breakdown">
              <div className="commission-item manager">
                <span className="commission-label">Manager (2.5%)</span>
                <span className="commission-value">{formatCurrency(metrics.commissionSummary.manager)}</span>
              </div>
              <div className="commission-item referrer">
                <span className="commission-label">Referrer (1%)</span>
                <span className="commission-value">{formatCurrency(metrics.commissionSummary.referrer)}</span>
              </div>
              <div className="commission-item renteasy">
                <span className="commission-label">RentEasy (4%)</span>
                <span className="commission-value">{formatCurrency(metrics.commissionSummary.rentEasy)}</span>
              </div>
            </div>
            <div className="total-commission">
              <span className="total-label">Total Commission:</span>
              <span className="total-value">{formatCurrency(
                metrics.commissionSummary.manager + 
                metrics.commissionSummary.referrer + 
                metrics.commissionSummary.rentEasy
              )}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Updates Section */}
      <div className="live-updates-section">
        <div className="section-header">
          <h3>Live Platform Updates</h3>
          <span className="update-count">{liveUpdates.length} recent activities</span>
        </div>
        <div className="updates-list">
          {liveUpdates.map((update) => (
            <div key={update.id} className="update-item">
              <div className="update-icon">
                {update.type === 'listing' && '🏠'}
                {update.type === 'payment' && '💰'}
                {update.type === 'chat' && '💬'}
                {update.type === 'verification' && '✅'}
                {update.type === 'dispute' && '⚖️'}
              </div>
              <div className="update-content">
                <div className="update-action">{update.action}</div>
                <div className="update-details">
                  {update.location && <span className="detail location">{update.location}</span>}
                  {update.amount && <span className="detail amount">{update.amount}</span>}
                  {update.parties && <span className="detail parties">{update.parties}</span>}
                  {update.manager && <span className="detail manager">{update.manager}</span>}
                  {update.listing && <span className="detail listing">{update.listing}</span>}
                </div>
              </div>
              <div className="update-time">{update.time}</div>
              <button className="jump-in-btn" title="Jump into this activity">
                →
              </button>
            </div>
          ))}
        </div>
        <div className="updates-footer">
          <button className="load-more">Load More Activities</button>
          <div className="auto-refresh">
            <label>
              <input 
                type="checkbox" 
                checked={isLive}
                onChange={(e) => setIsLive(e.target.checked)}
              />
              Auto-refresh every 30s
            </label>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-btn primary">
            <span className="action-icon">🔍</span>
            <span className="action-text">Jump into Any Chat</span>
          </button>
          <button className="action-btn primary">
            <span className="action-icon">📝</span>
            <span className="action-text">Force Verify Listing</span>
          </button>
          <button className="action-btn secondary">
            <span className="action-icon">👁️</span>
            <span className="action-text">View Hidden Data</span>
          </button>
          <button className="action-btn secondary">
            <span className="action-icon">📊</span>
            <span className="action-text">Export All Data</span>
          </button>
          <button className="action-btn danger">
            <span className="action-icon">🚨</span>
            <span className="action-text">Emergency Controls</span>
          </button>
          <button className="action-btn warning">
            <span className="action-icon">📋</span>
            <span className="action-text">Generate Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommandCenterPage;