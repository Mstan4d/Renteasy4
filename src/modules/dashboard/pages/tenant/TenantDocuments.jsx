// src/modules/dashboard/pages/tenant/TenantDocuments.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../shared/context/AuthContext';
import './TenantDocuments.css';

const TenantDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('identification');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    setLoading(true);
    
    // Mock documents data
    const mockDocuments = [
      {
        id: '1',
        name: 'National ID Card',
        category: 'identification',
        uploadedDate: '2024-12-01',
        size: '2.4 MB',
        type: 'pdf',
        status: 'verified',
        downloadUrl: '#'
      },
      {
        id: '2',
        name: 'Proof of Income - December 2024',
        category: 'income',
        uploadedDate: '2024-12-05',
        size: '1.8 MB',
        type: 'pdf',
        status: 'pending',
        downloadUrl: '#'
      },
      {
        id: '3',
        name: 'Tenant-Landlord Agreement',
        category: 'agreements',
        uploadedDate: '2024-11-15',
        size: '3.2 MB',
        type: 'pdf',
        status: 'verified',
        downloadUrl: '#'
      },
      {
        id: '4',
        name: 'Utility Bill - November 2024',
        category: 'utility_bills',
        uploadedDate: '2024-12-10',
        size: '1.5 MB',
        type: 'jpg',
        status: 'verified',
        downloadUrl: '#'
      },
      {
        id: '5',
        name: 'Reference Letter - Previous Landlord',
        category: 'references',
        uploadedDate: '2024-11-20',
        size: '2.1 MB',
        type: 'pdf',
        status: 'verified',
        downloadUrl: '#'
      }
    ];

    const savedDocs = JSON.parse(localStorage.getItem(`tenant_documents_${user?.id}`) || 'null');
    
    if (savedDocs) {
      setDocuments(savedDocs);
    } else {
      setDocuments(mockDocuments);
      localStorage.setItem(`tenant_documents_${user?.id}`, JSON.stringify(mockDocuments));
    }
    
    setLoading(false);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      identification: '🆔',
      income: '💰',
      agreements: '📝',
      utility_bills: '💡',
      references: '🤝',
      other: '📄'
    };
    return icons[category] || '📄';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      identification: 'Identification',
      income: 'Proof of Income',
      agreements: 'Agreements',
      utility_bills: 'Utility Bills',
      references: 'References',
      other: 'Other Documents'
    };
    return labels[category] || category;
  };

  const getStatusBadge = (status) => {
    const badges = {
      verified: { label: 'Verified', class: 'badge-success' },
      pending: { label: 'Pending Review', class: 'badge-warning' },
      rejected: { label: 'Rejected', class: 'badge-danger' },
      expired: { label: 'Expired', class: 'badge-secondary' }
    };
    return badges[status] || { label: status, class: 'badge-secondary' };
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const newDoc = {
      id: `doc_${Date.now()}`,
      name: file.name,
      category: uploadCategory,
      uploadedDate: new Date().toISOString().split('T')[0],
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: file.name.split('.').pop(),
      status: 'pending',
      downloadUrl: '#'
    };

    const updatedDocs = [newDoc, ...documents];
    setDocuments(updatedDocs);
    localStorage.setItem(`tenant_documents_${user?.id}`, JSON.stringify(updatedDocs));
    
    setShowUploadModal(false);
    alert('Document uploaded successfully! It will be reviewed soon.');
  };

  const deleteDocument = (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      const updated = documents.filter(doc => doc.id !== docId);
      setDocuments(updated);
      localStorage.setItem(`tenant_documents_${user?.id}`, JSON.stringify(updated));
    }
  };

  const downloadDocument = (docId) => {
    alert(`Downloading document ${docId}`);
  };

  const categories = [
    'identification',
    'income', 
    'agreements',
    'utility_bills',
    'references',
    'other'
  ];

  if (loading) {
    return (
      <div className="documents-loading">
        <div className="loading-spinner"></div>
        <p>Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="tenant-documents">
      <div className="documents-header">
        <div className="header-content">
          <h1>My Documents</h1>
          <p>Manage your identification, agreements, and important documents</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowUploadModal(true)}
        >
          + Upload Document
        </button>
      </div>

      {/* Document Stats */}
      <div className="document-stats">
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-info">
            <span className="stat-value">{documents.length}</span>
            <span className="stat-label">Total Documents</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-value">
              {documents.filter(d => d.status === 'verified').length}
            </span>
            <span className="stat-label">Verified</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-value">
              {documents.filter(d => d.status === 'pending').length}
            </span>
            <span className="stat-label">Pending Review</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <span className="stat-value">85%</span>
            <span className="stat-label">Profile Completeness</span>
          </div>
        </div>
      </div>

      {/* Document Categories */}
      <div className="document-categories">
        <h3>Document Categories</h3>
        <div className="categories-grid">
          {categories.map(category => {
            const categoryDocs = documents.filter(d => d.category === category);
            return (
              <div key={category} className="category-card">
                <div className="category-header">
                  <span className="category-icon">{getCategoryIcon(category)}</span>
                  <h4>{getCategoryLabel(category)}</h4>
                </div>
                <div className="category-info">
                  <span className="doc-count">{categoryDocs.length} documents</span>
                  <span className="verified-count">
                    {categoryDocs.filter(d => d.status === 'verified').length} verified
                  </span>
                </div>
                {categoryDocs.length > 0 ? (
                  <div className="category-docs">
                    {categoryDocs.slice(0, 3).map(doc => (
                      <div key={doc.id} className="doc-preview">
                        <span className="doc-name">{doc.name}</span>
                        <span className={`doc-status ${doc.status}`}>
                          {getStatusBadge(doc.status).label}
                        </span>
                      </div>
                    ))}
                    {categoryDocs.length > 3 && (
                      <div className="more-docs">
                        +{categoryDocs.length - 3} more
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="no-docs">No documents in this category</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* All Documents Table */}
      <div className="all-documents">
        <h3>All Documents</h3>
        
        <div className="documents-table-container">
          <table className="documents-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Category</th>
                <th>Uploaded Date</th>
                <th>Size</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.length > 0 ? (
                documents.map(doc => {
                  const statusBadge = getStatusBadge(doc.status);
                  return (
                    <tr key={doc.id}>
                      <td>
                        <div className="document-name">
                          <span className="doc-icon">
                            {doc.type === 'pdf' ? '📕' : 
                             doc.type === 'jpg' || doc.type === 'png' ? '🖼️' : '📄'}
                          </span>
                          <span>{doc.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="category-label">
                          {getCategoryIcon(doc.category)} {getCategoryLabel(doc.category)}
                        </span>
                      </td>
                      <td>{doc.uploadedDate}</td>
                      <td>{doc.size}</td>
                      <td>
                        <span className={`status-badge ${statusBadge.class}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td>
                        <div className="document-actions">
                          <button 
                            className="btn-action download"
                            onClick={() => downloadDocument(doc.id)}
                          >
                            Download
                          </button>
                          <button 
                            className="btn-action delete"
                            onClick={() => deleteDocument(doc.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="empty-table">
                    No documents found. Upload your first document to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Required Documents */}
      <div className="required-documents">
        <h3>Required Documents for Verification</h3>
        <div className="requirements-list">
          <div className="requirement-item completed">
            <span className="requirement-icon">✅</span>
            <div className="requirement-info">
              <h4>Government-Issued ID</h4>
              <p>National ID, Passport, or Driver's License</p>
            </div>
          </div>
          <div className="requirement-item pending">
            <span className="requirement-icon">⏳</span>
            <div className="requirement-info">
              <h4>Proof of Income</h4>
              <p>Recent payslips or bank statements (last 3 months)</p>
            </div>
          </div>
          <div className="requirement-item completed">
            <span className="requirement-icon">✅</span>
            <div className="requirement-info">
              <h4>Utility Bill</h4>
              <p>Recent utility bill showing your address</p>
            </div>
          </div>
          <div className="requirement-item optional">
            <span className="requirement-icon">📄</span>
            <div className="requirement-info">
              <h4>References (Optional)</h4>
              <p>Reference letters from previous landlords</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="upload-modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="upload-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload Document</h3>
              <button className="close-modal" onClick={() => setShowUploadModal(false)}>
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="upload-instructions">
                <p>Upload important documents for verification and records.</p>
                <ul>
                  <li>Accepted formats: PDF, JPG, PNG</li>
                  <li>Maximum file size: 10MB</li>
                  <li>Make sure documents are clear and legible</li>
                </ul>
              </div>
              
              <div className="form-group">
                <label>Select Category</label>
                <select 
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {getCategoryLabel(category)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="file-upload-area">
                <label className="file-upload-label">
                  <input
                    type="file"
                    onChange={handleUpload}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="file-input"
                  />
                  <div className="upload-placeholder">
                    <span className="upload-icon">📤</span>
                    <p>Click to browse or drag & drop files</p>
                    <small>PDF, JPG, PNG up to 10MB</small>
                  </div>
                </label>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn btn-outline"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantDocuments;