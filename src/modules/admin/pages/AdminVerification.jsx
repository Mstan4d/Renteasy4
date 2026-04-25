// src/modules/admin/pages/AdminVerification.jsx
import React, { useState, useEffect } from 'react';
import {
  Users, ShieldCheck, CheckCircle, XCircle, Clock,
  Search, Filter, Eye, Download, AlertCircle,
  UserCheck, UserX, Mail, Phone, MapPin, Calendar,
  FileText, Image as ImageIcon, ExternalLink,
  Building, UserCog, BadgeCheck, Briefcase, MapPin as MapPinIcon,
  Home, DollarSign, FileCheck, AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import './AdminVerification.css';

const AdminVerification = () => {
  const { user: currentAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('userKyc'); // 'userKyc', 'managerKyc', 'estateFirmKyc'

  // ---------- STATE ----------
  const [userVerifications, setUserVerifications] = useState([]);
  const [filteredUserVerifications, setFilteredUserVerifications] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  const [managerVerifications, setManagerVerifications] = useState([]);
  const [filteredManagerVerifications, setFilteredManagerVerifications] = useState([]);
  const [managerSearchTerm, setManagerSearchTerm] = useState('');
  const [managerStatusFilter, setManagerStatusFilter] = useState('all');

  const [estateFirmVerifications, setEstateFirmVerifications] = useState([]);
  const [filteredEstateFirmVerifications, setFilteredEstateFirmVerifications] = useState([]);
  const [estateFirmSearchTerm, setEstateFirmSearchTerm] = useState('');
  const [estateFirmStatusFilter, setEstateFirmStatusFilter] = useState('all');

  const [documentsMap, setDocumentsMap] = useState({}); // profileId -> array of docs
  const [loading, setLoading] = useState({ user: false, manager: false, estate: false });
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);
  const [selectedEstateFirm, setSelectedEstateFirm] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [showEstateFirmModal, setShowEstateFirmModal] = useState(false);
  const [expandedCards, setExpandedCards] = useState({}); // for showing documents inline in cards

  // Stats
  const [userStats, setUserStats] = useState({ total:0, pending:0, approved:0, rejected:0, under_review:0 });
  const [managerStats, setManagerStats] = useState({ total:0, pending:0, approved:0, rejected:0 });
  const [estateStats, setEstateStats] = useState({ total:0, pending:0, approved:0, rejected:0, under_review:0 });

  // Log admin activity
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

  // Fetch documents for a list of profile IDs
  const fetchDocumentsForProfiles = async (profileIds) => {
    if (!profileIds.length) return {};
    const { data, error } = await supabase
      .from('verification_documents')
      .select('*')
      .in('provider_id', profileIds);
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

  // Fetch User KYC (tenants, landlords, service-providers)
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

  // Fetch Manager KYC
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

  // Fetch Estate Firm KYC
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

  useEffect(() => {
    fetchUserKyc();
    fetchManagerKyc();
    fetchEstateFirmKyc();
  }, []);

  // Stats calculations
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

  // Filtering
  useEffect(() => {
    filterUserVerifications();
  }, [userSearchTerm, userStatusFilter, userVerifications]);
  useEffect(() => { filterManagerVerifications(); }, [managerSearchTerm, managerStatusFilter, managerVerifications]);
  useEffect(() => { filterEstateVerifications(); }, [estateFirmSearchTerm, estateFirmStatusFilter, estateFirmVerifications]);

  const filterUserVerifications = () => {
    let filtered = [...userVerifications];
    if (userSearchTerm) {
      filtered = filtered.filter(v => v.full_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) || v.email?.toLowerCase().includes(userSearchTerm.toLowerCase()));
    }
    if (userStatusFilter !== 'all') filtered = filtered.filter(v => v.kyc_status === userStatusFilter);
    setFilteredUserVerifications(filtered);
  };

  const filterManagerVerifications = () => {
    let filtered = [...managerVerifications];
    if (managerSearchTerm) {
      filtered = filtered.filter(m => m.full_name?.toLowerCase().includes(managerSearchTerm.toLowerCase()) || m.email?.toLowerCase().includes(managerSearchTerm.toLowerCase()));
    }
    if (managerStatusFilter !== 'all') filtered = filtered.filter(m => m.kyc_status === managerStatusFilter);
    setFilteredManagerVerifications(filtered);
  };

  const filterEstateVerifications = () => {
    let filtered = [...estateFirmVerifications];
    if (estateFirmSearchTerm) {
      filtered = filtered.filter(e => e.full_name?.toLowerCase().includes(estateFirmSearchTerm.toLowerCase()) || e.email?.toLowerCase().includes(estateFirmSearchTerm.toLowerCase()));
    }
    if (estateFirmStatusFilter !== 'all') filtered = filtered.filter(e => e.kyc_status === estateFirmStatusFilter);
    setFilteredEstateFirmVerifications(filtered);
  };

  // Action: update status
  const updateUserVerification = async (profileId, newStatus, notes = '') => {
    try {
      const updates = {
        kyc_status: newStatus,
        is_kyc_verified: newStatus === 'approved',
        ...(newStatus === 'approved' && { kyc_verified_at: new Date().toISOString() }),
        ...(newStatus === 'rejected' && { kyc_rejected_at: new Date().toISOString(), kyc_rejection_reason: notes }),
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase.from('profiles').update(updates).eq('id', profileId);
      if (error) throw error;
      await logAdminActivity(`user_kyc_${newStatus}`, profileId, { notes });
      fetchUserKyc();
      setShowUserModal(false);
    } catch (error) { alert(`Update failed: ${error.message}`); }
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
      const { error } = await supabase.from('profiles').update(updates).eq('id', profileId);
      if (error) throw error;
      await logAdminActivity(`manager_kyc_${newStatus}`, profileId, { notes });
      fetchManagerKyc();
      setShowManagerModal(false);
    } catch (error) { alert(`Update failed: ${error.message}`); }
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
      const { error } = await supabase.from('profiles').update(updates).eq('id', profileId);
      if (error) throw error;
      await logAdminActivity(`estate_firm_kyc_${newStatus}`, profileId, { notes });
      fetchEstateFirmKyc();
      setShowEstateFirmModal(false);
    } catch (error) { alert(`Update failed: ${error.message}`); }
  };

  // Bulk actions
  const bulkApproveUsers = async () => {
    const pendingIds = filteredUserVerifications.filter(v => v.kyc_status === 'pending').map(v => v.id);
    if (!pendingIds.length) return;
    if (!window.confirm(`Approve ${pendingIds.length} user KYC submissions?`)) return;
    try {
      await supabase.from('profiles').update({ kyc_status: 'approved', is_kyc_verified: true, kyc_verified_at: new Date().toISOString() }).in('id', pendingIds);
      await logAdminActivity('bulk_approve_users', null, { count: pendingIds.length });
      fetchUserKyc();
    } catch (error) { alert(`Bulk approve failed: ${error.message}`); }
  };

  const bulkApproveManagers = async () => {
    const pendingIds = filteredManagerVerifications.filter(m => m.kyc_status === 'pending').map(m => m.id);
    if (!pendingIds.length) return;
    if (!window.confirm(`Approve ${pendingIds.length} manager KYC submissions?`)) return;
    try {
      await supabase.from('profiles').update({ kyc_status: 'approved', is_kyc_verified: true, kyc_verified_at: new Date().toISOString() }).in('id', pendingIds);
      await logAdminActivity('bulk_approve_managers', null, { count: pendingIds.length });
      fetchManagerKyc();
    } catch (error) { alert(`Bulk approve failed: ${error.message}`); }
  };

  const bulkApproveEstateFirms = async () => {
    const pendingIds = filteredEstateFirmVerifications.filter(e => e.kyc_status === 'pending').map(e => e.id);
    if (!pendingIds.length) return;
    if (!window.confirm(`Approve ${pendingIds.length} estate firm KYC submissions?`)) return;
    try {
      await supabase.from('profiles').update({ kyc_status: 'approved', is_kyc_verified: true, kyc_verified_at: new Date().toISOString() }).in('id', pendingIds);
      await logAdminActivity('bulk_approve_estate_firms', null, { count: pendingIds.length });
      fetchEstateFirmKyc();
    } catch (error) { alert(`Bulk approve failed: ${error.message}`); }
  };

  // Export CSV (same as before)
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
    const csvRows = [headers.join(',')];
    for (const row of data) {
      const values = [
        row.id, row.full_name || row.kyc_data?.business_name || '', row.email, row.phone || '',
        row.state || '', row.kyc_status || '', row.kyc_submitted_at ? new Date(row.kyc_submitted_at).toLocaleDateString() : '',
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

  // UI helpers
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

  // Enhanced document renderer with thumbnails
  const renderDocuments = (profileId) => {
    const docs = documentsMap[profileId] || [];
    if (docs.length === 0) return <p className="no-docs">No documents uploaded.</p>;
    return (
      <div className="document-list">
        {docs.map(doc => {
          const isImage = doc.file_url.match(/\.(jpeg|jpg|png|gif)$/i);
          return (
            <div key={doc.id} className="document-item">
              <div className="doc-icon">
                {isImage ? <ImageIcon size={20} /> : <FileText size={20} />}
              </div>
              <div className="doc-info">
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="doc-name">
                  {doc.file_name || doc.document_type || 'Document'}
                </a>
                {isImage && (
                  <div className="doc-thumbnail">
                    <img src={doc.file_url} alt="Preview" style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
              <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="doc-download">
                <Download size={16} />
              </a>
            </div>
          );
        })}
      </div>
    );
  };

  // Inline document preview toggle for cards
  const toggleCardDocs = (id, type) => {
    setExpandedCards(prev => ({ ...prev, [type+id]: !prev[type+id] }));
  };

  // Render card with document expand/collapse
  const renderVerificationCard = (item, type) => {
    const isExpanded = expandedCards[type+item.id];
    const docs = documentsMap[item.id] || [];
    const hasDocs = docs.length > 0;
    return (
      <div key={item.id} className="verification-card">
        <div className="card-header">
          <div className="user-info">
            <div className="user-avatar">{item.full_name?.charAt(0) || 'U'}</div>
            <div>
              <h4>{item.full_name || 'Unnamed'}</h4>
              <div className="user-meta">
                <span><Mail size={12} /> {item.email}</span>
                <span><Phone size={12} /> {item.phone || 'N/A'}</span>
              </div>
            </div>
          </div>
          <span className={`status-badge ${getStatusColor(item.kyc_status)}`}>
            {getStatusIcon(item.kyc_status)} {item.kyc_status?.replace('_', ' ') || 'pending'}
          </span>
        </div>
        <div className="card-body">
          <div className="kyc-details">
            <div><span>ID Type:</span> {item.kyc_data?.id_type || 'N/A'}</div>
            <div><span>ID Number:</span> {item.kyc_data?.id_number || 'N/A'}</div>
            <div><span>Submitted:</span> {item.kyc_submitted_at ? new Date(item.kyc_submitted_at).toLocaleDateString() : 'N/A'}</div>
            <div><span>Role:</span> {item.role}</div>
          </div>
          {hasDocs && (
            <div className="card-docs-toggle">
              <button onClick={() => toggleCardDocs(item.id, type)} className="docs-toggle-btn">
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {isExpanded ? 'Hide Documents' : `Show Documents (${docs.length})`}
              </button>
              {isExpanded && (
                <div className="card-documents-preview">
                  {renderDocuments(item.id)}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="card-footer">
          <button onClick={() => { setSelectedUser(item); setShowUserModal(true); }}>
            <Eye size={16} /> View Details
          </button>
          {item.kyc_status === 'pending' && (
            <>
              <button onClick={() => updateUserVerification(item.id, 'approved')}>Approve</button>
              <button onClick={() => { const r = prompt('Rejection reason:'); if(r) updateUserVerification(item.id, 'rejected', r); }}>Reject</button>
            </>
          )}
        </div>
      </div>
    );
  };

  // Render modal content (full details + documents)
  const renderModal = (selected, type, updateFn) => {
    if (!selected) return null;
    const docs = documentsMap[selected.id] || [];
    return (
      <div className="modal-content">
        <div className="modal-header">
          <h3>KYC Details</h3>
          <button onClick={() => type === 'user' ? setShowUserModal(false) : type === 'manager' ? setShowManagerModal(false) : setShowEstateFirmModal(false)}><XCircle size={20} /></button>
        </div>
        <div className="modal-body">
          <p><strong>Name:</strong> {selected.full_name}</p>
          <p><strong>Email:</strong> {selected.email}</p>
          <p><strong>Phone:</strong> {selected.phone || 'N/A'}</p>
          <p><strong>Role:</strong> {selected.role}</p>
          <p><strong>ID Type:</strong> {selected.kyc_data?.id_type || 'N/A'}</p>
          <p><strong>ID Number:</strong> {selected.kyc_data?.id_number || 'N/A'}</p>
          <p><strong>Submitted At:</strong> {selected.kyc_submitted_at ? new Date(selected.kyc_submitted_at).toLocaleString() : 'N/A'}</p>
          <h4>Uploaded Documents</h4>
          {renderDocuments(selected.id)}
        </div>
        <div className="modal-footer">
          {selected.kyc_status === 'pending' && (
            <>
              <button onClick={() => updateFn(selected.id, 'approved')}>Approve</button>
              <button onClick={() => { const r = prompt('Rejection reason:'); if(r) updateFn(selected.id, 'rejected', r); }}>Reject</button>
              {type === 'user' && <button onClick={() => { const n = prompt('Notes:'); if(n) updateFn(selected.id, 'under_review', n); }}>Mark for Review</button>}
            </>
          )}
          <button onClick={() => type === 'user' ? setShowUserModal(false) : type === 'manager' ? setShowManagerModal(false) : setShowEstateFirmModal(false)}>Close</button>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-verification">
      <div className="verification-header">
        <div className="header-left">
          <h1><ShieldCheck size={28} /> KYC Verification Dashboard</h1>
          <p>Verify user, manager, and estate firm identity documents and KYC submissions</p>
        </div>
        <div className="header-right">
          <div className="tab-switcher">
            <button className={`tab-btn ${activeTab === 'userKyc' ? 'active' : ''}`} onClick={() => setActiveTab('userKyc')}><Users size={18} /> User KYC</button>
            <button className={`tab-btn ${activeTab === 'managerKyc' ? 'active' : ''}`} onClick={() => setActiveTab('managerKyc')}><Building size={18} /> Manager KYC</button>
            <button className={`tab-btn ${activeTab === 'estateFirmKyc' ? 'active' : ''}`} onClick={() => setActiveTab('estateFirmKyc')}><Home size={18} /> Estate Firm KYC</button>
          </div>
          {activeTab === 'userKyc' && userStats.pending > 0 && <button className="btn-bulk-approve" onClick={bulkApproveUsers}><CheckCircle size={18} /> Approve All ({userStats.pending})</button>}
          {activeTab === 'managerKyc' && managerStats.pending > 0 && <button className="btn-bulk-approve" onClick={bulkApproveManagers}><CheckCircle size={18} /> Approve All ({managerStats.pending})</button>}
          {activeTab === 'estateFirmKyc' && estateStats.pending > 0 && <button className="btn-bulk-approve" onClick={bulkApproveEstateFirms}><CheckCircle size={18} /> Approve All ({estateStats.pending})</button>}
          <button className="btn-export" onClick={exportToCsv}><Download size={18} /> Export Data</button>
        </div>
      </div>

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
            <div className="search-box"><Search size={18} /><input type="text" placeholder="Search by name or email..." value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} /></div>
            <select value={userStatusFilter} onChange={(e) => setUserStatusFilter(e.target.value)}><option value="all">All Status</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="under_review">Under Review</option></select>
            <button onClick={() => { setUserSearchTerm(''); setUserStatusFilter('all'); }}><Filter size={16} /> Clear</button>
          </div>
          <div className="verification-grid">
            {loading.user && <p>Loading...</p>}
            {!loading.user && filteredUserVerifications.length === 0 && (<div className="no-verifications"><ShieldCheck size={48} /><p>No user KYC submissions found</p></div>)}
            {filteredUserVerifications.map(item => renderVerificationCard(item, 'user'))}
          </div>
        </div>
      )}

      {activeTab === 'managerKyc' && (
        <div className="tab-content">
          <div className="verification-stats">
            <div className="stat-card"><Building size={24} /><h3>{managerStats.total}</h3><p>Total</p></div>
            <div className="stat-card"><Clock size={24} /><h3>{managerStats.pending}</h3><p>Pending</p></div>
            <div className="stat-card"><CheckCircle size={24} /><h3>{managerStats.approved}</h3><p>Approved</p></div>
            <div className="stat-card"><XCircle size={24} /><h3>{managerStats.rejected}</h3><p>Rejected</p></div>
          </div>
          <div className="verification-filters">
            <div className="search-box"><Search size={18} /><input type="text" placeholder="Search managers..." value={managerSearchTerm} onChange={(e) => setManagerSearchTerm(e.target.value)} /></div>
            <select value={managerStatusFilter} onChange={(e) => setManagerStatusFilter(e.target.value)}><option value="all">All Status</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>
            <button onClick={() => { setManagerSearchTerm(''); setManagerStatusFilter('all'); }}><Filter size={16} /> Clear</button>
          </div>
          <div className="verification-grid">
            {loading.manager && <p>Loading...</p>}
            {!loading.manager && filteredManagerVerifications.length === 0 && (<div className="no-verifications"><Building size={48} /><p>No manager KYC submissions found</p></div>)}
            {filteredManagerVerifications.map(item => renderVerificationCard(item, 'manager'))}
          </div>
        </div>
      )}

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
            <div className="search-box"><Search size={18} /><input type="text" placeholder="Search estate firms..." value={estateFirmSearchTerm} onChange={(e) => setEstateFirmSearchTerm(e.target.value)} /></div>
            <select value={estateFirmStatusFilter} onChange={(e) => setEstateFirmStatusFilter(e.target.value)}><option value="all">All Status</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="under_review">Under Review</option></select>
            <button onClick={() => { setEstateFirmSearchTerm(''); setEstateFirmStatusFilter('all'); }}><Filter size={16} /> Clear</button>
          </div>
          <div className="verification-grid">
            {loading.estate && <p>Loading...</p>}
            {!loading.estate && filteredEstateFirmVerifications.length === 0 && (<div className="no-verifications"><Home size={48} /><p>No estate firm KYC submissions found</p></div>)}
            {filteredEstateFirmVerifications.map(item => renderVerificationCard(item, 'estate'))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showUserModal && selectedUser && renderModal(selectedUser, 'user', updateUserVerification)}
      {showManagerModal && selectedManager && renderModal(selectedManager, 'manager', updateManagerVerification)}
      {showEstateFirmModal && selectedEstateFirm && renderModal(selectedEstateFirm, 'estate', updateEstateFirmVerification)}
    </div>
  );
};

export default AdminVerification;