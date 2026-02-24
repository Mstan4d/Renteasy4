// src/modules/providers/pages/ProviderEarnings.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import {
  TrendingUp, DollarSign, Calendar, Filter,
  Download, BarChart3, PieChart, TrendingDown,
  Clock, Target, Award, RefreshCw,
  ChevronDown, ChevronUp, Eye, Share2, AlertCircle
} from 'lucide-react';
import './ProviderEarnings.css';

const ProviderEarnings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Financial stats
  const [stats, setStats] = useState({
    totalEarnings: 0,
    availableBalance: 0,
    pendingPayouts: 0,
    lifetimeEarnings: 0,
    thisMonthEarnings: 0,
    lastMonthEarnings: 0,
    averageBookingValue: 0,
    bookingCount: 0
  });

  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  // Filters
  const [timeFilter, setTimeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

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
    { id: 'earning', label: 'Earnings' },
    { id: 'payout', label: 'Payouts' },
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
    if (!user) return;
    fetchEarningsData();
  }, [user]);

  useEffect(() => {
    filterAndSortTransactions();
  }, [transactions, timeFilter, typeFilter, statusFilter, sortBy]);

  const fetchEarningsData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch transactions
      const { data: txnData, error: txnError } = await supabase
        .from('transactions')
        .select('*')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });

      if (txnError) throw txnError;
      setTransactions(txnData || []);

      // Fetch earnings summary
      const { data: earnData, error: earnError } = await supabase
        .from('provider_earnings')
        .select('amount, status, created_at')
        .eq('provider_id', user.id);

      if (earnError) throw earnError;

      // Fetch payouts summary
      const { data: payoutData, error: payoutError } = await supabase
        .from('provider_payouts')
        .select('amount, status')
        .eq('provider_id', user.id);

      if (payoutError) throw payoutError;

      // Calculate stats
      const totalEarnings = (earnData || []).reduce((sum, e) => sum + (e.amount || 0), 0);
      const pendingEarnings = (earnData || []).filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);
      const paidEarnings = (earnData || []).filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);
      const pendingPayouts = (payoutData || []).filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

      // Available balance = paid earnings minus already paid out (assuming payouts are from paid earnings)
      // For simplicity, available = paidEarnings - sum of completed payouts
      const completedPayouts = (payoutData || []).filter(p => p.status === 'processed').reduce((sum, p) => sum + p.amount, 0);
      const availableBalance = paidEarnings - completedPayouts;

      // This month earnings
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const thisMonthEarnings = (earnData || [])
        .filter(e => e.created_at >= startOfMonth)
        .reduce((sum, e) => sum + e.amount, 0);

      // Last month earnings
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();
      const lastMonthEarnings = (earnData || [])
        .filter(e => e.created_at >= startOfLastMonth && e.created_at <= endOfLastMonth)
        .reduce((sum, e) => sum + e.amount, 0);

      // Average booking value
      const bookings = (earnData || []).filter(e => e.amount > 0);
      const avgBookingValue = bookings.length ? totalEarnings / bookings.length : 0;

