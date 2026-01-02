// src/modules/dashboard/pages/tenant/TenantReferrals.jsx - UPDATED FOR 1% COMMISSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../shared/context/AuthContext';
import './TenantReferrals.css';

const TenantReferrals = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState({ type: '', show: false });

  useEffect(() => {
    loadReferrals();
  }, []);

  // Show copy feedback temporarily
  useEffect(() => {
    if (copied.show) {
      const timer = setTimeout(() => setCopied({ type: '', show: false }), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied.show]);

  const loadReferrals = () => {
    setLoading(true);
    
    // UPDATED: Mock referral data with 1% commission model
    const mockReferrals = [
      {
        id: '1',
        referredName: 'John Doe',
        referredEmail: 'john@example.com',
        dateReferred: '2024-12-01',
        status: 'signed_up', // signed_up, active_user, made_booking, completed_rental
        rewardStatus: 'pending', // pending, calculated, paid
        rewardType: 'commission',
        commissionRate: '1%',
        estimatedCommission: '₦15,000', // Example: 1% of ₦1,500,000 rental
        actualCommission: null, // Only filled when paid
        rentalValue: null, // Will be populated when rental happens
        notes: 'Friend signed up using your referral link'
      },
      {
        id: '2',
        referredName: 'Sarah Smith',
        referredEmail: 'sarah@example.com',
        dateReferred: '2024-12-05',
        status: 'completed_rental',
        rewardStatus: 'calculated',
        rewardType: 'commission',
        commissionRate: '1%',
        estimatedCommission: '₦20,000',
        actualCommission: '₦20,000',
        rentalValue: '₦2,000,000',
        notes: 'Completed rental: 3-bedroom apartment in Lekki'
      },
      {
        id: '3',
        referredName: 'Mike Johnson',
        referredEmail: 'mike@example.com',
        dateReferred: '2024-12-10',
        status: 'made_booking',
        rewardStatus: 'pending',
        rewardType: 'commission',
        commissionRate: '1%',
        estimatedCommission: '₦12,000',
        actualCommission: null,
        rentalValue: '₦1,200,000',
        notes: 'Currently viewing properties'
      },
      {
        id: '4',
        referredName: 'Ada Lovelace',
        referredEmail: 'ada@example.com',
        dateReferred: '2024-11-25',
        status: 'completed_rental',
        rewardStatus: 'paid',
        rewardType: 'commission',
        commissionRate: '1%',
        estimatedCommission: '₦25,000',
        actualCommission: '₦25,000',
        rentalValue: '₦2,500,000',
        notes: 'Commission paid to your wallet on Dec 10, 2024'
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

  const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied({ type, show: true });
  };

  const shareOnSocial = (platform) => {
    let shareUrl = '';
    const message = `Join RentEasy - Nigeria's premium rental platform! Refer friends and earn 1% commission when they successfully rent a property. Use my referral code: ${referralCode} - ${referralLink}`;
    
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

  // Calculate total actual commissions paid
  const totalEarned = referrals
    .filter(r => r.rewardStatus === 'paid' && r.actualCommission)
    .reduce((sum, r) => {
      const amount = parseFloat(r.actualCommission.replace(/[^0-9.-]+/g, '')) || 0;
      return sum + amount;
    }, 0);

  // Count pending commissions (calculated but not paid)
  const pendingCommissions = referrals
    .filter(r => r.rewardStatus === 'calculated')
    .reduce((sum, r) => {
      const amount = parseFloat(r.estimatedCommission.replace(/[^0-9.-]+/g, '')) || 0;
      return sum + amount;
    }, 0);

  // Count potential referrals (signed up but no rental yet)
  const potentialReferrals = referrals.filter(r => 
    r.status === 'signed_up' || r.status === 'made_booking'
  ).length;

  // Copy Feedback Component
  const CopyFeedback = () => (
    <div className="copy-feedback">
      {copied.type === 'code' ? '✓ Referral code copied!' : '✓ Referral link copied!'}
    </div>
  );

  const getStatusLabel = (status) => {
    const labels = {
      signed_up: 'Signed Up',
      active_user: 'Active User',
      made_booking: 'Made Booking',
      completed_rental: 'Completed Rental'
    };
    return labels[status] || status;
  };

  const getRewardStatusLabel = (status) => {
    const labels = {
      pending: 'Pending Calculation',
      calculated: 'Calculated (Awaiting Payment)',
      paid: 'Paid to Wallet'
    };
    return labels[status] || status;
  };

  const getCommissionText = (referral) => {
    if (referral.rewardStatus === 'paid' && referral.actualCommission) {
      return referral.actualCommission;
    } else if (referral.rewardStatus === 'calculated' && referral.estimatedCommission) {
      return `${referral.estimatedCommission} (estimated)`;
    } else if (referral.rentalValue) {
      return `1% of ${referral.rentalValue}`;
    } else {
      return '1% Commission (pending rental)';
    }
  };

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
      {copied.show && <CopyFeedback />}
      
      {/* Header */}
      <div className="referrals-header">
        <div className="header-content">
          <h1>Refer & Earn 1% Commission</h1>
          <p>Earn 1% commission when friends successfully rent properties through your referral</p>
        </div>
        <button 
          className="btn btn-primary invite-btn"
          onClick={() => setShowShareModal(true)}
        >
          <span className="btn-icon">📤</span>
          <span className="btn-text">Invite Friends</span>
        </button>
      </div>

      {/* Stats - UPDATED for 1% commission */}
      <div className="referral-stats">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-value">₦{totalEarned.toLocaleString()}</span>
            <span className="stat-label">Commissions Paid</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-value">{referrals.length}</span>
            <span className="stat-label">Total Referrals</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-value">₦{pendingCommissions.toLocaleString()}</span>
            <span className="stat-label">Pending Payout</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <span className="stat-value">1%</span>
            <span className="stat-label">Commission Rate</span>
          </div>
        </div>
      </div>

      {/* Commission Explanation */}
      <div className="commission-explanation">
        <h3 className="section-title">How Commission Works</h3>
        <div className="explanation-content">
          <p><strong>Earn 1% of every rental made by friends you refer</strong></p>
          <ul className="commission-steps">
            <li>👤 <strong>Step 1:</strong> Friend signs up using your referral link</li>
            <li>🔍 <strong>Step 2:</strong> Friend finds and rents a property on RentEasy</li>
            <li>💰 <strong>Step 3:</strong> 1% of their rental value is calculated as your commission</li>
            <li>💳 <strong>Step 4:</strong> Commission is paid to your wallet after rental completion</li>
          </ul>
          <div className="commission-example">
            <h4>Example:</h4>
            <p>If your friend rents a property for ₦2,000,000, you earn:</p>
            <div className="example-calculation">
              <span>₦2,000,000 × 1% = <strong>₦20,000</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works - UPDATED */}
      <div className="how-it-works">
        <h3 className="section-title">Earning Process</h3>
        <div className="steps-grid">
          {[
            { number: '1', title: 'Share Referral Link', desc: 'Share your unique link with friends' },
            { number: '2', title: 'Friend Rents Property', desc: 'Friend successfully rents any property' },
            { number: '3', title: 'Commission Calculated', desc: '1% of rental value calculated automatically' },
            { number: '4', title: 'Get Paid', desc: 'Commission paid to your wallet' }
          ].map((step, index) => (
            <div key={index} className="step-card">
              <div className="step-header">
                <div className="step-number">{step.number}</div>
                <h4>{step.title}</h4>
              </div>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Referral Code & Link */}
      <div className="referral-tools">
        <div className="tool-card">
          <h4 className="tool-title">
            <span className="tool-icon">🔗</span>
            Your Referral Link
          </h4>
          <p className="tool-subtitle">Share this link to start earning commissions</p>
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
          <p className="tool-subtitle">Use this code when inviting friends</p>
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

      {/* Quick Share */}
      <div className="quick-share">
        <h4 className="section-title">Quick Share</h4>
        <p className="share-subtitle">Share with friends and start earning 1% commissions</p>
        <div className="share-buttons">
          {[
            { platform: 'whatsapp', icon: '💬', label: 'WhatsApp' },
            { platform: 'twitter', icon: '🐦', label: 'Twitter' },
            { platform: 'facebook', icon: '📘', label: 'Facebook' },
            { platform: 'telegram', icon: '📱', label: 'Telegram' }
          ].map((social) => (
            <button 
              key={social.platform}
              className={`share-btn ${social.platform}`}
              onClick={() => shareOnSocial(social.platform)}
            >
              <span className="share-icon">{social.icon}</span>
              <span className="share-label">{social.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Referral History - UPDATED for 1% commission */}
      <div className="referral-history">
        <div className="history-header">
          <h3 className="section-title">Your Referrals & Commissions</h3>
          <span className="referrals-count">
            {referrals.length} referrals • {referrals.filter(r => r.status === 'completed_rental').length} completed rentals
          </span>
        </div>
        
        {referrals.length > 0 ? (
          <div className="referrals-list">
            {/* Desktop Table */}
            <div className="desktop-table">
              <table className="referrals-table">
                <thead>
                  <tr>
                    <th>Referred Friend</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Commission</th>
                    <th>Commission Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map(ref => (
                    <tr key={ref.id}>
                      <td>
                        <div className="friend-info">
                          <div className="friend-name">{ref.referredName}</div>
                          <div className="friend-email">{ref.referredEmail}</div>
                        </div>
                      </td>
                      <td>{ref.dateReferred}</td>
                      <td>
                        <span className={`status-badge status-${ref.status}`}>
                          {getStatusLabel(ref.status)}
                        </span>
                      </td>
                      <td className="commission-amount">
                        <div className="commission-info">
                          <div className="commission-rate">{ref.commissionRate}</div>
                          <div className="commission-value">{getCommissionText(ref)}</div>
                          {ref.rentalValue && (
                            <div className="rental-value">Rental: {ref.rentalValue}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`reward-status reward-${ref.rewardStatus}`}>
                          {getRewardStatusLabel(ref.rewardStatus)}
                        </span>
                      </td>
                      <td className="referral-notes">{ref.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="mobile-cards">
              {referrals.map(ref => (
                <div key={ref.id} className="referral-card">
                  <div className="card-header">
                    <div className="friend-info">
                      <div className="friend-name">{ref.referredName}</div>
                      <div className="friend-email">{ref.referredEmail}</div>
                    </div>
                    <div className="card-date">{ref.dateReferred}</div>
                  </div>
                  
                  <div className="card-details">
                    <div className="detail-row">
                      <span className="detail-label">Status:</span>
                      <span className={`status-badge status-${ref.status}`}>
                        {getStatusLabel(ref.status)}
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Commission:</span>
                      <div className="commission-details">
                        <span className="commission-rate">{ref.commissionRate}</span>
                        <span className="commission-value">{getCommissionText(ref)}</span>
                        {ref.rentalValue && (
                          <div className="rental-value">Rental: {ref.rentalValue}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Commission Status:</span>
                      <span className={`reward-status reward-${ref.rewardStatus}`}>
                        {getRewardStatusLabel(ref.rewardStatus)}
                      </span>
                    </div>
                    
                    {ref.notes && (
                      <div className="detail-row notes-row">
                        <span className="detail-label">Notes:</span>
                        <span className="referral-notes">{ref.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-referrals">
            <div className="empty-icon">🤝</div>
            <h4>No Referrals Yet</h4>
            <p>Start referring friends to earn 1% commissions on their rentals!</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowShareModal(true)}
            >
              Invite Your First Friend
            </button>
          </div>
        )}
      </div>

      {/* Commission Details & Terms */}
      <div className="commission-terms">
        <h3 className="section-title">Commission Details & Terms</h3>
        <div className="terms-grid">
          <div className="term-card">
            <div className="term-icon">💰</div>
            <h4>1% Commission Rate</h4>
            <p>You earn exactly 1% of the total rental value when your referred friend successfully rents any property.</p>
          </div>
          
          <div className="term-card">
            <div className="term-icon">⏰</div>
            <h4>Payment Timeline</h4>
            <p>Commissions are calculated immediately after rental completion and paid within 7 business days.</p>
          </div>
          
          <div className="term-card">
            <div className="term-icon">📊</div>
            <h4>Multiple Referrals</h4>
            <p>No limit on referrals. Earn 1% commission on every successful rental by each referred friend.</p>
          </div>
          
          <div className="term-card">
            <div className="term-icon">💳</div>
            <h4>Payment Method</h4>
            <p>All commissions are paid directly to your RentEasy wallet, which you can withdraw to your bank account.</p>
          </div>
        </div>
        
        <div className="additional-terms">
          <h4>Additional Terms:</h4>
          <ul className="terms-list">
            <li>Commission is based on the actual rental amount paid by your referred friend</li>
            <li>Only successful, completed rentals qualify for commission</li>
            <li>Commissions are subject to verification and may be withheld in case of fraud</li>
            <li>Program terms may be updated with prior notice</li>
          </ul>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Share & Earn 1% Commission</h3>
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
                <h4>Share This Message:</h4>
                <div className="preview-content">
                  <p>Hey! Join RentEasy - Nigeria's premium rental platform!</p>
                  <p><strong>Referral Bonus:</strong> I'll earn 1% commission when you successfully rent any property through my referral.</p>
                  <div className="preview-code" onClick={() => copyToClipboard(referralCode, 'code')}>
                    Use my referral code: <strong>{referralCode}</strong>
                    <span className="preview-copy">Tap to copy code</span>
                  </div>
                  <div className="preview-link" onClick={() => copyToClipboard(referralLink, 'link')}>
                    Sign up here: {referralLink}
                    <span className="preview-copy">Tap to copy link</span>
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