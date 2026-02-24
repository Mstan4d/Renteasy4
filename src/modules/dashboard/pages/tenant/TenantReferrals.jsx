// src/modules/dashboard/pages/tenant/TenantReferrals.jsx - UPDATED FOR DUAL SYSTEM
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../shared/context/AuthContext';
import './TenantReferrals.css';

const TenantReferrals = () => {
  const { user } = useAuth();
  const [commissionEarnings, setCommissionEarnings] = useState([]); // 1.5% commissions
  const [referralRewards, setReferralRewards] = useState([]); // #5000 rewards
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState({ type: '', show: false });
  const [activeTab, setActiveTab] = useState('commissions'); // 'commissions' or 'referrals'

  useEffect(() => {
    loadEarningsData();
  }, []);

  // Show copy feedback temporarily
  useEffect(() => {
    if (copied.show) {
      const timer = setTimeout(() => setCopied({ type: '', show: false }), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied.show]);

 // Replace the loadEarningsData function inside TenantReferrals.jsx
// Replace your existing loadEarningsData with this
const loadEarningsData = async () => {
  try {
    setLoading(true);
    
    // Fetch Commissions (The 1.5% system)
    const { data: commissions, error: commError } = await supabase
      .from('tenant_commissions')
      .select(`
        id, 
        property_title, 
        rental_value, 
        commission_amount, 
        status, 
        created_at, 
        rented_at
      `)
      .eq('tenant_id', user.id) // Ensure they only see THEIR earnings
      .order('created_at', { ascending: false });

    if (commError) throw commError;

    // Fetch Referrals (The #5000 system)
    const { data: referrals, error: refError } = await supabase
      .from('tenant_referrals')
      .select('*')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });

    if (refError) throw refError;

    setCommissionEarnings(commissions || []);
    setReferralRewards(referrals || []);

  } catch (error) {
    console.error('Backend Sync Error:', error.message);
  } finally {
    setLoading(false);
  }
};
  // Generate unique referral code
  const referralCode = user?.id 
    ? `RENTEASY-${user.id.slice(0, 8).toUpperCase()}`
    : 'RENTEASY-GUEST';

  const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied({ type, show: true });
  };

  const shareOnSocial = (platform) => {
    let shareUrl = '';
    const message = `Join RentEasy - Nigeria's premium rental platform! Refer friends and earn: 
    
1️⃣ #5000 when they sign up AND rent a property
2️⃣ #5000 when they sign up AND post a property that gets rented
    
Use my referral code: ${referralCode} - ${referralLink}`;
    
    switch(platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(message)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank');
  };

  // Calculate totals for BOTH systems
  const totalCommissionEarned = commissionEarnings
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + (c.commissionAmount || 0), 0);

  const totalReferralRewardsEarned = referralRewards
    .filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + (r.rewardAmount || 0), 0);

  const totalEarned = totalCommissionEarned + totalReferralRewardsEarned;

  // Count pending amounts
  const pendingCommissions = commissionEarnings
    .filter(c => c.status === 'calculated')
    .reduce((sum, c) => sum + (c.commissionAmount || 0), 0);

  const pendingReferrals = referralRewards
    .filter(r => r.status === 'verified' || r.status === 'pending')
    .reduce((sum, r) => sum + (r.rewardAmount || 0), 0);

  // Copy Feedback Component
  const CopyFeedback = () => (
    <div className="copy-feedback">
      {copied.type === 'code' ? '✓ Referral code copied!' : '✓ Referral link copied!'}
    </div>
  );

  // Status helper functions
  const getCommissionStatusLabel = (status) => {
  const labels = {
    pending: '⏳ House Listed',
    calculated: '💰 1.5% Earned (Processing)',
    paid: '✅ Paid to Wallet'
  };
  return labels[status] || status;
};

  const getReferralStatusLabel = (status) => {
    const labels = {
      pending: '⏳ Pending Verification',
      verified: '✅ Verified (Awaiting Payment)',
      paid: '💰 Paid to Wallet'
    };
    return labels[status] || status;
  };

  const getRewardTypeLabel = (type) => {
    const labels = {
      rental_completed: '🏠 Rented a Property',
      house_posted_and_rented: '📝 Posted & Rented House'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="referrals-loading">
        <div className="loading-spinner"></div>
        <p>Loading earnings data...</p>
      </div>
    );
  }

  return (
    <div className="tenant-referrals">
      {copied.show && <CopyFeedback />}
      
      {/* Header with Two Earnings Types */}
      <div className="referrals-header">
        <div className="header-content">
          <h1>Earn with RentEasy</h1>
          <p>Double earning opportunity: 1.5% commissions + #5000 referral rewards</p>
        </div>
        <button 
          className="btn btn-primary invite-btn"
          onClick={() => setShowShareModal(true)}
        >
          <span className="btn-icon">📤</span>
          <span className="btn-text">Invite & Earn</span>
        </button>
      </div>

      {/* Dual System Stats */}
      <div className="dual-earnings-stats">
        <div className="stats-tabs">
          <button 
            className={`stat-tab ${activeTab === 'commissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('commissions')}
          >
            💰 1.5% Commissions
          </button>
          <button 
            className={`stat-tab ${activeTab === 'referrals' ? 'active' : ''}`}
            onClick={() => setActiveTab('referrals')}
          >
            🎯 #5000 Referrals
          </button>
        </div>

        {activeTab === 'commissions' ? (
          <div className="commission-stats">
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <span className="stat-value">₦{totalCommissionEarned.toLocaleString()}</span>
                <span className="stat-label">Commission Earned</span>
                <span className="stat-sub">1.5% of rentals from your posts</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-info">
                <span className="stat-value">{commissionEarnings.length}</span>
                <span className="stat-label">Properties Posted</span>
                <span className="stat-sub">{commissionEarnings.filter(c => c.rentedDate).length} rented</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <span className="stat-value">₦{pendingCommissions.toLocaleString()}</span>
                <span className="stat-label">Pending Payout</span>
                <span className="stat-sub">Awaiting payment processing</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <span className="stat-value">1.5%</span>
                <span className="stat-label">Commission Rate</span>
                <span className="stat-sub">Per successful rental</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="referral-stats">
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-info">
                <span className="stat-value">₦{totalReferralRewardsEarned.toLocaleString()}</span>
                <span className="stat-label">Referral Rewards</span>
                <span className="stat-sub">#5000 per successful referral</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <span className="stat-value">{referralRewards.length}</span>
                <span className="stat-label">Total Referrals</span>
                <span className="stat-sub">{referralRewards.filter(r => r.status === 'paid').length} paid</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <span className="stat-value">₦{pendingReferrals.toLocaleString()}</span>
                <span className="stat-label">Pending Rewards</span>
                <span className="stat-sub">Awaiting verification/payment</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💵</div>
              <div className="stat-info">
                <span className="stat-value">#5,000</span>
                <span className="stat-label">Reward Amount</span>
                <span className="stat-sub">Per qualifying referral</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* How Both Systems Work */}
      <div className="dual-system-explanation">
        <h3 className="section-title">How to Earn with RentEasy</h3>
        <div className="system-cards">
          <div className="system-card commission-system">
            <div className="system-icon">💰</div>
            <h4>1.5% Commission System</h4>
            <p className="system-subtitle">Earn 1% when houses you post get rented</p>
            <ul className="system-steps">
              <li>📝 <strong>Step 1:</strong> Post a vacating property (as outgoing tenant)</li>
              <li>🔍 <strong>Step 2:</strong> Property gets listed on RentEasy</li>
              <li>🤝 <strong>Step 3:</strong> Someone rents the property</li>
              <li>💳 <strong>Step 4:</strong> Get 1% of rental value as commission</li>
            </ul>
            <div className="system-example">
              <p><strong>Example:</strong> Rent = ₦2,000,000 → You earn <strong>₦20,000</strong></p>
            </div>
          </div>
          
          <div className="system-card referral-system">
            <div className="system-icon">🎯</div>
            <h4>#5000 Referral System</h4>
            <p className="system-subtitle">Earn #5000 when referrals sign up AND:</p>
            <ul className="system-steps">
              <li>🏠 <strong>Option A:</strong> They rent any property on RentEasy</li>
              <li>📝 <strong>Option B:</strong> They post a property that gets rented</li>
              <li>🔗 <strong>Step 1:</strong> Share your referral link</li>
              <li>✅ <strong>Step 2:</strong> Friend signs up with your link</li>
              <li>💰 <strong>Step 3:</strong> Get #5000 when they qualify</li>
            </ul>
            <div className="system-example">
              <p><strong>Example:</strong> Refer 5 friends who rent → Earn <strong>#25,000</strong></p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Tools */}
      <div className="referral-tools">
        <div className="tool-card">
          <h4 className="tool-title">
            <span className="tool-icon">🔗</span>
            Your Referral Link
          </h4>
          <p className="tool-subtitle">Share to earn #5000 per qualifying referral</p>
          <div className="link-display">
            <div className="link-text" onClick={() => copyToClipboard(referralLink, 'link')}>
              {referralLink}
            </div>
            <button 
              className="btn-copy"
              onClick={() => copyToClipboard(referralLink, 'link')}
            >
              <span className="copy-icon">📋</span>
              <span className="copy-text">Copy</span>
            </button>
          </div>
        </div>
        
        <div className="tool-card">
          <h4 className="tool-title">
            <span className="tool-icon">🎟️</span>
            Your Referral Code
          </h4>
          <p className="tool-subtitle">Use when inviting friends</p>
          <div className="code-display">
            <div className="code-text" onClick={() => copyToClipboard(referralCode, 'code')}>
              {referralCode}
            </div>
            <button 
              className="btn-copy"
              onClick={() => copyToClipboard(referralCode, 'code')}
            >
              <span className="copy-icon">📋</span>
              <span className="copy-text">Copy</span>
            </button>
          </div>
        </div>
      </div>

{/* Earnings History with Tabs */}
<div className="earnings-history">
  <div className="history-header">
    <div className="history-tabs">
      <button 
        className={`history-tab ${activeTab === 'commissions' ? 'active' : ''}`}
        onClick={() => setActiveTab('commissions')}
      >
        💰 Commission History
      </button>
      <button 
        className={`history-tab ${activeTab === 'referrals' ? 'active' : ''}`}
        onClick={() => setActiveTab('referrals')}
      >
        🎯 Referral Rewards
      </button>
    </div>
    <div className="history-stats">
      <span className="total-earned">
        Total Earned: <strong>₦{totalEarned.toLocaleString()}</strong>
      </span>
    </div>
  </div>
  
  {/* Commission History Table */}
  {activeTab === 'commissions' && (
    <div className="earnings-table-container">
      {/* Add mobile view here */}
      <div className="mobile-earnings-cards">
        {commissionEarnings.map(commission => (
          <div key={commission.id} className="mobile-history-card">
            <div className="card-row">
              <strong>{commission.propertyTitle}</strong>
              <span className={`status-badge status-${commission.status}`}>
                {getCommissionStatusLabel(commission.status)}
              </span>
            </div>
            <div className="card-row">
              <span>Rent: ₦{commission.rentalValue?.toLocaleString()}</span>
              <span className="reward-amount">Earned: ₦{commission.commissionAmount?.toLocaleString()}</span>
            </div>
            <div className="card-row footer">
              <small>Posted: {new Date(commission.created_at).toLocaleDateString()}</small>
              <span className="rate-badge">1.5% Fee</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Desktop table view */}
      {commissionEarnings.length > 0 ? (
        <div className="earnings-table">
          <table>
            <thead>
              <tr>
                <th>Property</th>
                <th>Rental Value</th>
                <th>Commission</th>
                <th>Status</th>
                <th>Date Posted</th>
                <th>Date Rented</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {commissionEarnings.map(commission => (
                <tr key={commission.id}>
                  <td>
                    <div className="property-info">
                      <strong>{commission.propertyTitle}</strong>
                      <small>ID: {commission.propertyId}</small>
                    </div>
                  </td>
                  <td>
                    <span className="rental-value">
                      ₦{commission.rentalValue?.toLocaleString() || '0'}
                    </span>
                  </td>
                  <td>
                    <div className="commission-info">
                      <span className="commission-rate">{commission.commissionRate}</span>
                      <span className="commission-amount">
                        ₦{commission.commissionAmount?.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge status-${commission.status}`}>
                      {getCommissionStatusLabel(commission.status)}
                    </span>
                  </td>
                  <td>{commission.postedDate}</td>
                  <td>{commission.rentedDate || 'Not yet'}</td>
                  <td className="notes">{commission.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-earnings">
          <div className="empty-icon">📝</div>
          <h4>No Commission History Yet</h4>
          <p>Start posting properties to earn 1% commissions!</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/dashboard/post-property'}
          >
            Post Your First Property
          </button>
        </div>
      )}
    </div>
  )}
  
  {/* Referral Rewards Table */}
  {activeTab === 'referrals' && (
    <div className="earnings-table-container">
      {/* Add mobile view for referrals here if needed */}
      {referralRewards.length > 0 ? (
        <div className="earnings-table">
          <table>
            <thead>
              <tr>
                <th>Referred Friend</th>
                <th>Signup Date</th>
                <th>Reward Type</th>
                <th>Reward Amount</th>
                <th>Status</th>
                <th>Trigger Event</th>
                <th>Notes</th>
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
                  <td>{reward.signupDate}</td>
                  <td>
                    <span className="reward-type">
                      {getRewardTypeLabel(reward.rewardType)}
                    </span>
                  </td>
                  <td>
                    <span className="reward-amount">
                      #{(reward.rewardAmount || 0).toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${reward.status}`}>
                      {getReferralStatusLabel(reward.status)}
                    </span>
                  </td>
                  <td className="trigger-event">{reward.triggerEvent}</td>
                  <td className="notes">{reward.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-earnings">
          <div className="empty-icon">👥</div>
          <h4>No Referral Rewards Yet</h4>
          <p>Start referring friends to earn #5000 per qualifying referral!</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowShareModal(true)}
          >
            Invite Your First Friend
          </button>
        </div>
      )}
    </div>
  )}
</div>

      {/* Terms and Conditions */}
      <div className="terms-section">
        <h3 className="section-title">Terms & Conditions</h3>
        <div className="terms-grid">
          <div className="term-card">
            <h4>💰 1.5% Commission Terms</h4>
            <ul>
              <li>Only applies to properties you post on RentEasy</li>
              <li>Commission calculated on actual rental amount</li>
              <li>Paid within 7 days after rental completion</li>
              <li>Subject to property verification</li>
            </ul>
          </div>
          <div className="term-card">
            <h4>🎯 #5000 Referral Terms</h4>
            <ul>
              <li>Friend must sign up using YOUR referral link</li>
              <li>Reward triggered when friend rents OR posts a rented property</li>
              <li>#5000 paid per qualifying referral</li>
              <li>No limit on number of referrals</li>
            </ul>
          </div>
          <div className="term-card">
            <h4>📝 General Terms</h4>
            <ul>
              <li>All earnings subject to verification</li>
              <li>Payments made to RentEasy wallet</li>
              <li>Terms may be updated with notice</li>
              <li>Fraudulent activity voids all earnings</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Invite Friends & Earn</h3>
              <button className="close-modal" onClick={() => setShowShareModal(false)}>
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="modal-share-options">
                {[
                  { platform: 'whatsapp', icon: '💬', label: 'WhatsApp', color: '#25D366' },
                  { platform: 'twitter', icon: '🐦', label: 'Twitter', color: '#1DA1F2' },
                  { platform: 'facebook', icon: '📘', label: 'Facebook', color: '#4267B2' },
                  { platform: 'telegram', icon: '📱', label: 'Telegram', color: '#0088cc' },
                  { platform: 'copy', icon: '📋', label: 'Copy Link', color: '#6B7280' }
                ].map((option) => (
                  <button 
                    key={option.platform}
                    className="share-option-btn"
                    onClick={() => {
                      if (option.platform === 'copy') {
                        copyToClipboard(referralLink, 'link');
                      } else {
                        shareOnSocial(option.platform);
                      }
                      setShowShareModal(false);
                    }}
                    style={{ borderLeftColor: option.color }}
                  >
                    <span className="option-icon" style={{ color: option.color }}>
                      {option.icon}
                    </span>
                    <span className="option-label">{option.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="referral-preview">
                <h4>Share Message Template:</h4>
                <div className="preview-content">
                  <p>Hey! Join RentEasy - Nigeria's premium rental platform!</p>
                  <p><strong>Earn with me:</strong></p>
                  <p>💰 <strong>1% Commission:</strong> When you post properties that get rented</p>
                  <p>🎯 <strong>#5000 Reward:</strong> I get #5000 when you sign up AND rent or post a rented property</p>
                  <div className="preview-code">
                    Use my code: <strong>{referralCode}</strong>
                  </div>
                  <div className="preview-link">
                    Sign up: {referralLink}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantReferrals;