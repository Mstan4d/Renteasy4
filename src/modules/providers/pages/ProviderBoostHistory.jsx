// src/modules/providers/pages/ProviderBoostHistory.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  Eye, 
  Zap, 
  ArrowUpRight, 
  CheckCircle, 
  XCircle,
  Filter,
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './ProviderBoostHistory.css';

const ProviderBoostHistory = () => {
  const { user } = useAuth();
  const [boosts, setBoosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedBoost, setSelectedBoost] = useState(null);
  const [stats, setStats] = useState({
    totalBoosts: 0,
    totalSpent: 0,
    activeBoosts: 0,
    avgBookingsPerBoost: 0,
    avgInquiriesPerBoost: 0
  });

  useEffect(() => {
    if (!user) return;
    fetchBoostHistory();
  }, [user]);

  const fetchBoostHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all boost purchases for this user, with package details
      const { data: purchases, error: fetchError } = await supabase
        .from('boost_purchases')
        .select(`
          *,
          package:boost_packages(name, duration_days, price)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform data to match component's expected structure
      const transformedBoosts = purchases.map(p => ({
        id: p.id,
        type: p.package?.name?.toLowerCase().replace(' ', '-') || 'standard',
        duration: p.package?.duration_days || 0,
        cost: p.amount,
        purchasedAt: p.started_at,
        startsAt: p.started_at,
        expiresAt: p.expires_at,
        status: p.status,
        marketplaceViews: p.marketplace_views || 0,
        profileViews: p.profile_views || 0,
        inquiries: p.inquiries || 0,
        bookings: p.bookings || 0,
        rankingPosition: p.ranking_position || 'unknown',
        paymentMethod: p.payment_method || 'wallet',
        transactionId: p.transaction_id || `TX-${p.id.slice(0, 8)}`
      }));

      setBoosts(transformedBoosts);

      // Calculate stats
      const totalSpent = transformedBoosts.reduce((sum, b) => sum + b.cost, 0);
      const activeBoosts = transformedBoosts.filter(b => b.status === 'active').length;
      const totalBookings = transformedBoosts.reduce((sum, b) => sum + b.bookings, 0);
      const totalInquiries = transformedBoosts.reduce((sum, b) => sum + b.inquiries, 0);
      const avgBookings = transformedBoosts.length ? totalBookings / transformedBoosts.length : 0;
      const avgInquiries = transformedBoosts.length ? totalInquiries / transformedBoosts.length : 0;

      setStats({
        totalBoosts: transformedBoosts.length,
        totalSpent,
        activeBoosts,
        avgBookingsPerBoost: Math.round(avgBookings * 10) / 10,
        avgInquiriesPerBoost: Math.round(avgInquiries * 10) / 10
      });

    } catch (err) {
      console.error('Error fetching boost history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { id: 'all', label: 'All Boosts' },
    { id: 'active', label: 'Active' },
    { id: 'expired', label: 'Expired' },
    { id: 'premium', label: 'Premium' },
    { id: 'standard', label: 'Standard' },
    { id: 'turbo', label: 'Turbo' }
  ];

  const getStatusBadge = (status) => {
    const config = {
      active: { background: '#d1fae5', color: '#065f46', icon: CheckCircle },
      expired: { background: '#f3f4f6', color: '#374151', icon: XCircle }
    };
    const { background, color, icon: Icon } = config[status] || config.expired;
    
    return (
      <span className={`badge status-${status}`}>
        <Icon size={12} />
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </span>
    );
  };

  const getBoostTypeBadge = (type) => {
    const config = {
      premium: { background: '#f3e8ff', color: '#7c3aed', border: '#ddd6fe' },
      standard: { background: '#dbeafe', color: '#1e40af', border: '#bfdbfe' },
      turbo: { background: '#ffedd5', color: '#9a3412', border: '#fed7aa' }
    };
    const { background, color, border } = config[type] || config.standard;
    
    return (
      <span className={`badge type-${type}`}>
        <Zap size={12} />
        <span>{type.charAt(0).toUpperCase() + type.slice(1)} Boost</span>
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredBoosts = () => {
    let filtered = [...boosts];
    
    if (filter !== 'all') {
      if (['active', 'expired'].includes(filter)) {
        filtered = filtered.filter(boost => boost.status === filter);
      } else {
        filtered = filtered.filter(boost => boost.type === filter);
      }
    }
    
    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.purchasedAt) - new Date(a.purchasedAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.purchasedAt) - new Date(b.purchasedAt);
      } else if (sortBy === 'cost-high') {
        return b.cost - a.cost;
      } else if (sortBy === 'cost-low') {
        return a.cost - b.cost;
      }
      return 0;
    });
    
    return filtered;
  };

  const calculateEffectiveness = (boost) => {
    const conversionRate = boost.bookings / (boost.inquiries || 1);
    const viewsPerCost = boost.marketplaceViews / (boost.cost || 1);
    
    let score = 0;
    score += Math.min(conversionRate * 500, 40);
    score += Math.min(viewsPerCost * 0.5, 30);
    score += boost.bookings * 5;
    score += Math.min(boost.duration * 2, 20);
    
    return Math.min(Math.round(score), 100);
  };

  const exportToCSV = () => {
    alert('CSV export functionality would be implemented here');
  };

  const refreshData = () => {
    fetchBoostHistory();
  };

  const filteredBoosts = getFilteredBoosts();

  if (loading) {
    return (
      <div className="provider-boost-history-loading">
        <div className="loading-spinner"></div>
        <p>Loading boost history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="provider-boost-history-error">
        <AlertCircle size={48} />
        <h3>Error loading data</h3>
        <p>{error}</p>
        <button onClick={refreshData} className="btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div className="provider-boost-history">
      <div className="container">
        {/* Header */}
        <div className="header">
          <div className="header-top">
            <h1 className="header-title">Boost History</h1>
            <p className="header-subtitle">
              Track your boost purchases and their performance in the marketplace
            </p>
            
            <div className="header-actions">
              <button
                onClick={refreshData}
                className="btn btn-secondary"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              
              <Link
                to="/dashboard/provider/boost"
                className="btn btn-primary"
              >
                <Zap size={16} />
                Buy New Boost
              </Link>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-content">
                <div>
                  <div className="stat-label">Total Boosts</div>
                  <div className="stat-value">{stats.totalBoosts}</div>
                </div>
                <div className="stat-icon blue">
                  <Zap size={20} />
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-content">
                <div>
                  <div className="stat-label">Total Spent</div>
                  <div className="stat-value">{formatCurrency(stats.totalSpent)}</div>
                </div>
                <div className="stat-icon green">
                  <TrendingUp size={20} />
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-content">
                <div>
                  <div className="stat-label">Active Boosts</div>
                  <div className="stat-value">{stats.activeBoosts}</div>
                </div>
                <div className="stat-icon purple">
                  <Eye size={20} />
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-content">
                <div>
                  <div className="stat-label">Avg. Bookings/Boost</div>
                  <div className="stat-value">{stats.avgBookingsPerBoost}</div>
                </div>
                <div className="stat-icon orange">
                  <ArrowUpRight size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters and Controls */}
        <div className="filters-card">
          <div className="filters-container">
            <div className="filter-buttons">
              {filters.map((filterItem) => (
                <button
                  key={filterItem.id}
                  onClick={() => setFilter(filterItem.id)}
                  className={`filter-button ${filter === filterItem.id ? 'active' : ''}`}
                >
                  {filterItem.label}
                </button>
              ))}
            </div>
            
            <div className="controls">
              <div className="select-container">
                <Filter size={16} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="select"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="cost-high">Cost: High to Low</option>
                  <option value="cost-low">Cost: Low to High</option>
                </select>
              </div>
              
              <button
                onClick={exportToCSV}
                className="btn btn-secondary"
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>
        </div>
        
        {/* Boosts Table */}
        <div className="table-container">
          {filteredBoosts.length === 0 ? (
            <div className="empty-state">
              <Zap size={48} className="empty-icon" />
              <h3>No boosts found</h3>
              <p>No boost purchases match your current filters</p>
              <Link
                to="/dashboard/provider/boost"
                className="btn btn-primary"
              >
                <Zap size={16} />
                Buy Your First Boost
              </Link>
            </div>
          ) : (
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Boost Details</th>
                  <th className="table-header-cell">Duration</th>
                  <th className="table-header-cell">Performance</th>
                  <th className="table-header-cell">Cost</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBoosts.map((boost) => {
                  const effectiveness = calculateEffectiveness(boost);
                  const progressColor = effectiveness >= 70 ? '#10b981' : 
                                      effectiveness >= 40 ? '#f59e0b' : '#ef4444';
                  
                  return (
                    <tr key={boost.id} className="table-row">
                      <td className="table-cell">
                        <div>
                          <div className="badge-group">
                            {getBoostTypeBadge(boost.type)}
                            {getStatusBadge(boost.status)}
                          </div>
                          <div className="text-muted">
                            Purchased: {formatDateTime(boost.purchasedAt)}
                          </div>
                          <div className="text-muted mono">
                            {boost.transactionId}
                          </div>
                        </div>
                      </td>
                      
                      <td className="table-cell">
                        <div className="duration-cell">
                          <Calendar size={16} />
                          <div>
                            <div className="duration-value">{boost.duration} days</div>
                            <div className="duration-range">
                              {formatDate(boost.startsAt)} – {formatDate(boost.expiresAt)}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="table-cell">
                        <div>
                          <div className="effectiveness-row">
                            <span className="text-muted">Effectiveness</span>
                            <span className="effectiveness-value">{effectiveness}%</span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${effectiveness}%`,
                                backgroundColor: progressColor
                              }}
                            />
                          </div>
                          <div className="performance-grid">
                            <div>
                              <div className="performance-number">{boost.bookings}</div>
                              <div className="performance-label">Bookings</div>
                            </div>
                            <div>
                              <div className="performance-number">{boost.inquiries}</div>
                              <div className="performance-label">Inquiries</div>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="table-cell">
                        <div className="cost-cell">
                          <div className="cost-value">{formatCurrency(boost.cost)}</div>
                          <div className="payment-method">
                            Paid via {boost.paymentMethod.replace('_', ' ')}
                          </div>
                          <div className="ranking">
                            Ranked: <span className="ranking-value">{boost.rankingPosition}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="table-cell">
                        <div>
                          {getStatusBadge(boost.status)}
                          <div className="views-stats">
                            <div className="stat-row">
                              <span>Views:</span>
                              <span className="stat-number">{boost.marketplaceViews}</span>
                            </div>
                            <div className="stat-row">
                              <span>Profile:</span>
                              <span className="stat-number">{boost.profileViews}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="table-cell">
                        <div className="action-buttons">
                          <button
                            onClick={() => setSelectedBoost(boost)}
                            className="btn btn-secondary small"
                          >
                            View Details
                          </button>
                          
                          {boost.status === 'expired' && (
                            <Link
                              to="/dashboard/provider/boost"
                              className="btn btn-renew small"
                            >
                              Renew
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Tips Card */}
        <div className="tips-card">
          <h3 className="tips-title">
            <Zap size={20} />
            Boost Performance Tips
          </h3>
          <ul className="tips-list">
            <li className="tip-item">
              <CheckCircle size={16} />
              <span>Boost moves your profile higher in marketplace search results</span>
            </li>
            <li className="tip-item">
              <CheckCircle size={16} />
              <span>Boost is independent of verification - both verified and unverified providers can purchase</span>
            </li>
            <li className="tip-item">
              <CheckCircle size={16} />
              <span>Premium boosts provide better visibility and longer duration</span>
            </li>
            <li className="tip-item">
              <CheckCircle size={16} />
              <span>Boost effectiveness depends on your profile completeness and service quality</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Boost Details Modal */}
      {selectedBoost && (
        <div className="modal-overlay" onClick={() => setSelectedBoost(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Boost Details</h2>
              <button
                onClick={() => setSelectedBoost(null)}
                className="modal-close"
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <div className="modal-grid">
                <div>
                  <div className="modal-label">Boost Type</div>
                  <div>{getBoostTypeBadge(selectedBoost.type)}</div>
                </div>
                <div>
                  <div className="modal-label">Status</div>
                  <div>{getStatusBadge(selectedBoost.status)}</div>
                </div>
                <div>
                  <div className="modal-label">Duration</div>
                  <div className="modal-value">{selectedBoost.duration} days</div>
                </div>
                <div>
                  <div className="modal-label">Cost</div>
                  <div className="modal-value">{formatCurrency(selectedBoost.cost)}</div>
                </div>
              </div>
              
              <div className="modal-section">
                <h3 className="modal-section-title">Timeline</h3>
                <div className="timeline-details">
                  <div className="timeline-row">
                    <span className="timeline-label">Purchased:</span>
                    <span className="timeline-value">{formatDateTime(selectedBoost.purchasedAt)}</span>
                  </div>
                  <div className="timeline-row">
                    <span className="timeline-label">Started:</span>
                    <span className="timeline-value">{formatDateTime(selectedBoost.startsAt)}</span>
                  </div>
                  <div className="timeline-row">
                    <span className="timeline-label">Expired:</span>
                    <span className="timeline-value">{formatDateTime(selectedBoost.expiresAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="modal-section">
                <h3 className="modal-section-title">Performance Metrics</h3>
                <div className="metric-grid">
                  <div className="metric-box">
                    <div className="metric-value">{selectedBoost.marketplaceViews}</div>
                    <div className="metric-label">Marketplace Views</div>
                  </div>
                  <div className="metric-box">
                    <div className="metric-value">{selectedBoost.profileViews}</div>
                    <div className="metric-label">Profile Views</div>
                  </div>
                  <div className="metric-box">
                    <div className="metric-value">{selectedBoost.inquiries}</div>
                    <div className="metric-label">Inquiries</div>
                  </div>
                  <div className="metric-box">
                    <div className="metric-value">{selectedBoost.bookings}</div>
                    <div className="metric-label">Bookings</div>
                  </div>
                </div>
              </div>
              
              <div className="transaction-details">
                <h3 className="modal-section-title">Transaction Details</h3>
                <div className="transaction-box">
                  <div className="transaction-row">
                    <span className="transaction-label">Transaction ID:</span>
                    <span className="transaction-value mono">{selectedBoost.transactionId}</span>
                  </div>
                  <div className="transaction-row">
                    <span className="transaction-label">Payment Method:</span>
                    <span className="transaction-value capitalize">
                      {selectedBoost.paymentMethod.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="transaction-row">
                    <span className="transaction-label">Ranking Position:</span>
                    <span className="transaction-value">{selectedBoost.rankingPosition}</span>
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <button
                  onClick={() => setSelectedBoost(null)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
                {selectedBoost.status === 'expired' && (
                  <Link
                    to="/dashboard/provider/boost"
                    className="btn btn-primary"
                  >
                    Renew Boost
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderBoostHistory;