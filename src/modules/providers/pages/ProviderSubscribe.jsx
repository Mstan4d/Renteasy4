// src/modules/providers/pages/ProviderSubscribe.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';

import {
  CheckCircle, XCircle, Zap, Shield,
  Star, Users, TrendingUp, Award,
  CreditCard, Clock, Gift, BadgeCheck
} from 'lucide-react';
import './ProviderSubscribe.css';

const ProviderSubscribe = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('select'); // select, payment
  const [paymentRecord, setPaymentRecord] = useState(null);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all subscription plans
      const { data: plansData, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });
      if (plansError) throw plansError;
      setPlans(plansData || []);

      // Fetch current subscription for this provider (if any)
      const { data: subData, error: subError } = await supabase
        .from('provider_subscriptions')
        .select('*, plan:plan_id(*)')
        .eq('provider_id', user.id)
        .maybeSingle();
      if (subError) throw subError;
      setCurrentSubscription(subData);

      // If user already has an active subscription, maybe redirect? We'll allow viewing but not subscribing again.
    } catch (err) {
      console.error('Error fetching subscription data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const handleProceedToPayment = async () => {
    if (!selectedPlan) return;
    setSubmitting(true);
    try {
      const reference = paymentService.generateReference('SUB');
      const amount = billingCycle === 'monthly' ? selectedPlan.price : selectedPlan.price * 10; // yearly discount placeholder

      // Create payment record
      const payment = await paymentService.createPayment({
        userId: user.id,
        amount,
        type: 'subscription',
        reference,
        metadata: {
          plan_id: selectedPlan.id,
          plan_name: selectedPlan.name,
          billing_cycle: billingCycle,
        },
      });

      setPaymentRecord(payment);
      setStep('payment');
    } catch (err) {
      console.error(err);
      setError('Failed to initiate payment. Please try again.');
    } finally {
      setSubmitting(false);
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
    setSubmitting(true);
    try {
      await paymentService.uploadProof({
        paymentId: paymentRecord.id,
        userId: user.id,
        file,
      });

      alert('Payment proof uploaded! Your subscription will be activated once verified by admin.');
      // Optionally refresh data or navigate
      navigate('/dashboard/provider/subscription');
    } catch (err) {
      console.error(err);
      setError('Failed to upload proof. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const bankDetails = paymentService.getBankDetails();

  const benefits = [
    { icon: <TrendingUp size={20} />, title: '5x More Visibility', description: 'Get seen by more clients' },
    { icon: <Users size={20} />, title: 'Priority Ranking', description: 'Appear higher in search results' },
    { icon: <BadgeCheck size={20} />, title: 'Trust & Credibility', description: 'Verified badge builds trust' },
    { icon: <Award size={20} />, title: 'Higher Earnings', description: 'More bookings, more income' }
  ];

  if (loading) {
    return <div className="subscribe-loading">Loading subscription plans...</div>;
  }

  // If user already has an active subscription, show a message and link to manage
  if (currentSubscription?.status === 'active') {
    return (
      <div className="subscribe-container">
        <div className="active-subscription-message">
          <h2>You already have an active subscription</h2>
          <p>Your current plan: <strong>{currentSubscription.plan?.name}</strong></p>
          <button className="btn-primary" onClick={() => navigate('/dashboard/provider/subscription')}>
            Manage Subscription
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="subscribe-container">
      {/* Header */}
      <div className="subscribe-header">
        <h1 className="subscribe-title">Upgrade Your Service Business</h1>
        <p className="subscribe-subtitle">
          Choose the perfect plan to grow your service business on RentEasy. 
          Get more visibility, more bookings, and higher earnings.
        </p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {step === 'select' && (
        <>
          {/* Billing Toggle */}
          <div className="billing-toggle">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`toggle-button ${billingCycle === 'monthly' ? 'active' : ''}`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`toggle-button ${billingCycle === 'yearly' ? 'active' : ''}`}
            >
              Yearly Billing
              <span className="saving-badge">Save 16%</span>
            </button>
          </div>

          {/* Subscription Plans */}
          <div className="plans-grid">
            {plans.map((plan) => {
              const isCurrentPlan = currentSubscription?.plan_id === plan.id;
              const isSelected = selectedPlan?.id === plan.id;
              const price = billingCycle === 'monthly' ? plan.price : plan.price * 10; // yearly discount placeholder
              const yearlyPrice = plan.price * 10; // 2 months free
              const monthlyEquivalent = yearlyPrice / 12;

              return (
                <div
                  key={plan.id}
                  className={`plan-card ${plan.popular ? 'popular' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {plan.popular && (
                    <div className="popular-badge">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="plan-header">
                    <h3 className="plan-name">{plan.name}</h3>
                    <p className="plan-description">{plan.description}</p>
                  </div>

                  <div className="price-section">
                    <div>
                      <span className="price">
                        ₦{price.toLocaleString()}
                      </span>
                      <span className="price-period">
                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    </div>
                    {billingCycle === 'yearly' && plan.price > 0 && (
                      <div className="yearly-note">
                        <Gift size={14} />
                        Save ₦{(plan.price * 12 - yearlyPrice).toLocaleString()} yearly
                      </div>
                    )}
                  </div>

                  <div className="features-list">
                    {plan.features?.map((feature, index) => (
                      <div key={index} className="feature-item">
                        <div className="feature-icon">
                          <CheckCircle size={18} color="#10b981" />
                        </div>
                        <span className="feature-text">{feature}</span>
                      </div>
                    ))}
                    {plan.limitations?.map((limitation, index) => (
                      <div key={`lim-${index}`} className="feature-item">
                        <div className="feature-icon">
                          <XCircle size={18} color="#ef4444" />
                        </div>
                        <span className="feature-text">{limitation}</span>
                      </div>
                    ))}
                  </div>

                  {isCurrentPlan && (
                    <div className="current-plan-badge">Current Plan</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Proceed Button */}
          {selectedPlan && selectedPlan.price > 0 && (
            <div className="proceed-bar">
              <p>Selected: {selectedPlan.name} – ₦{selectedPlan.price}/month</p>
              <button className="btn-primary" onClick={handleProceedToPayment} disabled={submitting}>
                {submitting ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          )}
        </>
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
              <p><strong>Amount:</strong> ₦{paymentRecord.amount.toLocaleString()}</p>
            </div>

            <div className="upload-proof">
              <h4>Upload Proof of Payment</h4>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {file && <p>Selected: {file.name}</p>}
              {error && <p className="error">{error}</p>}
              <div className="action-buttons">
                <button onClick={handleUploadProof} disabled={submitting} className="btn-primary">
                  {submitting ? 'Uploading...' : 'Submit Proof'}
                </button>
                <button onClick={() => setStep('select')} className="btn-secondary">Back</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Benefits Section */}
      <div className="benefits-section">
        <h2 className="benefits-title">Why Upgrade to Professional?</h2>
        <div className="benefits-grid">
          {benefits.map((benefit, index) => (
            <div key={index} className="benefit-card">
              <div className="benefit-icon">
                {benefit.icon}
              </div>
              <h4 className="benefit-title">{benefit.title}</h4>
              <p className="benefit-description">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section">
        <h2 className="faq-title">Frequently Asked Questions</h2>
        <div className="faq-grid">
          {[
            {
              q: 'Can I cancel my subscription anytime?',
              a: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period.'
            },
            {
              q: 'What happens to my existing bookings if I upgrade?',
              a: 'All your existing bookings and data will be preserved when you upgrade. You\'ll immediately get access to new features.'
            },
            {
              q: 'Is there a free trial for paid plans?',
              a: 'Yes, we offer a 7-day free trial for the Professional plan so you can test all features before committing.'
            },
            {
              q: 'How do I change my subscription plan?',
              a: 'You can upgrade or downgrade your plan at any time from your account settings. Changes take effect immediately.'
            }
          ].map((item, index) => (
            <div key={index} className="faq-item">
              <div className="faq-question">{item.q}</div>
              <div className="faq-answer">{item.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProviderSubscribe;