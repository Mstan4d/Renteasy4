// src/modules/estate-firm/components/BoostModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Card, Row, Col, Alert, Badge, Form } from 'react-bootstrap';
import { Zap, Check, X, CreditCard, Upload } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { paymentService } from '@shared/lib/paymentService.js';
import { useAuth } from '../../../shared/context/AuthContext';

const BoostModal = ({ show, onHide, onBoostSuccess }) => {
  const { user } = useAuth();
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('select_package');
  const [paymentRecord, setPaymentRecord] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (show) {
      loadPackages();
      setSelectedPackage(null);
      setStep('select_package');
      setPaymentRecord(null);
      setFile(null);
      setError(null);
    }
  }, [show]);

  const loadPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('boost_packages')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });
      if (error) throw error;
      setPackages(data || []);
      if (data && data.length > 0) setSelectedPackage(data[0]);
    } catch (err) {
      console.error('Error loading boost packages:', err);
    }
  };

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setError(null);
  };

  const handleProceedToPayment = async () => {
    if (!selectedPackage) {
      setError('Please select a boost package');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const reference = paymentService.generateReference('BST');
      const amount = selectedPackage.price;

      // Create payment record with metadata containing package info
      const payment = await paymentService.createPayment({
        userId: user.id,
        amount,
        type: 'boost',
        reference,
        metadata: { 
          package_id: selectedPackage.id, 
          package_name: selectedPackage.name,
          duration_days: selectedPackage.duration_days
        },
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

    setUploading(true);
    setError(null);

    try {
      // Upload proof and update payment metadata with proof URL
      await paymentService.uploadProof({
        paymentId: paymentRecord.id,
        userId: user.id,
        file,
      });

      // Create a pending boost record (status = 'pending')
      const { error: boostError } = await supabase
        .from('active_boosts')
        .insert({
          user_id: user.id,
          package_id: selectedPackage.id,
          payment_id: paymentRecord.id,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (boostError) throw boostError;

      alert('Payment proof submitted! Your boost request is now pending admin approval. You will be notified once approved.');
      
      if (onBoostSuccess) onBoostSuccess();
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
    switch (step) {
      case 'select_package':
        return (
          <>
            <Modal.Header closeButton>
              <Modal.Title>
                <Zap size={24} className="me-2 text-warning" />
                Boost Your Profile
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p className="text-muted mb-4">
                Choose a boost package to increase your visibility in the marketplace and get more bookings.
              </p>
              <Row className="g-3">
                {packages.map((pkg) => (
                  <Col xs={12} key={pkg.id}>
                    <Card
                      className={`cursor-pointer ${selectedPackage?.id === pkg.id ? 'border-warning border-2' : ''}`}
                      onClick={() => handleSelectPackage(pkg)}
                    >
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h5 className="mb-1">{pkg.name}</h5>
                            <p className="text-muted small mb-2">{pkg.description}</p>
                            <div className="d-flex align-items-center">
                              <h3 className="text-warning mb-0">₦{pkg.price.toLocaleString()}</h3>
                              <span className="text-muted ms-2">/{pkg.duration_days} days</span>
                            </div>
                          </div>
                          {selectedPackage?.id === pkg.id && (
                            <Badge bg="warning">
                              <Check size={16} />
                            </Badge>
                          )}
                        </div>
                        <div className="mt-3">
                          {pkg.features?.map((feature, idx) => (
                            <div key={idx} className="d-flex align-items-center mb-1">
                              <Zap size={16} className="text-warning me-2" />
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
                variant="warning"
                onClick={handleProceedToPayment}
                disabled={!selectedPackage || loading}
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
              <Button variant="secondary" onClick={() => setStep('select_package')}>
                Back
              </Button>
              <Button
                variant="warning"
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

export default BoostModal;