setStats({
  totalEarnings,
  availableBalance: Math.max(availableBalance, 0),
  pendingPayouts,
  lifetimeEarnings: totalEarnings,
  thisMonthEarnings,
  lastMonthEarnings,
  averageBookingValue: avgBookingValue, // ✅ correct
  bookingCount: bookings.length
});

    } catch (err) {
      console.error('Error fetching earnings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTransactions = () => {
    let filtered = transactions.filter(tx => {
      // Time filter
      if (timeFilter !== 'all') {
        const txDate = new Date(tx.created_at);
        const now = new Date();
        const diffDays = Math.ceil((now - txDate) / (1000 * 60 * 60 * 24));
        switch (timeFilter) {
          case 'today':
            if (diffDays > 0) return false;
            break;
          case 'week':
            if (diffDays > 7) return false;
            break;
          case 'month':
            if (diffDays > 30) return false;
            break;
          case 'quarter':
            if (diffDays > 90) return false;
            break;
          case 'year':
            if (diffDays > 365) return false;
            break;
        }
      }
      // Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      // Status filter
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      const [field, order] = sortBy.split('-');
      if (field === 'date') {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return order === 'desc' ? dateB - dateA : dateA - dateB;
      } else if (field === 'amount') {
        return order === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      }
      return 0;
    });

    setFilteredTransactions(filtered);
  };

  const requestPayout = async () => {
    if (stats.availableBalance < 1000) {
      alert('Minimum payout amount is ₦1,000');
      return;
    }

    if (!window.confirm(`Request payout of ₦${stats.availableBalance.toLocaleString()}?`)) return;

    try {
      const { error } = await supabase
        .from('provider_payouts')
        .insert({
          provider_id: user.id,
          amount: stats.availableBalance,
          status: 'pending',
          payment_method: 'bank_transfer',
          requested_at: new Date().toISOString()
        });

      if (error) throw error;

      // Also create a transaction for this payout (negative amount)
      await supabase
        .from('transactions')
        .insert({
          provider_id: user.id,
          type: 'payout',
          amount: -stats.availableBalance,
          description: 'Withdrawal request',
          status: 'pending',
          created_at: new Date().toISOString()
        });

      alert('Payout request submitted! It will be processed within 3-5 business days.');
      await fetchEarningsData(); // Refresh
    } catch (err) {
      console.error('Payout request failed:', err);
      alert('Failed to request payout: ' + err.message);
    }
  };

  const refreshData = () => {
    fetchEarningsData();
  };

  const exportToCSV = () => {
    const data = filteredTransactions.map(tx => ({
      Date: new Date(tx.created_at).toLocaleDateString(),
      Type: tx.type.toUpperCase(),
      Description: tx.description || '',
      Amount: `₦${Math.abs(tx.amount).toLocaleString()}`,
      Status: tx.status.toUpperCase(),
    }));

    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `renteasy-earnings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => {
    return `₦${Math.abs(amount).toLocaleString()}`;
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'earning': return <TrendingUp size={16} color="#059669" />;
      case 'payout': return <DollarSign size={16} color="#ef4444" />;
      case 'subscription': return <RefreshCw size={16} color="#3b82f6" />;
      case 'boost': return <TrendingUp size={16} color="#f59e0b" />;
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

  const growth = (() => {
    if (!stats.thisMonthEarnings || !stats.lastMonthEarnings) return { percentage: 0, isPositive: true };
    const g = ((stats.thisMonthEarnings - stats.lastMonthEarnings) / stats.lastMonthEarnings) * 100;
    return { percentage: Math.abs(Math.round(g)), isPositive: g >= 0 };
  })();

  if (loading) {
    return (
      <div className="earnings-loading">
        <div className="loading-spinner"></div>
        <p>Loading earnings data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="earnings-error">
        <AlertCircle size={48} />
        <h3>Failed to load earnings</h3>
        <p>{error}</p>
        <button onClick={refreshData}>Retry</button>
      </div>
    );
  }

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
              <h3>{formatCurrency(stats.availableBalance)}</h3>
              <p>Available Balance</p>
              <small>Ready for payout</small>
            </div>
            {stats.availableBalance >= 1000 && (
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
              <h3>{formatCurrency(stats.thisMonthEarnings)}</h3>
              <p>This Month</p>
              <small>Earnings this month</small>
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
              <h3>{formatCurrency(stats.lifetimeEarnings)}</h3>
              <p>Lifetime Earnings</p>
              <small>Since registration</small>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#f59e0b20' }}>
              <Clock size={24} color="#f59e0b" />
            </div>
            <div className="stat-content">
              <h3>{formatCurrency(stats.pendingPayouts)}</h3>
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
                {stats.bookingCount}
                <span className="metric-label">Bookings</span>
              </div>
              <p>Total successful bookings</p>
            </div>
            
            <div className="metric-card">
              <div className="metric-value">
                {formatCurrency(stats.averageBookingValue)}
                <span className="metric-label">Average Booking</span>
              </div>
              <p>Average value per booking</p>
            </div>
            
            <div className="metric-card">
              <div className="metric-value">
                {formatCurrency(stats.totalEarnings)}
                <span className="metric-label">Total Earnings</span>
              </div>
              <p>From all services</p>
            </div>
            
            <div className="metric-card">
              <div className="metric-value">
                {formatCurrency(stats.availableBalance + stats.pendingPayouts)}
                <span className="metric-label">Total Withdrawn</span>
              </div>
              <p>Amount paid out</p>
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
              {filteredTransactions.map(tx => (
                <div key={tx.id} className="table-row">
                  <div className="table-cell">
                    <div className="date-cell">
                      <Calendar size={14} color="#6b7280" />
                      {new Date(tx.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="table-cell">
                    <div className="type-cell">
                      {getTransactionIcon(tx.type)}
                      <span className="type-label">
                        {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="table-cell">
                    <div className="description-cell">
                      <strong>{tx.description || 'Transaction'}</strong>
                      {tx.reference_id && (
                        <small>Ref: {tx.reference_id}</small>
                      )}
                    </div>
                  </div>
                  
                  <div className="table-cell">
                    <div className={`amount-cell ${tx.amount >= 0 ? 'positive' : 'negative'}`}>
                      {tx.amount >= 0 ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </div>
                  </div>
                  
                  <div className="table-cell">
                    <span 
                      className="status-badge"
                      style={{ 
                        backgroundColor: `${getStatusColor(tx.status)}20`,
                        color: getStatusColor(tx.status)
                      }}
                    >
                      {tx.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="table-cell">
                    <div className="action-buttons">
                      <button 
                        className="btn-icon"
                        onClick={() => {}}
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        className="btn-icon"
                        onClick={() => alert('Download receipt')}
                      >
                        <Download size={14} />
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
                  {formatCurrency(filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0))}
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