// src/modules/admin/pages/AdminManagement.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import {
  UserPlus, Shield, UserCheck, UserX, Mail, Lock,
  Trash2, Eye, Copy, Key
} from 'lucide-react';
import './AdminStyles.css';

const AdminManagement = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    role: 'admin', // admin, moderator, support
    permissions: ['view', 'edit', 'delete'],
    sendInvite: true
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({});

  useEffect(() => {
    if (user?.role === 'admin' && user?.isCEO) {
      loadAdmins();
    }
  }, [user]);

  const loadAdmins = () => {
    const users = JSON.parse(localStorage.getItem('rentEasyUsers') || '[]');
    const adminUsers = users.filter(u => u.role === 'admin');
    setAdmins(adminUsers);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const createAdmin = () => {
    if (!newAdmin.name || !newAdmin.email) {
      alert('Please fill in all fields');
      return;
    }

    // Check if email already exists
    const users = JSON.parse(localStorage.getItem('rentEasyUsers') || '[]');
    const existingUser = users.find(u => u.email === newAdmin.email);
    if (existingUser) {
      alert('User with this email already exists');
      return;
    }

    setLoading(true);
    
    // Generate temporary password
    const tempPassword = generatePassword();
    
    // Create admin user
    const adminUser = {
      id: 'admin_' + Date.now(),
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
      permissions: newAdmin.permissions,
      isActive: true,
      verified: true,
      isCEO: false,
      createdBy: user?.name || 'System',
      createdAt: new Date().toISOString(),
      tempPassword: tempPassword, // This will be removed after first login
      requiresPasswordChange: true
    };

    // Save to localStorage
    users.push(adminUser);
    localStorage.setItem('rentEasyUsers', JSON.stringify(users));
    
    // Log activity
    const activity = {
      id: Date.now(),
      action: `Created admin account for ${newAdmin.name} (${newAdmin.email})`,
      type: 'admin_management',
      admin: user?.name,
      timestamp: new Date().toISOString()
    };
    
    const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
    activities.unshift(activity);
    localStorage.setItem('adminActivities', JSON.stringify(activities.slice(0, 100)));

    // Reset form and show credentials
    alert(`Admin account created!\n\nEmail: ${newAdmin.email}\nTemporary Password: ${tempPassword}\n\nCopy these credentials and share securely.`);
    
    setNewAdmin({
      name: '',
      email: '',
      role: 'admin',
      permissions: ['view', 'edit', 'delete'],
      sendInvite: true
    });
    
    setLoading(false);
    loadAdmins();
  };

  const toggleAdminStatus = (adminId, activate = true) => {
    const users = JSON.parse(localStorage.getItem('rentEasyUsers') || '[]');
    const updatedUsers = users.map(u => 
      u.id === adminId ? { ...u, isActive: activate } : u
    );
    
    localStorage.setItem('rentEasyUsers', JSON.stringify(updatedUsers));
    loadAdmins();
    
    const activity = {
      id: Date.now(),
      action: `${activate ? 'Activated' : 'Deactivated'} admin account`,
      type: 'admin_management',
      admin: user?.name,
      timestamp: new Date().toISOString()
    };
    
    const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
    activities.unshift(activity);
    localStorage.setItem('adminActivities', JSON.stringify(activities.slice(0, 100)));
  };

  const deleteAdmin = (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin account? This cannot be undone.')) {
      return;
    }

    const users = JSON.parse(localStorage.getItem('rentEasyUsers') || '[]');
    const updatedUsers = users.filter(u => u.id !== adminId);
    localStorage.setItem('rentEasyUsers', JSON.stringify(updatedUsers));
    loadAdmins();
    
    const activity = {
      id: Date.now(),
      action: 'Deleted admin account',
      type: 'admin_management',
      admin: user?.name,
      timestamp: new Date().toISOString()
    };
    
    const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
    activities.unshift(activity);
    localStorage.setItem('adminActivities', JSON.stringify(activities.slice(0, 100)));
  };

  const resetPassword = (adminId) => {
    const newPassword = generatePassword();
    const users = JSON.parse(localStorage.getItem('rentEasyUsers') || '[]');
    const updatedUsers = users.map(u => 
      u.id === adminId ? { 
        ...u, 
        tempPassword: newPassword,
        requiresPasswordChange: true 
      } : u
    );
    
    localStorage.setItem('rentEasyUsers', JSON.stringify(updatedUsers));
    
    const admin = users.find(u => u.id === adminId);
    alert(`Password reset for ${admin.name}\n\nNew Temporary Password: ${newPassword}\n\nShare this securely.`);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  };

  // Only CEO can access this page
  if (!user?.isCEO) {
    return (
      <AdminLayout>
        <div className="ceo-access-denied">
          <Shield size={48} />
          <h2>CEO Access Required</h2>
          <p>Only the CEO can access admin management.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-management">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <h1><Shield size={24} /> Admin Management</h1>
            <p>Create and manage admin accounts (CEO Only)</p>
          </div>
          <div className="header-right">
            <div className="ceo-badge">
              👑 CEO Mode
            </div>
          </div>
        </div>

        {/* Create New Admin Form */}
        <div className="create-admin-section">
          <h2><UserPlus size={20} /> Create New Admin</h2>
          <div className="create-form">
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                  placeholder="Enter admin's full name"
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
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Role</label>
                <select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value})}
                >
                  <option value="admin">Full Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="support">Support Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Permissions</label>
                <div className="permissions-checkboxes">
                  <label>
                    <input
                      type="checkbox"
                      checked={newAdmin.permissions.includes('view')}
                      onChange={(e) => {
                        const perms = e.target.checked
                          ? [...newAdmin.permissions, 'view']
                          : newAdmin.permissions.filter(p => p !== 'view');
                        setNewAdmin({...newAdmin, permissions: perms});
                      }}
                    /> View
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={newAdmin.permissions.includes('edit')}
                      onChange={(e) => {
                        const perms = e.target.checked
                          ? [...newAdmin.permissions, 'edit']
                          : newAdmin.permissions.filter(p => p !== 'edit');
                        setNewAdmin({...newAdmin, permissions: perms});
                      }}
                    /> Edit
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={newAdmin.permissions.includes('delete')}
                      onChange={(e) => {
                        const perms = e.target.checked
                          ? [...newAdmin.permissions, 'delete']
                          : newAdmin.permissions.filter(p => p !== 'delete');
                        setNewAdmin({...newAdmin, permissions: perms});
                      }}
                    /> Delete
                  </label>
                </div>
              </div>
            </div>

            <button 
              className="create-admin-btn"
              onClick={createAdmin}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Admin Account'}
            </button>
          </div>
        </div>

        {/* Admins List */}
        <div className="admins-list-section">
          <h2>Existing Admins ({admins.length})</h2>
          <div className="admins-grid">
            {admins.map(admin => (
              <div key={admin.id} className="admin-card">
                <div className="admin-header">
                  <div className="admin-avatar">
                    {admin.name.charAt(0)}
                  </div>
                  <div className="admin-info">
                    <h4>{admin.name}</h4>
                    <p>{admin.email}</p>
                    <div className="admin-tags">
                      <span className={`role-tag ${admin.role}`}>
                        {admin.role}
                      </span>
                      {admin.isCEO && <span className="ceo-tag">👑 CEO</span>}
                      {admin.isActive ? (
                        <span className="active-tag">Active</span>
                      ) : (
                        <span className="inactive-tag">Inactive</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="admin-details">
                  <div className="detail-item">
                    <strong>Created:</strong>
                    <span>{new Date(admin.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <strong>By:</strong>
                    <span>{admin.createdBy}</span>
                  </div>
                  {admin.tempPassword && (
                    <div className="detail-item password-item">
                      <strong>Temporary Password:</strong>
                      <div className="password-display">
                        <span className="password-text">
                          {showPassword[admin.id] ? admin.tempPassword : '••••••••'}
                        </span>
                        <button
                          className="show-password-btn"
                          onClick={() => setShowPassword({
                            ...showPassword,
                            [admin.id]: !showPassword[admin.id]
                          })}
                        >
                          {showPassword[admin.id] ? 'Hide' : 'Show'}
                        </button>
                        <button
                          className="copy-btn"
                          onClick={() => copyToClipboard(admin.tempPassword)}
                          title="Copy password"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="admin-actions">
                  {!admin.isCEO && (
                    <>
                      {admin.isActive ? (
                        <button
                          className="btn-deactivate"
                          onClick={() => toggleAdminStatus(admin.id, false)}
                        >
                          <UserX size={16} /> Deactivate
                        </button>
                      ) : (
                        <button
                          className="btn-activate"
                          onClick={() => toggleAdminStatus(admin.id, true)}
                        >
                          <UserCheck size={16} /> Activate
                        </button>
                      )}
                      <button
                        className="btn-reset"
                        onClick={() => resetPassword(admin.id)}
                      >
                        <Key size={16} /> Reset Password
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => deleteAdmin(admin.id)}
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Notice */}
        <div className="security-notice">
          <div className="notice-icon">🔒</div>
          <div className="notice-content">
            <h4>Security Guidelines</h4>
            <ul>
              <li>Only create admin accounts for trusted team members</li>
              <li>Share temporary passwords via secure channels only</li>
              <li>Regularly review admin permissions</li>
              <li>Deactivate admin accounts when no longer needed</li>
              <li>Never share your CEO credentials</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminManagement;