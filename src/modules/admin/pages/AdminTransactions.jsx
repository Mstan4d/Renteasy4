// src/modules/admin/pages/AdminTransactions.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../shared/lib/supabaseClient';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import { 
  CreditCard, DollarSign, Filter, Search, Download, 
  CheckCircle, XCircle, Clock, TrendingUp, TrendingDown,
  Eye, Receipt, User, Home, Calendar, Building, RefreshCw
} from 'lucide-react';
import './AdminTransactions.css';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
    totalCommission: 0,
    totalPlatformFee: 0,
    todayRevenue: 0
  });

  // Load transactions from Supabase – only relevant types, no nested joins
  const loadTransactions = async () => {
    try {
      setLoading(true);
      
      // Fetch only subscription, boost, commission, referral, platform_fee transactions
      const { data: transactionsData, error } = await supabase
        .from('transactions')
        .select('*')
        .in('type', ['subscription', 'boost', 'commission', 'referral_commission', 'platform_fee'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user profiles for these transactions (separate query to avoid foreign key issues)
      const userIds = [...new Set((transactionsData || []).map(t => t.user_id).filter(Boolean))];
      let profilesMap = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, name, email, role')
          .in('id', userIds);
        if (profiles) {
          profilesMap = profiles.reduce((acc, p) => { acc[p.id] = p; return acc; }, {});
        }
      }

      // Transform data
      const transformedTransactions = (transactionsData || []).map(txn => ({
        id: txn.id,
        transactionId: txn.transaction_id || txn.id.substring(0, 8).toUpperCase(),
        userId: txn.user_id,
        userName: profilesMap[txn.user_id]?.full_name || profilesMap[txn.user_id]?.name || 'Unknown User',
        userEmail: profilesMap[txn.user_id]?.email || 'No email',
        userRole: profilesMap[txn.user_id]?.role,
        type: txn.type,
        amount: parseFloat(txn.amount) || 0,
        commission: parseFloat(txn.commission) || 0,
        platformFee: parseFloat(txn.platform_fee) || 0,
        status: txn.status,
        method: txn.payment_method,
        description: txn.description,
        listingId: txn.listing_id,
        createdAt: txn.created_at,
        updatedAt: txn.updated_at,
        reference: txn.reference || txn.id,
        metadata: txn.metadata || {},
        breakdown: txn.breakdown || {}
      }));

      setTransactions(transformedTransactions);
      calculateStats(transformedTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
    
    // Real-time subscription
    const channel = supabase
      .channel('admin-transactions-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions'
      }, () => loadTransactions())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [searchTerm, statusFilter, typeFilter, dateRange, transactions]);

  const calculateStats = (txns) => {
    const total = txns.length;
    const completed = txns.filter(t => t.status === 'completed').length;
    const pending = txns.filter(t => t.status === 'pending').length;
    const failed = txns.filter(t => t.status === 'failed').length;
    
    const totalAmount = txns
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalCommission = txns
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.commission || 0), 0);

    const totalPlatformFee = txns
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.platformFee || 0), 0);

    const today = new Date().toDateString();
    const todayRevenue = txns
      .filter(t => t.status === 'completed' && new Date(t.createdAt).toDateString() === today)
      .reduce((sum, t) => sum + t.amount, 0);
    
    setStats({ total, completed, pending, failed, totalAmount, totalCommission, totalPlatformFee, todayRevenue });
  };

  const filterTransactions = () => {
    let filtered = [...transactions];
    
    if (searchTerm) {
      filtered = filtered.filter(txn =>
        txn.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.reference?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') filtered = filtered.filter(txn => txn.status === statusFilter);
    if (typeFilter !== 'all') filtered = filtered.filter(txn => txn.type === typeFilter);
    
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filtered = filtered.filter(txn => new Date(txn.createdAt) >= startDate);
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(txn => new Date(txn.createdAt) <= endDate);
    }
    
    setFilteredTransactions(filtered);
  };

  const updateTransactionStatus = async (transactionId, newStatus) => {
    try {
      setIsVerifying(true);
      
      const { error: txnError } = await supabase
        .from('transactions')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString(),
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', transactionId);
      if (txnError) throw txnError;

      // If completed, update related tables (subscriptions, boosts, commissions)
      if (newStatus === 'completed') {
        const { data: transaction } = await supabase
          .from('transactions')
          .select('*')
          .eq('id', transactionId)
          .single();

        if (transaction.type === 'subscription') {
          await supabase
            .from('subscriptions')
            .update({ status: 'active' })
            .eq('payment_id', transaction.payment_id);
        } else if (transaction.type === 'boost') {
          await supabase
            .from('active_boosts')
            .update({ status: 'active' })
            .eq('payment_id', transaction.payment_id);
        } else if (transaction.type === 'commission') {
          await supabase
            .from('commissions')
            .update({ status: 'paid', paid_to_manager: true, paid_at: new Date().toISOString() })
            .eq('payment_id', transaction.payment_id);
        }
      }

      await loadTransactions();
      alert(`Transaction marked as ${newStatus}`);
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update transaction');
    } finally {
      setIsVerifying(false);
    }
  };

  const exportTransactions = () => {
    const csvContent = [
      ['Transaction ID', 'User', 'Type', 'Amount', 'Commission', 'Platform Fee', 'Status', 'Date'],
      ...filteredTransactions.map(txn => [
        txn.transactionId,
        txn.userName,
        txn.type,
        `₦${txn.amount.toLocaleString()}`,
        `₦${txn.commission.toLocaleString()}`,
        `₦${txn.platformFee.toLocaleString()}`,
        txn.status,
        new Date(txn.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `renteasy_transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle size={16} className="completed" />;
      case 'pending': return <Clock size={16} className="pending" />;
      case 'failed': return <XCircle size={16} className="failed" />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'danger';
      default: return 'secondary';
    }
  };

  const getMethodIcon = (method) => {
    const icons = {
      card: '💳',
      bank_transfer: '🏦',
      wallet: '💰',
      paystack: '⚡',
      flutterwave: '🌊'
    };
    return icons[method] || '💳';
  };

  if (loading) return <RentEasyLoader message="Loading transactions..." fullScreen />;

  return (
    <div className="admin-transactions">
      <div className="transactions-header">
        <div className="header-left">
          <h1><CreditCard size={28} /> Financial Transactions</h1>
          <p>Manage subscriptions, boosts, and commission payouts</p>
          <small>Total: {stats.total} transactions | Last updated: {new Date().toLocaleTimeString()}</small>
        </div>
        <div className="header-right">
          <button className="btn-refresh" onClick={loadTransactions} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            Refresh
          </button>
          <button className="btn-export" onClick={exportTransactions} disabled={filteredTransactions.length === 0}>
            <Download size={18} /> Export CSV ({filteredTransactions.length})
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="transactions-stats-grid">
        <div className="stat-card total">
          <div className="stat-icon"><CreditCard size={24} /></div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Transactions</p>
          </div>
        </div>
        <div className="stat-card amount">
          <div className="stat-icon"><DollarSign size={24} /></div>
          <div className="stat-content">
            <h3>₦{stats.totalAmount.toLocaleString()}</h3>
            <p>Total Volume</p>
          </div>
        </div>
        <div className="stat-card commission">
          <div className="stat-icon"><TrendingUp size={24} /></div>
          <div className="stat-content">
            <h3>₦{stats.totalCommission.toLocaleString()}</h3>
            <p>Total Commission (2.5%+1.5%)</p>
          </div>
        </div>
        <div className="stat-card fee">
          <div className="stat-icon"><Building size={24} /></div>
          <div className="stat-content">
            <h3>₦{stats.totalPlatformFee.toLocaleString()}</h3>
            <p>RentEasy Fee (3.5%)</p>
          </div>
        </div>
        <div className="stat-card completed">
          <div className="stat-icon"><CheckCircle size={24} /></div>
          <div className="stat-content">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="transactions-filters">
        <div className="search-box">
          <Search size={18} />
          <input type="text" placeholder="Search by ID, user, reference..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
        </div>
        <div className="filter-group">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="filter-select">
            <option value="all">All Types</option>
            <option value="subscription">Subscription</option>
            <option value="boost">Boost</option>
            <option value="commission">Commission</option>
            <option value="referral_commission">Referral Commission</option>
            <option value="platform_fee">Platform Fee</option>
          </select>
          <div className="date-range">
            <input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
            <span>to</span>
            <input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
          </div>
          <button className="btn-clear-filters" onClick={() => { setSearchTerm(''); setStatusFilter('all'); setTypeFilter('all'); setDateRange({ start: '', end: '' }); }}>
            <Filter size={16} /> Clear Filters
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="transactions-table-container">
        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <CreditCard size={48} />
            <h3>No transactions found</h3>
            <p>Try adjusting your search or filters</p>
            <button className="btn-clear-filters" onClick={() => { setSearchTerm(''); setStatusFilter('all'); setTypeFilter('all'); setDateRange({ start: '', end: '' }); }}>
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>ID / Reference</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Commission</th>
                  <th>Platform Fee</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(txn => (
                  <tr key={txn.id}>
                    <td>
                      <div className="txn-id">
                        <strong>{txn.transactionId}</strong>
                        <small>{txn.reference}</small>
                      </div>
                    </td>
                    <td>
                      <div className="user-info">
                        <User size={14} />
                        <div>
                          <strong>{txn.userName}</strong>
                          <small>{txn.userEmail}</small>
                          <span className="user-role">{txn.userRole}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className={`type-badge type-${txn.type}`}>{txn.type.replace('_', ' ')}</span></td>
                    <td>
                      <div className="amount-cell">
                        <strong>₦{txn.amount.toLocaleString()}</strong>
                      </div>
                    </td>
                    <td>₦{txn.commission.toLocaleString()}</td>
                    <td>₦{txn.platformFee.toLocaleString()}</td>
                    <td>
                      <div className="status-cell">
                        <span className={`status-badge ${getStatusColor(txn.status)}`}>
                          {getStatusIcon(txn.status)} {txn.status}
                        </span>
                        {txn.status === 'pending' && (
                          <div className="status-actions">
                            <button className="btn-approve" onClick={() => updateTransactionStatus(txn.id, 'completed')} disabled={isVerifying}>Approve</button>
                            <button className="btn-reject" onClick={() => updateTransactionStatus(txn.id, 'failed')} disabled={isVerifying}>Reject</button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{new Date(txn.createdAt).toLocaleDateString()}<br/><small>{new Date(txn.createdAt).toLocaleTimeString()}</small></td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-view" onClick={() => setSelectedTxn(txn)}><Eye size={16} /></button>
                        <button className="btn-receipt" onClick={() => alert(JSON.stringify(txn.breakdown, null, 2))}><Receipt size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="table-footer">
              <span>Showing {filteredTransactions.length} of {transactions.length} transactions</span>
            </div>
          </>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTxn && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content verification-card">
            <div className="modal-header">
              <h3>Transaction Details</h3>
              <button onClick={() => setSelectedTxn(null)}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>ID:</strong> {selectedTxn.transactionId}</p>
              <p><strong>Reference:</strong> {selectedTxn.reference}</p>
              <p><strong>User:</strong> {selectedTxn.userName} ({selectedTxn.userRole})</p>
              <p><strong>Type:</strong> {selectedTxn.type}</p>
              <p><strong>Amount:</strong> ₦{selectedTxn.amount.toLocaleString()}</p>
              <p><strong>Commission:</strong> ₦{selectedTxn.commission.toLocaleString()}</p>
              <p><strong>Platform Fee:</strong> ₦{selectedTxn.platformFee.toLocaleString()}</p>
              <p><strong>Status:</strong> {selectedTxn.status}</p>
              <p><strong>Date:</strong> {new Date(selectedTxn.createdAt).toLocaleString()}</p>
              {selectedTxn.breakdown && (
                <div className="breakdown">
                  <strong>Breakdown:</strong>
                  <pre>{JSON.stringify(selectedTxn.breakdown, null, 2)}</pre>
                </div>
              )}
            </div>
            <div className="modal-actions">
              {selectedTxn.status === 'pending' && (
                <>
                  <button className="btn-approve" onClick={() => updateTransactionStatus(selectedTxn.id, 'completed')}>Approve</button>
                  <button className="btn-reject" onClick={() => updateTransactionStatus(selectedTxn.id, 'failed')}>Reject</button>
                </>
              )}
              <button className="btn-cancel" onClick={() => setSelectedTxn(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;