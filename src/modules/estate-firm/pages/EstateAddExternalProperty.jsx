import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, MapPin, User, DollarSign, Percent, Settings, Save } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import './EstateAddExternalProperty.css';

const EstateAddExternalProperty = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    propertyName: '',
    address: '',
    city: '',
    state: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to add property');
      return;
    }

    setLoading(true);

    try {
      // 1. Create or find landlord contact
      let landlordId = null;
      if (formData.clientName) {
        const { data: existing } = await supabase
          .from('contacts')
          .select('id')
          .or(`phone.eq.${formData.clientPhone},email.eq.${formData.clientEmail}`)
          .maybeSingle();

        if (existing) {
          landlordId = existing.id;
        } else {
          const { data: newContact, error: contactError } = await supabase
            .from('contacts')
            .insert({
              name: formData.clientName,
              phone: formData.clientPhone || null,
              email: formData.clientEmail || null,
              type: 'landlord',
              estate_firm_id: user.id // links to estate firm
            })
            .select()
            .single();

          if (contactError) throw contactError;
          landlordId = newContact.id;
        }
      }

      // 2. Insert property (now with all columns)
      const { data: property, error: propError } = await supabase
        .from('properties')
        .insert({
          estate_firm_id: user.id,
          landlord_id: landlordId,
          title: formData.propertyName,
          address: formData.address,
          city: formData.city || null,
          state: formData.state || null,
          lga: formData.lga || null,
          property_type: formData.propertyType,
          status: 'active',
          description: formData.notes,
          commission_rate: parseFloat(formData.commissionRate) || null,
          management_level: formData.managementLevel,
          contract_start: formData.contractStart || null,
          contract_end: formData.contractEnd || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (propError) throw propError;

      // 3. Insert unit
      if (formData.rentAmount) {
        const { error: unitError } = await supabase
          .from('units')
          .insert({
            property_id: property.id,
            unit_number: '1',
            rent_amount: parseFloat(formData.rentAmount),
            rent_frequency: formData.rentFrequency,
            status: 'vacant',
            bedrooms: 0,
            bathrooms: 0,
            area_sqm: null
          });

        if (unitError) throw unitError;
      }

      // 4. Log activity
      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'property',
        action: 'add_external',
        description: `Added external property: ${formData.propertyName}`,
        created_at: new Date().toISOString()
      });

      alert('External property added successfully!');
      navigate('/dashboard/estate-firm/properties');

    } catch (error) {
      console.error('Error adding external property:', error);
      alert('Failed to add property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-external-property-page">
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
              <label>City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                placeholder="e.g., Lagos"
              />
            </div>

            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                placeholder="e.g., Lagos State"
              />
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
            <h3>Landlord Information</h3>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Landlord Name *</label>
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
            <h3>Rent Details</h3>
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

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/dashboard/estate-firm')}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={18} />
            {loading ? 'Adding...' : 'Add to Portfolio'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EstateAddExternalProperty;