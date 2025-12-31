// src/modules/verification/pages/VerificationHub.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../shared/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './VerificationHub.css'

const VerificationHub = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [verificationData, setVerificationData] = useState({
    status: 'not_started', // 'not_started', 'pending', 'verified', 'rejected'
    type: user?.role || 'tenant',
    submittedDate: null,
    verifiedDate: null,
    documents: [],
    verificationLevel: 0 // 0-3 (Basic to Premium)
  })
  
  const [userStats, setUserStats] = useState({
    posts: 0,
    responseRate: 0,
    verifiedPosts: 0
  })

  useEffect(() => {
    // Load verification data from localStorage or API
    const savedVerification = JSON.parse(localStorage.getItem(`verification_${user?.id}`)) || {
      status: 'not_started',
      type: user?.role || 'tenant'
    }
    setVerificationData(savedVerification)
    
    // Calculate user stats
    const userPosts = JSON.parse(localStorage.getItem('userPosts')) || []
    const verifiedPosts = userPosts.filter(post => post.verified).length
    
    setUserStats({
      posts: userPosts.length,
      responseRate: 75, // Mock data
      verifiedPosts
    })
  }, [user])

  const startVerification = () => {
    navigate('/verify/submit')
  }

  const getVerificationBenefits = () => {
    if (user?.role === 'landlord') {
      return [
        'Verified badge on all your listings',
        'Priority in search results',
        'Higher response rates from tenants',
        'Access to premium features',
        'Verified landlord certificate'
      ]
    } else if (user?.role === 'tenant') {
      return [
        'Verified badge on your profile',
        'Priority consideration by landlords',
        'Faster application processing',
        'Build rental history',
        'Higher credibility'
      ]
    } else if (user?.role === 'estate-firm') {
      return [
        'Professional verification badge',
        'Featured in marketplace',
        'Higher trust score',
        'Access to premium tools',
        'Verified partner status'
      ]
    }
    return []
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'verified': { text: 'Verified', color: 'green' },
      'pending': { text: 'Under Review', color: 'orange' },
      'not_started': { text: 'Not Verified', color: 'gray' },
      'rejected': { text: 'Verification Failed', color: 'red' }
    }
    
    const config = statusConfig[status] || statusConfig.not_started
    
    return (
      <span className={`status-badge status-${config.color}`}>
        {config.text}
      </span>
    )
  }

  return (
    <div className="verification-hub">
      {/* Header */}
      <div className="verification-header">
        <h1>Get Verified</h1>
        <p>Build trust and increase your success rate on RentEasy</p>
      </div>

      {/* Status Overview */}
      <div className="verification-status-card">
        <div className="status-overview">
          <div className="status-indicator">
            <div className={`status-icon status-${verificationData.status}`}>
              {verificationData.status === 'verified' ? '✓' : '!'}
            </div>
            <div className="status-details">
              <h3>Verification Status</h3>
              <div className="status-display">
                {getStatusBadge(verificationData.status)}
                {verificationData.verifiedDate && (
                  <span className="verification-date">
                    Verified on {new Date(verificationData.verifiedDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {verificationData.status !== 'verified' && (
            <button 
              className="btn btn-primary btn-lg"
              onClick={startVerification}
            >
              Start Verification
            </button>
          )}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="benefits-section">
        <h2>Why Get Verified?</h2>
        <div className="benefits-grid">
          {getVerificationBenefits().map((benefit, index) => (
            <div key={index} className="benefit-card">
              <div className="benefit-icon">✓</div>
              <p>{benefit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Impact */}
      <div className="impact-section">
        <h2>Verification Impact</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{userStats.verifiedPosts}</div>
            <div className="stat-label">Verified Posts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{userStats.responseRate}%</div>
            <div className="stat-label">Higher Response Rate</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">3x</div>
            <div className="stat-label">More Views</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">50%</div>
            <div className="stat-label">Faster Transactions</div>
          </div>
        </div>
      </div>

      {/* Verification Levels */}
      <div className="levels-section">
        <h2>Verification Levels</h2>
        <div className="levels-grid">
          <div className="level-card">
            <h3>Basic KYC</h3>
            <ul>
              <li>ID Verification</li>
              <li>Basic Badge</li>
              <li>Standard Trust Score</li>
            </ul>
            <span className="level-status">Required</span>
          </div>
          
          <div className="level-card">
            <h3>Enhanced</h3>
            <ul>
              <li>Address Verification</li>
              <li>Income Verification</li>
              <li>Enhanced Badge</li>
            </ul>
            <span className="level-status">Optional</span>
          </div>
          
          <div className="level-card premium">
            <h3>Premium</h3>
            <ul>
              <li>Professional Verification</li>
              <li>Video Verification</li>
              <li>Premium Badge</li>
              <li>Featured Placement</li>
            </ul>
            <span className="level-status">Premium</span>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        {verificationData.status === 'not_started' ? (
          <>
            <h2>Ready to Get Verified?</h2>
            <p>Complete verification in just 5 minutes</p>
            <button 
              className="btn btn-primary btn-xl"
              onClick={startVerification}
            >
              Start Verification Now
            </button>
          </>
        ) : verificationData.status === 'pending' ? (
          <>
            <h2>Verification in Progress</h2>
            <p>Your documents are under review. You'll be notified once verified.</p>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/verify/status')}
            >
              Check Status
            </button>
          </>
        ) : verificationData.status === 'verified' ? (
          <>
            <h2>Congratulations! You're Verified</h2>
            <p>Your verified badge is now visible on all your posts and profile.</p>
            <button 
              className="btn btn-success"
              onClick={() => navigate('/profile')}
            >
              View Your Verified Profile
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}

export default VerificationHub