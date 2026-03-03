// src/modules/super-admin/pages/AdminManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './AdminManagementPage.css';

const AdminManagementPage = () => {
  const { user: superAdmin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScopeModal, setShowScopeModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    name: '',
    scopes: []
  });
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

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

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAdmins(data || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUser = async () => {
    if (!searchEmail.trim()) return;
    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .ilike('email', `%${searchEmail}%`)
        .neq('role', 'admin'); // exclude existing admins
      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching user:', error);
    } finally {
      setSearching(false);
    }
  };

  const promoteToAdmin = async (userId, fullName, email) => {
    try {
      // Update profile to admin with selected scopes
      const { error } = await supabase
        .from('profiles')
        .update({
          role: 'admin',
          scopes: newAdmin.scopes,
          is_suspended: false
        })
        .eq('id', userId);

      if (error) throw error;

      // Log activity
      await supabase.from('admin_activities').insert([{
        admin_id: superAdmin.id,
        type: 'admin_created',
        entity_id: userId,
        details: { scopes: newAdmin.scopes }
      }]);

      // Refresh list
      await fetchAdmins();
      setShowCreateModal(false);
      setNewAdmin({ email: '', name: '', scopes: [] });
      setSearchResults([]);
      setSearchEmail('');
    } catch (error) {
      alert('Error promoting user: ' + error.message);
    }
  };

  const handleCreateAdmin = async () => {
    if (newAdmin.scopes.length === 0) {
      alert('Please select at least one scope');
      return;
    }
    // If a user is already selected (from search results)
    if (searchResults.length === 1) {
      const user = searchResults[0];
      await promoteToAdmin(user.id, user.full_name, user.email);
    } else {
      alert('Please search and select a user first');
    }
  };

  const handleUpdateScopes = async (adminId, scopes) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ scopes })
        .eq('id', adminId);
      if (error) throw error;

      await supabase.from('admin_activities').insert([{
        admin_id: superAdmin.id,
        type: 'admin_scopes_updated',
        entity_id: adminId,
        details: { scopes }
      }]);

      setAdmins(admins.map(a => a.id === adminId ? { ...a, scopes } : a));
      setShowScopeModal(false);
    } catch (error) {
      alert('Error updating scopes: ' + error.message);
    }
  };

  const handleToggleStatus = async (adminId, currentSuspended) => {
    const action = currentSuspended ? 'activate' : 'suspend';
    let reason = null;
    if (!currentSuspended) {
      reason = prompt('Enter reason for suspension:');
      if (!reason) return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: !currentSuspended,
          suspended_reason: reason,
          suspended_at: !currentSuspended ? new Date().toISOString() : null
        })
        .eq('id', adminId);
      if (error) throw error;

      await supabase.from('admin_activities').insert([{
        admin_id: superAdmin.id,
        type: `admin_${action}d`,
        entity_id: adminId,
        details: { reason }
      }]);

      fetchAdmins();
    } catch (error) {
      alert('Error updating status: ' + error.message);
    }
  };

  const handleRevokeAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to revoke admin privileges? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'tenant', scopes: [] }) // revert to tenant
        .eq('id', adminId);
      if (error) throw error;

      await supabase.from('admin_activities').insert([{
        admin_id: superAdmin.id,
        type: 'admin_revoked',
        entity_id: adminId
      }]);

      fetchAdmins();
    } catch (error) {
      alert('Error revoking admin: ' + error.message);
    }
  };

  const getScopeLabel = (scopeId) => {
    const scope = availableScopes.find(s => s.id === scopeId);
    return scope ? scope.label : scopeId;
  };

  const getStatusColor = (suspended) => {
    return suspended ? 'danger' : 'success';
  };

  if (loading) return <div className="loading">Loading admins...</div>;

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
            <div key={index} className="restriction-item">{restriction}</div>
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
                  <div className="admin-avatar">{admin.full_name?.charAt(0) || '?'}</div>
                  <div className="admin-details">
                    <span className="admin-name">{admin.full_name}</span>
                    <span className="admin-id">ID: {admin.id.slice(0,8)}</span>
                  </div>
                </div>
              </div>
              <div className="table-cell">
                <span className="admin-email">{admin.email}</span>
              </div>
              <div className="table-cell">
                <span className={`status-badge ${getStatusColor(admin.is_suspended)}`}>
                  {admin.is_suspended ? 'SUSPENDED' : 'ACTIVE'}
                </span>
              </div>
              <div className="table-cell">
                <div className="scopes-list">
                  {admin.scopes?.map((scope) => (
                    <span key={scope} className="scope-tag">{getScopeLabel(scope)}</span>
                  ))}
                  {(!admin.scopes || admin.scopes.length === 0) && (
                    <span className="no-scopes">No scopes assigned</span>
                  )}
                </div>
              </div>
              <div className="table-cell">
                <span className="last-active">
                  {admin.last_active ? new Date(admin.last_active).toLocaleString() : 'Never'}
                </span>
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
                    className={`action-btn status-btn ${admin.is_suspended ? 'activate' : 'suspend'}`}
                    onClick={() => handleToggleStatus(admin.id, admin.is_suspended)}
                    title={admin.is_suspended ? 'Activate Admin' : 'Suspend Admin'}
                  >
                    {admin.is_suspended ? '▶️' : '⏸️'}
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
          <button className="view-all-logs" onClick={() => alert('Full logs view coming soon')}>
            View Full Logs
          </button>
        </div>
        <div className="logs-list">
          {/* We'll fetch last 5 activities from admin_activities */}
          {/* For brevity, this part is left as an exercise – you can fetch and map similar to the mock */}
          <p>Recent activities will appear here.</p>
        </div>
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Admin</h3>
              <button className="close-modal" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Search for existing user by email</label>
                <div className="search-row">
                  <input
                    type="text"
                    placeholder="Enter email address"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                  />
                  <button className="btn-search" onClick={searchUser} disabled={searching}>
                    {searching ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>

              {searchResults.length > 0 && (
                <div className="search-results">
                  <h4>Select user to promote:</h4>
                  {searchResults.map(user => (
                    <div
                      key={user.id}
                      className={`user-result ${newAdmin.email === user.email ? 'selected' : ''}`}
                      onClick={() => setNewAdmin({ ...newAdmin, email: user.email, name: user.full_name })}
                    >
                      <span className="user-name">{user.full_name}</span>
                      <span className="user-email">{user.email}</span>
                    </div>
                  ))}
                </div>
              )}

              {newAdmin.name && (
                <div className="selected-user">
                  <strong>Selected:</strong> {newAdmin.name} ({newAdmin.email})
                </div>
              )}

              <div className="form-group">
                <label>Assign Scopes</label>
                <div className="scopes-selector">
                  {availableScopes.map((scope) => (
                    <div key={scope.id} className="scope-option">
                      <label className="scope-checkbox">
                        <input
                          type="checkbox"
                          checked={newAdmin.scopes.includes(scope.id)}
                          onChange={(e) => {
                            const newScopes = e.target.checked
                              ? [...newAdmin.scopes, scope.id]
                              : newAdmin.scopes.filter(id => id !== scope.id);
                            setNewAdmin({ ...newAdmin, scopes: newScopes });
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
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreateAdmin}>
                Promote to Admin
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
              <h3>Manage Scopes for {selectedAdmin.full_name}</h3>
              <button className="close-modal" onClick={() => setShowScopeModal(false)}>×</button>
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
                        checked={selectedAdmin.scopes?.includes(scope.id)}
                        onChange={(e) => {
                          const newScopes = e.target.checked
                            ? [...(selectedAdmin.scopes || []), scope.id]
                            : (selectedAdmin.scopes || []).filter(id => id !== scope.id);
                          setSelectedAdmin({ ...selectedAdmin, scopes: newScopes });
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
              <button className="btn-secondary" onClick={() => setShowScopeModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => handleUpdateScopes(selectedAdmin.id, selectedAdmin.scopes)}>
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