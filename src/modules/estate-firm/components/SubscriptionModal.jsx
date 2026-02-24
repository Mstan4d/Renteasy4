// src/modules/estate-firm/components/SubscriptionModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Card, Row, Col, Alert, Badge } from 'react-bootstrap';
import { 
  Crown, Check, X, Shield, Zap, TrendingUp, 
  CreditCard, Building, Clock, Download
} from 'lucide-react';
import { paymentSystem } from '../../../shared/lib/paymentSystem';
import { supabase } from '../../../shared/lib/supabaseClient';

const SubscriptionModal = ({ show, onHide, estateFirmData, onSubscriptionSuccess }) => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [uploadedProof, setUploadedProof] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('select_plan'); // select_plan, payment, upload_proof

  useEffect(() => {
    loadSubscriptionPlans();
  }, []);

  const loadSubscriptionPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (!error && data) {
        setPlans(data);
        setSelectedPlan(data[0]); // Default to first plan
      }
    } catch (err) {
      console.error('Error loading plans:', err);
    }
  };

  const handleSelectPlan = async (plan) => {
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
      // Get service provider ID
      const { data: sp, error: spError } = await supabase
        .from('service_providers')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user.id)
        .single();

      if (spError) throw spError;

      // Create payment record
      const result = await paymentSystem.processSubscription(
        (await supabase.auth.getUser()).data.user.id,
        selectedPlan.id
      );

      setPaymentDetails(result);
      setStep('payment');
    } catch (err) {
      setError(err.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const handleProofUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file (max 5MB, image only)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }

    setUploadedProof(file);
    setError(null);
  };

  const handleSubmitProof = async () => {
    if (!uploadedProof) {
      setError('Please upload proof of payment');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Upload proof to Supabase Storage
      const fileExt = uploadedProof.name.split('.').pop();
      const fileName = `payment_proofs/${paymentDetails.reference}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('renteasy-payments')
        .upload(fileName, uploadedProof);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('renteasy-payments')
        .getPublicUrl(fileName);

      // Update payment with proof URL
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          metadata: {
            ...paymentDetails.payment.metadata,
            proof_url: publicUrl,
            uploaded_at: new Date().toISOString()
          }
        })
        .eq('id', paymentDetails.payment.id);

      if (updateError) throw updateError;

      // Show success message
      alert('Payment proof submitted successfully! Your subscription will be activated once verified by admin.');
      
      if (onSubscriptionSuccess) {
        onSubscriptionSuccess();
      }
      
      onHide();
    } catch (err) {
      setError(err.message || 'Failed to upload proof');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
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
            <Modal.Body>
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
                          {plan.features?.map((feature, idx) => (
                            <div key={idx} className="d-flex align-items-center mb-1">
                              <Check size={16} className="text-success me-2" />
                              <small>{feature}</small>
                            </div>
                          ))}
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
                Payment Details
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Alert variant="info">
                <h6>Payment Reference: <strong>{paymentDetails?.reference}</strong></h6>
                <p className="mb-0">Use this reference when making your payment</p>
              </Alert>

              <Card className="mb-3">
                <Card.Body>
                  <h6>Bank Transfer Details:</h6>
                  <div className="border rounded p-3 bg-light">
                    <div className="mb-2">
                      <strong>Bank Name:</strong> {paymentDetails?.bankDetails.bankName}
                    </div>
                    <div className="mb-2">
                      <strong>Account Number:</strong> {paymentDetails?.bankDetails.accountNumber}
                    </div>
                    <div className="mb-2">
                      <strong>Account Name:</strong> {paymentDetails?.bankDetails.accountName}
                    </div>
                    <div className="mb-2">
                      <strong>Amount:</strong> ₦{paymentDetails?.amount.toLocaleString()}
                    </div>
                    <div>
                      <strong>Reference:</strong> {paymentDetails?.reference}
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <div className="mb-3">
                <label className="form-label">Upload Proof of Payment</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleProofUpload}
                />
                <small className="text-muted">
                  Upload a screenshot or scan of your payment receipt
                </small>
              </div>

              {uploadedProof && (
                <Alert variant="success">
                  File uploaded: {uploadedProof.name}
                </Alert>
              )}

              {error && <Alert variant="danger">{error}</Alert>}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setStep('select_plan')}>
                Back
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSubmitProof}
                disabled={!uploadedProof || loading}
              >
                {loading ? 'Submitting...' : 'Submit Proof of Payment'}
              </Button>
            </Modal.Footer>
          </>
        );
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      {renderStep()}
    </Modal>
  );
};

export default SubscriptionModal;