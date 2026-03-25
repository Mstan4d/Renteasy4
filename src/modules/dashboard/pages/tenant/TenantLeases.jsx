// src/modules/dashboard/pages/tenant/TenantLeases.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import VerifiedBadge from '../../../../shared/components/VerifiedBadge';
import RentEasyLoader from '../../../../shared/components/RentEasyLoader';
import MakePaymentModal from './MakePaymentModal'; // we'll create this
import { DollarSign, Calendar, CheckCircle, Clock, Upload } from 'lucide-react';
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

  const loadLeases = async () => {
  setLoading(true);
  setError(null);
  try {
    console.log('Loading leases for user:', user.id);
    
    // 1. Fetch all leases for this tenant
    const { data: leasesData, error: leasesError } = await supabase
      .from('leases')
      .select('*')
      .eq('tenant_id', user.id)
      .order('start_date', { ascending: false });

    if (leasesError) {
      console.error('Leases fetch error:', leasesError);
      throw leasesError;
    }

    console.log('Leases found:', leasesData?.length || 0);

    if (!leasesData || leasesData.length === 0) {
      setLeases([]);
      setActiveLease(null);
      setLoading(false);
      return;
    }

    // 2. Get unique IDs
    const propertyIds = [...new Set(leasesData.map(l => l.property_id).filter(Boolean))];
    const unitIds = [...new Set(leasesData.map(l => l.unit_id).filter(Boolean))];
    const landlordIds = [...new Set(leasesData.map(l => l.landlord_id).filter(Boolean))];
    const estateFirmIds = [...new Set(leasesData.map(l => l.estate_firm_id).filter(Boolean))];

    console.log('Fetching related data:', { propertyIds, unitIds, landlordIds, estateFirmIds });

    // 3. Fetch all related data in parallel
    const [propertiesRes, unitsRes, landlordsRes, estateFirmsRes] = await Promise.all([
      propertyIds.length > 0 
        ? supabase.from('properties').select('id, title, address').in('id', propertyIds)
        : { data: [] },
      unitIds.length > 0 
        ? supabase.from('units').select('id, unit_number, rent_amount, rent_frequency').in('id', unitIds)
        : { data: [] },
      landlordIds.length > 0 
        ? supabase.from('profiles').select('id, name, verified, avatar_url, bank_details').in('id', landlordIds)
        : { data: [] },
      estateFirmIds.length > 0 
        ? supabase.from('estate_firm_profiles').select('id, firm_name, bank_details').in('id', estateFirmIds)
        : { data: [] }
    ]);

    // Create lookup maps
    const propertiesMap = Object.fromEntries((propertiesRes.data || []).map(p => [p.id, p]));
    const unitsMap = Object.fromEntries((unitsRes.data || []).map(u => [u.id, u]));
    const landlordsMap = Object.fromEntries((landlordsRes.data || []).map(l => [l.id, l]));
    const estateFirmsMap = Object.fromEntries((estateFirmsRes.data || []).map(e => [e.id, e]));

    // 4. Fetch rent payments for all units
    let paymentsMap = {};
    if (unitIds.length > 0) {
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('rent_payments')
        .select('*')
        .in('unit_id', unitIds)
        .order('due_date', { ascending: false });
      
      if (paymentsError) {
        console.error('Payments fetch error:', paymentsError);
      } else if (paymentsData) {
        paymentsMap = paymentsData.reduce((acc, p) => {
          if (!acc[p.unit_id]) acc[p.unit_id] = [];
          acc[p.unit_id].push(p);
          return acc;
        }, {});
      }
    }

    // 5. Combine all data
    const enrichedLeases = leasesData.map(lease => {
      const property = propertiesMap[lease.property_id] || null;
      const unit = unitsMap[lease.unit_id] || null;
      const landlord = landlordsMap[lease.landlord_id] || null;
      const estateFirm = estateFirmsMap[lease.estate_firm_id] || null;
      const payments = paymentsMap[lease.unit_id] || [];

      // Calculate bank details priority: estate firm first, then landlord
      const bankDetails = estateFirm?.bank_details || landlord?.bank_details || null;

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

    console.log('Enriched leases:', enrichedLeases.length);
    setLeases(enrichedLeases);
    setActiveLease(enrichedLeases.find(lease => lease.status === 'active'));
  } catch (err) {
    console.error('Error loading leases:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
  const viewAgreement = (leaseId) => {
    const lease = leases.find(l => l.id === leaseId);
    if (lease?.agreement_url) {
      window.open(lease.agreement_url, '_blank');
    } else {
      alert('No agreement document available.');
    }
  };

  const handleMakePayment = (lease) => {
    setSelectedLeaseForPayment(lease);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    loadLeases(); // refresh payments
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-warning', icon: <Clock size={14} />, text: 'Pending' },
      paid: { class: 'badge-info', icon: <CheckCircle size={14} />, text: 'Paid' },
      confirmed: { class: 'badge-success', icon: <CheckCircle size={14} />, text: 'Confirmed' },
      rejected: { class: 'badge-danger', icon: <XCircle size={14} />, text: 'Rejected' }
    };
    const b = badges[status] || { class: 'badge-secondary', text: status };
    return <span className={`status-badge ${b.class}`}>{b.icon} {b.text}</span>;
  };

  const formatCurrency = (amount) => `₦${(amount || 0).toLocaleString()}`;

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
            // Determine which bank details to show: estate firm if exists, else landlord
            const bankDetails = lease.estate_firm?.bank_details || lease.landlord?.bank_details || null;
            const upcomingPayments = lease.payments?.filter(p => p.status !== 'confirmed' && p.status !== 'rejected') || [];
            const lastConfirmed = lease.payments?.find(p => p.status === 'confirmed');

            return (
              <div key={lease.id} className="lease-card">
                <div className="lease-header">
                  <h3>{lease.property?.title}</h3>
                  <span className={`lease-status ${lease.status}`}>{lease.status}</span>
                </div>

                <div className="lease-details">
                  <p><strong>Unit:</strong> {lease.unit?.unit_number || 'N/A'}</p>
                  <p><strong>Monthly Rent:</strong> {formatCurrency(lease.unit?.rent_amount || lease.monthly_rent)}</p>
                  <p><strong>Duration:</strong> {lease.start_date} to {lease.end_date}</p>
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

  {lease.payments?.filter(p => p.status !== 'confirmed' && p.status !== 'rejected').length > 0 ? (
    <div className="payment-list">
      {lease.payments.filter(p => p.status !== 'confirmed' && p.status !== 'rejected').map(payment => (
        <div key={payment.id} className="payment-item">
          <div>
            <span className="due-date">Due: {payment.due_date}</span>
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
  >
    <DollarSign size={16} /> Make Payment
  </button>
</div>

                <div className="lease-actions">
                  <button className="btn-outline" onClick={() => viewAgreement(lease.id)}>View Agreement</button>
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
          bankDetails={selectedLeaseForPayment.estate_firm?.bank_details || selectedLeaseForPayment.landlord?.bank_details}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default TenantLeases;