// src/modules/providers/pages/ProviderVerify.jsx
import React, { useState } from 'react';
import { 
  Shield, Upload, FileText, CheckCircle,
  AlertCircle, Clock, User, Building,
  Camera, Mail, Phone, MapPin,
  Award, BadgeCheck, ExternalLink
} from 'lucide-react';

const ProviderVerify = () => {
  const [verificationStep, setVerificationStep] = useState(1);
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

  const [documents, setDocuments] = useState({
    cacCertificate: null,
    taxCertificate: null,
    idCard: null,
    proofOfAddress: null,
    professionalCertificate: null,
    portfolio: null
  });

  const [uploading, setUploading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, submitted, approved, rejected

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

  const styles = {
    container: {
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '1.5rem'
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    title: {
      fontSize: '1.875rem',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '1rem',
      maxWidth: '600px',
      margin: '0 auto'
    },
    verificationStatus: {
      background: '#fef3c7',
      border: '1px solid #fbbf24',
      borderRadius: '0.75rem',
      padding: '1rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '2rem'
    },
    statusIcon: {
      color: '#d97706'
    },
    statusText: {
      flex: 1
    },
    statusTitle: {
      fontWeight: '600',
      color: '#92400e',
      marginBottom: '0.25rem'
    },
    statusDescription: {
      fontSize: '0.875rem',
      color: '#92400e'
    },
    stepsContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '2rem',
      position: 'relative'
    },
    stepLine: {
      position: 'absolute',
      top: '24px',
      left: '50px',
      right: '50px',
      height: '2px',
      background: '#e5e7eb',
      zIndex: 1
    },
    step: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      zIndex: 2,
      flex: 1
    },
    stepNumber: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      fontSize: '1rem',
      marginBottom: '0.5rem',
      border: '2px solid #e5e7eb',
      background: 'white',
      transition: 'all 0.3s ease'
    },
    stepActive: {
      borderColor: '#2563eb',
      background: '#2563eb',
      color: 'white'
    },
    stepCompleted: {
      borderColor: '#10b981',
      background: '#10b981',
      color: 'white'
    },
    stepTitle: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#6b7280',
      textAlign: 'center',
      maxWidth: '120px'
    },
    stepActiveTitle: {
      color: '#2563eb',
      fontWeight: '600'
    },
    contentArea: {
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '0.75rem',
      padding: '2rem',
      marginBottom: '2rem'
    },
    contentHeader: {
      marginBottom: '2rem'
    },
    contentTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '0.5rem'
    },
    contentDescription: {
      color: '#6b7280',
      fontSize: '1rem'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(1, 1fr)',
      gap: '1.5rem'
    },
    '@media (min-width: 768px)': {
      formGrid: {
        gridTemplateColumns: 'repeat(2, 1fr)'
      }
    },
    formGroup: {
      marginBottom: '1rem'
    },
    formLabel: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    formInput: {
      width: '100%',
      padding: '0.625rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      color: '#374151',
      transition: 'all 0.2s ease'
    },
    formSelect: {
      width: '100%',
      padding: '0.625rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      color: '#374151',
      background: 'white',
      cursor: 'pointer'
    },
    textarea: {
      width: '100%',
      padding: '0.625rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      color: '#374151',
      minHeight: '100px',
      resize: 'vertical'
    },
    checkboxGroup: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      marginTop: '1rem'
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      color: '#374151',
      cursor: 'pointer'
    },
    documentUpload: {
      border: '2px dashed #d1d5db',
      borderRadius: '0.75rem',
      padding: '2rem',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginBottom: '1rem'
    },
    uploadIcon: {
      width: '3rem',
      height: '3rem',
      background: '#f3f4f6',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem'
    },
    uploadTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    uploadDescription: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '1rem'
    },
    uploadButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      background: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer'
    },
    uploadedFile: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem',
      background: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      marginBottom: '0.5rem'
    },
    fileInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    fileName: {
      fontWeight: '500',
      color: '#111827'
    },
    fileSize: {
      fontSize: '0.75rem',
      color: '#6b7280'
    },
    removeButton: {
      background: 'none',
      border: 'none',
      color: '#ef4444',
      cursor: 'pointer',
      fontSize: '0.875rem'
    },
    reviewSection: {
      marginBottom: '1.5rem'
    },
    reviewTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '1rem',
      paddingBottom: '0.5rem',
      borderBottom: '1px solid #e5e7eb'
    },
    reviewItem: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.75rem'
    },
    reviewLabel: {
      color: '#6b7280',
      fontSize: '0.875rem'
    },
    reviewValue: {
      fontWeight: '500',
      color: '#111827',
      fontSize: '0.875rem',
      textAlign: 'right'
    },
    benefitsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(1, 1fr)',
      gap: '1rem',
      marginBottom: '2rem'
    },
    '@media (min-width: 640px)': {
      benefitsGrid: {
        gridTemplateColumns: 'repeat(2, 1fr)'
      }
    },
    benefitCard: {
      background: '#f0f9ff',
      border: '1px solid #bae6fd',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      textAlign: 'center'
    },
    benefitIcon: {
      width: '3rem',
      height: '3rem',
      background: '#bae6fd',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem'
    },
    benefitTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#0369a1',
      marginBottom: '0.5rem'
    },
    benefitDescription: {
      fontSize: '0.875rem',
      color: '#0c4a6e'
    },
    navigationButtons: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '2rem'
    },
    navButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      border: '1px solid #d1d5db',
      background: 'white',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    nextButton: {
      background: '#2563eb',
      borderColor: '#2563eb',
      color: 'white'
    },
    submitButton: {
      background: '#10b981',
      borderColor: '#10b981',
      color: 'white',
      fontWeight: '600'
    },
    completedState: {
      textAlign: 'center',
      padding: '3rem 1.5rem'
    },
    completedIcon: {
      width: '5rem',
      height: '5rem',
      background: '#d1fae5',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 2rem'
    },
    completedTitle: {
      fontSize: '1.875rem',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '1rem'
    },
    completedText: {
      fontSize: '1rem',
      color: '#6b7280',
      maxWidth: '500px',
      margin: '0 auto 2rem'
    },
    actionButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      background: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      textDecoration: 'none'
    }
  };

  const handleFileUpload = (documentId, file) => {
    setDocuments(prev => ({
      ...prev,
      [documentId]: file
    }));
  };

  const handleSubmit = () => {
    setUploading(true);
    // Simulate API call
    setTimeout(() => {
      setUploading(false);
      setVerificationStatus('submitted');
      setVerificationStep(6); // Show completed state
    }, 2000);
  };

  const renderStepContent = () => {
    switch(verificationStep) {
      case 1:
        return (
          <div>
            <div style={styles.contentHeader}>
              <h3 style={styles.contentTitle}>Business Information</h3>
              <p style={styles.contentDescription}>Tell us about your business or professional practice</p>
            </div>
            
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Business Name *</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  placeholder="Enter your business name"
                  style={styles.formInput}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Business Type *</label>
                <select 
                  value={formData.businessType}
                  onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                  style={styles.formSelect}
                >
                  <option value="">Select business type</option>
                  <option value="sole-proprietorship">Sole Proprietorship</option>
                  <option value="partnership">Partnership</option>
                  <option value="llc">Limited Liability Company</option>
                  <option value="individual">Individual Professional</option>
                </select>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>CAC Registration Number</label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                  placeholder="RC123456"
                  style={styles.formInput}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Tax Identification Number (TIN)</label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                  placeholder="12345678-0001"
                  style={styles.formInput}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Years in Operation *</label>
                <select 
                  value={formData.yearsInOperation}
                  onChange={(e) => setFormData({...formData, yearsInOperation: e.target.value})}
                  style={styles.formSelect}
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
            <div style={styles.contentHeader}>
              <h3 style={styles.contentTitle}>Contact Details</h3>
              <p style={styles.contentDescription}>How clients can reach you for business</p>
            </div>
            
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Contact Person *</label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                  placeholder="Full name"
                  style={styles.formInput}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Email Address *</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                  placeholder="contact@business.com"
                  style={styles.formInput}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Phone Number *</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                  placeholder="+234 801 234 5678"
                  style={styles.formInput}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Office Address *</label>
                <input
                  type="text"
                  value={formData.officeAddress}
                  onChange={(e) => setFormData({...formData, officeAddress: e.target.value})}
                  placeholder="123 Business Street, City"
                  style={styles.formInput}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>State *</label>
                <select 
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  style={styles.formSelect}
                >
                  <option value="">Select state</option>
                  <option value="lagos">Lagos</option>
                  <option value="abuja">Abuja</option>
                  <option value="rivers">Rivers</option>
                  <option value="oyo">Oyo</option>
                  <option value="kaduna">Kaduna</option>
                </select>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Local Government Area (LGA)</label>
                <input
                  type="text"
                  value={formData.lga}
                  onChange={(e) => setFormData({...formData, lga: e.target.value})}
                  placeholder="LGA name"
                  style={styles.formInput}
                />
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div>
            <div style={styles.contentHeader}>
              <h3 style={styles.contentTitle}>Service Details</h3>
              <p style={styles.contentDescription}>What services do you offer on RentEasy?</p>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Select Services You Offer *</label>
              <div style={styles.checkboxGroup}>
                {['Cleaning Services', 'Painting', 'Plumbing', 'Electrical Work', 'Carpentry', 
                  'Security Installation', 'Gardening', 'Moving Services', 'Pest Control', 
                  'AC Repair'].map(service => (
                  <label key={service} style={styles.checkboxLabel}>
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
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Website (Optional)</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                placeholder="https://yourwebsite.com"
                style={styles.formInput}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Social Media Profiles (Optional)</label>
              <input
                type="text"
                value={formData.socialMedia}
                onChange={(e) => setFormData({...formData, socialMedia: e.target.value})}
                placeholder="Instagram, Facebook, Twitter handles"
                style={styles.formInput}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Professional Certifications (Optional)</label>
              <textarea
                value={formData.certifications.join('\n')}
                onChange={(e) => setFormData({
                  ...formData,
                  certifications: e.target.value.split('\n').filter(c => c.trim())
                })}
                placeholder="List your certifications, one per line"
                style={styles.textarea}
              />
            </div>
          </div>
        );
      
      case 4:
        return (
          <div>
            <div style={styles.contentHeader}>
              <h3 style={styles.contentTitle}>Upload Documents</h3>
              <p style={styles.contentDescription}>Upload required documents for verification</p>
            </div>
            
            {documentTypes.map((doc) => (
              <div key={doc.id} style={{marginBottom: '2rem'}}>
                <h4 style={{fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem'}}>
                  {doc.label}
                </h4>
                <p style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem'}}>
                  {doc.description}
                </p>
                
                {documents[doc.id] ? (
                  <div style={styles.uploadedFile}>
                    <div style={styles.fileInfo}>
                      <FileText size={20} color="#6b7280" />
                      <div>
                        <div style={styles.fileName}>{documents[doc.id].name}</div>
                        <div style={styles.fileSize}>
                          {(documents[doc.id].size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFileUpload(doc.id, null)}
                      style={styles.removeButton}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    style={styles.documentUpload}
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
                    <div style={styles.uploadIcon}>
                      <Upload size={24} color="#6b7280" />
                    </div>
                    <div style={styles.uploadTitle}>Click to upload or drag and drop</div>
                    <div style={styles.uploadDescription}>
                      PDF, JPG, PNG, DOC up to 10MB
                    </div>
                    <button style={styles.uploadButton}>
                      <Upload size={16} />
                      Choose File
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      
      case 5:
        return (
          <div>
            <div style={styles.contentHeader}>
              <h3 style={styles.contentTitle}>Review & Submit</h3>
              <p style={styles.contentDescription}>Review your information before submitting for verification</p>
            </div>
            
            <div style={styles.reviewSection}>
              <h4 style={styles.reviewTitle}>Business Information</h4>
              {[
                ['Business Name', formData.businessName],
                ['Business Type', formData.businessType],
                ['CAC Number', formData.registrationNumber || 'Not provided'],
                ['Tax ID', formData.taxId || 'Not provided'],
                ['Years in Operation', formData.yearsInOperation]
              ].map(([label, value]) => (
                <div key={label} style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>{label}</span>
                  <span style={styles.reviewValue}>{value || '-'}</span>
                </div>
              ))}
            </div>
            
            <div style={styles.reviewSection}>
              <h4 style={styles.reviewTitle}>Contact Details</h4>
              {[
                ['Contact Person', formData.contactPerson],
                ['Email', formData.contactEmail],
                ['Phone', formData.contactPhone],
                ['Address', formData.officeAddress],
                ['State/LGA', `${formData.state}${formData.lga ? ` / ${formData.lga}` : ''}`]
              ].map(([label, value]) => (
                <div key={label} style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>{label}</span>
                  <span style={styles.reviewValue}>{value || '-'}</span>
                </div>
              ))}
            </div>
            
            <div style={styles.reviewSection}>
              <h4 style={styles.reviewTitle}>Services & Documents</h4>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Services Offered</span>
                <span style={styles.reviewValue}>{formData.servicesOffered.length} services</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Documents Uploaded</span>
                <span style={styles.reviewValue}>
                  {Object.values(documents).filter(d => d).length} of {documentTypes.length}
                </span>
              </div>
            </div>
            
            <div style={styles.benefitsGrid}>
              {benefits.map((benefit, index) => (
                <div key={index} style={styles.benefitCard}>
                  <div style={styles.benefitIcon}>
                    {benefit.icon}
                  </div>
                  <h5 style={styles.benefitTitle}>{benefit.title}</h5>
                  <p style={styles.benefitDescription}>{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 6:
        return (
          <div style={styles.completedState}>
            <div style={styles.completedIcon}>
              <CheckCircle size={48} color="#10b981" />
            </div>
            <h2 style={styles.completedTitle}>Verification Submitted!</h2>
            <p style={styles.completedText}>
              Your verification request has been submitted successfully. 
              Our team will review your application within 2-3 business days. 
              You'll receive a notification once your verification is complete.
            </p>
            <button style={styles.actionButton}>
              <ExternalLink size={16} />
              View Status
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Get Verified on RentEasy</h1>
        <p style={styles.subtitle}>
          Complete verification to build trust with clients and unlock premium features
        </p>
      </div>

      {/* Verification Status */}
      {verificationStatus === 'pending' && (
        <div style={styles.verificationStatus}>
          <Clock style={styles.statusIcon} size={24} />
          <div style={styles.statusText}>
            <h4 style={styles.statusTitle}>Verification Required</h4>
            <p style={styles.statusDescription}>
              Complete verification to access all features and build trust with clients
            </p>
          </div>
        </div>
      )}

      {/* Steps Progress */}
      {verificationStep <= 5 && (
        <div style={styles.stepsContainer}>
          <div style={styles.stepLine}></div>
          {steps.map((step) => (
            <div key={step.number} style={styles.step}>
              <div style={{
                ...styles.stepNumber,
                ...(verificationStep === step.number ? styles.stepActive : {}),
                ...(verificationStep > step.number ? styles.stepCompleted : {})
              }}>
                {verificationStep > step.number ? <CheckCircle size={20} /> : step.number}
              </div>
              <div style={{
                ...styles.stepTitle,
                ...(verificationStep === step.number ? styles.stepActiveTitle : {})
              }}>
                {step.title}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content Area */}
      <div style={styles.contentArea}>
        {renderStepContent()}

        {/* Navigation Buttons */}
        {verificationStep <= 5 && verificationStep !== 6 && (
          <div style={styles.navigationButtons}>
            {verificationStep > 1 && (
              <button
                onClick={() => setVerificationStep(verificationStep - 1)}
                style={styles.navButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#9ca3af';
                  e.currentTarget.style.background = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.background = 'white';
                }}
              >
                Previous
              </button>
            )}
            
            <div style={{marginLeft: 'auto'}}>
              <button
                onClick={() => {
                  if (verificationStep < 5) {
                    setVerificationStep(verificationStep + 1);
                  } else {
                    handleSubmit();
                  }
                }}
                style={{
                  ...styles.navButton,
                  ...(verificationStep === 5 ? styles.submitButton : styles.nextButton)
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                disabled={uploading}
              >
                {uploading ? 'Submitting...' : verificationStep === 5 ? 'Submit Verification' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderVerify;