// src/modules/providers/pages/ProviderVerificationStatus.jsx
import React, { useState, useEffect } from 'react';
import ProviderPageTemplate from '../templates/ProviderPageTemplate';
import {
  FaIdCard, FaCheckCircle, FaClock, FaTimesCircle, FaUpload,
  FaShieldAlt, FaUserCheck, FaFileAlt, FaCamera, FaLink,
  FaExclamationTriangle, FaHistory, FaDownload, FaEye, FaSpinner
} from 'react-icons/fa';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './ProviderVerificationStatus.css';

const ProviderVerificationStatus = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(null);
  const [activeTab, setActiveTab] = useState('status');

  // Static verification requirements (could be stored in DB)
  const verificationRequirements = [
    { id: 1, requirement: 'Government Issued ID', mandatory: true, documentType: 'government_id' },
    { id: 2, requirement: 'Proof of Address', mandatory: true, documentType: 'proof_of_address' },
    { id: 3, requirement: 'Business Registration', mandatory: false, documentType: 'business_registration' },
    { id: 4, requirement: 'Tax Clearance Certificate', mandatory: false, documentType: 'tax_certificate' },
    { id: 5, requirement: 'Portfolio Samples (min. 3)', mandatory: true, documentType: 'portfolio_samples' },
    { id: 6, requirement: 'Professional Certifications', mandatory: false, documentType: 'professional_cert' },
    { id: 7, requirement: 'Client References', mandatory: false, documentType: 'references' },
    { id: 8, requirement: 'Bank Account Verification', mandatory: true, documentType: 'bank_verification' }
  ];

  useEffect(() => {
    if (!user) return;
    fetchVerificationData();
  }, [user]);

  const fetchVerificationData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch provider profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch provider documents
      const { data: docsData, error: docsError } = await supabase
        .from('provider_documents')
        .select('*')
        .eq('provider_id', user.id)
        .order('uploaded_at', { ascending: false });
      if (docsError) throw docsError;

      // Transform documents to match component's expected format
      const transformedDocs = (docsData || []).map(doc => ({
        id: doc.id,
        type: doc.document_type || doc.name.split('.')[0].toLowerCase().replace(/\s/g, '_'),
        name: doc.name,
        status: doc.verification_status,
        uploadedDate: doc.uploaded_at ? new Date(doc.uploaded_at).toISOString().split('T')[0] : null,
        verifiedDate: doc.verified_at ? new Date(doc.verified_at).toISOString().split('T')[0] : null,
        fileUrl: doc.storage_path ? supabase.storage.from('provider-documents').getPublicUrl(doc.storage_path).data.publicUrl : null,
        previewUrl: doc.storage_path ? supabase.storage.from('provider-documents').getPublicUrl(doc.storage_path).data.publicUrl : null,
        notes: doc.notes,
        rejectionReason: doc.rejection_reason
      }));

      setDocuments(transformedDocs);
    } catch (err) {
      console.error('Error fetching verification data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (documentType) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setUploadingFile({ type: documentType, file });

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
        const filePath = `${user.id}/${fileName}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('provider-documents')
          .upload(filePath, file);
        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('provider-documents')
          .getPublicUrl(filePath);

        // Insert document record
        const { error: dbError } = await supabase
          .from('provider_documents')
          .insert({
            provider_id: user.id,
            name: file.name,
            file_name: fileName,
            file_size: file.size,
            mime_type: file.type,
            storage_path: filePath,
            verification_status: 'pending',
            document_type: documentType,
            uploaded_at: new Date().toISOString()
          });
        if (dbError) throw dbError;

        // Refresh data
        await fetchVerificationData();
        alert('Document uploaded successfully! It will be reviewed within 24-48 hours.');
      } catch (err) {
        console.error('Upload error:', err);
        alert('Upload failed: ' + err.message);
      } finally {
        setUploadingFile(null);
      }
    };
    fileInput.click();
  };

  const handleResubmit = async (documentId) => {
    const doc = documents.find(d => d.id === documentId);
    if (!doc) return;
    // Same as upload, but we can reuse the same logic
    handleFileUpload(doc.type);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'verified': return '#4caf50';
      case 'pending': return '#ff9800';
      case 'rejected': return '#f44336';
      case 'in_review': return '#2196f3';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'verified': return <FaCheckCircle />;
      case 'pending': return <FaClock />;
      case 'rejected': return <FaTimesCircle />;
      case 'in_review': return <FaClock />;
      default: return <FaExclamationTriangle />;
    }
  };

  const calculateOverallStatus = () => {
    if (!profile) return 'pending';
    return profile.kyc_status || 'pending';
  };

  const overallStatus = calculateOverallStatus();

  const getOverallStatusText = () => {
    switch(overallStatus) {
      case 'verified': return 'Verified Provider';
      case 'pending': return 'Verification Pending';
      case 'rejected': return 'Verification Rejected';
      case 'in_review': return 'Under Review';
      default: return 'Not Started';
    }
  };

  const calculateProgress = () => {
    const mandatoryDocs = verificationRequirements.filter(req => req.mandatory);
    const completed = mandatoryDocs.filter(req => {
      const doc = documents.find(d => d.type === req.documentType);
      return doc && doc.status === 'verified';
    }).length;
    return Math.round((completed / mandatoryDocs.length) * 100) || 0;
  };

  const verificationLevel = () => {
    // Simple level based on completed mandatory docs
    const mandatoryCount = verificationRequirements.filter(req => req.mandatory).length;
    const completedCount = documents.filter(d => d.status === 'verified').length;
    return Math.min(5, Math.floor((completedCount / mandatoryCount) * 5)) || 1;
  };

  const verificationBenefits = [
    'Verified badge on your profile',
    'Higher ranking in search results',
    'Increased client trust',
    'Access to premium features',
    'Priority customer support',
    'Verified provider badge in marketplace'
  ];

  if (loading) {
    return (
      <ProviderPageTemplate title="Verification Status" subtitle="Loading...">
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading your verification data...</p>
        </div>
      </ProviderPageTemplate>
    );
  }

  if (error) {
    return (
      <ProviderPageTemplate title="Verification Status" subtitle="Error">
        <div className="error-container">
          <FaExclamationTriangle size={48} />
          <h3>Failed to load verification data</h3>
          <p>{error}</p>
          <button onClick={fetchVerificationData}>Retry</button>
        </div>
      </ProviderPageTemplate>
    );
  }

  return (
    <ProviderPageTemplate
      title="Verification Status"
      subtitle="Complete your KYC to become a verified provider"
      actions={
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary">
            <FaHistory style={{ marginRight: '0.5rem' }} />
            View History
          </button>
          <button className="btn-primary" onClick={() => handleFileUpload('any')}>
            <FaUpload style={{ marginRight: '0.5rem' }} />
            Upload Documents
          </button>
        </div>
      }
    >
      {/* Verification Overview */}
      <div className="provider-card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">Verification Overview</h3>
          <div className={`status-badge ${overallStatus}`}>
            {getStatusIcon(overallStatus)}
            <span>{getOverallStatusText()}</span>
          </div>
        </div>

        <div className="verification-overview">
          <div className="overview-stats">
            <div className="stat-item">
              <FaUserCheck style={{ color: '#1a237e', fontSize: '2rem' }} />
              <div>
                <div className="stat-value">{verificationLevel()}/5</div>
                <div className="stat-label">Verification Level</div>
              </div>
            </div>
            
            <div className="stat-item">
              <FaFileAlt style={{ color: '#1a237e', fontSize: '2rem' }} />
              <div>
                <div className="stat-value">
                  {documents.filter(d => d.status === 'verified').length}/{documents.length}
                </div>
                <div className="stat-label">Documents Verified</div>
              </div>
            </div>
            
            <div className="stat-item">
              <FaClock style={{ color: '#1a237e', fontSize: '2rem' }} />
              <div>
                <div className="stat-value">{calculateProgress()}%</div>
                <div className="stat-label">Progress Complete</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-section">
            <div className="progress-header">
              <h4>Verification Progress</h4>
              <span>{calculateProgress()}% Complete</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
            <div className="progress-steps">
              {['Submitted', 'Documents', 'Review', 'Approval', 'Verified'].map((step, index) => {
                const stepProgress = Math.min(Math.max(calculateProgress() - (index * 20), 0), 20);
                return (
                  <div key={step} className="progress-step">
                    <div className={`step-indicator ${stepProgress > 0 ? 'active' : ''}`}>
                      {stepProgress === 20 ? <FaCheckCircle /> : index + 1}
                    </div>
                    <div className="step-label">{step}</div>
                    <div className="step-progress">
                      <div 
                        className="step-progress-fill"
                        style={{ width: `${(stepProgress / 20) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verification Benefits */}
          <div className="benefits-section">
            <h4 style={{ marginBottom: '1rem' }}>Benefits of Verification</h4>
            <div className="benefits-grid">
              {verificationBenefits.map((benefit, index) => (
                <div key={index} className="benefit-item">
                  <FaCheckCircle style={{ color: '#4caf50' }} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-navigation" style={{ marginBottom: '1.5rem' }}>
        <button 
          className={`tab-btn ${activeTab === 'status' ? 'active' : ''}`}
          onClick={() => setActiveTab('status')}
        >
          <FaShieldAlt /> Status & Requirements
        </button>
        <button 
          className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <FaIdCard /> Documents
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <FaHistory /> Activity History
        </button>
      </div>

      {/* Status & Requirements Tab */}
      {activeTab === 'status' && (
        <div className="provider-card">
          <div className="card-header">
            <h3 className="card-title">Verification Requirements</h3>
            <p className="card-subtitle">Complete all requirements to get verified</p>
          </div>

          <div className="requirements-list">
            {verificationRequirements.map((requirement) => {
              const doc = documents.find(d => d.type === requirement.documentType);
              const status = doc ? doc.status : 'not_started';
              return (
                <div key={requirement.id} className="requirement-item">
                  <div className="requirement-info">
                    <div className="requirement-checkbox">
                      <input
                        type="checkbox"
                        checked={status === 'verified'}
                        readOnly
                      />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 0.3rem 0' }}>
                        {requirement.requirement}
                        {requirement.mandatory && (
                          <span className="mandatory-badge">Required</span>
                        )}
                      </h4>
                      <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                        {status === 'verified' ? 'Verified and approved' :
                         status === 'pending' ? 'Under review' :
                         status === 'rejected' ? 'Needs resubmission' :
                         'Not yet submitted'}
                      </p>
                    </div>
                  </div>

                  <div className="requirement-status">
                    <span className={`status-indicator ${status}`}>
                      {status.replace('_', ' ')}
                    </span>
                    
                    {status === 'rejected' && (
                      <button 
                        className="btn-secondary" 
                        style={{ fontSize: '0.9rem' }}
                        onClick={() => handleResubmit(doc.id)}
                        disabled={uploadingFile?.type === requirement.documentType}
                      >
                        {uploadingFile?.type === requirement.documentType ? 'Uploading...' : 'Resubmit'}
                      </button>
                    )}
                    
                    {status === 'not_started' && (
                      <button 
                        className="btn-primary" 
                        style={{ fontSize: '0.9rem' }}
                        onClick={() => handleFileUpload(requirement.documentType)}
                        disabled={uploadingFile?.type === requirement.documentType}
                      >
                        {uploadingFile?.type === requirement.documentType ? 'Uploading...' : 'Start'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Next Steps */}
          <div className="next-steps" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e0e0e0' }}>
            <h4 style={{ marginBottom: '1rem' }}>Next Steps</h4>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-icon">
                  <FaUpload />
                </div>
                <h5>Upload Missing Documents</h5>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  Complete your document submission
                </p>
                <button className="btn-primary" style={{ width: '100%' }} onClick={() => handleFileUpload('any')}>
                  Upload Now
                </button>
              </div>
              
              <div className="step-card">
                <div className="step-icon">
                  <FaClock />
                </div>
                <h5>Wait for Review</h5>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  Typically takes 24-48 hours
                </p>
                <div className="step-meta">
                  <FaClock /> Next review: {profile?.next_review_date || 'Pending'}
                </div>
              </div>
              
              <div className="step-card">
                <div className="step-icon">
                  <FaUserCheck />
                </div>
                <h5>Get Verified Badge</h5>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  Start enjoying verified benefits
                </p>
                <div className="step-meta">
                  <FaShieldAlt /> Level {verificationLevel()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="provider-card">
          <div className="card-header">
            <h3 className="card-title">Document Management</h3>
            <p className="card-subtitle">Upload and manage your verification documents</p>
          </div>

          <div className="documents-grid">
            {documents.map((document) => (
              <div key={document.id} className="document-card">
                <div className="document-header">
                  <div className="document-icon">
                    <FaIdCard />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.3rem 0' }}>{document.name}</h4>
                    <div className="document-meta">
                      <span className={`status-badge ${document.status}`}>
                        {getStatusIcon(document.status)}
                        {document.status.replace('_', ' ')}
                      </span>
                      {document.uploadedDate && (
                        <span className="upload-date">
                          Uploaded: {document.uploadedDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="document-info">
                  {document.notes && (
                    <p style={{ margin: '0 0 1rem 0', color: '#666', fontSize: '0.9rem' }}>
                      {document.notes}
                    </p>
                  )}

                  {document.rejectionReason && document.status === 'rejected' && (
                    <div className="rejection-notice">
                      <FaExclamationTriangle />
                      <div>
                        <strong>Rejection Reason:</strong>
                        <p style={{ margin: '0.3rem 0 0', color: '#f44336' }}>
                          {document.rejectionReason}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="document-actions">
                  {document.status === 'not_started' ? (
                    <button 
                      className="btn-primary"
                      onClick={() => handleFileUpload(document.type)}
                      disabled={uploadingFile?.type === document.type}
                    >
                      {uploadingFile?.type === document.type ? (
                        <>
                          <FaSpinner className="spinner" style={{ marginRight: '0.5rem' }} />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FaUpload style={{ marginRight: '0.5rem' }} />
                          Upload Document
                        </>
                      )}
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {document.fileUrl && (
                        <>
                          <a href={document.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                            <FaEye style={{ marginRight: '0.3rem' }} />
                            Preview
                          </a>
                          <a href={document.fileUrl} download className="btn-secondary">
                            <FaDownload style={{ marginRight: '0.3rem' }} />
                            Download
                          </a>
                        </>
                      )}
                      
                      {document.status === 'rejected' && (
                        <button 
                          className="btn-primary"
                          onClick={() => handleResubmit(document.id)}
                          disabled={uploadingFile?.type === document.type}
                        >
                          {uploadingFile?.type === document.type ? 'Resubmitting...' : 'Resubmit'}
                        </button>
                      )}
                      
                      {document.status === 'pending' && (
                        <button className="btn-secondary" disabled>
                          <FaClock style={{ marginRight: '0.3rem' }} />
                          Under Review
                        </button>
                      )}
                      
                      {document.status === 'verified' && (
                        <button className="btn-secondary" disabled>
                          <FaCheckCircle style={{ marginRight: '0.3rem', color: '#4caf50' }} />
                          Verified
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Upload Guidelines */}
          <div className="guidelines-section" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e0e0e0' }}>
            <h4 style={{ marginBottom: '1rem' }}>Document Guidelines</h4>
            <div className="guidelines-grid">
              <div className="guideline">
                <FaCamera />
                <div>
                  <h5 style={{ margin: '0 0 0.5rem 0' }}>Clear Photos</h5>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                    Ensure all text is readable and photo is well-lit
                  </p>
                </div>
              </div>
              
              <div className="guideline">
                <FaFileAlt />
                <div>
                  <h5 style={{ margin: '0 0 0.5rem 0' }}>Valid Documents</h5>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                    Documents must be current and not expired
                  </p>
                </div>
              </div>
              
              <div className="guideline">
                <FaLink />
                <div>
                  <h5 style={{ margin: '0 0 0.5rem 0' }}>Complete Information</h5>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                    All required fields must be filled and visible
                  </p>
                </div>
              </div>
              
              <div className="guideline">
                <FaShieldAlt />
                <div>
                  <h5 style={{ margin: '0 0 0.5rem 0' }}>Security</h5>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                    Your documents are securely stored and encrypted
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity History Tab */}
      {activeTab === 'history' && (
        <div className="provider-card">
          <div className="card-header">
            <h3 className="card-title">Verification Activity</h3>
            <p className="card-subtitle">History of your verification process</p>
          </div>

          <div className="activity-timeline">
            <div className="timeline-item completed">
              <div className="timeline-marker">
                <FaCheckCircle />
              </div>
              <div className="timeline-content">
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Profile Setup Completed</h4>
                <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                  Your provider profile was created with basic information
                </p>
                <div className="timeline-meta">
                  <FaClock /> {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'} • Completed
                </div>
              </div>
            </div>
            
            {/* Map actual document uploads */}
            {documents.filter(d => d.status !== 'not_started').map(doc => (
              <div key={doc.id} className={`timeline-item ${doc.status === 'verified' ? 'completed' : doc.status === 'pending' ? 'in-progress' : 'pending'}`}>
                <div className="timeline-marker">
                  {doc.status === 'verified' ? <FaCheckCircle /> : doc.status === 'pending' ? <FaClock /> : <FaExclamationTriangle />}
                </div>
                <div className="timeline-content">
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>{doc.name} Uploaded</h4>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                    {doc.notes || 'Document submitted for verification'}
                  </p>
                  <div className="timeline-meta">
                    <FaClock /> {doc.uploadedDate} • {doc.status}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="timeline-item future">
              <div className="timeline-marker">
                <FaUserCheck />
              </div>
              <div className="timeline-content">
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Verification Completion</h4>
                <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                  Estimated completion date for full verification
                </p>
                <div className="timeline-meta">
                  <FaClock /> {profile?.next_review_date || 'Pending'} • Pending
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Support Section */}
      <div className="provider-card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">Need Help?</h3>
        </div>
        
        <div className="support-grid">
          <div className="support-item">
            <FaExclamationTriangle style={{ color: '#ff9800', fontSize: '2rem' }} />
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Document Issues</h4>
              <p style={{ margin: 0, color: '#666' }}>
                Having trouble uploading documents or getting rejected?
              </p>
              <button className="btn-secondary" style={{ marginTop: '1rem' }}>
                Get Help
              </button>
            </div>
          </div>
          
          <div className="support-item">
            <FaClock style={{ color: '#2196f3', fontSize: '2rem' }} />
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Review Time</h4>
              <p style={{ margin: 0, color: '#666' }}>
                Want to know how long verification takes?
              </p>
              <button className="btn-secondary" style={{ marginTop: '1rem' }}>
                Check Status
              </button>
            </div>
          </div>
          
          <div className="support-item">
            <FaShieldAlt style={{ color: '#4caf50', fontSize: '2rem' }} />
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Verification Benefits</h4>
              <p style={{ margin: 0, color: '#666' }}>
                Learn more about verified provider benefits
              </p>
              <button className="btn-secondary" style={{ marginTop: '1rem' }}>
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProviderPageTemplate>
  );
};

export default ProviderVerificationStatus;