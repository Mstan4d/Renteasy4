// src/modules/admin/pages/AdminUsers.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { 
  Users, UserCheck, UserX, Shield, Mail, Phone, 
  Filter, Search, MoreVertical, Edit, Trash2, Ban,
  Download, Eye, CheckCircle, XCircle, Calendar,
  MapPin, Building, Home, AlertCircle
} from 'lucide-react';
import './AdminUsers.css'; // CHANGED: Use separate CSS file

const AdminUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    verification: 'all',
    search: ''
  });

  useEffect(() => {
    if (user?.role !== 'admin') return;
    loadUsers();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [filters, users]);

  const loadUsers = () => {
    try {
      setLoading(true);
      // Load from localStorage
      const rentEasyUsers = JSON.parse(localStorage.getItem('rentEasyUsers') || '[]');
      const managers = JSON.parse(localStorage.getItem('managers') || '[]');
      const serviceProviders = JSON.parse(localStorage.getItem('serviceProviders') || '[]');
      const estateProperties = JSON.parse(localStorage.getItem('estateProperties') || '[]');
      
      // Transform all users into unified format
      const allUsers = [
        ...rentEasyUsers.map(u => ({ 
          ...u, 
          type: 'user',
          userType: u.role || 'tenant'
        })),
        ...managers.map(m => ({ 
          ...m, 
          type: 'manager',
          name: m.managerName || m.name || 'Manager',
          email: m.email,
          phone: m.phone,
          userType: 'manager',
          createdAt: m.createdAt || new Date().toISOString()
        })),
        ...serviceProviders.map(p => ({
          ...p,
          type: 'provider',
          name: p.ownerName || p.businessName || 'Service Provider',
          userType: 'provider',
          createdAt: p.createdAt || new Date().toISOString()
        })),
        ...estateProperties.map(e => ({
          ...e,
          type: 'estate',
          name: e.propertyName || e.estateName || 'Estate Firm',
          userType: 'estate-firm',
          createdAt: e.createdAt || new Date().toISOString()
        }))
      ];

      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Role filter
    if (filters.role !== 'all') {
      filtered = filtered.filter(u => u.userType === filters.role);
    }

    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'active') {
        filtered = filtered.filter(u => !u.isSuspended && !u.isBanned);
      } else if (filters.status === 'suspended') {
        filtered = filtered.filter(u => u.isSuspended);
      } else if (filters.status === 'banned') {
        filtered = filtered.filter(u => u.isBanned);
      }
    }

    // Verification filter
    if (filters.verification !== 'all') {
      if (filters.verification === 'verified') {
        filtered = filtered.filter(u => u.verified);
      } else if (filters.verification === 'unverified') {
        filtered = filtered.filter(u => !u.verified && !u.userVerified);
      } else if (filters.verification === 'pending') {
        filtered = filtered.filter(u => u.needsVerification);
      }
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(u => 
        u.name?.toLowerCase().includes(searchTerm) ||
        u.email?.toLowerCase().includes(searchTerm) ||
        u.phone?.includes(searchTerm) ||
        u.userType?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleVerifyUser = (userId) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, verified: true, needsVerification: false } : u
    );
    
    // Update localStorage based on user type
    const userToUpdate = users.find(u => u.id === userId);
    if (userToUpdate) {
      switch(userToUpdate.type) {
        case 'user':
          const rentEasyUsers = updatedUsers.filter(u => u.type === 'user');
          localStorage.setItem('rentEasyUsers', JSON.stringify(rentEasyUsers));
          break;
        case 'manager':
          const managers = updatedUsers.filter(u => u.type === 'manager');
          localStorage.setItem('managers', JSON.stringify(managers));
          break;
        case 'provider':
          const providers = updatedUsers.filter(u => u.type === 'provider');
          localStorage.setItem('serviceProviders', JSON.stringify(providers));
          break;
        case 'estate':
          const estates = updatedUsers.filter(u => u.type === 'estate');
          localStorage.setItem('estateProperties', JSON.stringify(estates));
          break;
      }
    }
    
    setUsers(updatedUsers);
    
    // Log activity
    const activity = {
      id: Date.now(),
      action: `Verified user: ${users.find(u => u.id === userId)?.name}`,
      type: 'user',
      admin: user?.name,
      timestamp: new Date().toISOString()
    };
    
    const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
    activities.unshift(activity);
    localStorage.setItem('adminActivities', JSON.stringify(activities.slice(0, 100)));
  };

  const handleSuspendUser = (userId, suspend = true) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, isSuspended: suspend } : u
    );
    
    // Update localStorage based on user type
    const userToUpdate = users.find(u => u.id === userId);
    if (userToUpdate) {
      switch(userToUpdate.type) {
        case 'user':
          const rentEasyUsers = updatedUsers.filter(u => u.type === 'user');
          localStorage.setItem('rentEasyUsers', JSON.stringify(rentEasyUsers));
          break;
        case 'manager':
          const managers = updatedUsers.filter(u => u.type === 'manager');
          localStorage.setItem('managers', JSON.stringify(managers));
          break;
        case 'provider':
          const providers = updatedUsers.filter(u => u.type === 'provider');
          localStorage.setItem('serviceProviders', JSON.stringify(providers));
          break;
        case 'estate':
          const estates = updatedUsers.filter(u => u.type === 'estate');
          localStorage.setItem('estateProperties', JSON.stringify(estates));
          break;
      }
    }
    
    setUsers(updatedUsers);
    
    const activity = {
      id: Date.now(),
      action: `${suspend ? 'Suspended' : 'Unsuspended'} user: ${users.find(u => u.id === userId)?.name}`,
      type: 'user',
      admin: user?.name,
      timestamp: new Date().toISOString()
    };
    
    const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
    activities.unshift(activity);
    localStorage.setItem('adminActivities', JSON.stringify(activities.slice(0, 100)));
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      const userToDelete = users.find(u => u.id === userId);
      const updatedUsers = users.filter(u => u.id !== userId);
      
      // Update localStorage based on user type
      if (userToDelete) {
        switch(userToDelete.type) {
          case 'user':
            const rentEasyUsers = updatedUsers.filter(u => u.type === 'user');
            localStorage.setItem('rentEasyUsers', JSON.stringify(rentEasyUsers));
            break;
          case 'manager':
            const managers = updatedUsers.filter(u => u.type === 'manager');
            localStorage.setItem('managers', JSON.stringify(managers));
            break;
          case 'provider':
            const providers = updatedUsers.filter(u => u.type === 'provider');
            localStorage.setItem('serviceProviders', JSON.stringify(providers));
            break;
          case 'estate':
            const estates = updatedUsers.filter(u => u.type === 'estate');
            localStorage.setItem('estateProperties', JSON.stringify(estates));
            break;
        }
      }
      
      setUsers(updatedUsers);
      
      const activity = {
        id: Date.now(),
        action: `Deleted user: ${userToDelete?.name}`,
        type: 'user',
        admin: user?.name,
        timestamp: new Date().toISOString()
      };
      
      const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
      activities.unshift(activity);
      localStorage.setItem('adminActivities', JSON.stringify(activities.slice(0, 100)));
    }
  };

  const handleExportUsers = () => {
    const csvContent = [
      ['ID', 'Name', 'Email', 'Phone', 'Role', 'Type', 'Status', 'Verified', 'Joined Date'],
      ...filteredUsers.map(u => [
        u.id,
        u.name || 'N/A',
        u.email || 'N/A',
        u.phone || 'N/A',
        u.userType,
        u.type,
        u.isSuspended ? 'Suspended' : u.isBanned ? 'Banned' : 'Active',
        u.verified ? 'Yes' : 'No',
        new Date(u.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `renteasy-users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin': return 'badge-admin';
      case 'landlord': return 'badge-landlord';
      case 'tenant': return 'badge-tenant';
      case 'manager': return 'badge-manager';
      case 'estate-firm': return 'badge-estate';
      case 'provider': return 'badge-provider';
      default: return 'badge-default';
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return '👑';
      case 'landlord': return '🏠';
      case 'tenant': return '👤';
      case 'manager': return '💼';
      case 'estate-firm': return '🏢';
      case 'provider': return '🔧';
      default: return '👤';
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="admin-access-denied">
        <h2>⛔ Admin Access Required</h2>
        <p>You need administrator privileges to access this page.</p>
      </div>
    );
  }

  return (
    <div className="admin-users-page"> {/* CHANGED: Remove AdminLayout wrapper */}
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1><Users size={24} /> User Management</h1>
          <p>Manage all users, landlords, tenants, and service providers</p>
        </div>
        <div className="header-right">
          <button className="btn-export" onClick={handleExportUsers}>
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-icon total">
            <Users />
          </div>
          <div className="stat-content">
            <h3>{users.length}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon verified">
            <UserCheck />
          </div>
          <div className="stat-content">
            <h3>{users.filter(u => u.verified).length}</h3>
            <p>Verified Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <Shield />
          </div>
          <div className="stat-content">
            <h3>{users.filter(u => u.needsVerification).length}</h3>
            <p>Pending Verification</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon suspended">
            <UserX />
          </div>
          <div className="stat-content">
            <h3>{users.filter(u => u.isSuspended).length}</h3>
            <p>Suspended Users</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>
        <div className="filter-controls">
          <select 
            value={filters.role}
            onChange={(e) => setFilters({...filters, role: e.target.value})}
          >
            <option value="all">All Roles</option>
            <option value="tenant">Tenant</option>
            <option value="landlord">Landlord</option>
            <option value="manager">Manager</option>
            <option value="estate-firm">Estate Firm</option>
            <option value="provider">Service Provider</option>
            <option value="admin">Admin</option>
          </select>

          <select 
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>

          <select 
            value={filters.verification}
            onChange={(e) => setFilters({...filters, verification: e.target.value})}
          >
            <option value="all">All Verification</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
            <option value="pending">Pending</option>
          </select>

          <button 
            className="btn-clear"
            onClick={() => setFilters({
              role: 'all',
              status: 'all',
              verification: 'all',
              search: ''
            })}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        {loading ? (
          <div className="loading-spinner">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <h3>No users found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Status</th>
                <th>Verification</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(userItem => (
                <tr key={userItem.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {getRoleIcon(userItem.userType)}
                      </div>
                      <div className="user-details">
                        <strong>{userItem.name || 'Unnamed User'}</strong>
                        <small>ID: {userItem.id?.substring(0, 8) || 'N/A'}...</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      {userItem.email && (
                        <div className="contact-item">
                          <Mail size={14} />
                          <span>{userItem.email}</span>
                        </div>
                      )}
                      {userItem.phone && (
                        <div className="contact-item">
                          <Phone size={14} />
                          <span>{userItem.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${getRoleBadgeColor(userItem.userType)}`}>
                      {userItem.userType}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${userItem.isSuspended ? 'suspended' : userItem.isBanned ? 'banned' : 'active'}`}>
                      {userItem.isSuspended ? 'Suspended' : userItem.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <div className="verification-status">
                      {userItem.verified ? (
                        <span className="verified-badge">
                          <CheckCircle size={14} /> Verified
                        </span>
                      ) : userItem.needsVerification ? (
                        <span className="pending-badge">
                          <Shield size={14} /> Pending
                        </span>
                      ) : (
                        <span className="unverified-badge">
                          <XCircle size={14} /> Unverified
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    {userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-view"
                        onClick={() => {
                          setSelectedUser(userItem);
                          setShowUserDetails(true);
                        }}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      
                      {!userItem.verified && !userItem.needsVerification && (
                        <button 
                          className="btn-verify"
                          onClick={() => handleVerifyUser(userItem.id)}
                          title="Verify User"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      
                      {!userItem.isSuspended ? (
                        <button 
                          className="btn-suspend"
                          onClick={() => handleSuspendUser(userItem.id, true)}
                          title="Suspend User"
                        >
                          <Ban size={16} />
                        </button>
                      ) : (
                        <button 
                          className="btn-unsuspend"
                          onClick={() => handleSuspendUser(userItem.id, false)}
                          title="Unsuspend User"
                        >
                          <UserCheck size={16} />
                        </button>
                      )}
                      
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteUser(userItem.id)}
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {filteredUsers.length > 0 && (
          <div className="table-footer">
            <span>Showing {filteredUsers.length} of {users.length} users</span>
            <div className="pagination">
              <button disabled>Previous</button>
              <span className="current-page">1</span>
              <button>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>User Details</h2>
              <button 
                className="close-modal"
                onClick={() => setShowUserDetails(false)}
              >
                ×
              </button>
            </div>
            
            <div className="user-details-content">
              <div className="user-header">
                <div className="user-avatar-large">
                  {getRoleIcon(selectedUser.userType)}
                </div>
                <div className="user-header-info">
                  <h3>{selectedUser.name}</h3>
                  <div className="user-meta">
                    <span className={`role-badge ${getRoleBadgeColor(selectedUser.userType)}`}>
                      {selectedUser.userType}
                    </span>
                    <span className={`status-badge ${selectedUser.isSuspended ? 'suspended' : 'active'}`}>
                      {selectedUser.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                    {selectedUser.verified && (
                      <span className="verified-badge">
                        <CheckCircle size={14} /> Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="details-grid">
                <div className="detail-section">
                  <h4>Contact Information</h4>
                  <div className="detail-item">
                    <strong>Email:</strong>
                    <span>{selectedUser.email || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Phone:</strong>
                    <span>{selectedUser.phone || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <strong>User ID:</strong>
                    <span className="user-id">{selectedUser.id || 'N/A'}</span>
                  </div>
                  {selectedUser.address && (
                    <div className="detail-item">
                      <strong>Address:</strong>
                      <span>{selectedUser.address}</span>
                    </div>
                  )}
                </div>
                
                <div className="detail-section">
                  <h4>Account Information</h4>
                  <div className="detail-item">
                    <strong>Joined:</strong>
                    <span>{new Date(selectedUser.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Account Type:</strong>
                    <span>{selectedUser.type || 'Standard User'}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Status:</strong>
                    <span className={`status-indicator ${selectedUser.isSuspended ? 'suspended' : 'active'}`}>
                      {selectedUser.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </div>
                  {selectedUser.verifiedAt && (
                    <div className="detail-item">
                      <strong>Verified At:</strong>
                      <span>{new Date(selectedUser.verifiedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                
                {(selectedUser.businessName || selectedUser.services || selectedUser.serviceType) && (
                  <div className="detail-section full-width">
                    <h4>Service Information</h4>
                    <div className="service-details">
                      {selectedUser.businessName && (
                        <div className="detail-item">
                          <strong>Business Name:</strong>
                          <span>{selectedUser.businessName}</span>
                        </div>
                      )}
                      {selectedUser.serviceType && (
                        <div className="detail-item">
                          <strong>Service Type:</strong>
                          <span>{selectedUser.serviceType}</span>
                        </div>
                      )}
                      {selectedUser.services && Array.isArray(selectedUser.services) && (
                        <div className="detail-item">
                          <strong>Services Offered:</strong>
                          <div className="services-list">
                            {selectedUser.services.map((service, index) => (
                              <span key={index} className="service-tag">{service}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedUser.state && (
                        <div className="detail-item">
                          <strong>Location:</strong>
                          <span>{selectedUser.state}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setShowUserDetails(false)}
                >
                  Close
                </button>
                <div className="action-buttons-modal">
                  {!selectedUser.verified && !selectedUser.needsVerification && (
                    <button 
                      className="btn-primary"
                      onClick={() => {
                        handleVerifyUser(selectedUser.id);
                        setShowUserDetails(false);
                      }}
                    >
                      <CheckCircle size={16} /> Verify User
                    </button>
                  )}
                  {!selectedUser.isSuspended ? (
                    <button 
                      className="btn-warning"
                      onClick={() => {
                        handleSuspendUser(selectedUser.id, true);
                        setShowUserDetails(false);
                      }}
                    >
                      <Ban size={16} /> Suspend User
                    </button>
                  ) : (
                    <button 
                      className="btn-success"
                      onClick={() => {
                        handleSuspendUser(selectedUser.id, false);
                        setShowUserDetails(false);
                      }}
                    >
                      <UserCheck size={16} /> Unsuspend User
                    </button>
                  )}
                  <button 
                    className="btn-danger"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this user?')) {
                        handleDeleteUser(selectedUser.id);
                        setShowUserDetails(false);
                      }
                    }}
                  >
                    <Trash2 size={16} /> Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;