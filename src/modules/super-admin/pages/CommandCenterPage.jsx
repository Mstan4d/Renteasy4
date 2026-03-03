// src/modules/super-admin/pages/CommandCenterPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './CommandCenterPage.css';

const CommandCenterPage = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalListings: { live: 0, unverified: 0, verified: 0, rented: 0, suspended: 0 },
    activeChats: { tenantLandlord: 0, tenantManager: 0, total: 0 },
    managerStatus: { online: 0, offline: 0, total: 0 },
    disputes: { pending: 0, resolved: 0, escalated: 0 },
    revenue: { today: 0, thisMonth: 0, lifetime: 0 },
    commissionSummary: { manager: 0, referrer: 0, rentEasy: 0 }
  });

  const [liveUpdates, setLiveUpdates] = useState([]);
  const [isLive, setIsLive] = useState(true);
  const [loading, setLoading] = useState(true);

  // Fetch all metrics
  const fetchMetrics = async () => {
    try {
      // 1. Listings stats
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('verified, status, rejected');
      if (listingsError) throw listingsError;

      const live = listings.filter(l => l.status === 'active' && !l.rejected).length;
      const unverified = listings.filter(l => !l.verified && !l.rejected).length;
      const verified = listings.filter(l => l.verified && !l.rejected).length;
      const rented = listings.filter(l => l.status === 'rented').length;
      const suspended = listings.filter(l => l.rejected).length;

      // 2. Chats stats
      const { data: chats, error: chatsError } = await supabase
        .from('chats')
        .select('chat_type, state');
      if (chatsError) throw chatsError;

      const tenantLandlord = chats.filter(c => c.chat_type === 'tenant-landlord' && c.state === 'active').length;
      const tenantManager = chats.filter(c => c.chat_type === 'tenant-manager' && c.state === 'active').length;
      const totalActiveChats = chats.filter(c => c.state === 'active').length;

      // 3. Manager status (online = last_active < 5 minutes ago)
      const { data: managers, error: managersError } = await supabase
        .from('profiles')
        .select('last_active')
        .eq('role', 'manager');
      if (managersError) throw managersError;

      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const online = managers.filter(m => m.last_active && new Date(m.last_active) > fiveMinutesAgo).length;
      const offline = managers.length - online;

      // 4. Disputes
      const { data: disputes, error: disputesError } = await supabase
        .from('disputes')
        .select('status');
      if (disputesError) throw disputesError;

      const pendingDisputes = disputes.filter(d => d.status === 'pending').length;
      const resolvedDisputes = disputes.filter(d => d.status === 'resolved').length;
      const escalatedDisputes = disputes.filter(d => d.status === 'escalated').length;

      // 5. Revenue from commissions
      const { data: commissions, error: commError } = await supabase
        .from('commissions')
        .select('created_at, platform_share, manager_share, referrer_share');
      if (commError) throw commError;

      const today = new Date();
      const startOfDay = new Date(today.setHours(0,0,0,0));
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const revenueToday = commissions
        .filter(c => new Date(c.created_at) >= startOfDay)
        .reduce((sum, c) => sum + (c.platform_share || 0), 0);

      const revenueThisMonth = commissions
        .filter(c => new Date(c.created_at) >= startOfMonth)
        .reduce((sum, c) => sum + (c.platform_share || 0), 0);

      const revenueLifetime = commissions.reduce((sum, c) => sum + (c.platform_share || 0), 0);

      // 6. Commission summary
      const managerTotal = commissions.reduce((sum, c) => sum + (c.manager_share || 0), 0);
      const referrerTotal = commissions.reduce((sum, c) => sum + (c.referrer_share || 0), 0);
      const platformTotal = commissions.reduce((sum, c) => sum + (c.platform_share || 0), 0);

      setMetrics({
        totalListings: { live, unverified, verified, rented, suspended },
        activeChats: { tenantLandlord, tenantManager, total: totalActiveChats },
        managerStatus: { online, offline, total: managers.length },
        disputes: { pending: pendingDisputes, resolved: resolvedDisputes, escalated: escalatedDisputes },
        revenue: { today: revenueToday, thisMonth: revenueThisMonth, lifetime: revenueLifetime },
        commissionSummary: { manager: managerTotal, referrer: referrerTotal, rentEasy: platformTotal }
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch live updates (admin activities)
  const fetchLiveUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_activities')
        .select(`
          *,
          admin:admin_id (id, full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const updates = data.map(item => ({
        id: item.id,
        type: item.type || 'activity',
        action: item.action,
        details: item.details,
        admin: item.admin?.full_name || 'System',
        time: formatRelativeTime(item.created_at)
      }));
      setLiveUpdates(updates);
    } catch (error) {
      console.error('Error fetching live updates:', error);
    }
  };

  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    fetchMetrics();
    fetchLiveUpdates();

    // Set up real-time subscription for admin_activities
    const channel = supabase
      .channel('admin-activities')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'admin_activities'
      }, (payload) => {
        // Add new activity to the top
        const newUpdate = {
          id: payload.new.id,
          type: payload.new.type,
          action: payload.new.action,
          details: payload.new.details,
          admin: payload.new.admin_name || 'System',
          time: formatRelativeTime(payload.new.created_at)
        };
        setLiveUpdates(prev => [newUpdate, ...prev].slice(0, 10));
      })
      .subscribe();

    // Auto-refresh metrics every 30 seconds if live
    let interval;
    if (isLive) {
      interval = setInterval(() => {
        fetchMetrics();
        fetchLiveUpdates();
      }, 30000);
    }

    return () => {
      supabase.removeChannel(channel);
      if (interval) clearInterval(interval);
    };
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

  if (loading) return <div className="loading">Loading command center...</div>;

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
            Last update: just now
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
                      width: `${(metrics.managerStatus.online / metrics.managerStatus.total) * 100 || 0}%`,
                      backgroundColor: getStatusColor((metrics.managerStatus.online / metrics.managerStatus.total) * 100 || 0) === 'success' ? '#38a169' : 
                                     getStatusColor((metrics.managerStatus.online / metrics.managerStatus.total) * 100 || 0) === 'warning' ? '#dd6b20' : '#e53e3e'
                    }}
                  ></div>
                </div>
                <span className="meter-label">
                  {Math.round((metrics.managerStatus.online / metrics.managerStatus.total) * 100 || 0)}% Online
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
                <span className="commission-label">Referrer (1.5%)</span>
                <span className="commission-value">{formatCurrency(metrics.commissionSummary.referrer)}</span>
              </div>
              <div className="commission-item renteasy">
                <span className="commission-label">RentEasy (3.5%)</span>
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
                {update.type === 'user' && '👤'}
                {update.type === 'activity' && '📝'}
              </div>
              <div className="update-content">
                <div className="update-action">
                  <strong>{update.admin}</strong> {update.action}
                </div>
                <div className="update-details">
                  {update.details && JSON.stringify(update.details).slice(0, 60)}
                </div>
              </div>
              <div className="update-time">{update.time}</div>
              <button className="jump-in-btn" title="View details">
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