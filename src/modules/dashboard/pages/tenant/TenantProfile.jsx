import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../shared/lib/supabaseClient';
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
    emergency_contact: {
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
    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          name: data.full_name || '',
          email: data.email || '',
          phone: data.phone_number || '',
          bio: data.bio || '',
          occupation: data.occupation || '',
          dateOfBirth: data.date_of_birth || '',
          gender: data.gender || '',
          address: data.address || '',
          emergency_contact: data.emergency_contact || { name: '', phone: '', relationship: '' },
          preferences: data.preferences || { notification: true, emailUpdates: true, smsAlerts: false, newsletter: true }
        });
        setProfilePic(data.avatar_url);
        setCoverPhoto(data.cover_url);
      }
    } catch (error) {
      console.error('Error fetching profile:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file, path) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${path}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates = {
        id: user.id,
        full_name: profile.name,
        phone_number: profile.phone,
        bio: profile.bio,
        occupation: profile.occupation,
        date_of_birth: profile.dateOfBirth,
        gender: profile.gender,
        address: profile.address,
        emergency_contact: profile.emergency_contact,
        preferences: profile.preferences,
        avatar_url: profilePic,
        cover_url: coverPhoto,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) throw error;

      updateUser({ ...user, ...profile, profilePic, coverPhoto });
      setEditMode(false);
      alert('Profile updated in Supabase successfully!');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
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

  const handleImageChange = async (e, type) => {
    try {
      setLoading(true);
      const file = e.target.files[0];
      if (!file) return;

      const url = await uploadImage(file, type);
      if (type === 'profile') setProfilePic(url);
      else setCoverPhoto(url);
    } catch (error) {
      alert("Error uploading image: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = async (type) => {
    if (type === 'profile') setProfilePic(null);
    else setCoverPhoto(null);
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
                  onChange={(e) => handleImageChange(e, 'cover')}
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
                    onChange={(e) => handleImageChange(e, 'profile')}
                    style={{ display: 'none' }}
                  />
                  📷
                </label>
                {profilePic && (
                  <button className="remove-btn small" onClick={() => removeImage('profile')}>
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
              <span className="meta-item">📧 {profile.email}</span>
              <span className="meta-item">📱 {profile.phone}</span>
              <span className="meta-item">📍 {profile.address}</span>
            </div>
          </div>
        </div>
      </div>

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

      <div className="profile-content-modern">
        <div className="profile-sidebar">
          <div className="sidebar-header">
            <h3>Profile Settings</h3>
            <button 
              className={`btn ${editMode ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => editMode ? handleSave() : setEditMode(true)}
              disabled={loading}
            >
              {loading ? 'Processing...' : editMode ? 'Save to Database' : 'Edit Profile'}
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

        <div className="profile-main">
          {activeTab === 'personal' && (
            <div className="tab-content">
              <div className="tab-header">
                <h3>Personal Information</h3>
              </div>
              <div className="form-grid-modern">
                <div className="form-group-modern">
                  <label>Full Name</label>
                  <input type="text" name="name" value={profile.name} onChange={handleInputChange} disabled={!editMode} className="form-input" />
                </div>
                <div className="form-group-modern">
                  <label>Date of Birth</label>
                  <input type="date" name="dateOfBirth" value={profile.dateOfBirth} onChange={handleInputChange} disabled={!editMode} className="form-input" />
                </div>
                <div className="form-group-modern">
                  <label>Gender</label>
                  <select name="gender" value={profile.gender} onChange={handleInputChange} disabled={!editMode} className="form-input">
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="form-group-modern">
                  <label>Occupation</label>
                  <input type="text" name="occupation" value={profile.occupation} onChange={handleInputChange} disabled={!editMode} className="form-input" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="tab-content">
              <div className="tab-header"><h3>Contact Information</h3></div>
              <div className="section-card">
                <h4>Primary Contact</h4>
                <div className="form-grid-modern">
                  <div className="form-group-modern"><label>Email</label><input type="email" name="email" value={profile.email} disabled className="form-input" /></div>
                  <div className="form-group-modern"><label>Phone</label><input type="tel" name="phone" value={profile.phone} onChange={handleInputChange} disabled={!editMode} className="form-input" /></div>
                  <div className="form-group-modern full-width"><label>Address</label><textarea name="address" value={profile.address} onChange={handleInputChange} disabled={!editMode} className="form-input" /></div>
                </div>
              </div>
              
              <div className="section-card">
                <h4>Emergency Contact</h4>
                <div className="form-grid-modern">
                  <div className="form-group-modern"><label>Name</label><input type="text" name="emergency_contact.name" value={profile.emergency_contact.name} onChange={handleInputChange} disabled={!editMode} className="form-input" /></div>
                  <div className="form-group-modern"><label>Phone</label><input type="tel" name="emergency_contact.phone" value={profile.emergency_contact.phone} onChange={handleInputChange} disabled={!editMode} className="form-input" /></div>
                  <div className="form-group-modern">
                    <label>Relationship</label>
                    <select name="emergency_contact.relationship" value={profile.emergency_contact.relationship} onChange={handleInputChange} disabled={!editMode} className="form-input">
                      <option value="">Select...</option>
                      <option value="spouse">Spouse</option>
                      <option value="parent">Parent</option>
                      <option value="friend">Friend</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="tab-content">
              <div className="tab-header"><h3>Notification Preferences</h3></div>
              <div className="preferences-grid">
                {['notification', 'emailUpdates', 'smsAlerts', 'newsletter'].map(pref => (
                  <div className="preference-card" key={pref}>
                    <div className="preference-header">
                      <h4>{pref.replace(/([A-Z])/g, ' $1')}</h4>
                      <label className="toggle-switch">
                        <input type="checkbox" name={`preferences.${pref}`} checked={profile.preferences[pref]} onChange={handleInputChange} disabled={!editMode} />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
             <div className="tab-content">
                <div className="tab-header"><h3>Security</h3></div>
                <div className="security-card">
                   <div className="security-content">
                      <h4>Account Status</h4>
                      <p>{user?.isVerified ? 'Verified' : 'Unverified'}</p>
                   </div>
                   {!user?.isVerified && <button className="btn btn-primary btn-sm">Verify Now</button>}
                </div>
             </div>
          )}
          
          {editMode && (
            <div className="save-actions">
              <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving to Database...' : 'Confirm Changes'}
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => setEditMode(false)}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantProfile;