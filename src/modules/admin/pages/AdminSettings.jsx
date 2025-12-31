// src/modules/admin/pages/AdminSettings.jsx
import React, { useState, useEffect } from 'react';
import {
  Settings, Save, Shield, Bell, Globe, CreditCard,
  User, Lock, Mail, Database, Cloud, Key,
  AlertTriangle, CheckCircle, XCircle, RefreshCw,
  Upload, Download, Eye, EyeOff, Trash2
} from 'lucide-react';
import './AdminSettings.css';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      siteName: 'RentEasy',
      siteUrl: 'https://renteasy.com',
      adminEmail: 'admin@renteasy.com',
      supportEmail: 'support@renteasy.com',
      timezone: 'Africa/Lagos',
      dateFormat: 'DD/MM/YYYY',
      currency: 'NGN',
      maintenanceMode: false
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      ipWhitelist: [],
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      }
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      adminAlerts: true,
      userAlerts: true,
      reportAlerts: true,
      transactionAlerts: true
    },
    payment: {
      commissionRate: 7.5,
      paymentMethods: ['card', 'bank_transfer', 'wallet'],
      autoApprovePayments: false,
      paymentTimeout: 24,
      currencyConversion: true
    },
    api: {
      apiKey: 'sk_live_***********',
      webhookUrl: 'https://api.renteasy.com/webhook',
      rateLimit: 100,
      enableDocs: true,
      corsOrigins: ['https://renteasy.com']
    },
    advanced: {
      cacheEnabled: true,
      logLevel: 'info',
      backupFrequency: 'daily',
      autoUpdate: true,
      debugMode: false
    }
  });

  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [backups, setBackups] = useState([]);

  useEffect(() => {
    loadSettings();
    loadBackups();
  }, []);

  const loadSettings = () => {
    try {
      const savedSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
      if (Object.keys(savedSettings).length > 0) {
        setSettings(prev => ({
          ...prev,
          ...savedSettings
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadBackups = () => {
    // Load backup history
    const backupData = [
      { id: 1, date: '2024-01-15', size: '45.2 MB', type: 'auto', status: 'success' },
      { id: 2, date: '2024-01-14', size: '44.8 MB', type: 'manual', status: 'success' },
      { id: 3, date: '2024-01-13', size: '44.5 MB', type: 'auto', status: 'success' },
      { id: 4, date: '2024-01-12', size: '44.1 MB', type: 'auto', status: 'failed' }
    ];
    setBackups(backupData);
  };

  const saveSettings = () => {
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      setSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedChange = (section, parent, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parent]: {
          ...prev[section][parent],
          [field]: value
        }
      }
    }));
  };

  const handleArrayChange = (section, field, value) => {
    const currentValues = settings[section][field];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    handleInputChange(section, field, newValues);
  };

  const createBackup = () => {
    const newBackup = {
      id: backups.length + 1,
      date: new Date().toISOString().split('T')[0],
      size: `${(Math.random() * 2 + 44).toFixed(1)} MB`,
      type: 'manual',
      status: 'success'
    };
    
    setBackups([newBackup, ...backups]);
    alert('Backup created successfully!');
  };

  const restoreBackup = (backupId) => {
    if (window.confirm('Are you sure you want to restore this backup? This will overwrite current settings.')) {
      alert(`Restoring backup ${backupId}...`);
      // In real app, implement restore logic
    }
  };

  const deleteBackup = (backupId) => {
    if (window.confirm('Are you sure you want to delete this backup?')) {
      setBackups(backups.filter(b => b.id !== backupId));
    }
  };

  const resetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      localStorage.removeItem('adminSettings');
      window.location.reload();
    }
  };

  const generateApiKey = () => {
    const newApiKey = `sk_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    handleInputChange('api', 'apiKey', newApiKey);
    alert('New API key generated!');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <Settings size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'payment', label: 'Payment', icon: <CreditCard size={18} /> },
    { id: 'api', label: 'API', icon: <Key size={18} /> },
    { id: 'advanced', label: 'Advanced', icon: <Database size={18} /> }
  ];

  return (
    <div className="admin-settings">
      <div className="settings-header">
        <h1><Settings size={28} /> System Settings</h1>
        <p>Configure platform settings and preferences</p>
      </div>

      <div className="settings-container">
        {/* Sidebar Tabs */}
        <div className="settings-sidebar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
          
          <div className="sidebar-actions">
            <button 
              className="btn-save"
              onClick={saveSettings}
              disabled={saving}
            >
              {saving ? (
                <>
                  <RefreshCw size={16} className="spinning" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Settings
                </>
              )}
            </button>
            
            <button 
              className="btn-reset"
              onClick={resetSettings}
            >
              Reset to Defaults
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="settings-content">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="settings-section">
              <h3><Globe size={20} /> General Settings</h3>
              
              <div className="settings-grid">
                <div className="setting-item">
                  <label>Site Name</label>
                  <input
                    type="text"
                    value={settings.general.siteName}
                    onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                    className="setting-input"
                  />
                </div>
                
                <div className="setting-item">
                  <label>Site URL</label>
                  <input
                    type="url"
                    value={settings.general.siteUrl}
                    onChange={(e) => handleInputChange('general', 'siteUrl', e.target.value)}
                    className="setting-input"
                  />
                </div>
                
                <div className="setting-item">
                  <label>Admin Email</label>
                  <input
                    type="email"
                    value={settings.general.adminEmail}
                    onChange={(e) => handleInputChange('general', 'adminEmail', e.target.value)}
                    className="setting-input"
                  />
                </div>
                
                <div className="setting-item">
                  <label>Support Email</label>
                  <input
                    type="email"
                    value={settings.general.supportEmail}
                    onChange={(e) => handleInputChange('general', 'supportEmail', e.target.value)}
                    className="setting-input"
                  />
                </div>
                
                <div className="setting-item">
                  <label>Timezone</label>
                  <select
                    value={settings.general.timezone}
                    onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
                    className="setting-select"
                  >
                    <option value="Africa/Lagos">Africa/Lagos (GMT+1)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York (GMT-5)</option>
                    <option value="Europe/London">Europe/London (GMT+0)</option>
                  </select>
                </div>
                
                <div className="setting-item">
                  <label>Date Format</label>
                  <select
                    value={settings.general.dateFormat}
                    onChange={(e) => handleInputChange('general', 'dateFormat', e.target.value)}
                    className="setting-select"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                
                <div className="setting-item">
                  <label>Currency</label>
                  <select
                    value={settings.general.currency}
                    onChange={(e) => handleInputChange('general', 'currency', e.target.value)}
                    className="setting-select"
                  >
                    <option value="NGN">Nigerian Naira (₦)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                  </select>
                </div>
                
                <div className="setting-item full-width">
                  <div className="toggle-setting">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.general.maintenanceMode}
                        onChange={(e) => handleInputChange('general', 'maintenanceMode', e.target.checked)}
                      />
                      <span className="toggle-label">Maintenance Mode</span>
                    </label>
                    <small>When enabled, only admins can access the site</small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <h3><Shield size={20} /> Security Settings</h3>
              
              <div className="settings-grid">
                <div className="setting-item full-width">
                  <div className="toggle-setting">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.security.twoFactorAuth}
                        onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
                      />
                      <span className="toggle-label">Two-Factor Authentication</span>
                    </label>
                    <small>Require 2FA for admin logins</small>
                  </div>
                </div>
                
                <div className="setting-item">
                  <label>Session Timeout (minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="240"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    className="setting-input"
                  />
                </div>
                
                <div className="setting-item">
                  <label>Max Login Attempts</label>
                  <input
                    type="number"
                    min="3"
                    max="10"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    className="setting-input"
                  />
                </div>
                
                <div className="setting-item full-width">
                  <label>IP Whitelist (one per line)</label>
                  <textarea
                    value={settings.security.ipWhitelist.join('\n')}
                    onChange={(e) => handleInputChange('security', 'ipWhitelist', e.target.value.split('\n').filter(ip => ip.trim()))}
                    className="setting-textarea"
                    placeholder="192.168.1.1&#10;10.0.0.1"
                    rows={4}
                  />
                </div>
                
                <div className="setting-item full-width">
                  <h4>Password Policy</h4>
                  <div className="password-policy">
                    <div className="policy-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={settings.security.passwordPolicy.requireUppercase}
                          onChange={(e) => handleNestedChange('security', 'passwordPolicy', 'requireUppercase', e.target.checked)}
                        />
                        <span>Require uppercase letters</span>
                      </label>
                    </div>
                    <div className="policy-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={settings.security.passwordPolicy.requireNumbers}
                          onChange={(e) => handleNestedChange('security', 'passwordPolicy', 'requireNumbers', e.target.checked)}
                        />
                        <span>Require numbers</span>
                      </label>
                    </div>
                    <div className="policy-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={settings.security.passwordPolicy.requireSpecialChars}
                          onChange={(e) => handleNestedChange('security', 'passwordPolicy', 'requireSpecialChars', e.target.checked)}
                        />
                        <span>Require special characters</span>
                      </label>
                    </div>
                    <div className="policy-item">
                      <label>Minimum Length</label>
                      <input
                        type="number"
                        min="6"
                        max="32"
                        value={settings.security.passwordPolicy.minLength}
                        onChange={(e) => handleNestedChange('security', 'passwordPolicy', 'minLength', parseInt(e.target.value))}
                        className="policy-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h3><Bell size={20} /> Notification Settings</h3>
              
              <div className="notification-settings">
                <div className="notification-group">
                  <h4>Email Notifications</h4>
                  <div className="notification-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                      />
                      <span>Enable email notifications</span>
                    </label>
                  </div>
                </div>
                
                <div className="notification-group">
                  <h4>Admin Alerts</h4>
                  <div className="notification-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.notifications.adminAlerts}
                        onChange={(e) => handleInputChange('notifications', 'adminAlerts', e.target.checked)}
                      />
                      <span>System alerts</span>
                    </label>
                  </div>
                  <div className="notification-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.notifications.reportAlerts}
                        onChange={(e) => handleInputChange('notifications', 'reportAlerts', e.target.checked)}
                      />
                      <span>Report alerts</span>
                    </label>
                  </div>
                  <div className="notification-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.notifications.transactionAlerts}
                        onChange={(e) => handleInputChange('notifications', 'transactionAlerts', e.target.checked)}
                      />
                      <span>Transaction alerts</span>
                    </label>
                  </div>
                </div>
                
                <div className="notification-group">
                  <h4>User Alerts</h4>
                  <div className="notification-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.notifications.userAlerts}
                        onChange={(e) => handleInputChange('notifications', 'userAlerts', e.target.checked)}
                      />
                      <span>User activity alerts</span>
                    </label>
                  </div>
                </div>
                
                <div className="notification-group">
                  <h4>Push Notifications</h4>
                  <div className="notification-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.notifications.pushNotifications}
                        onChange={(e) => handleInputChange('notifications', 'pushNotifications', e.target.checked)}
                      />
                      <span>Enable push notifications</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Settings */}
          {activeTab === 'payment' && (
            <div className="settings-section">
              <h3><CreditCard size={20} /> Payment Settings</h3>
              
              <div className="settings-grid">
                <div className="setting-item">
                  <label>Commission Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={settings.payment.commissionRate}
                    onChange={(e) => handleInputChange('payment', 'commissionRate', parseFloat(e.target.value))}
                    className="setting-input"
                  />
                </div>
                
                <div className="setting-item">
                  <label>Payment Timeout (hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="72"
                    value={settings.payment.paymentTimeout}
                    onChange={(e) => handleInputChange('payment', 'paymentTimeout', parseInt(e.target.value))}
                    className="setting-input"
                  />
                </div>
                
                <div className="setting-item full-width">
                  <label>Enabled Payment Methods</label>
                  <div className="checkbox-group">
                    {['card', 'bank_transfer', 'wallet', 'cash'].map(method => (
                      <label key={method} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={settings.payment.paymentMethods.includes(method)}
                          onChange={() => handleArrayChange('payment', 'paymentMethods', method)}
                        />
                        <span>{method.replace('_', ' ').toUpperCase()}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="setting-item full-width">
                  <div className="toggle-setting">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.payment.autoApprovePayments}
                        onChange={(e) => handleInputChange('payment', 'autoApprovePayments', e.target.checked)}
                      />
                      <span className="toggle-label">Auto-approve Payments</span>
                    </label>
                    <small>Automatically approve payments without manual review</small>
                  </div>
                </div>
                
                <div className="setting-item full-width">
                  <div className="toggle-setting">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.payment.currencyConversion}
                        onChange={(e) => handleInputChange('payment', 'currencyConversion', e.target.checked)}
                      />
                      <span className="toggle-label">Currency Conversion</span>
                    </label>
                    <small>Allow payments in multiple currencies with automatic conversion</small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Settings */}
          {activeTab === 'api' && (
            <div className="settings-section">
              <h3><Key size={20} /> API Settings</h3>
              
              <div className="settings-grid">
                <div className="setting-item full-width">
                  <label>API Key</label>
                  <div className="api-key-container">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={settings.api.apiKey}
                      readOnly
                      className="api-key-input"
                    />
                    <button 
                      className="btn-toggle-visibility"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button 
                      className="btn-generate-key"
                      onClick={generateApiKey}
                    >
                      <RefreshCw size={16} /> Generate New
                    </button>
                  </div>
                  <small>Keep this key secret. It provides full access to the API.</small>
                </div>
                
                <div className="setting-item">
                  <label>Rate Limit (requests/minute)</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={settings.api.rateLimit}
                    onChange={(e) => handleInputChange('api', 'rateLimit', parseInt(e.target.value))}
                    className="setting-input"
                  />
                </div>
                
                <div className="setting-item full-width">
                  <label>Webhook URL</label>
                  <input
                    type="url"
                    value={settings.api.webhookUrl}
                    onChange={(e) => handleInputChange('api', 'webhookUrl', e.target.value)}
                    className="setting-input"
                  />
                </div>
                
                <div className="setting-item full-width">
                  <label>CORS Origins (one per line)</label>
                  <textarea
                    value={settings.api.corsOrigins.join('\n')}
                    onChange={(e) => handleInputChange('api', 'corsOrigins', e.target.value.split('\n').filter(origin => origin.trim()))}
                    className="setting-textarea"
                    placeholder="https://renteasy.com&#10;https://admin.renteasy.com"
                    rows={4}
                  />
                </div>
                
                <div className="setting-item full-width">
                  <div className="toggle-setting">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.api.enableDocs}
                        onChange={(e) => handleInputChange('api', 'enableDocs', e.target.checked)}
                      />
                      <span className="toggle-label">Enable API Documentation</span>
                    </label>
                    <small>Make API documentation publicly accessible</small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          {activeTab === 'advanced' && (
            <div className="settings-section">
              <h3><Database size={20} /> Advanced Settings</h3>
              
              <div className="settings-grid">
                <div className="setting-item full-width">
                  <div className="toggle-setting">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.advanced.cacheEnabled}
                        onChange={(e) => handleInputChange('advanced', 'cacheEnabled', e.target.checked)}
                      />
                      <span className="toggle-label">Enable Caching</span>
                    </label>
                    <small>Improve performance with data caching</small>
                  </div>
                </div>
                
                <div className="setting-item">
                  <label>Log Level</label>
                  <select
                    value={settings.advanced.logLevel}
                    onChange={(e) => handleInputChange('advanced', 'logLevel', e.target.value)}
                    className="setting-select"
                  >
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="warn">Warn</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                
                <div className="setting-item">
                  <label>Backup Frequency</label>
                  <select
                    value={settings.advanced.backupFrequency}
                    onChange={(e) => handleInputChange('advanced', 'backupFrequency', e.target.value)}
                    className="setting-select"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div className="setting-item full-width">
                  <div className="toggle-setting">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.advanced.autoUpdate}
                        onChange={(e) => handleInputChange('advanced', 'autoUpdate', e.target.checked)}
                      />
                      <span className="toggle-label">Auto Updates</span>
                    </label>
                    <small>Automatically install security updates</small>
                  </div>
                </div>
                
                <div className="setting-item full-width">
                  <div className="toggle-setting">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.advanced.debugMode}
                        onChange={(e) => handleInputChange('advanced', 'debugMode', e.target.checked)}
                      />
                      <span className="toggle-label">Debug Mode</span>
                    </label>
                    <small>Show detailed error messages (for development only)</small>
                  </div>
                </div>
              </div>

              {/* Backup Management */}
              <div className="backup-section">
                <h4><Cloud size={20} /> Backup Management</h4>
                
                <div className="backup-actions">
                  <button className="btn-create-backup" onClick={createBackup}>
                    <Download size={16} /> Create Backup
                  </button>
                  <button className="btn-restore-backup">
                    <Upload size={16} /> Restore Backup
                  </button>
                </div>
                
                <div className="backup-list">
                  <h5>Recent Backups</h5>
                  <table className="backup-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Size</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backups.map(backup => (
                        <tr key={backup.id}>
                          <td>{backup.date}</td>
                          <td>{backup.size}</td>
                          <td>
                            <span className={`backup-type ${backup.type}`}>
                              {backup.type}
                            </span>
                          </td>
                          <td>
                            <span className={`backup-status ${backup.status}`}>
                              {backup.status === 'success' ? (
                                <CheckCircle size={14} />
                              ) : (
                                <XCircle size={14} />
                              )}
                              {backup.status}
                            </span>
                          </td>
                          <td>
                            <div className="backup-actions">
                              <button 
                                className="btn-restore"
                                onClick={() => restoreBackup(backup.id)}
                                title="Restore"
                              >
                                <Upload size={14} />
                              </button>
                              <button 
                                className="btn-download"
                                title="Download"
                              >
                                <Download size={14} />
                              </button>
                              <button 
                                className="btn-delete"
                                onClick={() => deleteBackup(backup.id)}
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;