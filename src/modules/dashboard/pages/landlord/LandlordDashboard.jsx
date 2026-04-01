// src/modules/dashboard/pages/landlord/LandlordDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import RentEasyLoader from '../../../../shared/components/RentEasyLoader';
import {
  PlusCircle, DollarSign, Building, Users,
  TrendingUp, CheckCircle, Clock, AlertCircle,
  Copy, ExternalLink, Eye, Edit, Trash2,
  Filter, Search, Download, Upload, Bell,
  Wrench, FileText, Home, ChevronRight, RefreshCw,
  Tag, Shield, Zap, Calendar, MessageSquare
} from 'lucide-react';
import './LandlordDashboard.css';

const LandlordDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // State for dashboard data
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingCommissions: 0,
    listings: 0,
    maintenance: 0,
    documents: 0,
    completedRentals: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [properties, setProperties] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₦0';
    return `₦${Number(amount).toLocaleString('en-NG')}`;
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Get landlord's listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .eq('poster_role', 'landlord')
        .order('created_at', { ascending: false });

      if (listingsError) throw listingsError;
      setProperties(listingsData || []);

      const activeListings = (listingsData || []).filter(l => l.status !== 'rented').length;
      const rentedListings = (listingsData || []).filter(l => l.status === 'rented').length;

      // 2. Get commissions for landlord (as referrer)
      const { data: commissionsData, error: commError } = await supabase
        .from('commissions')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (commError) throw commError;

      const totalEarned = (commissionsData || []).reduce(
        (sum, c) => sum + (c.status === 'paid' ? (c.referrer_share || 0) : 0), 0
      );
      const pendingCommissions = (commissionsData || []).reduce(
        (sum, c) => sum + ((c.status === 'verified' || c.status === 'pending') ? (c.referrer_share || 0) : 0), 0
      );

      // 3. Maintenance requests for landlord
      const { data: maintenanceData, error: maintError } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('landlord_id', user.id)
        .order('created_at', { ascending: false });

      if (maintError) throw maintError;
      const openMaintenance = (maintenanceData || []).filter(
        m => !['resolved', 'closed'].includes(m.status)
      ).length;

      // 4. Documents shared with landlord (client_id = user.id)
      const { data: documentsData, error: docError } = await supabase
        .from('estate_documents')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (docError) throw docError;
      const unreadDocs = (documentsData || []).filter(d => !d.viewed).length;

      // 5. Build recent activities
      const activities = [];

      (listingsData || []).slice(0, 3).forEach(listing => {
        activities.push({
          id: `listing_${listing.id}`,
          type: 'listing',
          title: 'Property Listed',
          description: `"${listing.title}" was posted on RentEasy`,
          time: listing.created_at,
          icon: <Home size={16} />,
          link: `/listings/${listing.id}`
        });
      });

      (commissionsData || []).slice(0, 3).forEach(comm => {
        const isPaid = comm.status === 'paid';
        activities.push({
          id: `comm_${comm.id}`,
          type: 'commission',
          title: isPaid ? 'Commission Paid' : 'Commission Earned',
          description: `₦${(comm.referrer_share || 0).toLocaleString()} from rental`,
          time: comm.paid_at || comm.created_at,
          icon: isPaid ? <CheckCircle size={16} /> : <TrendingUp size={16} />,
          link: '/dashboard/landlord/earnings'
        });
      });

      (maintenanceData || []).slice(0, 3).forEach(maint => {
        activities.push({
          id: `maint_${maint.id}`,
          type: 'maintenance',
          title: 'Maintenance Request',
          description: `${maint.title} – ${maint.status}`,
          time: maint.created_at,
          icon: <Wrench size={16} />,
          link: '/dashboard/landlord/reports?type=maintenance'
        });
      });

      (documentsData || []).slice(0, 3).forEach(doc => {
        activities.push({
          id: `doc_${doc.id}`,
          type: 'document',
          title: 'New Document',
          description: `${doc.name || 'Document'} was shared with you`,
          time: doc.created_at,
          icon: <FileText size={16} />,
          link: '/dashboard/landlord/documents'
        });
      });

      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      setRecentActivities(activities.slice(0, 5));

      // 6. Set stats
      setStats({
        totalEarnings: totalEarned,
        pendingCommissions,
        listings: activeListings,
        maintenance: openMaintenance,
        documents: unreadDocs,
        completedRentals: rentedListings
      });

      // 7. Build alerts (using landlord's own profile)
      const newAlerts = [];

      // Get landlord's KYC status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('kyc_status')
        .eq('id', user.id)
        .single();

      if (!profileError && profile) {
        if (profile.kyc_status !== 'approved' && profile.kyc_status !== 'pending') {
          newAlerts.push({
            id: 'verification',
            priority: 'high',
            message: 'Complete KYC verification to build trust with tenants.',
            link: '/verify'
          });
        }
      }

      if (openMaintenance > 0) {
        newAlerts.push({
          id: 'maintenance',
          priority: 'medium',
          message: `${openMaintenance} open maintenance request(s) need your attention.`,
          link: '/dashboard/landlord/reports?type=maintenance'
        });
      }
      if (unreadDocs > 0) {
        newAlerts.push({
          id: 'documents',
          priority: 'medium',
          message: `${unreadDocs} new document(s) awaiting your review.`,
          link: '/dashboard/landlord/documents'
        });
      }
      setAlerts(newAlerts);

    } catch (err) {
      console.error('Error loading landlord dashboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadDashboardData();
  }, [user, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handlePostProperty = () => {
    const confirm = window.confirm(
      '🏠 POST PROPERTY - COMMISSION STRUCTURE\n\n' +
      'TOTAL COMMISSION: 7.5%\n' +
      '• Manager: 2.5% (verifies & monitors)\n' +
      '• You (as Poster): 1.5% (you post = you earn!)\n' +
      '• RentEasy: 3.5% (platform fee)\n\n' +
      '💰 YOU EARN 1.5% when this property gets rented!\n\n' +
      'Do you understand and agree?'
    );
    if (confirm) navigate('/post-property');
  };

  if (loading) {
    return <RentEasyLoader message="Loading your dashboard..." fullScreen />;
  }

  if (error) {
    return (
      <div className="landlord-dashboard-content">
        <div className="error-container">
          <AlertCircle size={48} />
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={handleRefresh}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="landlord-dashboard-modern">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Landlord'} 👋</h1>
            <p className="header-subtitle">Here's what's happening with your properties</p>
          </div>
          <div className="header-actions">
            <button className="btn-outline-light" onClick={handleRefresh}>
              <RefreshCw size={16} /> Refresh
            </button>
            <button className="btn-primary" onClick={handlePostProperty}>
              <PlusCircle size={16} /> Post Listing
            </button>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">Net Balance</span>
            <span className="stat-value">{formatCurrency(stats.totalEarnings)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pending Commission</span>
            <span className="stat-value">{formatCurrency(stats.pendingCommissions)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Active Listings</span>
            <span className="stat-value">{stats.listings}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Completed Rentals</span>
            <span className="stat-value">{stats.completedRentals}</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="alerts-section">
          {alerts.map(alert => (
            <div key={alert.id} className={`alert-card priority-${alert.priority}`}>
              <div className="alert-content">
                <AlertCircle size={20} />
                <span>{alert.message}</span>
              </div>
              <button className="alert-action" onClick={() => navigate(alert.link)}>
                Take Action <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/dashboard/landlord/earnings')}>
          <div className="stat-icon"><DollarSign size={24} /></div>
          <div className="stat-info">
            <p className="stat-label">Total Earnings</p>
            <p className="stat-value">{formatCurrency(stats.totalEarnings)}</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/dashboard/landlord/earnings')}>
          <div className="stat-icon"><TrendingUp size={24} /></div>
          <div className="stat-info">
            <p className="stat-label">Pending Commission</p>
            <p className="stat-value">{formatCurrency(stats.pendingCommissions)}</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/dashboard/landlord/properties')}>
          <div className="stat-icon"><Building size={24} /></div>
          <div className="stat-info">
            <p className="stat-label">Active Listings</p>
            <p className="stat-value">{stats.listings}</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/dashboard/landlord/reports?filter=maintenance')}>
          <div className="stat-icon"><Wrench size={24} /></div>
          <div className="stat-info">
            <p className="stat-label">Open Maintenance</p>
            <p className="stat-value">{stats.maintenance}</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <div className="section-header">
          <h3>Recent Activity</h3>
          <button onClick={() => navigate('/dashboard/landlord/reports')} className="view-all-btn">
            View All
          </button>
        </div>
        {recentActivities.length === 0 ? (
          <div className="empty-activities">
            <Bell size={32} className="empty-icon" />
            <p>No recent activity</p>
            <small>When something happens, it will appear here</small>
          </div>
        ) : (
          <div className="activity-list">
            {recentActivities.map(activity => (
              <div
                key={activity.id}
                className="activity-item"
                onClick={() => activity.link && navigate(activity.link)}
              >
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-details">
                  <div className="activity-title">{activity.title}</div>
                  <div className="activity-description">{activity.description}</div>
                  <div className="activity-time">{formatRelativeTime(activity.time)}</div>
                </div>
                <div className="activity-arrow">
                  <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Properties */}
      {properties.length > 0 && (
        <div className="recent-properties">
          <div className="section-header">
            <h3>Recent Properties</h3>
            <button onClick={() => navigate('/dashboard/landlord/properties')} className="view-all-btn">
              View All
            </button>
          </div>
          <div className="properties-grid">
            {properties.slice(0, 3).map(property => (
              <div key={property.id} className="property-card">
                <div className="property-image">
                  <img src={property.images?.[0] || '/default-property.jpg'} alt={property.title} />
                </div>
                <div className="property-info">
                  <h4>{property.title}</h4>
                  <p className="property-address">{property.address}</p>
                  <div className="property-details">
                    <span className="price">{formatCurrency(property.price)}/year</span>
                    <span className={`status ${property.status}`}>{property.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions-card">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn" onClick={handlePostProperty}>
            <PlusCircle size={18} /> Post Property
          </button>
          <button className="action-btn" onClick={() => navigate('/dashboard/landlord/earnings')}>
            <DollarSign size={18} /> View Earnings
          </button>
          <button className="action-btn" onClick={() => navigate('/dashboard/landlord/properties')}>
            <Building size={18} /> Manage Properties
          </button>
          <button className="action-btn" onClick={() => navigate('/dashboard/landlord/reports')}>
            <FileText size={18} /> Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandlordDashboard;