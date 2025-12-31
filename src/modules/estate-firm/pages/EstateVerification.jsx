import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import {
  Shield, Upload, FileText, Building, Users,
  CheckCircle, XCircle, Camera, Download,
  ArrowRight, AlertCircle, HelpCircle
} from 'lucide-react';
import './EstateVerification.css';

const EstateVerification = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Business Information
    businessName: '',
    businessType: 'estate-firm',
    registrationNumber: '',
    taxIdNumber: '',
    yearEstablished: '',
    
    // Step 2: Business Address
    officeAddress: '',
    city: '',
    state: '',
    country: 'Nigeria',
    postalCode: '',
    
    // Step 3: Contact Information
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    alternativePhone: '',
    
    // Step 4: Business Documents
    cacDocument: null,
    taxDocument: null,
    proofOfAddress: null,
    businessPlan: null,
    
    // Step 5: Directors/Partners
    directors: [
      {
        name: '',
        position: 'Director',
        idType: 'national-id',
        idNumber: '',
        idDocument: null,
        photo: null
      }
    ],
    
    // Step 6: Business Operations
    servicesOffered: [],
    yearsInOperation: '',
    numberOfEmployees: '',
    annualTurnover: '',
    
    // Verification Status
    status: 'pending',
    submittedAt: '',
    reviewedBy: '',
    reviewDate: '',
    comments: ''
  });

  const [documentPreview, setDocumentPreview] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const documentRequirements = [
    {
      title: 'CAC Certificate',
      description: 'Certificate of Incorporation from Corporate Affairs Commission',
      format: 'PDF, JPG, PNG',
      size: 'Max 5MB',
      required: true
    },
    {
      title: 'Tax Clearance Certificate',
      description: 'Current year tax clearance certificate',
      format: 'PDF, JPG, PNG',
      size: 'Max 5MB',
      required: true
    },
    {
      title: 'Proof of Business Address',
      description: 'Utility bill or lease agreement for business premises',
      format: 'PDF, JPG, PNG',
      size: 'Max 5MB',
      required: true
    },
    {
      title: 'Business Plan',
      description: 'Document outlining your business operations (Optional)',
      format: 'PDF, DOC',
      size: 'Max 10MB',
      required: false
    }
  ];

  const directorIdTypes = [
    { value: 'national-id', label: 'National ID Card' },
    { value: 'passport', label: 'International Passport' },
    { value: 'driver-license', label: "Driver's License" },
    { value: 'voter-card', label: "Voter's Card" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleDirectorChange = (index, field, value) => {
    setFormData(prev => {
      const updatedDirectors = [...prev.directors];
      updatedDirectors[index] = {
        ...updatedDirectors[index],
        [field]: value
      };
      return { ...prev, directors: updatedDirectors };
    });
  };

  const addDirector = () => {
    setFormData(prev => ({
      ...prev,
      directors: [
        ...prev.directors,
        {
          name: '',
          position: 'Director',
          idType: 'national-id',
          idNumber: '',
          idDocument: null,
          photo: null
        }
      ]
    }));
  };

  const removeDirector = (index) => {
    setFormData(prev => ({
      ...prev,
      directors: prev.directors.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = (field, file) => {
    if (file) {
      // Check file size
      const maxSize = field === 'businessPlan' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
        return;
      }

      // Check file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
        alert('Please upload PDF or image files only');
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setDocumentPreview(prev => ({
        ...prev,
        [field]: previewUrl
      }));

      setFormData(prev => ({
        ...prev,
        [field]: file
      }));
    }
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => {
      const services = prev.servicesOffered.includes(service)
        ? prev.servicesOffered.filter(s => s !== service)
        : [...prev.servicesOffered, service];
      return { ...prev, servicesOffered: services };
    });
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

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      alert('Please fix all errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const submissionData = new FormData();
      
      // Add all form data
      Object.keys(formData).forEach(key => {
        if (key === 'directors') {
          submissionData.append(key, JSON.stringify(formData[key]));
        } else if (['cacDocument', 'taxDocument', 'proofOfAddress', 'businessPlan'].includes(key) && formData[key]) {
          submissionData.append(key, formData[key]);
        } else if (key === 'servicesOffered') {
          submissionData.append(key, JSON.stringify(formData[key]));
        } else {
          submissionData.append(key, formData[key]);
        }
      });

      // Add user info
      submissionData.append('userId', user?.id);
      submissionData.append('userEmail', user?.email);
      submissionData.append('submittedAt', new Date().toISOString());
      submissionData.append('status', 'pending');

      // Mock API call - replace with actual API
      console.log('Submitting verification data:', Object.fromEntries(submissionData));
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save to localStorage for demo
      const existingVerifications = JSON.parse(localStorage.getItem('estateVerifications') || '[]');
      const verificationData = {
        ...Object.fromEntries(submissionData),
        files: {
          cacDocument: formData.cacDocument?.name,
          taxDocument: formData.taxDocument?.name,
          proofOfAddress: formData.proofOfAddress?.name,
          businessPlan: formData.businessPlan?.name
        },
        id: `verif_${Date.now()}`,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      };
      
      existingVerifications.push(verificationData);
      localStorage.setItem('estateVerifications', JSON.stringify(existingVerifications));
      
      // Also update user verification status
      localStorage.setItem('userVerification', JSON.stringify({
        status: 'pending',
        submittedAt: new Date().toISOString()
      }));

      alert('Verification submitted successfully! Our team will review your application within 3-5 business days.');
      navigate('/dashboard/estate-firm');
      
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit verification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="verification-step">
            <h3>Business Information</h3>
            <p className="step-description">Provide your official business details</p>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Business Name *</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="Enter official business name"
                  className={`form-input ${errors.businessName ? 'error' : ''}`}
                />
                {errors.businessName && <span className="error-text">{errors.businessName}</span>}
              </div>
              
              <div className="form-group">
                <label>Business Type</label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="estate-firm">Estate Firm/Agency</option>
                  <option value="property-management">Property Management Company</option>
                  <option value="real-estate">Real Estate Developer</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>CAC Registration Number *</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                  placeholder="RC-1234567"
                  className={`form-input ${errors.registrationNumber ? 'error' : ''}`}
                />
                {errors.registrationNumber && <span className="error-text">{errors.registrationNumber}</span>}
              </div>
              
              <div className="form-group">
                <label>Tax Identification Number (TIN) *</label>
                <input
                  type="text"
                  name="taxIdNumber"
                  value={formData.taxIdNumber}
                  onChange={handleInputChange}
                  placeholder="Enter TIN"
                  className={`form-input ${errors.taxIdNumber ? 'error' : ''}`}
                />
                {errors.taxIdNumber && <span className="error-text">{errors.taxIdNumber}</span>}
              </div>
              
              <div className="form-group">
                <label>Year Established</label>
                <input
                  type="number"
                  name="yearEstablished"
                  value={formData.yearEstablished}
                  onChange={handleInputChange}
                  placeholder="e.g., 2015"
                  min="1900"
                  max={new Date().getFullYear()}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="verification-step">
            <h3>Business Address</h3>
            <p className="step-description">Provide your official business address</p>
            
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Office Address *</label>
                <textarea
                  name="officeAddress"
                  value={formData.officeAddress}
                  onChange={handleInputChange}
                  placeholder="Full office address"
                  rows={3}
                  className={`form-textarea ${errors.officeAddress ? 'error' : ''}`}
                />
                {errors.officeAddress && <span className="error-text">{errors.officeAddress}</span>}
              </div>
              
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className={`form-input ${errors.city ? 'error' : ''}`}
                />
                {errors.city && <span className="error-text">{errors.city}</span>}
              </div>
              
              <div className="form-group">
                <label>State *</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={`form-select ${errors.state ? 'error' : ''}`}
                >
                  <option value="">Select State</option>
                  <option value="Lagos">Lagos</option>
                  <option value="Abuja">Abuja</option>
                  <option value="Rivers">Rivers</option>
                  <option value="Oyo">Oyo</option>
                  <option value="Kano">Kano</option>
                  <option value="Edo">Edo</option>
                  <option value="Delta">Delta</option>
                  <option value="Ogun">Ogun</option>
                  <option value="Kaduna">Kaduna</option>
                  <option value="Plateau">Plateau</option>
                  <option value="Akwa Ibom">Akwa Ibom</option>
                  <option value="Cross River">Cross River</option>
                  <option value="Imo">Imo</option>
                  <option value="Enugu">Enugu</option>
                  <option value="Anambra">Anambra</option>
                  <option value="Abia">Abia</option>
                </select>
                {errors.state && <span className="error-text">{errors.state}</span>}
              </div>
              
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="form-input"
                  disabled
                />
              </div>
              
              <div className="form-group">
                <label>Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="Postal code"
                  className="form-input"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="verification-step">
            <h3>Contact Information</h3>
            <p className="step-description">Primary contact details for verification</p>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Contact Person *</label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  placeholder="Full name of contact person"
                  className={`form-input ${errors.contactPerson ? 'error' : ''}`}
                />
                {errors.contactPerson && <span className="error-text">{errors.contactPerson}</span>}
              </div>
              
              <div className="form-group">
                <label>Contact Email *</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  placeholder="contact@company.com"
                  className={`form-input ${errors.contactEmail ? 'error' : ''}`}
                />
                {errors.contactEmail && <span className="error-text">{errors.contactEmail}</span>}
              </div>
              
              <div className="form-group">
                <label>Contact Phone *</label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  placeholder="+2348012345678"
                  className={`form-input ${errors.contactPhone ? 'error' : ''}`}
                />
                {errors.contactPhone && <span className="error-text">{errors.contactPhone}</span>}
              </div>
              
              <div className="form-group">
                <label>Alternative Phone</label>
                <input
                  type="tel"
                  name="alternativePhone"
                  value={formData.alternativePhone}
                  onChange={handleInputChange}
                  placeholder="Alternative phone number"
                  className="form-input"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="verification-step">
            <h3>Business Documents</h3>
            <p className="step-description">Upload required business documents</p>
            
            <div className="documents-requirements">
              <h4>Document Requirements</h4>
              <div className="requirements-list">
                {documentRequirements.map((doc, index) => (
                  <div key={index} className="requirement-item">
                    <div className="requirement-header">
                      <FileText size={16} />
                      <div>
                        <strong>{doc.title} {doc.required ? '*' : ''}</strong>
                        <small>{doc.description}</small>
                      </div>
                    </div>
                    <div className="requirement-meta">
                      <span className="format">{doc.format}</span>
                      <span className="size">{doc.size}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="documents-upload">
              <div className="upload-grid">
                <DocumentUpload
                  label="CAC Certificate *"
                  name="cacDocument"
                  file={formData.cacDocument}
                  preview={documentPreview.cacDocument}
                  onUpload={handleFileUpload}
                  error={errors.cacDocument}
                />
                
                <DocumentUpload
                  label="Tax Clearance Certificate *"
                  name="taxDocument"
                  file={formData.taxDocument}
                  preview={documentPreview.taxDocument}
                  onUpload={handleFileUpload}
                  error={errors.taxDocument}
                />
                
                <DocumentUpload
                  label="Proof of Business Address *"
                  name="proofOfAddress"
                  file={formData.proofOfAddress}
                  preview={documentPreview.proofOfAddress}
                  onUpload={handleFileUpload}
                  error={errors.proofOfAddress}
                />
                
                <DocumentUpload
                  label="Business Plan (Optional)"
                  name="businessPlan"
                  file={formData.businessPlan}
                  preview={documentPreview.businessPlan}
                  onUpload={handleFileUpload}
                />
              </div>
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
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeDirector(index)}
                    >
                      <XCircle size={14} />
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={director.name}
                      onChange={(e) => handleDirectorChange(index, 'name', e.target.value)}
                      placeholder="Full name"
                      className={`form-input ${errors[`director_${index}_name`] ? 'error' : ''}`}
                    />
                    {errors[`director_${index}_name`] && (
                      <span className="error-text">{errors[`director_${index}_name`]}</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>Position</label>
                    <input
                      type="text"
                      value={director.position}
                      onChange={(e) => handleDirectorChange(index, 'position', e.target.value)}
                      placeholder="Director, Partner, etc."
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>ID Type</label>
                    <select
                      value={director.idType}
                      onChange={(e) => handleDirectorChange(index, 'idType', e.target.value)}
                      className="form-select"
                    >
                      {directorIdTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>ID Number *</label>
                    <input
                      type="text"
                      value={director.idNumber}
                      onChange={(e) => handleDirectorChange(index, 'idNumber', e.target.value)}
                      placeholder="ID Number"
                      className={`form-input ${errors[`director_${index}_idNumber`] ? 'error' : ''}`}
                    />
                    {errors[`director_${index}_idNumber`] && (
                      <span className="error-text">{errors[`director_${index}_idNumber`]}</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>ID Document</label>
                    <div className="file-upload">
                      <label className="upload-btn">
                        <Upload size={14} />
                        Upload ID Document
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleDirectorChange(index, 'idDocument', e.target.files[0])}
                          style={{ display: 'none' }}
                        />
                      </label>
                      {director.idDocument && (
                        <span className="file-name">{director.idDocument.name}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              className="btn btn-outline"
              onClick={addDirector}
            >
              <Users size={16} />
              Add Another Director/Partner
            </button>
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
                  'Property Sales',
                  'Property Rentals', 
                  'Property Management',
                  'Real Estate Consulting',
                  'Valuation Services',
                  'Tenant Screening',
                  'Property Marketing',
                  'Legal Services',
                  'Rent Collection',
                  'Property Development'
                ].map(service => (
                  <div
                    key={service}
                    className={`service-option ${formData.servicesOffered.includes(service) ? 'selected' : ''}`}
                    onClick={() => handleServiceToggle(service)}
                  >
                    {service}
                    {formData.servicesOffered.includes(service) && (
                      <CheckCircle size={16} className="check-icon" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Years in Operation</label>
                <input
                  type="number"
                  name="yearsInOperation"
                  value={formData.yearsInOperation}
                  onChange={handleInputChange}
                  placeholder="Number of years"
                  min="0"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Number of Employees</label>
                <input
                  type="number"
                  name="numberOfEmployees"
                  value={formData.numberOfEmployees}
                  onChange={handleInputChange}
                  placeholder="Approximate number"
                  min="0"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Annual Turnover (₦)</label>
                <input
                  type="number"
                  name="annualTurnover"
                  value={formData.annualTurnover}
                  onChange={handleInputChange}
                  placeholder="Approximate annual turnover"
                  min="0"
                  className="form-input"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="estate-verification">
      {/* Header */}
      <div className="verification-header">
        <div className="header-content">
          <h1>Business Verification</h1>
          <p className="subtitle">
            Complete verification to unlock all platform features
          </p>
        </div>
        
        <div className="verification-steps">
          {[1, 2, 3, 4, 5, 6].map(step => (
            <div key={step} className="step-indicator">
              <div className={`step-circle ${currentStep >= step ? 'active' : ''}`}>
                {step}
              </div>
              <span className="step-label">
                {step === 1 && 'Business Info'}
                {step === 2 && 'Address'}
                {step === 3 && 'Contact'}
                {step === 4 && 'Documents'}
                {step === 5 && 'Directors'}
                {step === 6 && 'Operations'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div 
          className="progress-bar" 
          style={{ width: `${(currentStep / 6) * 100}%` }}
        ></div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="verification-form">
        {renderStep()}
        
        {/* Form Actions */}
        <div className="form-actions">
          <div className="action-buttons">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={prevStep}
                disabled={isSubmitting}
              >
                Previous
              </button>
            )}
            
            {currentStep < 6 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={nextStep}
                disabled={isSubmitting}
              >
                Continue
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-success"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Shield size={16} />
                    Submit for Verification
                  </>
                )}
              </button>
            )}
          </div>
          
          <div className="form-help">
            <HelpCircle size={16} />
            <small>
              Step {currentStep} of 6 • {Math.round((currentStep / 6) * 100)}% complete
            </small>
          </div>
        </div>
      </form>

      {/* Important Notice */}
      <div className="verification-notice">
        <AlertCircle size={20} />
        <div className="notice-content">
          <h4>Important Information</h4>
          <ul>
            <li>Verification process takes 3-5 business days</li>
            <li>All documents must be clear and legible</li>
            <li>Ensure all information matches your business documents</li>
            <li>You will receive email notification once verified</li>
            <li>Verified firms get premium features and higher trust ratings</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Document Upload Component
const DocumentUpload = ({ label, name, file, preview, onUpload, error }) => {
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      onUpload(name, selectedFile);
    }
  };

  return (
    <div className="document-upload">
      <label className="upload-label">
        {label}
        {error && <span className="error-indicator"> *</span>}
      </label>
      
      <div className={`upload-area ${error ? 'error' : ''}`}>
        {preview ? (
          <div className="document-preview">
            <img src={preview} alt="Preview" />
            <div className="preview-overlay">
              <span>{file?.name || 'Document'}</span>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => onUpload(name, null)}
              >
                Change
              </button>
            </div>
          </div>
        ) : (
          <div className="upload-placeholder">
            <Upload size={24} />
            <p>Click to upload document</p>
            <small>PDF, JPG, PNG up to 5MB</small>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id={`file-${name}`}
            />
          </div>
        )}
      </div>
      
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default EstateVerification;