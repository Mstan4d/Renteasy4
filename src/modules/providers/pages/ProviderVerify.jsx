// src/modules/providers/pages/ProviderVerify.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import {
  Shield, Upload, FileText, CheckCircle,
  AlertCircle, Clock, User, Building,
  Camera, Mail, Phone, MapPin,
  Award, BadgeCheck, ExternalLink
} from 'lucide-react';
import './ProviderVerify.css';

const ProviderVerify = () => {
  const { user } = useAuth();
  const [verificationStep, setVerificationStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [providerId, setProviderId] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, submitted, approved, rejected

  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    registrationNumber: '',
    taxId: '',
    yearsInOperation: '',
    servicesOffered: [],
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    officeAddress: '',
    state: '',
    lga: '',
    website: '',
    socialMedia: '',
    certifications: []
  });

  const [documents, setDocuments] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});

  const steps = [
    { number: 1, title: 'Business Information', description: 'Basic details about your business' },
    { number: 2, title: 'Contact Details', description: 'How clients can reach you' },
    { number: 3, title: 'Service Details', description: 'What services you offer' },
    { number: 4, title: 'Upload Documents', description: 'Verification documents' },
    { number: 5, title: 'Review & Submit', description: 'Final review and submission' }
  ];

  const documentTypes = [
    { id: 'cacCertificate', label: 'CAC Certificate', description: 'Official business registration certificate' },
    { id: 'taxCertificate', label: 'Tax Certificate', description: 'Valid tax identification document' },
    { id: 'idCard', label: 'ID Card', description: 'Government-issued ID (Driver\'s License, NIN, etc.)' },
    { id: 'proofOfAddress', label: 'Proof of Address', description: 'Utility bill or bank statement' },
    { id: 'professionalCertificate', label: 'Professional Certificate', description: 'Certifications in your field' },
    { id: 'portfolio', label: 'Portfolio', description: 'Examples of previous work (optional)' }
  ];

  const benefits = [
    { icon: <BadgeCheck size={20} />, title: 'Verified Badge', description: 'Gain trust with verified status badge' },
    { icon: <Award size={20} />, title: 'Higher Ranking', description: 'Appear higher in search results' },
    { icon: <Shield size={20} />, title: 'Trust & Credibility', description: 'Build credibility with clients' },
    { icon: <CheckCircle size={20} />, title: 'More Bookings', description: 'Get more business opportunities' }
  ];

  // Fetch existing provider data and documents
  useEffect(() => {
    if (user?.id) {
      fetchProviderData();
    }
  }, [user]);

  const fetchProviderData = async () => {
    setLoading(true);
    try {
      // Get service_providers record for this user
      const { data: provider, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (provider) {
        setProviderId(provider.id);
        setFormData({
          businessName: provider.business_name || '',
          businessType: provider.business_type || '',
          registrationNumber: provider.registration_number || '',
          taxId: provider.tax_id || '',
          yearsInOperation: provider.years_in_operation || '',
          servicesOffered: provider.services_offered || [],
          contactPerson: provider.contact_person || '',
          contactEmail: provider.contact_email || '',
          contactPhone: provider.contact_phone || '',
          officeAddress: provider.office_address || '',
          state: provider.state || '',
          lga: provider.lga || '',
          website: provider.website || '',
          socialMedia: provider.social_media || '',
          certifications: provider.certifications || []
        });
        setVerificationStatus(provider.verification_status || 'pending');

        // Fetch uploaded documents
        const { data: docs, error: docsError } = await supabase
          .from('verification_documents')
          .select('*')
          .eq('provider_id', provider.id);
        if (!docsError && docs) {
          const docsMap = {};
          docs.forEach(doc => {
            docsMap[doc.document_type] = {
              url: doc.file_url,
              name: doc.file_name,
              id: doc.id
            };
          });
          setDocuments(docsMap);
        }
      } else {
        // No provider record – user should have one from registration; but create if missing?
        // For now, we'll just proceed with empty form.
      }
    } catch (error) {
      console.error('Error fetching provider data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (documentId, file) => {
    if (!file) {
      // Remove document
      setDocuments(prev => {
        const newDocs = { ...prev };
        delete newDocs[documentId];
        return newDocs;
      });
      return;
    }

    try {
      setUploadProgress(prev => ({ ...prev, [documentId]: 0 }));

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${documentId}_${Date.now()}.${fileExt}`;
      const filePath = `verification-docs/${fileName}`;

      // Upload with progress tracking (if supported by Supabase JS)
      const { error: uploadError } = await supabase.storage
        .from('verification-docs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('verification-docs')
        .getPublicUrl(filePath);

      const fileUrl = urlData.publicUrl;

      // Save document record in DB
      if (providerId) {
        const { error: dbError } = await supabase
          .from('verification_documents')
          .upsert({
            provider_id: providerId,
            document_type: documentId,
            file_url: fileUrl,
            file_name: file.name
          }, { onConflict: 'provider_id, document_type' });

        if (dbError) throw dbError;
      }

      // Update local state
      setDocuments(prev => ({
        ...prev,
        [documentId]: { url: fileUrl, name: file.name }
      }));

      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[documentId];
        return newProgress;
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!providerId) {
      // Should have provider record – maybe create it first
      alert('Provider record not found. Please contact support.');
      return;
    }

    setSubmitting(true);
    try {
      // Update service_providers with form data
      const { error: updateError } = await supabase
        .from('service_providers')
        .update({
          business_name: formData.businessName,
          business_type: formData.businessType,
          registration_number: formData.registrationNumber,
          tax_id: formData.taxId,
          years_in_operation: formData.yearsInOperation,
          services_offered: formData.servicesOffered,
          contact_person: formData.contactPerson,
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone,
          office_address: formData.officeAddress,
          state: formData.state,
          lga: formData.lga,
          website: formData.website,
          social_media: formData.socialMedia,
          certifications: formData.certifications,
          verification_status: 'submitted'
        })
        .eq('id', providerId);

      if (updateError) throw updateError;

      // Also update profile KYC status
      await supabase
        .from('profiles')
        .update({ kyc_status: 'submitted' })
        .eq('id', user.id);

      setVerificationStatus('submitted');
      setVerificationStep(6); // Show completion screen
    } catch (error) {
      console.error('Error submitting verification:', error);
      alert('Failed to submit verification. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (verificationStep) {
      case 1:
        return (
          <div>
            <div className="content-header">
              <h3 className="content-title">Business Information</h3>
              <p className="content-description">Tell us about your business or professional practice</p>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Business Name *</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Enter your business name"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Business Type *</label>
                <select
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  className="form-select"
                >
                  <option value="">Select business type</option>
                  <option value="sole-proprietorship">Sole Proprietorship</option>
                  <option value="partnership">Partnership</option>
                  <option value="llc">Limited Liability Company</option>
                  <option value="individual">Individual Professional</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">CAC Registration Number</label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  placeholder="RC123456"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tax Identification Number (TIN)</label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  placeholder="12345678-0001"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Years in Operation *</label>
                <select
                  value={formData.yearsInOperation}
                  onChange={(e) => setFormData({ ...formData, yearsInOperation: e.target.value })}
                  className="form-select"
                >
                  <option value="">Select years</option>
                  <option value="less-than-1">Less than 1 year</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10-plus">10+ years</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <div className="content-header">
              <h3 className="content-title">Contact Details</h3>
              <p className="content-description">How clients can reach you for business</p>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Contact Person *</label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="Full name"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="contact@business.com"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="+234 801 234 5678"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Office Address *</label>
                <input
                  type="text"
                  value={formData.officeAddress}
                  onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                  placeholder="123 Business Street, City"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">State *</label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="form-select"
                >
                  <option value="">Select state</option>
                  <option value="lagos">Lagos</option>
                  <option value="abuja">Abuja</option>
                  <option value="rivers">Rivers</option>
                  <option value="oyo">Oyo</option>
                  <option value="kaduna">Kaduna</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Local Government Area (LGA)</label>
                <input
                  type="text"
                  value={formData.lga}
                  onChange={(e) => setFormData({ ...formData, lga: e.target.value })}
                  placeholder="LGA name"
                  className="form-input"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <div className="content-header">
              <h3 className="content-title">Service Details</h3>
              <p className="content-description">What services do you offer on RentEasy?</p>
            </div>
            <div className="form-group">
              <label className="form-label">Select Services You Offer *</label>
              <div className="checkbox-group">
                {['Cleaning Services', 'Painting', 'Plumbing', 'Electrical Work', 'Carpentry',
                  'Security Installation', 'Gardening', 'Moving Services', 'Pest Control',
                  'AC Repair'].map(service => (
                  <label key={service} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.servicesOffered.includes(service)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            servicesOffered: [...formData.servicesOffered, service]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            servicesOffered: formData.servicesOffered.filter(s => s !== service)
                          });
                        }
                      }}
                    />
                    {service}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Website (Optional)</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://yourwebsite.com"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Social Media Profiles (Optional)</label>
              <input
                type="text"
                value={formData.socialMedia}
                onChange={(e) => setFormData({ ...formData, socialMedia: e.target.value })}
                placeholder="Instagram, Facebook, Twitter handles"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Professional Certifications (Optional)</label>
              <textarea
                value={formData.certifications.join('\n')}
                onChange={(e) => setFormData({
                  ...formData,
                  certifications: e.target.value.split('\n').filter(c => c.trim())
                })}
                placeholder="List your certifications, one per line"
                className="form-textarea"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <div className="content-header">
              <h3 className="content-title">Upload Documents</h3>
              <p className="content-description">Upload required documents for verification</p>
            </div>
            {documentTypes.map((doc) => (
              <div key={doc.id} className="document-section">
                <h4 className="document-title">{doc.label}</h4>
                <p className="document-description">{doc.description}</p>

                {documents[doc.id] ? (
                  <div className="uploaded-file">
                    <div className="file-info">
                      <FileText size={20} />
                      <div>
                        <div className="file-name">{documents[doc.id].name}</div>
                      </div>
                    </div>
                    <button
                      className="remove-button"
                      onClick={() => handleFileUpload(doc.id, null)}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    className="document-upload"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.borderColor = '#2563eb';
                      e.currentTarget.style.background = '#eff6ff';
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.background = 'white';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file) handleFileUpload(doc.id, file);
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.background = 'white';
                    }}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
                      input.onchange = (e) => {
                        const file = e.target.files[0];
                        if (file) handleFileUpload(doc.id, file);
                      };
                      input.click();
                    }}
                  >
                    <div className="upload-icon">
                      <Upload size={24} />
                    </div>
                    <div className="upload-title">Click to upload or drag and drop</div>
                    <div className="upload-description">
                      PDF, JPG, PNG, DOC up to 10MB
                    </div>
                    <button className="upload-button">
                      <Upload size={16} />
                      Choose File
                    </button>
                  </div>
                )}
                {uploadProgress[doc.id] !== undefined && (
                  <div className="upload-progress">
                    <div className="progress-bar" style={{ width: `${uploadProgress[doc.id]}%` }}></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 5:
        return (
          <div>
            <div className="content-header">
              <h3 className="content-title">Review & Submit</h3>
              <p className="content-description">Review your information before submitting for verification</p>
            </div>

            <div className="review-section">
              <h4 className="review-title">Business Information</h4>
              {[
                ['Business Name', formData.businessName],
                ['Business Type', formData.businessType],
                ['CAC Number', formData.registrationNumber || 'Not provided'],
                ['Tax ID', formData.taxId || 'Not provided'],
                ['Years in Operation', formData.yearsInOperation]
              ].map(([label, value]) => (
                <div key={label} className="review-item">
                  <span className="review-label">{label}</span>
                  <span className="review-value">{value || '-'}</span>
                </div>
              ))}
            </div>

            <div className="review-section">
              <h4 className="review-title">Contact Details</h4>
              {[
                ['Contact Person', formData.contactPerson],
                ['Email', formData.contactEmail],
                ['Phone', formData.contactPhone],
                ['Address', formData.officeAddress],
                ['State/LGA', `${formData.state}${formData.lga ? ` / ${formData.lga}` : ''}`]
              ].map(([label, value]) => (
                <div key={label} className="review-item">
                  <span className="review-label">{label}</span>
                  <span className="review-value">{value || '-'}</span>
                </div>
              ))}
            </div>

            <div className="review-section">
              <h4 className="review-title">Services & Documents</h4>
              <div className="review-item">
                <span className="review-label">Services Offered</span>
                <span className="review-value">{formData.servicesOffered.length} services</span>
              </div>
              <div className="review-item">
                <span className="review-label">Documents Uploaded</span>
                <span className="review-value">
                  {Object.keys(documents).length} of {documentTypes.length}
                </span>
              </div>
            </div>

            <div className="benefits-grid">
              {benefits.map((benefit, index) => (
                <div key={index} className="benefit-card">
                  <div className="benefit-icon">{benefit.icon}</div>
                  <h5 className="benefit-title">{benefit.title}</h5>
                  <p className="benefit-description">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="completed-state">
            <div className="completed-icon">
              <CheckCircle size={48} color="#10b981" />
            </div>
            <h2 className="completed-title">Verification Submitted!</h2>
            <p className="completed-text">
              Your verification request has been submitted successfully. Our team will review your application within 2-3 business days. You'll receive a notification once your verification is complete.
            </p>
            <button className="action-button">
              <ExternalLink size={16} />
              View Status
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <div className="loading">Loading verification data...</div>;
  }

  return (
    <div className="verify-container">
      {/* Header */}
      <div className="verify-header">
        <h1 className="verify-title">Get Verified on RentEasy</h1>
        <p className="verify-subtitle">
          Complete verification to build trust with clients and unlock premium features
        </p>
      </div>

      {/* Verification Status */}
      {verificationStatus === 'pending' && (
        <div className="verification-status">
          <Clock className="status-icon" size={24} />
          <div className="status-text">
            <h4 className="status-title">Verification Required</h4>
            <p className="status-description">
              Complete verification to access all features and build trust with clients
            </p>
          </div>
        </div>
      )}

      {/* Steps Progress */}
      {verificationStep <= 5 && (
        <div className="steps-container">
          <div className="step-line"></div>
          {steps.map((step) => (
            <div key={step.number} className="step">
              <div className={`step-number ${verificationStep === step.number ? 'active' : ''} ${verificationStep > step.number ? 'completed' : ''}`}>
                {verificationStep > step.number ? <CheckCircle size={20} /> : step.number}
              </div>
              <div className={`step-title ${verificationStep === step.number ? 'active' : ''}`}>
                {step.title}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content Area */}
      <div className="content-area">
        {renderStepContent()}

        {/* Navigation Buttons */}
        {verificationStep <= 5 && verificationStep !== 6 && (
          <div className="navigation-buttons">
            {verificationStep > 1 && (
              <button
                className="nav-button"
                onClick={() => setVerificationStep(verificationStep - 1)}
                disabled={submitting}
              >
                Previous
              </button>
            )}

            <div style={{ marginLeft: 'auto' }}>
              <button
                className={`nav-button ${verificationStep === 5 ? 'submit-button' : 'next-button'}`}
                onClick={() => {
                  if (verificationStep < 5) {
                    setVerificationStep(verificationStep + 1);
                  } else {
                    handleSubmit();
                  }
                }}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : verificationStep === 5 ? 'Submit Verification' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderVerify;