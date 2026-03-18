// src/modules/dashboard/pages/tenant/TenantLeases.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import VerifiedBadge from '../../../../shared/components/VerifiedBadge';
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
      // Fetch leases with property, landlord, unit, and estate firm info
      const { data, error } = await supabase
        .from('leases')
        .select(`
          *,
          property:property_id (id, title, address, estate_firm_id),
          unit:unit_id (id, unit_number, rent_amount, rent_frequency),
          landlord:landlord_id (id, name, verified, avatar_url, bank_details),
          estate_firm:estate_firm_id (id, firm_name, bank_details)
        `)
        .eq('tenant_id', user.id)
        .order('start_date', { ascending: false });

      if (error) throw error;

      // For each lease, fetch rent payments
      const leasesWithPayments = await Promise.all(
        (data || []).map(async (lease) => {
          let payments = [];
          if (lease.unit_id) {
            const { data: pData } = await supabase
              .from('rent_payments')
              .select('*')
              .eq('unit_id', lease.unit_id)
              .order('due_date', { ascending: false });
            payments = pData || [];
          }
          return { ...lease, payments };
        })
      );

      setLeases(leasesWithPayments);
      setActiveLease(leasesWithPayments.find(lease => lease.status === 'active'));
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
    return <div className="tenant-leases loading">Loading leases...</div>;
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
                  
                  {bankDetails && (
                    <div className="bank-details">
                      <p><strong>Bank:</strong> {bankDetails.bank_name}</p>
                      <p><strong>Account Number:</strong> {bankDetails.account_number}</p>
                      <p><strong>Account Name:</strong> {bankDetails.account_name}</p>
                    </div>
                  )}

                  {upcomingPayments.length > 0 ? (
                    <div className="payment-list">
                      {upcomingPayments.map(payment => (
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