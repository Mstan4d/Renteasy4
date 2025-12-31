// src/modules/dashboard/pages/tenant/TenantProfile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../shared/context/AuthContext';
import VerifiedBadge from '../../../../shared/components/VerifiedBadge';
import './TenantProfile.css';

const TenantProfile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    preferences: {
      notification: true,
      emailUpdates: true,
      smsAlerts: false
    }
  });
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (user) {
      const savedProfile = JSON.parse(localStorage.getItem(`tenant_profile_${user.id}`) || 'null');
      setProfile(savedProfile || {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: '',
        emergencyContact: {
          name: '',
          phone: '',
          relationship: ''
        },
        preferences: {
          notification: true,
          emailUpdates: true,
          smsAlerts: false
        }
      });
    }
  }, [user]);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem(`tenant_profile_${user.id}`, JSON.stringify(profile));
      updateUser({ ...user, ...profile });
      setEditMode(false);
      setLoading(false);
    }, 1000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="tenant-profile">
      <div className="profile-header">
        <h1>Profile Settings</h1>
        <button 
          className={`btn ${editMode ? 'btn-secondary' : 'btn-primary'}`}
          onClick={() => editMode ? handleSave() : setEditMode(true)}
          disabled={loading}
        >
          {loading ? 'Saving...' : editMode ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="profile-content">
        {/* Personal Information */}
        <div className="profile-section">
          <h3>Personal Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                disabled={!editMode}
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
                disabled={!editMode}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleInputChange}
                disabled={!editMode}
              />
            </div>
            <div className="form-group">
              <label>Current Address</label>
              <textarea
                name="address"
                value={profile.address}
                onChange={handleInputChange}
                disabled={!editMode}
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="profile-section">
          <h3>Emergency Contact</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Contact Name</label>
              <input
                type="text"
                name="emergencyContact.name"
                value={profile.emergencyContact.name}
                onChange={handleInputChange}
                disabled={!editMode}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="emergencyContact.phone"
                value={profile.emergencyContact.phone}
                onChange={handleInputChange}
                disabled={!editMode}
              />
            </div>
            <div className="form-group">
              <label>Relationship</label>
              <select
                name="emergencyContact.relationship"
                value={profile.emergencyContact.relationship}
                onChange={handleInputChange}
                disabled={!editMode}
              >
                <option value="">Select relationship</option>
                <option value="spouse">Spouse</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="friend">Friend</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="profile-section">
          <h3>Notification Preferences</h3>
          <div className="preferences-list">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="preferences.notification"
                checked={profile.preferences.notification}
                onChange={handleInputChange}
                disabled={!editMode}
              />
              <span>Push Notifications</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="preferences.emailUpdates"
                checked={profile.preferences.emailUpdates}
                onChange={handleInputChange}
                disabled={!editMode}
              />
              <span>Email Updates</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="preferences.smsAlerts"
                checked={profile.preferences.smsAlerts}
                onChange={handleInputChange}
                disabled={!editMode}
              />
              <span>SMS Alerts</span>
            </label>
          </div>
        </div>

        {/* Account Status */}
        <div className="profile-section">
          <h3>Account Status</h3>
          <div className="account-status">
            <div className="status-item">
              <span className="status-label">Verification Status:</span>
              <span className="status-value">
                {user?.isVerified ? (
                  <span className="verified-status">
                    <VerifiedBadge type="tenant" size="small" /> Verified
                  </span>
                ) : (
                  <span className="unverified-status">Not Verified</span>
                )}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Trust Score:</span>
              <span className="status-value score-high">85/100</span>
            </div>
            <div className="status-item">
              <span className="status-label">Member Since:</span>
              <span className="status-value">December 2024</span>
            </div>
          </div>
        </div>

        {editMode && (
          <div className="profile-actions">
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button className="btn btn-outline" onClick={() => setEditMode(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantProfile;