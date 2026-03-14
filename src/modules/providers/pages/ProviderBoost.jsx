// src/modules/providers/pages/ProviderBoost.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import { paymentService } from '../../../shared/lib/paymentService';
import './ProviderBoost.css';

const ProviderBoost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeBoost, setActiveBoost] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [boostHistory, setBoostHistory] = useState([]);
  const [boostPlans, setBoostPlans] = useState([]);
  const [userStats, setUserStats] = useState({
    profileViews: 0,
    bookingRequests: 0,
    conversionRate: '0%',
    avgResponseTime: '0 hours'
  });
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('select_plan'); // select_plan, payment
  const [paymentRecord, setPaymentRecord] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetchAllData();
  }, [user]);

  const fetchAllData = async () => {
    setFetching(true);
    setError(null);
    try {
      // Fetch boost packages
      const { data: packages, error: pkgError } = await supabase
        .from('boost_packages')
        .select('*')
        .order('price', { ascending: true });
      if (pkgError) throw pkgError;
      setBoostPlans(packages || []);

      // Fetch active boost for this user
      const now = new Date().toISOString();
      const { data: active, error: activeError } = await supabase
        .from('active_boosts')
        .select(`
          *,
          package:boost_packages(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('expires_at', now)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeError) throw activeError;

      if (active) {
        const remainingDays = Math.ceil((new Date(active.expires_at) - new Date()) / (1000 * 60 * 60 * 24));
        setActiveBoost({
          id: active.id,
          name: active.package?.name,
          activatedAt: active.started_at,
          expiresAt: active.expires_at,
          status: active.status,
          remainingDays: remainingDays > 0 ? remainingDays : 0
        });
      } else {
        setActiveBoost(null);
      }

      // Fetch boost payments (history)
      const { data: payments, error: payError } = await supabase
        .from('payments')
        .select(`
          *,
          boost_package:boost_packages(*)
        `)
        .eq('user_id', user.id)
        .eq('payment_type', 'boost')
        .order('created_at', { ascending: false })
        .limit(10);

      if (payError) throw payError;

      setBoostHistory(payments || []);

      // Fetch user stats (mock for now – replace with real data if available)
      setUserStats({
        profileViews: 1247,
        bookingRequests: 89,
        conversionRate: '7.1%',
        avgResponseTime: '2.3 hours'
      });

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setFetching(false);
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setStep('select_plan');
  };

  const handleProceedToPayment = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    try {
      const reference = paymentService.generateReference('BST');
      const amount = selectedPlan.price;

      const payment = await paymentService.createPayment({
        userId: user.id,
        amount,
        type: 'boost',
        reference,
        metadata: { package_id: selectedPlan.id, package_name: selectedPlan.name }
      });

      setPaymentRecord(payment);
      setStep('payment');
    } catch (err) {
      console.error(err);
      setError('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (selected.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    if (!selected.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }
    setFile(selected);
    setError(null);
  };

  const handleUploadProof = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }
    setLoading(true);
    try {
      await paymentService.uploadProof({
        paymentId: paymentRecord.id,
        userId: user.id,
        file,
      });

      alert('Payment proof uploaded! Your boost will be activated once verified by admin.');
      await fetchAllData();
      setStep('select_plan');
      setSelectedPlan(null);
      setPaymentRecord(null);
      setFile(null);
    } catch (err) {
      console.error(err);
      setError('Failed to upload proof. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `₦${(amount || 0).toLocaleString()}`;
  };

  const bankDetails = paymentService.getBankDetails();

  if (fetching) {
    return (
      <div className="provider-boost-loading">
        <div className="loading-spinner"></div>
        <p>Loading boost options...</p>
      </div>
    );
  }

  return (
    <div className="provider-boost">
      <header className="boost-header">
        <div className="header-container">
          <div className="header-left">
            <Link to="/dashboard/provider" className="back-link">← Back to Dashboard</Link>
          </div>
          <div className="header-right">
            <Link to="/dashboard/provider/boost-history" className="history-link">Boost History</Link>
          </div>
        </div>
      </header>

      <main className="boost-main">
        {error && <div className="error-banner">{error}</div>}

        {/* Hero */}
        <div className="boost-hero">
          <h1>🚀 Boost Your Visibility</h1>
          <p className="hero-subtitle">
            Get more profile views, increase booking requests, and stand out in the marketplace with our powerful boost plans.
          </p>
          <div className="hero-stats">
            <div className="stat-card">
              <div className="stat-label">Profile Views</div>
              <div className="stat-value">{userStats.profileViews.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Booking Requests</div>
              <div className="stat-value">{userStats.bookingRequests}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Conversion Rate</div>
              <div className="stat-value">{userStats.conversionRate}</div>
            </div>
          </div>
        </div>

        {step === 'select_plan' && (
          <div className="boost-layout">
            <div className="boost-main-content">
              {activeBoost && (
                <div className="active-boost-card">
                  <div className="active-boost-header">
                    <div className="active-boost-title">
                      <span className="boost-icon">💎</span>
                      <div>
                        <h3>Active Boost: {activeBoost.name}</h3>
                        <p className="boost-description">Your profile is currently boosted</p>
                      </div>
                    </div>
                  </div>
                  <div className="boost-details">
                    <div className="boost-detail-item">
                      <span className="detail-label">Activated</span>
                      <span className="detail-value">{formatDate(activeBoost.activatedAt)}</span>
                    </div>
                    <div className="boost-detail-item">
                      <span className="detail-label">Expires In</span>
                      <span className="detail-value highlight">{activeBoost.remainingDays} days</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="plans-section">
                <h2 className="section-title">Choose Your Boost Plan</h2>
                <div className="plans-grid">
                  {boostPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`plan-card ${selectedPlan?.id === plan.id ? 'selected' : ''}`}
                      onClick={() => handleSelectPlan(plan)}
                    >
                      <div className="plan-header">
                        <div className="plan-icon">🚀</div>
                        <div className="plan-title">
                          <h3>{plan.name}</h3>
                          <p className="plan-description">{plan.description}</p>
                        </div>
                      </div>
                      <div className="plan-price">
                        <span className="price">₦{plan.price.toLocaleString()}</span>
                        <span className="duration">/{plan.duration_days} days</span>
                      </div>
                      <div className="plan-features">
                        <h4>Key Features</h4>
                        <ul>
                          {plan.features?.map((f, i) => (
                            <li key={i}><span>✓</span> {f}</li>
                          ))}
                        </ul>
                      </div>
                      <button
                        className={`select-plan-btn ${selectedPlan?.id === plan.id ? 'selected' : ''}`}
                        onClick={(e) => { e.stopPropagation(); handleSelectPlan(plan); }}
                      >
                        {selectedPlan?.id === plan.id ? 'Selected' : 'Select This Plan'}
                      </button>
                    </div>
                  ))}
                </div>
                {selectedPlan && (
                  <div className="proceed-bar">
                    <p>Selected: {selectedPlan.name} – {formatCurrency(selectedPlan.price)}</p>
                    <button onClick={handleProceedToPayment} disabled={loading} className="btn-primary">
                      {loading ? 'Processing...' : 'Proceed to Payment'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <aside className="boost-sidebar">
              <div className="sidebar-card">
                <h3>How Boosting Works</h3>
                <div className="how-it-works-steps">
                  <div className="step"><span className="step-number">1</span><p>Select plan</p></div>
                  <div className="step"><span className="step-number">2</span><p>Pay & upload proof</p></div>
                  <div className="step"><span className="step-number">3</span><p>Admin verifies</p></div>
                </div>
              </div>
              <div className="sidebar-card">
                <h3>Recent Boosts</h3>
                {boostHistory.length === 0 ? (
                  <p>No history</p>
                ) : (
                  boostHistory.slice(0, 3).map(b => (
                    <div key={b.id} className="history-item">
                      <div>{b.metadata?.package_name || 'Boost'}</div>
                      <div className={`status-badge ${b.status}`}>{b.status}</div>
                      <div>{formatCurrency(b.amount)}</div>
                    </div>
                  ))
                )}
              </div>
            </aside>
          </div>
        )}

        {step === 'payment' && paymentRecord && (
          <div className="payment-step">
            <h2>Payment Instructions</h2>
            <div className="payment-details">
              <div className="reference-box">
                <strong>Payment Reference:</strong> {paymentRecord.reference}
                <p className="small">Use this reference when making your transfer</p>
              </div>

              <div className="bank-details">
                <h4>Bank Transfer Details</h4>
                <p><strong>Bank:</strong> {bankDetails.bankName}</p>
                <p><strong>Account Number:</strong> {bankDetails.accountNumber}</p>
                <p><strong>Account Name:</strong> {bankDetails.accountName}</p>
                <p><strong>Amount:</strong> {formatCurrency(paymentRecord.amount)}</p>
              </div>

              <div className="upload-proof">
                <h4>Upload Proof of Payment</h4>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {file && <p>Selected: {file.name}</p>}
                {error && <p className="error">{error}</p>}
                <div className="action-buttons">
                  <button onClick={handleUploadProof} disabled={loading} className="btn-primary">
                    {loading ? 'Uploading...' : 'Submit Proof'}
                  </button>
                  <button onClick={() => setStep('select_plan')} className="btn-secondary">Back</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProviderBoost;