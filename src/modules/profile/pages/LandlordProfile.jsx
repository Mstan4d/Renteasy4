// src/modules/profile/pages/LandlordProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './LandlordProfile.css';

const LandlordProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    state: '',
    lga: '',
    bank_name: '',
    account_number: '',
    account_name: '',
    id_type: 'national_id',
    id_number: '',
    avatar_url: ''
  });

  // Real stats from Supabase
  const [stats, setStats] = useState({
    propertiesListed: 0,
    totalEarnings: 0,
    rating: 0,
    joinDate: null
  });

  useEffect(() => {
    if (user) {
      loadProfileData();
      loadStats();
    } else {
      navigate('/login');
    }
  }, [user]);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        // Parse bank_details if stored as JSON
        let bankDetails = {};
        if (data.bank_details && typeof data.bank_details === 'object') {
          bankDetails = data.bank_details;
        } else if (typeof data.bank_details === 'string') {
          try {
            bankDetails = JSON.parse(data.bank_details);
          } catch (e) { /* ignore */ }
        }

        const profile = {
          ...data,
          full_name: data.full_name || data.name || '',
          email: data.email || user.email,
          phone: data.phone || '',
          address: data.address || '',
          state: data.state || '',
          lga: data.lga || '',
          bank_name: bankDetails.bank_name || data.bank_name || '',
          account_number: bankDetails.account_number || data.account_number || '',
          account_name: bankDetails.account_name || data.account_name || '',
          id_type: data.id_type || '',
          id_number: data.id_number || '',
          avatar_url: data.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.full_name || 'Landlord')}&background=5930e0&color=fff&size=150`,
          kyc_status: data.kyc_status || 'not_started',
          created_at: data.created_at
        };
        setProfileData(profile);
        setFormData({
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
          state: profile.state,
          lga: profile.lga,
          bank_name: profile.bank_name,
          account_number: profile.account_number,
          account_name: profile.account_name,
          id_type: profile.id_type,
          id_number: profile.id_number,
          avatar_url: profile.avatar_url
        });
      } else {
        console.warn('No profile found for landlord');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      alert('Could not load profile data. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  };

  // Count properties listed by this landlord (both RentEasy and external)
  const loadStats = async () => {
    try {
      // 1. Count properties listed by this landlord (poster_role = 'landlord')
      const { count: propertiesCount, error: countError } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('poster_role', 'landlord');

      if (countError) throw countError;

      // 2. Total earnings (commission earned from referrals)
      const { data: commissions, error: commError } = await supabase
        .from('commissions')
        .select('referrer_share')
        .eq('referrer_id', user.id)
        .eq('paid_to_referrer', true);

      if (commError) throw commError;
      const totalEarnings = commissions?.reduce((sum, c) => sum + (c.referrer_share || 0), 0) || 0;

      // 3. Rating – from profiles or listings; if not available, keep 0
      const rating = profileData?.rating || 0;

      setStats({
        propertiesListed: propertiesCount || 0,
        totalEarnings,
        rating,
        joinDate: profileData?.created_at
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatars/${user.id}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      const avatarUrl = publicUrlData.publicUrl;

      setFormData(prev => ({ ...prev, avatar_url: avatarUrl }));
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const bankDetails = {
        bank_name: formData.bank_name,
        account_number: formData.account_number,
        account_name: formData.account_name
      };

      const updates = {
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address,
        state: formData.state,
        lga: formData.lga,
        id_type: formData.id_type,
        id_number: formData.id_number,
        bank_details: bankDetails,
        avatar_url: formData.avatar_url,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setProfileData(prev => ({
        ...prev,
        ...updates,
        bank_name: bankDetails.bank_name,
        account_number: bankDetails.account_number,
        account_name: bankDetails.account_name
      }));

      if (updateUser) {
        await updateUser({ name: formData.full_name, avatar_url: formData.avatar_url });
      }

      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const goBackToDashboard = () => navigate('/dashboard/landlord');

  if (isLoading && !profileData) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="landlord-profile-container">
      <div className="profile-header">
        <button className="btn btn-back" onClick={goBackToDashboard}>← Back to Dashboard</button>
        <h1>My Profile</h1>
        {!isEditing && (
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
        )}
      </div>

      <div className="profile-content">
        {/* Left Column */}
        <div className="profile-overview">
          <div className="profile-card">
            <div className="profile-image-section">
              <div className="image-container">
                <img src={formData.avatar_url || profileData?.avatar_url} alt="Profile" className="profile-image" />
                {isEditing && (
                  <label className="upload-overlay">
                    {uploadingImage ? 'Uploading...' : '📷 Upload'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploadingImage} />
                  </label>
                )}
              </div>
              <div className="profile-basic-info">
                <h2>{isEditing ? formData.full_name : profileData?.full_name}</h2>
                <p className="profile-email">{profileData?.email}</p>
                <div className="verification-badge">
                  {profileData?.kyc_status === 'approved' ? '✅ Verified Landlord' : '⚠️ Pending Verification'}
                </div>
                <div className="profile-stats">
                  <div className="stat-item">
                    <span className="stat-label">Properties</span>
                    <span className="stat-value">{stats.propertiesListed}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Rating</span>
                    <span className="stat-value">{stats.rating || 'N/A'}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Member Since</span>
                    <span className="stat-value">{profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="commission-info">
              <h4>Commission Rate</h4>
              <div className="commission-rate-display">
                <span className="rate-value">1.5%</span>
                <span className="rate-label">per successful rental (as referrer)</span>
              </div>
            </div>

            <div className="earnings-info">
              <h4>Total Earnings</h4>
              <div className="earnings-display">
                <span className="earnings-value">₦{stats.totalEarnings.toLocaleString()}</span>
                <span className="earnings-label">paid out</span>
              </div>
            </div>
          </div>

          {/* Documents Section – KYC status */}
          <div className="documents-card">
            <h3>Verification Documents</h3>
            <div className="documents-list">
              {profileData?.kyc_status === 'approved' ? (
                <div className="document-item">
                  <span className="document-name">KYC Status</span>
                  <span className="document-status verified">✅ Verified</span>
                </div>
              ) : (
                <div className="document-item">
                  <span className="document-name">KYC not completed</span>
                  <span className="document-status pending">⏳ Pending</span>
                </div>
              )}
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/verify/submit')}>
              {profileData?.kyc_status === 'approved' ? 'View KYC' : 'Complete KYC'}
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="profile-form-section">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              {/* Personal Information */}
              <div className="form-section">
                <h3>Personal Information</h3>
                <div className="form-grid">
                  <div className="form-group"><label>Full Name</label><input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} required /></div>
                  <div className="form-group"><label>Email</label><input type="email" name="email" value={formData.email} disabled className="disabled-input" /></div>
                  <div className="form-group"><label>Phone</label><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} /></div>
                  <div className="form-group"><label>Address</label><input type="text" name="address" value={formData.address} onChange={handleInputChange} /></div>
                  <div className="form-group"><label>State</label><input type="text" name="state" value={formData.state} onChange={handleInputChange} /></div>
                  <div className="form-group"><label>LGA</label><input type="text" name="lga" value={formData.lga} onChange={handleInputChange} /></div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="form-section">
                <h3>Bank Account Details</h3>
                <div className="form-grid">
                  <div className="form-group"><label>Bank Name</label><input type="text" name="bank_name" value={formData.bank_name} onChange={handleInputChange} /></div>
                  <div className="form-group"><label>Account Number</label><input type="text" name="account_number" value={formData.account_number} onChange={handleInputChange} /></div>
                  <div className="form-group"><label>Account Name</label><input type="text" name="account_name" value={formData.account_name} onChange={handleInputChange} /></div>
                </div>
              </div>

              {/* Identity Verification */}
              <div className="form-section">
                <h3>Identity Verification</h3>
                <div className="form-grid">
                  <div className="form-group"><label>ID Type</label>
                    <select name="id_type" value={formData.id_type} onChange={handleInputChange}>
                      <option value="national_id">National ID Card</option>
                      <option value="passport">International Passport</option>
                      <option value="driver_license">Driver's License</option>
                      <option value="voters_card">Voter's Card</option>
                    </select>
                  </div>
                  <div className="form-group"><label>ID Number</label><input type="text" name="id_number" value={formData.id_number} onChange={handleInputChange} /></div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setIsEditing(false)} disabled={isLoading}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isLoading || uploadingImage}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-details">
              <div className="detail-section">
                <h3>Contact Information</h3>
                <div className="detail-grid">
                  <div className="detail-item"><span className="detail-label">Email</span><span className="detail-value">{profileData?.email}</span></div>
                  <div className="detail-item"><span className="detail-label">Phone</span><span className="detail-value">{profileData?.phone || 'Not provided'}</span></div>
                  <div className="detail-item"><span className="detail-label">Address</span><span className="detail-value">{profileData?.address || 'Not provided'}</span></div>
                  <div className="detail-item"><span className="detail-label">State</span><span className="detail-value">{profileData?.state || 'Not provided'}</span></div>
                  <div className="detail-item"><span className="detail-label">LGA</span><span className="detail-value">{profileData?.lga || 'Not provided'}</span></div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Bank Details</h3>
                <div className="detail-grid">
                  <div className="detail-item"><span className="detail-label">Bank Name</span><span className="detail-value">{profileData?.bank_name || 'Not provided'}</span></div>
                  <div className="detail-item"><span className="detail-label">Account Number</span><span className="detail-value">{profileData?.account_number || 'Not provided'}</span></div>
                  <div className="detail-item"><span className="detail-label">Account Name</span><span className="detail-value">{profileData?.account_name || 'Not provided'}</span></div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Identity Verification</h3>
                <div className="detail-grid">
                  <div className="detail-item"><span className="detail-label">ID Type</span><span className="detail-value">
                    {profileData?.id_type === 'national_id' && 'National ID'}
                    {profileData?.id_type === 'passport' && 'International Passport'}
                    {profileData?.id_type === 'driver_license' && "Driver's License"}
                    {profileData?.id_type === 'voters_card' && "Voter's Card"}
                    {!profileData?.id_type && 'Not provided'}
                  </span></div>
                  <div className="detail-item"><span className="detail-label">ID Number</span><span className="detail-value">{profileData?.id_number || 'Not provided'}</span></div>
                </div>
              </div>

              <div className="account-actions">
                <button className="btn btn-outline" onClick={() => alert('Change password – contact support')}>Change Password</button>
                <button className="btn btn-outline" onClick={() => alert('Privacy settings coming soon')}>Privacy Settings</button>
                <button className="btn btn-outline btn-danger" onClick={() => alert('Delete account – contact support')}>Delete Account</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandlordProfile;