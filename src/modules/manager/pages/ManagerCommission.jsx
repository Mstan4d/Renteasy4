// src/modules/manager/pages/ManagerCommission.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './ManagerCommission.css'; // optional, you can keep inline styles

const ManagerCommission = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [commissionData, setCommissionData] = useState({
    totalEarned: 0,
    pending: 0,
    withdrawn: 0,
    transactions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'manager') {
      navigate('/dashboard');
      return;
    }
    fetchCommissionData();
  }, [user, navigate]);

  const fetchCommissionData = async () => {
    setLoading(true);
    try {
      // Fetch all commissions for this manager, joined with listing title
      const { data, error } = await supabase
        .from('commissions')
        .select(`
          id,
          rental_amount,
          manager_share,
          status,
          created_at,
          listing:listings!listing_id (title)
        `)
        .eq('manager_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transactions = data || [];
      const totalEarned = transactions
        .filter(t => t.status === 'paid' || t.status === 'withdrawn')
        .reduce((sum, t) => sum + (t.manager_share || 0), 0);
      const pending = transactions
        .filter(t => t.status === 'pending')
        .reduce((sum, t) => sum + (t.manager_share || 0), 0);
      const withdrawn = transactions
        .filter(t => t.status === 'withdrawn')
        .reduce((sum, t) => sum + (t.manager_share || 0), 0);

      setCommissionData({
        totalEarned,
        pending,
        withdrawn,
        transactions: transactions.slice(0, 10) // last 10
      });
    } catch (error) {
      console.error('Error fetching commission data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading commission data...</div>;
  }

  return (
    <div className="commission-container">
      <div className="commission-header">
        <h1>Commission Report</h1>
        <button
          onClick={() => navigate('/dashboard/manager')}
          className="btn-back"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card total">
          <h3>₦{commissionData.totalEarned.toLocaleString()}</h3>
          <p>Total Commission Earned</p>
        </div>
        <div className="stat-card pending">
          <h3>₦{commissionData.pending.toLocaleString()}</h3>
          <p>Pending Commission</p>
        </div>
        <div className="stat-card withdrawn">
          <h3>₦{commissionData.withdrawn.toLocaleString()}</h3>
          <p>Withdrawn</p>
        </div>
      </div>

      <div className="transactions-card">
        <h3>Recent Commission Transactions</h3>
        {commissionData.transactions.length === 0 ? (
          <p className="empty-state">No commission transactions yet</p>
        ) : (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Property</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {commissionData.transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                  <td>{tx.listing?.title || 'N/A'}</td>
                  <td>₦{tx.manager_share?.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${tx.status}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManagerCommission;