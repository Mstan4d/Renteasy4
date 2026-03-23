import React, { useState, useEffect } from 'react';
import {
  Home, FileText, Upload, Download, Eye, Trash2, Share2,
  Folder, File, FileImage, FileSpreadsheet, FileArchive,
  Calendar, User, Search, Filter, MoreVertical,
  CheckCircle, Clock, AlertCircle, Lock, Globe
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import './DocumentManager.css';

const DocumentManager = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, [user]);

  const loadDocuments = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('estate_documents')
        .select('*, property:listings(title), client:estate_firm_clients(name)')
        .eq('estate_firm_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDocuments(data || []);

    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files) => {
    if (!user || !files.length) return;

    setUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Upload file to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `estate-firm-${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('estate-documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('estate-documents')
          .getPublicUrl(filePath);

        // Save document metadata
        const { data: docData, error: docError } = await supabase
          .from('estate_documents')
          .insert({
            estate_firm_id: user.id,
            name: file.name,
            file_type: file.type,
            file_size: file.size,
            file_url: urlData.publicUrl,
            category: 'other',
            status: 'active',
            shared: false,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (docError) throw docError;

        return docData;
      });

      await Promise.all(uploadPromises);
      
      // Refresh documents list
      await loadDocuments();
      
      // Log activity
      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'document',
        action: 'upload',
        description: `Uploaded ${files.length} document(s)`,
        created_at: new Date().toISOString()
      });

      alert(`Successfully uploaded ${files.length} document(s)`);
      setShowUploadModal(false);

    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload documents. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      const doc = documents.find(d => d.id === docId);
      
      // Delete from storage
      if (doc.file_url) {
        const filePath = doc.file_url.split('/').pop();
        await supabase.storage
          .from('estate-documents')
          .remove([`estate-firm-${user.id}/${filePath}`]);
      }

      // Delete from database
      const { error } = await supabase
        .from('estate_documents')
        .delete()
        .eq('id', docId);

      if (error) throw error;

      // Update state
      setDocuments(documents.filter(doc => doc.id !== docId));
      setSelectedDocs(selectedDocs.filter(id => id !== docId));

      // Log activity
      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'document',
        action: 'delete',
        description: `Deleted document: ${doc.name}`,
        created_at: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document. Please try again.');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedDocs.length} selected documents?`)) return;

    try {
      const docsToDelete = documents.filter(doc => selectedDocs.includes(doc.id));
      
      // Delete from storage
      const deletePromises = docsToDelete.map(async (doc) => {
        if (doc.file_url) {
          const filePath = doc.file_url.split('/').pop();
          await supabase.storage
            .from('estate-documents')
            .remove([`estate-firm-${user.id}/${filePath}`]);
        }
      });

      await Promise.all(deletePromises);

      // Delete from database
      const { error } = await supabase
        .from('estate_documents')
        .delete()
        .in('id', selectedDocs);

      if (error) throw error;

      // Update state
      setDocuments(documents.filter(doc => !selectedDocs.includes(doc.id)));
      setSelectedDocs([]);

      // Log activity
      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'document',
        action: 'bulk_delete',
        description: `Deleted ${selectedDocs.length} documents`,
        created_at: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error bulk deleting documents:', error);
      alert('Failed to delete documents. Please try again.');
    }
  };

  const handleShare = async (docId) => {
    try {
      const { error } = await supabase
        .from('estate_documents')
        .update({ shared: true })
        .eq('id', docId);

      if (error) throw error;

      await loadDocuments();
      alert('Document shared successfully!');

    } catch (error) {
      console.error('Error sharing document:', error);
      alert('Failed to share document. Please try again.');
    }
  };

  const handleDownload = (docUrl, docName) => {
    const a = document.createElement('a');
    a.href = docUrl;
    a.download = docName;
    a.click();
  };

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return <FileText size={20} color="#ef4444" />;
    if (type.includes('word') || type.includes('document')) return <FileText size={20} color="#2563eb" />;
    if (type.includes('image')) return <FileImage size={20} color="#10b981" />;
    if (type.includes('spreadsheet') || type.includes('excel')) return <FileSpreadsheet size={20} color="#059669" />;
    if (type.includes('zip') || type.includes('compressed')) return <FileArchive size={20} color="#f59e0b" />;
    return <File size={20} color="#6b7280" />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'lease': '#3b82f6',
      'valuation': '#10b981',
      'verification': '#8b5cf6',
      'invoice': '#f59e0b',
      'photos': '#ef4444',
      'contract': '#ec4899',
      'report': '#6366f1',
      'other': '#6b7280'
    };
    return colors[category] || '#6b7280';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <CheckCircle size={14} color="#10b981" />;
      case 'expired': return <AlertCircle size={14} color="#ef4444" />;
      case 'pending': return <Clock size={14} color="#f59e0b" />;
      default: return <File size={14} color="#6b7280" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(doc => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      doc.name.toLowerCase().includes(query) ||
      (doc.property?.title || '').toLowerCase().includes(query) ||
      (doc.client?.name || '').toLowerCase().includes(query) ||
      doc.category.toLowerCase().includes(query)
    );
  }).filter(doc => {
    if (filter === 'all') return true;
    if (filter === 'shared') return doc.shared;
    if (filter === 'active') return doc.status === 'active';
    if (filter === 'expired') return doc.status === 'expired';
    if (filter === filter) return doc.category === filter;
    return true;
  });

  const totalSize = documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0);

  
   if (loading) {
  return <RentEasyLoader message="Loading your Documents..." fullScreen />;
}

  return (
    <div className="document-manager">
      {/* Header */}
      <div className="dm-header">
        <div>
          <h2>Document Manager</h2>
          <p className="subtitle">
            {documents.length} documents • {formatFileSize(totalSize)} total
          </p>
        </div>
        
        <div className="dm-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowUploadModal(true)}
          >
            <Upload size={18} />
            Upload Documents
          </button>
          <button className="btn btn-outline">
            <Folder size={18} />
            Create Folder
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="dm-stats">
        <div className="stat-card">
          <FileText size={24} />
          <div className="stat-info">
            <span className="stat-value">{documents.length}</span>
            <span className="stat-label">Total Documents</span>
          </div>
        </div>
        
        <div className="stat-card">
          <Share2 size={24} />
          <div className="stat-info">
            <span className="stat-value">
              {documents.filter(d => d.shared).length}
            </span>
            <span className="stat-label">Shared</span>
          </div>
        </div>
        
        <div className="stat-card">
          <CheckCircle size={24} />
          <div className="stat-info">
            <span className="stat-value">
              {documents.filter(d => d.status === 'active').length}
            </span>
            <span className="stat-label">Active</span>
          </div>
        </div>
        
        <div className="stat-card">
          <AlertCircle size={24} />
          <div className="stat-info">
            <span className="stat-value">
              {documents.filter(d => d.status === 'expired').length}
            </span>
            <span className="stat-label">Expired</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="dm-controls">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-actions">
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Documents
            </button>
            <button 
              className={`filter-tab ${filter === 'shared' ? 'active' : ''}`}
              onClick={() => setFilter('shared')}
            >
              Shared
            </button>
            <button 
              className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button 
              className={`filter-tab ${filter === 'expired' ? 'active' : ''}`}
              onClick={() => setFilter('expired')}
            >
              Expired
            </button>
          </div>
          
          <select 
            className="category-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="lease">Lease Agreements</option>
            <option value="valuation">Valuation Reports</option>
            <option value="verification">Verification</option>
            <option value="invoice">Invoices</option>
            <option value="photos">Property Photos</option>
            <option value="contract">Contracts</option>
            <option value="report">Reports</option>
          </select>
        </div>
      </div>

      {/* Selection Bar */}
      {selectedDocs.length > 0 && (
        <div className="selection-bar">
          <div className="selection-info">
            <CheckCircle size={16} />
            <span>{selectedDocs.length} documents selected</span>
          </div>
          <div className="selection-actions">
            <button className="btn btn-sm">
              <Download size={14} />
              Download Selected
            </button>
            <button className="btn btn-sm">
              <Share2 size={14} />
              Share Selected
            </button>
            <button 
              className="btn btn-sm btn-danger"
              onClick={handleBulkDelete}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Documents Grid */}
      <div className="documents-grid">
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map(doc => (
            <div key={doc.id} className="document-card">
              <div className="doc-header">
                <div className="doc-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedDocs.includes(doc.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDocs([...selectedDocs, doc.id]);
                      } else {
                        setSelectedDocs(selectedDocs.filter(id => id !== doc.id));
                      }
                    }}
                  />
                </div>
                
                <div className="doc-actions">
                  <button 
                    className="doc-action-btn"
                    onClick={() => window.open(doc.file_url, '_blank')}
                    title="Preview"
                  >
                    <Eye size={14} />
                  </button>
                  <button 
                    className="doc-action-btn"
                    onClick={() => handleDownload(doc.file_url, doc.name)}
                    title="Download"
                  >
                    <Download size={14} />
                  </button>
                  <button 
                    className="doc-action-btn"
                    onClick={() => handleShare(doc.id)}
                    title="Share"
                    disabled={doc.shared}
                  >
                    <Share2 size={14} />
                  </button>
                  <button 
                    className="doc-action-btn"
                    onClick={() => handleDelete(doc.id)}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="doc-body">
                <div className="doc-icon">
                  {getFileIcon(doc.file_type)}
                </div>
                
                <div className="doc-info">
                  <h4 className="doc-name">{doc.name}</h4>
                  
                  <div className="doc-meta">
                    <span className="doc-size">{formatFileSize(doc.file_size)}</span>
                    <span className="doc-date">
                      <Calendar size={12} />
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="doc-category">
                    <span 
                      className="category-tag"
                      style={{ 
                        backgroundColor: `${getCategoryColor(doc.category)}20`, 
                        color: getCategoryColor(doc.category) 
                      }}
                    >
                      {doc.category}
                    </span>
                    <span className="doc-status">
                      {getStatusIcon(doc.status)}
                      {doc.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="doc-footer">
                {doc.property?.title && (
                  <div className="doc-property">
                    <Home size={12} />
                    <span>{doc.property.title}</span>
                  </div>
                )}
                {doc.client?.name && (
                  <div className="doc-client">
                    <User size={12} />
                    <span>{doc.client.name}</span>
                  </div>
                )}
                <div className="doc-permissions">
                  {doc.shared ? (
                    <span className="permission-tag shared">
                      <Globe size={10} />
                      Shared
                    </span>
                  ) : (
                    <span className="permission-tag private">
                      <Lock size={10} />
                      Private
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <FileText size={48} />
            <h3>No documents found</h3>
            <p>Upload your first document to get started</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowUploadModal(true)}
            >
              <Upload size={18} />
              Upload Documents
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="upload-modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload Documents</h3>
              <button 
                className="modal-close"
                onClick={() => setShowUploadModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="upload-zone">
                <Upload size={48} />
                <p>Drag & drop files here</p>
                <small>or</small>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="file-input"
                  id="file-upload"
                  disabled={uploading}
                />
                <label htmlFor="file-upload" className="btn btn-outline">
                  Browse Files
                </label>
                <small>Supports PDF, DOC, JPG, PNG, XLSX up to 50MB</small>
              </div>
              
              {uploading && (
                <div className="uploading-progress">
                  <div className="progress-bar">
                    <div className="progress-fill"></div>
                  </div>
                  <p>Uploading documents...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;