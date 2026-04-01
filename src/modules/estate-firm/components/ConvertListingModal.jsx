// src/modules/estate-firm/components/ConvertListingModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload, AlertCircle, DollarSign, Check, User, Search } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import './ConvertListingModal.css';

const ConvertListingModal = ({ listing, estateFirmId, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Property selection, 2: Unit details, 3: Tenant selection
  const [extraFees, setExtraFees] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingPropertyId, setExistingPropertyId] = useState(listing.property_id || '');
  const [properties, setProperties] = useState([]);
  const [showNewPropertyForm, setShowNewPropertyForm] = useState(false);
  
  // Unit details
  const [unitData, setUnitData] = useState({
    unit_number: '',
    rent_amount: listing.price || 0,
    rent_frequency: 'yearly',
    bedrooms: listing.bedrooms || 1,
    bathrooms: listing.bathrooms || 1,
    area_sqm: listing.area || '',
    status: 'vacant'
  });
  
  // Tenant details
  const [tenantData, setTenantData] = useState({
    tenant_id: null,
    tenant_name: '',
    tenant_phone: '',
    tenant_email: '',
    searchQuery: '',
    searchResults: []
  });
  const [showTenantSearch, setShowTenantSearch] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // New property form
  const [newProperty, setNewProperty] = useState({
    name: listing.title || '',
    address: listing.address || '',
    city: listing.city || '',
    state: listing.state || '',
    lga: listing.lga || '',
    property_type: listing.property_type || 'apartment'
  });

  // Load existing properties
  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const { data } = await supabase
        .from('properties')
        .select('id, name, address, city, state')
        .eq('estate_firm_id', estateFirmId)
        .order('name');
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

  // Search tenants
  useEffect(() => {
    if (!showTenantSearch || tenantData.searchQuery.length < 2) {
      setTenantData(prev => ({ ...prev, searchResults: [] }));
      return;
    }
    const delay = setTimeout(() => searchTenants(), 300);
    return () => clearTimeout(delay);
  }, [tenantData.searchQuery]);

  const searchTenants = async () => {
    setSearchLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, name, email, phone, avatar_url')
        .eq('role', 'tenant')
        .or(`full_name.ilike.%${tenantData.searchQuery}%,name.ilike.%${tenantData.searchQuery}%,email.ilike.%${tenantData.searchQuery}%,phone.ilike.%${tenantData.searchQuery}%`)
        .limit(10);

      if (error) throw error;

      const results = (data || []).map(p => ({
        id: p.id,
        name: p.full_name || p.name || 'Unknown',
        email: p.email,
        phone: p.phone,
        avatar: p.avatar_url
      }));
      setTenantData(prev => ({ ...prev, searchResults: results }));
    } catch (err) {
      console.error('Error searching tenants:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const selectTenant = (tenant) => {
    setTenantData({
      ...tenantData,
      tenant_id: tenant.id,
      tenant_name: tenant.name,
      tenant_phone: tenant.phone || '',
      tenant_email: tenant.email || '',
      searchQuery: '',
      searchResults: []
    });
    setShowTenantSearch(false);
    setManualMode(false);
  };

  const handleManualAdd = () => {
    if (!manualForm.name.trim()) return;
    setTenantData({
      ...tenantData,
      tenant_id: null,
      tenant_name: manualForm.name.trim(),
      tenant_phone: manualForm.phone.trim(),
      tenant_email: manualForm.email.trim()
    });
    setManualMode(false);
    setManualForm({ name: '', phone: '', email: '' });
    setShowTenantSearch(false);
  };

  const [manualForm, setManualForm] = useState({ name: '', phone: '', email: '' });

  const createProperty = async () => {
    const propertyData = {
      estate_firm_id: estateFirmId,
      name: newProperty.name,
      title: newProperty.name,
      address: newProperty.address,
      city: newProperty.city,
      state: newProperty.state,
      lga: newProperty.lga,
      property_type: newProperty.property_type,
      status: 'active',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('properties')
      .insert(propertyData)
      .select()
      .single();

    if (error) throw error;
    return data.id;
  };

  const createUnit = async (propertyId) => {
    const unitDataToInsert = {
      property_id: propertyId,
      unit_number: unitData.unit_number || '1',
      rent_amount: unitData.rent_amount,
      rent_frequency: unitData.rent_frequency,
      bedrooms: unitData.bedrooms,
      bathrooms: unitData.bathrooms,
      area_sqm: unitData.area_sqm || null,
      status: unitData.status,
      listing_id: listing.id,
      source: 'renteasy'
    };

    const { data, error } = await supabase
      .from('units')
      .insert(unitDataToInsert)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const addTenantToUnit = async (unitId, tenant) => {
    // If tenant has an ID (existing RentEasy user), just update unit
    if (tenant.tenant_id) {
      const { error } = await supabase
        .from('units')
        .update({
          tenant_id: tenant.tenant_id,
          tenant_name: tenant.tenant_name,
          tenant_phone: tenant.tenant_phone,
          tenant_email: tenant.tenant_email,
          status: 'occupied'
        })
        .eq('id', unitId);
      if (error) throw error;
      return tenant.tenant_id;
    } 
    // Manual tenant - create profile first
    else if (tenant.tenant_name) {
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          full_name: tenant.tenant_name,
          phone: tenant.tenant_phone,
          email: tenant.tenant_email,
          role: 'tenant',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (profileError) throw profileError;

      const { error: unitError } = await supabase
        .from('units')
        .update({
          tenant_id: newProfile.id,
          tenant_name: tenant.tenant_name,
          tenant_phone: tenant.tenant_phone,
          tenant_email: tenant.tenant_email,
          status: 'occupied'
        })
        .eq('id', unitId);
      if (unitError) throw unitError;

      return newProfile.id;
    }
    return null;
  };

 // In ConvertListingModal.jsx, update the createLease function:

const createLease = async (unitId, propertyId, tenantId) => {
  const startDate = new Date().toISOString().split('T')[0];
  const endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];

  // Get property details to get landlord info
  const { data: property, error: propError } = await supabase
    .from('properties')
    .select('*, landlord:landlord_id (*)')
    .eq('id', propertyId)
    .single();

  if (propError) throw propError;

  // Determine landlord info
  let landlordId = property.landlord_id;
  let landlordName = property.landlord?.name || 'Landlord';
  let landlordVerified = false;

  // If property has estate_firm_id instead of landlord_id
  if (!landlordId && property.estate_firm_id) {
    const { data: estateFirm } = await supabase
      .from('estate_firm_profiles')
      .select('id, firm_name')
      .eq('id', property.estate_firm_id)
      .single();
    
    if (estateFirm) {
      landlordName = estateFirm.firm_name;
      landlordVerified = true;
    }
  } else if (landlordId) {
    // Get landlord details
    const { data: landlord } = await supabase
      .from('profiles')
      .select('id, full_name, name, verified')
      .eq('id', landlordId)
      .maybeSingle();
    
    if (landlord) {
      landlordName = landlord.full_name || landlord.name || 'Landlord';
      landlordVerified = landlord.verified || false;
    }
  }

  const leaseData = {
    tenant_id: tenantId,
    property_id: propertyId,
    unit_id: unitId,
    listing_id: listing.id,
    landlord_id: landlordId,
    landlord_name: landlordName,
    landlord_verified: landlordVerified,
    start_date: startDate,
    end_date: endDate,
    duration: '12 months',
    monthly_rent: unitData.rent_amount,
    security_deposit: unitData.rent_amount * 2,
    total_rent: unitData.rent_amount * 12,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase.from('leases').insert(leaseData);
  if (error) throw error;
  
  return { landlordId, landlordName };
};

  const handleSubmit = async () => {
  setLoading(true);
  setError('');

  try {
    let propertyId = existingPropertyId;

    // Step 1: Create property if new
    if (!propertyId && showNewPropertyForm) {
      propertyId = await createProperty();
    }

    if (!propertyId) {
      setError('Please select or create a property');
      setLoading(false);
      return;
    }

    // Step 2: Create unit
    const unit = await createUnit(propertyId);

    // Step 3: Update listing with unit_id
    await supabase
      .from('listings')
      .update({
        unit_id: unit.id,
        converted_at: new Date().toISOString(),
        status: 'rented'
      })
      .eq('id', listing.id);

    // Step 4: Add tenant if provided
    let tenantId = null;
    if (tenantData.tenant_name) {
      tenantId = await addTenantToUnit(unit.id, tenantData);
      
      // Step 5: Create lease with proper landlord linking
      if (tenantId) {
        const { landlordId, landlordName } = await createLease(unit.id, propertyId, tenantId);
        
        // Also update unit with lease info
        await supabase
          .from('units')
          .update({
            lease_start_date: new Date().toISOString().split('T')[0],
            lease_end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            landlord_id: landlordId,
            landlord_name: landlordName
          })
          .eq('id', unit.id);
      }
    }

    // Send notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'listing_converted',
      title: 'Listing Converted',
      message: `Listing "${listing.title}" has been converted to a unit.`,
      link: `/dashboard/estate-firm/properties/${propertyId}`,
      created_at: new Date().toISOString()
    });

    // If tenant was added, also notify them
    if (tenantId) {
      await supabase.from('notifications').insert({
        user_id: tenantId,
        type: 'lease_created',
        title: 'Lease Agreement Ready',
        message: `Your lease for ${listing.title} has been created.`,
        link: '/dashboard/tenant/leases',
        created_at: new Date().toISOString()
      });
    }

    alert('Listing converted successfully!');
    onSuccess(unit);
    onClose();
  } catch (err) {
    console.error('Error converting listing:', err);
    setError(err.message || 'Failed to convert listing');
  } finally {
    setLoading(false);
  }
};
  const formatPrice = (price) => `₦${(price || 0).toLocaleString()}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="convert-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Convert Listing to Unit</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          {/* Step Indicators */}
          <div className="step-indicators">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Property</span>
            </div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Unit</span>
            </div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Tenant</span>
            </div>
          </div>

          {/* Step 1: Property Selection */}
          {step === 1 && (
            <div className="step-content">
              <h3>Select Property</h3>
              <p className="step-description">Choose an existing property or create a new one</p>

              {!showNewPropertyForm ? (
                <>
                  <div className="property-list">
                    {properties.map(prop => (
                      <div
                        key={prop.id}
                        className={`property-item ${existingPropertyId === prop.id ? 'selected' : ''}`}
                        onClick={() => setExistingPropertyId(prop.id)}
                      >
                        <div className="property-radio">
                          {existingPropertyId === prop.id && <Check size={16} />}
                        </div>
                        <div className="property-info">
                          <strong>{prop.name}</strong>
                          <span>{prop.address}, {prop.city}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setShowNewPropertyForm(true)}
                  >
                    <Plus size={16} /> Create New Property
                  </button>
                </>
              ) : (
                <div className="new-property-form">
                  <h4>New Property Details</h4>
                  <input
                    type="text"
                    placeholder="Property Name *"
                    value={newProperty.name}
                    onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Address *"
                    value={newProperty.address}
                    onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                  />
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="City"
                      value={newProperty.city}
                      onChange={(e) => setNewProperty({ ...newProperty, city: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={newProperty.state}
                      onChange={(e) => setNewProperty({ ...newProperty, state: e.target.value })}
                    />
                  </div>
                  <select
                    value={newProperty.property_type}
                    onChange={(e) => setNewProperty({ ...newProperty, property_type: e.target.value })}
                  >
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="duplex">Duplex</option>
                    <option value="commercial">Commercial</option>
                  </select>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowNewPropertyForm(false)}
                  >
                    Back to Existing Properties
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Unit Details */}
          {step === 2 && (
            <div className="step-content">
              <h3>Unit Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Unit Number *</label>
                  <input
                    type="text"
                    value={unitData.unit_number}
                    onChange={(e) => setUnitData({ ...unitData, unit_number: e.target.value })}
                    placeholder="e.g., 1A, 2B"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Rent Amount (₦) *</label>
                  <input
                    type="number"
                    value={unitData.rent_amount}
                    onChange={(e) => setUnitData({ ...unitData, rent_amount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Bedrooms</label>
                  <input
                    type="number"
                    value={unitData.bedrooms}
                    onChange={(e) => setUnitData({ ...unitData, bedrooms: e.target.value })}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Bathrooms</label>
                  <input
                    type="number"
                    value={unitData.bathrooms}
                    onChange={(e) => setUnitData({ ...unitData, bathrooms: e.target.value })}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Area (sqm)</label>
                  <input
                    type="number"
                    value={unitData.area_sqm}
                    onChange={(e) => setUnitData({ ...unitData, area_sqm: e.target.value })}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Unit Status</label>
                <select
                  value={unitData.status}
                  onChange={(e) => setUnitData({ ...unitData, status: e.target.value })}
                >
                  <option value="vacant">Vacant</option>
                  <option value="occupied">Occupied (Add Tenant Next)</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Tenant Selection */}
          {step === 3 && (
            <div className="step-content">
              <h3>Add Tenant (Optional)</h3>
              <p className="step-description">Add a tenant to this unit. You can skip this and add later.</p>

              {tenantData.tenant_name ? (
                <div className="selected-tenant">
                  <div>
                    <strong>{tenantData.tenant_name}</strong>
                    {tenantData.tenant_email && <span> ({tenantData.tenant_email})</span>}
                    {tenantData.tenant_id && <span className="renteasy-badge">RentEasy User</span>}
                  </div>
                  <button
                    type="button"
                    className="btn-small"
                    onClick={() => setTenantData({
                      tenant_id: null,
                      tenant_name: '',
                      tenant_phone: '',
                      tenant_email: '',
                      searchQuery: '',
                      searchResults: []
                    })}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setShowTenantSearch(!showTenantSearch)}
                  >
                    <Search size={16} /> Find Existing Tenant
                  </button>

                  {showTenantSearch && !manualMode && (
                    <div className="tenant-search">
                      <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        value={tenantData.searchQuery}
                        onChange={(e) => setTenantData({ ...tenantData, searchQuery: e.target.value })}
                        autoFocus
                      />
                      {searchLoading && <div className="search-loading">Searching...</div>}
                      <div className="search-results">
                        {tenantData.searchResults.map((result) => (
                          <div
                            key={result.id}
                            className="search-result"
                            onClick={() => selectTenant(result)}
                          >
                            <div className="result-avatar">
                              {result.avatar ? <img src={result.avatar} alt={result.name} /> : <User size={16} />}
                            </div>
                            <div className="result-info">
                              <strong>{result.name}</strong>
                              {result.email && <span>{result.email}</span>}
                              {result.phone && <span>{result.phone}</span>}
                            </div>
                            <Check size={16} />
                          </div>
                        ))}
                        {tenantData.searchResults.length === 0 && tenantData.searchQuery.length >= 2 && (
                          <div className="no-results">
                            <p>No RentEasy tenants found.</p>
                            <button
                              type="button"
                              className="btn-link"
                              onClick={() => setManualMode(true)}
                            >
                              <Plus size={14} /> Add manually
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {manualMode && (
                    <div className="manual-tenant-form">
                      <h4>Add Tenant Manually</h4>
                      <input
                        type="text"
                        placeholder="Full Name *"
                        value={manualForm.name}
                        onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={manualForm.phone}
                        onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                      />
                      <input
                        type="email"
                        placeholder="Email (optional)"
                        value={manualForm.email}
                        onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                      />
                      <div className="manual-actions">
                        <button type="button" className="btn-secondary" onClick={() => setManualMode(false)}>Cancel</button>
                        <button type="button" className="btn-primary" onClick={handleManualAdd} disabled={!manualForm.name.trim()}>Add Tenant</button>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="skip-option">
                <label>
                  <input
                    type="checkbox"
                    checked={!tenantData.tenant_name && !showTenantSearch}
                    onChange={() => {
                      setTenantData({
                        tenant_id: null,
                        tenant_name: '',
                        tenant_phone: '',
                        tenant_email: '',
                        searchQuery: '',
                        searchResults: []
                      });
                      setShowTenantSearch(false);
                      setManualMode(false);
                    }}
                  />
                  Skip adding tenant now (add later from portfolio)
                </label>
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          {step < 3 ? (
            <button
              className="btn-primary"
              onClick={() => setStep(step + 1)}
              disabled={(step === 1 && !existingPropertyId && !showNewPropertyForm) ||
                       (step === 1 && showNewPropertyForm && !newProperty.name)}
            >
              Next
            </button>
          ) : (
            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Converting...' : 'Complete Conversion'}
            </button>
          )}
          {step > 1 && (
            <button className="btn-outline" onClick={() => setStep(step - 1)}>Back</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConvertListingModal;