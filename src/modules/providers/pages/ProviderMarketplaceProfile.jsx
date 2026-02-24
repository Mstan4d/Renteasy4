import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import ProviderPageTemplate from '../templates/ProviderPageTemplate';
import { 
  FaEye, FaSave, FaGlobe, FaPhone, FaEnvelope, FaMapMarkerAlt, 
  FaFacebook, FaInstagram, FaTwitter 
} from 'react-icons/fa';
import './ProviderMarketplaceProfile.css'; // external CSS

const ProviderMarketplaceProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    businessName: '',
    tagline: '',
    description: '',
    categories: [],
    serviceArea: '',
    contactPhone: '',
    contactEmail: '',
    website: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: ''
    },
    operatingHours: {
      mondayToFriday: '',
      saturday: '',
      sunday: ''
    },
    servicesOffered: []
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState(null);

  // Fetch profile on mount
  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('marketplace_profiles')
        .select('*')
        .eq('provider_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Map database fields to component state
        setProfile({
          businessName: data.business_name || '',
          tagline: data.tagline || '',
          description: data.description || '',
          categories: data.categories || [],
          serviceArea: data.service_area || '',
          contactPhone: data.contact_phone || '',
          contactEmail: data.contact_email || user.email || '',
          website: data.website || '',
          socialMedia: data.social_media || { facebook: '', instagram: '', twitter: '' },
          operatingHours: data.operating_hours || { mondayToFriday: '', saturday: '', sunday: '' },
          servicesOffered: data.services_offered || []
        });
        setProfileId(data.id);
      } else {
        // No profile yet, we'll create one on save
        // Pre-fill email from auth
        setProfile(prev => ({ ...prev, contactEmail: user.email || '' }));
      }
    } catch (error) {
      console.error('Error fetching marketplace profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Prepare data for Supabase (convert camelCase to snake_case)
      const profileData = {
        provider_id: user.id,
        business_name: profile.businessName,
        tagline: profile.tagline,
        description: profile.description,
        categories: profile.categories,
        service_area: profile.serviceArea,
        contact_phone: profile.contactPhone,
        contact_email: profile.contactEmail,
        website: profile.website,
        social_media: profile.socialMedia,
        operating_hours: profile.operatingHours,
        services_offered: profile.servicesOffered
      };

      let result;
      if (profileId) {
        // Update existing
        result = await supabase
          .from('marketplace_profiles')
          .update(profileData)
          .eq('id', profileId);
      } else {
        // Insert new
        result = await supabase
          .from('marketplace_profiles')
          .insert([profileData])
          .select();
      }

      if (result.error) throw result.error;

      // If insert, get the new id
      if (!profileId && result.data) {
        setProfileId(result.data[0].id);
      }

      setIsEditing(false);
      alert('Profile saved successfully! Your marketplace profile has been updated.');
    } catch (error) {
      console.error('Error saving marketplace profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  const handlePreview = () => {
    // Could open a modal or navigate to public view
    alert('Opening preview of your marketplace profile...');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Revert changes by re-fetching
    fetchProfile();
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

  const handleAddCategory = () => {
    const newCategory = prompt('Enter new category:');
    if (newCategory && newCategory.trim()) {
      setProfile({
        ...profile,
        categories: [...profile.categories, newCategory.trim()]
      });
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

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
                      onClick={handleAddCategory}
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
                    {profile.businessName.charAt(0) || 'PC'}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0' }}>{profile.businessName || 'Your Business Name'}</h4>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>{profile.tagline || 'Your tagline here'}</p>
                    <div className="rating-badge">
                      ⭐ 4.8 (128 reviews)
                    </div>
                  </div>
                </div>
                
                <div className="preview-description">
                  <p>{profile.description ? profile.description.substring(0, 200) + '...' : 'Your description will appear here.'}</p>
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
    </ProviderPageTemplate>
  );
};

export default ProviderMarketplaceProfile;