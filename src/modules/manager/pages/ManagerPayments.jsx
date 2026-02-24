// src/modules/manager/pages/ManagerPayments.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './ManagerPayments.css';

const ManagerPayments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [commissions, setCommissions] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, withdrawn
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarned: 0,
    available: 0,
    withdrawn: 0,
    pending: 0
  });
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);

  // Bank details for user (for withdrawal)
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadCommissions();
      loadBankDetails();
    }
  }, [user]);

  const loadCommissions = async () => {
    try {
      setLoading(true);
      // Fetch commissions where this user is the manager
      const { data, error } = await supabase
        .from('commissions')
        .select(`
          *,
          listing:listings(id, title, address, price),
          referrer:referrer_id(id, full_name)
        `)
        .eq('manager_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCommissions(data || []);

      // Calculate stats
      const totalEarned = data.reduce((sum, c) => sum + (c.manager_share || 0), 0);
      const paid = data.filter(c => c.paid_to_manager).reduce((sum, c) => sum + c.manager_share, 0);
      const available = totalEarned - paid;
      const pending = data.filter(c => !c.paid_to_manager).reduce((sum, c) => sum + c.manager_share, 0);

      setStats({ totalEarned, available, withdrawn: paid, pending });
    } catch (error) {
      console.error('Error loading commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBankDetails = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('bank_name, account_number, account_name')
      .eq('id', user.id)
      .single();
    if (!error && data) {
      setBankName(data.bank_name || '');
      setAccountNumber(data.account_number || '');
      setAccountName(data.account_name || '');
    }
  };

  const getFilteredCommissions = () => {
    switch (filter) {
      case 'pending':
        return commissions.filter(c => !c.paid_to_manager);
      case 'confirmed':
        return commissions.filter(c => c.paid_to_manager);
      default:
        return commissions;
    }
  };

  // Notify admin that manager has transferred the full 7.5%
  const handleNotifySent = async (commissionId) => {
    // Prompt for file upload (receipt)
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setLoading(true);
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `receipts/${commissionId}_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('verification-docs')
          .upload(fileName, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('verification-docs')
          .getPublicUrl(fileName);
        const receiptUrl = urlData.publicUrl;

        // Update commission record
        const { error: updateError } = await supabase
          .from('commissions')
          .update({
            admin_confirmed_payment: false, // pending admin verification
            payment_receipt_url: receiptUrl,
            manager_notified_transfer_at: new Date().toISOString()
          })
          .eq('id', commissionId);
        if (updateError) throw updateError;

        alert('Receipt uploaded. Admin will verify and mark as paid.');
        loadCommissions();
      } catch (error) {
        console.error('Error notifying admin:', error);
        alert('Failed to upload receipt. Try again.');
      } finally {
        setLoading(false);
      }
    };
    fileInput.click();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getPaymentStatus = (commission) => {
    if (commission.paid_to_manager) {
      return { label: 'Paid to Bank', color: '#155724', bgColor: '#d4edda', icon: '✅' };
    }
    if (commission.admin_confirmed_payment === true) {
      return { label: 'Admin Confirmed', color: '#004085', bgColor: '#cce5ff', icon: '🔵' };
    }
    if (commission.admin_confirmed_payment === false && commission.payment_receipt_url) {
      return { label: 'Awaiting Admin', color: '#856404', bgColor: '#fff3cd', icon: '⏳' };
    }
    return { label: 'Pending', color: '#856404', bgColor: '#fff3cd', icon: '⏳' };
  };

  if (loading) {
    return <div className="loading">Loading payments...</div>;
  }

  return (
    <div className="manager-payments">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>💰 Payments & Commission</h1>
          <p>Track your earnings and request withdrawals</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard/manager')}>
          Back to Dashboard
        </button>
      </div>

      {/* EARNINGS SUMMARY */}
      <div className="earnings-summary">
        <div className="summary-card total">
          <div className="summary-icon">💰</div>
          <div className="summary-content">
            <div className="summary-label">Total Earned</div>
            <div className="summary-amount">{formatCurrency(stats.totalEarned)}</div>
            <div className="summary-sub">Lifetime earnings</div>
          </div>
        </div>

        <div className="summary-card available">
          <div className="summary-icon">💳</div>
          <div className="summary-content">
            <div className="summary-label">Available</div>
            <div className="summary-amount">{formatCurrency(stats.available)}</div>
            <div className="summary-sub">Ready for withdrawal</div>
          </div>
          <button
            className="btn-withdraw"
            onClick={() => navigate('/dashboard/manager/withdraw')}
            disabled={stats.available < 5000}
          >
            Withdraw
          </button>
        </div>

        <div className="summary-card withdrawn">
          <div className="summary-icon">✅</div>
          <div className="summary-content">
            <div className="summary-label">Withdrawn</div>
            <div className="summary-amount">{formatCurrency(stats.withdrawn)}</div>
            <div className="summary-sub">Already paid out</div>
          </div>
        </div>

        <div className="summary-card pending">
          <div className="summary-icon">⏳</div>
          <div className="summary-content">
            <div className="summary-label">Pending</div>
            <div className="summary-amount">{formatCurrency(stats.pending)}</div>
            <div className="summary-sub">Awaiting confirmation</div>
          </div>
        </div>
      </div>

      {/* RENTEASY BANK DETAILS (PLACEHOLDER) */}
      <div className="renteasy-bank-notice">
        <div className="notice-icon">🏦</div>
        <div className="notice-text">
          <h4>How to complete your commission:</h4>
          <p>
            After closing a deal, send the total 7.5% commission to the account below.
            Once confirmed, your 2.5% share will be sent to your registered bank account.
          </p>
          <div className="bank-details-box">
            <p><strong>Bank:</strong> Zenith Bank</p>
            <p><strong>Account Name:</strong> RentEasy Real Estate Ltd</p>
            <p><strong>Account Number:</strong> 1234567890</p>
          </div>
          <small>*Use the Property Title as your transfer narration.</small>
        </div>
      </div>

      {/* WITHDRAWAL CTA */}
      {stats.available >= 5000 && (
        <div className="withdrawal-cta">
          <div className="cta-content">
            <div className="cta-icon">💸</div>
            <div className="cta-text">
              <h4>Withdraw Your Earnings</h4>
              <p>You have ₦{stats.available.toLocaleString()} available for withdrawal</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard/manager/withdraw')}>
            Request Withdrawal
          </button>
        </div>
      )}

      {/* FILTERS */}
      <div className="payments-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Payments
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({commissions.filter(c => !c.paid_to_manager).length})
        </button>
        <button
          className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
          onClick={() => setFilter('confirmed')}
        >
          Confirmed ({commissions.filter(c => c.paid_to_manager).length})
        </button>
      </div>

      {/* PAYMENTS TABLE */}
      <div className="payments-table-container">
        {getFilteredCommissions().length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💰</div>
            <h3>No {filter} payments found</h3>
            <p>
              {filter === 'all'
                ? 'No commission payments yet. Manage properties to earn commissions.'
                : filter === 'pending'
                ? 'All payments have been confirmed'
                : 'No confirmed payments yet'}
            </p>
            {filter !== 'all' && (
              <button className="btn btn-outline" onClick={() => setFilter('all')}>
                View All Payments
              </button>
            )}
          </div>
        ) : (
          <table className="payments-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Date</th>
                <th>Rental Amount</th>
                <th>Your Share (2.5%)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredCommissions().map((commission) => {
                const status = getPaymentStatus(commission);
                const listing = commission.listing || {};

                return (
                  <tr key={commission.id}>
                    <td>
                      <div className="property-info">
                        <strong>{listing.title || 'Unknown'}</strong>
                        <small>{listing.address || ''}</small>
                      </div>
                    </td>
                    <td>{new Date(commission.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="amount-cell">
                        <strong>{formatCurrency(commission.rental_amount)}</strong>
                        <small>Rental</small>
                      </div>
                    </td>
                    <td>
                      <div className="commission-cell">
                        <strong className="highlight">
                          {formatCurrency(commission.manager_share)}
                        </strong>
                      </div>
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: status.bgColor, color: status.color }}
                      >
                        {status.icon} {status.label}
                      </span>
                    </td>
                    <td>
                      <div className="payment-actions">
                        {!commission.admin_confirmed_payment && !commission.paid_to_manager && (
                          <button
                            className="btn-notify-sent"
                            onClick={() => handleNotifySent(commission.id)}
                          >
                            Confirm 7.5% Sent
                          </button>
                        )}
                        {commission.admin_confirmed_payment === false &&
                          commission.payment_receipt_url && (
                            <span className="status-waiting">Verification Pending...</span>
                          )}
                        {commission.paid_to_manager && (
                          <span className="status-paid">Paid</span>
                        )}
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => {
                            // Show commission breakdown
                            alert(
                              `Commission Breakdown for ₦${commission.rental_amount?.toLocaleString()}:\n\n` +
                              `Total Commission (7.5%): ₦${(commission.manager_share + commission.referrer_share + commission.platform_share).toLocaleString()}\n` +
                              `• Manager (You): ₦${commission.manager_share?.toLocaleString()} (2.5%)\n` +
                              `• Referrer: ₦${commission.referrer_share?.toLocaleString()} (1.5%)\n` +
                              `• RentEasy: ₦${commission.platform_share?.toLocaleString()} (3.5%)`
                            );
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* COMMISSION BREAKDOWN SECTION */}
      <div className="commission-breakdown-section">
        <h3>📊 Commission Structure</h3>
        <div className="breakdown-cards">
          <div className="breakdown-card manager">
            <div className="breakdown-header">
              <span className="breakdown-icon">👨‍💼</span>
              <span className="breakdown-title">Manager (You)</span>
            </div>
            <div className="breakdown-percentage">2.5%</div>
            <div className="breakdown-amount">{formatCurrency(stats.totalEarned)}</div>
            <div className="breakdown-label">Total Earnings</div>
          </div>

          <div className="breakdown-card referrer">
            <div className="breakdown-header">
              <span className="breakdown-icon">👥</span>
              <span className="breakdown-title">Referrer</span>
            </div>
            <div className="breakdown-percentage">1.5%</div>
            <div className="breakdown-amount">
              {formatCurrency(stats.totalEarned * 0.6)} {/* because 2.5% * 0.6 = 1.5% */}
            </div>
            <div className="breakdown-label">Total Referral</div>
          </div>

          <div className="breakdown-card platform">
            <div className="breakdown-header">
              <span className="breakdown-icon">🏢</span>
              <span className="breakdown-title">RentEasy</span>
            </div>
            <div className="breakdown-percentage">3.5%</div>
            <div className="breakdown-amount">
              {formatCurrency(stats.totalEarned * 1.4)} {/* 2.5% * 1.4 = 3.5% */}
            </div>
            <div className="breakdown-label">Platform Fee</div>
          </div>

          <div className="breakdown-card total">
            <div className="breakdown-header">
              <span className="breakdown-icon">💰</span>
              <span className="breakdown-title">Total Commission</span>
            </div>
            <div className="breakdown-percentage">7.5%</div>
            <div className="breakdown-amount">
              {formatCurrency(stats.totalEarned * 3)} {/* 2.5% * 3 = 7.5% */}
            </div>
            <div className="breakdown-label">Per Rental</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerPayments;