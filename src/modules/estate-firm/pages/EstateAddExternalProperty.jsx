import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, MapPin, User, DollarSign, Percent, Settings, Save, Search, Plus } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import './EstateAddExternalProperty.css';

const EstateAddExternalProperty = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [estateFirmId, setEstateFirmId] = useState(null);
  const [landlords, setLandlords] = useState([]);
  const [loadingLandlords, setLoadingLandlords] = useState(true);
  const [showLandlordModal, setShowLandlordModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New landlord form state
  const [newLandlord, setNewLandlord] = useState({
    name: '',
    phone: '',
    email: '',
    bank_name: '',
    account_number: '',
    account_name: '',
    notes: ''
  });

  const [formData, setFormData] = useState({
    propertyName: '',
    address: '',
    city: '',
    state: '',
    lga: '',
    landlordId: '', // Changed from clientName/Phone/Email
    propertyType: 'residential',
    rentAmount: '',
    rentFrequency: 'yearly', // Changed default to yearly (Nigeria standard)
    commissionRate: 0, // Estate firms pay 0% commission
    managementLevel: 'full',
    nextRentDue: '',
    contractStart: '',
    managementCommission: '',
    contractEnd: '',
    notes: ''
  });

  const propertyTypes = [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'office', label: 'Office Space' },
    { value: 'shop', label: 'Shop/Retail' },
    { value: 'warehouse', label: 'Warehouse' },
    { value: 'land', label: 'Land' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'duplex', label: 'Duplex' },
    { value: 'bungalow', label: 'Bungalow' }
  ];

  const managementLevels = [
    { value: 'full', label: 'Full Management', description: 'Rent collection + maintenance + tenant management' },
    { value: 'rent-only', label: 'Rent Collection Only', description: 'Only handle rent collection' },
    { value: 'maintenance-only', label: 'Maintenance Only', description: 'Only handle property maintenance' },
    { value: 'letting-only', label: 'Letting Only', description: 'Only handle tenant finding' }
  ];

  // Get estate firm profile ID
  useEffect(() => {
    const getEstateFirmId = async () => {
      const { data } = await supabase
        .from('estate_firm_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setEstateFirmId(data.id);
      }
    };
    getEstateFirmId();
  }, [user]);

  // Load landlords
  useEffect(() => {
    if (estateFirmId) {
      loadLandlords();
    }
  }, [estateFirmId]);

  const loadLandlords = async () => {
    setLoadingLandlords(true);
    try {
      const { data, error } = await supabase
        .from('estate_landlords')
        .select('id, name, phone, email, bank_details')
        .eq('estate_firm_id', estateFirmId)
        .order('name');

      if (error) throw error;
      setLandlords(data || []);
    } catch (error) {
      console.error('Error loading landlords:', error);
    } finally {
      setLoadingLandlords(false);
    }
  };

  const handleAddNewLandlord = async () => {
  if (!newLandlord.name.trim()) {
    alert('Landlord name is required');
    return;
  }

  try {
    // Insert the new landlord
    const { data, error } = await supabase
      .from('estate_landlords')
      .insert({
        estate_firm_id: estateFirmId,
        name: newLandlord.name,
        phone: newLandlord.phone || null,
        email: newLandlord.email || null,
        bank_details: {
          bank_name: newLandlord.bank_name,
          account_number: newLandlord.account_number,
          account_name: newLandlord.account_name
        },
        notes: newLandlord.notes || null
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      alert(`Failed to add landlord: ${error.message}`);
      return;
    }

    if (!data) {
      alert('Failed to add landlord: No data returned');
      return;
    }

    // Add the new landlord to the local list immediately
    setLandlords(prev => [...prev, data]);

    // Set the selected landlord in the form to this new ID
    setFormData(prev => ({ ...prev, landlordId: data.id }));

    // Reset modal state
    setNewLandlord({
      name: '',
      phone: '',
      email: '',
      bank_name: '',
      account_number: '',
      account_name: '',
      notes: ''
    });
    setShowLandlordModal(false);
    setSearchTerm('');

  } catch (error) {
    console.error('Error adding landlord:', error);
    alert(`Failed to add landlord: ${error.message}`);
  }
};
  const filteredLandlords = landlords.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.phone?.includes(searchTerm)
  );

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!user) {
    alert('Please login to add property');
    return;
  }

  if (!formData.landlordId) {
    alert('Please select a landlord');
    return;
  }
  const landlordExists = landlords.some(l => l.id === formData.landlordId);
if (!landlordExists) {
  alert('Selected landlord not found. Please select a valid landlord.');
  return;
}

  if (!formData.propertyName.trim()) {
    alert('Property name is required');
    return;
  }
  if (!formData.address.trim()) {
    alert('Property address is required');
    return;
  }

  setLoading(true);

  try {
    const sanitizeNumber = (val) => {
      if (!val) return 0;
      return parseFloat(String(val).replace(/,/g, '')) || 0;
    };

    const rentAmount = sanitizeNumber(formData.rentAmount);
    const managementCommission = parseFloat(formData.managementCommission) || 0;

    if (!estateFirmId) {
      throw new Error('Estate firm profile not found');
    }

    // Insert property
    const { data: property, error: propError } = await supabase
      .from('properties')
      .insert({
        estate_firm_id: estateFirmId,
        landlord_id: formData.landlordId,
        title: formData.propertyName,
        address: formData.address,
        city: formData.city || null,
        state: formData.state || null,
        lga: formData.lga || null,
        property_type: formData.propertyType,
        status: 'active',
        description: formData.notes,
        management_level: formData.managementLevel,
        management_commission: managementCommission,
        contract_start: formData.contractStart || null,
        contract_end: formData.contractEnd || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (propError) throw propError;

    // Insert default unit
    if (rentAmount > 0) {
      const { error: unitError } = await supabase
        .from('units')
        .insert({
          property_id: property.id,
          unit_number: '1',
          rent_amount: rentAmount,
          rent_frequency: formData.rentFrequency,
          status: 'vacant',
          bedrooms: 0,
          bathrooms: 0,
          area_sqm: null,
          source: 'external'
        });

      if (unitError) throw unitError;
    }

    // Log activity
    await supabase.from('activities').insert({
      user_id: user.id,
      type: 'property',
      action: 'add_external',
      description: `Added external property: ${formData.propertyName}`,
      created_at: new Date().toISOString()
    });

    alert('External property added successfully!');

    if (property?.id) {
      navigate(`/dashboard/estate-firm/properties/${property.id}`);
    } else {
      navigate('/dashboard/estate-firm/portfolio');
    }

  } catch (error) {
    console.error('Error adding external property:', error);
    alert(`Failed to add property: ${error.message || 'Unknown error'}`);
  } finally {
    setLoading(false);
  }
};

  
 if (loading) {
  return <RentEasyLoader message="Loading your dashboard..." fullScreen />;
}

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
                placeholder="e.g., Sunshine Estate"
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
              <label>LGA (optional)</label>
              <input
                type="text"
                value={formData.lga}
                onChange={(e) => setFormData({...formData, lga: e.target.value})}
                placeholder="e.g., Ikeja"
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

        {/* Landlord Selection */}
        <div className="form-section">
          <div className="section-header">
            <User size={20} />
            <h3>Landlord Information</h3>
          </div>

          <div className="form-group">
            <label>Select Landlord *</label>
            {loadingLandlords ? (
              <div className="loading-spinner-small">Loading landlords...</div>
            ) : (
              <>
                <div className="landlord-selector">
                  <select
                    value={formData.landlordId}
                    onChange={(e) => setFormData({...formData, landlordId: e.target.value})}
                    className="form-select"
                    required
                  >
                    <option value="">Select a landlord</option>
                    {landlords.map(landlord => (
                      <option key={landlord.id} value={landlord.id}>
                        {landlord.name} {landlord.phone ? `• ${landlord.phone}` : ''}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowLandlordModal(true)}
                  >
                    <Plus size={16} />
                    New Landlord
                  </button>
                </div>

                {landlords.length === 0 && !loadingLandlords && (
                  <div className="no-landlords-message">
                    <p>No landlords found. Click "New Landlord" to add one.</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Quick search (optional) */}
          <div className="landlord-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search landlords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {searchTerm && filteredLandlords.length > 0 && (
            <div className="landlord-search-results">
              {filteredLandlords.map(landlord => (
                <div
                  key={landlord.id}
                  className="search-result-item"
                  onClick={() => {
                    setFormData({...formData, landlordId: landlord.id});
                    setSearchTerm('');
                  }}
                >
                  <strong>{landlord.name}</strong>
                  {landlord.phone && <span>{landlord.phone}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Financial Details */}
        <div className="form-section">
          <div className="section-header">
            <DollarSign size={20} />
            <h3>Rent Details</h3>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Annual Rent Amount (₦) *</label>
              <div className="input-with-icon">
                <DollarSign size={18} />
                <input
                  type="number"
                  value={formData.rentAmount}
                  onChange={(e) => setFormData({...formData, rentAmount: e.target.value})}
                  placeholder="e.g., 1200000"
                  required
                />
              </div>
              <small className="hint">Standard rent in Nigeria is yearly</small>
            </div>

            <div className="form-group">
              <label>Rent Frequency</label>
              <select
                value={formData.rentFrequency}
                onChange={(e) => setFormData({...formData, rentFrequency: e.target.value})}
              >
                <option value="yearly">Yearly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>

            <div className="form-group">
              <label>Commission Rate</label>
              <div className="input-with-icon">
                <Percent size={18} />
                <input
                  type="number"
                  value="0"
                  disabled
                  className="form-input-disabled"
                />
              </div>
              <small className="hint">Estate firms pay 0% commission</small>
            </div>
          </div>
        </div>

        <div className="form-group">
  <label>Management Commission (%)</label>
  <div className="input-with-icon">
    <Percent size={18} />
    <input
      type="number"
      step="0.5"
      min="0"
      max="100"
      value={formData.managementCommission}
      onChange={(e) => setFormData({...formData, managementCommission: e.target.value})}
      placeholder="e.g., 10"
    />
  </div>
  <small className="hint">Your commission as the property manager (e.g., 10% of rent)</small>
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

      {/* Add New Landlord Modal */}
      {showLandlordModal && (
        <div className="modal-overlay" onClick={() => setShowLandlordModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Landlord</h2>
              <button className="close-btn" onClick={() => setShowLandlordModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Landlord Name *</label>
                <input
                  type="text"
                  value={newLandlord.name}
                  onChange={(e) => setNewLandlord({...newLandlord, name: e.target.value})}
                  placeholder="Full name"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={newLandlord.phone}
                    onChange={(e) => setNewLandlord({...newLandlord, phone: e.target.value})}
                    placeholder="+234 801 234 5678"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={newLandlord.email}
                    onChange={(e) => setNewLandlord({...newLandlord, email: e.target.value})}
                    placeholder="landlord@email.com"
                  />
                </div>
              </div>

              <div className="form-section">
                <h4>Bank Details (for payouts)</h4>
                <div className="form-group">
                  <label>Bank Name</label>
                  <input
                    type="text"
                    value={newLandlord.bank_name}
                    onChange={(e) => setNewLandlord({...newLandlord, bank_name: e.target.value})}
                    placeholder="e.g., GTBank"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Account Number</label>
                    <input
                      type="text"
                      value={newLandlord.account_number}
                      onChange={(e) => setNewLandlord({...newLandlord, account_number: e.target.value})}
                      placeholder="0123456789"
                    />
                  </div>

                  <div className="form-group">
                    <label>Account Name</label>
                    <input
                      type="text"
                      value={newLandlord.account_name}
                      onChange={(e) => setNewLandlord({...newLandlord, account_name: e.target.value})}
                      placeholder="Account holder name"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea
                  value={newLandlord.notes}
                  onChange={(e) => setNewLandlord({...newLandlord, notes: e.target.value})}
                  placeholder="Any additional information..."
                  rows="2"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowLandlordModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddNewLandlord}>
                Add Landlord
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstateAddExternalProperty;