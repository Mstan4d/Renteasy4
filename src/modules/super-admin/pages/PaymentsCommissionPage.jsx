// src/modules/super-admin/pages/PaymentsCommissionPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './PaymentsCommissionPage.css';

const PaymentsCommissionPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [showReverseModal, setShowReverseModal] = useState(false);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCommission: 0,
    managerCommission: 0,
    referrerCommission: 0,
    rentEasyCommission: 0,
    fraudulentTransactions: 0
  });

  // Commission rules (can be moved to context later)
  const commissionRules = {
    tenantLandlordListings: {
      mandatory: 7.5,
      breakdown: {
        manager: 2.5,
        referrer: 1.5,
        rentEasy: 3.5
      },
      cannotBeReduced: true
    },
    estateFirmListings: {
      mandatory: 0,
      subscriptionFee: 10000,
      commissionExempt: true
    },
    validationRules: [
      'No listing can bypass 7.5% for tenant/landlord posts',
      'Estate firm listings must be tagged correctly',
      'System must alert Super Admin on rule violation',
      'Override requires Super Admin confirmation'
    ]
  };

  // Fetch commissions on mount
  useEffect(() => {
    fetchCommissions();
  }, []);

  // Real‑time subscription
  useEffect(() => {
    const channel = supabase
      .channel('commissions-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'commissions'
      }, () => {
        fetchCommissions();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('commissions')
        .select(`
          *,
          listing:listings!listing_id (
            id,
            title,
            address,
            poster_role,
            landlord:user_id (id, full_name),
            tenant:rented_to (id, full_name)
          ),
          manager:profiles!manager_id (id, full_name),
          referrer:profiles!referrer_id (id, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform to component structure
      const transformed = data.map(item => {
        const isEstateFirm = item.listing?.poster_role === 'estate-firm';
        const totalCommission = (item.manager_share || 0) + (item.referrer_share || 0) + (item.platform_share || 0);
        const commissionPercent = isEstateFirm ? 0 : (totalCommission / item.rental_amount) * 100;

        return {
          id: item.id,
          rentalId: `RENT-${item.id.slice(0, 8)}`,
          tenant: item.listing?.tenant?.full_name || 'Unknown Tenant',
          landlord: item.listing?.landlord?.full_name || 'Unknown Landlord',
          listing: item.listing?.title || 'Unknown Listing',
          amount: item.rental_amount,
          commission: Math.round(commissionPercent * 10) / 10, // round to 1 decimal
          breakdown: {
            manager: (item.manager_share / item.rental_amount * 100) || 0,
            referrer: (item.referrer_share / item.rental_amount * 100) || 0,
            rentEasy: (item.platform_share / item.rental_amount * 100) || 0
          },
          status: item.status || 'pending',
          date: new Date(item.created_at).toLocaleDateString(),
          manager: item.manager?.full_name || 'Not Applicable',
          referrer: item.referrer?.full_name || 'None',
          commissionAmounts: {
            manager: item.manager_share || 0,
            referrer: item.referrer_share || 0,
            rentEasy: item.platform_share || 0
          },
          posterRole: item.listing?.poster_role,
          raw: item // keep for updates
        };
      });

      setTransactions(transformed);
      calculateStats(transformed);
    } catch (error) {
      console.error('Error fetching commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (txs) => {
    const stats = {
      totalRevenue: 0,
      totalCommission: 0,
      managerCommission: 0,
      referrerCommission: 0,
      rentEasyCommission: 0,
      fraudulentTransactions: 0
    };

    txs.forEach(tx => {
      stats.totalRevenue += tx.amount;
      stats.managerCommission += tx.commissionAmounts.manager;
      stats.referrerCommission += tx.commissionAmounts.referrer;
      stats.rentEasyCommission += tx.commissionAmounts.rentEasy;
      if (tx.status === 'fraudulent') stats.fraudulentTransactions++;
    });

    stats.totalCommission = stats.managerCommission + stats.referrerCommission + stats.rentEasyCommission;
    setStats(stats);
  };

  const handleOverrideCommission = async (transactionId, newBreakdown) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    const newTotalPercent = newBreakdown.manager + newBreakdown.referrer + newBreakdown.rentEasy;
    const newAmounts = {
      manager: transaction.amount * (newBreakdown.manager / 100),
      referrer: transaction.amount * (newBreakdown.referrer / 100),
      platform: transaction.amount * (newBreakdown.rentEasy / 100)
    };

    try {
      const { error } = await supabase
        .from('commissions')
        .update({
          manager_share: newAmounts.manager,
          referrer_share: newAmounts.referrer,
          platform_share: newAmounts.platform,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (error) throw error;

      // Log admin activity
      await supabase.from('admin_activities').insert({
        admin_id: user?.id,
        action: `Overrode commission for transaction ${transaction.rentalId}`,
        type: 'commission_override',
        entity_id: transactionId,
        details: { old: transaction.raw, new: newAmounts }
      });

      await fetchCommissions();
      setShowOverrideModal(false);
      alert('Commission updated!');
    } catch (error) {
      console.error('Error overriding commission:', error);
      alert('Failed to override commission.');
    }
  };

  const handleReverseTransaction = async (transactionId) => {
    if (!window.confirm('Are you sure you want to reverse this transaction? This cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('commissions')
        .update({
          status: 'reversed',
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (error) throw error;

      await supabase.from('admin_activities').insert({
        admin_id: user?.id,
        action: `Reversed transaction ${transactionId}`,
        type: 'commission_reversal',
        entity_id: transactionId
      });

      await fetchCommissions();
      setShowReverseModal(false);
      alert('Transaction reversed.');
    } catch (error) {
      console.error('Error reversing transaction:', error);
      alert('Failed to reverse transaction.');
    }
  };

  const handleFreezeConfirmation = async (transactionId) => {
    try {
      const { error } = await supabase
        .from('commissions')
        .update({
          status: 'frozen',
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (error) throw error;

      await supabase.from('admin_activities').insert({
        admin_id: user?.id,
        action: `Froze transaction ${transactionId}`,
        type: 'commission_freeze',
        entity_id: transactionId
      });

      await fetchCommissions();
      setShowFreezeModal(false);
      alert('Transaction frozen.');
    } catch (error) {
      console.error('Error freezing transaction:', error);
      alert('Failed to freeze transaction.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid':
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'fraudulent': return 'danger';
      case 'reversed': return 'danger';
      case 'frozen': return 'info';
      default: return 'default';
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.status === filter;
  });

  if (loading) {
    return <div className="loading">Loading commission data...</div>;
  }

  return (
    <div className="payments-commission">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Payments & Commission Control</h1>
          <p className="page-subtitle">Financial controls and commission overrides</p>
        </div>
        <div className="header-actions">
          <button className="export-btn" onClick={() => alert('Export coming soon')}>
            📊 Export Financial Report
          </button>
        </div>
      </div>

      {/* Critical Warning */}
      <div className="critical-warning">
        <div className="warning-content">
          <span className="warning-icon">💀</span>
          <div className="warning-text">
            <strong>CRITICAL BUSINESS RULES:</strong> This is where RentEasy survives or dies.
            7.5% is mandatory for tenant & landlord listings. 0% for estate firms. ONLY Super Admin can change commission %.
          </div>
        </div>
      </div>

      {/* Commission Rules */}
      <div className="commission-rules">
        <div className="rules-header">
          <h3>Commission Structure & Rules</h3>
        </div>
        <div className="rules-grid">
          <div className="rule-card">
            <div className="rule-title">Tenant/Landlord Listings</div>
            <div className="rule-percentage">7.5% MANDATORY</div>
            <div className="rule-breakdown">
              <div className="breakdown-item">
                <span className="breakdown-label">Manager:</span>
                <span className="breakdown-value">2.5%</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Referrer:</span>
                <span className="breakdown-value">1.5%</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">RentEasy:</span>
                <span className="breakdown-value">3.5%</span>
              </div>
            </div>
            <div className="rule-note">Cannot be reduced by anyone except Super Admin</div>
          </div>
          <div className="rule-card">
            <div className="rule-title">Estate Firm Listings</div>
            <div className="rule-percentage">0% COMMISSION</div>
            <div className="rule-breakdown">
              <div className="breakdown-item">
                <span className="breakdown-label">Monthly Subscription:</span>
                <span className="breakdown-value">₦10,000</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Commission:</span>
                <span className="breakdown-value">Exempt</span>
              </div>
            </div>
            <div className="rule-note">Must be tagged correctly to avoid commission charges</div>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="financial-overview">
        <div className="stats-grid">
          <div className="stat-card revenue">
            <div className="stat-icon">💰</div>
            <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
          <div className="stat-card commission">
            <div className="stat-icon">📊</div>
            <div className="stat-value">{formatCurrency(stats.totalCommission)}</div>
            <div className="stat-label">Total Commission</div>
          </div>
          <div className="stat-card manager">
            <div className="stat-icon">🛡️</div>
            <div className="stat-value">{formatCurrency(stats.managerCommission)}</div>
            <div className="stat-label">Manager Share (2.5%)</div>
          </div>
          <div className="stat-card referrer">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{formatCurrency(stats.referrerCommission)}</div>
            <div className="stat-label">Referrer Share (1.5%)</div>
          </div>
          <div className="stat-card renteasy">
            <div className="stat-icon">🏢</div>
            <div className="stat-value">{formatCurrency(stats.rentEasyCommission)}</div>
            <div className="stat-label">RentEasy Share (3.5%)</div>
          </div>
          <div className="stat-card fraudulent">
            <div className="stat-icon">🚨</div>
            <div className="stat-value">{stats.fraudulentTransactions}</div>
            <div className="stat-label">Fraudulent Transactions</div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="transactions-section">
        <div className="section-header">
          <h3>All Rental Transactions</h3>
          <div className="filter-controls">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Transactions</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="fraudulent">Fraudulent</option>
              <option value="reversed">Reversed</option>
              <option value="frozen">Frozen</option>
            </select>
          </div>
        </div>

        <div className="transactions-table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Transaction Details</th>
                <th>Commission Breakdown</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(transaction => (
                <tr key={transaction.id} className={transaction.status}>
                  <td>
                    <div className="transaction-details">
                      <div className="transaction-id">
                        <strong>{transaction.rentalId}</strong>
                      </div>
                      <div className="transaction-parties">
                        <span className="party tenant">Tenant: {transaction.tenant}</span>
                        <span className="party landlord">Landlord: {transaction.landlord}</span>
                      </div>
                      <div className="transaction-listing">
                        {transaction.listing}
                      </div>
                      <div className="transaction-meta">
                        <span className="meta-item">Date: {transaction.date}</span>
                        <span className="meta-item">Manager: {transaction.manager}</span>
                        <span className="meta-item">Referrer: {transaction.referrer}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="commission-breakdown">
                      <div className="breakdown-row">
                        <span className="breakdown-label">Total Commission:</span>
                        <span className={`breakdown-value ${transaction.commission !== 7.5 && transaction.posterRole !== 'estate-firm' ? 'warning' : ''}`}>
                          {transaction.commission}%
                        </span>
                      </div>
                      {transaction.commission > 0 ? (
                        <>
                          <div className="breakdown-row">
                            <span className="breakdown-label">Manager (2.5%):</span>
                            <span className="breakdown-value">
                              {formatCurrency(transaction.commissionAmounts.manager)}
                            </span>
                          </div>
                          <div className="breakdown-row">
                            <span className="breakdown-label">Referrer (1.5%):</span>
                            <span className="breakdown-value">
                              {formatCurrency(transaction.commissionAmounts.referrer)}
                            </span>
                          </div>
                          <div className="breakdown-row">
                            <span className="breakdown-label">RentEasy (3.5%):</span>
                            <span className="breakdown-value">
                              {formatCurrency(transaction.commissionAmounts.rentEasy)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="breakdown-row exempt">
                          <span className="breakdown-label">Estate Firm Listing</span>
                          <span className="breakdown-value">Commission Exempt</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="amount-cell">
                      <div className="total-amount">{formatCurrency(transaction.amount)}</div>
                      {transaction.commission > 0 && (
                        <div className="commission-amount">
                          Commission: {formatCurrency(transaction.amount * (transaction.commission / 100))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusColor(transaction.status)}`}>
                      {transaction.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn view"
                        onClick={() => setSelectedTransaction(transaction)}
                        title="View Details"
                      >
                        👁️
                      </button>
                      <button
                        className="action-btn override"
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowOverrideModal(true);
                        }}
                        title="Override Commission"
                        disabled={transaction.commission === 0}
                      >
                        ⚡
                      </button>
                      <button
                        className="action-btn freeze"
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowFreezeModal(true);
                        }}
                        title="Freeze Payment"
                      >
                        ❄️
                      </button>
                      <button
                        className="action-btn reverse"
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowReverseModal(true);
                        }}
                        title="Reverse Transaction"
                      >
                        ↩️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commission Override Modal */}
      {showOverrideModal && selectedTransaction && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header warning">
              <h3>Override Commission Distribution</h3>
              <button className="close-modal" onClick={() => setShowOverrideModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="override-warning">
                <span className="warning-icon">⚡</span>
                <p>
                  You are overriding the commission for <strong>{selectedTransaction.rentalId}</strong>.
                  Total amount: <strong>{formatCurrency(selectedTransaction.amount)}</strong>
                </p>
                <div className="warning-note">
                  <strong>NOTE:</strong> This action is logged and cannot be performed by regular admins.
                </div>
              </div>
              <div className="commission-override-form">
                <div className="form-group">
                  <label>Total Commission %</label>
                  <div className="percentage-input">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      defaultValue={selectedTransaction.commission}
                      className="commission-input"
                    />
                    <span className="percentage-symbol">%</span>
                  </div>
                </div>
                <div className="breakdown-fields">
                  <div className="breakdown-group">
                    <label>Manager Share (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      defaultValue={selectedTransaction.breakdown.manager}
                      className="breakdown-input"
                    />
                  </div>
                  <div className="breakdown-group">
                    <label>Referrer Share (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      defaultValue={selectedTransaction.breakdown.referrer}
                      className="breakdown-input"
                    />
                  </div>
                  <div className="breakdown-group">
                    <label>RentEasy Share (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      defaultValue={selectedTransaction.breakdown.rentEasy}
                      className="breakdown-input"
                    />
                  </div>
                </div>
                <div className="calculated-amounts">
                  <h5>Calculated Amounts:</h5>
                  <div className="amount-row">
                    <span>Manager:</span>
                    <span>{formatCurrency(selectedTransaction.amount * (selectedTransaction.breakdown.manager / 100))}</span>
                  </div>
                  <div className="amount-row">
                    <span>Referrer:</span>
                    <span>{formatCurrency(selectedTransaction.amount * (selectedTransaction.breakdown.referrer / 100))}</span>
                  </div>
                  <div className="amount-row">
                    <span>RentEasy:</span>
                    <span>{formatCurrency(selectedTransaction.amount * (selectedTransaction.breakdown.rentEasy / 100))}</span>
                  </div>
                  <div className="amount-row total">
                    <span>Total Commission:</span>
                    <span>{formatCurrency(selectedTransaction.amount * (selectedTransaction.commission / 100))}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowOverrideModal(false)}>Cancel</button>
              <button
                className="btn-primary"
                onClick={() => handleOverrideCommission(selectedTransaction.id, {
                  manager: parseFloat(document.querySelector('.breakdown-group:nth-child(1) input').value) || 2.5,
                  referrer: parseFloat(document.querySelector('.breakdown-group:nth-child(2) input').value) || 1.5,
                  rentEasy: parseFloat(document.querySelector('.breakdown-group:nth-child(3) input').value) || 3.5
                })}
              >
                Apply Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Freeze Payment Modal */}
      {showFreezeModal && selectedTransaction && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header danger">
              <h3>Freeze Payment Confirmation</h3>
              <button className="close-modal" onClick={() => setShowFreezeModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="freeze-warning">
                <span className="warning-icon">❄️</span>
                <div className="warning-content">
                  <h4>Freeze Payment: {selectedTransaction.rentalId}</h4>
                  <p>
                    Freezing this payment will prevent any further actions on this transaction.
                    Commission payments will be halted until unfrozen.
                  </p>
                  <div className="transaction-details">
                    <p><strong>Amount:</strong> {formatCurrency(selectedTransaction.amount)}</p>
                    <p><strong>Parties:</strong> {selectedTransaction.tenant} ↔ {selectedTransaction.landlord}</p>
                    <p><strong>Reason for freezing:</strong></p>
                    <textarea
                      className="freeze-reason"
                      placeholder="Enter reason for freezing this payment..."
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowFreezeModal(false)}>Cancel</button>
              <button className="btn-primary danger" onClick={() => handleFreezeConfirmation(selectedTransaction.id)}>
                Freeze Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reverse Transaction Modal */}
      {showReverseModal && selectedTransaction && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header danger">
              <h3>Reverse Transaction</h3>
              <button className="close-modal" onClick={() => setShowReverseModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="reverse-warning">
                <span className="warning-icon">⚠️</span>
                <div className="warning-content">
                  <h4>CRITICAL ACTION: Transaction Reversal</h4>
                  <p>
                    You are about to reverse transaction <strong>{selectedTransaction.rentalId}</strong>.
                    This action cannot be undone and will:
                  </p>
                  <ul className="reversal-impacts">
                    <li>❌ Mark transaction as fraudulent</li>
                    <li>❌ Reverse all commission payments</li>
                    <li>❌ Notify all parties involved</li>
                    <li>❌ Update all dashboards automatically</li>
                    <li>❌ Flag users for review</li>
                  </ul>
                  <div className="reversal-details">
                    <p><strong>Transaction Amount:</strong> {formatCurrency(selectedTransaction.amount)}</p>
                    <p><strong>Commission to be reversed:</strong> {formatCurrency(selectedTransaction.amount * (selectedTransaction.commission / 100))}</p>
                    <textarea
                      className="reversal-reason"
                      placeholder="Detailed reason for reversal (required for audit)..."
                      rows="4"
                      required
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowReverseModal(false)}>Cancel</button>
              <button className="btn-primary danger" onClick={() => handleReverseTransaction(selectedTransaction.id)}>
                Confirm Reversal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && !showOverrideModal && !showFreezeModal && !showReverseModal && (
        <div className="modal-overlay">
          <div className="modal large">
            <div className="modal-header">
              <h3>Transaction Details</h3>
              <button className="close-modal" onClick={() => setSelectedTransaction(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="transaction-details-modal">
                <div className="details-section">
                  <h4>Transaction Information</h4>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Transaction ID:</span>
                      <span className="detail-value">{selectedTransaction.rentalId}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Status:</span>
                      <span className={`status-badge ${getStatusColor(selectedTransaction.status)}`}>
                        {selectedTransaction.status}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Date:</span>
                      <span className="detail-value">{selectedTransaction.date}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Total Amount:</span>
                      <span className="detail-value">{formatCurrency(selectedTransaction.amount)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Commission Rate:</span>
                      <span className="detail-value">{selectedTransaction.commission}%</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Listing:</span>
                      <span className="detail-value">{selectedTransaction.listing}</span>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h4>Parties Involved</h4>
                  <div className="parties-grid">
                    <div className="party-card">
                      <div className="party-type">Tenant</div>
                      <div className="party-name">{selectedTransaction.tenant}</div>
                    </div>
                    <div className="party-card">
                      <div className="party-type">Landlord/Firm</div>
                      <div className="party-name">{selectedTransaction.landlord}</div>
                    </div>
                    <div className="party-card">
                      <div className="party-type">Manager</div>
                      <div className="party-name">{selectedTransaction.manager}</div>
                    </div>
                    <div className="party-card">
                      <div className="party-type">Referrer</div>
                      <div className="party-name">{selectedTransaction.referrer}</div>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h4>Commission Breakdown</h4>
                  <div className="commission-grid">
                    <div className="commission-card">
                      <div className="commission-type">Manager</div>
                      <div className="commission-percentage">{selectedTransaction.breakdown.manager}%</div>
                      <div className="commission-amount">
                        {formatCurrency(selectedTransaction.commissionAmounts.manager)}
                      </div>
                    </div>
                    <div className="commission-card">
                      <div className="commission-type">Referrer</div>
                      <div className="commission-percentage">{selectedTransaction.breakdown.referrer}%</div>
                      <div className="commission-amount">
                        {formatCurrency(selectedTransaction.commissionAmounts.referrer)}
                      </div>
                    </div>
                    <div className="commission-card">
                      <div className="commission-type">RentEasy</div>
                      <div className="commission-percentage">{selectedTransaction.breakdown.rentEasy}%</div>
                      <div className="commission-amount">
                        {formatCurrency(selectedTransaction.commissionAmounts.rentEasy)}
                      </div>
                    </div>
                    <div className="commission-card total">
                      <div className="commission-type">Total Commission</div>
                      <div className="commission-percentage">{selectedTransaction.commission}%</div>
                      <div className="commission-amount">
                        {formatCurrency(selectedTransaction.amount * (selectedTransaction.commission / 100))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedTransaction(null)}>Close</button>
              <button
                className="btn-primary"
                onClick={() => {
                  setSelectedTransaction(null);
                  setShowOverrideModal(true);
                }}
                disabled={selectedTransaction.commission === 0}
              >
                Override Commission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsCommissionPage;