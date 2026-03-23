import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Check, User } from 'lucide-react';
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
    // Tenant fields
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
  const [manualForm, setManualForm] = useState({
    name: '',
    phone: '',
    email: ''
  });

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
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, name, email, phone, avatar_url')
        .eq('role', 'tenant')
        .or(`full_name.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;

      // Map to a consistent format
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      if (isEditing) {
        const { data, error } = await supabase
          .from('units')
          .update(unitData)
          .eq('id', unit.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('units')
          .insert([unitData])
          .select()
          .single();
        if (error) throw error;
        result = data;
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
      console.error('Error saving unit:', err);
      alert('Failed to save unit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {isTenantOnly
              ? 'Add Tenant to Unit'
              : isEditing
              ? 'Edit Unit'
              : 'Add Unit'}
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isTenantOnly && (
            <>
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
                  {formData.tenant_renteasy_id && (
                    <span className="renteasy-badge">RentEasy User</span>
                  )}
                </div>
                <button type="button" className="btn-small" onClick={clearTenant}>
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
                  <Search size={16} /> Find Tenant
                </button>

                {showTenantSearch && !manualMode && (
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
                          key={result.id}
                          className="search-result"
                          onClick={() => selectTenant(result)}
                        >
                          <div className="result-avatar">
                            {result.avatar ? (
                              <img src={result.avatar} alt={result.name} />
                            ) : (
                              <User size={16} />
                            )}
                          </div>
                          <div className="result-info">
                            <strong>{result.name}</strong>
                            {result.email && <span>{result.email}</span>}
                            {result.phone && <span>{result.phone}</span>}
                          </div>
                          <Check size={16} />
                        </div>
                      ))}
                      {searchResults.length === 0 && searchQuery.length >= 2 && (
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
                    <p className="hint">Tenant won't receive app notifications, but can get SMS receipts.</p>
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
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setManualMode(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={handleManualAdd}
                        disabled={!manualForm.name.trim()}
                      >
                        Add Tenant
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