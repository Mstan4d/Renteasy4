// src/modules/dashboard/components/landlord/WalletHistory.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import { 
  ArrowLeft, Download, Filter, Search, 
  ArrowUpRight, ArrowDownLeft, Wallet, Clock, CheckCircle2,
  DollarSign, Home, Calendar
} from 'lucide-react';
import './WalletHistory.css';

const WalletHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [commissions, setCommissions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    totalEarned: 0,
    totalWithdrawn: 0,
    pending: 0
  });

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // 1. Fetch commissions where landlord is the referrer
      const { data: commissionsData, error: commError } = await supabase
        .from('commissions')
        .select(`
          *,
          listing:listing_id (
            id,
            title,
            price,
            address
          )
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (commError) throw commError;

      // 2. Fetch withdrawals from payout_requests or similar table
      const { data: withdrawalsData, error: withdrawError } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('user_role', 'landlord')
        .order('created_at', { ascending: false });

      if (withdrawError) {
        console.warn('Could not fetch withdrawals:', withdrawError);
      }

      setCommissions(commissionsData || []);
      setWithdrawals(withdrawalsData || []);

      // Calculate stats
      const totalEarned = (commissionsData || []).reduce((sum, c) => sum + (c.referrer_share || 0), 0);
      const totalWithdrawn = (withdrawalsData || [])
        .filter(w => w.status === 'paid')
        .reduce((sum, w) => sum + (w.amount || 0), 0);
      const pending = (withdrawalsData || [])
        .filter(w => w.status === 'pending')
        .reduce((sum, w) => sum + (w.amount || 0), 0);

      setStats({ totalEarned, totalWithdrawn, pending });
      
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => `₦${Number(amount || 0).toLocaleString('en-NG')}`;
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCommissionStatusBadge = (status) => {
    switch(status) {
      case 'paid':
        return <span className="status-badge paid"><CheckCircle2 size={12} /> Paid</span>;
      case 'proof_submitted':
        return <span className="status-badge pending"><Clock size={12} /> Awaiting Admin</span>;
      case 'verified':
        return <span className="status-badge verified"><CheckCircle2 size={12} /> Approved</span>;
      case 'pending':
        return <span className="status-badge pending"><Clock size={12} /> Pending</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const getWithdrawalStatusBadge = (status) => {
    switch(status) {
      case 'paid':
        return <span className="status-badge paid"><CheckCircle2 size={12} /> Paid</span>;
      case 'pending':
        return <span className="status-badge pending"><Clock size={12} /> Processing</span>;
      case 'rejected':
        return <span className="status-badge rejected"><CheckCircle2 size={12} /> Rejected</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  // Combine commissions and withdrawals for unified view
  const getAllTransactions = () => {
    const commissionTx = commissions.map(c => ({
      id: `comm_${c.id}`,
      type: 'commission',
      amount: c.referrer_share,
      description: `Commission from "${c.listing?.title || 'Property'}" rental`,
      reference: `Commission for listing ${c.listing_id}`,
      created_at: c.created_at,
      status: c.status,
      listing: c.listing,
      rental_amount: c.rental_amount
    }));

    const withdrawalTx = withdrawals.map(w => ({
      id: `with_${w.id}`,
      type: 'withdrawal',
      amount: w.amount,
      description: w.description || `Withdrawal to bank account`,
      reference: w.reference,
      created_at: w.created_at,
      status: w.status,
      bank_details: w.bank_details
    }));

    // Combine and sort by date
    const all = [...commissionTx, ...withdrawalTx];
    all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Apply filter
    if (filter === 'all') return all;
    return all.filter(t => t.type === filter);
  };

  const filteredTransactions = getAllTransactions();

  if (isLoading) {
    return (
      <div className="wallet-loading">
        <div className="spinner"></div>
        <p>Loading your transaction history...</p>
      </div>
    );
  }

  return (
    <div className="wallet-history-container">
      <header className="wallet-header">
        <button className="back-btn-minimal" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div className="header-titles">
          <h1>Transaction History</h1>
          <p>Track your commission earnings and withdrawals</p>
        </div>
        <button 
          className="withdraw-btn-main" 
          onClick={() => navigate('/dashboard/landlord/withdraw')}
        >
          Withdraw
        </button>
      </header>

      {/* Summary Cards */}
      <div className="wallet-summary-grid">
        <div className="w-card earnings">
          <div className="card-icon"><DollarSign size={24} /></div>
          <div className="card-content">
            <label>Total Commission (1.5%)</label>
            <h3>{formatCurrency(stats.totalEarned)}</h3>
            <span className="trend-up">From {commissions.length} rental(s)</span>
          </div>
        </div>
        <div className="w-card withdrawn">
          <div className="card-icon"><ArrowUpRight size={24} /></div>
          <div className="card-content">
            <label>Total Withdrawn</label>
            <h3>{formatCurrency(stats.totalWithdrawn)}</h3>
            <span className="trend-neutral">Paid to your bank</span>
          </div>
        </div>
        {stats.pending > 0 && (
          <div className="w-card pending">
            <div className="card-icon"><Clock size={24} /></div>
            <div className="card-content">
              <label>Pending Withdrawal</label>
              <h3>{formatCurrency(stats.pending)}</h3>
              <span className="trend-warning">Awaiting processing</span>
            </div>
          </div>
        )}
      </div>

      {/* List Section */}
      <section className="transactions-list-box">
        <div className="list-controls">
          <div className="tabs">
            <button 
              className={filter === 'all' ? 'active' : ''} 
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={filter === 'commission' ? 'active' : ''} 
              onClick={() => setFilter('commission')}
            >
              Commissions
            </button>
            <button 
              className={filter === 'withdrawal' ? 'active' : ''} 
              onClick={() => setFilter('withdrawal')}
            >
              Withdrawals
            </button>
          </div>
          <button className="export-link" onClick={() => {
            // Simple CSV export
            const csvContent = filteredTransactions.map(t => 
              `${t.created_at},${t.type},${t.amount},${t.status},${t.description}`
            ).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `wallet_history_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}>
            <Download size={16}/> Export CSV
          </button>
        </div>

        <div className="ledger">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map(tx => (
              <div className="ledger-row" key={tx.id}>
                <div className={`icon-box ${tx.type}`}>
                  {tx.type === 'commission' ? <ArrowDownLeft size={18}/> : <ArrowUpRight size={18}/>}
                </div>
                <div className="ledger-info">
                  <h4>{tx.description}</h4>
                  <p>
                    {formatDate(tx.created_at)} • 
                    <span className="reference">{tx.reference?.substring(0, 20)}</span>
                  </p>
                  {tx.type === 'commission' && tx.listing && (
                    <small className="property-detail">
                      <Home size={12} /> {tx.listing.title} • Rent: {formatCurrency(tx.rental_amount)}
                    </small>
                  )}
                </div>
                <div className="ledger-amount">
                  <span className={tx.type === 'commission' ? 'plus' : 'minus'}>
                    {tx.type === 'commission' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                  {tx.type === 'commission' 
                    ? getCommissionStatusBadge(tx.status)
                    : getWithdrawalStatusBadge(tx.status)
                  }
                </div>
              </div>
            ))
          ) : (
            <div className="empty-ledger">
              <Wallet size={48} />
              <h3>No transactions yet</h3>
              <p>When you post a property and it gets rented, your commission will appear here.</p>
              <button 
                className="btn-primary"
                onClick={() => navigate('/post-property')}
              >
                Post Your First Property
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default WalletHistory;