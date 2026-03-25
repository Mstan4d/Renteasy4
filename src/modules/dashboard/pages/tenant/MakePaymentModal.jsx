// src/modules/dashboard/pages/tenant/MakePaymentModal.jsx
import React, { useState } from 'react';
import { supabase } from '../../../../shared/lib/supabaseClient';
import { useAuth } from '../../../../shared/context/AuthContext';
import { Upload, X, DollarSign, Calendar } from 'lucide-react';
import './MakePaymentModal.css';

const MakePaymentModal = ({ lease, bankDetails, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState(lease.unit?.rent_amount || lease.monthly_rent || 0);
  const [dueDate, setDueDate] = useState('');
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (selected.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    if (!selected.type.startsWith('image/') && !selected.type.includes('pdf')) {
      setError('Only images and PDFs are allowed');
      return;
    }
    setFile(selected);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!dueDate) {
      setError('Please select a due date');
      return;
    }
    if (!file) {
      setError('Please upload proof of payment');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // 1. Upload proof to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `payment_proof_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `rent-payments/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('estate-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('estate-documents')
        .getPublicUrl(filePath);

      // 2. Create rent payment record
      const { data: payment, error: insertError } = await supabase
        .from('rent_payments')
        .insert({
          lease_id: lease.id,
          unit_id: lease.unit_id,
          tenant_id: user.id,
          amount_due: amount,
          due_date: dueDate,
          status: 'pending',
          proof_url: publicUrl,
          notes,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 3. Add document to tenant_documents
      const { error: docError } = await supabase
        .from('tenant_documents')
        .insert({
          tenant_id: user.id,
          title: `Rent Payment - ${new Date(dueDate).toLocaleDateString()}`,
          description: `Payment of ₦${amount.toLocaleString()} for rent due ${new Date(dueDate).toLocaleDateString()}`,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          category: 'receipt',
          created_at: new Date().toISOString()
        });

      if (docError) console.error('Error saving document:', docError);

      // 4. Determine who to notify (estate firm or landlord)
      let ownerId = null;
      let ownerType = null;

      if (lease.unit?.property?.estate_firm_id) {
        ownerId = lease.unit.property.estate_firm_id;
        ownerType = 'estate_firm';
        
        // Get estate firm profile to get user_id
        const { data: estateFirm } = await supabase
          .from('estate_firm_profiles')
          .select('user_id')
          .eq('id', ownerId)
          .single();
        
        if (estateFirm) {
          ownerId = estateFirm.user_id;
        }
      } else if (lease.landlord_id) {
        ownerId = lease.landlord_id;
        ownerType = 'landlord';
      }

      // 5. Send notification to property owner
      if (ownerId) {
        const notificationTable = ownerType === 'estate_firm' 
          ? 'estate_firm_notifications' 
          : 'landlord_notifications';
        
        const notificationData = {
          [ownerType === 'estate_firm' ? 'estate_firm_id' : 'landlord_id']: ownerId,
          tenant_id: user.id,
          title: 'New Rent Payment',
          message: `Tenant has submitted a rent payment of ₦${amount.toLocaleString()} for ${lease.unit?.property?.title || 'property'}.`,
          type: 'rent_payment',
          read: false,
          created_at: new Date().toISOString()
        };
        
        await supabase
          .from(notificationTable)
          .insert(notificationData);
      }

      alert('Payment recorded! The property manager will confirm it shortly.');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Payment submission error:', err);
      setError('Failed to submit payment. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Make Rent Payment</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          {bankDetails && (
            <div className="bank-info">
              <h4>Payment Details</h4>
              <p><strong>Bank:</strong> {bankDetails.bank_name}</p>
              <p><strong>Account Number:</strong> {bankDetails.account_number}</p>
              <p><strong>Account Name:</strong> {bankDetails.account_name}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Amount (₦)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Upload Proof of Payment</label>
              <div className="file-upload-area">
                {file ? (
                  <div className="file-preview">
                    <span>{file.name}</span>
                    <button type="button" onClick={() => setFile(null)}>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="upload-label">
                    <Upload size={24} />
                    <span>Click to upload or drag & drop</span>
                    <small>PNG, JPG, PDF up to 5MB</small>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="2"
                placeholder="Any additional information..."
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={uploading}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={uploading}>
                {uploading ? 'Submitting...' : 'Submit Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MakePaymentModal;