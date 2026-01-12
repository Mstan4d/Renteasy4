// src/modules/providers/pages/ProviderSettings.jsx
import React, { useState } from 'react';
import { 
  Save, Bell, Shield, User, Globe,
  Moon, Eye, EyeOff, Smartphone,
  MapPin, Calendar, CreditCard, Key,
  Trash2, LogOut, CheckCircle, AlertCircle
} from 'lucide-react';

const ProviderSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+2348012345678',
    businessName: 'CleanPro Services',
    businessType: 'cleaning',
    description: 'Professional cleaning services with 5 years experience',
    website: 'https://cleanpro.com',
    location: 'Lagos, Nigeria',
    serviceAreas: ['Lagos Island', 'Victoria Island', 'Ikoyi']
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    bookingAlerts: true,
    paymentAlerts: true,
    marketingEmails: false,
    weeklyReports: true
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'privacy', label: 'Privacy', icon: <Eye size={18} /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard size={18} /> },
    { id: 'appearance', label: 'Appearance', icon: <Moon size={18} /> }
  ];

  const styles = {
    container: {
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      marginBottom: '2rem'
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '1rem'
    },
    layout: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '2rem'
    },
    '@media (min-width: 768px)': {
      layout: {
        gridTemplateColumns: '250px 1fr'
      }
    },
    sidebar: {
      background: 'white',
      borderRadius: '1rem',
      border: '1px solid #e5e7eb',
      padding: '1rem',
      height: 'fit-content'
    },
    tabList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    tab: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      border: 'none',
      background: 'transparent',
      color: '#6b7280',
      fontWeight: '500',
      cursor: 'pointer',
      borderRadius: '0.5rem',
      textAlign: 'left',
      transition: 'all 0.2s'
    },
    activeTab: {
      background: '#eff6ff',
      color: '#2563eb'
    },
    content: {
      background: 'white',
      borderRadius: '1rem',
      border: '1px solid #e5e7eb',
      padding: '2rem'
    },
    contentHeader: {
      marginBottom: '2rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid #e5e7eb'
    },
    contentTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '0.5rem'
    },
    contentDescription: {
      color: '#6b7280',
      fontSize: '0.875rem'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1.5rem'
    },
    '@media (min-width: 640px)': {
      formGrid: {
        gridTemplateColumns: 'repeat(2, 1fr)'
      }
    },
    formGroup: {
      marginBottom: '1rem'
    },
    formLabel: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    formInput: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      color: '#374151',
      transition: 'border-color 0.2s'
    },
    formTextarea: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      color: '#374151',
      minHeight: '100px',
      resize: 'vertical'
    },
    formSelect: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      color: '#374151',
      background: 'white'
    },
    passwordInput: {
      position: 'relative'
    },
    passwordToggle: {
      position: 'absolute',
      right: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      color: '#9ca3af',
      cursor: 'pointer'
    },
    checkboxGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '1rem'
    },
    checkbox: {
      width: '1.25rem',
      height: '1.25rem',
      borderRadius: '0.25rem',
      border: '2px solid #d1d5db',
      cursor: 'pointer'
    },
    checkboxLabel: {
      fontSize: '0.875rem',
      color: '#374151',
      cursor: 'pointer'
    },
    serviceAreas: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      marginTop: '0.5rem'
    },
    serviceTag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.375rem 0.75rem',
      background: '#f3f4f6',
      color: '#374151',
      borderRadius: '9999px',
      fontSize: '0.875rem'
    },
    removeTag: {
      background: 'none',
      border: 'none',
      color: '#9ca3af',
      cursor: 'pointer',
      padding: '0'
    },
    addTagInput: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '0.5rem'
    },
    tagInput: {
      flex: 1,
      padding: '0.5rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '0.875rem'
    },
    addTagButton: {
      padding: '0.5rem 1rem',
      background: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      cursor: 'pointer'
    },
    dangerZone: {
      marginTop: '3rem',
      padding: '1.5rem',
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '0.75rem'
    },
    dangerTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#dc2626',
      marginBottom: '1rem'
    },
    dangerButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      background: '#dc2626',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    saveButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 2rem',
      background: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '2rem'
    },
    appearanceOptions: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem'
    },
    themeOption: {
      padding: '1.5rem',
      border: '2px solid #e5e7eb',
      borderRadius: '0.75rem',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.3s'
    },
    selectedTheme: {
      borderColor: '#2563eb',
      background: '#eff6ff'
    },
    themeIcon: {
      fontSize: '2rem',
      marginBottom: '0.5rem'
    },
    themeName: {
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '0.25rem'
    },
    themeDescription: {
      fontSize: '0.875rem',
      color: '#6b7280'
    }
  };

  const handleSave = () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
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

  const renderContent = () => {
    switch(activeTab) {
      case 'profile':
        return (
          <div>
            <div style={styles.contentHeader}>
              <h2 style={styles.contentTitle}>Profile Settings</h2>
              <p style={styles.contentDescription}>
                Manage your personal and business information
              </p>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Full Name *</label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                  style={styles.formInput}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Email Address *</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  style={styles.formInput}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Phone Number *</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  style={styles.formInput}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Business Name *</label>
                <input
                  type="text"
                  value={profileData.businessName}
                  onChange={(e) => setProfileData({...profileData, businessName: e.target.value})}
                  style={styles.formInput}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Business Type</label>
                <select
                  value={profileData.businessType}
                  onChange={(e) => setProfileData({...profileData, businessType: e.target.value})}
                  style={styles.formSelect}
                >
                  <option value="cleaning">Cleaning Services</option>
                  <option value="painting">Painting</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="security">Security</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Website</label>
                <input
                  type="url"
                  value={profileData.website}
                  onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                  placeholder="https://example.com"
                  style={styles.formInput}
                />
              </div>

              <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
                <label style={styles.formLabel}>Business Description</label>
                <textarea
                  value={profileData.description}
                  onChange={(e) => setProfileData({...profileData, description: e.target.value})}
                  style={styles.formTextarea}
                />
              </div>

              <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
                <label style={styles.formLabel}>Service Areas</label>
                <div style={styles.serviceAreas}>
                  {profileData.serviceAreas.map((area, index) => (
                    <span key={index} style={styles.serviceTag}>
                      {area}
                      <button
                        onClick={() => handleRemoveServiceArea(area)}
                        style={styles.removeTag}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div style={styles.addTagInput}>
                  <input
                    type="text"
                    placeholder="Add new service area"
                    style={styles.tagInput}
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
                    style={styles.addTagButton}
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
            <div style={styles.contentHeader}>
              <h2 style={styles.contentTitle}>Notification Settings</h2>
              <p style={styles.contentDescription}>
                Choose what notifications you want to receive
              </p>
            </div>

            <div style={styles.formGrid}>
              {Object.entries(notificationSettings).map(([key, value]) => (
                <div key={key} style={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id={key}
                    checked={value}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      [key]: e.target.checked
                    })}
                    style={styles.checkbox}
                  />
                  <label htmlFor={key} style={styles.checkboxLabel}>
                    {key.split(/(?=[A-Z])/).join(' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'security':
        return (
          <div>
            <div style={styles.contentHeader}>
              <h2 style={styles.contentTitle}>Security Settings</h2>
              <p style={styles.contentDescription}>
                Manage your password and security preferences
              </p>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Current Password</label>
                <div style={styles.passwordInput}>
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={securityData.currentPassword}
                    onChange={(e) => setSecurityData({
                      ...securityData,
                      currentPassword: e.target.value
                    })}
                    style={styles.formInput}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    style={styles.passwordToggle}
                  >
                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>New Password</label>
                <div style={styles.passwordInput}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData({
                      ...securityData,
                      newPassword: e.target.value
                    })}
                    style={styles.formInput}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={styles.passwordToggle}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Confirm New Password</label>
                <div style={styles.passwordInput}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({
                      ...securityData,
                      confirmPassword: e.target.value
                    })}
                    style={styles.formInput}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.passwordToggle}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
                <div style={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="twoFactor"
                    checked={securityData.twoFactorEnabled}
                    onChange={(e) => setSecurityData({
                      ...securityData,
                      twoFactorEnabled: e.target.checked
                    })}
                    style={styles.checkbox}
                  />
                  <label htmlFor="twoFactor" style={styles.checkboxLabel}>
                    Enable Two-Factor Authentication
                  </label>
                </div>
                <p style={{fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem'}}>
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div>
            <div style={styles.contentHeader}>
              <h2 style={styles.contentTitle}>Appearance</h2>
              <p style={styles.contentDescription}>
                Customize how RentEasy looks to you
              </p>
            </div>

            <div style={styles.appearanceOptions}>
              {[
                {
                  id: 'light',
                  name: 'Light Mode',
                  description: 'Default light theme',
                  icon: '☀️'
                },
                {
                  id: 'dark',
                  name: 'Dark Mode',
                  description: 'Dark theme for low light',
                  icon: '🌙'
                },
                {
                  id: 'auto',
                  name: 'Auto',
                  description: 'Follow system preference',
                  icon: '⚙️'
                }
              ].map((theme) => (
                <div
                  key={theme.id}
                  style={{
                    ...styles.themeOption,
                    ...(theme.id === 'light' ? styles.selectedTheme : {})
                  }}
                  onClick={() => alert(`Switched to ${theme.name}`)}
                >
                  <div style={styles.themeIcon}>{theme.icon}</div>
                  <div style={styles.themeName}>{theme.name}</div>
                  <div style={styles.themeDescription}>{theme.description}</div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div>
            <div style={styles.contentHeader}>
              <h2 style={styles.contentTitle}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
              <p style={styles.contentDescription}>
                Settings for this section will be available soon
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Settings</h1>
        <p style={styles.subtitle}>Manage your account preferences and settings</p>
      </div>

      {/* Layout */}
      <div style={styles.layout}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.tabList}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...styles.tab,
                  ...(activeTab === tab.id ? styles.activeTab : {})
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {renderContent()}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={styles.saveButton}
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          {/* Danger Zone */}
          {activeTab === 'profile' && (
            <div style={styles.dangerZone}>
              <h3 style={styles.dangerTitle}>Danger Zone</h3>
              <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                      alert('Account deletion requested. Our team will contact you shortly.');
                    }
                  }}
                  style={styles.dangerButton}
                >
                  <Trash2 size={18} />
                  Delete Account
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to logout?')) {
                      alert('Logged out successfully');
                    }
                  }}
                  style={{
                    ...styles.dangerButton,
                    background: '#374151'
                  }}
                >
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