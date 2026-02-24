// src/modules/providers/pages/ProviderSubscription.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import ProviderPageTemplate from '../templates/ProviderPageTemplate';
import {
  FaCrown, FaCheckCircle, FaTimesCircle, FaCreditCard,
  FaHistory, FaReceipt, FaDownload, FaCalendarAlt,
  FaUserCheck, FaBell, FaGift, FaShieldAlt,
  FaArrowUp, FaArrowDown, FaSync, FaExclamationTriangle
} from 'react-icons/fa';
import './ProviderSubscription.css';

const ProviderSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [billingHistory, setBillingHistory] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showBillingHistory, setShowBillingHistory] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch all plans
      const { data: plansData, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });
      if (plansError) throw plansError;
      setPlans(plansData || []);

      // Fetch user's subscription
      const { data: subData, error: subError } = await supabase
        .from('provider_subscriptions')
        .select('*, plan:plan_id(*)')
        .eq('provider_id', user.id)
        .maybeSingle();
      if (subError) throw subError;

      if (subData) {
        setSubscription(subData);
      } else {
        // Create default free subscription if none exists
        const freePlan = plansData?.find(p => p.name === 'Free');
        if (freePlan) {
          const { data: newSub, error: createError } = await supabase
            .from('provider_subscriptions')
            .insert([{
              provider_id: user.id,
              plan_id: freePlan.id,
              status: 'active',
              billing_cycle: 'monthly',
              auto_renew: true,
              next_billing_date: null,
              subscription_start: new Date().toISOString().split('T')[0],
              free_bookings_used: 0,
              free_bookings_limit: 10,
              features: freePlan.features
            }])
            .select('*, plan:plan_id(*)')
            .single();
          if (createError) throw createError;
          setSubscription(newSub);
        }
      }

      // Fetch billing history
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('billing_invoices')
        .select('*')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });
      if (invoicesError) throw invoicesError;
      setBillingHistory(invoicesData || []);

      // Fetch payment methods (from your existing table)
      const { data: methodsData, error: methodsError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
      if (methodsError) throw methodsError;
      setPaymentMethods(methodsData || []);
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (planId) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    setSelectedPlan(plan);
    setShowUpgradeModal(true);
  };

  const confirmUpgrade = async () => {
    if (!selectedPlan || !subscription) return;
    setUpgradeLoading(true);

    try {
      // Update subscription in DB
      const updates = {
        plan_id: selectedPlan.id,
        features: selectedPlan.features,
        // Reset free bookings if upgrading from free
        ...(subscription.plan?.name === 'Free' && { free_bookings_used: 0 }),
        next_billing_date: selectedPlan.price > 0 ? new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0] : null
      };

      const { error } = await supabase
        .from('provider_subscriptions')
        .update(updates)
        .eq('id', subscription.id);

      if (error) throw error;

      // Create invoice for upgrade (if paid plan)
      if (selectedPlan.price > 0) {
        await supabase
          .from('billing_invoices')
          .insert([{
            provider_id: user.id,
            subscription_id: subscription.id,
            description: `${selectedPlan.name} Plan - Upgrade`,
            amount: selectedPlan.price,
            status: 'paid',
            payment_method: 'Card ****1234' // placeholder
          }]);
      }

      // Reload data
      await loadData();
      setShowUpgradeModal(false);
      setSelectedPlan(null);
      alert(`Successfully upgraded to ${selectedPlan.name} plan!`);
    } catch (error) {
      console.error('Error upgrading plan:', error);
      alert('Failed to upgrade. Please try again.');
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose premium features immediately.')) return;

    try {
      const freePlan = plans.find(p => p.name === 'Free');
      if (!freePlan) return;

      const { error } = await supabase
        .from('provider_subscriptions')
        .update({
          plan_id: freePlan.id,
          status: 'cancelled',
          features: freePlan.features,
          next_billing_date: null
        })
        .eq('id', subscription.id);

      if (error) throw error;

      await loadData();
      alert('Subscription cancelled. You have been downgraded to the Free plan.');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription.');
    }
  };

  const handleToggleAutoRenew = async () => {
    if (!subscription) return;
    try {
      const { error } = await supabase
        .from('provider_subscriptions')
        .update({ auto_renew: !subscription.auto_renew })
        .eq('id', subscription.id);
      if (error) throw error;
      setSubscription({ ...subscription, auto_renew: !subscription.auto_renew });
    } catch (error) {
      console.error('Error toggling auto-renew:', error);
    }
  };

  const calculateSavings = (plan) => {
    if (plan.name === 'Professional') return 'Save 10% with annual billing';
    if (plan.name === 'Business') return 'Save 15% with annual billing';
    if (plan.name === 'Enterprise') return 'Save 20% with annual billing';
    return '';
  };

  const getPlanBenefits = (planId) => {
    const plan = plans.find(p => p.id === planId) || { name: 'Free' };
    switch(plan.name) {
      case 'Free':
        return { color: '#757575', icon: <FaCheckCircle />, tagline: 'Get started for free' };
      case 'Professional':
        return { color: '#2196f3', icon: <FaCrown />, tagline: 'Most popular choice' };
      case 'Business':
        return { color: '#9c27b0', icon: <FaUserCheck />, tagline: 'For growing businesses' };
      case 'Enterprise':
        return { color: '#4caf50', icon: <FaShieldAlt />, tagline: 'Enterprise-grade features' };
      default:
        return { color: '#757575', icon: <FaCheckCircle />, tagline: '' };
    }
  };

  if (loading) return <div className="loading">Loading subscription details...</div>;

  const currentPlan = subscription?.plan || plans.find(p => p.name === 'Free');
  const freeBookingsPercentage = subscription ? (subscription.free_bookings_used / subscription.free_bookings_limit) * 100 : 0;

  return (
    <ProviderPageTemplate
      title="Subscription & Billing"
      subtitle="Manage your subscription plan and billing preferences"
      actions={
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            className="btn-secondary"
            onClick={() => setShowBillingHistory(!showBillingHistory)}
          >
            <FaHistory style={{ marginRight: '0.5rem' }} />
            {showBillingHistory ? 'Hide History' : 'Billing History'}
          </button>
          <button 
            className="btn-secondary"
            onClick={() => setShowPaymentMethods(!showPaymentMethods)}
          >
            <FaCreditCard style={{ marginRight: '0.5rem' }} />
            Payment Methods
          </button>
        </div>
      }
    >
      {/* Current Plan Overview */}
      <div className="provider-card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">Current Plan</h3>
          <div className={`plan-badge ${subscription?.plan?.name?.toLowerCase() || 'free'}`}>
            {getPlanBenefits(subscription?.plan?.id).icon}
            <span>{currentPlan.name} Plan</span>
          </div>
        </div>

        <div className="current-plan-overview">
          <div className="plan-summary">
            <div className="plan-price">
              <div className="price-amount">
                ₦{currentPlan.price.toLocaleString()}
                <span className="price-period">/{currentPlan.billing_cycle}</span>
              </div>
              <div className="price-description">{currentPlan.description}</div>
            </div>

            <div className="plan-status">
              <div className="status-item">
                <strong>Status:</strong>
                <span className={`status-badge ${subscription?.status || 'active'}`}>
                  {subscription?.status ? subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1) : 'Active'}
                </span>
              </div>
              {subscription?.next_billing_date && (
                <div className="status-item">
                  <strong>Next Billing:</strong>
                  <span>{subscription.next_billing_date}</span>
                </div>
              )}
              <div className="status-item">
                <strong>Auto Renew:</strong>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={subscription?.auto_renew || false}
                    onChange={handleToggleAutoRenew}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Free Plan Usage */}
          {subscription?.plan?.name === 'Free' && (
            <div className="free-plan-usage">
              <div className="usage-header">
                <h4 style={{ margin: 0 }}>Free Bookings Usage</h4>
                <span>{subscription.free_bookings_used}/{subscription.free_bookings_limit} bookings used</span>
              </div>
              <div className="usage-progress">
                <div 
                  className="progress-bar"
                  style={{ 
                    background: `linear-gradient(to right, #4caf50 ${freeBookingsPercentage}%, #e0e0e0 ${freeBookingsPercentage}%)`
                  }}
                />
                <div className="progress-labels">
                  <span>0</span>
                  <span>{subscription.free_bookings_limit} bookings</span>
                </div>
              </div>
              <div className="usage-warning">
                <FaExclamationTriangle style={{ color: '#ff9800' }} />
                <div>
                  <strong>{subscription.free_bookings_limit - subscription.free_bookings_used} free bookings remaining</strong>
                  <p style={{ margin: '0.3rem 0 0', color: '#666' }}>Upgrade to continue accepting bookings without limits</p>
                </div>
              </div>
            </div>
          )}

          {/* Current Plan Features */}
          <div className="current-features">
            <h4 style={{ marginBottom: '1rem' }}>Current Plan Features</h4>
            <div className="features-grid">
              {currentPlan.features?.map((feature, idx) => (
                <div key={idx} className="feature-item">
                  <div className="feature-icon"><FaCheckCircle style={{ color: '#4caf50' }} /></div>
                  <div className="feature-info">
                    <div className="feature-name">{feature}</div>
                    <div className="feature-status">Included</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="plan-actions">
            {subscription?.plan?.name === 'Free' ? (
              <button 
                className="btn-primary"
                onClick={() => handleUpgrade(plans.find(p => p.name === 'Professional')?.id)}
              >
                <FaArrowUp style={{ marginRight: '0.5rem' }} />
                Upgrade to Professional
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button 
                  className="btn-primary"
                  onClick={() => setShowUpgradeModal(true)}
                >
                  <FaSync style={{ marginRight: '0.5rem' }} />
                  Change Plan
                </button>
                <button 
                  className="btn-secondary"
                  onClick={handleCancelSubscription}
                  style={{ background: '#f44336', color: 'white' }}
                >
                  <FaTimesCircle style={{ marginRight: '0.5rem' }} />
                  Cancel Subscription
                </button>
              </div>
            )}
            
            {subscription?.plan?.name !== 'Free' && (
              <div className="renewal-notice">
                <FaBell style={{ color: '#ff9800' }} />
                <div>
                  <strong>Auto-renewal {subscription.auto_renew ? 'enabled' : 'disabled'}</strong>
                  <p style={{ margin: '0.3rem 0 0', color: '#666' }}>
                    Next billing: {subscription.next_billing_date} • ₦{currentPlan.price.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="provider-card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">Available Plans</h3>
          <p className="card-subtitle">Choose the perfect plan for your business needs</p>
        </div>

        <div className="plans-grid">
          {plans.map(plan => {
            const benefits = getPlanBenefits(plan.id);
            const isCurrentPlan = subscription?.plan?.id === plan.id;
            
            return (
              <div 
                key={plan.id} 
                className={`plan-card ${plan.popular ? 'popular' : ''} ${isCurrentPlan ? 'current' : ''}`}
                style={{ borderColor: benefits.color }}
              >
                {plan.popular && (
                  <div className="popular-badge" style={{ background: benefits.color }}>
                    <FaCrown /> Most Popular
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="current-badge" style={{ background: benefits.color }}>
                    <FaCheckCircle /> Current Plan
                  </div>
                )}

                <div className="plan-header">
                  <div className="plan-icon" style={{ color: benefits.color }}>
                    {benefits.icon}
                  </div>
                  <div>
                    <h3 className="plan-name">{plan.name}</h3>
                    <p className="plan-tagline" style={{ color: benefits.color }}>
                      {benefits.tagline}
                    </p>
                  </div>
                </div>

                <div className="plan-price-section">
                  <div className="price">
                    <span className="currency">₦</span>
                    <span className="amount">{plan.price.toLocaleString()}</span>
                    <span className="period">/{plan.billing_cycle}</span>
                  </div>
                  {calculateSavings(plan) && (
                    <div className="savings-badge">
                      <FaGift /> {calculateSavings(plan)}
                    </div>
                  )}
                </div>

                <div className="plan-description">
                  <p>{plan.description}</p>
                  <p className="recommended-for">
                    <strong>Recommended for:</strong> {plan.recommended_for}
                  </p>
                </div>

                <div className="plan-features">
                  <h4 style={{ marginBottom: '1rem' }}>Features</h4>
                  <ul>
                    {plan.features?.map((feature, index) => (
                      <li key={index}>
                        <FaCheckCircle style={{ color: '#4caf50' }} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.limitations && plan.limitations.length > 0 && (
                    <>
                      <h4 style={{ margin: '1.5rem 0 1rem 0', color: '#666' }}>Limitations</h4>
                      <ul className="limitations">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index}>
                            <FaTimesCircle style={{ color: '#f44336' }} />
                            <span>{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                <div className="plan-actions">
                  {isCurrentPlan ? (
                    <button className="btn-secondary" disabled style={{ width: '100%' }}>
                      <FaCheckCircle style={{ marginRight: '0.5rem' }} />
                      Current Plan
                    </button>
                  ) : plan.name === 'Free' ? (
                    <button 
                      className="btn-secondary"
                      onClick={() => handleUpgrade(plan.id)}
                      style={{ width: '100%' }}
                      disabled={subscription?.plan?.name === 'Free'}
                    >
                      {subscription?.plan?.name === 'Free' ? 'Current Plan' : 'Downgrade to Free'}
                    </button>
                  ) : (
                    <button 
                      className="btn-primary"
                      onClick={() => handleUpgrade(plan.id)}
                      style={{ 
                        width: '100%',
                        background: benefits.color,
                        borderColor: benefits.color
                      }}
                    >
                      {subscription?.plan?.name === 'Free' ? 'Upgrade Now' : 
                       subscription?.plan?.price > plan.price ? 'Downgrade' : 'Upgrade'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing History */}
      {showBillingHistory && (
        <div className="provider-card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">Billing History</h3>
            <button className="btn-secondary" onClick={() => alert('Export all invoices')}>
              <FaDownload style={{ marginRight: '0.5rem' }} />
              Export All
            </button>
          </div>

          <div className="billing-table">
            <div className="table-header">
              <div className="table-row">
                <div className="table-cell">Date</div>
                <div className="table-cell">Description</div>
                <div className="table-cell">Amount</div>
                <div className="table-cell">Status</div>
                <div className="table-cell">Payment Method</div>
                <div className="table-cell">Actions</div>
              </div>
            </div>

            <div className="table-body">
              {billingHistory.map(invoice => (
                <div key={invoice.id} className="table-row">
                  <div className="table-cell">
                    <div className="invoice-date">
                      <FaCalendarAlt />
                      <span>{new Date(invoice.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="table-cell"><strong>{invoice.description}</strong></div>
                  <div className="table-cell">
                    <div className={`invoice-amount ${invoice.amount === 0 ? 'free' : ''}`}>
                      {invoice.amount === 0 ? 'Free' : `₦${invoice.amount.toLocaleString()}`}
                    </div>
                  </div>
                  <div className="table-cell">
                    <span className={`status-badge ${invoice.status}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </div>
                  <div className="table-cell">
                    <div className="payment-method">{invoice.payment_method || 'N/A'}</div>
                  </div>
                  <div className="table-cell">
                    <div className="invoice-actions">
                      {invoice.invoice_url && (
                        <button className="btn-secondary" onClick={() => window.open(invoice.invoice_url, '_blank')}>
                          <FaReceipt style={{ marginRight: '0.3rem' }} />
                          Invoice
                        </button>
                      )}
                      <button className="btn-secondary" onClick={() => alert(`Download invoice ${invoice.id}`)}>
                        <FaDownload />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods */}
      {showPaymentMethods && (
        <div className="provider-card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">Payment Methods</h3>
            <button className="btn-primary" onClick={() => alert('Add payment method')}>
              <FaCreditCard style={{ marginRight: '0.5rem' }} />
              Add Payment Method
            </button>
          </div>

          <div className="payment-methods-list">
            {paymentMethods.map(method => (
              <div key={method.id} className="payment-method-card">
                <div className="method-info">
                  <div className="method-icon">
                    <FaCreditCard style={{ color: method.type === 'card' ? '#2196f3' : '#4caf50', fontSize: '2rem' }} />
                  </div>
                  <div className="method-details">
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>
                      {method.type === 'card' ? `${method.name} Card` : `${method.name} Account`}
                    </h4>
                    <div className="method-meta">
                      <span className="method-number">{method.account_number}</span>
                      {method.expiry && <span className="method-expiry">Expires {method.expiry}</span>}
                    </div>
                  </div>
                </div>
                <div className="method-actions">
                  {method.is_default ? (
                    <span className="default-badge"><FaCheckCircle /> Default</span>
                  ) : (
                    <button className="btn-secondary" style={{ fontSize: '0.9rem' }}>Set as Default</button>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-secondary">Edit</button>
                    <button className="btn-secondary" style={{ background: '#f44336', color: 'white' }}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="provider-card">
        <div className="card-header">
          <h3 className="card-title">Frequently Asked Questions</h3>
        </div>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>How do I upgrade my plan?</h4>
            <p>Click the "Upgrade" button on any plan card. You'll be prompted to confirm and enter payment details if needed.</p>
          </div>
          <div className="faq-item">
            <h4>What happens when I cancel?</h4>
            <p>You immediately lose premium features and revert to the Free plan. You can continue using free features.</p>
          </div>
          <div className="faq-item">
            <h4>Can I change plans anytime?</h4>
            <p>Yes! You can upgrade or downgrade at any time. Changes take effect immediately.</p>
          </div>
          <div className="faq-item">
            <h4>How are boost credits used?</h4>
            <p>Boost credits push your profile higher in search results. Each boost lasts 7 days and consumes 1 credit.</p>
          </div>
          <div className="faq-item">
            <h4>What payment methods are accepted?</h4>
            <p>We accept debit/credit cards and bank transfers. All payments are secure and encrypted.</p>
          </div>
          <div className="faq-item">
            <h4>Do you offer annual discounts?</h4>
            <p>Yes! Pay annually to save 10-20% depending on your plan. The discount is applied at checkout.</p>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedPlan && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Upgrade to {selectedPlan.name} Plan</h3>
              <button className="modal-close" onClick={() => setShowUpgradeModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="upgrade-summary">
                <div className="current-plan"><strong>Current:</strong> {currentPlan.name} Plan (₦{currentPlan.price.toLocaleString()}/month)</div>
                <div className="new-plan"><strong>New:</strong> {selectedPlan.name} Plan (₦{selectedPlan.price.toLocaleString()}/month)</div>
                <div className="price-difference">
                  <strong>Price Change:</strong>
                  <span className={`difference ${selectedPlan.price > currentPlan.price ? 'increase' : 'decrease'}`}>
                    {selectedPlan.price > currentPlan.price ? '+' : ''}
                    ₦{(selectedPlan.price - currentPlan.price).toLocaleString()}/month
                  </span>
                </div>
              </div>

              <div className="feature-comparison">
                <h4 style={{ marginBottom: '1rem' }}>What You Get:</h4>
                <div className="features-list">
                  {selectedPlan.features.map((feature, index) => {
                    const hasFeature = currentPlan.features?.includes(feature);
                    return (
                      <div key={index} className="feature-comparison-item">
                        <div className="feature-name">{feature}</div>
                        <div className="feature-status">
                          {hasFeature ? (
                            <span className="already-have">Already have</span>
                          ) : (
                            <span className="new-feature"><FaArrowUp style={{ marginRight: '0.3rem' }} />New</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="payment-section">
                <h4 style={{ marginBottom: '1rem' }}>Payment Details</h4>
                <div className="payment-summary">
                  <div className="summary-item"><span>Plan Price</span><span>₦{selectedPlan.price.toLocaleString()}</span></div>
                  <div className="summary-item"><span>Billing Cycle</span><span>Monthly</span></div>
                  <div className="summary-item total"><span>Total Due Now</span><span>₦{selectedPlan.price.toLocaleString()}</span></div>
                </div>
                <div className="payment-method-select">
                  <label className="form-label">Payment Method</label>
                  <select className="form-control">
                    <option>Card ****1234 (Default)</option>
                    <option>Add New Payment Method</option>
                  </select>
                </div>
                <div className="terms-agreement">
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <input type="checkbox" defaultChecked />
                    <span>I agree to the <a href="#" style={{ color: '#1a237e' }}>Terms of Service</a> and authorize RentEasy to charge my payment method ₦{selectedPlan.price.toLocaleString()} monthly until I cancel.</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowUpgradeModal(false)} disabled={upgradeLoading}>Cancel</button>
              <button className="btn-primary" onClick={confirmUpgrade} disabled={upgradeLoading} style={{ minWidth: '150px' }}>
                {upgradeLoading ? <><FaSync className="spin" style={{ marginRight: '0.5rem' }} />Processing...</> : 'Upgrade Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ProviderPageTemplate>
  );
};

export default ProviderSubscription;