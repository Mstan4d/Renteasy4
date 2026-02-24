// src/modules/dashboard/pages/landlord/LandlordSettings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import {
  User, Mail, Phone, Globe, Shield, Bell,
  Lock, CreditCard, Building, MapPin, Calendar,
  Upload, Save, Eye, EyeOff, X, CheckCircle,
  AlertCircle, Download, Trash2, RefreshCw,
  Smartphone, Monitor, Tablet
} from 'lucide-react';
import './LandlordSettings.css';

const LandlordSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    propertyAlerts: true,
    paymentAlerts: true,
    maintenanceAlerts: true,
    newBookingAlerts: true,
    weeklyReports: true
  });

  // Profile Form
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    postalCode: '',
    taxId: '',
    website: '',
    bio: '',
    avatar: ''
  });

  // Security Form
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Payment Form
  const [payment, setPayment] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    bankCode: '',
    paymentMethod: 'bank-transfer',
    payoutSchedule: 'weekly'
  });

  // API Keys
  const [apiKeys, setApiKeys] = useState([]);
  const [newApiKey, setNewApiKey] = useState({
    name: '',
    permissions: ['read']
  });

  // Load landlord profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch landlord profile from Supabase
        const { data: profileData, error } = await supabase
          .from('landlord_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
        }

        if (profileData) {
          setProfile({
            fullName: profileData.full_name || user.name || '',
            email: user.email || '',
            phone: profileData.phone || '',
            companyName: profileData.company_name || '',
            address: profileData.address || '',
            city: profileData.city || '',
            state: profileData.state || '',
            country: profileData.country || 'Nigeria',
            postalCode: profileData.postal_code || '',
            taxId: profileData.tax_id || '',
            website: profileData.website || '',
            bio: profileData.bio || '',
            avatar: profileData.avatar_url || ''
          });

          // Load notifications settings
          if (profileData.notification_settings) {
            setNotifications(profileData.notification_settings);
          }

          // Load payment settings
          if (profileData.payment_settings) {
            setPayment(profileData.payment_settings);
          }
        } else {
          // Set defaults from auth user
          setProfile(prev => ({
            ...prev,
            email: user.email || '',
            fullName: user.name || ''
          }));
        }

        // Fetch API keys
        const { data: keys } = await supabase
          .from('api_keys')
          .select('*')
          .eq('user_id', user.id)
          .eq('user_type', 'landlord');

        if (keys) {
          setApiKeys(keys);
        }

      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update landlord profile in Supabase
      const { error } = await supabase
        .from('landlord_profiles')
        .upsert({
          user_id: user.id,
          full_name: profile.fullName,
          phone: profile.phone,
          company_name: profile.companyName,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          country: profile.country,
          postal_code: profile.postalCode,
          tax_id: profile.taxId,
          website: profile.website,
          bio: profile.bio,
          notification_settings: notifications,
          payment_settings: payment,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Update user metadata if needed
      if (profile.fullName !== user.name) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { full_name: profile.fullName }
        });
        if (updateError) console.warn('Could not update auth metadata:', updateError);
      }

      alert('✅ Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('❌ Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (security.newPassword !== security.confirmPassword) {
      alert('❌ New passwords do not match!');
      return;
    }

    if (security.newPassword.length < 6) {
      alert('❌ Password must be at least 6 characters long');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: security.newPassword
      });

      if (error) throw error;

      alert('✅ Password updated successfully!');
      setSecurity({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      alert('❌ Failed to change password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle payment settings update
  const handlePaymentUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update payment settings in landlord profile
      const { error } = await supabase
        .from('landlord_profiles')
        .update({
          payment_settings: payment,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      alert('✅ Payment settings updated successfully!');
    } catch (error) {
      console.error('Error updating payment settings:', error);
      alert('❌ Failed to update payment settings.');
    } finally {
      setSaving(false);
    }
  };

  // Handle notification toggle
  const handleNotificationToggle = async (key) => {
    const updatedNotifications = {
      ...notifications,
      [key]: !notifications[key]
    };

    setNotifications(updatedNotifications);

    try {
      // Save notification preferences to Supabase
      await supabase
        .from('landlord_profiles')
        .update({
          notification_settings: updatedNotifications,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      // Revert on error
      setNotifications(notifications);
    }
  };

  // Generate API key
  const handleGenerateApiKey = async () => {
    if (!newApiKey.name.trim()) {
      alert('Please enter a name for the API key');
      return;
    }

    const apiKey = `landlord_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          user_type: 'landlord',
          name: newApiKey.name,
          key: apiKey,
          permissions: newApiKey.permissions,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
        })
        .select()
        .single();

      if (error) throw error;

      setApiKeys([...apiKeys, data]);
      setNewApiKey({ name: '', permissions: ['read'] });
      alert('✅ API key generated! Make sure to copy it now - you won\'t see it again!');
    } catch (error) {
      console.error('Error generating API key:', error);
      alert('❌ Failed to generate API key.');
    }
  };

  // Revoke API key
  const handleRevokeApiKey = async (keyId) => {
    if (!window.confirm('Are you sure you want to revoke this API key?')) return;

    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ revoked: true, revoked_at: new Date().toISOString() })
        .eq('id', keyId);

      if (error) throw error;

      setApiKeys(apiKeys.map(key => 
        key.id === keyId ? { ...key, revoked: true } : key
      ));
      alert('✅ API key revoked successfully.');
    } catch (error) {
      console.error('Error revoking API key:', error);
      alert('❌ Failed to revoke API key.');
    }
  };

  // Upload avatar
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const fileName = `${user.id}/avatar_${Date.now()}_${file.name}`;

    try {
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('landlord-avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('landlord-avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('landlord_profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar: publicUrl }));
      alert('✅ Avatar updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('❌ Failed to upload avatar.');
    }
  };

  if (loading) {
    return (
      <div className="settings-loading">
        <div className="loading-spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="landlord-settings">
      {/* Header */}
      <div className="settings-header">
        <h1>Account Settings</h1>
        <p className="subtitle">Manage your landlord account preferences and security</p>
      </div>

      <div className="settings-layout">
        {/* Sidebar Navigation */}
        <div className="settings-sidebar">
          <button 
            className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} /> Profile
          </button>
          <button 
            className={`sidebar-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Shield size={18} /> Security
          </button>
          <button 
            className={`sidebar-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={18} /> Notifications
          </button>
          <button 
            className={`sidebar-item ${activeTab === 'payment' ? 'active' : ''}`}
            onClick={() => setActiveTab('payment')}
          >
            <CreditCard size={18} /> Payment
          </button>
          <button 
            className={`sidebar-item ${activeTab === 'api' ? 'active' : ''}`}
            onClick={() => setActiveTab('api')}
          >
            <Globe size={18} /> API Access
          </button>
        </div>

        {/* Main Content */}
        <div className="settings-content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="settings-card">
              <h2><User size={20} /> Profile Information</h2>
              
              <form onSubmit={handleProfileUpdate}>
                <div className="avatar-section">
                  <div className="avatar-preview">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Avatar" />
                    ) : (
                      <div className="avatar-placeholder">
                        {profile.fullName?.charAt(0) || 'L'}
                      </div>
                    )}
                  </div>
                  <div className="avatar-upload">
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="avatar-upload" className="upload-btn">
                      <Upload size={16} /> Upload Photo
                    </label>
                    <p className="upload-hint">JPG, PNG up to 5MB</p>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <div className="readonly-input">
                      <Mail size={16} />
                      <span>{profile.email}</span>
                    </div>
                    <small className="form-hint">Contact support to change email</small>
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      placeholder="+234 800 000 0000"
                    />
                  </div>

                  <div className="form-group">
                    <label>Company Name</label>
                    <input
                      type="text"
                      value={profile.companyName}
                      onChange={(e) => setProfile({...profile, companyName: e.target.value})}
                      placeholder="Your company name (optional)"
                    />
                  </div>

                  <div className="form-group">
                    <label>Website</label>
                    <input
                      type="url"
                      value={profile.website}
                      onChange={(e) => setProfile({...profile, website: e.target.value})}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>Tax ID</label>
                    <input
                      type="text"
                      value={profile.taxId}
                      onChange={(e) => setProfile({...profile, taxId: e.target.value})}
                      placeholder="Tax identification number"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Address</label>
                    <input
                      type="text"
                      value={profile.address}
                      onChange={(e) => setProfile({...profile, address: e.target.value})}
                      placeholder="Street address"
                    />
                  </div>

                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={profile.city}
                      onChange={(e) => setProfile({...profile, city: e.target.value})}
                      placeholder="City"
                    />
                  </div>

                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      value={profile.state}
                      onChange={(e) => setProfile({...profile, state: e.target.value})}
                      placeholder="State"
                    />
                  </div>

                  <div className="form-group">
                    <label>Country</label>
                    <select
                      value={profile.country}
                      onChange={(e) => setProfile({...profile, country: e.target.value})}
                    >
                      <option value="Nigeria">Nigeria</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Kenya">Kenya</option>
                      <option value="South Africa">South Africa</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      placeholder="Tell us about yourself or your company..."
                      rows="3"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-btn" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                    <Save size={16} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="settings-card">
              <h2><Shield size={20} /> Security Settings</h2>
              
              <div className="security-section">
                <div className="security-item">
                  <div className="security-info">
                    <Lock size={20} />
                    <div>
                      <h3>Change Password</h3>
                      <p>Update your password regularly to keep your account secure</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handlePasswordChange} className="password-form">
                    <div className="form-group">
                      <label>Current Password</label>
                      <div className="password-input">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={security.currentPassword}
                          onChange={(e) => setSecurity({...security, currentPassword: e.target.value})}
                          placeholder="Enter current password"
                        />
                        <button 
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>New Password</label>
                      <div className="password-input">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={security.newPassword}
                          onChange={(e) => setSecurity({...security, newPassword: e.target.value})}
                          placeholder="At least 6 characters"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <div className="password-input">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={security.confirmPassword}
                          onChange={(e) => setSecurity({...security, confirmPassword: e.target.value})}
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>

                    <button type="submit" className="save-btn" disabled={saving}>
                      {saving ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>

                <div className="security-item">
                  <div className="security-info">
                    <Monitor size={20} />
                    <div>
                      <h3>Active Sessions</h3>
                      <p>Manage devices where you're currently logged in</p>
                    </div>
                  </div>
                  <button className="secondary-btn">
                    View Active Sessions
                  </button>
                </div>

                <div className="security-item">
                  <div className="security-info">
                    <AlertCircle size={20} />
                    <div>
                      <h3>Two-Factor Authentication</h3>
                      <p>Add an extra layer of security to your account</p>
                    </div>
                  </div>
                  <button className="secondary-btn">
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="settings-card">
              <h2><Bell size={20} /> Notification Preferences</h2>
              
              <div className="notifications-section">
                <div className="notification-category">
                  <h3>Email Notifications</h3>
                  {Object.entries(notifications)
                    .filter(([key]) => key.includes('email') || key.includes('Reports'))
                    .map(([key, value]) => (
                      <div key={key} className="notification-item">
                        <div>
                          <h4>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
                          <p>Receive notifications via email</p>
                        </div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={() => handleNotificationToggle(key)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                    ))}
                </div>

                <div className="notification-category">
                  <h3>SMS & Push Notifications</h3>
                  {Object.entries(notifications)
                    .filter(([key]) => key.includes('sms') || key.includes('push') || key.includes('Alerts'))
                    .map(([key, value]) => (
                      <div key={key} className="notification-item">
                        <div>
                          <h4>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
                          <p>Receive instant notifications</p>
                        </div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={() => handleNotificationToggle(key)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Payment Tab */}
          {activeTab === 'payment' && (
            <div className="settings-card">
              <h2><CreditCard size={20} /> Payment Settings</h2>
              
              <form onSubmit={handlePaymentUpdate}>
                <div className="payment-section">
                  <h3>Bank Account Details</h3>
                  <p className="section-description">
                    Add your bank account to receive payments from rentals and commissions
                  </p>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Bank Name *</label>
                      <select
                        value={payment.bankName}
                        onChange={(e) => setPayment({...payment, bankName: e.target.value})}
                        required
                      >
                        <option value="">Select Bank</option>
                        <option value="Access Bank">Access Bank</option>
                        <option value="First Bank">First Bank</option>
                        <option value="GTBank">GTBank</option>
                        <option value="Zenith Bank">Zenith Bank</option>
                        <option value="UBA">UBA</option>
                        <option value="Union Bank">Union Bank</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Account Name *</label>
                      <input
                        type="text"
                        value={payment.accountName}
                        onChange={(e) => setPayment({...payment, accountName: e.target.value})}
                        placeholder="Name as it appears on account"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Account Number *</label>
                      <input
                        type="text"
                        value={payment.accountNumber}
                        onChange={(e) => setPayment({...payment, accountNumber: e.target.value})}
                        placeholder="10-digit account number"
                        required
                        maxLength="10"
                      />
                    </div>

                    <div className="form-group">
                      <label>Payout Schedule</label>
                      <select
                        value={payment.payoutSchedule}
                        onChange={(e) => setPayment({...payment, payoutSchedule: e.target.value})}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="bi-weekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>

                  <div className="payment-preview">
                    <div className="preview-card">
                      <div className="preview-header">
                        <Building size={20} />
                        <span>Payment Preview</span>
                      </div>
                      <div className="preview-details">
                        <div className="preview-item">
                          <span>Bank:</span>
                          <strong>{payment.bankName || 'Not set'}</strong>
                        </div>
                        <div className="preview-item">
                          <span>Account:</span>
                          <strong>{payment.accountNumber || 'Not set'}</strong>
                        </div>
                        <div className="preview-item">
                          <span>Payouts:</span>
                          <strong>{payment.payoutSchedule}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="save-btn" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Payment Settings'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* API Access Tab */}
          {activeTab === 'api' && (
            <div className="settings-card">
              <h2><Globe size={20} /> API Access</h2>
              
              <div className="api-section">
                <div className="api-info">
                  <h3>API Keys</h3>
                  <p>Generate API keys to integrate with our services</p>
                </div>

                <div className="api-key-form">
                  <div className="form-group">
                    <label>Key Name</label>
                    <input
                      type="text"
                      value={newApiKey.name}
                      onChange={(e) => setNewApiKey({...newApiKey, name: e.target.value})}
                      placeholder="e.g., Production API, Development API"
                    />
                  </div>

                  <div className="form-group">
                    <label>Permissions</label>
                    <div className="permissions-select">
                      {['read', 'write', 'delete'].map(perm => (
                        <label key={perm} className="permission-checkbox">
                          <input
                            type="checkbox"
                            checked={newApiKey.permissions.includes(perm)}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...newApiKey.permissions, perm]
                                : newApiKey.permissions.filter(p => p !== perm);
                              setNewApiKey({...newApiKey, permissions: updated});
                            }}
                          />
                          <span>{perm.charAt(0).toUpperCase() + perm.slice(1)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button onClick={handleGenerateApiKey} className="generate-btn">
                    <RefreshCw size={16} /> Generate API Key
                  </button>
                </div>

                {apiKeys.length > 0 && (
                  <div className="api-keys-list">
                    <h4>Active API Keys</h4>
                    {apiKeys.map(apiKey => (
                      <div key={apiKey.id} className={`api-key-item ${apiKey.revoked ? 'revoked' : ''}`}>
                        <div className="api-key-info">
                          <h5>{apiKey.name}</h5>
                          <div className="api-key-meta">
                            <span>Created: {new Date(apiKey.created_at).toLocaleDateString()}</span>
                            <span>Expires: {new Date(apiKey.expires_at).toLocaleDateString()}</span>
                            <span className="permissions-badge">
                              {apiKey.permissions.join(', ')}
                            </span>
                            {apiKey.revoked && <span className="revoked-badge">Revoked</span>}
                          </div>
                        </div>
                        <div className="api-key-actions">
                          {!apiKey.revoked && (
                            <>
                              <button className="copy-btn" onClick={() => navigator.clipboard.writeText(apiKey.key)}>
                                <Copy size={14} /> Copy
                              </button>
                              <button 
                                className="revoke-btn"
                                onClick={() => handleRevokeApiKey(apiKey.id)}
                              >
                                <Trash2 size={14} /> Revoke
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandlordSettings;