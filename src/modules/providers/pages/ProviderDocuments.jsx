// src/modules/providers/pages/ProviderDocuments.jsx
import React, { useState } from 'react';
import { 
  Upload, FileText, CheckCircle, AlertCircle,
  Download, Eye, Trash2, Clock, Shield,
  File, FileImage, FileSpreadsheet,
  Plus, Search, Filter, Calendar, FilePlayIcon
} from 'lucide-react';

const ProviderDocuments = () => {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: 'CAC Certificate',
      type: 'pdf',
      size: '2.4 MB',
      uploaded: '2024-01-15',
      status: 'approved',
      verifiedBy: 'Admin Team',
      expiry: '2025-01-15'
    },
    {
      id: 2,
      name: 'Tax Identification',
      type: 'pdf',
      size: '1.8 MB',
      uploaded: '2024-01-14',
      status: 'approved',
      verifiedBy: 'Admin Team',
      expiry: '2025-01-14'
    },
    {
      id: 3,
      name: 'Driver\'s License',
      type: 'image',
      size: '3.2 MB',
      uploaded: '2024-01-13',
      status: 'pending',
      verifiedBy: null,
      expiry: '2026-05-20'
    },
    {
      id: 4,
      name: 'Proof of Address',
      type: 'pdf',
      size: '1.5 MB',
      uploaded: '2024-01-12',
      status: 'rejected',
      verifiedBy: 'Admin Team',
      expiry: null,
      rejectionReason: 'Document blurry, please upload clearer version'
    },
    {
      id: 5,
      name: 'Professional Certificate',
      type: 'pdf',
      size: '4.1 MB',
      uploaded: '2024-01-10',
      status: 'approved',
      verifiedBy: 'Admin Team',
      expiry: '2024-12-31'
    },
    {
      id: 6,
      name: 'Portfolio Samples',
      type: 'image',
      size: '8.7 MB',
      uploaded: '2024-01-09',
      status: 'approved',
      verifiedBy: 'Admin Team',
      expiry: null
    }
  ]);

  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const documentTypes = [
    { type: 'CAC Certificate', required: true, description: 'Official business registration' },
    { type: 'Tax Certificate', required: true, description: 'Valid tax identification' },
    { type: 'ID Card', required: true, description: 'Government-issued ID' },
    { type: 'Proof of Address', required: true, description: 'Utility bill or bank statement' },
    { type: 'Professional Certificates', required: false, description: 'Industry certifications' },
    { type: 'Portfolio', required: false, description: 'Work samples (optional)' }
  ];

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      marginBottom: '2rem'
    },
    title: {
      fontSize: '1.875rem',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '1rem'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    },
    statCard: {
      background: 'white',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      border: '1px solid #e5e7eb',
      textAlign: 'center'
    },
    statIcon: {
      width: '3rem',
      height: '3rem',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem'
    },
    statTitle: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '0.25rem'
    },
    statValue: {
      fontSize: '1.875rem',
      fontWeight: '700',
      color: '#1f2937'
    },
    uploadSection: {
      background: 'white',
      borderRadius: '1rem',
      border: '2px dashed #d1d5db',
      padding: '3rem 2rem',
      textAlign: 'center',
      marginBottom: '2rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    uploadIcon: {
      width: '4rem',
      height: '4rem',
      background: '#eff6ff',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1.5rem'
    },
    uploadTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '0.5rem'
    },
    uploadText: {
      color: '#6b7280',
      marginBottom: '1.5rem',
      maxWidth: '400px',
      margin: '0 auto'
    },
    uploadButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 2rem',
      background: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '0.75rem',
      fontWeight: '600',
      cursor: 'pointer'
    },
    fileList: {
      marginTop: '1.5rem'
    },
    fileItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      background: '#f9fafb',
      borderRadius: '0.5rem',
      marginBottom: '0.5rem'
    },
    fileName: {
      flex: 1,
      fontWeight: '500',
      color: '#1f2937'
    },
    fileSize: {
      color: '#6b7280',
      fontSize: '0.875rem'
    },
    removeFile: {
      background: 'none',
      border: 'none',
      color: '#ef4444',
      cursor: 'pointer'
    },
    controls: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      flexWrap: 'wrap'
    },
    searchBox: {
      flex: 1,
      minWidth: '300px',
      position: 'relative'
    },
    searchInput: {
      width: '100%',
      padding: '0.75rem 1rem 0.75rem 3rem',
      border: '2px solid #e5e7eb',
      borderRadius: '0.75rem',
      fontSize: '1rem',
      color: '#1f2937'
    },
    searchIcon: {
      position: 'absolute',
      left: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af'
    },
    filterButtons: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap'
    },
    filterButton: {
      padding: '0.75rem 1.5rem',
      border: '1px solid #e5e7eb',
      background: 'white',
      borderRadius: '0.5rem',
      color: '#6b7280',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    activeFilter: {
      background: '#2563eb',
      borderColor: '#2563eb',
      color: 'white'
    },
    documentsTable: {
      background: 'white',
      borderRadius: '1rem',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    },
    tableHeader: {
      padding: '1.5rem',
      borderBottom: '1px solid #e5e7eb',
      background: '#f9fafb'
    },
    tableTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#1f2937'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    tableHead: {
      borderBottom: '2px solid #e5e7eb'
    },
    tableTh: {
      padding: '1rem 1.5rem',
      textAlign: 'left',
      fontSize: '0.75rem',
      fontWeight: '600',
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    tableRow: {
      borderBottom: '1px solid #e5e7eb',
      transition: 'background-color 0.2s'
    },
    tableCell: {
      padding: '1rem 1.5rem',
      fontSize: '0.875rem',
      color: '#374151'
    },
    docName: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontWeight: '500',
      color: '#1f2937'
    },
    docIcon: {
      width: '2.5rem',
      height: '2.5rem',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600'
    },
    statusApproved: {
      background: '#d1fae5',
      color: '#065f46'
    },
    statusPending: {
      background: '#fef3c7',
      color: '#92400e'
    },
    statusRejected: {
      background: '#fee2e2',
      color: '#991b1b'
    },
    actionButtons: {
      display: 'flex',
      gap: '0.5rem'
    },
    actionButton: {
      padding: '0.5rem',
      border: '1px solid #e5e7eb',
      background: 'white',
      borderRadius: '0.5rem',
      color: '#6b7280',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    requirementsSection: {
      background: 'white',
      borderRadius: '1rem',
      border: '1px solid #e5e7eb',
      padding: '2rem',
      marginTop: '2rem'
    },
    requirementsTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '1.5rem'
    },
    requirementsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1rem'
    },
    requirementCard: {
      padding: '1.5rem',
      border: '1px solid #e5e7eb',
      borderRadius: '0.75rem',
      background: '#f9fafb'
    },
    requirementHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '0.75rem'
    },
    requirementName: {
      fontWeight: '600',
      color: '#1f2937'
    },
    requirementBadge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600'
    },
    requiredBadge: {
      background: '#fee2e2',
      color: '#991b1b'
    },
    optionalBadge: {
      background: '#d1fae5',
      color: '#065f46'
    },
    requirementDescription: {
      color: '#6b7280',
      fontSize: '0.875rem',
      lineHeight: '1.5'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem 1rem'
    },
    emptyIcon: {
      width: '4rem',
      height: '4rem',
      background: '#f3f4f6',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem'
    },
    emptyTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '0.5rem'
    },
    emptyText: {
      color: '#6b7280'
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      setUploading(false);
      setSelectedFiles([]);
      alert('Files uploaded successfully! They will be reviewed by our team.');
    }, 2000);
  };

  const getFileIcon = (type) => {
    switch(type) {
      case 'pdf': return <FilePlayIcon size={20} color="#ef4444" />;
      case 'image': return <FileImage size={20} color="#10b981" />;
      case 'spreadsheet': return <FileSpreadsheet size={20} color="#10b981" />;
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
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: documents.length,
    approved: documents.filter(d => d.status === 'approved').length,
    pending: documents.filter(d => d.status === 'pending').length,
    rejected: documents.filter(d => d.status === 'rejected').length
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Documents & Verification</h1>
        <p style={styles.subtitle}>Upload and manage your verification documents</p>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: '#eff6ff'}}>
            <FileText size={24} color="#2563eb" />
          </div>
          <div style={styles.statTitle}>Total Documents</div>
          <div style={styles.statValue}>{stats.total}</div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: '#d1fae5'}}>
            <CheckCircle size={24} color="#10b981" />
          </div>
          <div style={styles.statTitle}>Approved</div>
          <div style={styles.statValue}>{stats.approved}</div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: '#fef3c7'}}>
            <Clock size={24} color="#f59e0b" />
          </div>
          <div style={styles.statTitle}>Pending</div>
          <div style={styles.statValue}>{stats.pending}</div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: '#fee2e2'}}>
            <AlertCircle size={24} color="#ef4444" />
          </div>
          <div style={styles.statTitle}>Rejected</div>
          <div style={styles.statValue}>{stats.rejected}</div>
        </div>
      </div>

      {/* Upload Section */}
      <div
        style={styles.uploadSection}
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
          const files = Array.from(e.dataTransfer.files);
          setSelectedFiles(prev => [...prev, ...files]);
          e.currentTarget.style.borderColor = '#d1d5db';
          e.currentTarget.style.background = 'white';
        }}
      >
        <div style={styles.uploadIcon}>
          <Upload size={32} color="#2563eb" />
        </div>
        <h3 style={styles.uploadTitle}>Upload Documents</h3>
        <p style={styles.uploadText}>
          Drag and drop files here or click to browse. Supported formats: PDF, JPG, PNG, DOC (Max 10MB)
        </p>
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          style={{display: 'none'}}
          id="file-upload"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        />
        <label htmlFor="file-upload">
          <div style={styles.uploadButton}>
            <Upload size={20} />
            Browse Files
          </div>
        </label>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div style={styles.fileList}>
          <h4 style={{marginBottom: '1rem', color: '#374151'}}>Selected Files ({selectedFiles.length})</h4>
          {selectedFiles.map((file, index) => (
            <div key={index} style={styles.fileItem}>
              <FileText size={20} color="#6b7280" />
              <div style={styles.fileName}>{file.name}</div>
              <div style={styles.fileSize}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
              <button
                onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                style={styles.removeFile}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            onClick={handleUpload}
            disabled={uploading}
            style={{
              ...styles.uploadButton,
              marginTop: '1rem',
              opacity: uploading ? 0.7 : 1,
              cursor: uploading ? 'not-allowed' : 'pointer'
            }}
          >
            {uploading ? 'Uploading...' : 'Upload Documents'}
          </button>
        </div>
      )}

      {/* Controls */}
      <div style={styles.controls}>
        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <Search style={styles.searchIcon} size={20} />
        </div>
        
        <div style={styles.filterButtons}>
          {['all', 'approved', 'pending', 'rejected'].map((filter) => (
            <button
              key={filter}
              onClick={() => {}}
              style={{
                ...styles.filterButton,
                ...(filter === 'all' ? styles.activeFilter : {})
              }}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table */}
      <div style={styles.documentsTable}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>Your Documents</h3>
        </div>
        
        {filteredDocuments.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <FileText size={32} color="#9ca3af" />
            </div>
            <h4 style={styles.emptyTitle}>No documents found</h4>
            <p style={styles.emptyText}>Upload your first document to get started</p>
          </div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table style={styles.table}>
              <thead style={styles.tableHead}>
                <tr>
                  <th style={styles.tableTh}>Document</th>
                  <th style={styles.tableTh}>Type</th>
                  <th style={styles.tableTh}>Size</th>
                  <th style={styles.tableTh}>Uploaded</th>
                  <th style={styles.tableTh}>Status</th>
                  <th style={styles.tableTh}>Expiry</th>
                  <th style={styles.tableTh}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <div style={styles.docName}>
                        <div style={{
                          ...styles.docIcon,
                          background: doc.type === 'pdf' ? '#fee2e2' : 
                                     doc.type === 'image' ? '#d1fae5' : '#f3f4f6'
                        }}>
                          {getFileIcon(doc.type)}
                        </div>
                        {doc.name}
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      {doc.type.toUpperCase()}
                    </td>
                    <td style={styles.tableCell}>
                      {doc.size}
                    </td>
                    <td style={styles.tableCell}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <Calendar size={14} color="#9ca3af" />
                        {doc.uploaded}
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={{
                        ...styles.statusBadge,
                        ...styles[`status${doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}`]
                      }}>
                        {getStatusIcon(doc.status)}
                        {doc.status}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      {doc.expiry || '—'}
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.actionButtons}>
                        <button style={styles.actionButton} title="View">
                          <Eye size={16} />
                        </button>
                        <button style={styles.actionButton} title="Download">
                          <Download size={16} />
                        </button>
                        <button style={styles.actionButton} title="Delete">
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
      <div style={styles.requirementsSection}>
        <h3 style={styles.requirementsTitle}>Document Requirements</h3>
        <div style={styles.requirementsGrid}>
          {documentTypes.map((req, index) => (
            <div key={index} style={styles.requirementCard}>
              <div style={styles.requirementHeader}>
                <div style={styles.requirementName}>{req.type}</div>
                <span style={{
                  ...styles.requirementBadge,
                  ...styles[req.required ? 'requiredBadge' : 'optionalBadge']
                }}>
                  {req.required ? 'Required' : 'Optional'}
                </span>
              </div>
              <p style={styles.requirementDescription}>{req.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProviderDocuments;