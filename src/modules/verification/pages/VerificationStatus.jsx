// src/modules/verification/pages/VerificationStatus.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../shared/lib/supabaseClient';
import './VerificationStatus.css';

const VerificationStatus = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [verificationData, setVerificationData] = useState({
    status: 'pending',
    submittedAt: null,
    reviewedAt: null,
    estimatedCompletion: null,
    reviewer: null,
    notes: '',
    trustScore: 0,
    level: 'basic'
  });
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [role, setRole] = useState(user?.role || 'tenant');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadVerificationStatus();
  }, [user]);

  const loadVerificationStatus = async () => {
    setLoading(true);
    try {
      // Determine which table to query
      let table = 'profiles';
      let userColumn = 'id';
      let statusField = 'kyc_status';
      let submittedField = 'kyc_submitted_at';
      let reviewedField = 'kyc_verified_at';
      let reviewerField = 'kyc_verified_by'; // optional
      let notesField = 'kyc_rejection_reason';
      let trustField = 'trust_score';
      let levelField = 'verification_level';

      if (user.role === 'estate-firm') {
        table = 'estate_firm_profiles';
        userColumn = 'user_id';
        statusField = 'verification_status';
        submittedField = 'verification_submitted_at';
        reviewedField = 'verification_verified_at';
        reviewerField = 'verified_by';
        notesField = 'rejection_reason';
        trustField = 'rating'; // or similar; fallback
        levelField = 'verification_level';
      }

      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq(userColumn, user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const status = data[statusField] || 'not_started';
        const submitted = data[submittedField];
        const reviewed = data[reviewedField];
        const reviewer = data[reviewerField];
        const notes = data[notesField] || '';
        const trustScore = data[trustField] || 50;
        const level = data[levelField] || 'basic';

        setVerificationData({
          status,
          submittedAt: submitted,
          reviewedAt: reviewed,
          estimatedCompletion: submitted ? new Date(new Date(submitted).getTime() + 48 * 3600000).toISOString() : null,
          reviewer,
          notes,
          trustScore,
          level
        });
      } else {
        // No verification submitted yet
        setVerificationData(prev => ({ ...prev, status: 'not_started' }));
      }
    } catch (error) {
      console.error('Error loading verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer (same as before)
  useEffect(() => {
    const interval = setInterval(() => {
      const estimated = verificationData.estimatedCompletion;
      if (!estimated) {
        setTimeRemaining('');
        return;
      }
      const now = new Date();
      const est = new Date(estimated);
      const diff = est - now;
      if (diff <= 0) {
        setTimeRemaining('Ready for review');
        clearInterval(interval);
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining(`${hours}h ${minutes}m`);
    }, 60000);
    return () => clearInterval(interval);
  }, [verificationData.estimatedCompletion]);

  const getStatusConfig = (status) => {
    const configs = {
      verified: {
        title: 'Verified! 🎉',
        subtitle: 'Your account has been successfully verified',
        icon: '✅',
        color: '#10b981',
        bgColor: '#d1fae5',
        badge: 'VERIFIED',
        buttonText: 'View Verified Profile',
        buttonAction: () => navigate('/profile'),
        showCountdown: false
      },
      approved: { // for estate firms
        title: 'Verified! 🎉',
        subtitle: 'Your business has been successfully verified',
        icon: '✅',
        color: '#10b981',
        bgColor: '#d1fae5',
        badge: 'VERIFIED',
        buttonText: 'Go to Dashboard',
        buttonAction: () => navigate('/dashboard'),
        showCountdown: false
      },
      pending: {
        title: 'Under Review',
        subtitle: 'Your verification is being processed',
        icon: '⏳',
        color: '#f59e0b',
        bgColor: '#fef3c7',
        badge: 'PENDING',
        buttonText: 'Check for Updates',
        buttonAction: () => loadVerificationStatus(),
        showCountdown: true
      },
      rejected: {
        title: 'Action Required',
        subtitle: 'Your verification needs attention',
        icon: '❌',
        color: '#ef4444',
        bgColor: '#fee2e2',
        badge: 'REJECTED',
        buttonText: 'Resubmit Documents',
        buttonAction: () => navigate('/verify/submit'),
        showCountdown: false
      },
      not_started: {
        title: 'Verification Not Started',
        subtitle: 'Please submit your documents to get verified',
        icon: '📝',
        color: '#6b7280',
        bgColor: '#f3f4f6',
        badge: 'NOT STARTED',
        buttonText: 'Start Verification',
        buttonAction: () => navigate('/verify/submit'),
        showCountdown: false
      }
    };
    return configs[status] || configs.pending;
  };

  const getVerificationSteps = () => {
    const steps = [
      { id: 1, title: 'Submitted', status: 'completed', date: verificationData.submittedAt },
      { id: 2, title: 'Under Review', status: verificationData.status === 'pending' ? 'active' : 'completed' },
      { id: 3, title: verificationData.status === 'verified' ? 'Verified' : 'Processing', 
        status: verificationData.status === 'verified' ? 'completed' : 
                verificationData.status === 'rejected' ? 'failed' : 'pending' }
    ];
    
    return steps;
  };

  const getBenefitsByRole = () => {
    const role = user?.role || 'tenant';
    
    if (role === 'tenant') {
      return [
        { icon: '👑', title: 'Verified Badge', description: 'Show credibility on your profile' },
        { icon: '🚀', title: 'Priority Consideration', description: 'Get noticed faster by landlords' },
        { icon: '⚡', title: 'Faster Approval', description: 'Quick rental application processing' },
        { icon: '💰', title: 'Better Deals', description: 'Access to exclusive listings' }
      ];
    } else if (role === 'landlord') {
      return [
        { icon: '👑', title: 'Verified Badge', description: 'Build trust with tenants' },
        { icon: '🚀', title: 'More Visibility', description: 'Priority in search results' },
        { icon: '🤝', title: 'Higher Response Rate', description: 'Get more tenant applications' },
        { icon: '⚡', title: 'Faster Rentals', description: 'Quick property rental process' }
      ];
    }
    
    return [];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTrustScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading verification status...</p>
      </div>
    );
  }

  const statusConfig = getStatusConfig(verificationData.status);
  const steps = getVerificationSteps();
  const benefits = getBenefitsByRole();

  return (
    <div className="verification-status">
      {/* Hero Section */}
      <div className="status-hero" style={{ backgroundColor: statusConfig.bgColor }}>
        <div className="hero-content">
          <div className="hero-icon" style={{ color: statusConfig.color }}>
            {statusConfig.icon}
          </div>
          <div className="hero-text">
            <h1>{statusConfig.title}</h1>
            <p>{statusConfig.subtitle}</p>
          </div>
          <div className="hero-badge" style={{ backgroundColor: statusConfig.color }}>
            {statusConfig.badge}
          </div>
        </div>
        
        {statusConfig.showCountdown && timeRemaining && (
          <div className="countdown-timer">
            <div className="timer-icon">⏱️</div>
            <div className="timer-text">
              <span className="timer-label">Estimated completion:</span>
              <span className="timer-value">{timeRemaining}</span>
            </div>
          </div>
        )}
      </div>

      <div className="status-container">
        {/* Trust Score & Progress */}
        <div className="trust-score-section">
          <div className="trust-score-card">
            <div className="score-header">
              <h3>Trust Score</h3>
              <div className="score-badge" style={{ 
                backgroundColor: getTrustScoreColor(verificationData.trustScore),
                color: 'white'
              }}>
                {verificationData.trustScore}/100
              </div>
            </div>
            
            <div className="score-meter">
              <div 
                className="score-fill" 
                style={{ 
                  width: `${verificationData.trustScore}%`,
                  backgroundColor: getTrustScoreColor(verificationData.trustScore)
                }}
              ></div>
            </div>
            
            <div className="score-level">
              <span className="level-label">Verification Level:</span>
              <span className="level-value">{verificationData.level.toUpperCase()}</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="timeline-section">
            <h3>Verification Timeline</h3>
            <div className="timeline">
              {steps.map((step, index) => (
                <div key={step.id} className="timeline-step">
                  <div className={`step-marker ${step.status}`}>
                    <div className="marker-icon">
                      {step.status === 'completed' ? '✓' : 
                       step.status === 'failed' ? '✗' : 
                       step.status === 'active' ? '●' : '○'}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="step-connector"></div>
                    )}
                  </div>
                  <div className="step-content">
                    <h4>{step.title}</h4>
                    {step.date && (
                      <p className="step-date">{formatDate(step.date)}</p>
                    )}
                    <p className="step-status">{step.status.toUpperCase()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="details-grid">
          <div className="detail-card">
            <div className="detail-icon">📅</div>
            <div className="detail-content">
              <h4>Submitted</h4>
              <p>{formatDate(verificationData.submittedAt)}</p>
            </div>
          </div>
          
          <div className="detail-card">
            <div className="detail-icon">⏱️</div>
            <div className="detail-content">
              <h4>Estimated Completion</h4>
              <p>{formatDate(verificationData.estimatedCompletion)}</p>
            </div>
          </div>
          
          {verificationData.reviewedAt && (
            <div className="detail-card">
              <div className="detail-icon">✅</div>
              <div className="detail-content">
                <h4>Reviewed</h4>
                <p>{formatDate(verificationData.reviewedAt)}</p>
                {verificationData.reviewer && (
                  <small>By: {verificationData.reviewer}</small>
                )}
              </div>
            </div>
          )}
          
          <div className="detail-card">
            <div className="detail-icon">📊</div>
            <div className="detail-content">
              <h4>Processing Time</h4>
              <p>24-48 Hours</p>
              <small>Average verification time</small>
            </div>
          </div>
        </div>

        {/* Rejection Notes (if applicable) */}
        {verificationData.status === 'rejected' && verificationData.notes && (
          <div className="rejection-section">
            <div className="section-header">
              <div className="header-icon">📝</div>
              <h3>Review Notes</h3>
            </div>
            <div className="rejection-content">
              <p>{verificationData.notes}</p>
              <div className="common-issues">
                <h4>Common Issues:</h4>
                <ul>
                  <li>Blurry or unclear documents</li>
                  <li>Information mismatch</li>
                  <li>Expired ID documents</li>
                  <li>Missing required documents</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Benefits Section */}
        <div className="benefits-section">
          <div className="section-header">
            <div className="header-icon">✨</div>
            <h3>Benefits of Verification</h3>
          </div>
          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-card">
                <div className="benefit-icon">{benefit.icon}</div>
                <div className="benefit-content">
                  <h4>{benefit.title}</h4>
                  <p>{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-section">
          <div className="action-buttons">
            <button 
              className="btn btn-primary"
              onClick={statusConfig.buttonAction}
            >
              {statusConfig.buttonText}
            </button>
            
            <button 
              className="btn btn-outline"
              onClick={() => navigate('/verify')}
            >
              Back to Verification Hub
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </button>
          </div>
          
          <div className="support-info">
            <div className="support-icon">💬</div>
            <div className="support-content">
              <h4>Need Help?</h4>
              <p>Contact support at <strong>support@renteasy.com</strong> or call <strong>0700-RENTEASY</strong></p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h3>Frequently Asked Questions</h3>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>How long does verification take?</h4>
              <p>Typically 24-48 hours. Complex cases may take up to 72 hours.</p>
            </div>
            <div className="faq-item">
              <h4>Can I track my verification progress?</h4>
              <p>Yes, you can check back here anytime for updates.</p>
            </div>
            <div className="faq-item">
              <h4>What if my documents are rejected?</h4>
              <p>We'll provide feedback and you can resubmit corrected documents.</p>
            </div>
            <div className="faq-item">
              <h4>Is my information secure?</h4>
              <p>Yes, we use bank-level encryption and follow strict data protection protocols.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationStatus;