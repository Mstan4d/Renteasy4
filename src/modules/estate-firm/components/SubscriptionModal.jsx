import React, { useState, useEffect } from 'react';
import { Modal, Button, Card, Row, Col, Alert, Badge, Form } from 'react-bootstrap';
import { Crown, Check, X, CreditCard, Building, Clock, Upload } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';

import { useAuth } from '../../../shared/context/AuthContext';

const SubscriptionModal = ({ show, onHide, onSubscriptionSuccess }) => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('select_plan');
  const [paymentRecord, setPaymentRecord] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (show) {
      loadPlans();
      setSelectedPlan(null);
      setStep('select_plan');
      setPaymentRecord(null);
      setFile(null);
      setError(null);
    }
  }, [show]);

  const loadPlans = async () => {
    setFetchError(null);
    try {
      console.log('Fetching subscription plans...');
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });
      
      console.log('Supabase response:', { data, error });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log('Plans loaded:', data.length, 'items');
        data.forEach((plan, idx) => {
          console.log(`Plan ${idx + 1}:`, { name: plan.name, price: plan.price });
        });
        setPlans(data);
        setSelectedPlan(data[0]);
      } else {
        setFetchError('No subscription plans found. Please contact support.');
      }
    } catch (err) {
      console.error('Error loading plans:', err);
      setFetchError(err.message);
    }
  };

  const paymentService = {
  generateReference: (prefix = 'PAY') => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
  getBankDetails: () => ({ bankName: 'Monie Point', accountName: 'Stable Pilla Resources', accountNumber: '8149113218' }),
  createPayment: async ({ userId, amount, type, reference, metadata = {} }) => ({ id: 'mock-payment-id', reference }),
  uploadProof: async ({ paymentId, userId, file }) => 'https://mock-proof-url.com',
  createSubscription: async ({ userId, plan, paymentId }) => ({ id: 'mock-subscription-id' }),
  createBoost: async ({ userId, package: boostPackage, paymentId }) => ({ id: 'mock-boost-id' }),
};

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setError(null);
  };

  const handleProceedToPayment = async () => {
    if (!selectedPlan) {
      setError('Please select a plan');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const reference = paymentService.generateReference('SUB');
      const amount = selectedPlan.price;

      const payment = await paymentService.createPayment({
        userId: user.id,
        amount,
        type: 'subscription',
        reference,
        metadata: { plan_id: selectedPlan.id, plan_name: selectedPlan.name },
      });

      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (selectedPlan.duration_days || 30));

      // Insert subscription with all required columns
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          profile_id: user.id,
          plan_id: selectedPlan.id,
          payment_id: payment.id,
          amount: selectedPlan.price,
          status: 'pending',
          starts_at: startDate.toISOString(),
          expires_at: endDate.toISOString(),
          plan_type: user.role,
          created_at: new Date().toISOString()
        });

      if (subError) throw subError;

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

    setUploading(true);
    setError(null);

    try {
      await paymentService.uploadProof({
        paymentId: paymentRecord.id,
        userId: user.id,
        file,
      });

      alert('Payment proof submitted successfully! Your subscription will be activated once verified by admin.');
      if (onSubscriptionSuccess) onSubscriptionSuccess();
      onHide();
    } catch (err) {
      console.error(err);
      setError('Failed to upload proof. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const bankDetails = paymentService.getBankDetails();

  const renderStep = () => {
    if (fetchError) {
      return (
        <>
          <Modal.Header closeButton>
            <Modal.Title>Error</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="danger">{fetchError}</Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>Close</Button>
          </Modal.Footer>
        </>
      );
    }

    switch (step) {
      case 'select_plan':
        return (
          <>
            <Modal.Header closeButton>
              <Modal.Title>
                <Crown size={24} className="me-2 text-warning" />
                Subscribe to Premium
              </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <p className="text-muted mb-4">
                Choose a subscription plan to unlock unlimited property posts and 0% commission
              </p>
              <Row className="g-3">
                {plans.map((plan) => (
                  <Col xs={12} key={plan.id}>
                    <Card
                      className={`cursor-pointer ${selectedPlan?.id === plan.id ? 'border-primary border-2' : ''}`}
                      onClick={() => handleSelectPlan(plan)}
                    >
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h5 className="mb-1">{plan.name}</h5>
                            <p className="text-muted small mb-2">{plan.description}</p>
                            <div className="d-flex align-items-center">
                              <h3 className="text-primary mb-0">₦{plan.price.toLocaleString()}</h3>
                              <span className="text-muted ms-2">/{plan.duration_days} days</span>
                            </div>
                          </div>
                          {selectedPlan?.id === plan.id && (
                            <Badge bg="primary">
                              <Check size={16} />
                            </Badge>
                          )}
                        </div>
                        <div className="mt-3">
                          {Array.isArray(plan.features) 
                            ? plan.features.map((feature, idx) => (
                                <div key={idx} className="d-flex align-items-center mb-1">
                                  <Check size={16} className="text-success me-2" />
                                  <small>{feature}</small>
                                </div>
                              ))
                            : typeof plan.features === 'string' && (
                              <div className="text-muted small">{plan.features}</div>
                            )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
              {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={onHide}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleProceedToPayment}
                disabled={!selectedPlan || loading}
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </Button>
            </Modal.Footer>
          </>
        );

      case 'payment':
        return (
          <>
            <Modal.Header closeButton>
              <Modal.Title>
                <CreditCard size={24} className="me-2" />
                Payment Instructions
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Alert variant="info">
                <h6>Payment Reference: <strong>{paymentRecord?.reference}</strong></h6>
                <p className="mb-0">Use this reference when making your transfer</p>
              </Alert>

              <Card className="mb-3">
                <Card.Body>
                  <h6>Bank Transfer Details:</h6>
                  <div className="border rounded p-3 bg-light">
                    <div className="mb-2">
                      <strong>Bank Name:</strong> {bankDetails.bankName}
                    </div>
                    <div className="mb-2">
                      <strong>Account Number:</strong> {bankDetails.accountNumber}
                    </div>
                    <div className="mb-2">
                      <strong>Account Name:</strong> {bankDetails.accountName}
                    </div>
                    <div className="mb-2">
                      <strong>Amount:</strong> ₦{paymentRecord?.amount?.toLocaleString()}
                    </div>
                    <div>
                      <strong>Reference:</strong> {paymentRecord?.reference}
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <div className="mb-3">
                <label className="form-label">Upload Proof of Payment</label>
                <div className="border rounded p-3 text-center">
                  {file ? (
                    <div className="d-flex align-items-center justify-content-between">
                      <span>{file.name}</span>
                      <Button variant="link" size="sm" onClick={() => setFile(null)}>
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload size={32} className="text-muted mb-2" />
                      <p className="text-muted mb-2">Click to upload or drag and drop</p>
                      <small className="text-muted d-block">PNG, JPG up to 5MB</small>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="mt-2"
                      />
                    </>
                  )}
                </div>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setStep('select_plan')}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleUploadProof}
                disabled={!file || uploading}
              >
                {uploading ? 'Uploading...' : 'Submit Proof'}
              </Button>
            </Modal.Footer>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      {renderStep()}
    </Modal>
  );
};

export default SubscriptionModal;