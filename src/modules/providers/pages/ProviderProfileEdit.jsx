// src/modules/providers/pages/ProviderProfileEdit.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import {
  Save, Upload, Building, User, Phone, Mail,
  Globe, MapPin, Edit, Camera, Trash2,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import './ProviderProfileEdit.css';

const ProviderProfileEdit = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'individual',
    ownerName: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    yearsInBusiness: 1,
    employeeCount: '1-5',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    businessHours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '10:00', close: '14:00', closed: false },
      sunday: { open: '', close: '', closed: true }
    },
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    },
    logo: null,
    coverImage: null,
    portfolioImages: [],
    certifications: [],
    documents: {
      businessRegistration: null,
      taxCertificate: null,
      insurance: null
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewLogo, setPreviewLogo] = useState(null);
  const [previewCover, setPreviewCover] = useState(null);
  const [portfolioPreviews, setPortfolioPreviews] = useState([]);
  
  // Profile completion percentage
  const [completion, setCompletion] = useState(0);
  
  useEffect(() => {
    loadProfile();
  }, []);
  
  useEffect(() => {
    calculateCompletion();
  }, [formData]);
  
  const loadProfile = () => {
    try {
      const providers = JSON.parse(localStorage.getItem('serviceProviders') || '[]');
      const userProfile = providers.find(p => p.userId === user?.id || p.email === user?.email);
      
      if (userProfile) {
        setProfile(userProfile);
        setFormData({
          businessName: userProfile.businessName || '',
          businessType: userProfile.businessType || 'individual',
          ownerName: userProfile.ownerName || '',
          phone: userProfile.phone || '',
          email: userProfile.email || user?.email || '',
          website: userProfile.website || '',
          description: userProfile.description || '',
          yearsInBusiness: userProfile.yearsInBusiness || 1,
          employeeCount: userProfile.employeeCount || '1-5',
          address: userProfile.address || '',
          city: userProfile.city || '',
          state: userProfile.state || '',
          country: userProfile.country || 'Nigeria',
          businessHours: userProfile.businessHours || formData.businessHours,
          socialMedia: userProfile.socialMedia || formData.socialMedia,
          logo: userProfile.logo || null,
          coverImage: userProfile.coverImage || null,
          portfolioImages: userProfile.portfolioImages || [],
          certifications: userProfile.certifications || [],
          documents: userProfile.documents || formData.documents
        });
        
        if (userProfile.logo) setPreviewLogo(userProfile.logo);
        if (userProfile.coverImage) setPreviewCover(userProfile.coverImage);
        if (userProfile.portfolioImages) setPortfolioPreviews(userProfile.portfolioImages);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const calculateCompletion = () => {
    const requiredFields = [
      'businessName',
      'ownerName',
      'phone',
      'email',
      'description',
      'address',
      'city',
      'state'
    ];
    
    const completedFields = requiredFields.filter(field => 
      formData[field] && formData[field].toString().trim().length > 0
    ).length;
    
    // Add bonus for logo and cover image
    const bonusFields = [
      previewLogo ? 1 : 0,
      previewCover ? 1 : 0,
      portfolioPreviews.length > 0 ? 1 : 0
    ].filter(Boolean).length * 0.5;
    
    const percentage = Math.min(
      100,
      Math.round(((completedFields / requiredFields.length) * 100) + bonusFields)
    );
    
    setCompletion(percentage);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNestedChange = (parent, child, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: value
      }
    }));
  };
  
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewLogo(reader.result);
        setFormData(prev => ({ ...prev, logo: file }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewCover(reader.result);
        setFormData(prev => ({ ...prev, coverImage: file }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handlePortfolioUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPortfolioPreviews(prev => [...prev, reader.result]);
        setFormData(prev => ({
          ...prev,
          portfolioImages: [...prev.portfolioImages, file]
        }));
      };
      reader.readAsDataURL(file);
    });
  };
  
  const removePortfolioImage = (index) => {
    setPortfolioPreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      portfolioImages: prev.portfolioImages.filter((_, i) => i !== index)
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const providers = JSON.parse(localStorage.getItem('serviceProviders') || '[]');
      const providerIndex = providers.findIndex(p => p.userId === user?.id || p.email === user?.email);
      
      if (providerIndex !== -1) {
        // Update provider data
        providers[providerIndex] = {
          ...providers[providerIndex],
          ...formData,
          updatedAt: new Date().toISOString(),
          profileCompletion: completion
        };
        
        localStorage.setItem('serviceProviders', JSON.stringify(providers));
        
        alert('Profile updated successfully!');
        navigate('/providers/dashboard');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }
  
  return (
    <div className="provider-profile-edit">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="header-content">
            <h1>
              <Edit size={24} />
              Edit Business Profile
            </h1>
            <p className="subtitle">
              Update your business information to attract more clients
            </p>
          </div>
          
          <div className="header-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/providers/dashboard')}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={saving}
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="completion-card">
          <div className="completion-header">
            <h3>Profile Completion</h3>
            <span className="completion-percent">{completion}%</span>
          </div>
          <div className="completion-bar">
            <div 
              className="completion-fill"
              style={{ width: `${completion}%` }}
            />
          </div>
          <p className="completion-tip">
            {completion < 50 ? 'Complete more fields to improve your visibility' :
             completion < 80 ? 'Good progress! Add more details to stand out' :
             completion < 100 ? 'Almost complete! Just a few more details' :
             'Perfect! Your profile is fully optimized'}
          </p>
        </div>
        
        {/* Main Form */}
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-sections">
            {/* Section 1: Business Info */}
            <div className="form-section">
              <h3 className="section-title">
                <Building size={18} />
                Business Information
              </h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    Business Name *
                    {formData.businessName && (
                      <CheckCircle size={12} color="#10b981" />
                    )}
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="Your business name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Business Type *</label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="individual">Individual/Freelancer</option>
                    <option value="company">Registered Company</option>
                    <option value="partnership">Partnership</option>
                    <option value="estate-firm">Estate Firm</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>
                    Owner/Contact Person *
                    {formData.ownerName && (
                      <CheckCircle size={12} color="#10b981" />
                    )}
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    placeholder="Full name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>
                    Phone Number *
                    {formData.phone && (
                      <CheckCircle size={12} color="#10b981" />
                    )}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+234 XXX XXX XXXX"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>
                    Email Address *
                    {formData.email && (
                      <CheckCircle size={12} color="#10b981" />
                    )}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="business@email.com"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>
                  Business Description *
                  {formData.description && (
                    <CheckCircle size={12} color="#10b981" />
                  )}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your business, services, expertise..."
                  rows={4}
                  required
                />
                <small>This appears on your public profile. Be descriptive!</small>
              </div>
            </div>
            
            {/* Section 2: Location & Contact */}
            <div className="form-section">
              <h3 className="section-title">
                <MapPin size={18} />
                Location & Contact
              </h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    Address *
                    {formData.address && (
                      <CheckCircle size={12} color="#10b981" />
                    )}
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Street address"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>
                    City *
                    {formData.city && (
                      <CheckCircle size={12} color="#10b981" />
                    )}
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>
                    State *
                    {formData.state && (
                      <CheckCircle size={12} color="#10b981" />
                    )}
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Business Hours</label>
                <div className="business-hours-grid">
                  {Object.entries(formData.businessHours).map(([day, hours]) => (
                    <div key={day} className="day-schedule">
                      <div className="day-header">
                        <span className="day-name">
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </span>
                        <label className="closed-checkbox">
                          <input
                            type="checkbox"
                            checked={hours.closed}
                            onChange={(e) => handleNestedChange(
                              'businessHours',
                              day,
                              { ...hours, closed: e.target.checked }
                            )}
                          />
                          <span>Closed</span>
                        </label>
                      </div>
                      
                      {!hours.closed && (
                        <div className="time-inputs">
                          <input
                            type="time"
                            value={hours.open}
                            onChange={(e) => handleNestedChange(
                              'businessHours',
                              day,
                              { ...hours, open: e.target.value }
                            )}
                          />
                          <span>to</span>
                          <input
                            type="time"
                            value={hours.close}
                            onChange={(e) => handleNestedChange(
                              'businessHours',
                              day,
                              { ...hours, close: e.target.value }
                            )}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Section 3: Media & Branding */}
            <div className="form-section">
              <h3 className="section-title">
                <Camera size={18} />
                Media & Branding
              </h3>
              
              <div className="media-uploads">
                {/* Logo Upload */}
                <div className="upload-group">
                  <label>Business Logo</label>
                  <div className="logo-upload">
                    {previewLogo ? (
                      <div className="logo-preview">
                        <img src={previewLogo} alt="Business logo" />
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => {
                            setPreviewLogo(null);
                            setFormData(prev => ({ ...prev, logo: null }));
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="upload-placeholder">
                        <Upload size={24} />
                        <span>Upload Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          hidden
                        />
                      </label>
                    )}
                  </div>
                  <small>Recommended: 400x400px, PNG or JPG</small>
                </div>
                
                {/* Cover Image Upload */}
                <div className="upload-group">
                  <label>Cover Image</label>
                  <div className="cover-upload">
                    {previewCover ? (
                      <div className="cover-preview">
                        <img src={previewCover} alt="Cover" />
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => {
                            setPreviewCover(null);
                            setFormData(prev => ({ ...prev, coverImage: null }));
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="upload-placeholder">
                        <Upload size={24} />
                        <span>Upload Cover Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverUpload}
                          hidden
                        />
                      </label>
                    )}
                  </div>
                  <small>Recommended: 1200x300px, PNG or JPG</small>
                </div>
              </div>
              
              {/* Portfolio Images */}
              <div className="form-group">
                <label>Portfolio Images</label>
                <div className="portfolio-grid">
                  {portfolioPreviews.map((preview, index) => (
                    <div key={index} className="portfolio-item">
                      <img src={preview} alt={`Portfolio ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removePortfolioImage(index)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  
                  {portfolioPreviews.length < 10 && (
                    <label className="portfolio-upload-btn">
                      <Upload size={20} />
                      <span>Add Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePortfolioUpload}
                        hidden
                      />
                    </label>
                  )}
                </div>
                <small>Upload photos of your work (max 10 images)</small>
              </div>
            </div>
            
            {/* Section 4: Social Media */}
            <div className="form-section">
              <h3 className="section-title">
                <Globe size={18} />
                Social Media
              </h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Facebook</label>
                  <div className="social-input">
                    <span className="social-icon">fb</span>
                    <input
                      type="text"
                      placeholder="username"
                      value={formData.socialMedia.facebook}
                      onChange={(e) => handleNestedChange('socialMedia', 'facebook', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Twitter</label>
                  <div className="social-input">
                    <span className="social-icon">tw</span>
                    <input
                      type="text"
                      placeholder="username"
                      value={formData.socialMedia.twitter}
                      onChange={(e) => handleNestedChange('socialMedia', 'twitter', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Instagram</label>
                  <div className="social-input">
                    <span className="social-icon">ig</span>
                    <input
                      type="text"
                      placeholder="username"
                      value={formData.socialMedia.instagram}
                      onChange={(e) => handleNestedChange('socialMedia', 'instagram', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>LinkedIn</label>
                  <div className="social-input">
                    <span className="social-icon">in</span>
                    <input
                      type="text"
                      placeholder="company/username"
                      value={formData.socialMedia.linkedin}
                      onChange={(e) => handleNestedChange('socialMedia', 'linkedin', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Section 5: Business Details */}
            <div className="form-section">
              <h3 className="section-title">
                <Building size={18} />
                Business Details
              </h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Years in Business</label>
                  <select
                    name="yearsInBusiness"
                    value={formData.yearsInBusiness}
                    onChange={handleInputChange}
                  >
                    {[1,2,3,4,5,6,7,8,9,10,'10+'].map(year => (
                      <option key={year} value={year}>
                        {year} {year === 1 ? 'year' : 'years'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Team Size</label>
                  <select
                    name="employeeCount"
                    value={formData.employeeCount}
                    onChange={handleInputChange}
                  >
                    <option value="1-5">1-5 employees</option>
                    <option value="6-10">6-10 employees</option>
                    <option value="11-20">11-20 employees</option>
                    <option value="21-50">21-50 employees</option>
                    <option value="50+">50+ employees</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Certifications</label>
                <div className="certifications-input">
                  <input
                    type="text"
                    placeholder="Add a certification (e.g., Certified Electrician)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        e.preventDefault();
                        setFormData(prev => ({
                          ...prev,
                          certifications: [...prev.certifications, e.target.value.trim()]
                        }));
                        e.target.value = '';
                      }
                    }}
                  />
                  <small>Press Enter to add multiple certifications</small>
                </div>
                
                {formData.certifications.length > 0 && (
                  <div className="certifications-list">
                    {formData.certifications.map((cert, index) => (
                      <div key={index} className="certification-item">
                        <CheckCircle size={14} color="#10b981" />
                        <span>{cert}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              certifications: prev.certifications.filter((_, i) => i !== index)
                            }));
                          }}
                        >
                          <XCircle size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/providers/dashboard')}
            >
              Discard Changes
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
        
        {/* Tips Sidebar */}
        <div className="tips-sidebar">
          <div className="tip-card">
            <h4>
              <AlertCircle size={18} />
              Profile Tips
            </h4>
            <ul>
              <li>
                <strong>Complete Profile:</strong> Profiles with 80%+ completion get 3x more views
              </li>
              <li>
                <strong>Professional Photos:</strong> High-quality images increase trust by 60%
              </li>
              <li>
                <strong>Detailed Description:</strong> Explain your expertise and process
              </li>
              <li>
                <strong>Business Hours:</strong> Helps clients know when to contact you
              </li>
              <li>
                <strong>Social Proof:</strong> Add certifications and portfolio images
              </li>
            </ul>
          </div>
          
          <div className="verification-card">
            <h4>Verification Status</h4>
            <div className="verification-status">
              <div className="status-item">
                <span className="status-label">Business Registration</span>
                <span className={`status-indicator ${formData.documents.businessRegistration ? 'verified' : 'pending'}`}>
                  {formData.documents.businessRegistration ? '✓' : '●'}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Tax Certificate</span>
                <span className={`status-indicator ${formData.documents.taxCertificate ? 'verified' : 'pending'}`}>
                  {formData.documents.taxCertificate ? '✓' : '●'}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Insurance</span>
                <span className={`status-indicator ${formData.documents.insurance ? 'verified' : 'pending'}`}>
                  {formData.documents.insurance ? '✓' : '●'}
                </span>
              </div>
            </div>
            <p className="verification-note">
              Verified profiles get priority placement in search results
            </p>
            <button className="btn btn-secondary btn-small">
              Upload Documents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfileEdit;