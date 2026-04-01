// src/modules/dashboard/pages/tenant/MakePaymentModal.jsx
import React, { useState } from 'react';
import { supabase } from '../../../../shared/lib/supabaseClient';
import { useAuth } from '../../../../shared/context/AuthContext';
import { Upload, X, DollarSign, Calendar, AlertCircle, CheckCircle, Building, Home, FileText } from 'lucide-react';
import './MakePaymentModal.css';

const MakePaymentModal = ({ lease, bankDetails, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState(lease.unit?.rent_amount || lease.monthly_rent || 0);
  const [dueDate, setDueDate] = useState('');
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Format bank details for display (handles both camelCase and snake_case)
  const getFormattedBankDetails = () => {
    if (!bankDetails) return null;
    
    return {
      bank_name: bankDetails.bank_name || bankDetails.bankName,
      account_number: bankDetails.account_number || bankDetails.accountNumber,
      account_name: bankDetails.account_name || bankDetails.accountName
    };
  };

  const formattedBankDetails = getFormattedBankDetails();
  const hasValidBankDetails = formattedBankDetails?.bank_name && 
                              formattedBankDetails?.account_number && 
                              formattedBankDetails?.account_name;

  // Get the property owner type
  const getOwnerInfo = () => {
    if (lease.estate_firm) {
      return {
        type: 'estate_firm',
        name: lease.estate_firm.firm_name || 'Estate Firm',
        icon: <Building size={16} />
      };
    }
    if (lease.landlord) {
      return {
        type: 'landlord',
        name: lease.landlord.name || 'Landlord',
        icon: <Home size={16} />
      };
    }
    return null;
  };

  const ownerInfo = getOwnerInfo();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    
    // Validate file size (max 5MB)
    if (selected.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    
    // Validate file type
    if (!selected.type.startsWith('image/') && !selected.type.includes('pdf')) {
      setError('Only images and PDFs are allowed');
      return;
    }
    
    setFile(selected);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
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

      // Generate unique reference
      const reference = `RENT-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      // 2. Create rent payment record
      const paymentData = {
        lease_id: lease.id,
        unit_id: lease.unit_id,
        tenant_id: user.id,
        amount_due: amount,
        due_date: dueDate,
        status: 'pending',
        proof_url: publicUrl,
        notes: notes,
        reference: reference,
        payment_method: 'bank_transfer',
        created_at: new Date().toISOString()
      };

      const { data: payment, error: insertError } = await supabase
        .from('rent_payments')
        .insert(paymentData)
        .select()
        .single();

      if (insertError) throw insertError;

      // 3. Add document to tenant_documents
      await supabase
        .from('tenant_documents')
        .insert({
          tenant_id: user.id,
          title: `Rent Payment Receipt - ${new Date(dueDate).toLocaleDateString()}`,
          description: `Payment of ₦${amount.toLocaleString()} for ${lease.property?.title || 'property'} Unit ${lease.unit?.unit_number || ''}`,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          category: 'receipt',
          created_at: new Date().toISOString()
        });

      // 4. Determine who to notify (estate firm or landlord)
      let ownerId = null;
      let ownerType = null;
      let ownerName = null;

      if (lease.unit?.property?.estate_firm_id) {
        ownerId = lease.unit.property.estate_firm_id;
        ownerType = 'estate_firm';
        
        // Get estate firm profile details
        const { data: estateFirm } = await supabase
          .from('estate_firm_profiles')
          .select('user_id, firm_name')
          .eq('id', ownerId)
          .single();
        
        if (estateFirm) {
          ownerId = estateFirm.user_id;
          ownerName = estateFirm.firm_name;
        }
      } else if (lease.landlord_id) {
        ownerId = lease.landlord_id;
        ownerType = 'landlord';
        ownerName = lease.landlord?.name || 'Landlord';
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
          message: `Tenant has submitted a rent payment of ₦${amount.toLocaleString()} for ${lease.property?.title || 'property'} Unit ${lease.unit?.unit_number || ''}. Reference: ${reference}`,
          type: 'rent_payment',
          read: false,
          created_at: new Date().toISOString(),
          link: ownerType === 'estate_firm' ? '/dashboard/estate-firm/rent-tracking' : '/dashboard/landlord/rent-tracking'
        };
        
        await supabase
          .from(notificationTable)
          .insert(notificationData);
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error('Payment submission error:', err);
      setError(err.message || 'Failed to submit payment. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatCurrency = (amount) => `₦${(amount || 0).toLocaleString()}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Make Rent Payment</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          {/* Success State */}
          {success ? (
            <div className="success-state">
              <CheckCircle size={48} className="success-icon" />
              <h4>Payment Submitted!</h4>
              <p>Your payment has been recorded and is pending confirmation.</p>
              <p className="small">You will receive a notification once it's confirmed.</p>
              <button className="btn-secondary" onClick={onClose}>Close</button>
            </div>
          ) : (
            <>
              {/* Property & Owner Info */}
              <div className="property-info-card">
                <div className="property-title">
                  <h4>{lease.property?.title || 'Property'}</h4>
                  <span className="unit-badge">Unit {lease.unit?.unit_number || 'N/A'}</span>
                </div>
                {ownerInfo && (
                  <div className="owner-info">
                    {ownerInfo.icon}
                    <span>Payable to: <strong>{ownerInfo.name}</strong></span>
                    <span className={`owner-type ${ownerInfo.type}`}>
                      {ownerInfo.type === 'estate_firm' ? '🏢 Estate Firm' : '🏠 Landlord'}
                    </span>
                  </div>
                )}
              </div>

              {/* Bank Details Section */}
              {hasValidBankDetails ? (
                <div className="bank-info">
                  <div className="bank-header">
                    <h4>💳 Payment Details</h4>
                    <span className="verified-badge">Verified Account</span>
                  </div>
                  <div className="bank-details-card">
                    <div className="detail-row">
                      <span className="detail-label">Bank:</span>
                      <span className="detail-value">{formattedBankDetails.bank_name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Account Number:</span>
                      <span className="detail-value account-number">{formattedBankDetails.account_number}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Account Name:</span>
                      <span className="detail-value">{formattedBankDetails.account_name}</span>
                    </div>
                  </div>
                  <div className="payment-note">
                    <AlertCircle size={12} />
                    <small>Please use the above account details to make your payment, then upload proof below.</small>
                  </div>
                </div>
              ) : (
                <div className="bank-info warning">
                  <AlertCircle size={20} />
                  <div className="warning-content">
                    <h4>⚠️ No Payment Details Available</h4>
                    <p>The property manager has not added their bank details yet.</p>
                    <button 
                      className="btn-contact"
                      onClick={() => window.location.href = `/dashboard/messages?recipient=${lease.landlord_id || lease.estate_firm_id}`}
                    >
                      Contact Property Manager
                    </button>
                  </div>
                </div>
              )}

              {/* Payment Form */}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>
                    <DollarSign size={14} />
                    Amount (₦)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="1"
                    step="1000"
                    placeholder="Enter amount"
                  />
                  <small>Monthly rent: {formatCurrency(lease.unit?.rent_amount || lease.monthly_rent)}</small>
                </div>

                <div className="form-group">
                  <label>
                    <Calendar size={14} />
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <small>Select the due date for this payment</small>
                </div>

                <div className="form-group">
                  <label>Upload Proof of Payment</label>
                  <div className="file-upload-area">
                    {file ? (
                      <div className="file-preview">
                        <FileText size={20} />
                        <span className="file-name">{file.name}</span>
                        <button 
                          type="button" 
                          className="remove-file"
                          onClick={() => setFile(null)}
                        >
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
                  <small>Upload a screenshot of your bank transfer or payment receipt</small>
                </div>

                <div className="form-group">
                  <label>Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="2"
                    placeholder="Add any additional information about this payment..."
                  />
                </div>

                {error && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={onClose} 
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={uploading || !hasValidBankDetails}
                  >
                    {uploading ? (
                      <>
                        <div className="spinner-small"></div>
                        Submitting...
                      </>
                    ) : (
                      'Submit Payment'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MakePaymentModal;