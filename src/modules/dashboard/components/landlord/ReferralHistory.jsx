// src/modules/dashboard/components/landlord/ReferralHistory.jsx - UPDATED
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import { 
  calculatePosterCommission,
  REFERRAL_CONFIG 
} from '../../../../shared/utils/referralUtils';
import './ReferralHistory.css';

const ReferralHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [commissions, setCommissions] = useState([]); // 1% commissions
  const [referralRewards, setReferralRewards] = useState([]); // #5000 rewards
  const [activeTab, setActiveTab] = useState('commissions');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadReferralData = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // DUAL SYSTEM: Load both commission and referral data
        
        // 1. COMMISSIONS (1% from posted houses)
        const mockCommissions = [
          {
            id: 'COMM-001',
            propertyTitle: "3-Bedroom Duplex, Lekki",
            propertyId: 'PROP-123',
            rentalValue: 2500000,
            commissionRate: '1%',
            commissionAmount: 25000,
            status: 'paid',
            paymentDate: '2024-12-10',
            postedDate: '2024-11-15',
            rentedDate: '2024-12-05',
            tenantName: 'John Doe',
            notes: 'Tenant completed 1-year lease'
          },
          {
            id: 'COMM-002',
            propertyTitle: "2-Bedroom Flat, Ikeja",
            propertyId: 'PROP-124',
            rentalValue: 1800000,
            commissionRate: '1%',
            commissionAmount: 18000,
            status: 'calculated',
            paymentDate: null,
            postedDate: '2024-11-20',
            rentedDate: '2024-12-12',
            tenantName: 'Sarah Johnson',
            notes: 'Awaiting payment processing'
          },
          {
            id: 'COMM-003',
            propertyTitle: "Office Space, VI",
            propertyId: 'PROP-125',
            rentalValue: 5000000,
            commissionRate: '1%',
            commissionAmount: 50000,
            status: 'paid',
            paymentDate: '2024-11-28',
            postedDate: '2024-10-15',
            rentedDate: '2024-11-25',
            tenantName: 'Corporate Solutions Ltd',
            notes: 'Corporate lease - 2 years'
          }
        ];

        // 2. REFERRAL REWARDS (#5000 per successful referral)
        const mockReferralRewards = [
          {
            id: 'REF-001',
            referredUserName: 'Michael Brown',
            referredUserEmail: 'michael@example.com',
            referredUserType: 'landlord',
            signupDate: '2024-11-15',
            rewardType: 'rental_completed',
            rewardAmount: 5000,
            status: 'paid',
            paymentDate: '2024-12-01',
            triggerEvent: 'Rented a property worth ₦2,000,000',
            notes: 'Friend rented a commercial space'
          },
          {
            id: 'REF-002',
            referredUserName: 'Emma Wilson',
            referredUserEmail: 'emma@example.com',
            referredUserType: 'tenant',
            signupDate: '2024-10-20',
            rewardType: 'house_posted_and_rented',
            rewardAmount: 5000,
            status: 'verified',
            paymentDate: null,
            triggerEvent: 'Posted a house that got rented for ₦1,500,000',
            notes: 'Awaiting final verification'
          },
          {
            id: 'REF-003',
            referredUserName: 'David Lee',
            referredUserEmail: 'david@example.com',
            referredUserType: 'landlord',
            signupDate: '2024-09-05',
            rewardType: 'rental_completed',
            rewardAmount: 5000,
            status: 'pending',
            paymentDate: null,
            triggerEvent: 'Currently viewing properties',
            notes: 'Has shown interest in 3 properties'
          }
        ];
        
        // Calculate stats for both systems
        const totalCommissionEarned = mockCommissions
          .filter(c => c.status === 'paid')
          .reduce((sum, c) => sum + c.commissionAmount, 0);
        
        const totalReferralRewardsEarned = mockReferralRewards
          .filter(r => r.status === 'paid')
          .reduce((sum, r) => sum + r.rewardAmount, 0);
        
        const pendingCommissions = mockCommissions
          .filter(c => c.status === 'calculated')
          .reduce((sum, c) => sum + c.commissionAmount, 0);
        
        const pendingReferrals = mockReferralRewards
          .filter(r => r.status === 'verified' || r.status === 'pending')
          .reduce((sum, r) => sum + r.rewardAmount, 0);
        
        const mockStats = {
          totalCommissionEarned,
          totalReferralRewardsEarned,
          totalEarned: totalCommissionEarned + totalReferralRewardsEarned,
          pendingCommissions,
          pendingReferrals,
          commissionRate: '1%',
          referralReward: '#5000',
          qualifiedReferrals: mockReferralRewards.filter(r => r.status !== 'pending').length,
          activeReferrals: mockReferralRewards.length
        };
        
        // Load from localStorage or use mock
        const savedCommissions = JSON.parse(localStorage.getItem(`landlord_commissions_${user?.id}`) || 'null');
        const savedReferrals = JSON.parse(localStorage.getItem(`landlord_referral_rewards_${user?.id}`) || 'null');
        
        if (savedCommissions) {
          setCommissions(savedCommissions);
        } else {
          setCommissions(mockCommissions);
          localStorage.setItem(`landlord_commissions_${user?.id}`, JSON.stringify(mockCommissions));
        }
        
        if (savedReferrals) {
          setReferralRewards(savedReferrals);
        } else {
          setReferralRewards(mockReferralRewards);
          localStorage.setItem(`landlord_referral_rewards_${user?.id}`, JSON.stringify(mockReferralRewards));
        }
        
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
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', class: 'status-pending', color: 'warning' },
      calculated: { label: 'Calculated', class: 'status-calculated', color: 'info' },
      verified: { label: 'Verified', class: 'status-verified', color: 'info' },
      paid: { label: 'Paid', class: 'status-paid', color: 'success' }
    };
    
    const config = statusConfig[status] || { label: status, class: 'status-default', color: 'default' };
    
    return (
      <span className={`status-badge ${config.class} ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getRewardTypeLabel = (type) => {
    const labels = {
      rental_completed: '🏠 Rented Property',
      house_posted_and_rented: '📝 Posted & Rented House'
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="referral-history-loading">
        <div className="loading-spinner"></div>
        <p>Loading earnings data...</p>
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
          <h1>Landlord Earnings</h1>
          <p>Track your 1% commissions and #5000 referral rewards</p>
        </div>
        
        <div className="header-right">
          <div className="total-earnings">
            <span className="total-label">Total Earned:</span>
            <span className="total-amount">
              ₦{(stats?.totalEarned || 0).toLocaleString()}
            </span>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/dashboard/landlord')}
          >
            🎯 Share Referral Link
          </button>
        </div>
      </div>

      {/* Dual System Tabs */}
      <div className="earnings-tabs">
        <button 
          className={`earning-tab ${activeTab === 'commissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('commissions')}
        >
          <span className="tab-icon">💰</span>
          <span className="tab-label">1% Commissions</span>
          <span className="tab-count">{commissions.length}</span>
        </button>
        <button 
          className={`earning-tab ${activeTab === 'referrals' ? 'active' : ''}`}
          onClick={() => setActiveTab('referrals')}
        >
          <span className="tab-icon">🎯</span>
          <span className="tab-label">#5000 Referrals</span>
          <span className="tab-count">{referralRewards.length}</span>
        </button>
      </div>

      {/* Commission Stats */}
      {activeTab === 'commissions' && (
        <div className="commission-section">
          <div className="section-stats">
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>Total Commission</h3>
                <div className="stat-value">
                  {formatCurrency(stats?.totalCommissionEarned || 0)}
                </div>
                <p className="stat-period">1% of rental values</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <h3>Properties Rented</h3>
                <div className="stat-value">
                  {commissions.filter(c => c.rentedDate).length}
                </div>
                <p className="stat-period">Out of {commissions.length} posted</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3>Pending Payout</h3>
                <div className="stat-value">
                  {formatCurrency(stats?.pendingCommissions || 0)}
                </div>
                <p className="stat-period">Awaiting payment</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>Commission Rate</h3>
                <div className="stat-value">1%</div>
                <p className="stat-period">Per successful rental</p>
              </div>
            </div>
          </div>

          {/* Commission History */}
          <div className="commission-history">
            <h2>Commission History</h2>
            <div className="table-container">
              <table className="earnings-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Tenant</th>
                    <th>Rental Value</th>
                    <th>Commission</th>
                    <th>Status</th>
                    <th>Date Posted</th>
                    <th>Date Rented</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map(commission => (
                    <tr key={commission.id}>
                      <td>
                        <div className="property-info">
                          <strong>{commission.propertyTitle}</strong>
                          <small>ID: {commission.propertyId}</small>
                        </div>
                      </td>
                      <td>{commission.tenantName}</td>
                      <td className="rental-value">
                        {formatCurrency(commission.rentalValue)}
                      </td>
                      <td>
                        <div className="commission-info">
                          <span className="commission-rate">{commission.commissionRate}</span>
                          <span className="commission-amount">
                            {formatCurrency(commission.commissionAmount)}
                          </span>
                        </div>
                      </td>
                      <td>{getStatusBadge(commission.status)}</td>
                      <td>{formatDate(commission.postedDate)}</td>
                      <td>{formatDate(commission.rentedDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Referral Rewards */}
      {activeTab === 'referrals' && (
        <div className="referral-rewards-section">
          <div className="section-stats">
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <h3>Total Rewards</h3>
                <div className="stat-value">
                  {formatCurrency(stats?.totalReferralRewardsEarned || 0)}
                </div>
                <p className="stat-period">#5000 per qualifying referral</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Total Referrals</h3>
                <div className="stat-value">
                  {referralRewards.length}
                </div>
                <p className="stat-period">
                  {stats?.qualifiedReferrals || 0} qualified
                </p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3>Pending Rewards</h3>
                <div className="stat-value">
                  {formatCurrency(stats?.pendingReferrals || 0)}
                </div>
                <p className="stat-period">Awaiting verification</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">💵</div>
              <div className="stat-content">
                <h3>Reward Amount</h3>
                <div className="stat-value">#5,000</div>
                <p className="stat-period">Per qualifying referral</p>
              </div>
            </div>
          </div>

          {/* Referral Rewards History */}
          <div className="referral-rewards-history">
            <h2>Referral Rewards History</h2>
            <div className="table-container">
              <table className="earnings-table">
                <thead>
                  <tr>
                    <th>Referred Friend</th>
                    <th>User Type</th>
                    <th>Signup Date</th>
                    <th>Reward Type</th>
                    <th>Reward Amount</th>
                    <th>Status</th>
                    <th>Trigger Event</th>
                  </tr>
                </thead>
                <tbody>
                  {referralRewards.map(reward => (
                    <tr key={reward.id}>
                      <td>
                        <div className="friend-info">
                          <strong>{reward.referredUserName}</strong>
                          <small>{reward.referredUserEmail}</small>
                        </div>
                      </td>
                      <td>
                        <span className={`user-type ${reward.referredUserType}`}>
                          {reward.referredUserType === 'landlord' ? '🏠 Landlord' : '👤 Tenant'}
                        </span>
                      </td>
                      <td>{formatDate(reward.signupDate)}</td>
                      <td>{getRewardTypeLabel(reward.rewardType)}</td>
                      <td className="reward-amount">
                        #{reward.rewardAmount?.toLocaleString()}
                      </td>
                      <td>{getStatusBadge(reward.status)}</td>
                      <td className="trigger-event">
                        {reward.triggerEvent}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="how-it-works-section">
        <h2>How to Earn as a Landlord</h2>
        <div className="earning-methods">
          <div className="method-card">
            <div className="method-icon">💰</div>
            <h3>1% Commission System</h3>
            <ul>
              <li>✅ Post properties on RentEasy</li>
              <li>✅ Property gets rented through the platform</li>
              <li>✅ Earn 1% of the rental value as commission</li>
              <li>✅ Commission paid to your wallet automatically</li>
            </ul>
            <div className="method-example">
              <p><strong>Example:</strong> Rent = ₦2,500,000 → Earn <strong>₦25,000</strong></p>
            </div>
          </div>
          
          <div className="method-card">
            <div className="method-icon">🎯</div>
            <h3>#5000 Referral System</h3>
            <ul>
              <li>✅ Share your referral link with friends</li>
              <li>✅ Friend signs up using your link</li>
              <li>✅ Friend rents OR posts a property that gets rented</li>
              <li>✅ You earn #5000 per qualifying referral</li>
            </ul>
            <div className="method-example">
              <p><strong>Example:</strong> Refer 5 friends who rent → Earn <strong>#25,000</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralHistory;