// src/modules/providers/pages/ProviderSettings.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import {
  Save, Bell, Shield, User, Globe,
  Moon, Eye, EyeOff, Smartphone,
  MapPin, Calendar, CreditCard, Key,
  Trash2, LogOut, CheckCircle, AlertCircle
} from 'lucide-react';
import './ProviderSettings.css';

const ProviderSettings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile data
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: '',
    description: '',
    website: '',
    location: '',
    serviceAreas: []
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    bookingAlerts: true,
    paymentAlerts: true,
    marketingEmails: false,
    weeklyReports: true
  });

  // Security data (password change)
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });

  // Appearance
  const [appearance, setAppearance] = useState({
    theme: 'light'
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'privacy', label: 'Privacy', icon: <Eye size={18} /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard size={18} /> },
    { id: 'appearance', label: 'Appearance', icon: <Moon size={18} /> }
  ];

  // Fetch user profile data on mount
  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    } else {
      navigate('/login');
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
        setProfileData({
          fullName: data.full_name || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          businessName: data.business_name || '',
          businessType: data.business_type || '',
          description: data.description || '',
          website: data.website || '',
          location: data.location || '',
          serviceAreas: data.service_areas || []
        });
        setNotificationSettings(data.notification_settings || notificationSettings);
        setAppearance(data.appearance_settings || { theme: 'light' });
        // Two-factor status might come from auth meta, but we'll keep it local for now
        setSecurityData(prev => ({ ...prev, twoFactorEnabled: false })); // placeholder
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = {
        full_name: profileData.fullName,
        phone: profileData.phone,
        business_name: profileData.businessName,
        business_type: profileData.businessType,
        description: profileData.description,
        website: profileData.website,
        location: profileData.location,
        service_areas: profileData.serviceAreas,
        notification_settings: notificationSettings,
        appearance_settings: appearance,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Handle password change if fields are filled
      if (securityData.currentPassword && securityData.newPassword && securityData.confirmPassword) {
        if (securityData.newPassword !== securityData.confirmPassword) {
          alert('New passwords do not match');
          return;
        }
        // Update password via Supabase Auth
        const { error: authError } = await supabase.auth.updateUser({
          password: securityData.newPassword
        });
        if (authError) throw authError;
        // Clear password fields
        setSecurityData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          twoFactorEnabled: securityData.twoFactorEnabled
        });
      }

      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddServiceArea = (area) => {
    if (area.trim() && !profileData.serviceAreas.includes(area.trim())) {
      setProfileData({
        ...profileData,
        serviceAreas: [...profileData.serviceAreas, area.trim()]
      });
    }
  };

  const handleRemoveServiceArea = (area) => {
    setProfileData({
      ...profileData,
      serviceAreas: profileData.serviceAreas.filter(a => a !== area)
    });
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/login');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Implement account deletion (requires admin or separate flow)
      alert('Account deletion is not available in demo. Please contact support.');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div>
            <div className="content-header">
              <h2 className="content-title">Profile Settings</h2>
              <p className="content-description">
                Manage your personal and business information
              </p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Business Name *</label>
                <input
                  type="text"
                  value={profileData.businessName}
                  onChange={(e) => setProfileData({ ...profileData, businessName: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Business Type</label>
                <select
                  value={profileData.businessType}
                  onChange={(e) => setProfileData({ ...profileData, businessType: e.target.value })}
                  className="form-select"
                >
                  <option value="">Select type</option>
                  <option value="cleaning">Cleaning Services</option>
                  <option value="painting">Painting</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="security">Security</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Website</label>
                <input
                  type="url"
                  value={profileData.website}
                  onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                  placeholder="https://example.com"
                  className="form-input"
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Business Description</label>
                <textarea
                  value={profileData.description}
                  onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                  className="form-textarea"
                  rows="4"
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Service Areas</label>
                <div className="service-areas">
                  {profileData.serviceAreas.map((area, index) => (
                    <span key={index} className="service-tag">
                      {area}
                      <button
                        onClick={() => handleRemoveServiceArea(area)}
                        className="remove-tag"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="add-tag-input">
                  <input
                    type="text"
                    placeholder="Add new service area"
                    className="tag-input"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddServiceArea(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.target.previousSibling;
                      handleAddServiceArea(input.value);
                      input.value = '';
                    }}
                    className="add-tag-button"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div>
            <div className="content-header">
              <h2 className="content-title">Notification Settings</h2>
              <p className="content-description">
                Choose what notifications you want to receive
              </p>
            </div>

            <div className="form-grid">
              {Object.entries(notificationSettings).map(([key, value]) => (
                <div key={key} className="checkbox-group">
                  <input
                    type="checkbox"
                    id={key}
                    checked={value}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        [key]: e.target.checked
                      })
                    }
                    className="checkbox"
                  />
                  <label htmlFor={key} className="checkbox-label">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'security':
        return (
          <div>
            <div className="content-header">
              <h2 className="content-title">Security Settings</h2>
              <p className="content-description">
                Manage your password and security preferences
              </p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <div className="password-input">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={securityData.currentPassword}
                    onChange={(e) =>
                      setSecurityData({ ...securityData, currentPassword: e.target.value })
                    }
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="password-toggle"
                  >
                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="password-input">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={securityData.newPassword}
                    onChange={(e) =>
                      setSecurityData({ ...securityData, newPassword: e.target.value })
                    }
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="password-toggle"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div className="password-input">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={securityData.confirmPassword}
                    onChange={(e) =>
                      setSecurityData({ ...securityData, confirmPassword: e.target.value })
                    }
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group full-width">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="twoFactor"
                    checked={securityData.twoFactorEnabled}
                    onChange={(e) =>
                      setSecurityData({ ...securityData, twoFactorEnabled: e.target.checked })
                    }
                    className="checkbox"
                  />
                  <label htmlFor="twoFactor" className="checkbox-label">
                    Enable Two-Factor Authentication
                  </label>
                </div>
                <p className="help-text">
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div>
            <div className="content-header">
              <h2 className="content-title">Appearance</h2>
              <p className="content-description">
                Customize how RentEasy looks to you
              </p>
            </div>

            <div className="appearance-options">
              {[
                { id: 'light', name: 'Light Mode', description: 'Default light theme', icon: '☀️' },
                { id: 'dark', name: 'Dark Mode', description: 'Dark theme for low light', icon: '🌙' },
                { id: 'auto', name: 'Auto', description: 'Follow system preference', icon: '⚙️' }
              ].map((theme) => (
                <div
                  key={theme.id}
                  className={`theme-option ${appearance.theme === theme.id ? 'selected' : ''}`}
                  onClick={() => setAppearance({ ...appearance, theme: theme.id })}
                >
                  <div className="theme-icon">{theme.icon}</div>
                  <div className="theme-name">{theme.name}</div>
                  <div className="theme-description">{theme.description}</div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div>
            <div className="content-header">
              <h2 className="content-title">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
              <p className="content-description">
                Settings for this section will be available soon
              </p>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return <div className="loading">Loading settings...</div>;
  }

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Manage your account preferences and settings</p>
      </div>

      {/* Layout */}
      <div className="settings-layout">
        {/* Sidebar */}
        <div className="settings-sidebar">
          <div className="tab-list">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="settings-content">
          {renderContent()}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="save-button"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          {/* Danger Zone */}
          {activeTab === 'profile' && (
            <div className="danger-zone">
              <h3 className="danger-title">Danger Zone</h3>
              <div className="danger-actions">
                <button onClick={handleDeleteAccount} className="danger-button delete">
                  <Trash2 size={18} />
                  Delete Account
                </button>
                <button onClick={handleLogout} className="danger-button logout">
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderSettings;