// src/modules/providers/pages/ProviderSubscription.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import { paymentService } from '../../../shared/lib/paymentService';
import './ProviderSubscription.css';

const ProviderSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [step, setStep] = useState('select'); // select, payment
  const [paymentRecord, setPaymentRecord] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (user?.id) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch all plans
      const { data: plansData } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price');
      setPlans(plansData || []);

      // Fetch user's subscription (if any)
      const { data: subData } = await supabase
        .from('provider_subscriptions')
        .select('*, plan:plan_id(*)')
        .eq('provider_id', user.id)
        .maybeSingle();
      setSubscription(subData || null);
    } catch (err) {
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
    setLoading(true);
    try {
      const reference = paymentService.generateReference('SUB');
      const payment = await paymentService.createPayment({
        userId: user.id,
        amount: selectedPlan.price,
        type: 'subscription',
        reference,
        metadata: { plan_id: selectedPlan.id, plan_name: selectedPlan.name }
      });
      setPaymentRecord(payment);
      setStep('payment');
    } catch (err) {
      setError('Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (selected.size > 5 * 1024 * 1024) {
      setError('File too large (max 5MB)');
      return;
    }
    if (!selected.type.startsWith('image/')) {
      setError('Only image files allowed');
      return;
    }
    setFile(selected);
  };

  const handleUploadProof = async () => {
    if (!file) return;
    setLoading(true);
    try {
      await paymentService.uploadProof({
        paymentId: paymentRecord.id,
        userId: user.id,
        file,
      });
      alert('Proof uploaded. Admin will verify your subscription.');
      await loadData();
      setStep('select');
      setSelectedPlan(null);
      setPaymentRecord(null);
      setFile(null);
    } catch (err) {
      setError('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const bankDetails = paymentService.getBankDetails();

  if (loading) return <div className="loading">Loading...</div>;

  const currentPlan = subscription?.plan;

  return (
    <div className="provider-subscription">
      <h1>Subscription & Billing</h1>

      {currentPlan && (
        <div className="current-plan">
          <h2>Current Plan: {currentPlan.name}</h2>
          <p>{currentPlan.description}</p>
          <ul>
            {currentPlan.features?.map((f, i) => <li key={i}>✓ {f}</li>)}
          </ul>
          <p>Price: ₦{currentPlan.price}/month</p>
          {subscription?.status === 'active' ? (
            <span className="badge active">Active</span>
          ) : (
            <span className="badge pending">Pending</span>
          )}
        </div>
      )}

      {step === 'select' && (
        <div className="plans-section">
          <h2>Choose a Plan</h2>
          <div className="plans-grid">
            {plans.map(plan => (
              <div
                key={plan.id}
                className={`plan-card ${selectedPlan?.id === plan.id ? 'selected' : ''}`}
                onClick={() => handleSelectPlan(plan)}
              >
                <h3>{plan.name}</h3>
                <p className="price">₦{plan.price}/month</p>
                <p>{plan.description}</p>
                <ul>
                  {plan.features?.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            ))}
          </div>
          {selectedPlan && (
            <div className="proceed-bar">
              <p>Selected: {selectedPlan.name} – ₦{selectedPlan.price}/month</p>
              <button onClick={handleProceedToPayment} className="btn-primary">Proceed to Payment</button>
            </div>
          )}
        </div>
      )}

      {step === 'payment' && paymentRecord && (
        <div className="payment-step">
          <h2>Payment Instructions</h2>
          <div className="payment-details">
            <p><strong>Reference:</strong> {paymentRecord.reference}</p>
            <div className="bank-details">
              <p><strong>Bank:</strong> {bankDetails.bankName}</p>
              <p><strong>Account Number:</strong> {bankDetails.accountNumber}</p>
              <p><strong>Account Name:</strong> {bankDetails.accountName}</p>
              <p><strong>Amount:</strong> ₦{paymentRecord.amount}</p>
            </div>
            <div className="upload-section">
              <h4>Upload Proof of Payment</h4>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {file && <p>{file.name}</p>}
              {error && <p className="error">{error}</p>}
              <button onClick={handleUploadProof} disabled={loading} className="btn-primary">Submit Proof</button>
              <button onClick={() => setStep('select')} className="btn-secondary">Back</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderSubscription;