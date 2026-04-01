import React, { useEffect, useState } from 'react';
import { supabase } from '../../../shared/lib/supabaseClient';
import './AdminPayouts.css';

const AdminPayouts = () => {
  const [backlog, setBacklog] = useState([]);

  useEffect(() => { fetchBacklog(); }, []);

  const fetchBacklog = async () => {
    const { data } = await supabase.from('admin_payout_backlog').select('*');
    setBacklog(data || []);
  };

  // In AdminPayouts.jsx, add this function to mark tenant commission as paid
const markTenantCommissionAsPaid = async (commissionId) => {
  const confirm = window.confirm("Confirm you have paid the 1.5% commission to the tenant?");
  if (!confirm) return;

  try {
    const { error } = await supabase
      .from('tenant_commissions')
      .update({ 
        status: 'paid', 
        paid_at: new Date().toISOString(),
        paid_by: user.id
      })
      .eq('id', commissionId);

    if (error) throw error;
    
    alert('Commission marked as paid!');
    fetchBacklog(); // Refresh the list
  } catch (error) {
    console.error('Error marking commission as paid:', error);
    alert('Failed to mark as paid. Please try again.');
  }
};

  const markAsPaid = async (chatId) => {
    const confirm = window.confirm("Confirm you have manually transferred the 2.5% to this manager's bank account?");
    if (!confirm) return;

    const { error } = await supabase
      .from('chats')
      .update({ paid_to_manager: true })
      .eq('id', chatId);

    if (!error) fetchBacklog();
  };

  const confirmManagerPayout = async (chatId) => {
  const { error } = await supabase
    .from('chats')
    .update({ 
      paid_to_manager: true, 
      manager_payout_date: new Date().toISOString() 
    })
    .eq('id', chatId);

  if(!error) {
    alert("Payment recorded! Manager will see this as 'Confirmed' now.");
    loadPayments(); // Refresh list
  }
};

// Calculate Summary Stats
  const totalOwed = backlog
    .filter(item => !item.we_paid_manager_back)
    .reduce((sum, item) => sum + parseFloat(item.manager_share || 0), 0);

  const pendingVerifications = backlog
    .filter(item => item.manager_sent_us_total && !item.we_paid_manager_back).length;


  return (
     <div className="admin-payouts">
      <div className="admin-summary-grid">
        <div className="summary-card debt">
          <span>Total Owed to Managers</span>
          <h2>₦{totalOwed.toLocaleString()}</h2>
        </div>
        <div className="summary-card alert">
          <span>Pending Verifications</span>
          <h2>{pendingVerifications}</h2>
          <small>Managers who claim they've paid</small>
        </div>
      </div>

    <div className="admin-payouts">
      <h1>💰 Commission Payout Manager</h1>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Property</th>
            <th>Manager</th>
            <th>Bank Details</th>
            <th>Payout (2.5%)</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {backlog.map(item => (
            <tr key={item.chat_id}>
              <td>{item.property_title}</td>
              <td>{item.manager_name}</td>
              <td className="bank-info-cell">
                <strong>{item.bank_name}</strong><br/>
                {item.account_number} <br/>
                <small>{item.account_name}</small>
              </td>
              <td className="amount">₦{parseFloat(item.manager_share).toLocaleString()}</td>
              <td>
                {item.we_paid_manager_back ? 
                  <span className="badge-paid">✅ Sent</span> : 
                  <span className="badge-pending">⏳ Owed</span>
                }
              </td>
              <td>
                {!item.we_paid_manager_back && (
                  <button onClick={() => markAsPaid(item.chat_id)} className="btn-pay">
                    Confirm Payout
                  </button>
                )}
              </td>
              <td>
  {item.manager_sent_us_total && (
    <div className="receipt-viewer">
      {item.payment_receipt_url ? (
        <button 
          className="btn-view-receipt"
          onClick={() => window.open(item.payment_receipt_url, '_blank')}
        >
          📄 View Receipt
        </button>
      ) : (
        <span className="no-receipt">No image provided</span>
      )}
    </div>
  )}
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminReports;