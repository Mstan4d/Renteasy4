// src/modules/admin/pages/AdminVerification.jsx
import React, { useState, useEffect } from 'react';
import {
  Users, ShieldCheck, CheckCircle, XCircle, Clock,
  Search, Filter, Eye, Download, AlertCircle,
  UserCheck, UserX, Mail, Phone, MapPin, Calendar,
  FileText, Image as ImageIcon, ExternalLink,
  Building, UserCog, BadgeCheck, Briefcase, MapPin as MapPinIcon,
  Home, DollarSign, FileCheck, AlertTriangle
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import './AdminVerification.css';

const AdminVerification = () => {
  const { user: currentAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('userKyc'); // 'userKyc', 'managerKyc', 'estateFirmKyc'

  // ---------- STATE ----------
  // User KYC (tenants, landlords, service providers)
  const [userVerifications, setUserVerifications] = useState([]);
  const [filteredUserVerifications, setFilteredUserVerifications] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  // Manager KYC
  const [managerVerifications, setManagerVerifications] = useState([]);
  const [filteredManagerVerifications, setFilteredManagerVerifications] = useState([]);
  const [managerSearchTerm, setManagerSearchTerm] = useState('');
  const [managerStatusFilter, setManagerStatusFilter] = useState('all');

  // Estate Firm KYC
  const [estateFirmVerifications, setEstateFirmVerifications] = useState([]);
  const [filteredEstateFirmVerifications, setFilteredEstateFirmVerifications] = useState([]);
  const [estateFirmSearchTerm, setEstateFirmSearchTerm] = useState('');
  const [estateFirmStatusFilter, setEstateFirmStatusFilter] = useState('all');

  // Documents map: key = profileId, value = array of documents
  const [documentsMap, setDocumentsMap] = useState({});

  // Loading states
  const [loading, setLoading] = useState({
    user: false,
    manager: false,
    estate: false
  });

  // Selected items for modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);
  const [selectedEstateFirm, setSelectedEstateFirm] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [showEstateFirmModal, setShowEstateFirmModal] = useState(false);

  // Stats
  const [userStats, setUserStats] = useState({ total:0, pending:0, approved:0, rejected:0, under_review:0 });
  const [managerStats, setManagerStats] = useState({ total:0, pending:0, approved:0, rejected:0 });
  const [estateStats, setEstateStats] = useState({ total:0, pending:0, approved:0, rejected:0, under_review:0 });

  // ---------- HELPER: LOG ADMIN ACTIVITY ----------
  const logAdminActivity = async (type, entityId, details = {}) => {
    if (!currentAdmin) return;
    try {
      await supabase.from('admin_activities').insert({
        admin_id: currentAdmin.id,
        type,
        entity_id: entityId,
        details,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log admin activity:', error);
    }
  };

  // ---------- FETCH DOCUMENTS FOR A LIST OF PROFILE IDS ----------
  const fetchDocumentsForProfiles = async (profileIds) => {
    if (!profileIds.length) return {};
    const { data, error } = await supabase
      .from('verification_documents')
      .select('*')
      .in('provider_id', profileIds); // provider_id = profile id
    if (error) {
      console.error('Error fetching documents:', error);
      return {};
    }
    const grouped = {};
    data.forEach(doc => {
      if (!grouped[doc.provider_id]) grouped[doc.provider_id] = [];
      grouped[doc.provider_id].push(doc);
    });
    return grouped;
  };

  // ---------- FETCH DATA FROM SUPABASE ----------
  // 1. User KYC (tenants, landlords, service-providers)
  const fetchUserKyc = async () => {
    setLoading(prev => ({ ...prev, user: true }));
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .not('role', 'in', '("manager","estate-firm","estate_firm")')
        .not('kyc_status', 'eq', 'not_started')
        .order('kyc_submitted_at', { ascending: false });

      if (error) throw error;

      const profileIds = data.map(p => p.id);
      const docs = await fetchDocumentsForProfiles(profileIds);
      setDocumentsMap(prev => ({ ...prev, ...docs }));

      setUserVerifications(data || []);
      calculateUserStats(data || []);
    } catch (error) {
      console.error('Error fetching user KYC:', error);
    } finally {
      setLoading(prev => ({ ...prev, user: false }));
    }
  };

  // 2. Manager KYC
  const fetchManagerKyc = async () => {
    setLoading(prev => ({ ...prev, manager: true }));
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'manager')
        .not('kyc_status', 'eq', 'not_started')
        .order('kyc_submitted_at', { ascending: false });

      if (error) throw error;

      const profileIds = data.map(p => p.id);
      const docs = await fetchDocumentsForProfiles(profileIds);
      setDocumentsMap(prev => ({ ...prev, ...docs }));

      setManagerVerifications(data || []);
      calculateManagerStats(data || []);
    } catch (error) {
      console.error('Error fetching manager KYC:', error);
    } finally {
      setLoading(prev => ({ ...prev, manager: false }));
    }
  };

  // 3. Estate Firm KYC
  const fetchEstateFirmKyc = async () => {
    setLoading(prev => ({ ...prev, estate: true }));
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or('role.eq.estate-firm,role.eq.estate_firm')
        .not('kyc_status', 'eq', 'not_started')
        .order('kyc_submitted_at', { ascending: false });

      if (error) throw error;

      const profileIds = data.map(p => p.id);
      const docs = await fetchDocumentsForProfiles(profileIds);
      setDocumentsMap(prev => ({ ...prev, ...docs }));

      setEstateFirmVerifications(data || []);
      calculateEstateStats(data || []);
    } catch (error) {
      console.error('Error fetching estate firm KYC:', error);
    } finally {
      setLoading(prev => ({ ...prev, estate: false }));
    }
  };

  // Initial load
  useEffect(() => {
    fetchUserKyc();
    fetchManagerKyc();
    fetchEstateFirmKyc();
  }, []);

  // ---------- STATS CALCULATION ----------
  const calculateUserStats = (data) => {
    const total = data.length;
    const pending = data.filter(v => v.kyc_status === 'pending').length;
    const approved = data.filter(v => v.kyc_status === 'approved').length;
    const rejected = data.filter(v => v.kyc_status === 'rejected').length;
    const under_review = data.filter(v => v.kyc_status === 'under_review').length;
    setUserStats({ total, pending, approved, rejected, under_review });
  };

  const calculateManagerStats = (data) => {
    const total = data.length;
    const pending = data.filter(v => v.kyc_status === 'pending').length;
    const approved = data.filter(v => v.kyc_status === 'approved').length;
    const rejected = data.filter(v => v.kyc_status === 'rejected').length;
    setManagerStats({ total, pending, approved, rejected });
  };

  const calculateEstateStats = (data) => {
    const total = data.length;
    const pending = data.filter(v => v.kyc_status === 'pending').length;
    const approved = data.filter(v => v.kyc_status === 'approved').length;
    const rejected = data.filter(v => v.kyc_status === 'rejected').length;
    const under_review = data.filter(v => v.kyc_status === 'under_review').length;
    setEstateStats({ total, pending, approved, rejected, under_review });
  };

  // ---------- FILTERING (CLIENT-SIDE) ----------
  useEffect(() => {
    filterUserVerifications();
  }, [userSearchTerm, userStatusFilter, userVerifications]);

  useEffect(() => {
    filterManagerVerifications();
  }, [managerSearchTerm, managerStatusFilter, managerVerifications]);

  useEffect(() => {
    filterEstateVerifications();
  }, [estateFirmSearchTerm, estateFirmStatusFilter, estateFirmVerifications]);

  const filterUserVerifications = () => {
    let filtered = [...userVerifications];
    if (userSearchTerm) {
      filtered = filtered.filter(v =>
        v.full_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        v.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        v.kyc_data?.id_number?.includes(userSearchTerm)
      );
    }
    if (userStatusFilter !== 'all') {
      filtered = filtered.filter(v => v.kyc_status === userStatusFilter);
    }
    setFilteredUserVerifications(filtered);
  };

  const filterManagerVerifications = () => {
    let filtered = [...managerVerifications];
    if (managerSearchTerm) {
      filtered = filtered.filter(m =>
        m.full_name?.toLowerCase().includes(managerSearchTerm.toLowerCase()) ||
        m.email?.toLowerCase().includes(managerSearchTerm.toLowerCase()) ||
        m.phone?.includes(managerSearchTerm)
      );
    }
    if (managerStatusFilter !== 'all') {
      filtered = filtered.filter(m => m.kyc_status === managerStatusFilter);
    }
    setFilteredManagerVerifications(filtered);
  };

  const filterEstateVerifications = () => {
    let filtered = [...estateFirmVerifications];
    if (estateFirmSearchTerm) {
      filtered = filtered.filter(e =>
        e.full_name?.toLowerCase().includes(estateFirmSearchTerm.toLowerCase()) ||
        e.email?.toLowerCase().includes(estateFirmSearchTerm.toLowerCase()) ||
        e.kyc_data?.business_name?.toLowerCase().includes(estateFirmSearchTerm.toLowerCase())
      );
    }
    if (estateFirmStatusFilter !== 'all') {
      filtered = filtered.filter(e => e.kyc_status === estateFirmStatusFilter);
    }
    setFilteredEstateFirmVerifications(filtered);
  };

  // ---------- UPDATE VERIFICATION STATUS ----------
  const updateUserVerification = async (profileId, newStatus, notes = '') => {
    try {
      const updates = {
        kyc_status: newStatus,
        is_kyc_verified: newStatus === 'approved',
        ...(newStatus === 'approved' && { kyc_verified_at: new Date().toISOString() }),
        ...(newStatus === 'rejected' && { kyc_rejected_at: new Date().toISOString(), kyc_rejection_reason: notes }),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profileId);

      if (error) throw error;

      await logAdminActivity(
        `user_kyc_${newStatus}`,
        profileId,
        { notes, previous_status: userVerifications.find(u => u.id === profileId)?.kyc_status }
      );

      fetchUserKyc();
      setShowUserModal(false);
    } catch (error) {
      alert(`Update failed: ${error.message}`);
    }
  };

  const updateManagerVerification = async (profileId, newStatus, notes = '') => {
    try {
      const updates = {
        kyc_status: newStatus,
        is_kyc_verified: newStatus === 'approved',
        ...(newStatus === 'approved' && { kyc_verified_at: new Date().toISOString() }),
        ...(newStatus === 'rejected' && { kyc_rejected_at: new Date().toISOString(), kyc_rejection_reason: notes }),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profileId);

      if (error) throw error;

      await logAdminActivity(`manager_kyc_${newStatus}`, profileId, { notes });
      fetchManagerKyc();
      setShowManagerModal(false);
    } catch (error) {
      alert(`Update failed: ${error.message}`);
    }
  };

  const updateEstateFirmVerification = async (profileId, newStatus, notes = '') => {
    try {
      const updates = {
        kyc_status: newStatus,
        is_kyc_verified: newStatus === 'approved',
        ...(newStatus === 'approved' && { kyc_verified_at: new Date().toISOString() }),
        ...(newStatus === 'rejected' && { kyc_rejected_at: new Date().toISOString(), kyc_rejection_reason: notes }),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profileId);

      if (error) throw error;

      await logAdminActivity(`estate_firm_kyc_${newStatus}`, profileId, { notes });
      fetchEstateFirmKyc();
      setShowEstateFirmModal(false);
    } catch (error) {
      alert(`Update failed: ${error.message}`);
    }
  };

  // ---------- BULK APPROVALS ----------
  const bulkApproveUsers = async () => {
    const pendingIds = filteredUserVerifications
      .filter(v => v.kyc_status === 'pending')
      .map(v => v.id);
    if (pendingIds.length === 0) return;
    if (!window.confirm(`Approve ${pendingIds.length} user KYC submissions?`)) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          kyc_status: 'approved',
          is_kyc_verified: true,
          kyc_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .in('id', pendingIds);

      if (error) throw error;

      await logAdminActivity('bulk_approve_users', null, { count: pendingIds.length });
      fetchUserKyc();
    } catch (error) {
      alert(`Bulk approve failed: ${error.message}`);
    }
  };

  const bulkApproveManagers = async () => {
    const pendingIds = filteredManagerVerifications
      .filter(m => m.kyc_status === 'pending')
      .map(m => m.id);
    if (pendingIds.length === 0) return;
    if (!window.confirm(`Approve ${pendingIds.length} manager KYC submissions?`)) return;

    try {
      await supabase
        .from('profiles')
        .update({
          kyc_status: 'approved',
          is_kyc_verified: true,
          kyc_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .in('id', pendingIds);

      await logAdminActivity('bulk_approve_managers', null, { count: pendingIds.length });
      fetchManagerKyc();
    } catch (error) {
      alert(`Bulk approve failed: ${error.message}`);
    }
  };

  const bulkApproveEstateFirms = async () => {
    const pendingIds = filteredEstateFirmVerifications
      .filter(e => e.kyc_status === 'pending')
      .map(e => e.id);
    if (pendingIds.length === 0) return;
    if (!window.confirm(`Approve ${pendingIds.length} estate firm KYC submissions?`)) return;

    try {
      await supabase
        .from('profiles')
        .update({
          kyc_status: 'approved',
          is_kyc_verified: true,
          kyc_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .in('id', pendingIds);

      await logAdminActivity('bulk_approve_estate_firms', null, { count: pendingIds.length });
      fetchEstateFirmKyc();
    } catch (error) {
      alert(`Bulk approve failed: ${error.message}`);
    }
  };

  // ---------- EXPORT CSV ----------
  const exportToCsv = () => {
    let data, headers, fileName;
    if (activeTab === 'userKyc') {
      data = filteredUserVerifications;
      headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Submitted', 'Verified'];
      fileName = 'user_kyc.csv';
    } else if (activeTab === 'managerKyc') {
      data = filteredManagerVerifications;
      headers = ['ID', 'Name', 'Email', 'Phone', 'State', 'Status', 'Submitted', 'Verified'];
      fileName = 'manager_kyc.csv';
    } else {
      data = filteredEstateFirmVerifications;
      headers = ['ID', 'Business Name', 'Email', 'Phone', 'State', 'Status', 'Submitted', 'Verified'];
      fileName = 'estate_firm_kyc.csv';
    }

    const csvRows = [];
    csvRows.push(headers.join(','));
    for (const row of data) {
      const values = [
        row.id,
        row.full_name || row.kyc_data?.business_name || '',
        row.email,
        row.phone || '',
        row.state || '',
        row.kyc_status || '',
        row.kyc_submitted_at ? new Date(row.kyc_submitted_at).toLocaleDateString() : '',
        row.kyc_verified_at ? new Date(row.kyc_verified_at).toLocaleDateString() : ''
      ].map(v => `"${String(v).replace(/"/g, '""')}"`);
      csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---------- UI HELPERS ----------
  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      case 'under_review': return 'info';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'rejected': return <XCircle size={16} />;
      case 'under_review': return <AlertCircle size={16} />;
      default: return null;
    }
  };

  const renderDocuments = (profileId) => {
    const docs = documentsMap[profileId] || [];
    if (docs.length === 0) return <p>No documents uploaded.</p>;
    return (
      <div className="document-list">
        {docs.map(doc => (
          <div key={doc.id} className="document-item">
            <FileText size={16} />
            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
              {doc.file_name || doc.document_type}
            </a>
            {doc.file_url.match(/\.(jpg|jpeg|png|gif)$/i) && (
              <img src={doc.file_url} alt="Document preview" style={{ maxWidth: '100px', marginLeft: '1rem' }} />
            )}
          </div>
        ))}
      </div>
    );
  };

  // ---------- RENDER ----------
  return (
    <div className="admin-verification">
      <div className="verification-header">
        <div className="header-left">
          <h1><ShieldCheck size={28} /> KYC Verification Dashboard</h1>
          <p>Verify user, manager, and estate firm identity documents and KYC submissions</p>
        </div>
        <div className="header-right">
          <div className="tab-switcher">
            <button
              className={`tab-btn ${activeTab === 'userKyc' ? 'active' : ''}`}
              onClick={() => setActiveTab('userKyc')}
            >
              <Users size={18} /> User KYC
            </button>
            <button
              className={`tab-btn ${activeTab === 'managerKyc' ? 'active' : ''}`}
              onClick={() => setActiveTab('managerKyc')}
            >
              <Building size={18} /> Manager KYC
            </button>
            <button
              className={`tab-btn ${activeTab === 'estateFirmKyc' ? 'active' : ''}`}
              onClick={() => setActiveTab('estateFirmKyc')}
            >
              <Home size={18} /> Estate Firm KYC
            </button>
          </div>

          {activeTab === 'userKyc' && userStats.pending > 0 && (
            <button className="btn-bulk-approve" onClick={bulkApproveUsers}>
              <CheckCircle size={18} /> Approve All ({userStats.pending})
            </button>
          )}
          {activeTab === 'managerKyc' && managerStats.pending > 0 && (
            <button className="btn-bulk-approve" onClick={bulkApproveManagers}>
              <CheckCircle size={18} /> Approve All ({managerStats.pending})
            </button>
          )}
          {activeTab === 'estateFirmKyc' && estateStats.pending > 0 && (
            <button className="btn-bulk-approve" onClick={bulkApproveEstateFirms}>
              <CheckCircle size={18} /> Approve All ({estateStats.pending})
            </button>
          )}

          <button className="btn-export" onClick={exportToCsv}>
            <Download size={18} /> Export Data
          </button>
        </div>
      </div>

      {/* User KYC Tab */}
      {activeTab === 'userKyc' && (
        <div className="tab-content">
          <div className="verification-stats">
            <div className="stat-card"><Users size={24} /><h3>{userStats.total}</h3><p>Total</p></div>
            <div className="stat-card"><Clock size={24} /><h3>{userStats.pending}</h3><p>Pending</p></div>
            <div className="stat-card"><CheckCircle size={24} /><h3>{userStats.approved}</h3><p>Approved</p></div>
            <div className="stat-card"><XCircle size={24} /><h3>{userStats.rejected}</h3><p>Rejected</p></div>
            <div className="stat-card"><AlertCircle size={24} /><h3>{userStats.under_review}</h3><p>Under Review</p></div>
          </div>

          <div className="verification-filters">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
              />
            </div>
            <select value={userStatusFilter} onChange={(e) => setUserStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="under_review">Under Review</option>
            </select>
            <button onClick={() => { setUserSearchTerm(''); setUserStatusFilter('all'); }}>
              <Filter size={16} /> Clear
            </button>
          </div>

          <div className="verification-grid">
            {loading.user && <p>Loading...</p>}
            {!loading.user && filteredUserVerifications.length === 0 && (
              <div className="no-verifications">
                <ShieldCheck size={48} />
                <p>No user KYC submissions found</p>
              </div>
            )}
            {filteredUserVerifications.map((user) => (
              <div key={user.id} className="verification-card">
                <div className="card-header">
                  <div className="user-info">
                    <div className="user-avatar">{user.full_name?.charAt(0) || 'U'}</div>
                    <div>
                      <h4>{user.full_name || 'Unnamed'}</h4>
                      <div className="user-meta">
                        <span><Mail size={12} /> {user.email}</span>
                        <span><Phone size={12} /> {user.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`status-badge ${getStatusColor(user.kyc_status)}`}>
                    {getStatusIcon(user.kyc_status)} {user.kyc_status?.replace('_', ' ') || 'pending'}
                  </span>
                </div>
                <div className="card-body">
                  <div className="kyc-details">
                    <div><span>ID Type:</span> {user.kyc_data?.id_type || 'N/A'}</div>
                    <div><span>ID Number:</span> {user.kyc_data?.id_number || 'N/A'}</div>
                    <div><span>Submitted:</span> {user.kyc_submitted_at ? new Date(user.kyc_submitted_at).toLocaleDateString() : 'N/A'}</div>
                    <div><span>Role:</span> {user.role}</div>
                  </div>
                </div>
                <div className="card-footer">
                  <button onClick={() => { setSelectedUser(user); setShowUserModal(true); }}>
                    <Eye size={16} /> View Details
                  </button>
                  {user.kyc_status === 'pending' && (
                    <>
                      <button onClick={() => updateUserVerification(user.id, 'approved')}>Approve</button>
                      <button onClick={() => { const r = prompt('Rejection reason:'); if(r) updateUserVerification(user.id, 'rejected', r); }}>Reject</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manager KYC Tab */}
      {activeTab === 'managerKyc' && (
        <div className="tab-content">
          <div className="verification-stats">
            <div className="stat-card"><Building size={24} /><h3>{managerStats.total}</h3><p>Total</p></div>
            <div className="stat-card"><Clock size={24} /><h3>{managerStats.pending}</h3><p>Pending</p></div>
            <div className="stat-card"><CheckCircle size={24} /><h3>{managerStats.approved}</h3><p>Approved</p></div>
            <div className="stat-card"><XCircle size={24} /><h3>{managerStats.rejected}</h3><p>Rejected</p></div>
          </div>

          <div className="verification-filters">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search managers..."
                value={managerSearchTerm}
                onChange={(e) => setManagerSearchTerm(e.target.value)}
              />
            </div>
            <select value={managerStatusFilter} onChange={(e) => setManagerStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button onClick={() => { setManagerSearchTerm(''); setManagerStatusFilter('all'); }}>
              <Filter size={16} /> Clear
            </button>
          </div>

          <div className="verification-grid">
            {loading.manager && <p>Loading...</p>}
            {!loading.manager && filteredManagerVerifications.length === 0 && (
              <div className="no-verifications">
                <Building size={48} />
                <p>No manager KYC submissions found</p>
              </div>
            )}
            {filteredManagerVerifications.map((manager) => (
              <div key={manager.id} className="verification-card">
                <div className="card-header">
                  <div className="user-info">
                    <div className="user-avatar">{manager.full_name?.charAt(0) || 'M'}</div>
                    <div>
                      <h4>{manager.full_name || 'Unnamed'}</h4>
                      <div className="user-meta">
                        <span><Mail size={12} /> {manager.email}</span>
                        <span><Phone size={12} /> {manager.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`status-badge ${getStatusColor(manager.kyc_status)}`}>
                    {getStatusIcon(manager.kyc_status)} {manager.kyc_status?.replace('_', ' ') || 'pending'}
                  </span>
                </div>
                <div className="card-footer">
                  <button onClick={() => { setSelectedManager(manager); setShowManagerModal(true); }}>
                    <Eye size={16} /> View Details
                  </button>
                  {manager.kyc_status === 'pending' && (
                    <>
                      <button onClick={() => updateManagerVerification(manager.id, 'approved')}>Approve</button>
                      <button onClick={() => { const r = prompt('Rejection reason:'); if(r) updateManagerVerification(manager.id, 'rejected', r); }}>Reject</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estate Firm KYC Tab */}
      {activeTab === 'estateFirmKyc' && (
        <div className="tab-content">
          <div className="verification-stats">
            <div className="stat-card"><Home size={24} /><h3>{estateStats.total}</h3><p>Total</p></div>
            <div className="stat-card"><Clock size={24} /><h3>{estateStats.pending}</h3><p>Pending</p></div>
            <div className="stat-card"><CheckCircle size={24} /><h3>{estateStats.approved}</h3><p>Approved</p></div>
            <div className="stat-card"><XCircle size={24} /><h3>{estateStats.rejected}</h3><p>Rejected</p></div>
            <div className="stat-card"><AlertCircle size={24} /><h3>{estateStats.under_review}</h3><p>Under Review</p></div>
          </div>

          <div className="verification-filters">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search estate firms..."
                value={estateFirmSearchTerm}
                onChange={(e) => setEstateFirmSearchTerm(e.target.value)}
              />
            </div>
            <select value={estateFirmStatusFilter} onChange={(e) => setEstateFirmStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="under_review">Under Review</option>
            </select>
            <button onClick={() => { setEstateFirmSearchTerm(''); setEstateFirmStatusFilter('all'); }}>
              <Filter size={16} /> Clear
            </button>
          </div>

          <div className="verification-grid">
            {loading.estate && <p>Loading...</p>}
            {!loading.estate && filteredEstateFirmVerifications.length === 0 && (
              <div className="no-verifications">
                <Home size={48} />
                <p>No estate firm KYC submissions found</p>
              </div>
            )}
            {filteredEstateFirmVerifications.map((firm) => (
              <div key={firm.id} className="verification-card">
                <div className="card-header">
                  <div className="user-info">
                    <div className="user-avatar">{firm.full_name?.charAt(0) || 'E'}</div>
                    <div>
                      <h4>{firm.full_name || 'Unnamed'}</h4>
                      <div className="user-meta">
                        <span><Mail size={12} /> {firm.email}</span>
                        <span><Phone size={12} /> {firm.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`status-badge ${getStatusColor(firm.kyc_status)}`}>
                    {getStatusIcon(firm.kyc_status)} {firm.kyc_status?.replace('_', ' ') || 'pending'}
                  </span>
                </div>
                <div className="card-body">
                  <div className="kyc-details">
                    <div><span>Business Name:</span> {firm.kyc_data?.business_name || 'N/A'}</div>
                    <div><span>Registration:</span> {firm.kyc_data?.registration_number || 'N/A'}</div>
                    <div><span>Submitted:</span> {firm.kyc_submitted_at ? new Date(firm.kyc_submitted_at).toLocaleDateString() : 'N/A'}</div>
                  </div>
                </div>
                <div className="card-footer">
                  <button onClick={() => { setSelectedEstateFirm(firm); setShowEstateFirmModal(true); }}>
                    <Eye size={16} /> View Details
                  </button>
                  {firm.kyc_status === 'pending' && (
                    <>
                      <button onClick={() => updateEstateFirmVerification(firm.id, 'approved')}>Approve</button>
                      <button onClick={() => { const r = prompt('Rejection reason:'); if(r) updateEstateFirmVerification(firm.id, 'rejected', r); }}>Reject</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------- MODALS ---------- */}
      {/* User Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>User KYC Details</h3>
              <button onClick={() => setShowUserModal(false)}><XCircle size={20} /></button>
            </div>
            <div className="modal-body">
              <p><strong>Name:</strong> {selectedUser.full_name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</p>
              <p><strong>Role:</strong> {selectedUser.role}</p>
              <p><strong>ID Type:</strong> {selectedUser.kyc_data?.id_type || 'N/A'}</p>
              <p><strong>ID Number:</strong> {selectedUser.kyc_data?.id_number || 'N/A'}</p>
              <p><strong>Submitted At:</strong> {selectedUser.kyc_submitted_at ? new Date(selectedUser.kyc_submitted_at).toLocaleString() : 'N/A'}</p>

              <h4>Uploaded Documents</h4>
              {renderDocuments(selectedUser.id)}
            </div>
            <div className="modal-footer">
              {selectedUser.kyc_status === 'pending' && (
                <>
                  <button onClick={() => updateUserVerification(selectedUser.id, 'approved')}>Approve</button>
                  <button onClick={() => { const r = prompt('Rejection reason:'); if(r) updateUserVerification(selectedUser.id, 'rejected', r); }}>Reject</button>
                  <button onClick={() => { const n = prompt('Notes:'); if(n) updateUserVerification(selectedUser.id, 'under_review', n); }}>Mark for Review</button>
                </>
              )}
              <button onClick={() => setShowUserModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Manager Modal */}
      {showManagerModal && selectedManager && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Manager KYC Details</h3>
              <button onClick={() => setShowManagerModal(false)}><XCircle size={20} /></button>
            </div>
            <div className="modal-body">
              <p><strong>Name:</strong> {selectedManager.full_name}</p>
              <p><strong>Email:</strong> {selectedManager.email}</p>
              <p><strong>Phone:</strong> {selectedManager.phone || 'N/A'}</p>
              <p><strong>ID Type:</strong> {selectedManager.kyc_data?.id_type || 'N/A'}</p>
              <p><strong>ID Number:</strong> {selectedManager.kyc_data?.id_number || 'N/A'}</p>
              <p><strong>Submitted At:</strong> {selectedManager.kyc_submitted_at ? new Date(selectedManager.kyc_submitted_at).toLocaleString() : 'N/A'}</p>

              <h4>Uploaded Documents</h4>
              {renderDocuments(selectedManager.id)}
            </div>
            <div className="modal-footer">
              {selectedManager.kyc_status === 'pending' && (
                <>
                  <button onClick={() => updateManagerVerification(selectedManager.id, 'approved')}>Approve</button>
                  <button onClick={() => { const r = prompt('Rejection reason:'); if(r) updateManagerVerification(selectedManager.id, 'rejected', r); }}>Reject</button>
                </>
              )}
              <button onClick={() => setShowManagerModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Estate Firm Modal */}
      {showEstateFirmModal && selectedEstateFirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Estate Firm KYC Details</h3>
              <button onClick={() => setShowEstateFirmModal(false)}><XCircle size={20} /></button>
            </div>
            <div className="modal-body">
              <p><strong>Business Name:</strong> {selectedEstateFirm.full_name}</p>
              <p><strong>Email:</strong> {selectedEstateFirm.email}</p>
              <p><strong>Phone:</strong> {selectedEstateFirm.phone || 'N/A'}</p>
              <p><strong>Registration Number:</strong> {selectedEstateFirm.kyc_data?.registration_number || 'N/A'}</p>
              <p><strong>Tax ID:</strong> {selectedEstateFirm.kyc_data?.tax_id || 'N/A'}</p>
              <p><strong>Submitted At:</strong> {selectedEstateFirm.kyc_submitted_at ? new Date(selectedEstateFirm.kyc_submitted_at).toLocaleString() : 'N/A'}</p>

              <h4>Uploaded Documents</h4>
              {renderDocuments(selectedEstateFirm.id)}
            </div>
            <div className="modal-footer">
              {selectedEstateFirm.kyc_status === 'pending' && (
                <>
                  <button onClick={() => updateEstateFirmVerification(selectedEstateFirm.id, 'approved')}>Approve</button>
                  <button onClick={() => { const r = prompt('Rejection reason:'); if(r) updateEstateFirmVerification(selectedEstateFirm.id, 'rejected', r); }}>Reject</button>
                  <button onClick={() => { const n = prompt('Notes:'); if(n) updateEstateFirmVerification(selectedEstateFirm.id, 'under_review', n); }}>Mark for Review</button>
                </>
              )}
              <button onClick={() => setShowEstateFirmModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerification;