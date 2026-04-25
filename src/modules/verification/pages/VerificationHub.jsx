// src/modules/verification/pages/VerificationHub.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../shared/lib/supabaseClient';
import './VerificationHub.css';

const VerificationHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [verificationStatus, setVerificationStatus] = useState({
    status: 'not_started',
    submittedDate: null,
    verifiedDate: null,
    trustScore: 0,
    level: 'basic'
  });
  const [requirements, setRequirements] = useState([]);
  const [stats, setStats] = useState({
    responseRate: '0%',
    listingViews: '0x',
    approvalSpeed: '0%'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadVerificationData();
  }, [user]);

  const getTargetTable = () => {
    switch (user?.role) {
      case 'tenant':
      case 'landlord':
      case 'manager':
        return 'profiles';
      case 'service-provider':
      case 'provider':
        return 'service_providers';
      case 'estate-firm':
      case 'estate_firm':
        return 'estate_firm_profiles';
      default:
        return 'profiles';
    }
  };

  const loadVerificationData = async () => {
    setLoading(true);
    try {
      const table = getTargetTable();
      let data = null;

      if (table === 'profiles') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('kyc_status, kyc_submitted_at, kyc_verified_at, trust_score, verification_level')
          .eq('id', user.id)
          .single();
        data = profile;
      } else if (table === 'service_providers') {
        const { data: provider } = await supabase
          .from('service_providers')
          .select('kyc_status, kyc_submitted_at, kyc_verified_at')
          .eq('user_id', user.id)
          .maybeSingle();
        data = provider;
      } else if (table === 'estate_firm_profiles') {
        const { data: firm } = await supabase
          .from('estate_firm_profiles')
          .select('verification_status, verification_submitted_at, verification_verified_at')
          .eq('user_id', user.id)
          .maybeSingle();
        data = firm ? {
          kyc_status: firm.verification_status,
          kyc_submitted_at: firm.verification_submitted_at,
          kyc_verified_at: firm.verification_verified_at
        } : null;
      }

      if (data) {
        setVerificationStatus({
          status: data.kyc_status || 'not_started',
          submittedDate: data.kyc_submitted_at,
          verifiedDate: data.kyc_verified_at,
          trustScore: data.trust_score || 0,
          level: data.verification_level || 'basic'
        });
      }

      loadRoleRequirements();
      calculateStats(data?.kyc_status);
    } catch (error) {
      console.error('Error loading verification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoleRequirements = () => {
    const role = user?.role || 'tenant';
    if (role === 'tenant') {
      setRequirements([
        { id: 1, title: 'Identity Verification', description: 'Upload government-issued ID card', completed: false, icon: '🆔', required: true },
        { id: 2, title: 'Proof of Address', description: 'Recent utility bill or bank statement', completed: false, icon: '📍', required: true },
        { id: 3, title: 'Selfie with ID', description: 'Photo holding your ID card', completed: false, icon: '📸', required: true },
        { id: 4, title: 'Employment Details', description: 'Proof of income or employment letter', completed: false, icon: '💼', required: false }
      ]);
    } else if (role === 'landlord') {
      setRequirements([
        { id: 1, title: 'Identity Verification', description: 'Government-issued ID card', completed: false, icon: '🆔', required: true },
        { id: 2, title: 'Proof of Ownership', description: 'Property documents or title deed', completed: false, icon: '🏠', required: true },
        { id: 3, title: 'Bank Verification', description: 'Bank statement or account details', completed: false, icon: '🏦', required: true },
        { id: 4, title: 'Tax Information', description: 'Tax identification number (TIN)', completed: false, icon: '💰', required: false }
      ]);
    }
  };

  const calculateStats = (status) => {
    if (status === 'verified') {
      setStats({ responseRate: '65%', listingViews: '3x', approvalSpeed: '50%' });
    } else if (status === 'pending') {
      setStats({ responseRate: '25%', listingViews: '1.5x', approvalSpeed: '25%' });
    } else {
      setStats({ responseRate: '0%', listingViews: '1x', approvalSpeed: '0%' });
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      verified: {
        title: 'Verified Account',
        subtitle: 'Your account is fully verified',
        icon: '✅',
        color: '#10b981',
        bgColor: '#d1fae5',
        buttonText: 'View Benefits',
        buttonAction: () => navigate('/profile'),
        badgeText: 'VERIFIED'
      },
      pending: {
        title: 'Under Review',
        subtitle: 'Your verification is being processed',
        icon: '⏳',
        color: '#f59e0b',
        bgColor: '#fef3c7',
        buttonText: 'Check Status',
        buttonAction: () => navigate('/verify/status'),
        badgeText: 'PENDING'
      },
      rejected: {
        title: 'Verification Required',
        subtitle: 'Please update and resubmit your documents',
        icon: '❌',
        color: '#ef4444',
        bgColor: '#fee2e2',
        buttonText: 'Resubmit',
        buttonAction: () => navigate('/verify/submit'),
        badgeText: 'ACTION REQUIRED'
      },
      not_started: {
        title: 'Get Verified',
        subtitle: 'Complete verification to unlock benefits',
        icon: '📝',
        color: '#6366f1',
        bgColor: '#e0e7ff',
        buttonText: 'Start Verification',
        buttonAction: () => navigate('/verify/submit'),
        badgeText: 'NOT VERIFIED'
      }
    };
    return configs[status] || configs.not_started;
  };

  const getRoleBenefits = () => {
    if (user?.role === 'tenant') {
      return [
        'Priority in rental applications',
        'Higher trust score with landlords',
        'Faster approval process',
        'Verified badge on your profile',
        'Access to premium listings',
        'Lower security deposits'
      ];
    } else if (user?.role === 'landlord') {
      return [
        'Verified badge on all listings',
        'Higher response rates from tenants',
        'Priority in search results',
        'Access to premium tenants',
        'Faster rental process',
        'Enhanced credibility'
      ];
    }
    return [];
  };

  const startVerification = () => navigate('/verify/form');

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading verification details...</p>
      </div>
    );
  }

  const statusConfig = getStatusConfig(verificationStatus.status);
  const roleBenefits = getRoleBenefits();

 return (
    <div className="verification-hub">
      {/* Hero Section */}
      <div className="verification-hero">
        <div className="hero-content">
          <div className="hero-icon" style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}>
            {statusConfig.icon}
          </div>
          <h1 className="hero-title">{statusConfig.title}</h1>
          <p className="hero-subtitle">{statusConfig.subtitle}</p>
          <div className="hero-badge" style={{ backgroundColor: statusConfig.color }}>
            {statusConfig.badgeText}
          </div>
        </div>
        
        {verificationStatus.status !== 'verified' && (
          <button 
            className="hero-button"
            onClick={startVerification}
            style={{ backgroundColor: statusConfig.color }}
          >
            {statusConfig.buttonText}
          </button>
        )}
      </div>

      {/* Status Overview */}
      <div className="status-overview">
        <div className="status-card">
          <div className="status-header">
            <h3>Verification Details</h3>
            <span className="trust-score">
              Trust Score: <strong>{verificationStatus.trustScore}/100</strong>
            </span>
          </div>
          
          <div className="status-details">
            <div className="detail-item">
              <span className="detail-label">Status:</span>
              <span className="detail-value" style={{ color: statusConfig.color }}>
                {verificationStatus.status.toUpperCase()}
              </span>
            </div>
            
            {verificationStatus.submittedDate && (
              <div className="detail-item">
                <span className="detail-label">Submitted:</span>
                <span className="detail-value">
                  {new Date(verificationStatus.submittedDate).toLocaleDateString()}
                </span>
              </div>
            )}
            
            {verificationStatus.verifiedDate && (
              <div className="detail-item">
                <span className="detail-label">Verified:</span>
                <span className="detail-value">
                  {new Date(verificationStatus.verifiedDate).toLocaleDateString()}
                </span>
              </div>
            )}
            
            <div className="detail-item">
              <span className="detail-label">Level:</span>
              <span className="detail-value">{verificationStatus.level.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h4>{stats.responseRate}</h4>
              <p>Higher Response Rate</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">👁️</div>
            <div className="stat-content">
              <h4>{stats.listingViews}</h4>
              <p>More Listing Views</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <h4>{stats.approvalSpeed}</h4>
              <p>Faster Approval</p>
            </div>
          </div>
        </div>
      </div>

      {/* Requirements Section */}
      <div className="requirements-section">
        <h2>Verification Requirements</h2>
        <p className="section-subtitle">
          Complete these steps to get verified as a <strong>{user?.role?.toUpperCase()}</strong>
        </p>
        
        <div className="requirements-list">
          {requirements.map((req) => (
            <div key={req.id} className="requirement-item">
              <div className="requirement-icon">{req.icon}</div>
              <div className="requirement-content">
                <h4>{req.title}</h4>
                <p>{req.description}</p>
                {req.required && <span className="required-badge">Required</span>}
              </div>
              <div className="requirement-status">
                {req.completed ? (
                  <span className="status-completed">✅ Completed</span>
                ) : (
                  <span className="status-pending">⏳ Pending</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="benefits-section">
        <h2>Benefits of Being Verified</h2>
        <p className="section-subtitle">
          Unlock these advantages when you complete verification
        </p>
        
        <div className="benefits-grid">
          {roleBenefits.map((benefit, index) => (
            <div key={index} className="benefit-card">
              <div className="benefit-icon">✨</div>
              <h4>{benefit}</h4>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="cta-card">
          <div className="cta-content">
            <h3>Ready to Get Verified?</h3>
            <p>
              Complete your verification in just 10 minutes and start enjoying 
              all the benefits of being a verified {user?.role} on RentEasy.
            </p>
          </div>
          <div className="cta-actions">
            {verificationStatus.status === 'not_started' && (
              <button 
                className="btn btn-primary btn-lg"
                onClick={startVerification}
              >
                Start Verification Now
              </button>
            )}
            
            {verificationStatus.status === 'pending' && (
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/verify/status')}
              >
                Check Verification Status
              </button>
            )}
            
            {verificationStatus.status === 'verified' && (
              <button 
                className="btn btn-success"
                onClick={() => navigate('/profile')}
              >
                View Your Verified Profile
              </button>
            )}
            
            {verificationStatus.status === 'rejected' && (
              <button 
                className="btn btn-primary"
                onClick={startVerification}
              >
                Resubmit Documents
              </button>
            )}
            
            <button 
              className="btn btn-outline"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        
        <div className="faq-grid">
          <div className="faq-item">
            <h4>How long does verification take?</h4>
            <p>Typically 24-48 hours after submission. You'll receive an email notification.</p>
          </div>
          
          <div className="faq-item">
            <h4>Is my information secure?</h4>
            <p>Yes, we use bank-level encryption and your data is never shared with third parties.</p>
          </div>
          
          <div className="faq-item">
            <h4>Can I update my documents?</h4>
            <p>Yes, you can update your documents anytime from your profile settings.</p>
          </div>
          
          <div className="faq-item">
            <h4>What if my verification is rejected?</h4>
            <p>We'll provide specific feedback. You can resubmit with corrected documents.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerificationHub