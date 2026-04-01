// src/modules/estate-firm/pages/EstateSettings.jsx
import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, Bell, Shield, 
  Globe, User, CreditCard, Lock,
  Mail, Smartphone, Home, Building,
  Users, Key, Eye, EyeOff, Receipt,
  AlertCircle, CheckCircle, XCircle,
  ArrowLeft, Plus, Trash2, DollarSign
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import { useAuth } from '../../../shared/context/AuthContext';
import './EstateSettings.css';

const EstateSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showBankDetailsMissingAlert, setShowBankDetailsMissingAlert] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [userRole, setUserRole] = useState('principal');
  const [canEdit, setCanEdit] = useState(true);
  const [settings, setSettings] = useState({
    // General
    firmName: '',
    businessEmail: '',
    businessPhone: '',
    businessAddress: '',
    website: '',
    // Notifications
    emailNotifications: true,
    smsNotifications: true,
    newListingAlerts: true,
    rentDueAlerts: true,
    maintenanceAlerts: true,
    marketingEmails: false,
    // Security
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: 30,
    // Payment
    paymentMethod: 'bank-transfer',
    bankName: '',
    accountNumber: '',
    accountName: '',
    // Display
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

  // Get user role
  useEffect(() => {
    const getUserRole = async () => {
      if (!user) return;
      try {
        const { data: roleData, error } = await supabase
          .from('estate_firm_profiles')
          .select('staff_role')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (!error && roleData) {
          const role = roleData.staff_role || 'principal';
          setUserRole(role);
          // Only Principal can edit firm settings
          setCanEdit(role === 'principal');
        }
      } catch (err) {
        console.warn('Could not fetch user role:', err);
        setCanEdit(true);
      }
    };
    getUserRole();
  }, [user]);

  useEffect(() => {
    if (user) {
      loadSettings();
      checkBankDetailsStatus();
    }
  }, [user]);

  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => setShowSuccessMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Get effective firm ID (parent for staff)
      let effectiveUserId = user.id;
      
      const { data: roleData } = await supabase
        .from('estate_firm_profiles')
        .select('staff_role, parent_estate_firm_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      // If staff, use parent firm ID
      if (roleData?.staff_role === 'associate' || roleData?.staff_role === 'executive') {
        if (roleData.parent_estate_firm_id) {
          effectiveUserId = roleData.parent_estate_firm_id;
        }
      }
      
      // Load estate firm profile
      const { data: profile, error } = await supabase
        .from('estate_firm_profiles')
        .select('*')
        .eq('id', effectiveUserId)
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
          bankName: profile.bank_details?.bank_name || '',
          accountNumber: profile.bank_details?.account_number || '',
          accountName: profile.bank_details?.account_name || '',
          paymentMethod: profile.payment_method || 'bank-transfer',
          ...(profile.settings || {})
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkBankDetailsStatus = async () => {
    try {
      // Get effective firm ID
      let effectiveUserId = user.id;
      
      const { data: roleData } = await supabase
        .from('estate_firm_profiles')
        .select('staff_role, parent_estate_firm_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (roleData?.staff_role === 'associate' || roleData?.staff_role === 'executive') {
        if (roleData.parent_estate_firm_id) {
          effectiveUserId = roleData.parent_estate_firm_id;
        }
      }
      
      const { data: profile } = await supabase
        .from('estate_firm_profiles')
        .select('bank_details')
        .eq('id', effectiveUserId)
        .single();

      const hasBankDetails = profile?.bank_details?.bank_name && 
                             profile?.bank_details?.account_number && 
                             profile?.bank_details?.account_name;
      
      setShowBankDetailsMissingAlert(!hasBankDetails);
    } catch (error) {
      console.error('Error checking bank details:', error);
    }
  };

  const handleInputChange = (field, value) => {
    if (!canEdit) return;
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleToggle = (field) => {
    if (!canEdit) return;
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

 // In EstateSettings.jsx, update the saveSettings function:

const saveSettings = async () => {
  if (!canEdit) {
    alert('Only the Firm Principal can edit settings.');
    return;
  }
  
  if (!user) return;

  try {
    setSaving(true);

    const notifications = {
      email: settings.emailNotifications,
      sms: settings.smsNotifications,
      new_listings: settings.newListingAlerts,
      rent_due: settings.rentDueAlerts,
      maintenance: settings.maintenanceAlerts,
      marketing: settings.marketingEmails
    };

    const display = {
      theme: settings.theme,
      language: settings.language,
      date_format: settings.dateFormat,
      timezone: settings.timeZone
    };

    const security = {
      two_factor_auth: settings.twoFactorAuth,
      login_alerts: settings.loginAlerts,
      session_timeout: settings.sessionTimeout
    };

    const bankDetails = {
      bank_name: settings.bankName,
      account_number: settings.accountNumber,
      account_name: settings.accountName
    };

    // Get the correct firm ID (parent for staff)
    let targetUserId = user.id;
    
    const { data: roleData } = await supabase
      .from('estate_firm_profiles')
      .select('parent_estate_firm_id, is_staff_account')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (roleData?.is_staff_account && roleData?.parent_estate_firm_id) {
      targetUserId = roleData.parent_estate_firm_id;
      console.log('Saving to parent firm ID:', targetUserId);
    }

    // First, check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('estate_firm_profiles')
      .select('id')
      .eq('user_id', targetUserId)
      .maybeSingle();

    let error;

    if (existingProfile) {
      // UPDATE existing profile
      const { error: updateError } = await supabase
        .from('estate_firm_profiles')
        .update({
          firm_name: settings.firmName,
          business_email: settings.businessEmail,
          business_phone: settings.businessPhone,
          address: settings.businessAddress,
          website: settings.website,
          bank_details: bankDetails,
          payment_method: settings.paymentMethod,
          settings: {
            notifications,
            display,
            security
          },
          updated_at: new Date().toISOString()
        })
        .eq('user_id', targetUserId);
      
      error = updateError;
    } else {
      // INSERT new profile
      const { error: insertError } = await supabase
        .from('estate_firm_profiles')
        .insert({
          user_id: targetUserId,
          firm_name: settings.firmName,
          business_email: settings.businessEmail,
          business_phone: settings.businessPhone,
          address: settings.businessAddress,
          website: settings.website,
          bank_details: bankDetails,
          payment_method: settings.paymentMethod,
          settings: {
            notifications,
            display,
            security
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      error = insertError;
    }

    if (error) throw error;

    console.log('Bank details saved:', bankDetails);

    // Update bank details status alert
    const hasBankDetails = settings.bankName && settings.accountNumber && settings.accountName;
    setShowBankDetailsMissingAlert(!hasBankDetails);
    setShowSuccessMessage(true);

    // Log activity
    try {
      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'settings',
        action: 'update',
        description: 'Updated estate firm settings',
        created_at: new Date().toISOString()
      });
    } catch (activityError) {
      console.warn('Could not log activity:', activityError);
    }

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
    return <RentEasyLoader message="Loading your Settings..." fullScreen />;
  }

  // Associates and Executives cannot edit settings
  if (!canEdit) {
    return (
      <div className="estate-settings restricted">
        <div className="restricted-card">
          <Shield size={48} />
          <h2>Access Restricted</h2>
          <p>Only the Firm Principal can access and edit firm settings.</p>
          <p className="restricted-note">Please contact your firm administrator for settings changes.</p>
          <button className="btn btn-primary" onClick={() => window.history.back()}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Render General Settings
  const renderGeneralSettings = () => (
    <div className="settings-section">
      <h3><User size={20} /> General Information</h3>
      <div className="settings-grid">
        <div className="form-group">
          <label>Firm Name</label>
          <input
            type="text"
            value={settings.firmName}
            onChange={(e) => handleInputChange('firmName', e.target.value)}
            placeholder="Enter firm name"
            disabled={!canEdit}
          />
        </div>
        
        <div className="form-group">
          <label>Business Email</label>
          <input
            type="email"
            value={settings.businessEmail}
            onChange={(e) => handleInputChange('businessEmail', e.target.value)}
            placeholder="business@email.com"
            disabled={!canEdit}
          />
        </div>
        
        <div className="form-group">
          <label>Business Phone</label>
          <input
            type="tel"
            value={settings.businessPhone}
            onChange={(e) => handleInputChange('businessPhone', e.target.value)}
            placeholder="+2348012345678"
            disabled={!canEdit}
          />
        </div>
        
        <div className="form-group full-width">
          <label>Business Address</label>
          <textarea
            value={settings.businessAddress}
            onChange={(e) => handleInputChange('businessAddress', e.target.value)}
            placeholder="Full business address"
            rows={3}
            disabled={!canEdit}
          />
        </div>
        
        <div className="form-group">
          <label>Website</label>
          <input
            type="url"
            value={settings.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="www.example.com"
            disabled={!canEdit}
          />
        </div>
      </div>
    </div>
  );

  // Render Notification Settings
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
                disabled={!canEdit}
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
                disabled={!canEdit}
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
                disabled={!canEdit}
              />
              <span className="slider"></span>
            </label>
          </div>
          
          <div className="toggle-item">
            <div className="toggle-label">
              <DollarSign size={16} />
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
                disabled={!canEdit}
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
                disabled={!canEdit}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Security Settings
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
                disabled={!canEdit}
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
                disabled={!canEdit}
              />
              <span className="slider"></span>
            </label>
          </div>
          
          <div className="form-group">
            <label>Session Timeout (minutes)</label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
              min="5"
              max="120"
              step="5"
              disabled={!canEdit}
            />
            <small>Auto logout after inactivity</small>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Payment Settings (Enhanced with Bank Details)
  const renderPaymentSettings = () => (
    <div className="settings-section">
      <div className="section-header">
        <h3><CreditCard size={20} /> Payment Settings</h3>
        {showBankDetailsMissingAlert && canEdit && (
          <div className="bank-details-alert">
            <AlertCircle size={16} />
            <span>⚠️ Action Required: Please add your bank details to receive rent payments</span>
          </div>
        )}
        {showSuccessMessage && (
          <div className="success-alert">
            <CheckCircle size={16} />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>
      
      <div className="payment-settings">
        <div className="info-card">
          <Receipt size={24} />
          <div>
            <h4>Why add bank details?</h4>
            <p>When tenants make rent payments, they will see these bank details to send their payments. Without this, tenants cannot complete payments and you won't receive rent.</p>
          </div>
        </div>

        <div className="form-group">
          <label>Preferred Payment Method</label>
          <select
            value={settings.paymentMethod}
            onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
            disabled={!canEdit}
          >
            <option value="bank-transfer">Bank Transfer</option>
            <option value="paystack">Paystack</option>
            <option value="flutterwave">Flutterwave</option>
            <option value="remita">Remita</option>
          </select>
        </div>
        
        {settings.paymentMethod === 'bank-transfer' && (
          <div className="bank-details-form">
            <div className="bank-details-header">
              <h4>Bank Account Details</h4>
              <p className="bank-details-hint">These details will be shown to tenants when they make rent payments</p>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Bank Name <span className="required">*</span></label>
                <input
                  type="text"
                  value={settings.bankName}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  placeholder="e.g., GTBank, Access Bank, First Bank"
                  className={!settings.bankName && showBankDetailsMissingAlert ? 'error' : ''}
                  disabled={!canEdit}
                />
              </div>
              
              <div className="form-group">
                <label>Account Number <span className="required">*</span></label>
                <input
                  type="text"
                  value={settings.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  placeholder="10-digit account number"
                  maxLength="10"
                  className={!settings.accountNumber && showBankDetailsMissingAlert ? 'error' : ''}
                  disabled={!canEdit}
                />
              </div>
              
              <div className="form-group full-width">
                <label>Account Name <span className="required">*</span></label>
                <input
                  type="text"
                  value={settings.accountName}
                  onChange={(e) => handleInputChange('accountName', e.target.value)}
                  placeholder="Account holder name as on bank statement"
                  className={!settings.accountName && showBankDetailsMissingAlert ? 'error' : ''}
                  disabled={!canEdit}
                />
              </div>
            </div>
            
            {settings.bankName && settings.accountNumber && settings.accountName && (
              <div className="bank-details-preview">
                <CheckCircle size={14} />
                <span>Bank details saved. Tenants will see:</span>
                <div className="preview-box">
                  <p><strong>Bank:</strong> {settings.bankName}</p>
                  <p><strong>Account:</strong> {settings.accountNumber}</p>
                  <p><strong>Name:</strong> {settings.accountName}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Render Display Settings
  const renderDisplaySettings = () => (
    <div className="settings-section">
      <h3><Globe size={20} /> Display & Language</h3>
      <div className="settings-grid">
        <div className="form-group">
          <label>Theme</label>
          <select
            value={settings.theme}
            onChange={(e) => handleInputChange('theme', e.target.value)}
            disabled={!canEdit}
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
            onChange={(e) => handleInputChange('language', e.target.value)}
            disabled={!canEdit}
          >
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
            <option value="pt">Portuguese</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Date Format</label>
          <select
            value={settings.dateFormat}
            onChange={(e) => handleInputChange('dateFormat', e.target.value)}
            disabled={!canEdit}
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
            onChange={(e) => handleInputChange('timeZone', e.target.value)}
            disabled={!canEdit}
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
      {/* Role Banner for Non-Principal */}
      {userRole !== 'principal' && (
        <div className="role-banner executive">
          <Shield size={16} />
          <span>View Only - Only the Firm Principal can edit settings</span>
        </div>
      )}

      {/* Success Message Banner */}
      {showSuccessMessage && (
        <div className="success-banner">
          <CheckCircle size={20} />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Header */}
      <div className="settings-header">
        <button className="back-btn" onClick={() => window.history.back()}>
          <ArrowLeft size={20} /> Back
        </button>
        <div>
          <h1><Settings size={28} /> Estate Firm Settings</h1>
          <p>Manage your firm's preferences, security, and payment details</p>
        </div>
      </div>
      
      {/* Bank Details Missing Alert Banner (if not added) */}
      {showBankDetailsMissingAlert && canEdit && (
        <div className="warning-banner">
          <AlertCircle size={24} />
          <div className="warning-content">
            <strong>⚠️ Bank Details Missing</strong>
            <p>You haven't added your bank account details. Tenants cannot make rent payments until you add your bank information.</p>
          </div>
          <button className="warning-button" onClick={() => setActiveTab('payment')}>
            Add Bank Details Now
          </button>
        </div>
      )}
      
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
          
          {canEdit && (
            <div className="settings-actions">
              <button className="btn-save-settings" onClick={saveSettings} disabled={saving}>
                <Save size={18} /> {saving ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EstateSettings;