import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, Bell, Shield, 
  Globe, User, CreditCard, Lock,
  Mail, Smartphone, Home, Building,
  Users, Key, Eye, EyeOff
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import './EstateSettings.css';

const EstateSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    firmName: '',
    businessEmail: '',
    businessPhone: '',
    businessAddress: '',
    website: '',
    emailNotifications: true,
    smsNotifications: true,
    newListingAlerts: true,
    rentDueAlerts: true,
    maintenanceAlerts: true,
    marketingEmails: false,
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginAlerts: true,
    suspiciousActivity: true,
    paymentMethod: 'bank-transfer',
    bankName: '',
    accountNumber: '',
    accountName: '',
    theme: 'light',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeZone: 'Africa/Lagos'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Load estate firm profile
      const { data: profile, error } = await supabase
        .from('estate_firm_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (profile) {
        setSettings(prev => ({
          ...prev,
          firmName: profile.firm_name || '',
          businessEmail: profile.business_email || user.email || '',
          businessPhone: profile.business_phone || '',
          businessAddress: profile.address || '',
          website: profile.website || '',
          ...profile.settings
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleToggle = (field) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveSettings = async () => {
    if (!user) return;

    try {
      setSaving(true);

      const settingsData = {
        notifications: {
          email: settings.emailNotifications,
          sms: settings.smsNotifications,
          new_listings: settings.newListingAlerts,
          rent_due: settings.rentDueAlerts,
          maintenance: settings.maintenanceAlerts,
          marketing: settings.marketingEmails
        },
        display: {
          theme: settings.theme,
          language: settings.language,
          date_format: settings.dateFormat,
          timezone: settings.timeZone
        },
        payment: {
          method: settings.paymentMethod,
          bank_name: settings.bankName,
          account_number: settings.accountNumber,
          account_name: settings.accountName
        }
      };

      // Update estate firm profile
      const { error } = await supabase
        .from('estate_firm_profiles')
        .upsert({
          user_id: user.id,
          firm_name: settings.firmName,
          business_email: settings.businessEmail,
          business_phone: settings.businessPhone,
          address: settings.businessAddress,
          website: settings.website,
          settings: settingsData
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Log activity
      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'settings',
        action: 'update',
        description: 'Updated estate firm settings',
        created_at: new Date().toISOString()
      });

      alert('Settings saved successfully!');

    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!user) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      // Log activity
      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'security',
        action: 'change_password',
        description: 'Changed account password',
        created_at: new Date().toISOString()
      });

      alert('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="estate-settings">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <h3><User size={20} /> General Information</h3>
      <div className="settings-grid">
        <div className="form-group">
          <label>Firm Name</label>
          <input
            type="text"
            value={settings.firmName}
            onChange={(e) => handleInputChange('general', 'firmName', e.target.value)}
            placeholder="Enter firm name"
          />
        </div>
        
        <div className="form-group">
          <label>Business Email</label>
          <input
            type="email"
            value={settings.businessEmail}
            onChange={(e) => handleInputChange('general', 'businessEmail', e.target.value)}
            placeholder="business@email.com"
          />
        </div>
        
        <div className="form-group">
          <label>Business Phone</label>
          <input
            type="tel"
            value={settings.businessPhone}
            onChange={(e) => handleInputChange('general', 'businessPhone', e.target.value)}
            placeholder="+2348012345678"
          />
        </div>
        
        <div className="form-group full-width">
          <label>Business Address</label>
          <textarea
            value={settings.businessAddress}
            onChange={(e) => handleInputChange('general', 'businessAddress', e.target.value)}
            placeholder="Full business address"
            rows={3}
          />
        </div>
        
        <div className="form-group">
          <label>Website</label>
          <input
            type="url"
            value={settings.website}
            onChange={(e) => handleInputChange('general', 'website', e.target.value)}
            placeholder="www.example.com"
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="settings-section">
      <h3><Bell size={20} /> Notifications</h3>
      <div className="notification-settings">
        <div className="toggle-group">
          <div className="toggle-item">
            <div className="toggle-label">
              <Mail size={16} />
              <div>
                <span>Email Notifications</span>
                <small>Receive important updates via email</small>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
              />
              <span className="slider"></span>
            </label>
          </div>
          
          <div className="toggle-item">
            <div className="toggle-label">
              <Smartphone size={16} />
              <div>
                <span>SMS Notifications</span>
                <small>Receive SMS alerts for urgent matters</small>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={() => handleToggle('smsNotifications')}
              />
              <span className="slider"></span>
            </label>
          </div>
          
          <div className="toggle-item">
            <div className="toggle-label">
              <Home size={16} />
              <div>
                <span>New Listing Alerts</span>
                <small>Get notified about new properties in your area</small>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.newListingAlerts}
                onChange={() => handleToggle('newListingAlerts')}
              />
              <span className="slider"></span>
            </label>
          </div>
          
          <div className="toggle-item">
            <div className="toggle-label">
              <CreditCard size={16} />
              <div>
                <span>Rent Due Alerts</span>
                <small>Reminders for upcoming rent payments</small>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.rentDueAlerts}
                onChange={() => handleToggle('rentDueAlerts')}
              />
              <span className="slider"></span>
            </label>
          </div>
          
          <div className="toggle-item">
            <div className="toggle-label">
              <Building size={16} />
              <div>
                <span>Maintenance Alerts</span>
                <small>Alerts for property maintenance requests</small>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.maintenanceAlerts}
                onChange={() => handleToggle('maintenanceAlerts')}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="settings-section">
      <h3><Shield size={20} /> Security</h3>
      
      <div className="security-settings">
        <div className="password-change">
          <h4>Change Password</h4>
          <div className="password-form">
            <div className="form-group">
              <label>Current Password</label>
              <div className="password-input">
                <input
                  type={showPassword.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(prev => ({...prev, current: !prev.current}))}
                >
                  {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label>New Password</label>
              <div className="password-input">
                <input
                  type={showPassword.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(prev => ({...prev, new: !prev.new}))}
                >
                  {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="password-input">
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(prev => ({...prev, confirm: !prev.confirm}))}
                >
                  {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <button className="btn-change-password" onClick={changePassword}>
              <Key size={16} /> Change Password
            </button>
          </div>
        </div>
        
        <div className="security-features">
          <h4>Security Features</h4>
          <div className="toggle-item">
            <div className="toggle-label">
              <Shield size={16} />
              <div>
                <span>Two-Factor Authentication</span>
                <small>Add an extra layer of security to your account</small>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.twoFactorAuth}
                onChange={() => handleToggle('twoFactorAuth')}
              />
              <span className="slider"></span>
            </label>
          </div>
          
          <div className="toggle-item">
            <div className="toggle-label">
              <Bell size={16} />
              <div>
                <span>Login Alerts</span>
                <small>Get notified of new sign-ins to your account</small>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.loginAlerts}
                onChange={() => handleToggle('loginAlerts')}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="settings-section">
      <h3><CreditCard size={20} /> Payment Settings</h3>
      <div className="payment-settings">
        <div className="form-group">
          <label>Preferred Payment Method</label>
          <select
            value={settings.paymentMethod}
            onChange={(e) => handleInputChange('payment', 'paymentMethod', e.target.value)}
          >
            <option value="bank-transfer">Bank Transfer</option>
            <option value="paystack">Paystack</option>
            <option value="flutterwave">Flutterwave</option>
            <option value="remita">Remita</option>
          </select>
        </div>
        
        {settings.paymentMethod === 'bank-transfer' && (
          <>
            <div className="form-group">
              <label>Bank Name</label>
              <input
                type="text"
                value={settings.bankName}
                onChange={(e) => handleInputChange('payment', 'bankName', e.target.value)}
                placeholder="Bank name"
              />
            </div>
            
            <div className="form-group">
              <label>Account Number</label>
              <input
                type="text"
                value={settings.accountNumber}
                onChange={(e) => handleInputChange('payment', 'accountNumber', e.target.value)}
                placeholder="Account number"
              />
            </div>
            
            <div className="form-group">
              <label>Account Name</label>
              <input
                type="text"
                value={settings.accountName}
                onChange={(e) => handleInputChange('payment', 'accountName', e.target.value)}
                placeholder="Account name"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderDisplaySettings = () => (
    <div className="settings-section">
      <h3><Globe size={20} /> Display & Language</h3>
      <div className="settings-grid">
        <div className="form-group">
          <label>Theme</label>
          <select
            value={settings.theme}
            onChange={(e) => handleInputChange('display', 'theme', e.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto (System)</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Language</label>
          <select
            value={settings.language}
            onChange={(e) => handleInputChange('display', 'language', e.target.value)}
          >
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Date Format</label>
          <select
            value={settings.dateFormat}
            onChange={(e) => handleInputChange('display', 'dateFormat', e.target.value)}
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Time Zone</label>
          <select
            value={settings.timeZone}
            onChange={(e) => handleInputChange('display', 'timeZone', e.target.value)}
          >
            <option value="Africa/Lagos">West Africa Time (WAT)</option>
            <option value="Africa/Cairo">Eastern European Time (EET)</option>
            <option value="Africa/Johannesburg">South Africa Standard Time (SAST)</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="estate-settings">
      <div className="settings-header">
        <h1><Settings size={28} /> Estate Firm Settings</h1>
        <p>Manage your firm's preferences, security, and notification settings</p>
      </div>
      
      <div className="settings-container">
        <div className="settings-sidebar">
          <button 
            className={`sidebar-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <User size={18} /> General
          </button>
          
          <button 
            className={`sidebar-tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={18} /> Notifications
          </button>
          
          <button 
            className={`sidebar-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Shield size={18} /> Security
          </button>
          
          <button 
            className={`sidebar-tab ${activeTab === 'payment' ? 'active' : ''}`}
            onClick={() => setActiveTab('payment')}
          >
            <CreditCard size={18} /> Payment
          </button>
          
          <button 
            className={`sidebar-tab ${activeTab === 'display' ? 'active' : ''}`}
            onClick={() => setActiveTab('display')}
          >
            <Globe size={18} /> Display
          </button>
        </div>
        
        <div className="settings-content">
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'notifications' && renderNotificationSettings()}
          {activeTab === 'security' && renderSecuritySettings()}
          {activeTab === 'payment' && renderPaymentSettings()}
          {activeTab === 'display' && renderDisplaySettings()}
          
          <div className="settings-actions">
            <button className="btn-save-settings" onClick={saveSettings}>
              <Save size={18} /> Save All Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstateSettings;