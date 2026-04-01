import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../shared/lib/supabaseClient';
import { useAuth } from '../../../../shared/context/AuthContext';
import VerifiedBadge from '../../../../shared/components/VerifiedBadge';
import RentEasyLoader from '../../../../shared/components/RentEasyLoader';
import { Eye, EyeOff, CreditCard, Building, User, Mail, Phone, MapPin } from 'lucide-react';
import './TenantProfile.css';

const TenantProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    bio: '',
    occupation: '',
    date_of_birth: '',
    gender: '',
    address: '',
    bank_name: '',
    account_number: '',
    account_name: '',
    emergency_contact: {
      name: '',
      phone: '',
      relationship: ''
    },
    preferences: {
      notification: true,
      email_updates: true,
      sms_alerts: false,
      newsletter: true
    }
  });
  
  const [profilePic, setProfilePic] = useState(null);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [stats, setStats] = useState({
    active_listings: 0,
    applications: 0,
    trust_score: 0,
    member_since: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
      fetchStats();
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
          full_name: data.full_name || '',
          email: data.email || user.email || '',
          phone_number: data.phone_number || '',
          bio: data.bio || '',
          occupation: data.occupation || '',
          date_of_birth: data.date_of_birth || '',
          gender: data.gender || '',
          address: data.address || '',
          bank_name: data.bank_name || '',
          account_number: data.account_number || '',
          account_name: data.account_name || '',
          emergency_contact: data.emergency_contact || { name: '', phone: '', relationship: '' },
          preferences: data.preferences || { notification: true, email_updates: true, sms_alerts: false, newsletter: true }
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

  const fetchStats = async () => {
    try {
      const { count: listingsCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: savedCount } = await supabase
        .from('saved_properties')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', user.id)
        .single();

      const memberDate = profileData?.created_at 
        ? new Date(profileData.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : 'N/A';

      setStats({
        active_listings: listingsCount || 0,
        applications: savedCount || 0,
        trust_score: user?.is_verified ? 95 : 65,
        member_since: memberDate
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const uploadImage = async (file, path) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${path}-${Date.now()}.${fileExt}`;
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
        full_name: profile.full_name,
        phone_number: profile.phone_number,
        bio: profile.bio,
        occupation: profile.occupation,
        date_of_birth: profile.date_of_birth,
        gender: profile.gender,
        address: profile.address,
        bank_name: profile.bank_name,
        account_number: profile.account_number,
        account_name: profile.account_name,
        emergency_contact: profile.emergency_contact,
        preferences: profile.preferences,
        avatar_url: profilePic,
        cover_url: coverPhoto,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) throw error;

      updateUser({ ...user, ...profile });
      setEditMode(false);
      alert('Profile updated successfully!');
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

  const formatAccountNumber = (number) => {
    if (!number) return 'Not provided';
    if (showAccountNumber) return number;
    return '••••' + number.slice(-4);
  };

  const tabs = [
    { id: 'personal', label: 'Personal', icon: '👤' },
    { id: 'contact', label: 'Contact', icon: '📱' },
    { id: 'bank', label: 'Bank Account', icon: '🏦' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'security', label: 'Security', icon: '🔒' },
  ];

  const statsData = [
    { label: 'Active Listings', value: stats.active_listings.toString(), icon: '🏠' },
    { label: 'Saved Properties', value: stats.applications.toString(), icon: '⭐' },
    { label: 'Trust Score', value: `${stats.trust_score}/100`, icon: '⭐' },
    { label: 'Member Since', value: stats.member_since, icon: '📅' },
  ];

  if (loading) {
    return <RentEasyLoader message="Loading your Profile..." fullScreen />;
  }

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
                {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'T'}
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
              <h1>{profile.full_name || 'Tenant'}</h1>
              {user?.is_verified && <VerifiedBadge type="tenant" size="large" />}
            </div>
            <p className="profile-occupation">
              <span className="occupation-icon">💼</span>
              {profile.occupation || 'Tenant'}
            </p>
            <div className="profile-meta">
              <span className="meta-item">📧 {profile.email}</span>
              {profile.phone_number && <span className="meta-item">📱 {profile.phone_number}</span>}
              {profile.address && <span className="meta-item">📍 {profile.address}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="profile-stats">
        {statsData.map((stat, index) => (
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
              {loading ? 'Processing...' : editMode ? 'Save Changes' : 'Edit Profile'}
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
                <p>Update your personal details</p>
              </div>
              <div className="form-grid-modern">
                <div className="form-group-modern">
                  <label>Full Name</label>
                  <input type="text" name="full_name" value={profile.full_name} onChange={handleInputChange} disabled={!editMode} className="form-input" />
                </div>
                <div className="form-group-modern">
                  <label>Date of Birth</label>
                  <input type="date" name="date_of_birth" value={profile.date_of_birth} onChange={handleInputChange} disabled={!editMode} className="form-input" />
                </div>
                <div className="form-group-modern">
                  <label>Gender</label>
                  <select name="gender" value={profile.gender} onChange={handleInputChange} disabled={!editMode} className="form-input">
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group-modern">
                  <label>Occupation</label>
                  <input type="text" name="occupation" value={profile.occupation} onChange={handleInputChange} disabled={!editMode} className="form-input" />
                </div>
                <div className="form-group-modern full-width">
                  <label>Bio</label>
                  <textarea name="bio" value={profile.bio} onChange={handleInputChange} disabled={!editMode} className="form-input" rows="3" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="tab-content">
              <div className="tab-header">
                <h3>Contact Information</h3>
                <p>How to reach you</p>
              </div>
              <div className="section-card">
                <h4>Primary Contact</h4>
                <div className="form-grid-modern">
                  <div className="form-group-modern full-width">
                    <label>Email</label>
                    <input type="email" name="email" value={profile.email} disabled className="form-input" />
                    <small className="field-hint">Email cannot be changed</small>
                  </div>
                  <div className="form-group-modern">
                    <label>Phone Number</label>
                    <input type="tel" name="phone_number" value={profile.phone_number} onChange={handleInputChange} disabled={!editMode} className="form-input" />
                  </div>
                  <div className="form-group-modern full-width">
                    <label>Address</label>
                    <textarea name="address" value={profile.address} onChange={handleInputChange} disabled={!editMode} className="form-input" rows="2" />
                  </div>
                </div>
              </div>
              
              <div className="section-card">
                <h4>Emergency Contact</h4>
                <div className="form-grid-modern">
                  <div className="form-group-modern">
                    <label>Name</label>
                    <input type="text" name="emergency_contact.name" value={profile.emergency_contact.name} onChange={handleInputChange} disabled={!editMode} className="form-input" />
                  </div>
                  <div className="form-group-modern">
                    <label>Phone</label>
                    <input type="tel" name="emergency_contact.phone" value={profile.emergency_contact.phone} onChange={handleInputChange} disabled={!editMode} className="form-input" />
                  </div>
                  <div className="form-group-modern">
                    <label>Relationship</label>
                    <select name="emergency_contact.relationship" value={profile.emergency_contact.relationship} onChange={handleInputChange} disabled={!editMode} className="form-input">
                      <option value="">Select...</option>
                      <option value="spouse">Spouse</option>
                      <option value="parent">Parent</option>
                      <option value="sibling">Sibling</option>
                      <option value="friend">Friend</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bank' && (
            <div className="tab-content">
              <div className="tab-header">
                <h3>Bank Account Details</h3>
                <p>Your bank details are required to receive referral commissions</p>
              </div>
              
              <div className="bank-info-notice">
                <Building size={16} />
                <small>Provide your bank account details to receive commission payouts (1.5% referral commission)</small>
              </div>
              
              <div className="section-card">
                <div className="form-grid-modern">
                  <div className="form-group-modern">
                    <label>Bank Name</label>
                    <select 
                      name="bank_name" 
                      value={profile.bank_name} 
                      onChange={handleInputChange} 
                      disabled={!editMode} 
                      className="form-input"
                    >
                      <option value="">Select Bank</option>
                      <option value="Access Bank">Access Bank</option>
                      <option value="First Bank">First Bank</option>
                      <option value="GTBank">GTBank</option>
                      <option value="UBA">UBA</option>
                      <option value="Zenith Bank">Zenith Bank</option>
                      <option value="Moniepoint">Moniepoint</option>
                      <option value="Opay">Opay</option>
                      <option value="Palmpay">Palmpay</option>
                      <option value="Kuda Bank">Kuda Bank</option>
                    </select>
                  </div>
                  
                  <div className="form-group-modern">
                    <label>Account Number</label>
                    <div className="input-with-icon">
                      <input 
                        type={showAccountNumber ? "text" : "password"} 
                        name="account_number" 
                        value={profile.account_number} 
                        onChange={handleInputChange} 
                        disabled={!editMode} 
                        className="form-input" 
                        maxLength="10"
                        placeholder="10-digit account number"
                      />
                      <button 
                        type="button" 
                        className="toggle-visibility"
                        onClick={() => setShowAccountNumber(!showAccountNumber)}
                      >
                        {showAccountNumber ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="form-group-modern">
                    <label>Account Name</label>
                    <input 
                      type="text" 
                      name="account_name" 
                      value={profile.account_name} 
                      onChange={handleInputChange} 
                      disabled={!editMode} 
                      className="form-input" 
                      placeholder="Account holder name"
                    />
                  </div>
                </div>
                
                {!editMode && profile.bank_name && (
                  <div className="bank-details-preview">
                    <div className="preview-row">
                      <span className="preview-label">Bank:</span>
                      <span className="preview-value">{profile.bank_name}</span>
                    </div>
                    <div className="preview-row">
                      <span className="preview-label">Account Number:</span>
                      <span className="preview-value">{formatAccountNumber(profile.account_number)}</span>
                    </div>
                    <div className="preview-row">
                      <span className="preview-label">Account Name:</span>
                      <span className="preview-value">{profile.account_name || 'Not provided'}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="commission-info-card">
                <h4>💰 Commission Information</h4>
                <p>As a tenant, you can earn <strong>1.5% referral commission</strong> when:</p>
                <ul>
                  <li>Someone signs up using your referral link and rents a property</li>
                  <li>You post a property that gets rented (outgoing tenant)</li>
                </ul>
                <small>Bank details are required to receive these payments</small>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="tab-content">
              <div className="tab-header">
                <h3>Notification Preferences</h3>
                <p>Manage how you receive updates</p>
              </div>
              <div className="preferences-grid">
                <div className="preference-card">
                  <div className="preference-header">
                    <div className="preference-info">
                      <h4>Push Notifications</h4>
                      <p>Receive in-app notifications</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" name="preferences.notification" checked={profile.preferences.notification} onChange={handleInputChange} disabled={!editMode} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                
                <div className="preference-card">
                  <div className="preference-header">
                    <div className="preference-info">
                      <h4>Email Updates</h4>
                      <p>Property alerts and updates</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" name="preferences.email_updates" checked={profile.preferences.email_updates} onChange={handleInputChange} disabled={!editMode} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                
                <div className="preference-card">
                  <div className="preference-header">
                    <div className="preference-info">
                      <h4>SMS Alerts</h4>
                      <p>Text message notifications</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" name="preferences.sms_alerts" checked={profile.preferences.sms_alerts} onChange={handleInputChange} disabled={!editMode} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                
                <div className="preference-card">
                  <div className="preference-header">
                    <div className="preference-info">
                      <h4>Newsletter</h4>
                      <p>Weekly property digest</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" name="preferences.newsletter" checked={profile.preferences.newsletter} onChange={handleInputChange} disabled={!editMode} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="tab-content">
              <div className="tab-header">
                <h3>Security Settings</h3>
                <p>Manage your account security</p>
              </div>
              <div className="security-card">
                <div className="security-content">
                  <h4>Account Status</h4>
                  <p>{user?.is_verified ? '✅ Verified Account' : '⏳ Unverified Account'}</p>
                  <small>{user?.is_verified ? 'Your identity has been verified' : 'Complete KYC to get verified badge'}</small>
                </div>
                {!user?.is_verified && (
                  <button className="btn btn-primary btn-sm" onClick={() => navigate('/verify')}>
                    Verify Now
                  </button>
                )}
              </div>
              
              <div className="security-card">
                <div className="security-content">
                  <h4>Change Password</h4>
                  <p>Update your login credentials</p>
                </div>
                <button className="btn btn-outline btn-sm">
                  Change Password
                </button>
              </div>
              
              <div className="danger-zone">
                <h4>⚠️ Danger Zone</h4>
                <div className="danger-actions">
                  <button className="btn btn-danger btn-sm">
                    Deactivate Account
                  </button>
                  <button className="btn btn-danger-outline btn-sm">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {editMode && (
            <div className="save-actions">
              <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => setEditMode(false)}>
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