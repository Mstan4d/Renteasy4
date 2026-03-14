import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import {
  PlusCircle, DollarSign, Building, Users,
  TrendingUp, CheckCircle, Clock, AlertCircle,
  Copy, ExternalLink, Eye, Edit, Trash2,
  Filter, Search, Download, Upload, Bell,
  Wrench, FileText, Home
} from 'lucide-react';
import './LandlordDashboard.css';

const LandlordDashboard = () => {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    commission: 0,
    listings: 0,
    referrals: 0,
    pendingMaintenance: 0,
    unreadDocuments: 0
  });
  const [recentItems, setRecentItems] = useState([]); // combined feed for dashboard
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch listings (properties) count and recent ones
      const { count: listingCount, data: listingsData } = await supabase
        .from('listings')
        .select('*', { count: 'exact' })
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // 2. Fetch completed bookings (earnings)
      const { data: bookings } = await supabase
        .from('bookings')
        .select('total_price')
        .eq('poster_id', user.id)
        .eq('status', 'completed');

      const totalRevenue = bookings?.reduce((acc, curr) => acc + (curr.total_price || 0), 0) || 0;
      const commission = totalRevenue * 0.015; // 1.5%

      // 3. Fetch maintenance requests (pending/unread counts + recent)
      const { data: maintenance, error: maintError } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('landlord_id', user.id)
        .order('created_at', { ascending: false });

      if (maintError) throw maintError;

      const pendingMaintenance = maintenance?.filter(m => 
        ['open', 'pending', 'in_progress'].includes(m.status)
      ).length || 0;

      // 4. Fetch documents shared with landlord
      const { data: documents, error: docError } = await supabase
        .from('estate_documents')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (docError) throw docError;

      const unreadDocs = documents?.filter(d => !d.viewed).length || 0;

      // 5. Fetch payments for landlord's properties
      // First get property ids
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('id')
        .eq('landlord_id', user.id);

      let recentPayments = [];
      if (propertiesData && propertiesData.length > 0) {
        const propIds = propertiesData.map(p => p.id);
        const { data: units } = await supabase
          .from('units')
          .select('id')
          .in('property_id', propIds);

        if (units && units.length > 0) {
          const unitIds = units.map(u => u.id);
          const { data: payments } = await supabase
            .from('payments')
            .select(`
              *,
              unit:unit_id (
                unit_number,
                property:property_id (title, address),
                tenant:tenant_id (full_name)
              )
            `)
            .in('unit_id', unitIds)
            .order('payment_date', { ascending: false })
            .limit(5);

          recentPayments = payments || [];
        }
      }

      // 6. Build combined recent items (for dashboard feed)
      const maintItems = (maintenance || []).slice(0, 3).map(m => ({
        id: `maint-${m.id}`,
        type: 'maintenance',
        title: m.title,
        description: m.description,
        date: m.created_at,
        status: m.status,
        priority: m.priority,
        emergency: m.emergency,
        viewed: m.viewed,
        icon: <Wrench size={16} />
      }));

      const docItems = (documents || []).slice(0, 3).map(d => ({
        id: `doc-${d.id}`,
        type: 'document',
        title: d.name,
        description: `${d.category} document`,
        date: d.created_at,
        status: d.status,
        viewed: d.viewed,
        icon: <FileText size={16} />
      }));

      const payItems = recentPayments.slice(0, 3).map(p => ({
  id: `pay-${p.id}`,
  type: 'payment',
  paymentType: p.payment_type,
  title: p.payment_type === 'utility' 
    ? `Utility payment for ${p.unit?.property?.title}` 
    : `Rent payment from ${p.unit?.tenant?.full_name || 'Tenant'}`,
  description: `₦${p.amount.toLocaleString()} - ${p.unit?.property?.title} unit ${p.unit?.unit_number}`,
  date: p.payment_date,
  viewed: true,
  icon: p.payment_type === 'utility' ? <Zap size={16} /> : <DollarSign size={16} />
}));

      // Merge, sort by date, take top 5
      const combined = [...maintItems, ...docItems, ...payItems]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

      setRecentItems(combined);
      setProperties(listingsData || []);
      setStats({
        totalEarnings: totalRevenue,
        commission,
        listings: listingCount || 0,
        referrals: 0, // placeholder; can be added later
        pendingMaintenance,
        unreadDocuments: unreadDocs
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostProperty = () => {
    const confirmed = window.confirm(
      '🏠 POST PROPERTY - COMMISSION STRUCTURE\n\n' +
      'TOTAL COMMISSION: 7.5%\n' +
      '• Manager: 2.5% (verifies & monitors)\n' +
      '• You (as Poster): 1.5% (you post = you earn!)\n' +
      '• RentEasy: 3.5% (platform fee)\n\n' +
      '💰 YOU EARN 1.5% when this property gets rented!\n\n' +
      'Do you understand and agree?'
    );
    if (confirmed) navigate('/post-property');
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₦0';
    return `₦${parseFloat(amount).toLocaleString('en-NG')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (item) => {
    if (item.type === 'maintenance') {
      const colors = {
        open: '#ef4444',
        pending: '#f59e0b',
        in_progress: '#3b82f6',
        resolved: '#10b981'
      };
      return <span className="badge" style={{ backgroundColor: colors[item.status] || '#6b7280' }}>{item.status}</span>;
    } else if (item.type === 'document') {
      const colors = {
        verified: '#10b981',
        pending: '#f59e0b',
        rejected: '#ef4444'
      };
      {item.paymentType === 'utility' && <span className="badge utility">Utility</span>}
      return <span className="badge" style={{ backgroundColor: colors[item.status] || '#6b7280' }}>{item.status}</span>;
    } else {
      return <span className="badge" style={{ backgroundColor: '#10b981' }}>completed</span>;
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="landlord-dashboard-content">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name || 'Landlord'}</h1>
        <p className="subtitle">Here's what's happening with your properties</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><DollarSign size={24} /></div>
          <div className="stat-info">
            <p className="stat-label">Net Balance</p>
            <p className="stat-value">{formatCurrency(stats.totalEarnings)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon commission"><TrendingUp size={24} /></div>
          <div className="stat-info">
            <p className="stat-label">Your Commission (1.5%)</p>
            <p className="stat-value">{formatCurrency(stats.commission)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Building size={24} /></div>
          <div className="stat-info">
            <p className="stat-label">Total Listings</p>
            <p className="stat-value">{stats.listings}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Users size={24} /></div>
          <div className="stat-info">
            <p className="stat-label">Referral Bonus</p>
            <p className="stat-value">{formatCurrency(stats.referrals)}</p>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="stats-row">
        <div className="stat-mini-card" onClick={() => navigate('/dashboard/landlord/reports?filter=maintenance')}>
          <Wrench size={20} />
          <div>
            <span className="stat-label">Pending Maintenance</span>
            <span className="stat-number">{stats.pendingMaintenance}</span>
          </div>
        </div>
        <div className="stat-mini-card" onClick={() => navigate('/dashboard/landlord/reports?filter=documents')}>
          <FileText size={20} />
          <div>
            <span className="stat-label">Unread Documents</span>
            <span className="stat-number">{stats.unreadDocuments}</span>
          </div>
        </div>
        <div className="stat-mini-card" onClick={() => navigate('/dashboard/landlord/reports')}>
          <Bell size={20} />
          <div>
            <span className="stat-label">All Reports</span>
            <span className="stat-number">{stats.pendingMaintenance + stats.unreadDocuments}+</span>
          </div>
        </div>
      </div>

      {/* Action Banner */}
      <div className="action-banner">
        <div className="banner-content">
          <h3>Ready to list a new property?</h3>
          <p>Remember, you earn 1.5% commission as the poster!</p>
        </div>
        <button onClick={handlePostProperty} className="add-property-btn">
          <PlusCircle size={20} /> Post Listing
        </button>
      </div>

      {/* Recent Activity Feed */}
      {recentItems.length > 0 && (
        <div className="recent-activity">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <button onClick={() => navigate('/dashboard/landlord/reports')} className="view-all-btn">
              View All Reports
            </button>
          </div>
          <div className="activity-feed">
            {recentItems.map(item => (
              <div 
                key={item.id} 
                className={`feed-item ${!item.viewed ? 'unread' : ''}`}
                onClick={() => navigate('/dashboard/landlord/reports')} // or drill to specific item
              >
                <div className="item-icon">{item.icon}</div>
                <div className="item-details">
                  <div className="item-header">
                    <span className="item-title">{item.title}</span>
                    {getStatusBadge(item)}
                  </div>
                  <p className="item-description">{item.description}</p>
                  <span className="item-date">{formatDate(item.date)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Properties */}
      {properties.length > 0 && (
        <div className="recent-properties">
          <div className="section-header">
            <h2>Recent Properties</h2>
            <button onClick={() => navigate('/dashboard/landlord/properties')} className="view-all-btn">
              View All
            </button>
          </div>
          <div className="properties-grid">
            {properties.map((property) => (
              <div key={property.id} className="property-card">
                <div className="property-image">
                  <img src={property.images?.[0] || '/default-property.jpg'} alt={property.title} />
                </div>
                <div className="property-info">
                  <h4>{property.title}</h4>
                  <p className="property-address">{property.address}</p>
                  <div className="property-details">
                    <span className="price">{formatCurrency(property.price)}/month</span>
                    <span className={`status ${property.status}`}>{property.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandlordDashboard;