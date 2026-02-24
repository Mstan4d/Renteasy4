// src/modules/providers/pages/ProviderCompliance.jsx
import React, { useState, useEffect } from 'react';
import ProviderPageTemplate from '../templates/ProviderPageTemplate';
import {
  FaGavel, FaFileContract, FaShieldAlt, FaClipboardCheck,
  FaExclamationTriangle, FaCalendarCheck, FaDownload,
  FaClock, FaCheckCircle, FaTimesCircle, FaFileSignature,
  FaBalanceScale, FaUserLock, FaHistory, FaBell,
  FaSpinner
} from 'react-icons/fa';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import AgreementSignModal from '../components/AgreementSignModal';
import PolicyAcknowledgeModal from '../components/PolicyAcknowledgeModal';
import ConductAcknowledgeModal from '../components/ConductAcknowledgeModal';
import './ProviderCompliance.css';

const ProviderCompliance = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null); // 'agreement', 'policy', 'conduct'

  // Fetch data
  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get compliance items
      const { data: itemsData, error: itemsErr } = await supabase
        .from('compliance_items')
        .select('*')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });
      if (itemsErr) throw itemsErr;
      setItems(itemsData || []);

      // Get audit logs
      const { data: logsData, error: logsErr } = await supabase
        .from('compliance_audit_logs')
        .select('*')
        .eq('provider_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(10);
      if (logsErr) throw logsErr;
      setLogs(logsData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add audit log helper
  const addAuditLog = async (action, item, details, status = 'completed') => {
    try {
      await supabase.from('compliance_audit_logs').insert({
        provider_id: user.id,
        action,
        item,
        actor: 'You',
        details,
        status,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to add audit log:', err);
    }
  };

  // Handle action clicks
  const handleAction = (item, action) => {
    setSelectedItem(item);
    if (action === 'sign' && item.title.includes('Service Provider Agreement')) {
      setModalType('agreement');
    } else if (action === 'acknowledge' && item.title.includes('Data Protection Policy')) {
      setModalType('policy');
    } else if (action === 'acknowledge' && item.title.includes('Code of Conduct')) {
      setModalType('conduct');
    } else if (action === 'upload' || action === 'renew') {
      // ... handle file upload (similar to previous)
      alert('Upload feature coming soon');
    } else if (action === 'view') {
      alert(`Viewing ${item.title}`);
    } else if (action === 'download') {
      if (item.file_url) window.open(item.file_url, '_blank');
      else alert('No file available');
      addAuditLog('Downloaded', item.title, `Downloaded ${item.title}`);
    }
  };

  // Callback after modal completion
  const handleModalComplete = async (data) => {
    try {
      // Update the item status in Supabase
      const updates = {
        status: 'signed',
        signed_date: new Date().toISOString().split('T')[0],
        ...data
      };
      await supabase.from('compliance_items').update(updates).eq('id', selectedItem.id);
      await addAuditLog('Signed', selectedItem.title, `Signed ${selectedItem.title}`);
      await fetchData(); // refresh
      setModalType(null);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Filter logic
  const filters = [
    { id: 'all', label: 'All Items', count: items.length },
    { id: 'mandatory', label: 'Mandatory', count: items.filter(i => i.requirement === 'mandatory').length },
    { id: 'pending', label: 'Pending', count: items.filter(i => i.status.includes('pending')).length },
    { id: 'expired', label: 'Expired', count: items.filter(i => i.status === 'expired').length },
    { id: 'valid', label: 'Valid', count: items.filter(i => ['signed','valid','acknowledged'].includes(i.status)).length }
  ];

  const filteredItems = items.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'mandatory') return item.requirement === 'mandatory';
    if (activeFilter === 'pending') return item.status.includes('pending');
    if (activeFilter === 'expired') return item.status === 'expired';
    if (activeFilter === 'valid') return ['signed','valid','acknowledged'].includes(item.status);
    return true;
  });

  // Stats
  const complianceScore = items.length > 0
    ? Math.round((items.filter(i => i.requirement === 'mandatory' && ['signed','valid','acknowledged'].includes(i.status)).length /
                 items.filter(i => i.requirement === 'mandatory').length) * 100)
    : 100;

  const upcomingExpiries = items.filter(item => {
    if (!item.expiry_date) return false;
    const days = Math.ceil((new Date(item.expiry_date) - new Date()) / (1000*3600*24));
    return days > 0 && days <= 30;
  });

  if (loading) {
    return (
      <ProviderPageTemplate title="Compliance & Regulations" subtitle="Loading...">
        <div className="loading-container"><FaSpinner className="spinner" /> Loading...</div>
      </ProviderPageTemplate>
    );
  }

  if (error) {
    return (
      <ProviderPageTemplate title="Compliance & Regulations" subtitle="Error">
        <div className="error-container">Error: {error}</div>
      </ProviderPageTemplate>
    );
  }

  return (
    <ProviderPageTemplate
      title="Compliance & Regulations"
      subtitle="Manage your legal and regulatory requirements"
      actions={
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn-secondary"><FaDownload /> Export Compliance Report</button>
          <button className="btn-primary"><FaClipboardCheck /> Run Compliance Check</button>
        </div>
      }
    >
      {/* Compliance Score Card */}
      <div className="provider-card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">Compliance Overview</h3>
          <div className="compliance-score">
            <div className="score-circle">
              <span className="score-value">{complianceScore}%</span>
              <span className="score-label">Compliant</span>
            </div>
          </div>
        </div>

        <div className="compliance-stats">
          <div className="stat-item">
            <FaCheckCircle style={{ color: '#4caf50', fontSize: '2rem' }} />
            <div>
              <div className="stat-value">{items.filter(i => ['signed','valid','acknowledged'].includes(i.status)).length}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
          <div className="stat-item">
            <FaClock style={{ color: '#ff9800', fontSize: '2rem' }} />
            <div>
              <div className="stat-value">{items.filter(i => i.status.includes('pending')).length}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
          <div className="stat-item">
            <FaExclamationTriangle style={{ color: '#f44336', fontSize: '2rem' }} />
            <div>
              <div className="stat-value">{items.filter(i => i.status === 'expired').length}</div>
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

        <div className="compliance-progress">
          <div className="progress-item">
            <div className="progress-label">
              <span>Mandatory Requirements</span>
              <span>{items.filter(i => i.requirement === 'mandatory' && ['signed','valid','acknowledged'].includes(i.status)).length} / {items.filter(i => i.requirement === 'mandatory').length}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(items.filter(i => i.requirement === 'mandatory' && ['signed','valid','acknowledged'].includes(i.status)).length / (items.filter(i => i.requirement === 'mandatory').length || 1)) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="compliance-filters">
        <div className="filter-buttons">
          {filters.map(f => (
            <button key={f.id} className={`filter-btn ${activeFilter === f.id ? 'active' : ''}`} onClick={() => setActiveFilter(f.id)}>
              {f.label} <span className="filter-count">{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="provider-grid">
        {filteredItems.map(item => {
          const badge = item.requirement === 'mandatory' ? { label: 'Mandatory', color: '#f44336', bg: '#ffebee' } :
                        item.requirement === 'conditional' ? { label: 'Conditional', color: '#ff9800', bg: '#fff3e0' } :
                        { label: 'Recommended', color: '#2196f3', bg: '#e3f2fd' };
          return (
            <div key={item.id} className="compliance-item-card">
              <div className="item-header">
                <div className="item-type-icon" style={{ color: getStatusColor(item.status) }}>{getTypeIcon(item.type)}</div>
                <div className="item-title-section">
                  <h4>{item.title}</h4>
                  <div className="item-meta">
                    <span className="status-badge" style={{ background: getStatusColor(item.status)+'20', color: getStatusColor(item.status) }}>
                      {getStatusIcon(item.status)} {item.status.replace('_',' ')}
                    </span>
                    <span className="requirement-badge" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
                  </div>
                </div>
              </div>
              <div className="item-description"><p>{item.description}</p></div>
              <div className="item-details">
                {item.signed_date && <div><strong>Signed:</strong> {item.signed_date}</div>}
                {item.expiry_date && <div><strong>Expires:</strong> <span style={{ color: new Date(item.expiry_date) < new Date() ? '#f44336' : '#4caf50' }}>{item.expiry_date}</span></div>}
              </div>
              <div className="item-actions">
                <div className="action-buttons">
                  {(item.actions || []).map(action => (
                    <button key={action} className={`action-btn ${action}`} onClick={() => handleAction(item, action)}>
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
        <div className="provider-card" style={{ marginTop: '2rem' }}>
          <div className="card-header"><h3><FaBell style={{ marginRight: '0.5rem', color: '#ff9800' }} /> Upcoming Expiries</h3></div>
          <div className="expiry-list">
            {upcomingExpiries.map(item => {
              const days = Math.ceil((new Date(item.expiry_date) - new Date()) / (1000*3600*24));
              return (
                <div key={item.id} className="expiry-item">
                  <div className="expiry-info">
                    <h5>{item.title}</h5>
                    <div className="expiry-meta">Expires: {item.expiry_date} • <span className={`days-remaining ${days <= 7 ? 'urgent' : 'warning'}`}>{days} days left</span></div>
                  </div>
                  <button className="btn-primary" onClick={() => handleAction(item, 'renew')}>Renew Now</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Audit Log */}
      <div className="provider-card" style={{ marginTop: '2rem' }}>
        <div className="card-header"><h3><FaHistory /> Compliance Audit Log</h3></div>
        <div className="audit-log">
          {logs.map(log => (
            <div key={log.id} className="log-item">
              <div className="log-icon">
                {log.status === 'completed' && <FaCheckCircle style={{ color: '#4caf50' }} />}
                {log.status === 'pending' && <FaClock style={{ color: '#ff9800' }} />}
                {log.status === 'notification' && <FaBell style={{ color: '#2196f3' }} />}
              </div>
              <div className="log-content">
                <div className="log-header"><strong>{log.action}</strong> <span className="log-time">{new Date(log.timestamp).toLocaleString()}</span></div>
                <div className="log-details"><span className="log-item-name">{log.item}</span> by {log.actor}</div>
                {log.details && <div className="log-description">{log.details}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {modalType === 'agreement' && (
        <AgreementSignModal
          item={selectedItem}
          onClose={() => setModalType(null)}
          onComplete={handleModalComplete}
        />
      )}
      {modalType === 'policy' && (
        <PolicyAcknowledgeModal
          item={selectedItem}
          onClose={() => setModalType(null)}
          onComplete={handleModalComplete}
        />
      )}
      {modalType === 'conduct' && (
        <ConductAcknowledgeModal
          item={selectedItem}
          onClose={() => setModalType(null)}
          onComplete={handleModalComplete}
        />
      )}
    </ProviderPageTemplate>
  );
};

// Helper functions (can be moved to a utils file)
const getStatusColor = (status) => {
  const map = {
    signed: '#4caf50', valid: '#4caf50', acknowledged: '#4caf50',
    pending_review: '#ff9800', pending: '#ff9800',
    expired: '#f44336',
    not_required: '#757575'
  };
  return map[status] || '#666';
};

const getStatusIcon = (status) => {
  if (['signed','valid','acknowledged'].includes(status)) return <FaCheckCircle />;
  if (status.includes('pending')) return <FaClock />;
  if (status === 'expired') return <FaExclamationTriangle />;
  if (status === 'not_required') return <FaTimesCircle />;
  return <FaClock />;
};

const getTypeIcon = (type) => {
  const map = {
    agreement: <FaFileContract />,
    policy: <FaGavel />,
    certification: <FaClipboardCheck />,
    insurance: <FaShieldAlt />,
    certificate: <FaFileSignature />
  };
  return map[type] || <FaFileContract />;
};

export default ProviderCompliance;