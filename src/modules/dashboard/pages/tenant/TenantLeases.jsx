// src/modules/dashboard/pages/tenant/TenantLeases.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import VerifiedBadge from '../../../../shared/components/VerifiedBadge';
import RentEasyLoader from '../../../../shared/components/RentEasyLoader';
import MakePaymentModal from './MakePaymentModal';
import { DollarSign, Calendar, CheckCircle, Clock, Upload, XCircle } from 'lucide-react';
import './TenantLeases.css';

const TenantLeases = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [leases, setLeases] = useState([]);
  const [activeLease, setActiveLease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedLeaseForPayment, setSelectedLeaseForPayment] = useState(null);

  useEffect(() => {
    if (user) loadLeases();
  }, [user]);

  // In TenantLeases.jsx - Update loadLeases function

const loadLeases = async () => {
  setLoading(true);
  setError(null);
  try {
    console.log('Loading leases for user:', user.id);
    
    // 1. Fetch leases from leases table
    const { data: leasesData, error: leasesError } = await supabase
      .from('leases')
      .select('*')
      .eq('tenant_id', user.id)
      .order('start_date', { ascending: false });

    if (leasesError) throw leasesError;

    // 2. Also fetch documents that are lease agreements linked to units this tenant occupies
    // First get all units occupied by this tenant
    const { data: unitsData } = await supabase
      .from('units')
      .select('id, unit_number, property:property_id(id, title, address)')
      .eq('tenant_renteasy_id', user.id);
    
    const unitIds = (unitsData || []).map(u => u.id);
    
    // Fetch documents linked to these units with lease agreement type
    let documentLeases = [];
    if (unitIds.length > 0) {
      const { data: docsData } = await supabase
        .from('estate_documents')
        .select('*, unit:unit_id(*)')
        .in('unit_id', unitIds)
        .eq('document_type', 'lease_agreement')
        .eq('status', 'active');
      
      // Convert documents to lease-like objects
      documentLeases = (docsData || []).map(doc => ({
        id: doc.id,
        tenant_id: user.id,
        unit_id: doc.unit_id,
        property_id: doc.unit?.property_id,
        agreement_url: doc.file_url,
        agreement_document_id: doc.id,
        monthly_rent: doc.unit?.rent_amount || 0,
        start_date: doc.created_at,
        end_date: null,
        status: 'active',
        source: 'document_manager',
        unit: doc.unit,
        property: doc.unit?.property
      }));
    }

    // 3. Combine leases from both sources
    const allLeases = [...(leasesData || []), ...documentLeases];
    
    // Remove duplicates by unit_id (prefer the one with agreement_url)
    const uniqueLeases = [];
    const seenUnits = new Set();
    
    allLeases.forEach(lease => {
      if (!seenUnits.has(lease.unit_id)) {
        seenUnits.add(lease.unit_id);
        uniqueLeases.push(lease);
      } else {
        // If we already have a lease for this unit, check if this one has agreement_url
        const existingIndex = uniqueLeases.findIndex(l => l.unit_id === lease.unit_id);
        if (existingIndex !== -1 && lease.agreement_url && !uniqueLeases[existingIndex].agreement_url) {
          uniqueLeases[existingIndex] = lease;
        }
      }
    });

    if (uniqueLeases.length === 0) {
      setLeases([]);
      setActiveLease(null);
      setLoading(false);
      return;
    }

    // Get unique property IDs and unit IDs
    const propertyIds = [...new Set(uniqueLeases.map(l => l.property_id).filter(Boolean))];
    const unitIdsList = [...new Set(uniqueLeases.map(l => l.unit_id).filter(Boolean))];
    const landlordIds = [...new Set(uniqueLeases.map(l => l.landlord_id).filter(Boolean))];

    // Fetch all related data in parallel
    const [propertiesRes, unitsRes, landlordsRes] = await Promise.all([
      propertyIds.length > 0 
        ? supabase.from('properties').select('id, title, address, estate_firm_id, landlord_id').in('id', propertyIds)
        : { data: [] },
      unitIdsList.length > 0 
        ? supabase.from('units').select('id, unit_number, rent_amount, rent_frequency').in('id', unitIdsList)
        : { data: [] },
      landlordIds.length > 0 
        ? supabase.from('profiles').select('id, full_name, name, verified, avatar_url, bank_details').in('id', landlordIds)
        : { data: [] }
    ]);

    // Get estate firm IDs from properties
    const estateFirmIds = [...new Set((propertiesRes.data || []).map(p => p.estate_firm_id).filter(Boolean))];
    
    // Fetch estate firms with bank details
    let estateFirmsMap = {};
    if (estateFirmIds.length > 0) {
      const { data: estateFirms } = await supabase
        .from('estate_firm_profiles')
        .select('id, firm_name, bank_details')
        .in('id', estateFirmIds);
      
      if (estateFirms) {
        estateFirmsMap = Object.fromEntries(estateFirms.map(e => [e.id, e]));
      }
    }

    // Create lookup maps
    const propertiesMap = Object.fromEntries((propertiesRes.data || []).map(p => [p.id, p]));
    const unitsMap = Object.fromEntries((unitsRes.data || []).map(u => [u.id, u]));
    const landlordsMap = Object.fromEntries((landlordsRes.data || []).map(l => [l.id, l]));

    // Fetch rent payments
    let paymentsMap = {};
    if (unitIdsList.length > 0) {
      const { data: paymentsData } = await supabase
        .from('rent_payments')
        .select('*')
        .in('unit_id', unitIdsList)
        .order('due_date', { ascending: false });
      
      if (paymentsData) {
        paymentsMap = paymentsData.reduce((acc, p) => {
          if (!acc[p.unit_id]) acc[p.unit_id] = [];
          acc[p.unit_id].push(p);
          return acc;
        }, {});
      }
    }

    // Combine all data
    const enrichedLeases = uniqueLeases.map(lease => {
      const property = propertiesMap[lease.property_id] || null;
      const unit = unitsMap[lease.unit_id] || null;
      const landlord = landlordsMap[lease.landlord_id] || null;
      const payments = paymentsMap[lease.unit_id] || [];

      // Get bank details
      let bankDetails = null;
      let estateFirm = null;
      
      if (property?.estate_firm_id && estateFirmsMap[property.estate_firm_id]) {
        estateFirm = estateFirmsMap[property.estate_firm_id];
        bankDetails = estateFirm.bank_details;
      } else if (landlord?.bank_details) {
        bankDetails = landlord.bank_details;
      }

      return {
        ...lease,
        property,
        unit,
        landlord,
        estate_firm: estateFirm,
        bank_details: bankDetails,
        payments
      };
    });

    setLeases(enrichedLeases);
    setActiveLease(enrichedLeases.find(lease => lease.status === 'active'));

  } catch (err) {
    console.error('Error loading leases:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  const viewAgreement = (lease) => {
  // Check if agreement_url exists
  if (lease?.agreement_url) {
    window.open(lease.agreement_url, '_blank');
  } 
  // If no agreement_url but we have a document from document manager
  else if (lease?.source === 'document_manager' && lease?.file_url) {
    window.open(lease.file_url, '_blank');
  }
  else {
    alert('No agreement document available for this lease.');
  }
};
  const handleMakePayment = (lease) => {
    setSelectedLeaseForPayment(lease);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    loadLeases();
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-warning', icon: <Clock size={14} />, text: 'Pending' },
      active: { class: 'badge-success', icon: <CheckCircle size={14} />, text: 'Active' },
      completed: { class: 'badge-info', icon: <CheckCircle size={14} />, text: 'Completed' },
      cancelled: { class: 'badge-danger', icon: <XCircle size={14} />, text: 'Cancelled' }
    };
    const b = badges[status] || { class: 'badge-secondary', text: status };
    return <span className={`status-badge ${b.class}`}>{b.icon} {b.text}</span>;
  };

  const formatCurrency = (amount) => `₦${(amount || 0).toLocaleString()}`;
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  if (loading) {
    return <RentEasyLoader message="Loading your Leases..." fullScreen />;
  }

  if (error) {
    return (
      <div className="tenant-leases error">
        <p>Failed to load leases: {error}</p>
        <button onClick={loadLeases}>Retry</button>
      </div>
    );
  }

  return (
    <div className="tenant-leases">
      <div className="leases-header">
        <h1>My Leases</h1>
        {activeLease && (
          <div className="active-lease-badge">
            Active Lease: {activeLease.property?.title}
          </div>
        )}
      </div>

      {leases.length === 0 ? (
        <div className="empty-state">No leases found.</div>
      ) : (
        <div className="leases-list">
          {leases.map(lease => {
            const upcomingPayments = lease.payments?.filter(p => p.status !== 'confirmed' && p.status !== 'rejected') || [];

            return (
              <div key={lease.id} className="lease-card">
                <div className="lease-header">
                  <h3>{lease.property?.title}</h3>
                  {getStatusBadge(lease.status)}
                </div>

                <div className="lease-details">
                  <p><strong>Unit:</strong> {lease.unit?.unit_number || 'N/A'}</p>
                  <p><strong>Monthly Rent:</strong> {formatCurrency(lease.unit?.rent_amount || lease.monthly_rent)}</p>
                  <p><strong>Duration:</strong> {formatDate(lease.start_date)} - {formatDate(lease.end_date)}</p>
                </div>

                {/* Payment Section */}
                <div className="payment-section">
                  <h4>Rent Payments</h4>
                  
                  {lease.bank_details && (
                    <div className="bank-details">
                      <p><strong>Bank:</strong> {lease.bank_details.bank_name}</p>
                      <p><strong>Account Number:</strong> {lease.bank_details.account_number}</p>
                      <p><strong>Account Name:</strong> {lease.bank_details.account_name}</p>
                    </div>
                  )}

                  {upcomingPayments.length > 0 ? (
                    <div className="payment-list">
                      {upcomingPayments.map(payment => (
                        <div key={payment.id} className="payment-item">
                          <div>
                            <span className="due-date">Due: {formatDate(payment.due_date)}</span>
                            <span className="amount">{formatCurrency(payment.amount_due)}</span>
                          </div>
                          <div className="payment-status">{getStatusBadge(payment.status)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-payments">No pending payments.</p>
                  )}

                  <button 
                    className="btn-pay"
                    onClick={() => handleMakePayment(lease)}
                    disabled={!lease.bank_details}
                    title={!lease.bank_details ? "Bank details not available. Please contact property manager." : ""}
                  >
                    <DollarSign size={16} /> Make Payment
                  </button>
                  {!lease.bank_details && (
                    <p className="bank-details-warning">
                      ⚠️ Payment details not available. Please contact your property manager.
                    </p>
                  )}
                </div>

                <div className="lease-actions">
                  <button className="btn-outline" onClick={() => viewAgreement(lease)}>View Agreement</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedLeaseForPayment && (
        <MakePaymentModal
          lease={selectedLeaseForPayment}
          bankDetails={selectedLeaseForPayment.bank_details}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default TenantLeases;