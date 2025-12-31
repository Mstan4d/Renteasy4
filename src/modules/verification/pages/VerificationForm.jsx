// src/modules/verification/pages/VerificationForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import './VerificationForm.css';

const VerificationForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: '',
    nationality: '',
    
    // Step 2: Identity Verification
    idType: 'national_id',
    idNumber: '',
    idDocument: null,
    selfiePhoto: null,
    
    // Step 3: Address Verification
    currentAddress: '',
    proofOfAddress: null,
    
    // Step 4: Additional Information
    employmentStatus: '',
    monthlyIncome: '',
    referenceName: '',
    referencePhone: '',
    referenceEmail: '',
    
    // Terms
    acceptTerms: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get existing verifications
      const existingVerifications = JSON.parse(localStorage.getItem('verifications') || '[]');
      
      const newVerification = {
        id: `verif_${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: 'tenant',
        submittedAt: new Date().toISOString(),
        status: 'pending',
        formData: formData,
        reviewedBy: null,
        reviewedAt: null,
        feedback: null
      };

      // Save to localStorage
      existingVerifications.push(newVerification);
      localStorage.setItem('verifications', JSON.stringify(existingVerifications));

      // Update user verification status
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, verificationStatus: 'pending' } : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setLoading(false);
      navigate('/verify/status');
    } catch (error) {
      console.error('Error submitting verification:', error);
      setLoading(false);
      alert('Error submitting verification. Please try again.');
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="verification-step">
            <h3>Personal Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nationality *</label>
                <select
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select nationality</option>
                  <option value="Nigerian">Nigerian</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="verification-step">
            <h3>Identity Verification</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>ID Type *</label>
                <select
                  name="idType"
                  value={formData.idType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="national_id">National ID Card</option>
                  <option value="passport">International Passport</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="voters_card">Voter's Card</option>
                </select>
              </div>
              <div className="form-group">
                <label>ID Number *</label>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Upload ID Document (Front) *</label>
                <input
                  type="file"
                  name="idDocument"
                  onChange={handleInputChange}
                  accept=".jpg,.jpeg,.png,.pdf"
                  required
                />
                <small className="help-text">
                  Accepts JPG, PNG, or PDF (Max 5MB)
                </small>
              </div>
              <div className="form-group">
                <label>Upload Selfie Photo *</label>
                <input
                  type="file"
                  name="selfiePhoto"
                  onChange={handleInputChange}
                  accept=".jpg,.jpeg,.png"
                  required
                />
                <small className="help-text">
                  Clear photo of your face holding your ID
                </small>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="verification-step">
            <h3>Address Verification</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Current Address *</label>
                <textarea
                  name="currentAddress"
                  value={formData.currentAddress}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </div>
              <div className="form-group">
                <label>Proof of Address *</label>
                <input
                  type="file"
                  name="proofOfAddress"
                  onChange={handleInputChange}
                  accept=".jpg,.jpeg,.png,.pdf"
                  required
                />
                <small className="help-text">
                  Utility bill, bank statement, or government letter (last 3 months)
                </small>
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="verification-step">
            <h3>Additional Information & References</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Employment Status *</label>
                <select
                  name="employmentStatus"
                  value={formData.employmentStatus}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select status</option>
                  <option value="employed">Employed</option>
                  <option value="self_employed">Self-Employed</option>
                  <option value="student">Student</option>
                  <option value="unemployed">Currently Unemployed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Monthly Income (₦) *</label>
                <input
                  type="number"
                  name="monthlyIncome"
                  value={formData.monthlyIncome}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Reference Name *</label>
                <input
                  type="text"
                  name="referenceName"
                  value={formData.referenceName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Reference Phone *</label>
                <input
                  type="tel"
                  name="referencePhone"
                  value={formData.referencePhone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Reference Email *</label>
                <input
                  type="email"
                  name="referenceEmail"
                  value={formData.referenceEmail}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="terms-section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  required
                />
                <span>
                  I agree to the terms and conditions and confirm that all information provided is accurate.
                </span>
              </label>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="verification-form">
      <div className="verification-header">
        <h1>Tenant Verification</h1>
        <p>Complete your verification to increase trust with landlords</p>
      </div>

      {/* Progress Steps */}
      <div className="progress-steps">
        {[1, 2, 3, 4].map((stepNumber) => (
          <div key={stepNumber} className={`step ${stepNumber === step ? 'active' : ''} ${stepNumber < step ? 'completed' : ''}`}>
            <div className="step-number">{stepNumber}</div>
            <div className="step-label">
              {stepNumber === 1 && 'Personal Info'}
              {stepNumber === 2 && 'Identity'}
              {stepNumber === 3 && 'Address'}
              {stepNumber === 4 && 'References'}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {renderStep()}
        
        <div className="form-actions">
          {step > 1 && (
            <button type="button" className="btn btn-outline" onClick={prevStep}>
              Back
            </button>
          )}
          
          {step < 4 ? (
            <button type="button" className="btn btn-primary" onClick={nextStep}>
              Continue
            </button>
          ) : (
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Verification'}
            </button>
          )}
        </div>
      </form>

      {/* Benefits Section */}
      <div className="verification-benefits">
        <h3>Benefits of Verification</h3>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">⭐</div>
            <h4>Priority in Applications</h4>
            <p>Landlords prefer verified tenants</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🔒</div>
            <h4>Increased Trust</h4>
            <p>Build credibility with property owners</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">⚡</div>
            <h4>Faster Approval</h4>
            <p>Get approved for rentals quicker</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🎁</div>
            <h4>Exclusive Features</h4>
            <p>Access premium features and discounts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationForm;