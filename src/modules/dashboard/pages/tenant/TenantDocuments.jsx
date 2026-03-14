// src/modules/dashboard/pages/tenant/TenantDocuments.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import './TenantDocuments.css';

const TenantDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('identification');
  const [uploading, setUploading] = useState(false);

  // Categories for document classification
  const categories = [
    'identification',
    'income',
    'agreements',
    'utility_bills',
    'references',
    'other'
  ];

  useEffect(() => {
    if (user) loadDocuments();
  }, [user]);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('estate_documents')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Failed to load documents. Please refresh.');
    } finally {
      setLoading(false);
    }
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

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only PDF, JPG, and PNG files are allowed');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `tenant-documents/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('estate-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: urlData } = supabase.storage
        .from('estate-documents')
        .getPublicUrl(filePath);

      // 3. Create database record
      const { data: newDoc, error: insertError } = await supabase
        .from('estate_documents')
        .insert({
          client_id: user.id,
          name: file.name,
          file_url: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
          category: uploadCategory,
          status: 'pending',
          storage_path: filePath,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 4. Update local state
      setDocuments(prev => [newDoc, ...prev]);
      setShowUploadModal(false);
      setUploadCategory('identification');
      alert('Document uploaded successfully! It will be reviewed soon.');
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      const docToDelete = documents.find(d => d.id === docId);
      if (!docToDelete) return;

      // 1. Delete from storage if we have the path
      if (docToDelete.storage_path) {
        const { error: storageError } = await supabase.storage
          .from('estate-documents')
          .remove([docToDelete.storage_path]);

        if (storageError) throw storageError;
      }

      // 2. Delete database record
      const { error: deleteError } = await supabase
        .from('estate_documents')
        .delete()
        .eq('id', docId)
        .eq('client_id', user.id); // Extra safety

      if (deleteError) throw deleteError;

      // 3. Update local state
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete document. Please try again.');
    }
  };

  const downloadDocument = (doc) => {
    // Open in new tab (if PDF) or trigger download
    window.open(doc.file_url, '_blank');
  };

  // Stats calculation
  const totalDocs = documents.length;
  const verifiedCount = documents.filter(d => d.status === 'verified').length;
  const pendingCount = documents.filter(d => d.status === 'pending').length;
  const completeness = Math.min(85, Math.round((verifiedCount / 3) * 100)); // example

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
      {/* Header */}
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

      {/* Error display */}
      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={loadDocuments}>Retry</button>
        </div>
      )}

      {/* Document Stats */}
      <div className="document-stats">
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-info">
            <span className="stat-value">{totalDocs}</span>
            <span className="stat-label">Total Documents</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-value">{verifiedCount}</span>
            <span className="stat-label">Verified</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-value">{pendingCount}</span>
            <span className="stat-label">Pending Review</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <span className="stat-value">{completeness}%</span>
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
                  const uploadedDate = new Date(doc.created_at).toLocaleDateString();
                  const size = doc.file_size 
                    ? (doc.file_size / 1024).toFixed(1) + ' KB'
                    : '—';

                  return (
                    <tr key={doc.id}>
                      <td data-label="Document Name">
                        <div className="document-name">
                          <span className="doc-icon">
                            {doc.file_type?.includes('pdf') ? '📕' : 
                             doc.file_type?.includes('image') ? '🖼️' : '📄'}
                          </span>
                          <span>{doc.name}</span>
                        </div>
                      </td>
                      <td data-label="Category">
                        <span className="category-label">
                          {getCategoryIcon(doc.category)} {getCategoryLabel(doc.category)}
                        </span>
                      </td>
                      <td data-label="Uploaded Date">{uploadedDate}</td>
                      <td data-label="Size">{size}</td>
                      <td data-label="Status">
                        <span className={`status-badge ${statusBadge.class}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td data-label="Actions">
                        <div className="document-actions">
                          <button 
                            className="btn-action download"
                            onClick={() => downloadDocument(doc)}
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

      {/* Required Documents (static guidance) */}
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
                    disabled={uploading}
                  />
                  <div className="upload-placeholder">
                    <span className="upload-icon">📤</span>
                    {uploading ? (
                      <p>Uploading...</p>
                    ) : (
                      <>
                        <p>Click to browse or drag & drop files</p>
                        <small>PDF, JPG, PNG up to 10MB</small>
                      </>
                    )}
                  </div>
                </label>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn btn-outline"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
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