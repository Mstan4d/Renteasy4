// src/modules/estate-firm/components/UnitModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Check } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import './UnitModal.css';

const UnitModal = ({ propertyId, unit, onClose, onSaved }) => {
  const isEditing = !!unit;
  const [formData, setFormData] = useState({
    unit_number: unit?.unit_number || '',
    rent_amount: unit?.rent_amount || '',
    rent_frequency: unit?.rent_frequency || 'monthly',
    bedrooms: unit?.bedrooms || 1,
    bathrooms: unit?.bathrooms || 1,
    area_sqm: unit?.area_sqm || '',
    status: unit?.status || 'vacant',
    tenant_id: unit?.tenant_id || null,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showTenantSearch, setShowTenantSearch] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(unit?.tenant || null);
  const [loading, setLoading] = useState(false);
  const [newTenantForm, setNewTenantForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [showNewTenant, setShowNewTenant] = useState(false);

  // Search tenants when query changes
  useEffect(() => {
    if (!showTenantSearch || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const delay = setTimeout(() => {
      searchTenants();
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const searchTenants = async () => {
    setLoading(true);
    try {
      // Search in contacts (tenants only)
      const { data: contacts } = await supabase
        .from('contacts')
        .select('id, name, email, phone')
        .eq('type', 'tenant')
        .or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
        .limit(10);

      // Search in profiles (RentEasy users)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email, phone')
        .or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
        .limit(10);

      const combined = [
        ...(contacts || []).map(c => ({ ...c, source: 'contact' })),
        ...(profiles || []).map(p => ({ ...p, source: 'profile' }))
      ];
      setSearchResults(combined);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectTenant = (tenant) => {
    setSelectedTenant(tenant);
    setFormData({ ...formData, tenant_id: tenant.id, status: 'occupied' });
    setShowTenantSearch(false);
    setSearchQuery('');
  };

  const clearTenant = () => {
    setSelectedTenant(null);
    setFormData({ ...formData, tenant_id: null, status: 'vacant' });
  };

  const handleNewTenant = async () => {
    if (!newTenantForm.name) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert([{
          name: newTenantForm.name,
          email: newTenantForm.email,
          phone: newTenantForm.phone,
          address: newTenantForm.address,
          type: 'tenant',
        }])
        .select()
        .single();
      if (error) throw error;
      selectTenant({ ...data, source: 'contact' });
      setShowNewTenant(false);
      setNewTenantForm({ name: '', email: '', phone: '', address: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to create tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const unitData = {
        property_id: propertyId,
        unit_number: formData.unit_number,
        rent_amount: parseFloat(formData.rent_amount),
        rent_frequency: formData.rent_frequency,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        area_sqm: formData.area_sqm ? parseFloat(formData.area_sqm) : null,
        status: formData.status,
        tenant_id: selectedTenant?.id || null,
      };

      let result;
      if (isEditing) {
        const { data, error } = await supabase
          .from('units')
          .update(unitData)
          .eq('id', unit.id)
          .select();
        if (error) throw error;
        result = data[0];
      } else {
        const { data, error } = await supabase
          .from('units')
          .insert([unitData])
          .select();
        if (error) throw error;
        result = data[0];
      }

      // Log activity
      await supabase
        .from('property_activities')
        .insert([{
          property_id: propertyId,
          unit_id: result.id,
          activity_type: isEditing ? 'unit_updated' : 'unit_added',
          description: isEditing
            ? `Unit ${result.unit_number} updated`
            : `Unit ${result.unit_number} added`,
        }]);

      onSaved(result);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save unit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Unit' : 'Add Unit'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Unit Number *</label>
              <input
                type="text"
                value={formData.unit_number}
                onChange={(e) => setFormData({ ...formData, unit_number: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Rent Amount (₦) *</label>
              <input
                type="number"
                value={formData.rent_amount}
                onChange={(e) => setFormData({ ...formData, rent_amount: e.target.value })}
                required
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Rent Frequency</label>
              <select
                value={formData.rent_frequency}
                onChange={(e) => setFormData({ ...formData, rent_frequency: e.target.value })}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="vacant">Vacant</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Bedrooms</label>
              <input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Bathrooms</label>
              <input
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Area (sqm)</label>
              <input
                type="number"
                value={formData.area_sqm}
                onChange={(e) => setFormData({ ...formData, area_sqm: e.target.value })}
                min="0"
              />
            </div>
          </div>

          {/* Tenant selection */}
          <div className="form-group">
            <label>Tenant</label>
            {selectedTenant ? (
              <div className="selected-tenant">
                <div>
                  <strong>{selectedTenant.name}</strong>
                  {selectedTenant.email && <span> ({selectedTenant.email})</span>}
                </div>
                <button type="button" className="btn-small" onClick={clearTenant}>Remove</button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setShowTenantSearch(!showTenantSearch)}
                >
                  <Search size={16} /> Find Tenant
                </button>

                {showTenantSearch && (
                  <div className="tenant-search">
                    <input
                      type="text"
                      placeholder="Search by name, email or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                    {loading && <div className="search-loading">Searching...</div>}
                    <div className="search-results">
                      {searchResults.map((result) => (
                        <div
                          key={`${result.source}-${result.id}`}
                          className="search-result"
                          onClick={() => selectTenant(result)}
                        >
                          <div>
                            <strong>{result.name}</strong>
                            {result.email && <span> ({result.email})</span>}
                            <br />
                            <small>{result.source === 'profile' ? 'RentEasy User' : 'Contact'}</small>
                          </div>
                          <Check size={16} />
                        </div>
                      ))}
                      {searchResults.length === 0 && searchQuery.length >= 2 && (
                        <div className="no-results">
                          <p>No tenants found.</p>
                          <button
                            type="button"
                            className="btn-link"
                            onClick={() => setShowNewTenant(true)}
                          >
                            <Plus size={14} /> Add new tenant
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {showNewTenant && (
                  <div className="new-tenant-form">
                    <h4>New Tenant</h4>
                    <input
                      type="text"
                      placeholder="Name *"
                      value={newTenantForm.name}
                      onChange={(e) => setNewTenantForm({ ...newTenantForm, name: e.target.value })}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newTenantForm.email}
                      onChange={(e) => setNewTenantForm({ ...newTenantForm, email: e.target.value })}
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={newTenantForm.phone}
                      onChange={(e) => setNewTenantForm({ ...newTenantForm, phone: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Address"
                      value={newTenantForm.address}
                      onChange={(e) => setNewTenantForm({ ...newTenantForm, address: e.target.value })}
                    />
                    <div className="new-tenant-actions">
                      <button type="button" className="btn-secondary" onClick={() => setShowNewTenant(false)}>
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={handleNewTenant}
                        disabled={!newTenantForm.name}
                      >
                        Save Tenant
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Update Unit' : 'Add Unit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnitModal;