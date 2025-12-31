import React, { useState, useEffect } from 'react';
import {
  Home, FileText, Upload, Download, Eye, Trash2, Share2,
  Folder, File, FileImage, FileSpreadsheet, FileArchive,
  Calendar, User, Search, Filter, MoreVertical,
  CheckCircle, Clock, AlertCircle, Lock, Globe
} from 'lucide-react';
import './DocumentManager.css';

const DocumentManager = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Mock data for development
  useEffect(() => {
    const mockDocuments = [
      {
        id: 'doc_001',
        name: 'Lease Agreement - Lekki Duplex.pdf',
        type: 'pdf',
        size: '2.4 MB',
        uploaded: '2024-11-15',
        category: 'lease',
        property: '3-Bedroom Duplex, Lekki',
        client: 'Mr. Johnson Ade',
        status: 'active',
        shared: true,
        permissions: ['view', 'download']
      },
      {
        id: 'doc_002',
        name: 'Property Valuation Report.docx',
        type: 'doc',
        size: '1.8 MB',
        uploaded: '2024-11-10',
        category: 'valuation',
        property: 'Office Space, VI',
        client: 'Tech Corp Ltd',
        status: 'active',
        shared: false,
        permissions: ['view']
      },
      {
        id: 'doc_003',
        name: 'Tenant ID Verification.jpg',
        type: 'image',
        size: '3.2 MB',
        uploaded: '2024-11-05',
        category: 'verification',
        property: '2-Bedroom Flat, Ikeja',
        client: 'David Smith',
        status: 'expired',
        shared: true,
        permissions: ['view', 'download', 'share']
      },
      {
        id: 'doc_004',
        name: 'Maintenance Invoice.xlsx',
        type: 'spreadsheet',
        size: '1.1 MB',
        uploaded: '2024-10-28',
        category: 'invoice',
        property: 'All Properties',
        client: 'Various',
        status: 'active',
        shared: false,
        permissions: ['view', 'download']
      },
      {
        id: 'doc_005',
        name: 'Property Photos Archive.zip',
        type: 'archive',
        size: '45.6 MB',
        uploaded: '2024-10-15',
        category: 'photos',
        property: 'Shopping Complex, Surulere',
        client: 'Surulere Properties Ltd',
        status: 'active',
        shared: true,
        permissions: ['view', 'download']
      }
    ];

    setDocuments(mockDocuments);
  }, []);

  const getFileIcon = (type) => {
    switch(type) {
      case 'pdf': return <FileText size={20} color="#ef4444" />;
      case 'doc': return <FileText size={20} color="#2563eb" />;
      case 'image': return <FileImage size={20} color="#10b981" />;
      case 'spreadsheet': return <FileSpreadsheet size={20} color="#059669" />;
      case 'archive': return <FileArchive size={20} color="#f59e0b" />;
      default: return <File size={20} color="#6b7280" />;
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'lease': '#3b82f6',
      'valuation': '#10b981',
      'verification': '#8b5cf6',
      'invoice': '#f59e0b',
      'photos': '#ef4444',
      'contract': '#ec4899',
      'report': '#6366f1'
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

  const filteredDocuments = documents.filter(doc => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      doc.name.toLowerCase().includes(query) ||
      doc.property.toLowerCase().includes(query) ||
      doc.client.toLowerCase().includes(query) ||
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

  const handleUpload = async (files) => {
    setUploading(true);
    
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newDocs = Array.from(files).map((file, index) => ({
      id: `doc_new_${Date.now()}_${index}`,
      name: file.name,
      type: file.type.split('/')[1] || 'file',
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploaded: new Date().toISOString().split('T')[0],
      category: 'other',
      property: 'New Upload',
      client: 'New Client',
      status: 'active',
      shared: false,
      permissions: ['view', 'download']
    }));
    
    setDocuments([...newDocs, ...documents]);
    setUploading(false);
    setShowUploadModal(false);
  };

  const handleDelete = (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDocuments(documents.filter(doc => doc.id !== docId));
      setSelectedDocs(selectedDocs.filter(id => id !== docId));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selectedDocs.length} selected documents?`)) {
      setDocuments(documents.filter(doc => !selectedDocs.includes(doc.id)));
      setSelectedDocs([]);
    }
  };

  const handleShare = (docId) => {
    const doc = documents.find(d => d.id === docId);
    alert(`Sharing ${doc.name} with client`);
  };

  const handleDownload = (docId) => {
    const doc = documents.find(d => d.id === docId);
    alert(`Downloading ${doc.name}`);
  };

  const handlePreview = (docId) => {
    const doc = documents.find(d => d.id === docId);
    alert(`Previewing ${doc.name}`);
  };

  const totalSize = documents.reduce((sum, doc) => {
    const size = parseFloat(doc.size);
    return sum + (isNaN(size) ? 0 : size);
  }, 0);

  return (
    <div className="document-manager">
      {/* Header */}
      <div className="dm-header">
        <div>
          <h2>Document Manager</h2>
          <p className="subtitle">
            {documents.length} documents • {totalSize.toFixed(1)} MB total
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
                    onClick={() => handlePreview(doc.id)}
                    title="Preview"
                  >
                    <Eye size={14} />
                  </button>
                  <button 
                    className="doc-action-btn"
                    onClick={() => handleDownload(doc.id)}
                    title="Download"
                  >
                    <Download size={14} />
                  </button>
                  <button 
                    className="doc-action-btn"
                    onClick={() => handleShare(doc.id)}
                    title="Share"
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
                  {getFileIcon(doc.type)}
                </div>
                
                <div className="doc-info">
                  <h4 className="doc-name">{doc.name}</h4>
                  
                  <div className="doc-meta">
                    <span className="doc-size">{doc.size}</span>
                    <span className="doc-date">
                      <Calendar size={12} />
                      {doc.uploaded}
                    </span>
                  </div>
                  
                  <div className="doc-category">
                    <span 
                      className="category-tag"
                      style={{ backgroundColor: `${getCategoryColor(doc.category)}20`, color: getCategoryColor(doc.category) }}
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
                <div className="doc-property">
                  <Home size={12} />
                  <span>{doc.property}</span>
                </div>
                <div className="doc-client">
                  <User size={12} />
                  <span>{doc.client}</span>
                </div>
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
        <div className="upload-modal-overlay">
          <div className="upload-modal">
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
                  onChange={(e) => handleUpload(e.target.files)}
                  className="file-input"
                  id="file-upload"
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