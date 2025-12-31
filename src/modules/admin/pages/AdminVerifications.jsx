// src/modules/admin/pages/AdminVerification.jsx - UPDATED
import React, { useState, useEffect } from 'react';
import {
  Users, ShieldCheck, CheckCircle, XCircle, Clock,
  Search, Filter, Eye, Download, AlertCircle,
  UserCheck, UserX, Mail, Phone, MapPin, Calendar,
  FileText, Image as ImageIcon, ExternalLink,
  Building, UserCog, BadgeCheck, Briefcase, MapPin as MapPinIcon,
  Home, DollarSign, FileCheck, AlertTriangle
} from 'lucide-react';
import './AdminVerification.css';

const AdminVerification = () => {
  const [activeTab, setActiveTab] = useState('userKyc'); // 'userKyc', 'managerKyc', or 'estateFirmKyc'
  
  // User KYC states
  const [verifications, setVerifications] = useState([]);
  const [filteredVerifications, setFilteredVerifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  
  // Manager KYC states
  const [managerVerifications, setManagerVerifications] = useState([]);
  const [filteredManagerVerifications, setFilteredManagerVerifications] = useState([]);
  const [managerSearchTerm, setManagerSearchTerm] = useState('');
  const [managerStatusFilter, setManagerStatusFilter] = useState('pending_review');
  
  // Estate Firm KYC states - NEW
  const [estateFirmVerifications, setEstateFirmVerifications] = useState([]);
  const [filteredEstateFirmVerifications, setFilteredEstateFirmVerifications] = useState([]);
  const [estateFirmSearchTerm, setEstateFirmSearchTerm] = useState('');
  const [estateFirmStatusFilter, setEstateFirmStatusFilter] = useState('pending');
  
  // Common states
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [selectedManagerVerification, setSelectedManagerVerification] = useState(null);
  const [selectedEstateFirmVerification, setSelectedEstateFirmVerification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [showEstateFirmModal, setShowEstateFirmModal] = useState(false);
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    underReview: 0
  });
  
  const [managerStats, setManagerStats] = useState({
    total: 0,
    pending_review: 0,
    approved: 0,
    rejected: 0
  });

  // NEW: Estate Firm Stats
  const [estateFirmStats, setEstateFirmStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    under_review: 0
  });

  useEffect(() => {
    loadUserVerifications();
    loadManagerVerifications();
    loadEstateFirmVerifications(); // NEW
  }, []);

  useEffect(() => {
    filterVerifications();
  }, [searchTerm, statusFilter, verifications]);

  useEffect(() => {
    filterManagerVerifications();
  }, [managerSearchTerm, managerStatusFilter, managerVerifications]);

  useEffect(() => {
    filterEstateFirmVerifications(); // NEW
  }, [estateFirmSearchTerm, estateFirmStatusFilter, estateFirmVerifications]);

  // =========================
  // USER KYC FUNCTIONS (UNCHANGED)
  // =========================
  
  const loadUserVerifications = () => {
    try {
      const usersData = JSON.parse(localStorage.getItem('rentEasyUsers') || '[]');
      const verificationData = JSON.parse(localStorage.getItem('kycVerifications') || '[]');
      
      if (verificationData.length === 0) {
        const sampleVerifications = generateSampleVerifications(usersData);
        localStorage.setItem('kycVerifications', JSON.stringify(sampleVerifications));
        setVerifications(sampleVerifications);
      } else {
        setVerifications(verificationData);
      }
      
      calculateUserStats(verificationData.length > 0 ? verificationData : generateSampleVerifications(usersData));
    } catch (error) {
      console.error('Error loading user verifications:', error);
    }
  };

  const generateSampleVerifications = (users) => {
    const kycStatuses = ['pending', 'approved', 'rejected', 'under_review'];
    const idTypes = ['national_id', 'passport', 'drivers_license', 'voters_card'];
    
    return users.slice(0, 15).map((user, index) => ({
      id: `kyc-${Date.now()}-${index}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone || `+23480${Math.floor(Math.random() * 90000000) + 10000000}`,
      userRole: user.role || 'tenant',
      status: kycStatuses[index % kycStatuses.length],
      idType: idTypes[index % idTypes.length],
      idNumber: `${idTypes[index % idTypes.length].toUpperCase().substring(0, 3)}${10000 + index}`,
      submittedAt: new Date(Date.now() - index * 86400000).toISOString(),
      reviewedAt: index % 3 === 0 ? new Date(Date.now() - index * 43200000).toISOString() : null,
      reviewedBy: index % 3 === 0 ? 'Admin' : null,
      documents: [
        { type: 'id_front', url: `https://example.com/id-front-${index}.jpg`, verified: index % 3 === 0 },
        { type: 'id_back', url: `https://example.com/id-back-${index}.jpg`, verified: index % 3 === 0 },
        { type: 'selfie', url: `https://example.com/selfie-${index}.jpg`, verified: index % 3 === 0 }
      ],
      addressProof: {
        type: 'utility_bill',
        url: `https://example.com/utility-${index}.jpg`,
        verified: index % 3 === 0
      },
      additionalInfo: {
        occupation: ['Software Engineer', 'Business Owner', 'Student', 'Teacher'][index % 4],
        incomeRange: ['₦100,000 - ₦500,000', '₦500,000 - ₦2,000,000', '₦2,000,000+'][index % 3],
        employmentStatus: ['employed', 'self-employed', 'student'][index % 3]
      },
      notes: index % 4 === 0 ? 'Requires additional verification' : '',
      riskLevel: index % 5 === 0 ? 'high' : index % 3 === 0 ? 'medium' : 'low'
    }));
  };

  const calculateUserStats = (verificationsData) => {
    const total = verificationsData.length;
    const pending = verificationsData.filter(v => v.status === 'pending').length;
    const approved = verificationsData.filter(v => v.status === 'approved').length;
    const rejected = verificationsData.filter(v => v.status === 'rejected').length;
    const underReview = verificationsData.filter(v => v.status === 'under_review').length;
    
    setStats({ total, pending, approved, rejected, underReview });
  };

  const filterVerifications = () => {
    let filtered = [...verifications];
    
    if (searchTerm) {
      filtered = filtered.filter(verification =>
        verification.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        verification.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        verification.idNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(verification => verification.status === statusFilter);
    }
    
    setFilteredVerifications(filtered);
  };

  const viewUserVerificationDetails = (verification) => {
    setSelectedVerification(verification);
    setShowModal(true);
  };

  const updateUserVerificationStatus = (verificationId, newStatus, notes = '') => {
    const updatedVerifications = verifications.map(verification =>
      verification.id === verificationId 
        ? { 
            ...verification, 
            status: newStatus,
            reviewedAt: new Date().toISOString(),
            reviewedBy: 'Admin',
            notes: notes || verification.notes
          } 
        : verification
    );
    
    setVerifications(updatedVerifications);
    localStorage.setItem('kycVerifications', JSON.stringify(updatedVerifications));
    calculateUserStats(updatedVerifications);
    
    // Also update user verification status
    const verification = updatedVerifications.find(v => v.id === verificationId);
    if (verification) {
      const users = JSON.parse(localStorage.getItem('rentEasyUsers') || '[]');
      const updatedUsers = users.map(user =>
        user.id === verification.userId
          ? { 
              ...user, 
              kycStatus: newStatus,
              verified: newStatus === 'approved',
              verifiedAt: newStatus === 'approved' ? new Date().toISOString() : user.verifiedAt
            }
          : user
      );
      localStorage.setItem('rentEasyUsers', JSON.stringify(updatedUsers));
    }
    
    if (selectedVerification?.id === verificationId) {
      setSelectedVerification(updatedVerifications.find(v => v.id === verificationId));
    }
  };

  const bulkApproveUserVerifications = () => {
    if (!window.confirm(`Approve ${filteredVerifications.length} pending user verifications?`)) return;
    
    const updatedVerifications = verifications.map(verification =>
      filteredVerifications.some(f => f.id === verification.id) && verification.status === 'pending'
        ? { 
            ...verification, 
            status: 'approved',
            reviewedAt: new Date().toISOString(),
            reviewedBy: 'Admin'
          }
        : verification
    );
    
    setVerifications(updatedVerifications);
    localStorage.setItem('kycVerifications', JSON.stringify(updatedVerifications));
    calculateUserStats(updatedVerifications);
    
    // Update users
    const users = JSON.parse(localStorage.getItem('rentEasyUsers') || '[]');
    const updatedUsers = users.map(user => {
      const verification = filteredVerifications.find(v => v.userId === user.id && v.status === 'pending');
      if (verification) {
        return {
          ...user,
          kycStatus: 'approved',
          verified: true,
          verifiedAt: new Date().toISOString()
        };
      }
      return user;
    });
    localStorage.setItem('rentEasyUsers', JSON.stringify(updatedUsers));
    
    alert(`${filteredVerifications.length} user verifications approved successfully!`);
  };

  // =========================
  // MANAGER KYC FUNCTIONS (UNCHANGED)
  // =========================
  
  const loadManagerVerifications = () => {
    try {
      const managers = JSON.parse(localStorage.getItem('managers') || '[]');
      setManagerVerifications(managers);
      calculateManagerStats(managers);
    } catch (error) {
      console.error('Error loading manager verifications:', error);
    }
  };

  const calculateManagerStats = (managers) => {
    const total = managers.length;
    const pending_review = managers.filter(m => m.verificationStatus === 'pending_review').length;
    const approved = managers.filter(m => m.verificationStatus === 'approved').length;
    const rejected = managers.filter(m => m.verificationStatus === 'rejected').length;
    
    setManagerStats({ total, pending_review, approved, rejected });
  };

  const filterManagerVerifications = () => {
    let filtered = [...managerVerifications];
    
    if (managerSearchTerm) {
      filtered = filtered.filter(manager =>
        manager.name?.toLowerCase().includes(managerSearchTerm.toLowerCase()) ||
        manager.email?.toLowerCase().includes(managerSearchTerm.toLowerCase()) ||
        manager.phone?.toLowerCase().includes(managerSearchTerm.toLowerCase())
      );
    }
    
    if (managerStatusFilter !== 'all') {
      filtered = filtered.filter(manager => manager.verificationStatus === managerStatusFilter);
    }
    
    setFilteredManagerVerifications(filtered);
  };

  const viewManagerVerificationDetails = (manager) => {
    setSelectedManagerVerification(manager);
    setShowManagerModal(true);
  };

  const updateManagerVerificationStatus = (managerId, newStatus, notes = '') => {
    const updatedManagers = managerVerifications.map(manager =>
      manager.id === managerId 
        ? { 
            ...manager, 
            verificationStatus: newStatus,
            verificationReviewedAt: new Date().toISOString(),
            verificationReviewedBy: 'Admin',
            verificationNotes: notes || manager.verificationNotes,
            status: newStatus === 'approved' ? 'active' : (newStatus === 'rejected' ? 'inactive' : manager.status),
            updatedAt: new Date().toISOString()
          } 
        : manager
    );
    
    setManagerVerifications(updatedManagers);
    localStorage.setItem('managers', JSON.stringify(updatedManagers));
    calculateManagerStats(updatedManagers);
    
    if (selectedManagerVerification?.id === managerId) {
      setSelectedManagerVerification(updatedManagers.find(m => m.id === managerId));
    }
    
    // Send notification to manager
    const manager = updatedManagers.find(m => m.id === managerId);
    if (manager) {
      const managerNotifications = JSON.parse(localStorage.getItem('managerNotifications') || '[]');
      managerNotifications.unshift({
        id: Date.now(),
        title: newStatus === 'approved' ? 'Verification Approved!' : 'Verification Update',
        message: newStatus === 'approved' 
          ? 'Your KYC verification has been approved. You can now access all manager features.'
          : `Your verification has been ${newStatus}. ${notes ? `Reason: ${notes}` : ''}`,
        type: 'verification',
        read: false,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('managerNotifications', JSON.stringify(managerNotifications));
    }
  };

  const bulkApproveManagerVerifications = () => {
    if (!window.confirm(`Approve ${filteredManagerVerifications.length} pending manager verifications?`)) return;
    
    const updatedManagers = managerVerifications.map(manager =>
      filteredManagerVerifications.some(f => f.id === manager.id) && manager.verificationStatus === 'pending_review'
        ? { 
            ...manager, 
            verificationStatus: 'approved',
            verificationReviewedAt: new Date().toISOString(),
            verificationReviewedBy: 'Admin',
            status: 'active',
            updatedAt: new Date().toISOString()
          }
        : manager
    );
    
    setManagerVerifications(updatedManagers);
    localStorage.setItem('managers', JSON.stringify(updatedManagers));
    calculateManagerStats(updatedManagers);
    
    alert(`${filteredManagerVerifications.length} manager verifications approved successfully!`);
  };

  // =========================
  // ESTATE FIRM KYC FUNCTIONS - NEW
  // =========================
  
  const loadEstateFirmVerifications = () => {
    try {
      // Load from localStorage
      const storedVerifications = JSON.parse(localStorage.getItem('estateVerifications') || '[]');
      
      // Add sample data if empty
      if (storedVerifications.length === 0) {
        const sampleVerifications = generateSampleEstateFirmVerifications();
        localStorage.setItem('estateVerifications', JSON.stringify(sampleVerifications));
        setEstateFirmVerifications(sampleVerifications);
        calculateEstateFirmStats(sampleVerifications);
      } else {
        setEstateFirmVerifications(storedVerifications);
        calculateEstateFirmStats(storedVerifications);
      }
    } catch (error) {
      console.error('Error loading estate firm verifications:', error);
    }
  };

  const generateSampleEstateFirmVerifications = () => {
    const businessNames = [
      'Prestige Properties Ltd',
      'Urban Real Estate',
      'Heritage Properties',
      'Golden Key Realty',
      'Prime Estate Agency',
      'Metro Properties',
      'Skyline Real Estate',
      'Oakwood Properties'
    ];
    
    const statuses = ['pending', 'approved', 'rejected', 'under_review'];
    
    return businessNames.map((name, index) => ({
      id: `estate-verif-${Date.now()}-${index}`,
      businessName: name,
      businessType: ['estate-firm', 'property-management', 'real-estate'][index % 3],
      registrationNumber: `RC-${1000000 + index}`,
      taxIdNumber: `TIN-${2000000 + index}`,
      contactPerson: ['James Wilson', 'Sarah Johnson', 'Michael Chen', 'David Brown'][index % 4],
      contactEmail: `contact@${name.toLowerCase().replace(/\s+/g, '')}.com`,
      contactPhone: `+23480${30000000 + index}`,
      officeAddress: `${index + 1} Business Avenue, Lagos`,
      city: 'Lagos',
      state: ['Lagos', 'Abuja', 'Rivers', 'Oyo'][index % 4],
      submittedAt: new Date(Date.now() - index * 86400000).toISOString(),
      status: statuses[index % statuses.length],
      reviewDate: index % 3 === 0 ? new Date(Date.now() - index * 43200000).toISOString() : null,
      reviewedBy: index % 3 === 0 ? 'Admin' : null,
      documents: {
        cacDocument: 'cac_certificate.pdf',
        taxDocument: 'tax_clearance.pdf',
        proofOfAddress: 'utility_bill.jpg'
      },
      directors: [
        { name: 'Director 1', position: 'Managing Director', idNumber: 'ID-12345' },
        { name: 'Director 2', position: 'Director', idNumber: 'ID-67890' }
      ],
      servicesOffered: ['Property Sales', 'Property Rentals', 'Property Management'],
      yearsInOperation: 5 + (index % 10),
      numberOfEmployees: 10 + (index % 50),
      annualTurnover: (5000000 + (index * 1000000)).toString(),
      comments: index % 4 === 0 ? 'Requires additional document verification' : '',
      riskLevel: index % 5 === 0 ? 'high' : index % 3 === 0 ? 'medium' : 'low'
    }));
  };

  const calculateEstateFirmStats = (verificationsData) => {
    const total = verificationsData.length;
    const pending = verificationsData.filter(v => v.status === 'pending').length;
    const approved = verificationsData.filter(v => v.status === 'approved').length;
    const rejected = verificationsData.filter(v => v.status === 'rejected').length;
    const under_review = verificationsData.filter(v => v.status === 'under_review').length;
    
    setEstateFirmStats({ total, pending, approved, rejected, under_review });
  };

  const filterEstateFirmVerifications = () => {
    let filtered = [...estateFirmVerifications];
    
    if (estateFirmSearchTerm) {
      filtered = filtered.filter(verification =>
        verification.businessName.toLowerCase().includes(estateFirmSearchTerm.toLowerCase()) ||
        verification.registrationNumber.toLowerCase().includes(estateFirmSearchTerm.toLowerCase()) ||
        verification.contactPerson.toLowerCase().includes(estateFirmSearchTerm.toLowerCase()) ||
        verification.contactEmail.toLowerCase().includes(estateFirmSearchTerm.toLowerCase())
      );
    }
    
    if (estateFirmStatusFilter !== 'all') {
      filtered = filtered.filter(verification => verification.status === estateFirmStatusFilter);
    }
    
    setFilteredEstateFirmVerifications(filtered);
  };

  const viewEstateFirmVerificationDetails = (verification) => {
    setSelectedEstateFirmVerification(verification);
    setShowEstateFirmModal(true);
  };

  const updateEstateFirmVerificationStatus = (verificationId, newStatus, notes = '') => {
    const updatedVerifications = estateFirmVerifications.map(verification =>
      verification.id === verificationId 
        ? { 
            ...verification, 
            status: newStatus,
            reviewDate: new Date().toISOString(),
            reviewedBy: 'Admin',
            comments: notes || verification.comments
          } 
        : verification
    );
    
    setEstateFirmVerifications(updatedVerifications);
    localStorage.setItem('estateVerifications', JSON.stringify(updatedVerifications));
    calculateEstateFirmStats(updatedVerifications);
    
    // Also update user verification status if user exists
    const verification = updatedVerifications.find(v => v.id === verificationId);
    if (verification) {
      const users = JSON.parse(localStorage.getItem('rentEasyUsers') || '[]');
      const updatedUsers = users.map(user => {
        if (user.email === verification.contactEmail) {
          return { 
            ...user, 
            verificationStatus: newStatus,
            verified: newStatus === 'approved',
            verifiedAt: newStatus === 'approved' ? new Date().toISOString() : user.verifiedAt
          };
        }
        return user;
      });
      localStorage.setItem('rentEasyUsers', JSON.stringify(updatedUsers));
    }
    
    if (selectedEstateFirmVerification?.id === verificationId) {
      setSelectedEstateFirmVerification(updatedVerifications.find(v => v.id === verificationId));
    }
  };

  const bulkApproveEstateFirmVerifications = () => {
    if (!window.confirm(`Approve ${filteredEstateFirmVerifications.length} pending estate firm verifications?`)) return;
    
    const updatedVerifications = estateFirmVerifications.map(verification =>
      filteredEstateFirmVerifications.some(f => f.id === verification.id) && verification.status === 'pending'
        ? { 
            ...verification, 
            status: 'approved',
            reviewDate: new Date().toISOString(),
            reviewedBy: 'Admin'
          }
        : verification
    );
    
    setEstateFirmVerifications(updatedVerifications);
    localStorage.setItem('estateVerifications', JSON.stringify(updatedVerifications));
    calculateEstateFirmStats(updatedVerifications);
    
    alert(`${filteredEstateFirmVerifications.length} estate firm verifications approved successfully!`);
  };

  // =========================
  // COMMON HELPER FUNCTIONS (Updated)
  // =========================
  
  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return <CheckCircle size={16} className="approved" />;
      case 'pending':
      case 'pending_review': return <Clock size={16} className="pending" />;
      case 'rejected': return <XCircle size={16} className="rejected" />;
      case 'under_review': return <AlertCircle size={16} className="under-review" />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'success';
      case 'pending':
      case 'pending_review': return 'warning';
      case 'rejected': return 'danger';
      case 'under_review': return 'info';
      default: return 'secondary';
    }
  };

  const getRiskColor = (riskLevel) => {
    switch(riskLevel) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const getBusinessTypeLabel = (type) => {
    switch(type) {
      case 'estate-firm': return 'Estate Firm';
      case 'property-management': return 'Property Management';
      case 'real-estate': return 'Real Estate Developer';
      default: return type;
    }
  };

  const exportVerifications = () => {
    let data, headers;
    
    switch(activeTab) {
      case 'userKyc':
        data = filteredVerifications;
        headers = ['User ID', 'Name', 'Email', 'ID Type', 'ID Number', 'Status', 'Submitted Date', 'Risk Level'];
        break;
      case 'managerKyc':
        data = filteredManagerVerifications;
        headers = ['Manager ID', 'Name', 'Email', 'Phone', 'State', 'Status', 'Submitted Date', 'Working Areas'];
        break;
      case 'estateFirmKyc':
        data = filteredEstateFirmVerifications;
        headers = ['Business Name', 'Type', 'Registration', 'Contact Person', 'Email', 'Status', 'Submitted Date', 'Years in Operation'];
        break;
      default:
        data = [];
        headers = [];
    }
    
    const csvContent = [
      headers,
      ...data.map(item => {
        if (activeTab === 'userKyc') {
          return [
            item.userId,
            item.userName,
            item.userEmail,
            item.idType,
            item.idNumber,
            item.status,
            new Date(item.submittedAt).toLocaleDateString(),
            item.riskLevel
          ];
        } else if (activeTab === 'managerKyc') {
          return [
            item.id,
            item.name,
            item.email,
            item.phone || 'N/A',
            item.state || 'N/A',
            item.verificationStatus || 'pending',
            new Date(item.createdAt).toLocaleDateString(),
            item.areas ? item.areas.length : 0
          ];
        } else {
          return [
            item.businessName,
            getBusinessTypeLabel(item.businessType),
            item.registrationNumber,
            item.contactPerson,
            item.contactEmail,
            item.status,
            new Date(item.submittedAt).toLocaleDateString(),
            item.yearsInOperation
          ];
        }
      })
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}_verifications_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // =========================
  // RENDER FUNCTIONS (Updated with Estate Firm Tab)
  // =========================
  
  const renderUserKycTab = () => (
    <>
      {/* Stats */}
      <div className="verification-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Submissions</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending Review</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon approved">
            <UserCheck size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.approved}</h3>
            <p>Approved</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon rejected">
            <UserX size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.rejected}</h3>
            <p>Rejected</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon under-review">
            <AlertCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.underReview}</h3>
            <p>Under Review</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="verification-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or ID number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="under_review">Under Review</option>
          </select>
          
          <button className="btn-filter" onClick={() => {
            setSearchTerm('');
            setStatusFilter('all');
          }}>
            <Filter size={16} /> Clear Filters
          </button>
        </div>
      </div>

      {/* Verification List */}
      <div className="verification-list">
        {filteredVerifications.length > 0 ? (
          <div className="verification-grid">
            {filteredVerifications.map(verification => (
              <div key={verification.id} className="verification-card">
                <div className="card-header">
                  <div className="user-info">
                    <div className="user-avatar">
                      {verification.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4>{verification.userName}</h4>
                      <div className="user-meta">
                        <span><Mail size={12} /> {verification.userEmail}</span>
                        <span><Phone size={12} /> {verification.userPhone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="status-badges">
                    <span className={`status-badge ${getStatusColor(verification.status)}`}>
                      {getStatusIcon(verification.status)} {verification.status.replace('_', ' ')}
                    </span>
                    <span className={`risk-badge ${getRiskColor(verification.riskLevel)}`}>
                      Risk: {verification.riskLevel}
                    </span>
                  </div>
                </div>
                
                <div className="card-body">
                  <div className="kyc-details">
                    <div className="detail-row">
                      <span className="label">ID Type:</span>
                      <span className="value">{verification.idType.replace('_', ' ')}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">ID Number:</span>
                      <span className="value">{verification.idNumber}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Submitted:</span>
                      <span className="value">
                        {new Date(verification.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Role:</span>
                      <span className="value">{verification.userRole}</span>
                    </div>
                  </div>
                  
                  <div className="documents-preview">
                    <div className="document-item">
                      <ImageIcon size={14} />
                      <span>ID Front</span>
                      {verification.documents[0]?.verified && (
                        <CheckCircle size={12} className="verified" />
                      )}
                    </div>
                    <div className="document-item">
                      <ImageIcon size={14} />
                      <span>ID Back</span>
                      {verification.documents[1]?.verified && (
                        <CheckCircle size={12} className="verified" />
                      )}
                    </div>
                    <div className="document-item">
                      <ImageIcon size={14} />
                      <span>Selfie</span>
                      {verification.documents[2]?.verified && (
                        <CheckCircle size={12} className="verified" />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="card-footer">
                  <button 
                    className="btn-view-details"
                    onClick={() => viewUserVerificationDetails(verification)}
                  >
                    <Eye size={16} /> View Details
                  </button>
                  
                  {verification.status === 'pending' && (
                    <div className="quick-actions">
                      <button 
                        className="btn-approve"
                        onClick={() => updateUserVerificationStatus(verification.id, 'approved')}
                      >
                        Approve
                      </button>
                      <button 
                        className="btn-reject"
                        onClick={() => {
                          const reason = prompt('Enter rejection reason:');
                          if (reason) {
                            updateUserVerificationStatus(verification.id, 'rejected', reason);
                          }
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-verifications">
            <ShieldCheck size={48} />
            <p>No user verifications found</p>
            <small>All KYC submissions have been processed</small>
          </div>
        )}
      </div>
    </>
  );

  const renderManagerKycTab = () => (
    <>
      {/* Manager Stats */}
      <div className="verification-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <Building size={24} />
          </div>
          <div className="stat-content">
            <h3>{managerStats.total}</h3>
            <p>Total Managers</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>{managerStats.pending_review}</h3>
            <p>Pending Review</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon approved">
            <BadgeCheck size={24} />
          </div>
          <div className="stat-content">
            <h3>{managerStats.approved}</h3>
            <p>Verified Managers</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon rejected">
            <UserX size={24} />
          </div>
          <div className="stat-content">
            <h3>{managerStats.rejected}</h3>
            <p>Rejected</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon under-review">
            <UserCog size={24} />
          </div>
          <div className="stat-content">
            <h3>{managerStats.total - (managerStats.approved + managerStats.rejected + managerStats.pending_review)}</h3>
            <p>Unverified</p>
          </div>
        </div>
      </div>

      {/* Manager Filters */}
      <div className="verification-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search manager by name, email, or phone..."
            value={managerSearchTerm}
            onChange={(e) => setManagerSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select 
            value={managerStatusFilter} 
            onChange={(e) => setManagerStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Managers</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="">Unsubmitted</option>
          </select>
          
          <button className="btn-filter" onClick={() => {
            setManagerSearchTerm('');
            setManagerStatusFilter('all');
          }}>
            <Filter size={16} /> Clear Filters
          </button>
        </div>
      </div>

      {/* Manager Verification List */}
      <div className="verification-list">
        {filteredManagerVerifications.length > 0 ? (
          <div className="verification-grid">
            {filteredManagerVerifications.map(manager => (
              <div key={manager.id || manager.email} className="verification-card manager-card">
                <div className="card-header">
                  <div className="user-info">
                    <div className="user-avatar">
                      {manager.name?.charAt(0)?.toUpperCase() || 'M'}
                    </div>
                    <div>
                      <h4>{manager.name || 'Unnamed Manager'}</h4>
                      <div className="user-meta">
                        <span><Mail size={12} /> {manager.email}</span>
                        <span><Phone size={12} /> {manager.phone || 'No phone'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="status-badges">
                    <span className={`status-badge ${getStatusColor(manager.verificationStatus || '')}`}>
                      {getStatusIcon(manager.verificationStatus || '')} 
                      {manager.verificationStatus ? manager.verificationStatus.replace('_', ' ') : 'Not Submitted'}
                    </span>
                    <span className="risk-badge secondary">
                      <MapPinIcon size={12} /> {manager.state || 'No state'}
                    </span>
                  </div>
                </div>
                
                <div className="card-body">
                  <div className="kyc-details">
                    <div className="detail-row">
                      <span className="label">Manager ID:</span>
                      <span className="value">{manager.id || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Status:</span>
                      <span className="value">{manager.status || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Areas:</span>
                      <span className="value">
                        {manager.areas ? `${manager.areas.length} areas` : 'Not set'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Joined:</span>
                      <span className="value">
                        {manager.createdAt ? new Date(manager.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="documents-preview">
                    <div className="document-item">
                      <FileText size={14} />
                      <span>KYC Status</span>
                      {manager.verificationStatus === 'approved' && (
                        <CheckCircle size={12} className="verified" />
                      )}
                    </div>
                    <div className="document-item">
                      <Briefcase size={14} />
                      <span>Managed Properties</span>
                      <span className="count">{manager.managedProperties?.length || 0}</span>
                    </div>
                    <div className="document-item">
                      <ShieldCheck size={14} />
                      <span>Verified Properties</span>
                      <span className="count">{manager.verifiedProperties?.length || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div className="card-footer">
                  <button 
                    className="btn-view-details"
                    onClick={() => viewManagerVerificationDetails(manager)}
                  >
                    <Eye size={16} /> View Details
                  </button>
                  
                  {manager.verificationStatus === 'pending_review' && (
                    <div className="quick-actions">
                      <button 
                        className="btn-approve"
                        onClick={() => updateManagerVerificationStatus(manager.id, 'approved')}
                      >
                        Approve
                      </button>
                      <button 
                        className="btn-reject"
                        onClick={() => {
                          const reason = prompt('Enter rejection reason:');
                          if (reason) {
                            updateManagerVerificationStatus(manager.id, 'rejected', reason);
                          }
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-verifications">
            <UserCog size={48} />
            <p>No manager verifications found</p>
            <small>{managerStatusFilter === 'all' ? 'No managers registered' : 'No managers match this filter'}</small>
          </div>
        )}
      </div>
    </>
  );

  const renderEstateFirmKycTab = () => (
    <>
      {/* Estate Firm Stats */}
      <div className="verification-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <Home size={24} />
          </div>
          <div className="stat-content">
            <h3>{estateFirmStats.total}</h3>
            <p>Total Firms</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>{estateFirmStats.pending}</h3>
            <p>Pending Review</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon approved">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>{estateFirmStats.approved}</h3>
            <p>Verified Firms</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon rejected">
            <XCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>{estateFirmStats.rejected}</h3>
            <p>Rejected</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon under-review">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <h3>{estateFirmStats.under_review}</h3>
            <p>Under Review</p>
          </div>
        </div>
      </div>

      {/* Estate Firm Filters */}
      <div className="verification-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by business name, registration, or contact..."
            value={estateFirmSearchTerm}
            onChange={(e) => setEstateFirmSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select 
            value={estateFirmStatusFilter} 
            onChange={(e) => setEstateFirmStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="under_review">Under Review</option>
          </select>
          
          <button className="btn-filter" onClick={() => {
            setEstateFirmSearchTerm('');
            setEstateFirmStatusFilter('all');
          }}>
            <Filter size={16} /> Clear Filters
          </button>
        </div>
      </div>

      {/* Estate Firm Verification List */}
      <div className="verification-list">
        {filteredEstateFirmVerifications.length > 0 ? (
          <div className="verification-grid">
            {filteredEstateFirmVerifications.map(verification => (
              <div key={verification.id} className="verification-card estate-firm-card">
                <div className="card-header">
                  <div className="user-info">
                    <div className="user-avatar business-avatar">
                      {verification.businessName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4>{verification.businessName}</h4>
                      <div className="user-meta">
                        <span><Mail size={12} /> {verification.contactEmail}</span>
                        <span><Phone size={12} /> {verification.contactPhone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="status-badges">
                    <span className={`status-badge ${getStatusColor(verification.status)}`}>
                      {getStatusIcon(verification.status)} {verification.status.replace('_', ' ')}
                    </span>
                    <span className={`risk-badge ${getRiskColor(verification.riskLevel)}`}>
                      Risk: {verification.riskLevel}
                    </span>
                  </div>
                </div>
                
                <div className="card-body">
                  <div className="kyc-details">
                    <div className="detail-row">
                      <span className="label">Business Type:</span>
                      <span className="value">{getBusinessTypeLabel(verification.businessType)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Registration:</span>
                      <span className="value">{verification.registrationNumber}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Contact Person:</span>
                      <span className="value">{verification.contactPerson}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Location:</span>
                      <span className="value">{verification.city}, {verification.state}</span>
                    </div>
                  </div>
                  
                  <div className="documents-preview">
                    <div className="document-item">
                      <FileCheck size={14} />
                      <span>CAC Certificate</span>
                      {verification.status === 'approved' && (
                        <CheckCircle size={12} className="verified" />
                      )}
                    </div>
                    <div className="document-item">
                      <DollarSign size={14} />
                      <span>Tax Clearance</span>
                      {verification.status === 'approved' && (
                        <CheckCircle size={12} className="verified" />
                      )}
                    </div>
                    <div className="document-item">
                      <Home size={14} />
                      <span>Address Proof</span>
                      {verification.status === 'approved' && (
                        <CheckCircle size={12} className="verified" />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="card-footer">
                  <button 
                    className="btn-view-details"
                    onClick={() => viewEstateFirmVerificationDetails(verification)}
                  >
                    <Eye size={16} /> View Details
                  </button>
                  
                  {verification.status === 'pending' && (
                    <div className="quick-actions">
                      <button 
                        className="btn-approve"
                        onClick={() => updateEstateFirmVerificationStatus(verification.id, 'approved')}
                      >
                        Approve
                      </button>
                      <button 
                        className="btn-reject"
                        onClick={() => {
                          const reason = prompt('Enter rejection reason:');
                          if (reason) {
                            updateEstateFirmVerificationStatus(verification.id, 'rejected', reason);
                          }
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-verifications">
            <Building size={48} />
            <p>No estate firm verifications found</p>
            <small>{estateFirmStatusFilter === 'all' ? 'No estate firm submissions' : 'No submissions match this filter'}</small>
          </div>
        )}
      </div>
    </>
  );

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
          
          {activeTab === 'userKyc' && stats.pending > 0 && (
            <button className="btn-bulk-approve" onClick={bulkApproveUserVerifications}>
              <CheckCircle size={18} /> Approve All ({stats.pending})
            </button>
          )}
          
          {activeTab === 'managerKyc' && managerStats.pending_review > 0 && (
            <button className="btn-bulk-approve" onClick={bulkApproveManagerVerifications}>
              <CheckCircle size={18} /> Approve All ({managerStats.pending_review})
            </button>
          )}
          
          {activeTab === 'estateFirmKyc' && estateFirmStats.pending > 0 && (
            <button className="btn-bulk-approve" onClick={bulkApproveEstateFirmVerifications}>
              <CheckCircle size={18} /> Approve All ({estateFirmStats.pending})
            </button>
          )}
          
          <button className="btn-export" onClick={exportVerifications}>
            <Download size={18} /> Export {activeTab === 'userKyc' ? 'User' : activeTab === 'managerKyc' ? 'Manager' : 'Estate Firm'} Data
          </button>
        </div>
      </div>

      {/* Render active tab */}
      {activeTab === 'userKyc' ? renderUserKycTab() : 
       activeTab === 'managerKyc' ? renderManagerKycTab() : 
       renderEstateFirmKycTab()}

      {/* User Verification Detail Modal (Unchanged) */}
      {showModal && selectedVerification && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>User KYC Verification Details</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              {/* ... existing user modal content ... */}
            </div>
            
            <div className="modal-footer">
              <div className="verification-actions">
                {selectedVerification.status === 'pending' && (
                  <>
                    <button 
                      className="btn-approve-large"
                      onClick={() => updateUserVerificationStatus(selectedVerification.id, 'approved')}
                    >
                      <CheckCircle size={18} /> Approve KYC
                    </button>
                    <button 
                      className="btn-reject-large"
                      onClick={() => {
                        const reason = prompt('Enter rejection reason:');
                        if (reason) {
                          updateUserVerificationStatus(selectedVerification.id, 'rejected', reason);
                        }
                      }}
                    >
                      <XCircle size={18} /> Reject KYC
                    </button>
                    <button 
                      className="btn-review"
                      onClick={() => {
                        const notes = prompt('Enter review notes:');
                        if (notes) {
                          updateUserVerificationStatus(selectedVerification.id, 'under_review', notes);
                        }
                      }}
                    >
                      <AlertCircle size={18} /> Mark for Review
                    </button>
                  </>
                )}
                <button 
                  className="btn-close-modal"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manager Verification Detail Modal (Unchanged) */}
      {showManagerModal && selectedManagerVerification && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Manager KYC Verification Details</h3>
              <button className="btn-close" onClick={() => setShowManagerModal(false)}>
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              {/* ... existing manager modal content ... */}
            </div>
            
            <div className="modal-footer">
              <div className="verification-actions">
                {selectedManagerVerification.verificationStatus === 'pending_review' && (
                  <>
                    <button 
                      className="btn-approve-large"
                      onClick={() => updateManagerVerificationStatus(selectedManagerVerification.id, 'approved')}
                    >
                      <CheckCircle size={18} /> Approve Manager
                    </button>
                    <button 
                      className="btn-reject-large"
                      onClick={() => {
                        const reason = prompt('Enter rejection reason:');
                        if (reason) {
                          updateManagerVerificationStatus(selectedManagerVerification.id, 'rejected', reason);
                        }
                      }}
                    >
                      <XCircle size={18} /> Reject Manager
                    </button>
                  </>
                )}
                <button 
                  className="btn-close-modal"
                  onClick={() => setShowManagerModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estate Firm Verification Detail Modal - NEW */}
      {showEstateFirmModal && selectedEstateFirmVerification && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Estate Firm Verification Details</h3>
              <button className="btn-close" onClick={() => setShowEstateFirmModal(false)}>
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="user-profile">
                <div className="profile-header">
                  <div className="user-avatar-large business-avatar-large">
                    {selectedEstateFirmVerification.businessName.charAt(0).toUpperCase()}
                  </div>
                  <div className="profile-info">
                    <h4>{selectedEstateFirmVerification.businessName}</h4>
                    <p>{selectedEstateFirmVerification.contactEmail}</p>
                    <div className="profile-meta">
                      <span><Phone size={14} /> {selectedEstateFirmVerification.contactPhone}</span>
                      <span><MapPinIcon size={14} /> {selectedEstateFirmVerification.city}, {selectedEstateFirmVerification.state}</span>
                      <span><Building size={14} /> {getBusinessTypeLabel(selectedEstateFirmVerification.businessType)}</span>
                    </div>
                  </div>
                  <div className="profile-status">
                    <span className={`status-badge ${getStatusColor(selectedEstateFirmVerification.status)}`}>
                      {getStatusIcon(selectedEstateFirmVerification.status)} {selectedEstateFirmVerification.status.replace('_', ' ')}
                    </span>
                    <span className={`risk-badge ${getRiskColor(selectedEstateFirmVerification.riskLevel)}`}>
                      Risk: {selectedEstateFirmVerification.riskLevel}
                    </span>
                  </div>
                </div>
                
                <div className="verification-details">
                  <div className="detail-section">
                    <h5>Business Information</h5>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="label">Registration Number</span>
                        <span className="value">{selectedEstateFirmVerification.registrationNumber}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Tax ID Number</span>
                        <span className="value">{selectedEstateFirmVerification.taxIdNumber}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Contact Person</span>
                        <span className="value">{selectedEstateFirmVerification.contactPerson}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Years in Operation</span>
                        <span className="value">{selectedEstateFirmVerification.yearsInOperation}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Number of Employees</span>
                        <span className="value">{selectedEstateFirmVerification.numberOfEmployees}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Annual Turnover</span>
                        <span className="value">₦{parseInt(selectedEstateFirmVerification.annualTurnover).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h5>Business Documents</h5>
                    <div className="documents-grid">
                      <div className="document-card">
                        <div className="document-preview">
                          <FileText size={24} />
                          <span>CAC CERTIFICATE</span>
                        </div>
                        <div className="document-actions">
                          <button className="btn-view-doc">
                            <ExternalLink size={14} /> View
                          </button>
                        </div>
                      </div>
                      <div className="document-card">
                        <div className="document-preview">
                          <DollarSign size={24} />
                          <span>TAX CLEARANCE</span>
                        </div>
                        <div className="document-actions">
                          <button className="btn-view-doc">
                            <ExternalLink size={14} /> View
                          </button>
                        </div>
                      </div>
                      <div className="document-card">
                        <div className="document-preview">
                          <Home size={24} />
                          <span>ADDRESS PROOF</span>
                        </div>
                        <div className="document-actions">
                          <button className="btn-view-doc">
                            <ExternalLink size={14} /> View
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h5>Directors/Partners</h5>
                    <div className="directors-list">
                      {selectedEstateFirmVerification.directors.map((director, index) => (
                        <div key={index} className="director-item">
                          <div className="director-info">
                            <strong>{director.name}</strong>
                            <small>{director.position}</small>
                          </div>
                          <div className="director-id">
                            <span>ID: {director.idNumber}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h5>Services Offered</h5>
                    <div className="services-list">
                      {selectedEstateFirmVerification.servicesOffered.map((service, index) => (
                        <span key={index} className="service-tag">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {selectedEstateFirmVerification.comments && (
                    <div className="detail-section">
                      <h5>Verification Notes</h5>
                      <div className="notes-box">
                        <p>{selectedEstateFirmVerification.comments}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <div className="verification-actions">
                {selectedEstateFirmVerification.status === 'pending' && (
                  <>
                    <button 
                      className="btn-approve-large"
                      onClick={() => updateEstateFirmVerificationStatus(selectedEstateFirmVerification.id, 'approved')}
                    >
                      <CheckCircle size={18} /> Approve Firm
                    </button>
                    <button 
                      className="btn-reject-large"
                      onClick={() => {
                        const reason = prompt('Enter rejection reason:');
                        if (reason) {
                          updateEstateFirmVerificationStatus(selectedEstateFirmVerification.id, 'rejected', reason);
                        }
                      }}
                    >
                      <XCircle size={18} /> Reject Firm
                    </button>
                    <button 
                      className="btn-review"
                      onClick={() => {
                        const notes = prompt('Enter review notes:');
                        if (notes) {
                          updateEstateFirmVerificationStatus(selectedEstateFirmVerification.id, 'under_review', notes);
                        }
                      }}
                    >
                      <AlertTriangle size={18} /> Mark for Review
                    </button>
                  </>
                )}
                <button 
                  className="btn-close-modal"
                  onClick={() => setShowEstateFirmModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerification;