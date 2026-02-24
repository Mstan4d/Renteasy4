import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../shared/lib/supabaseClient';
import { useAuth } from '../../../../shared/context/AuthContext';
import {
  DollarSign, Calendar, CheckCircle, Clock,
  TrendingUp, Users, Receipt, X, Download,
  Filter, ChevronDown, ChevronUp, Copy, Share2,
  AlertCircle, Info, ExternalLink
} from 'lucide-react';
import './TenantDashboard.css';

const TenantDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for Data
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState({ balance: 0 });
  const [myListings, setMyListings] = useState([]);
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for Earnings Modal
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [earningsDetails, setEarningsDetails] = useState({
    totalEarned: 0,
    pending: 0,
    thisMonth: 0,
    lastMonth: 0,
    transactions: []
  });
  const [earningsLoading, setEarningsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [profRes, walletRes, listingsRes, savedRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('wallets').select('*').eq('user_id', user.id).single(),
        supabase.from('listings').select('*').eq('poster_id', user.id).limit(3),
        supabase.from('saved_properties').select('*, listings(*)').eq('user_id', user.id)
      ]);

      if (profRes.data) setProfile(profRes.data);
      if (walletRes.data) setWallet(walletRes.data);
      if (listingsRes.data) setMyListings(listingsRes.data);
      if (savedRes.data) setSavedProperties(savedRes.data);

    } catch (error) {
      console.error("Dashboard Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEarningsDetails = async () => {
    setEarningsLoading(true);
    try {
      // Fetch commissions/earnings from Supabase
      const { data: commissions, error } = await supabase
        .from('commissions')
        .select('*')
        .eq('user_id', user.id)
        .eq('user_role', 'tenant')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching earnings:', error);
        // If commissions table doesn't exist, check transactions table
        const { data: transactions } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', 'commission')
          .order('created_at', { ascending: false });

        if (transactions) {
          processTransactions(transactions);
        }
      } else if (commissions) {
        processCommissions(commissions);
      }

    } catch (error) {
      console.error('Error in earnings fetch:', error);
    } finally {
      setEarningsLoading(false);
    }
  };

  const processCommissions = (commissions) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    let totalEarned = 0;
    let pending = 0;
    let thisMonth = 0;
    let lastMonthTotal = 0;
    const transactions = [];

    commissions.forEach(commission => {
      const amount = parseFloat(commission.amount) || 0;
      const commissionDate = new Date(commission.created_at);
      const commissionMonth = commissionDate.getMonth();
      const commissionYear = commissionDate.getFullYear();

      if (commission.status === 'completed') {
        totalEarned += amount;
        
        if (commissionMonth === currentMonth && commissionYear === currentYear) {
          thisMonth += amount;
        }
        
        if (commissionMonth === lastMonth && commissionYear === lastMonthYear) {
          lastMonthTotal += amount;
        }
      } else if (commission.status === 'pending') {
        pending += amount;
      }

      transactions.push({
        id: commission.id,
        type: 'Commission',
        amount,
        status: commission.status,
        date: commission.created_at,
        property: commission.property_title || 'Property Commission',
        description: commission.description || `1.5% commission from posting`
      });
    });

    setEarningsDetails({
      totalEarned,
      pending,
      thisMonth,
      lastMonth: lastMonthTotal,
      transactions
    });
  };

  const processTransactions = (transactions) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    let totalEarned = 0;
    let pending = 0;
    let thisMonth = 0;
    let lastMonthTotal = 0;
    const formattedTransactions = [];

    transactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount) || 0;
      const transactionDate = new Date(transaction.created_at);
      const transactionMonth = transactionDate.getMonth();
      const transactionYear = transactionDate.getFullYear();

      if (transaction.status === 'completed') {
        totalEarned += amount;
        
        if (transactionMonth === currentMonth && transactionYear === currentYear) {
          thisMonth += amount;
        }
        
        if (transactionMonth === lastMonth && transactionYear === lastMonthYear) {
          lastMonthTotal += amount;
        }
      } else if (transaction.status === 'pending') {
        pending += amount;
      }

      formattedTransactions.push({
        id: transaction.id,
        type: transaction.type || 'Commission',
        amount,
        status: transaction.status,
        date: transaction.created_at,
        property: transaction.reference || 'Property',
        description: transaction.description || '1.5% posting commission'
      });
    });

    setEarningsDetails({
      totalEarned,
      pending,
      thisMonth,
      lastMonth: lastMonthTotal,
      transactions: formattedTransactions
    });
  };

  const handleDetailsClick = () => {
    setShowEarningsModal(true);
    fetchEarningsDetails();
  };

  const formatCurrency = (amount) => {
    return `₦${parseFloat(amount || 0).toLocaleString('en-NG')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed': return <span className="status-badge completed">Completed</span>;
      case 'pending': return <span className="status-badge pending">Pending</span>;
      case 'failed': return <span className="status-badge failed">Failed</span>;
      default: return <span className="status-badge">Unknown</span>;
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Verifying Session...</p>
      </div>
    );
  }

  return (
    <div className="tenant-dashboard-content">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h1>Welcome back, {profile?.name || 'Tenant'}</h1>
        <p className="subtitle">Here's what's happening with your rentals</p>
      </div>

      {/* Wallet Card */}
      <div className="wallet-card">
        <div className="wallet-info">
          <span>Referral Earnings (1.5%)</span>
          <h1>{formatCurrency(wallet.balance)}</h1>
          <p className="commission-note">
            You earn 1.5% commission for every property you successfully post
          </p>
        </div>
        <button className="withdraw-btn" onClick={handleDetailsClick}>
          <Receipt size={16} /> Details
        </button>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="action-item" onClick={() => navigate('/post-property')}>
          <div className="icon-box blue">➕</div>
          <span>Post House</span>
        </div>
        <div className="action-item" onClick={() => navigate('/listings')}>
          <div className="icon-box green">🔍</div>
          <span>Browse</span>
        </div>
        <div className="action-item" onClick={handleDetailsClick}>
          <div className="icon-box gold">💰</div>
          <span>Earnings</span>
        </div>
        <div className="action-item" onClick={() => navigate('/verify')}>
          <div className="icon-box purple">🛡️</div>
          <span>Verify</span>
        </div>
      </div>

      {/* My Active Listings */}
      <section className="section-area">
        <div className="section-header">
          <h3>Your Listings</h3>
          <span className="see-all" onClick={() => navigate('/dashboard/tenant/properties')}>
            View All
          </span>
        </div>
        
        {myListings.length > 0 ? (
          myListings.map(item => (
            <div className="property-mini-card" key={item.id} onClick={() => navigate(`/listings/${item.id}`)}>
              <img src={item.images?.[0] || 'https://via.placeholder.com/100'} alt="property" />
              <div className="details">
                <h4>{item.title}</h4>
                <p>₦{item.price?.toLocaleString() || '0'}</p>
              </div>
              <div className="potential-earn">
                <small>Commission</small>
                <p>₦{((item.price || 0) * 0.015).toLocaleString()}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-card" onClick={() => navigate('/post-property')}>
            <p>Post your vacating house to earn 1.5% commission!</p>
          </div>
        )}
      </section>

      {/* Saved Properties */}
      {savedProperties.length > 0 && (
        <section className="section-area">
          <div className="section-header">
            <h3>Saved Properties</h3>
            <span className="see-all" onClick={() => navigate('/dashboard/tenant/saved')}>
              View All
            </span>
          </div>
          
          {savedProperties.slice(0, 3).map(item => (
            <div className="property-mini-card" key={item.id} onClick={() => navigate(`/listings/${item.listing_id}`)}>
              <img src={item.listings?.images?.[0] || 'https://via.placeholder.com/100'} alt="saved" />
              <div className="details">
                <h4>{item.listings?.title || 'Property'}</h4>
                <p>₦{item.listings?.price?.toLocaleString() || '0'}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Earnings Details Modal */}
      {showEarningsModal && (
        <div className="modal-overlay">
          <div className="earnings-modal">
            <div className="modal-header">
              <h2>Earnings Details</h2>
              <button className="close-modal" onClick={() => setShowEarningsModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-content">
              {earningsLoading ? (
                <div className="loading-section">
                  <div className="loading-spinner"></div>
                  <p>Loading earnings data...</p>
                </div>
              ) : (
                <>
                  {/* Commission Stats */}
                  <div className="commission-stats">
                    <div className="stat-card">
                      <div className="stat-icon">
                        <DollarSign size={20} />
                      </div>
                      <div className="stat-info">
                        <p className="stat-label">Total Earned</p>
                        <p className="stat-value">{formatCurrency(earningsDetails.totalEarned)}</p>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon pending">
                        <Clock size={20} />
                      </div>
                      <div className="stat-info">
                        <p className="stat-label">Pending</p>
                        <p className="stat-value">{formatCurrency(earningsDetails.pending)}</p>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon">
                        <Calendar size={20} />
                      </div>
                      <div className="stat-info">
                        <p className="stat-label">This Month</p>
                        <p className="stat-value">{formatCurrency(earningsDetails.thisMonth)}</p>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon">
                        <TrendingUp size={20} />
                      </div>
                      <div className="stat-info">
                        <p className="stat-label">Last Month</p>
                        <p className="stat-value">{formatCurrency(earningsDetails.lastMonth)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Commission Info */}
                  <div className="commission-info">
                    <div className="info-header">
                      <Info size={18} />
                      <h3>How You Earn 1.5%</h3>
                    </div>
                    <ul className="commission-list">
                      <li>✅ You post your vacating house on RentEasy</li>
                      <li>✅ When a tenant books through your listing</li>
                      <li>✅ You earn <strong>1.5% commission</strong> of the total rental amount</li>
                      <li>✅ Commission is paid after tenant moves in</li>
                      <li>✅ You can withdraw to your bank account</li>
                    </ul>
                  </div>

                  {/* Transactions List */}
                  <div className="transactions-section">
                    <div className="section-header">
                      <h3>Commission History</h3>
                      <span className="transactions-count">
                        {earningsDetails.transactions.length} transactions
                      </span>
                    </div>

                    {earningsDetails.transactions.length > 0 ? (
                      <div className="transactions-list">
                        {earningsDetails.transactions.map(transaction => (
                          <div key={transaction.id} className="transaction-item">
                            <div className="transaction-main">
                              <div className="transaction-type">
                                <div className="type-icon">
                                  <Receipt size={16} />
                                </div>
                                <div>
                                  <h4>{transaction.type}</h4>
                                  <p className="transaction-description">{transaction.description}</p>
                                </div>
                              </div>
                              <div className="transaction-amount">
                                <strong className="amount-positive">
                                  {formatCurrency(transaction.amount)}
                                </strong>
                                {getStatusBadge(transaction.status)}
                              </div>
                            </div>
                            <div className="transaction-footer">
                              <span className="transaction-date">
                                <Calendar size={14} /> {formatDate(transaction.date)}
                              </span>
                              <span className="transaction-reference">
                                {transaction.property}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-transactions">
                        <AlertCircle size={48} />
                        <h4>No Commission Payments Yet</h4>
                        <p>You haven't earned any commissions yet. Start posting properties to earn 1.5%!</p>
                        <button 
                          className="post-property-btn"
                          onClick={() => {
                            setShowEarningsModal(false);
                            navigate('/post-property');
                          }}
                        >
                          Post Your First Property
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="close-btn"
                onClick={() => setShowEarningsModal(false)}
              >
                Close
              </button>
              {earningsDetails.transactions.length > 0 && (
                <button className="export-btn">
                  <Download size={16} /> Export Statement
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantDashboard;