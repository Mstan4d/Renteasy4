import React, { useState } from 'react';
import ProviderPageTemplate from '../templates/ProviderPageTemplate';
import {
  FaGavel, FaFileContract, FaShieldAlt, FaClipboardCheck,
  FaExclamationTriangle, FaCalendarCheck, FaDownload,
  FaClock, FaCheckCircle, FaTimesCircle, FaFileSignature,
  FaBalanceScale, FaUserLock, FaHistory, FaBell
} from 'react-icons/fa';

const ProviderCompliance = () => {
  const [complianceItems, setComplianceItems] = useState([
    {
      id: 1,
      title: 'Service Provider Agreement',
      type: 'agreement',
      status: 'signed',
      signedDate: '2024-01-05',
      expiryDate: '2025-01-05',
      requirement: 'mandatory',
      description: 'Terms and conditions for providing services on RentEasy',
      actions: ['view', 'download']
    },
    {
      id: 2,
      title: 'Data Protection Policy',
      type: 'policy',
      status: 'pending_review',
      signedDate: null,
      expiryDate: null,
      requirement: 'mandatory',
      description: 'GDPR and data handling compliance requirements',
      actions: ['review', 'sign']
    },
    {
      id: 3,
      title: 'Safety Standards Certification',
      type: 'certification',
      status: 'expired',
      signedDate: '2023-06-15',
      expiryDate: '2024-01-15',
      requirement: 'conditional',
      description: 'Required for electrical and plumbing services',
      actions: ['renew', 'upload']
    },
    {
      id: 4,
      title: 'Insurance Coverage',
      type: 'insurance',
      status: 'valid',
      signedDate: '2024-01-10',
      expiryDate: '2025-01-10',
      requirement: 'recommended',
      description: 'Liability insurance for service providers',
      actions: ['view', 'update']
    },
    {
      id: 5,
      title: 'Tax Compliance Certificate',
      type: 'certificate',
      status: 'not_required',
      signedDate: null,
      expiryDate: null,
      requirement: 'conditional',
      description: 'Required for providers with annual earnings above ₦1,000,000',
      actions: ['info']
    },
    {
      id: 6,
      title: 'Code of Conduct',
      type: 'policy',
      status: 'acknowledged',
      signedDate: '2024-01-05',
      expiryDate: null,
      requirement: 'mandatory',
      description: 'Professional behavior and ethical guidelines',
      actions: ['view', 'acknowledge']
    }
  ]);

  const [auditLogs, setAuditLogs] = useState([
    {
      id: 1,
      action: 'Agreement Signed',
      item: 'Service Provider Agreement',
      user: 'System',
      timestamp: '2024-01-05 14:30:00',
      details: 'Digital signature applied',
      status: 'completed'
    },
    {
      id: 2,
      action: 'Document Uploaded',
      item: 'Safety Standards Certification',
      user: 'You',
      timestamp: '2024-01-10 09:15:00',
      details: 'Certificate file uploaded',
      status: 'completed'
    },
    {
      id: 3,
      action: 'Policy Updated',
      item: 'Data Protection Policy',
      user: 'RentEasy Admin',
      timestamp: '2024-01-12 11:45:00',
      details: 'Updated to v2.1',
      status: 'pending'
    },
    {
      id: 4,
      action: 'Reminder Sent',
      item: 'Safety Standards Certification',
      user: 'System',
      timestamp: '2024-01-14 16:20:00',
      details: 'Expiry reminder sent',
      status: 'notification'
    },
    {
      id: 5,
      action: 'Compliance Check',
      item: 'All Requirements',
      user: 'System',
      timestamp: '2024-01-15 08:00:00',
      details: 'Monthly compliance audit',
      status: 'completed'
    }
  ]);

  const [activeFilter, setActiveFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const filters = [
    { id: 'all', label: 'All Items', count: complianceItems.length },
    { id: 'mandatory', label: 'Mandatory', count: complianceItems.filter(item => item.requirement === 'mandatory').length },
    { id: 'pending', label: 'Pending', count: complianceItems.filter(item => item.status.includes('pending')).length },
    { id: 'expired', label: 'Expired', count: complianceItems.filter(item => item.status === 'expired').length },
    { id: 'valid', label: 'Valid', count: complianceItems.filter(item => item.status === 'valid' || item.status === 'signed').length }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'signed':
      case 'valid':
      case 'acknowledged':
        return '#4caf50';
      case 'pending_review':
      case 'pending':
        return '#ff9800';
      case 'expired':
        return '#f44336';
      case 'not_required':
        return '#757575';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'signed':
      case 'valid':
      case 'acknowledged':
        return <FaCheckCircle />;
      case 'pending_review':
      case 'pending':
        return <FaClock />;
      case 'expired':
        return <FaExclamationTriangle />;
      case 'not_required':
        return <FaTimesCircle />;
      default:
        return <FaClock />;
    }
  };

  const getRequirementBadge = (requirement) => {
    switch(requirement) {
      case 'mandatory':
        return { label: 'Mandatory', color: '#f44336', bg: '#ffebee' };
      case 'conditional':
        return { label: 'Conditional', color: '#ff9800', bg: '#fff3e0' };
      case 'recommended':
        return { label: 'Recommended', color: '#2196f3', bg: '#e3f2fd' };
      default:
        return { label: 'Optional', color: '#757575', bg: '#f5f5f5' };
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'agreement':
        return <FaFileContract />;
      case 'policy':
        return <FaGavel />;
      case 'certification':
        return <FaClipboardCheck />;
      case 'insurance':
        return <FaShieldAlt />;
      case 'certificate':
        return <FaFileSignature />;
      default:
        return <FaFileContract />;
    }
  };

  const filteredItems = complianceItems.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'mandatory') return item.requirement === 'mandatory';
    if (activeFilter === 'pending') return item.status.includes('pending');
    if (activeFilter === 'expired') return item.status === 'expired';
    if (activeFilter === 'valid') return item.status === 'valid' || item.status === 'signed';
    return true;
  });

  const handleAction = (itemId, action) => {
    const item = complianceItems.find(i => i.id === itemId);
    setSelectedItem(item);
    
    switch(action) {
      case 'sign':
      case 'review':
        alert(`Opening ${item.title} for ${action}`);
        break;
      case 'upload':
      case 'renew':
        setShowUploadModal(true);
        break;
      case 'view':
        alert(`Viewing ${item.title}`);
        break;
      case 'download':
        alert(`Downloading ${item.title}`);
        break;
      case 'acknowledge':
        setComplianceItems(items => items.map(i => 
          i.id === itemId ? { ...i, status: 'acknowledged', signedDate: new Date().toISOString().split('T')[0] } : i
        ));
        break;
      default:
        break;
    }
  };

  const calculateComplianceScore = () => {
    const mandatoryItems = complianceItems.filter(item => item.requirement === 'mandatory');
    const completedMandatory = mandatoryItems.filter(item => 
      item.status === 'signed' || item.status === 'valid' || item.status === 'acknowledged'
    ).length;
    
    return mandatoryItems.length > 0 
      ? Math.round((completedMandatory / mandatoryItems.length) * 100)
      : 100;
  };

  const upcomingExpiries = complianceItems.filter(item => {
    if (!item.expiryDate) return false;
    const expiryDate = new Date(item.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  });

  return (
    <ProviderPageTemplate
      title="Compliance & Regulations"
      subtitle="Manage your legal and regulatory requirements"
      actions={
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn-secondary">
            <FaDownload style={{ marginRight: '0.5rem' }} />
            Export Compliance Report
          </button>
          <button className="btn-primary">
            <FaClipboardCheck style={{ marginRight: '0.5rem' }} />
            Run Compliance Check
          </button>
        </div>
      }
    >
      {/* Compliance Score Card */}
      <div className="provider-card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">Compliance Overview</h3>
          <div className="compliance-score">
            <div className="score-circle">
              <span className="score-value">{calculateComplianceScore()}%</span>
              <span className="score-label">Compliant</span>
            </div>
          </div>
        </div>

        <div className="compliance-stats">
          <div className="stat-item">
            <FaCheckCircle style={{ color: '#4caf50', fontSize: '2rem' }} />
            <div>
              <div className="stat-value">
                {complianceItems.filter(item => item.status === 'signed' || item.status === 'valid').length}
              </div>
              <div className="stat-label">Completed</div>
            </div>
          </div>

          <div className="stat-item">
            <FaClock style={{ color: '#ff9800', fontSize: '2rem' }} />
            <div>
              <div className="stat-value">
                {complianceItems.filter(item => item.status.includes('pending')).length}
              </div>
              <div className="stat-label">Pending</div>
            </div>
          </div>

          <div className="stat-item">
            <FaExclamationTriangle style={{ color: '#f44336', fontSize: '2rem' }} />
            <div>
              <div className="stat-value">
                {complianceItems.filter(item => item.status === 'expired').length}
              </div>
              <div className="stat-label">Expired</div>
            </div>
          </div>

          <div className="stat-item">
            <FaCalendarCheck style={{ color: '#2196f3', fontSize: '2rem' }} />
            <div>
              <div className="stat-value">{upcomingExpiries.length}</div>
              <div className="stat-label">Expiring Soon</div>
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="compliance-progress">
          <div className="progress-item">
            <div className="progress-label">
              <span>Mandatory Requirements</span>
              <span>
                {complianceItems.filter(item => item.requirement === 'mandatory' && 
                  (item.status === 'signed' || item.status === 'valid')).length}/
                {complianceItems.filter(item => item.requirement === 'mandatory').length}
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${(complianceItems.filter(item => item.requirement === 'mandatory' && 
                    (item.status === 'signed' || item.status === 'valid')).length / 
                    complianceItems.filter(item => item.requirement === 'mandatory').length) * 100}%`
                }}
              />
            </div>
          </div>

          <div className="progress-item">
            <div className="progress-label">
              <span>Conditional Requirements</span>
              <span>
                {complianceItems.filter(item => item.requirement === 'conditional' && 
                  (item.status === 'signed' || item.status === 'valid')).length}/
                {complianceItems.filter(item => item.requirement === 'conditional').length}
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill conditional"
                style={{ 
                  width: `${(complianceItems.filter(item => item.requirement === 'conditional' && 
                    (item.status === 'signed' || item.status === 'valid')).length / 
                    complianceItems.filter(item => item.requirement === 'conditional').length) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="compliance-filters" style={{ marginBottom: '1.5rem' }}>
        <div className="filter-buttons">
          {filters.map(filter => (
            <button
              key={filter.id}
              className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
              <span className="filter-count">{filter.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Compliance Items Grid */}
      <div className="provider-grid" style={{ marginBottom: '2rem' }}>
        {filteredItems.map(item => {
          const requirementBadge = getRequirementBadge(item.requirement);
          
          return (
            <div key={item.id} className="compliance-item-card">
              <div className="item-header">
                <div className="item-type-icon" style={{ color: getStatusColor(item.status) }}>
                  {getTypeIcon(item.type)}
                </div>
                <div className="item-title-section">
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>{item.title}</h4>
                  <div className="item-meta">
                    <span className={`status-badge`} style={{ 
                      background: getStatusColor(item.status) + '20',
                      color: getStatusColor(item.status)
                    }}>
                      {getStatusIcon(item.status)}
                      {item.status.replace('_', ' ')}
                    </span>
                    <span className="requirement-badge" style={{
                      background: requirementBadge.bg,
                      color: requirementBadge.color
                    }}>
                      {requirementBadge.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="item-description">
                <p style={{ margin: '0 0 1rem 0', color: '#666' }}>{item.description}</p>
              </div>

              <div className="item-details">
                {item.signedDate && (
                  <div className="detail">
                    <strong>Signed:</strong> {item.signedDate}
                  </div>
                )}
                {item.expiryDate && (
                  <div className="detail">
                    <strong>Expires:</strong> 
                    <span style={{ 
                      color: new Date(item.expiryDate) < new Date() ? '#f44336' : '#4caf50',
                      fontWeight: '600',
                      marginLeft: '0.3rem'
                    }}>
                      {item.expiryDate}
                    </span>
                  </div>
                )}
              </div>

              <div className="item-actions">
                <div className="action-buttons">
                  {item.actions.map(action => (
                    <button
                      key={action}
                      className={`action-btn ${action}`}
                      onClick={() => handleAction(item.id, action)}
                    >
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming Expiries */}
      {upcomingExpiries.length > 0 && (
        <div className="provider-card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">
              <FaBell style={{ marginRight: '0.5rem', color: '#ff9800' }} />
              Upcoming Expiries
            </h3>
            <span className="expiry-count">{upcomingExpiries.length} items</span>
          </div>

          <div className="expiry-list">
            {upcomingExpiries.map(item => {
              const daysUntilExpiry = Math.ceil(
                (new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
              );
              
              return (
                <div key={item.id} className="expiry-item">
                  <div className="expiry-info">
                    <h5 style={{ margin: '0 0 0.3rem 0' }}>{item.title}</h5>
                    <div className="expiry-meta">
                      <span>Expires: {item.expiryDate}</span>
                      <span>•</span>
                      <span className={`days-remaining ${daysUntilExpiry <= 7 ? 'urgent' : 'warning'}`}>
                        {daysUntilExpiry} days remaining
                      </span>
                    </div>
                  </div>
                  <button 
                    className="btn-primary"
                    onClick={() => handleAction(item.id, 'renew')}
                  >
                    Renew Now
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Audit Log */}
      <div className="provider-card">
        <div className="card-header">
          <h3 className="card-title">
            <FaHistory style={{ marginRight: '0.5rem' }} />
            Compliance Audit Log
          </h3>
          <button className="btn-secondary">
            <FaDownload style={{ marginRight: '0.5rem' }} />
            Export Log
          </button>
        </div>

        <div className="audit-log">
          {auditLogs.map(log => (
            <div key={log.id} className="log-item">
              <div className="log-icon">
                {log.status === 'completed' && <FaCheckCircle style={{ color: '#4caf50' }} />}
                {log.status === 'pending' && <FaClock style={{ color: '#ff9800' }} />}
                {log.status === 'notification' && <FaBell style={{ color: '#2196f3' }} />}
              </div>
              
              <div className="log-content">
                <div className="log-header">
                  <strong>{log.action}</strong>
                  <span className="log-time">{log.timestamp}</span>
                </div>
                
                <div className="log-details">
                  <span className="log-item-name">{log.item}</span>
                  <span className="log-user">by {log.user}</span>
                </div>
                
                {log.details && (
                  <div className="log-description">
                    {log.details}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Upload {selectedItem.title}</h3>
              <button className="modal-close" onClick={() => setShowUploadModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="upload-instructions">
                <p>Please upload your {selectedItem.title.toLowerCase()} document.</p>
                
                <div className="upload-requirements">
                  <h4>Requirements:</h4>
                  <ul>
                    <li>PDF, JPG, or PNG format</li>
                    <li>Maximum file size: 5MB</li>
                    <li>Clear and readable document</li>
                    <li>Valid until at least next month</li>
                  </ul>
                </div>

                <div className="upload-area">
                  <div className="upload-dropzone">
                    <FaFileContract style={{ fontSize: '3rem', color: '#1a237e', marginBottom: '1rem' }} />
                    <p style={{ margin: '0 0 1rem 0' }}>Drop your file here or click to browse</p>
                    <input type="file" className="file-input" accept=".pdf,.jpg,.jpeg,.png" />
                    <small className="file-types">PDF, JPG, PNG up to 5MB</small>
                  </div>
                </div>

                <div className="upload-meta">
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input type="date" className="form-control" />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Document Number (Optional)</label>
                    <input type="text" className="form-control" placeholder="e.g., CERT-12345" />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={() => {
                  setShowUploadModal(false);
                  alert('Document uploaded successfully! It will be reviewed within 24 hours.');
                }}
              >
                Upload & Submit for Review
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .compliance-score {
          display: flex;
          align-items: center;
        }
        
        .score-circle {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          position: relative;
        }
        
        .score-circle::before {
          content: '';
          position: absolute;
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: white;
          z-index: 1;
        }
        
        .score-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: #1a237e;
          z-index: 2;
          line-height: 1;
        }
        
        .score-label {
          font-size: 0.8rem;
          color: #666;
          z-index: 2;
          margin-top: 0.3rem;
        }
        
        .compliance-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin: 2rem 0;
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
        
        .compliance-progress {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .progress-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .progress-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
          color: #333;
        }
        
        .progress-bar {
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
          transition: width 0.3s ease;
        }
        
        .progress-fill.conditional {
          background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);
        }
        
        .compliance-filters {
          padding: 1rem;
          background: white;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
        }
        
        .filter-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .filter-btn {
          padding: 0.8rem 1.5rem;
          border: 1px solid #ddd;
          background: white;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .filter-btn.active {
          background: #1a237e;
          color: white;
          border-color: #1a237e;
        }
        
        .filter-count {
          background: #e0e0e0;
          color: #333;
          padding: 0.2rem 0.6rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        .filter-btn.active .filter-count {
          background: rgba(255, 255, 255, 0.3);
          color: white;
        }
        
        .compliance-item-card {
          padding: 1.5rem;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: all 0.3s ease;
        }
        
        .compliance-item-card:hover {
          border-color: #1a237e;
          box-shadow: 0 4px 12px rgba(26, 35, 126, 0.1);
        }
        
        .item-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        
        .item-type-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }
        
        .item-title-section {
          flex: 1;
        }
        
        .item-meta {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.3rem 0.8rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        .requirement-badge {
          padding: 0.3rem 0.8rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        .item-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #666;
        }
        
        .detail {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .item-actions {
          margin-top: auto;
        }
        
        .action-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .action-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #ddd;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }
        
        .action-btn:hover {
          border-color: #1a237e;
          background: #f8f9fa;
        }
        
        .action-btn.sign {
          background: #1a237e;
          color: white;
          border-color: #1a237e;
        }
        
        .action-btn.upload,
        .action-btn.renew {
          background: #4caf50;
          color: white;
          border-color: #4caf50;
        }
        
        .expiry-count {
          background: #ff9800;
          color: white;
          padding: 0.3rem 0.8rem;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
        }
        
        .expiry-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .expiry-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #fff3e0;
          border-radius: 8px;
          border-left: 4px solid #ff9800;
        }
        
        .expiry-meta {
          display: flex;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #666;
          flex-wrap: wrap;
        }
        
        .days-remaining {
          font-weight: 600;
        }
        
        .days-remaining.urgent {
          color: #f44336;
        }
        
        .days-remaining.warning {
          color: #ff9800;
        }
        
        .audit-log {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 1rem 0;
        }
        
        .log-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .log-item:last-child {
          border-bottom: none;
        }
        
        .log-icon {
          font-size: 1.2rem;
          margin-top: 0.2rem;
        }
        
        .log-content {
          flex: 1;
        }
        
        .log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .log-time {
          font-size: 0.8rem;
          color: #666;
        }
        
        .log-details {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: #666;
        }
        
        .log-description {
          font-size: 0.9rem;
          color: #666;
          padding: 0.5rem;
          background: #f8f9fa;
          border-radius: 6px;
          border-left: 3px solid #1a237e;
        }
        
        .upload-instructions {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .upload-requirements {
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }
        
        .upload-requirements ul {
          margin: 0.5rem 0 0 1.5rem;
          padding: 0;
          color: #666;
        }
        
        .upload-area {
          padding: 2rem;
          border: 2px dashed #ddd;
          border-radius: 12px;
          text-align: center;
          transition: all 0.3s ease;
        }
        
        .upload-area:hover {
          border-color: #1a237e;
          background: #f8f9fa;
        }
        
        .upload-dropzone {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .file-input {
          margin: 1rem 0;
          padding: 0.8rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          width: 100%;
        }
        
        .file-types {
          color: #666;
          font-size: 0.8rem;
        }
        
        .upload-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        @media (max-width: 768px) {
          .compliance-stats {
            grid-template-columns: 1fr;
          }
          
          .filter-buttons {
            flex-direction: column;
          }
          
          .filter-btn {
            justify-content: center;
          }
          
          .expiry-item {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
          
          .upload-meta {
            grid-template-columns: 1fr;
          }
          
          .log-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          
          .log-details {
            flex-direction: column;
            gap: 0.3rem;
          }
        }
      `}</style>
    </ProviderPageTemplate>
  );
};

export default ProviderCompliance;