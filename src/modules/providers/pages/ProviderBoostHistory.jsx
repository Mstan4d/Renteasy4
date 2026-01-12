// src/modules/providers/pages/ProviderBoostHistory.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  Eye, 
  Zap, 
  ArrowUpRight, 
  CheckCircle, 
  XCircle,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

const ProviderBoostHistory = () => {
  // Mock data - replace with API calls
  const [boosts, setBoosts] = useState([
    {
      id: 'boost-001',
      type: 'premium',
      duration: 7,
      cost: 2500,
      purchasedAt: '2024-01-15T10:30:00Z',
      startsAt: '2024-01-15T12:00:00Z',
      expiresAt: '2024-01-22T12:00:00Z',
      status: 'expired',
      marketplaceViews: 1245,
      profileViews: 289,
      inquiries: 42,
      bookings: 8,
      rankingPosition: 'top-10',
      paymentMethod: 'wallet',
      transactionId: 'TX-789456123'
    },
    {
      id: 'boost-002',
      type: 'standard',
      duration: 3,
      cost: 1200,
      purchasedAt: '2024-01-05T14:20:00Z',
      startsAt: '2024-01-05T15:00:00Z',
      expiresAt: '2024-01-08T15:00:00Z',
      status: 'expired',
      marketplaceViews: 876,
      profileViews: 156,
      inquiries: 28,
      bookings: 5,
      rankingPosition: 'top-20',
      paymentMethod: 'card',
      transactionId: 'TX-456123789'
    },
    {
      id: 'boost-003',
      type: 'premium',
      duration: 7,
      cost: 2500,
      purchasedAt: '2024-01-25T09:15:00Z',
      startsAt: '2024-01-25T10:00:00Z',
      expiresAt: '2024-02-01T10:00:00Z',
      status: 'active',
      marketplaceViews: 567,
      profileViews: 123,
      inquiries: 19,
      bookings: 3,
      rankingPosition: 'top-5',
      paymentMethod: 'wallet',
      transactionId: 'TX-321654987'
    },
    {
      id: 'boost-004',
      type: 'turbo',
      duration: 14,
      cost: 4500,
      purchasedAt: '2023-12-20T16:45:00Z',
      startsAt: '2023-12-21T00:00:00Z',
      expiresAt: '2024-01-04T00:00:00Z',
      status: 'expired',
      marketplaceViews: 1987,
      profileViews: 432,
      inquiries: 67,
      bookings: 12,
      rankingPosition: 'top-3',
      paymentMethod: 'bank_transfer',
      transactionId: 'TX-987321654'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedBoost, setSelectedBoost] = useState(null);
  const [stats, setStats] = useState({
    totalBoosts: 4,
    totalSpent: 10700,
    activeBoosts: 1,
    avgBookingsPerBoost: 7,
    avgInquiriesPerBoost: 39
  });

  // Styles object (same pattern as your other components)
  const styles = {
    container: {
      minHeight: '100vh',
      background: '#f9fafb',
      padding: '1rem'
    },
    headerContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      marginBottom: '2rem'
    },
    header: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    headerTop: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    headerTitle: {
      fontSize: '1.875rem',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '0.5rem'
    },
    headerSubtitle: {
      color: '#6b7280',
      fontSize: '1rem',
      marginBottom: '1rem'
    },
    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      flexWrap: 'wrap'
    },
    button: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s ease'
    },
    buttonSecondary: {
      background: 'white',
      border: '1px solid #d1d5db',
      color: '#374151'
    },
    buttonPrimary: {
      background: '#2563eb',
      color: 'white'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    statCard: {
      background: 'white',
      padding: '1.25rem',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      border: '1px solid #e5e7eb'
    },
    statContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    statText: {
      display: 'flex',
      flexDirection: 'column'
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '0.25rem'
    },
    statValue: {
      fontSize: '1.5rem',
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
    filtersCard: {
      background: 'white',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      border: '1px solid #e5e7eb',
      padding: '1rem',
      marginBottom: '1.5rem'
    },
    filtersContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    filterButtons: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem'
    },
    filterButton: {
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      border: '1px solid #d1d5db',
      background: '#f9fafb',
      color: '#374151',
      transition: 'all 0.2s ease'
    },
    filterButtonActive: {
      background: '#2563eb',
      color: 'white',
      borderColor: '#2563eb'
    },
    controls: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      justifyContent: 'flex-end'
    },
    selectContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    select: {
      padding: '0.5rem',
      borderRadius: '0.5rem',
      border: '1px solid #d1d5db',
      background: 'white',
      color: '#374151',
      fontSize: '0.875rem',
      cursor: 'pointer'
    },
    tableContainer: {
      background: 'white',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      marginBottom: '1.5rem'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    tableHeader: {
      background: '#f9fafb',
      borderBottom: '1px solid #e5e7eb'
    },
    tableHeaderCell: {
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
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600'
    },
    statusBadge: {
      active: { background: '#d1fae5', color: '#065f46' },
      expired: { background: '#f3f4f6', color: '#374151' }
    },
    typeBadge: {
      premium: { background: '#f3e8ff', color: '#7c3aed', border: '1px solid #ddd6fe' },
      standard: { background: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' },
      turbo: { background: '#ffedd5', color: '#9a3412', border: '1px solid #fed7aa' }
    },
    progressBar: {
      width: '100%',
      height: '0.5rem',
      background: '#e5e7eb',
      borderRadius: '9999px',
      overflow: 'hidden',
      margin: '0.5rem 0'
    },
    progressFill: {
      height: '100%',
      borderRadius: '9999px'
    },
    tipsCard: {
      background: '#eff6ff',
      border: '1px solid #bfdbfe',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      marginTop: '1.5rem'
    },
    tipsTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#1e40af',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    tipsList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    tipItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.5rem',
      marginBottom: '0.75rem',
      color: '#1e40af'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      zIndex: 50
    },
    modal: {
      background: 'white',
      borderRadius: '1rem',
      maxWidth: '800px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    modalHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.5rem',
      borderBottom: '1px solid #e5e7eb'
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#111827'
    },
    modalContent: {
      padding: '1.5rem'
    },
    modalGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    modalSection: {
      padding: '1rem 0',
      borderBottom: '1px solid #e5e7eb'
    },
    metricGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.75rem',
      marginTop: '1rem'
    },
    metricBox: {
      background: '#f9fafb',
      padding: '1rem',
      borderRadius: '0.5rem',
      textAlign: 'center'
    },
    metricValue: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '0.25rem'
    },
    metricLabel: {
      fontSize: '0.75rem',
      color: '#6b7280'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem',
      color: '#6b7280'
    },
    emptyIcon: {
      margin: '0 auto 1rem',
      color: '#d1d5db'
    }
  };

  const filters = [
    { id: 'all', label: 'All Boosts' },
    { id: 'active', label: 'Active' },
    { id: 'expired', label: 'Expired' },
    { id: 'premium', label: 'Premium' },
    { id: 'standard', label: 'Standard' },
    { id: 'turbo', label: 'Turbo' }
  ];

  const getStatusBadge = (status) => {
    const config = styles.statusBadge[status] || styles.statusBadge.expired;
    const Icon = status === 'active' ? CheckCircle : XCircle;
    
    return (
      <span style={{
        ...styles.badge,
        background: config.background,
        color: config.color
      }}>
        <Icon size={12} />
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </span>
    );
  };

  const getBoostTypeBadge = (type) => {
    const config = styles.typeBadge[type] || styles.typeBadge.standard;
    
    return (
      <span style={{
        ...styles.badge,
        background: config.background,
        color: config.color,
        border: config.border
      }}>
        <Zap size={12} />
        <span>{type.charAt(0).toUpperCase() + type.slice(1)} Boost</span>
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredBoosts = () => {
    let filtered = [...boosts];
    
    if (filter !== 'all') {
      if (['active', 'expired', 'scheduled'].includes(filter)) {
        filtered = filtered.filter(boost => boost.status === filter);
      } else {
        filtered = filtered.filter(boost => boost.type === filter);
      }
    }
    
    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.purchasedAt) - new Date(a.purchasedAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.purchasedAt) - new Date(b.purchasedAt);
      } else if (sortBy === 'cost-high') {
        return b.cost - a.cost;
      } else if (sortBy === 'cost-low') {
        return a.cost - b.cost;
      }
      return 0;
    });
    
    return filtered;
  };

  const calculateEffectiveness = (boost) => {
    // Calculate boost effectiveness score (0-100)
    const conversionRate = boost.bookings / boost.inquiries || 0;
    const viewsPerCost = boost.marketplaceViews / boost.cost;
    
    let score = 0;
    score += Math.min(conversionRate * 500, 40); // Max 40 points for conversion
    score += Math.min(viewsPerCost * 0.5, 30); // Max 30 points for views per cost
    score += boost.bookings * 5; // 5 points per booking
    score += Math.min(boost.duration * 2, 20); // Max 20 points for duration
    
    return Math.min(Math.round(score), 100);
  };

  const exportToCSV = () => {
    alert('CSV export functionality would be implemented here');
  };

  const refreshData = () => {
    alert('Refreshing data from server...');
  };

  const filteredBoosts = getFilteredBoosts();

  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <h1 style={styles.headerTitle}>Boost History</h1>
            <p style={styles.headerSubtitle}>
              Track your boost purchases and their performance in the marketplace
            </p>
            
            <div style={styles.headerActions}>
              <button
                onClick={refreshData}
                style={{
                  ...styles.button,
                  ...styles.buttonSecondary
                }}
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              
              <Link
                to="/dashboard/provider/boost"
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  textDecoration: 'none'
                }}
              >
                <Zap size={16} />
                Buy New Boost
              </Link>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statContent}>
                <div style={styles.statText}>
                  <div style={styles.statLabel}>Total Boosts</div>
                  <div style={styles.statValue}>{stats.totalBoosts}</div>
                </div>
                <div style={{ ...styles.statIcon, background: '#dbeafe' }}>
                  <Zap size={20} color="#2563eb" />
                </div>
              </div>
            </div>
            
            <div style={styles.statCard}>
              <div style={styles.statContent}>
                <div style={styles.statText}>
                  <div style={styles.statLabel}>Total Spent</div>
                  <div style={styles.statValue}>{formatCurrency(stats.totalSpent)}</div>
                </div>
                <div style={{ ...styles.statIcon, background: '#d1fae5' }}>
                  <TrendingUp size={20} color="#059669" />
                </div>
              </div>
            </div>
            
            <div style={styles.statCard}>
              <div style={styles.statContent}>
                <div style={styles.statText}>
                  <div style={styles.statLabel}>Active Boosts</div>
                  <div style={styles.statValue}>{stats.activeBoosts}</div>
                </div>
                <div style={{ ...styles.statIcon, background: '#f3e8ff' }}>
                  <Eye size={20} color="#7c3aed" />
                </div>
              </div>
            </div>
            
            <div style={styles.statCard}>
              <div style={styles.statContent}>
                <div style={styles.statText}>
                  <div style={styles.statLabel}>Avg. Bookings/Boost</div>
                  <div style={styles.statValue}>{stats.avgBookingsPerBoost}</div>
                </div>
                <div style={{ ...styles.statIcon, background: '#ffedd5' }}>
                  <ArrowUpRight size={20} color="#ea580c" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters and Controls */}
        <div style={styles.filtersCard}>
          <div style={styles.filtersContainer}>
            <div style={styles.filterButtons}>
              {filters.map((filterItem) => (
                <button
                  key={filterItem.id}
                  onClick={() => setFilter(filterItem.id)}
                  style={{
                    ...styles.filterButton,
                    ...(filter === filterItem.id && styles.filterButtonActive)
                  }}
                >
                  {filterItem.label}
                </button>
              ))}
            </div>
            
            <div style={styles.controls}>
              <div style={styles.selectContainer}>
                <Filter size={16} color="#6b7280" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={styles.select}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="cost-high">Cost: High to Low</option>
                  <option value="cost-low">Cost: Low to High</option>
                </select>
              </div>
              
              <button
                onClick={exportToCSV}
                style={{
                  ...styles.button,
                  ...styles.buttonSecondary
                }}
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>
        </div>
        
        {/* Boosts Table */}
        <div style={styles.tableContainer}>
          {filteredBoosts.length === 0 ? (
            <div style={styles.emptyState}>
              <Zap size={48} style={styles.emptyIcon} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                No boosts found
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                No boost purchases match your current filters
              </p>
              <Link
                to="/dashboard/provider/boost"
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  textDecoration: 'none'
                }}
              >
                <Zap size={16} />
                Buy Your First Boost
              </Link>
            </div>
          ) : (
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.tableHeaderCell}>Boost Details</th>
                  <th style={styles.tableHeaderCell}>Duration</th>
                  <th style={styles.tableHeaderCell}>Performance</th>
                  <th style={styles.tableHeaderCell}>Cost</th>
                  <th style={styles.tableHeaderCell}>Status</th>
                  <th style={styles.tableHeaderCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBoosts.map((boost) => {
                  const effectiveness = calculateEffectiveness(boost);
                  const progressColor = effectiveness >= 70 ? '#10b981' : 
                                      effectiveness >= 40 ? '#f59e0b' : '#ef4444';
                  
                  return (
                    <tr key={boost.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            {getBoostTypeBadge(boost.type)}
                            {getStatusBadge(boost.status)}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            Purchased: {formatDateTime(boost.purchasedAt)}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>
                            {boost.transactionId}
                          </div>
                        </div>
                      </td>
                      
                      <td style={styles.tableCell}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Calendar size={16} color="#6b7280" />
                          <div>
                            <div style={{ fontWeight: '500' }}>{boost.duration} days</div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                              {formatDate(boost.startsAt)} - {formatDate(boost.expiresAt)}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td style={styles.tableCell}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Effectiveness</span>
                            <span style={{ fontWeight: '500' }}>{effectiveness}%</span>
                          </div>
                          <div style={styles.progressBar}>
                            <div style={{
                              ...styles.progressFill,
                              width: `${effectiveness}%`,
                              background: progressColor
                            }} />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.75rem' }}>
                            <div>
                              <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{boost.bookings}</div>
                              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Bookings</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{boost.inquiries}</div>
                              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Inquiries</div>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td style={styles.tableCell}>
                        <div style={{ fontSize: '1.125rem', fontWeight: '700' }}>
                          {formatCurrency(boost.cost)}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'capitalize' }}>
                          Paid via {boost.paymentMethod.replace('_', ' ')}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                          Ranked: <span style={{ fontWeight: '500' }}>{boost.rankingPosition}</span>
                        </div>
                      </td>
                      
                      <td style={styles.tableCell}>
                        <div>
                          {getStatusBadge(boost.status)}
                          <div style={{ marginTop: '0.5rem' }}>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                              Views: <span style={{ fontWeight: '500' }}>{boost.marketplaceViews}</span>
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                              Profile: <span style={{ fontWeight: '500' }}>{boost.profileViews}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td style={styles.tableCell}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <button
                            onClick={() => setSelectedBoost(boost)}
                            style={{
                              ...styles.button,
                              ...styles.buttonSecondary,
                              padding: '0.5rem',
                              fontSize: '0.75rem'
                            }}
                          >
                            View Details
                          </button>
                          
                          {boost.status === 'expired' && (
                            <Link
                              to="/dashboard/provider/boost"
                              style={{
                                ...styles.button,
                                background: '#dbeafe',
                                color: '#1e40af',
                                border: '1px solid #bfdbfe',
                                padding: '0.5rem',
                                fontSize: '0.75rem',
                                textDecoration: 'none',
                                textAlign: 'center'
                              }}
                            >
                              Renew
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Tips Card */}
        <div style={styles.tipsCard}>
          <h3 style={styles.tipsTitle}>
            <Zap size={20} />
            Boost Performance Tips
          </h3>
          <ul style={styles.tipsList}>
            <li style={styles.tipItem}>
              <CheckCircle size={16} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <span>Boost moves your profile higher in marketplace search results</span>
            </li>
            <li style={styles.tipItem}>
              <CheckCircle size={16} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <span>Boost is independent of verification - both verified and unverified providers can purchase</span>
            </li>
            <li style={styles.tipItem}>
              <CheckCircle size={16} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <span>Premium boosts provide better visibility and longer duration</span>
            </li>
            <li style={styles.tipItem}>
              <CheckCircle size={16} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <span>Boost effectiveness depends on your profile completeness and service quality</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Boost Details Modal */}
      {selectedBoost && (
        <div style={styles.modalOverlay} onClick={() => setSelectedBoost(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Boost Details</h2>
              <button
                onClick={() => setSelectedBoost(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#6b7280' }}
              >
                ✕
              </button>
            </div>
            
            <div style={styles.modalContent}>
              <div style={styles.modalGrid}>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Boost Type</div>
                  <div>{getBoostTypeBadge(selectedBoost.type)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Status</div>
                  <div>{getStatusBadge(selectedBoost.status)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Duration</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>{selectedBoost.duration} days</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Cost</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>{formatCurrency(selectedBoost.cost)}</div>
                </div>
              </div>
              
              <div style={styles.modalSection}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Timeline</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Purchased:</span>
                    <span style={{ fontWeight: '500' }}>{formatDateTime(selectedBoost.purchasedAt)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Started:</span>
                    <span style={{ fontWeight: '500' }}>{formatDateTime(selectedBoost.startsAt)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Expired:</span>
                    <span style={{ fontWeight: '500' }}>{formatDateTime(selectedBoost.expiresAt)}</span>
                  </div>
                </div>
              </div>
              
              <div style={styles.modalSection}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Performance Metrics</h3>
                <div style={styles.metricGrid}>
                  <div style={styles.metricBox}>
                    <div style={styles.metricValue}>{selectedBoost.marketplaceViews}</div>
                    <div style={styles.metricLabel}>Marketplace Views</div>
                  </div>
                  <div style={styles.metricBox}>
                    <div style={styles.metricValue}>{selectedBoost.profileViews}</div>
                    <div style={styles.metricLabel}>Profile Views</div>
                  </div>
                  <div style={styles.metricBox}>
                    <div style={styles.metricValue}>{selectedBoost.inquiries}</div>
                    <div style={styles.metricLabel}>Inquiries</div>
                  </div>
                  <div style={styles.metricBox}>
                    <div style={styles.metricValue}>{selectedBoost.bookings}</div>
                    <div style={styles.metricLabel}>Bookings</div>
                  </div>
                </div>
              </div>
              
              <div style={{ paddingTop: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Transaction Details</h3>
                <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '0.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Transaction ID:</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: '500' }}>{selectedBoost.transactionId}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Payment Method:</span>
                      <span style={{ textTransform: 'capitalize' }}>{selectedBoost.paymentMethod.replace('_', ' ')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Ranking Position:</span>
                      <span style={{ fontWeight: '500' }}>{selectedBoost.rankingPosition}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                <button
                  onClick={() => setSelectedBoost(null)}
                  style={{
                    ...styles.button,
                    ...styles.buttonSecondary
                  }}
                >
                  Close
                </button>
                {selectedBoost.status === 'expired' && (
                  <Link
                    to="/dashboard/provider/boost"
                    style={{
                      ...styles.button,
                      ...styles.buttonPrimary,
                      textDecoration: 'none'
                    }}
                  >
                    Renew Boost
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderBoostHistory;