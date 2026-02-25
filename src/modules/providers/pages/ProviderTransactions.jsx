// src/modules/providers/pages/ProviderTransactions.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import {
  Search, Filter, Download, Calendar,
  ArrowUpRight, ArrowDownLeft, CheckCircle,
  Clock, AlertCircle, FileText, CreditCard,
  TrendingUp, TrendingDown
} from 'lucide-react';
import './ProviderTransactions.css';

const ProviderTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalWithdrawals: 0,
    totalCommission: 0,
    netBalance: 0
  });

  const timeRanges = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' }
  ];

  useEffect(() => {
    if (user?.id) {
      fetchTransactions();
    }
  }, [user, timeRange]); // refetch when timeRange changes

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Calculate date filter based on timeRange
      let startDate = null;
      const now = new Date();
      switch (timeRange) {
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'quarter':
          startDate = new Date(now.setMonth(now.getMonth() - 3));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = null;
      }

      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      setTransactions(data || []);

      // Compute stats
      const totals = (data || []).reduce(
        (acc, tx) => {
          if (tx.type === 'credit') {
            acc.earnings += tx.amount;
            acc.commission += tx.commission || 0;
          } else if (tx.type === 'debit') {
            acc.withdrawals += tx.amount;
          }
          return acc;
        },
        { earnings: 0, withdrawals: 0, commission: 0 }
      );

      setStats({
        totalEarnings: totals.earnings,
        totalWithdrawals: totals.withdrawals,
        totalCommission: totals.commission,
        netBalance: totals.earnings - totals.withdrawals - totals.commission
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    // Generate CSV from filtered transactions
    const csv = [
      ['ID', 'Description', 'Date', 'Type', 'Amount', 'Commission', 'Status'].join(','),
      ...filteredTransactions.map(tx =>
        [
          tx.id.slice(0, 8),
          `"${tx.title}"`,
          new Date(tx.date).toLocaleDateString(),
          tx.type,
          tx.amount,
          tx.commission,
          tx.status
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Filter transactions by search term
  const filteredTransactions = transactions.filter(tx =>
    tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle size={14} />;
      case 'pending': return <Clock size={14} />;
      case 'failed': return <AlertCircle size={14} />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type) => {
    return type === 'credit' ?
      <ArrowDownLeft size={16} /> :
      <ArrowUpRight size={16} />;
  };

  const getTypeColor = (type) => {
    return type === 'credit' ? '#10b981' : '#ef4444';
  };

  if (loading) {
    return <div className="loading">Loading transactions...</div>;
  }

  return (
    <div className="transactions-container">
      {/* Header */}
      <div className="transactions-header">
        <div>
          <h1 className="page-title">Transaction History</h1>
          <p className="page-subtitle">Track all your earnings, withdrawals, and commissions</p>
        </div>

        <div className="header-controls">
          <div className="time-range-buttons">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`range-button ${timeRange === range.value ? 'active' : ''}`}
              >
                {range.label}
              </button>
            ))}
          </div>

          <button className="export-button" onClick={handleExportCSV}>
            <Download size={20} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div>
              <p className="stat-label">Total Earnings</p>
              <p className="stat-value">₦{stats.totalEarnings.toLocaleString()}</p>
            </div>
            <div className="stat-icon earnings">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="stat-trend positive">
            <TrendingUp size={16} />
            <span>↑ 15% from last month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div>
              <p className="stat-label">Total Withdrawals</p>
              <p className="stat-value">₦{stats.totalWithdrawals.toLocaleString()}</p>
            </div>
            <div className="stat-icon withdrawals">
              <TrendingDown size={24} />
            </div>
          </div>
          <div className="stat-trend neutral">
            <span>Last withdrawal: ₦{stats.totalWithdrawals.toLocaleString()}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div>
              <p className="stat-label">RentEasy Commission</p>
              <p className="stat-value">₦{stats.totalCommission.toLocaleString()}</p>
            </div>
            <div className="stat-icon commission">
              <FileText size={24} />
            </div>
          </div>
          <div className="stat-trend commission">
            <span>7.5% of total earnings</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div>
              <p className="stat-label">Net Balance</p>
              <p className="stat-value">₦{stats.netBalance.toLocaleString()}</p>
            </div>
            <div className="stat-icon balance">
              <CreditCard size={24} />
            </div>
          </div>
          <div className="stat-trend balance">
            <span>Available for withdrawal</span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="table-container">
        <div className="table-header">
          <div className="table-header-content">
            <h3 className="table-title">Recent Transactions</h3>

            <div className="table-controls">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />

              <button className="filter-button">
                <Filter size={20} />
                <span>Filter</span>
              </button>
            </div>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FileText size={32} />
            </div>
            <h3 className="empty-title">No transactions found</h3>
            <p className="empty-text">Try adjusting your search or time range</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Commission</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <div className="transaction-id">{tx.id.slice(0, 8)}</div>
                    </td>
                    <td>
                      <div className="transaction-title">{tx.title}</div>
                      <div className="transaction-category">
                        {tx.category.charAt(0).toUpperCase() + tx.category.slice(1)}
                      </div>
                    </td>
                    <td>
                      <div className="transaction-date">
                        <Calendar size={14} />
                        <span>{new Date(tx.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td>
                      <div className="transaction-type">
                        {getTypeIcon(tx.type)}
                        <span style={{ color: getTypeColor(tx.type) }}>
                          {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className={`transaction-amount ${tx.type}`}>
                        {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <div className="transaction-commission">
                        {tx.commission > 0 ? `-₦${tx.commission.toLocaleString()}` : '—'}
                      </div>
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: `${getStatusColor(tx.status)}20`,
                          color: getStatusColor(tx.status)
                        }}
                      >
                        {getStatusIcon(tx.status)}
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderTransactions;