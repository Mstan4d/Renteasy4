// src/modules/providers/pages/ProviderBoostHistory.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import { formatDistanceToNow } from 'date-fns';
import './ProviderBoostHistory.css';

const ProviderBoostHistory = () => {
  const { user } = useAuth();
  const [boosts, setBoosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) return;
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // Fetch boost payments with package details
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          boost_package:boost_packages(*)
        `)
        .eq('user_id', user.id)
        .eq('payment_type', 'boost')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBoosts(data || []);
    } catch (err) {
      console.error('Error fetching boost history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      pending: 'badge-pending',
      completed: 'badge-completed',
      rejected: 'badge-rejected'
    };
    return <span className={`badge ${classes[status] || 'badge-default'}`}>{status}</span>;
  };

  const filteredBoosts = filter === 'all' ? boosts : boosts.filter(b => b.status === filter);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="provider-boost-history">
      <div className="header">
        <h1>Boost Purchase History</h1>
        <div className="filter-tabs">
          <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>All</button>
          <button onClick={() => setFilter('pending')} className={filter === 'pending' ? 'active' : ''}>Pending</button>
          <button onClick={() => setFilter('completed')} className={filter === 'completed' ? 'active' : ''}>Completed</button>
          <button onClick={() => setFilter('rejected')} className={filter === 'rejected' ? 'active' : ''}>Rejected</button>
        </div>
        <Link to="/dashboard/provider/boost" className="btn-primary">Buy New Boost</Link>
      </div>

      {filteredBoosts.length === 0 ? (
        <div className="empty-state">
          <p>No boost purchases found.</p>
        </div>
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Package</th>
              <th>Amount</th>
              <th>Reference</th>
              <th>Status</th>
              <th>Proof</th>
            </tr>
          </thead>
          <tbody>
            {filteredBoosts.map((boost) => (
              <tr key={boost.id}>
                <td>{new Date(boost.created_at).toLocaleDateString()}</td>
                <td>{boost.boost_package?.name || 'Unknown'}</td>
                <td>₦{boost.amount.toLocaleString()}</td>
                <td className="mono">{boost.reference}</td>
                <td>{getStatusBadge(boost.status)}</td>
                <td>
                  {boost.metadata?.proof_url ? (
                    <a href={boost.metadata.proof_url} target="_blank" rel="noopener noreferrer">View</a>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProviderBoostHistory;