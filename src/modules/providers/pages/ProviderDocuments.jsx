// src/modules/providers/pages/ProviderDocuments.jsx
import React, { useState, useEffect } from 'react';
import { 
  Upload, FileText, CheckCircle, AlertCircle,
  Download, Eye, Trash2, Clock, Shield,
  File, FileImage, FileSpreadsheet,
  Plus, Search, Filter, Calendar
} from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './ProviderDocuments.css';

const ProviderDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const documentTypes = [
    { type: 'CAC Certificate', required: true, description: 'Official business registration' },
    { type: 'Tax Certificate', required: true, description: 'Valid tax identification' },
    { type: 'ID Card', required: true, description: 'Government-issued ID' },
    { type: 'Proof of Address', required: true, description: 'Utility bill or bank statement' },
    { type: 'Professional Certificates', required: false, description: 'Industry certifications' },
    { type: 'Portfolio', required: false, description: 'Work samples (optional)' }
  ];

  useEffect(() => {
    if (!user) return;
    fetchDocuments();
  }, [user]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('provider_documents')
        .select('*')
        .eq('provider_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      // Transform to match component's expected format
      const transformed = (data || []).map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.mime_type?.split('/')[1] || 'pdf',
        size: formatBytes(doc.file_size),
        uploaded: new Date(doc.uploaded_at).toLocaleDateString('en-CA'), // YYYY-MM-DD
        status: doc.verification_status,
        verifiedBy: doc.verified_by ? 'Admin' : null,
        expiry: doc.expiry_date || null,
        rejectionReason: doc.rejection_reason,
        storagePath: doc.storage_path
      }));

      setDocuments(transformed);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      for (const file of selectedFiles) {
        // Generate a unique file path: user_id/timestamp_filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
        const filePath = `${user.id}/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('provider-documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('provider-documents')
          .getPublicUrl(filePath);

        // Insert record into provider_documents table
        const { error: dbError } = await supabase
          .from('provider_documents')
          .insert({
            provider_id: user.id,
            name: file.name,
            file_name: fileName,
            file_size: file.size,
            mime_type: file.type,
            storage_path: filePath,
            verification_status: 'pending'
          });

        if (dbError) throw dbError;
      }

      // Refresh document list
      await fetchDocuments();
      setSelectedFiles([]);
      alert('Files uploaded successfully! They will be reviewed by our team.');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Are you sure you want to delete "${doc.name}"?`)) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('provider-documents')
        .remove([doc.storagePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('provider_documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      // Refresh list
      await fetchDocuments();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Delete failed: ' + err.message);
    }
  };

  const handleView = async (doc) => {
    try {
      // Generate a signed URL (valid for 60 seconds) for secure viewing (optional)
      const { data, error } = await supabase.storage
        .from('provider-documents')
        .createSignedUrl(doc.storagePath, 60);

      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (err) {
      console.error('View error:', err);
      alert('Could not open document: ' + err.message);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const { data, error } = await supabase.storage
        .from('provider-documents')
        .download(doc.storagePath);

      if (error) throw error;

      // Create a download link
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      alert('Download failed: ' + err.message);
    }
  };

  const getFileIcon = (type) => {
    switch(type) {
      case 'pdf': return <File size={20} color="#ef4444" />;
      case 'jpeg':
      case 'jpg':
      case 'png':
      case 'image': return <FileImage size={20} color="#10b981" />;
      case 'xls':
      case 'xlsx':
      case 'csv': return <FileSpreadsheet size={20} color="#10b981" />;
      default: return <File size={20} color="#6b7280" />;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return <CheckCircle size={14} />;
      case 'pending': return <Clock size={14} />;
      case 'rejected': return <AlertCircle size={14} />;
      default: return null;
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === 'all' || doc.status === statusFilter)
  );

  const stats = {
    total: documents.length,
    approved: documents.filter(d => d.status === 'approved').length,
    pending: documents.filter(d => d.status === 'pending').length,
    rejected: documents.filter(d => d.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="documents-loading">
        <div className="loading-spinner"></div>
        <p>Loading your documents...</p>
      </div>
    );
  }

  return (
    <div className="documents-container">
      {/* Header */}
      <div className="documents-header">
        <h1 className="documents-title">Documents & Verification</h1>
        <p className="documents-subtitle">Upload and manage your verification documents</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Documents</p>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Approved</p>
            <p className="stat-value">{stats.approved}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Pending</p>
            <p className="stat-value">{stats.pending}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">
            <AlertCircle size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Rejected</p>
            <p className="stat-value">{stats.rejected}</p>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div
        className="upload-section"
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add('drag-over');
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove('drag-over');
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove('drag-over');
          const files = Array.from(e.dataTransfer.files);
          setSelectedFiles(prev => [...prev, ...files]);
        }}
      >
        <div className="upload-icon">
          <Upload size={32} />
        </div>
        <h3 className="upload-title">Upload Documents</h3>
        <p className="upload-text">
          Drag and drop files here or click to browse. Supported formats: PDF, JPG, PNG, DOC (Max 10MB)
        </p>
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="file-upload"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        />
        <label htmlFor="file-upload" className="upload-button">
          <Upload size={20} />
          Browse Files
        </label>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="selected-files">
          <h4>Selected Files ({selectedFiles.length})</h4>
          {selectedFiles.map((file, index) => (
            <div key={index} className="selected-file">
              <FileText size={20} />
              <span className="file-name">{file.name}</span>
              <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              <button
                onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                className="remove-file"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="upload-submit"
          >
            {uploading ? 'Uploading...' : 'Upload Documents'}
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="search-icon" size={20} />
        </div>
        
        <div className="filter-buttons">
          {['all', 'approved', 'pending', 'rejected'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`filter-button ${statusFilter === filter ? 'active' : ''}`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table */}
      <div className="documents-table">
        <div className="table-header">
          <h3>Your Documents</h3>
        </div>
        
        {filteredDocuments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FileText size={32} />
            </div>
            <h4>No documents found</h4>
            <p>Upload your first document to get started</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                  <th>Status</th>
                  <th>Expiry</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td className="doc-name">
                      <div className="doc-icon" data-type={doc.type}>
                        {getFileIcon(doc.type)}
                      </div>
                      {doc.name}
                    </td>
                    <td>{doc.type.toUpperCase()}</td>
                    <td>{doc.size}</td>
                    <td>
                      <span className="date-cell">
                        <Calendar size={14} />
                        {doc.uploaded}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${doc.status}`}>
                        {getStatusIcon(doc.status)}
                        {doc.status}
                      </span>
                    </td>
                    <td>{doc.expiry || '—'}</td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => handleView(doc)} className="action-button" title="View">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleDownload(doc)} className="action-button" title="Download">
                          <Download size={16} />
                        </button>
                        <button onClick={() => handleDelete(doc)} className="action-button" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Requirements Section */}
      <div className="requirements-section">
        <h3>Document Requirements</h3>
        <div className="requirements-grid">
          {documentTypes.map((req, index) => (
            <div key={index} className="requirement-card">
              <div className="requirement-header">
                <span className="requirement-name">{req.type}</span>
                <span className={`requirement-badge ${req.required ? 'required' : 'optional'}`}>
                  {req.required ? 'Required' : 'Optional'}
                </span>
              </div>
              <p className="requirement-description">{req.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProviderDocuments;