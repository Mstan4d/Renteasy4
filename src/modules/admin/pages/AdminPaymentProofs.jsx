// src/modules/admin/pages/AdminPaymentProofs.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import { CheckCircle, XCircle, Eye, RefreshCw, Home, CreditCard, Users } from 'lucide-react';
import './AdminPaymentProofs.css';

const AdminPaymentProofs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tenant');
  const [tenantProofs, setTenantProofs] = useState([]);
  const [subscriptionPayments, setSubscriptionPayments] = useState([]);
  const [commissionPayments, setCommissionPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'super-admin') {
      navigate('/login');
      return;
    }
    fetchAllData();
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Tenant rent proofs (from payment_proofs)
      const { data: tenantData, error: tenantError } = await supabase
        .from('payment_proofs')
        .select('*')
        .eq('verified', false)
        .order('created_at', { ascending: false });
      if (tenantError) throw tenantError;

      // Fetch related listings and profiles manually
      const listingIds = tenantData.map(p => p.listing_id).filter(Boolean);
      const tenantIds = tenantData.map(p => p.tenant_id).filter(Boolean);

      let listingsMap = {};
      if (listingIds.length) {
        const { data: listings } = await supabase
          .from('listings')
          .select('id, title, address')
          .in('id', listingIds);
        if (listings) listingsMap = listings.reduce((acc, l) => ({ ...acc, [l.id]: l }), {});
      }

      let profilesMap = {};
      if (tenantIds.length) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', tenantIds);
        if (profiles) profilesMap = profiles.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
      }

      const enrichedTenantProofs = tenantData.map(p => ({
        ...p,
        listings: listingsMap[p.listing_id] || null,
        profiles: profilesMap[p.tenant_id] || null,
      }));
      setTenantProofs(enrichedTenantProofs);

      // 2. Subscription/boost payments (from payments)
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('status', 'pending')
        .in('payment_type', ['subscription', 'boost'])
        .order('created_at', { ascending: false });
      if (paymentError) throw paymentError;

      const userIds = paymentData.map(p => p.user_id).filter(Boolean);
      let userProfilesMap = {};
      if (userIds.length) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email, role')
          .in('id', userIds);
        if (profiles) userProfilesMap = profiles.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
      }

      const enrichedPayments = paymentData.map(p => ({
        ...p,
        profiles: userProfilesMap[p.user_id] || null,
      }));
      setSubscriptionPayments(enrichedPayments);

      // 3. Commission proofs (from commissions)
      const { data: commissionData, error: commissionError } = await supabase
        .from('commissions')
        .select('*')
        .eq('status', 'proof_submitted')
        .order('created_at', { ascending: false });
      if (commissionError) throw commissionError;

      const listingIdsComm = commissionData.map(c => c.listing_id).filter(Boolean);
      const managerIds = commissionData.map(c => c.manager_id).filter(Boolean);

      let listingsCommMap = {};
      if (listingIdsComm.length) {
        const { data: listings } = await supabase
          .from('listings')
          .select('id, title, address, price')
          .in('id', listingIdsComm);
        if (listings) listingsCommMap = listings.reduce((acc, l) => ({ ...acc, [l.id]: l }), {});
      }

      let managersMap = {};
      if (managerIds.length) {
        const { data: managers } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', managerIds);
        if (managers) managersMap = managers.reduce((acc, m) => ({ ...acc, [m.id]: m }), {});
      }

      const enrichedCommissions = commissionData.map(c => ({
        ...c,
        listing: listingsCommMap[c.listing_id] || null,
        manager: managersMap[c.manager_id] || null,
      }));
      setCommissionPayments(enrichedCommissions);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Tenant proof handlers ---
  const verifyTenantProof = async (proofId) => {
    try {
      const { error } = await supabase
        .from('payment_proofs')
        .update({
          verified: true,
          verified_by: user.id,
          verified_at: new Date().toISOString(),
        })
        .eq('id', proofId);
      if (error) throw error;

      const proof = tenantProofs.find(p => p.id === proofId);
      if (proof?.chat_id) {
        await supabase.from('messages').insert([{
          chat_id: proof.chat_id,
          sender_id: '00000000-0000-0000-0000-000000000000',
          sender_role: 'system',
          content: `✅ Admin verified payment proof.`,
          is_system: true,
        }]);
      }

      alert('Tenant payment proof verified');
      fetchAllData();
    } catch (error) {
      console.error('Error verifying proof:', error);
      alert('Verification failed');
    }
  };

  // --- Subscription/boost handlers ---
  const verifySubscriptionPayment = async (payment) => {
    if (!window.confirm('Mark this payment as completed?')) return;

    try {
      const { error: payError } = await supabase
        .from('payments')
        .update({ status: 'completed' })
        .eq('id', payment.id);
      if (payError) throw payError;

      if (payment.payment_type === 'subscription') {
        const { error: subError } = await supabase
          .from('subscriptions')
          .update({ status: 'active' })
          .eq('payment_id', payment.id);
        if (subError) throw subError;

        if (payment.profiles?.role === 'estate-firm') {
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('expires_at')
            .eq('payment_id', payment.id)
            .single();
          if (sub) {
            await supabase
              .from('estate_firm_profiles')
              .update({
                subscription_status: 'active',
                subscription_expiry: sub.expires_at,
              })
              .eq('user_id', payment.user_id);
          }
        }
      } else if (payment.payment_type === 'boost') {
        const { error: boostError } = await supabase
          .from('active_boosts')
          .update({ status: 'active' })
          .eq('payment_id', payment.id);
        if (boostError) throw boostError;
      }

      alert('Payment verified successfully!');
      fetchAllData();
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Verification failed');
    }
  };

  const rejectPayment = async (paymentId) => {
    if (!window.confirm('Reject this payment?')) return;
    try {
      const { error } = await supabase
        .from('payments')
        .update({ status: 'rejected' })
        .eq('id', paymentId);
      if (error) throw error;
      alert('Payment rejected');
      fetchAllData();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert('Rejection failed');
    }
  };

  // --- Commission handlers ---
  const verifyCommission = async (commission) => {
    if (!window.confirm('Mark this commission as verified and mark as paid?')) return;

    try {
      const { error: updateError } = await supabase
        .from('commissions')
        .update({
          status: 'verified',
          paid_to_manager: true,
          verified_by: user.id,
          verified_at: new Date().toISOString(),
        })
        .eq('id', commission.id);
      if (updateError) throw updateError;

      alert('Commission verified and marked as paid.');
      fetchAllData();
    } catch (error) {
      console.error('Error verifying commission:', error);
      alert('Verification failed');
    }
  };

  const rejectCommission = async (commissionId) => {
    if (!window.confirm('Reject this commission proof?')) return;
    try {
      const { error } = await supabase
        .from('commissions')
        .update({ status: 'pending' })
        .eq('id', commissionId);
      if (error) throw error;
      alert('Commission proof rejected (moved back to pending)');
      fetchAllData();
    } catch (error) {
      console.error('Error rejecting commission:', error);
      alert('Rejection failed');
    }
  };

  if (loading) {
    return <RentEasyLoader message="Loading Proof of Payments..." fullScreen />;
  }

  return (
    <div className="admin-payment-proofs">
      <div className="header">
        <h1>Payment Verifications</h1>
        <button className="btn-refresh" onClick={fetchAllData}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'tenant' ? 'active' : ''}`}
          onClick={() => setActiveTab('tenant')}
        >
          <Home size={16} /> Tenant Rent Proofs ({tenantProofs.length})
        </button>
        <button
          className={`tab ${activeTab === 'subscription' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscription')}
        >
          <CreditCard size={16} /> Subscriptions & Boosts ({subscriptionPayments.length})
        </button>
        <button
          className={`tab ${activeTab === 'commission' ? 'active' : ''}`}
          onClick={() => setActiveTab('commission')}
        >
          <Users size={16} /> Commission Payments ({commissionPayments.length})
        </button>
      </div>

      {/* Tenant Rent Proofs Tab */}
      {activeTab === 'tenant' && (
        <div className="proofs-section">
          <h2>Tenant Rent Payment Proofs</h2>
          {tenantProofs.length === 0 ? (
            <div className="empty-state">No pending tenant rent proofs.</div>
          ) : (
            <div className="proofs-grid">
              {tenantProofs.map(proof => (
                <div key={proof.id} className="proof-card">
                  <div className="proof-header">
                    <span className="proof-type">{proof.proof_type}</span>
                    <span className="proof-date">{new Date(proof.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="proof-body">
                    <p><strong>Property:</strong> {proof.listings?.title || 'Unknown'}</p>
                    <p><strong>Tenant:</strong> {proof.profiles?.full_name || proof.tenant_id}</p>
                    <p><strong>Description:</strong> {proof.description || 'No description'}</p>
                    <div className="proof-file">
                      <a href={proof.file_url} target="_blank" rel="noopener noreferrer">
                        <Eye size={16} /> View Proof
                      </a>
                    </div>
                  </div>
                  <div className="proof-actions">
                    <button className="btn-verify" onClick={() => verifyTenantProof(proof.id)}>
                      <CheckCircle size={16} /> Verify
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subscriptions & Boosts Tab */}
      {activeTab === 'subscription' && (
        <div className="payments-section">
          <h2>Subscription & Boost Payments</h2>
          {subscriptionPayments.length === 0 ? (
            <div className="empty-state">No pending subscription or boost payments.</div>
          ) : (
            <div className="payments-grid">
              {subscriptionPayments.map(payment => (
                <div key={payment.id} className="payment-card">
                  <div className="payment-header">
                    <span className={`payment-type ${payment.payment_type}`}>
                      {payment.payment_type === 'subscription' ? '📋 Subscription' : '⚡ Boost'}
                    </span>
                    <span className="payment-date">{new Date(payment.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="payment-body">
                    <p><strong>User:</strong> {payment.profiles?.full_name || payment.profiles?.email || payment.user_id}</p>
                    <p><strong>Amount:</strong> ₦{payment.amount?.toLocaleString()}</p>
                    <p><strong>Reference:</strong> {payment.reference}</p>
                    {payment.metadata?.proof_url && (
                      <p className="proof-link">
                        <a href={payment.metadata.proof_url} target="_blank" rel="noopener noreferrer">
                          <Eye size={16} /> View Proof
                        </a>
                      </p>
                    )}
                  </div>
                  <div className="payment-actions">
                    <button className="btn-verify" onClick={() => verifySubscriptionPayment(payment)}>
                      <CheckCircle size={16} /> Verify
                    </button>
                    <button className="btn-reject" onClick={() => rejectPayment(payment.id)}>
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Commission Payments Tab */}
      {activeTab === 'commission' && (
        <div className="commission-section">
          <h2>Commission Payment Proofs (from Managers)</h2>
          {commissionPayments.length === 0 ? (
            <div className="empty-state">No pending commission proofs.</div>
          ) : (
            <div className="commission-grid">
              {commissionPayments.map(comm => (
                <div key={comm.id} className="commission-card">
                  <div className="commission-header">
                    <span className="commission-type">💰 Commission</span>
                    <span className="commission-date">{new Date(comm.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="commission-body">
                    <p><strong>Manager:</strong> {comm.manager?.full_name || comm.manager_id}</p>
                    <p><strong>Property:</strong> {comm.listing?.title || 'Unknown'}</p>
                    <p><strong>Rental Amount:</strong> ₦{comm.rental_amount?.toLocaleString()}</p>
                    <p><strong>Manager Share (2.5%):</strong> ₦{comm.manager_share?.toLocaleString()}</p>
                    <p><strong>Total Commission (7.5%):</strong> ₦{(comm.manager_share + comm.referrer_share + comm.platform_share).toLocaleString()}</p>
                    {comm.proof_url && (
                      <p className="proof-link">
                        <a href={comm.proof_url} target="_blank" rel="noopener noreferrer">
                          <Eye size={16} /> View Proof
                        </a>
                      </p>
                    )}
                  </div>
                  <div className="commission-actions">
                    <button className="btn-verify" onClick={() => verifyCommission(comm)}>
                      <CheckCircle size={16} /> Verify & Mark Paid
                    </button>
                    <button className="btn-reject" onClick={() => rejectCommission(comm.id)}>
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPaymentProofs;