// src/modules/dashboard/pages/tenant/TenantSavedProperties.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import './TenantSavedProperties.css';

const TenantSavedProperties = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedProperties();
  }, []);

  const loadSavedProperties = () => {
    setLoading(true);
    const saved = JSON.parse(localStorage.getItem(`saved_properties_${user?.id}`) || '[]');
    
    if (saved.length === 0) {
      const mockSaved = [
        {
          id: '1',
          title: 'Luxury 3-Bedroom Apartment',
          image: 'https://via.placeholder.com/400x300',
          price: '₦250,000/month',
          location: 'Victoria Island, Lagos',
          type: 'Apartment',
          bedrooms: 3,
          bathrooms: 2,
          features: ['Pool', 'Gym', '24/7 Security'],
          postedDate: '2024-12-10',
          landlordName: 'Premium Properties Ltd',
          landlordVerified: true
        },
        {
          id: '2',
          title: 'Cozy Studio Apartment',
          image: 'https://via.placeholder.com/400x300',
          price: '₦85,000/month',
          location: 'Ikeja, Lagos',
          type: 'Studio',
          bedrooms: 1,
          bathrooms: 1,
          features: ['Furnished', 'WiFi', 'Parking'],
          postedDate: '2024-12-12',
          landlordName: 'Sarah Johnson',
          landlordVerified: true
        },
        {
          id: '3',
          title: 'Modern Townhouse',
          image: 'https://via.placeholder.com/400x300',
          price: '₦350,000/month',
          location: 'Lekki Phase 1, Lagos',
          type: 'Townhouse',
          bedrooms: 4,
          bathrooms: 3,
          features: ['Garden', 'Security', 'Generator'],
          postedDate: '2024-12-08',
          landlordName: 'Elite Homes',
          landlordVerified: true
        }
      ];
      setSavedProperties(mockSaved);
      localStorage.setItem(`saved_properties_${user?.id}`, JSON.stringify(mockSaved));
    } else {
      setSavedProperties(saved);
    }
    
    setLoading(false);
  };

  const removeFromSaved = (propertyId) => {
    const updated = savedProperties.filter(prop => prop.id !== propertyId);
    setSavedProperties(updated);
    localStorage.setItem(`saved_properties_${user?.id}`, JSON.stringify(updated));
  };

  const applyForProperty = (property) => {
    const applications = JSON.parse(localStorage.getItem(`tenant_applications_${user?.id}`) || '[]');
    const newApplication = {
      id: `app_${Date.now()}`,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyImage: property.image,
      landlordName: property.landlordName,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      amount: property.price,
      nextStep: 'Awaiting response'
    };
    
    applications.push(newApplication);
    localStorage.setItem(`tenant_applications_${user?.id}`, JSON.stringify(applications));
    
    // Show success message
    alert(`Application submitted for ${property.title}`);
  };

  if (loading) {
    return (
      <div className="saved-loading">
        <div className="loading-spinner"></div>
        <p>Loading saved properties...</p>
      </div>
    );
  }

  return (
    <div className="tenant-saved-properties">
      <div className="saved-header">
        <h1>Saved Properties ({savedProperties.length})</h1>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => navigate('/listings')}>
            Browse More
          </button>
          {savedProperties.length > 0 && (
            <button className="btn btn-primary" onClick={() => navigate('/dashboard/tenant/applications')}>
              View Applications
            </button>
          )}
        </div>
      </div>

      {savedProperties.length > 0 ? (
        <>
          {/* Saved Properties Grid */}
          <div className="saved-grid">
            {savedProperties.map(property => (
              <div key={property.id} className="saved-property-card">
                <div className="property-image">
                  <img src={property.image} alt={property.title} />
                  <button 
                    className="remove-btn"
                    onClick={() => removeFromSaved(property.id)}
                    title="Remove from saved"
                  >
                    ❌
                  </button>
                </div>
                
                <div className="property-content">
                  <div className="property-header">
                    <h3>{property.title}</h3>
                    <span className="property-type">{property.type}</span>
                  </div>
                  
                  <div className="property-price">{property.price}</div>
                  <div className="property-location">{property.location}</div>
                  
                  <div className="property-features">
                    <div className="feature">
                      <span className="feature-icon">🛏️</span>
                      <span>{property.bedrooms} Bed</span>
                    </div>
                    <div className="feature">
                      <span className="feature-icon">🚿</span>
                      <span>{property.bathrooms} Bath</span>
                    </div>
                  </div>
                  
                  <div className="property-tags">
                    {property.features.map((feature, index) => (
                      <span key={index} className="tag">{feature}</span>
                    ))}
                  </div>
                  
                  <div className="property-footer">
                    <div className="landlord-info">
                      <span className="landlord-name">{property.landlordName}</span>
                      {property.landlordVerified && (
                        <span className="verified-badge">✓ Verified</span>
                      )}
                    </div>
                    <div className="property-actions">
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => navigate(`/listings/${property.id}`)}
                      >
                        View Details
                      </button>
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => applyForProperty(property)}
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Section */}
          {savedProperties.length >= 2 && (
            <div className="comparison-section">
              <h3>Compare Properties</h3>
              <div className="comparison-table">
                <table>
                  <thead>
                    <tr>
                      <th>Feature</th>
                      {savedProperties.map(prop => (
                        <th key={prop.id}>{prop.title}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Price</td>
                      {savedProperties.map(prop => (
                        <td key={prop.id}>{prop.price}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Location</td>
                      {savedProperties.map(prop => (
                        <td key={prop.id}>{prop.location}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Type</td>
                      {savedProperties.map(prop => (
                        <td key={prop.id}>{prop.type}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Bedrooms</td>
                      {savedProperties.map(prop => (
                        <td key={prop.id}>{prop.bedrooms}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Bathrooms</td>
                      {savedProperties.map(prop => (
                        <td key={prop.id}>{prop.bathrooms}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="empty-saved">
          <div className="empty-icon">⭐</div>
          <h3>No Saved Properties</h3>
          <p>Save properties you're interested in for easy access and comparison</p>
          <button className="btn btn-primary" onClick={() => navigate('/listings')}>
            Browse Properties
          </button>
        </div>
      )}
    </div>
  );
};

export default TenantSavedProperties;