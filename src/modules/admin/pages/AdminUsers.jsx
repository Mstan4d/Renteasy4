// src/modules/admin/pages/AdminUsers.jsx (final version with correct column mappings)
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import { 
  Users, UserCheck, UserX, Shield, Mail, Phone, 
  Filter, Search, Download, Eye, CheckCircle, XCircle, Calendar,
  MapPin, RefreshCw, Ban, Trash2
} from 'lucide-react';
import './AdminUsers.css';

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

  // ---------- Load all users ----------
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading users...');

      // 1. Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (profilesError) throw profilesError;

      // 2. Fetch service providers
      const { data: serviceProviders, error: providersError } = await supabase
        .from('service_providers')
        .select('*')
        .order('created_at', { ascending: false });
      if (providersError) throw providersError;

      // 3. Fetch estate firm profiles
      const { data: estateFirms, error: estateError } = await supabase
        .from('estate_firm_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (estateError) throw estateError;

      // Transform profiles
      const transformedProfiles = profiles.map(p => ({
        id: p.id,
        user_id: p.id,
        name: p.full_name || p.name || 'Unnamed',
        email: p.email,
        phone: p.phone,
        role: p.role,
        type: 'user',
        userType: p.role,
        // verification: use kyc_status (values: 'approved', 'pending', 'rejected', 'not_started')
        verified: p.kyc_status === 'approved',
        needs_verification: p.kyc_status === 'pending',
        verification_status: p.kyc_status || 'not_started',
        // status columns
        is_active: p.is_active ?? true,
        is_suspended: p.is_suspended || false,
        is_banned: p.is_banned || false, // note: column is 'is_banned' (underscore), not 'is-banned'
        avatar_url: p.avatar_url,
        state: p.state,
        lga: p.lga,
        address: p.address,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        last_login: p.last_login,
        table: 'profiles'
      }));

      // Transform service providers
      const transformedProviders = serviceProviders.map(p => ({
        id: p.id,
        user_id: p.user_id,
        name: p.business_name || p.company_name || 'Unnamed Provider',
        email: p.email,
        phone: p.phone,
        role: 'provider',
        type: 'provider',
        userType: 'provider',
        // verification: can use verified (boolean) or kyc_status (text)
        verified: p.verified === true || p.kyc_status === 'approved',
        needs_verification: p.kyc_status === 'pending' || p.verification_status === 'pending',
        verification_status: p.kyc_status || p.verification_status || 'not_started',
        // status columns
        is_active: p.is_active ?? true,
        is_suspended: p.is_suspended || false,
        is_banned: p.is_banned || false,
        avatar_url: p.avatar_url,
        state: p.state,
        lga: p.lga,
        address: p.address,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        last_login: null,
        business_name: p.business_name,
        table: 'service_providers'
      }));

      // Transform estate firms
      const transformedEstate = estateFirms.map(e => ({
        id: e.id,
        user_id: e.user_id,
        name: e.firm_name || 'Unnamed Estate Firm',
        email: e.business_email || e.contact_email,
        phone: e.business_phone || e.contact_phone,
        role: 'estate-firm',
        type: 'estate-firm',
        userType: 'estate-firm',
        // verification: verification_status (text)
        verified: e.verification_status === 'verified',
        needs_verification: e.verification_status === 'pending',
        verification_status: e.verification_status || 'not_started',
        // status columns – these may not exist in estate_firm_profiles, but we'll assume they do (if not, we'll handle in actions)
        is_active: e.is_active ?? true,
        is_suspended: e.is_suspended || false,
        is_banned: e.is_banned || false,
        avatar_url: null,
        state: e.state,
        lga: e.lga,
        address: e.address,
        createdAt: e.created_at,
        updatedAt: e.updated_at,
        last_login: null,
        business_name: e.firm_name,
        table: 'estate_firm_profiles'
      }));

      const allUsers = [...transformedProfiles, ...transformedProviders, ...transformedEstate];
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    loadUsers();
  }, [user, loadUsers]);

  // ---------- Real-time subscriptions ----------
  useEffect(() => {
    const channels = [
      supabase.channel('profiles-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, loadUsers),
      supabase.channel('providers-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'service_providers' }, loadUsers),
      supabase.channel('estate-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'estate_firm_profiles' }, loadUsers),
    ].map(ch => ch.subscribe());
    return () => channels.forEach(ch => supabase.removeChannel(ch));
  }, [loadUsers]);

  // ---------- Filtering ----------
  useEffect(() => {
    let filtered = [...users];
    if (filters.role !== 'all') filtered = filtered.filter(u => u.userType === filters.role);
    if (filters.status !== 'all') {
      if (filters.status === 'active') filtered = filtered.filter(u => u.is_active && !u.is_suspended && !u.is_banned);
      else if (filters.status === 'suspended') filtered = filtered.filter(u => u.is_suspended);
      else if (filters.status === 'banned') filtered = filtered.filter(u => u.is_banned);
      else if (filters.status === 'inactive') filtered = filtered.filter(u => !u.is_active);
    }
    if (filters.verification !== 'all') {
      if (filters.verification === 'verified') filtered = filtered.filter(u => u.verified);
      else if (filters.verification === 'unverified') filtered = filtered.filter(u => !u.verified && !u.needs_verification);
      else if (filters.verification === 'pending') filtered = filtered.filter(u => u.needs_verification);
    }
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(u => 
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.phone?.includes(term) ||
        u.userType?.toLowerCase().includes(term) ||
        u.business_name?.toLowerCase().includes(term)
      );
    }
    setFilteredUsers(filtered);
  }, [filters, users]);

 // Verification Logic
const handleVerifyUser = async (userItem) => {
  try {
    const updates = { updated_at: new Date().toISOString() };

    // Mapping verification columns based on your specific tables
    if (userItem.table === 'profiles') {
      updates.kyc_status = 'approved';
    } else if (userItem.table === 'service_providers') {
      updates.kyc_status = 'approved';
      updates.verified = true;
    } else if (userItem.table === 'estate_firm_profiles') {
      updates.verification_status = 'verified';
    }

    const { error } = await supabase
      .from(userItem.table)
      .update(updates)
      .eq('id', userItem.id);

    if (error) throw error;
    await loadUsers();
    alert('User verified successfully!');
  } catch (error) {
    console.error('Error:', error);
    alert('Update failed. Ensure you ran the SQL commands to add columns.');
  }
};

// Unified Status Handler (Suspension/Banning)
const handleStatusUpdate = async (userItem, field, value) => {
  try {
    const { error } = await supabase
      .from(userItem.table)
      .update({ 
        [field]: value, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', userItem.id);

    if (error) throw error;
    await loadUsers();
    alert('Status updated successfully!');
  } catch (error) {
    console.error('Error:', error);
    alert(`Failed to update ${field}.`);
  }
};

// Convenience wrappers for suspend and ban
const handleSuspendUser = (userItem, suspend) => {
  handleStatusUpdate(userItem, 'is_suspended', suspend);
};

const handleBanUser = (userItem, ban = true) => {
  handleStatusUpdate(userItem, 'is_banned', ban);
};

  // ---------- Updated Delete User ----------
const handleDeleteUser = async (userItem) => {
  // Use a template literal for a cleaner confirmation message
  const confirmMessage = `Are you sure you want to delete ${userItem.name}? This will remove all their data across the platform.`;
  
  if (!window.confirm(confirmMessage)) return;

  try {
    setLoading(true);
    
    // Ensure we are using the correct table name from the item
    const targetTable = userItem.table; 

    const { error } = await supabase
      .from(targetTable)
      .delete()
      .eq('id', userItem.id);

    if (error) {
      // If a foreign key constraint prevents deletion, this will catch it
      if (error.code === '23503') {
        throw new Error("Cannot delete user: They have active listings or records linked to them. Delete those first or enable 'Cascade Delete' in Supabase.");
      }
      throw error;
    }

    await loadUsers();
    alert('User and associated profile deleted successfully!');
  } catch (error) {
    console.error('Delete Error:', error);
    alert(error.message);
  } finally {
    setLoading(false);
  }
};
  // ---------- Export CSV ----------
  const handleExportUsers = () => {
    try {
      const csvContent = [
        ['ID', 'Name', 'Email', 'Phone', 'Role', 'Type', 'Status', 'Verified', 'Created Date', 'Last Login'],
        ...filteredUsers.map(u => [
          u.id,
          `"${u.name}"`,
          u.email || '',
          u.phone || '',
          u.userType,
          u.type,
          u.is_suspended ? 'Suspended' : u.is_banned ? 'Banned' : u.is_active ? 'Active' : 'Inactive',
          u.verified ? 'Yes' : 'No',
          new Date(u.createdAt).toLocaleDateString(),
          u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `renteasy-users-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      alert(`Exported ${filteredUsers.length} users to CSV`);
    } catch (error) {
      console.error('Error exporting users:', error);
      alert('Failed to export users.');
    }
  };

  // ---------- Utility functions ----------
  const getUniqueRoles = () => [...new Set(users.map(u => u.userType).filter(Boolean))].sort();
  const getRoleBadgeColor = (role) => {
    const map = {
      admin: 'badge-admin', landlord: 'badge-landlord', tenant: 'badge-tenant',
      manager: 'badge-manager', 'estate-firm': 'badge-estate', provider: 'badge-provider'
    };
    return map[role] || 'badge-default';
  };
  const getRoleIcon = (role) => {
    const map = {
      admin: '👑', landlord: '🏠', tenant: '👤', manager: '💼',
      'estate-firm': '🏢', provider: '🔧'
    };
    return map[role] || '👤';
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
    <div className="admin-users-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1><Users size={24} /> User Management</h1>
          <p>Manage all users across the platform</p>
          <small>Total: {users.length} users | Last updated: {new Date().toLocaleTimeString()}</small>
        </div>
        <div className="header-right">
          <button 
            className="btn-refresh" 
            onClick={loadUsers}
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            Refresh
          </button>
          <button 
            className="btn-export" 
            onClick={handleExportUsers}
            disabled={filteredUsers.length === 0}
          >
            <Download size={18} /> Export CSV ({filteredUsers.length})
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-icon total"><Users /></div>
          <div className="stat-content">
            <h3>{users.length}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon verified"><UserCheck /></div>
          <div className="stat-content">
            <h3>{users.filter(u => u.verified).length}</h3>
            <p>Verified Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending"><Shield /></div>
          <div className="stat-content">
            <h3>{users.filter(u => u.needs_verification).length}</h3>
            <p>Pending Verification</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon suspended"><UserX /></div>
          <div className="stat-content">
            <h3>{users.filter(u => u.is_suspended).length}</h3>
            <p>Suspended Users</p>
            <small>{users.filter(u => u.is_banned).length} banned</small>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search users by name, email, phone, or business..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>
        <div className="filter-controls">
          <select value={filters.role} onChange={(e) => setFilters({...filters, role: e.target.value})}>
            <option value="all">All Roles</option>
            {getUniqueRoles().map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
            <option value="inactive">Inactive</option>
          </select>

          <select value={filters.verification} onChange={(e) => setFilters({...filters, verification: e.target.value})}>
            <option value="all">All Verification</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
            <option value="pending">Pending</option>
          </select>

          <button className="btn-clear" onClick={() => setFilters({ role: 'all', status: 'all', verification: 'all', search: '' })}>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        {loading ? (
          <div className="loading-spinner">
            <RefreshCw className="spinning" size={24} />
            <p>Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <h3>No users found</h3>
            <p>Try adjusting your search or filters</p>
            <button className="btn-clear" onClick={() => setFilters({ role: 'all', status: 'all', verification: 'all', search: '' })}>
              Clear all filters
            </button>
          </div>
        ) : (
          <>
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
                          {userItem.avatar_url ? (
                            <img src={userItem.avatar_url} alt={userItem.name} />
                          ) : (
                            getRoleIcon(userItem.userType)
                          )}
                        </div>
                        <div className="user-details">
                          <strong>{userItem.name}</strong>
                          <small>ID: {userItem.id?.substring(0, 8)}...</small>
                          {userItem.business_name && <small>{userItem.business_name}</small>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <div className="contact-item">
                          <Mail size={14} />
                          <span>{userItem.email || 'No email'}</span>
                        </div>
                        {userItem.phone && (
                          <div className="contact-item">
                            <Phone size={14} />
                            <span>{userItem.phone}</span>
                          </div>
                        )}
                        {userItem.state && (
                          <div className="contact-item">
                            <MapPin size={14} />
                            <span>{userItem.state}</span>
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
                      <span className={`status-badge ${userItem.is_suspended ? 'suspended' : userItem.is_banned ? 'banned' : userItem.is_active ? 'active' : 'inactive'}`}>
                        {userItem.is_suspended ? 'Suspended' : 
                         userItem.is_banned ? 'Banned' : 
                         userItem.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="verification-status">
                        {userItem.verified ? (
                          <span className="verified-badge">
                            <CheckCircle size={14} /> Verified
                          </span>
                        ) : userItem.needs_verification ? (
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
                        
                        {!userItem.verified && !userItem.needs_verification && (
                          <button 
                            className="btn-verify"
                            onClick={() => handleVerifyUser(userItem)}
                            title="Verify User"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        
                        {!userItem.is_suspended ? (
                          <button 
                            className="btn-suspend"
                            onClick={() => handleSuspendUser(userItem, true)}
                            title="Suspend User"
                          >
                            <Ban size={16} />
                          </button>
                        ) : (
                          <button 
                            className="btn-unsuspend"
                            onClick={() => handleSuspendUser(userItem, false)}
                            title="Unsuspend User"
                          >
                            <UserCheck size={16} />
                          </button>
                        )}
                        
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteUser(userItem)}
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
            
            <div className="table-footer">
              <span>Showing {filteredUsers.length} of {users.length} users</span>
            </div>
          </>
        )}
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button className="close-modal" onClick={() => setShowUserDetails(false)}>×</button>
            </div>
            <div className="user-details-content">
              <div className="user-header">
                <div className="user-avatar-large">
                  {selectedUser.avatar_url ? (
                    <img src={selectedUser.avatar_url} alt={selectedUser.name} />
                  ) : (
                    getRoleIcon(selectedUser.userType)
                  )}
                </div>
                <div className="user-header-info">
                  <h3>{selectedUser.name}</h3>
                  <div className="user-meta">
                    <span className={`role-badge ${getRoleBadgeColor(selectedUser.userType)}`}>
                      {selectedUser.userType}
                    </span>
                    <span className={`status-badge ${selectedUser.is_suspended ? 'suspended' : selectedUser.is_banned ? 'banned' : 'active'}`}>
                      {selectedUser.is_suspended ? 'Suspended' : selectedUser.is_banned ? 'Banned' : 'Active'}
                    </span>
                    {selectedUser.verified && (
                      <span className="verified-badge">
                        <CheckCircle size={14} /> Verified
                      </span>
                    )}
                  </div>
                  {selectedUser.business_name && <p className="business-name">{selectedUser.business_name}</p>}
                </div>
              </div>
              
              <div className="details-grid">
                <div className="detail-section">
                  <h4>Contact Information</h4>
                  <div className="detail-item"><strong>Email:</strong> {selectedUser.email || 'N/A'}</div>
                  <div className="detail-item"><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</div>
                  <div className="detail-item"><strong>User ID:</strong> {selectedUser.id}</div>
                  {selectedUser.state && (
                    <div className="detail-item"><strong>Location:</strong> {[selectedUser.state, selectedUser.lga, selectedUser.address].filter(Boolean).join(', ')}</div>
                  )}
                </div>
                
                <div className="detail-section">
                  <h4>Account Information</h4>
                  <div className="detail-item"><strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</div>
                  <div className="detail-item"><strong>Last Updated:</strong> {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString() : 'Never'}</div>
                  <div className="detail-item"><strong>Last Login:</strong> {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : 'Never'}</div>
                </div>
                
                {selectedUser.table === 'estate_firm_profiles' && (
                  <div className="detail-section">
                    <h4>Business Information</h4>
                    <div className="detail-item"><strong>Registration:</strong> {selectedUser.registration_number || 'N/A'}</div>
                    <div className="detail-item"><strong>Contact Person:</strong> {selectedUser.contact_person || 'N/A'}</div>
                  </div>
                )}
              </div>
              
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowUserDetails(false)}>Close</button>
                <div className="action-buttons-modal">
                  {!selectedUser.verified && !selectedUser.needs_verification && (
                    <button className="btn-primary" onClick={() => { handleVerifyUser(selectedUser); setShowUserDetails(false); }}>
                      <CheckCircle size={16} /> Verify
                    </button>
                  )}
                  {!selectedUser.is_suspended ? (
                    <button className="btn-warning" onClick={() => { handleSuspendUser(selectedUser, true); setShowUserDetails(false); }}>
                      <Ban size={16} /> Suspend
                    </button>
                  ) : (
                    <button className="btn-success" onClick={() => { handleSuspendUser(selectedUser, false); setShowUserDetails(false); }}>
                      <UserCheck size={16} /> Unsuspend
                    </button>
                  )}
                  <button className="btn-danger" onClick={() => handleDeleteUser(selectedUser)}>
                    <Trash2 size={16} /> Delete
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