import React, { useState } from 'react';
import ProviderPageTemplate from '../templates/ProviderPageTemplate';
import { FaEye, FaSave, FaGlobe, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

const ProviderMarketplaceProfile = () => {
  const [profile, setProfile] = useState({
    businessName: 'Professional Cleaners NG',
    tagline: 'Professional cleaning services for homes & offices',
    description: 'We provide top-notch cleaning services with eco-friendly products. Serving Lagos for over 5 years with certified professionals and modern equipment. Our team is trained in deep cleaning, sanitization, and maintenance.',
    categories: ['Cleaning', 'Home Services'],
    serviceArea: 'Lagos, Nigeria',
    contactPhone: '+2348012345678',
    contactEmail: 'info@cleanersng.com',
    website: 'https://www.cleanersng.com',
    socialMedia: {
      facebook: 'facebook.com/cleanersng',
      instagram: '@cleanersng',
      twitter: '@cleanersng'
    },
    operatingHours: {
      mondayToFriday: '8:00 AM - 6:00 PM',
      saturday: '9:00 AM - 4:00 PM',
      sunday: 'Emergency Services Only'
    },
    servicesOffered: [
      'Deep House Cleaning',
      'Office Cleaning',
      'Carpet Cleaning',
      'Window Cleaning',
      'Post-Construction Cleaning'
    ]
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    alert('Profile saved successfully! Your marketplace profile has been updated.');
  };

  const handlePreview = () => {
    alert('Opening preview of your marketplace profile...');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleAddService = () => {
    const newService = prompt('Enter new service:');
    if (newService && newService.trim()) {
      setProfile({
        ...profile,
        servicesOffered: [...profile.servicesOffered, newService.trim()]
      });
    }
  };

  const handleRemoveService = (index) => {
    const updatedServices = profile.servicesOffered.filter((_, i) => i !== index);
    setProfile({
      ...profile,
      servicesOffered: updatedServices
    });
  };

  return (
    <ProviderPageTemplate
      title="Marketplace Profile"
      subtitle="This is how you appear in the RentEasy marketplace to tenants, landlords, and estate firms"
      actions={
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!isEditing ? (
            <>
              <button 
                className="btn-secondary"
                onClick={handlePreview}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <FaEye />
                Preview
              </button>
              <button 
                className="btn-primary"
                onClick={handleEdit}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Edit Profile
              </button>
            </>
          ) : (
            <>
              <button 
                className="btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleSave}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <FaSave />
                Save Changes
              </button>
            </>
          )}
        </div>
      }
    >
      {/* Tabs Navigation */}
      <div className="tabs-container" style={{ marginBottom: '2rem' }}>
        <div className="tabs">
          {['basic', 'contact', 'services', 'social'].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Marketplace Visibility Note */}
      <div className="info-card" style={{ marginBottom: '2rem' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#1a237e' }}>
          ⓘ Marketplace Visibility Information
        </h4>
        <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>
          Your profile appears immediately in the RentEasy marketplace. 
          <strong> Boost</strong> improves ranking, <strong>verification</strong> adds trust badge. 
          This profile is visible to all users searching for services.
        </p>
      </div>

      {/* Basic Information Tab */}
      {activeTab === 'basic' && (
        <div className="card-grid">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Business Information</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Business Name *</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={profile.businessName}
                  onChange={(e) => setProfile({...profile, businessName: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Enter your business name"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Tagline *</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={profile.tagline}
                  onChange={(e) => setProfile({...profile, tagline: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Brief description of your services"
                />
                <small className="form-help">This appears below your business name in marketplace</small>
              </div>
              
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea 
                  className="form-control"
                  rows="6"
                  value={profile.description}
                  onChange={(e) => setProfile({...profile, description: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Detailed description of your services, experience, and specialties"
                />
                <small className="form-help">Minimum 100 characters recommended</small>
              </div>

              <div className="form-group">
                <label className="form-label">Service Categories</label>
                <div className="tags-container">
                  {profile.categories.map((category, index) => (
                    <span key={index} className="tag">
                      {category}
                    </span>
                  ))}
                  {isEditing && (
                    <button 
                      className="tag-add"
                      onClick={() => {
                        const newCategory = prompt('Enter new category:');
                        if (newCategory && newCategory.trim()) {
                          setProfile({
                            ...profile,
                            categories: [...profile.categories, newCategory.trim()]
                          });
                        }
                      }}
                    >
                      + Add
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Preview</h3>
            </div>
            <div className="card-body">
              <div className="marketplace-preview">
                <div className="preview-header">
                  <div className="preview-avatar">
                    PC
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0' }}>{profile.businessName}</h4>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>{profile.tagline}</p>
                    <div className="rating-badge">
                      ⭐ 4.8 (128 reviews)
                    </div>
                  </div>
                </div>
                
                <div className="preview-description">
                  <p>{profile.description.substring(0, 200)}...</p>
                </div>
                
                <div className="preview-categories">
                  {profile.categories.map((category, index) => (
                    <span key={index} className="category-tag">
                      {category}
                    </span>
                  ))}
                </div>
                
                <div className="preview-actions">
                  <button className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                    View Profile
                  </button>
                  <button className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                    Contact Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Information Tab */}
      {activeTab === 'contact' && (
        <div className="card-grid">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Contact Details</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">
                  <FaPhone style={{ marginRight: '0.5rem', color: '#666' }} />
                  Phone Number *
                </label>
                <input 
                  type="tel" 
                  className="form-control"
                  value={profile.contactPhone}
                  onChange={(e) => setProfile({...profile, contactPhone: e.target.value})}
                  disabled={!isEditing}
                  placeholder="+2348012345678"
                />
                <small className="form-help">This number will be visible to potential clients</small>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <FaEnvelope style={{ marginRight: '0.5rem', color: '#666' }} />
                  Email Address *
                </label>
                <input 
                  type="email" 
                  className="form-control"
                  value={profile.contactEmail}
                  onChange={(e) => setProfile({...profile, contactEmail: e.target.value})}
                  disabled={!isEditing}
                  placeholder="contact@yourbusiness.com"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <FaMapMarkerAlt style={{ marginRight: '0.5rem', color: '#666' }} />
                  Service Area *
                </label>
                <input 
                  type="text" 
                  className="form-control"
                  value={profile.serviceArea}
                  onChange={(e) => setProfile({...profile, serviceArea: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Cities or areas you serve"
                />
                <small className="form-help">Be specific to attract local clients</small>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Operating Hours</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Monday - Friday</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={profile.operatingHours.mondayToFriday}
                  onChange={(e) => setProfile({
                    ...profile,
                    operatingHours: {...profile.operatingHours, mondayToFriday: e.target.value}
                  })}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Saturday</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={profile.operatingHours.saturday}
                  onChange={(e) => setProfile({
                    ...profile,
                    operatingHours: {...profile.operatingHours, saturday: e.target.value}
                  })}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Sunday & Holidays</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={profile.operatingHours.sunday}
                  onChange={(e) => setProfile({
                    ...profile,
                    operatingHours: {...profile.operatingHours, sunday: e.target.value}
                  })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Services Offered</h3>
            {isEditing && (
              <button 
                className="btn-secondary"
                onClick={handleAddService}
                style={{ fontSize: '0.9rem' }}
              >
                + Add Service
              </button>
            )}
          </div>
          <div className="card-body">
            {profile.servicesOffered.length === 0 ? (
              <div className="empty-state">
                <p>No services added yet. Add your first service to attract clients.</p>
                {isEditing && (
                  <button 
                    className="btn-primary"
                    onClick={handleAddService}
                  >
                    Add Your First Service
                  </button>
                )}
              </div>
            ) : (
              <div className="services-list">
                {profile.servicesOffered.map((service, index) => (
                  <div key={index} className="service-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="service-icon">
                        🔧
                      </div>
                      <span style={{ flex: 1 }}>{service}</span>
                    </div>
                    {isEditing && (
                      <button 
                        className="btn-secondary"
                        onClick={() => handleRemoveService(index)}
                        style={{ 
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.85rem',
                          background: '#ffebee',
                          color: '#c62828',
                          borderColor: '#ffcdd2'
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="form-group" style={{ marginTop: '2rem' }}>
              <label className="form-label">Service Notes</label>
              <textarea 
                className="form-control"
                rows="3"
                placeholder="Add any additional information about your services, such as specialties, equipment used, or certifications..."
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>
      )}

      {/* Social Media Tab */}
      {activeTab === 'social' && (
        <div className="card-grid">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Website & Social Media</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">
                  <FaGlobe style={{ marginRight: '0.5rem', color: '#666' }} />
                  Website
                </label>
                <input 
                  type="url" 
                  className="form-control"
                  value={profile.website}
                  onChange={(e) => setProfile({...profile, website: e.target.value})}
                  disabled={!isEditing}
                  placeholder="https://www.yourwebsite.com"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <FaFacebook style={{ marginRight: '0.5rem', color: '#1877F2' }} />
                  Facebook
                </label>
                <input 
                  type="text" 
                  className="form-control"
                  value={profile.socialMedia.facebook}
                  onChange={(e) => setProfile({
                    ...profile, 
                    socialMedia: {...profile.socialMedia, facebook: e.target.value}
                  })}
                  disabled={!isEditing}
                  placeholder="facebook.com/yourpage"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <FaInstagram style={{ marginRight: '0.5rem', color: '#E4405F' }} />
                  Instagram
                </label>
                <input 
                  type="text" 
                  className="form-control"
                  value={profile.socialMedia.instagram}
                  onChange={(e) => setProfile({
                    ...profile, 
                    socialMedia: {...profile.socialMedia, instagram: e.target.value}
                  })}
                  disabled={!isEditing}
                  placeholder="@yourusername"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <FaTwitter style={{ marginRight: '0.5rem', color: '#1DA1F2' }} />
                  Twitter/X
                </label>
                <input 
                  type="text" 
                  className="form-control"
                  value={profile.socialMedia.twitter}
                  onChange={(e) => setProfile({
                    ...profile, 
                    socialMedia: {...profile.socialMedia, twitter: e.target.value}
                  })}
                  disabled={!isEditing}
                  placeholder="@yourusername"
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Social Media Tips</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="tip-card">
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>✅ Add Social Proof</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                    Links to your social profiles add credibility and help clients learn more about your work.
                  </p>
                </div>
                
                <div className="tip-card">
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>✅ Showcase Your Work</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                    Use Instagram/Facebook to showcase before/after photos and client testimonials.
                  </p>
                </div>
                
                <div className="tip-card">
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>✅ Build Trust</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                    Active social media presence shows you're an established, professional service provider.
                  </p>
                </div>
              </div>
              
              <div style={{ 
                marginTop: '2rem',
                padding: '1rem',
                background: '#E3F2FD',
                borderRadius: '8px',
                borderLeft: '4px solid #2196F3'
              }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#1565C0' }}>
                  <strong>Note:</strong> Social media links are optional but recommended. 
                  They help improve your marketplace ranking and client trust.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Important Notice */}
      <div className="info-card" style={{ marginTop: '2rem' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#1a237e' }}>
          🎯 Marketplace Best Practices
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div>
            <strong style={{ color: '#4CAF50' }}>Complete Profile</strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#666' }}>
              Fill all sections for better visibility
            </p>
          </div>
          <div>
            <strong style={{ color: '#2196F3' }}>Clear Photos</strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#666' }}>
              Add high-quality photos of your work
            </p>
          </div>
          <div>
            <strong style={{ color: '#9C27B0' }}>Quick Responses</strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#666' }}>
              Respond to inquiries within 24 hours
            </p>
          </div>
          <div>
            <strong style={{ color: '#FF9800' }}>Encourage Reviews</strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#666' }}>
              Ask satisfied clients to leave reviews
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Tabs */
        .tabs-container {
          border-bottom: 1px solid #e0e0e0;
        }
        
        .tabs {
          display: flex;
          overflow-x: auto;
          gap: 0;
        }
        
        .tab-btn {
          padding: 1rem 1.5rem;
          border: none;
          background: none;
          border-bottom: 3px solid transparent;
          color: #666;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.3s ease;
        }
        
        .tab-btn:hover {
          color: #1a237e;
          background: #f5f5f5;
        }
        
        .tab-btn.active {
          color: #1a237e;
          border-bottom-color: #1a237e;
          font-weight: 600;
        }
        
        /* Cards */
        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .card-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8f9fa;
        }
        
        .card-title {
          margin: 0;
          font-size: 1.1rem;
          color: #1a237e;
        }
        
        .card-body {
          padding: 1.5rem;
        }
        
        /* Forms */
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
          display: flex;
          align-items: center;
        }
        
        .form-control {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }
        
        .form-control:focus {
          outline: none;
          border-color: #1a237e;
          box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
        }
        
        .form-control:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }
        
        .form-help {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.85rem;
          color: #666;
        }
        
        /* Tags */
        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        
        .tag {
          padding: 0.4rem 0.8rem;
          background: #e3f2fd;
          color: #1565c0;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }
        
        .tag-add {
          padding: 0.4rem 0.8rem;
          background: transparent;
          color: #1a237e;
          border: 1px dashed #1a237e;
          border-radius: 20px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .tag-add:hover {
          background: #1a237e;
          color: white;
        }
        
        /* Marketplace Preview */
        .marketplace-preview {
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 1.5rem;
          background: #f8f9fa;
        }
        
        .preview-header {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .preview-avatar {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
        }
        
        .rating-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #fff3e0;
          color: #ef6c00;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        
        .preview-description {
          margin-bottom: 1.5rem;
          color: #666;
          line-height: 1.6;
        }
        
        .preview-categories {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        
        .category-tag {
          padding: 0.3rem 0.7rem;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 20px;
          font-size: 0.85rem;
          color: #666;
        }
        
        .preview-actions {
          display: flex;
          gap: 0.75rem;
        }
        
        /* Services List */
        .services-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .service-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .service-item:hover {
          border-color: #1a237e;
          background: #f8f9fa;
        }
        
        .service-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #e3f2fd;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }
        
        /* Info Cards */
        .info-card {
          padding: 1.5rem;
          background: #f8f9fa;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          border-left: 4px solid #1a237e;
        }
        
        .tip-card {
          padding: 1rem;
          background: #f5f5f5;
          border-radius: 8px;
          border-left: 4px solid #4caf50;
        }
        
        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #666;
        }
        
        /* Buttons */
        .btn-primary, .btn-secondary {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          font-size: 0.95rem;
        }
        
        .btn-primary {
          background: #1a237e;
          color: white;
        }
        
        .btn-primary:hover {
          background: #0d145c;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(26, 35, 126, 0.2);
        }
        
        .btn-secondary {
          background: white;
          color: #1a237e;
          border: 1px solid #1a237e;
        }
        
        .btn-secondary:hover {
          background: #f5f5f5;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .card-grid {
            grid-template-columns: 1fr;
          }
          
          .tabs {
            flex-wrap: nowrap;
            overflow-x: auto;
          }
          
          .tab-btn {
            padding: 0.75rem 1rem;
            font-size: 0.9rem;
          }
          
          .card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .preview-header {
            flex-direction: column;
            text-align: center;
          }
          
          .preview-avatar {
            align-self: center;
          }
          
          .preview-actions {
            flex-direction: column;
          }
        }
        
        @media (max-width: 480px) {
          .card-body {
            padding: 1rem;
          }
          
          .form-control {
            padding: 0.6rem 0.8rem;
          }
          
          .btn-primary, .btn-secondary {
            padding: 0.6rem 1rem;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </ProviderPageTemplate>
  );
};

export default ProviderMarketplaceProfile;