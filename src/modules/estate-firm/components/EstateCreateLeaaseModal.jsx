// src/modules/estate-firm/components/EstateCreateLeaseModal.jsx
import React, { useState } from 'react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { X, Upload, Calendar, DollarSign, FileText, AlertCircle } from 'lucide-react';
import './EstateCreateLeaseModal.css';

const EstateCreateLeaseModal = ({ unit, property, tenant, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    monthly_rent: unit?.rent_amount || 0,
    security_deposit: (unit?.rent_amount || 0) * 2,
    terms: '',
    agreement_file: null,
    agreement_url: ''
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
      setError('Only PDF and image files are allowed');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `lease_agreements/${unit.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('lease-documents')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('lease-documents')
        .getPublicUrl(fileName);
      
      setFormData(prev => ({ 
        ...prev, 
        agreement_file: file,
        agreement_url: publicUrl 
      }));
      setError(null);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload agreement');
    } finally {
      setUploading(false);
    }
  };

  const calculateTotalRent = () => {
    const months = (new Date(formData.end_date) - new Date(formData.start_date)) / (1000 * 60 * 60 * 24 * 30);
    return Math.round(formData.monthly_rent * months);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.start_date || !formData.end_date || !formData.monthly_rent) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the estate firm profile ID
      const { data: profile } = await supabase
        .from('estate_firm_profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user.id)
        .single();

      // Calculate total rent
      const totalRent = calculateTotalRent();
      const duration = `${Math.ceil((new Date(formData.end_date) - new Date(formData.start_date)) / (1000 * 60 * 60 * 24 * 30))} months`;

      // Create lease record
      const leaseData = {
        tenant_id: tenant.id,
        property_id: property.id,
        unit_id: unit.id,
        estate_firm_id: profile?.id,
        landlord_name: property.estate_firm_name || 'Estate Firm',
        start_date: formData.start_date,
        end_date: formData.end_date,
        duration: duration,
        monthly_rent: formData.monthly_rent,
        security_deposit: formData.security_deposit,
        total_rent: totalRent,
        status: 'active',
        agreement_url: formData.agreement_url,
        terms: { terms: formData.terms },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: lease, error: leaseError } = await supabase
        .from('leases')
        .insert(leaseData)
        .select()
        .single();

      if (leaseError) throw leaseError;

      // Update unit status to occupied
      const { error: unitError } = await supabase
        .from('units')
        .update({ 
          status: 'occupied',
          tenant_id: tenant.id,
          tenant_name: tenant.full_name || tenant.name,
          tenant_phone: tenant.phone,
          tenant_email: tenant.email,
          lease_start_date: formData.start_date,
          lease_end_date: formData.end_date
        })
        .eq('id', unit.id);

      if (unitError) throw unitError;

      // Send notification to tenant
      await supabase
        .from('notifications')
        .insert({
          user_id: tenant.id,
          type: 'lease_created',
          title: 'Lease Agreement Ready',
          message: `Your lease agreement for ${property.title} Unit ${unit.unit_number} is ready.`,
          link: `/dashboard/tenant/leases/${lease.id}`,
          created_at: new Date().toISOString()
        });

      alert('Lease created successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating lease:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-lease-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Lease Agreement</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="property-info">
              <h3>{property?.title}</h3>
              <p>Unit {unit?.unit_number} • {property?.address}</p>
              <p><strong>Tenant:</strong> {tenant?.full_name || tenant?.name}</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label><Calendar size={14} /> Start Date *</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label><Calendar size={14} /> End Date *</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label><DollarSign size={14} /> Monthly Rent *</label>
                <input
                  type="number"
                  name="monthly_rent"
                  value={formData.monthly_rent}
                  onChange={handleInputChange}
                  required
                  step="1000"
                />
              </div>
              <div className="form-group">
                <label>Security Deposit</label>
                <input
                  type="number"
                  name="security_deposit"
                  value={formData.security_deposit}
                  onChange={handleInputChange}
                  step="1000"
                />
                <small>Usually 2 months rent</small>
              </div>
            </div>

            <div className="form-group">
              <label>Total Rent for Lease Period</label>
              <div className="total-rent-display">
                ₦{calculateTotalRent().toLocaleString()}
              </div>
              <small>{formData.start_date} to {formData.end_date}</small>
            </div>

            <div className="form-group">
              <label><FileText size={14} /> Lease Agreement Document</label>
              <div className="file-upload-area">
                {formData.agreement_url ? (
                  <div className="file-preview">
                    <FileText size={24} />
                    <span>Agreement uploaded</span>
                    <a href={formData.agreement_url} target="_blank" rel="noopener">View</a>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, agreement_url: '', agreement_file: null }))}>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="upload-label">
                    <Upload size={24} />
                    <span>Upload Lease Agreement</span>
                    <small>PDF or Image (Max 5MB)</small>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                  </label>
                )}
                {uploading && <p className="uploading-text">Uploading...</p>}
              </div>
            </div>

            <div className="form-group">
              <label>Additional Terms (Optional)</label>
              <textarea
                name="terms"
                value={formData.terms}
                onChange={handleInputChange}
                rows="3"
                placeholder="Any additional terms or conditions..."
              />
            </div>

            {error && (
              <div className="error-message">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading || uploading}>
              {loading ? 'Creating...' : 'Create Lease Agreement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EstateCreateLeaseModal;