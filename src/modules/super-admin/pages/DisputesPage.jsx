import React, { useState, useEffect } from 'react';
import './DisputesPage.css';

const DisputesPage = () => {
  const [disputes, setDisputes] = useState([
    {
      id: 1,
      type: 'payment',
      title: 'Commission Dispute',
      description: 'Manager claims commission was not paid for rental transaction',
      parties: ['Tenant: John Doe', 'Manager: Michael Manager'],
      status: 'pending',
      priority: 'high',
      listing: '3-Bedroom Duplex, Lekki',
      amount: 187500,
      createdDate: '2024-01-15',
      lastUpdated: '2 hours ago',
      managerDecision: 'Award commission to manager',
      adminDecision: 'Pending',
      evidence: ['chat_logs.pdf', 'payment_receipt.png'],
      assignedTo: 'Admin: Jane Smith'
    },
    {
      id: 2,
      type: 'chat',
      title: 'Contact Information Leak',
      description: 'Tenant claims landlord shared contact before verification',
      parties: ['Tenant: Lisa Taylor', 'Landlord: Mike Johnson'],
      status: 'resolved',
      priority: 'medium',
      listing: '2-Bedroom Apartment, Ikeja',
      amount: 0,
      createdDate: '2024-01-14',
      lastUpdated: '1 day ago',
      managerDecision: 'Warning to landlord',
      adminDecision: 'Accepted manager decision',
      evidence: ['chat_screenshots.pdf'],
      assignedTo: 'Admin: John Doe'
    },
    {
      id: 3,
      type: 'verification',
      title: 'False Property Verification',
      description: 'Tenant claims property does not match listing description',
      parties: ['Tenant: David Brown', 'Manager: Sarah Manager'],
      status: 'escalated',
      priority: 'critical',
      listing: 'Studio Apartment, Yaba',
      amount: 0,
      createdDate: '2024-01-16',
      lastUpdated: 'Just now',
      managerDecision: 'Property verification valid',
      adminDecision: 'Escalated to Super Admin',
      evidence: ['photos.zip', 'inspection_report.pdf'],
      assignedTo: 'Super Admin'
    },
    {
      id: 4,
      type: 'commission',
      title: 'Wrong Commission Calculation',
      description: 'Estate firm listing charged 7.5% commission',
      parties: ['Estate Firm: Prime Properties', 'System'],
      status: 'pending',
      priority: 'high',
      listing: 'Office Space, Victoria Island',
      amount: 900000,
      createdDate: '2024-01-13',
      lastUpdated: '3 hours ago',
      managerDecision: 'Not applicable',
      adminDecision: 'Pending',
      evidence: ['transaction_log.pdf', 'listing_details.pdf'],
      assignedTo: 'Admin: Mike Johnson'
    },
    {
      id: 5,
      type: 'fraud',
      title: 'Fake Payment Confirmation',
      description: 'Manager confirmed payment that was never made',
      parties: ['Tenant: Robert Chen', 'Manager: David Manager'],
      status: 'investigating',
      priority: 'critical',
      listing: '4-Bedroom House, GRA',
      amount: 15000000,
      createdDate: '2024-01-17',
      lastUpdated: '30 mins ago',
      managerDecision: 'N/A',
      adminDecision: 'Under investigation',
      evidence: ['bank_statement.pdf', 'chat_history.pdf'],
      assignedTo: 'Super Admin'
    }
  ]);

  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [newDecision, setNewDecision] = useState('');

  const disputeTypes = {
    payment: 'Payment Dispute',
    chat: 'Chat Violation',
    verification: 'Verification Issue',
    commission: 'Commission Error',
    fraud: 'Fraud Investigation'
  };

  const priorityColors = {
    critical: 'danger',
    high: 'warning',
    medium: 'info',
    low: 'success'
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'warning';
      case 'resolved': return 'success';
      case 'escalated': return 'danger';
      case 'investigating': return 'info';
      default: return 'default';
    }
  };

  const handleOverrideDecision = (disputeId, newDecision) => {
    if (window.confirm('Are you sure you want to override this decision?')) {
      setDisputes(disputes.map(dispute => 
        dispute.id === disputeId 
          ? { 
              ...dispute, 
              adminDecision: newDecision,
              status: newDecision.toLowerCase().includes('reject') ? 'escalated' : 'resolved',
              lastUpdated: 'Just now'
            }
          : dispute
      ));
      setShowOverrideModal(false);
      setNewDecision('');
    }
  };

  const handleMarkFinal = (disputeId) => {
    const dispute = disputes.find(d => d.id === disputeId);
    if (window.confirm(`Mark dispute #${disputeId} as FINAL? This cannot be changed.`)) {
      setDisputes(disputes.map(d => 
        d.id === disputeId 
          ? { 
              ...d, 
              status: 'resolved',
              adminDecision: 'FINAL DECISION',
              lastUpdated: 'Just now'
            }
          : d
      ));
      setShowFinalModal(false);
      
      // In production, this would trigger dashboard updates
      alert(`Dispute #${disputeId} marked as FINAL. All dashboards will be updated.`);
    }
  };

  const handleFlagUser = (userId, reason) => {
    // In production, this would flag the user in the system
    alert(`User ${userId} flagged for: ${reason}`);
  };

  const filteredDisputes = disputes.filter(dispute => {
    if (filter !== 'all' && dispute.status !== filter) return false;
    if (search && !dispute.title.toLowerCase().includes(search.toLowerCase())) {
      if (!dispute.description.toLowerCase().includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const getStats = () => {
    return {
      total: disputes.length,
      pending: disputes.filter(d => d.status === 'pending').length,
      escalated: disputes.filter(d => d.status === 'escalated').length,
      resolved: disputes.filter(d => d.status === 'resolved').length,
      investigating: disputes.filter(d => d.status === 'investigating').length
    };
  };

  return (
    <div className="disputes-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Disputes & Overrides</h1>
          <p className="page-subtitle">Final arbiter of truth on RentEasy platform</p>
        </div>
        <div className="header-actions">
          <button className="export-btn">
            📋 Export Disputes Log
          </button>
        </div>
      </div>

      {/* Final Authority Warning */}
      <div className="authority-warning">
        <div className="warning-content">
          <span className="warning-icon">⚖️</span>
          <div className="warning-text">
            <strong>Final Arbitration Authority:</strong> You can override any manager or admin decision. 
            Your decisions are FINAL and will update all dashboards automatically.
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="disputes-stats">
        <div className="stat-card total">
          <div className="stat-value">{getStats().total}</div>
          <div className="stat-label">Total Disputes</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-value">{getStats().pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card escalated">
          <div className="stat-value">{getStats().escalated}</div>
          <div className="stat-label">Escalated</div>
        </div>
        <div className="stat-card resolved">
          <div className="stat-value">{getStats().resolved}</div>
          <div className="stat-label">Resolved</div>
        </div>
        <div className="stat-card investigating">
          <div className="stat-value">{getStats().investigating}</div>
          <div className="stat-label">Investigating</div>
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
              <option value="all">All Disputes</option>
              <option value="pending">Pending</option>
              <option value="escalated">Escalated</option>
              <option value="resolved">Resolved</option>
              <option value="investigating">Investigating</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Filter by Type</label>
            <select className="filter-select">
              <option value="all">All Types</option>
              <option value="payment">Payment Disputes</option>
              <option value="chat">Chat Violations</option>
              <option value="verification">Verification Issues</option>
              <option value="commission">Commission Errors</option>
              <option value="fraud">Fraud Investigations</option>
            </select>
          </div>
        </div>
        <div className="controls-right">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search disputes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>
      </div>

      {/* Disputes Grid */}
      <div className="disputes-grid">
        {filteredDisputes.map(dispute => (
          <div key={dispute.id} className="dispute-card">
            <div className="dispute-header">
              <div className="dispute-title-section">
                <h3 className="dispute-title">{dispute.title}</h3>
                <div className="dispute-meta">
                  <span className={`priority-badge ${priorityColors[dispute.priority]}`}>
                    {dispute.priority.toUpperCase()}
                  </span>
                  <span className="dispute-type">{disputeTypes[dispute.type]}</span>
                  <span className="dispute-id">#{dispute.id}</span>
                </div>
              </div>
              <div className="dispute-status">
                <span className={`status-badge ${getStatusColor(dispute.status)}`}>
                  {dispute.status.toUpperCase()}
                </span>
                <span className="last-updated">{dispute.lastUpdated}</span>
              </div>
            </div>

            <div className="dispute-body">
              <div className="dispute-description">
                {dispute.description}
              </div>
              
              <div className="dispute-details">
                <div className="detail-row">
                  <span className="detail-label">Parties:</span>
                  <span className="detail-value">
                    {dispute.parties.map((party, index) => (
                      <span key={index} className="party-tag">{party}</span>
                    ))}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Listing:</span>
                  <span className="detail-value">{dispute.listing}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Amount:</span>
                  <span className="detail-value">
                    {dispute.amount > 0 ? `₦${dispute.amount.toLocaleString()}` : 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Created:</span>
                  <span className="detail-value">{dispute.createdDate}</span>
                </div>
              </div>

              <div className="decisions-section">
                <div className="decision-box">
                  <div className="decision-label">Manager Decision</div>
                  <div className="decision-content">{dispute.managerDecision}</div>
                </div>
                <div className="decision-box">
                  <div className="decision-label">Admin Decision</div>
                  <div className="decision-content">{dispute.adminDecision}</div>
                </div>
              </div>

              <div className="evidence-section">
                <div className="evidence-label">Evidence:</div>
                <div className="evidence-list">
                  {dispute.evidence.map((file, index) => (
                    <span key={index} className="evidence-tag">
                      📎 {file}
                    </span>
                  ))}
                </div>
              </div>

              <div className="dispute-actions">
                <button 
                  className="action-btn view"
                  onClick={() => setSelectedDispute(dispute)}
                >
                  View Details
                </button>
                <button 
                  className="action-btn override"
                  onClick={() => {
                    setSelectedDispute(dispute);
                    setShowOverrideModal(true);
                  }}
                >
                  Override Decision
                </button>
                <button 
                  className="action-btn final"
                  onClick={() => {
                    setSelectedDispute(dispute);
                    setShowFinalModal(true);
                  }}
                  disabled={dispute.status === 'resolved'}
                >
                  Mark as Final
                </button>
                <button 
                  className="action-btn flag"
                  onClick={() => handleFlagUser(dispute.parties[0].split(':')[1].trim(), dispute.title)}
                >
                  Flag User
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dispute Details Modal */}
      {selectedDispute && !showOverrideModal && !showFinalModal && (
        <div className="modal-overlay">
          <div className="modal large">
            <div className="modal-header">
              <h3>Dispute Details: {selectedDispute.title}</h3>
              <button 
                className="close-modal"
                onClick={() => setSelectedDispute(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="dispute-details-modal">
                <div className="details-section">
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Dispute ID:</span>
                      <span className="detail-value">#{selectedDispute.id}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Type:</span>
                      <span className="detail-value">{disputeTypes[selectedDispute.type]}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Status:</span>
                      <span className={`status-badge ${getStatusColor(selectedDispute.status)}`}>
                        {selectedDispute.status}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Priority:</span>
                      <span className={`priority-badge ${priorityColors[selectedDispute.priority]}`}>
                        {selectedDispute.priority}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Created:</span>
                      <span className="detail-value">{selectedDispute.createdDate}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Last Updated:</span>
                      <span className="detail-value">{selectedDispute.lastUpdated}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Assigned To:</span>
                      <span className="detail-value">{selectedDispute.assignedTo}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Amount Involved:</span>
                      <span className="detail-value">
                        {selectedDispute.amount > 0 ? `₦${selectedDispute.amount.toLocaleString()}` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h4>Description</h4>
                  <div className="description-box">
                    {selectedDispute.description}
                  </div>
                </div>

                <div className="details-section">
                  <h4>Parties Involved</h4>
                  <div className="parties-list">
                    {selectedDispute.parties.map((party, index) => (
                      <div key={index} className="party-item">
                        <div className="party-role">{party.split(':')[0]}</div>
                        <div className="party-name">{party.split(':')[1]}</div>
                        <button className="view-profile-btn">View Profile</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="details-section">
                  <h4>Listing Information</h4>
                  <div className="listing-info">
                    <strong>{selectedDispute.listing}</strong>
                    <button className="jump-to-listing">Jump to Listing</button>
                  </div>
                </div>

                <div className="details-section">
                  <h4>Decision History</h4>
                  <div className="decision-history">
                    <div className="decision-item">
                      <div className="decision-source">Manager</div>
                      <div className="decision-text">{selectedDispute.managerDecision}</div>
                      <div className="decision-time">{selectedDispute.createdDate}</div>
                    </div>
                    {selectedDispute.adminDecision !== 'Pending' && (
                      <div className="decision-item">
                        <div className="decision-source">Admin</div>
                        <div className="decision-text">{selectedDispute.adminDecision}</div>
                        <div className="decision-time">{selectedDispute.lastUpdated}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="details-section">
                  <h4>Evidence Files</h4>
                  <div className="evidence-grid">
                    {selectedDispute.evidence.map((file, index) => (
                      <div key={index} className="evidence-item">
                        <div className="file-icon">📎</div>
                        <div className="file-name">{file}</div>
                        <button className="download-btn">Download</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setSelectedDispute(null)}
              >
                Close
              </button>
              <button 
                className="btn-primary"
                onClick={() => {
                  setSelectedDispute(null);
                  setShowOverrideModal(true);
                }}
              >
                Override Decision
              </button>
              <button 
                className="btn-primary danger"
                onClick={() => handleMarkFinal(selectedDispute.id)}
                disabled={selectedDispute.status === 'resolved'}
              >
                Mark as Final
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Override Decision Modal */}
      {showOverrideModal && selectedDispute && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header warning">
              <h3>Override Decision</h3>
              <button 
                className="close-modal"
                onClick={() => setShowOverrideModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="override-warning">
                <span className="warning-icon">⚡</span>
                <p>
                  You are overriding decisions for <strong>Dispute #{selectedDispute.id}</strong>.
                  Your decision will be final and cannot be changed by managers or admins.
                </p>
              </div>
              
              <div className="current-decisions">
                <div className="current-decision">
                  <label>Manager Decision:</label>
                  <div className="decision-text">{selectedDispute.managerDecision}</div>
                </div>
                <div className="current-decision">
                  <label>Admin Decision:</label>
                  <div className="decision-text">{selectedDispute.adminDecision}</div>
                </div>
              </div>

              <div className="form-group">
                <label>Your Final Decision *</label>
                <textarea
                  value={newDecision}
                  onChange={(e) => setNewDecision(e.target.value)}
                  className="decision-input"
                  placeholder="Enter your final decision here..."
                  rows="4"
                />
              </div>

              <div className="decision-options">
                <h5>Quick Options:</h5>
                <div className="option-buttons">
                  <button 
                    className="option-btn"
                    onClick={() => setNewDecision('Approve manager decision')}
                  >
                    Approve Manager
                  </button>
                  <button 
                    className="option-btn"
                    onClick={() => setNewDecision('Reject manager decision, escalate for review')}
                  >
                    Reject Manager
                  </button>
                  <button 
                    className="option-btn"
                    onClick={() => setNewDecision('Award payment to affected party')}
                  >
                    Award Payment
                  </button>
                  <button 
                    className="option-btn danger"
                    onClick={() => setNewDecision('Flag all parties for review')}
                  >
                    Flag Parties
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowOverrideModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={() => handleOverrideDecision(selectedDispute.id, newDecision)}
                disabled={!newDecision.trim()}
              >
                Apply Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Final Modal */}
      {showFinalModal && selectedDispute && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header danger">
              <h3>Mark Dispute as FINAL</h3>
              <button 
                className="close-modal"
                onClick={() => setShowFinalModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="final-warning">
                <span className="warning-icon">🚨</span>
                <div className="warning-content">
                  <h4>CRITICAL ACTION: Final Arbitration</h4>
                  <p>
                    You are about to mark <strong>Dispute #{selectedDispute.id}</strong> as FINAL.
                    This action will:
                  </p>
                  <ul className="final-impacts">
                    <li>✅ Close the dispute permanently</li>
                    <li>✅ Update all user dashboards</li>
                    <li>✅ Process any financial adjustments</li>
                    <li>✅ Notify all parties involved</li>
                    <li>❌ Cannot be undone by anyone</li>
                  </ul>
                  <div className="final-details">
                    <p><strong>Dispute:</strong> {selectedDispute.title}</p>
                    <p><strong>Parties:</strong> {selectedDispute.parties.join(', ')}</p>
                    <p><strong>Amount:</strong> {selectedDispute.amount > 0 ? `₦${selectedDispute.amount.toLocaleString()}` : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowFinalModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary danger"
                onClick={() => handleMarkFinal(selectedDispute.id)}
              >
                Mark as FINAL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisputesPage;