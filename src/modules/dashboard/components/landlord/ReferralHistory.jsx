import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import { 
  TrendingUp, Award, Clock, CheckCircle, 
  ArrowLeft, Share2, Wallet, Building 
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
      // 1. Fetch 1.5% Poster Commissions
      const { data: commData, error: commError } = await supabase
        .from('tenant_commissions') // Sharing the table name from our previous setup
        .select('*')
        .eq('tenant_id', user.id) // In Supabase, Landlord/Tenant are both users
        .order('created_at', { ascending: false });

      if (commError) throw commError;

      // 2. Fetch ₦5,000 Referral Rewards
      const { data: refData, error: refError } = await supabase
        .from('referral_rewards')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (refError) throw refError;

      setCommissions(commData || []);
      setReferrals(refData || []);

      // 3. Calculate Stats
      const paidComm = commData?.filter(c => c.status === 'paid').reduce((s, c) => s + Number(c.commission_amount), 0) || 0;
      const paidRef = refData?.filter(r => r.status === 'paid').reduce((s, r) => s + Number(r.reward_amount), 0) || 0;
      
      const pendingComm = commData?.filter(c => c.status === 'calculated').reduce((s, c) => s + Number(c.commission_amount), 0) || 0;
      const pendingRef = refData?.filter(r => r.status === 'verified').reduce((s, r) => s + Number(r.reward_amount), 0) || 0;

      setStats({
        totalEarned: paidComm + paidRef,
        pendingPayout: pendingComm + pendingRef,
        qualifiedCount: refData?.filter(r => r.status !== 'pending').length || 0
      });

    } catch (error) {
      console.error('Error syncing with Supabase:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNGN = (amt) => `₦${Number(amt).toLocaleString('en-NG')}`;

  const getStatusBadge = (status) => {
    const map = {
      paid: { label: 'Settled', class: 'paid' },
      calculated: { label: 'Admin Review', class: 'review' },
      pending: { label: 'Pending', class: 'pending' },
      verified: { label: 'Verified', class: 'review' }
    };
    const s = map[status] || { label: status, class: 'pending' };
    return <span className={`status-pill ${s.class}`}>{s.label}</span>;
  };

  if (isLoading) return <div className="loading-state">Syncing with Ledger...</div>;

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
            <span>Pending Admin Payout</span>
            <h3>{formatNGN(stats.pendingPayout)}</h3>
          </div>
        </div>
      </div>

      {/* Toggle Tabs */}
      <div className="tab-switcher">
        <button 
          className={activeTab === 'commissions' ? 'active' : ''} 
          onClick={() => setActiveTab('commissions')}
        >
          <Building size={18} /> 1.5% Posters
        </button>
        <button 
          className={activeTab === 'referrals' ? 'active' : ''} 
          onClick={() => setActiveTab('referrals')}
        >
          <Share2 size={18} /> ₦5,000 Referrals
        </button>
      </div>

      <main className="history-list">
        {activeTab === 'commissions' ? (
          commissions.length > 0 ? commissions.map(item => (
            <div className="history-item" key={item.id}>
              <div className="item-main">
                <h4>{item.property_title || 'Property Rental'}</h4>
                <p>{new Date(item.created_at).toLocaleDateString()}</p>
              </div>
              <div className="item-side">
                <span className="amt">+{formatNGN(item.commission_amount)}</span>
                {getStatusBadge(item.status)}
              </div>
            </div>
          )) : <div className="empty-box">No commissions yet. Post a house to start!</div>
        ) : (
          referrals.length > 0 ? referrals.map(item => (
            <div className="history-item" key={item.id}>
              <div className="item-main">
                <h4>Referral: {item.friend_name || 'New User'}</h4>
                <p>Joined: {new Date(item.created_at).toLocaleDateString()}</p>
              </div>
              <div className="item-side">
                <span className="amt">+{formatNGN(item.reward_amount)}</span>
                {getStatusBadge(item.status)}
              </div>
            </div>
          )) : <div className="empty-box">No referrals yet. Share your link!</div>
        )}
      </main>
    </div>
  );
};

export default ReferralHistory;