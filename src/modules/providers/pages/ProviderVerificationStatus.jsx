import React, { useState } from 'react';
import ProviderPageTemplate from '../templates/ProviderPageTemplate';
import {
  FaIdCard, FaCheckCircle, FaClock, FaTimesCircle, FaUpload,
  FaShieldAlt, FaUserCheck, FaFileAlt, FaCamera, FaLink,
  FaExclamationTriangle, FaHistory, FaDownload, FaEye
} from 'react-icons/fa';

const ProviderVerificationStatus = () => {
  const [verificationStatus, setVerificationStatus] = useState({
    overall: 'pending', // pending, in_review, verified, rejected
    submittedDate: '2024-01-10',
    reviewDate: null,
    verifiedDate: null,
    rejectionReason: null,
    verificationLevel: 2, // 1-5
    nextReviewDate: '2024-04-10'
  });

  const [documents, setDocuments] = useState([
    {
      id: 1,
      type: 'government_id',
      name: 'National ID Card',
      status: 'verified',
      uploadedDate: '2024-01-10',
      verifiedDate: '2024-01-12',
      fileUrl: '#',
      previewUrl: '#',
      notes: 'Front and back uploaded'
    },
    {
      id: 2,
      type: 'proof_of_address',
      name: 'Utility Bill',
      status: 'pending',
      uploadedDate: '2024-01-10',
      verifiedDate: null,
      fileUrl: '#',
      previewUrl: '#',
      notes: 'Electricity bill - January 2024'
    },
    {
      id: 3,
      type: 'business_registration',
      name: 'Business Registration',
      status: 'rejected',
      uploadedDate: '2024-01-05',
      verifiedDate: '2024-01-08',
      fileUrl: '#',
      previewUrl: '#',
      notes: 'Certificate expired, please upload updated certificate',
      rejectionReason: 'Document expired'
    },
    {
      id: 4,
      type: 'tax_certificate',
      name: 'Tax Clearance Certificate',
      status: 'not_uploaded',
      uploadedDate: null,
      verifiedDate: null,
      fileUrl: null,
      previewUrl: null,
      notes: 'Required for full verification'
    },
    {
      id: 5,
      type: 'portfolio_samples',
      name: 'Portfolio Samples',
      status: 'verified',
      uploadedDate: '2024-01-08',
      verifiedDate: '2024-01-11',
      fileUrl: '#',
      previewUrl: '#',
      notes: '5 project photos uploaded'
    }
  ]);

  const [verificationRequirements] = useState([
    { id: 1, requirement: 'Government Issued ID', mandatory: true, status: 'completed' },
    { id: 2, requirement: 'Proof of Address', mandatory: true, status: 'pending' },
    { id: 3, requirement: 'Business Registration', mandatory: false, status: 'rejected' },
    { id: 4, requirement: 'Tax Clearance Certificate', mandatory: false, status: 'not_started' },
    { id: 5, requirement: 'Portfolio Samples (min. 3)', mandatory: true, status: 'completed' },
    { id: 6, requirement: 'Professional Certifications', mandatory: false, status: 'not_started' },
    { id: 7, requirement: 'Client References', mandatory: false, status: 'not_started' },
    { id: 8, requirement: 'Bank Account Verification', mandatory: true, status: 'in_progress' }
  ]);

  const [activeTab, setActiveTab] = useState('status');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const getStatusColor = (status) => {
    switch(status) {
      case 'verified': return '#4caf50';
      case 'pending': return '#ff9800';
      case 'rejected': return '#f44336';
      case 'in_review': return '#2196f3';
      case 'not_uploaded': return '#757575';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'verified': return <FaCheckCircle />;
      case 'pending': return <FaClock />;
      case 'rejected': return <FaTimesCircle />;
      case 'in_review': return <FaClock />;
      case 'not_uploaded': return <FaExclamationTriangle />;
      default: return <FaExclamationTriangle />;
    }
  };

  const getOverallStatusText = () => {
    switch(verificationStatus.overall) {
      case 'verified': return 'Verified Provider';
      case 'pending': return 'Verification Pending';
      case 'rejected': return 'Verification Rejected';
      case 'in_review': return 'Under Review';
      default: return 'Not Started';
    }
  };

  const calculateProgress = () => {
    const completed = verificationRequirements.filter(req => 
      req.status === 'completed'
    ).length;
    return Math.round((completed / verificationRequirements.length) * 100);
  };

  const handleFileUpload = (documentType) => {
    setUploadingFile({ type: documentType });
    // Simulate upload
    setTimeout(() => {
      const newDoc = {
        id: documents.length + 1,
        type: documentType,
        name: documents.find(d => d.type === documentType)?.name || 'New Document',
        status: 'pending',
        uploadedDate: new Date().toISOString().split('T')[0],
        verifiedDate: null,
        fileUrl: '#',
        previewUrl: '#',
        notes: 'Uploaded for verification'
      };

      setDocuments([...documents.filter(d => d.type !== documentType), newDoc]);
      setUploadingFile(null);
      alert('Document uploaded successfully! It will be reviewed within 24-48 hours.');
    }, 1500);
  };

  const handleResubmit = (documentId) => {
    const doc = documents.find(d => d.id === documentId);
    if (doc) {
      setUploadingFile({ type: doc.type });
      setTimeout(() => {
        setDocuments(docs => docs.map(d => 
          d.id === documentId 
            ? { ...d, status: 'pending', uploadedDate: new Date().toISOString().split('T')[0] }
            : d
        ));
        setUploadingFile(null);
        alert('Document resubmitted for review');
      }, 1500);
    }
  };

  const verificationBenefits = [
    'Verified badge on your profile',
    'Higher ranking in search results',
    'Increased client trust',
    'Access to premium features',
    'Priority customer support',
    'Verified provider badge in marketplace'
  ];

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
          <button className="btn-primary">
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
          <div className={`status-badge ${verificationStatus.overall}`}>
            {getStatusIcon(verificationStatus.overall)}
            <span>{getOverallStatusText()}</span>
          </div>
        </div>

        <div className="verification-overview">
          <div className="overview-stats">
            <div className="stat-item">
              <FaUserCheck style={{ color: '#1a237e', fontSize: '2rem' }} />
              <div>
                <div className="stat-value">{verificationStatus.verificationLevel}/5</div>
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
            {verificationRequirements.map((requirement) => (
              <div key={requirement.id} className="requirement-item">
                <div className="requirement-info">
                  <div className="requirement-checkbox">
                    <input
                      type="checkbox"
                      checked={requirement.status === 'completed'}
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
                      {requirement.status === 'completed' ? 'Verified and approved' :
                       requirement.status === 'pending' ? 'Under review' :
                       requirement.status === 'rejected' ? 'Needs resubmission' :
                       requirement.status === 'in_progress' ? 'Processing...' :
                       'Not yet submitted'}
                    </p>
                  </div>
                </div>

                <div className="requirement-status">
                  <span className={`status-indicator ${requirement.status}`}>
                    {requirement.status.replace('_', ' ')}
                  </span>
                  
                  {requirement.status === 'rejected' && (
                    <button className="btn-secondary" style={{ fontSize: '0.9rem' }}>
                      Resubmit
                    </button>
                  )}
                  
                  {requirement.status === 'not_started' && (
                    <button className="btn-primary" style={{ fontSize: '0.9rem' }}>
                      Start
                    </button>
                  )}
                </div>
              </div>
            ))}
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
                <button className="btn-primary" style={{ width: '100%' }}>
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
                  <FaClock /> Next review: {verificationStatus.nextReviewDate}
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
                  <FaShieldAlt /> Level {verificationStatus.verificationLevel}
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
                  {document.status === 'not_uploaded' ? (
                    <button 
                      className="btn-primary"
                      onClick={() => handleFileUpload(document.type)}
                      disabled={uploadingFile?.type === document.type}
                    >
                      {uploadingFile?.type === document.type ? (
                        <>
                          <FaClock style={{ marginRight: '0.5rem' }} />
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
                          <button className="btn-secondary">
                            <FaEye style={{ marginRight: '0.3rem' }} />
                            Preview
                          </button>
                          <button className="btn-secondary">
                            <FaDownload style={{ marginRight: '0.3rem' }} />
                            Download
                          </button>
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
                  <FaClock /> {verificationStatus.submittedDate} • Completed
                </div>
              </div>
            </div>
            
            <div className="timeline-item completed">
              <div className="timeline-marker">
                <FaUpload />
              </div>
              <div className="timeline-content">
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Initial Documents Submitted</h4>
                <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                  Government ID and portfolio samples uploaded
                </p>
                <div className="timeline-meta">
                  <FaClock /> 2024-01-10 • Completed
                </div>
              </div>
            </div>
            
            <div className="timeline-item in-progress">
              <div className="timeline-marker">
                <FaClock />
              </div>
              <div className="timeline-content">
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Document Review Started</h4>
                <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                  Your documents are being reviewed by the verification team
                </p>
                <div className="timeline-meta">
                  <FaClock /> 2024-01-11 • In Progress
                </div>
              </div>
            </div>
            
            <div className="timeline-item pending">
              <div className="timeline-marker">
                <FaExclamationTriangle />
              </div>
              <div className="timeline-content">
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Additional Documents Requested</h4>
                <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                  Business registration certificate needs to be updated
                </p>
                <div className="timeline-meta">
                  <FaClock /> 2024-01-12 • Action Required
                </div>
              </div>
            </div>
            
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
                  <FaClock /> {verificationStatus.nextReviewDate} • Pending
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

      <style jsx>{`
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
        }
        
        .status-badge.verified {
          background: #e8f5e9;
          color: #2e7d32;
        }
        
        .status-badge.pending {
          background: #fff3e0;
          color: #ef6c00;
        }
        
        .status-badge.rejected {
          background: #ffebee;
          color: #c62828;
        }
        
        .status-badge.in_review {
          background: #e3f2fd;
          color: #1565c0;
        }
        
        .verification-overview {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .overview-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }
        
        .stat-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
        }
        
        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1a237e;
          line-height: 1;
        }
        
        .stat-label {
          color: #666;
          margin-top: 0.5rem;
        }
        
        .progress-section {
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
        }
        
        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .progress-bar {
          height: 10px;
          background: #e0e0e0;
          border-radius: 5px;
          overflow: hidden;
          margin-bottom: 2rem;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
          transition: width 0.3s ease;
        }
        
        .progress-steps {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
        }
        
        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        
        .step-indicator {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e0e0e0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: #666;
          transition: all 0.3s ease;
        }
        
        .step-indicator.active {
          background: #4caf50;
          color: white;
        }
        
        .step-label {
          font-size: 0.9rem;
          color: #666;
          text-align: center;
        }
        
        .step-progress {
          width: 100%;
          height: 4px;
          background: #e0e0e0;
          border-radius: 2px;
          overflow: hidden;
        }
        
        .step-progress-fill {
          height: 100%;
          background: #4caf50;
          transition: width 0.3s ease;
        }
        
        .benefits-section {
          padding: 1.5rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 12px;
        }
        
        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }
        
        .benefit-item {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.8rem;
          background: white;
          border-radius: 8px;
          border-left: 4px solid #4caf50;
        }
        
        .tabs-navigation {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .tab-btn {
          padding: 1rem 1.5rem;
          border: 1px solid #e0e0e0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }
        
        .tab-btn.active {
          background: #1a237e;
          color: white;
          border-color: #1a237e;
        }
        
        .tab-btn:hover:not(.active) {
          background: #f8f9fa;
          border-color: #1a237e;
        }
        
        .requirements-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .requirement-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        
        .requirement-item:hover {
          border-color: #1a237e;
          box-shadow: 0 4px 12px rgba(26, 35, 126, 0.1);
        }
        
        .requirement-info {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          flex: 1;
        }
        
        .requirement-checkbox input {
          width: 20px;
          height: 20px;
          margin-top: 0.3rem;
        }
        
        .mandatory-badge {
          background: #ffebee;
          color: #c62828;
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-left: 0.5rem;
        }
        
        .requirement-status {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .status-indicator {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        
        .status-indicator.completed {
          background: #e8f5e9;
          color: #2e7d32;
        }
        
        .status-indicator.pending {
          background: #fff3e0;
          color: #ef6c00;
        }
        
        .status-indicator.rejected {
          background: #ffebee;
          color: #c62828;
        }
        
        .status-indicator.in_progress {
          background: #e3f2fd;
          color: #1565c0;
        }
        
        .status-indicator.not_started {
          background: #f5f5f5;
          color: #757575;
        }
        
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        
        .step-card {
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        
        .step-icon {
          width: 60px;
          height: 60px;
          background: #1a237e;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }
        
        .step-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666;
          font-size: 0.9rem;
        }
        
        .documents-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        
        .document-card {
          padding: 1.5rem;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: all 0.3s ease;
        }
        
        .document-card:hover {
          border-color: #1a237e;
          box-shadow: 0 4px 12px rgba(26, 35, 126, 0.1);
        }
        
        .document-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        
        .document-icon {
          width: 50px;
          height: 50px;
          background: #e8f0fe;
          color: #1a237e;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }
        
        .document-meta {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .upload-date {
          font-size: 0.8rem;
          color: #666;
        }
        
        .rejection-notice {
          display: flex;
          align-items: flex-start;
          gap: 0.8rem;
          padding: 1rem;
          background: #ffebee;
          border-radius: 8px;
          border-left: 4px solid #f44336;
        }
        
        .rejection-notice svg {
          color: #f44336;
          font-size: 1.2rem;
          margin-top: 0.2rem;
        }
        
        .guidelines-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        
        .guideline {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }
        
        .guideline svg {
          color: #1a237e;
          font-size: 1.5rem;
          margin-top: 0.2rem;
        }
        
        .activity-timeline {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          position: relative;
          padding-left: 2rem;
        }
        
        .activity-timeline::before {
          content: '';
          position: absolute;
          left: 1rem;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #e0e0e0;
        }
        
        .timeline-item {
          display: flex;
          gap: 1rem;
          position: relative;
        }
        
        .timeline-marker {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 2px solid #e0e0e0;
          position: absolute;
          left: -2rem;
          z-index: 1;
        }
        
        .timeline-item.completed .timeline-marker {
          border-color: #4caf50;
          color: #4caf50;
        }
        
        .timeline-item.in-progress .timeline-marker {
          border-color: #2196f3;
          color: #2196f3;
          animation: pulse 2s infinite;
        }
        
        .timeline-item.pending .timeline-marker {
          border-color: #ff9800;
          color: #ff9800;
        }
        
        .timeline-item.future .timeline-marker {
          border-color: #757575;
          color: #757575;
        }
        
        .timeline-content {
          flex: 1;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #e0e0e0;
        }
        
        .timeline-item.completed .timeline-content {
          border-left-color: #4caf50;
        }
        
        .timeline-item.in-progress .timeline-content {
          border-left-color: #2196f3;
        }
        
        .timeline-item.pending .timeline-content {
          border-left-color: #ff9800;
        }
        
        .timeline-item.future .timeline-content {
          border-left-color: #757575;
        }
        
        .timeline-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666;
          font-size: 0.9rem;
        }
        
        .support-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .support-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        @media (max-width: 768px) {
          .overview-stats {
            grid-template-columns: 1fr;
          }
          
          .progress-steps {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          
          .progress-step {
            align-items: flex-start;
            flex-direction: row;
            gap: 1rem;
          }
          
          .step-progress {
            display: none;
          }
          
          .benefits-grid {
            grid-template-columns: 1fr;
          }
          
          .documents-grid {
            grid-template-columns: 1fr;
          }
          
          .steps-grid {
            grid-template-columns: 1fr;
          }
          
          .guidelines-grid {
            grid-template-columns: 1fr;
          }
          
          .support-grid {
            grid-template-columns: 1fr;
          }
          
          .tabs-navigation {
            flex-direction: column;
          }
          
          .tab-btn {
            justify-content: center;
          }
          
          .requirement-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .requirement-status {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </ProviderPageTemplate>
  );
};

export default ProviderVerificationStatus;