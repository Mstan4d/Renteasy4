// src/modules/admin/pages/AdminTransactions.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { 
  CreditCard, DollarSign, Filter, Search, Download, 
  CheckCircle, XCircle, Clock, TrendingUp, TrendingDown,
  Eye, Receipt, User, Home, Calendar, Building, RefreshCw
} from 'lucide-react';
import './AdminTransactions.css';

// Define constants
const transactionTypes = ['rent', 'deposit', 'service', 'commission', 'withdrawal', 'referral'];
const statuses = ['completed', 'pending', 'failed', 'processing'];
const methods = ['card', 'bank_transfer', 'wallet', 'cash', 'paystack', 'flutterwave'];

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
    commission: 0,
    todayRevenue: 0
  });

  // Load transactions from Supabase
  const loadTransactions = async () => {
    try {
      setLoading(true);
      
      // Fetch transactions from Supabase
      const { data: transactionsData, error } = await supabase
        .from('transactions')
        .select(`
          *,
          profile:user_id (
            id,
            name,
            email,
            role
          ),
          listing:listing_id (
            id,
            title,
            price
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // If no transactions, load sample data
      if (!transactionsData || transactionsData.length === 0) {
        const sampleData = await generateSampleTransactions();
        setTransactions(sampleData);
        calculateStats(sampleData);
      } else {
        // Transform data to match frontend structure
        const transformedTransactions = transactionsData.map(txn => ({
          id: txn.id,
          transactionId: txn.transaction_id || txn.id.substring(0, 8).toUpperCase(),
          userId: txn.user_id,
          userName: txn.profile?.name || 'Unknown User',
          userEmail: txn.profile?.email || 'No email',
          type: txn.type,
          amount: parseFloat(txn.amount) || 0,
          commission: parseFloat(txn.commission) || 0,
          platformFee: parseFloat(txn.platform_fee) || 0,
          status: txn.status,
          method: txn.payment_method,
          description: txn.description,
          listingId: txn.listing_id,
          listingTitle: txn.listing?.title,
          createdAt: txn.created_at,
          updatedAt: txn.updated_at,
          reference: txn.reference || txn.id,
          metadata: txn.metadata || {}
        }));

        setTransactions(transformedTransactions);
        calculateStats(transformedTransactions);
      }

    } catch (error) {
      console.error('Error loading transactions:', error);
      // Fallback to sample data
      const sampleData = await generateSampleTransactions();
      setTransactions(sampleData);
      calculateStats(sampleData);
    } finally {
      setLoading(false);
    }
  };

  // Generate sample transactions for development
  const generateSampleTransactions = async () => {
    const sampleTransactions = Array.from({ length: 25 }, (_, index) => {
      const amount = Math.floor(Math.random() * 1000000) + 10000;
      const isTenantComm = index % 5 === 0;
      const commission = isTenantComm ? (amount * 0.015) : (amount * 0.075);
      
      return {
        id: `txn-${Date.now()}-${index}`,
        transactionId: `TXN${10000 + index}`,
        userId: `user-${index % 10}`,
        userName: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown'][index % 5],
        userEmail: `user${index}@example.com`,
        type: transactionTypes[index % transactionTypes.length],
        amount,
        commission,
        platformFee: commission * 0.2,
        status: statuses[index % statuses.length],
        method: methods[index % methods.length],
        description: `Payment for ${['Apartment rent', 'Service fee', 'Security deposit', 'Maintenance'][index % 4]}`,
        listingId: index > 5 ? `listing-${index % 5}` : null,
        listingTitle: index > 5 ? `Apartment ${index % 5} in Lagos` : null,
        createdAt: new Date(Date.now() - index * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - index * 43200000).toISOString(),
        reference: `REF${10000 + index}`,
        metadata: {
          bankName: index % 3 === 0 ? 'First Bank' : 'GTBank',
          accountNumber: `123456789${index}`,
          narration: `RentEasy Transaction ${index}`,
          type: isTenantComm ? 'commission' : 'rent',
          description: isTenantComm ? 'Tenant 1.5% Referral Commission' : 'Standard Rental Payment',
        }
      };
    });

    // Save sample data to Supabase for future use
    try {
      const transactionsToSave = sampleTransactions.map(txn => ({
        transaction_id: txn.transactionId,
        user_id: txn.userId,
        type: txn.type,
        amount: txn.amount,
        commission: txn.commission,
        platform_fee: txn.platformFee,
        status: txn.status,
        payment_method: txn.method,
        description: txn.description,
        listing_id: txn.listingId,
        reference: txn.reference,
        metadata: txn.metadata,
        created_at: txn.createdAt,
        updated_at: txn.updatedAt
      }));

      const { error } = await supabase
        .from('transactions')
        .insert(transactionsToSave);

      if (error) console.log('Note: Sample data already exists or error:', error.message);
    } catch (error) {
      console.log('Could not save sample data to Supabase:', error.message);
    }

    return sampleTransactions;
  };

  useEffect(() => {
    loadTransactions();
    
    // Set up real-time subscription
    const transactionsChannel = supabase
      .channel('admin-transactions-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions'
      }, () => {
        loadTransactions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(transactionsChannel);
    };
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [searchTerm, statusFilter, typeFilter, dateRange, transactions]);

  const calculateStats = (transactionsData) => {
    const total = transactionsData.length;
    const completed = transactionsData.filter(t => t.status === 'completed').length;
    const pending = transactionsData.filter(t => t.status === 'pending').length;
    const failed = transactionsData.filter(t => t.status === 'failed').length;
    
    const totalAmount = transactionsData
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const commission = transactionsData
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.commission, 0);

    // Calculate today's revenue
    const today = new Date().toDateString();
    const todayRevenue = transactionsData
      .filter(t => t.status === 'completed' && new Date(t.createdAt).toDateString() === today)
      .reduce((sum, t) => sum + t.amount, 0);
    
    setStats({ total, completed, pending, failed, totalAmount, commission, todayRevenue });
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
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(txn => txn.status === statusFilter);
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(txn => txn.type === typeFilter);
    }
    
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

  // Update transaction status in Supabase
  const updateTransactionStatus = async (transactionId, newStatus) => {
    try {
      setIsVerifying(true);
      
      // 1. Update the transaction record
      const { error: txnError } = await supabase
        .from('transactions')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString(),
          ...(newStatus === 'completed' ? { completed_at: new Date().toISOString() } : {})
        })
        .eq('id', transactionId);

      if (txnError) throw txnError;

      // 2. Get the transaction details
      const { data: transaction, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (fetchError) throw fetchError;

      // 3. If completed and it's a commission/referral, update related tables
      if (newStatus === 'completed') {
        if (transaction.type === 'commission') {
          // Update tenant commissions table
          await supabase
            .from('tenant_commissions')
            .update({ 
              status: 'paid', 
              paid_at: new Date().toISOString(),
              transaction_id: transactionId 
            })
            .eq('listing_id', transaction.listing_id)
            .eq('user_id', transaction.user_id);
            
        } else if (transaction.type === 'referral') {
          // Update tenant referrals table
          await supabase
            .from('tenant_referrals')
            .update({ 
              status: 'paid', 
              paid_at: new Date().toISOString(),
              transaction_id: transactionId 
            })
            .eq('referrer_id', transaction.user_id);
        }

        // 4. Update user's wallet balance (if applicable)
        await supabase.rpc('update_user_wallet', {
          user_id: transaction.user_id,
          amount: transaction.amount,
          transaction_type: 'credit',
          description: `Payment for ${transaction.type} - ${transaction.reference}`
        });

        // 5. Log admin activity
        await supabase
          .from('admin_activities')
          .insert({
            admin_id: (await supabase.auth.getUser()).data.user?.id,
            action: `Approved ${transaction.type} payout: ${transaction.reference}`,
            type: 'transaction',
            entity_id: transactionId,
            details: {
              amount: transaction.amount,
              user_id: transaction.user_id,
              reference: transaction.reference
            }
          });
      }

      // 6. Refresh transactions
      await loadTransactions();
      
      alert(`Transaction marked as ${newStatus} successfully!`);
      
    } catch (err) {
      console.error("Transaction update failed:", err.message);
      alert(`Failed to update transaction: ${err.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const exportTransactions = () => {
    const csvContent = [
      ['Transaction ID', 'User', 'Type', 'Amount', 'Commission', 'Status', 'Method', 'Date'],
      ...filteredTransactions.map(txn => [
        txn.transactionId,
        txn.userName,
        txn.type,
        `₦${txn.amount.toLocaleString()}`,
        `₦${txn.commission.toLocaleString()}`,
        txn.status,
        txn.method,
        new Date(txn.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `renteasy_transactions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle size={16} className="completed" />;
      case 'pending': return <Clock size={16} className="pending" />;
      case 'failed': return <XCircle size={16} className="failed" />;
      case 'processing': return <RefreshCw size={16} className="processing" />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'danger';
      case 'processing': return 'info';
      default: return 'secondary';
    }
  };

  const getMethodIcon = (method) => {
    switch(method) {
      case 'card': return '💳';
      case 'bank_transfer': return '🏦';
      case 'wallet': return '💰';
      case 'cash': return '💵';
      case 'paystack': return '⚡';
      case 'flutterwave': return '🌊';
      default: return '💳';
    }
  };

  const viewTransactionDetails = (transaction) => {
    const details = `
      Transaction ID: ${transaction.transactionId}
      Reference: ${transaction.reference}
      User: ${transaction.userName} (${transaction.userEmail})
      Amount: ₦${transaction.amount.toLocaleString()}
      Commission: ₦${transaction.commission.toLocaleString()}
      Platform Fee: ₦${transaction.platformFee?.toLocaleString() || '0'}
      Type: ${transaction.type}
      Status: ${transaction.status}
      Method: ${transaction.method}
      Date: ${new Date(transaction.createdAt).toLocaleString()}
      Description: ${transaction.description}
      ${transaction.listingTitle ? `Listing: ${transaction.listingTitle}` : ''}
      
      Bank Details:
      Bank: ${transaction.metadata?.bankName || 'N/A'}
      Account: ${transaction.metadata?.accountNumber || 'N/A'}
      Narration: ${transaction.metadata?.narration || 'N/A'}
    `;
    
    alert(details);
  };

  return (
    <div className="admin-transactions">
      <div className="transactions-header">
        <div className="header-left">
          <h1><CreditCard size={28} /> Transactions</h1>
          <p>Manage and monitor all platform transactions</p>
          <small>Total: {stats.total} transactions | Last updated: {new Date().toLocaleTimeString()}</small>
        </div>
        <div className="header-right">
          <button 
            className="btn-refresh" 
            onClick={loadTransactions}
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            Refresh
          </button>
          <button 
            className="btn-export" 
            onClick={exportTransactions}
            disabled={filteredTransactions.length === 0}
          >
            <Download size={18} /> Export CSV ({filteredTransactions.length})
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="transactions-stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <CreditCard size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Transactions</p>
            <small>All types</small>
          </div>
        </div>
        
        <div className="stat-card amount">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3>₦{stats.totalAmount.toLocaleString()}</h3>
            <p>Total Amount</p>
            <small>All time</small>
          </div>
        </div>
        
        <div className="stat-card commission">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>₦{stats.commission.toLocaleString()}</h3>
            <p>Total Commission</p>
            <small>7.5% platform fee</small>
          </div>
        </div>
        
        <div className="stat-card completed">
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
            <small>{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% success rate</small>
          </div>
        </div>
        
        <div className="stat-card pending">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
            <small>Requires action</small>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="transactions-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by ID, user, reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="processing">Processing</option>
          </select>
          
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="rent">Rent</option>
            <option value="deposit">Deposit</option>
            <option value="service">Service</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="commission">Commission</option>
            <option value="referral">Referral</option>
          </select>
          
          <div className="date-range">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              placeholder="Start Date"
              className="date-input"
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              placeholder="End Date"
              className="date-input"
            />
          </div>
          
          <button className="btn-clear-filters" onClick={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setTypeFilter('all');
            setDateRange({ start: '', end: '' });
          }}>
            <Filter size={16} /> Clear Filters
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="transactions-table-container">
        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spinning" size={32} />
            <p>Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <CreditCard size={48} />
            <h3>No transactions found</h3>
            <p>Try adjusting your search or filters</p>
            <button 
              className="btn-clear-filters"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
                setDateRange({ start: '', end: '' });
              }}
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Commission</th>
                  <th>Status</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td>
                      <div className="txn-id">
                        <strong>{transaction.transactionId}</strong>
                        <small>Ref: {transaction.reference}</small>
                      </div>
                    </td>
                    <td>
                      <div className="user-info">
                        <User size={14} />
                        <div>
                          <strong>{transaction.userName}</strong>
                          <small>{transaction.userEmail}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`type-badge type-${transaction.type}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td>
                      <div className="amount-cell">
                        <strong>₦{transaction.amount.toLocaleString()}</strong>
                        {transaction.listingTitle && (
                          <small>{transaction.listingTitle}</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="commission-cell">
                        <span className="commission-amount">
                          ₦{transaction.commission.toLocaleString()}
                        </span>
                        {transaction.platformFee > 0 && (
                          <small>Fee: ₦{transaction.platformFee.toLocaleString()}</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="status-cell">
                        <span className={`status-badge ${getStatusColor(transaction.status)}`}>
                          {getStatusIcon(transaction.status)} {transaction.status}
                        </span>
                        {transaction.status === 'pending' && (
                          <div className="status-actions">
                            <button 
                              className="btn-approve"
                              onClick={() => updateTransactionStatus(transaction.id, 'completed')}
                              disabled={isVerifying}
                            >
                              Approve
                            </button>
                            <button 
                              className="btn-reject"
                              onClick={() => updateTransactionStatus(transaction.id, 'failed')}
                              disabled={isVerifying}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="method-cell">
                        <span className="method-icon">
                          {getMethodIcon(transaction.method)}
                        </span>
                        <span>{transaction.method.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td>
                      {new Date(transaction.createdAt).toLocaleDateString()}
                      <br />
                      <small>{new Date(transaction.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-view"
                          onClick={() => setSelectedTxn(transaction)}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="btn-receipt"
                          onClick={() => viewTransactionDetails(transaction)}
                          title="View Receipt"
                        >
                          <Receipt size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="table-footer">
              <span>Showing {filteredTransactions.length} of {transactions.length} transactions</span>
              <div className="pagination">
                <button disabled>Previous</button>
                <span className="current-page">1</span>
                <button>Next</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Summary Section */}
      <div className="transactions-summary">
        <div className="summary-card">
          <h3><TrendingUp size={20} /> Revenue Summary</h3>
          <div className="revenue-stats">
            <div className="revenue-stat">
              <span className="label">Today's Revenue</span>
              <span className="value">₦{stats.todayRevenue.toLocaleString()}</span>
            </div>
            <div className="revenue-stat">
              <span className="label">This Month</span>
              <span className="value">₦{Math.floor(stats.totalAmount * 0.3).toLocaleString()}</span>
            </div>
            <div className="revenue-stat">
              <span className="label">Avg. Transaction</span>
              <span className="value">₦{stats.completed > 0 ? (stats.totalAmount / stats.completed).toLocaleString(undefined, {maximumFractionDigits: 0}) : '0'}</span>
            </div>
            <div className="revenue-stat">
              <span className="label">Success Rate</span>
              <span className="value">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="summary-card">
          <h3><Building size={20} /> Top Sources</h3>
          <div className="sources-list">
            {['rent', 'deposit', 'service', 'commission', 'referral'].map((type) => {
              const typeTransactions = transactions.filter(t => t.type === type && t.status === 'completed');
              const total = typeTransactions.reduce((sum, t) => sum + t.amount, 0);
              const count = typeTransactions.length;
              
              if (count === 0) return null;
              
              return (
                <div key={type} className="source-item">
                  <div className="source-info">
                    <span className="source-type">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                    <span className="source-count">{count} transaction{count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="source-amount">
                    ₦{total.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {selectedTxn && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content verification-card">
            <div className="modal-header">
              <h3>Verify Payout: {selectedTxn.transactionId}</h3>
              <button onClick={() => setSelectedTxn(null)}>×</button>
            </div>

            <div className="verification-body">
              <div className="audit-section">
                <h4><User size={16} /> Payee: {selectedTxn.userName}</h4>
                <p>Role: <strong>Tenant</strong> | Email: {selectedTxn.userEmail}</p>
              </div>

              <div className="audit-section highlight">
                <h4><Receipt size={16} /> Earning Type: {selectedTxn.type.toUpperCase()}</h4>
                <p>Amount to Pay: <strong className="payout-amount">₦{selectedTxn.amount.toLocaleString()}</strong></p>
                <small>Calculated at: {selectedTxn.type === 'commission' ? '1.5%' : selectedTxn.type === 'referral' ? '₦5,000 flat rate' : 'Standard rate'}</small>
              </div>

              {/* ADMIN CHECKLIST */}
              <div className="admin-checklist">
                <h4>Required Verifications:</h4>
                <label className="check-item">
                  <input type="checkbox" /> 
                  <span>Property post is verified & not a duplicate</span>
                </label>
                <label className="check-item">
                  <input type="checkbox" /> 
                  <span>New tenant has signed tenancy agreement</span>
                </label>
                <label className="check-item">
                  <input type="checkbox" /> 
                  <span>Payment of total rent has been confirmed</span>
                </label>
                <label className="check-item">
                  <input type="checkbox" /> 
                  <span>No disputes or complaints pending</span>
                </label>
              </div>

              <div className="verification-actions">
                <button 
                  className="btn-reject-large"
                  onClick={() => {
                    updateTransactionStatus(selectedTxn.id, 'failed');
                    setSelectedTxn(null);
                  }}
                  disabled={isVerifying}
                >
                  <XCircle size={18} /> Flag as Fraud
                </button>
                
                <button 
                  className="btn-approve-large"
                  onClick={async () => {
                    await updateTransactionStatus(selectedTxn.id, 'completed');
                    setSelectedTxn(null);
                  }}
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw size={18} className="spinning" /> Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} /> Approve & Credit Wallet
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;