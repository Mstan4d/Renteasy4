import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import {
  FaEdit, FaEye, FaStar, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaCalendarAlt, FaCheckCircle, FaUsers, FaShieldAlt, FaImages,
  FaShareAlt, FaBookmark, FaThumbsUp, FaCertificate,
  FaAward, FaHeart, FaArrowLeft, FaPrint, FaDownload, FaExclamationTriangle,
  FaQuestionCircle, FaGlobe, FaBuilding, FaUser, FaCamera, FaTrash,
  FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaSave, FaClock,
  FaHome, FaFileInvoice, FaSync, FaFilter, FaHistory, FaCreditCard,
  FaReceipt, FaBell, FaMoneyBillWave, FaPercentage, FaFileAlt,
  FaChartLine, FaCommentDots, FaRegStar, FaStarHalfAlt, FaPlus,
  FaTimes, FaUpload, FaCog, FaLock, FaBell as FaBellIcon, FaSpinner
} from 'react-icons/fa';
import './ProviderProfile.css';

const ProviderProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('edit');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratings, setRatings] = useState({ average: 0, total: 0, distribution: {} });
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetchAllData();
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch provider profile from service_providers
      const { data: providerData, error: providerError } = await supabase
        .from('service_providers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (providerError && providerError.code !== 'PGRST116') throw providerError;

      // If no record exists, create a default one
      let provider = providerData;
      if (!provider) {
        const { data: newProvider, error: insertError } = await supabase
          .from('service_providers')
          .insert({
            user_id: user.id,
            business_name: user.email?.split('@')[0] || 'My Business',
            contact_json: { phone: user.phone || '', email: user.email, serviceArea: '' },
            social_media_json: {},
            operating_hours_json: { mondayToFriday: '9:00 AM - 5:00 PM', saturday: 'Closed', sunday: 'Closed' },
            services_json: [],
            portfolio_images: [],
            certifications_json: []
          })
          .select()
          .single();
        if (insertError) throw insertError;
        provider = newProvider;
      }

      setProfile(provider);

      // 2. Fetch reviews
      // Inside fetchAllData, replace the reviews query with:
const { data: reviewsData, error: reviewsError } = await supabase
  .from('provider_reviews')
  .select('*')
  .eq('provider_id', provider.id)
  .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      setReviews(reviewsData || []);

      // 3. Calculate ratings
      if (reviewsData && reviewsData.length > 0) {
        const total = reviewsData.length;
        const sum = reviewsData.reduce((acc, r) => acc + r.rating, 0);
        const average = sum / total;
        const distribution = { 5:0,4:0,3:0,2:0,1:0 };
        reviewsData.forEach(r => distribution[r.rating]++);
        setRatings({ average, total, distribution });
      }

      // 4. Fetch subscription info (from profiles or subscriptions table)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('free_booking_used, free_booking_limit, subscription_status')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setSubscription(profileData);

    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (updatedData) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('service_providers')
        .update(updatedData)
        .eq('id', profile.id);
      if (error) throw error;
      setProfile({ ...profile, ...updatedData });
      alert('Profile saved successfully!');
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImage = async (file, type) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('provider-portfolio')
        .upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('provider-portfolio')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (err) {
      console.error('Upload error:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="provider-profile-loading">
        <FaSpinner className="spinner" />
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="provider-profile-error">
        <FaExclamationTriangle size={48} />
        <h3>Failed to load profile</h3>
        <p>{error}</p>
        <button onClick={fetchAllData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="provider-profile">
      {/* Header */}
      <div className="profile-header">
        <div className="header-left">
          <h1>Business Profile</h1>
          <p>Manage your business information and marketplace presence</p>
        </div>
        <div className="header-right">
          <button className="btn btn-secondary" onClick={() => window.open(`/provider/${profile.id}`, '_blank')}>
            <FaEye /> Preview Public
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard/provider')}>
            <FaArrowLeft /> Back to Dashboard
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        {[
          { id: 'edit', label: 'Edit Profile', icon: <FaEdit /> },
          { id: 'view', label: 'View Profile', icon: <FaEye /> },
          { id: 'preview', label: 'Preview', icon: <FaGlobe /> },
          { id: 'reviews', label: 'Reviews', icon: <FaStar /> },
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
      <div className="tab-content">
        {activeTab === 'edit' && (
          <EditTab
            profile={profile}
            onSave={handleSaveProfile}
            saving={saving}
            onUploadImage={handleUploadImage}
          />
        )}
        {activeTab === 'view' && <ViewTab profile={profile} />}
        {activeTab === 'preview' && <PreviewTab profile={profile} />}
        {activeTab === 'reviews' && <ReviewsTab reviews={reviews} ratings={ratings} />}
        {activeTab === 'marketplace' && <MarketplaceTab profile={profile} />}
        {activeTab === 'billing' && <BillingTab subscription={subscription} />}
        {activeTab === 'settings' && <SettingsTab user={user} />}
      </div>
    </div>
  );
};

// --- Tab Components (each receives props) ---

const EditTab = ({ profile, onSave, saving, onUploadImage }) => {
  const [formData, setFormData] = useState({
    business_name: profile.business_name || '',
    tagline: profile.tagline || '',
    description: profile.description || '',
    contact_json: profile.contact_json || { phone: '', email: '', website: '', serviceArea: '' },
    social_media_json: profile.social_media_json || {},
    operating_hours_json: profile.operating_hours_json || { mondayToFriday: '9-5', saturday: 'Closed', sunday: 'Closed' },
    services_json: profile.services_json || [],
    certifications_json: profile.certifications_json || []
  });

  const handleChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleAddService = () => {
    setFormData(prev => ({
      ...prev,
      services_json: [...prev.services_json, { name: '', price: '', description: '' }]
    }));
  };

  const handleServiceChange = (index, field, value) => {
    const updated = [...formData.services_json];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, services_json: updated }));
  };

  const handleRemoveService = (index) => {
    setFormData(prev => ({
      ...prev,
      services_json: prev.services_json.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="edit-tab">
      <div className="edit-grid">
        {/* Business Info */}
        <section className="edit-section">
          <h3><FaBuilding /> Business Information</h3>
          <div className="form-group">
            <label>Business Name</label>
            <input
              type="text"
              value={formData.business_name}
              onChange={(e) => handleChange(null, 'business_name', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Tagline</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => handleChange(null, 'tagline', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange(null, 'description', e.target.value)}
              rows="4"
            />
          </div>
        </section>

        {/* Contact */}
        <section className="edit-section">
          <h3><FaPhone /> Contact</h3>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              value={formData.contact_json.phone}
              onChange={(e) => handleChange('contact_json', 'phone', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.contact_json.email}
              onChange={(e) => handleChange('contact_json', 'email', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Website</label>
            <input
              type="url"
              value={formData.contact_json.website}
              onChange={(e) => handleChange('contact_json', 'website', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Service Area</label>
            <input
              type="text"
              value={formData.contact_json.serviceArea}
              onChange={(e) => handleChange('contact_json', 'serviceArea', e.target.value)}
            />
          </div>
        </section>

        {/* Social Media */}
        <section className="edit-section">
          <h3><FaGlobe /> Social Media</h3>
          {['facebook', 'twitter', 'instagram', 'linkedin'].map(platform => (
            <div key={platform} className="form-group">
              <label>{platform.charAt(0).toUpperCase() + platform.slice(1)}</label>
              <input
                type="text"
                value={formData.social_media_json[platform] || ''}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    social_media_json: { ...prev.social_media_json, [platform]: e.target.value }
                  }))
                }
              />
            </div>
          ))}
        </section>

        {/* Operating Hours */}
        <section className="edit-section">
          <h3><FaClock /> Operating Hours</h3>
          <div className="form-group">
            <label>Monday - Friday</label>
            <input
              type="text"
              value={formData.operating_hours_json.mondayToFriday}
              onChange={(e) => handleChange('operating_hours_json', 'mondayToFriday', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Saturday</label>
            <input
              type="text"
              value={formData.operating_hours_json.saturday}
              onChange={(e) => handleChange('operating_hours_json', 'saturday', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Sunday</label>
            <input
              type="text"
              value={formData.operating_hours_json.sunday}
              onChange={(e) => handleChange('operating_hours_json', 'sunday', e.target.value)}
            />
          </div>
        </section>

        {/* Services */}
        <section className="edit-section full-width">
          <h3><FaHome /> Services</h3>
          {formData.services_json.map((service, index) => (
            <div key={index} className="service-item">
              <input
                type="text"
                placeholder="Service name"
                value={service.name}
                onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
              />
              <input
                type="text"
                placeholder="Price (e.g. ₦5,000)"
                value={service.price}
                onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
              />
              <input
                type="text"
                placeholder="Description"
                value={service.description}
                onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
              />
              <button type="button" className="btn-icon danger" onClick={() => handleRemoveService(index)}>
                <FaTrash />
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-secondary" onClick={handleAddService}>
            <FaPlus /> Add Service
          </button>
        </section>

        {/* Certifications */}
        <section className="edit-section">
          <h3><FaCertificate /> Certifications</h3>
          <div className="cert-list">
            {formData.certifications_json.map((cert, idx) => (
              <div key={idx} className="cert-item">
                <input
                  type="text"
                  value={cert}
                  onChange={(e) => {
                    const newCerts = [...formData.certifications_json];
                    newCerts[idx] = e.target.value;
                    setFormData(prev => ({ ...prev, certifications_json: newCerts }));
                  }}
                />
                <button type="button" className="btn-icon danger" onClick={() => {
                  const newCerts = formData.certifications_json.filter((_, i) => i !== idx);
                  setFormData(prev => ({ ...prev, certifications_json: newCerts }));
                }}>
                  <FaTrash />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn-icon"
              onClick={() => setFormData(prev => ({ ...prev, certifications_json: [...prev.certifications_json, ''] }))}
            >
              <FaPlus /> Add
            </button>
          </div>
        </section>

        {/* Portfolio Images (placeholder) */}
        <section className="edit-section">
          <h3><FaImages /> Portfolio</h3>
          <p>Coming soon: upload images</p>
        </section>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <FaSpinner className="spinner" /> : <FaSave />} Save Changes
        </button>
      </div>
    </form>
  );
};

const ViewTab = ({ profile }) => {
  const formatHours = (hours) => {
    if (!hours) return {};
    return typeof hours === 'string' ? JSON.parse(hours) : hours;
  };

  return (
    <div className="view-tab">
      <div className="public-header">
        <div className="avatar">{profile.business_name?.charAt(0)}</div>
        <div>
          <h2>{profile.business_name}</h2>
          <p>{profile.tagline}</p>
          {profile.verified && (
            <span className="badge verified"><FaCheckCircle /> Verified</span>
          )}
        </div>
      </div>

      <div className="public-details">
        <section>
          <h3>About</h3>
          <p>{profile.description}</p>
        </section>

        <section>
          <h3>Contact</h3>
          <div className="contact-list">
            {profile.contact_json?.phone && (
              <div><FaPhone /> {profile.contact_json.phone}</div>
            )}
            {profile.contact_json?.email && (
              <div><FaEnvelope /> {profile.contact_json.email}</div>
            )}
            {profile.contact_json?.serviceArea && (
              <div><FaMapMarkerAlt /> {profile.contact_json.serviceArea}</div>
            )}
          </div>
        </section>

        <section>
          <h3>Hours</h3>
          <div className="hours-list">
            <div><span>Mon-Fri:</span> {profile.operating_hours_json?.mondayToFriday || 'N/A'}</div>
            <div><span>Sat:</span> {profile.operating_hours_json?.saturday || 'N/A'}</div>
            <div><span>Sun:</span> {profile.operating_hours_json?.sunday || 'N/A'}</div>
          </div>
        </section>

        <section>
          <h3>Services</h3>
          <div className="services-list">
            {profile.services_json?.map((s, i) => (
              <div key={i} className="service-card">
                <h4>{s.name}</h4>
                <p className="price">{s.price}</p>
                <p>{s.description}</p>
              </div>
            ))}
          </div>
        </section>

        {profile.certifications_json?.length > 0 && (
          <section>
            <h3>Certifications</h3>
            <ul>
              {profile.certifications_json.map((c, i) => (
                <li key={i}><FaCertificate /> {c}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

const PreviewTab = ({ profile }) => {
  // Simplified public preview (similar to view but with device mockup)
  return (
    <div className="preview-tab">
      <div className="device-mockup">
        <div className="preview-content">
          <ViewTab profile={profile} />
        </div>
      </div>
    </div>
  );
};

const ReviewsTab = ({ reviews, ratings }) => {
  return (
    <div className="reviews-tab">
      <div className="ratings-header">
        <div className="overall">
          <span className="big-number">{ratings.average?.toFixed(1)}</span>
          <div className="stars">
            {renderStars(ratings.average)}
          </div>
          <p>{ratings.total} reviews</p>
        </div>
        <div className="distribution">
          {[5,4,3,2,1].map(star => (
            <div key={star} className="bar-row">
              <span>{star} stars</span>
              <div className="bar">
                <div style={{ width: `${(ratings.distribution[star] / ratings.total) * 100 || 0}%` }} />
              </div>
              <span>{ratings.distribution[star]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="reviews-list">
        {reviews.map(r => (
          <div key={r.id} className="review-card">
            <div className="review-header">
              <strong>{r.client?.full_name || 'Anonymous'}</strong>
              <span className="rating">{renderStars(r.rating)}</span>
              <span className="date">{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
            <p>{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const MarketplaceTab = ({ profile }) => {
  return (
    <div className="marketplace-tab">
      <h2>Marketplace Presence</h2>
      <div className="status-cards">
        <div className="card">
          <h3>Visibility</h3>
          <p>Your profile appears in marketplace: <strong>Yes</strong></p>
        </div>
        <div className="card">
          <h3>Verification</h3>
          <p>Status: <span className={profile.verified ? 'verified' : 'pending'}>
            {profile.verified ? 'Verified' : 'Not Verified'}
          </span></p>
        </div>
        <div className="card">
          <h3>Boost</h3>
          <p>Active Boost: <strong>No</strong></p>
          <button className="btn btn-primary">Boost Now</button>
        </div>
      </div>
    </div>
  );
};

const BillingTab = ({ subscription }) => {
  return (
    <div className="billing-tab">
      <h2>Billing & Subscription</h2>
      <div className="subscription-card">
        <h3>Free Tier</h3>
        <p>Free bookings used: {subscription?.free_booking_used || 0}/{subscription?.free_booking_limit || 10}</p>
        <p>Status: <span className="badge">{subscription?.subscription_status || 'Active'}</span></p>
        <button className="btn btn-primary">Upgrade</button>
      </div>
    </div>
  );
};

const SettingsTab = ({ user }) => {
  return (
    <div className="settings-tab">
      <h2>Account Settings</h2>
      <div className="settings-section">
        <h3>Personal Info</h3>
        <div className="form-group">
          <label>Name</label>
          <input type="text" defaultValue={user?.email} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" defaultValue={user?.email} />
        </div>
        <button className="btn btn-primary">Update</button>
      </div>
      <div className="settings-section">
        <h3>Security</h3>
        <button className="btn btn-secondary">Change Password</button>
      </div>
      <div className="settings-section">
        <h3>Danger Zone</h3>
        <button className="btn btn-danger">Delete Account</button>
      </div>
    </div>
  );
};

// Helper function to render stars
const renderStars = (rating) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="stars">
      {[...Array(full)].map((_, i) => <FaStar key={`full-${i}`} />)}
      {half && <FaStarHalfAlt />}
      {[...Array(empty)].map((_, i) => <FaRegStar key={`empty-${i}`} />)}
    </span>
  );
};

export default ProviderProfile;