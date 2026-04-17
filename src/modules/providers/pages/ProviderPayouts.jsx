// src/modules/providers/pages/ProviderPayouts.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import {
  CreditCard,
  Wallet,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Calendar,
  Smartphone,
  ChevronRight,
  Plus,
  Download,
  Filter,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ProviderPayouts.css';

const ProviderPayouts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [activeTab, setActiveTab] = useState('withdraw');
  const [searchQuery, setSearchQuery] = useState('');

  const [walletBalance, setWalletBalance] = useState({
    available: 0,
    pending: 0,
    minWithdrawal: 5000,
    processingFee: 100
  });

  const [payoutMethods, setPayoutMethods] = useState([]);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('balance, pending_balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (walletError) throw walletError;

      setWalletBalance(prev => ({
        ...prev,
        available: wallet?.balance || 0,
        pending: wallet?.pending_balance || 0
      }));

      // Fetch payment methods
      const { data: methods, error: methodsError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (methodsError) throw methodsError;
      setPayoutMethods(methods || []);

      // Fetch payout history
      const { data: payouts, error: payoutsError } = await supabase
        .from('payouts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (payoutsError) throw payoutsError;
      setPayoutHistory(payouts || []);
    } catch (error) {
      console.error('Error loading payout data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!selectedMethod) {
      alert('Please select a payout method');
      return;
    }
    if (amount < walletBalance.minWithdrawal) {
      alert(`Minimum withdrawal amount is ₦${walletBalance.minWithdrawal.toLocaleString()}`);
      return;
    }
    if (amount > walletBalance.available) {
      alert('Insufficient balance');
      return;
    }

    try {
      // Insert payout request
      const { error: payoutError } = await supabase
        .from('payouts')
        .insert([{
          user_id: user.id,
          amount: amount,
          fee: walletBalance.processingFee,
          method: selectedMethod.type,
          method_details: selectedMethod,
          status: 'pending'
        }]);

      if (payoutError) throw payoutError;

      // Deduct from wallet balance (you might want to use a transaction or function)
      const { error: updateError } = await supabase
        .from('wallets')
        .update({
          balance: walletBalance.available - amount,
          pending_balance: walletBalance.pending + amount
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      alert(`Withdrawal request for ₦${amount.toLocaleString()} submitted!`);
      setWithdrawAmount('');
      loadData(); // refresh data
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      alert('Failed to process withdrawal. Please try again.');
    }
  };

  const getMethodIcon = (type) => {
    return type === 'bank' ? <DollarSign size={24} /> : <Smartphone size={24} />;
  };

  const filteredHistory = payoutHistory.filter(payout =>
    payout.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payout.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payout.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="loading">Loading payout information...</div>;

  return (
    <div className="payouts-container">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payouts & Withdrawals</h1>
          <p className="text-gray-600">Withdraw your earnings to your bank account or mobile wallet</p>
        </div>

        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Download size={20} />
          <span>Download Statement</span>
        </button>
      </div>

      {/* Wallet Balance Card */}
      <div className="wallet-card">
        <div className="wallet-header">
          <div className="wallet-title">
            <p>Available Balance</p>
            <p className="wallet-balance">₦{walletBalance.available.toLocaleString()}</p>
            <div className="wallet-details">
              <div className="wallet-detail">
                <Clock size={16} />
                <span>Pending: ₦{walletBalance.pending.toLocaleString()}</span>
              </div>
              <div className="wallet-detail">
                <Wallet size={16} />
                <span>Min: ₦{walletBalance.minWithdrawal.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="wallet-icon">
            <Wallet size={48} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="payouts-tabs">
        <nav className="tabs-nav">
          {['withdraw', 'history', 'methods'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Withdraw Section */}
      {activeTab === 'withdraw' && (
        <div className="withdraw-layout">
          <div className="space-y-6">
            {/* Withdraw Form */}
            <div className="withdraw-form">
              <div className="form-section">
                <h3>Withdrawal Amount</h3>
                <div className="amount-input-wrapper">
                  <DollarSign className="input-icon" />
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="amount-input"
                  />
                </div>

                <div className="quick-amounts">
                  {[5000, 10000, 25000, 50000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setWithdrawAmount(amount.toString())}
                      className="quick-amount"
                    >
                      ₦{amount.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className="calculator-summary">
                  <div className="calc-row">
                    <span>Available Balance</span>
                    <span className="calc-value">₦{walletBalance.available.toLocaleString()}</span>
                  </div>
                  <div className="calc-row">
                    <span>Processing Fee</span>
                    <span className="calc-value negative">-₦{walletBalance.processingFee.toLocaleString()}</span>
                  </div>
                  <div className="calc-row total">
                    <span>You'll Receive</span>
                    <span className="calc-value positive">
                      ₦{withdrawAmount ? (parseFloat(withdrawAmount) - walletBalance.processingFee).toLocaleString() : '0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payout Methods */}
            <div className="payout-methods">
              <div className="methods-header">
                <h3>Payout Method</h3>
                <button
                  className="add-method-btn"
                  onClick={() => navigate('/dashboard/provider/payment-methods')}
                >
                  <Plus size={16} />
                  <span>Add New Method</span>
                </button>
              </div>

              <div className="methods-list">
                {payoutMethods.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No payment methods added yet</p>
                ) : (
                  payoutMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedMethod(method)}
                      className={`method-card ${selectedMethod?.id === method.id ? 'selected' : ''}`}
                    >
                      <div className="method-header">
                        <div className="method-info">
                          <div className={`method-icon ${method.type}`}>
                            {getMethodIcon(method.type)}
                          </div>
                          <div className="method-details">
                            <h4>{method.name}</h4>
                            <p>{method.type === 'bank' ? 'Bank Account' : 'Mobile Wallet'}</p>
                          </div>
                        </div>
                        {method.is_default && (
                          <span className="default-badge">Default</span>
                        )}
                      </div>

                      <div className="method-details-row">
                        <p className="text-sm text-gray-600 mb-1">
                          {method.type === 'bank' ? 'Account Number' : 'Phone Number'}
                        </p>
                        <p className="method-number">
                          {method.account_number}
                        </p>
                      </div>

                      {selectedMethod?.id === method.id && (
                        <div className="method-actions">
                          <button className="method-btn default">
                            Make Default
                          </button>
                          <button className="method-btn remove">
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Withdraw Summary */}
            <div className="withdraw-summary">
              <div className="summary-header">
                <h3>Withdrawal Summary</h3>
              </div>
              <div className="summary-details">
                <div className="summary-row">
                  <span className="summary-label">Amount</span>
                  <span className="summary-value">₦{withdrawAmount || '0'}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Processing Fee</span>
                  <span className="summary-value negative">-₦{walletBalance.processingFee}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label total">You'll Receive</span>
                  <span className="summary-value total">
                    ₦{withdrawAmount ? (parseFloat(withdrawAmount) - walletBalance.processingFee).toLocaleString() : '0'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleWithdraw}
                disabled={!withdrawAmount || parseFloat(withdrawAmount) < walletBalance.minWithdrawal}
                className="withdraw-btn"
              >
                Withdraw Now
              </button>

              <p className="processing-time">
                Processing time: 1-3 business days
              </p>
            </div>

            {/* Important Notes */}
            <div className="important-notes">
              <div className="notes-header">
                <AlertCircle size={24} />
                <h4>Important Notes</h4>
              </div>
              <ul className="notes-list">
                <li>Minimum withdrawal: ₦{walletBalance.minWithdrawal.toLocaleString()}</li>
                <li>Processing fee: ₦{walletBalance.processingFee} per transaction</li>
                <li>Withdrawals processed within 1-3 business days</li>
                <li>Weekend withdrawals may be delayed until Monday</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Payout History */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="payouts-table">
            <div className="table-header">
              <div className="header-content">
                <h3>Payout History</h3>
                <div className="table-controls">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search transactions..."
                    className="table-search"
                  />
                  <button className="table-filter">
                    <Filter size={20} />
                    <span>Filter</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Transaction ID</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Fee</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((payout) => (
                    <tr key={payout.id}>
                      <td>
                        <div className="date-cell">
                          <Calendar size={16} />
                          <span>{new Date(payout.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="id-cell">{payout.transaction_id || 'N/A'}</td>
                      <td className="amount-cell">₦{payout.amount.toLocaleString()}</td>
                      <td>
                        <span className="method-badge">{payout.method}</span>
                      </td>
                      <td className="fee-cell">-₦{payout.fee}</td>
                      <td>
                        <span className={`status-badge ${payout.status}`}>
                          {payout.status === 'completed' && <CheckCircle size={14} />}
                          {payout.status === 'processing' && <Clock size={14} />}
                          {payout.status === 'failed' && <AlertCircle size={14} />}
                          <span className="capitalize">{payout.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredHistory.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No payout history found
            </div>
          )}
        </div>
      )}

      {/* Payout Methods (full page) */}
      {activeTab === 'methods' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="methods-header">
              <h3 className="text-lg font-semibold">Your Payout Methods</h3>
              <button
                className="add-method-btn"
                onClick={() => navigate('/dashboard/provider/payment-methods')}
              >
                <Plus size={20} />
                <span>Add New Method</span>
              </button>
            </div>

            <div className="methods-grid">
              {payoutMethods.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No payment methods added yet</p>
              ) : (
                payoutMethods.map((method) => (
                  <div key={method.id} className="method-card-full">
                    <div className="method-header-full">
                      <div className="method-info-full">
                        <div className={`method-icon-full ${method.type}`}>
                          {getMethodIcon(method.type)}
                        </div>
                        <div className="method-details-full">
                          <h4>{method.name}</h4>
                          <p>{method.type === 'bank' ? 'Bank Account' : 'Mobile Wallet'}</p>
                        </div>
                      </div>
                      {method.is_default && (
                        <span className="default-badge">Default</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          {method.type === 'bank' ? 'Account Number' : 'Phone Number'}
                        </p>
                        <p className="method-number">
                          {method.account_number}
                        </p>
                      </div>

                      <div className="method-actions-full">
                        <button className="action-btn-full default-btn">
                          Make Default
                        </button>
                        <button className="action-btn-full remove-btn">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="guidelines">
            <h4>Payout Method Guidelines</h4>
            <ul>
              <li>You can add multiple bank accounts and mobile wallets</li>
              <li>One method must be set as default for automatic withdrawals</li>
              <li>Bank transfers may take 1-3 business days to process</li>
              <li>Mobile wallet transfers are usually instant</li>
              <li>Ensure account details are correct to avoid failed transfers</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderPayouts;