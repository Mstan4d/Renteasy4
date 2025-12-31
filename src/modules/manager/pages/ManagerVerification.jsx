// src/modules/manager/pages/ManagerVerification.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../shared/context/AuthContext";
import './ManagerVerification.css';

// Simple toast replacement
const toast = {
  success: (message) => {
    console.log("✅ Success:", message);
    alert(`✅ ${message}`);
  },
  error: (message) => {
    console.error("❌ Error:", message);
    alert(`❌ ${message}`);
  }
};

const ManagerVerification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    state: '',
    lga: '',
    address: '',
    idType: 'national_id',
    idNumber: '',
    idFront: null,
    idBack: null,
    selfie: null
  });
  const [uploadProgress, setUploadProgress] = useState({});
  
  // Nigerian states with LGAs
  const nigerianStates = [
    { 
      state: "Lagos", 
      lgas: ["Ikeja", "Lagos Island", "Lagos Mainland", "Surulere", "Mushin", "Apapa", "Eti-Osa", "Badagry", "Ojo", "Ikorodu", "Kosofe", "Shomolu", "Amuwo-Odofin", "Ajeromi-Ifelodun", "Oshodi-Isolo", "Alimosho", "Ifako-Ijaiye", "Agege"]
    },
    { 
      state: "Abuja", 
      lgas: ["Abuja Municipal", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Abaji"]
    },
    { 
      state: "Rivers", 
      lgas: ["Port Harcourt", "Obio-Akpor", "Ikwerre", "Etche", "Okrika", "Oyigbo", "Eleme", "Tai", "Gokana", "Khana", "Ahoada East", "Ahoada West", "Ogba-Egbema-Ndoni", "Emohua", "Degema", "Asari-Toru", "Akuku-Toru", "Opobo-Nkoro", "Andoni", "Bonny"]
    },
    { 
      state: "Oyo", 
      lgas: ["Ibadan North", "Ibadan North-East", "Ibadan North-West", "Ibadan South-East", "Ibadan South-West", "Egbeda", "Ona Ara", "Oluyole", "Akinyele", "Lagelu", "Ibarapa Central", "Ibarapa East", "Ibarapa North", "Ido", "Ogo Oluwa", "Surulere", "Ogbomosho North", "Ogbomosho South", "Orire", "Olorunsogo", "Irepo", "Orelope", "Saki East", "Saki West", "Atisbo", "Itesiwaju", "Iwajowa", "Kajola", "Iseyin", "Afijio", "Atiba"]
    }
  ];

  useEffect(() => {
    if (user?.role !== 'manager') {
      navigate('/login');
      return;
    }

    checkVerificationStatus();
  }, [user, navigate]);

  const checkVerificationStatus = () => {
    try {
      const managers = JSON.parse(localStorage.getItem('managers') || '[]');
      const currentManager = managers.find(m => m.email === user?.email);
      
      if (currentManager) {
        setVerificationStatus(currentManager.verificationStatus || 'pending');
        
        // If already verified, redirect to dashboard
        if (currentManager.verificationStatus === 'approved') {
          navigate('/dashboard/manager');
        }
        
        // If pending review, show pending status
        if (currentManager.verificationStatus === 'pending_review') {
          setIsLoading(false);
          return;
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking verification:', error);
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    // Simulate upload progress
    setUploadProgress(prev => ({ ...prev, [field]: 0 }));
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev[field] + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          
          // Create a preview URL
          const previewUrl = URL.createObjectURL(file);
          
          setFormData(prev => ({
            ...prev,
            [field]: previewUrl // Store as URL for preview
          }));
          
          // Store actual file reference (in real app, this would be uploaded to server)
          const fileData = {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
            preview: previewUrl
          };
          
          // Store in a separate object for form submission
          setFormData(prev => ({
            ...prev,
            [`${field}File`]: fileData
          }));
          
          return { ...prev, [field]: 100 };
        }
        return { ...prev, [field]: newProgress };
      });
    }, 100);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.fullName || !formData.phone || !formData.state || !formData.lga || 
        !formData.address || !formData.idNumber || !formData.idFront || !formData.idBack || !formData.selfie) {
      toast.error('Please fill all required fields and upload all documents');
      return;
    }

    try {
      const managers = JSON.parse(localStorage.getItem('managers') || '[]');
      const managerIndex = managers.findIndex(m => m.email === user?.email);
      
      const verificationData = {
        ...formData,
        submittedAt: new Date().toISOString(),
        status: 'pending_review'
      };
      
      if (managerIndex !== -1) {
        managers[managerIndex] = {
          ...managers[managerIndex],
          ...formData,
          verificationStatus: 'pending_review',
          verificationData: verificationData,
          verificationSubmittedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      } else {
        managers.push({
          id: user?.id || Date.now().toString(),
          name: user?.name,
          email: user?.email,
          phone: formData.phone,
          state: formData.state,
          lga: formData.lga,
          verificationStatus: 'pending_review',
          verificationData: verificationData,
          verificationSubmittedAt: new Date().toISOString(),
          status: 'pending_verification',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      // Add to admin notifications for review
      const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
      adminNotifications.unshift({
        id: Date.now(),
        title: 'New Manager Verification Request',
        message: `${formData.fullName} has submitted KYC documents for verification`,
        type: 'manager_verification',
        priority: 'high',
        data: {
          managerId: user?.id,
          managerName: formData.fullName,
          managerEmail: user?.email,
          submittedAt: new Date().toISOString()
        },
        timestamp: new Date().toISOString(),
        read: false
      });
      localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
      
      localStorage.setItem('managers', JSON.stringify(managers));
      
      setVerificationStatus('pending_review');
      toast.success('Verification submitted successfully! Admin will review your documents.');
      
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast.error('Failed to submit verification');
    }
  };

  if (isLoading) {
    return (
      <div className="verification-loading">
        <div className="loading-spinner"></div>
        <p>Loading verification status...</p>
      </div>
    );
  }

  if (verificationStatus === 'pending_review') {
    return (
      <div className="verification-pending">
        <div className="pending-container">
          <div className="pending-icon">⏳</div>
          <h2>Verification Under Review</h2>
          <p>Your KYC documents have been submitted and are being reviewed by our admin team.</p>
          <p>You will receive a notification once your verification is complete.</p>
          <div className="pending-info">
            <p><strong>Estimated Time:</strong> 24-48 hours</p>
            <p><strong>Contact Support:</strong> support@renteasy.com</p>
          </div>
          <button 
            className="btn-outline"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'rejected') {
    return (
      <div className="verification-rejected">
        <div className="rejected-container">
          <div className="rejected-icon">❌</div>
          <h2>Verification Rejected</h2>
          <p>Your KYC documents were not approved. Please review the requirements and resubmit.</p>
          <div className="rejection-reasons">
            <h4>Common reasons for rejection:</h4>
            <ul>
              <li>Blurry or unclear documents</li>
              <li>Document expiration</li>
              <li>Information mismatch</li>
              <li>Invalid ID type</li>
            </ul>
          </div>
          <button 
            className="btn-primary"
            onClick={() => setVerificationStatus('pending')}
          >
            Resubmit Verification
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="manager-verification">
      <div className="verification-container">
        <div className="verification-header">
          <h1>🔒 Manager Verification Required</h1>
          <p>Complete KYC verification to start receiving notifications and managing properties</p>
        </div>
        
        <div className="verification-steps">
          <div className="step active">
            <span className="step-number">1</span>
            <span className="step-text">Personal Information</span>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <span className="step-text">ID Verification</span>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <span className="step-text">Selfie Verification</span>
          </div>
          <div className="step">
            <span className="step-number">4</span>
            <span className="step-text">Submit for Review</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="verification-form">
          {/* Personal Information */}
          <div className="form-section">
            <h3>👤 Personal Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required
                  placeholder="As it appears on your ID"
                />
              </div>
              
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
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
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                  placeholder="08012345678"
                />
              </div>
              
              <div className="form-group">
                <label>State *</label>
                <select
                  value={formData.state}
                  onChange={(e) => {
                    setFormData({...formData, state: e.target.value, lga: ''});
                  }}
                  required
                >
                  <option value="">Select State</option>
                  {nigerianStates.map(state => (
                    <option key={state.state} value={state.state}>
                      {state.state}
                    </option>
                  ))}
                </select>
              </div>
              
              {formData.state && (
                <div className="form-group">
                  <label>LGA *</label>
                  <select
                    value={formData.lga}
                    onChange={(e) => setFormData({...formData, lga: e.target.value})}
                    required
                  >
                    <option value="">Select LGA</option>
                    {nigerianStates.find(s => s.state === formData.state)?.lgas.map(lga => (
                      <option key={lga} value={lga}>{lga}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="form-group full-width">
                <label>Residential Address *</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  required
                  placeholder="House number, street, city"
                  rows="3"
                />
              </div>
            </div>
          </div>
          
          {/* ID Verification */}
          <div className="form-section">
            <h3>🆔 ID Verification</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>ID Type *</label>
                <select
                  value={formData.idType}
                  onChange={(e) => setFormData({...formData, idType: e.target.value})}
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
                  value={formData.idNumber}
                  onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
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
                      <img src={formData.idFront} alt="ID Front" />
                      <button 
                        type="button"
                        className="btn-remove"
                        onClick={() => setFormData({...formData, idFront: null})}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        id="idFront"
                        accept="image/*"
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
                <label>Back of ID *</label>
                <div className="upload-area">
                  {formData.idBack ? (
                    <div className="upload-preview">
                      <img src={formData.idBack} alt="ID Back" />
                      <button 
                        type="button"
                        className="btn-remove"
                        onClick={() => setFormData({...formData, idBack: null})}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        id="idBack"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'idBack')}
                        className="file-input"
                      />
                      <label htmlFor="idBack" className="upload-label">
                        <div className="upload-icon">📸</div>
                        <p>Upload Back of ID</p>
                        <small>JPG, PNG, or PDF (Max 5MB)</small>
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
            </div>
          </div>
          
          {/* Selfie Verification */}
          <div className="form-section">
            <h3>🤳 Selfie Verification</h3>
            <div className="selfie-instructions">
              <p>Take a clear selfie holding your ID card next to your face</p>
              <ul>
                <li>Ensure your face and ID are clearly visible</li>
                <li>Good lighting conditions</li>
                <li>No filters or editing</li>
              </ul>
            </div>
            
            <div className="upload-group selfie-upload">
              <label>Selfie with ID *</label>
              <div className="upload-area">
                {formData.selfie ? (
                  <div className="upload-preview">
                    <img src={formData.selfie} alt="Selfie with ID" />
                    <button 
                      type="button"
                      className="btn-remove"
                      onClick={() => setFormData({...formData, selfie: null})}
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
                      <small>Use camera or upload existing photo</small>
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
            
            <div className="selfie-example">
              <h4>Example:</h4>
              <div className="example-images">
                <div className="example good">
                  <div className="example-icon">✅</div>
                  <p>Clear, well-lit</p>
                </div>
                <div className="example bad">
                  <div className="example-icon">❌</div>
                  <p>Blurry, dark</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Terms and Conditions */}
          <div className="form-section">
            <div className="terms-agreement">
              <input
                type="checkbox"
                id="terms"
                required
              />
              <label htmlFor="terms">
                I certify that all information provided is accurate and I agree to RentEasy's 
                <a href="/terms"> Terms of Service</a> and 
                <a href="/privacy"> Privacy Policy</a>. I understand that false information may result in account suspension.
              </label>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="form-actions">
            <button type="submit" className="btn-primary btn-submit">
              Submit for Verification
            </button>
            <p className="form-note">
              ✅ Your documents will be reviewed within 24-48 hours. You'll receive a notification once verified.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManagerVerification;