// src/modules/providers/pages/ProviderTransactions.jsx
import React, { useState } from 'react';
import { 
  Search, Filter, Download, Calendar, 
  ArrowUpRight, ArrowDownLeft, CheckCircle,
  Clock, AlertCircle, FileText, CreditCard,
  TrendingUp, TrendingDown
} from 'lucide-react';

const ProviderTransactions = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [searchTerm, setSearchTerm] = useState('');

  const transactions = [
    {
      id: 'TXN-001',
      type: 'credit',
      title: 'Cleaning Service - John Doe',
      amount: 25000,
      date: '2024-01-15',
      status: 'completed',
      category: 'service',
      commission: 1875
    },
    {
      id: 'TXN-002',
      type: 'debit',
      title: 'Withdrawal to GTBank',
      amount: 50000,
      date: '2024-01-14',
      status: 'completed',
      category: 'withdrawal',
      commission: 0
    },
    {
      id: 'TXN-003',
      type: 'credit',
      title: 'Painting Service - Jane Smith',
      amount: 80000,
      date: '2024-01-14',
      status: 'completed',
      category: 'service',
      commission: 6000
    },
    {
      id: 'TXN-004',
      type: 'credit',
      title: 'Plumbing Repair - Mike Johnson',
      amount: 15000,
      date: '2024-01-13',
      status: 'pending',
      category: 'service',
      commission: 1125
    },
    {
      id: 'TXN-005',
      type: 'debit',
      title: 'RentEasy Subscription',
      amount: 3000,
      date: '2024-01-12',
      status: 'completed',
      category: 'subscription',
      commission: 0
    },
    {
      id: 'TXN-006',
      type: 'credit',
      title: 'Deep Cleaning - Sarah Wilson',
      amount: 35000,
      date: '2024-01-11',
      status: 'completed',
      category: 'service',
      commission: 2625
    }
  ];

  const stats = {
    totalEarnings: 245000,
    totalWithdrawals: 50000,
    totalCommission: 14700,
    netBalance: 180300
  };

  const timeRanges = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' }
  ];

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

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '1.5rem'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '2rem',
      flexWrap: 'wrap',
      gap: '1rem'
    },
    title: {
      fontSize: '1.875rem',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '1rem'
    },
    controls: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      flexWrap: 'wrap'
    },
    timeRangeButtons: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      flexWrap: 'wrap'
    },
    rangeButton: {
      padding: '0.375rem 0.75rem',
      border: '1px solid #d1d5db',
      background: 'white',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap'
    },
    rangeButtonActive: {
      background: '#2563eb',
      borderColor: '#2563eb',
      color: 'white'
    },
    exportButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.625rem 1rem',
      background: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    },
    statCard: {
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '0.75rem',
      padding: '1.5rem'
    },
    statHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '0.5rem'
    },
    statLabel: {
      color: '#6b7280',
      fontSize: '0.875rem'
    },
    statValue: {
      fontSize: '1.875rem',
      fontWeight: '700',
      color: '#111827'
    },
    statIcon: {
      width: '3rem',
      height: '3rem',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    statTrend: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      fontSize: '0.875rem',
      marginTop: '0.5rem'
    },
    tableContainer: {
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '0.75rem',
      overflow: 'hidden'
    },
    tableHeader: {
      padding: '1.5rem',
      borderBottom: '1px solid #e5e7eb'
    },
    tableHeaderContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem'
    },
    tableTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#111827'
    },
    tableControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    searchInput: {
      padding: '0.5rem 0.75rem 0.5rem 2.25rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      width: '200px',
      transition: 'all 0.2s ease',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'%3E%3C/line%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: '0.75rem center',
      backgroundSize: '1rem'
    },
    filterButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 0.75rem',
      background: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      color: '#374151',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    tableHead: {
      background: '#f9fafb',
      borderBottom: '2px solid #e5e7eb'
    },
    tableTh: {
      padding: '0.75rem 1.5rem',
      textAlign: 'left',
      fontSize: '0.75rem',
      fontWeight: '600',
      color: '#374151',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    tableRow: {
      borderBottom: '1px solid #e5e7eb',
      transition: 'background-color 0.2s ease'
    },
    tableCell: {
      padding: '1rem 1.5rem',
      fontSize: '0.875rem',
      color: '#374151'
    },
    transactionId: {
      fontFamily: 'monospace',
      fontSize: '0.75rem',
      color: '#6b7280'
    },
    transactionTitle: {
      fontWeight: '600',
      color: '#111827'
    },
    transactionCategory: {
      fontSize: '0.75rem',
      color: '#6b7280',
      marginTop: '0.125rem'
    },
    typeCell: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600'
    },
    emptyState: {
      padding: '3rem 1.5rem',
      textAlign: 'center'
    },
    emptyIcon: {
      width: '4rem',
      height: '4rem',
      background: '#f9fafb',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem'
    },
    emptyTitle: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '0.5rem'
    },
    emptyText: {
      color: '#6b7280'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Transaction History</h1>
          <p style={styles.subtitle}>Track all your earnings, withdrawals, and commissions</p>
        </div>
        
        <div style={styles.controls}>
          <div style={styles.timeRangeButtons}>
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                style={{
                  ...styles.rangeButton,
                  ...(timeRange === range.value ? styles.rangeButtonActive : {})
                }}
              >
                {range.label}
              </button>
            ))}
          </div>
          
          <button style={styles.exportButton}>
            <Download size={20} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <div>
              <p style={styles.statLabel}>Total Earnings</p>
              <p style={styles.statValue}>₦{stats.totalEarnings.toLocaleString()}</p>
            </div>
            <div style={{...styles.statIcon, background: '#d1fae5'}}>
              <TrendingUp style={{color: '#10b981'}} size={24} />
            </div>
          </div>
          <div style={{...styles.statTrend, color: '#10b981'}}>
            <TrendingUp size={16} />
            <span>↑ 15% from last month</span>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <div>
              <p style={styles.statLabel}>Total Withdrawals</p>
              <p style={styles.statValue}>₦{stats.totalWithdrawals.toLocaleString()}</p>
            </div>
            <div style={{...styles.statIcon, background: '#fee2e2'}}>
              <TrendingDown style={{color: '#ef4444'}} size={24} />
            </div>
          </div>
          <div style={{...styles.statTrend, color: '#6b7280'}}>
            <span>Last withdrawal: ₦50,000</span>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <div>
              <p style={styles.statLabel}>RentEasy Commission</p>
              <p style={styles.statValue}>₦{stats.totalCommission.toLocaleString()}</p>
            </div>
            <div style={{...styles.statIcon, background: '#f3e8ff'}}>
              <FileText style={{color: '#8b5cf6'}} size={24} />
            </div>
          </div>
          <div style={{...styles.statTrend, color: '#8b5cf6'}}>
            <span>7.5% of total earnings</span>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <div>
              <p style={styles.statLabel}>Net Balance</p>
              <p style={styles.statValue}>₦{stats.netBalance.toLocaleString()}</p>
            </div>
            <div style={{...styles.statIcon, background: '#dbeafe'}}>
              <CreditCard style={{color: '#2563eb'}} size={24} />
            </div>
          </div>
          <div style={{...styles.statTrend, color: '#2563eb'}}>
            <span>Available for withdrawal</span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <div style={styles.tableHeaderContent}>
            <h3 style={styles.tableTitle}>Recent Transactions</h3>
            
            <div style={styles.tableControls}>
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
              
              <button style={styles.filterButton}>
                <Filter size={20} />
                <span>Filter</span>
              </button>
            </div>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <FileText size={32} color="#9ca3af" />
            </div>
            <h3 style={styles.emptyTitle}>No transactions found</h3>
            <p style={styles.emptyText}>Try adjusting your search or time range</p>
          </div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table style={styles.table}>
              <thead style={styles.tableHead}>
                <tr>
                  <th style={styles.tableTh}>Transaction ID</th>
                  <th style={styles.tableTh}>Description</th>
                  <th style={styles.tableTh}>Date</th>
                  <th style={styles.tableTh}>Type</th>
                  <th style={styles.tableTh}>Amount</th>
                  <th style={styles.tableTh}>Commission</th>
                  <th style={styles.tableTh}>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <div style={styles.transactionId}>{tx.id}</div>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.transactionTitle}>{tx.title}</div>
                      <div style={styles.transactionCategory}>
                        {tx.category.charAt(0).toUpperCase() + tx.category.slice(1)}
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <Calendar size={14} color="#9ca3af" />
                        <span>{tx.date}</span>
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.typeCell}>
                        {getTypeIcon(tx.type)}
                        <span style={{color: getTypeColor(tx.type)}}>
                          {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={{
                        fontWeight: '700',
                        color: getTypeColor(tx.type)
                      }}>
                        {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={{
                        color: '#8b5cf6',
                        fontWeight: tx.commission > 0 ? '600' : '400'
                      }}>
                        {tx.commission > 0 ? `-₦${tx.commission.toLocaleString()}` : '—'}
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={{
                        ...styles.statusBadge,
                        background: `${getStatusColor(tx.status)}20`,
                        color: getStatusColor(tx.status)
                      }}>
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