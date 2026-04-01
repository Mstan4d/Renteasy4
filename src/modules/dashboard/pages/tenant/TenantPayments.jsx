// src/modules/dashboard/pages/tenant/TenantPayments.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import RentEasyLoader from '../../../../shared/components/RentEasyLoader';
import { DollarSign, Calendar, CheckCircle, Clock, XCircle, Receipt, TrendingUp, AlertCircle, Home } from 'lucide-react';
import './TenantPayments.css';

const TenantPayments = () => {
  const { user } = useAuth();
  const [commissions, setCommissions] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalEarned: 0,
    pending: 0,
    paid: 0,
    listingsCount: 0
  });

  useEffect(() => {
    if (user) {
      fetchCommissionData();
      subscribeToUpdates();
    }

    return () => {
      if (window.commissionSubscription) {
        supabase.removeChannel(window.commissionSubscription);
      }
    };
  }, [user]);

  const subscribeToUpdates = () => {
    if (window.commissionSubscription) {
      supabase.removeChannel(window.commissionSubscription);
    }

    const channel = supabase
      .channel('tenant-commissions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'commissions',
          filter: `referrer_id=eq.${user.id}`
        },
        () => fetchCommissionData()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenant_commissions',
          filter: `tenant_id=eq.${user.id}`
        },
        () => fetchCommissionData()
      )
      .subscribe();

    window.commissionSubscription = channel;
  };

  const fetchCommissionData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 1. Fetch from tenant_commissions table
      const { data: tenantCommissions, error: tcError } = await supabase
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
            rented_at,
            rented_by,
            status
          )
        `)
        .eq('tenant_id', user.id)
        .order('created_at', { ascending: false });

      // 2. Fetch from commissions table (referrer_id = user.id)
      const { data: commissionsData, error: cError } = await supabase
        .from('commissions')
        .select(`
          *,
          listing:listing_id (
            id,
            title,
            price,
            address,
            city,
            state
          )
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      // Combine both sources, avoid duplicates (listing_id as key)
      const combined = [];
      const listingIds = new Set();

      // Add tenant_commissions first (they may contain `paid` status)
      (tenantCommissions || []).forEach(comm => {
        if (comm.listing_id && !listingIds.has(comm.listing_id)) {
          combined.push({
            ...comm,
            source: 'tenant_commissions',
            commission_amount: comm.commission_amount || (comm.listing?.price * 0.015),
            // For tenant_commissions, paid status is likely stored in `status`
            is_paid: comm.status === 'paid' || comm.status === 'completed',
            is_pending: comm.status === 'pending'
          });
          listingIds.add(comm.listing_id);
        }
      });

      // Add from commissions (referrer)
      (commissionsData || []).forEach(comm => {
        if (comm.listing_id && !listingIds.has(comm.listing_id)) {
          // Determine paid status: either via status='paid' or via paid_to_referrer flag
          const isPaid = comm.status === 'paid' || comm.paid_to_referrer === true;
          combined.push({
            ...comm,
            source: 'commissions',
            commission_amount: comm.referrer_share || (comm.listing?.price * 0.015),
            is_paid: isPaid,
            is_pending: !isPaid && (comm.status === 'pending' || comm.status === 'verified'),
            paid_at: comm.referrer_paid_at || comm.paid_at
          });
          listingIds.add(comm.listing_id);
        }
      });

      // Also fetch listings posted by this tenant to show potential earnings
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .eq('poster_role', 'tenant')
        .order('created_at', { ascending: false });

      if (!listingsError && listingsData) {
        // Add potential commissions for rented listings not yet recorded
        const rentedListings = listingsData.filter(l => l.status === 'rented');
        const existingListingIds = new Set(combined.map(c => c.listing_id));

        rentedListings.forEach(listing => {
          if (!existingListingIds.has(listing.id)) {
            combined.push({
              id: `temp_${listing.id}`,
              listing_id: listing.id,
              commission_amount: (listing.price || 0) * 0.015,
              status: 'pending',
              created_at: listing.rented_at || listing.created_at,
              listing: listing,
              is_potential: true,
              is_paid: false,
              is_pending: true
            });
            existingListingIds.add(listing.id);
          }
        });
      }

      // Sort by date (newest first)
      combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setCommissions(combined);

      // Calculate stats
      let totalEarned = 0;
      let paid = 0;
      let pending = 0;

      combined.forEach(c => {
        const amount = c.commission_amount || 0;
        if (c.is_paid) {
          totalEarned += amount;
          paid += amount;
        } else if (c.is_pending || c.is_potential) {
          pending += amount;
        }
      });

      setStats({
        totalEarned,
        pending,
        paid,
        listingsCount: listingsData?.length || 0
      });
      setWalletBalance(pending); // Pending amounts are "available" in a sense (not yet paid)
    } catch (err) {
      console.error('Error fetching commission data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => `₦${(amount || 0).toLocaleString('en-NG')}`;
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : 'N/A';

  const getStatusBadge = (comm) => {
    if (comm.is_paid) {
      return <span className="status-badge paid"><CheckCircle size={12} /> Paid</span>;
    }
    if (comm.is_potential) {
      return <span className="status-badge potential"><Clock size={12} /> Awaiting Admin</span>;
    }
    return <span className="status-badge pending"><Clock size={12} /> Pending</span>;
  };

  if (loading) {
    return <RentEasyLoader message="Loading your earnings..." fullScreen />;
  }

  return (
    <div className="tenant-payments">
      {/* Header */}
      <div className="payments-header">
        <div>
          <h1>Payments & Earnings</h1>
          <p className="subtitle">Track your 1.5% commission earnings from posted properties</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{formatCurrency(stats.totalEarned)}</span>
            <span className="stat-label">Total Earned</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{formatCurrency(stats.pending)}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon paid">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{formatCurrency(stats.paid)}</span>
            <span className="stat-label">Paid</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon listings">
            <Home size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.listingsCount}</span>
            <span className="stat-label">Properties Posted</span>
          </div>
        </div>
      </div>

      {/* Earnings Summary Card */}
      <div className="earnings-summary-card">
        <div className="balance-info">
          <div className="balance-icon">
            <DollarSign size={32} />
          </div>
          <div>
            <span className="label">Available Commission (1.5%)</span>
            <h2 className="balance-amount">{formatCurrency(walletBalance)}</h2>
            <p className="balance-note">Commissions are paid after tenant moves in and admin confirms payment</p>
          </div>
        </div>
      </div>

      {/* Commission Info Section */}
      <div className="commission-info-card">
        <div className="info-header">
          <AlertCircle size={20} />
          <h3>How You Earn 1.5% Commission</h3>
        </div>
        <div className="info-steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-text">Post your vacating property on RentEasy</div>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-text">Tenant rents through your listing</div>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-text">Admin verifies and marks as rented</div>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-text">You receive 1.5% commission</div>
          </div>
        </div>
      </div>

      {/* Commission History */}
      <section className="payment-section">
        <div className="section-header">
          <h3>Commission History</h3>
          <span className="section-count">{commissions.length} transactions</span>
        </div>
        
        {commissions.length > 0 ? (
          <div className="commissions-list">
            {commissions.map(commission => {
              const listing = commission.listing;
              const isPotential = commission.is_potential;
              
              return (
                <div key={commission.id} className={`commission-card ${isPotential ? 'potential' : ''}`}>
                  <div className="commission-main">
                    <div className="commission-icon">
                      {commission.is_paid ? 
                        <CheckCircle size={24} /> : 
                        isPotential ? <Home size={24} /> : <Clock size={24} />
                      }
                    </div>
                    <div className="commission-details">
                      <div className="commission-header">
                        <h4>{listing?.title || 'Property Commission'}</h4>
                        {getStatusBadge(commission)}
                      </div>
                      <div className="commission-meta">
                        <span className="meta-item">
                          <Calendar size={12} />
                          {formatDate(commission.created_at)}
                        </span>
                        {listing?.rented_at && (
                          <span className="meta-item">
                            <CheckCircle size={12} />
                            Rented: {formatDate(listing.rented_at)}
                          </span>
                        )}
                        {listing?.address && (
                          <span className="meta-item">
                            📍 {listing.city || ''} {listing.state || ''}
                          </span>
                        )}
                      </div>
                      <div className="commission-description">
                        {isPotential ? (
                          `This property has been rented! Your 1.5% commission (${formatCurrency(commission.commission_amount)}) will be processed shortly.`
                        ) : commission.is_paid ? (
                          `1.5% commission of ${formatCurrency(listing?.price)} has been paid to your account`
                        ) : (
                          `1.5% commission (${formatCurrency(commission.commission_amount)}) will be paid when the tenant moves in`
                        )}
                      </div>
                    </div>
                    <div className="commission-amount">
                      <span className="amount-label">Commission (1.5%)</span>
                      <span className="amount-value">{formatCurrency(commission.commission_amount)}</span>
                      {listing?.price && (
                        <span className="amount-sub">of {formatCurrency(listing.price)}</span>
                      )}
                    </div>
                  </div>
                  
                  {commission.is_paid && commission.paid_at && (
                    <div className="commission-footer">
                      <span className="paid-info">
                        <CheckCircle size={12} />
                        Paid on {formatDate(commission.paid_at)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <Receipt size={48} />
            <h3>No commission history yet</h3>
            <p>Post your first property to start earning 1.5% commission when it gets rented</p>
            <button 
              className="btn-post-property"
              onClick={() => window.location.href = '/post-property'}
            >
              Post Your First Property
            </button>
          </div>
        )}
      </section>

      {/* How Commission is Calculated */}
      <div className="calculation-info">
        <h4>Commission Calculation Example</h4>
        <div className="example">
          <div className="example-item">
            <span>Property Rent Price:</span>
            <strong>₦1,000,000</strong>
          </div>
          <div className="example-arrow">×</div>
          <div className="example-item highlight">
            <span>Your Commission (1.5%):</span>
            <strong>₦15,000</strong>
          </div>
        </div>
        <p className="example-note">* Commission is calculated as 1.5% of the total annual rent amount</p>
      </div>
    </div>
  );
};

export default TenantPayments;