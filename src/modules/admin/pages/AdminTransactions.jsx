// src/modules/admin/pages/AdminTransactions.jsx
import React, { useState, useEffect } from 'react';
import { 
  CreditCard, DollarSign, Filter, Search, Download, 
  CheckCircle, XCircle, Clock, TrendingUp, TrendingDown,
  Eye, Receipt, User, Home, Calendar, Building
} from 'lucide-react';
import './AdminTransactions.css';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
    commission: 0
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [searchTerm, statusFilter, typeFilter, dateRange, transactions]);

  const loadTransactions = () => {
    try {
      const transactionsData = JSON.parse(localStorage.getItem('adminTransactions') || '[]');
      
      if (transactionsData.length === 0) {
        const sampleTransactions = generateSampleTransactions();
        localStorage.setItem('adminTransactions', JSON.stringify(sampleTransactions));
        setTransactions(sampleTransactions);
      } else {
        setTransactions(transactionsData);
      }
      
      calculateStats(transactionsData.length > 0 ? transactionsData : generateSampleTransactions());
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const generateSampleTransactions = () => {
    const transactionTypes = ['rent', 'deposit', 'service', 'withdrawal', 'commission'];
    const statuses = ['completed', 'pending', 'failed'];
    const methods = ['card', 'bank_transfer', 'wallet', 'cash'];
    
    return Array.from({ length: 25 }, (_, index) => {
      const amount = Math.floor(Math.random() * 1000000) + 10000;
      const commission = amount * 0.075; // 7.5% commission
      
      return {
        id: `txn-${Date.now()}-${index}`,
        transactionId: `TXN${10000 + index}`,
        userId: `user-${index % 10}`,
        userName: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown'][index % 5],
        userEmail: `user${index}@example.com`,
        type: transactionTypes[index % transactionTypes.length],
        amount,
        commission,
        platformFee: commission * 0.2, // 20% of commission
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
          narration: `RentEasy Transaction ${index}`
        }
      };
    });
  };

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
    
    setStats({ total, completed, pending, failed, totalAmount, commission });
  };

  const filterTransactions = () => {
    let filtered = [...transactions];
    
    if (searchTerm) {
      filtered = filtered.filter(txn =>
        txn.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.reference.toLowerCase().includes(searchTerm.toLowerCase())
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

  const updateTransactionStatus = (transactionId, newStatus) => {
    const updatedTransactions = transactions.map(txn =>
      txn.id === transactionId 
        ? { 
            ...txn, 
            status: newStatus,
            updatedAt: new Date().toISOString()
          } 
        : txn
    );
    setTransactions(updatedTransactions);
    localStorage.setItem('adminTransactions', JSON.stringify(updatedTransactions));
    calculateStats(updatedTransactions);
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
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
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
    switch(method) {
      case 'card': return '💳';
      case 'bank_transfer': return '🏦';
      case 'wallet': return '💰';
      case 'cash': return '💵';
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
        </div>
        <div className="header-right">
          <button className="btn-export" onClick={exportTransactions}>
            <Download size={18} /> Export CSV
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
          </div>
        </div>
        
        <div className="stat-card amount">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3>₦{stats.totalAmount.toLocaleString()}</h3>
            <p>Total Amount</p>
          </div>
        </div>
        
        <div className="stat-card commission">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>₦{stats.commission.toLocaleString()}</h3>
            <p>Total Commission</p>
          </div>
        </div>
        
        <div className="stat-card completed">
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
          </div>
        </div>
        
        <div className="stat-card pending">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="transactions-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by ID, user, or reference..."
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
          </select>
          
          <div className="date-range">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              placeholder="Start Date"
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              placeholder="End Date"
            />
          </div>
          
          <button className="btn-filter" onClick={() => {
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
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map(transaction => (
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
                      {transaction.platformFee && (
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
                          >
                            Approve
                          </button>
                          <button 
                            className="btn-reject"
                            onClick={() => updateTransactionStatus(transaction.id, 'failed')}
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
                    <small>{new Date(transaction.createdAt).toLocaleTimeString()}</small>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-view"
                        onClick={() => viewTransactionDetails(transaction)}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="btn-receipt"
                        onClick={() => alert('Generating receipt...')}
                        title="Generate Receipt"
                      >
                        <Receipt size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-results">
                  <CreditCard size={48} />
                  <p>No transactions found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="transactions-summary">
        <div className="summary-card">
          <h3><TrendingUp size={20} /> Revenue Summary</h3>
          <div className="revenue-stats">
            <div className="revenue-stat">
              <span className="label">Today's Revenue</span>
              <span className="value">₦{Math.floor(stats.totalAmount * 0.05).toLocaleString()}</span>
            </div>
            <div className="revenue-stat">
              <span className="label">This Month</span>
              <span className="value">₦{Math.floor(stats.totalAmount * 0.3).toLocaleString()}</span>
            </div>
            <div className="revenue-stat">
              <span className="label">Avg. Transaction</span>
              <span className="value">₦{(stats.totalAmount / (stats.completed || 1)).toLocaleString()}</span>
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
            {['rent', 'deposit', 'service', 'commission'].map((type, index) => {
              const typeTransactions = transactions.filter(t => t.type === type && t.status === 'completed');
              const total = typeTransactions.reduce((sum, t) => sum + t.amount, 0);
              const count = typeTransactions.length;
              
              if (count === 0) return null;
              
              return (
                <div key={type} className="source-item">
                  <div className="source-info">
                    <span className="source-type">{type}</span>
                    <span className="source-count">{count} transactions</span>
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
    </div>
  );
};

export default AdminTransactions;