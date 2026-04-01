// src/modules/manager/pages/ManagerPayments.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import { paymentService } from '../../../shared/lib/paymentService';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import { Eye, EyeOff, Upload, FileText, CheckCircle, XCircle, Clock, Download, CreditCard, Banknote, TrendingUp, Home } from 'lucide-react';
import './ManagerPayments.css';

const ManagerPayments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [commissions, setCommissions] = useState([]);
  const [managedProperties, setManagedProperties] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadingForId, setUploadingForId] = useState(null);
  const [stats, setStats] = useState({
    totalEarned: 0,
    available: 0,
    withdrawn: 0,
    pending: 0,
    awaitingAdmin: 0,
    potentialEarnings: 0
  });

  // Bank details for user
  const [bankDetails, setBankDetails] = useState({
    bank_name: '',
    account_number: '',
    account_name: ''
  });
  const [showAccountNumber, setShowAccountNumber] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadData();
      loadBankDetails();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Load commissions (payment records)
      const { data: commissionsData, error: commissionsError } = await supabase
        .from('commissions')
        .select(`
          *,
          listing:listings(id, title, address, price, city, state)
        `)
        .eq('manager_id', user.id)
        .order('created_at', { ascending: false });

      if (commissionsError) throw commissionsError;

      setCommissions(commissionsData || []);

      // 2. Load managed properties (listings where manager is assigned and not rented)
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('listings')
        .select('*')
        .eq('assigned_manager_id', user.id)
        .neq('status', 'rented')
        .order('assigned_at', { ascending: false });

      if (propertiesError) throw propertiesError;

      setManagedProperties(propertiesData || []);

      // Calculate stats
      const totalEarned = commissionsData.reduce((sum, c) => sum + (c.manager_share || 0), 0);
      const paid = commissionsData.filter(c => c.status === 'paid' || c.paid_to_manager)
        .reduce((sum, c) => sum + (c.manager_share || 0), 0);
      const awaitingAdmin = commissionsData.filter(c => c.status === 'proof_submitted' && !c.paid_to_manager)
        .reduce((sum, c) => sum + (c.manager_share || 0), 0);
      const pending = commissionsData.filter(c => c.status === 'pending' && !c.paid_to_manager)
        .reduce((sum, c) => sum + (c.manager_share || 0), 0);

      // Potential earnings from managed properties (2.5% of rent)
      const potential = propertiesData.reduce((sum, p) => sum + ((p.price || 0) * 0.025), 0);

      setStats({
        totalEarned,
        available: totalEarned - paid,
        withdrawn: paid,
        pending,
        awaitingAdmin,
        potentialEarnings: potential
      });
    } catch (error) {
      console.error('Error loading data:', error);
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
      setBankDetails({
        bank_name: data.bank_name || '',
        account_number: data.account_number || '',
        account_name: data.account_name || ''
      });
    }
  };

  const getFilteredCommissions = () => {
    switch (filter) {
      case 'pending':
        return commissions.filter(c => c.status === 'pending' && !c.paid_to_manager);
      case 'proof_submitted':
        return commissions.filter(c => c.status === 'proof_submitted' && !c.paid_to_manager);
      case 'paid':
        return commissions.filter(c => c.status === 'paid' || c.paid_to_manager);
      default:
        return commissions;
    }
  };

  // Upload proof (same as before)
  const handleUploadProof = async (commission) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,.pdf';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setUploading(true);
      setUploadingForId(commission.id);
      
      try {
        const reference = paymentService.generateReference('COMM');
        
        const payment = await paymentService.createPayment({
          userId: user.id,
          amount: commission.manager_share,
          type: 'commission_proof',
          reference,
          metadata: {
            commission_id: commission.id,
            listing_id: commission.listing_id,
            rental_amount: commission.rental_amount,
            property_title: commission.listing?.title
          }
        });

        const proofUrl = await paymentService.uploadProof({
          paymentId: payment.id,
          userId: user.id,
          file
        });

        const { error: updateError } = await supabase
          .from('commissions')
          .update({
            status: 'proof_submitted',
            proof_url: proofUrl,
            payment_id: payment.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', commission.id);
        
        if (updateError) throw updateError;

        alert('✅ Proof uploaded successfully! Admin will verify shortly.');
        loadData();
      } catch (error) {
        console.error('Error uploading proof:', error);
        alert('❌ Failed to upload proof. Please try again.');
      } finally {
        setUploading(false);
        setUploadingForId(null);
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

  const formatAccountNumber = (number) => {
    if (!number) return 'Not provided';
    if (showAccountNumber) return number;
    return '••••' + number.slice(-4);
  };

  const getPaymentStatus = (commission) => {
    if (commission.paid_to_manager || commission.status === 'paid') {
      return { label: 'Paid to Bank', color: '#155724', bgColor: '#d4edda', icon: '✅' };
    }
    if (commission.status === 'proof_submitted') {
      return { label: 'Awaiting Admin', color: '#856404', bgColor: '#fff3cd', icon: '⏳' };
    }
    if (commission.status === 'pending') {
      return { label: 'Upload Proof', color: '#0c5460', bgColor: '#d1ecf1', icon: '📤' };
    }
    return { label: 'Unknown', color: '#6c757d', bgColor: '#f8f9fa', icon: '❓' };
  };

  if (loading) {
    return <RentEasyLoader message="Loading payment history..." fullScreen />;
  }

  const filteredCommissions = getFilteredCommissions();

  return (
    <div className="manager-payments">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>💰 Payments & Commission</h1>
          <p>Track your earnings and upload payment proofs</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard/manager')}>
          ← Back to Dashboard
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
            <div className="summary-label">Available for Withdrawal</div>
            <div className="summary-amount">{formatCurrency(stats.available)}</div>
            <div className="summary-sub">After admin verification</div>
          </div>
          <button
            className="btn-withdraw"
            onClick={() => navigate('/dashboard/manager/withdraw')}
            disabled={stats.available < 5000}
          >
            Withdraw (Min ₦5,000)
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
            <div className="summary-label">Awaiting Admin</div>
            <div className="summary-amount">{formatCurrency(stats.awaitingAdmin)}</div>
            <div className="summary-sub">Proof submitted</div>
          </div>
        </div>
      </div>

      {/* Potential Earnings from Managed Properties */}
      {managedProperties.length > 0 && (
        <div className="potential-earnings-card">
          <div className="potential-header">
            <Home size={20} />
            <h3>🏠 Managed Properties</h3>
            <span className="potential-badge">Potential Commission: {formatCurrency(stats.potentialEarnings)}</span>
          </div>
          <div className="managed-properties-list">
            {managedProperties.map(property => (
              <div key={property.id} className="managed-property-item">
                <div className="property-info">
                  <strong>{property.title}</strong>
                  <p>{property.address}, {property.city}, {property.state}</p>
                </div>
                <div className="property-potential">
                  <span className="label">Potential Commission (2.5%):</span>
                  <span className="value">{formatCurrency(property.price * 0.025)}</span>
                </div>
                <button 
                  className="btn-view-property"
                  onClick={() => navigate(`/listings/${property.id}`)}
                >
                  View Property
                </button>
              </div>
            ))}
          </div>
          <p className="potential-note">These properties are assigned to you but not yet rented. Commission will appear here after rental confirmation.</p>
        </div>
      )}

      {/* BANK DETAILS SECTION - Show warning if missing */}
      {(!bankDetails.bank_name || !bankDetails.account_number) && (
        <div className="bank-details-warning">
          <div className="warning-icon">⚠️</div>
          <div className="warning-content">
            <strong>Bank Details Missing</strong>
            <p>Please add your bank details to receive payouts.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/dashboard/manager/profile')}
            >
              Add Bank Details
            </button>
          </div>
        </div>
      )}

      {/* RENTEASY BANK DETAILS */}
      <div className="renteasy-bank-notice">
        <div className="notice-icon">🏦</div>
        <div className="notice-text">
          <h4>How to complete your commission:</h4>
          <p>
            After closing a deal, send the total 7.5% commission to the account below.
            Once confirmed, your 2.5% share will be sent to your registered bank account.
          </p>
          <div className="bank-details-box">
            <p><strong>Bank:</strong> Monie Point</p>
            <p><strong>Account Name:</strong> Stable Pilla Resources</p>
            <p><strong>Account Number:</strong> 8149113218</p>
          </div>
          <small>*Use the Property Title as your transfer narration.</small>
        </div>
      </div>

      {/* FILTERS */}
      <div className="payments-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Payments ({commissions.length})
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({commissions.filter(c => c.status === 'pending' && !c.paid_to_manager).length})
        </button>
        <button
          className={`filter-btn ${filter === 'proof_submitted' ? 'active' : ''}`}
          onClick={() => setFilter('proof_submitted')}
        >
          Awaiting Admin ({commissions.filter(c => c.status === 'proof_submitted' && !c.paid_to_manager).length})
        </button>
        <button
          className={`filter-btn ${filter === 'paid' ? 'active' : ''}`}
          onClick={() => setFilter('paid')}
        >
          Paid ({commissions.filter(c => c.status === 'paid' || c.paid_to_manager).length})
        </button>
      </div>

      {/* PAYMENTS TABLE */}
      <div className="payments-table-container">
        {filteredCommissions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💰</div>
            <h3>No {filter} payments found</h3>
            <p>
              {filter === 'all'
                ? 'You haven\'t earned any commission yet. Complete rentals to start earning!'
                : filter === 'pending'
                ? 'Upload proof for pending commissions to get verified.'
                : filter === 'proof_submitted'
                ? 'Your proofs are being reviewed by admin.'
                : 'No paid payments yet.'}
            </p>
            {filter !== 'all' && (
              <button className="btn btn-outline" onClick={() => setFilter('all')}>
                View All Payments
              </button>
            )}
          </div>
        ) : (
          <div className="payments-table-responsive">
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
                {filteredCommissions.map((commission) => {
                  const status = getPaymentStatus(commission);
                  const listing = commission.listing || {};
                  const isPending = commission.status === 'pending' && !commission.paid_to_manager;
                  const isProofSubmitted = commission.status === 'proof_submitted' && !commission.paid_to_manager;
                  
                  return (
                    <tr key={commission.id}>
                      <td>
                        <div className="property-info">
                          <strong>{listing.title || 'Unknown Property'}</strong>
                          <small>{listing.address || `${listing.city || ''} ${listing.state || ''}`}</small>
                        </div>
                      </td>
                      <td>{new Date(commission.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="amount-cell">
                          <strong>{formatCurrency(commission.rental_amount)}</strong>
                          <small>Annual Rent</small>
                        </div>
                      </td>
                      <td>
                        <div className="commission-cell">
                          <strong className="highlight">
                            {formatCurrency(commission.manager_share)}
                          </strong>
                          <small>(2.5%)</small>
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
                          {isPending && (
                            <div className="upload-proof-area">
                              <button
                                className="btn-upload-proof-large"
                                onClick={() => handleUploadProof(commission)}
                                disabled={uploading && uploadingForId === commission.id}
                              >
                                {uploading && uploadingForId === commission.id ? (
                                  <><div className="spinner-small"></div> Uploading...</>
                                ) : (
                                  <><Upload size={16} /> Upload Payment Proof</>
                                )}
                              </button>
                              <small>Upload bank transfer receipt or screenshot</small>
                            </div>
                          )}
                          
                          {isProofSubmitted && (
                            <div className="proof-submitted-area">
                              <span className="status-waiting">
                                <Clock size={14} /> Verification Pending
                              </span>
                              {commission.proof_url && (
                                <a
                                  href={commission.proof_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-view-proof"
                                >
                                  <Eye size={14} /> View Proof
                                </a>
                              )}
                            </div>
                          )}
                          
                          {commission.paid_to_manager && (
                            <div className="paid-area">
                              <span className="status-paid">
                                <CheckCircle size={14} /> Paid
                              </span>
                              {commission.paid_at && (
                                <small>Paid on: {new Date(commission.paid_at).toLocaleDateString()}</small>
                              )}
                            </div>
                          )}
                          
                          <button
                            className="btn-details"
                            onClick={() => {
                              const totalCommission = (commission.manager_share || 0) + (commission.referrer_share || 0) + (commission.platform_share || 0);
                              alert(
                                `📊 Commission Breakdown\n\n` +
                                `Property: ${listing.title || 'Unknown'}\n` +
                                `Rental Amount: ${formatCurrency(commission.rental_amount)}\n\n` +
                                `Total Commission (7.5%): ${formatCurrency(totalCommission)}\n` +
                                `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                                `👨‍💼 Manager (You): ${formatCurrency(commission.manager_share)} (2.5%)\n` +
                                `👥 Referrer: ${formatCurrency(commission.referrer_share)} (1.5%)\n` +
                                `🏢 RentEasy: ${formatCurrency(commission.platform_share)} (3.5%)`
                              );
                            }}
                          >
                            <FileText size={14} /> Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
              {formatCurrency(stats.totalEarned * 0.6)}
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
              {formatCurrency(stats.totalEarned * 1.4)}
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
              {formatCurrency(stats.totalEarned * 3)}
            </div>
            <div className="breakdown-label">Per Rental</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerPayments;