import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building, MapPin, User, DollarSign, Percent, Settings, Save, Trash2 } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import './EstateEditProperty.css';

const EstateEditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    propertyName: '',
    address: '',
    city: '',
    state: '',
    lga: '',
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

  useEffect(() => {
    if (user && id) fetchProperty();
  }, [user, id]);

  const fetchProperty = async () => {
    setFetching(true);
    setError(null);
    try {
      // Fetch property with landlord info and units
      const { data: property, error: propError } = await supabase
        .from('properties')
        .select(`
          *,
          landlord:landlord_id (id, name, phone, email),
          units (id, unit_number, rent_amount, rent_frequency, status, bedrooms, bathrooms)
        `)
        .eq('id', id)
        .single();

      if (propError) throw propError;
      if (!property) throw new Error('Property not found');

      // Populate form
      setFormData({
        propertyName: property.title || '',
        address: property.address || '',
        city: property.city || '',
        state: property.state || '',
        lga: property.lga || '',
        clientName: property.landlord?.name || '',
        clientPhone: property.landlord?.phone || '',
        clientEmail: property.landlord?.email || '',
        propertyType: property.property_type || 'residential',
        rentAmount: property.units?.[0]?.rent_amount || '',
        rentFrequency: property.units?.[0]?.rent_frequency || 'monthly',
        commissionRate: property.commission_rate || 7.5,
        managementLevel: property.management_level || 'full',
        nextRentDue: property.contract_next_due || '', // you may need to add this column
        contractStart: property.contract_start || '',
        contractEnd: property.contract_end || '',
        notes: property.description || ''
      });
    } catch (err) {
      console.error('Error fetching property:', err);
      setError(err.message);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const sanitizeNumber = (val) => parseFloat(String(val).replace(/,/g, '')) || 0;
      const rentAmount = sanitizeNumber(formData.rentAmount);
      const commissionRate = sanitizeNumber(formData.commissionRate);

      // Update property
      const { error: propError } = await supabase
        .from('properties')
        .update({
          title: formData.propertyName,
          address: formData.address,
          city: formData.city || null,
          state: formData.state || null,
          lga: formData.lga || null,
          property_type: formData.propertyType,
          description: formData.notes,
          commission_rate: commissionRate || null,
          management_level: formData.managementLevel,
          contract_start: formData.contractStart || null,
          contract_end: formData.contractEnd || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      if (propError) throw propError;

      // Update first unit (if exists)
      const { data: units } = await supabase
        .from('units')
        .select('id')
        .eq('property_id', id)
        .limit(1);

      if (units && units.length > 0) {
        const { error: unitError } = await supabase
          .from('units')
          .update({
            rent_amount: rentAmount,
            rent_frequency: formData.rentFrequency
          })
          .eq('id', units[0].id);
        if (unitError) throw unitError;
      }

      // Update landlord contact if changed
      if (formData.clientName) {
        // First get current landlord id
        const { data: property } = await supabase
          .from('properties')
          .select('landlord_id')
          .eq('id', id)
          .single();

        if (property?.landlord_id) {
          // Update existing contact
          await supabase
            .from('contacts')
            .update({
              name: formData.clientName,
              phone: formData.clientPhone || null,
              email: formData.clientEmail || null
            })
            .eq('id', property.landlord_id);
        }
      }

      alert('Property updated successfully!');
      navigate(`/dashboard/estate-firm/properties/${id}`);
    } catch (err) {
      console.error('Error updating property:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) return;

    setLoading(true);
    try {
      // Delete units first (cascade should handle, but manual for safety)
      await supabase.from('units').delete().eq('property_id', id);
      // Delete property
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) throw error;

      alert('Property deleted successfully!');
      navigate('/dashboard/estate-firm/properties');
    } catch (err) {
      console.error('Error deleting property:', err);
      alert('Failed to delete property.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading">Loading property...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="edit-property-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(`/dashboard/estate-firm/properties/${id}`)}>
          <ArrowLeft size={20} />
        </button>
        <h1>Edit Property</h1>
        <p>Update property details and management information</p>
      </div>

      <form onSubmit={handleSubmit} className="edit-property-form">
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
              />
            </div>

            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>LGA</label>
              <input
                type="text"
                value={formData.lga}
                onChange={(e) => setFormData({...formData, lga: e.target.value})}
              />
            </div>

            <div className="form-group full-width">
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

        {/* Landlord Information */}
        <div className="form-section">
          <div className="section-header">
            <User size={20} />
            <h3>Landlord Information</h3>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Landlord Name</label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({...formData, clientName: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={formData.clientPhone}
                onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Rent Details */}
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
                  min="0"
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
          </div>

          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows="3"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate(`/dashboard/estate-firm/properties/${id}`)}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={loading}>
            <Trash2 size={18} /> Delete
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EstateEditProperty;