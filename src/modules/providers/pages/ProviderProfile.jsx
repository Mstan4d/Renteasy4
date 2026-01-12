import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaEdit, FaEye, FaStar, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaCalendarAlt, FaCheckCircle,FaEnvelopeOpenText, FaUsers, FaShieldAlt, FaImages,
  FaShareAlt, FaBookmark, FaThumbsUp, FaCertificate,
  FaAward, FaHeart, FaArrowLeft, FaPrint, FaDownload, FaExclamationTriangle,
  FaQuestionCircle, FaGlobe, FaBuilding, FaUser, FaCamera, FaTrash,
  FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaSave, FaClock,
  FaHome, FaFileInvoice, FaSync, FaFilter, FaHistory, FaCreditCard,
  FaReceipt, FaBell, FaMoneyBillWave, FaPercentage, FaFileAlt,
  FaChartLine, FaCommentDots, FaRegStar, FaStarHalfAlt, FaPlus,
  FaTimes, FaUpload, FaCog, FaLock, FaBell as FaBellIcon
} from 'react-icons/fa';
import './ProviderProfile.css';


const renderStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<FaStar key={i} style={{ color: '#FFD700', fontSize: '1.2rem' }} />);
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(<FaStarHalfAlt key={i} style={{ color: '#FFD700', fontSize: '1.2rem' }} />);
    } else {
      stars.push(<FaRegStar key={i} style={{ color: '#ddd', fontSize: '1.2rem' }} />);
    }
  }
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      {stars}
      <span style={{ marginLeft: '0.5rem', fontWeight: '600', fontSize: '1.1rem' }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
};


const ProviderProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('edit');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    tagline: '',
    description: '',
    categories: [],
    contact: {
      phone: '',
      email: '',
      website: '',
      serviceArea: ''
    },
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    },
    operatingHours: {
      mondayToFriday: '',
      saturday: '',
      sunday: ''
    },
    services: [],
    portfolioImages: [],
    certifications: []
  });

  const [previewMode, setPreviewMode] = useState('desktop');
  const [reviews, setReviews] = useState([]);
  const [ratings, setRatings] = useState(null);
  const [billing, setBilling] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    setTimeout(() => {
      // Load profile data
      const mockProfile = {
        id: 'provider-001',
        businessName: 'Professional Cleaners NG',
        tagline: 'Professional cleaning services for homes & offices',
        description: 'We provide top-notch cleaning services with eco-friendly products. Serving Lagos for over 5 years with certified professionals and modern equipment.',
        categories: ['Cleaning', 'Home Services'],
        contact: {
          phone: '+2348012345678',
          email: 'info@cleanersng.com',
          website: 'www.cleanersng.com',
          serviceArea: 'Lagos, Nigeria'
        },
        socialMedia: {
          facebook: 'facebook.com/cleanersng',
          twitter: '@cleanersng',
          instagram: '@cleanersng',
          linkedin: 'linkedin.com/company/cleanersng'
        },
        operatingHours: {
          mondayToFriday: '8:00 AM - 6:00 PM',
          saturday: '9:00 AM - 4:00 PM',
          sunday: 'Emergency Services Only'
        },
        services: [
          { id: 1, name: 'Deep House Cleaning', price: '₦25,000 - ₦45,000', description: 'Complete home cleaning' },
          { id: 2, name: 'Office Cleaning', price: '₦35,000 - ₦75,000', description: 'Professional office cleaning' }
        ],
        portfolioImages: [],
        certifications: ['Professional Cleaning Certification', 'Eco-Friendly Certified'],
        verification: {
          status: 'verified',
          verifiedSince: '2022-04-20',
          badge: 'Verified Service Provider'
        },
        boost: {
          status: 'active',
          level: 'premium',
          expires: '2024-02-15',
          badge: '🔥 Featured'
        },
        rating: 4.8,
        totalReviews: 128,
        responseRate: '94%',
        avgResponseTime: '2.3 hours',
        memberSince: '2022-03-15',
        completedJobs: 245,
        profileCompleteness: 85
      };

      // Load reviews
      const mockReviews = [
        { id: 1, client: 'Adebayo Johnson', rating: 5, date: '2024-01-15', comment: 'Excellent service!' },
        { id: 2, client: 'Sarah Williams', rating: 4, date: '2024-01-14', comment: 'Good work overall.' }
      ];

      // Load ratings stats
      const mockRatings = {
        averageRating: 4.8,
        totalReviews: 128,
        distribution: { 5: 78, 4: 32, 3: 12, 2: 4, 1: 2 },
        byService: { 'Cleaning': 4.9, 'Painting': 4.6 }
      };

      // Load billing info
      const mockBilling = {
        subscriptionStatus: 'active',
        freeBookingsUsed: 7,
        freeBookingsLimit: 10,
        nextBillingDate: '2024-02-28',
        monthlyFee: 3000
      };

      setProfile(mockProfile);
      setFormData(mockProfile);
      setReviews(mockReviews);
      setRatings(mockRatings);
      setBilling(mockBilling);
      setLoading(false);
    }, 1000);
  };

  const handleInputChange = (e, section = null) => {
    const { name, value } = e.target;
    
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveProfile = () => {
    // API call to save profile
    setProfile(formData);
    setEditing(false);
    alert('Profile saved successfully!');
  };

  
  const renderTabContent = () => {
    switch(activeTab) {
      case 'edit':
        return <EditProfileTab 
          formData={formData} 
          editing={editing} 
          setEditing={setEditing}
          handleInputChange={handleInputChange}
          handleSaveProfile={handleSaveProfile}
          profile={profile}
        />;
      case 'view':
        return <ViewProfileTab profile={profile} />;
      case 'preview':
        return <PreviewTab profile={profile} previewMode={previewMode} setPreviewMode={setPreviewMode} />;
      case 'reviews':
        return <ReviewsTab reviews={reviews} ratings={ratings} />;
      case 'marketplace':
        return <MarketplaceTab profile={profile} />;
      case 'billing':
        return <BillingTab billing={billing} />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <EditProfileTab 
          formData={formData} 
          editing={editing} 
          setEditing={setEditing}
          handleInputChange={handleInputChange}
          handleSaveProfile={handleSaveProfile}
          profile={profile}
        />;
    }
  };

  if (loading) {
    return (
      <div className="provider-profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="provider-profile-container">
      {/* Header */}
      <div className="profile-header">
        <div className="header-left">
          <h1>Business Profile</h1>
          <p>Manage your business information and marketplace presence</p>
        </div>
        <div className="header-right">
          <button className="btn btn-secondary">
            <FaEye /> Preview Public Profile
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard/provider')}>
            <FaArrowLeft /> Back to Dashboard
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="profile-tabs">
        {[
          { id: 'edit', label: 'Edit Profile', icon: <FaEdit /> },
          { id: 'view', label: 'View Profile', icon: <FaEye /> },
          { id: 'preview', label: 'Preview', icon: <FaGlobe /> },
          { id: 'reviews', label: 'Reviews & Ratings', icon: <FaStar /> },
          { id: 'marketplace', label: 'Marketplace', icon: <FaBuilding /> },
          { id: 'billing', label: 'Billing', icon: <FaCreditCard /> },
          { id: 'settings', label: 'Settings', icon: <FaCog /> }
        ].map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content-container">
        {renderTabContent()}
      </div>
    </div>
  );
};

// Tab Components
const EditProfileTab = ({ formData, editing, setEditing, handleInputChange, handleSaveProfile, profile }) => {
  return (
    <div className="edit-profile-tab">
      <div className="tab-header">
        <h2>Edit Business Profile</h2>
        <div className="header-actions">
          {editing ? (
            <>
              <button className="btn btn-secondary" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveProfile}>
                <FaSave /> Save Changes
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => setEditing(true)}>
              <FaEdit /> Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="edit-form-grid">
        {/* Business Information */}
        <div className="form-section">
          <h3 className="section-title">
            <FaBuilding /> Business Information
          </h3>
          <div className="form-group">
            <label>Business Name</label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              disabled={!editing}
            />
          </div>
          <div className="form-group">
            <label>Tagline</label>
            <input
              type="text"
              name="tagline"
              value={formData.tagline}
              onChange={handleInputChange}
              disabled={!editing}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={!editing}
              rows={4}
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="form-section">
          <h3 className="section-title">
            <FaPhone /> Contact Information
          </h3>
          {Object.entries(formData.contact).map(([key, value]) => (
            <div className="form-group" key={key}>
              <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
              <input
                type="text"
                name={key}
                value={value}
                onChange={(e) => handleInputChange(e, 'contact')}
                disabled={!editing}
              />
            </div>
          ))}
        </div>

        {/* Social Media */}
        <div className="form-section">
          <h3 className="section-title">
            <FaGlobe /> Social Media
          </h3>
          {Object.entries(formData.socialMedia).map(([key, value]) => (
            <div className="form-group" key={key}>
              <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
              <input
                type="text"
                name={key}
                value={value}
                onChange={(e) => handleInputChange(e, 'socialMedia')}
                disabled={!editing}
              />
            </div>
          ))}
        </div>

        {/* Services */}
        <div className="form-section">
          <h3 className="section-title">
            <FaHome /> Services
          </h3>
          <div className="services-list">
            {formData.services.map((service, index) => (
              <div key={service.id} className="service-item">
                <div>
                  <strong>{service.name}</strong>
                  <p>{service.price}</p>
                </div>
                {editing && (
                  <button className="btn btn-danger">
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
            {editing && (
              <button className="btn btn-secondary">
                <FaPlus /> Add Service
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Stats */}
      <div className="profile-stats">
        <h3>Profile Status</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{profile?.profileCompleteness}%</div>
            <div className="stat-label">Profile Complete</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{profile?.rating?.toFixed(1)}</div>
            <div className="stat-label">Average Rating</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{profile?.totalReviews}</div>
            <div className="stat-label">Total Reviews</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{profile?.completedJobs}</div>
            <div className="stat-label">Jobs Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ViewProfileTab = ({ profile }) => {
  return (
    <div className="view-profile-tab">
      <div className="public-profile-header">
        <div className="profile-avatar">
          {profile?.businessName?.charAt(0)}
        </div>
        <div className="profile-info">
          <h2>{profile?.businessName}</h2>
          <p className="tagline">{profile?.tagline}</p>
          <div className="profile-badges">
            {profile?.verification?.status === 'verified' && (
              <span className="badge verified">
                <FaCheckCircle /> {profile.verification.badge}
              </span>
            )}
            {profile?.boost?.status === 'active' && (
              <span className="badge boosted">
                <FaAward /> {profile.boost.badge}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="profile-details-grid">
        <div className="detail-section">
          <h3><FaInfoCircle /> About</h3>
          <p>{profile?.description}</p>
        </div>

        <div className="detail-section">
          <h3><FaPhone /> Contact</h3>
          <div className="contact-list">
            <div className="contact-item">
              <FaPhone /> {profile?.contact?.phone}
            </div>
            <div className="contact-item">
              <FaEnvelope /> {profile?.contact?.email}
            </div>
            <div className="contact-item">
              <FaMapMarkerAlt /> {profile?.contact?.serviceArea}
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3><FaClock /> Operating Hours</h3>
          <div className="hours-list">
            <div className="hours-item">
              <span>Mon-Fri:</span>
              <span>{profile?.operatingHours?.mondayToFriday}</span>
            </div>
            <div className="hours-item">
              <span>Saturday:</span>
              <span>{profile?.operatingHours?.saturday}</span>
            </div>
            <div className="hours-item">
              <span>Sunday:</span>
              <span>{profile?.operatingHours?.sunday}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3><FaStar /> Ratings</h3>
          <div className="rating-display">
            {renderStars(profile?.rating)}
            <p>{profile?.totalReviews} reviews</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PreviewTab = ({ profile, previewMode, setPreviewMode }) => {
  return (
    <div className="preview-tab">
      <div className="preview-controls">
        <h2>Profile Preview</h2>
        <div className="device-toggle">
          <button 
            className={`device-btn ${previewMode === 'desktop' ? 'active' : ''}`}
            onClick={() => setPreviewMode('desktop')}
          >
            Desktop
          </button>
          <button 
            className={`device-btn ${previewMode === 'tablet' ? 'active' : ''}`}
            onClick={() => setPreviewMode('tablet')}
          >
            Tablet
          </button>
          <button 
            className={`device-btn ${previewMode === 'mobile' ? 'active' : ''}`}
            onClick={() => setPreviewMode('mobile')}
          >
            Mobile
          </button>
        </div>
      </div>

      <div className={`preview-container ${previewMode}`}>
        <div className="preview-device">
          <div className="preview-content">
            {/* Simplified preview of public profile */}
            <div className="preview-profile-header">
              <div className="preview-avatar">
                {profile?.businessName?.charAt(0)}
              </div>
              <div className="preview-info">
                <h3>{profile?.businessName}</h3>
                <p>{profile?.tagline}</p>
                <div className="preview-badges">
                  <span className="badge">⭐ {profile?.rating?.toFixed(1)}</span>
                  <span className="badge">📞 {profile?.contact?.phone}</span>
                </div>
              </div>
            </div>
            
            <div className="preview-section">
              <h4>About</h4>
              <p>{profile?.description?.substring(0, 200)}...</p>
            </div>
            
            <div className="preview-section">
              <h4>Services</h4>
              {profile?.services?.slice(0, 3).map(service => (
                <div key={service.id} className="preview-service">
                  <span>{service.name}</span>
                  <span>{service.price}</span>
                </div>
              ))}
            </div>
            
            <div className="preview-actions">
              <button className="btn btn-primary">Contact Now</button>
              <button className="btn btn-secondary">View Profile</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewsTab = ({ reviews, ratings }) => {
  return (
    <div className="reviews-tab">
      <div className="reviews-header">
        <h2>Reviews & Ratings</h2>
        <div className="ratings-summary">
          <div className="overall-rating">
            <div className="rating-value">{ratings?.averageRating?.toFixed(1)}</div>
            <div className="rating-stars">{renderStars(ratings?.averageRating)}</div>
            <div className="rating-count">{ratings?.totalReviews} reviews</div>
          </div>
        </div>
      </div>

      <div className="reviews-grid">
        <div className="reviews-list">
          <h3>Recent Reviews</h3>
          {reviews?.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <strong>{review.client}</strong>
                  <div className="review-rating">
                    {renderStars(review.rating)}
                    <span>{new Date(review.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <p className="review-comment">{review.comment}</p>
              <div className="review-actions">
                <button className="btn btn-sm">
                  <FaThumbsUp /> Helpful
                </button>
                <button className="btn btn-sm">
                  <FaCommentDots /> Reply
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="ratings-breakdown">
          <h3>Ratings Breakdown</h3>
          {ratings?.distribution && Object.entries(ratings.distribution)
            .sort((a, b) => b[0] - a[0])
            .map(([stars, count]) => (
              <div key={stars} className="rating-bar">
                <div className="stars-label">{stars} stars</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill"
                    style={{ 
                      width: `${(count / ratings.totalReviews) * 100}%` 
                    }}
                  />
                </div>
                <div className="count-label">{count}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

const MarketplaceTab = ({ profile }) => {
  return (
    <div className="marketplace-tab">
      <h2>Marketplace Profile Settings</h2>
      
      <div className="marketplace-status">
        <div className="status-card">
          <h3>Visibility Status</h3>
          <div className="status-items">
            <div className="status-item">
              <FaEye /> 
              <span>Appears in Marketplace: <strong>Yes</strong></span>
            </div>
            <div className="status-item">
              <FaCheckCircle /> 
              <span>Verification: <strong>{profile?.verification?.status || 'Pending'}</strong></span>
            </div>
            <div className="status-item">
              <FaAward /> 
              <span>Boost Status: <strong>{profile?.boost?.status || 'Inactive'}</strong></span>
            </div>
          </div>
        </div>

        <div className="status-card">
          <h3>Profile Performance</h3>
          <div className="performance-stats">
            <div className="stat">
              <div className="stat-value">{profile?.profileCompleteness}%</div>
              <div className="stat-label">Profile Completeness</div>
            </div>
            <div className="stat">
              <div className="stat-value">{profile?.responseRate}</div>
              <div className="stat-label">Response Rate</div>
            </div>
            <div className="stat">
              <div className="stat-value">{profile?.avgResponseTime}</div>
              <div className="stat-label">Avg Response Time</div>
            </div>
          </div>
        </div>
      </div>

      <div className="marketplace-actions">
        <button className="btn btn-primary">
          <FaGlobe /> View Public Profile
        </button>
        <button className="btn btn-secondary">
          <FaAward /> Manage Boost
        </button>
        <button className="btn btn-secondary">
          <FaShareAlt /> Share Profile
        </button>
      </div>
    </div>
  );
};

const BillingTab = ({ billing }) => {
  return (
    <div className="billing-tab">
      <h2>Billing & Subscription</h2>
      
      <div className="subscription-status">
        <h3>Current Subscription</h3>
        <div className="subscription-card">
          <div className="subscription-info">
            <div className="plan-name">Free Tier</div>
            <div className="plan-details">
              <p>{billing?.freeBookingsUsed || 0}/{billing?.freeBookingsLimit || 10} free bookings used</p>
              <p>Monthly fee: ₦{billing?.monthlyFee?.toLocaleString() || '3,000'} after 10 bookings</p>
            </div>
          </div>
          <button className="btn btn-primary">
            Upgrade Plan
          </button>
        </div>
      </div>

      <div className="billing-details">
        <div className="invoice-history">
          <h3>Recent Invoices</h3>
          <div className="invoices-list">
            <div className="invoice-item">
              <div className="invoice-date">Jan 2024</div>
              <div className="invoice-amount">₦3,000</div>
              <div className="invoice-status paid">Paid</div>
              <button className="btn btn-sm">
                <FaDownload /> Download
              </button>
            </div>
          </div>
        </div>

        <div className="payment-methods">
          <h3>Payment Methods</h3>
          <div className="methods-list">
            <div className="method-item">
              <FaCreditCard /> 
              <span>Visa •••• 4242</span>
              <button className="btn btn-sm">Remove</button>
            </div>
            <button className="btn btn-secondary">
              <FaPlus /> Add Payment Method
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsTab = () => {
  return (
    <div className="settings-tab">
      <h2>Account Settings</h2>
      
      <div className="settings-sections">
        <div className="settings-section">
          <h3><FaUser /> Personal Information</h3>
          <div className="settings-form">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" defaultValue="John Doe" />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" defaultValue="john@example.com" />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3><FaLock /> Security</h3>
          <div className="security-settings">
            <button className="btn btn-secondary">
              Change Password
            </button>
            <button className="btn btn-secondary">
              Two-Factor Authentication
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h3><FaBellIcon /> Notifications</h3>
          <div className="notification-settings">
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked />
              <span>Booking notifications</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked />
              <span>Review notifications</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Marketing emails</span>
            </label>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn btn-primary">
          <FaSave /> Save Settings
        </button>
        <button className="btn btn-danger">
          Delete Account
        </button>
      </div>
    </div>
  );
};

// Add missing icon component
const FaInfoCircle = () => <FaQuestionCircle />;

export default ProviderProfile;