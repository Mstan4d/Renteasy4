// src/modules/admin/pages/AdminUsers.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import { 
  Users, UserCheck, UserX, Shield, Mail, Phone, 
  Filter, Search, MoreVertical, Edit, Trash2, Ban,
  Download, Eye, CheckCircle, XCircle, Calendar,
  MapPin, Building, Home, AlertCircle, RefreshCw,
  ExternalLink, MessageSquare, Settings, Key
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

  // Load users from Supabase
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all profiles (regular users)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch service providers (includes managers, estate properties, service providers)
      const { data: serviceProviders, error: providersError } = await supabase
        .from('service_providers')
        .select('*')
        .order('created_at', { ascending: false });

      if (providersError) throw providersError;

      // Transform profiles to unified format
      const transformedProfiles = profiles.map(profile => ({
        id: profile.id,
        auth_id: profile.auth_id,
        name: profile.name || profile.full_name || 'Unnamed User',
        email: profile.email,
        phone: profile.phone,
        role: profile.role,
        type: 'user',
        userType: profile.role,
        verified: profile.verified,
        needs_verification: profile.needs_verification,
        is_active: profile.is_active,
        is_suspended: profile.is_suspended,
        is_banned: profile.is_banned,
        avatar_url: profile.avatar_url,
        state: profile.state,
        lga: profile.lga,
        address: profile.address,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        last_login: profile.last_login,
        metadata: profile.metadata,
        // Additional fields from Supabase
        ...profile
      }));

      // Transform service providers to unified format
      const transformedProviders = serviceProviders.map(provider => ({
        id: provider.id,
        auth_id: provider.user_id,
        name: provider.business_name || provider.owner_name || provider.estate_name || provider.company_name || 'Unnamed Provider',
        email: provider.email,
        phone: provider.phone,
        role: provider.service_type === 'manager' ? 'manager' : 
              provider.service_type === 'estate_property' ? 'estate-firm' : 'provider',
        type: 'provider',
        userType: provider.service_type === 'manager' ? 'manager' : 
                 provider.service_type === 'estate_property' ? 'estate-firm' : 'provider',
        verified: provider.verified,
        needs_verification: provider.needs_verification,
        is_active: provider.is_active,
        is_suspended: provider.is_suspended,
        is_banned: provider.is_banned,
        service_type: provider.service_type,
        business_name: provider.business_name,
        owner_name: provider.owner_name,
        estate_name: provider.estate_name,
        company_name: provider.company_name,
        state: provider.state,
        lga: provider.lga || provider.city,
        address: provider.address,
        services: provider.services ? JSON.parse(provider.services) : [],
        createdAt: provider.created_at,
        updatedAt: provider.updated_at,
        verification_data: provider.verification_data,
        // Additional fields
        ...provider
      }));

      // Combine all users
      const allUsers = [...transformedProfiles, ...transformedProviders];
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
    
    // Set up real-time subscriptions
    const profilesChannel = supabase
      .channel('admin-profiles-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, () => {
        loadUsers();
      })
      .subscribe();

    const providersChannel = supabase
      .channel('admin-providers-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'service_providers'
      }, () => {
        loadUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(providersChannel);
    };
  }, [user, loadUsers]);

  // Apply filters
  useEffect(() => {
    let filtered = [...users];

    // Role filter
    if (filters.role !== 'all') {
      filtered = filtered.filter(u => u.userType === filters.role);
    }

    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'active') {
        filtered = filtered.filter(u => u.is_active && !u.is_suspended && !u.is_banned);
      } else if (filters.status === 'suspended') {
        filtered = filtered.filter(u => u.is_suspended);
      } else if (filters.status === 'banned') {
        filtered = filtered.filter(u => u.is_banned);
      } else if (filters.status === 'inactive') {
        filtered = filtered.filter(u => !u.is_active);
      }
    }

    // Verification filter
    if (filters.verification !== 'all') {
      if (filters.verification === 'verified') {
        filtered = filtered.filter(u => u.verified);
      } else if (filters.verification === 'unverified') {
        filtered = filtered.filter(u => !u.verified && !u.userVerified);
      } else if (filters.verification === 'pending') {
        filtered = filtered.filter(u => u.needs_verification);
      }
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(u => 
        u.name?.toLowerCase().includes(searchTerm) ||
        u.email?.toLowerCase().includes(searchTerm) ||
        u.phone?.includes(searchTerm) ||
        u.userType?.toLowerCase().includes(searchTerm) ||
        u.business_name?.toLowerCase().includes(searchTerm) ||
        u.estate_name?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredUsers(filtered);
  }, [filters, users]);

  // Verify user
  const handleVerifyUser = async (userId, userType) => {
    try {
      if (userType === 'provider') {
        // Update in service_providers table
        const { data: provider, error: fetchError } = await supabase
          .from('service_providers')
          .select('*')
          .eq('id', userId)
          .single();

        if (fetchError) throw fetchError;

        const { error } = await supabase
          .from('service_providers')
          .update({
            verified: true,
            needs_verification: false,
            verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) throw error;
      } else {
        // Update in profiles table
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (fetchError) throw fetchError;

        const { error } = await supabase
          .from('profiles')
          .update({
            verified: true,
            needs_verification: false,
            verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) throw error;
      }

      // Log activity
      await logActivity(`Verified user: ${users.find(u => u.id === userId)?.name}`, 'user', userId);
      
      // Refresh users
      loadUsers();
      
      alert('User verified successfully!');
    } catch (error) {
      console.error('Error verifying user:', error);
      alert('Failed to verify user. Please try again.');
    }
  };

  // Suspend/Unsuspend user
  const handleSuspendUser = async (userId, suspend = true, userType) => {
    try {
      if (userType === 'provider') {
        const { error } = await supabase
          .from('service_providers')
          .update({
            is_suspended: suspend,
            suspended_at: suspend ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('profiles')
          .update({
            is_suspended: suspend,
            suspended_at: suspend ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) throw error;
      }

      await logActivity(
        `${suspend ? 'Suspended' : 'Unsuspended'} user: ${users.find(u => u.id === userId)?.name}`,
        'user',
        userId
      );
      
      loadUsers();
      alert(`User ${suspend ? 'suspended' : 'unsuspended'} successfully!`);
    } catch (error) {
      console.error(`Error ${suspend ? 'suspending' : 'unsuspending'} user:`, error);
      alert(`Failed to ${suspend ? 'suspend' : 'unsuspend'} user. Please try again.`);
    }
  };

  // Ban user
  const handleBanUser = async (userId, ban = true, userType) => {
    try {
      if (userType === 'provider') {
        const { error } = await supabase
          .from('service_providers')
          .update({
            is_banned: ban,
            banned_at: ban ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('profiles')
          .update({
            is_banned: ban,
            banned_at: ban ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) throw error;
      }

      await logActivity(
        `${ban ? 'Banned' : 'Unbanned'} user: ${users.find(u => u.id === userId)?.name}`,
        'user',
        userId
      );
      
      loadUsers();
      alert(`User ${ban ? 'banned' : 'unbanned'} successfully!`);
    } catch (error) {
      console.error(`Error ${ban ? 'banning' : 'unbanning'} user:`, error);
      alert(`Failed to ${ban ? 'ban' : 'unban'} user. Please try again.`);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId, userType) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const userName = users.find(u => u.id === userId)?.name;

      if (userType === 'provider') {
        // First, check if there are any related listings or other data
        const { data: listings, error: listingsError } = await supabase
          .from('listings')
          .select('id')
          .eq('user_id', userId);

        if (listingsError) throw listingsError;

        if (listings && listings.length > 0) {
          if (!window.confirm(`This user has ${listings.length} listings. Delete anyway?`)) {
            return;
          }
        }

        const { error } = await supabase
          .from('service_providers')
          .delete()
          .eq('id', userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);

        if (error) throw error;
      }

      await logActivity(`Deleted user: ${userName}`, 'user', userId);
      loadUsers();
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. They may have related records that need to be handled first.');
    }
  };

  // Log activity
  const logActivity = async (action, type, entityId = null) => {
    try {
      const { error } = await supabase
        .from('admin_activities')
        .insert({
          admin_id: user?.id,
          action,
          type,
          entity_id: entityId,
          details: { 
            admin_name: user?.name || 'Admin',
            admin_email: user?.email 
          },
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  // Export users to CSV
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
      alert('Failed to export users. Please try again.');
    }
  };

  // Get unique roles for filter
  const getUniqueRoles = () => {
    const roles = [...new Set(users.map(u => u.userType).filter(Boolean))];
    return roles.sort();
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin': return 'badge-admin';
      case 'landlord': return 'badge-landlord';
      case 'tenant': return 'badge-tenant';
      case 'manager': return 'badge-manager';
      case 'estate-firm': return 'badge-estate';
      case 'provider': return 'badge-provider';
      case 'estate_property': return 'badge-estate';
      default: return 'badge-default';
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return '👑';
      case 'landlord': return '🏠';
      case 'tenant': return '👤';
      case 'manager': return '💼';
      case 'estate-firm':
      case 'estate_property': return '🏢';
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
    <div className="admin-users-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1><Users size={24} /> User Management</h1>
          <p>Manage all users, landlords, tenants, and service providers</p>
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
          <div className="stat-icon total">
            <Users />
          </div>
          <div className="stat-content">
            <h3>{users.length}</h3>
            <p>Total Users</p>
            <small>All accounts</small>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon verified">
            <UserCheck />
          </div>
          <div className="stat-content">
            <h3>{users.filter(u => u.verified).length}</h3>
            <p>Verified Users</p>
            <small>{users.length > 0 ? Math.round((users.filter(u => u.verified).length / users.length) * 100) : 0}% verified</small>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <Shield />
          </div>
          <div className="stat-content">
            <h3>{users.filter(u => u.needs_verification).length}</h3>
            <p>Pending Verification</p>
            <small>Requires action</small>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon suspended">
            <UserX />
          </div>
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
          <select 
            value={filters.role}
            onChange={(e) => setFilters({...filters, role: e.target.value})}
          >
            <option value="all">All Roles</option>
            {getUniqueRoles().map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          <select 
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
            <option value="inactive">Inactive</option>
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
          <div className="loading-spinner">
            <RefreshCw className="spinning" size={24} />
            <p>Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <h3>No users found</h3>
            <p>Try adjusting your search or filters</p>
            <button 
              className="btn-clear"
              onClick={() => setFilters({
                role: 'all',
                status: 'all',
                verification: 'all',
                search: ''
              })}
            >
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
                          {userItem.type === 'provider' && (
                            <small className="text-muted">{userItem.service_type}</small>
                          )}
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
                      {userItem.type === 'provider' && (
                        <small className="text-muted">{userItem.type}</small>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${userItem.is_suspended ? 'suspended' : userItem.is_banned ? 'banned' : userItem.is_active ? 'active' : 'inactive'}`}>
                        {userItem.is_suspended ? 'Suspended' : 
                         userItem.is_banned ? 'Banned' : 
                         userItem.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {userItem.last_login && (
                        <small className="text-muted">
                          Last login: {new Date(userItem.last_login).toLocaleDateString()}
                        </small>
                      )}
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
                      <small className="text-muted">
                        {userItem.updatedAt && `Updated: ${new Date(userItem.updatedAt).toLocaleDateString()}`}
                      </small>
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
                            onClick={() => handleVerifyUser(userItem.id, userItem.type)}
                            title="Verify User"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        
                        {!userItem.is_suspended ? (
                          <button 
                            className="btn-suspend"
                            onClick={() => handleSuspendUser(userItem.id, true, userItem.type)}
                            title="Suspend User"
                          >
                            <Ban size={16} />
                          </button>
                        ) : (
                          <button 
                            className="btn-unsuspend"
                            onClick={() => handleSuspendUser(userItem.id, false, userItem.type)}
                            title="Unsuspend User"
                          >
                            <UserCheck size={16} />
                          </button>
                        )}
                        
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteUser(userItem.id, userItem.type)}
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
              <div className="pagination">
                <button disabled>Previous</button>
                <span className="current-page">1</span>
                <button>Next</button>
              </div>
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
                  {selectedUser.business_name && (
                    <p className="business-name">{selectedUser.business_name}</p>
                  )}
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
                    <span className="user-id">{selectedUser.id}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Auth ID:</strong>
                    <span className="text-muted">{selectedUser.auth_id || 'N/A'}</span>
                  </div>
                  {(selectedUser.state || selectedUser.address) && (
                    <div className="detail-item">
                      <strong>Location:</strong>
                      <span>{[selectedUser.state, selectedUser.lga, selectedUser.address].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                </div>
                
                <div className="detail-section">
                  <h4>Account Information</h4>
                  <div className="detail-item">
                    <strong>Account Type:</strong>
                    <span>{selectedUser.type} / {selectedUser.userType}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Created:</strong>
                    <span>{new Date(selectedUser.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Last Updated:</strong>
                    <span>{selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString() : 'Never'}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Last Login:</strong>
                    <span>{selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : 'Never'}</span>
                  </div>
                  {selectedUser.verified && selectedUser.verified_at && (
                    <div className="detail-item">
                      <strong>Verified At:</strong>
                      <span>{new Date(selectedUser.verified_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>
                
                {(selectedUser.business_name || selectedUser.services || selectedUser.service_type) && (
                  <div className="detail-section">
                    <h4>Service Information</h4>
                    {selectedUser.business_name && (
                      <div className="detail-item">
                        <strong>Business Name:</strong>
                        <span>{selectedUser.business_name}</span>
                      </div>
                    )}
                    {selectedUser.owner_name && (
                      <div className="detail-item">
                        <strong>Owner Name:</strong>
                        <span>{selectedUser.owner_name}</span>
                      </div>
                    )}
                    {selectedUser.service_type && (
                      <div className="detail-item">
                        <strong>Service Type:</strong>
                        <span>{selectedUser.service_type}</span>
                      </div>
                    )}
                    {selectedUser.services && selectedUser.services.length > 0 && (
                      <div className="detail-item">
                        <strong>Services Offered:</strong>
                        <div className="services-list">
                          {selectedUser.services.map((service, index) => (
                            <span key={index} className="service-tag">{service}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedUser.verification_data && (
                      <div className="detail-item">
                        <strong>Verification Data:</strong>
                        <pre className="verification-data">
                          {JSON.stringify(selectedUser.verification_data, null, 2)}
                        </pre>
                      </div>
                    )}
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
                  {!selectedUser.verified && !selectedUser.needs_verification && (
                    <button 
                      className="btn-primary"
                      onClick={() => {
                        handleVerifyUser(selectedUser.id, selectedUser.type);
                        setShowUserDetails(false);
                      }}
                    >
                      <CheckCircle size={16} /> Verify User
                    </button>
                  )}
                  {!selectedUser.is_suspended ? (
                    <>
                      <button 
                        className="btn-warning"
                        onClick={() => {
                          handleSuspendUser(selectedUser.id, true, selectedUser.type);
                          setShowUserDetails(false);
                        }}
                      >
                        <Ban size={16} /> Suspend
                      </button>
                      <button 
                        className="btn-danger"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to ban this user?')) {
                            handleBanUser(selectedUser.id, true, selectedUser.type);
                            setShowUserDetails(false);
                          }
                        }}
                      >
                        <UserX size={16} /> Ban User
                      </button>
                    </>
                  ) : (
                    <button 
                      className="btn-success"
                      onClick={() => {
                        handleSuspendUser(selectedUser.id, false, selectedUser.type);
                        setShowUserDetails(false);
                      }}
                    >
                      <UserCheck size={16} /> Unsuspend
                    </button>
                  )}
                  <button 
                    className="btn-danger"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this user?')) {
                        handleDeleteUser(selectedUser.id, selectedUser.type);
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