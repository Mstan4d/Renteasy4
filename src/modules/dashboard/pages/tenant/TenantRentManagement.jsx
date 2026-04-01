// src/modules/dashboard/pages/tenant/TenantRentManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import RentEasyLoader from '../../../../shared/components/RentEasyLoader';
import { supabase } from '../../../../shared/lib/supabaseClient';
import {
  DollarSign, Calendar, CheckCircle, XCircle, Clock,
  Upload, FileText, Eye, Download, MessageSquare,
  AlertCircle, Home, Building, User, Phone, Mail,
  History, Info, Send, X
} from 'lucide-react';
import './TenantRentManagement.css';

const TenantRentManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeUnit, setActiveUnit] = useState(null);
  const [units, setUnits] = useState([]);
  const [payments, setPayments] = useState([]);
  const [extensions, setExtensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    description: '',
    proofFile: null
  });
  const [extensionForm, setExtensionForm] = useState({
    requested_date: '',
    reason: ''
  });
  const [activeTab, setActiveTab] = useState('current');

  // Helper functions
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₦0';
    return `₦${amount.toLocaleString()}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  useEffect(() => {
    if (user) {
      loadTenantData();
    }
  }, [user]);

  // src/modules/dashboard/pages/tenant/TenantRentManagement.jsx
// Replace the loadTenantData function with this updated version

const loadTenantData = async () => {
  setLoading(true);
  setError(null);
  try {
    // 1. Get all units where tenant is assigned
    const { data: unitsData, error: unitsError } = await supabase
      .from('units')
      .select('*')
      .eq('tenant_id', user.id);

    if (unitsError) throw unitsError;

    if (!unitsData || unitsData.length === 0) {
      setUnits([]);
      setLoading(false);
      return;
    }

    // 2. Get property IDs from units
    const propertyIds = unitsData.map(u => u.property_id).filter(Boolean);
    
    // 3. Fetch properties
    let propertiesMap = {};
    if (propertyIds.length > 0) {
      const { data: propertiesData, error: propsError } = await supabase
        .from('properties')
        .select('*')
        .in('id', propertyIds);
      
      if (!propsError && propertiesData) {
        propertiesMap = Object.fromEntries(propertiesData.map(p => [p.id, p]));
      }
    }

    // 4. Get estate firm IDs from properties
    const estateFirmIds = Object.values(propertiesMap)
      .map(p => p.estate_firm_id)
      .filter(Boolean);
    const landlordIds = Object.values(propertiesMap)
      .map(p => p.landlord_id)
      .filter(Boolean);

    // 5. Fetch estate firm profiles with bank details
    let estateFirmMap = {};
    if (estateFirmIds.length > 0) {
      const { data: firmsData, error: firmsError } = await supabase
        .from('estate_firm_profiles')
        .select('id, firm_name, business_phone, business_email, user_id, bank_details')
        .in('id', estateFirmIds);
      
      if (!firmsError && firmsData) {
        estateFirmMap = Object.fromEntries(firmsData.map(f => [f.id, f]));
        console.log('Estate firm bank details loaded:', firmsData.map(f => ({
          id: f.id,
          name: f.firm_name,
          hasBankDetails: !!f.bank_details,
          bankDetails: f.bank_details
        })));
      }
    }

    // 6. Fetch landlord profiles (for properties not managed by estate firms)
    let landlordMap = {};
    if (landlordIds.length > 0) {
      const { data: landlordsData } = await supabase
        .from('profiles')
        .select('id, full_name, name, email, phone, bank_details')
        .in('id', landlordIds);
      
      if (landlordsData) {
        landlordMap = Object.fromEntries(landlordsData.map(l => [l.id, l]));
      }
    }

    // 7. Combine all data with bank details from the source
    const enrichedUnits = unitsData.map(unit => {
      const property = propertiesMap[unit.property_id] || null;
      let estateFirm = null;
      let landlord = null;
      let bankDetails = null;
      let contactInfo = null;
      
      // Get the property owner (estate firm or landlord)
      if (property?.estate_firm_id && estateFirmMap[property.estate_firm_id]) {
        estateFirm = estateFirmMap[property.estate_firm_id];
        // IMPORTANT: Bank details come directly from estate firm profile
        bankDetails = estateFirm.bank_details;
        contactInfo = {
          id: estateFirm.id,
          name: estateFirm.firm_name,
          phone: estateFirm.business_phone,
          email: estateFirm.business_email,
          type: 'estate_firm'
        };
      } else if (property?.landlord_id && landlordMap[property.landlord_id]) {
        landlord = landlordMap[property.landlord_id];
        // Bank details from landlord profile
        bankDetails = landlord.bank_details;
        contactInfo = {
          id: landlord.id,
          name: landlord.full_name || landlord.name,
          phone: landlord.phone,
          email: landlord.email,
          type: 'landlord'
        };
      }
      
      return {
        ...unit,
        property: property ? {
          ...property,
          estate_firm: estateFirm,
          landlord: landlord
        } : null,
        bank_details: bankDetails,  // Direct from the source
        contact_info: contactInfo
      };
    });

    setUnits(enrichedUnits);
    
    if (enrichedUnits.length > 0) {
      setActiveUnit(enrichedUnits[0]);
      setSelectedUnit(enrichedUnits[0]);
      
      // 8. Get payment history for the first unit
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('unit_id', enrichedUnits[0].id)
        .eq('payment_type', 'rent')
        .order('payment_date', { ascending: false });
      
      if (!paymentsError) {
        setPayments(paymentsData || []);
      }
      
      // 9. Get payment extensions
      const { data: extensionsData, error: extError } = await supabase
        .from('payment_extensions')
        .select('*')
        .eq('unit_id', enrichedUnits[0].id)
        .order('created_at', { ascending: false });
      
      if (!extError) {
        setExtensions(extensionsData || []);
      }
    }
    
  } catch (err) {
    console.error('Error loading tenant data:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
  const handleUnitChange = async (unitId) => {
  const unit = units.find(u => u.id === unitId);
  setActiveUnit(unit);
  setSelectedUnit(unit);

  // Load payments for selected unit
  const { data: paymentsData, error: paymentsError } = await supabase
    .from('payments')
    .select('*')
    .eq('unit_id', unitId)
    .eq('payment_type', 'rent')
    .order('payment_date', { ascending: false });

  if (!paymentsError) {
    setPayments(paymentsData || []);
  }

  // Load extensions for selected unit
  const { data: extensionsData, error: extError } = await supabase
    .from('payment_extensions')
    .select('*')
    .eq('unit_id', unitId)
    .order('created_at', { ascending: false });

  if (!extError) {
    setExtensions(extensionsData || []);
  }
};
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUnit) return;
    if (!paymentForm.amount || paymentForm.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!paymentForm.proofFile) {
      alert('Please upload proof of payment');
      return;
    }

    setUploading(true);
    try {
      let attachmentUrl = null;
      let receiptUrl = null;

      // Upload proof file to storage
      if (paymentForm.proofFile) {
        const fileExt = paymentForm.proofFile.name.split('.').pop();
        const fileName = `payment_proofs/${selectedUnit.id}/${Date.now()}.${fileExt}`;
        const filePath = fileName;
        
        const { error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(filePath, paymentForm.proofFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('payment-proofs')
          .getPublicUrl(filePath);
        
        attachmentUrl = urlData.publicUrl;
        receiptUrl = urlData.publicUrl;
      }

      // Generate unique reference
      const reference = `RENT-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

      // Create payment record with correct column names
      const paymentData = {
        unit_id: selectedUnit.id,
        user_id: user.id,
        amount: parseFloat(paymentForm.amount),
        currency: 'NGN',
        payment_type: 'rent',
        payment_method: 'bank_transfer',
        status: 'pending',
        reference: reference,
        attachment_url: attachmentUrl,
        receipt_url: receiptUrl,
        description: paymentForm.description || `Rent payment for ${selectedUnit.property?.title} Unit ${selectedUnit.unit_number}`,
        payment_date: paymentForm.payment_date,
        due_date: paymentForm.payment_date,
        notes: paymentForm.description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: payment, error: payError } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single();

      if (payError) throw payError;

      // Also save document to tenant_documents
      if (attachmentUrl) {
        await supabase
          .from('tenant_documents')
          .insert({
            tenant_id: user.id,
            title: `Rent Payment Receipt - ${new Date().toLocaleDateString()}`,
            description: `Payment of ${formatCurrency(paymentForm.amount)} for ${selectedUnit.property?.title} Unit ${selectedUnit.unit_number}`,
            file_url: attachmentUrl,
            file_type: paymentForm.proofFile.type,
            file_size: paymentForm.proofFile.size,
            category: 'receipt',
            created_at: new Date().toISOString()
          });
      }

      // Send notification to property owner
      const property = selectedUnit.property;
      if (property?.estate_firm_id) {
        const { data: estateFirm } = await supabase
          .from('estate_firm_profiles')
          .select('user_id, firm_name')
          .eq('id', property.estate_firm_id)
          .single();
        
        if (estateFirm) {
          await supabase
            .from('estate_firm_notifications')
            .insert({
              estate_firm_id: property.estate_firm_id,
              tenant_id: user.id,
              title: 'New Rent Payment',
              message: `Tenant has submitted a rent payment of ${formatCurrency(paymentForm.amount)} for ${property.title} Unit ${selectedUnit.unit_number}. Reference: ${reference}`,
              type: 'rent_payment',
              read: false,
              created_at: new Date().toISOString()
            });
        }
      } else if (property?.landlord_id) {
        await supabase
          .from('landlord_notifications')
          .insert({
            landlord_id: property.landlord_id,
            tenant_id: user.id,
            title: 'New Rent Payment',
            message: `Tenant has submitted a rent payment of ${formatCurrency(paymentForm.amount)} for ${property.title} Unit ${selectedUnit.unit_number}. Reference: ${reference}`,
            type: 'rent_payment',
            read: false,
            created_at: new Date().toISOString()
          });
      }

      alert('Payment submitted successfully! Waiting for confirmation.');
      setShowPaymentModal(false);
      setPaymentForm({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        description: '',
        proofFile: null
      });
      loadTenantData();
    } catch (err) {
      console.error('Error submitting payment:', err);
      alert(`Failed to submit payment: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleExtensionRequest = async (e) => {
  e.preventDefault();
  if (!selectedUnit) return;
  if (!extensionForm.requested_date) {
    alert('Please select a requested extension date');
    return;
  }

  try {
    // Get the current due date (next payment due)
    const nextDue = getNextPaymentDue();
    
    console.log('Submitting extension request:', {
      unit_id: selectedUnit.id,
      tenant_id: user.id,
      current_due_date: nextDue ? nextDue.toISOString().split('T')[0] : null,
      requested_date: extensionForm.requested_date,
      reason: extensionForm.reason,
      status: 'pending'
    });

    const { data, error } = await supabase
      .from('payment_extensions')
      .insert({
        unit_id: selectedUnit.id,
        tenant_id: user.id,
        current_due_date: nextDue ? nextDue.toISOString().split('T')[0] : null,
        requested_date: extensionForm.requested_date,
        reason: extensionForm.reason,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Extension insert error:', error);
      throw error;
    }

    console.log('Extension request created:', data);

    // Send notification to property owner
    const property = selectedUnit.property;
    if (property?.estate_firm_id) {
      const { data: estateFirm } = await supabase
        .from('estate_firm_profiles')
        .select('user_id, firm_name')
        .eq('id', property.estate_firm_id)
        .single();
      
      if (estateFirm) {
        await supabase
          .from('estate_firm_notifications')
          .insert({
            estate_firm_id: property.estate_firm_id,
            tenant_id: user.id,
            title: 'Payment Extension Request',
            message: `Tenant has requested a payment extension to ${new Date(extensionForm.requested_date).toLocaleDateString()}. Reason: ${extensionForm.reason}`,
            type: 'payment_extension',
            read: false,
            created_at: new Date().toISOString()
          });
      }
    } else if (property?.landlord_id) {
      await supabase
        .from('landlord_notifications')
        .insert({
          landlord_id: property.landlord_id,
          tenant_id: user.id,
          title: 'Payment Extension Request',
          message: `Tenant has requested a payment extension to ${new Date(extensionForm.requested_date).toLocaleDateString()}. Reason: ${extensionForm.reason}`,
          type: 'payment_extension',
          read: false,
          created_at: new Date().toISOString()
        });
    }

    alert('Extension request submitted successfully!');
    setShowExtensionModal(false);
    setExtensionForm({ requested_date: '', reason: '' });
    loadTenantData(); // Refresh the list
  } catch (err) {
    console.error('Error requesting extension:', err);
    alert(`Failed to submit extension request: ${err.message}`);
  }
};

  const getNextPaymentDue = () => {
    if (!activeUnit) return null;
    const lastPayment = payments.find(p => p.status === 'confirmed');
    const leaseEnd = new Date(activeUnit.lease_end_date);
    const now = new Date();
    
    if (lastPayment) {
      const nextDue = new Date(lastPayment.payment_date);
      nextDue.setMonth(nextDue.getMonth() + 1);
      return nextDue;
    }
    return leaseEnd > now ? leaseEnd : now;
  };

  const getPaymentStatus = () => {
    const nextDue = getNextPaymentDue();
    if (!nextDue) return { text: 'No payment schedule', color: 'gray' };
    
    const now = new Date();
    const daysUntilDue = Math.ceil((nextDue - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0) return { text: 'Overdue', color: 'danger' };
    if (daysUntilDue <= 7) return { text: 'Due Soon', color: 'warning' };
    return { text: `Due in ${daysUntilDue} days`, color: 'success' };
  };

 const getPropertyContact = () => {
  if (!activeUnit?.contact_info) return null;
  return activeUnit.contact_info;
};

  const contactInfo = getPropertyContact();
  const paymentStatus = getPaymentStatus();

   if (loading) {
  return <RentEasyLoader message="Loading your Rents..." fullScreen />;
}
  if (error) {
    return (
      <div className="tenant-rent-management">
        <div className="error-state">
          <AlertCircle size={48} />
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={loadTenantData}>Retry</button>
        </div>
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="tenant-rent-management">
        <div className="empty-state">
          <Home size={64} />
          <h3>No Active Rentals</h3>
          <p>You don't have any active rental units.</p>
          <button onClick={() => navigate('/listings')}>Browse Properties</button>
        </div>
      </div>
    );
  }

  return (
    <div className="tenant-rent-management">
      <div className="page-header">
        <h1>Rent Management</h1>
        <p>Manage your rent payments and view history</p>
      </div>

      {/* Unit Selector */}
      {units.length > 1 && (
        <div className="unit-selector">
          <label>Select Property:</label>
          <select value={activeUnit?.id} onChange={(e) => handleUnitChange(e.target.value)}>
            {units.map(unit => (
              <option key={unit.id} value={unit.id}>
                {unit.property?.title} - Unit {unit.unit_number}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Rent Summary Card */}
      {activeUnit && (
        <div className="rent-summary-card">
          <div className="summary-header">
            <h2>{activeUnit.property?.title}</h2>
            <span className="unit-badge">Unit {activeUnit.unit_number}</span>
          </div>
          
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Annual Rent</span>
              <span className="value">{formatCurrency(activeUnit.rent_amount)}</span>
              <span className="frequency">/{activeUnit.rent_frequency}</span>
            </div>
            <div className="summary-item">
              <span className="label">Lease Period</span>
              <span className="value">{formatDate(activeUnit.lease_start_date)} - {formatDate(activeUnit.lease_end_date)}</span>
            </div>
            <div className="summary-item">
              <span className="label">Next Payment Due</span>
              <span className="value">{getNextPaymentDue() ? formatDate(getNextPaymentDue()) : 'N/A'}</span>
              <span className={`status-badge ${paymentStatus.color}`}>{paymentStatus.text}</span>
            </div>
          </div>

          <div className="summary-actions">
  <button className="btn-primary" onClick={() => setShowPaymentModal(true)}>
    <DollarSign size={18} /> Make Payment
  </button>
  <button className="btn-outline" onClick={() => setShowExtensionModal(true)}>
    <Calendar size={18} /> Request Extension
  </button>
  <button className="btn-outline" onClick={() => navigate('/dashboard/tenant/leases')}>
    <FileText size={18} /> View All Leases
  </button>
  {contactInfo && (
    <button className="btn-outline" onClick={() => navigate(`/dashboard/messages?recipient=${contactInfo.id}`)}>
      <MessageSquare size={18} /> Contact {contactInfo.firm_name || contactInfo.name}
    </button>
  )}
</div>
        </div>
      )}

      {/* Contact Info Card */}
      {contactInfo && (
  <div className="contact-card">
    <h3>Property Manager Contact</h3>
    <div className="contact-details">
      <div className="contact-item">
        {contactInfo.type === 'estate_firm' ? <Building size={16} /> : <Home size={16} />}
        <span>{contactInfo.name}</span>
      </div>
      {contactInfo.phone && (
        <div className="contact-item">
          <Phone size={16} />
          <span>{contactInfo.phone}</span>
        </div>
      )}
      {contactInfo.email && (
        <div className="contact-item">
          <Mail size={16} />
          <span>{contactInfo.email}</span>
        </div>
      )}
    </div>
    
    {/* Show bank details status */}
    {activeUnit?.bank_details ? (
      <div className="bank-details-status success">
        <CheckCircle size={14} />
        <span>Payment details available. You can make payments.</span>
      </div>
    ) : (
      <div className="bank-details-status warning">
        <AlertCircle size={14} />
        <span>No payment details added yet. Please contact {contactInfo.name} to add bank details.</span>
      </div>
    )}
  </div>
)}
      {/* Tabs */}
      <div className="tabs-container">
        <button className={`tab ${activeTab === 'current' ? 'active' : ''}`} onClick={() => setActiveTab('current')}>
          <Clock size={16} /> Current
        </button>
        <button className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <History size={16} /> Payment History
        </button>
        <button className={`tab ${activeTab === 'extensions' ? 'active' : ''}`} onClick={() => setActiveTab('extensions')}>
          <Calendar size={16} /> Extension Requests
        </button>
      </div>

      {/* Current Payments */}
      {activeTab === 'current' && (
        <div className="current-payments">
          <div className="payment-status-card">
            <div className="status-icon">
              {paymentStatus.color === 'danger' ? <AlertCircle size={32} /> : 
               paymentStatus.color === 'warning' ? <Clock size={32} /> : 
               <CheckCircle size={32} />}
            </div>
            <div className="status-info">
              <h3>Payment Status</h3>
              <p className={`status-text ${paymentStatus.color}`}>{paymentStatus.text}</p>
              {getNextPaymentDue() && (
                <p className="due-date">Due Date: {formatDate(getNextPaymentDue())}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment History */}
      {activeTab === 'history' && (
        <div className="payment-history">
          {payments.length === 0 ? (
            <div className="empty-history">
              <FileText size={48} />
              <p>No payment history yet</p>
            </div>
          ) : (
            <div className="history-list">
              {payments.map(payment => (
                <div key={payment.id} className="history-item">
                  <div className="history-date">
                    <Calendar size={16} />
                    <span>{formatDate(payment.payment_date)}</span>
                  </div>
                  <div className="history-amount">{formatCurrency(payment.amount)}</div>
                  <div className={`history-status status-${payment.status}`}>
                    {payment.status === 'confirmed' && <CheckCircle size={14} />}
                    {payment.status === 'pending' && <Clock size={14} />}
                    {payment.status === 'rejected' && <XCircle size={14} />}
                    <span>{payment.status}</span>
                  </div>
                  {payment.attachment_url && (
                    <a href={payment.attachment_url} target="_blank" rel="noopener" className="history-proof">
                      <Eye size={14} /> View Proof
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Extension Requests */}
      {activeTab === 'extensions' && (
        <div className="extension-requests">
          <div className="info-banner">
            <Info size={18} />
            <span>Need more time to pay? Request a payment extension below.</span>
          </div>
          {extensions.length > 0 && (
            <div className="extensions-list">
              <h4>Your Extension Requests</h4>
              {extensions.map(ext => (
                <div key={ext.id} className="extension-item">
                  <div className="extension-date">
                    Requested: {formatDate(ext.requested_date)}
                  </div>
                  <div className={`extension-status status-${ext.status}`}>
                    {ext.status === 'approved' && <CheckCircle size={14} />}
                    {ext.status === 'pending' && <Clock size={14} />}
                    {ext.status === 'rejected' && <XCircle size={14} />}
                    <span>{ext.status}</span>
                  </div>
                  <div className="extension-reason">{ext.reason}</div>
                </div>
              ))}
            </div>
          )}
          <button className="btn-outline request-btn" onClick={() => setShowExtensionModal(true)}>
            <Calendar size={18} /> Request Extension
          </button>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Make Rent Payment</h2>
              <button className="close-btn" onClick={() => setShowPaymentModal(false)}>×</button>
            </div>
            <form onSubmit={handlePaymentSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Amount (₦)</label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                    placeholder={`${activeUnit?.rent_amount} (Monthly Rent)`}
                    required
                  />
                  <small>Monthly rent: {formatCurrency(activeUnit?.rent_amount)}</small>
                </div>

                <div className="form-group">
                  <label>Payment Date</label>
                  <input
                    type="date"
                    value={paymentForm.payment_date}
                    onChange={(e) => setPaymentForm({...paymentForm, payment_date: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Upload Payment Proof (Screenshot/Receipt)</label>
                  <div className="file-upload-area">
                    {paymentForm.proofFile ? (
                      <div className="file-preview">
                        <span>{paymentForm.proofFile.name}</span>
                        <button 
                          type="button" 
                          onClick={() => setPaymentForm({...paymentForm, proofFile: null})}
                          className="remove-file"
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
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              setPaymentForm({...paymentForm, proofFile: e.target.files[0]});
                            }
                          }}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                  </div>
                  <small>Upload a screenshot of your bank transfer or payment receipt</small>
                </div>

                <div className="form-group">
                  <label>Description (Optional)</label>
                  <textarea
                    value={paymentForm.description}
                    onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})}
                    placeholder="Add any notes about this payment..."
                    rows="3"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Submit Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Extension Modal */}
      {showExtensionModal && (
        <div className="modal-overlay" onClick={() => setShowExtensionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Payment Extension</h2>
              <button className="close-btn" onClick={() => setShowExtensionModal(false)}>×</button>
            </div>
            <form onSubmit={handleExtensionRequest}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Requested Extension Date</label>
                  <input
                    type="date"
                    value={extensionForm.requested_date}
                    onChange={(e) => setExtensionForm({...extensionForm, requested_date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                  <small>Current due date: {formatDate(getNextPaymentDue())}</small>
                </div>

                <div className="form-group">
                  <label>Reason for Extension</label>
                  <textarea
                    value={extensionForm.reason}
                    onChange={(e) => setExtensionForm({...extensionForm, reason: e.target.value})}
                    placeholder="Please explain why you need an extension..."
                    rows="4"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowExtensionModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantRentManagement;