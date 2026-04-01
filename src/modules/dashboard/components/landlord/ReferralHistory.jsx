// src/modules/dashboard/components/landlord/ReferralHistory.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import RentEasyLoader from '../../../../shared/components/RentEasyLoader';
import { 
  TrendingUp, Award, Clock, CheckCircle, 
  ArrowLeft, Share2, Wallet, Building, Home, Users
} from 'lucide-react';
import './ReferralHistory.css';

const ReferralHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('commissions');
  
  // Data States
  const [commissions, setCommissions] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState({
    totalEarned: 0,
    pendingPayout: 0,
    qualifiedCount: 0
  });

  useEffect(() => {
    if (user) fetchEarningsData();
  }, [user]);

  const fetchEarningsData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch 1.5% Poster Commissions from commissions table (landlord as referrer)
      const { data: commData, error: commError } = await supabase
        .from('commissions')
        .select(`
          *,
          listing:listing_id (
            id,
            title,
            price,
            address,
            status
          )
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (commError) {
        console.error('Error fetching commissions:', commError);
      }

      // 2. Fetch #5000 Referral Rewards from referrals table
      const { data: refData, error: refError } = await supabase
        .from('referrals')
        .select(`
          *,
          referred:referred_id (
            id,
            full_name,
            email
          )
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (refError && refError.code !== 'PGRST116') {
        console.error('Error fetching referrals:', refError);
      }

      setCommissions(commData || []);
      setReferrals(refData || []);

      // 3. Calculate Stats
      const paidComm = (commData || [])
        .filter(c => c.status === 'paid' || c.paid_to_referrer === true)
        .reduce((s, c) => s + Number(c.referrer_share || 0), 0);
      
      const paidRef = (refData || [])
        .filter(r => r.bonus_paid === true || r.paid === true)
        .reduce((s, r) => s + Number(r.bonus_amount || 0), 0);
      
      const pendingComm = (commData || [])
        .filter(c => (c.status === 'verified' || c.status === 'pending') && !c.paid_to_referrer)
        .reduce((s, c) => s + Number(c.referrer_share || 0), 0);
      
      const pendingRef = (refData || [])
        .filter(r => (r.status === 'pending' || r.status === 'verified') && !r.bonus_paid && !r.paid)
        .reduce((s, r) => s + Number(r.bonus_amount || 5000), 0);

      setStats({
        totalEarned: paidComm + paidRef,
        pendingPayout: pendingComm + pendingRef,
        qualifiedCount: (refData || []).filter(r => r.bonus_paid === true || r.paid === true).length
      });

    } catch (error) {
      console.error('Error syncing with Supabase:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNGN = (amt) => `₦${Number(amt || 0).toLocaleString('en-NG')}`;
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (item, isReferral = false) => {
    if (isReferral) {
      const isPaid = item.bonus_paid === true || item.paid === true;
      if (isPaid) {
        return <span className="status-pill paid">💰 Paid</span>;
      }
      if (item.status === 'verified') {
        return <span className="status-pill review">✅ Verified</span>;
      }
      return <span className="status-pill pending">⏳ Pending</span>;
    }
    
    // Commission status
    const map = {
      paid: { label: 'Paid to Bank', class: 'paid' },
      verified: { label: 'Awaiting Payout', class: 'review' },
      pending: { label: 'Pending', class: 'pending' },
      proof_submitted: { label: 'Proof Submitted', class: 'review' }
    };
    const s = map[item.status] || { label: item.status, class: 'pending' };
    return <span className={`status-pill ${s.class}`}>{s.label}</span>;
  };

  if (isLoading) {
    return <RentEasyLoader message="Loading your Referrals..." fullScreen />;
  }

  return (
    <div className="referral-history-page">
      <header className="history-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div className="header-title">
          <h1>Earnings History</h1>
          <p>Track your commissions and referral bonuses</p>
        </div>
      </header>

      {/* Summary Row */}
      <div className="stats-row">
        <div className="stat-card-mini highlight">
          <Wallet className="icon" />
          <div>
            <span>Total Settled</span>
            <h3>{formatNGN(stats.totalEarned)}</h3>
          </div>
        </div>
        <div className="stat-card-mini">
          <Clock className="icon" />
          <div>
            <span>Pending Payout</span>
            <h3>{formatNGN(stats.pendingPayout)}</h3>
          </div>
        </div>
        <div className="stat-card-mini">
          <Users className="icon" />
          <div>
            <span>Qualified Referrals</span>
            <h3>{stats.qualifiedCount}</h3>
          </div>
        </div>
      </div>

      {/* Toggle Tabs */}
      <div className="tab-switcher">
        <button 
          className={activeTab === 'commissions' ? 'active' : ''} 
          onClick={() => setActiveTab('commissions')}
        >
          <Building size={18} /> 1.5% Poster Commissions
        </button>
        <button 
          className={activeTab === 'referrals' ? 'active' : ''} 
          onClick={() => setActiveTab('referrals')}
        >
          <Share2 size={18} /> #5000 Referral Rewards
        </button>
      </div>

      <main className="history-list">
        {activeTab === 'commissions' ? (
          commissions.length > 0 ? (
            commissions.map(item => (
              <div className="history-item" key={item.id}>
                <div className="item-main">
                  <div className="item-icon commission-icon">
                    <Home size={20} />
                  </div>
                  <div>
                    <h4>{item.listing?.title || 'Property Rental'}</h4>
                    <p>{formatDate(item.created_at)}</p>
                    {item.listing?.address && (
                      <small className="property-address">{item.listing.address}</small>
                    )}
                  </div>
                </div>
                <div className="item-side">
                  <span className="amt">+{formatNGN(item.referrer_share)}</span>
                  {getStatusBadge(item)}
                  {item.rental_amount && (
                    <small className="rental-amount">
                      Rental: {formatNGN(item.rental_amount)}
                    </small>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-box">
              <Home size={48} />
              <h4>No commissions yet</h4>
              <p>Post a property to start earning 1.5% commission when it gets rented!</p>
              <button className="btn-primary" onClick={() => navigate('/post-property')}>
                Post Your First Property
              </button>
            </div>
          )
        ) : (
          referrals.length > 0 ? (
            referrals.map(item => (
              <div className="history-item" key={item.id}>
                <div className="item-main">
                  <div className="item-icon referral-icon">
                    <Users size={20} />
                  </div>
                  <div>
                    <h4>{item.referred?.full_name || 'Referral'}</h4>
                    <p>Joined: {formatDate(item.created_at)}</p>
                    <small className="reward-type">
                      Referral via code: <strong>{item.referral_code}</strong>
                    </small>
                  </div>
                </div>
                <div className="item-side">
                  <span className="amt">+{formatNGN(item.bonus_amount || 5000)}</span>
                  {getStatusBadge(item, true)}
                  {item.paid_at && (
                    <small className="paid-date">
                      Paid: {formatDate(item.paid_at)}
                    </small>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-box">
              <Share2 size={48} />
              <h4>No referrals yet</h4>
              <p>Share your referral link to earn #5000 when your friends sign up and rent!</p>
              <div className="referral-link-preview">
                <code>Share your referral link from the dashboard</code>
              </div>
            </div>
          )
        )}
      </main>

      {/* How to Earn Section */}
      <div className="earn-guide">
        <h3>How to Earn More</h3>
        <div className="guide-grid">
          <div className="guide-card">
            <div className="guide-icon">🏠</div>
            <h4>Post Properties</h4>
            <p>List your properties on RentEasy. When they get rented, you earn 1.5% commission!</p>
            <button className="guide-btn" onClick={() => navigate('/post-property')}>
              Post a Property →
            </button>
          </div>
          <div className="guide-card">
            <div className="guide-icon">🔗</div>
            <h4>Share Referral Link</h4>
            <p>Invite friends to join RentEasy. Get #5000 when they sign up and rent a property.</p>
            <button className="guide-btn" onClick={() => {
              const referralLink = `${window.location.origin}/signup?ref=${user?.id}`;
              navigator.clipboard.writeText(referralLink);
              alert('Referral link copied!');
            }}>
              Copy Referral Link →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralHistory;