import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import {
  Building, Mail, Phone, Globe, MapPin, Edit,
  Save, Upload, CheckCircle, XCircle, Camera,
  Users, Briefcase, Calendar, Shield, Award,
  FileText, DollarSign, Home, Star
} from 'lucide-react';
import './EstateProfile.css';

const EstateProfile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firmName: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    yearEstablished: '',
    totalAgents: '',
    propertiesManaged: '',
    specialties: [],
    description: '',
    logo: '',
    coverImage: '',
    officeHours: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: ''
    },
    services: [],
    certification: {
      cacNumber: '',
      rcNumber: '',
      certified: false,
      verificationStatus: 'pending'
    }
  });

  const [stats, setStats] = useState({
    totalProperties: 0,
    activeClients: 0,
    monthlyRevenue: 0,
    clientSatisfaction: 0
  });

  useEffect(() => {
    // Load profile data
    const loadProfile = async () => {
      // Mock data - replace with API call
      setFormData({
        firmName: user?.companyName || 'Prime Properties Ltd',
        contactPerson: user?.name || 'John Doe',
        email: user?.email || 'contact@primeproperties.com',
        phone: '+2348012345678',
        website: 'https://primeproperties.com',
        address: '123 Broad Street, Lagos Island, Lagos',
        yearEstablished: '2015',
        totalAgents: '24',
        propertiesManaged: '156',
        specialties: ['Commercial', 'Residential', 'Industrial', 'Luxury'],
        description: 'A premier real estate firm specializing in luxury and commercial properties across Nigeria. With 8+ years of experience, we provide exceptional service and value to our clients.',
        logo: '/api/placeholder/100/100',
        coverImage: '/api/placeholder/1200/300',
        officeHours: 'Mon - Fri: 9am - 6pm | Sat: 10am - 4pm',
        socialLinks: {
          facebook: 'https://facebook.com/primeproperties',
          twitter: 'https://twitter.com/primeproperties',
          linkedin: 'https://linkedin.com/company/primeproperties',
          instagram: 'https://instagram.com/primeproperties'
        },
        services: [
          'Property Sales',
          'Property Rentals',
          'Property Management',
          'Real Estate Consulting',
          'Valuation Services',
          'Tenant Screening'
        ],
        certification: {
          cacNumber: 'RC-1234567',
          rcNumber: 'BN-9876543',
          certified: true,
          verificationStatus: 'verified'
        }
      });

      setStats({
        totalProperties: 156,
        activeClients: 89,
        monthlyRevenue: 45000000,
        clientSatisfaction: 4.7
      });
    };

    loadProfile();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialLinkChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleSpecialtyToggle = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logo: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          coverImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Update profile via API
      await updateUser(formData);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleReset = () => {
    setIsEditing(false);
    // Reload original data
  };

  return (
    <div className="estate-profile">
      {/* Cover Image */}
      <div className="profile-cover">
        <div className="cover-image">
          {formData.coverImage ? (
            <img src={formData.coverImage} alt="Cover" />
          ) : (
            <div className="cover-placeholder">
              <Building size={48} />
              <span>Upload cover image</span>
            </div>
          )}
          
          {isEditing && (
            <label className="cover-upload-btn">
              <Camera size={16} />
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                style={{ display: 'none' }}
              />
            </label>
          )}
        </div>
      </div>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-info">
          <div className="avatar-section">
            <div className="avatar">
              {formData.logo ? (
                <img src={formData.logo} alt="Logo" />
              ) : (
                <Building size={40} />
              )}
              
              {isEditing && (
                <label className="avatar-upload-btn">
                  <Camera size={12} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
            
            <div className="profile-details">
              <div className="firm-header">
                <h1>{formData.firmName}</h1>
                {formData.certification.certified && (
                  <span className="verified-badge">
                    <Shield size={14} />
                    Verified Firm
                  </span>
                )}
              </div>
              
              <div className="contact-info">
                <span>
                  <Phone size={14} />
                  {formData.phone}
                </span>
                <span>
                  <Mail size={14} />
                  {formData.email}
                </span>
                {formData.website && (
                  <span>
                    <Globe size={14} />
                    <a href={formData.website} target="_blank" rel="noopener noreferrer">
                      {formData.website}
                    </a>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="profile-actions">
            {isEditing ? (
              <div className="edit-actions">
                <button className="btn btn-primary" onClick={handleSubmit}>
                  <Save size={16} />
                  Save Changes
                </button>
                <button className="btn btn-outline" onClick={handleReset}>
                  <XCircle size={16} />
                  Cancel
                </button>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                <Edit size={16} />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="stat-card">
            <Building size={20} />
            <div className="stat-details">
              <span className="stat-value">{stats.totalProperties}</span>
              <span className="stat-label">Properties</span>
            </div>
          </div>
          
          <div className="stat-card">
            <Users size={20} />
            <div className="stat-details">
              <span className="stat-value">{stats.activeClients}</span>
              <span className="stat-label">Active Clients</span>
            </div>
          </div>
          
          <div className="stat-card">
            <DollarSign size={20} />
            <div className="stat-details">
              <span className="stat-value">₦{(stats.monthlyRevenue / 1000000).toFixed(1)}M</span>
              <span className="stat-label">Monthly Revenue</span>
            </div>
          </div>
          
          <div className="stat-card">
            <Star size={20} />
            <div className="stat-details">
              <span className="stat-value">{stats.clientSatisfaction}/5</span>
              <span className="stat-label">Satisfaction</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {/* Left Column - About & Details */}
        <div className="left-column">
          {/* About Section */}
          <div className="profile-section">
            <h3>About Firm</h3>
            {isEditing ? (
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea"
                rows={6}
                placeholder="Tell us about your firm..."
              />
            ) : (
              <p className="about-text">{formData.description}</p>
            )}
          </div>

          {/* Contact Details */}
          <div className="profile-section">
            <h3>Contact Details</h3>
            <div className="contact-grid">
              <div className="contact-item">
                <label>Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                ) : (
                  <span className="contact-value">
                    <MapPin size={14} />
                    {formData.address}
                  </span>
                )}
              </div>
              
              <div className="contact-item">
                <label>Contact Person</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                ) : (
                  <span className="contact-value">{formData.contactPerson}</span>
                )}
              </div>
              
              <div className="contact-item">
                <label>Office Hours</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="officeHours"
                    value={formData.officeHours}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                ) : (
                  <span className="contact-value">
                    <Calendar size={14} />
                    {formData.officeHours}
                  </span>
                )}
              </div>
              
              <div className="contact-item">
                <label>Year Established</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="yearEstablished"
                    value={formData.yearEstablished}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                ) : (
                  <span className="contact-value">{formData.yearEstablished}</span>
                )}
              </div>
            </div>
          </div>

          {/* Firm Stats */}
          <div className="profile-section">
            <h3>Firm Statistics</h3>
            <div className="firm-stats">
              <div className="firm-stat">
                <Briefcase size={16} />
                <div>
                  <span className="stat-label">Total Agents</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="totalAgents"
                      value={formData.totalAgents}
                      onChange={handleInputChange}
                      className="form-input-sm"
                    />
                  ) : (
                    <span className="stat-value">{formData.totalAgents}</span>
                  )}
                </div>
              </div>
              
              <div className="firm-stat">
                <Home size={16} />
                <div>
                  <span className="stat-label">Properties Managed</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="propertiesManaged"
                      value={formData.propertiesManaged}
                      onChange={handleInputChange}
                      className="form-input-sm"
                    />
                  ) : (
                    <span className="stat-value">{formData.propertiesManaged}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Services & Social */}
        <div className="right-column">
          {/* Services */}
          <div className="profile-section">
            <h3>Services Offered</h3>
            <div className="services-grid">
              {[
                'Property Sales', 'Property Rentals', 'Property Management',
                'Real Estate Consulting', 'Valuation Services', 'Tenant Screening',
                'Property Marketing', 'Legal Services', 'Rent Collection'
              ].map(service => (
                <div
                  key={service}
                  className={`service-tag ${formData.services.includes(service) ? 'active' : ''}`}
                  onClick={() => isEditing && handleServiceToggle(service)}
                >
                  {service}
                  {formData.services.includes(service) && isEditing && (
                    <span className="remove-tag">×</span>
                  )}
                </div>
              ))}
            </div>
            {isEditing && <small className="hint">Click to toggle services</small>}
          </div>

          {/* Specialties */}
          <div className="profile-section">
            <h3>Specialties</h3>
            <div className="specialties-list">
              {['Commercial', 'Residential', 'Industrial', 'Luxury', 'Office Space', 'Retail', 'Land'].map(specialty => (
                <div
                  key={specialty}
                  className={`specialty-tag ${formData.specialties.includes(specialty) ? 'active' : ''}`}
                  onClick={() => isEditing && handleSpecialtyToggle(specialty)}
                >
                  {specialty}
                  {formData.specialties.includes(specialty) && isEditing && (
                    <span className="remove-tag">×</span>
                  )}
                </div>
              ))}
            </div>
            {isEditing && <small className="hint">Click to toggle specialties</small>}
          </div>

          {/* Social Links */}
          <div className="profile-section">
            <h3>Social Links</h3>
            <div className="social-links">
              {['facebook', 'twitter', 'linkedin', 'instagram'].map(platform => (
                <div key={platform} className="social-input">
                  <span className="social-icon">{platform.charAt(0).toUpperCase()}</span>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.socialLinks[platform]}
                      onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                      placeholder={`${platform}.com/your-profile`}
                      className="form-input"
                    />
                  ) : (
                    <span className="social-url">
                      {formData.socialLinks[platform] || 'Not provided'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Certification */}
          <div className="profile-section">
            <h3>Business Certification</h3>
            <div className="certification-info">
              <div className="cert-item">
                <FileText size={14} />
                <div>
                  <span className="cert-label">CAC Number</span>
                  <span className="cert-value">{formData.certification.cacNumber || 'Not provided'}</span>
                </div>
              </div>
              
              <div className="cert-item">
                <Award size={14} />
                <div>
                  <span className="cert-label">RC Number</span>
                  <span className="cert-value">{formData.certification.rcNumber || 'Not provided'}</span>
                </div>
              </div>
              
              <div className="cert-item">
                <Shield size={14} />
                <div>
                  <span className="cert-label">Verification Status</span>
                  <span className={`status-badge ${formData.certification.verificationStatus}`}>
                    {formData.certification.verificationStatus}
                  </span>
                </div>
              </div>
            </div>
            
            {!formData.certification.certified && (
              <div className="verification-cta">
                <p>Verify your business to unlock all features</p>
                <button className="btn btn-primary btn-sm">
                  <Shield size={14} />
                  Start Verification
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstateProfile;