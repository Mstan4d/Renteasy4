// src/modules/verification/pages/VerificationStatus.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext'
import { useNavigate } from 'react-router-dom';
import './VerificationStatus.css';

const VerificationStatus = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [verificationStatus, setVerificationStatus] = useState({
    status: 'pending', // 'pending', 'verified', 'rejected', 'not_started'
    submittedAt: null,
    verifiedAt: null,
    estimatedCompletion: null,
    notes: ''
  });

  useEffect(() => {
    // Load verification status from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const pendingVerifications = JSON.parse(localStorage.getItem('pendingVerifications') || '[]');
    
    const userVerification = pendingVerifications.find(v => v.userId === user?.id);
    
    if (userVerification) {
      setVerificationStatus({
        status: userVerification.status || 'pending',
        submittedAt: userVerification.submittedAt,
        verifiedAt: userVerification.verifiedAt || null,
        estimatedCompletion: new Date(new Date(userVerification.submittedAt).getTime() + 48 * 60 * 60 * 1000),
        notes: userVerification.notes || ''
      });
    } else if (userData.verificationStatus) {
      setVerificationStatus({
        status: userData.verificationStatus,
        submittedAt: userData.verificationSubmittedAt,
        verifiedAt: userData.verificationVerifiedAt || null,
        estimatedCompletion: null,
        notes: ''
      });
    }
  }, [user]);

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        title: 'Verification Pending',
        message: 'Your verification request is being reviewed.',
        icon: '⏳',
        color: '#f59e0b',
        nextSteps: [
          'Our team will review your documents',
          'Typical processing time: 24-48 hours',
          'You will receive an email notification'
        ]
      },
      verified: {
        title: 'Verified! 🎉',
        message: 'Your account has been successfully verified.',
        icon: '✅',
        color: '#10b981',
        nextSteps: [
          'Verified badge added to your profile',
          'Increased trust score',
          'Priority in search results'
        ]
      },
      rejected: {
        title: 'Verification Required',
        message: 'Your verification needs attention.',
        icon: '❌',
        color: '#ef4444',
        nextSteps: [
          'Review the rejection notes below',
          'Update your documents',
          'Resubmit for verification'
        ]
      },
      not_started: {
        title: 'Start Verification',
        message: 'Complete verification to unlock all features.',
        icon: '📝',
        color: '#6b7280',
        nextSteps: [
          'Higher response rates',
          'Verified badge on posts',
          'Build credibility'
        ]
      }
    };
    
    return configs[status] || configs.not_started;
  };

  const statusConfig = getStatusConfig(verificationStatus.status);

  return (
    <div className="verification-status-page">
      <div className="status-card">
        {/* Status Header */}
        <div className="status-header" style={{ borderBottomColor: statusConfig.color }}>
          <div className="status-icon" style={{ backgroundColor: statusConfig.color }}>
            {statusConfig.icon}
          </div>
          <div className="status-title">
            <h1>{statusConfig.title}</h1>
            <p>{statusConfig.message}</p>
          </div>
        </div>

        {/* Status Details */}
        <div className="status-details">
          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <span 
              className="detail-value status-indicator"
              style={{ color: statusConfig.color }}
            >
              {verificationStatus.status.toUpperCase()}
            </span>
          </div>
          
          {verificationStatus.submittedAt && (
            <div className="detail-row">
              <span className="detail-label">Submitted:</span>
              <span className="detail-value">
                {new Date(verificationStatus.submittedAt).toLocaleString()}
              </span>
            </div>
          )}
          
          {verificationStatus.verifiedAt && (
            <div className="detail-row">
              <span className="detail-label">Verified:</span>
              <span className="detail-value">
                {new Date(verificationStatus.verifiedAt).toLocaleString()}
              </span>
            </div>
          )}
          
          {verificationStatus.estimatedCompletion && (
            <div className="detail-row">
              <span className="detail-label">Estimated Completion:</span>
              <span className="detail-value">
                {new Date(verificationStatus.estimatedCompletion).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="next-steps">
          <h3>What's Next?</h3>
          <ul className="steps-list">
            {statusConfig.nextSteps.map((step, index) => (
              <li key={index} className="step-item">
                <span className="step-icon">→</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Rejection Notes */}
        {verificationStatus.status === 'rejected' && verificationStatus.notes && (
          <div className="rejection-notes">
            <h3>Rejection Notes</h3>
            <div className="notes-content">
              <p>{verificationStatus.notes}</p>
              <p className="notes-help">
                Please update your documents and resubmit for verification.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          {verificationStatus.status === 'not_started' && (
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/verify')}
            >
              Start Verification
            </button>
          )}
          
          {verificationStatus.status === 'pending' && (
            <button 
              className="btn btn-secondary"
              onClick={() => {
                // Simulate checking for updates
                alert("Checking for updates... Your status is still pending.");
              }}
            >
              Check for Updates
            </button>
          )}
          
          {verificationStatus.status === 'rejected' && (
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/verify')}
            >
              Resubmit Verification
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
          
          <button 
            className="btn btn-outline"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </button>
        </div>

        {/* Verification Benefits */}
        <div className="verification-benefits">
          <h3>Benefits of Being Verified</h3>
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-icon">👑</div>
              <div className="benefit-text">Verified Badge</div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">🚀</div>
              <div className="benefit-text">Priority Listing</div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">🤝</div>
              <div className="benefit-text">Higher Trust</div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">💰</div>
              <div className="benefit-text">Better Rates</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationStatus;