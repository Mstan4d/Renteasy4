// src/modules/dashboard/components/landlord/WalletHistory.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import './WalletHistory.css';

const WalletHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30days');

  useEffect(() => {
    const loadTransactions = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 600));
        
        const mockTransactions = [
          {
            id: 'TX-001',
            date: '2024-12-15',
            type: 'withdrawal',
            amount: 500000,
            status: 'completed',
            description: 'Withdrawal to Zenith Bank',
            reference: 'ZENITH-789012',
            balanceAfter: 750000
          },
          {
            id: 'TX-002',
            date: '2024-12-10',
            type: 'commission',
            amount: 262500,
            status: 'completed',
            description: 'Commission: 3 Bedroom Duplex Lekki',
            reference: 'RENT-456789',
            balanceAfter: 1250000
          },
          {
            id: 'TX-003',
            date: '2024-12-05',
            type: 'commission',
            amount: 390000,
            status: 'completed',
            description: 'Commission: 4 Bedroom Terrace VI',
            reference: 'RENT-123456',
            balanceAfter: 987500
          },
          {
            id: 'TX-004',
            date: '2024-11-28',
            type: 'withdrawal',
            amount: 300000,
            status: 'completed',
            description: 'Withdrawal to GTBank',
            reference: 'GTB-345678',
            balanceAfter: 597500
          },
          {
            id: 'TX-005',
            date: '2024-11-20',
            type: 'commission',
            amount: 135000,
            status: 'completed',
            description: 'Commission: 2 Bedroom Flat Ikeja',
            reference: 'RENT-234567',
            balanceAfter: 897500
          },
          {
            id: 'TX-006',
            date: '2024-11-15',
            type: 'referral',
            amount: 25000,
            status: 'completed',
            description: 'Referral Bonus',
            reference: 'REF-789012',
            balanceAfter: 762500
          },
          {
            id: 'TX-007',
            date: '2024-11-10',
            type: 'withdrawal',
            amount: 200000,
            status: 'failed',
            description: 'Withdrawal to Access Bank',
            reference: 'ACCESS-901234',
            balanceAfter: 737500
          },
          {
            id: 'TX-008',
            date: '2024-11-05',
            type: 'commission',
            amount: 262500,
            status: 'pending',
            description: 'Commission: 3 Bedroom Duplex Lekki',
            reference: 'RENT-567890',
            balanceAfter: 937500
          }
        ];
        
        setTransactions(mockTransactions);
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadTransactions();
    }
  }, [user, dateRange]);

  const goBack = () => {
    navigate('/dashboard/landlord');
  };

  const handleWithdraw = () => {
    navigate('/dashboard/landlord/wallet/withdraw');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'withdrawal': return '💸';
      case 'commission': return '💰';
      case 'referral': return '🎯';
      default: return '📊';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'info';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    if (filter === 'withdrawals') return transaction.type === 'withdrawal';
    if (filter === 'deposits') return transaction.type === 'commission' || transaction.type === 'referral';
    if (filter === 'pending') return transaction.status === 'pending';
    if (filter === 'completed') return transaction.status === 'completed';
    return true;
  });

  const calculateStats = () => {
    const totalWithdrawn = transactions
      .filter(t => t.type === 'withdrawal' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalEarned = transactions
      .filter(t => (t.type === 'commission' || t.type === 'referral') && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const pendingAmount = transactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { totalWithdrawn, totalEarned, pendingAmount };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="wallet-history-loading">
        <div className="loading-spinner"></div>
        <p>Loading transaction history...</p>
      </div>
    );
  }

  return (
    <div className="wallet-history">
      {/* Header */}
      <div className="history-header">
        <div className="header-left">
          <button className="btn btn-back" onClick={goBack}>
            ← Back to Dashboard
          </button>
          <h1>Wallet History</h1>
          <p>Track all your transactions and withdrawals</p>
        </div>
        
        <div className="header-right">
          <button className="btn btn-primary" onClick={handleWithdraw}>
            💸 Withdraw Funds
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Earned</h3>
            <div className="stat-value">{formatCurrency(stats.totalEarned)}</div>
            <p className="stat-period">All time</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💸</div>
          <div className="stat-content">
            <h3>Total Withdrawn</h3>
            <div className="stat-value">{formatCurrency(stats.totalWithdrawn)}</div>
            <p className="stat-period">All time</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending</h3>
            <div className="stat-value">{formatCurrency(stats.pendingAmount)}</div>
            <p className="stat-period">Awaiting clearance</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Total Transactions</h3>
            <div className="stat-value">{transactions.length}</div>
            <p className="stat-period">All records</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Transaction Type</label>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${filter === 'withdrawals' ? 'active' : ''}`}
              onClick={() => setFilter('withdrawals')}
            >
              Withdrawals
            </button>
            <button 
              className={`filter-btn ${filter === 'deposits' ? 'active' : ''}`}
              onClick={() => setFilter('deposits')}
            >
              Deposits
            </button>
            <button 
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button 
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
          </div>
        </div>
        
        <div className="filter-group">
          <label>Date Range</label>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${dateRange === '7days' ? 'active' : ''}`}
              onClick={() => setDateRange('7days')}
            >
              7 Days
            </button>
            <button 
              className={`filter-btn ${dateRange === '30days' ? 'active' : ''}`}
              onClick={() => setDateRange('30days')}
            >
              30 Days
            </button>
            <button 
              className={`filter-btn ${dateRange === '90days' ? 'active' : ''}`}
              onClick={() => setDateRange('90days')}
            >
              90 Days
            </button>
            <button 
              className={`filter-btn ${dateRange === 'all' ? 'active' : ''}`}
              onClick={() => setDateRange('all')}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="transactions-section">
        <div className="section-header">
          <h2>Transaction History</h2>
          <button className="btn btn-outline">
            📥 Export as CSV
          </button>
        </div>
        
        {filteredTransactions.length > 0 ? (
          <div className="transactions-table">
            <div className="table-header">
              <div className="header-cell">Transaction</div>
              <div className="header-cell">Amount</div>
              <div className="header-cell">Date</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Balance</div>
              <div className="header-cell">Actions</div>
            </div>
            
            <div className="table-body">
              {filteredTransactions.map(transaction => (
                <div key={transaction.id} className="table-row">
                  <div className="table-cell transaction-info">
                    <div className="transaction-icon">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="transaction-details">
                      <div className="transaction-id">{transaction.id}</div>
                      <div className="transaction-desc">{transaction.description}</div>
                      <div className="transaction-ref">Ref: {transaction.reference}</div>
                    </div>
                  </div>
                  
                  <div className={`table-cell amount ${transaction.type}`}>
                    <span className={`amount-sign ${transaction.type === 'withdrawal' ? 'negative' : 'positive'}`}>
                      {transaction.type === 'withdrawal' ? '-' : '+'}
                    </span>
                    {formatCurrency(transaction.amount)}
                  </div>
                  
                  <div className="table-cell date">
                    {formatDate(transaction.date)}
                  </div>
                  
                  <div className="table-cell">
                    <span className={`status-badge ${getStatusColor(transaction.status)}`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="table-cell balance">
                    {formatCurrency(transaction.balanceAfter)}
                  </div>
                  
                  <div className="table-cell actions">
                    <button className="btn btn-sm btn-outline">
                      View Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <h3>No Transactions Found</h3>
            <p>No transactions match your selected filters.</p>
            <button 
              className="btn btn-outline"
              onClick={() => {
                setFilter('all');
                setDateRange('all');
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="summary-section">
        <div className="summary-card">
          <h3>Monthly Summary</h3>
          <div className="summary-content">
            <div className="summary-item">
              <span className="label">This Month Earnings</span>
              <span className="value positive">+₦875,000</span>
            </div>
            <div className="summary-item">
              <span className="label">This Month Withdrawals</span>
              <span className="value negative">-₦500,000</span>
            </div>
            <div className="summary-item total">
              <span className="label">Net Change</span>
              <span className="value positive">+₦375,000</span>
            </div>
          </div>
        </div>
        
        <div className="summary-card">
          <h3>Download Reports</h3>
          <div className="report-options">
            <button className="btn btn-outline">
              📄 Monthly Statement
            </button>
            <button className="btn btn-outline">
              📊 Tax Report
            </button>
            <button className="btn btn-outline">
              📈 Annual Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletHistory;