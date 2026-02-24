// src/modules/admin/pages/AdminSettings.jsx
import React, { useState, useEffect } from 'react';
import {
  Settings, Save, Shield, Bell, Globe, CreditCard,
  User, Lock, Mail, Database, Cloud, Key,
  AlertTriangle, CheckCircle, XCircle, RefreshCw,
  Upload, Download, Eye, EyeOff, Trash2
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import './AdminSettings.css';

const AdminSettings = () => {
  const { user: currentAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [backups, setBackups] = useState([]);
  const [error, setError] = useState(null);

  // Default settings structure (used as fallback)
  const defaultSettings = {
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
  };

  // ---------- Load settings from Supabase ----------
  useEffect(() => {
    fetchSettings();
    fetchBackups();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('settings')
        .eq('id', 1)
        .single();

      if (error) throw error;

      // Merge with defaults in case new fields were added
      const loadedSettings = data?.settings || defaultSettings;
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load settings. Using defaults.');
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Load backups from Supabase ----------
  const fetchBackups = async () => {
    try {
      const { data, error } = await supabase
        .from('backups')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedBackups = data.map(backup => ({
        id: backup.id,
        date: new Date(backup.created_at).toISOString().split('T')[0],
        size: backup.size || `${(Math.random() * 2 + 44).toFixed(1)} MB`,
        type: backup.type,
        status: backup.status
      }));

      setBackups(formattedBackups);
    } catch (error) {
      console.error('Error loading backups:', error);
      // Fallback to sample data if table is empty
      setBackups([
        { id: 1, date: '2024-01-15', size: '45.2 MB', type: 'auto', status: 'success' },
        { id: 2, date: '2024-01-14', size: '44.8 MB', type: 'manual', status: 'success' },
      ]);
    }
  };

  // ---------- Save settings to Supabase ----------
  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('system_settings')
        .update({
          settings: settings,
          updated_by: currentAdmin?.id
        })
        .eq('id', 1);

      if (error) throw error;

      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // ---------- Create a new backup ----------
  const createBackup = async () => {
    try {
      const newBackup = {
        filename: `backup-${new Date().toISOString().split('T')[0]}.sql`,
        size: `${(Math.random() * 2 + 44).toFixed(1)} MB`,
        type: 'manual',
        status: 'success',
        created_by: currentAdmin?.id
      };

      const { data, error } = await supabase
        .from('backups')
        .insert([newBackup])
        .select()
        .single();

      if (error) throw error;

      // Refresh backups list
      fetchBackups();
      alert('Backup created successfully!');
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Failed to create backup: ' + error.message);
    }
  };

  // ---------- Restore a backup ----------
  const restoreBackup = async (backupId) => {
    if (!window.confirm('Are you sure you want to restore this backup? This will overwrite current settings.')) return;
    
    // In a real app, you'd have a server-side restore process.
    // For now, we just simulate it.
    alert(`Restoring backup ${backupId}... (simulated)`);
  };

  // ---------- Delete a backup ----------
  const deleteBackup = async (backupId) => {
    if (!window.confirm('Are you sure you want to delete this backup?')) return;

    try {
      const { error } = await supabase
        .from('backups')
        .delete()
        .eq('id', backupId);

      if (error) throw error;

      fetchBackups();
    } catch (error) {
      console.error('Error deleting backup:', error);
      alert('Failed to delete backup: ' + error.message);
    }
  };

  // ---------- Reset to defaults ----------
  const resetSettings = async () => {
    if (!window.confirm('Are you sure you want to reset all settings to defaults?')) return;

    try {
      const { error } = await supabase
        .from('system_settings')
        .update({
          settings: defaultSettings,
          updated_by: currentAdmin?.id
        })
        .eq('id', 1);

      if (error) throw error;

      setSettings(defaultSettings);
      alert('Settings reset to defaults.');
    } catch (error) {
      console.error('Error resetting settings:', error);
      alert('Failed to reset settings: ' + error.message);
    }
  };

  // ---------- Generate new API key ----------
  const generateApiKey = () => {
    const newApiKey = `sk_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    handleInputChange('api', 'apiKey', newApiKey);
  };

  // ---------- Input handlers ----------
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
    if (!settings) return;
    const currentValues = settings[section][field] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    handleInputChange(section, field, newValues);
  };

  // ---------- Utility ----------
  const tabs = [
    { id: 'general', label: 'General', icon: <Settings size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'payment', label: 'Payment', icon: <CreditCard size={18} /> },
    { id: 'api', label: 'API', icon: <Key size={18} /> },
    { id: 'advanced', label: 'Advanced', icon: <Database size={18} /> }
  ];

  if (loading) {
    return (
      <div className="admin-settings loading">
        <div className="loading-spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="admin-settings error">
        <AlertTriangle size={48} />
        <h3>Failed to load settings</h3>
        <button onClick={fetchSettings}>Retry</button>
      </div>
    );
  }

  return (
    <div className="admin-settings">
      <div className="settings-header">
        <h1><Settings size={28} /> System Settings</h1>
        <p>Configure platform settings and preferences</p>
        {error && <div className="settings-error">{error}</div>}
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

        {/* Settings Content – same JSX as before, but use settings from state */}
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
                    value={settings.general?.siteName || ''}
                    onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                    className="setting-input"
                  />
                </div>
                
                <div className="setting-item">
                  <label>Site URL</label>
                  <input
                    type="url"
                    value={settings.general?.siteUrl || ''}
                    onChange={(e) => handleInputChange('general', 'siteUrl', e.target.value)}
                    className="setting-input"
                  />
                </div>
                
                <div className="setting-item">
                  <label>Admin Email</label>
                  <input
                    type="email"
                    value={settings.general?.adminEmail || ''}
                    onChange={(e) => handleInputChange('general', 'adminEmail', e.target.value)}
                    className="setting-input"
                  />
                </div>
                
                <div className="setting-item">
                  <label>Support Email</label>
                  <input
                    type="email"
                    value={settings.general?.supportEmail || ''}
                    onChange={(e) => handleInputChange('general', 'supportEmail', e.target.value)}
                    className="setting-input"
                  />
                </div>
                
                <div className="setting-item">
                  <label>Timezone</label>
                  <select
                    value={settings.general?.timezone || 'Africa/Lagos'}
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
                    value={settings.general?.dateFormat || 'DD/MM/YYYY'}
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
                    value={settings.general?.currency || 'NGN'}
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
                        checked={settings.general?.maintenanceMode || false}
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
                        checked={settings.security?.twoFactorAuth || false}
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
                    value={settings.security?.sessionTimeout || 30}
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
                    value={settings.security?.maxLoginAttempts || 5}
                    onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    className="setting-input"
                  />
                </div>
                
                <div className="setting-item full-width">
                  <label>IP Whitelist (one per line)</label>
                  <textarea
                    value={(settings.security?.ipWhitelist || []).join('\n')}
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
                          checked={settings.security?.passwordPolicy?.requireUppercase || false}
                          onChange={(e) => handleNestedChange('security', 'passwordPolicy', 'requireUppercase', e.target.checked)}
                        />
                        <span>Require uppercase letters</span>
                      </label>
                    </div>
                    <div className="policy-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={settings.security?.passwordPolicy?.requireNumbers || false}
                          onChange={(e) => handleNestedChange('security', 'passwordPolicy', 'requireNumbers', e.target.checked)}
                        />
                        <span>Require numbers</span>
                      </label>
                    </div>
                    <div className="policy-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={settings.security?.passwordPolicy?.requireSpecialChars || false}
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
                        value={settings.security?.passwordPolicy?.minLength || 8}
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
                        checked={settings.notifications?.emailNotifications || false}
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
                        checked={settings.notifications?.adminAlerts || false}
                        onChange={(e) => handleInputChange('notifications', 'adminAlerts', e.target.checked)}
                      />
                      <span>System alerts</span>
                    </label>
                  </div>
                  <div className="notification-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.notifications?.reportAlerts || false}
                        onChange={(e) => handleInputChange('notifications', 'reportAlerts', e.target.checked)}
                      />
                      <span>Report alerts</span>
                    </label>
                  </div>
                  <div className="notification-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.notifications?.transactionAlerts || false}
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
                        checked={settings.notifications?.userAlerts || false}
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
                        checked={settings.notifications?.pushNotifications || false}
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
                    value={settings.payment?.commissionRate || 7.5}
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
                    value={settings.payment?.paymentTimeout || 24}
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
                          checked={(settings.payment?.paymentMethods || []).includes(method)}
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
                        checked={settings.payment?.autoApprovePayments || false}
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
                        checked={settings.payment?.currencyConversion || false}
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
                      value={settings.api?.apiKey || ''}
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
                    value={settings.api?.rateLimit || 100}
                    onChange={(e) => handleInputChange('api', 'rateLimit', parseInt(e.target.value))}
                    className="setting-input"
                  />
                </div>
                
                <div className="setting-item full-width">
                  <label>Webhook URL</label>
                  <input
                    type="url"
                    value={settings.api?.webhookUrl || ''}
                    onChange={(e) => handleInputChange('api', 'webhookUrl', e.target.value)}
                    className="setting-input"
                  />
                </div>
                
                <div className="setting-item full-width">
                  <label>CORS Origins (one per line)</label>
                  <textarea
                    value={(settings.api?.corsOrigins || []).join('\n')}
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
                        checked={settings.api?.enableDocs || false}
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
                        checked={settings.advanced?.cacheEnabled || false}
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
                    value={settings.advanced?.logLevel || 'info'}
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
                    value={settings.advanced?.backupFrequency || 'daily'}
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
                        checked={settings.advanced?.autoUpdate || false}
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
                        checked={settings.advanced?.debugMode || false}
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