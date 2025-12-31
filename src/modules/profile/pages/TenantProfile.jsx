// src/modules/profile/pages/TenantProfile.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../shared/context/AuthContext'
import VerifiedBadge, { InlineVerifiedBadge } from '../../../../shared/components/VerifiedBadge'
import './TenantProfile.css'

const TenantProfile = () => {
  const { user, updateUser, isVerified, verificationStatus } = useAuth()
  const navigate = useNavigate()
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    bio: '',
    occupation: '',
    employer: '',
    annualIncome: '',
    references: [],
    preferences: {
      location: '',
      propertyType: '',
      budget: '',
      amenities: []
    }
  })

  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfileData()
  }, [user])

  const loadProfileData = () => {
    // Load from localStorage or use user data
    const savedProfile = JSON.parse(localStorage.getItem(`profile_${user?.id}`) || '{}')
    
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      avatar: user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=10b981&color=fff`,
      bio: savedProfile.bio || '',
      occupation: savedProfile.occupation || '',
      employer: savedProfile.employer || '',
      annualIncome: savedProfile.annualIncome || '',
      references: savedProfile.references || [],
      preferences: savedProfile.preferences || {
        location: '',
        propertyType: '',
        budget: '',
        amenities: []
      }
    })
    
    setLoading(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = () => {
    // Save to localStorage
    localStorage.setItem(`profile_${user?.id}`, JSON.stringify(profileData))
    
    // Update user context
    updateUser({
      name: profileData.name,
      phone: profileData.phone,
      avatar: profileData.avatar
    })
    
    setEditMode(false)
    alert('Profile updated successfully!')
  }

  const addReference = () => {
    const newReference = {
      id: Date.now(),
      name: '',
      relationship: '',
      phone: '',
      email: ''
    }
    setProfileData(prev => ({
      ...prev,
      references: [...prev.references, newReference]
    }))
  }

  const updateReference = (index, field, value) => {
    const updatedReferences = [...profileData.references]
    updatedReferences[index][field] = value
    setProfileData(prev => ({ ...prev, references: updatedReferences }))
  }

  const removeReference = (index) => {
    const updatedReferences = profileData.references.filter((_, i) => i !== index)
    setProfileData(prev => ({ ...prev, references: updatedReferences }))
  }

  if (loading) {
    return <div className="loading-state">Loading profile...</div>
  }

  return (
    <div className="tenant-profile">
      {/* Header */}
      <div className="profile-header">
        <div className="header-content">
          <h1>My Profile</h1>
          <p>Manage your account information and preferences</p>
        </div>
        <div className="header-actions">
          {editMode ? (
            <>
              <button className="btn btn-secondary" onClick={() => setEditMode(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveProfile}>
                Save Changes
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => setEditMode(true)}>
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="profile-card">
        <div className="profile-basic">
          <div className="avatar-section">
            <div className="avatar-container">
              <img src={profileData.avatar} alt={profileData.name} />
              {isVerified && (
                <div className="verified-badge-large">
                  <VerifiedBadge type="tenant" />
                </div>
              )}
            </div>
            {editMode ? (
              <input
                type="text"
                name="avatar"
                value={profileData.avatar}
                onChange={handleInputChange}
                placeholder="Avatar URL"
                className="avatar-input"
              />
            ) : (
              <div className="verification-status">
                {isVerified ? (
                  <div className="verified-status">
                    <span className="status-icon">✅</span>
                    <span>Verified Tenant</span>
                  </div>
                ) : (
                  <div className="not-verified-status">
                    <span className="status-icon">⚠️</span>
                    <span>Not Verified</span>
                    <button className="btn-verify" onClick={() => navigate('/verify')}>
                      Get Verified
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="info-section">
            {editMode ? (
              <>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    disabled // Email usually can't be changed
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            ) : (
              <>
                <h2>{profileData.name}</h2>
                <p className="profile-email">{profileData.email}</p>
                <p className="profile-phone">{profileData.phone}</p>
                {profileData.occupation && (
                  <p className="profile-occupation">
                    <strong>Occupation:</strong> {profileData.occupation}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bio Section */}
        <div className="profile-section">
          <h3>About Me</h3>
          {editMode ? (
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleInputChange}
              placeholder="Tell landlords about yourself..."
              rows="4"
            />
          ) : (
            <p>{profileData.bio || 'No bio added yet.'}</p>
          )}
        </div>

        {/* Occupation Details */}
        {editMode && (
          <div className="profile-section">
            <h3>Employment Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Occupation</label>
                <input
                  type="text"
                  name="occupation"
                  value={profileData.occupation}
                  onChange={handleInputChange}
                  placeholder="e.g., Software Engineer"
                />
              </div>
              <div className="form-group">
                <label>Employer</label>
                <input
                  type="text"
                  name="employer"
                  value={profileData.employer}
                  onChange={handleInputChange}
                  placeholder="e.g., Tech Company Ltd."
                />
              </div>
            </div>
            <div className="form-group">
              <label>Annual Income (₦)</label>
              <input
                type="number"
                name="annualIncome"
                value={profileData.annualIncome}
                onChange={handleInputChange}
                placeholder="e.g., 5000000"
              />
            </div>
          </div>
        )}

        {/* References */}
        <div className="profile-section">
          <div className="section-header">
            <h3>References</h3>
            {editMode && (
              <button className="btn btn-sm btn-outline" onClick={addReference}>
                + Add Reference
              </button>
            )}
          </div>
          
          {profileData.references.length > 0 ? (
            <div className="references-list">
              {profileData.references.map((ref, index) => (
                <div key={ref.id} className="reference-card">
                  {editMode ? (
                    <div className="reference-form">
                      <input
                        type="text"
                        value={ref.name}
                        onChange={(e) => updateReference(index, 'name', e.target.value)}
                        placeholder="Reference Name"
                      />
                      <input
                        type="text"
                        value={ref.relationship}
                        onChange={(e) => updateReference(index, 'relationship', e.target.value)}
                        placeholder="Relationship"
                      />
                      <input
                        type="tel"
                        value={ref.phone}
                        onChange={(e) => updateReference(index, 'phone', e.target.value)}
                        placeholder="Phone"
                      />
                      <input
                        type="email"
                        value={ref.email}
                        onChange={(e) => updateReference(index, 'email', e.target.value)}
                        placeholder="Email"
                      />
                      <button 
                        className="btn-remove-reference"
                        onClick={() => removeReference(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <h4>{ref.name}</h4>
                      <p><strong>Relationship:</strong> {ref.relationship}</p>
                      <p><strong>Phone:</strong> {ref.phone}</p>
                      <p><strong>Email:</strong> {ref.email}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-text">No references added.</p>
          )}
        </div>

        {/* Rental Preferences */}
        <div className="profile-section">
          <h3>Rental Preferences</h3>
          {editMode ? (
            <div className="preferences-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Preferred Location</label>
                  <input
                    type="text"
                    name="preferences.location"
                    value={profileData.preferences.location}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, location: e.target.value }
                    }))}
                    placeholder="e.g., Lekki, Ikeja"
                  />
                </div>
                <div className="form-group">
                  <label>Property Type</label>
                  <select
                    value={profileData.preferences.propertyType}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, propertyType: e.target.value }
                    }))}
                  >
                    <option value="">Any Type</option>
                    <option value="self_contain">Self Contain</option>
                    <option value="1_bedroom">1 Bedroom</option>
                    <option value="2_bedroom">2 Bedroom</option>
                    <option value="3_bedroom">3 Bedroom</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Monthly Budget (₦)</label>
                <input
                  type="number"
                  value={profileData.preferences.budget}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, budget: e.target.value }
                  }))}
                  placeholder="e.g., 300000"
                />
              </div>
            </div>
          ) : (
            <div className="preferences-display">
              <p><strong>Location:</strong> {profileData.preferences.location || 'Not specified'}</p>
              <p><strong>Property Type:</strong> {profileData.preferences.propertyType || 'Any'}</p>
              <p><strong>Budget:</strong> {profileData.preferences.budget ? `₦${parseInt(profileData.preferences.budget).toLocaleString()}` : 'Not specified'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="profile-stats">
        <h3>Profile Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">
              {JSON.parse(localStorage.getItem(`applications_${user?.id}`) || '[]').length}
            </div>
            <div className="stat-label">Applications</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">
              {JSON.parse(localStorage.getItem(`saved_properties_${user?.id}`) || '[]').length}
            </div>
            <div className="stat-label">Saved Properties</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">
              {JSON.parse(localStorage.getItem('listings') || '[]').filter(l => l.posterId === user?.id).length}
            </div>
            <div className="stat-label">Listed Properties</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">
              {isVerified ? '85' : '65'}
            </div>
            <div className="stat-label">Trust Score</div>
          </div>
        </div>
      </div>

      {/* Verification Section */}
      {!isVerified && (
        <div className="verification-cta">
          <div className="cta-content">
            <h3>Get Verified to Boost Your Profile</h3>
            <p>Verified tenants get priority from landlords, higher response rates, and better rental opportunities.</p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/verify')}>
              Verify Your Account Now
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TenantProfile