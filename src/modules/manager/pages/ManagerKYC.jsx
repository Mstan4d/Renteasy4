// src/modules/manager/pages/ManagerKYC.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './ManagerKYC.css';

const ManagerKYC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
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
    },
    { 
      state: "Kano", 
      lgas: ["Kano Municipal", "Dala", "Fagge", "Gwale", "Kumbotso", "Tarauni", "Nasarawa", "Ungogo", "Kumbotso", "Minjibir", "Gezawa", "Rano", "Bunkure", "Kibiya", "Rimin Gado", "Takai", "Sumaila", "Gwarzo", "Karaye", "Rogo", "Kabo", "Bichi", "Tsanyawa", "Shanono", "Bagwai", "Dawakin Tofa", "Tofa", "Garun Mallam", "Madobi", "Gabasawa", "Makoda", "Kunchi", "Kiru", "Bebeji", "Warawa", "Albasu", "Wudil", "Gaya", "Ajingi", "Kura", "Doguwa", "Tudun Wada", "Bunkure", "Minjibir", "Gezawa"]
    },
    { 
      state: "Kaduna", 
      lgas: ["Kaduna North", "Kaduna South", "Igabi", "Chikun", "Birnin Gwari", "Giwa", "Sabon Gari", "Zaria", "Soba", "Kauru", "Kachia", "Kagarko", "Jaba", "Jema'a", "Kaura", "Kubau", "Lere", "Makarfi", "Sanga", "Zango Kataf"]
    }
  ];

  const nigerianBanks = [
    "Access Bank", "Zenith Bank", "First Bank", "UBA", "GTBank", 
    "Fidelity Bank", "Ecobank", "Union Bank", "Polaris Bank", "Stanbic IBTC",
    "Sterling Bank", "Wema Bank", "Unity Bank", "Keystone Bank", "Heritage Bank",
    "Providus Bank", "Suntrust Bank", "Jaiz Bank", "Titan Trust Bank", "Globus Bank"
  ];

  const [verificationStatus, setVerificationStatus] = useState('not_started');
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    dateOfBirth: '',
    nationality: 'Nigerian',
    state: '',
    lga: '',
    address: '',
    idType: 'national_id',
    idNumber: '',
    idFront: null,
    idBack: null,
    selfie: null,
    proofOfAddress: null,
    bankName: '',
    accountNumber: '',
    accountName: '',
    bvn: ''
  });
  
  const [uploadProgress, setUploadProgress] = useState({});
  
  useEffect(() => {
    if (user?.role !== 'manager') {
      navigate('/login');
      return;
    }
    checkKYCStatus();
  }, [user, navigate]);

  const checkKYCStatus = async () => {
    try {
      setIsLoading(true);
      
      // Fetch from Supabase profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('kyc_status, kyc_data, bank_details')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      setProfileData(data);
      
      if (data) {
        const status = data.kyc_status || 'not_started';
        setVerificationStatus(status);
        
        // If already approved, just show the success screen (no auto-redirect)
if (status === 'approved') {
  // Stay on success page, user can click button to go to dashboard
}
        
        // If pending, show pending screen
        if (status === 'pending') {
          setStep(5);
        }
        
        // If rejected, show rejected screen
        if (status === 'rejected') {
          setStep(6);
        }
        
        // Load existing data if available
        if (data.kyc_data) {
          setFormData(prev => ({
            ...prev,
            ...data.kyc_data
          }));
        }
        
        if (data.bank_details) {
          setFormData(prev => ({
            ...prev,
            bankName: data.bank_details.bankName || '',
            accountNumber: data.bank_details.accountNumber || '',
            accountName: data.bank_details.accountName || '',
            bvn: data.bank_details.bvn || ''
          }));
        }
      }
      
    } catch (error) {
      console.error('Error checking KYC status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size too large. Maximum size is 5MB.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload JPG, PNG, or PDF files.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    
    setFormData(prev => ({
      ...prev,
      [field]: previewUrl,
      [`${field}File`]: file
    }));

    setUploadProgress(prev => ({ ...prev, [field]: 100 }));
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
        return formData.bankName && formData.accountNumber && formData.accountName;
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

  const uploadFile = async (file, folder) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${folder}_${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage
      .from('kyc-documents')
      .upload(fileName, file);
    
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('kyc-documents').getPublicUrl(fileName);
    return publicUrl;
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Upload files
      const idFrontUrl = await uploadFile(formData.idFrontFile, 'id_front');
      const idBackUrl = await uploadFile(formData.idBackFile, 'id_back');
      const selfieUrl = await uploadFile(formData.selfieFile, 'selfie');
      const proofUrl = await uploadFile(formData.proofOfAddressFile, 'proof_address');

      // Update profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          kyc_status: 'pending',
          kyc_submitted_at: new Date().toISOString(),
          kyc_data: {
            fullName: formData.fullName,
            phone: formData.phone,
            dob: formData.dateOfBirth,
            address: formData.address,
            lga: formData.lga,
            state: formData.state,
            idType: formData.idType,
            idNumber: formData.idNumber,
            documents: {
              idFront: idFrontUrl,
              idBack: idBackUrl,
              selfie: selfieUrl,
              proofOfAddress: proofUrl
            }
          },
          bank_details: {
            bankName: formData.bankName,
            accountNumber: formData.accountNumber,
            accountName: formData.accountName,
            bvn: formData.bvn
          }
        })
        .eq('id', user.id);

      if (error) throw error;

      setVerificationStatus('pending');
      setStep(5);
      alert('KYC submitted successfully! Our team will review it within 24-48 hours.');

    } catch (error) {
      console.error('KYC Submission Error:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Personal Info', icon: '👤' },
    { number: 2, title: 'ID Verification', icon: '🆔' },
    { number: 3, title: 'Bank Details', icon: '🏦' },
    { number: 4, title: 'Review & Submit', icon: '📋' }
  ];

  if (isLoading && verificationStatus === 'not_started') {
    return (
      <div className="kyc-loading">
        <div className="loading-spinner"></div>
        <p>Loading KYC status...</p>
      </div>
    );
  }

  // KYC SUCCESSFUL - Show limited details
  if (verificationStatus === 'approved') {
    return (
      <div className="kyc-success">
        <div className="success-container">
          <div className="success-icon">✅</div>
          <h2>KYC Verification Successful!</h2>
          <p>Your account has been fully verified. You can now manage properties and receive notifications.</p>
          
          <div className="verified-info">
            <h3>Your Verified Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Full Name:</span>
                <span className="info-value">{profileData?.kyc_data?.fullName || formData.fullName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{user?.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone:</span>
                <span className="info-value">{profileData?.kyc_data?.phone || formData.phone}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Bank Account:</span>
                <span className="info-value">{profileData?.bank_details?.bankName} ••••{profileData?.bank_details?.accountNumber?.slice(-4)}</span>
              </div>
            </div>
          </div>
          
          <div className="success-benefits">
            <h3>What you can do now:</h3>
            <ul>
              <li>✅ Accept proximity notifications for new listings</li>
              <li>✅ Verify properties and earn 2.5% commission</li>
              <li>✅ Monitor tenant-landlord conversations</li>
              <li>✅ Manage multiple properties</li>
              <li>✅ Withdraw earned commissions</li>
            </ul>
          </div>
          
          <div className="success-actions">
            <button 
              className="btn-primary"
              onClick={() => navigate('/dashboard/manager')}
            >
              Go to Dashboard
            </button>
            <button 
              className="btn-outline"
              onClick={() => navigate('/dashboard/manager/properties')}
            >
              View Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pending Review Screen
  if (step === 5) {
    return (
      <div className="kyc-pending">
        <div className="pending-container">
          <div className="pending-icon">⏳</div>
          <h2>KYC Under Review</h2>
          <p>Your documents have been submitted and are being reviewed by our admin team.</p>
          <p>You will receive a notification once your verification is complete.</p>
          <div className="pending-info">
            <p><strong>Estimated Time:</strong> 24-48 hours</p>
            <p><strong>Reference ID:</strong> KYC-{Date.now().toString().slice(-8)}</p>
            <p><strong>Contact Support:</strong> support@renteasy.com</p>
          </div>
          <button 
            className="btn-outline"
            onClick={() => navigate('/dashboard/manager')}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Rejected Screen
  if (step === 6) {
    return (
      <div className="kyc-rejected">
        <div className="rejected-container">
          <div className="rejected-icon">❌</div>
          <h2>KYC Rejected</h2>
          <p>Your KYC documents were not approved. Please review the requirements and resubmit.</p>
          <div className="rejection-reasons">
            <h4>Common reasons for rejection:</h4>
            <ul>
              <li>Blurry or unclear documents</li>
              <li>Document expiration</li>
              <li>Information mismatch</li>
              <li>Invalid ID type</li>
              <li>Missing required documents</li>
            </ul>
          </div>
          <button 
            className="btn-primary"
            onClick={() => {
              setStep(1);
              setVerificationStatus('not_started');
            }}
          >
            Resubmit KYC
          </button>
        </div>
      </div>
    );
  }

  // Main KYC Form (only shown if not submitted yet)
  return (
    <div className="manager-kyc">
      <div className="kyc-container">
        <div className="kyc-header">
          <h1>🔒 Manager KYC Verification</h1>
          <p>Complete KYC verification to start receiving notifications and managing properties</p>
        </div>
        
        <div className="kyc-steps">
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
        
        <form className="kyc-form" onSubmit={(e) => e.preventDefault()}>
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="form-section">
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
                      name="lga"
                      value={formData.lga}
                      onChange={handleInputChange}
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
          )}
          
          {/* Step 2: ID Verification */}
          {step === 2 && (
            <div className="form-section">
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
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Bank Details */}
          {step === 3 && (
            <div className="form-section">
              <h3>🏦 Bank Details for Commission</h3>
              <p className="section-subtitle">Your bank details are securely stored for commission payments</p>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Bank Name *</label>
                  <select
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Bank</option>
                    {nigerianBanks.map(bank => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Account Number *</label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="10-digit account number"
                    maxLength="10"
                  />
                </div>
                
                <div className="form-group">
                  <label>Account Name *</label>
                  <input
                    type="text"
                    name="accountName"
                    value={formData.accountName}
                    onChange={handleInputChange}
                    required
                    placeholder="As it appears on bank account"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Step 4: Review & Submit */}
          {step === 4 && (
            <div className="form-section">
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
                    <span>Documents:</span>
                    <span>
                      {formData.idFront ? '✅ ID Front' : '❌ ID Front'} • 
                      {formData.selfie ? ' ✅ Selfie' : '❌ Selfie'} • 
                      {formData.proofOfAddress ? ' ✅ Proof of Address' : '❌ Proof of Address'}
                    </span>
                  </div>
                </div>
                
                <div className="review-section">
                  <h4>Bank Details</h4>
                  <div className="review-item">
                    <span>Bank:</span>
                    <span>{formData.bankName || 'Not provided'}</span>
                  </div>
                  <div className="review-item">
                    <span>Account Number:</span>
                    <span>{formData.accountNumber ? '••••' + formData.accountNumber.slice(-4) : 'Not provided'}</span>
                  </div>
                </div>
              </div>
              
              <div className="terms-agreement">
                <input
                  type="checkbox"
                  id="terms"
                  required
                />
                <label htmlFor="terms">
                  I certify that all information provided is accurate and I agree to RentEasy's 
                  <a href="/terms"> Terms of Service</a>.
                </label>
              </div>
            </div>
          )}
          
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
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : step < 4 ? 'Continue →' : 'Submit Verification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManagerKYC;