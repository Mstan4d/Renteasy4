// src/modules/properties/components/steps/BasicInfoStep.jsx
import React from 'react';
import { User, Phone, Mail, Home, Tag } from 'lucide-react';
import './BasicInfoStep.css';

const BasicInfoStep = ({ formData, updateFormData, userRole }) => {
  const propertyTypes = [
    { value: 'self-contained', label: 'Self-contained' },
    { value: '1br-flat', label: '1-bedroom flat' },
    { value: '2br-flat', label: '2-bedroom flat' },
    { value: '3br-flat', label: '3-bedroom flat' },
    { value: '1br-duplex', label: '1-bedroom duplex' },
    { value: '2br-duplex', label: '2-bedroom duplex' },
    { value: '3br-duplex', label: '3-bedroom duplex' },
    { value: 'studio', label: 'Studio apartment' },
    { value: 'commercial', label: 'Commercial space' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  // User role display mapping
  const roleDisplay = {
    'tenant': 'Outgoing Tenant',
    'landlord': 'Landlord',
    'manager': 'Property Manager',
    'admin': 'Administrator'
  };

  return (
    <div className="basic-info-step">
      <div className="step-header">
        <h2>Basic Information</h2>
        <div className="user-role-badge">
          <User size={16} />
          <span>Posting as: {roleDisplay[userRole]}</span>
        </div>
      </div>
      
      <div className="form-grid">
        {/* Title */}
        <div className="form-group">
          <label htmlFor="title">
            <Home size={16} />
            Property Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Spacious 2BR near Yaba"
            required
          />
        </div>

        {/* Description */}
        <div className="form-group full-width">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Describe the property, amenities, special features..."
            required
          />
          <small className="help-text">
            Include details about furniture, amenities, parking, security, etc.
          </small>
        </div>

        {/* Price */}
        <div className="form-group">
          <label htmlFor="price">Monthly Rent (₦) *</label>
          <div className="input-with-icon">
            <span className="input-prefix">₦</span>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              required
            />
          </div>
        </div>

        {/* Property Type */}
        <div className="form-group">
          <label htmlFor="propertyType">Property Type *</label>
          <select
            id="propertyType"
            name="propertyType"
            value={formData.propertyType}
            onChange={handleChange}
            required
          >
            <option value="">Select type</option>
            {propertyTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Contact Phone */}
        <div className="form-group">
          <label htmlFor="contactPhone">
            <Phone size={16} />
            Contact Phone *
          </label>
          <input
            type="tel"
            id="contactPhone"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            placeholder="+234 800 000 0000"
            required
          />
        </div>

        {/* Contact Email */}
        <div className="form-group">
          <label htmlFor="contactEmail">
            <Mail size={16} />
            Contact Email *
          </label>
          <input
            type="email"
            id="contactEmail"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
        </div>

        {/* Referral Code (Optional) */}
        <div className="form-group full-width">
          <label htmlFor="referralCode">
            <Tag size={16} />
            Referral Code (Optional)
          </label>
          <input
            type="text"
            id="referralCode"
            name="referralCode"
            value={formData.referralCode}
            onChange={handleChange}
            placeholder="Enter referral code if referred by someone"
          />
          <small className="help-text">
            If you were referred by another RentEasy user, enter their code for 1% referral commission
          </small>
        </div>

        {/* Landlord Consent for Outgoing Tenants */}
        {userRole === 'tenant' && (
          <div className="form-group full-width">
            <div className="consent-checkbox">
              <input
                type="checkbox"
                id="hasLandlordConsent"
                name="hasLandlordConsent"
                checked={formData.hasLandlordConsent}
                onChange={(e) => updateFormData({ hasLandlordConsent: e.target.checked })}
              />
              <label htmlFor="hasLandlordConsent">
                I confirm that I have informed my landlord about this tenant takeover listing
              </label>
            </div>
            <small className="help-text">
              Note: Admin will verify with your landlord before publishing the listing.
              Listing without landlord consent will be rejected.
            </small>
          </div>
        )}
      </div>

      <div className="step-requirements">
        <p className="required-note">
          * Required fields
        </p>
      </div>
    </div>
  );
};

export default BasicInfoStep;