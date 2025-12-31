// src/modules/profile/pages/LandlordProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import './LandlordProfile.css';

const LandlordProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
    idType: 'national_id',
    idNumber: '',
    profileImage: ''
  });

  useEffect(() => {
    const loadProfileData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockData = {
          name: user?.name || 'Property Owner',
          email: user?.email || 'landlord@example.com',
          phone: '+234 802 345 6789',
          address: '123 Landlord Street, Lagos, Nigeria',
          joinDate: '2023-06-15',
          verified: true,
          commissionRate: '7.5%',
          propertiesListed: 12,
          totalEarnings: 1250000,
          rating: 4.8,
          bankName: 'Zenith Bank',
          accountNumber: '1234567890',
          accountName: 'Property Owner',
          idType: 'national_id',
          idNumber: 'A123456789',
          profileImage: user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'Landlord'}&background=5930e0&color=fff&size=150`,
          kycStatus: 'verified',
          documents: [
            { id: 1, name: 'National ID', status: 'verified' },
            { id: 2, name: 'Proof of Address', status: 'verified' },
            { id: 3, name: 'Bank Verification', status: 'verified' }
          ]
        };
        
        setProfileData(mockData);
        setFormData({
          name: mockData.name,
          email: mockData.email,
          phone: mockData.phone,
          address: mockData.address,
          bankName: mockData.bankName,
          accountNumber: mockData.accountNumber,
          accountName: mockData.accountName,
          idType: mockData.idType,
          idNumber: mockData.idNumber,
          profileImage: mockData.profileImage
        });
        
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadProfileData();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update profile data
      setProfileData(prev => ({
        ...prev,
        ...formData
      }));
      
      setIsEditing(false);
      // Show success message
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // In real app, upload to cloud storage
    const imageUrl = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      profileImage: imageUrl
    }));
  };

  const goBackToDashboard = () => {
    navigate('/dashboard/landlord');
  };

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
      {/* Header */}
      <div className="profile-header">
        <button 
          className="btn btn-back"
          onClick={goBackToDashboard}
        >
          ← Back to Dashboard
        </button>
        <h1>My Profile</h1>
        {!isEditing && (
          <button 
            className="btn btn-primary"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Main Profile Content */}
      <div className="profile-content">
        {/* Left Column - Profile Overview */}
        <div className="profile-overview">
          <div className="profile-card">
            <div className="profile-image-section">
              <div className="image-container">
                <img 
                  src={isEditing ? formData.profileImage : profileData?.profileImage} 
                  alt="Profile" 
                  className="profile-image"
                />
                {isEditing && (
                  <label className="upload-overlay">
                    📷 Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>
              
              <div className="profile-basic-info">
                <h2>{isEditing ? formData.name : profileData?.name}</h2>
                <p className="profile-email">{isEditing ? formData.email : profileData?.email}</p>
                <div className="verification-badge">
                  {profileData?.kycStatus === 'verified' ? '✅ Verified Landlord' : '⚠️ Pending Verification'}
                </div>
                <div className="profile-stats">
                  <div className="stat-item">
                    <span className="stat-label">Properties</span>
                    <span className="stat-value">{profileData?.propertiesListed}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Rating</span>
                    <span className="stat-value">{profileData?.rating}/5</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Since</span>
                    <span className="stat-value">{profileData?.joinDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Commission Info */}
            <div className="commission-info">
              <h4>Commission Rate</h4>
              <div className="commission-rate-display">
                <span className="rate-value">{profileData?.commissionRate}</span>
                <span className="rate-label">per successful rental</span>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="documents-card">
            <h3>Verification Documents</h3>
            <div className="documents-list">
              {profileData?.documents.map(doc => (
                <div key={doc.id} className="document-item">
                  <span className="document-name">{doc.name}</span>
                  <span className={`document-status ${doc.status}`}>
                    {doc.status === 'verified' ? '✅ Verified' : '⏳ Pending'}
                  </span>
                </div>
              ))}
            </div>
            <button className="btn btn-outline btn-sm">
              Upload New Document
            </button>
          </div>
        </div>

        {/* Right Column - Profile Form */}
        <div className="profile-form-section">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-section">
                <h3>Personal Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Bank Account Details</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="bankName">Bank Name</label>
                    <input
                      type="text"
                      id="bankName"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="accountNumber">Account Number</label>
                    <input
                      type="text"
                      id="accountNumber"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="accountName">Account Name</label>
                    <input
                      type="text"
                      id="accountName"
                      name="accountName"
                      value={formData.accountName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Identity Verification</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="idType">ID Type</label>
                    <select
                      id="idType"
                      name="idType"
                      value={formData.idType}
                      onChange={handleInputChange}
                    >
                      <option value="national_id">National ID</option>
                      <option value="passport">International Passport</option>
                      <option value="driver_license">Driver's License</option>
                      <option value="voters_card">Voter's Card</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="idNumber">ID Number</label>
                    <input
                      type="text"
                      id="idNumber"
                      name="idNumber"
                      value={formData.idNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-details">
              <div className="detail-section">
                <h3>Contact Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{profileData?.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{profileData?.phone}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Address</span>
                    <span className="detail-value">{profileData?.address}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Bank Details</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Bank Name</span>
                    <span className="detail-value">{profileData?.bankName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Account Number</span>
                    <span className="detail-value">{profileData?.accountNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Account Name</span>
                    <span className="detail-value">{profileData?.accountName}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Identity Verification</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">ID Type</span>
                    <span className="detail-value">
                      {profileData?.idType === 'national_id' && 'National ID'}
                      {profileData?.idType === 'passport' && 'International Passport'}
                      {profileData?.idType === 'driver_license' && "Driver's License"}
                      {profileData?.idType === 'voters_card' && "Voter's Card"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">ID Number</span>
                    <span className="detail-value">{profileData?.idNumber}</span>
                  </div>
                </div>
              </div>

              <div className="account-actions">
                <button className="btn btn-outline">
                  Change Password
                </button>
                <button className="btn btn-outline">
                  Privacy Settings
                </button>
                <button className="btn btn-outline btn-danger">
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandlordProfile;