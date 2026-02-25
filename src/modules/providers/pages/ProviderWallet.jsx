// src/modules/providers/pages/ProviderWallet.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import {
  FaWallet,
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
  FaHistory,
  FaCreditCard,
  FaShieldAlt,
  FaChartLine,
  FaSync,
  FaPrint,
  FaDownload,
  FaFilter,
  FaSearch,
  FaArrowLeft,
  FaPlus,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaUniversity
} from 'react-icons/fa';
import './ProviderWallet.css';

const ProviderWallet = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  // Wallet stats
  const [walletStats, setWalletStats] = useState({
    totalEarnings: 0,
    pendingPayouts: 0,
    totalWithdrawn: 0,
    nextPayoutDate: null
  });

  useEffect(() => {
    if (user?.id) {
      fetchWalletData();
    }
  }, [user]);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      // Fetch wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('balance, pending_balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (walletError) throw walletError;

      const balance = wallet?.balance || 0;
      const pending = wallet?.pending_balance || 0;
      setWalletBalance(balance);

      // Fetch transactions
      const { data: txs, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (txError) throw txError;

      setTransactions(txs || []);

      // Compute stats
      const totalEarnings = txs
        ?.filter(t => t.type === 'credit' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0) || 0;

      const totalWithdrawn = txs
        ?.filter(t => t.type === 'debit' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0) || 0;

      // Fetch pending payouts
      const { data: payouts, error: payoutError } = await supabase
        .from('payouts')
        .select('amount')
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (payoutError) throw payoutError;

      const pendingPayouts = payouts?.reduce((sum, p) => sum + p.amount, 0) || 0;

      setWalletStats({
        totalEarnings,
        pendingPayouts,
        totalWithdrawn,
        nextPayoutDate: null // Can be computed from next scheduled payout
      });
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'failed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle style={{ color: '#10B981' }} />;
      case 'pending':
        return <FaClock style={{ color: '#F59E0B' }} />;
      case 'failed':
        return <FaTimesCircle style={{ color: '#EF4444' }} />;
      default:
        return null;
    }
  };

  const filteredTransactions = transactions.filter(txn => {
    if (filter === 'all') return true;
    if (filter === 'credits') return txn.type === 'credit';
    if (filter === 'debits') return txn.type === 'debit';
    return true;
  });

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount > walletBalance) {
      alert('Insufficient balance');
      return;
    }

    setWithdrawLoading(true);
    try {
      // Start a transaction: insert payout and update wallet pending balance
      const { error: payoutError } = await supabase
        .from('payouts')
        .insert([{
          user_id: user.id,
          amount: amount,
          method: withdrawMethod,
          status: 'pending'
        }]);

      if (payoutError) throw payoutError;

      // Update wallet pending_balance (optional)
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ pending_balance: (walletStats.pendingPayouts + amount) })
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      // Add a debit transaction (optional, but good for history)
      await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          type: 'debit',
          amount: amount,
          description: 'Withdrawal request',
          status: 'pending',
          reference: `WDL-${Date.now()}`
        }]);

      // Refresh data
      await fetchWalletData();
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      alert('Withdrawal request submitted successfully!');
    } catch (error) {
      console.error('Withdrawal error:', error);
      alert('Failed to submit withdrawal. Please try again.');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleExportTransactions = () => {
    // Simulate export
    alert('Transaction history exported successfully!');
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="wallet-loading">
        <div className="loading-spinner"></div>
        <p>Loading wallet data...</p>
      </div>
    );
  }

  return (
    <div className="wallet-page">
      {/* Header */}
      <header className="wallet-header">
        <div className="header-container">
          <div className="header-left">
            <Link to="/dashboard/provider" className="back-link">
              <FaArrowLeft />
              Back to Dashboard
            </Link>
          </div>
          <div className="header-right">
            <button
              className="btn-withdraw"
              onClick={() => setShowWithdrawModal(true)}
            >
              <FaArrowUp />
              Withdraw Funds
            </button>
          </div>
        </div>
      </header>

      <main className="wallet-main">
        {/* Wallet Overview */}
        <div className="wallet-overview">
          <div className="overlay"></div>
          <div className="overview-content">
            <div className="overview-header">
              <div>
                <h1 className="wallet-title">
                  <FaWallet className="wallet-icon" />
                  My Wallet
                </h1>
                <p className="wallet-subtitle">
                  Manage your earnings, withdrawals, and transactions
                </p>
              </div>
              <div className="balance-card">
                <div className="balance-label">Available Balance</div>
                <div className="balance-amount">{formatCurrency(walletBalance)}</div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-header">
                  <FaChartLine className="stat-icon" />
                  <span className="stat-title">Total Earnings</span>
                </div>
                <div className="stat-value">{formatCurrency(walletStats.totalEarnings)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-header">
                  <FaClock className="stat-icon" />
                  <span className="stat-title">Pending Payouts</span>
                </div>
                <div className="stat-value">{formatCurrency(walletStats.pendingPayouts)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-header">
                  <FaMoneyBillWave className="stat-icon" />
                  <span className="stat-title">Total Withdrawn</span>
                </div>
                <div className="stat-value">{formatCurrency(walletStats.totalWithdrawn)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-header">
                  <FaCalendarAlt className="stat-icon" />
                  <span className="stat-title">Next Payout</span>
                </div>
                <div className="stat-value">{walletStats.nextPayoutDate ? formatDate(walletStats.nextPayoutDate).split(',')[0] : 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="wallet-layout">
          {/* Transactions */}
          <div className="transactions-section">
            <div className="transactions-card">
              <div className="transactions-header">
                <h2 className="section-title">
                  <FaHistory />
                  Transaction History
                </h2>
                <div className="transaction-controls">
                  <div className="filter-buttons">
                    <button
                      className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                      onClick={() => setFilter('all')}
                    >
                      All
                    </button>
                    <button
                      className={`filter-btn credit ${filter === 'credits' ? 'active' : ''}`}
                      onClick={() => setFilter('credits')}
                    >
                      Credits
                    </button>
                    <button
                      className={`filter-btn debit ${filter === 'debits' ? 'active' : ''}`}
                      onClick={() => setFilter('debits')}
                    >
                      Debits
                    </button>
                  </div>
                  <button className="export-btn" onClick={handleExportTransactions}>
                    <FaDownload />
                    Export
                  </button>
                </div>
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="empty-state">
                  <FaHistory className="empty-icon" />
                  <p>No transactions found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="transactions-table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((txn) => (
                        <tr key={txn.id} className="transaction-row">
                          <td>
                            <div className="transaction-info">
                              <div className={`transaction-icon ${txn.type}`}>
                                {txn.type === 'credit' ? <FaArrowDown /> : <FaArrowUp />}
                              </div>
                              <div>
                                <div className="transaction-desc">{txn.description}</div>
                                <div className="transaction-ref">Ref: {txn.reference}</div>
                              </div>
                            </div>
                          </td>
                          <td className="transaction-date">{formatDate(txn.created_at)}</td>
                          <td className={`transaction-amount ${txn.type}`}>
                            {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                          </td>
                          <td>
                            <div className="status-indicator">
                              {getStatusIcon(txn.status)}
                              <span style={{ color: getStatusColor(txn.status) }}>
                                {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="transactions-footer">
                <div className="showing-info">
                  Showing {filteredTransactions.length} of {transactions.length} transactions
                </div>
                <Link to="/dashboard/provider/transactions" className="view-all-link">
                  View Full Transaction History →
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="wallet-sidebar">
            {/* Quick Actions */}
            <div className="sidebar-card">
              <h3 className="sidebar-title">
                <FaSync />
                Quick Actions
              </h3>
              <div className="action-buttons">
                <button className="action-btn withdraw" onClick={() => setShowWithdrawModal(true)}>
                  <span>Withdraw Funds</span>
                  <FaArrowUp />
                </button>
                <button className="action-btn earnings" onClick={() => navigate('/dashboard/provider/earnings')}>
                  <span>View Earnings</span>
                  <FaChartLine />
                </button>
                <button className="action-btn payout" onClick={() => navigate('/dashboard/provider/payouts')}>
                  <span>Payout History</span>
                  <FaMoneyBillWave />
                </button>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="sidebar-card">
              <div className="card-header">
                <h3 className="sidebar-title">
                  <FaCreditCard />
                  Payment Methods
                </h3>
                <button className="manage-link" onClick={() => navigate('/dashboard/provider/payment-methods')}>
                  Manage
                </button>
              </div>
              <div className="payment-method-item">
                <FaUniversity className="method-icon" />
                <div className="method-details">
                  <div className="method-name">Guaranty Trust Bank</div>
                  <div className="method-number">**** **** 4532</div>
                </div>
                <div className="method-badge">Primary</div>
              </div>
              <div className="payment-method-item">
                <FaShieldAlt className="method-icon" style={{ color: '#10B981' }} />
                <div className="method-details">
                  <div className="method-name">RentEasy Wallet</div>
                  <div className="method-number">Balance: {formatCurrency(walletBalance)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="modal-overlay" onClick={() => setShowWithdrawModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              <FaArrowUp />
              Withdraw Funds
            </h3>

            <div className="balance-info">
              <div className="balance-label">Available Balance</div>
              <div className="balance-amount-large">{formatCurrency(walletBalance)}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Amount to Withdraw (₦)</label>
              <input
                type="number"
                className="form-input"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                min="1000"
                max={walletBalance}
              />
              <div className="input-hint">Minimum withdrawal: ₦1,000</div>
            </div>

            <div className="form-group">
              <label className="form-label">Withdrawal Method</label>
              <div className="method-options">
                <button
                  className={`method-option ${withdrawMethod === 'bank' ? 'selected' : ''}`}
                  onClick={() => setWithdrawMethod('bank')}
                >
                  <FaUniversity />
                  <div>
                    <div className="method-title">Bank Transfer</div>
                    <div className="method-desc">1-2 business days</div>
                  </div>
                </button>
                <button
                  className={`method-option ${withdrawMethod === 'wallet' ? 'selected' : ''}`}
                  onClick={() => setWithdrawMethod('wallet')}
                >
                  <FaWallet />
                  <div>
                    <div className="method-title">RentEasy Wallet</div>
                    <div className="method-desc">Instant</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="note">
              <strong>Note:</strong> Withdrawals may take 1-2 business days to process. A 1% transaction fee applies.
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowWithdrawModal(false)}>
                Cancel
              </button>
              <button
                className="btn-withdraw-confirm"
                onClick={handleWithdraw}
                disabled={withdrawLoading || !withdrawAmount}
              >
                {withdrawLoading ? (
                  <>
                    <div className="small-spinner"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaArrowUp />
                    Withdraw Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderWallet;