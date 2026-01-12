// src/modules/verification/pages/VerificationForm.jsx - UPDATED
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { nigerianStates, getLGAsForState } from '../../../shared/data/nigerianLocations';
import './VerificationForm.css';

const VerificationForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // REMOVE the local nigerianStates array since we're importing it
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState({});
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: '',
    nationality: 'Nigerian',
    state: '',
    lga: '',
    address: '',
    
    // Step 2: Identity Verification
    idType: 'national_id',
    idNumber: '',
    idFront: null,
    idBack: null,
    selfie: null,
    proofOfAddress: null,
    
    // Step 3: Role-Specific Details
    employmentStatus: '',
    monthlyIncome: '',
    
    // For Landlords
    propertyDocument: null,
    
    // Terms
    acceptTerms: false
  });

  // Get LGAs for selected state
  const getLGAsForState = () => {
    if (!formData.state) return [];
    const stateData = nigerianStates.find(s => s.state === formData.state);
    return stateData ? stateData.lgas : [];
  };

  // Set role-specific steps
  const steps = user?.role === 'landlord' ? [
    { number: 1, title: 'Personal Info', icon: '👤' },
    { number: 2, title: 'ID Verification', icon: '🆔' },
    { number: 3, title: 'Property Proof', icon: '🏠' },
    { number: 4, title: 'Review & Submit', icon: '📋' }
  ] : [
    { number: 1, title: 'Personal Info', icon: '👤' },
    { number: 2, title: 'ID Verification', icon: '🆔' },
    { number: 3, title: 'Employment', icon: '💼' },
    { number: 4, title: 'Review & Submit', icon: '📋' }
  ];

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size too large. Maximum size is 5MB.');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload JPG, PNG, or PDF files.');
      return;
    }

    // Simulate upload progress
    setUploadProgress(prev => ({ ...prev, [field]: 0 }));
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev[field] + 20;
        if (newProgress >= 100) {
          clearInterval(interval);
          
          // Create a preview URL for images
          let previewUrl = '';
          if (file.type.startsWith('image/')) {
            previewUrl = URL.createObjectURL(file);
          } else {
            previewUrl = '📄'; // PDF icon
          }
          
          setFormData(prev => ({
            ...prev,
            [field]: previewUrl,
            [`${field}File`]: file
          }));
          
          return { ...prev, [field]: 100 };
        }
        return { ...prev, [field]: newProgress };
      });
    }, 100);
  };

  const removeFile = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: null,
      [`${field}File`]: null
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep = (stepNumber) => {
    switch(stepNumber) {
      case 1:
        return formData.fullName && formData.phone && formData.dateOfBirth && 
               formData.nationality && formData.state && formData.lga && formData.address;
      
      case 2:
        return formData.idType && formData.idNumber && formData.idFront && 
               formData.selfie && formData.proofOfAddress;
      
      case 3:
        if (user?.role === 'landlord') {
          return formData.propertyDocument;
        } else {
          return formData.employmentStatus && formData.monthlyIncome;
        }
      
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (!validateStep(step)) {
      alert('Please complete all required fields before proceeding.');
      return;
    }
    
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    try {
      // Get existing verifications
      const existingVerifications = JSON.parse(localStorage.getItem('verifications') || '[]');
      
      const newVerification = {
        id: `verif_${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
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

      // Update kycVerifications for consistency
      const kycVerifications = JSON.parse(localStorage.getItem('kycVerifications') || '[]');
      const userKYCIndex = kycVerifications.findIndex(k => k.userId === user.id);
      
      if (userKYCIndex !== -1) {
        kycVerifications[userKYCIndex] = {
          ...kycVerifications[userKYCIndex],
          status: 'pending',
          level: 'basic',
          submittedAt: new Date().toISOString(),
          trustScore: 50
        };
      } else {
        kycVerifications.push({
          userId: user.id,
          status: 'pending',
          level: 'basic',
          submittedAt: new Date().toISOString(),
          trustScore: 50
        });
      }
      localStorage.setItem('kycVerifications', JSON.stringify(kycVerifications));

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
            <h3>👤 Personal Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="As it appears on your ID"
                />
              </div>
              
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="disabled"
                />
                <small>Cannot be changed</small>
              </div>
              
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="08012345678"
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
                  <option value="Nigerian">Nigerian</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
  <label>State *</label>
  <select
    name="state"
    value={formData.state}
    onChange={(e) => {
      setFormData({...formData, state: e.target.value, lga: ''});
    }}
    required
  >
    <option value="">Select State</option>
    {nigerianStates.map(state => (
      <option key={state.value} value={state.value}>
        {state.label}
      </option>
    ))}
  </select>
</div>
{formData.state && (
  <div className="form-group">
    <label>LGA *</label>
    <select
      name="lga"
      value={formData.lga}
      onChange={handleInputChange}
      required
    >
      <option value="">Select LGA</option>
      {getLGAsForState(formData.state).map(lga => (
        <option key={lga} value={lga}>{lga}</option>
      ))}
    </select>
  </div>
)}
              
              <div className="form-group full-width">
                <label>Residential Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="House number, street, city"
                  rows="3"
                />
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="verification-step">
            <h3>🆔 Identity Verification</h3>
            
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
                  <option value="driver_license">Driver's License</option>
                  <option value="voters_card">Voter's Card</option>
                  <option value="passport">International Passport</option>
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
                  placeholder="ID card number"
                />
              </div>
            </div>
            
            <div className="upload-section">
              <div className="upload-group">
                <label>Front of ID *</label>
                <div className="upload-area">
                  {formData.idFront ? (
                    <div className="upload-preview">
                      {typeof formData.idFront === 'string' && formData.idFront.startsWith('blob:') ? (
                        <img src={formData.idFront} alt="ID Front" />
                      ) : (
                        <div className="file-preview">📄 Document Uploaded</div>
                      )}
                      <button 
                        type="button"
                        className="btn-remove"
                        onClick={() => removeFile('idFront')}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        id="idFront"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e, 'idFront')}
                        className="file-input"
                      />
                      <label htmlFor="idFront" className="upload-label">
                        <div className="upload-icon">📸</div>
                        <p>Upload Front of ID</p>
                        <small>JPG, PNG, or PDF (Max 5MB)</small>
                      </label>
                    </>
                  )}
                  {uploadProgress.idFront !== undefined && uploadProgress.idFront < 100 && (
                    <div className="upload-progress">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${uploadProgress.idFront}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="upload-group">
                <label>Back of ID (if applicable)</label>
                <div className="upload-area">
                  {formData.idBack ? (
                    <div className="upload-preview">
                      {typeof formData.idBack === 'string' && formData.idBack.startsWith('blob:') ? (
                        <img src={formData.idBack} alt="ID Back" />
                      ) : (
                        <div className="file-preview">📄 Document Uploaded</div>
                      )}
                      <button 
                        type="button"
                        className="btn-remove"
                        onClick={() => removeFile('idBack')}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        id="idBack"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e, 'idBack')}
                        className="file-input"
                      />
                      <label htmlFor="idBack" className="upload-label">
                        <div className="upload-icon">📸</div>
                        <p>Upload Back of ID</p>
                        <small>Optional • JPG, PNG, or PDF</small>
                      </label>
                    </>
                  )}
                  {uploadProgress.idBack !== undefined && uploadProgress.idBack < 100 && (
                    <div className="upload-progress">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${uploadProgress.idBack}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="upload-group">
                <label>Selfie with ID *</label>
                <div className="upload-area">
                  {formData.selfie ? (
                    <div className="upload-preview">
                      <img src={formData.selfie} alt="Selfie with ID" />
                      <button 
                        type="button"
                        className="btn-remove"
                        onClick={() => removeFile('selfie')}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        id="selfie"
                        accept="image/*"
                        capture="user"
                        onChange={(e) => handleFileUpload(e, 'selfie')}
                        className="file-input"
                      />
                      <label htmlFor="selfie" className="upload-label">
                        <div className="upload-icon">📱</div>
                        <p>Take or Upload Selfie</p>
                        <small>Hold your ID next to your face</small>
                      </label>
                    </>
                  )}
                  {uploadProgress.selfie !== undefined && uploadProgress.selfie < 100 && (
                    <div className="upload-progress">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${uploadProgress.selfie}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="upload-group">
                <label>Proof of Address *</label>
                <div className="upload-area">
                  {formData.proofOfAddress ? (
                    <div className="upload-preview">
                      {typeof formData.proofOfAddress === 'string' && formData.proofOfAddress.startsWith('blob:') ? (
                        <img src={formData.proofOfAddress} alt="Proof of Address" />
                      ) : (
                        <div className="file-preview">📄 Document Uploaded</div>
                      )}
                      <button 
                        type="button"
                        className="btn-remove"
                        onClick={() => removeFile('proofOfAddress')}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        id="proofOfAddress"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e, 'proofOfAddress')}
                        className="file-input"
                      />
                      <label htmlFor="proofOfAddress" className="upload-label">
                        <div className="upload-icon">🏠</div>
                        <p>Proof of Address</p>
                        <small>Utility bill, bank statement, etc.</small>
                      </label>
                    </>
                  )}
                  {uploadProgress.proofOfAddress !== undefined && uploadProgress.proofOfAddress < 100 && (
                    <div className="upload-progress">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${uploadProgress.proofOfAddress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="selfie-example">
              <h4>Selfie Requirements:</h4>
              <div className="example-images">
                <div className="example good">
                  <div className="example-icon">✅</div>
                  <p>Clear face & ID</p>
                </div>
                <div className="example bad">
                  <div className="example-icon">❌</div>
                  <p>Blurry/dark</p>
                </div>
                <div className="example good">
                  <div className="example-icon">✅</div>
                  <p>Good lighting</p>
                </div>
                <div className="example bad">
                  <div className="example-icon">❌</div>
                  <p>ID not visible</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 3:
        if (user?.role === 'landlord') {
          return (
            <div className="verification-step">
              <h3>🏠 Property Ownership Proof</h3>
              <p className="section-subtitle">Upload proof that you own/manage the property</p>
              
              <div className="upload-section">
                <div className="upload-group">
                  <label>Property Document *</label>
                  <div className="upload-area">
                    {formData.propertyDocument ? (
                      <div className="upload-preview">
                        {typeof formData.propertyDocument === 'string' && formData.propertyDocument.startsWith('blob:') ? (
                          <img src={formData.propertyDocument} alt="Property Document" />
                        ) : (
                          <div className="file-preview">📄 Document Uploaded</div>
                        )}
                        <button 
                          type="button"
                          className="btn-remove"
                          onClick={() => removeFile('propertyDocument')}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <input
                          type="file"
                          id="propertyDocument"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload(e, 'propertyDocument')}
                          className="file-input"
                        />
                        <label htmlFor="propertyDocument" className="upload-label">
                          <div className="upload-icon">📑</div>
                          <p>Upload Property Document</p>
                          <small>Title deed, C of O, power of attorney</small>
                        </label>
                      </>
                    )}
                    {uploadProgress.propertyDocument !== undefined && uploadProgress.propertyDocument < 100 && (
                      <div className="upload-progress">
                        <div 
                          className="progress-bar" 
                          style={{ width: `${uploadProgress.propertyDocument}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="document-requirements">
                <h4>Accepted Documents:</h4>
                <ul>
                  <li>Certificate of Occupancy (C of O)</li>
                  <li>Registered Deed of Assignment</li>
                  <li>Governor's Consent</li>
                  <li>Power of Attorney (for property managers)</li>
                  <li>Recent tax receipts</li>
                </ul>
              </div>
            </div>
          );
        } else {
          return (
            <div className="verification-step">
              <h3>💼 Employment & Income Details</h3>
              <p className="section-subtitle">Help landlords understand your ability to pay rent</p>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Employment Status *</label>
                  <select
                    name="employmentStatus"
                    value={formData.employmentStatus}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="employed">Employed</option>
                    <option value="self_employed">Self-Employed</option>
                    <option value="student">Student</option>
                    <option value="unemployed">Currently Unemployed</option>
                    <option value="retired">Retired</option>
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
                    placeholder="Estimated monthly income"
                  />
                </div>
                
                <div className="form-group full-width">
                  <div className="income-info-note">
                    <div className="note-icon">ℹ️</div>
                    <div className="note-content">
                      <strong>Income Information:</strong>
                      <p>This information helps landlords assess your rental affordability. We recommend your monthly income be at least 3 times the monthly rent amount.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }
      
      case 4:
        return (
          <div className="verification-step">
            <h3>📋 Review & Submit</h3>
            <p className="section-subtitle">Review all information before submission</p>
            
            <div className="review-summary">
              <div className="review-section">
                <h4>Personal Information</h4>
                <div className="review-item">
                  <span>Full Name:</span>
                  <span>{formData.fullName || 'Not provided'}</span>
                </div>
                <div className="review-item">
                  <span>Phone:</span>
                  <span>{formData.phone || 'Not provided'}</span>
                </div>
                <div className="review-item">
                  <span>Date of Birth:</span>
                  <span>{formData.dateOfBirth || 'Not provided'}</span>
                </div>
                <div className="review-item">
                  <span>Address:</span>
                  <span>{formData.address || 'Not provided'}</span>
                </div>
              </div>
              
              <div className="review-section">
                <h4>ID Verification</h4>
                <div className="review-item">
                  <span>ID Type:</span>
                  <span>{formData.idType ? formData.idType.replace('_', ' ').toUpperCase() : 'Not provided'}</span>
                </div>
                <div className="review-item">
                  <span>ID Number:</span>
                  <span>{formData.idNumber || 'Not provided'}</span>
                </div>
                <div className="review-item">
                  <span>Documents:</span>
                  <span>
                    {formData.idFront ? '✅ ID Front' : '❌ ID Front'} • 
                    {formData.selfie ? ' ✅ Selfie' : '❌ Selfie'} • 
                    {formData.proofOfAddress ? ' ✅ Proof of Address' : '❌ Proof of Address'}
                  </span>
                </div>
              </div>
              
              {user?.role === 'landlord' ? (
                <div className="review-section">
                  <h4>Property Information</h4>
                  <div className="review-item">
                    <span>Property Document:</span>
                    <span>{formData.propertyDocument ? '✅ Uploaded' : '❌ Not uploaded'}</span>
                  </div>
                </div>
              ) : (
                <div className="review-section">
                  <h4>Employment Details</h4>
                  <div className="review-item">
                    <span>Employment Status:</span>
                    <span>{formData.employmentStatus || 'Not provided'}</span>
                  </div>
                  <div className="review-item">
                    <span>Monthly Income:</span>
                    <span>{formData.monthlyIncome ? `₦${parseInt(formData.monthlyIncome).toLocaleString()}` : 'Not provided'}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="terms-agreement">
              <input
                type="checkbox"
                id="terms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({...formData, acceptTerms: e.target.checked})}
                required
              />
              <label htmlFor="terms">
                I certify that all information provided is accurate and I agree to RentEasy's 
                <a href="/terms"> Terms of Service</a> and 
                <a href="/privacy"> Privacy Policy</a>. I understand that false information may result in account suspension.
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
      <div className="verification-container">
        <div className="verification-header">
          <button 
            className="btn-back"
            onClick={() => navigate('/verify')}
          >
            ← Back to Verification Hub
          </button>
          <h1>🔒 {user?.role === 'landlord' ? 'Landlord' : 'Tenant'} Verification</h1>
          <p>Complete verification to build trust on RentEasy</p>
        </div>
        
        {/* Progress Steps */}
        <div className="verification-steps">
          {steps.map((s) => (
            <div 
              key={s.number} 
              className={`step ${s.number === step ? 'active' : s.number < step ? 'completed' : ''}`}
            >
              <span className="step-number">{s.number}</span>
              <span className="step-text">{s.title}</span>
              <span className="step-icon">{s.icon}</span>
            </div>
          ))}
        </div>
        
        <form onSubmit={(e) => e.preventDefault()}>
          {renderStep()}
          
          {/* Navigation Buttons */}
          <div className="form-actions">
            {step > 1 && step < 5 && (
              <button 
                type="button"
                className="btn-outline"
                onClick={() => setStep(step - 1)}
              >
                ← Previous
              </button>
            )}
            
            <button 
              type="button"
              className="btn-primary btn-submit"
              onClick={handleNextStep}
              disabled={loading}
            >
              {loading ? 'Processing...' : step < 4 ? 'Continue →' : 'Submit Verification'}
            </button>
          </div>
          
          {step < 5 && (
            <p className="form-note">
              Step {step} of 4 • {validateStep(step) ? '✅ Ready to continue' : '⚠️ Complete all required fields'}
            </p>
          )}
        </form>
        
        {/* Verification Benefits */}
        <div className="verification-benefits">
          <h3>✨ Benefits of Verification</h3>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">👑</div>
              <h4>Verified Badge</h4>
              <p>Show credibility on your profile</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🚀</div>
              <h4>Priority Listing</h4>
              <p>Get noticed faster by others</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🤝</div>
              <h4>Higher Trust</h4>
              <p>Build credibility with partners</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">💰</div>
              <h4>Better Opportunities</h4>
              <p>Access exclusive features</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationForm;