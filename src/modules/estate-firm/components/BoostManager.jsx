// src/modules/estate-firm/components/BoostManager.jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Badge, Alert, Modal, Form } from 'react-bootstrap';
import { Zap, TrendingUp, CreditCard, Upload, X, Shield } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';

// ===== Payment Service (embedded, fully functional) =====
const BANK_DETAILS = {
  bankName: 'Monie Point',
  accountName: 'Stable Pilla Resources',
  accountNumber: '8149113218',
};

const generateReference = (prefix = 'PAY') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

const getBankDetails = () => BANK_DETAILS;

const createPayment = async ({ userId, amount, type, reference, metadata = {} }) => {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      user_id: userId,
      amount,
      payment_type: type,
      reference,
      status: 'pending',
      metadata,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

const uploadProof = async ({ paymentId, userId, file }) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${paymentId}-${Date.now()}.${fileExt}`;
  const filePath = fileName;

  const { error: uploadError } = await supabase.storage
    .from('payment-proofs')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('payment-proofs')
    .getPublicUrl(filePath);

  // Update payment metadata with proof URL
  const { error: updateError } = await supabase
    .from('payments')
    .update({
      metadata: { proof_url: urlData.publicUrl, uploaded_at: new Date().toISOString() }
    })
    .eq('id', paymentId);

  if (updateError) throw updateError;

  return urlData.publicUrl;
};

const createBoost = async ({ userId, package: boostPackage, paymentId }) => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + boostPackage.duration_days * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from('active_boosts')
    .insert({
      user_id: userId,
      package_id: boostPackage.id,
      payment_id: paymentId,
      status: 'pending',
      starts_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ===== Main Component =====
const BoostManager = ({ estateFirmData, onBoostSuccess }) => {
  const { user } = useAuth();
  const [boostPackages, setBoostPackages] = useState([]);
  const [activeBoost, setActiveBoost] = useState(null);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState('principal');

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
      } catch (err) {
        console.warn('Could not fetch user role:', err);
        setUserRole('principal');
      }
    };
    getUserRole();
  }, [user]);

  const loadBoostData = async () => {
    try {
      const { data: packages } = await supabase
        .from('boost_packages')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });
      if (packages) setBoostPackages(packages);

      if (estateFirmData?.current_boost_id) {
        const { data: boost } = await supabase
          .from('active_boosts')
          .select('*, boost_package:boost_package_id(*)')
          .eq('id', estateFirmData.current_boost_id)
          .single();
        if (boost) setActiveBoost(boost);
      }
    } catch (err) {
      console.error('Error loading boost data:', err);
    }
  };

  const handlePurchaseBoost = (pkg) => {
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
    const daysRemaining = Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24));
    return (
      <Alert variant={daysRemaining > 3 ? 'success' : 'warning'}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="d-flex align-items-center">
              <Zap size={20} className="me-2" />
              <strong>Profile is Boosted!</strong>
            </div>
            <small>Expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</small>
          </div>
          <Badge bg="success"><TrendingUp size={16} /> Boosted</Badge>
        </div>
      </Alert>
    );
  };

  if (userRole === 'associate') {
    return (
      <Card className="mb-4">
        <Card.Body className="text-center py-5">
          <Shield size={48} className="text-muted mb-3" />
          <h5>Access Restricted</h5>
          <p className="text-muted">Only Firm Principal and Executives can manage boosts.</p>
        </Card.Body>
      </Card>
    );
  }

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
                      <small>{pkg.duration_days} days</small>
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
        userRole={userRole}
      />
    </>
  );
};

// ===== Modal Component (uses embedded payment functions) =====
const BoostPurchaseModal = ({ show, onHide, boostPackage, onSuccess, user, userRole }) => {
  const [step, setStep] = useState('details');
  const [paymentRecord, setPaymentRecord] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const bankDetails = getBankDetails();

  if (userRole === 'associate') return null;

  const handleProceedToPayment = async () => {
    if (!boostPackage) return;
    setLoading(true);
    setError(null);
    try {
      const reference = generateReference('BST');
      const payment = await createPayment({
        userId: user.id,
        amount: boostPackage.price,
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
      await uploadProof({
        paymentId: paymentRecord.id,
        userId: user.id,
        file,
      });
      await createBoost({
        userId: user.id,
        package: boostPackage,
        paymentId: paymentRecord.id,
      });
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

  const handleClose = () => {
    setStep('details');
    setPaymentRecord(null);
    setFile(null);
    setError(null);
    onHide();
  };

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
                <small>{boostPackage.duration_days} days</small>
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
            <Button variant="warning" className="w-100" onClick={handleProceedToPayment} disabled={loading}>
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
                  <div><strong>Bank Name:</strong> {bankDetails.bankName}</div>
                  <div><strong>Account Number:</strong> {bankDetails.accountNumber}</div>
                  <div><strong>Account Name:</strong> {bankDetails.accountName}</div>
                  <div><strong>Amount:</strong> ₦{paymentRecord.amount?.toLocaleString()}</div>
                  <div><strong>Reference:</strong> {paymentRecord.reference}</div>
                </div>
              </Card.Body>
            </Card>
            <div className="mb-3">
              <label className="form-label">Upload Proof of Payment</label>
              <div className="border rounded p-3 text-center">
                {file ? (
                  <div className="d-flex align-items-center justify-content-between">
                    <span>{file.name}</span>
                    <Button variant="link" size="sm" onClick={() => setFile(null)}><X size={16} /></Button>
                  </div>
                ) : (
                  <>
                    <Upload size={32} className="text-muted mb-2" />
                    <p className="text-muted mb-2">Click to upload or drag and drop</p>
                    <small className="text-muted d-block">PNG, JPG up to 5MB</small>
                    <Form.Control type="file" accept="image/*" onChange={handleFileChange} className="mt-2" />
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
            <Button variant="secondary" onClick={() => setStep('details')}>Back</Button>
            <Button variant="warning" onClick={handleUploadProof} disabled={!file || uploading}>
              {uploading ? 'Uploading...' : 'Submit Proof'}
            </Button>
          </>
        )}
        {step === 'details' && (
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default BoostManager;