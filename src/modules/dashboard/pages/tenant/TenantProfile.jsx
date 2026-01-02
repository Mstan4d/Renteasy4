// src/modules/dashboard/pages/tenant/TenantProfile.jsx - MODERN VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../shared/context/AuthContext';
import VerifiedBadge from '../../../../shared/components/VerifiedBadge';
import './TenantProfile.css';

const TenantProfile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    occupation: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    preferences: {
      notification: true,
      emailUpdates: true,
      smsAlerts: false,
      newsletter: true
    }
  });
  const [profilePic, setProfilePic] = useState(null);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    if (user) {
      const savedProfile = JSON.parse(localStorage.getItem(`tenant_profile_${user.id}`) || 'null');
      const savedPic = localStorage.getItem(`tenant_profile_pic_${user.id}`);
      const savedCover = localStorage.getItem(`tenant_cover_photo_${user.id}`);
      
      setProfile(savedProfile || {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: 'A responsible tenant looking for comfortable accommodation.',
        occupation: 'Software Developer',
        dateOfBirth: '1990-01-01',
        gender: '',
        address: '',
        emergencyContact: {
          name: '',
          phone: '',
          relationship: ''
        },
        preferences: {
          notification: true,
          emailUpdates: true,
          smsAlerts: false,
          newsletter: true
        }
      });
      
      if (savedPic) setProfilePic(savedPic);
      if (savedCover) setCoverPhoto(savedCover);
    }
  }, [user]);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem(`tenant_profile_${user.id}`, JSON.stringify(profile));
      if (profilePic) localStorage.setItem(`tenant_profile_pic_${user.id}`, profilePic);
      if (coverPhoto) localStorage.setItem(`tenant_cover_photo_${user.id}`, coverPhoto);
      
      updateUser({ 
        ...user, 
        ...profile,
        profilePic: profilePic || user.profilePic,
        coverPhoto: coverPhoto || user.coverPhoto
      });
      
      setEditMode(false);
      setLoading(false);
      alert('Profile updated successfully!');
    }, 1000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'profile') {
        setProfilePic(reader.result);
      } else {
        setCoverPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (type) => {
    if (type === 'profile') {
      setProfilePic(null);
      localStorage.removeItem(`tenant_profile_pic_${user.id}`);
    } else {
      setCoverPhoto(null);
      localStorage.removeItem(`tenant_cover_photo_${user.id}`);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal', icon: '👤' },
    { id: 'contact', label: 'Contact', icon: '📱' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'security', label: 'Security', icon: '🔒' },
  ];

  const stats = [
    { label: 'Active Listings', value: '3', icon: '🏠' },
    { label: 'Applications', value: '5', icon: '📋' },
    { label: 'Trust Score', value: '85/100', icon: '⭐' },
    { label: 'Member Since', value: 'Dec 2024', icon: '📅' },
  ];

  return (
    <div className="tenant-profile-modern">
      {/* Profile Header with Cover Photo */}
      <div className="profile-header-modern">
        <div className="cover-photo-container">
          {coverPhoto ? (
            <img src={coverPhoto} alt="Cover" className="cover-photo" />
          ) : (
            <div className="cover-photo-placeholder"></div>
          )}
          
          {editMode && (
            <div className="cover-photo-actions">
              <label className="upload-btn">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'cover')}
                  style={{ display: 'none' }}
                />
                📷 Change Cover
              </label>
              {coverPhoto && (
                <button className="remove-btn" onClick={() => removeImage('cover')}>
                  🗑️ Remove
                </button>
              )}
            </div>
          )}
        </div>

        {/* Profile Picture */}
        <div className="profile-pic-container">
          <div className="profile-pic-wrapper">
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="profile-pic" />
            ) : (
              <div className="profile-pic-placeholder">
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'T'}
              </div>
            )}
            
            {editMode && (
              <div className="profile-pic-actions">
                <label className="upload-btn small">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'profile')}
                    style={{ display: 'none' }}
                  />
                  📷
                </label>
                {profilePic && (
                  <button 
                    className="remove-btn small"
                    onClick={() => removeImage('profile')}
                  >
                    🗑️
                  </button>
                )}
              </div>
            )}
          </div>
          
          <div className="profile-basic-info">
            <div className="profile-name-container">
              <h1>{profile.name || 'Tenant'}</h1>
              {user?.isVerified && <VerifiedBadge type="tenant" size="large" />}
            </div>
            <p className="profile-occupation">
              <span className="occupation-icon">💼</span>
              {profile.occupation || 'Tenant'}
            </p>
            <div className="profile-meta">
              <span className="meta-item">
                <span className="meta-icon">📧</span>
                {profile.email || 'No email'}
              </span>
              <span className="meta-item">
                <span className="meta-icon">📱</span>
                {profile.phone || 'No phone'}
              </span>
              <span className="meta-item">
                <span className="meta-icon">📍</span>
                {profile.address || 'No address'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="profile-stats">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card-modern">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="profile-content-modern">
        {/* Sidebar Tabs */}
        <div className="profile-sidebar">
          <div className="sidebar-header">
            <h3>Profile Settings</h3>
            <button 
              className={`btn ${editMode ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => editMode ? handleSave() : setEditMode(true)}
              disabled={loading}
            >
              {loading ? 'Saving...' : editMode ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>
          
          <div className="sidebar-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>
          
          {/* Bio Section */}
          <div className="sidebar-bio">
            <h4>Bio</h4>
            {editMode ? (
              <textarea
                className="bio-textarea"
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                placeholder="Tell us about yourself..."
                rows="4"
              />
            ) : (
              <p className="bio-text">{profile.bio || 'No bio added yet.'}</p>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="profile-main">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="tab-content">
              <div className="tab-header">
                <h3>Personal Information</h3>
                <p>Update your personal details</p>
              </div>
              
              <div className="form-grid-modern">
                <div className="form-group-modern">
                  <label className="form-label">
                    <span className="label-icon">👤</span>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className="form-input"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="form-group-modern">
                  <label className="form-label">
                    <span className="label-icon">🎂</span>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={profile.dateOfBirth}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group-modern">
                  <label className="form-label">
                    <span className="label-icon">⚧️</span>
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={profile.gender}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className="form-input"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
                
                <div className="form-group-modern">
                  <label className="form-label">
                    <span className="label-icon">💼</span>
                    Occupation
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    value={profile.occupation}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className="form-input"
                    placeholder="Your profession"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact Information Tab */}
          {activeTab === 'contact' && (
            <div className="tab-content">
              <div className="tab-header">
                <h3>Contact Information</h3>
                <p>Update your contact details and emergency contact</p>
              </div>
              
              <div className="section-card">
                <h4>Primary Contact</h4>
                <div className="form-grid-modern">
                  <div className="form-group-modern">
                    <label className="form-label">
                      <span className="label-icon">📧</span>
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className="form-input"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  
                  <div className="form-group-modern">
                    <label className="form-label">
                      <span className="label-icon">📱</span>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className="form-input"
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                  
                  <div className="form-group-modern full-width">
                    <label className="form-label">
                      <span className="label-icon">📍</span>
                      Current Address
                    </label>
                    <textarea
                      name="address"
                      value={profile.address}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className="form-input"
                      rows="3"
                      placeholder="Your current residential address"
                    />
                  </div>
                </div>
              </div>
              
              <div className="section-card">
                <h4>Emergency Contact</h4>
                <div className="form-grid-modern">
                  <div className="form-group-modern">
                    <label className="form-label">
                      <span className="label-icon">👤</span>
                      Contact Name
                    </label>
                    <input
                      type="text"
                      name="emergencyContact.name"
                      value={profile.emergencyContact.name}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className="form-input"
                      placeholder="Emergency contact name"
                    />
                  </div>
                  
                  <div className="form-group-modern">
                    <label className="form-label">
                      <span className="label-icon">📱</span>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="emergencyContact.phone"
                      value={profile.emergencyContact.phone}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className="form-input"
                      placeholder="Emergency contact phone"
                    />
                  </div>
                  
                  <div className="form-group-modern">
                    <label className="form-label">
                      <span className="label-icon">🤝</span>
                      Relationship
                    </label>
                    <select
                      name="emergencyContact.relationship"
                      value={profile.emergencyContact.relationship}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className="form-input"
                    >
                      <option value="">Select relationship</option>
                      <option value="spouse">Spouse</option>
                      <option value="parent">Parent</option>
                      <option value="sibling">Sibling</option>
                      <option value="friend">Friend</option>
                      <option value="relative">Relative</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="tab-content">
              <div className="tab-header">
                <h3>Notification Preferences</h3>
                <p>Choose how you want to receive updates</p>
              </div>
              
              <div className="preferences-grid">
                <div className="preference-card">
                  <div className="preference-header">
                    <span className="preference-icon">🔔</span>
                    <div>
                      <h4>Push Notifications</h4>
                      <p>Receive app notifications</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        name="preferences.notification"
                        checked={profile.preferences.notification}
                        onChange={handleInputChange}
                        disabled={!editMode}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                
                <div className="preference-card">
                  <div className="preference-header">
                    <span className="preference-icon">📧</span>
                    <div>
                      <h4>Email Updates</h4>
                      <p>Receive email newsletters</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        name="preferences.emailUpdates"
                        checked={profile.preferences.emailUpdates}
                        onChange={handleInputChange}
                        disabled={!editMode}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                
                <div className="preference-card">
                  <div className="preference-header">
                    <span className="preference-icon">💬</span>
                    <div>
                      <h4>SMS Alerts</h4>
                      <p>Receive text message alerts</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        name="preferences.smsAlerts"
                        checked={profile.preferences.smsAlerts}
                        onChange={handleInputChange}
                        disabled={!editMode}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                
                <div className="preference-card">
                  <div className="preference-header">
                    <span className="preference-icon">📰</span>
                    <div>
                      <h4>Newsletter</h4>
                      <p>Receive property updates</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        name="preferences.newsletter"
                        checked={profile.preferences.newsletter}
                        onChange={handleInputChange}
                        disabled={!editMode}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="tab-content">
              <div className="tab-header">
                <h3>Security & Verification</h3>
                <p>Manage your account security</p>
              </div>
              
              <div className="security-grid">
                <div className="security-card">
                  <div className="security-icon">🔐</div>
                  <div className="security-content">
                    <h4>Password</h4>
                    <p>Last changed: 2 weeks ago</p>
                  </div>
                  <button className="btn btn-outline btn-sm">Change</button>
                </div>
                
                <div className="security-card">
                  <div className="security-icon">✅</div>
                  <div className="security-content">
                    <h4>Verification Status</h4>
                    <p>{user?.isVerified ? 'Verified Account' : 'Not Verified'}</p>
                  </div>
                  {!user?.isVerified && (
                    <button className="btn btn-primary btn-sm">Get Verified</button>
                  )}
                </div>
                
                <div className="security-card">
                  <div className="security-icon">📧</div>
                  <div className="security-content">
                    <h4>Email Verification</h4>
                    <p>{profile.email ? 'Verified' : 'Not verified'}</p>
                  </div>
                  <button className="btn btn-outline btn-sm">Verify</button>
                </div>
                
                <div className="security-card">
                  <div className="security-icon">📱</div>
                  <div className="security-content">
                    <h4>Phone Verification</h4>
                    <p>{profile.phone ? 'Verified' : 'Not verified'}</p>
                  </div>
                  <button className="btn btn-outline btn-sm">Verify</button>
                </div>
              </div>
              
              <div className="danger-zone">
                <h4>Danger Zone</h4>
                <div className="danger-actions">
                  <button className="btn btn-danger btn-sm">Delete Account</button>
                  <button className="btn btn-outline btn-sm">Deactivate Account</button>
                </div>
              </div>
            </div>
          )}
          
          {/* Save Actions (only in edit mode) */}
          {editMode && (
            <div className="save-actions">
              <button 
                className="btn btn-primary btn-lg"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Saving...
                  </>
                ) : 'Save All Changes'}
              </button>
              <button 
                className="btn btn-outline btn-lg"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantProfile;