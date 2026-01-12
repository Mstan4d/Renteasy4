import React, { useState, useEffect } from 'react';
import './AuditTrail.css';

const AuditTrail = ({ filters = {} }) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActions, setSelectedActions] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Action types based on your system
  const actionTypes = [
    'LOGIN',
    'LOGOUT',
    'CREATE',
    'UPDATE',
    'DELETE',
    'VERIFY',
    'REJECT',
    'APPROVE',
    'SUSPEND',
    'RESTORE',
    'OVERRIDE',
    'PAYMENT',
    'COMMISSION',
    'CHAT_VIEW',
    'CHAT_JOIN',
    'CHAT_LOCK',
    'SYSTEM_UPDATE'
  ];

  // Mock data - replace with API call
  const mockAuditLogs = [
    {
      id: 1,
      timestamp: '2024-01-15 14:30:25',
      user: 'superadmin@renteasy.com',
      userRole: 'SUPER_ADMIN',
      action: 'OVERRIDE',
      entityType: 'PAYMENT',
      entityId: 'PAY-789012',
      details: 'Override commission distribution for transaction',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome/120.0.0.0',
      severity: 'HIGH'
    },
    {
      id: 2,
      timestamp: '2024-01-15 14:25:10',
      user: 'admin_verification@renteasy.com',
      userRole: 'ADMIN',
      action: 'VERIFY',
      entityType: 'PROPERTY',
      entityId: 'PROP-456789',
      details: 'Verified property listing after manager submission',
      ipAddress: '192.168.1.101',
      userAgent: 'Firefox/121.0',
      severity: 'MEDIUM'
    },
    {
      id: 3,
      timestamp: '2024-01-15 14:20:45',
      user: 'manager_john@renteasy.com',
      userRole: 'MANAGER',
      action: 'CHAT_JOIN',
      entityType: 'CHAT',
      entityId: 'CHAT-123456',
      details: 'Joined tenant-landlord chat for monitoring',
      ipAddress: '192.168.1.102',
      userAgent: 'Safari/17.2',
      severity: 'LOW'
    },
    {
      id: 4,
      timestamp: '2024-01-15 14:15:30',
      user: 'superadmin@renteasy.com',
      userRole: 'SUPER_ADMIN',
      action: 'SUSPEND',
      entityType: 'USER',
      entityId: 'USER-987654',
      details: 'Suspended manager account for policy violation',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome/120.0.0.0',
      severity: 'CRITICAL'
    },
    {
      id: 5,
      timestamp: '2024-01-15 14:10:15',
      user: 'admin_payments@renteasy.com',
      userRole: 'ADMIN',
      action: 'UPDATE',
      entityType: 'COMMISSION',
      entityId: 'COMM-555666',
      details: 'Updated commission split for completed rental',
      ipAddress: '192.168.1.103',
      userAgent: 'Edge/120.0.0.0',
      severity: 'MEDIUM'
    },
    {
      id: 6,
      timestamp: '2024-01-15 14:05:00',
      user: 'estate_firm_xyz@renteasy.com',
      userRole: 'ESTATE_FIRM',
      action: 'CREATE',
      entityType: 'PROPERTY',
      entityId: 'PROP-777888',
      details: 'Posted new property listing with 5 images',
      ipAddress: '192.168.1.104',
      userAgent: 'Chrome/119.0.0.0',
      severity: 'LOW'
    },
    {
      id: 7,
      timestamp: '2024-01-15 14:00:45',
      user: 'landlord_smith@renteasy.com',
      userRole: 'LANDLORD',
      action: 'UPDATE',
      entityType: 'PROPERTY',
      entityId: 'PROP-111222',
      details: 'Updated property rental price from ₦300,000 to ₦350,000',
      ipAddress: '192.168.1.105',
      userAgent: 'Android Chrome/120.0.0.0',
      severity: 'LOW'
    },
    {
      id: 8,
      timestamp: '2024-01-15 13:55:30',
      user: 'superadmin@renteasy.com',
      userRole: 'SUPER_ADMIN',
      action: 'SYSTEM_UPDATE',
      entityType: 'SYSTEM',
      entityId: 'SYS-CONFIG',
      details: 'Updated commission percentage from 7% to 7.5%',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome/120.0.0.0',
      severity: 'HIGH'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAuditLogs(mockAuditLogs);
      setPagination(prev => ({
        ...prev,
        total: mockAuditLogs.length,
        totalPages: Math.ceil(mockAuditLogs.length / prev.limit)
      }));
      setLoading(false);
    }, 1000);
  }, []);

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'CRITICAL': return '#dc2626';
      case 'HIGH': return '#ef4444';
      case 'MEDIUM': return '#f59e0b';
      case 'LOW': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      'LOGIN': '🔐',
      'LOGOUT': '🚪',
      'CREATE': '➕',
      'UPDATE': '✏️',
      'DELETE': '🗑️',
      'VERIFY': '✅',
      'REJECT': '❌',
      'APPROVE': '👍',
      'SUSPEND': '⛔',
      'RESTORE': '🔄',
      'OVERRIDE': '⚡',
      'PAYMENT': '💰',
      'COMMISSION': '💸',
      'CHAT_VIEW': '👁️',
      'CHAT_JOIN': '💬',
      'CHAT_LOCK': '🔒',
      'SYSTEM_UPDATE': '⚙️'
    };
    return icons[action] || '📝';
  };

  const filterLogs = () => {
    return auditLogs.filter(log => {
      // Search term filter
      if (searchTerm && !Object.values(log).some(value => 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )) {
        return false;
      }
      
      // Action type filter
      if (selectedActions.length > 0 && !selectedActions.includes(log.action)) {
        return false;
      }
      
      // User filter
      if (selectedUsers.length > 0 && !selectedUsers.includes(log.userRole)) {
        return false;
      }
      
      return true;
    });
  };

  const handleExport = (format) => {
    console.log(`Exporting logs in ${format} format`);
    // Implement export functionality
    alert(`Exporting ${filterLogs().length} logs in ${format} format`);
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all audit logs? This action cannot be undone.')) {
      setAuditLogs([]);
      alert('Audit logs cleared (simulated)');
    }
  };

  const filteredLogs = filterLogs();

  return (
    <div className="audit-trail">
      {/* Header */}
      <div className="audit-header">
        <div className="audit-title">
          <h2>📜 AUDIT TRAIL</h2>
          <p className="audit-subtitle">Immutable Logs • Non-deletable • Time-stamped</p>
        </div>
        <div className="audit-stats">
          <div className="stat">
            <div className="stat-number">{auditLogs.length}</div>
            <div className="stat-label">Total Logs</div>
          </div>
          <div className="stat">
            <div className="stat-number">{filteredLogs.length}</div>
            <div className="stat-label">Filtered</div>
          </div>
          <div className="stat">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Monitoring</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="audit-controls">
        <div className="search-section">
          <div className="search-input">
            <input
              type="text"
              placeholder="Search across all fields..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          <div className="filter-tags">
            {selectedActions.map(action => (
              <span key={action} className="filter-tag">
                {action}
                <button onClick={() => setSelectedActions(prev => prev.filter(a => a !== action))}>
                  ×
                </button>
              </span>
            ))}
            {selectedUsers.map(user => (
              <span key={user} className="filter-tag">
                {user}
                <button onClick={() => setSelectedUsers(prev => prev.filter(u => u !== user))}>
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="action-controls">
          <div className="filter-dropdowns">
            <select 
              multiple
              className="filter-select"
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setSelectedActions(selected);
              }}
            >
              <option value="" disabled>Filter by Action</option>
              {actionTypes.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
            
            <select 
              multiple
              className="filter-select"
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setSelectedUsers(selected);
              }}
            >
              <option value="" disabled>Filter by User Role</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="LANDLORD">Landlord</option>
              <option value="TENANT">Tenant</option>
              <option value="ESTATE_FIRM">Estate Firm</option>
            </select>
          </div>

          <div className="export-controls">
            <button 
              className="export-btn"
              onClick={() => handleExport('CSV')}
            >
              📥 Export CSV
            </button>
            <button 
              className="export-btn"
              onClick={() => handleExport('PDF')}
            >
              📥 Export PDF
            </button>
            <button 
              className="clear-btn"
              onClick={handleClearLogs}
            >
              🗑️ Clear Logs
            </button>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="audit-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading audit logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>No audit logs found matching your filters</p>
            <button 
              className="reset-filters"
              onClick={() => {
                setSearchTerm('');
                setSelectedActions([]);
                setSelectedUsers([]);
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <table className="audit-table">
            <thead>
              <tr>
                <th>TIMESTAMP</th>
                <th>USER / ROLE</th>
                <th>ACTION</th>
                <th>ENTITY</th>
                <th>DETAILS</th>
                <th>IP / AGENT</th>
                <th>SEVERITY</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id} className="audit-row">
                  <td className="timestamp-cell">
                    <div className="timestamp-main">{log.timestamp.split(' ')[1]}</div>
                    <div className="timestamp-date">{log.timestamp.split(' ')[0]}</div>
                  </td>
                  <td className="user-cell">
                    <div className="user-email">{log.user}</div>
                    <div className="user-role">{log.userRole}</div>
                  </td>
                  <td className="action-cell">
                    <div className="action-icon">{getActionIcon(log.action)}</div>
                    <div className="action-type">{log.action}</div>
                  </td>
                  <td className="entity-cell">
                    <div className="entity-type">{log.entityType}</div>
                    <div className="entity-id">{log.entityId}</div>
                  </td>
                  <td className="details-cell">
                    {log.details}
                  </td>
                  <td className="meta-cell">
                    <div className="ip-address">{log.ipAddress}</div>
                    <div className="user-agent">{log.userAgent}</div>
                  </td>
                  <td className="severity-cell">
                    <div 
                      className="severity-badge"
                      style={{ backgroundColor: getSeverityColor(log.severity) }}
                    >
                      {log.severity}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {filteredLogs.length > 0 && (
        <div className="audit-pagination">
          <div className="pagination-info">
            Showing {filteredLogs.length} of {auditLogs.length} logs
          </div>
          <div className="pagination-controls">
            <button 
              className="pagination-btn"
              disabled={pagination.page === 1}
            >
              ← Previous
            </button>
            <div className="page-numbers">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`page-btn ${pagination.page === page ? 'active' : ''}`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button 
              className="pagination-btn"
              disabled={pagination.page === pagination.totalPages}
            >
              Next →
            </button>
          </div>
          <div className="page-size">
            <select>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
              <option value={250}>250 per page</option>
            </select>
          </div>
        </div>
      )}

      {/* Security Note */}
      <div className="security-note">
        <div className="security-icon">🛡️</div>
        <div className="security-text">
          <strong>Security Notice:</strong> Audit logs are immutable and cannot be deleted or modified.
          All actions are permanently recorded for security and compliance purposes.
        </div>
      </div>
    </div>
  );
};

export default AuditTrail;