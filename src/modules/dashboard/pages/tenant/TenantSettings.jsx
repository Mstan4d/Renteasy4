import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import './TenantSettings.css';

const TenantSettings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [userMeta, setUserMeta] = useState({
    memberSince: null,
    trustScore: 85,
    verified: false
  });

  // Initial settings with all possible fields
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsAlerts: false,
      rentalAlerts: true,
      maintenanceUpdates: true,
      paymentReminders: true
    },
    privacy: {
      profileVisibility: 'verified_users',
      showContactInfo: 'after_verification',
      showRentalHistory: 'verified_only',
      dataSharing: {
        analytics: true,
        marketing: false,
        thirdParty: false
      }
    },
    security: {
      twoFactorAuth: false,
      loginAlerts: true,
      deviceManagement: false
    },
    communication: {
      language: 'en',
      timezone: 'Africa/Lagos'
    }
  });

  // Load settings from Supabase on mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('settings, created_at, trust_score, verification_status')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading settings:', error);
        return;
      }

      if (data?.settings) {
        // Merge loaded settings with defaults to ensure all fields exist
        setSettings(prev => ({
          ...prev,
          ...data.settings,
          notifications: { ...prev.notifications, ...data.settings.notifications },
          privacy: {
            ...prev.privacy,
            ...data.settings.privacy,
            dataSharing: { ...prev.privacy.dataSharing, ...data.settings.privacy?.dataSharing }
          },
          security: { ...prev.security, ...data.settings.security },
          communication: { ...prev.communication, ...data.settings.communication }
        }));
      }

      // Set user meta for account stats
      setUserMeta({
        memberSince: data?.created_at || null,
        trustScore: data?.trust_score || 85,
        verified: data?.verification_status === 'verified'
      });
    };

    fetchSettings();
  }, [user]);

  // Save settings to Supabase
  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ settings })
        .eq('id', user.id);

      if (error) throw error;
      alert('Settings saved successfully!');
    } catch (err) {
      alert('Error saving: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value }
    }));
  };

  const handleNestedChange = (section, parent, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parent]: {
          ...prev[section][parent],
          [key]: value
        }
      }
    }));
  };

  const handlePasswordChange = async () => {
    if (password.new !== password.confirm) {
      alert('New passwords do not match!');
      return;
    }
    if (password.new.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: password.new });
    if (error) {
      alert('Password update failed: ' + error.message);
    } else {
      alert('Password changed successfully!');
      setPassword({ current: '', new: '', confirm: '' });
    }
  };

  const handleDeleteAccount = async () => {
    // In a real app, you would call a secure edge function or admin API to delete the user.
    // For demonstration, we just log out.
    // const { error } = await supabase.rpc('delete_user'); // you would need a custom RPC
    // if (error) {
    //   alert('Deletion failed: ' + error.message);
    // } else {
    //   logout();
    //   navigate('/');
    // }
    logout();
    navigate('/');
  };

  const exportData = () => {
    const data = {
      userInfo: user,
      settings,
      timestamp: new Date().toISOString()
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `renteasy-data-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="tenant-settings">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account preferences and security settings</p>
      </div>

      <div className="settings-container">
        {/* Settings Sidebar */}
        <div className="settings-sidebar">
          <button
            className={`sidebar-btn ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            👤 Account
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            🔔 Notifications
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            🔒 Privacy
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            🛡️ Security
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'communication' ? 'active' : ''}`}
            onClick={() => setActiveTab('communication')}
          >
            💬 Communication
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            ⚙️ Preferences
          </button>
        </div>

        {/* Settings Content */}
        <div className="settings-content">
          {/* Account Settings */}
          {activeTab === 'account' && (
            <div className="settings-section">
              <h2>Account Settings</h2>

              <div className="account-info-card">
                <div className="account-header">
                  <div className="user-avatar-large">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="user-info">
                    <h3>{user?.name || 'User'}</h3>
                    <p>{user?.email || 'user@example.com'}</p>
                    <span className="user-role">{user?.role || 'Tenant'}</span>
                  </div>
                </div>

                <div className="account-stats">
                  <div className="stat-item">
                    <span className="stat-label">Member Since</span>
                    <span className="stat-value">
                      {userMeta.memberSince
                        ? new Date(userMeta.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Trust Score</span>
                    <span className={`stat-value ${userMeta.trustScore >= 70 ? 'score-high' : 'score-low'}`}>
                      {userMeta.trustScore}/100
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Verification</span>
                    <span className={`stat-value ${userMeta.verified ? 'verified' : 'unverified'}`}>
                      {userMeta.verified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Change Password */}
              <div className="password-section">
                <h3>Change Password</h3>
                <div className="password-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={password.current}
                      onChange={(e) => setPassword({ ...password, current: e.target.value })}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={password.new}
                      onChange={(e) => setPassword({ ...password, new: e.target.value })}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={password.confirm}
                      onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={handlePasswordChange}
                    disabled={!password.current || !password.new || !password.confirm}
                  >
                    Update Password
                  </button>
                </div>
              </div>

              {/* Account Actions */}
              <div className="account-actions">
                <h3>Account Actions</h3>
                <div className="actions-grid">
                  <button className="btn-action export" onClick={exportData}>
                    <span className="action-icon">📥</span>
                    <span className="action-label">Export Data</span>
                  </button>
                  <button className="btn-action deactivate">
                    <span className="action-icon">⏸️</span>
                    <span className="action-label">Deactivate Account</span>
                  </button>
                  <button
                    className="btn-action delete"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <span className="action-icon">🗑️</span>
                    <span className="action-label">Delete Account</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Settings</h2>

              <div className="notifications-list">
                <div className="notification-category">
                  <h4>Email Notifications</h4>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) =>
                        handleSettingChange('notifications', 'emailNotifications', e.target.checked)
                      }
                    />
                    <span>Receive email notifications</span>
                  </label>
                </div>

                <div className="notification-category">
                  <h4>Push Notifications</h4>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.pushNotifications}
                      onChange={(e) =>
                        handleSettingChange('notifications', 'pushNotifications', e.target.checked)
                      }
                    />
                    <span>Receive push notifications</span>
                  </label>
                </div>

                <div className="notification-category">
                  <h4>SMS Alerts</h4>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.smsAlerts}
                      onChange={(e) => handleSettingChange('notifications', 'smsAlerts', e.target.checked)}
                    />
                    <span>Receive SMS alerts</span>
                  </label>
                </div>

                <div className="notification-category">
                  <h4>Rental Alerts</h4>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.rentalAlerts}
                      onChange={(e) =>
                        handleSettingChange('notifications', 'rentalAlerts', e.target.checked)
                      }
                    />
                    <span>New rental opportunities</span>
                  </label>
                </div>

                <div className="notification-category">
                  <h4>Maintenance Updates</h4>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.maintenanceUpdates}
                      onChange={(e) =>
                        handleSettingChange('notifications', 'maintenanceUpdates', e.target.checked)
                      }
                    />
                    <span>Maintenance request updates</span>
                  </label>
                </div>

                <div className="notification-category">
                  <h4>Payment Reminders</h4>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.paymentReminders}
                      onChange={(e) =>
                        handleSettingChange('notifications', 'paymentReminders', e.target.checked)
                      }
                    />
                    <span>Payment due reminders</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <div className="settings-section">
              <h2>Privacy Settings</h2>

              <div className="privacy-settings">
                <div className="privacy-category">
                  <h4>Profile Visibility</h4>
                  <select
                    value={settings.privacy.profileVisibility}
                    onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                  >
                    <option value="public">Everyone</option>
                    <option value="verified_users">Verified Users Only</option>
                    <option value="landlords_only">Landlords Only</option>
                    <option value="private">Private (Only Me)</option>
                  </select>
                </div>

                <div className="privacy-category">
                  <h4>Contact Information</h4>
                  <select
                    value={settings.privacy.showContactInfo}
                    onChange={(e) => handleSettingChange('privacy', 'showContactInfo', e.target.value)}
                  >
                    <option value="always">Always Show</option>
                    <option value="after_verification">After Mutual Verification</option>
                    <option value="after_agreement">After Rental Agreement</option>
                    <option value="never">Never Show</option>
                  </select>
                </div>

                <div className="privacy-category">
                  <h4>Rental History</h4>
                  <select
                    value={settings.privacy.showRentalHistory}
                    onChange={(e) => handleSettingChange('privacy', 'showRentalHistory', e.target.value)}
                  >
                    <option value="full">Show Full History</option>
                    <option value="summary_only">Summary Only</option>
                    <option value="verified_only">Verified Landlords Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div className="privacy-category">
                  <h4>Data Sharing Preferences</h4>
                  <div className="data-sharing">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.privacy.dataSharing.analytics}
                        onChange={(e) =>
                          handleNestedChange('privacy', 'dataSharing', 'analytics', e.target.checked)
                        }
                      />
                      <span>Allow analytics data collection</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.privacy.dataSharing.marketing}
                        onChange={(e) =>
                          handleNestedChange('privacy', 'dataSharing', 'marketing', e.target.checked)
                        }
                      />
                      <span>Receive marketing communications</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.privacy.dataSharing.thirdParty}
                        onChange={(e) =>
                          handleNestedChange('privacy', 'dataSharing', 'thirdParty', e.target.checked)
                        }
                      />
                      <span>Share data with trusted partners</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security Settings</h2>

              <div className="security-settings">
                <div className="security-item">
                  <div className="security-info">
                    <h4>Two-Factor Authentication</h4>
                    <p>Add an extra layer of security to your account</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="security-item">
                  <div className="security-info">
                    <h4>Login Alerts</h4>
                    <p>Get notified of new logins to your account</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.security.loginAlerts}
                      onChange={(e) => handleSettingChange('security', 'loginAlerts', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="security-item">
                  <div className="security-info">
                    <h4>Device Management</h4>
                    <p>View and manage devices logged into your account</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.security.deviceManagement}
                      onChange={(e) => handleSettingChange('security', 'deviceManagement', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="security-actions">
                  <button className="btn btn-outline">View Login History</button>
                  <button className="btn btn-outline">Manage Devices</button>
                  <button className="btn btn-outline">Change Security Questions</button>
                </div>
              </div>
            </div>
          )}

          {/* Communication & Preferences tabs can be added similarly */}

          {/* Save Button for all tabs */}
          <div className="settings-actions">
            <button
              className="btn btn-primary"
              onClick={saveSettings}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="delete-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Account</h3>
              <button className="close-modal" onClick={() => setShowDeleteModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="warning-icon">⚠️</div>
              <h4>Are you sure you want to delete your account?</h4>
              <p>This action cannot be undone. All your data will be permanently deleted, including:</p>
              <ul className="delete-list">
                <li>Your profile information</li>
                <li>Rental history</li>
                <li>Payment records</li>
                <li>Saved properties</li>
                <li>All uploaded documents</li>
              </ul>

              <div className="modal-actions">
                <button className="btn btn-danger" onClick={handleDeleteAccount}>
                  Delete Account
                </button>
                <button className="btn btn-outline" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantSettings;