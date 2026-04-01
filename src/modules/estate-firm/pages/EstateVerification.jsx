// src/modules/estate-firm/pages/EstateVerification.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import {
  Shield, Upload, FileText, Building, Users,
  CheckCircle, XCircle, Camera, Download,
  ArrowRight, AlertCircle, HelpCircle, Clock, Lock
} from 'lucide-react';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import { supabase } from '../../../shared/lib/supabaseClient';
import './EstateVerification.css';

// Document Upload Component
const DocumentUpload = ({ label, name, file, preview, onUpload, error, disabled }) => {
  const handleFileChange = (e) => {
    if (disabled) return;
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      onUpload(name, selectedFile);
    }
  };

  const handleRemove = () => {
    if (disabled) return;
    onUpload(name, null);
  };

  return (
    <div className={`document-upload ${disabled ? 'disabled' : ''}`}>
      <label className="upload-label">
        {label}
        {error && <span className="error-indicator"> *</span>}
      </label>
      
      <div className={`upload-area ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}>
        {preview ? (
          <div className="document-preview">
            {preview.match(/\.(jpeg|jpg|png|gif)$/i) ? (
              <img src={preview} alt="Preview" />
            ) : (
              <FileText size={32} />
            )}
            <div className="preview-overlay">
              <span>{file?.name || 'Document'}</span>
              {!disabled && (
                <button type="button" className="btn-sm" onClick={handleRemove}>
                  Change
                </button>
              )}
            </div>
          </div>
        ) : (
          <label htmlFor={`file-${name}`} className={`upload-placeholder ${disabled ? 'disabled' : ''}`}>
            <Upload size={24} />
            <p>{disabled ? 'Document locked' : 'Click to upload document'}</p>
            <small>{disabled ? 'Cannot modify submitted documents' : 'PDF, JPG, PNG up to 5MB'}</small>
          </label>
        )}
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id={`file-${name}`}
          disabled={disabled}
        />
      </div>
      
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

const EstateVerification = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [existingVerification, setExistingVerification] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'estate-firm',
    registrationNumber: '',
    taxIdNumber: '',
    yearEstablished: '',
    officeAddress: '',
    city: '',
    state: '',
    country: 'Nigeria',
    postalCode: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    alternativePhone: '',
    cacDocument: null,
    taxDocument: null,
    proofOfAddress: null,
    businessPlan: null,
    directors: [{
      name: '',
      position: 'Director',
      idType: 'national-id',
      idNumber: '',
      idDocument: null,
      photo: null
    }],
    servicesOffered: [],
    yearsInOperation: '',
    numberOfEmployees: '',
    annualTurnover: ''
  });

  const [documentPreview, setDocumentPreview] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const directorIdTypes = [
    { value: 'national-id', label: 'National ID' },
    { value: 'passport', label: 'International Passport' },
    { value: 'drivers-license', label: "Driver's License" },
    { value: 'voters-card', label: "Voter's Card" }
  ];

  useEffect(() => {
    if (user) {
      checkExistingVerification();
      checkVerificationStatus();
    }
  }, [user]);

  const checkVerificationStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('kyc_status, is_kyc_verified, kyc_submitted_at')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setVerificationStatus(data.kyc_status);
        
        // Check if already verified
        if (data.is_kyc_verified === true || data.kyc_status === 'approved') {
          setIsVerified(true);
          return;
        }
        
        // Check if submitted and pending
        if (data.kyc_status === 'pending' && data.kyc_submitted_at) {
          setIsSubmitted(true);
          setSubmittedAt(data.kyc_submitted_at);
        }
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  const checkExistingVerification = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('estate_verifications')
        .select('status, business_name, registration_number, submitted_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setExistingVerification(data);
        
        if (data.status === 'approved') {
          setIsVerified(true);
          return;
        }
        
        if (data.status === 'pending') {
          setIsSubmitted(true);
          setSubmittedAt(data.submitted_at);
          setLoading(false);
          return;
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error checking verification:', error);
      setLoading(false);
    }
  };

  // If verification is pending (submitted), show locked pending screen
  if (isSubmitted) {
    return (
      <div className="verification-pending">
        <div className="pending-card">
          <Clock size={48} />
          <h2>Verification in Progress</h2>
          <p>Your business verification is currently being reviewed by our team.</p>
          <p>This usually takes 3-5 business days. You will be notified once completed.</p>
          {submittedAt && (
            <p className="submitted-date">
              <Clock size={14} />
              Submitted on: {new Date(submittedAt).toLocaleDateString()}
            </p>
          )}
          <div className="pending-lock">
            <Lock size={20} />
            <span>Verification locked - Cannot edit while in review</span>
          </div>
          <button onClick={() => navigate('/dashboard/estate-firm')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // If already verified, show approved screen
  if (isVerified || verificationStatus === 'approved') {
    return (
      <div className="verification-approved">
        <div className="approved-card">
          <CheckCircle size={48} color="#10b981" />
          <h2>Verification Approved! ✓</h2>
          <p>Your business has been successfully verified.</p>
          <p className="approved-benefits">You can now:</p>
          <ul className="benefits-list">
            <li>✅ Post unlimited properties</li>
            <li>✅ Get "Verified" badge on your profile</li>
            <li>✅ Higher trust from tenants and landlords</li>
            <li>✅ Priority in search results</li>
          </ul>
          <button onClick={() => navigate('/dashboard/estate-firm')} className="btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    if (isSubmitted) return;
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleDirectorChange = (index, field, value) => {
    if (isSubmitted) return;
    setFormData(prev => {
      const updatedDirectors = [...prev.directors];
      updatedDirectors[index] = { ...updatedDirectors[index], [field]: value };
      return { ...prev, directors: updatedDirectors };
    });
  };

  const addDirector = () => {
    if (isSubmitted) return;
    setFormData(prev => ({
      ...prev,
      directors: [...prev.directors, {
        name: '', position: 'Director', idType: 'national-id', idNumber: '', idDocument: null, photo: null
      }]
    }));
  };

  const removeDirector = (index) => {
    if (isSubmitted) return;
    setFormData(prev => ({
      ...prev,
      directors: prev.directors.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = (field, file) => {
    if (isSubmitted) return;
    if (!file) {
      setFormData(prev => ({ ...prev, [field]: null }));
      setDocumentPreview(prev => ({ ...prev, [field]: null }));
      return;
    }

    const maxSize = field === 'businessPlan' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload PDF or image files only');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setDocumentPreview(prev => ({ ...prev, [field]: previewUrl }));
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleServiceToggle = (service) => {
    if (isSubmitted) return;
    setFormData(prev => ({
      ...prev,
      servicesOffered: prev.servicesOffered.includes(service)
        ? prev.servicesOffered.filter(s => s !== service)
        : [...prev.servicesOffered, service]
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    switch(step) {
      case 1:
        if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
        if (!formData.registrationNumber.trim()) newErrors.registrationNumber = 'CAC registration number is required';
        if (!formData.taxIdNumber.trim()) newErrors.taxIdNumber = 'Tax ID number is required';
        break;
      case 2:
        if (!formData.officeAddress.trim()) newErrors.officeAddress = 'Office address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        break;
      case 3:
        if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
        if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Contact email is required';
        if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Contact phone is required';
        break;
      case 4:
        if (!formData.cacDocument) newErrors.cacDocument = 'CAC certificate is required';
        if (!formData.taxDocument) newErrors.taxDocument = 'Tax clearance certificate is required';
        if (!formData.proofOfAddress) newErrors.proofOfAddress = 'Proof of address is required';
        break;
      case 5:
        formData.directors.forEach((director, index) => {
          if (!director.name.trim()) newErrors[`director_${index}_name`] = 'Director name is required';
          if (!director.idNumber.trim()) newErrors[`director_${index}_idNumber`] = 'ID number is required';
        });
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadDocument = async (file, documentType) => {
    if (!file || !user) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${documentType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `verifications/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('estate-verification-docs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('estate-verification-docs')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error(`Error uploading ${documentType}:`, error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) {
      alert('Please fix all errors before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload documents
      const [cacUrl, taxUrl, addressUrl, businessPlanUrl] = await Promise.all([
        formData.cacDocument ? uploadDocument(formData.cacDocument, 'cac_certificate') : null,
        formData.taxDocument ? uploadDocument(formData.taxDocument, 'tax_clearance') : null,
        formData.proofOfAddress ? uploadDocument(formData.proofOfAddress, 'proof_of_address') : null,
        formData.businessPlan ? uploadDocument(formData.businessPlan, 'business_plan') : null
      ]);

      // Update profiles table with KYC status
      await supabase
        .from('profiles')
        .update({
          kyc_status: 'pending',
          kyc_submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      // Insert into estate_verifications
      await supabase
        .from('estate_verifications')
        .upsert({
          user_id: user.id,
          business_name: formData.businessName,
          registration_number: formData.registrationNumber,
          status: 'pending',
          submitted_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      alert('Verification submitted successfully! Our team will review your application within 3-5 business days.');
      setIsSubmitted(true);
      setSubmittedAt(new Date().toISOString());
      navigate('/dashboard/estate-firm');

    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit verification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (isSubmitted) return;
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const prevStep = () => {
    if (isSubmitted) return;
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStep = () => {
    if (isSubmitted) return null;
    
    switch(currentStep) {
      case 1:
        return (
          <div className="verification-step">
            <h3>Business Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Business Name *</label>
                <input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} />
                {errors.businessName && <span className="error-text">{errors.businessName}</span>}
              </div>
              <div className="form-group">
                <label>CAC Registration Number *</label>
                <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} />
                {errors.registrationNumber && <span className="error-text">{errors.registrationNumber}</span>}
              </div>
              <div className="form-group">
                <label>Tax ID Number (TIN) *</label>
                <input type="text" name="taxIdNumber" value={formData.taxIdNumber} onChange={handleInputChange} />
                {errors.taxIdNumber && <span className="error-text">{errors.taxIdNumber}</span>}
              </div>
              <div className="form-group">
                <label>Year Established</label>
                <input type="number" name="yearEstablished" value={formData.yearEstablished} onChange={handleInputChange} placeholder="e.g., 2015" />
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="verification-step">
            <h3>Business Address</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Office Address *</label>
                <textarea name="officeAddress" value={formData.officeAddress} onChange={handleInputChange} rows={2} />
                {errors.officeAddress && <span className="error-text">{errors.officeAddress}</span>}
              </div>
              <div className="form-group">
                <label>City *</label>
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} />
                {errors.city && <span className="error-text">{errors.city}</span>}
              </div>
              <div className="form-group">
                <label>State *</label>
                <select name="state" value={formData.state} onChange={handleInputChange}>
                  <option value="">Select State</option>
                  <option value="Lagos">Lagos</option>
                  <option value="Abuja">Abuja</option>
                  <option value="Rivers">Rivers</option>
                  <option value="Oyo">Oyo</option>
                  <option value="Kano">Kano</option>
                  <option value="Edo">Edo</option>
                  <option value="Delta">Delta</option>
                  <option value="Ogun">Ogun</option>
                </select>
                {errors.state && <span className="error-text">{errors.state}</span>}
              </div>
              <div className="form-group">
                <label>Country</label>
                <input type="text" name="country" value={formData.country} disabled className="form-input" />
              </div>
              <div className="form-group">
                <label>Postal Code</label>
                <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} />
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="verification-step">
            <h3>Contact Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Contact Person *</label>
                <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} />
                {errors.contactPerson && <span className="error-text">{errors.contactPerson}</span>}
              </div>
              <div className="form-group">
                <label>Contact Email *</label>
                <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleInputChange} />
                {errors.contactEmail && <span className="error-text">{errors.contactEmail}</span>}
              </div>
              <div className="form-group">
                <label>Contact Phone *</label>
                <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleInputChange} />
                {errors.contactPhone && <span className="error-text">{errors.contactPhone}</span>}
              </div>
              <div className="form-group">
                <label>Alternative Phone</label>
                <input type="tel" name="alternativePhone" value={formData.alternativePhone} onChange={handleInputChange} />
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="verification-step">
            <h3>Business Documents</h3>
            <p className="step-description">Upload required business documents</p>
            
            <div className="documents-upload">
              <DocumentUpload
                label="CAC Certificate *"
                name="cacDocument"
                file={formData.cacDocument}
                preview={documentPreview.cacDocument}
                onUpload={handleFileUpload}
                error={errors.cacDocument}
                disabled={isSubmitted}
              />
              
              <DocumentUpload
                label="Tax Clearance Certificate *"
                name="taxDocument"
                file={formData.taxDocument}
                preview={documentPreview.taxDocument}
                onUpload={handleFileUpload}
                error={errors.taxDocument}
                disabled={isSubmitted}
              />
              
              <DocumentUpload
                label="Proof of Business Address *"
                name="proofOfAddress"
                file={formData.proofOfAddress}
                preview={documentPreview.proofOfAddress}
                onUpload={handleFileUpload}
                error={errors.proofOfAddress}
                disabled={isSubmitted}
              />
              
              <DocumentUpload
                label="Business Plan (Optional)"
                name="businessPlan"
                file={formData.businessPlan}
                preview={documentPreview.businessPlan}
                onUpload={handleFileUpload}
                disabled={isSubmitted}
              />
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="verification-step">
            <h3>Directors/Partners Information</h3>
            <p className="step-description">Provide details of all directors/partners</p>
            
            {formData.directors.map((director, index) => (
              <div key={index} className="director-form">
                <div className="director-header">
                  <h4>Director {index + 1}</h4>
                  {index > 0 && (
                    <button type="button" className="btn-danger btn-sm" onClick={() => removeDirector(index)}>
                      <XCircle size={14} /> Remove
                    </button>
                  )}
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input type="text" value={director.name} onChange={(e) => handleDirectorChange(index, 'name', e.target.value)} disabled={isSubmitted} />
                    {errors[`director_${index}_name`] && <span className="error-text">{errors[`director_${index}_name`]}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label>Position</label>
                    <input type="text" value={director.position} onChange={(e) => handleDirectorChange(index, 'position', e.target.value)} disabled={isSubmitted} />
                  </div>
                  
                  <div className="form-group">
                    <label>ID Type</label>
                    <select value={director.idType} onChange={(e) => handleDirectorChange(index, 'idType', e.target.value)} disabled={isSubmitted}>
                      {directorIdTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>ID Number *</label>
                    <input type="text" value={director.idNumber} onChange={(e) => handleDirectorChange(index, 'idNumber', e.target.value)} disabled={isSubmitted} />
                    {errors[`director_${index}_idNumber`] && <span className="error-text">{errors[`director_${index}_idNumber`]}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label>ID Document</label>
                    <div className="file-upload">
                      <label className={`upload-btn ${isSubmitted ? 'disabled' : ''}`}>
                        <Upload size={14} />
                        Upload ID Document
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleDirectorChange(index, 'idDocument', e.target.files[0])} style={{ display: 'none' }} disabled={isSubmitted} />
                      </label>
                      {director.idDocument && <span className="file-name">{director.idDocument.name}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {!isSubmitted && (
              <button type="button" className="btn-outline" onClick={addDirector}>
                <Users size={16} /> Add Another Director/Partner
              </button>
            )}
          </div>
        );
        
      case 6:
        return (
          <div className="verification-step">
            <h3>Business Operations</h3>
            <p className="step-description">Information about your business operations</p>
            
            <div className="services-section">
              <h4>Services Offered</h4>
              <div className="services-grid">
                {[
                  'Property Sales', 'Property Rentals', 'Property Management',
                  'Real Estate Consulting', 'Valuation Services', 'Tenant Screening',
                  'Property Marketing', 'Legal Services', 'Rent Collection'
                ].map(service => (
                  <div 
                    key={service} 
                    className={`service-option ${formData.servicesOffered.includes(service) ? 'selected' : ''} ${isSubmitted ? 'disabled' : ''}`} 
                    onClick={() => !isSubmitted && handleServiceToggle(service)}
                  >
                    {service}
                    {formData.servicesOffered.includes(service) && <CheckCircle size={16} className="check-icon" />}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Years in Operation</label>
                <input type="number" name="yearsInOperation" value={formData.yearsInOperation} onChange={handleInputChange} min="0" disabled={isSubmitted} />
              </div>
              
              <div className="form-group">
                <label>Number of Employees</label>
                <input type="number" name="numberOfEmployees" value={formData.numberOfEmployees} onChange={handleInputChange} min="0" disabled={isSubmitted} />
              </div>
              
              <div className="form-group">
                <label>Annual Turnover (₦)</label>
                <input type="number" name="annualTurnover" value={formData.annualTurnover} onChange={handleInputChange} min="0" disabled={isSubmitted} />
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (loading) {
    return <RentEasyLoader message="Loading verification..." fullScreen />;
  }

  return (
    <div className="estate-verification">
      <div className="verification-header">
        <h1>Business Verification</h1>
        <p>Complete verification to unlock property posting</p>
        {isSubmitted && (
          <div className="submitted-badge">
            <Clock size={16} />
            <span>Submitted - Awaiting Review</span>
          </div>
        )}
      </div>

      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${(currentStep / 6) * 100}%` }}></div>
      </div>

      <form onSubmit={handleSubmit} className="verification-form">
        {renderStep()}
        
        {!isSubmitted && (
          <div className="form-actions">
            {currentStep > 1 && (
              <button type="button" className="btn-outline" onClick={prevStep}>Previous</button>
            )}
            {currentStep < 6 ? (
              <button type="button" className="btn-primary" onClick={nextStep}>Continue</button>
            ) : (
              <button type="submit" className="btn-success" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default EstateVerification;