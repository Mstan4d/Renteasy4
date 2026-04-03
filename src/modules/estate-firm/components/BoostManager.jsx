// src/modules/estate-firm/components/BoostManager.jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Badge, Alert, Modal, Form } from 'react-bootstrap';
import { Zap, TrendingUp, Clock, Crown, Check, CreditCard, Upload, X } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import { paymentService } from '@shared/lib/paymentService';

const BoostManager = ({ estateFirmData, onBoostSuccess }) => {
  const { user } = useAuth();
  const [boostPackages, setBoostPackages] = useState([]);
  const [activeBoost, setActiveBoost] = useState(null);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('principal');
  const [canBoost, setCanBoost] = useState(true);

  useEffect(() => {
    loadBoostData();
  }, []);

  useEffect(() => {
  const getUserRole = async () => {
    if (!user) return;
    try {
      const { data: roleData } = await supabase
        .from('estate_firm_profiles')
        .select('staff_role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      const role = roleData?.staff_role || 'principal';
      setUserRole(role);
      // Principal and Executive can boost
      setCanBoost(role === 'principal' || role === 'executive');
    } catch (err) {
      console.warn('Could not fetch user role:', err);
      setCanBoost(true);
    }
  };
  getUserRole();
}, [user]);


  const loadBoostData = async () => {
    try {
      // Load boost packages
      const { data: packages, error: packagesError } = await supabase
        .from('boost_packages')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (!packagesError) {
        setBoostPackages(packages);
      }

      // Load active boost
      if (estateFirmData.current_boost_id) {
        const { data: boost, error: boostError } = await supabase
          .from('active_boosts')
          .select('*, boost_package:boost_package_id(*)')
          .eq('id', estateFirmData.current_boost_id)
          .single();

        if (!boostError && boost) {
          setActiveBoost(boost);
        }
      }
    } catch (err) {
      console.error('Error loading boost data:', err);
    }
  };

  const handlePurchaseBoost = async (pkg) => {
    setSelectedPackage(pkg);
    setShowBoostModal(true);
  };

  const renderBoostStatus = () => {
    if (!activeBoost) {
      return (
        <Alert variant="warning">
          <div className="d-flex align-items-center">
            <Zap size={20} className="me-2" />
            <span>Your profile is not currently boosted</span>
          </div>
        </Alert>
      );
    }

    const expiresAt = new Date(activeBoost.expires_at);
    const now = new Date();
    const daysRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));

    return (
      <Alert variant={daysRemaining > 3 ? 'success' : 'warning'}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="d-flex align-items-center">
              <Zap size={20} className="me-2" />
              <strong>Profile is Boosted!</strong>
            </div>
            <small className="text-muted">
              Expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
            </small>
          </div>
          <Badge bg="success">
            <TrendingUp size={16} /> Boosted
          </Badge>
        </div>
      </Alert>
    );
  };

  return (
    <>
      <Card className="mb-4">
        <Card.Body>
          <Card.Title className="d-flex align-items-center">
            <Zap size={24} className="me-2 text-warning" />
            Marketplace Boost
          </Card.Title>

          {renderBoostStatus()}

          <h6 className="mt-4 mb-3">Available Boost Packages</h6>
          <Row className="g-3">
            {boostPackages.map((pkg) => (
              <Col md={6} key={pkg.id}>
                <Card className="h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h6 className="mb-1">{pkg.name}</h6>
                        <small className="text-muted">{pkg.description}</small>
                      </div>
                      <Badge bg="warning">Priority {pkg.priority_level}</Badge>
                    </div>
                    
                    <div className="mb-3">
                      <h4 className="text-primary">₦{pkg.price.toLocaleString()}</h4>
                      <small className="text-muted">for {pkg.duration_days} days</small>
                    </div>

                    <Button 
                      variant="outline-warning" 
                      className="w-100"
                      onClick={() => handlePurchaseBoost(pkg)}
                      disabled={activeBoost && new Date(activeBoost.expires_at) > new Date()}
                    >
                      <Zap size={16} className="me-2" />
                      {activeBoost ? 'Extend Boost' : 'Purchase Boost'}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

      {/* Boost Purchase Modal */}
      <BoostPurchaseModal
        show={showBoostModal}
        onHide={() => {
          setShowBoostModal(false);
          setSelectedPackage(null);
        }}
        boostPackage={selectedPackage}
        onSuccess={() => {
          loadBoostData();
          if (onBoostSuccess) onBoostSuccess();
        }}
        user={user}
      />
    </>
  );
};

// ===== Boost Purchase Modal Component =====
const BoostPurchaseModal = ({ show, onHide, boostPackage, onSuccess, user }) => {
  const [step, setStep] = useState('details'); // details, payment
  const [paymentRecord, setPaymentRecord] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const bankDetails = paymentService.getBankDetails();

  const handleProceedToPayment = async () => {
    if (!boostPackage) return;

    setLoading(true);
    setError(null);

    try {
      const reference = paymentService.generateReference('BST');
      const amount = boostPackage.price;

      // Create payment record
      const payment = await paymentService.createPayment({
        userId: user.id,
        amount,
        type: 'boost',
        reference,
        metadata: { package_id: boostPackage.id, package_name: boostPackage.name },
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
      // Upload proof
      await paymentService.uploadProof({
        paymentId: paymentRecord.id,
        userId: user.id,
        file,
      });

      // Create pending boost record
      const { error: boostError } = await supabase
        .from('active_boosts')
        .insert({
          user_id: user.id,
          package_id: boostPackage.id,
          payment_id: paymentRecord.id,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (boostError) throw boostError;

      alert('Payment proof submitted! Your boost request is now pending admin approval.');
      onSuccess();
      onHide();
    } catch (err) {
      console.error(err);
      setError('Failed to upload proof. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Reset state when modal closes
  const handleClose = () => {
    setStep('details');
    setPaymentRecord(null);
    setFile(null);
    setError(null);
    onHide();
  };

  if (userRole === 'associate') {
  return (
    <div className="boost-manager restricted">
      <Shield size={48} />
      <h3>Access Restricted</h3>
      <p>Only Firm Principal and Executives can manage boosts.</p>
    </div>
  );
}

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {step === 'details' ? (
            <><Zap size={24} className="me-2 text-warning" />Purchase Boost</>
          ) : (
            <><CreditCard size={24} className="me-2" />Payment Instructions</>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {step === 'details' && boostPackage && (
          <div>
            <h5>{boostPackage.name}</h5>
            <p className="text-muted">{boostPackage.description}</p>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className="text-primary mb-0">₦{boostPackage.price.toLocaleString()}</h3>
                <small className="text-muted">{boostPackage.duration_days} days</small>
              </div>
              <Badge bg="warning">Priority {boostPackage.priority_level}</Badge>
            </div>

            <div className="mb-3">
              <h6>Benefits:</h6>
              <ul className="small">
                <li>Higher visibility in marketplace</li>
                <li>Appear above non-boosted profiles</li>
                <li>Increased profile views</li>
                <li>Featured placement</li>
              </ul>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Button 
              variant="warning" 
              className="w-100"
              onClick={handleProceedToPayment}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </div>
        )}

        {step === 'payment' && paymentRecord && (
          <div>
            <Alert variant="info">
              <h6>Payment Reference: <strong>{paymentRecord.reference}</strong></h6>
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
                    <strong>Amount:</strong> ₦{paymentRecord.amount?.toLocaleString()}
                  </div>
                  <div>
                    <strong>Reference:</strong> {paymentRecord.reference}
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
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {step === 'payment' && (
          <>
            <Button variant="secondary" onClick={() => setStep('details')}>
              Back
            </Button>
            <Button
              variant="warning"
              onClick={handleUploadProof}
              disabled={!file || uploading}
            >
              {uploading ? 'Uploading...' : 'Submit Proof'}
            </Button>
          </>
        )}
        {step === 'details' && (
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default BoostManager;