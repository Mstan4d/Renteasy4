// src/modules/providers/pages/ProviderSubscribe.jsx
import React, { useState } from 'react';
import { 
  CheckCircle, XCircle, Zap, Shield,
  Star, Users, TrendingUp, Award,
  CreditCard, Clock, Gift, BadgeCheck
} from 'lucide-react';

const ProviderSubscribe = () => {
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [billingCycle, setBillingCycle] = useState('monthly');
  
  const subscriptionPlans = [
    {
      id: 'free',
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for getting started',
      features: [
        { text: '10 free bookings per month', included: true },
        { text: 'Basic profile listing', included: true },
        { text: 'Marketplace visibility', included: true },
        { text: 'Customer messaging', included: true },
        { text: 'Priority support', included: false },
        { text: 'Advanced analytics', included: false },
        { text: 'Profile boosting', included: false },
        { text: 'Zero commission after 10 bookings', included: false }
      ],
      cta: 'Current Plan',
      popular: false
    },
    {
      id: 'pro',
      name: 'Professional',
      price: { monthly: 3000, yearly: 30000 },
      description: 'For growing your service business',
      features: [
        { text: 'Unlimited bookings', included: true },
        { text: 'Verified badge', included: true },
        { text: 'Priority marketplace ranking', included: true },
        { text: 'Advanced analytics dashboard', included: true },
        { text: 'Priority support', included: true },
        { text: 'Profile boosting credits', included: true },
        { text: 'Custom service packages', included: true },
        { text: 'Zero RentEasy commission', included: false }
      ],
      cta: 'Upgrade Now',
      popular: true
    },
    {
      id: 'business',
      name: 'Business',
      price: { monthly: 10000, yearly: 100000 },
      description: 'For established service providers',
      features: [
        { text: 'Everything in Professional', included: true },
        { text: 'Zero RentEasy commission', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'Custom contract templates', included: true },
        { text: 'Bulk service management', included: true },
        { text: 'API access', included: true },
        { text: 'White-label reports', included: true },
        { text: 'Training & onboarding', included: true }
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const benefits = [
    { icon: <TrendingUp size={20} />, title: '5x More Visibility', description: 'Get seen by more clients' },
    { icon: <Users size={20} />, title: 'Priority Ranking', description: 'Appear higher in search results' },
    { icon: <BadgeCheck size={20} />, title: 'Trust & Credibility', description: 'Verified badge builds trust' },
    { icon: <Award size={20} />, title: 'Higher Earnings', description: 'More bookings, more income' }
  ];

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      textAlign: 'center',
      marginBottom: '3rem'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '800',
      color: '#1f2937',
      marginBottom: '1rem',
      background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    subtitle: {
      fontSize: '1.125rem',
      color: '#6b7280',
      maxWidth: '600px',
      margin: '0 auto',
      lineHeight: '1.6'
    },
    billingToggle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      marginBottom: '2rem',
      background: '#f3f4f6',
      borderRadius: '2rem',
      padding: '0.25rem',
      width: 'fit-content',
      margin: '0 auto 3rem'
    },
    toggleButton: {
      padding: '0.75rem 2rem',
      border: 'none',
      background: 'transparent',
      borderRadius: '1.5rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    activeToggle: {
      background: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      color: '#2563eb'
    },
    plansGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      marginBottom: '4rem'
    },
    planCard: {
      background: 'white',
      borderRadius: '1rem',
      border: '2px solid #e5e7eb',
      padding: '2rem',
      position: 'relative',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column'
    },
    popularBadge: {
      position: 'absolute',
      top: '-12px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
      color: 'white',
      padding: '0.5rem 1.5rem',
      borderRadius: '1rem',
      fontSize: '0.875rem',
      fontWeight: '600'
    },
    planHeader: {
      marginBottom: '1.5rem'
    },
    planName: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '0.5rem'
    },
    planDescription: {
      color: '#6b7280',
      fontSize: '0.875rem'
    },
    priceSection: {
      marginBottom: '2rem'
    },
    price: {
      fontSize: '3rem',
      fontWeight: '800',
      color: '#1f2937',
      lineHeight: '1'
    },
    pricePeriod: {
      color: '#6b7280',
      fontSize: '1rem',
      marginLeft: '0.25rem'
    },
    yearlyNote: {
      fontSize: '0.875rem',
      color: '#10b981',
      marginTop: '0.5rem'
    },
    featuresList: {
      flex: 1,
      marginBottom: '2rem'
    },
    featureItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '0.75rem'
    },
    featureIcon: {
      flexShrink: 0
    },
    featureText: {
      color: '#374151',
      fontSize: '0.875rem'
    },
    ctaButton: {
      width: '100%',
      padding: '1rem',
      border: 'none',
      borderRadius: '0.75rem',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    freeButton: {
      background: '#f3f4f6',
      color: '#374151'
    },
    proButton: {
      background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
      color: 'white'
    },
    businessButton: {
      background: '#1f2937',
      color: 'white'
    },
    benefitsSection: {
      background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
      borderRadius: '1.5rem',
      padding: '3rem 2rem',
      marginBottom: '3rem'
    },
    benefitsTitle: {
      textAlign: 'center',
      fontSize: '2rem',
      fontWeight: '700',
      color: '#0369a1',
      marginBottom: '2rem'
    },
    benefitsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '2rem',
      maxWidth: '1000px',
      margin: '0 auto'
    },
    benefitCard: {
      textAlign: 'center',
      padding: '1.5rem'
    },
    benefitIcon: {
      width: '4rem',
      height: '4rem',
      background: 'white',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    benefitTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#0369a1',
      marginBottom: '0.5rem'
    },
    benefitDescription: {
      color: '#0c4a6e',
      fontSize: '0.875rem'
    },
    faqSection: {
      marginBottom: '3rem'
    },
    faqTitle: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#1f2937',
      textAlign: 'center',
      marginBottom: '2rem'
    },
    faqGrid: {
      maxWidth: '800px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    faqItem: {
      background: 'white',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb',
      padding: '1.5rem',
      cursor: 'pointer'
    },
    faqQuestion: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '0.5rem'
    },
    faqAnswer: {
      color: '#6b7280',
      fontSize: '0.875rem',
      lineHeight: '1.5'
    },
    paymentSection: {
      background: 'white',
      borderRadius: '1rem',
      border: '1px solid #e5e7eb',
      padding: '2rem',
      maxWidth: '500px',
      margin: '0 auto'
    },
    paymentTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '1.5rem',
      textAlign: 'center'
    },
    paymentMethod: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      border: '1px solid #e5e7eb',
      borderRadius: '0.75rem',
      marginBottom: '1rem',
      cursor: 'pointer'
    },
    paymentIcon: {
      width: '2.5rem',
      height: '2.5rem',
      background: '#f3f4f6',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    paymentInfo: {
      flex: 1
    },
    paymentName: {
      fontWeight: '600',
      color: '#1f2937'
    },
    paymentDescription: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    totalSection: {
      marginTop: '2rem',
      paddingTop: '1.5rem',
      borderTop: '2px solid #e5e7eb'
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.5rem'
    },
    totalLabel: {
      color: '#6b7280'
    },
    totalValue: {
      fontWeight: '600',
      color: '#1f2937'
    },
    finalTotal: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#10b981'
    },
    confirmButton: {
      width: '100%',
      padding: '1rem',
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      border: 'none',
      borderRadius: '0.75rem',
      fontSize: '1.125rem',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '2rem'
    }
  };

  const handleSubscribe = () => {
    const plan = subscriptionPlans.find(p => p.id === selectedPlan);
    alert(`Subscribing to ${plan.name} plan (${billingCycle}) for ₦${plan.price[billingCycle].toLocaleString()}`);
    // In real app, this would process payment
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Upgrade Your Service Business</h1>
        <p style={styles.subtitle}>
          Choose the perfect plan to grow your service business on RentEasy. 
          Get more visibility, more bookings, and higher earnings.
        </p>
      </div>

      {/* Billing Toggle */}
      <div style={styles.billingToggle}>
        <button
          onClick={() => setBillingCycle('monthly')}
          style={{
            ...styles.toggleButton,
            ...(billingCycle === 'monthly' ? styles.activeToggle : {})
          }}
        >
          Monthly Billing
        </button>
        <button
          onClick={() => setBillingCycle('yearly')}
          style={{
            ...styles.toggleButton,
            ...(billingCycle === 'yearly' ? styles.activeToggle : {})
          }}
        >
          Yearly Billing
          <span style={{color: '#10b981', marginLeft: '0.5rem'}}>
            Save 16%
          </span>
        </button>
      </div>

      {/* Subscription Plans */}
      <div style={styles.plansGrid}>
        {subscriptionPlans.map((plan) => (
          <div
            key={plan.id}
            style={{
              ...styles.planCard,
              borderColor: plan.popular ? '#2563eb' : '#e5e7eb',
              boxShadow: plan.popular ? '0 20px 40px rgba(37, 99, 235, 0.1)' : 'none',
              transform: plan.popular ? 'translateY(-8px)' : 'none'
            }}
          >
            {plan.popular && (
              <div style={styles.popularBadge}>
                Most Popular
              </div>
            )}
            
            <div style={styles.planHeader}>
              <h3 style={styles.planName}>{plan.name}</h3>
              <p style={styles.planDescription}>{plan.description}</p>
            </div>

            <div style={styles.priceSection}>
              <div>
                <span style={styles.price}>
                  ₦{plan.price[billingCycle].toLocaleString()}
                </span>
                <span style={styles.pricePeriod}>
                  /{billingCycle === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
              {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                <div style={styles.yearlyNote}>
                  <Gift size={14} style={{marginRight: '0.25rem'}} />
                  Save ₦{(plan.price.monthly * 12 - plan.price.yearly).toLocaleString()} yearly
                </div>
              )}
            </div>

            <div style={styles.featuresList}>
              {plan.features.map((feature, index) => (
                <div key={index} style={styles.featureItem}>
                  <div style={styles.featureIcon}>
                    {feature.included ? (
                      <CheckCircle size={18} color="#10b981" />
                    ) : (
                      <XCircle size={18} color="#ef4444" />
                    )}
                  </div>
                  <span style={styles.featureText}>{feature.text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => plan.id === 'free' ? null : handleSubscribe()}
              style={{
                ...styles.ctaButton,
                ...styles[`${plan.id}Button`]
              }}
              onMouseEnter={(e) => {
                if (plan.id !== 'free') {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (plan.id !== 'free') {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Benefits Section */}
      <div style={styles.benefitsSection}>
        <h2 style={styles.benefitsTitle}>Why Upgrade to Professional?</h2>
        <div style={styles.benefitsGrid}>
          {benefits.map((benefit, index) => (
            <div key={index} style={styles.benefitCard}>
              <div style={styles.benefitIcon}>
                {benefit.icon}
              </div>
              <h4 style={styles.benefitTitle}>{benefit.title}</h4>
              <p style={styles.benefitDescription}>{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div style={styles.faqSection}>
        <h2 style={styles.faqTitle}>Frequently Asked Questions</h2>
        <div style={styles.faqGrid}>
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
            <div key={index} style={styles.faqItem}>
              <div style={styles.faqQuestion}>{item.q}</div>
              <div style={styles.faqAnswer}>{item.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Section */}
      {selectedPlan !== 'free' && (
        <div style={styles.paymentSection}>
          <h3 style={styles.paymentTitle}>Complete Your Subscription</h3>
          
          <div style={styles.paymentMethod}>
            <div style={styles.paymentIcon}>
              <CreditCard size={24} color="#2563eb" />
            </div>
            <div style={styles.paymentInfo}>
              <div style={styles.paymentName}>Credit/Debit Card</div>
              <div style={styles.paymentDescription}>Pay securely with your card</div>
            </div>
          </div>

          <div style={styles.paymentMethod}>
            <div style={styles.paymentIcon}>
              <Shield size={24} color="#10b981" />
            </div>
            <div style={styles.paymentInfo}>
              <div style={styles.paymentName}>Bank Transfer</div>
              <div style={styles.paymentDescription}>Transfer directly to our bank account</div>
            </div>
          </div>

          <div style={styles.totalSection}>
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Plan Price</span>
              <span style={styles.totalValue}>
                ₦{subscriptionPlans.find(p => p.id === selectedPlan)?.price[billingCycle].toLocaleString()}
              </span>
            </div>
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>VAT (7.5%)</span>
              <span style={styles.totalValue}>
                ₦{(subscriptionPlans.find(p => p.id === selectedPlan)?.price[billingCycle] * 0.075).toLocaleString()}
              </span>
            </div>
            <div style={{...styles.totalRow, marginTop: '1rem'}}>
              <span style={styles.totalLabel}>Total Amount</span>
              <span style={{...styles.totalValue, ...styles.finalTotal}}>
                ₦{(
                  subscriptionPlans.find(p => p.id === selectedPlan)?.price[billingCycle] * 1.075
                ).toLocaleString()}
              </span>
            </div>
          </div>

          <button style={styles.confirmButton} onClick={handleSubscribe}>
            Subscribe Now
          </button>

          <div style={{
            textAlign: 'center',
            marginTop: '1rem',
            fontSize: '0.875rem',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <Shield size={14} />
            Secure payment • 256-bit encryption
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderSubscribe;