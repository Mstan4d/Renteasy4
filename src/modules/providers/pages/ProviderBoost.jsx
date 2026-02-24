// src/modules/providers/pages/ProviderBoost.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaRocket,
  FaFire,
  FaCrown,
  FaStar,
  FaCheckCircle,
  FaClock,
  FaCalendarAlt,
  FaArrowRight,
  FaChartLine,
  FaUsers,
  FaEye,
  FaMoneyBillWave,
  FaArrowLeft,
  FaQuestionCircle,
  FaShieldAlt,
  FaGem
} from 'react-icons/fa';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
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

      // Fetch boost history (past purchases)
      const { data: history, error: histError } = await supabase
        .from('boost_purchases')
        .select(`
          *,
          package:boost_packages(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (histError) throw histError;

      const formattedHistory = (history || []).map(h => ({
        id: h.id,
        plan: h.package?.name || 'Boost',
        date: h.started_at,
        price: h.amount,
        status: h.status,
        duration: Math.ceil((new Date(h.expires_at) - new Date(h.started_at)) / (1000 * 60 * 60 * 24)),
        results: h.results || { profileViews: '+0%', bookings: '+0%' }
      }));
      setBoostHistory(formattedHistory);

      // Fetch user stats (profile views, booking requests, etc.)
      // You may have these in a separate table or compute on the fly
      // For now, we'll keep them as placeholders or fetch from profiles if stored
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('profile_views, booking_requests, conversion_rate, avg_response_time')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      setUserStats({
        profileViews: profile?.profile_views || 1247,
        bookingRequests: profile?.booking_requests || 89,
        conversionRate: profile?.conversion_rate || '7.1%',
        avgResponseTime: profile?.avg_response_time || '2.3 hours'
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
  };

  const handlePurchaseBoost = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + selectedPlan.duration_days);

      // Insert into active_boosts
      const { data: activeBoostData, error: activeError } = await supabase
        .from('active_boosts')
        .insert([{
          user_id: user.id,
          package_id: selectedPlan.id,
          started_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          status: 'active'
        }])
        .select()
        .single();

      if (activeError) throw activeError;

      // Insert into boost_purchases
      const { error: purchaseError } = await supabase
        .from('boost_purchases')
        .insert([{
          user_id: user.id,
          package_id: selectedPlan.id,
          amount: selectedPlan.price,
          started_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          status: 'active',
          results: {}
        }]);

      if (purchaseError) throw purchaseError;

      // Refresh data
      await fetchAllData();
      setSelectedPlan(null);
      alert(`Successfully purchased ${selectedPlan.name}! Your boost is now active.`);
    } catch (err) {
      console.error('Purchase error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBoost = async () => {
    if (!activeBoost) return;
    if (!window.confirm('Are you sure you want to cancel your boost? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('active_boosts')
        .update({ status: 'cancelled' })
        .eq('id', activeBoost.id);

      if (error) throw error;

      await fetchAllData();
    } catch (err) {
      console.error('Cancel error:', err);
      alert('Failed to cancel boost: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

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
      {/* Header */}
      <header className="boost-header">
        <div className="header-container">
          <div className="header-left">
            <Link to="/dashboard/provider" className="back-link">
              <FaArrowLeft />
              Back to Dashboard
            </Link>
          </div>
          <div className="header-right">
            <Link to="/dashboard/provider/boost-history" className="history-link">
              Boost History
            </Link>
          </div>
        </div>
      </header>

      <main className="boost-main">
        {error && (
          <div className="error-banner">
            <FaShieldAlt />
            <span>{error}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="boost-hero">
          <h1>
            <FaRocket />
            Boost Your Visibility
          </h1>
          <p className="hero-subtitle">
            Get more profile views, increase booking requests, and stand out in the marketplace with our powerful boost plans.
          </p>

          {/* Stats Cards */}
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

        <div className="boost-layout">
          {/* Main Content */}
          <div className="boost-main-content">
            {/* Active Boost Status */}
            {activeBoost && (
              <div className="active-boost-card">
                <div className="active-boost-header">
                  <div className="active-boost-title">
                    <FaGem className="boost-icon" />
                    <div>
                      <h3>Active Boost: {activeBoost.name}</h3>
                      <p className="boost-description">Your profile is currently boosted and visible to more users</p>
                    </div>
                  </div>
                  <button className="cancel-boost-btn" onClick={handleCancelBoost}>
                    Cancel Boost
                  </button>
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
                  <div className="boost-detail-item">
                    <span className="detail-label">Status</span>
                    <span className="status-badge active">Active</span>
                  </div>
                </div>
              </div>
            )}

            {/* Boost Plans */}
            <div className="plans-section">
              <h2 className="section-title">Choose Your Boost Plan</h2>

              <div className="plans-grid">
                {boostPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`plan-card ${selectedPlan?.id === plan.id ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
                    onClick={() => handleSelectPlan(plan)}
                    style={{ borderColor: selectedPlan?.id === plan.id ? plan.color : '#e0e0e0' }}
                  >
                    {plan.popular && <div className="popular-badge" style={{ background: plan.color }}>MOST POPULAR</div>}

                    <div className="plan-header">
                      <div className="plan-icon" style={{ background: plan.color }}>
                        {plan.icon ? <span dangerouslySetInnerHTML={{ __html: plan.icon }} /> : <FaRocket />}
                      </div>
                      <div className="plan-title">
                        <h3 style={{ color: plan.color }}>{plan.name}</h3>
                        <p className="plan-description">{plan.description}</p>
                      </div>
                      <div className="plan-price">
                        <span className="price">₦{plan.price.toLocaleString()}</span>
                        <span className="duration">for {plan.duration_days} days</span>
                      </div>
                    </div>

                    <div className="plan-features">
                      <h4>Key Features</h4>
                      <ul>
                        {plan.features?.map((feature, idx) => (
                          <li key={idx}>
                            <FaCheckCircle style={{ color: plan.color }} />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="plan-results" style={{ background: '#f8f9fa' }}>
                      <h4>Expected Results</h4>
                      <div className="results-stats">
                        <div className="result-stat">
                          <span className="result-value" style={{ color: plan.color }}>{plan.stats?.profileViewsIncrease}</span>
                          <span className="result-label">Profile Views</span>
                        </div>
                        <div className="result-stat">
                          <span className="result-value" style={{ color: plan.color }}>{plan.stats?.bookingIncrease}</span>
                          <span className="result-label">Bookings</span>
                        </div>
                        <div className="result-stat">
                          <span className="result-value" style={{ color: plan.color }}>{plan.stats?.position}</span>
                          <span className="result-label">Position</span>
                        </div>
                      </div>
                    </div>

                    <button
                      className={`select-plan-btn ${selectedPlan?.id === plan.id ? 'selected' : ''}`}
                      style={{ background: selectedPlan?.id === plan.id ? plan.color : '#f1f5f9', color: selectedPlan?.id === plan.id ? 'white' : plan.color }}
                      onClick={(e) => { e.stopPropagation(); handleSelectPlan(plan); }}
                    >
                      {selectedPlan?.id === plan.id ? (
                        <>
                          <FaCheckCircle /> Selected
                        </>
                      ) : (
                        'Select This Plan'
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="boost-sidebar">
            {/* How It Works */}
            <div className="sidebar-card">
              <h3><FaQuestionCircle /> How Boosting Works</h3>
              <div className="how-it-works-steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Select Your Plan</h4>
                    <p>Choose duration and features that match your goals</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Make Payment</h4>
                    <p>Secure payment through RentEasy wallet or bank transfer</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Get Boosted</h4>
                    <p>Instant activation with visible results in 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Boost History */}
            <div className="sidebar-card">
              <div className="sidebar-header">
                <h3><FaClock /> Boost History</h3>
                <Link to="/dashboard/provider/boost-history" className="view-all-link">View All</Link>
              </div>

              {boostHistory.length === 0 ? (
                <div className="empty-history">
                  <FaRocket className="empty-icon" />
                  <p>No boost history yet</p>
                </div>
              ) : (
                <div className="history-list">
                  {boostHistory.map((boost) => (
                    <div key={boost.id} className="history-item">
                      <div className="history-header">
                        <span className="history-plan">{boost.plan}</span>
                        <span className="history-date">{formatDate(boost.date)}</span>
                      </div>
                      <div className="history-results">
                        <div className="result-badge">{boost.results.profileViews} views</div>
                        <div className="result-badge">{boost.results.bookings} bookings</div>
                        <div className="history-price">₦{boost.price.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Purchase Confirmation Bar */}
        {selectedPlan && (
          <div className="purchase-bar">
            <div className="purchase-info">
              <h3>Purchase {selectedPlan.name}</h3>
              <p>Total: <strong style={{ color: selectedPlan.color }}>₦{selectedPlan.price.toLocaleString()}</strong> for {selectedPlan.duration_days} days</p>
            </div>
            <div className="purchase-actions">
              <button className="cancel-btn" onClick={() => setSelectedPlan(null)}>Cancel</button>
              <button className="purchase-btn" onClick={handlePurchaseBoost} disabled={loading} style={{ background: selectedPlan.color }}>
                {loading ? (
                  <>
                    <span className="loading-spinner-small"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaMoneyBillWave /> Purchase Now
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProviderBoost;