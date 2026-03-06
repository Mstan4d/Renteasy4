// src/modules/properties/components/steps/BasicInfoStep.jsx
import React from 'react';
import { DollarSign, Home, FileText, User, Plus, Trash2 } from 'lucide-react';

const BasicInfoStep = ({ formData, updateFormData, userRole, userProfile }) => {
  const propertyTypes = [
    { value: 'self_contain', label: 'Self Contain' },
    { value: '1_bedroom', label: '1 Bedroom' },
    { value: '2_bedroom', label: '2 Bedroom' },
    { value: '3_bedroom', label: '3 Bedroom' },
    { value: '4_bedroom', label: '4 Bedroom' },
    { value: '5_bedroom', label: '5 Bedroom' },
    { value: '6_bedroom', label: '6 Bedroom' },
    { value: 'studio', label: 'Studio' },
    { value: 'duplex', label: 'Duplex' },
    { value: 'bungalow', label: 'Bungalow' },
    { value: 'commercial', label: 'Commercial Space' },
    { value: 'flat', label: 'Flat' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'villa', label: 'Villa' },
    { value: 'penthouse', label: 'Penthouse' },
    { value: 'maisonette', label: 'Maisonette' },
    { value: 'mansion', label: 'Mansion' },
  ];

  const availableAmenities = [
    '24/7 Security',
    'Swimming Pool',
    'Gym',
    'Parking',
    'Water Supply',
    'Electricity',
    'Internet',
    'Garden',
    'Balcony',
    'Air Conditioning',
    'Heating',
    'Laundry',
    'Elevator',
    'Pet Friendly',
    'Furnished',
    'Unfurnished',
    'Semi-Furnished',
  ];

  const handleChange = (field, value) => {
    updateFormData({ [field]: value });
  };

  const handleAmenityChange = (amenity, isChecked) => {
    const currentAmenities = formData.amenities || [];
    const updatedAmenities = isChecked
      ? [...currentAmenities, amenity]
      : currentAmenities.filter(a => a !== amenity);
    updateFormData({ amenities: updatedAmenities });
  };

  // Extra fees handlers
  const addFee = () => {
    const currentFees = formData.extra_fees || [];
    updateFormData({
      extra_fees: [...currentFees, { name: '', amount: 0, description: '' }]
    });
  };

  const updateFee = (index, field, value) => {
    const updatedFees = [...(formData.extra_fees || [])];
    updatedFees[index] = { ...updatedFees[index], [field]: value };
    updateFormData({ extra_fees: updatedFees });
  };

  const removeFee = (index) => {
    const updatedFees = (formData.extra_fees || []).filter((_, i) => i !== index);
    updateFormData({ extra_fees: updatedFees });
  };

  return (
    <div className="basic-info-step">
      <div className="step-header">
        <h2>
          <Home size={24} />
          Basic Information
        </h2>
        <p className="step-subtitle">Tell us about your property</p>
      </div>

      {/* Property Title */}
      <div className="form-group">
        <label>
          <FileText size={18} />
          Property Title *
        </label>
        <input
          type="text"
          placeholder="e.g., 3 Bedroom Luxury Apartment in Lekki"
          value={formData.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          maxLength={100}
          required
        />
        <small className="hint">Make it descriptive to attract more views</small>
      </div>

      {/* Description */}
      <div className="form-group">
        <label>
          <FileText size={18} />
          Description *
        </label>
        <textarea
          placeholder="Describe your property in detail. Include amenities, features, neighborhood info, etc."
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={5}
          required
        />
        <small className="hint">
          {formData.description?.length || 0}/500 characters
        </small>
      </div>

      {/* Price */}
      <div className="form-group">
        <label>
          <DollarSign size={18} />
          Annual Rent (₦) * – NIGERIA STANDARD
        </label>
        <input
          type="number"
          placeholder="e.g., 1,800,000 (yearly)"
          value={formData.rent_amount || ''}
          onChange={(e) => handleChange('rent_amount', e.target.value)}
          min="0"
          step="10000"
          required
        />
        <small className="hint">
          {formData.rent_amount
            ? `₦${parseInt(formData.rent_amount || 0).toLocaleString()}/year (₦${(parseInt(formData.rent_amount || 0) / 12).toLocaleString()}/month)`
            : 'Enter the ANNUAL rent amount (Nigeria standard)'}
        </small>
      </div>

      {/* Property Type */}
      <div className="form-group">
        <label>
          <Home size={18} />
          Property Type *
        </label>
        <select
          value={formData.property_type || ''}
          onChange={(e) => handleChange('property_type', e.target.value)}
          required
        >
          <option value="">Select property type</option>
          {propertyTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Bedrooms & Bathrooms */}
      <div className="form-row">
        <div className="form-group">
          <label>Bedrooms</label>
          <select
            value={formData.bedrooms || 1}
            onChange={(e) => handleChange('bedrooms', parseInt(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'Bedroom' : 'Bedrooms'}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Bathrooms</label>
          <select
            value={formData.bathrooms || 1}
            onChange={(e) => handleChange('bathrooms', parseInt(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'Bathroom' : 'Bathrooms'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Area/Space */}
      <div className="form-group">
        <label>Area (Square Meters)</label>
        <input
          type="number"
          placeholder="e.g., 120"
          value={formData.area || ''}
          onChange={(e) => handleChange('area', e.target.value)}
          min="0"
        />
        <small className="hint">Optional - helps tenants understand space</small>
      </div>

      {/* Amenities */}
      <div className="form-group">
        <label>Amenities</label>
        <div className="amenities-grid">
          {availableAmenities.map((amenity) => (
            <div key={amenity} className="amenity-checkbox">
              <input
                type="checkbox"
                id={`amenity-${amenity}`}
                checked={formData.amenities?.includes(amenity) || false}
                onChange={(e) => handleAmenityChange(amenity, e.target.checked)}
              />
              <label htmlFor={`amenity-${amenity}`}>{amenity}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Extra Fees Section */}
      <div className="extra-fees-section">
        <h3>Additional Fees (Optional)</h3>
        <p className="section-hint">
          Add any one‑time charges like caution fee, legal fee, drink money, etc.
        </p>
        
        {(formData.extra_fees || []).map((fee, index) => (
          <div key={index} className="fee-row">
            <div className="fee-inputs">
              <input
                type="text"
                placeholder="Fee name (e.g., Caution Fee)"
                value={fee.name}
                onChange={(e) => updateFee(index, 'name', e.target.value)}
                className="fee-name-input"
              />
              <input
                type="number"
                placeholder="Amount (₦)"
                value={fee.amount}
                onChange={(e) => updateFee(index, 'amount', parseFloat(e.target.value) || 0)}
                className="fee-amount-input"
                min="0"
                step="1000"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={fee.description || ''}
                onChange={(e) => updateFee(index, 'description', e.target.value)}
                className="fee-desc-input"
              />
            </div>
            <button
              type="button"
              className="remove-fee-btn"
              onClick={() => removeFee(index)}
              aria-label="Remove fee"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        
        <button type="button" className="add-fee-btn" onClick={addFee}>
          <Plus size={16} />
          Add Fee
        </button>
      </div>

      {/* Contact Information */}
      <div className="contact-info-section">
        <h3>
          <User size={20} />
          Your Contact Information
        </h3>
        <div className="form-row">
          <div className="form-group">
            <label>Your Phone *</label>
            <input
              type="tel"
              placeholder="e.g., 08012345678"
              value={formData.contactPhone || userProfile?.phone || ''}
              onChange={(e) => handleChange('contactPhone', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Your Email *</label>
            <input
              type="email"
              placeholder="e.g., you@example.com"
              value={formData.contactEmail || userProfile?.email || ''}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Landlord Phone – Only for outgoing tenants */}
      {userRole === 'tenant' && (
        <div className="contact-info-section" style={{ marginTop: '20px' }}>
          <h4>Landlord's Contact (Optional but helpful)</h4>
          <div className="form-group">
            <label>Landlord's Phone Number</label>
            <input
              type="tel"
              placeholder="e.g., 08012345678"
              value={formData.landlord_phone || ''}
              onChange={(e) => handleChange('landlord_phone', e.target.value)}
            />
            <small className="hint">
              If you have the landlord's phone number, provide it – this helps our manager verify the listing faster.
            </small>
          </div>
        </div>
      )}

      {/* User Role Info */}
      <div className="user-role-notice">
        <p>
          <strong>Posting as:</strong> {userRole === 'tenant' ? '👤 Outgoing Tenant' : 
                                       userRole === 'landlord' ? '🏠 Landlord' : 
                                       userRole === 'estate-firm' ? '🏢 Estate Firm' : 
                                       'User'}
        </p>
        <small>
          {userRole === 'tenant' 
            ? 'You will earn 1.5% commission when someone rents your vacating property.'
            : userRole === 'landlord'
            ? 'You will earn 1.5% commission as the property poster.'
            : userRole === 'estate-firm'
            ? 'Estate firms pay 0% commission on property listings.'
            : 'Commission will be calculated based on your role.'}
        </small>
      </div>
    </div>
  );
};

export default BasicInfoStep;