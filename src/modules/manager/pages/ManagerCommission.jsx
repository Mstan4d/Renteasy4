// src/modules/manager/pages/ManagerCommission.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './ManagerCommission.css';

const ManagerCommission = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [commissionData, setCommissionData] = useState({
    potential: 0,           // 2.5% of all assigned active listings
    pending: 0,            // proof_submitted commissions
    withdrawn: 0,          // paid commissions
    actualEarned: 0,       // total from paid commissions (already withdrawn)
    transactions: []
  });
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState(null);

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
      // 1. Get all listings assigned to this manager (active, not rented)
      const { data: assignedListings, error: listingsError } = await supabase
        .from('listings')
        .select('price, title, status')
        .eq('assigned_manager_id', user.id)
        .neq('status', 'rented');  // exclude already rented

      if (listingsError) throw listingsError;

      // Calculate potential commission from assigned listings
      const potential = (assignedListings || []).reduce((sum, listing) => {
        const price = Number(listing.price) || 0;
        return sum + (price * 0.025);
      }, 0);

      // Debug info to see what's being counted
      setDebugInfo({
        assignedCount: assignedListings?.length || 0,
        firstPrice: assignedListings?.[0]?.price,
        allListings: assignedListings?.map(l => ({ title: l.title, price: l.price, status: l.status }))
      });

      // 2. Fetch all commissions for this manager
      const { data: commissions, error: commError } = await supabase
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

      if (commError) throw commError;

      const transactions = commissions || [];

      // Pending = proof_submitted
      const pending = transactions
        .filter(t => t.status === 'proof_submitted')
        .reduce((sum, t) => sum + (t.manager_share || 0), 0);

      // Withdrawn = paid
      const withdrawn = transactions
        .filter(t => t.status === 'paid')
        .reduce((sum, t) => sum + (t.manager_share || 0), 0);

      // Actual earned = total from paid commissions
      const actualEarned = withdrawn;

      setCommissionData({
        potential,
        pending,
        withdrawn,
        actualEarned,
        transactions: transactions.slice(0, 10)
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

      {/* Debug info (visible only if potential is 0) */}
      {commissionData.potential === 0 && debugInfo && (
        <div className="debug-info" style={{ background: '#fef3c7', padding: '12px', marginBottom: '20px', borderRadius: '8px', fontSize: '0.8rem', borderLeft: '4px solid #f59e0b' }}>
          <strong>ℹ️ Why potential commission is 0:</strong> Found {debugInfo.assignedCount} assigned listing(s) not yet rented.
          {debugInfo.assignedCount === 0 ? ' No listings assigned to you.' : ' Check that each listing has a valid price.'}
          {debugInfo.firstPrice === null && <span> First listing price is missing or zero.</span>}
          <details>
            <summary>Details</summary>
            <pre style={{ fontSize: '0.7rem', overflow: 'auto' }}>{JSON.stringify(debugInfo.allListings, null, 2)}</pre>
          </details>
          <small className="text-muted">(This message will disappear once you have potential commission.)</small>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card total">
          <h3>₦{commissionData.potential.toLocaleString()}</h3>
          <p>Potential Commission</p>
          <small>From assigned active listings (2.5% each)</small>
        </div>
        <div className="stat-card pending">
          <h3>₦{commissionData.pending.toLocaleString()}</h3>
          <p>Pending Approval</p>
          <small>Proof submitted, awaiting admin</small>
        </div>
        <div className="stat-card withdrawn">
          <h3>₦{commissionData.withdrawn.toLocaleString()}</h3>
          <p>Withdrawn</p>
          <small>Paid to your bank account</small>
        </div>
      </div>

      {commissionData.actualEarned > 0 && (
        <div className="actual-earned-card">
          <h4>💰 Actual Earned (from paid commissions)</h4>
          <span>₦{commissionData.actualEarned.toLocaleString()}</span>
          <p>This amount has been paid out to you.</p>
        </div>
      )}

      <div className="transactions-card">
        <h3>Recent Commission Transactions</h3>
        {commissionData.transactions.length === 0 ? (
          <p className="empty-state">No commission transactions yet.</p>
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
                      {tx.status === 'proof_submitted' && 'Pending Approval'}
                      {tx.status === 'paid' && 'Withdrawn'}
                      {tx.status === 'pending' && 'Awaiting Upload'}
                      {tx.status === 'verified' && 'Approved'}
                      {!['proof_submitted','paid','pending','verified'].includes(tx.status) && tx.status}
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