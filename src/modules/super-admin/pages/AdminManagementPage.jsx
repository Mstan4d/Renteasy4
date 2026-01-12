import React, { useState } from 'react';
import SimplePageTemplate from './SimplePageTemplate';
import './AdminManagementPage.css';

const AdminManagementPage = () => {
  const [admins, setAdmins] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@renteasy.com',
      status: 'active',
      scopes: ['verification', 'payments'],
      createdAt: '2024-01-15',
      lastActive: '2 hours ago'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@renteasy.com',
      status: 'suspended',
      scopes: ['disputes', 'chat_monitoring'],
      createdAt: '2024-01-10',
      lastActive: '3 days ago'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@renteasy.com',
      status: 'active',
      scopes: ['marketplace', 'verification'],
      createdAt: '2024-01-05',
      lastActive: '1 hour ago'
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScopeModal, setShowScopeModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    scopes: []
  });

  const availableScopes = [
    { id: 'verification', label: 'Verification', description: 'Can acknowledge verifications' },
    { id: 'payments', label: 'Payments', description: 'Can monitor payments' },
    { id: 'disputes', label: 'Disputes', description: 'Can resolve disputes' },
    { id: 'chat_monitoring', label: 'Chat Monitoring', description: 'Can monitor chats' },
    { id: 'marketplace', label: 'Marketplace', description: 'Can manage marketplace' }
  ];

  const adminRestrictions = [
    '❌ Cannot create other admins',
    '❌ Cannot promote themselves',
    '❌ Cannot change commission',
    '❌ Cannot touch system rules',
    '✅ Only Super Admin can perform these actions'
  ];

  const handleCreateAdmin = () => {
    if (!newAdmin.name || !newAdmin.email) {
      alert('Please fill all required fields');
      return;
    }

    const admin = {
      id: admins.length + 1,
      name: newAdmin.name,
      email: newAdmin.email,
      status: 'active',
      scopes: newAdmin.scopes,
      createdAt: new Date().toISOString().split('T')[0],
      lastActive: 'Just now'
    };

    setAdmins([...admins, admin]);
    setNewAdmin({ name: '', email: '', scopes: [] });
    setShowCreateModal(false);
  };

  const handleToggleScope = (scopeId) => {
    if (newAdmin.scopes.includes(scopeId)) {
      setNewAdmin({
        ...newAdmin,
        scopes: newAdmin.scopes.filter(id => id !== scopeId)
      });
    } else {
      setNewAdmin({
        ...newAdmin,
        scopes: [...newAdmin.scopes, scopeId]
      });
    }
  };

  const handleUpdateScopes = (adminId, scopes) => {
    setAdmins(admins.map(admin => 
      admin.id === adminId ? { ...admin, scopes } : admin
    ));
    setShowScopeModal(false);
  };

  const handleToggleStatus = (adminId) => {
    setAdmins(admins.map(admin => 
      admin.id === adminId 
        ? { ...admin, status: admin.status === 'active' ? 'suspended' : 'active' }
        : admin
    ));
  };

  const handleRevokeAdmin = (adminId) => {
    if (window.confirm('Are you sure you want to revoke this admin? This action cannot be undone.')) {
      setAdmins(admins.filter(admin => admin.id !== adminId));
    }
  };

  const getScopeLabel = (scopeId) => {
    const scope = availableScopes.find(s => s.id === scopeId);
    return scope ? scope.label : scopeId;
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'danger';
  };

  return (
    <div className="admin-management">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Admin Management</h1>
          <p className="page-subtitle">Manage administrators and their permissions</p>
        </div>
        <button 
          className="create-admin-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <span className="btn-icon">+</span>
          Create New Admin
        </button>
      </div>

      {/* Restrictions Warning */}
      <div className="restrictions-card">
        <div className="restrictions-header">
          <span className="warning-icon">⚠️</span>
          <h3>Admin Restrictions (Critical Rules)</h3>
        </div>
        <div className="restrictions-list">
          {adminRestrictions.map((restriction, index) => (
            <div key={index} className="restriction-item">
              {restriction}
            </div>
          ))}
        </div>
      </div>

      {/* Admins List */}
      <div className="admins-table-container">
        <div className="table-header">
          <h3>System Administrators</h3>
          <span className="table-count">{admins.length} admins</span>
        </div>
        
        <div className="admins-table">
          <div className="table-row header">
            <div className="table-cell">Name</div>
            <div className="table-cell">Email</div>
            <div className="table-cell">Status</div>
            <div className="table-cell">Assigned Scopes</div>
            <div className="table-cell">Last Active</div>
            <div className="table-cell actions">Actions</div>
          </div>

          {admins.map((admin) => (
            <div key={admin.id} className="table-row">
              <div className="table-cell">
                <div className="admin-info">
                  <div className="admin-avatar">
                    {admin.name.charAt(0)}
                  </div>
                  <div className="admin-details">
                    <span className="admin-name">{admin.name}</span>
                    <span className="admin-id">ID: {admin.id}</span>
                  </div>
                </div>
              </div>
              <div className="table-cell">
                <span className="admin-email">{admin.email}</span>
              </div>
              <div className="table-cell">
                <span className={`status-badge ${getStatusColor(admin.status)}`}>
                  {admin.status.toUpperCase()}
                </span>
              </div>
              <div className="table-cell">
                <div className="scopes-list">
                  {admin.scopes.map((scope) => (
                    <span key={scope} className="scope-tag">
                      {getScopeLabel(scope)}
                    </span>
                  ))}
                  {admin.scopes.length === 0 && (
                    <span className="no-scopes">No scopes assigned</span>
                  )}
                </div>
              </div>
              <div className="table-cell">
                <span className="last-active">{admin.lastActive}</span>
              </div>
              <div className="table-cell actions">
                <div className="action-buttons">
                  <button 
                    className="action-btn scope-btn"
                    onClick={() => {
                      setSelectedAdmin(admin);
                      setShowScopeModal(true);
                    }}
                    title="Manage Scopes"
                  >
                    👥
                  </button>
                  <button 
                    className={`action-btn status-btn ${admin.status === 'active' ? 'suspend' : 'activate'}`}
                    onClick={() => handleToggleStatus(admin.id)}
                    title={admin.status === 'active' ? 'Suspend Admin' : 'Activate Admin'}
                  >
                    {admin.status === 'active' ? '⏸️' : '▶️'}
                  </button>
                  <button 
                    className="action-btn revoke-btn"
                    onClick={() => handleRevokeAdmin(admin.id)}
                    title="Revoke Admin"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Logs */}
      <div className="activity-logs">
        <div className="section-header">
          <h3>Admin Activity Logs</h3>
          <button className="view-all-logs">View Full Logs</button>
        </div>
        <div className="logs-list">
          {[
            { admin: 'John Doe', action: 'Acknowledged verification', target: 'Listing #456', time: '2 hours ago' },
            { admin: 'Mike Johnson', action: 'Resolved dispute', target: 'Chat #789', time: '3 hours ago' },
            { admin: 'Jane Smith', action: 'Suspended manager', target: 'Manager #123', time: '1 day ago' },
            { admin: 'John Doe', action: 'Monitored chat', target: 'Chat #234', time: '2 days ago' }
          ].map((log, index) => (
            <div key={index} className="log-item">
              <div className="log-icon">📝</div>
              <div className="log-content">
                <div className="log-action">
                  <span className="log-admin">{log.admin}</span>
                  <span className="log-action-text">{log.action}</span>
                </div>
                <div className="log-target">{log.target}</div>
              </div>
              <div className="log-time">{log.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Admin</h3>
              <button 
                className="close-modal"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="adminName">Full Name *</label>
                <input
                  type="text"
                  id="adminName"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                  placeholder="Enter admin full name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="adminEmail">Email Address *</label>
                <input
                  type="email"
                  id="adminEmail"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  placeholder="admin@renteasy.com"
                />
              </div>
              <div className="form-group">
                <label>Assign Scopes</label>
                <div className="scopes-selector">
                  {availableScopes.map((scope) => (
                    <div key={scope.id} className="scope-option">
                      <label className="scope-checkbox">
                        <input
                          type="checkbox"
                          checked={newAdmin.scopes.includes(scope.id)}
                          onChange={() => handleToggleScope(scope.id)}
                        />
                        <span className="checkmark"></span>
                      </label>
                      <div className="scope-info">
                        <div className="scope-label">{scope.label}</div>
                        <div className="scope-desc">{scope.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleCreateAdmin}
              >
                Create Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Scopes Modal */}
      {showScopeModal && selectedAdmin && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Manage Scopes for {selectedAdmin.name}</h3>
              <button 
                className="close-modal"
                onClick={() => setShowScopeModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="scope-warning">
                <span className="warning-icon">⚠️</span>
                <p>Admin cannot act outside assigned scopes</p>
              </div>
              <div className="scopes-selector">
                {availableScopes.map((scope) => (
                  <div key={scope.id} className="scope-option">
                    <label className="scope-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedAdmin.scopes.includes(scope.id)}
                        onChange={(e) => {
                          const newScopes = e.target.checked
                            ? [...selectedAdmin.scopes, scope.id]
                            : selectedAdmin.scopes.filter(id => id !== scope.id);
                          setSelectedAdmin({...selectedAdmin, scopes: newScopes});
                        }}
                      />
                      <span className="checkmark"></span>
                    </label>
                    <div className="scope-info">
                      <div className="scope-label">{scope.label}</div>
                      <div className="scope-desc">{scope.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowScopeModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={() => handleUpdateScopes(selectedAdmin.id, selectedAdmin.scopes)}
              >
                Update Scopes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagementPage;