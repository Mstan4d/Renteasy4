// src/modules/dashboard/components/landlord/ReferralHistory.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import './ReferralHistory.css';

const ReferralHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [referrals, setReferrals] = useState([]);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadReferralData = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 600));
        
        const mockReferrals = [
          {
            id: 'REF-001',
            referrerName: 'John Smith',
            referrerEmail: 'john.smith@example.com',
            referrerType: 'landlord',
            joinDate: '2024-11-15',
            status: 'active',
            commissionEarned: 25000,
            propertiesListed: 3,
            totalCommission: 75000,
            lastActivity: '2024-12-10'
          },
          {
            id: 'REF-002',
            referrerName: 'Sarah Johnson',
            referrerEmail: 'sarah.j@example.com',
            referrerType: 'tenant',
            joinDate: '2024-10-20',
            status: 'active',
            commissionEarned: 15000,
            rentalsCompleted: 2,
            totalCommission: 30000,
            lastActivity: '2024-11-28'
          },
          {
            id: 'REF-003',
            referrerName: 'Michael Brown',
            referrerEmail: 'michael.b@example.com',
            referrerType: 'landlord',
            joinDate: '2024-09-05',
            status: 'pending',
            commissionEarned: 0,
            propertiesListed: 1,
            totalCommission: 0,
            lastActivity: '2024-09-15'
          },
          {
            id: 'REF-004',
            referrerName: 'Emma Wilson',
            referrerEmail: 'emma.w@example.com',
            referrerType: 'tenant',
            joinDate: '2024-08-12',
            status: 'completed',
            commissionEarned: 50000,
            rentalsCompleted: 5,
            totalCommission: 50000,
            lastActivity: '2024-10-30'
          },
          {
            id: 'REF-005',
            referrerName: 'David Lee',
            referrerEmail: 'david.lee@example.com',
            referrerType: 'landlord',
            joinDate: '2024-07-18',
            status: 'inactive',
            commissionEarned: 35000,
            propertiesListed: 2,
            totalCommission: 35000,
            lastActivity: '2024-08-25'
          },
          {
            id: 'REF-006',
            referrerName: 'Lisa Chen',
            referrerEmail: 'lisa.chen@example.com',
            referrerType: 'tenant',
            joinDate: '2024-06-22',
            status: 'active',
            commissionEarned: 20000,
            rentalsCompleted: 3,
            totalCommission: 60000,
            lastActivity: '2024-12-05'
          }
        ];
        
        const mockStats = {
          totalReferrals: 12,
          activeReferrals: 8,
          totalCommissionEarned: 185000,
          pendingCommission: 25000,
          conversionRate: '67%',
          averageCommission: 30833
        };
        
        setReferrals(mockReferrals);
        setStats(mockStats);
      } catch (error) {
        console.error('Error loading referral data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadReferralData();
    }
  }, [user]);

  const goBack = () => {
    navigate('/dashboard/landlord');
  };

  const goToReferralProgram = () => {
    navigate('/dashboard/landlord');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'inactive': return 'error';
      default: return 'default';
    }
  };

  const filteredReferrals = referrals.filter(referral => {
    if (filter === 'all') return true;
    if (filter === 'active') return referral.status === 'active';
    if (filter === 'pending') return referral.status === 'pending';
    if (filter === 'completed') return referral.status === 'completed';
    if (filter === 'landlords') return referral.referrerType === 'landlord';
    if (filter === 'tenants') return referral.referrerType === 'tenant';
    return true;
  });

  if (isLoading) {
    return (
      <div className="referral-history-loading">
        <div className="loading-spinner"></div>
        <p>Loading referral history...</p>
      </div>
    );
  }

  return (
    <div className="referral-history">
      {/* Header */}
      <div className="referral-header">
        <div className="header-left">
          <button className="btn btn-back" onClick={goBack}>
            ← Back to Dashboard
          </button>
          <h1>Referral History</h1>
          <p>Track your referral network and earnings</p>
        </div>
        
        <div className="header-right">
          <button 
            className="btn btn-primary"
            onClick={goToReferralProgram}
          >
            🎯 Back to Referral Program
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="referral-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Referrals</h3>
            <div className="stat-value">{stats?.totalReferrals || 0}</div>
            <p className="stat-period">All time</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Commission</h3>
            <div className="stat-value">
              {formatCurrency(stats?.totalCommissionEarned || 0)}
            </div>
            <p className="stat-period">Earned from referrals</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Conversion Rate</h3>
            <div className="stat-value">{stats?.conversionRate || '0%'}</div>
            <p className="stat-period">Signups to active users</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending Commission</h3>
            <div className="stat-value">
              {formatCurrency(stats?.pendingCommission || 0)}
            </div>
            <p className="stat-period">Awaiting clearance</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="referral-filters">
        <div className="filter-group">
          <label>Filter by Status</label>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Referrals
            </button>
            <button 
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button 
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button 
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
          </div>
        </div>
        
        <div className="filter-group">
          <label>Filter by Type</label>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'landlords' ? 'active' : ''}`}
              onClick={() => setFilter('landlords')}
            >
              Landlords
            </button>
            <button 
              className={`filter-btn ${filter === 'tenants' ? 'active' : ''}`}
              onClick={() => setFilter('tenants')}
            >
              Tenants
            </button>
          </div>
        </div>
      </div>

      {/* Referrals Table */}
      <div className="referrals-section">
        <div className="section-header">
          <h2>Referral History</h2>
          <button className="btn btn-outline">
            📥 Export Report
          </button>
        </div>
        
        {filteredReferrals.length > 0 ? (
          <div className="referrals-table">
            <div className="table-header">
              <div className="header-cell">Referral</div>
              <div className="header-cell">Type</div>
              <div className="header-cell">Join Date</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Commission Earned</div>
              <div className="header-cell">Last Activity</div>
              <div className="header-cell">Actions</div>
            </div>
            
            <div className="table-body">
              {filteredReferrals.map(referral => (
                <div key={referral.id} className="table-row">
                  <div className="table-cell referral-info">
                    <div className="referral-avatar">
                      {referral.referrerName.charAt(0)}
                    </div>
                    <div className="referral-details">
                      <div className="referral-name">{referral.referrerName}</div>
                      <div className="referral-email">{referral.referrerEmail}</div>
                      <div className="referral-id">ID: {referral.id}</div>
                    </div>
                  </div>
                  
                  <div className="table-cell">
                    <span className={`type-badge ${referral.referrerType}`}>
                      {referral.referrerType === 'landlord' ? '🏠 Landlord' : '👤 Tenant'}
                    </span>
                  </div>
                  
                  <div className="table-cell date">
                    {formatDate(referral.joinDate)}
                  </div>
                  
                  <div className="table-cell">
                    <span className={`status-badge ${getStatusColor(referral.status)}`}>
                      {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="table-cell commission">
                    <div className="commission-amount">
                      {formatCurrency(referral.commissionEarned)}
                    </div>
                    <div className="commission-details">
                      {referral.referrerType === 'landlord' 
                        ? `${referral.propertiesListed} properties` 
                        : `${referral.rentalsCompleted || 0} rentals`}
                    </div>
                  </div>
                  
                  <div className="table-cell last-activity">
                    {formatDate(referral.lastActivity)}
                  </div>
                  
                  <div className="table-cell actions">
                    <button className="btn btn-sm btn-outline">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No Referrals Found</h3>
            <p>No referrals match your selected filters.</p>
            <button 
              className="btn btn-outline"
              onClick={() => setFilter('all')}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Commission Breakdown */}
      <div className="commission-breakdown">
        <h2>Commission Breakdown</h2>
        <div className="breakdown-content">
          <div className="breakdown-chart">
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-color landlords"></span>
                <span className="legend-label">Landlords (70%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color tenants"></span>
                <span className="legend-label">Tenants (30%)</span>
              </div>
            </div>
            <div className="chart-visual">
              <div className="chart-landlords" style={{ width: '70%' }}>
                <span className="chart-value">{formatCurrency(129500)}</span>
              </div>
              <div className="chart-tenants" style={{ width: '30%' }}>
                <span className="chart-value">{formatCurrency(55500)}</span>
              </div>
            </div>
          </div>
          
          <div className="breakdown-stats">
            <div className="stat-item">
              <span className="label">Avg. Commission per Landlord</span>
              <span className="value">{formatCurrency(43167)}</span>
            </div>
            <div className="stat-item">
              <span className="label">Avg. Commission per Tenant</span>
              <span className="value">{formatCurrency(18500)}</span>
            </div>
            <div className="stat-item">
              <span className="label">Highest Single Commission</span>
              <span className="value">{formatCurrency(50000)}</span>
            </div>
            <div className="stat-item">
              <span className="label">Monthly Average</span>
              <span className="value">{formatCurrency(30833)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="referral-actions">
        <div className="action-card">
          <h3>Share Your Referral Link</h3>
          <div className="share-options">
            <button className="btn btn-outline">
              📱 Share via WhatsApp
            </button>
            <button className="btn btn-outline">
              📧 Share via Email
            </button>
            <button className="btn btn-outline">
              📋 Copy Marketing Text
            </button>
          </div>
        </div>
        
        <div className="action-card">
          <h3>Boost Your Referrals</h3>
          <div className="boost-tips">
            <div className="tip-item">
              <div className="tip-icon">💡</div>
              <div className="tip-content">
                <h4>Share on Social Media</h4>
                <p>Post about RentEasy on your social networks to reach more people</p>
              </div>
            </div>
            <div className="tip-item">
              <div className="tip-icon">💡</div>
              <div className="tip-content">
                <h4>Email Your Contacts</h4>
                <p>Send personalized emails to fellow property owners</p>
              </div>
            </div>
            <div className="tip-item">
              <div className="tip-icon">💡</div>
              <div className="tip-content">
                <h4>Join Property Groups</h4>
                <p>Participate in real estate forums and groups</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralHistory;