// src/modules/dashboard/pages/tenant/TenantApplications.jsx - UPDATED
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import './TenantApplications.css';

const TenantApplications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applications'); // 'applications' or 'inquiries'
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    
    // Load applications from localStorage
    const savedApplications = JSON.parse(localStorage.getItem(`tenant_applications_${user?.id}`) || '[]');
    
    // Load inquiries (contacted properties) from localStorage
    const savedInquiries = JSON.parse(localStorage.getItem(`tenant_inquiries_${user?.id}`) || '[]');
    
    // Mock data if none exists
    if (savedApplications.length === 0) {
      const mockApplications = [
        {
          id: '1',
          type: 'rental',
          propertyId: 'prop1',
          propertyTitle: 'Modern 2-Bedroom Apartment',
          propertyImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          ownerName: 'John Smith',
          ownerType: 'landlord',
          appliedDate: '2024-01-15',
          status: 'pending',
          amount: '₦150,000/month',
          nextStep: 'Schedule viewing',
          notes: 'Waiting for landlord response',
          lastUpdated: '2024-01-15',
          documents: ['id_copy.pdf', 'proof_of_income.pdf'],
          messages: 3
        },
        {
          id: '2',
          type: 'maintenance',
          propertyId: 'prop2',
          propertyTitle: 'Cozy Studio in Ikeja',
          propertyImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          ownerName: 'Sarah Johnson',
          ownerType: 'landlord',
          appliedDate: '2024-01-10',
          status: 'approved',
          amount: '₦85,000/month',
          nextStep: 'Sign lease agreement',
          notes: 'Lease ready for signing',
          lastUpdated: '2024-01-12',
          documents: ['lease_agreement.pdf'],
          messages: 5
        },
        {
          id: '3',
          type: 'rental',
          propertyId: 'prop3',
          propertyTitle: 'Luxury Penthouse in VI',
          propertyImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          ownerName: 'David Wilson',
          ownerType: 'estate-firm',
          firmName: 'Prime Properties',
          appliedDate: '2024-01-05',
          status: 'rejected',
          amount: '₦450,000/month',
          nextStep: 'Find alternative',
          notes: 'Property rented to another tenant',
          lastUpdated: '2024-01-08',
          documents: [],
          messages: 2
        },
        {
          id: '4',
          type: 'maintenance',
          service: 'Plumbing Repair',
          propertyId: 'prop4',
          propertyTitle: 'My Current Residence',
          propertyImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          ownerName: 'Greenfield Estates',
          ownerType: 'management',
          appliedDate: '2024-01-03',
          status: 'in_progress',
          amount: '₦25,000',
          nextStep: 'Schedule repair date',
          notes: 'Leaking bathroom pipe needs fixing',
          lastUpdated: '2024-01-04',
          documents: ['issue_photos.zip'],
          messages: 4
        }
      ];
      setApplications(mockApplications);
      localStorage.setItem(`tenant_applications_${user?.id}`, JSON.stringify(mockApplications));
    } else {
      setApplications(savedApplications);
    }
    
    // Load mock inquiries if none exist
    if (savedInquiries.length === 0) {
      const mockInquiries = [
        {
          id: 'inq1',
          propertyId: 'prop5',
          propertyTitle: '3-Bedroom Duplex in Lekki',
          propertyImage: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          ownerName: 'Michael Brown',
          ownerType: 'landlord',
          contactedDate: '2024-01-12',
          lastContact: '2024-01-14',
          status: 'active',
          interestLevel: 'high',
          notes: 'Viewed property, considering application',
          messages: 6
        },
        {
          id: 'inq2',
          propertyId: 'prop6',
          propertyTitle: 'Office Space in CBD',
          propertyImage: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          ownerName: 'Corporate Spaces Ltd',
          ownerType: 'estate-firm',
          contactedDate: '2024-01-08',
          lastContact: '2024-01-08',
          status: 'closed',
          interestLevel: 'low',
          notes: 'Too expensive for budget',
          messages: 3
        }
      ];
      setInquiries(mockInquiries);
      localStorage.setItem(`tenant_inquiries_${user?.id}`, JSON.stringify(mockInquiries));
    } else {
      setInquiries(savedInquiries);
    }
    
    setLoading(false);
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const filteredInquiries = inquiries.filter(inq => {
    if (filter === 'all') return true;
    return inq.status === filter;
  });

  const statusColors = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
    in_progress: 'info',
    withdrawn: 'neutral',
    active: 'info',
    closed: 'neutral'
  };

  const statusLabels = {
    pending: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected',
    in_progress: 'In Progress',
    withdrawn: 'Withdrawn',
    active: 'Active',
    closed: 'Closed'
  };

  const getApplicationTypeIcon = (type) => {
    switch(type) {
      case 'rental': return '🏠';
      case 'maintenance': return '🔧';
      case 'service': return '🛠️';
      default: return '📄';
    }
  };

  const withdrawApplication = (appId) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      const updated = applications.map(app => 
        app.id === appId ? { ...app, status: 'withdrawn' } : app
      );
      setApplications(updated);
      localStorage.setItem(`tenant_applications_${user?.id}`, JSON.stringify(updated));
    }
  };

  const createNewApplication = () => {
    // This would navigate to a form or property search
    navigate('/listings');
  };

  const viewProperty = (propertyId) => {
    navigate(`/listings/${propertyId}`);
  };

  const sendMessage = (ownerName, propertyId) => {
    navigate('/dashboard/messages', { 
      state: { 
        recipient: ownerName,
        propertyId: propertyId
      } 
    });
  };

  const viewDocuments = (appId) => {
    navigate('/dashboard/tenant/documents', { 
      state: { applicationId: appId } 
    });
  };

  const makePayment = (appId) => {
    navigate('/dashboard/tenant/payments', { 
      state: { applicationId: appId } 
    });
  };

  const scheduleViewing = (appId) => {
    alert(`Schedule viewing for application ${appId}. This would open a calendar/scheduling modal.`);
  };

  // Quick Navigation Links
  const quickLinks = [
    { icon: '📄', label: 'Documents', path: '/dashboard/tenant/documents' },
    { icon: '📜', label: 'Rental History', path: '/dashboard/tenant/rental-history' },
    { icon: '🔧', label: 'Maintenance', path: '/dashboard/tenant/maintenance' },
    { icon: '💳', label: 'Payments', path: '/dashboard/tenant/payments' },
    { icon: '👥', label: 'Referrals', path: '/dashboard/tenant/referrals' },
    { icon: '⚙️', label: 'Settings', path: '/dashboard/tenant/settings' }
  ];

  if (loading) {
    return (
      <div className="applications-loading">
        <div className="loading-spinner"></div>
        <p>Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="tenant-applications">
      {/* Header with Create New Button */}
      <div className="applications-header">
        <div className="header-content">
          <h1>Applications & Inquiries</h1>
          <p className="header-subtitle">
            Track your rental applications, maintenance requests, and property inquiries
          </p>
        </div>
        <button 
          className="btn btn-primary btn-lg"
          onClick={createNewApplication}
        >
          + New Application
        </button>
      </div>

      {/* Quick Navigation Links */}
      <div className="quick-links-section">
        <h3>Quick Access</h3>
        <div className="quick-links-grid">
          {quickLinks.map((link, index) => (
            <button
              key={index}
              className="quick-link-btn"
              onClick={() => navigate(link.path)}
            >
              <span className="link-icon">{link.icon}</span>
              <span className="link-label">{link.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Tabs */}
      <div className="applications-tabs">
        <div className="tabs-header">
          <div className="tab-buttons">
            <button 
              className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
              onClick={() => setActiveTab('applications')}
            >
              <span className="tab-icon">📋</span>
              <span className="tab-label">Applications</span>
              <span className="tab-count">{applications.length}</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'inquiries' ? 'active' : ''}`}
              onClick={() => setActiveTab('inquiries')}
            >
              <span className="tab-icon">💬</span>
              <span className="tab-label">Inquiries</span>
              <span className="tab-count">{inquiries.length}</span>
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button 
              className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
              onClick={() => setFilter('approved')}
            >
              Approved
            </button>
            <button 
              className={`filter-btn ${filter === 'in_progress' ? 'active' : ''}`}
              onClick={() => setFilter('in_progress')}
            >
              In Progress
            </button>
          </div>
        </div>

        {/* Applications Tab Content */}
{activeTab === 'applications' && (
  <div className="applications-list">
    {/* ADDED: Safety check for filteredApplications */}
    {filteredApplications && filteredApplications.length > 0 ? (
      <div className="applications-grid">
        {filteredApplications.map(app => {
          // Ensure app exists and has all required properties
          if (!app) return null;
          
          const safeDocuments = Array.isArray(app.documents) ? app.documents : [];
          const safeMessages = typeof app.messages === 'number' ? app.messages : 0;
          
          return (
            <div key={app.id} className="application-card">
              <div className="card-header">
                <div className="application-type">
                  <span className="type-icon">
                    {getApplicationTypeIcon(app.type || 'default')}
                  </span>
                  <span className="type-label">
                    {app.type === 'rental' ? 'Rental Application' : 
                     app.type === 'maintenance' ? 'Maintenance Request' : 
                     'Service Request'}
                  </span>
                </div>
                <div className={`application-status status-${statusColors[app.status || 'pending']}`}>
                  {statusLabels[app.status || 'pending']}
                </div>
              </div>

              <div className="card-body">
                <div className="property-info">
                  <img 
                    src={app.propertyImage || 'https://via.placeholder.com/300x200'} 
                    alt={app.propertyTitle || 'Property'}
                    className="property-thumbnail"
                    onClick={() => viewProperty(app.propertyId)}
                  />
                  <div className="property-details">
                    <h3 onClick={() => viewProperty(app.propertyId)}>
                      {app.propertyTitle || 'Unknown Property'}
                    </h3>
                    <div className="owner-info">
                      <span className="owner-name">
                        {app.ownerName || 'Unknown Owner'}
                        {app.firmName && ` (${app.firmName})`}
                      </span>
                      <span className="owner-type">{app.ownerType || 'owner'}</span>
                    </div>
                  </div>
                </div>

                <div className="application-details">
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Applied:</span>
                      <span className="detail-value">{app.appliedDate || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Amount:</span>
                      <span className="detail-value">{app.amount || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Next Step:</span>
                      <span className="detail-value highlight">{app.nextStep || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Last Updated:</span>
                      <span className="detail-value">{app.lastUpdated || 'N/A'}</span>
                    </div>
                  </div>

                  {app.notes && (
                    <div className="application-notes">
                      <span className="notes-label">Notes:</span>
                      <p>{app.notes}</p>
                    </div>
                  )}

                  <div className="application-meta">
                    {/* FIXED LINE 408: Using safeDocuments */}
                    {safeDocuments.length > 0 && (
                      <span className="meta-item">
                        📄 {safeDocuments.length} document(s)
                      </span>
                    )}
                    {/* FIXED: Using safeMessages */}
                    {safeMessages > 0 && (
                      <span className="meta-item">
                        💬 {safeMessages} message(s)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <div className="application-actions">
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => viewProperty(app.propertyId)}
                  >
                    View Property
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => sendMessage(app.ownerName, app.propertyId)}
                  >
                    Contact {app.ownerType === 'landlord' ? 'Landlord' : 'Manager'}
                  </button>
                  
                  {/* ... other buttons with safety checks ... */}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h3>No applications found</h3>
        <p>You haven't submitted any applications yet</p>
        <button className="btn btn-primary" onClick={() => navigate('/listings')}>
          Browse Properties to Apply
        </button>
      </div>
    )}
  </div>
)}
        {/* Inquiries Tab Content */}
        {activeTab === 'inquiries' && (
          <div className="inquiries-list">
            {filteredInquiries.length > 0 ? (
              <div className="inquiries-grid">
                {filteredInquiries.map(inq => (
                  <div key={inq.id} className="inquiry-card">
                    <div className="card-header">
                      <div className="inquiry-type">
                        <span className="type-icon">💬</span>
                        <span className="type-label">Property Inquiry</span>
                      </div>
                      <div className={`inquiry-status status-${statusColors[inq.status]}`}>
                        {statusLabels[inq.status]}
                      </div>
                    </div>

                    <div className="card-body">
                      <div className="property-info">
                        <img 
                          src={inq.propertyImage} 
                          alt={inq.propertyTitle}
                          className="property-thumbnail"
                          onClick={() => viewProperty(inq.propertyId)}
                        />
                        <div className="property-details">
                          <h3 onClick={() => viewProperty(inq.propertyId)}>
                            {inq.propertyTitle}
                          </h3>
                          <div className="owner-info">
                            <span className="owner-name">{inq.ownerName}</span>
                            <span className="owner-type">{inq.ownerType}</span>
                          </div>
                        </div>
                      </div>

                      <div className="inquiry-details">
                        <div className="detail-grid">
                          <div className="detail-item">
                            <span className="detail-label">Contacted:</span>
                            <span className="detail-value">{inq.contactedDate}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Last Contact:</span>
                            <span className="detail-value">{inq.lastContact}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Interest Level:</span>
                            <span className={`detail-value interest-${inq.interestLevel}`}>
                              {inq.interestLevel === 'high' ? 'High' : 'Low'}
                            </span>
                          </div>
                        </div>

                        {inq.notes && (
                          <div className="inquiry-notes">
                            <span className="notes-label">Notes:</span>
                            <p>{inq.notes}</p>
                          </div>
                        )}

                        <div className="inquiry-meta">
                          {inq.messages > 0 && (
                            <span className="meta-item">
                              💬 {inq.messages} message(s) exchanged
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="card-footer">
                      <div className="inquiry-actions">
                        <button 
                          className="btn btn-outline btn-sm"
                          onClick={() => viewProperty(inq.propertyId)}
                        >
                          View Property
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => sendMessage(inq.ownerName, inq.propertyId)}
                        >
                          Send Message
                        </button>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => navigate('/dashboard/post-property')}
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <h3>No inquiries found</h3>
                <p>You haven't contacted any landlords yet</p>
                <button className="btn btn-primary" onClick={() => navigate('/listings')}>
                  Browse Properties to Contact
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-item">
          <div className="stat-value">{applications.length}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{applications.filter(a => a.status === 'pending').length}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{applications.filter(a => a.status === 'approved').length}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{inquiries.length}</div>
          <div className="stat-label">Active Inquiries</div>
        </div>
      </div>

      {/* Helpful Tips */}
      <div className="help-tips">
        <h3>Application Tips & Guidelines</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">📋</div>
            <h4>Complete Applications</h4>
            <p>Fill all required fields and attach necessary documents for faster processing</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">💬</div>
            <h4>Communicate Regularly</h4>
            <p>Respond promptly to landlord inquiries to show serious interest</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">💰</div>
            <h4>Payment Ready</h4>
            <p>Have your payment method ready for quick processing upon approval</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">⏰</div>
            <h4>Follow Up</h4>
            <p>Follow up on pending applications after 2-3 business days</p>
          </div>
        </div>
      </div>

      {/* Need Help Section */}
      <div className="help-section">
        <div className="help-content">
          <h3>Need Help With Your Applications?</h3>
          <p>Our support team is here to help you through the application process</p>
          <div className="help-actions">
            <button 
              className="btn btn-outline"
              onClick={() => navigate('/dashboard/support')}
            >
              Contact Support
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/verify')}
            >
              Get Verified for Priority
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantApplications;