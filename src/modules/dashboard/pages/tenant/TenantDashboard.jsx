// src/modules/dashboard/pages/tenant/TenantDashboard.jsx - UPDATED with Payouts

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../shared/lib/supabaseClient';
import RentEasyLoader from '../../../../shared/components/RentEasyLoader';
import { useAuth } from '../../../../shared/context/AuthContext';
import {
  DollarSign, Calendar, CheckCircle, Clock,
  TrendingUp, Users, Receipt, X, Download,
  Filter, ChevronDown, ChevronUp, Copy, Share2,
  AlertCircle, Info, ExternalLink, Home, Wallet
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
    paid: 0,
    thisMonth: 0,
    lastMonth: 0,
    transactions: []
  });
  const [earningsLoading, setEarningsLoading] = useState(false);

  // New state for payout notifications
  const [recentPayouts, setRecentPayouts] = useState([]);
  const [showPayoutNotification, setShowPayoutNotification] = useState(false);
  const [lastPayout, setLastPayout] = useState(null);

  useEffect(() => {
    if (user) {
      fetchAllData();
      fetchRecentPayouts();
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      console.log('Fetching data for user:', user.id);
      
      // Fetch profile
      const { data: profData, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profError) console.error('Profile error:', profError);
      if (profData) {
        setProfile(profData);
        console.log('Profile loaded:', profData);
      }

      // Fetch wallet/commissions balance
      const { data: commissionsData, error: commissionsError } = await supabase
        .from('tenant_commissions')
        .select('commission_amount, status')
        .eq('tenant_id', user.id);
      
      if (!commissionsError && commissionsData) {
        const pendingTotal = commissionsData
          .filter(c => c.status === 'pending' || c.status === 'calculated')
          .reduce((sum, c) => sum + Number(c.commission_amount || 0), 0);
        setWallet({ balance: pendingTotal });
      }

      // Fetch listings - using user_id
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (listingsError) {
        console.error('Listings error:', listingsError);
      } else {
        setMyListings(listingsData || []);
        console.log('Listings loaded:', listingsData?.length);
      }

      // Fetch saved properties
      const { data: savedData, error: savedError } = await supabase
        .from('saved_properties')
        .select(`
          *,
          listings:listing_id (
            id,
            title,
            price,
            images,
            address,
            city,
            state
          )
        `)
        .eq('user_id', user.id)
        .limit(3);
      
      if (savedError) {
        console.error('Saved properties error:', savedError);
      } else {
        setSavedProperties(savedData || []);
        console.log('Saved properties loaded:', savedData?.length);
      }

    } catch (error) {
      console.error("Dashboard Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent payouts for the tenant
  const fetchRecentPayouts = async () => {
    try {
      // Fetch recently paid commissions
      const { data: paidCommissions, error } = await supabase
        .from('tenant_commissions')
        .select(`
          *,
          listing:listing_id (
            id,
            title,
            price,
            address
          )
        `)
        .eq('tenant_id', user.id)
        .eq('status', 'paid')
        .order('paid_at', { ascending: false })
        .limit(5);
      
      if (!error && paidCommissions) {
        setRecentPayouts(paidCommissions);
        
        // Check if there's a new payout (paid in last 24 hours)
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
        const newPayout = paidCommissions.find(p => 
          p.paid_at && new Date(p.paid_at) > oneDayAgo
        );
        
        if (newPayout && (!lastPayout || lastPayout.id !== newPayout.id)) {
          setLastPayout(newPayout);
          setShowPayoutNotification(true);
          
          // Auto-hide notification after 5 seconds
          setTimeout(() => {
            setShowPayoutNotification(false);
          }, 5000);
        }
      }
    } catch (error) {
      console.error('Error fetching payouts:', error);
    }
  };

  const fetchEarningsDetails = async () => {
    setEarningsLoading(true);
    try {
      // Fetch from tenant_commissions table
      const { data: commissions, error: commissionsError } = await supabase
        .from('tenant_commissions')
        .select(`
          *,
          listing:listing_id (
            id,
            title,
            price,
            address,
            city,
            state,
            rented_at
          )
        `)
        .eq('tenant_id', user.id)
        .order('created_at', { ascending: false });

      if (commissionsError && commissionsError.code !== 'PGRST116') {
        console.error('Error fetching commissions:', commissionsError);
      }

      if (commissions && commissions.length > 0) {
        processEarningsData(commissions);
      } else {
        // Try commissions table as fallback
        const { data: altCommissions, error: altError } = await supabase
          .from('commissions')
          .select('*')
          .eq('user_id', user.id)
          .eq('user_role', 'tenant')
          .order('created_at', { ascending: false });

        if (!altError && altCommissions) {
          processEarningsData(altCommissions);
        } else {
          setEarningsDetails({
            totalEarned: 0,
            pending: 0,
            paid: 0,
            thisMonth: 0,
            lastMonth: 0,
            transactions: []
          });
        }
      }

    } catch (error) {
      console.error('Error in earnings fetch:', error);
    } finally {
      setEarningsLoading(false);
    }
  };
  
  const processEarningsData = (commissionsData) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    let totalEarned = 0;
    let pending = 0;
    let paid = 0;
    let thisMonth = 0;
    let lastMonthTotal = 0;
    const transactions = [];

    commissionsData.forEach(commission => {
      const amount = parseFloat(commission.commission_amount) || 0;
      const commissionDate = new Date(commission.created_at);
      const commissionMonth = commissionDate.getMonth();
      const commissionYear = commissionDate.getFullYear();
      const paidDate = commission.paid_at ? new Date(commission.paid_at) : null;

      if (commission.status === 'paid' || commission.status === 'completed') {
        totalEarned += amount;
        paid += amount;
        
        // Check if paid this month
        if (paidDate) {
          if (paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear) {
            thisMonth += amount;
          }
          if (paidDate.getMonth() === lastMonth && paidDate.getFullYear() === lastMonthYear) {
            lastMonthTotal += amount;
          }
        }
      } else if (commission.status === 'pending' || commission.status === 'calculated') {
        pending += amount;
      }

      transactions.push({
        id: commission.id,
        type: 'Commission',
        amount,
        status: commission.status,
        date: commission.paid_at || commission.created_at,
        property: commission.listing?.title || commission.property_title || 'Property Commission',
        description: commission.status === 'paid' 
          ? `1.5% commission paid for property: ${commission.listing?.title || 'Property'}`
          : `1.5% commission pending for rented property: ${commission.listing?.title || 'Property'}`,
        listing: commission.listing
      });
    });

    setEarningsDetails({
      totalEarned,
      pending,
      paid,
      thisMonth,
      lastMonth: lastMonthTotal,
      transactions
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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'paid':
      case 'completed':
        return <span className="status-badge paid"><CheckCircle size={12} /> Paid</span>;
      case 'pending':
        return <span className="status-badge pending"><Clock size={12} /> Pending</span>;
      case 'calculated':
        return <span className="status-badge calculated"><Receipt size={12} /> Calculated</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  if (loading) {
    return <RentEasyLoader message="Loading your dashboard..." fullScreen />;
  }

  return (
    <div className="tenant-dashboard-content">
      {/* Payout Notification */}
      {showPayoutNotification && lastPayout && (
        <div className="payout-notification">
          <div className="notification-content">
            <CheckCircle size={24} className="notification-icon" />
            <div className="notification-text">
              <h4>New Payout Received! 🎉</h4>
              <p>You've received {formatCurrency(lastPayout.commission_amount)} for "{lastPayout.listing?.title || 'your property'}"</p>
              <small>Commission has been added to your available balance</small>
            </div>
            <button 
              className="notification-close"
              onClick={() => setShowPayoutNotification(false)}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h1>Welcome back, {profile?.full_name || profile?.name || 'Tenant'}</h1>
        <p className="subtitle">Here's what's happening with your rentals</p>
      </div>

      {/* Wallet Card - Updated with separate paid/pending display */}
      <div className="wallet-card">
        <div className="wallet-info">
          <div className="wallet-header">
            <Wallet size={20} />
            <span>Commission Earnings (1.5%)</span>
          </div>
          <div className="balance-breakdown">
            <div className="balance-item">
              <span className="balance-label">Available</span>
              <h2 className="balance-amount">{formatCurrency(wallet.balance)}</h2>
            </div>
            <div className="balance-divider"></div>
            <div className="balance-item">
              <span className="balance-label">Total Received</span>
              <h2 className="balance-amount total">{formatCurrency(earningsDetails.paid)}</h2>
            </div>
          </div>
          <p className="commission-note">
            You earn 1.5% commission for every property you successfully post that gets rented
          </p>
        </div>
        <button className="withdraw-btn" onClick={handleDetailsClick}>
          <Receipt size={16} /> View Earnings Details
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

      {/* Recent Payouts Section */}
      {recentPayouts.length > 0 && (
        <section className="section-area recent-payouts">
          <div className="section-header">
            <h3>Recent Payouts</h3>
            <span className="see-all" onClick={handleDetailsClick}>
              View All
            </span>
          </div>
          <div className="payouts-list">
            {recentPayouts.slice(0, 3).map(payout => (
              <div key={payout.id} className="payout-item">
                <div className="payout-icon">
                  <CheckCircle size={20} className="paid-icon" />
                </div>
                <div className="payout-details">
                  <div className="payout-title">
                    {payout.listing?.title || 'Commission Payout'}
                  </div>
                  <div className="payout-meta">
                    <span>Paid on {formatDate(payout.paid_at)}</span>
                  </div>
                </div>
                <div className="payout-amount">
                  <strong>{formatCurrency(payout.commission_amount)}</strong>
                  <small>1.5% commission</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
              <img 
                src={item.images?.[0] || 'https://via.placeholder.com/100x80?text=Property'} 
                alt="property" 
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/100x80?text=Property';
                }}
              />
              <div className="details">
                <h4>{item.title || 'Untitled'}</h4>
                <p>{formatCurrency(item.price)}</p>
                <small className="listing-status">
                  Status: {item.status === 'rented' ? '✅ Rented' : item.status === 'approved' ? 'Active' : item.status === 'pending' ? 'Pending' : item.status}
                </small>
              </div>
              <div className="potential-earn">
                <small>{item.status === 'rented' ? 'Commission Earned' : 'Potential Commission'}</small>
                <p>{formatCurrency((item.price || 0) * 0.015)}</p>
                {item.status === 'rented' && (
                  <span className="earned-badge">Awaiting Payment</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-card" onClick={() => navigate('/post-property')}>
            <Home size={32} />
            <p>Post your vacating house to earn 1.5% commission!</p>
            <button className="btn btn-primary btn-sm">Post Property</button>
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
              <img 
                src={item.listings?.images?.[0] || 'https://via.placeholder.com/100x80?text=Property'} 
                alt="saved"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/100x80?text=Property';
                }}
              />
              <div className="details">
                <h4>{item.listings?.title || 'Property'}</h4>
                <p>{formatCurrency(item.listings?.price)}</p>
                <small className="listing-location">
                  {item.listings?.city || ''} {item.listings?.state || ''}
                </small>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Earnings Details Modal - Updated with paid/pending breakdown */}
      {showEarningsModal && (
        <div className="modal-overlay" onClick={() => setShowEarningsModal(false)}>
          <div className="earnings-modal" onClick={(e) => e.stopPropagation()}>
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
                  {/* Commission Stats - Updated with paid/pending */}
                  <div className="commission-stats">
                    <div className="stat-card">
                      <div className="stat-icon total">
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
                      <div className="stat-icon paid">
                        <CheckCircle size={20} />
                      </div>
                      <div className="stat-info">
                        <p className="stat-label">Paid</p>
                        <p className="stat-value">{formatCurrency(earningsDetails.paid)}</p>
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
                  </div>

                  {/* Commission Info */}
                  <div className="commission-info">
                    <div className="info-header">
                      <Info size={18} />
                      <h3>How You Earn 1.5%</h3>
                    </div>
                    <ul className="commission-list">
                      <li>✅ You post your vacating house on RentEasy</li>
                      <li>✅ When a tenant rents through your listing</li>
                      <li>✅ You earn <strong>1.5% commission</strong> of the total rental amount</li>
                      <li>✅ Commission is paid after admin confirms the rental</li>
                      <li>✅ Pending commissions become paid after admin verification</li>
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
                                  {transaction.status === 'paid' ? <CheckCircle size={16} /> : <Clock size={16} />}
                                </div>
                                <div>
                                  <h4>{transaction.type}</h4>
                                  <p className="transaction-description">{transaction.description}</p>
                                  {transaction.listing && (
                                    <p className="transaction-property">
                                      <Home size={12} /> {transaction.listing.title}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="transaction-amount">
                                <strong className={`amount-${transaction.status === 'paid' ? 'positive' : 'pending'}`}>
                                  {formatCurrency(transaction.amount)}
                                </strong>
                                {getStatusBadge(transaction.status)}
                              </div>
                            </div>
                            <div className="transaction-footer">
                              <span className="transaction-date">
                                <Calendar size={14} /> {formatDate(transaction.date)}
                              </span>
                              {transaction.status === 'paid' && (
                                <span className="paid-badge">
                                  <CheckCircle size={12} /> Commission Paid
                                </span>
                              )}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantDashboard;