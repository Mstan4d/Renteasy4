// src/modules/super-admin/pages/DisputesPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './DisputesPage.css';

const DisputesPage = () => {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [newDecision, setNewDecision] = useState('');

  // Fetch disputes on mount
  useEffect(() => {
    fetchDisputes();
  }, []);

  // Real‑time subscription
  useEffect(() => {
    const channel = supabase
      .channel('disputes-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'disputes'
      }, () => {
        fetchDisputes();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('disputes')
        .select(`
          *,
          listing:listing_id (id, title, address),
          raiser:raised_by (id, full_name, email),
          resolver:resolved_by (id, full_name, email),
          assignee:assigned_to (id, full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDisputes(data || []);
    } catch (error) {
      console.error('Error fetching disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOverrideDecision = async (disputeId, newDecision) => {
    if (!window.confirm('Are you sure you want to override this decision?')) return;

    try {
      const { error } = await supabase
        .from('disputes')
        .update({
          admin_decision: newDecision,
          status: newDecision.toLowerCase().includes('reject') ? 'escalated' : 'resolved',
          updated_at: new Date().toISOString()
        })
        .eq('id', disputeId);

      if (error) throw error;
      await fetchDisputes();
      setShowOverrideModal(false);
      setNewDecision('');
      alert('Decision overridden!');
    } catch (error) {
      console.error('Error overriding decision:', error);
      alert('Failed to override.');
    }
  };

  const handleMarkFinal = async (disputeId) => {
    if (!window.confirm(`Mark dispute #${disputeId.slice(0,8)} as FINAL? This cannot be changed.`)) return;

    try {
      const { error } = await supabase
        .from('disputes')
        .update({
          status: 'resolved',
          final_decision: disputes.find(d => d.id === disputeId)?.admin_decision || 'FINAL DECISION',
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id
        })
        .eq('id', disputeId);

      if (error) throw error;
      await fetchDisputes();
      setShowFinalModal(false);
      alert(`Dispute marked as FINAL.`);
    } catch (error) {
      console.error('Error marking final:', error);
      alert('Failed to mark final.');
    }
  };

  // Helper to format parties from chat or stored parties JSON
  const getPartiesList = (dispute) => {
    if (dispute.parties && dispute.parties.length) {
      return dispute.parties.map(p => `${p.role}: ${p.name}`);
    }
    // Fallback to raiser only
    return [dispute.raiser ? `Raised by: ${dispute.raiser.full_name}` : 'Unknown'];
  };

  // Map types for display (could be stored in a `type` column)
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

  const filteredDisputes = disputes.filter(dispute => {
    if (filter !== 'all' && dispute.status !== filter) return false;
    if (search) {
      const term = search.toLowerCase();
      return (
        (dispute.title?.toLowerCase() || '').includes(term) ||
        (dispute.description?.toLowerCase() || '').includes(term) ||
        (dispute.reason?.toLowerCase() || '').includes(term) ||
        JSON.stringify(dispute.parties).toLowerCase().includes(term)
      );
    }
    return true;
  });

  const getStats = () => ({
    total: disputes.length,
    pending: disputes.filter(d => d.status === 'pending').length,
    escalated: disputes.filter(d => d.status === 'escalated').length,
    resolved: disputes.filter(d => d.status === 'resolved').length,
    investigating: disputes.filter(d => d.status === 'investigating').length
  });

  if (loading) {
    return <div className="loading">Loading disputes...</div>;
  }

  return (
    <div className="disputes-page">
      {/* Header (unchanged) */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Disputes & Overrides</h1>
          <p className="page-subtitle">Final arbiter of truth on RentEasy platform</p>
        </div>
        <div className="header-actions">
          <button className="export-btn" onClick={() => alert('Export coming soon')}>
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
            <select className="filter-select" onChange={(e) => {}}>
              <option value="all">All Types</option>
              {Object.entries(disputeTypes).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
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
        {filteredDisputes.length === 0 ? (
          <div className="empty-state">No disputes found.</div>
        ) : (
          filteredDisputes.map(dispute => {
            const parties = getPartiesList(dispute);
            const managerDecision = dispute.manager_decision || 'Not applicable';
            const adminDecision = dispute.admin_decision || 'Pending';
            const evidence = dispute.evidence || [];

            return (
              <div key={dispute.id} className="dispute-card">
                <div className="dispute-header">
                  <div className="dispute-title-section">
                    <h3 className="dispute-title">{dispute.title || dispute.reason || 'Dispute'}</h3>
                    <div className="dispute-meta">
                      <span className={`priority-badge ${priorityColors[dispute.priority]}`}>
                        {dispute.priority?.toUpperCase() || 'MEDIUM'}
                      </span>
                      <span className="dispute-type">{disputeTypes[dispute.type] || 'General'}</span>
                      <span className="dispute-id">#{dispute.id.slice(0,8)}</span>
                    </div>
                  </div>
                  <div className="dispute-status">
                    <span className={`status-badge ${getStatusColor(dispute.status)}`}>
                      {dispute.status?.toUpperCase()}
                    </span>
                    <span className="last-updated">
                      {new Date(dispute.updated_at || dispute.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="dispute-body">
                  <div className="dispute-description">{dispute.description || dispute.reason || ''}</div>

                  <div className="dispute-details">
                    <div className="detail-row">
                      <span className="detail-label">Parties:</span>
                      <span className="detail-value">
                        {parties.map((party, idx) => (
                          <span key={idx} className="party-tag">{party}</span>
                        ))}
                      </span>
                    </div>
                    {dispute.listing && (
                      <div className="detail-row">
                        <span className="detail-label">Listing:</span>
                        <span className="detail-value">{dispute.listing.title}</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="detail-label">Amount:</span>
                      <span className="detail-value">
                        {dispute.amount > 0 ? `₦${dispute.amount.toLocaleString()}` : 'N/A'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Created:</span>
                      <span className="detail-value">{new Date(dispute.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="decisions-section">
                    <div className="decision-box">
                      <div className="decision-label">Manager Decision</div>
                      <div className="decision-content">{managerDecision}</div>
                    </div>
                    <div className="decision-box">
                      <div className="decision-label">Admin Decision</div>
                      <div className="decision-content">{adminDecision}</div>
                    </div>
                  </div>

                  <div className="evidence-section">
                    <div className="evidence-label">Evidence:</div>
                    <div className="evidence-list">
                      {evidence.map((file, idx) => (
                        <span key={idx} className="evidence-tag">📎 {file}</span>
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
                      onClick={() => alert(`Flag user – coming soon`)}
                    >
                      Flag User
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
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

      {/* Override Modal */}
      {showOverrideModal && selectedDispute && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header warning">
              <h3>Override Decision</h3>
              <button className="close-modal" onClick={() => setShowOverrideModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="override-warning">
                <span className="warning-icon">⚡</span>
                <p>
                  You are overriding decisions for <strong>Dispute #{selectedDispute.id.slice(0,8)}</strong>.
                  Your decision will be final and cannot be changed by managers or admins.
                </p>
              </div>
              <div className="current-decisions">
                <div className="current-decision">
                  <label>Manager Decision:</label>
                  <div className="decision-text">{selectedDispute.manager_decision || 'None'}</div>
                </div>
                <div className="current-decision">
                  <label>Admin Decision:</label>
                  <div className="decision-text">{selectedDispute.admin_decision || 'Pending'}</div>
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
                  <button className="option-btn" onClick={() => setNewDecision('Approve manager decision')}>
                    Approve Manager
                  </button>
                  <button className="option-btn" onClick={() => setNewDecision('Reject manager decision, escalate for review')}>
                    Reject Manager
                  </button>
                  <button className="option-btn" onClick={() => setNewDecision('Award payment to affected party')}>
                    Award Payment
                  </button>
                  <button className="option-btn danger" onClick={() => setNewDecision('Flag all parties for review')}>
                    Flag Parties
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowOverrideModal(false)}>Cancel</button>
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

      {/* Final Modal */}
      {showFinalModal && selectedDispute && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header danger">
              <h3>Mark Dispute as FINAL</h3>
              <button className="close-modal" onClick={() => setShowFinalModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="final-warning">
                <span className="warning-icon">🚨</span>
                <div className="warning-content">
                  <h4>CRITICAL ACTION: Final Arbitration</h4>
                  <p>
                    You are about to mark <strong>Dispute #{selectedDispute.id.slice(0,8)}</strong> as FINAL.
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
                    <p><strong>Dispute:</strong> {selectedDispute.title || selectedDispute.reason}</p>
                    <p><strong>Parties:</strong> {getPartiesList(selectedDispute).join(', ')}</p>
                    <p><strong>Amount:</strong> {selectedDispute.amount > 0 ? `₦${selectedDispute.amount.toLocaleString()}` : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowFinalModal(false)}>Cancel</button>
              <button className="btn-primary danger" onClick={() => handleMarkFinal(selectedDispute.id)}>
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