// src/modules/manager/pages/ManagerProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import { Eye, EyeOff, Save, CreditCard, Building, User, Mail, Phone, MapPin, Bell } from 'lucide-react';
import './ManagerProfile.css';

const ManagerProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [assignedAreas, setAssignedAreas] = useState([]);
  const [kycStatus, setKycStatus] = useState('not_submitted');
  
  // Bank details state
  const [bankDetails, setBankDetails] = useState({
    bank_name: '',
    account_number: '',
    account_name: ''
  });
  const [editingBank, setEditingBank] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  
  // Personal info edit state
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    full_name: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'manager') {
      navigate('/dashboard/manager');
      return;
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      // Get profile data
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setAvatarUrl(data.avatar_url);
      setKycStatus(data.kyc_status || 'not_submitted');
      
      // Set personal info
      setPersonalInfo({
        full_name: data.full_name || '',
        phone: data.phone || '',
        email: data.email || user.email
      });
      
      // Set bank details
      setBankDetails({
        bank_name: data.bank_name || '',
        account_number: data.account_number || '',
        account_name: data.account_name || ''
      });

      // Build assigned areas from preferred_lgas and radius
      if (data.preferred_lgas && data.preferred_lgas.length) {
        const areas = data.preferred_lgas.map(lga => ({
          state: data.state || 'Lagos',
          lga: lga
        }));
        setAssignedAreas(areas);
      } else {
        setAssignedAreas([]);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      alert('Avatar updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar.');
    } finally {
      setUploading(false);
    }
  };

  const handleSavePersonalInfo = async () => {
    setSavingBank(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: personalInfo.full_name,
          phone: personalInfo.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => ({
        ...prev,
        full_name: personalInfo.full_name,
        phone: personalInfo.phone
      }));
      
      setEditingPersonal(false);
      alert('Personal information updated successfully!');
    } catch (error) {
      console.error('Error updating personal info:', error);
      alert('Failed to update personal information.');
    } finally {
      setSavingBank(false);
    }
  };

  const handleSaveBankDetails = async () => {
    if (!bankDetails.bank_name || !bankDetails.account_number || !bankDetails.account_name) {
      alert('Please fill in all bank details fields');
      return;
    }
    
    if (bankDetails.account_number.length < 10) {
      alert('Please enter a valid account number (minimum 10 digits)');
      return;
    }
    
    setSavingBank(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          bank_name: bankDetails.bank_name,
          account_number: bankDetails.account_number,
          account_name: bankDetails.account_name.toUpperCase(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => ({
        ...prev,
        bank_name: bankDetails.bank_name,
        account_number: bankDetails.account_number,
        account_name: bankDetails.account_name
      }));
      
      setEditingBank(false);
      alert('Bank details saved successfully!');
    } catch (error) {
      console.error('Error saving bank details:', error);
      alert('Failed to save bank details.');
    } finally {
      setSavingBank(false);
    }
  };

  const getKYCStatusBadge = () => {
    switch (kycStatus) {
      case 'approved':
        return <span className="kyc-badge approved">✅ Verified</span>;
      case 'pending':
        return <span className="kyc-badge pending">⏳ Pending</span>;
      case 'rejected':
        return <span className="kyc-badge rejected">❌ Rejected</span>;
      default:
        return <span className="kyc-badge not-submitted">⚠️ Not Submitted</span>;
    }
  };

  const formatAccountNumber = (number) => {
    if (!number) return 'Not provided';
    if (showAccountNumber) return number;
    return '••••' + number.slice(-4);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="manager-profile">
      <div className="profile-header">
        <div>
          <h1>Manager Profile</h1>
          <p>Manage your personal information and banking details</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/dashboard/manager')}
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="profile-layout">
        {/* Left column – Avatar and KYC */}
        <div className="profile-left">
          <div className="avatar-section">
            <div className="avatar-wrapper">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="avatar" />
              ) : (
                <div className="avatar-placeholder">
                  {profile?.full_name?.charAt(0) || 'M'}
                </div>
              )}
            </div>
            <label htmlFor="avatar-upload" className="avatar-upload-btn">
              {uploading ? 'Uploading...' : 'Change Photo'}
            </label>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            <div className="commission-info">
              <span className="commission-label">Commission Rate</span>
              <span className="commission-value">2.5%</span>
              <small>On successful rentals</small>
            </div>
          </div>

          <div className="kyc-status-card">
            <h4>📋 KYC Verification</h4>
            <div className="kyc-status">
              {getKYCStatusBadge()}
            </div>
            <p className="kyc-info">
              {kycStatus === 'approved' 
                ? 'Your identity has been verified.' 
                : kycStatus === 'pending' 
                ? 'Your documents are being reviewed.' 
                : 'Complete KYC to start managing properties.'}
            </p>
            <button 
              className="btn btn-outline"
              onClick={() => navigate('/dashboard/manager/kyc')}
            >
              {kycStatus === 'approved' ? 'View KYC Details' : 'Complete KYC'}
            </button>
          </div>
        </div>

        {/* Right column – Details */}
        <div className="profile-right">
          {/* Personal Information Card */}
          <div className="profile-card">
            <div className="card-header">
              <h3>
                <User size={18} />
                Personal Information
              </h3>
              {!editingPersonal && (
                <button 
                  className="btn-icon"
                  onClick={() => setEditingPersonal(true)}
                >
                  ✏️ Edit
                </button>
              )}
            </div>
            
            {editingPersonal ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={personalInfo.full_name}
                    onChange={(e) => setPersonalInfo({...personalInfo, full_name: e.target.value})}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    disabled
                    className="disabled-input"
                  />
                  <small>Email cannot be changed</small>
                </div>
                <div className="form-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setEditingPersonal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={handleSavePersonalInfo}
                    disabled={savingBank}
                  >
                    {savingBank ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="info-grid">
                <div className="info-item">
                  <label>Full Name</label>
                  <p>{profile?.full_name || 'Not provided'}</p>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <p>{profile?.email || user.email}</p>
                </div>
                <div className="info-item">
                  <label>Phone</label>
                  <p>{profile?.phone || 'Not provided'}</p>
                </div>
                <div className="info-item">
                  <label>Role</label>
                  <p className="role-badge">Manager</p>
                </div>
                <div className="info-item full-width">
                  <label>Member Since</label>
                  <p>{new Date(profile?.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>

          {/* Bank Account Details Card - Important for Admin Payouts */}
          <div className="profile-card bank-card">
            <div className="card-header">
              <h3>
                <CreditCard size={18} />
                Bank Account Details
              </h3>
              <div className="card-header-actions">
                <button 
                  className="btn-icon"
                  onClick={() => setShowAccountNumber(!showAccountNumber)}
                  title={showAccountNumber ? "Hide account number" : "Show account number"}
                >
                  {showAccountNumber ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {!editingBank && (
                  <button 
                    className="btn-icon"
                    onClick={() => setEditingBank(true)}
                  >
                    ✏️ Edit
                  </button>
                )}
              </div>
            </div>
            
            <div className="bank-info-note">
              <Building size={14} />
              <small>Your bank details are required to receive commission payouts</small>
            </div>
            
            {editingBank ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>Bank Name</label>
                  <select
                    value={bankDetails.bank_name}
                    onChange={(e) => setBankDetails({...bankDetails, bank_name: e.target.value})}
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
                <div className="form-group">
                  <label>Account Number</label>
                  <input
                    type="text"
                    value={bankDetails.account_number}
                    onChange={(e) => setBankDetails({...bankDetails, account_number: e.target.value.replace(/\D/g, '')})}
                    placeholder="10-digit account number"
                    maxLength="10"
                  />
                </div>
                <div className="form-group">
                  <label>Account Name</label>
                  <input
                    type="text"
                    value={bankDetails.account_name}
                    onChange={(e) => setBankDetails({...bankDetails, account_name: e.target.value.toUpperCase()})}
                    placeholder="Account holder name"
                  />
                </div>
                <div className="form-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditingBank(false);
                      setBankDetails({
                        bank_name: profile?.bank_name || '',
                        account_number: profile?.account_number || '',
                        account_name: profile?.account_name || ''
                      });
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={handleSaveBankDetails}
                    disabled={savingBank}
                  >
                    {savingBank ? 'Saving...' : 'Save Bank Details'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bank-details-display">
                {bankDetails.bank_name ? (
                  <>
                    <div className="bank-detail-row">
                      <span className="bank-label">Bank:</span>
                      <span className="bank-value">{bankDetails.bank_name}</span>
                    </div>
                    <div className="bank-detail-row">
                      <span className="bank-label">Account Number:</span>
                      <span className="bank-value">{formatAccountNumber(bankDetails.account_number)}</span>
                    </div>
                    <div className="bank-detail-row">
                      <span className="bank-label">Account Name:</span>
                      <span className="bank-value">{bankDetails.account_name || 'Not provided'}</span>
                    </div>
                  </>
                ) : (
                  <div className="no-bank-details">
                    <p>⚠️ No bank details provided</p>
                    <small>Please add your bank details to receive commission payouts</small>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Coverage Area Card */}
          <div className="profile-card">
            <div className="card-header">
              <h3>
                <MapPin size={18} />
                Coverage Area
              </h3>
            </div>
            {assignedAreas.length === 0 ? (
              <p className="empty-text">No areas assigned yet. Set your coverage area to receive proximity notifications.</p>
            ) : (
              <div className="areas-grid">
                {assignedAreas.map((area, index) => (
                  <div key={index} className="area-card">
                    <div className="area-icon">📍</div>
                    <div className="area-details">
                      <span className="area-state">{area.state}</span>
                      <span className="area-lga">{area.lga}</span>
                    </div>
                    <span className="area-badge">Active</span>
                  </div>
                ))}
              </div>
            )}
            <div className="radius-info">
              <span className="radius-label">Notification Radius</span>
              <span className="radius-value">{profile?.notification_radius_km || 1} km</span>
            </div>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/dashboard/manager/radius')}
            >
              Adjust Coverage
            </button>
          </div>

          {/* Notification Preferences Card */}
          <div className="profile-card">
            <div className="card-header">
              <h3>
                <Bell size={18} />
                Notification Preferences
              </h3>
            </div>
            <div className="settings-list">
              <div className="setting-item">
                <span>Email Notifications</span>
                <span className={`setting-value ${profile?.notification_preferences?.email ? 'on' : 'off'}`}>
                  {profile?.notification_preferences?.email ? 'On' : 'Off'}
                </span>
              </div>
              <div className="setting-item">
                <span>SMS Alerts</span>
                <span className={`setting-value ${profile?.notification_preferences?.sms ? 'on' : 'off'}`}>
                  {profile?.notification_preferences?.sms ? 'On' : 'Off'}
                </span>
              </div>
              <div className="setting-item">
                <span>Push Notifications</span>
                <span className={`setting-value ${profile?.notification_preferences?.push ? 'on' : 'off'}`}>
                  {profile?.notification_preferences?.push ? 'On' : 'Off'}
                </span>
              </div>
            </div>
            <button className="btn btn-secondary">Manage Preferences</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerProfile;