import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient'; // Ensure this path is correct
import './TenantPayments.css';

const TenantPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        
        // 1. Fetch 1.5% Commission Balance
        const { data: commissions, error: commError } = await supabase
          .from('tenant_commissions')
          .select('commission_amount')
          .eq('tenant_id', user.id)
          .eq('status', 'calculated');

        if (commError) throw commError;
        const total = commissions.reduce((sum, c) => sum + Number(c.commission_amount || 0), 0);
        setWalletBalance(total);

        // 2. Fetch Payment History
        const { data: history, error: historyError } = await supabase
          .from('payments')
          .select('*')
          .eq('tenant_id', user.id)
          .order('date', { ascending: false });

        if (historyError) throw historyError;
        setPayments(history || []);

        // 3. Mock Upcoming (Usually from a 'leases' table)
        setUpcoming([{ id: 'up_1', description: 'Next Rent Due', amount: 500000, dueDate: '2026-03-01' }]);

      } catch (err) {
        console.error("Payment Load Error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [user]);

  if (loading) return <div className="loading-spinner">Loading Wallet...</div>;

  return (
    <div className="tenant-payments">
      <div className="payments-header">
        <h1>Payments & Earnings</h1>
        
        {/* Wallet Display */}
        <div className="earnings-summary-card">
          <div className="balance-info">
            <span className="label">Available Commission (1.5%)</span>
            <h2 className="balance-amount">₦{walletBalance.toLocaleString()}</h2>
          </div>
          <button 
            className="withdraw-btn" 
            disabled={walletBalance <= 0}
            onClick={() => alert('Withdrawal request sent!')}
          >
            Withdraw to Bank
          </button>
        </div>
      </div>

      <section className="payment-section">
        <h3>Upcoming Payments</h3>
        {upcoming.map(item => (
          <div key={item.id} className="upcoming-card">
            <div className="info">
              <h4>{item.description}</h4>
              <p>Due: {item.dueDate}</p>
            </div>
            <div className="action">
              <span className="amount">₦{item.amount.toLocaleString()}</span>
              <button className="pay-now-btn">Pay Now</button>
            </div>
          </div>
        ))}
      </section>

      <section className="payment-section">
        <h3>Payment History</h3>
        <div className="table-responsive">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? payments.map(p => (
                <tr key={p.id}>
                  <td>{p.date}</td>
                  <td>{p.description}</td>
                  <td>₦{p.amount.toLocaleString()}</td>
                  <td><span className={`status-badge ${p.status}`}>{p.status}</span></td>
                </tr>
              )) : (
                <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>No transactions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default TenantPayments;