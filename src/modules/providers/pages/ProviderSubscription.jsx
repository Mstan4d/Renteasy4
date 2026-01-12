import React, { useState, useEffect } from 'react';
import ProviderPageTemplate from '../templates/ProviderPageTemplate';
import {
  FaCrown, FaCheckCircle, FaTimesCircle, FaCreditCard,
  FaHistory, FaReceipt, FaDownload, FaCalendarAlt,
  FaUserCheck, FaBell, FaGift, FaShieldAlt,
  FaArrowUp, FaArrowDown, FaSync, FaExclamationTriangle
} from 'react-icons/fa';

const ProviderSubscription = () => {
  const [subscription, setSubscription] = useState({
    plan: 'free',
    status: 'active',
    billingCycle: 'monthly',
    price: 0,
    nextBillingDate: '2024-02-10',
    autoRenew: true,
    freeBookingsUsed: 7,
    freeBookingsLimit: 10,
    subscriptionStartDate: '2024-01-01',
    subscriptionEndDate: null,
    features: {
      marketplaceVisibility: true,
      unlimitedBookings: false,
      prioritySupport: false,
      verifiedBadge: false,
      advancedAnalytics: false,
      boostCredits: 0,
      customDomain: false,
      apiAccess: false
    }
  });

  const [plans, setPlans] = useState([
    {
      id: 'free',
      name: 'Free',
      price: 0,
      billingCycle: 'monthly',
      description: 'Perfect for getting started',
      features: [
        'Up to 10 bookings/month',
        'Basic marketplace visibility',
        'Standard support',
        'Basic analytics',
        'Email notifications'
      ],
      limitations: [
        'No verified badge',
        'Limited booking capacity',
        'Standard marketplace ranking',
        'No boost credits',
        'No custom domain'
      ],
      popular: false,
      recommendedFor: 'New providers starting out'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 3000,
      billingCycle: 'monthly',
      description: 'Best for growing your business',
      features: [
        'Unlimited bookings',
        'Priority marketplace visibility',
        'Verified provider badge',
        'Priority support',
        'Advanced analytics',
        '5 boost credits/month',
        'Custom service pages',
        'Basic API access'
      ],
      limitations: [
        'No custom domain',
        'Limited API calls',
        'Standard commission rates'
      ],
      popular: true,
      recommendedFor: 'Active providers with regular bookings'
    },
    {
      id: 'business',
      name: 'Business',
      price: 8000,
      billingCycle: 'monthly',
      description: 'For established service businesses',
      features: [
        'Everything in Professional',
        'Premium marketplace placement',
        'Custom domain',
        'Dedicated account manager',
        'Full API access',
        '20 boost credits/month',
        'Reduced commission rates',
        'White-label reports',
        'Team accounts (up to 3)'
      ],
      limitations: [
        'Higher monthly cost',
        'Annual commitment for best rates'
      ],
      popular: false,
      recommendedFor: 'Established businesses with teams'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 20000,
      billingCycle: 'monthly',
      description: 'Custom solutions for large providers',
      features: [
        'Everything in Business',
        'Fully customizable',
        'Unlimited team accounts',
        'Custom commission rates',
        'Dedicated support line',
        '50 boost credits/month',
        'Advanced security features',
        'Custom integrations',
        'SLA guarantees'
      ],
      limitations: [
        'Custom pricing',
        'Minimum 12-month contract'
      ],
      popular: false,
      recommendedFor: 'Large service companies & franchises'
    }
  ]);

  const [billingHistory, setBillingHistory] = useState([
    {
      id: 1,
      date: '2024-01-10',
      description: 'Professional Plan - Monthly',
      amount: 3000,
      status: 'paid',
      invoiceUrl: '#',
      paymentMethod: 'Card ****1234'
    },
    {
      id: 2,
      date: '2023-12-10',
      description: 'Professional Plan - Monthly',
      amount: 3000,
      status: 'paid',
      invoiceUrl: '#',
      paymentMethod: 'Card ****1234'
    },
    {
      id: 3,
      date: '2023-11-10',
      description: 'Free to Professional Upgrade',
      amount: 3000,
      status: 'paid',
      invoiceUrl: '#',
      paymentMethod: 'Card ****1234'
    },
    {
      id: 4,
      date: '2023-10-01',
      description: 'Free Plan',
      amount: 0,
      status: 'free',
      invoiceUrl: null,
      paymentMethod: 'N/A'
    }
  ]);

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'card',
      lastFour: '1234',
      brand: 'Visa',
      expiry: '12/25',
      isDefault: true
    },
    {
      id: 2,
      type: 'bank',
      bankName: 'GTBank',
      accountNumber: '******7890',
      isDefault: false
    }
  ]);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showBillingHistory, setShowBillingHistory] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  const currentPlan = plans.find(p => p.id === subscription.plan);

  useEffect(() => {
    // Calculate free bookings used
    const updateFreeBookings = () => {
      if (subscription.plan === 'free') {
        // Simulate some bookings
        const used = Math.min(subscription.freeBookingsUsed + 1, subscription.freeBookingsLimit);
        if (used !== subscription.freeBookingsUsed) {
          setSubscription(prev => ({
            ...prev,
            freeBookingsUsed: used
          }));
        }
      }
    };

    // Update every minute for demo
    const interval = setInterval(updateFreeBookings, 60000);
    return () => clearInterval(interval);
  }, [subscription.plan, subscription.freeBookingsUsed, subscription.freeBookingsLimit]);

  const handleUpgrade = (planId) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    setSelectedPlan(plan);
    setShowUpgradeModal(true);
  };

  const confirmUpgrade = () => {
    if (!selectedPlan) return;

    setUpgradeLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubscription({
        ...subscription,
        plan: selectedPlan.id,
        price: selectedPlan.price,
        features: {
          marketplaceVisibility: true,
          unlimitedBookings: selectedPlan.id !== 'free',
          prioritySupport: selectedPlan.id === 'professional' || selectedPlan.id === 'business' || selectedPlan.id === 'enterprise',
          verifiedBadge: selectedPlan.id === 'professional' || selectedPlan.id === 'business' || selectedPlan.id === 'enterprise',
          advancedAnalytics: selectedPlan.id === 'professional' || selectedPlan.id === 'business' || selectedPlan.id === 'enterprise',
          boostCredits: selectedPlan.id === 'professional' ? 5 : selectedPlan.id === 'business' ? 20 : selectedPlan.id === 'enterprise' ? 50 : 0,
          customDomain: selectedPlan.id === 'business' || selectedPlan.id === 'enterprise',
          apiAccess: selectedPlan.id === 'professional' || selectedPlan.id === 'business' || selectedPlan.id === 'enterprise'
        },
        nextBillingDate: '2024-02-10'
      });

      // Add to billing history
      const newInvoice = {
        id: billingHistory.length + 1,
        date: new Date().toISOString().split('T')[0],
        description: `${selectedPlan.name} Plan - Upgrade`,
        amount: selectedPlan.price,
        status: 'paid',
        invoiceUrl: '#',
        paymentMethod: 'Card ****1234'
      };

      setBillingHistory([newInvoice, ...billingHistory]);
      
      setUpgradeLoading(false);
      setShowUpgradeModal(false);
      setSelectedPlan(null);
      
      alert(`Successfully upgraded to ${selectedPlan.name} plan!`);
    }, 1500);
  };

  const handleCancelSubscription = () => {
    if (window.confirm('Are you sure you want to cancel your subscription? You will lose premium features immediately.')) {
      setSubscription({
        ...subscription,
        plan: 'free',
        status: 'cancelled',
        price: 0,
        features: {
          marketplaceVisibility: true,
          unlimitedBookings: false,
          prioritySupport: false,
          verifiedBadge: false,
          advancedAnalytics: false,
          boostCredits: 0,
          customDomain: false,
          apiAccess: false
        }
      });
      
      alert('Subscription cancelled. You have been downgraded to the Free plan.');
    }
  };

  const handleToggleAutoRenew = () => {
    setSubscription({
      ...subscription,
      autoRenew: !subscription.autoRenew
    });
  };

  const calculateSavings = (plan) => {
    if (plan.id === 'professional') return 'Save 10% with annual billing';
    if (plan.id === 'business') return 'Save 15% with annual billing';
    if (plan.id === 'enterprise') return 'Save 20% with annual billing';
    return '';
  };

  const getPlanBenefits = (planId) => {
    switch(planId) {
      case 'free':
        return {
          color: '#757575',
          icon: <FaCheckCircle />,
          tagline: 'Get started for free'
        };
      case 'professional':
        return {
          color: '#2196f3',
          icon: <FaCrown />,
          tagline: 'Most popular choice'
        };
      case 'business':
        return {
          color: '#9c27b0',
          icon: <FaUserCheck />,
          tagline: 'For growing businesses'
        };
      case 'enterprise':
        return {
          color: '#4caf50',
          icon: <FaShieldAlt />,
          tagline: 'Enterprise-grade features'
        };
      default:
        return {
          color: '#757575',
          icon: <FaCheckCircle />,
          tagline: ''
        };
    }
  };

  const freeBookingsPercentage = (subscription.freeBookingsUsed / subscription.freeBookingsLimit) * 100;

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
          <div className={`plan-badge ${subscription.plan}`}>
            {getPlanBenefits(subscription.plan).icon}
            <span>{currentPlan.name} Plan</span>
          </div>
        </div>

        <div className="current-plan-overview">
          <div className="plan-summary">
            <div className="plan-price">
              <div className="price-amount">
                ₦{currentPlan.price.toLocaleString()}
                <span className="price-period">/{currentPlan.billingCycle}</span>
              </div>
              <div className="price-description">
                {currentPlan.description}
              </div>
            </div>

            <div className="plan-status">
              <div className="status-item">
                <strong>Status:</strong>
                <span className={`status-badge ${subscription.status}`}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </span>
              </div>
              <div className="status-item">
                <strong>Next Billing:</strong>
                <span>{subscription.nextBillingDate}</span>
              </div>
              <div className="status-item">
                <strong>Auto Renew:</strong>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={subscription.autoRenew}
                    onChange={handleToggleAutoRenew}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Free Plan Usage */}
          {subscription.plan === 'free' && (
            <div className="free-plan-usage">
              <div className="usage-header">
                <h4 style={{ margin: 0 }}>Free Bookings Usage</h4>
                <span>{subscription.freeBookingsUsed}/{subscription.freeBookingsLimit} bookings used</span>
              </div>
              
              <div className="usage-progress">
                <div 
                  className="progress-bar"
                  style={{ 
                    background: `linear-gradient(to right, 
                      #4caf50 ${freeBookingsPercentage}%, 
                      #e0e0e0 ${freeBookingsPercentage}%)`
                  }}
                />
                <div className="progress-labels">
                  <span>0</span>
                  <span>{subscription.freeBookingsLimit} bookings</span>
                </div>
              </div>
              
              <div className="usage-warning">
                <FaExclamationTriangle style={{ color: '#ff9800' }} />
                <div>
                  <strong>{subscription.freeBookingsLimit - subscription.freeBookingsUsed} free bookings remaining</strong>
                  <p style={{ margin: '0.3rem 0 0', color: '#666' }}>
                    Upgrade to continue accepting bookings without limits
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Current Plan Features */}
          <div className="current-features">
            <h4 style={{ marginBottom: '1rem' }}>Current Plan Features</h4>
            <div className="features-grid">
              {Object.entries(subscription.features).map(([key, value]) => (
                <div key={key} className="feature-item">
                  <div className="feature-icon">
                    {value ? <FaCheckCircle style={{ color: '#4caf50' }} /> : <FaTimesCircle style={{ color: '#f44336' }} />}
                  </div>
                  <div className="feature-info">
                    <div className="feature-name">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </div>
                    <div className="feature-status">
                      {value ? 'Included' : 'Not included'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="plan-actions">
            {subscription.plan === 'free' ? (
              <button 
                className="btn-primary"
                onClick={() => handleUpgrade('professional')}
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
                  style={{ background: subscription.status === 'cancelled' ? '#4caf50' : '#f44336', color: 'white' }}
                >
                  {subscription.status === 'cancelled' ? (
                    <>
                      <FaCheckCircle style={{ marginRight: '0.5rem' }} />
                      Cancelled
                    </>
                  ) : (
                    <>
                      <FaTimesCircle style={{ marginRight: '0.5rem' }} />
                      Cancel Subscription
                    </>
                  )}
                </button>
              </div>
            )}
            
            {subscription.plan !== 'free' && (
              <div className="renewal-notice">
                <FaBell style={{ color: '#ff9800' }} />
                <div>
                  <strong>Auto-renewal {subscription.autoRenew ? 'enabled' : 'disabled'}</strong>
                  <p style={{ margin: '0.3rem 0 0', color: '#666' }}>
                    Next billing: {subscription.nextBillingDate} • ₦{currentPlan.price.toLocaleString()}
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
            const isCurrentPlan = plan.id === subscription.plan;
            
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
                    <span className="period">/{plan.billingCycle}</span>
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
                    <strong>Recommended for:</strong> {plan.recommendedFor}
                  </p>
                </div>

                <div className="plan-features">
                  <h4 style={{ marginBottom: '1rem' }}>Features</h4>
                  <ul>
                    {plan.features.map((feature, index) => (
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
                  ) : plan.id === 'free' ? (
                    <button 
                      className="btn-secondary"
                      onClick={() => handleUpgrade('free')}
                      style={{ width: '100%' }}
                      disabled={subscription.plan === 'free'}
                    >
                      {subscription.plan === 'free' ? 'Current Plan' : 'Downgrade to Free'}
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
                      {subscription.plan === 'free' ? 'Upgrade Now' : 
                       subscription.price > plan.price ? 'Downgrade' : 'Upgrade'}
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
            <button 
              className="btn-secondary"
              onClick={() => alert('Export all invoices')}
            >
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
                      <span>{invoice.date}</span>
                    </div>
                  </div>
                  
                  <div className="table-cell">
                    <strong>{invoice.description}</strong>
                  </div>
                  
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
                    <div className="payment-method">
                      {invoice.paymentMethod}
                    </div>
                  </div>
                  
                  <div className="table-cell">
                    <div className="invoice-actions">
                      {invoice.invoiceUrl && (
                        <button 
                          className="btn-secondary"
                          onClick={() => window.open(invoice.invoiceUrl, '_blank')}
                        >
                          <FaReceipt style={{ marginRight: '0.3rem' }} />
                          Invoice
                        </button>
                      )}
                      <button 
                        className="btn-secondary"
                        onClick={() => alert(`Download invoice ${invoice.id}`)}
                      >
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
            <button className="btn-primary">
              <FaCreditCard style={{ marginRight: '0.5rem' }} />
              Add Payment Method
            </button>
          </div>

          <div className="payment-methods-list">
            {paymentMethods.map(method => (
              <div key={method.id} className="payment-method-card">
                <div className="method-info">
                  <div className="method-icon">
                    {method.type === 'card' ? (
                      <FaCreditCard style={{ color: '#2196f3', fontSize: '2rem' }} />
                    ) : (
                      <FaCreditCard style={{ color: '#4caf50', fontSize: '2rem' }} />
                    )}
                  </div>
                  
                  <div className="method-details">
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>
                      {method.type === 'card' ? `${method.brand} Card` : `${method.bankName} Account`}
                    </h4>
                    <div className="method-meta">
                      <span className="method-number">
                        {method.type === 'card' ? `**** ${method.lastFour}` : method.accountNumber}
                      </span>
                      {method.type === 'card' && (
                        <span className="method-expiry">Expires {method.expiry}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="method-actions">
                  {method.isDefault ? (
                    <span className="default-badge">
                      <FaCheckCircle /> Default
                    </span>
                  ) : (
                    <button className="btn-secondary" style={{ fontSize: '0.9rem' }}>
                      Set as Default
                    </button>
                  )}
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-secondary">
                      Edit
                    </button>
                    <button 
                      className="btn-secondary"
                      style={{ background: '#f44336', color: 'white' }}
                      onClick={() => {
                        if (window.confirm('Remove this payment method?')) {
                          setPaymentMethods(paymentMethods.filter(m => m.id !== method.id));
                        }
                      }}
                    >
                      Remove
                    </button>
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
                <div className="current-plan">
                  <strong>Current:</strong> {currentPlan.name} Plan (₦{currentPlan.price.toLocaleString()}/month)
                </div>
                
                <div className="new-plan">
                  <strong>New:</strong> {selectedPlan.name} Plan (₦{selectedPlan.price.toLocaleString()}/month)
                </div>
                
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
                    const hasFeature = currentPlan.features.includes(feature) || 
                                     (subscription.features[feature.toLowerCase().replace(/ /g, '_')]);
                    return (
                      <div key={index} className="feature-comparison-item">
                        <div className="feature-name">{feature}</div>
                        <div className="feature-status">
                          {hasFeature ? (
                            <span className="already-have">Already have</span>
                          ) : (
                            <span className="new-feature">
                              <FaArrowUp style={{ marginRight: '0.3rem' }} />
                              New
                            </span>
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
                  <div className="summary-item">
                    <span>Plan Price</span>
                    <span>₦{selectedPlan.price.toLocaleString()}</span>
                  </div>
                  <div className="summary-item">
                    <span>Billing Cycle</span>
                    <span>Monthly</span>
                  </div>
                  <div className="summary-item total">
                    <span>Total Due Now</span>
                    <span>₦{selectedPlan.price.toLocaleString()}</span>
                  </div>
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
                    <span>
                      I agree to the <a href="#" style={{ color: '#1a237e' }}>Terms of Service</a> and authorize RentEasy to charge my payment method ₦{selectedPlan.price.toLocaleString()} monthly until I cancel.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowUpgradeModal(false)}
                disabled={upgradeLoading}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={confirmUpgrade}
                disabled={upgradeLoading}
                style={{ minWidth: '150px' }}
              >
                {upgradeLoading ? (
                  <>
                    <FaSync className="spin" style={{ marginRight: '0.5rem' }} />
                    Processing...
                  </>
                ) : (
                  `Upgrade Now`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .plan-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
        }
        
        .plan-badge.free {
          background: #f5f5f5;
          color: #757575;
        }
        
        .plan-badge.professional {
          background: #e3f2fd;
          color: #1565c0;
        }
        
        .plan-badge.business {
          background: #f3e5f5;
          color: #7b1fa2;
        }
        
        .plan-badge.enterprise {
          background: #e8f5e9;
          color: #2e7d32;
        }
        
        .current-plan-overview {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .plan-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 2rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
        }
        
        .plan-price {
          display: flex;
          flex-direction: column;
        }
        
        .price-amount {
          font-size: 3rem;
          font-weight: 700;
          color: #1a237e;
          line-height: 1;
        }
        
        .price-period {
          font-size: 1rem;
          color: #666;
          font-weight: 500;
        }
        
        .price-description {
          color: #666;
          margin-top: 0.5rem;
        }
        
        .plan-status {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }
        
        .status-badge {
          padding: 0.3rem 0.8rem;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
        }
        
        .status-badge.active {
          background: #e8f5e9;
          color: #2e7d32;
        }
        
        .status-badge.paid {
          background: #e8f5e9;
          color: #2e7d32;
        }
        
        .status-badge.free {
          background: #f5f5f5;
          color: #757575;
        }
        
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }
        
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 34px;
        }
        
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        
        input:checked + .toggle-slider {
          background-color: #4caf50;
        }
        
        input:checked + .toggle-slider:before {
          transform: translateX(26px);
        }
        
        .free-plan-usage {
          padding: 1.5rem;
          background: #fff8e1;
          border-radius: 12px;
          border-left: 4px solid #ff9800;
        }
        
        .usage-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .usage-progress {
          margin: 1.5rem 0;
        }
        
        .usage-progress .progress-bar {
          height: 10px;
          border-radius: 5px;
          margin-bottom: 0.5rem;
        }
        
        .progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: #666;
        }
        
        .usage-warning {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #ff9800;
        }
        
        .current-features {
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .feature-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }
        
        .feature-icon {
          font-size: 1.2rem;
        }
        
        .feature-info {
          flex: 1;
        }
        
        .feature-name {
          font-weight: 600;
          margin-bottom: 0.3rem;
        }
        
        .feature-status {
          font-size: 0.8rem;
          color: #666;
        }
        
        .plan-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
        }
        
        .renewal-notice {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: #fff3e0;
          border-radius: 8px;
          border-left: 4px solid #ff9800;
        }
        
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 1.5rem;
        }
        
        .plan-card {
          padding: 2rem;
          border: 2px solid #e0e0e0;
          border-radius: 16px;
          position: relative;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
        }
        
        .plan-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        
        .plan-card.popular {
          border-width: 3px;
          transform: scale(1.02);
        }
        
        .plan-card.current {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }
        
        .popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          padding: 0.5rem 1.5rem;
          border-radius: 20px;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        
        .current-badge {
          position: absolute;
          top: -12px;
          right: 1rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          color: white;
          font-weight: 600;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .plan-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .plan-icon {
          font-size: 2rem;
        }
        
        .plan-name {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
        }
        
        .plan-tagline {
          margin: 0.3rem 0 0;
          font-weight: 600;
        }
        
        .plan-price-section {
          margin-bottom: 1.5rem;
        }
        
        .price {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a237e;
          line-height: 1;
        }
        
        .currency {
          font-size: 1.5rem;
          vertical-align: top;
        }
        
        .amount {
          font-size: 2.5rem;
        }
        
        .period {
          font-size: 1rem;
          color: #666;
          font-weight: 500;
        }
        
        .savings-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #e8f5e9;
          color: #2e7d32;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          margin-top: 0.5rem;
        }
        
        .plan-description {
          margin-bottom: 1.5rem;
          color: #666;
        }
        
        .recommended-for {
          margin: 1rem 0 0;
          padding: 0.8rem;
          background: #f8f9fa;
          border-radius: 8px;
          font-size: 0.9rem;
        }
        
        .plan-features {
          flex: 1;
          margin-bottom: 1.5rem;
        }
        
        .plan-features ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .plan-features li {
          display: flex;
          align-items: flex-start;
          gap: 0.8rem;
          margin-bottom: 0.8rem;
          font-size: 0.9rem;
        }
        
        .plan-features li span {
          flex: 1;
        }
        
        .limitations li {
          color: #666;
        }
        
        .billing-table {
          width: 100%;
        }
        
        .table-header {
          background: #f8f9fa;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #e0e0e0;
        }
        
        .table-row {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr 1fr 1.5fr 1fr;
          gap: 1rem;
          padding: 1rem;
          align-items: center;
        }
        
        .table-body .table-row {
          border-bottom: 1px solid #e0e0e0;
          transition: all 0.3s ease;
        }
        
        .table-body .table-row:hover {
          background: #f8f9fa;
        }
        
        .table-cell {
          padding: 0.5rem;
        }
        
        .invoice-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666;
        }
        
        .invoice-amount {
          font-weight: 600;
          color: #1a237e;
        }
        
        .invoice-amount.free {
          color: #666;
        }
        
        .payment-method {
          font-size: 0.9rem;
          color: #666;
        }
        
        .invoice-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .payment-methods-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-top: 1rem;
        }
        
        .payment-method-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        
        .payment-method-card:hover {
          border-color: #1a237e;
          box-shadow: 0 4px 12px rgba(26, 35, 126, 0.1);
        }
        
        .method-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .method-details {
          flex: 1;
        }
        
        .method-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.9rem;
          color: #666;
        }
        
        .method-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        
        .default-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #e8f5e9;
          color: #2e7d32;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
        }
        
        .faq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 1rem;
        }
        
        .faq-item {
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
        }
        
        .faq-item h4 {
          margin: 0 0 1rem 0;
          color: #1a237e;
        }
        
        .faq-item p {
          margin: 0;
          color: #666;
          line-height: 1.6;
        }
        
        /* Modal Styles */
        .upgrade-summary {
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }
        
        .current-plan, .new-plan, .price-difference {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.8rem 0;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .price-difference {
          border-bottom: none;
          padding-top: 1rem;
        }
        
        .difference.increase {
          color: #f44336;
          font-weight: 600;
        }
        
        .difference.decrease {
          color: #4caf50;
          font-weight: 600;
        }
        
        .feature-comparison {
          margin-bottom: 1.5rem;
        }
        
        .features-list {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
        }
        
        .feature-comparison-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .feature-comparison-item:last-child {
          border-bottom: none;
        }
        
        .already-have {
          color: #666;
          font-size: 0.9rem;
        }
        
        .new-feature {
          color: #4caf50;
          font-weight: 600;
          display: flex;
          align-items: center;
        }
        
        .payment-section {
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
        }
        
        .payment-summary {
          margin-bottom: 1.5rem;
        }
        
        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.8rem 0;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .summary-item.total {
          border-bottom: none;
          padding-top: 1rem;
          font-weight: 600;
          font-size: 1.1rem;
          color: #1a237e;
        }
        
        .terms-agreement {
          margin-top: 1.5rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }
        
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 1200px) {
          .plans-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .plans-grid {
            grid-template-columns: 1fr;
          }
          
          .plan-summary {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .table-row {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
          
          .payment-method-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .method-actions {
            width: 100%;
            justify-content: space-between;
          }
          
          .plan-actions {
            flex-direction: column;
            align-items: stretch;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
          }
          
          .faq-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </ProviderPageTemplate>
  );
};

export default ProviderSubscription;