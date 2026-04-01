// src/modules/dashboard/pages/tenant/TenantReferrals.jsx - FIXED VERSION

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import RentEasyLoader from '../../../../shared/components/RentEasyLoader';
import { Copy, Check, Share2, Users, Gift, TrendingUp, DollarSign } from 'lucide-react';
import './TenantReferrals.css';

const TenantReferrals = () => {
  const { user } = useAuth();
  const [commissionEarnings, setCommissionEarnings] = useState([]);
  const [referralRewards, setReferralRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState({ type: '', show: false });
  const [activeTab, setActiveTab] = useState('commissions');
  const [profileData, setProfileData] = useState({
    referral_code: '',
    total_commission_earned: 0,
    total_referral_earned: 0,
    total_referrals: 0
  });

  useEffect(() => {
    if (user) {
      loadProfileData();
      loadEarningsData();
    }
  }, [user]);

  useEffect(() => {
    if (copied.show) {
      const timer = setTimeout(() => setCopied({ type: '', show: false }), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied.show]);

  const loadProfileData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('referral_code, total_commission_earned, total_referral_earned, total_referrals')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile data:', error);
      }

      if (data) {
        setProfileData({
          referral_code: data.referral_code || generateReferralCode(),
          total_commission_earned: data.total_commission_earned || 0,
          total_referral_earned: data.total_referral_earned || 0,
          total_referrals: data.total_referrals || 0
        });
        
        // Save referral code if it was generated
        if (!data.referral_code) {
          const referralCode = generateReferralCode();
          await supabase
            .from('profiles')
            .update({ referral_code: referralCode })
            .eq('id', user.id);
          setProfileData(prev => ({ ...prev, referral_code: referralCode }));
        }
      } else {
        // Create profile record if it doesn't exist
        const referralCode = generateReferralCode();
        await supabase
          .from('profiles')
          .upsert({ 
            id: user.id, 
            referral_code: referralCode,
            total_commission_earned: 0,
            total_referral_earned: 0,
            total_referrals: 0
          });
        setProfileData(prev => ({ ...prev, referral_code: referralCode }));
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const generateReferralCode = () => {
    return `RENT-${user.id.slice(0, 6).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  };

  const loadEarningsData = async () => {
    try {
      setLoading(true);

      // Fetch Commissions (1.5% system)
      const { data: commissions, error: commError } = await supabase
        .from('tenant_commissions')
        .select('*')
        .eq('tenant_id', user.id)
        .order('created_at', { ascending: false });

      if (commError && commError.code !== 'PGRST116') {
        console.error('Error loading commissions:', commError);
      }

      // Try commissions table as fallback
      let commissionsData = commissions || [];
      if (!commissionsData.length) {
        const { data: altCommissions } = await supabase
          .from('commissions')
          .select('*')
          .eq('user_id', user.id)
          .eq('user_role', 'tenant')
          .order('created_at', { ascending: false });
        commissionsData = altCommissions || [];
      }

      // Fetch Referrals
      const { data: referrals, error: refError } = await supabase
        .from('tenant_referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (refError && refError.code !== 'PGRST116') {
        console.error('Error loading referrals:', refError);
      }

      setCommissionEarnings(commissionsData || []);
      setReferralRewards(referrals || []);

    } catch (error) {
      console.error('Error loading earnings:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const referralCode = profileData.referral_code || generateReferralCode();
  const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied({ type, show: true });
  };

  const shareOnSocial = (platform) => {
    const message = `Join RentEasy - Nigeria's premium rental platform! 

🎯 Earn 1.5% commission when you post properties that get rented
💰 Plus #5000 referral reward when you sign up and rent or post a property

Use my referral code: ${referralCode}
Sign up: ${referralLink}`;
    
    let shareUrl = '';
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

  const totalCommissionEarned = commissionEarnings
    .filter(c => c.status === 'paid' || c.status === 'completed')
    .reduce((sum, c) => sum + (parseFloat(c.commission_amount) || 0), 0);

  const totalReferralRewardsEarned = referralRewards
    .filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + (parseFloat(r.reward_amount) || 0), 0);

  const totalEarned = totalCommissionEarned + totalReferralRewardsEarned;

  const pendingCommissions = commissionEarnings
    .filter(c => c.status === 'pending' || c.status === 'calculated')
    .reduce((sum, c) => sum + (parseFloat(c.commission_amount) || 0), 0);

  const pendingReferrals = referralRewards
    .filter(r => r.status === 'verified')
    .reduce((sum, r) => sum + (parseFloat(r.reward_amount) || 0), 0);

  const getCommissionStatusLabel = (status) => {
    const labels = {
      pending: '⏳ Awaiting Rental',
      calculated: '💰 1.5% Earned (Processing)',
      paid: '✅ Paid',
      completed: '✅ Completed'
    };
    return labels[status] || status;
  };

  const getReferralStatusLabel = (status) => {
    const labels = {
      pending: '⏳ Pending',
      verified: '✅ Verified (Ready)',
      paid: '💰 Paid'
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₦0';
    return `₦${parseFloat(amount).toLocaleString()}`;
  };

  if (loading) {
    return <RentEasyLoader message="Loading your earnings..." fullScreen />;
  }

  return (
    <div className="tenant-referrals">
      {copied.show && (
        <div className={`copy-feedback ${copied.type}`}>
          <Check size={16} />
          <span>{copied.type === 'code' ? 'Referral code copied!' : 'Referral link copied!'}</span>
        </div>
      )}
      
      {/* Header */}
      <div className="referrals-header">
        <div className="header-content">
          <h1>Earn with RentEasy</h1>
          <p>Double earning opportunity: 1.5% commissions + #5000 referral rewards</p>
        </div>
        <button 
          className="btn btn-primary invite-btn"
          onClick={() => setShowShareModal(true)}
        >
          <Share2 size={18} />
          <span>Invite & Earn</span>
        </button>
      </div>

      {/* Total Earnings Card */}
      <div className="total-earnings-card">
        <div className="total-earnings-icon">
          <DollarSign size={32} />
        </div>
        <div className="total-earnings-info">
          <span className="total-earnings-label">Total Earnings</span>
          <span className="total-earnings-value">{formatCurrency(totalEarned)}</span>
          <span className="total-earnings-sub">From commission and referral systems</span>
        </div>
      </div>

      {/* Dual System Stats */}
      <div className="dual-earnings-stats">
        <div className="stats-tabs">
          <button 
            className={`stat-tab ${activeTab === 'commissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('commissions')}
          >
            <TrendingUp size={16} />
            <span>1.5% Commissions</span>
          </button>
          <button 
            className={`stat-tab ${activeTab === 'referrals' ? 'active' : ''}`}
            onClick={() => setActiveTab('referrals')}
          >
            <Users size={16} />
            <span>#5000 Referrals</span>
          </button>
        </div>

        {activeTab === 'commissions' ? (
          <div className="commission-stats">
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <span className="stat-value">{formatCurrency(totalCommissionEarned)}</span>
                <span className="stat-label">Commission Earned</span>
                <span className="stat-sub">1.5% of rentals from your posts</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-info">
                <span className="stat-value">{commissionEarnings.length}</span>
                <span className="stat-label">Properties Posted</span>
                <span className="stat-sub">{commissionEarnings.filter(c => c.rented_at).length} rented</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <span className="stat-value">{formatCurrency(pendingCommissions)}</span>
                <span className="stat-label">Pending Payout</span>
                <span className="stat-sub">Awaiting payment processing</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="referral-stats">
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-info">
                <span className="stat-value">{formatCurrency(totalReferralRewardsEarned)}</span>
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
                <span className="stat-value">{formatCurrency(pendingReferrals)}</span>
                <span className="stat-label">Pending Rewards</span>
                <span className="stat-sub">Awaiting verification/payment</span>
              </div>
            </div>
          </div>
        )}
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
              <Copy size={16} />
              <span>Copy</span>
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
              <Copy size={16} />
              <span>Copy</span>
            </button>
          </div>
        </div>
      </div>

      {/* How Both Systems Work */}
      <div className="dual-system-explanation">
        <h3 className="section-title">How to Earn with RentEasy</h3>
        <div className="system-cards">
          <div className="system-card commission-system">
            <div className="system-icon">💰</div>
            <h4>1.5% Commission System</h4>
            <p className="system-subtitle">Earn 1.5% when houses you post get rented</p>
            <ul className="system-steps">
              <li>📝 Post a vacating property</li>
              <li>🔍 Property gets listed on RentEasy</li>
              <li>🤝 Someone rents the property</li>
              <li>💳 Get 1.5% of rental value as commission</li>
            </ul>
          </div>
          
          <div className="system-card referral-system">
            <div className="system-icon">🎯</div>
            <h4>#5000 Referral System</h4>
            <p className="system-subtitle">Earn #5000 when referrals qualify</p>
            <ul className="system-steps">
              <li>🔗 Share your referral link</li>
              <li>✅ Friend signs up with your link</li>
              <li>🏠 They rent OR post a rented property</li>
              <li>💰 You get #5000</li>
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
              <button className="close-modal" onClick={() => setShowShareModal(false)}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="modal-share-options">
                {[
                  { platform: 'whatsapp', icon: '💬', label: 'WhatsApp', color: '#25D366' },
                  { platform: 'twitter', icon: '🐦', label: 'Twitter', color: '#1DA1F2' },
                  { platform: 'facebook', icon: '📘', label: 'Facebook', color: '#4267B2' },
                  { platform: 'telegram', icon: '📱', label: 'Telegram', color: '#0088cc' }
                ].map((option) => (
                  <button 
                    key={option.platform}
                    className="share-option-btn"
                    onClick={() => {
                      shareOnSocial(option.platform);
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
                <button 
                  className="share-option-btn"
                  onClick={() => {
                    copyToClipboard(referralLink, 'link');
                    setShowShareModal(false);
                  }}
                  style={{ borderLeftColor: '#6B7280' }}
                >
                  <span className="option-icon">📋</span>
                  <span className="option-label">Copy Link</span>
                </button>
              </div>
              
              <div className="referral-preview">
                <h4>Share Message Template:</h4>
                <div className="preview-content">
                  <p>Join RentEasy - Nigeria's premium rental platform!</p>
                  <p><strong>Earn with me:</strong></p>
                  <p>💰 <strong>1.5% Commission:</strong> When you post properties that get rented</p>
                  <p>🎯 <strong>#5000 Reward:</strong> When you sign up AND rent or post a rented property</p>
                  <div className="preview-code">
                    Use my code: <strong>{referralCode}</strong>
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