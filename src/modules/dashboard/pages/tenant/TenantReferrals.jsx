// src/modules/dashboard/pages/tenant/TenantReferrals.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../shared/context/AuthContext';
import './TenantReferrals.css';

const TenantReferrals = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = () => {
    setLoading(true);
    
    // Mock referral data
    const mockReferrals = [
      {
        id: '1',
        referredName: 'John Doe',
        referredEmail: 'john@example.com',
        dateReferred: '2024-12-01',
        status: 'signed_up',
        rewardStatus: 'pending',
        rewardAmount: '₦5,000'
      },
      {
        id: '2',
        referredName: 'Sarah Smith',
        referredEmail: 'sarah@example.com',
        dateReferred: '2024-12-05',
        status: 'active_user',
        rewardStatus: 'credited',
        rewardAmount: '₦5,000'
      },
      {
        id: '3',
        referredName: 'Mike Johnson',
        referredEmail: 'mike@example.com',
        dateReferred: '2024-12-10',
        status: 'pending',
        rewardStatus: 'pending',
        rewardAmount: '₦5,000'
      }
    ];

    const savedReferrals = JSON.parse(localStorage.getItem(`tenant_referrals_${user?.id}`) || 'null');
    
    if (savedReferrals) {
      setReferrals(savedReferrals);
    } else {
      setReferrals(mockReferrals);
      localStorage.setItem(`tenant_referrals_${user?.id}`, JSON.stringify(mockReferrals));
    }
    
    setLoading(false);
  };

  // Generate unique referral code
  const referralCode = user?.id 
    ? `RENTEASY-${user.id.slice(0, 8).toUpperCase()}`
    : 'RENTEASY-GUEST';

  const referralLink = `https://renteasy.com/signup?ref=${referralCode}`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const shareOnSocial = (platform) => {
    let shareUrl = '';
    
    switch(platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`Join RentEasy - Nigeria's premium rental platform! Use my referral code: ${referralCode} - ${referralLink}`)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join RentEasy! Use my referral code: ${referralCode} ${referralLink}`)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank');
  };

  const totalEarned = referrals
    .filter(r => r.rewardStatus === 'credited')
    .reduce((sum, r) => sum + parseFloat(r.rewardAmount.replace(/[^0-9.-]+/g, '')), 0);

  const pendingRewards = referrals
    .filter(r => r.rewardStatus === 'pending')
    .reduce((sum, r) => sum + parseFloat(r.rewardAmount.replace(/[^0-9.-]+/g, '')), 0);

  if (loading) {
    return (
      <div className="referrals-loading">
        <div className="loading-spinner"></div>
        <p>Loading referrals...</p>
      </div>
    );
  }

  return (
    <div className="tenant-referrals">
      <div className="referrals-header">
        <div className="header-content">
          <h1>Refer & Earn</h1>
          <p>Invite friends and earn rewards when they join RentEasy</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowShareModal(true)}
        >
          Invite Friends
        </button>
      </div>

      {/* Stats */}
      <div className="referral-stats">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-value">₦{totalEarned.toLocaleString()}</span>
            <span className="stat-label">Total Earned</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-value">{referrals.length}</span>
            <span className="stat-label">Friends Referred</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-value">₦{pendingRewards.toLocaleString()}</span>
            <span className="stat-label">Pending Rewards</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎁</div>
          <div className="stat-info">
            <span className="stat-value">₦5,000</span>
            <span className="stat-label">Per Successful Referral</span>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="how-it-works">
        <h3>How It Works</h3>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Share Your Link</h4>
              <p>Share your unique referral link with friends</p>
            </div>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Friend Signs Up</h4>
              <p>Your friend signs up using your referral link</p>
            </div>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Friend Completes Action</h4>
              <p>Your friend lists or rents their first property</p>
            </div>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>You Get Rewarded</h4>
              <p>Earn ₦5,000 for each successful referral</p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Code & Link */}
      <div className="referral-tools">
        <div className="tool-card">
          <h4>Your Referral Code</h4>
          <div className="code-display">
            <span className="code-text">{referralCode}</span>
            <button 
              className="btn-copy"
              onClick={() => copyToClipboard(referralCode)}
            >
              Copy
            </button>
          </div>
        </div>
        
        <div className="tool-card">
          <h4>Your Referral Link</h4>
          <div className="link-display">
            <span className="link-text">{referralLink}</span>
            <button 
              className="btn-copy"
              onClick={() => copyToClipboard(referralLink)}
            >
              Copy Link
            </button>
          </div>
        </div>
      </div>

      {/* Quick Share */}
      <div className="quick-share">
        <h4>Quick Share</h4>
        <div className="share-buttons">
          <button 
            className="share-btn whatsapp"
            onClick={() => shareOnSocial('whatsapp')}
          >
            <span className="share-icon">💬</span>
            WhatsApp
          </button>
          <button 
            className="share-btn twitter"
            onClick={() => shareOnSocial('twitter')}
          >
            <span className="share-icon">🐦</span>
            Twitter
          </button>
          <button 
            className="share-btn facebook"
            onClick={() => shareOnSocial('facebook')}
          >
            <span className="share-icon">📘</span>
            Facebook
          </button>
          <button 
            className="share-btn email"
            onClick={() => {
              const subject = 'Join RentEasy with my referral!';
              const body = `Hi!\n\nJoin RentEasy - Nigeria's premium rental platform. Use my referral code: ${referralCode}\n\nSign up here: ${referralLink}\n\nBest regards,\n${user?.name || 'Your friend'}`;
              window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            }}
          >
            <span className="share-icon">✉️</span>
            Email
          </button>
        </div>
      </div>

      {/* Referral History */}
      <div className="referral-history">
        <h3>Your Referrals</h3>
        
        {referrals.length > 0 ? (
          <div className="referrals-table-container">
            <table className="referrals-table">
              <thead>
                <tr>
                  <th>Referred Friend</th>
                  <th>Email</th>
                  <th>Date Referred</th>
                  <th>Status</th>
                  <th>Reward</th>
                  <th>Reward Status</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map(ref => (
                  <tr key={ref.id}>
                    <td>{ref.referredName}</td>
                    <td>{ref.referredEmail}</td>
                    <td>{ref.dateReferred}</td>
                    <td>
                      <span className={`status-badge status-${ref.status}`}>
                        {ref.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="reward-amount">{ref.rewardAmount}</td>
                    <td>
                      <span className={`reward-status reward-${ref.rewardStatus}`}>
                        {ref.rewardStatus.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-referrals">
            <div className="empty-icon">🤝</div>
            <h4>No Referrals Yet</h4>
            <p>Start referring friends to earn rewards!</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowShareModal(true)}
            >
              Invite Your First Friend
            </button>
          </div>
        )}
      </div>

      {/* Terms & Conditions */}
      <div className="referral-terms">
        <h4>Terms & Conditions</h4>
        <ul className="terms-list">
          <li>Reward is credited after referred friend completes their first rental transaction</li>
          <li>Maximum of 10 referrals per month</li>
          <li>Rewards can be withdrawn to your bank account</li>
          <li>Fraudulent referrals will result in account suspension</li>
          <li>Program terms may change without prior notice</li>
        </ul>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Share & Invite</h3>
              <button className="close-modal" onClick={() => setShowShareModal(false)}>
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="modal-share-options">
                <button 
                  className="share-option-btn whatsapp"
                  onClick={() => {
                    shareOnSocial('whatsapp');
                    setShowShareModal(false);
                  }}
                >
                  <span className="option-icon">💬</span>
                  <span className="option-label">Share on WhatsApp</span>
                </button>
                
                <button 
                  className="share-option-btn twitter"
                  onClick={() => {
                    shareOnSocial('twitter');
                    setShowShareModal(false);
                  }}
                >
                  <span className="option-icon">🐦</span>
                  <span className="option-label">Share on Twitter</span>
                </button>
                
                <button 
                  className="share-option-btn facebook"
                  onClick={() => {
                    shareOnSocial('facebook');
                    setShowShareModal(false);
                  }}
                >
                  <span className="option-icon">📘</span>
                  <span className="option-label">Share on Facebook</span>
                </button>
                
                <button 
                  className="share-option-btn copy-link"
                  onClick={() => {
                    copyToClipboard(referralLink);
                    setShowShareModal(false);
                  }}
                >
                  <span className="option-icon">📋</span>
                  <span className="option-label">Copy Referral Link</span>
                </button>
              </div>
              
              <div className="referral-preview">
                <h4>Preview Message</h4>
                <div className="preview-content">
                  <p>Hey! Join RentEasy - Nigeria's premium rental platform. Use my referral code:</p>
                  <div className="preview-code">{referralCode}</div>
                  <p>Sign up here: {referralLink}</p>
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