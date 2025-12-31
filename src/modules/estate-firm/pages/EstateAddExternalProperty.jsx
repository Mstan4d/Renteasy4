import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, MapPin, User, DollarSign, Percent, Settings, Save } from 'lucide-react';
import './EstateAddExternalProperty.css';

const EstateAddExternalProperty = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    propertyName: '',
    address: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    propertyType: 'residential',
    rentAmount: '',
    rentFrequency: 'monthly',
    commissionRate: 7.5,
    managementLevel: 'full',
    nextRentDue: '',
    contractStart: '',
    contractEnd: '',
    notes: ''
  });

  const propertyTypes = [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'office', label: 'Office Space' },
    { value: 'shop', label: 'Shop/Retail' },
    { value: 'warehouse', label: 'Warehouse' },
    { value: 'land', label: 'Land' }
  ];

  const managementLevels = [
    { value: 'full', label: 'Full Management', description: 'Rent collection + maintenance + tenant management' },
    { value: 'rent-only', label: 'Rent Collection Only', description: 'Only handle rent collection' },
    { value: 'maintenance-only', label: 'Maintenance Only', description: 'Only handle property maintenance' },
    { value: 'letting-only', label: 'Letting Only', description: 'Only handle tenant finding' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save to local storage or API
    localStorage.setItem('externalProperties', JSON.stringify([...JSON.parse(localStorage.getItem('externalProperties') || '[]'), formData]));
    
    alert('External property added successfully!');
    navigate('/dashboard/estate-firm');
  };

  return (
    <div className="add-external-property-page">
      {/* Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard/estate-firm')}>
          <ArrowLeft size={20} />
        </button>
        <h1>Add External Property</h1>
        <p>Add properties you manage outside RentEasy for portfolio tracking</p>
      </div>

      <form onSubmit={handleSubmit} className="external-property-form">
        {/* Property Details */}
        <div className="form-section">
          <div className="section-header">
            <Building size={20} />
            <h3>Property Details</h3>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Property Name *</label>
              <input
                type="text"
                value={formData.propertyName}
                onChange={(e) => setFormData({...formData, propertyName: e.target.value})}
                placeholder="e.g., 3-Bedroom Duplex, Lekki"
                required
              />
            </div>

            <div className="form-group">
              <label>Address *</label>
              <div className="input-with-icon">
                <MapPin size={18} />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Full property address"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Property Type</label>
              <div className="property-type-grid">
                {propertyTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    className={`type-btn ${formData.propertyType === type.value ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, propertyType: type.value})}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="form-section">
          <div className="section-header">
            <User size={20} />
            <h3>Client/Owner Information</h3>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Client Name *</label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                placeholder="Property owner's name"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={formData.clientPhone}
                onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                placeholder="+234 801 234 5678"
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                placeholder="client@email.com"
              />
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="form-section">
          <div className="section-header">
            <DollarSign size={20} />
            <h3>Financial Details</h3>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Rent Amount (₦)</label>
              <div className="input-with-icon">
                <DollarSign size={18} />
                <input
                  type="number"
                  value={formData.rentAmount}
                  onChange={(e) => setFormData({...formData, rentAmount: e.target.value})}
                  placeholder="e.g., 2500000"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Rent Frequency</label>
              <select
                value={formData.rentFrequency}
                onChange={(e) => setFormData({...formData, rentFrequency: e.target.value})}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="form-group">
              <label>Your Commission (%)</label>
              <div className="input-with-icon">
                <Percent size={18} />
                <input
                  type="number"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({...formData, commissionRate: e.target.value})}
                  min="1"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Management Details */}
        <div className="form-section">
          <div className="section-header">
            <Settings size={20} />
            <h3>Management Details</h3>
          </div>
          
          <div className="management-levels">
            {managementLevels.map(level => (
              <div key={level.value} className="management-card">
                <input
                  type="radio"
                  id={level.value}
                  name="managementLevel"
                  value={level.value}
                  checked={formData.managementLevel === level.value}
                  onChange={(e) => setFormData({...formData, managementLevel: e.target.value})}
                />
                <label htmlFor={level.value}>
                  <strong>{level.label}</strong>
                  <p>{level.description}</p>
                </label>
              </div>
            ))}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Contract Start Date</label>
              <input
                type="date"
                value={formData.contractStart}
                onChange={(e) => setFormData({...formData, contractStart: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Contract End Date</label>
              <input
                type="date"
                value={formData.contractEnd}
                onChange={(e) => setFormData({...formData, contractEnd: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Next Rent Due Date</label>
              <input
                type="date"
                value={formData.nextRentDue}
                onChange={(e) => setFormData({...formData, nextRentDue: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Any additional information about this property..."
              rows="3"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/dashboard/estate-firm')}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <Save size={18} />
            Add to Portfolio
          </button>
        </div>
      </form>
    </div>
  );
};

export default EstateAddExternalProperty;