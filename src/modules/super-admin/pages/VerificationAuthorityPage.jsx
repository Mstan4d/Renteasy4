import React, { useState, useEffect } from 'react';
import './VerificationAuthorityPage.css';

const VerificationAuthorityPage = () => {
  const [verifications, setVerifications] = useState([
    {
      id: 1,
      property: '3-Bedroom Duplex, Lekki Phase 1',
      type: 'property',
      submittedBy: 'Michael Manager',
      submittedDate: '2024-01-15',
      status: 'pending_acknowledgement',
      manager: 'Michael Manager',
      verificationDate: '2024-01-15',
      evidence: ['photos.jpg', 'inspection_report.pdf'],
      adminAction: null,
      adminNotes: '',
      badgeStatus: 'unverified'
    },
    {
      id: 2,
      property: '2-Bedroom Apartment, Ikeja',
      type: 'property',
      submittedBy: 'Sarah Manager',
      submittedDate: '2024-01-16',
      status: 'acknowledged',
      manager: 'Sarah Manager',
      verificationDate: '2024-01-16',
      evidence: ['photos.zip', 'video.mp4'],
      adminAction: 'acknowledged',
      adminNotes: 'Verification looks good',
      badgeStatus: 'verified'
    },
    {
      id: 3,
      property: 'Estate Firm: Prime Properties',
      type: 'estate_firm',
      submittedBy: 'System',
      submittedDate: '2024-01-14',
      status: 'suspended',
      manager: 'Not Applicable',
      verificationDate: '2024-01-14',
      evidence: ['registration_cert.pdf', 'kyc_docs.pdf'],
      adminAction: 'suspended',
      adminNotes: 'Documents expired',
      badgeStatus: 'suspended'
    },
    {
      id: 4,
      property: 'Studio Apartment, Yaba',
      type: 'property',
      submittedBy: 'John Manager',
      submittedDate: '2024-01-17',
      status: 'pending_acknowledgement',
      manager: 'John Manager',
      verificationDate: '2024-01-17',
      evidence: ['photos.png'],
      adminAction: null,
      adminNotes: '',
      badgeStatus: 'unverified'
    },
    {
      id: 5,
      property: 'Office Space, Victoria Island',
      type: 'property',
      submittedBy: 'David Manager',
      submittedDate: '2024-01-13',
      status: 'rejected',
      manager: 'David Manager',
      verificationDate: '2024-01-13',
      evidence: ['photos.jpg', 'location_proof.pdf'],
      adminAction: 'rejected',
      adminNotes: 'False verification, property does not exist',
      badgeStatus: 'suspended'
    },
    {
      id: 6,
      property: '5-Bedroom Mansion, Banana Island',
      type: 'property',
      submittedBy: 'Jessica Manager',
      submittedDate: '2024-01-18',
      status: 'force_verified',
      manager: 'Jessica Manager',
      verificationDate: '2024-01-18',
      evidence: ['photos.jpg'],
      adminAction: 'force_verified',
      adminNotes: 'Verified by Super Admin',
      badgeStatus: 'verified'
    }
  ]);

  const [selectedVerification, setSelectedVerification] = useState(null);
  const [showForceModal, setShowForceModal] = useState(false);
  const [showReverseModal, setShowReverseModal] = useState(false);
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const verificationFlow = [
    '1. Listings go live immediately (Unverified)',
    '2. Manager finds and verifies property',
    '3. Manager gets auto-assigned as manager',
    '4. Property becomes verified',
    '5. Admin only ACKNOWLEDGES verification',
    '6. Badge changes only after admin acknowledgment'
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending_acknowledgement': return 'warning';
      case 'acknowledged': return 'success';
      case 'suspended': return 'danger';
      case 'rejected': return 'danger';
      case 'force_verified': return 'info';
      default: return 'default';
    }
  };

  const getBadgeStatus = (badgeStatus) => {
    switch(badgeStatus) {
      case 'verified': return 'success';
      case 'unverified': return 'warning';
      case 'suspended': return 'danger';
      default: return 'default';
    }
  };

  const handleAdminAction = (verificationId, action, notes = '') => {
    const updatedVerifications = verifications.map(v => {
      if (v.id === verificationId) {
        return {
          ...v,
          status: action === 'acknowledge' ? 'acknowledged' : 
                  action === 'reject' ? 'rejected' : 
                  action === 'force_verify' ? 'force_verified' : v.status,
          adminAction: action,
          adminNotes: notes,
          badgeStatus: action === 'acknowledge' || action === 'force_verify' ? 'verified' : 
                      action === 'reject' ? 'suspended' : v.badgeStatus
        };
      }
      return v;
    });

    setVerifications(updatedVerifications);
    setSelectedVerification(null);
    setShowForceModal(false);
    setShowReverseModal(false);
  };

  const handlePenalizeManager = (managerName, reason, penaltyType) => {
    // In production, this would penalize the manager
    alert(`Penalty applied to ${managerName}: ${penaltyType} - ${reason}`);
    setShowPenaltyModal(false);
  };

  const handleReverseVerification = (verificationId) => {
    const updatedVerifications = verifications.map(v => {
      if (v.id === verificationId) {
        return {
          ...v,
          status: 'rejected',
          adminAction: 'reversed',
          adminNotes: 'Verification reversed by Super Admin',
          badgeStatus: 'suspended'
        };
      }
      return v;
    });

    setVerifications(updatedVerifications);
    setShowReverseModal(false);
  };

  const filteredVerifications = verifications.filter(verification => {
    if (filter !== 'all' && verification.status !== filter) return false;
    if (search && !verification.property.toLowerCase().includes(search.toLowerCase())) {
      if (!verification.submittedBy.toLowerCase().includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const getStats = () => {
    return {
      total: verifications.length,
      pending: verifications.filter(v => v.status === 'pending_acknowledgement').length,
      acknowledged: verifications.filter(v => v.status === 'acknowledged').length,
      force_verified: verifications.filter(v => v.status === 'force_verified').length,
      rejected: verifications.filter(v => v.status === 'rejected').length,
      suspended: verifications.filter(v => v.status === 'suspended').length
    };
  };

  return (
    <div className="verification-authority">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Verification Authority</h1>
          <p className="page-subtitle">Control property and user verifications</p>
        </div>
        <div className="header-actions">
          <button className="export-btn">
            📋 Export Verification Log
          </button>
        </div>
      </div>

      {/* Important Clarification */}
      <div className="clarification-box">
        <div className="clarification-header">
          <span className="info-icon">ℹ️</span>
          <h3>Verification Workflow (Critical Rules)</h3>
        </div>
        <div className="clarification-list">
          {verificationFlow.map((step, index) => (
            <div key={index} className="step-item">
              <span className="step-number">{index + 1}</span>
              <span className="step-text">{step}</span>
            </div>
          ))}
        </div>
        <div className="clarification-note">
          <strong>Super Admin Exclusive:</strong> Can force verification, reverse verification, flag fake verifications, penalize managers for false verification
        </div>
      </div>

      {/* Statistics */}
      <div className="verification-stats">
        <div className="stat-card total">
          <div className="stat-value">{getStats().total}</div>
          <div className="stat-label">Total Verifications</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-value">{getStats().pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card acknowledged">
          <div className="stat-value">{getStats().acknowledged}</div>
          <div className="stat-label">Acknowledged</div>
        </div>
        <div className="stat-card force">
          <div className="stat-value">{getStats().force_verified}</div>
          <div className="stat-label">Force Verified</div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-value">{getStats().rejected}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-bar">
        <div className="controls-left">
          <div className="filter-group">
            <label>Filter by Status</label>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Verifications</option>
              <option value="pending_acknowledgement">Pending Acknowledgement</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="force_verified">Force Verified</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
        <div className="controls-right">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search properties or managers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>
      </div>

      {/* Verifications Table */}
      <div className="verifications-table-container">
        <table className="verifications-table">
          <thead>
            <tr>
              <th>Verification Details</th>
              <th>Manager</th>
              <th>Status</th>
              <th>Badge</th>
              <th>Admin Action</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVerifications.map(verification => (
              <tr key={verification.id} className={verification.status}>
                <td>
                  <div className="verification-details">
                    <div className="property-name">{verification.property}</div>
                    <div className="verification-meta">
                      <span className="meta-item">
                        <span className="meta-label">Type:</span> 
                        <span className="meta-value">{verification.type === 'property' ? 'Property' : 'Estate Firm'}</span>
                      </span>
                      <span className="meta-item">
                        <span className="meta-label">Submitted:</span> 
                        <span className="meta-value">{verification.submittedDate} by {verification.submittedBy}</span>
                      </span>
                      <span className="meta-item">
                        <span className="meta-label">Verified:</span> 
                        <span className="meta-value">{verification.verificationDate}</span>
                      </span>
                    </div>
                    {verification.evidence.length > 0 && (
                      <div className="evidence-preview">
                        <span className="evidence-count">
                          📎 {verification.evidence.length} evidence files
                        </span>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="manager-cell">
                    <span className="manager-name">{verification.manager}</span>
                    {verification.type === 'property' && (
                      <span className="manager-role">Property Manager</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${getStatusColor(verification.status)}`}>
                    {verification.status.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td>
                  <span className={`badge-status ${getBadgeStatus(verification.badgeStatus)}`}>
                    {verification.badgeStatus.toUpperCase()}
                  </span>
                </td>
                <td>
                  <div className="admin-action-cell">
                    {verification.adminAction ? (
                      <>
                        <span className="action-text">{verification.adminAction}</span>
                        {verification.adminNotes && (
                          <span className="action-notes" title={verification.adminNotes}>
                            📝
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="action-pending">Pending</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="action-btn view"
                      onClick={() => setSelectedVerification(verification)}
                      title="View Details"
                    >
                      👁️
                    </button>
                    {verification.status === 'pending_acknowledgement' && (
                      <button 
                        className="action-btn acknowledge"
                        onClick={() => handleAdminAction(verification.id, 'acknowledge', 'Acknowledged by Super Admin')}
                        title="Acknowledge Verification"
                      >
                        ✅
                      </button>
                    )}
                    <button 
                      className="action-btn force"
                      onClick={() => {
                        setSelectedVerification(verification);
                        setShowForceModal(true);
                      }}
                      title="Force Verify"
                    >
                      ⚡
                    </button>
                    <button 
                      className="action-btn reverse"
                      onClick={() => {
                        setSelectedVerification(verification);
                        setShowReverseModal(true);
                      }}
                      title="Reverse Verification"
                      disabled={verification.status === 'pending_acknowledgement'}
                    >
                      ↩️
                    </button>
                    <button 
                      className="action-btn penalty"
                      onClick={() => {
                        setSelectedVerification(verification);
                        setShowPenaltyModal(true);
                      }}
                      title="Penalize Manager"
                      disabled={verification.type === 'estate_firm'}
                    >
                      ⚖️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Verification Details Modal */}
      {selectedVerification && !showForceModal && !showReverseModal && !showPenaltyModal && (
        <div className="modal-overlay">
          <div className="modal large">
            <div className="modal-header">
              <h3>Verification Details</h3>
              <button 
                className="close-modal"
                onClick={() => setSelectedVerification(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="verification-details-modal">
                <div className="details-section">
                  <h4>Verification Information</h4>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Property/Firm:</span>
                      <span className="detail-value">{selectedVerification.property}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Type:</span>
                      <span className="detail-value">
                        {selectedVerification.type === 'property' ? 'Property Verification' : 'Estate Firm Verification'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Status:</span>
                      <span className={`status-badge ${getStatusColor(selectedVerification.status)}`}>
                        {selectedVerification.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Badge Status:</span>
                      <span className={`badge-status ${getBadgeStatus(selectedVerification.badgeStatus)}`}>
                        {selectedVerification.badgeStatus}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Submitted By:</span>
                      <span className="detail-value">{selectedVerification.submittedBy}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Submitted Date:</span>
                      <span className="detail-value">{selectedVerification.submittedDate}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Verification Date:</span>
                      <span className="detail-value">{selectedVerification.verificationDate}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Manager:</span>
                      <span className="detail-value">{selectedVerification.manager}</span>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h4>Admin Actions & Notes</h4>
                  <div className="admin-actions-box">
                    <div className="action-history">
                      <div className="action-item">
                        <div className="action-label">Current Action:</div>
                        <div className="action-value">
                          {selectedVerification.adminAction || 'No action taken'}
                        </div>
                      </div>
                      {selectedVerification.adminNotes && (
                        <div className="action-item">
                          <div className="action-label">Notes:</div>
                          <div className="action-value notes">
                            {selectedVerification.adminNotes}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h4>Evidence Files</h4>
                  <div className="evidence-list">
                    {selectedVerification.evidence.map((file, index) => (
                      <div key={index} className="evidence-item">
                        <div className="file-info">
                          <span className="file-icon">📎</span>
                          <span className="file-name">{file}</span>
                        </div>
                        <div className="file-actions">
                          <button className="preview-btn">Preview</button>
                          <button className="download-btn">Download</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="details-section">
                  <h4>Take Action</h4>
                  <div className="action-buttons-grid">
                    {selectedVerification.status === 'pending_acknowledgement' && (
                      <button 
                        className="action-btn acknowledge"
                        onClick={() => handleAdminAction(selectedVerification.id, 'acknowledge', 'Acknowledged after review')}
                      >
                        ✅ Acknowledge Verification
                      </button>
                    )}
                    <button 
                      className="action-btn force"
                      onClick={() => {
                        setSelectedVerification(null);
                        setShowForceModal(true);
                      }}
                    >
                      ⚡ Force Verify
                    </button>
                    <button 
                      className="action-btn reverse"
                      onClick={() => {
                        setSelectedVerification(null);
                        setShowReverseModal(true);
                      }}
                      disabled={selectedVerification.status === 'pending_acknowledgement'}
                    >
                      ↩️ Reverse Verification
                    </button>
                    <button 
                      className="action-btn reject"
                      onClick={() => handleAdminAction(selectedVerification.id, 'reject', 'Rejected after review')}
                    >
                      ❌ Reject Verification
                    </button>
                    <button 
                      className="action-btn penalty"
                      onClick={() => {
                        setSelectedVerification(null);
                        setShowPenaltyModal(true);
                      }}
                      disabled={selectedVerification.type === 'estate_firm'}
                    >
                      ⚖️ Penalize Manager
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setSelectedVerification(null)}
              >
                Close
              </button>
              <button 
                className="btn-primary"
                onClick={() => {
                  // Jump to property
                  setSelectedVerification(null);
                }}
              >
                Jump to Property
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Force Verify Modal */}
      {showForceModal && selectedVerification && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header warning">
              <h3>Force Verification</h3>
              <button 
                className="close-modal"
                onClick={() => setShowForceModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="force-warning">
                <span className="warning-icon">⚡</span>
                <div className="warning-content">
                  <h4>Super Admin Force Verification</h4>
                  <p>
                    You are force verifying <strong>{selectedVerification.property}</strong>.
                    This bypasses normal verification flow and will:
                  </p>
                  <ul className="force-impacts">
                    <li>✅ Immediately mark property as verified</li>
                    <li>✅ Assign manager {selectedVerification.manager} permanently</li>
                    <li>✅ Update property badge to "Verified"</li>
                    <li>✅ Bypass admin acknowledgment requirement</li>
                    <li>⚠️ This action is logged and irreversible</li>
                  </ul>
                </div>
              </div>
              <div className="form-group">
                <label>Reason for Force Verification *</label>
                <textarea 
                  className="reason-input"
                  placeholder="Explain why force verification is necessary..."
                  rows="3"
                  defaultValue="Force verified by Super Admin"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowForceModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={() => handleAdminAction(selectedVerification.id, 'force_verify', 'Force verified by Super Admin')}
              >
                Force Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reverse Verification Modal */}
      {showReverseModal && selectedVerification && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header danger">
              <h3>Reverse Verification</h3>
              <button 
                className="close-modal"
                onClick={() => setShowReverseModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="reverse-warning">
                <span className="warning-icon">⚠️</span>
                <div className="warning-content">
                  <h4>Reverse Verification Action</h4>
                  <p>
                    You are reversing verification for <strong>{selectedVerification.property}</strong>.
                    This will:
                  </p>
                  <ul className="reverse-impacts">
                    <li>❌ Mark property as unverified</li>
                    <li>❌ Remove manager assignment</li>
                    <li>❌ Change badge to "Suspended"</li>
                    <li>❌ Notify all involved parties</li>
                    <li>⚠️ May require manual cleanup</li>
                  </ul>
                  <div className="current-status">
                    <p><strong>Current Status:</strong> {selectedVerification.status}</p>
                    <p><strong>Current Badge:</strong> {selectedVerification.badgeStatus}</p>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Reason for Reversal *</label>
                <textarea 
                  className="reason-input"
                  placeholder="Explain why verification is being reversed..."
                  rows="3"
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowReverseModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary danger"
                onClick={() => handleReverseVerification(selectedVerification.id)}
              >
                Reverse Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Penalize Manager Modal */}
      {showPenaltyModal && selectedVerification && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header danger">
              <h3>Penalize Manager</h3>
              <button 
                className="close-modal"
                onClick={() => setShowPenaltyModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="penalty-warning">
                <span className="warning-icon">⚖️</span>
                <div className="warning-content">
                  <h4>Manager Penalty</h4>
                  <p>
                    You are penalizing <strong>{selectedVerification.manager}</strong> for 
                    verification of <strong>{selectedVerification.property}</strong>.
                  </p>
                </div>
              </div>
              <div className="form-group">
                <label>Select Penalty Type</label>
                <select className="penalty-select">
                  <option value="warning">Warning</option>
                  <option value="commission_deduction">Commission Deduction</option>
                  <option value="suspension">Temporary Suspension</option>
                  <option value="downgrade">Rating Downgrade</option>
                  <option value="training">Require Training</option>
                </select>
              </div>
              <div className="form-group">
                <label>Penalty Reason *</label>
                <textarea 
                  className="reason-input"
                  placeholder="Explain the reason for the penalty..."
                  rows="3"
                  required
                />
              </div>
              <div className="form-group">
                <label>Penalty Duration (if applicable)</label>
                <div className="duration-select">
                  <select className="duration-input">
                    <option value="0">Immediate</option>
                    <option value="7">7 days</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="permanent">Permanent</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowPenaltyModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary danger"
                onClick={() => handlePenalizeManager(
                  selectedVerification.manager,
                  'False property verification',
                  'commission_deduction'
                )}
              >
                Apply Penalty
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationAuthorityPage;