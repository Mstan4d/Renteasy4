// src/modules/dashboard/pages/tenant/TenantDocuments.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import { FileText, Download, Eye, Calendar, Folder, Image, File, Archive, Building, Home, User, Upload, X } from 'lucide-react';
import RentEasyLoader from '../../../../shared/components/RentEasyLoader';
import './TenantDocuments.css';

const TenantDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('identification');
  const [uploading, setUploading] = useState(false);
  const [subscription, setSubscription] = useState(null);

  const categories = [
    'identification', 'income', 'agreements', 'utility_bills', 'references', 'other'
  ];

  useEffect(() => {
    if (user) {
      loadDocuments();
      subscribeToNewDocuments();
    }
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [user]);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch documents from tenant_documents table (shared by estate firm/landlord)
      const { data: sharedDocs, error: sharedError } = await supabase
        .from('tenant_documents')
        .select(`
          *,
          estate_firm:estate_firm_id (
            id,
            firm_name,
            logo_url
          ),
          landlord:landlord_id (
            id,
            name,
            email
          )
        `)
        .eq('tenant_id', user.id)
        .order('created_at', { ascending: false });

      if (sharedError) throw sharedError;

      // Fetch documents from estate_documents (uploaded by tenant)
      const { data: ownDocs, error: ownError } = await supabase
        .from('estate_documents')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (ownError) throw ownError;

      // Combine and mark source
      const allDocs = [
        ...(sharedDocs || []).map(doc => ({ ...doc, source: 'shared' })),
        ...(ownDocs || []).map(doc => ({ ...doc, source: 'own' }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setDocuments(allDocs);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Failed to load documents. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNewDocuments = () => {
    if (!user?.id) return;

    const channel = supabase
      .channel('tenant-documents')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'tenant_documents',
        filter: `tenant_id=eq.${user.id}`
      }, (payload) => {
        setDocuments(prev => [payload.new, ...prev]);
      })
      .subscribe();

    setSubscription(channel);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      identification: '🆔',
      income: '💰',
      agreements: '📝',
      utility_bills: '💡',
      references: '🤝',
      lease: '📝',
      receipt: '💰',
      invoice: '📄',
      notice: '🔔',
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
      lease: 'Lease Agreement',
      receipt: 'Payment Receipt',
      invoice: 'Invoice',
      notice: 'Notice',
      other: 'Other Documents'
    };
    return labels[category] || category;
  };

  const getSenderInfo = (doc) => {
    if (doc.source === 'shared') {
      if (doc.estate_firm) {
        return {
          name: doc.estate_firm.firm_name,
          icon: <Building size={14} />,
          type: 'Estate Firm'
        };
      }
      if (doc.landlord) {
        return {
          name: doc.landlord.name,
          icon: <Home size={14} />,
          type: 'Landlord'
        };
      }
    }
    return {
      name: 'You',
      icon: <User size={14} />,
      type: 'Uploaded by you'
    };
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return <FileText size={24} />;
    if (fileType?.includes('image')) return <Image size={24} />;
    if (fileType?.includes('zip')) return <Archive size={24} />;
    return <File size={24} />;
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

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only PDF, JPG, and PNG files are allowed');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `tenant-documents/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('estate-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('estate-documents')
        .getPublicUrl(filePath);

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

      setDocuments(prev => [{ ...newDoc, source: 'own' }, ...prev]);
      setShowUploadModal(false);
      setUploadCategory('identification');
      alert('Document uploaded successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      const docToDelete = documents.find(d => d.id === docId);
      if (!docToDelete) return;

      // Don't allow deleting shared documents
      if (docToDelete.source === 'shared') {
        alert('You cannot delete documents shared by your property manager');
        return;
      }

      if (docToDelete.storage_path) {
        await supabase.storage
          .from('estate-documents')
          .remove([docToDelete.storage_path]);
      }

      await supabase
        .from('estate_documents')
        .delete()
        .eq('id', docId)
        .eq('client_id', user.id);

      setDocuments(prev => prev.filter(doc => doc.id !== docId));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete document');
    }
  };

  const downloadDocument = (doc) => {
    window.open(doc.file_url, '_blank');
  };

  const totalDocs = documents.length;
  const ownDocs = documents.filter(d => d.source === 'own').length;
  const sharedDocs = documents.filter(d => d.source === 'shared').length;

  const filterCategories = [
    { id: 'all', name: 'All Documents', icon: <Folder size={16} /> },
    { id: 'lease', name: 'Lease Agreements', icon: <FileText size={16} /> },
    { id: 'receipt', name: 'Receipts', icon: <FileText size={16} /> },
    { id: 'identification', name: 'ID Documents', icon: <FileText size={16} /> },
    { id: 'other', name: 'Other', icon: <FileText size={16} /> }
  ];

  const filteredDocuments = selectedCategory === 'all'
    ? documents
    : documents.filter(d => d.category === selectedCategory);

  if (loading) {
  return <RentEasyLoader message="Loading your Documents..." fullScreen />;
}

  return (
    <div className="tenant-documents-page">
      <div className="page-header">
        <div>
          <h1>My Documents</h1>
          <p>Documents you've uploaded and those shared by your property manager</p>
        </div>
        <button className="btn-primary" onClick={() => setShowUploadModal(true)}>
          <Upload size={18} /> Upload Document
        </button>
      </div>

      {/* Stats */}
      <div className="document-stats">
        <div className="stat-card">
          <FileText size={20} />
          <div>
            <span className="stat-value">{totalDocs}</span>
            <span className="stat-label">Total Documents</span>
          </div>
        </div>
        <div className="stat-card">
          <Upload size={20} />
          <div>
            <span className="stat-value">{ownDocs}</span>
            <span className="stat-label">Uploaded by You</span>
          </div>
        </div>
        <div className="stat-card">
          <Building size={20} />
          <div>
            <span className="stat-value">{sharedDocs}</span>
            <span className="stat-label">From Property Manager</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="categories-scroll">
        {filterCategories.map(cat => (
          <button
            key={cat.id}
            className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.icon}
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="documents-grid">
        {filteredDocuments.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <h3>No documents yet</h3>
            <p>Upload your first document or wait for your property manager to share documents.</p>
            <button className="btn-primary" onClick={() => setShowUploadModal(true)}>
              <Upload size={18} /> Upload Document
            </button>
          </div>
        ) : (
          filteredDocuments.map(doc => {
            const sender = getSenderInfo(doc);
            const statusBadge = doc.status ? getStatusBadge(doc.status) : null;
            
            return (
              <div key={doc.id} className="document-card">
                <div className="document-preview">
                  {getFileIcon(doc.file_type)}
                </div>
                <div className="document-details">
                  <h4>{doc.name || doc.title}</h4>
                  <p>{doc.description || 'No description'}</p>
                  <div className="document-meta">
                    <span className="sender-info">
                      {sender.icon} {sender.name} ({sender.type})
                    </span>
                    <span><Calendar size={12} /> {new Date(doc.created_at).toLocaleDateString()}</span>
                    <span>{formatFileSize(doc.file_size)}</span>
                  </div>
                  <div className="document-tags">
                    {doc.category && (
                      <span className="category-badge">
                        {getCategoryIcon(doc.category)} {getCategoryLabel(doc.category)}
                      </span>
                    )}
                    {statusBadge && (
                      <span className={`status-badge ${statusBadge.class}`}>
                        {statusBadge.label}
                      </span>
                    )}
                    {doc.source === 'shared' && (
                      <span className="shared-badge">📎 Shared</span>
                    )}
                  </div>
                </div>
                <div className="document-actions">
                  <button
                    className="btn-icon"
                    onClick={() => downloadDocument(doc)}
                    title="Download"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => window.open(doc.file_url, '_blank')}
                    title="View"
                  >
                    <Eye size={18} />
                  </button>
                  {doc.source === 'own' && (
                    <button
                      className="btn-icon delete"
                      onClick={() => deleteDocument(doc.id)}
                      title="Delete"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Document</h2>
              <button className="close-btn" onClick={() => setShowUploadModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="upload-instructions">
                <p>Upload important documents for verification and records.</p>
                <ul>
                  <li>Accepted formats: PDF, JPG, PNG</li>
                  <li>Maximum file size: 10MB</li>
                </ul>
              </div>
              
              <div className="form-group">
                <label>Category</label>
                <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)}>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                  ))}
                </select>
              </div>
              
              <div className="file-upload-area">
                <input
                  type="file"
                  onChange={handleUpload}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="file-input"
                  disabled={uploading}
                />
                {uploading && <p className="uploading-text">Uploading...</p>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowUploadModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantDocuments;