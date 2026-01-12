import React, { useState, useEffect } from 'react';
import superAdminApi from '../services/superAdminApi';
import './AdminManager.css';

const AdminManager = () => {
  const [admins, setAdmins] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    name: '',
    permissions: [],
    scope: []
  });

  const availableScopes = [
    { id: 'VERIFICATION', label: 'Verification', description: 'Verify users and properties' },
    { id: 'PAYMENTS', label: 'Payments', description: 'Process payments and commissions' },
    { id: 'DISPUTES', label: 'Disputes', description: 'Resolve user disputes' },
    { id: 'CHATS', label: 'Chat Monitoring', description: 'Monitor chat conversations' },
    { id: 'MARKETPLACE', label: 'Marketplace', description: 'Manage service providers' },
    { id: 'LISTINGS', label: 'Listings', description: 'Manage property listings' }
  ];

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await superAdminApi.getAdmins();
      setAdmins(response.data.list);
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const handleCreateAdmin = async () => {
    try {
      // Validate email domain
      if (!newAdmin.email.includes('@renteasy.com')) {
        alert('Admin emails must use @renteasy.com domain');
        return;
      }

      // Validate at least one scope is selected
      if (newAdmin.scope.length === 0) {
        alert('Please select at least one scope for the admin');
        return;
      }

      const response = await superAdminApi.createAdmin(newAdmin);
      
      // Add to list
      setAdmins([...admins, response.data]);
      
      // Reset form
      setNewAdmin({
        email: '',
        name: '',
        permissions: [],
        scope: []
      });
      setShowCreateForm(false);
      
      alert('Admin created successfully! Temporary password sent to email.');
    } catch (error) {
      alert(`Error creating admin: ${error.message}`);
    }
  };

  const handleSuspendAdmin = async (adminId, email) => {
    if (!window.confirm(`Are you sure you want to suspend ${email}?`)) return;

    try {
      const reason = prompt('Enter reason for suspension:');
      if (!reason) return;

      await superAdminApi.suspendAdmin(adminId, reason);
      fetchAdmins();
      alert('Admin suspended successfully');
    } catch (error) {
      alert(`Error suspending admin: ${error.message}`);
    }
  };

  const handleToggleScope = (scopeId) => {
    setNewAdmin(prev => ({
      ...prev,
      scope: prev.scope.includes(scopeId)
        ? prev.scope.filter(id => id !== scopeId)
        : [...prev.scope, scopeId]
    }));
  };

  const generateTemporaryPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  return (
    <div className="admin-manager">
      <div className="manager-header">
        <h2>👑 ADMIN MANAGEMENT</h2>
        <p className="subtitle">Create and manage admin accounts with specific scopes</p>
        
        <div className="header-actions">
          <button 
            className="create-admin-btn"
            onClick={() => setShowCreateForm(true)}
          >
            + CREATE NEW ADMIN
          </button>
        </div>
      </div>

      {/* Create Admin Form */}
      {showCreateForm && (
        <div className="create-admin-form">
          <div className="form-header">
            <h3>CREATE NEW ADMIN</h3>
            <button 
              className="close-btn"
              onClick={() => setShowCreateForm(false)}
            >
              ×
            </button>
          </div>

          <div className="form-body">
            <div className="form-row">
              <div className="form-group">
                <label>Admin Name</label>
                <input
                  type="text"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  placeholder="admin@renteasy.com"
                />
                <small>Must use @renteasy.com domain</small>
              </div>
            </div>

            <div className="form-section">
              <h4>ASSIGN SCOPES</h4>
              <p className="section-description">
                Select what this admin can access and manage
              </p>
              
              <div className="scope-grid">
                {availableScopes.map(scope => (
                  <div 
                    key={scope.id}
                    className={`scope-card ${newAdmin.scope.includes(scope.id) ? 'selected' : ''}`}
                    onClick={() => handleToggleScope(scope.id)}
                  >
                    <div className="scope-checkbox">
                      {newAdmin.scope.includes(scope.id) ? '✓' : ''}
                    </div>
                    <div className="scope-info">
                      <div className="scope-label">{scope.label}</div>
                      <div className="scope-desc">{scope.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h4>SECURITY SETTINGS</h4>
              <div className="security-settings">
                <div className="security-item">
                  <input type="checkbox" id="require2fa" defaultChecked />
                  <label htmlFor="require2fa">Require 2FA setup on first login</label>
                </div>
                <div className="security-item">
                  <input type="checkbox" id="passwordReset" defaultChecked />
                  <label htmlFor="passwordReset">Force password reset on first login</label>
                </div>
                <div className="security-item">
                  <input type="checkbox" id="activityLogging" defaultChecked />
                  <label htmlFor="activityLogging">Enable detailed activity logging</label>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowCreateForm(false)}
              >
                CANCEL
              </button>
              <button 
                className="create-btn"
                onClick={handleCreateAdmin}
                disabled={!newAdmin.email || !newAdmin.name || newAdmin.scope.length === 0}
              >
                CREATE ADMIN ACCOUNT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admins List */}
      <div className="admins-list">
        <div className="list-header">
          <h3>ACTIVE ADMINS ({admins.length})</h3>
          <div className="list-filters">
            <select>
              <option>All Scopes</option>
              {availableScopes.map(scope => (
                <option key={scope.id}>{scope.label}</option>
              ))}
            </select>
            <select>
              <option>All Status</option>
              <option>Active</option>
              <option>Suspended</option>
            </select>
          </div>
        </div>

        <div className="admins-table">
          <table>
            <thead>
              <tr>
                <th>ADMIN</th>
                <th>SCOPES</th>
                <th>LAST ACTIVE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(admin => (
                <tr key={admin.id}>
                  <td className="admin-info">
                    <div className="admin-name">{admin.name}</div>
                    <div className="admin-email">{admin.email}</div>
                    <div className="admin-created">
                      Created by: {admin.createdBy}
                    </div>
                  </td>
                  <td className="admin-scopes">
                    <div className="scope-tags">
                      {admin.scope.map(scope => (
                        <span key={scope} className="scope-tag">{scope}</span>
                      ))}
                    </div>
                  </td>
                  <td className="admin-activity">
                    {admin.lastActive || 'Never logged in'}
                  </td>
                  <td className="admin-status">
                    <span className={`status-badge ${admin.status}`}>
                      {admin.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="admin-actions">
                    <button 
                      className="action-btn view"
                      onClick={() => alert(`Viewing ${admin.name}'s activity`)}
                    >
                      👁️ View
                    </button>
                    <button 
                      className="action-btn edit"
                      onClick={() => alert(`Edit ${admin.name}`)}
                    >
                      ✏️ Edit
                    </button>
                    {admin.status === 'active' && (
                      <button 
                        className="action-btn suspend"
                        onClick={() => handleSuspendAdmin(admin.id, admin.email)}
                      >
                        ⛔ Suspend
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Notice */}
      <div className="security-notice">
        <div className="notice-icon">🔒</div>
        <div className="notice-content">
          <h4>SUPER ADMIN SECURITY PROTOCOLS</h4>
          <ul>
            <li>Only YOU (Super Admin) can create other admins</li>
            <li>Admins cannot promote themselves or create other admins</li>
            <li>All admin activities are permanently logged</li>
            <li>Admin passwords are automatically generated and securely stored</li>
            <li>Session timeouts: 1 hour for Super Admin, 30 minutes for regular admins</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminManager;