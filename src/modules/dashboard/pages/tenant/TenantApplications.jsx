// src/modules/dashboard/pages/tenant/TenantApplications.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import './TenantApplications.css';

const TenantApplications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = () => {
    setLoading(true);
    const savedApplications = JSON.parse(localStorage.getItem(`tenant_applications_${user?.id}`) || '[]');
    
    // Mock data if none exists
    if (savedApplications.length === 0) {
      const mockApplications = [
        {
          id: '1',
          propertyId: 'prop1',
          propertyTitle: 'Modern 2-Bedroom Apartment',
          propertyImage: 'https://via.placeholder.com/300x200',
          landlordName: 'John Smith',
          appliedDate: '2024-12-15',
          status: 'pending',
          amount: '₦150,000/month',
          nextStep: 'Schedule viewing',
          notes: 'Waiting for landlord response'
        },
        {
          id: '2',
          propertyId: 'prop2',
          propertyTitle: 'Cozy Studio in Ikeja',
          propertyImage: 'https://via.placeholder.com/300x200',
          landlordName: 'Sarah Johnson',
          appliedDate: '2024-12-10',
          status: 'approved',
          amount: '₦85,000/month',
          nextStep: 'Sign lease agreement',
          notes: 'Lease ready for signing'
        },
        {
          id: '3',
          propertyId: 'prop3',
          propertyTitle: 'Luxury Penthouse in VI',
          propertyImage: 'https://via.placeholder.com/300x200',
          landlordName: 'David Wilson',
          appliedDate: '2024-12-05',
          status: 'rejected',
          amount: '₦450,000/month',
          nextStep: 'Find alternative',
          notes: 'Property rented to another tenant'
        }
      ];
      setApplications(mockApplications);
      localStorage.setItem(`tenant_applications_${user?.id}`, JSON.stringify(mockApplications));
    } else {
      setApplications(savedApplications);
    }
    
    setLoading(false);
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const statusColors = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
    withdrawn: 'neutral'
  };

  const statusLabels = {
    pending: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn'
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

  const viewProperty = (propertyId) => {
    navigate(`/listings/${propertyId}`);
  };

  const sendMessage = (landlordName) => {
    navigate('/messages', { state: { recipient: landlordName } });
  };

  if (loading) {
    return (
      <div className="applications-loading">
        <div className="loading-spinner"></div>
        <p>Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="tenant-applications">
      <div className="applications-header">
        <h1>My Applications</h1>
        <button className="btn btn-primary" onClick={() => navigate('/listings')}>
          Browse Properties
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="applications-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({applications.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({applications.filter(a => a.status === 'pending').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Approved ({applications.filter(a => a.status === 'approved').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected ({applications.filter(a => a.status === 'rejected').length})
        </button>
      </div>

      {/* Applications List */}
      <div className="applications-list">
        {filteredApplications.length > 0 ? (
          filteredApplications.map(app => (
            <div key={app.id} className="application-card">
              <div className="application-header">
                <div className="property-info">
                  <img 
                    src={app.propertyImage} 
                    alt={app.propertyTitle}
                    className="property-thumbnail"
                    onClick={() => viewProperty(app.propertyId)}
                  />
                  <div className="property-details">
                    <h3 onClick={() => viewProperty(app.propertyId)}>
                      {app.propertyTitle}
                    </h3>
                    <div className="landlord-info">
                      <span className="landlord-name">{app.landlordName}</span>
                      <button 
                        className="btn-message"
                        onClick={() => sendMessage(app.landlordName)}
                      >
                        Message
                      </button>
                    </div>
                  </div>
                </div>
                <div className={`application-status status-${statusColors[app.status]}`}>
                  {statusLabels[app.status]}
                </div>
              </div>

              <div className="application-details">
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-label">Applied Date:</span>
                    <span className="detail-value">{app.appliedDate}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Rent Amount:</span>
                    <span className="detail-value">{app.amount}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Next Step:</span>
                    <span className="detail-value">{app.nextStep}</span>
                  </div>
                </div>
                
                {app.notes && (
                  <div className="application-notes">
                    <span className="notes-label">Notes:</span>
                    <p>{app.notes}</p>
                  </div>
                )}
              </div>

              <div className="application-actions">
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => viewProperty(app.propertyId)}
                >
                  View Property
                </button>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => sendMessage(app.landlordName)}
                >
                  Contact Landlord
                </button>
                {app.status === 'pending' && (
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => withdrawApplication(app.id)}
                  >
                    Withdraw
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-applications">
            <div className="empty-icon">📋</div>
            <h3>No applications found</h3>
            <p>You haven't applied for any properties yet</p>
            <button className="btn btn-primary" onClick={() => navigate('/listings')}>
              Browse Available Properties
            </button>
          </div>
        )}
      </div>

      {/* Application Tips */}
      <div className="application-tips">
        <h3>Tips for Successful Applications</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">✅</div>
            <h4>Complete Your Profile</h4>
            <p>Landlords are more likely to approve tenants with complete profiles</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">📄</div>
            <h4>Prepare Documents</h4>
            <p>Have your ID, proof of income, and references ready</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">💬</div>
            <h4>Communicate Clearly</h4>
            <p>Respond promptly to landlord inquiries</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">⭐</div>
            <h4>Get Verified</h4>
            <p>Verified tenants get priority in applications</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantApplications;