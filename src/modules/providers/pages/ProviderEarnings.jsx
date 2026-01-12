// src/modules/providers/pages/ProviderEarnings.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import {
  TrendingUp, DollarSign, Calendar, Filter,
  Download, BarChart3, PieChart, TrendingDown,
  Clock, Target, Award, RefreshCw,
  ChevronDown, ChevronUp, Eye, Share2
} from 'lucide-react';
import './ProviderEarnings.css';

const ProviderEarnings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [provider, setProvider] = useState(null);
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    availableBalance: 0,
    pendingPayouts: 0,
    lifetimeEarnings: 0
  });
  
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [timeFilter, setTimeFilter] = useState('all'); // all, today, week, month, year
  const [typeFilter, setTypeFilter] = useState('all'); // all, earnings, payout, refund
  const [statusFilter, setStatusFilter] = useState('all'); // all, completed, pending, failed
  const [sortBy, setSortBy] = useState('date-desc'); // date-asc, date-desc, amount-asc, amount-desc
  
  // Chart data
  const [chartData, setChartData] = useState({
    labels: [],
    earnings: [],
    bookings: []
  });
  
  // Time periods for filter
  const timePeriods = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: 'This Quarter' },
    { id: 'year', label: 'This Year' },
    { id: 'all', label: 'All Time' }
  ];
  
  // Transaction types
  const transactionTypes = [
    { id: 'all', label: 'All Types' },
    { id: 'earnings', label: 'Earnings' },
    { id: 'payout', label: 'Payouts' },
    { id: 'refund', label: 'Refunds' },
    { id: 'subscription', label: 'Subscription' },
    { id: 'boost', label: 'Boost' }
  ];
  
  // Status options
  const statusOptions = [
    { id: 'all', label: 'All Status' },
    { id: 'completed', label: 'Completed' },
    { id: 'pending', label: 'Pending' },
    { id: 'failed', label: 'Failed' }
  ];
  
  // Sort options
  const sortOptions = [
    { id: 'date-desc', label: 'Newest First' },
    { id: 'date-asc', label: 'Oldest First' },
    { id: 'amount-desc', label: 'Amount (High to Low)' },
    { id: 'amount-asc', label: 'Amount (Low to High)' }
  ];
  
  useEffect(() => {
    loadEarningsData();
  }, []);
  
  useEffect(() => {
    filterAndSortTransactions();
  }, [transactions, timeFilter, typeFilter, statusFilter, sortBy]);
  
  const loadEarningsData = () => {
    try {
      setLoading(true);
      
      // Load provider data
      const providers = JSON.parse(localStorage.getItem('serviceProviders') || '[]');
      const userProvider = providers.find(p => p.userId === user?.id || p.email === user?.email);
      
      if (userProvider) {
        setProvider(userProvider);
        
        // Mock earnings data
        const mockEarnings = {
          totalEarnings: userProvider.totalRevenue || 0,
          availableBalance: userProvider.availableBalance || 0,
          pendingPayouts: userProvider.pendingPayouts || 0,
          lifetimeEarnings: userProvider.lifetimeEarnings || 0,
          thisMonthEarnings: userProvider.thisMonthEarnings || 0,
          lastMonthEarnings: userProvider.lastMonthEarnings || 0,
          averageBookingValue: userProvider.averageBookingValue || 0,
          bookingCount: userProvider.successfulBookings || 0
        };
        
        setEarnings(mockEarnings);
        
        // Mock transactions
        const mockTransactions = [
          {
            id: 'txn_001',
            date: '2024-02-15',
            type: 'earnings',
            description: 'Interior Design Service - Lekki Phase 1',
            amount: 75000,
            status: 'completed',
            bookingId: 'BKG-001',
            clientName: 'Adeola Williams'
          },
          {
            id: 'txn_002',
            date: '2024-02-10',
            type: 'earnings',
            description: 'Electrical Installation - Victoria Island',
            amount: 45000,
            status: 'completed',
            bookingId: 'BKG-002',
            clientName: 'Michael Johnson'
          },
          {
            id: 'txn_003',
            date: '2024-02-05',
            type: 'payout',
            description: 'Withdrawal to Bank Account',
            amount: -50000,
            status: 'completed',
            bookingId: null,
            clientName: null
          },
          {
            id: 'txn_004',
            date: '2024-02-01',
            type: 'subscription',
            description: 'Monthly Subscription Fee',
            amount: -3000,
            status: 'completed',
            bookingId: null,
            clientName: null
          },
          {
            id: 'txn_005',
            date: '2024-01-28',
            type: 'earnings',
            description: 'Plumbing Repair - Ikeja',
            amount: 25000,
            status: 'pending',
            bookingId: 'BKG-003',
            clientName: 'Sarah Ahmed'
          },
          {
            id: 'txn_006',
            date: '2024-01-20',
            type: 'boost',
            description: 'Profile Boost - 30 days',
            amount: -5000,
            status: 'completed',
            bookingId: null,
            clientName: null
          },
          {
            id: 'txn_007',
            date: '2024-01-15',
            type: 'earnings',
            description: 'Painting Service - Ajah',
            amount: 65000,
            status: 'completed',
            bookingId: 'BKG-004',
            clientName: 'David Okafor'
          }
        ];
        
        setTransactions(mockTransactions);
        setFilteredTransactions(mockTransactions);
        
        // Mock chart data
        const mockChartData = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          earnings: [45000, 85000, 65000, 95000, 75000, 110000, 90000],
          bookings: [3, 5, 4, 6, 5, 8, 7]
        };
        
        setChartData(mockChartData);
      }
    } catch (error) {
      console.error('Error loading earnings data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const filterAndSortTransactions = () => {
    let filtered = transactions.filter(transaction => {
      // Filter by time
      if (timeFilter !== 'all') {
        const transactionDate = new Date(transaction.date);
        const now = new Date();
        const diffTime = Math.abs(now - transactionDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (timeFilter) {
          case 'today':
            return diffDays === 0;
          case 'week':
            return diffDays <= 7;
          case 'month':
            return diffDays <= 30;
          case 'quarter':
            return diffDays <= 90;
          case 'year':
            return diffDays <= 365;
          default:
            return true;
        }
      }
      
      // Filter by type
      if (typeFilter !== 'all' && transaction.type !== typeFilter) {
        return false;
      }
      
      // Filter by status
      if (statusFilter !== 'all' && transaction.status !== statusFilter) {
        return false;
      }
      
      return true;
    });
    
    // Sort transactions
    filtered.sort((a, b) => {
      const [sortField, sortOrder] = sortBy.split('-');
      
      if (sortField === 'date') {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else if (sortField === 'amount') {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      }
      
      return 0;
    });
    
    setFilteredTransactions(filtered);
  };
  
  const calculateGrowth = () => {
    if (!earnings.thisMonthEarnings || !earnings.lastMonthEarnings) {
      return { percentage: 0, isPositive: true };
    }
    
    const growth = ((earnings.thisMonthEarnings - earnings.lastMonthEarnings) / earnings.lastMonthEarnings) * 100;
    return {
      percentage: Math.abs(Math.round(growth)),
      isPositive: growth >= 0
    };
  };
  
  const getEarningsBreakdown = () => {
    const breakdown = {
      earnings: 0,
      payouts: 0,
      subscriptions: 0,
      boosts: 0
    };
    
    transactions.forEach(txn => {
      if (txn.amount > 0) {
        breakdown.earnings += txn.amount;
      } else {
        switch (txn.type) {
          case 'payout':
            breakdown.payouts += Math.abs(txn.amount);
            break;
          case 'subscription':
            breakdown.subscriptions += Math.abs(txn.amount);
            break;
          case 'boost':
            breakdown.boosts += Math.abs(txn.amount);
            break;
        }
      }
    });
    
    return breakdown;
  };
  
  const exportToCSV = () => {
    const data = filteredTransactions.map(txn => ({
      Date: new Date(txn.date).toLocaleDateString(),
      Type: txn.type.toUpperCase(),
      Description: txn.description,
      Amount: `₦${Math.abs(txn.amount).toLocaleString()}`,
      Status: txn.status.toUpperCase(),
      'Booking ID': txn.bookingId || 'N/A',
      'Client Name': txn.clientName || 'N/A'
    }));
    
    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).map(value => 
        `"${value?.toString().replace(/"/g, '""') || ''}"`
      ).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `renteasy-earnings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    alert('Earnings data exported successfully!');
  };
  
  const requestPayout = () => {
    if (earnings.availableBalance < 1000) {
      alert('Minimum payout amount is ₦1,000');
      return;
    }
    
    if (window.confirm(`Request payout of ₦${earnings.availableBalance.toLocaleString()}?`)) {
      // Add payout request
      const payoutRequests = JSON.parse(localStorage.getItem('providerPayouts') || '[]');
      payoutRequests.push({
        id: `PAY-${Date.now()}`,
        providerId: provider.id,
        amount: earnings.availableBalance,
        date: new Date().toISOString(),
        status: 'pending',
        method: 'bank_transfer'
      });
      
      localStorage.setItem('providerPayouts', JSON.stringify(payoutRequests));
      
      // Update provider balance
      const providers = JSON.parse(localStorage.getItem('serviceProviders') || '[]');
      const providerIndex = providers.findIndex(p => p.id === provider.id);
      
      if (providerIndex !== -1) {
        providers[providerIndex].availableBalance = 0;
        providers[providerIndex].pendingPayouts = (providers[providerIndex].pendingPayouts || 0) + earnings.availableBalance;
        localStorage.setItem('serviceProviders', JSON.stringify(providers));
      }
      
      alert('Payout request submitted! It will be processed within 3-5 business days.');
      loadEarningsData(); // Refresh data
    }
  };
  
  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      loadEarningsData();
      alert('Data refreshed!');
    }, 1000);
  };
  
  const formatCurrency = (amount) => {
    return `₦${Math.abs(amount).toLocaleString()}`;
  };
  
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'earnings': return <TrendingUp size={16} color="#059669" />;
      case 'payout': return <DollarSign size={16} color="#ef4444" />;
      case 'subscription': return <RefreshCw size={16} color="#3b82f6" />;
      case 'boost': return <TrendingUp size={16} color="#f59e0b" />;
      case 'refund': return <TrendingDown size={16} color="#ef4444" />;
      default: return <DollarSign size={16} color="#6b7280" />;
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#059669';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };
  
  if (loading) {
    return (
      <div className="earnings-loading">
        <div className="loading-spinner"></div>
        <p>Loading earnings data...</p>
      </div>
    );
  }
  
  
  const growth = calculateGrowth();
  const breakdown = getEarningsBreakdown();
  
  return (
    <div className="provider-earnings">
      <div className="earnings-container">
        {/* Header */}
        <div className="earnings-header">
          <div className="header-content">
            <h1>
              <DollarSign size={24} />
              Earnings & Financials
            </h1>
            <p className="subtitle">
              Track your earnings, payments, and financial performance
            </p>
          </div>
          
          <div className="header-actions">
            <button 
              className="btn btn-secondary"
              onClick={refreshData}
            >
              <RefreshCw size={18} />
              Refresh
            </button>
            <button 
              className="btn btn-primary"
              onClick={exportToCSV}
              disabled={filteredTransactions.length === 0}
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="earnings-stats">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#10b98120' }}>
              <DollarSign size={24} color="#10b981" />
            </div>
            <div className="stat-content">
              <h3>{formatCurrency(earnings.availableBalance)}</h3>
              <p>Available Balance</p>
              <small>Ready for payout</small>
            </div>
            {earnings.availableBalance >= 1000 && (
              <button 
                className="btn btn-small btn-primary"
                onClick={requestPayout}
              >
                Request Payout
              </button>
            )}
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#3b82f620' }}>
              <TrendingUp size={24} color="#3b82f6" />
            </div>
            <div className="stat-content">
              <h3>{formatCurrency(earnings.totalEarnings)}</h3>
              <p>Total Earnings</p>
              <small>This month</small>
            </div>
            <div className="growth-indicator">
              {growth.isPositive ? (
                <ChevronUp size={16} color="#059669" />
              ) : (
                <ChevronDown size={16} color="#ef4444" />
              )}
              <span className={`growth-text ${growth.isPositive ? 'positive' : 'negative'}`}>
                {growth.percentage}%
              </span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#8b5cf620' }}>
              <Target size={24} color="#8b5cf6" />
            </div>
            <div className="stat-content">
              <h3>{formatCurrency(earnings.lifetimeEarnings)}</h3>
              <p>Lifetime Earnings</p>
              <small>Since registration</small>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#f59e0b20' }}>
              <Clock size={24} color="#f59e0b" />
            </div>
            <div className="stat-content">
              <h3>{formatCurrency(earnings.pendingPayouts)}</h3>
              <p>Pending Payouts</p>
              <small>Processing requests</small>
            </div>
          </div>
        </div>
        
        {/* Performance Metrics */}
        <div className="performance-metrics">
          <h3>
            <BarChart3 size={20} />
            Performance Metrics
          </h3>
          
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-value">
                {earnings.bookingCount}
                <span className="metric-label">Bookings</span>
              </div>
              <p>Total successful bookings</p>
            </div>
            
            <div className="metric-card">
              <div className="metric-value">
                {formatCurrency(earnings.averageBookingValue)}
                <span className="metric-label">Average Booking</span>
              </div>
              <p>Average value per booking</p>
            </div>
            
            <div className="metric-card">
              <div className="metric-value">
                {formatCurrency(breakdown.earnings)}
                <span className="metric-label">Total Earnings</span>
              </div>
              <p>From all services</p>
            </div>
            
            <div className="metric-card">
              <div className="metric-value">
                {formatCurrency(breakdown.payouts)}
                <span className="metric-label">Total Payouts</span>
              </div>
              <p>Amount withdrawn</p>
            </div>
          </div>
        </div>
        
        {/* Breakdown Chart */}
        <div className="breakdown-section">
          <div className="section-header">
            <h3>
              <PieChart size={20} />
              Earnings Breakdown
            </h3>
            <button 
              className="btn btn-small btn-outline"
              onClick={() => navigate('/providers/analytics')}
            >
              <Eye size={16} />
              View Details
            </button>
          </div>
          
          <div className="breakdown-grid">
            <div className="breakdown-card">
              <h4>By Type</h4>
              <div className="breakdown-list">
                <div className="breakdown-item">
                  <div className="item-label">
                    <span className="color-dot" style={{ backgroundColor: '#10b981' }}></span>
                    <span>Earnings</span>
                  </div>
                  <div className="item-value">
                    <strong>{formatCurrency(breakdown.earnings)}</strong>
                    <span className="percentage">
                      {breakdown.earnings > 0 ? '100%' : '0%'}
                    </span>
                  </div>
                </div>
                
                <div className="breakdown-item">
                  <div className="item-label">
                    <span className="color-dot" style={{ backgroundColor: '#ef4444' }}></span>
                    <span>Payouts</span>
                  </div>
                  <div className="item-value">
                    <strong>{formatCurrency(breakdown.payouts)}</strong>
                    <span className="percentage">
                      {breakdown.earnings > 0 ? 
                        `${Math.round((breakdown.payouts / breakdown.earnings) * 100)}%` : 
                        '0%'}
                    </span>
                  </div>
                </div>
                
                <div className="breakdown-item">
                  <div className="item-label">
                    <span className="color-dot" style={{ backgroundColor: '#3b82f6' }}></span>
                    <span>Subscriptions</span>
                  </div>
                  <div className="item-value">
                    <strong>{formatCurrency(breakdown.subscriptions)}</strong>
                    <span className="percentage">
                      {breakdown.earnings > 0 ? 
                        `${Math.round((breakdown.subscriptions / breakdown.earnings) * 100)}%` : 
                        '0%'}
                    </span>
                  </div>
                </div>
                
                <div className="breakdown-item">
                  <div className="item-label">
                    <span className="color-dot" style={{ backgroundColor: '#f59e0b' }}></span>
                    <span>Boosts</span>
                  </div>
                  <div className="item-value">
                    <strong>{formatCurrency(breakdown.boosts)}</strong>
                    <span className="percentage">
                      {breakdown.earnings > 0 ? 
                        `${Math.round((breakdown.boosts / breakdown.earnings) * 100)}%` : 
                        '0%'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="breakdown-card">
              <h4>Quick Stats</h4>
              <div className="quick-stats">
                <div className="quick-stat">
                  <Award size={20} color="#3b82f6" />
                  <div className="stat-content">
                    <strong>Highest Earning</strong>
                    <span>{formatCurrency(Math.max(...transactions.filter(t => t.amount > 0).map(t => t.amount) || [0]))}</span>
                  </div>
                </div>
                
                <div className="quick-stat">
                  <Calendar size={20} color="#10b981" />
                  <div className="stat-content">
                    <strong>Best Month</strong>
                    <span>February 2024</span>
                  </div>
                </div>
                
                <div className="quick-stat">
                  <Target size={20} color="#8b5cf6" />
                  <div className="stat-content">
                    <strong>Goal Progress</strong>
                    <span>{Math.round((earnings.totalEarnings / 500000) * 100)}% of ₦500k</span>
                  </div>
                </div>
                
                <div className="quick-stat">
                  <TrendingUp size={20} color="#f59e0b" />
                  <div className="stat-content">
                    <strong>Growth Rate</strong>
                    <span className={growth.isPositive ? 'positive' : 'negative'}>
                      {growth.isPositive ? '+' : '-'}{growth.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="earnings-filters">
          <h3>
            <Filter size={20} />
            Transaction History
          </h3>
          
          <div className="filter-controls">
            <div className="filter-group">
              <label>Time Period</label>
              <div className="filter-buttons">
                {timePeriods.map(period => (
                  <button
                    key={period.id}
                    className={`filter-btn ${timeFilter === period.id ? 'active' : ''}`}
                    onClick={() => setTimeFilter(period.id)}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="filter-row">
              <div className="filter-field">
                <label>Transaction Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  {transactionTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="filter-field">
                <label>Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {statusOptions.map(status => (
                    <option key={status.id} value={status.id}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="filter-field">
                <label>Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {sortOptions.map(sort => (
                    <option key={sort.id} value={sort.id}>
                      {sort.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Transactions Table */}
        {filteredTransactions.length === 0 ? (
          <div className="no-transactions">
            <DollarSign size={48} color="#9ca3af" />
            <h4>No transactions found</h4>
            <p>No transactions match your current filters. Try adjusting your criteria.</p>
          </div>
        ) : (
          <div className="transactions-table">
            <div className="table-header">
              <div className="header-cell">Date</div>
              <div className="header-cell">Type</div>
              <div className="header-cell">Description</div>
              <div className="header-cell">Amount</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Actions</div>
            </div>
            
            <div className="table-body">
              {filteredTransactions.map(transaction => (
                <div key={transaction.id} className="table-row">
                  <div className="table-cell">
                    <div className="date-cell">
                      <Calendar size={14} color="#6b7280" />
                      {new Date(transaction.date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="table-cell">
                    <div className="type-cell">
                      {getTransactionIcon(transaction.type)}
                      <span className="type-label">
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="table-cell">
                    <div className="description-cell">
                      <strong>{transaction.description}</strong>
                      {transaction.bookingId && (
                        <small>Booking #{transaction.bookingId}</small>
                      )}
                      {transaction.clientName && (
                        <small>Client: {transaction.clientName}</small>
                      )}
                    </div>
                  </div>
                  
                  <div className="table-cell">
                    <div className={`amount-cell ${transaction.amount >= 0 ? 'positive' : 'negative'}`}>
                      {transaction.amount >= 0 ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                  
                  <div className="table-cell">
                    <span 
                      className="status-badge"
                      style={{ 
                        backgroundColor: `${getStatusColor(transaction.status)}20`,
                        color: getStatusColor(transaction.status)
                      }}
                    >
                      {transaction.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="table-cell">
                    <div className="action-buttons">
                      <button 
                        className="btn-icon"
                        onClick={() => navigate(`/providers/bookings/${transaction.bookingId}`)}
                        disabled={!transaction.bookingId}
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        className="btn-icon"
                        onClick={() => alert(`Receipt for ${transaction.description}`)}
                      >
                        <Download size={14} />
                      </button>
                      <button 
                        className="btn-icon"
                        onClick={() => alert(`Share ${transaction.description}`)}
                      >
                        <Share2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="table-footer">
              <div className="footer-info">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </div>
              <div className="footer-total">
                <span>Filtered Total:</span>
                <strong>
                  {formatCurrency(filteredTransactions.reduce((sum, txn) => sum + txn.amount, 0))}
                </strong>
              </div>
            </div>
          </div>
        )}
        
        {/* Financial Tips */}
        <div className="financial-tips">
          <h3>Financial Management Tips</h3>
          <div className="tips-grid">
            <div className="tip-card">
              <h4>Maximize Earnings</h4>
              <ul>
                <li>Complete your profile with portfolio images</li>
                <li>Respond to leads within 1 hour</li>
                <li>Ask satisfied clients for reviews</li>
                <li>Use professional photos of your work</li>
              </ul>
            </div>
            
            <div className="tip-card">
              <h4>Tax Planning</h4>
              <ul>
                <li>Keep records of all transactions</li>
                <li>Download monthly invoices</li>
                <li>Set aside 20% for taxes</li>
                <li>Consult a tax professional</li>
              </ul>
            </div>
            
            <div className="tip-card">
              <h4>Growth Strategies</h4>
              <ul>
                <li>Reinvest earnings into better equipment</li>
                <li>Consider the quarterly plan for savings</li>
                <li>Use boost during peak seasons</li>
                <li>Expand your service areas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderEarnings;