// src/modules/admin/pages/AdminPayouts.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../shared/lib/supabaseClient';
import './AdminPayouts.css';

const AdminPayouts = () => {
  const [managerPayouts, setManagerPayouts] = useState([]);
  const [referrerPayouts, setReferrerPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('managers'); // managers, referrers
  const [stats, setStats] = useState({
    totalManagerOwed: 0,
    totalReferrerOwed: 0,
    pendingManagerPayments: 0,
    pendingReferrerPayments: 0,
    paidToManagers: 0,
    paidToReferrers: 0
  });

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      // Fetch commissions with status 'verified' (ready for payout)
      const { data: commissions, error } = await supabase
        .from('commissions')
        .select(`
          *,
          listing:listings(id, title, address, city, state, price, poster_role),
          manager:manager_id(id, full_name, name, email, phone, bank_name, account_number, account_name),
          referrer:referrer_id(id, full_name, name, email, phone, bank_name, account_number, account_name)
        `)
        .in('status', ['verified', 'paid'])
        .order('approved_at', { ascending: false });

      if (error) throw error;

      // Separate manager payouts and referrer payouts
      const managers = [];
      const referrers = [];

      commissions?.forEach(comm => {
        // Manager payout (2.5%)
        if (comm.manager) {
          managers.push({
            id: comm.id,
            commission_id: comm.id,
            recipient_id: comm.manager_id,
            recipient_name: comm.manager?.full_name || comm.manager?.name,
            recipient_email: comm.manager?.email,
            recipient_phone: comm.manager?.phone,
            bank_name: comm.manager?.bank_name,
            account_number: comm.manager?.account_number,
            account_name: comm.manager?.account_name,
            amount: comm.manager_share,
            percentage: '2.5%',
            property_title: comm.listing?.title,
            property_address: `${comm.listing?.address || ''} ${comm.listing?.city || ''} ${comm.listing?.state || ''}`,
            rental_amount: comm.rental_amount,
            status: comm.status,
            paid_to_manager: comm.paid_to_manager,
            paid_at: comm.paid_at,
            approved_at: comm.approved_at,
            proof_url: comm.proof_url
          });
        }

        // Referrer payout (1.5%) - only if referrer exists and is not the same as manager
        if (comm.referrer && comm.referrer_id !== comm.manager_id) {
          referrers.push({
            id: comm.id,
            commission_id: comm.id,
            recipient_id: comm.referrer_id,
            recipient_name: comm.referrer?.full_name || comm.referrer?.name,
            recipient_email: comm.referrer?.email,
            recipient_phone: comm.referrer?.phone,
            bank_name: comm.referrer?.bank_name,
            account_number: comm.referrer?.account_number,
            account_name: comm.referrer?.account_name,
            amount: comm.referrer_share,
            percentage: '1.5%',
            property_title: comm.listing?.title,
            property_address: `${comm.listing?.address || ''} ${comm.listing?.city || ''} ${comm.listing?.state || ''}`,
            rental_amount: comm.rental_amount,
            poster_role: comm.listing?.poster_role,
            status: comm.status,
            paid_to_referrer: comm.paid_to_referrer,
            paid_at: comm.paid_at,
            approved_at: comm.approved_at
          });
        }
      });

      setManagerPayouts(managers);
      setReferrerPayouts(referrers);

      // Calculate stats
      const totalManagerOwed = managers
        .filter(m => !m.paid_to_manager && m.status === 'verified')
        .reduce((sum, m) => sum + m.amount, 0);
      
      const totalReferrerOwed = referrers
        .filter(r => !r.paid_to_referrer && r.status === 'verified')
        .reduce((sum, r) => sum + r.amount, 0);
      
      const pendingManagerPayments = managers.filter(m => !m.paid_to_manager && m.status === 'verified').length;
      const pendingReferrerPayments = referrers.filter(r => !r.paid_to_referrer && r.status === 'verified').length;
      
      const paidToManagers = managers.filter(m => m.paid_to_manager).reduce((sum, m) => sum + m.amount, 0);
      const paidToReferrers = referrers.filter(r => r.paid_to_referrer).reduce((sum, r) => sum + r.amount, 0);

      setStats({
        totalManagerOwed,
        totalReferrerOwed,
        pendingManagerPayments,
        pendingReferrerPayments,
        paidToManagers,
        paidToReferrers
      });
    } catch (error) {
      console.error('Error fetching payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const markManagerAsPaid = async (payout) => {
    const confirm = window.confirm(
      `Confirm you have transferred ₦${payout.amount.toLocaleString()} to:\n\n` +
      `Manager: ${payout.recipient_name}\n` +
      `Bank: ${payout.bank_name}\n` +
      `Account: ${payout.account_number}\n\n` +
      `This action cannot be undone.`
    );
    
    if (!confirm) return;

    try {
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('commissions')
        .update({
          paid_to_manager: true,
          paid_at: new Date().toISOString(),
          paid_by: adminUser?.id,
          status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', payout.commission_id);

      if (error) throw error;

      // Create notification for manager
      await supabase.from('notifications').insert({
        user_id: payout.recipient_id,
        title: '💰 Commission Paid!',
        message: `Your commission payment of ₦${payout.amount.toLocaleString()} for "${payout.property_title}" has been paid to your bank account.`,
        type: 'commission_paid',
        data: { commission_id: payout.commission_id, amount: payout.amount },
        created_at: new Date().toISOString()
      });

      alert('✅ Commission marked as paid! Manager has been notified.');
      fetchPayouts(); // Refresh list
    } catch (error) {
      console.error('Error marking manager as paid:', error);
      alert('Failed to mark as paid. Please try again.');
    }
  };

  const markReferrerAsPaid = async (payout) => {
    const roleText = payout.poster_role === 'tenant' ? 'Outgoing Tenant' : 'Landlord';
    
    const confirm = window.confirm(
      `Confirm you have transferred ₦${payout.amount.toLocaleString()} to:\n\n` +
      `${roleText}: ${payout.recipient_name}\n` +
      `Bank: ${payout.bank_name || 'Not provided'}\n` +
      `Account: ${payout.account_number || 'Not provided'}\n\n` +
      `This action cannot be undone.`
    );
    
    if (!confirm) return;

    try {
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('commissions')
        .update({
          paid_to_referrer: true,
          referrer_paid_at: new Date().toISOString(),
          referrer_paid_by: adminUser?.id,
          status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', payout.commission_id);

      if (error) throw error;

      // Create notification for referrer
      await supabase.from('notifications').insert({
        user_id: payout.recipient_id,
        title: '💰 Referral Commission Paid!',
        message: `Your referral commission of ₦${payout.amount.toLocaleString()} for "${payout.property_title}" has been paid to your bank account.`,
        type: 'referral_paid',
        data: { commission_id: payout.commission_id, amount: payout.amount },
        created_at: new Date().toISOString()
      });

      alert(`✅ ${roleText} commission marked as paid!`);
      fetchPayouts(); // Refresh list
    } catch (error) {
      console.error('Error marking referrer as paid:', error);
      alert('Failed to mark as paid. Please try again.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="admin-payouts-loading">
        <div className="spinner"></div>
        <p>Loading payout data...</p>
      </div>
    );
  }

  return (
    <div className="admin-payouts">
      <div className="payouts-header">
        <h1>💰 Commission Payout Management</h1>
        <p>Track and manage payouts to managers and referrers (tenants/landlords)</p>
      </div>

      {/* Stats Summary */}
      <div className="payouts-stats-grid">
        <div className="stat-card managers">
          <div className="stat-icon">👨‍💼</div>
          <div className="stat-content">
            <span className="stat-label">Managers (2.5%)</span>
            <div className="stat-values">
              <div>
                <strong>Owed:</strong> {formatCurrency(stats.totalManagerOwed)}
                <small>({stats.pendingManagerPayments} pending)</small>
              </div>
              <div>
                <strong>Paid:</strong> {formatCurrency(stats.paidToManagers)}
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card referrers">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <span className="stat-label">Referrers (1.5%)</span>
            <div className="stat-values">
              <div>
                <strong>Owed:</strong> {formatCurrency(stats.totalReferrerOwed)}
                <small>({stats.pendingReferrerPayments} pending)</small>
              </div>
              <div>
                <strong>Paid:</strong> {formatCurrency(stats.paidToReferrers)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="payouts-tabs">
        <button
          className={`tab-btn ${activeTab === 'managers' ? 'active' : ''}`}
          onClick={() => setActiveTab('managers')}
        >
          👨‍💼 Manager Payouts ({managerPayouts.filter(m => !m.paid_to_manager).length} pending)
        </button>
        <button
          className={`tab-btn ${activeTab === 'referrers' ? 'active' : ''}`}
          onClick={() => setActiveTab('referrers')}
        >
          👥 Referrer Payouts ({referrerPayouts.filter(r => !r.paid_to_referrer).length} pending)
        </button>
      </div>

      {/* Manager Payouts Table */}
      {activeTab === 'managers' && (
        <div className="payouts-table-container">
          <table className="payouts-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Manager</th>
                <th>Bank Details</th>
                <th>Rental Amount</th>
                <th>Commission (2.5%)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {managerPayouts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    No manager payouts found
                  </td>
                </tr>
              ) : (
                managerPayouts.map((payout) => (
                  <tr key={`${payout.id}-${payout.recipient_id}`}>
                    <td>
                      <div className="property-info">
                        <strong>{payout.property_title}</strong>
                        <small>{payout.property_address}</small>
                      </div>
                    </td>
                    <td>
                      <div className="recipient-info">
                        <strong>{payout.recipient_name}</strong>
                        <small>{payout.recipient_email}</small>
                        <small>{payout.recipient_phone}</small>
                      </div>
                    </td>
                    <td className="bank-details">
                      {payout.bank_name ? (
                        <>
                          <strong>{payout.bank_name}</strong><br />
                          {payout.account_number}<br />
                          <small>{payout.account_name}</small>
                        </>
                      ) : (
                        <span className="no-bank">⚠️ No bank details</span>
                      )}
                    </td>
                    <td className="amount">{formatCurrency(payout.rental_amount)}</td>
                    <td className="commission highlight">{formatCurrency(payout.amount)}</td>
                    <td>
                      {payout.paid_to_manager ? (
                        <span className="badge-paid">✅ Paid</span>
                      ) : payout.status === 'verified' ? (
                        <span className="badge-ready">💰 Ready for Payout</span>
                      ) : (
                        <span className="badge-pending">⏳ Awaiting Approval</span>
                      )}
                    </td>
                    <td>
                      {!payout.paid_to_manager && payout.status === 'verified' && (
                        <button
                          className="btn-pay"
                          onClick={() => markManagerAsPaid(payout)}
                        >
                          💸 Mark as Paid
                        </button>
                      )}
                      {payout.paid_to_manager && (
                        <span className="paid-date">
                          Paid: {new Date(payout.paid_at).toLocaleDateString()}
                        </span>
                      )}
                      {payout.proof_url && (
                        <a
                          href={payout.proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-view-proof"
                        >
                          📄 View Proof
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Referrer Payouts Table */}
      {activeTab === 'referrers' && (
        <div className="payouts-table-container">
          <table className="payouts-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Referrer</th>
                <th>Role</th>
                <th>Bank Details</th>
                <th>Rental Amount</th>
                <th>Commission (1.5%)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {referrerPayouts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    No referrer payouts found
                  </td>
                </tr>
              ) : (
                referrerPayouts.map((payout) => (
                  <tr key={`${payout.id}-${payout.recipient_id}`}>
                    <td>
                      <div className="property-info">
                        <strong>{payout.property_title}</strong>
                        <small>{payout.property_address}</small>
                      </div>
                    </td>
                    <td>
                      <div className="recipient-info">
                        <strong>{payout.recipient_name}</strong>
                        <small>{payout.recipient_email}</small>
                        <small>{payout.recipient_phone}</small>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${payout.poster_role}`}>
                        {payout.poster_role === 'tenant' ? '👤 Outgoing Tenant' : '🏠 Landlord'}
                      </span>
                    </td>
                    <td className="bank-details">
                      {payout.bank_name ? (
                        <>
                          <strong>{payout.bank_name}</strong><br />
                          {payout.account_number}<br />
                          <small>{payout.account_name}</small>
                        </>
                      ) : (
                        <span className="no-bank">⚠️ No bank details</span>
                      )}
                    </td>
                    <td className="amount">{formatCurrency(payout.rental_amount)}</td>
                    <td className="commission highlight">{formatCurrency(payout.amount)}</td>
                    <td>
                      {payout.paid_to_referrer ? (
                        <span className="badge-paid">✅ Paid</span>
                      ) : payout.status === 'verified' ? (
                        <span className="badge-ready">💰 Ready for Payout</span>
                      ) : (
                        <span className="badge-pending">⏳ Awaiting Approval</span>
                      )}
                    </td>
                    <td>
                      {!payout.paid_to_referrer && payout.status === 'verified' && (
                        <button
                          className="btn-pay"
                          onClick={() => markReferrerAsPaid(payout)}
                          disabled={!payout.bank_name}
                          title={!payout.bank_name ? "Bank details required" : ""}
                        >
                          💸 Mark as Paid
                        </button>
                      )}
                      {payout.paid_to_referrer && (
                        <span className="paid-date">
                          Paid: {new Date(payout.paid_at).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPayouts;