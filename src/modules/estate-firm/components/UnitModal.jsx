// src/modules/estate-firm/components/UnitModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Check, User, FileText } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import './UnitModal.css';

const UnitModal = ({ propertyId, unit, onClose, onSaved, mode = 'full' }) => {
  const isEditing = !!unit;
  const isTenantOnly = mode === 'tenant-only';

  const [formData, setFormData] = useState({
    unit_number: unit?.unit_number || '',
    rent_amount: unit?.rent_amount || '',
    rent_frequency: unit?.rent_frequency || 'yearly',
    bedrooms: unit?.bedrooms || 1,
    bathrooms: unit?.bathrooms || 1,
    area_sqm: unit?.area_sqm || '',
    status: unit?.status || 'vacant',
    tenant_renteasy_id: unit?.tenant_renteasy_id || null,
    tenant_name: unit?.tenant_name || '',
    tenant_phone: unit?.tenant_phone || '',
    tenant_email: unit?.tenant_email || '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showTenantSearch, setShowTenantSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualForm, setManualForm] = useState({ name: '', phone: '', email: '' });
  const [leaseCreated, setLeaseCreated] = useState(false);

  // Check if lease already exists for this unit
  useEffect(() => {
    if (unit?.id && unit?.tenant_id) {
      checkExistingLease();
    }
  }, [unit]);

  const checkExistingLease = async () => {
    try {
      const { data } = await supabase
        .from('leases')
        .select('id')
        .eq('unit_id', unit.id)
        .eq('status', 'active')
        .maybeSingle();
      setLeaseCreated(!!data);
    } catch (error) {
      console.error('Error checking lease:', error);
    }
  };

  // Search tenants when query changes
  useEffect(() => {
    if (!showTenantSearch || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const delay = setTimeout(() => searchTenants(), 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const searchTenants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, name, email, phone, avatar_url')
        .eq('role', 'tenant')
        .or(`full_name.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;

      const results = (data || []).map(p => ({
        id: p.id,
        name: p.full_name || p.name || 'Unknown',
        email: p.email,
        phone: p.phone,
        avatar: p.avatar_url,
        source: 'renteasy'
      }));
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectTenant = (tenant) => {
    setFormData({
      ...formData,
      tenant_renteasy_id: tenant.id,
      tenant_name: tenant.name,
      tenant_phone: tenant.phone || '',
      tenant_email: tenant.email || '',
      status: 'occupied'
    });
    setShowTenantSearch(false);
    setSearchQuery('');
    setManualMode(false);
  };

  const clearTenant = () => {
    setFormData({
      ...formData,
      tenant_renteasy_id: null,
      tenant_name: '',
      tenant_phone: '',
      tenant_email: '',
      status: 'vacant'
    });
    setLeaseCreated(false);
  };

  const handleManualAdd = () => {
    if (!manualForm.name.trim()) return;
    setFormData({
      ...formData,
      tenant_renteasy_id: null,
      tenant_name: manualForm.name.trim(),
      tenant_phone: manualForm.phone.trim(),
      tenant_email: manualForm.email.trim(),
      status: 'occupied'
    });
    setManualMode(false);
    setManualForm({ name: '', phone: '', email: '' });
    setShowTenantSearch(false);
  };

  const createLeaseForTenant = async (unitData, tenantId, propertyId) => {
    try {
      // Check if tenant already has an active lease
      const { data: existingLease } = await supabase
        .from('leases')
        .select('id, status')
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .maybeSingle();

      if (existingLease) {
        alert('This tenant already has an active lease. Please end the existing lease first.');
        return false;
      }

      // Check if unit is already occupied
      const { data: unitCheck } = await supabase
        .from('units')
        .select('tenant_id, status')
        .eq('id', unitData.id)
        .single();

      if (unitCheck && unitCheck.status === 'occupied' && unitCheck.tenant_id) {
        alert('This unit is already occupied. Please remove the current tenant first.');
        return false;
      }

      // Get property details
      const { data: property, error: propError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();
      if (propError) throw propError;

      // Get landlord info
      let landlordId = null;
      let landlordName = 'Landlord';
      let landlordVerified = false;

      if (property.landlord_id) {
        const { data: landlord } = await supabase
          .from('profiles')
          .select('id, full_name, name, verified')
          .eq('id', property.landlord_id)
          .maybeSingle();

        if (landlord) {
          landlordId = landlord.id;
          landlordName = landlord.full_name || landlord.name || 'Landlord';
          landlordVerified = landlord.verified || false;
        } else {
          landlordId = null;
          landlordName = property.landlord_name || 'Landlord';
          landlordVerified = false;
        }
      } else if (property.estate_firm_id) {
        const { data: estateFirm } = await supabase
          .from('estate_firm_profiles')
          .select('id, firm_name')
          .eq('id', property.estate_firm_id)
          .single();

        if (estateFirm) {
          landlordName = estateFirm.firm_name;
          landlordVerified = true;
        } else {
          landlordName = 'Estate Firm';
          landlordVerified = true;
        }
      }

      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];

      const leaseData = {
        tenant_id: tenantId,
        property_id: propertyId,
        unit_id: unitData.id,
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

      const { error: leaseError } = await supabase
        .from('leases')
        .insert(leaseData);

      if (leaseError) throw leaseError;

      await supabase.from('notifications').insert({
        user_id: tenantId,
        type: 'lease_created',
        title: 'Lease Agreement Ready',
        message: `Your lease for ${property.title || 'property'} Unit ${unitData.unit_number} has been created.`,
        link: '/dashboard/tenant/leases',
        created_at: new Date().toISOString()
      });

      setLeaseCreated(true);
      return true;
    } catch (error) {
      console.error('Error creating lease:', error);
      return false;
    }
  };

  const handleCreateLease = async () => {
    if (!unit?.id || !formData.tenant_renteasy_id) {
      alert('Cannot create lease: Missing unit or tenant information');
      return;
    }

    setLoading(true);
    try {
      const success = await createLeaseForTenant(
        { id: unit.id, rent_amount: formData.rent_amount, unit_number: formData.unit_number },
        formData.tenant_renteasy_id,
        propertyId
      );

      if (success) {
        alert('Lease created successfully!');
        onSaved && onSaved(unit);
      } else {
        alert('Failed to create lease');
      }
    } catch (error) {
      console.error('Error in handleCreateLease:', error);
      alert('Failed to create lease');
    } finally {
      setLoading(false);
    }
  };

  const validateTenantAssignment = async (tenantId, unitId, isEditing = false) => {
    if (!tenantId) return { valid: true };

    try {
      const { data: existingUnits, error: unitError } = await supabase
        .from('units')
        .select('id, unit_number, property:property_id(title)')
        .eq('tenant_id', tenantId)
        .eq('status', 'occupied')
        .neq('id', unitId || '')
        .limit(1);

      if (unitError) throw unitError;

      if (existingUnits && existingUnits.length > 0) {
        const existingUnit = existingUnits[0];
        return {
          valid: false,
          error: `This tenant is already assigned to ${existingUnit.property?.title || 'property'} Unit ${existingUnit.unit_number}. A tenant cannot be assigned to multiple units simultaneously.`
        };
      }

      const { data: existingLeases, error: leaseError } = await supabase
        .from('leases')
        .select('id, property:property_id(title), unit:unit_id(unit_number)')
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .neq('unit_id', unitId || '')
        .limit(1);

      if (leaseError) throw leaseError;

      if (existingLeases && existingLeases.length > 0) {
        const existingLease = existingLeases[0];
        return {
          valid: false,
          error: `This tenant already has an active lease for ${existingLease.property?.title || 'property'} Unit ${existingLease.unit?.unit_number}. Please end the existing lease first.`
        };
      }

      if (unitId && !isEditing) {
        const { data: unitCheck } = await supabase
          .from('units')
          .select('tenant_id, tenant_name, status')
          .eq('id', unitId)
          .single();

        if (unitCheck && unitCheck.status === 'occupied' && unitCheck.tenant_id) {
          return {
            valid: false,
            error: `This unit is already occupied by ${unitCheck.tenant_name || 'another tenant'}. Please remove the current tenant first.`
          };
        }
      }

      return { valid: true };
    } catch (error) {
      console.error('Error validating tenant assignment:', error);
      return { valid: true };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.status === 'occupied' && (formData.tenant_renteasy_id || formData.tenant_name)) {
      const tenantId = formData.tenant_renteasy_id;
      const validation = await validateTenantAssignment(tenantId, unit?.id, isEditing);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }
    }

    setLoading(true);
    try {
      const unitData = {
        property_id: propertyId,
        unit_number: formData.unit_number,
        rent_amount: parseFloat(formData.rent_amount) || 0,
        rent_frequency: formData.rent_frequency,
        bedrooms: parseInt(formData.bedrooms) || 1,
        bathrooms: parseInt(formData.bathrooms) || 1,
        area_sqm: formData.area_sqm ? parseFloat(formData.area_sqm) : null,
        status: formData.status,
        tenant_renteasy_id: formData.tenant_renteasy_id,
        tenant_name: formData.tenant_name,
        tenant_phone: formData.tenant_phone,
        tenant_email: formData.tenant_email,
      };

      let result;
      let tenantId = formData.tenant_renteasy_id;
      let isNewTenantAdded = false;

      if (isEditing) {
        const wasVacant = unit?.status === 'vacant';
        const isNowOccupied = formData.status === 'occupied' && (formData.tenant_name || formData.tenant_renteasy_id);

        const { data, error } = await supabase
          .from('units')
          .update(unitData)
          .eq('id', unit.id)
          .select()
          .single();
        if (error) throw error;
        result = data;

        if (wasVacant && isNowOccupied && (formData.tenant_renteasy_id || formData.tenant_name)) {
          tenantId = formData.tenant_renteasy_id;
          isNewTenantAdded = true;
        }
      } else {
        const { data, error } = await supabase
          .from('units')
          .insert([unitData])
          .select()
          .single();
        if (error) throw error;
        result = data;

        if (formData.status === 'occupied' && (formData.tenant_renteasy_id || formData.tenant_name)) {
          tenantId = formData.tenant_renteasy_id;
          isNewTenantAdded = true;
        }
      }

      if (isNewTenantAdded) {
        if (tenantId) {
          await createLeaseForTenant(result, tenantId, propertyId);
        } else if (formData.tenant_name) {
          const { data: newProfile, error: profileError } = await supabase
            .from('profiles')
            .insert({
              full_name: formData.tenant_name,
              phone: formData.tenant_phone,
              email: formData.tenant_email,
              role: 'tenant',
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (!profileError && newProfile) {
            await createLeaseForTenant(result, newProfile.id, propertyId);
            await supabase
              .from('units')
              .update({ tenant_renteasy_id: newProfile.id })
              .eq('id', result.id);
          }
        }
      }

      await supabase
        .from('property_activities')
        .insert([{
          property_id: propertyId,
          unit_id: result.id,
          activity_type: isEditing ? 'unit_updated' : 'unit_added',
          description: isEditing ? `Unit ${result.unit_number} updated` : `Unit ${result.unit_number} added`,
        }]);

      onSaved(result);
      onClose();
    } catch (err) {
      console.error('Error saving unit:', err);
      alert('Failed to save unit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isLeaseRequired = formData.status === 'occupied' && formData.tenant_name && !leaseCreated;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {isTenantOnly ? 'Add Tenant to Unit' : isEditing ? 'Edit Unit' : 'Add Unit'}
          </h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isTenantOnly && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Unit Number *</label>
                  <input type="text" value={formData.unit_number} onChange={(e) => setFormData({ ...formData, unit_number: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Rent Amount (₦) *</label>
                  <input type="number" value={formData.rent_amount} onChange={(e) => setFormData({ ...formData, rent_amount: e.target.value })} required min="0" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Rent Frequency</label>
                  <select value={formData.rent_frequency} onChange={(e) => setFormData({ ...formData, rent_frequency: e.target.value })}>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    <option value="vacant">Vacant</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group"><label>Bedrooms</label><input type="number" value={formData.bedrooms} onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })} min="0" /></div>
                <div className="form-group"><label>Bathrooms</label><input type="number" value={formData.bathrooms} onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })} min="0" /></div>
                <div className="form-group"><label>Area (sqm)</label><input type="number" value={formData.area_sqm} onChange={(e) => setFormData({ ...formData, area_sqm: e.target.value })} min="0" /></div>
              </div>
            </>
          )}

          {/* Tenant section */}
          <div className="form-group">
            <label>Tenant</label>
            {formData.tenant_name ? (
              <div className="selected-tenant">
                <div>
                  <strong>{formData.tenant_name}</strong>
                  {formData.tenant_email && <span> ({formData.tenant_email})</span>}
                  {formData.tenant_renteasy_id && <span className="renteasy-badge">RentEasy User</span>}
                </div>
                <button type="button" className="btn-small" onClick={clearTenant}>Remove</button>
              </div>
            ) : (
              <>
                <button type="button" className="btn-outline" onClick={() => setShowTenantSearch(!showTenantSearch)}>
                  <Search size={16} /> Find Tenant
                </button>

                {showTenantSearch && !manualMode && (
                  <div className="tenant-search">
                    <input type="text" placeholder="Search by name, email or phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
                    {loading && <div className="search-loading">Searching...</div>}
                    <div className="search-results">
                      {searchResults.map((result) => (
                        <div key={result.id} className="search-result" onClick={() => selectTenant(result)}>
                          <div className="result-avatar">{result.avatar ? <img src={result.avatar} alt={result.name} /> : <User size={16} />}</div>
                          <div className="result-info"><strong>{result.name}</strong>{result.email && <span>{result.email}</span>}{result.phone && <span>{result.phone}</span>}</div>
                          <Check size={16} />
                        </div>
                      ))}
                      {searchResults.length === 0 && searchQuery.length >= 2 && (
                        <div className="no-results">
                          <p>No RentEasy tenants found.</p>
                          <button type="button" className="btn-link" onClick={() => setManualMode(true)}><Plus size={14} /> Add manually</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {manualMode && (
                  <div className="manual-tenant-form">
                    <h4>Add Tenant Manually</h4>
                    <p className="hint">Tenant won't receive app notifications, but can get SMS receipts.</p>
                    <input type="text" placeholder="Full Name *" value={manualForm.name} onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })} />
                    <input type="tel" placeholder="Phone Number" value={manualForm.phone} onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })} />
                    <input type="email" placeholder="Email (optional)" value={manualForm.email} onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })} />
                    <div className="manual-actions">
                      <button type="button" className="btn-secondary" onClick={() => setManualMode(false)}>Cancel</button>
                      <button type="button" className="btn-primary" onClick={handleManualAdd} disabled={!manualForm.name.trim()}>Add Tenant</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {formData.tenant_name && !isEditing && isLeaseRequired && (
            <div className="lease-actions">
              <button type="button" className="btn-primary btn-sm" onClick={handleCreateLease} disabled={loading}><FileText size={14} /> Create Lease Agreement</button>
              <small className="lease-hint">Create a formal lease agreement for this tenant</small>
            </div>
          )}

          {isEditing && formData.tenant_name && !leaseCreated && (
            <div className="lease-actions">
              <button type="button" className="btn-primary btn-sm" onClick={handleCreateLease} disabled={loading}><FileText size={14} /> Create Lease Agreement</button>
              <small className="lease-hint">Create a formal lease agreement for this tenant</small>
            </div>
          )}

          {leaseCreated && formData.tenant_name && (
            <div className="lease-info">
              <Check size={14} className="lease-check" />
              <span>Lease agreement active</span>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : (isEditing ? 'Update Unit' : 'Add Unit')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnitModal;