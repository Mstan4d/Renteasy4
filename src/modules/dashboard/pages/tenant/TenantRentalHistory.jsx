// src/modules/dashboard/pages/tenant/TenantRentalHistory.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../shared/context/AuthContext';
import './TenantRentalHistory.css';

const TenantRentalHistory = () => {
  const { user } = useAuth();
  const [rentalHistory, setRentalHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRentalHistory();
  }, []);

  const loadRentalHistory = () => {
    setLoading(true);
    
    // Mock rental history data
    const mockHistory = [
      {
        id: '1',
        propertyName: 'Sunrise Apartments - Unit 4B',
        address: '123 Main Street, Lagos',
        landlord: 'John Doe',
        period: 'Jan 2023 - Dec 2024',
        status: 'completed',
        rentAmount: '₦150,000/month',
        depositPaid: '₦300,000',
        depositReturned: '₦300,000',
        landlordRating: 4.5,
        tenantRating: 4.0,
        notes: 'Great landlord, responsive to maintenance requests'
      },
      {
        id: '2',
        propertyName: 'Green Villa - Studio',
        address: '456 Oak Avenue, Abuja',
        landlord: 'Sarah Smith',
        period: 'Jun 2022 - Dec 2022',
        status: 'completed',
        rentAmount: '₦85,000/month',
        depositPaid: '₦170,000',
        depositReturned: '₦170,000',
        landlordRating: 4.0,
        tenantRating: 4.5,
        notes: 'Peaceful neighborhood, good security'
      },
      {
        id: '3',
        propertyName: 'Luxury Heights - 3 Bedroom',
        address: '789 Beach Road, Lagos',
        landlord: 'Premium Properties Ltd',
        period: 'Mar 2021 - May 2022',
        status: 'completed',
        rentAmount: '₦280,000/month',
        depositPaid: '₦560,000',
        depositReturned: '₦560,000',
        landlordRating: 4.8,
        tenantRating: 4.2,
        notes: 'Excellent amenities, well-maintained'
      }
    ];

    // Try to load from localStorage first
    const savedHistory = JSON.parse(localStorage.getItem(`rental_history_${user?.id}`) || 'null');
    
    if (savedHistory) {
      setRentalHistory(savedHistory);
    } else {
      setRentalHistory(mockHistory);
      localStorage.setItem(`rental_history_${user?.id}`, JSON.stringify(mockHistory));
    }
    
    setLoading(false);
  };

  const downloadTenantReport = () => {
    // In a real app, this would generate a PDF
    alert('Tenant report generated. Download will start shortly.');
  };

  const requestReference = (historyItem) => {
    alert(`Reference request sent to ${historyItem.landlord}`);
  };

  if (loading) {
    return (
      <div className="rental-history-loading">
        <div className="loading-spinner"></div>
        <p>Loading rental history...</p>
      </div>
    );
  }

  return (
    <div className="tenant-rental-history">
      <div className="rental-header">
        <div className="header-content">
          <h1>Rental History</h1>
          <p>Track your past and current rental experiences</p>
        </div>
        <button className="btn btn-primary" onClick={downloadTenantReport}>
          Download Tenant Report
        </button>
      </div>

      {/* Rental Stats */}
      <div className="rental-stats">
        <div className="stat-card">
          <div className="stat-icon">🏠</div>
          <div className="stat-info">
            <span className="stat-value">{rentalHistory.length}</span>
            <span className="stat-label">Properties Rented</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <span className="stat-value">
              {rentalHistory.length > 0 
                ? (rentalHistory.reduce((acc, curr) => acc + curr.tenantRating, 0) / rentalHistory.length).toFixed(1)
                : '0.0'
              }
            </span>
            <span className="stat-label">Average Tenant Rating</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <div className="stat-info">
            <span className="stat-value">2</span>
            <span className="stat-label">Landlord References</span>
          </div>
        </div>
      </div>

      {/* Rental History List */}
      <div className="rental-history-list">
        <h2>Past & Current Rentals</h2>
        
        {rentalHistory.length > 0 ? (
          rentalHistory.map((rental) => (
            <div key={rental.id} className="rental-card">
              <div className="rental-header-info">
                <div className="property-main">
                  <h3>{rental.propertyName}</h3>
                  <span className={`status-badge ${rental.status}`}>
                    {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                  </span>
                </div>
                <div className="rental-period">{rental.period}</div>
              </div>

              <div className="rental-details">
                <div className="detail-column">
                  <div className="detail-item">
                    <span className="detail-label">Address:</span>
                    <span className="detail-value">{rental.address}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Landlord:</span>
                    <span className="detail-value">{rental.landlord}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Monthly Rent:</span>
                    <span className="detail-value">{rental.rentAmount}</span>
                  </div>
                </div>

                <div className="detail-column">
                  <div className="detail-item">
                    <span className="detail-label">Security Deposit:</span>
                    <span className="detail-value">{rental.depositPaid}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Deposit Returned:</span>
                    <span className="detail-value deposit-returned">
                      {rental.depositReturned}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Landlord Rating:</span>
                    <div className="rating-stars">
                      {'★'.repeat(Math.floor(rental.landlordRating))}
                      {'☆'.repeat(5 - Math.floor(rental.landlordRating))}
                      <span className="rating-number">({rental.landlordRating})</span>
                    </div>
                  </div>
                </div>
              </div>

              {rental.notes && (
                <div className="rental-notes">
                  <span className="notes-label">Notes:</span>
                  <p>{rental.notes}</p>
                </div>
              )}

              <div className="rental-actions">
                <button 
                  className="btn btn-outline"
                  onClick={() => requestReference(rental)}
                >
                  Request Reference
                </button>
                <button className="btn btn-secondary">
                  View Documents
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-history">
            <div className="empty-icon">📅</div>
            <h3>No Rental History</h3>
            <p>Your rental history will appear here once you start renting through RentEasy</p>
          </div>
        )}
      </div>

      {/* Benefits Section */}
      <div className="history-benefits">
        <h3>Build Your Rental Reputation</h3>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">📈</div>
            <h4>Improve Your Profile</h4>
            <p>A good rental history increases your chances of approval</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🤝</div>
            <h4>Get References</h4>
            <p>Request references from past landlords</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">📄</div>
            <h4>Tenant Report</h4>
            <p>Download a verified tenant report for new applications</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantRentalHistory;