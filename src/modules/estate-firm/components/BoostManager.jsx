// src/modules/estate-firm/components/BoostManager.jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Badge, Alert, Modal } from 'react-bootstrap';
import { Zap, TrendingUp, Clock, Crown, Check } from 'lucide-react';
import { paymentSystem } from '../../../shared/lib/paymentSystem';
import { supabase } from '../../../shared/lib/supabaseClient';

const BoostManager = ({ estateFirmData, onBoostSuccess }) => {
  const [boostPackages, setBoostPackages] = useState([]);
  const [activeBoost, setActiveBoost] = useState(null);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBoostData();
  }, []);

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
      />
    </>
  );
};

// Boost Purchase Modal Component
const BoostPurchaseModal = ({ show, onHide, boostPackage, onSuccess }) => {
  const [step, setStep] = useState('details');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [uploadedProof, setUploadedProof] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInitiatePayment = async () => {
    if (!boostPackage) return;

    setLoading(true);
    setError(null);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      
      // Get service provider ID
      const { data: sp, error: spError } = await supabase
        .from('service_providers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (spError) throw spError;

      // Create payment record
      const result = await paymentSystem.processBoost(
        user.id,
        boostPackage.id,
        sp.id
      );

      setPaymentDetails(result);
      setStep('payment');
    } catch (err) {
      setError(err.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  // ... Similar to SubscriptionModal but for boosts
  // Add similar payment proof upload functionality

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Purchase Boost</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {boostPackage && (
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

            <Button 
              variant="warning" 
              className="w-100"
              onClick={handleInitiatePayment}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Purchase Now'}
            </Button>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default BoostManager;