// src/modules/providers/pages/ProviderAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Users, Calendar, 
  DollarSign, Briefcase, Clock, Award,
  BarChart3, PieChart, LineChart, Eye,
  Download, Filter, RefreshCw, MoreVertical,
  ChevronUp, ChevronDown, Target, Star,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';

const ProviderAnalytics = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [loading, setLoading] = useState(false);

  // Mock analytics data
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalBookings: 128,
      completedBookings: 112,
      cancelledBookings: 16,
      totalRevenue: 1256000,
      avgRating: 4.7,
      responseRate: 92,
      conversionRate: 18.5,
      repeatCustomers: 42
    },
    trends: {
      bookings: [65, 59, 80, 81, 56, 55, 40, 85, 92, 78, 88, 95],
      revenue: [120000, 140000, 160000, 180000, 200000, 220000, 180000, 240000, 260000, 240000, 280000, 300000],
      ratings: [4.5, 4.6, 4.7, 4.8, 4.7, 4.9, 4.8, 4.9, 4.8, 4.9, 4.9, 5.0]
    },
    servicePerformance: [
      { id: 1, name: 'Professional Cleaning', bookings: 45, revenue: 450000, rating: 4.9, completionRate: 98 },
      { id: 2, name: 'Painting Services', bookings: 32, revenue: 320000, rating: 4.7, completionRate: 94 },
      { id: 3, name: 'Plumbing Services', bookings: 28, revenue: 280000, rating: 4.8, completionRate: 96 },
      { id: 4, name: 'Electrical Works', bookings: 15, revenue: 150000, rating: 4.6, completionRate: 92 },
      { id: 5, name: 'Carpentry', bookings: 8, revenue: 56000, rating: 4.5, completionRate: 90 }
    ],
    customerInsights: {
      newCustomers: 86,
      returningCustomers: 42,
      topCustomerCities: ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Enugu'],
      peakBookingHours: ['9AM-11AM', '2PM-4PM', '6PM-8PM'],
      customerSources: [
        { source: 'Marketplace', percentage: 65 },
        { source: 'Direct Referral', percentage: 20 },
        { source: 'Social Media', percentage: 10 },
        { source: 'Other', percentage: 5 }
      ]
    },
    financials: {
      totalEarnings: 1256000,
      pendingPayouts: 184000,
      paidOut: 1072000,
      commissionDeducted: 125600,
      averageBookingValue: 9812.5,
      topEarningMonth: 'December 2023'
    },
    goals: {
      monthlyTarget: 1500000,
      currentProgress: 1256000,
      bookingTarget: 150,
      currentBookings: 128,
      ratingTarget: 4.8,
      currentRating: 4.7
    }
  });

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '1.5rem'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem'
    },
    titleSection: {
      flex: 1
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
      gap: '1rem',
      alignItems: 'center'
    },
    timeRangeSelect: {
      padding: '0.5rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      background: 'white',
      color: '#374151',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer'
    },
    refreshButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      border: '1px solid #d1d5db',
      background: 'white',
      borderRadius: '0.5rem',
      color: '#374151',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    exportButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      border: 'none',
      background: '#2563eb',
      borderRadius: '0.5rem',
      color: 'white',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    metricsTabs: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1.5rem',
      overflowX: 'auto',
      paddingBottom: '0.5rem'
    },
    metricTab: {
      padding: '0.75rem 1.5rem',
      border: '1px solid #e5e7eb',
      background: 'white',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#6b7280',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition: 'all 0.2s ease'
    },
    metricTabActive: {
      background: '#2563eb',
      color: 'white',
      borderColor: '#2563eb'
    },
    overviewGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    metricCard: {
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      transition: 'all 0.3s ease'
    },
    metricHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem'
    },
    metricIcon: {
      width: '3rem',
      height: '3rem',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    metricTitle: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '0.5rem'
    },
    metricValue: {
      fontSize: '1.875rem',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '0.25rem'
    },
    metricChange: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    changePositive: {
      color: '#059669'
    },
    changeNegative: {
      color: '#dc2626'
    },
    changeNeutral: {
      color: '#6b7280'
    },
    chartsSection: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    chartCard: {
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '0.75rem',
      padding: '1.5rem'
    },
    chartHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem'
    },
    chartTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#111827'
    },
    chartContainer: {
      height: '250px',
      position: 'relative'
    },
    chartPlaceholder: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: '#9ca3af'
    },
    performanceTable: {
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '0.75rem',
      overflow: 'hidden',
      marginBottom: '2rem'
    },
    tableHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.5rem',
      borderBottom: '1px solid #e5e7eb'
    },
    tableTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#111827'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    tableRow: {
      borderBottom: '1px solid #e5e7eb',
      transition: 'background-color 0.2s ease'
    },
    tableCell: {
      padding: '1rem 1.5rem',
      textAlign: 'left',
      fontSize: '0.875rem'
    },
    tableHeaderCell: {
      fontWeight: '600',
      color: '#374151',
      background: '#f9fafb'
    },
    ratingBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.25rem 0.5rem',
      background: '#fef3c7',
      color: '#92400e',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600'
    },
    completionBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.25rem 0.5rem',
      background: '#d1fae5',
      color: '#065f46',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600'
    },
    insightsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    insightCard: {
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '0.75rem',
      padding: '1.5rem'
    },
    insightTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '1rem'
    },
    insightList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    insightItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem 0',
      borderBottom: '1px solid #f3f4f6'
    },
    insightLabel: {
      color: '#6b7280',
      fontSize: '0.875rem'
    },
    insightValue: {
      fontWeight: '600',
      color: '#111827'
    },
    sourceChart: {
      marginTop: '1rem'
    },
    sourceItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '0.75rem'
    },
    sourceLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    sourcePercentage: {
      fontWeight: '600',
      color: '#111827'
    },
    progressBar: {
      height: '0.5rem',
      background: '#e5e7eb',
      borderRadius: '9999px',
      overflow: 'hidden',
      marginTop: '0.25rem'
    },
    progressFill: {
      height: '100%',
      background: '#2563eb',
      borderRadius: '9999px'
    },
    goalsCard: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      color: 'white',
      marginBottom: '2rem'
    },
    goalsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem'
    },
    goalsTitle: {
      fontSize: '1.125rem',
      fontWeight: '600'
    },
    goalItem: {
      marginBottom: '1.5rem'
    },
    goalLabel: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.5rem',
      fontSize: '0.875rem',
      opacity: 0.9
    },
    goalProgress: {
      height: '0.5rem',
      background: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '9999px',
      overflow: 'hidden'
    },
    goalProgressFill: {
      height: '100%',
      background: 'white',
      borderRadius: '9999px'
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px'
    },
    loadingSpinner: {
      border: '3px solid #f3f4f6',
      borderTop: '3px solid #2563eb',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      animation: 'spin 1s linear infinite'
    },
    '@keyframes spin': {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' }
    }
  };

  // Chart data generators
  const generateBookingChart = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return (
      <div style={styles.chartContainer}>
        <div style={styles.chartPlaceholder}>
          <BarChart3 size={48} />
          <p>Bookings Trend Chart</p>
          <small>Last 12 months: {analyticsData.trends.bookings.join(', ')}</small>
        </div>
      </div>
    );
  };

  const generateRevenueChart = () => {
    return (
      <div style={styles.chartContainer}>
        <div style={styles.chartPlaceholder}>
          <LineChart size={48} />
          <p>Revenue Trend Chart</p>
          <small>Total: ₦{analyticsData.trends.revenue.reduce((a, b) => a + b, 0).toLocaleString()}</small>
        </div>
      </div>
    );
  };

  const generateSourceChart = () => {
    return (
      <div style={styles.chartContainer}>
        <div style={styles.chartPlaceholder}>
          <PieChart size={48} />
          <p>Customer Sources</p>
          <small>Marketplace: 65%, Direct: 20%, Social: 10%</small>
        </div>
      </div>
    );
  };

  const metricTabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
    { id: 'performance', label: 'Performance', icon: <TrendingUp size={16} /> },
    { id: 'customers', label: 'Customers', icon: <Users size={16} /> },
    { id: 'financial', label: 'Financial', icon: <DollarSign size={16} /> },
    { id: 'goals', label: 'Goals', icon: <Target size={16} /> }
  ];

  const metrics = [
    {
      id: 'bookings',
      title: 'Total Bookings',
      value: analyticsData.overview.totalBookings,
      change: '+12.5%',
      isPositive: true,
      icon: <Calendar size={24} />,
      iconBg: '#dbeafe',
      iconColor: '#2563eb'
    },
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: `₦${analyticsData.overview.totalRevenue.toLocaleString()}`,
      change: '+18.2%',
      isPositive: true,
      icon: <DollarSign size={24} />,
      iconBg: '#d1fae5',
      iconColor: '#059669'
    },
    {
      id: 'rating',
      title: 'Average Rating',
      value: analyticsData.overview.avgRating,
      change: '+0.2',
      isPositive: true,
      icon: <Star size={24} />,
      iconBg: '#fef3c7',
      iconColor: '#d97706'
    },
    {
      id: 'conversion',
      title: 'Conversion Rate',
      value: `${analyticsData.overview.conversionRate}%`,
      change: '+2.1%',
      isPositive: true,
      icon: <TrendingUp size={24} />,
      iconBg: '#f3e8ff',
      iconColor: '#7c3aed'
    },
    {
      id: 'response',
      title: 'Response Rate',
      value: `${analyticsData.overview.responseRate}%`,
      change: '-1.5%',
      isPositive: false,
      icon: <Clock size={24} />,
      iconBg: '#ffe4e6',
      iconColor: '#e11d48'
    },
    {
      id: 'repeat',
      title: 'Repeat Customers',
      value: analyticsData.overview.repeatCustomers,
      change: '+8',
      isPositive: true,
      icon: <Users size={24} />,
      iconBg: '#e0f2fe',
      iconColor: '#0284c7'
    }
  ];

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // In a real app, this would fetch fresh data
      console.log('Analytics data refreshed');
    }, 1000);
  };

  const handleExport = () => {
    // In a real app, this would export data
    alert('Exporting analytics data...');
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <h1 style={styles.title}>Analytics Dashboard</h1>
          <p style={styles.subtitle}>
            Track your performance, bookings, and revenue insights
          </p>
        </div>
        
        <div style={styles.controls}>
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={styles.timeRangeSelect}
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="quarter">Last 3 months</option>
            <option value="year">Last 12 months</option>
          </select>
          
          <button 
            onClick={handleRefresh}
            style={styles.refreshButton}
            disabled={loading}
          >
            <RefreshCw size={16} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          
          <button 
            onClick={handleExport}
            style={styles.exportButton}
          >
            <Download size={16} />
            Export Data
          </button>
        </div>
      </div>

      {/* Metrics Tabs */}
      <div style={styles.metricsTabs}>
        {metricTabs.map((tab) => (
          <button
            key={tab.id}
            style={{
              ...styles.metricTab,
              ...(selectedMetric === tab.id && styles.metricTabActive)
            }}
            onClick={() => setSelectedMetric(tab.id)}
          >
            {tab.icon}
            <span style={{ marginLeft: '0.5rem' }}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Metrics Grid */}
      {selectedMetric === 'overview' && (
        <>
          <div style={styles.overviewGrid}>
            {metrics.map((metric) => (
              <div key={metric.id} style={styles.metricCard}>
                <div style={styles.metricHeader}>
                  <div style={{
                    ...styles.metricIcon,
                    background: metric.iconBg
                  }}>
                    <div style={{ color: metric.iconColor }}>
                      {metric.icon}
                    </div>
                  </div>
                  <div style={{
                    ...styles.metricChange,
                    ...(metric.isPositive ? styles.changePositive : styles.changeNegative)
                  }}>
                    {metric.isPositive ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {metric.change}
                  </div>
                </div>
                <div style={styles.metricTitle}>{metric.title}</div>
                <div style={styles.metricValue}>{metric.value}</div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div style={styles.chartsSection}>
            <div style={styles.chartCard}>
              <div style={styles.chartHeader}>
                <h3 style={styles.chartTitle}>Bookings Trend</h3>
                <Filter size={16} color="#6b7280" />
              </div>
              {generateBookingChart()}
            </div>
            
            <div style={styles.chartCard}>
              <div style={styles.chartHeader}>
                <h3 style={styles.chartTitle}>Revenue Growth</h3>
                <Filter size={16} color="#6b7280" />
              </div>
              {generateRevenueChart()}
            </div>
          </div>

          {/* Service Performance Table */}
          <div style={styles.performanceTable}>
            <div style={styles.tableHeader}>
              <h3 style={styles.tableTitle}>Service Performance</h3>
              <MoreVertical size={20} color="#6b7280" />
            </div>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableRow}>
                  <th style={{ ...styles.tableCell, ...styles.tableHeaderCell }}>Service</th>
                  <th style={{ ...styles.tableCell, ...styles.tableHeaderCell }}>Bookings</th>
                  <th style={{ ...styles.tableCell, ...styles.tableHeaderCell }}>Revenue</th>
                  <th style={{ ...styles.tableCell, ...styles.tableHeaderCell }}>Rating</th>
                  <th style={{ ...styles.tableCell, ...styles.tableHeaderCell }}>Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.servicePerformance.map((service) => (
                  <tr key={service.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <div style={{ fontWeight: '500' }}>{service.name}</div>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={{ fontWeight: '600', color: '#111827' }}>
                        {service.bookings}
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={{ fontWeight: '600', color: '#059669' }}>
                        ₦{service.revenue.toLocaleString()}
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={styles.ratingBadge}>
                        <Star size={12} />
                        {service.rating}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={styles.completionBadge}>
                        <CheckCircle size={12} />
                        {service.completionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Customer Insights */}
          <div style={styles.insightsGrid}>
            <div style={styles.insightCard}>
              <h3 style={styles.insightTitle}>Customer Demographics</h3>
              <ul style={styles.insightList}>
                <li style={styles.insightItem}>
                  <span style={styles.insightLabel}>New Customers</span>
                  <span style={styles.insightValue}>
                    {analyticsData.customerInsights.newCustomers}
                  </span>
                </li>
                <li style={styles.insightItem}>
                  <span style={styles.insightLabel}>Returning Customers</span>
                  <span style={styles.insightValue}>
                    {analyticsData.customerInsights.returningCustomers}
                  </span>
                </li>
                <li style={styles.insightItem}>
                  <span style={styles.insightLabel}>Top Cities</span>
                  <span style={styles.insightValue}>
                    {analyticsData.customerInsights.topCustomerCities.slice(0, 3).join(', ')}
                  </span>
                </li>
                <li style={styles.insightItem}>
                  <span style={styles.insightLabel}>Peak Hours</span>
                  <span style={styles.insightValue}>
                    {analyticsData.customerInsights.peakBookingHours.join(', ')}
                  </span>
                </li>
              </ul>
            </div>

            <div style={styles.insightCard}>
              <h3 style={styles.insightTitle}>Customer Sources</h3>
              <div style={styles.sourceChart}>
                {analyticsData.customerInsights.customerSources.map((source, index) => (
                  <div key={index} style={styles.sourceItem}>
                    <div style={styles.sourceLabel}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '2px',
                        background: index === 0 ? '#2563eb' : 
                                   index === 1 ? '#059669' : 
                                   index === 2 ? '#7c3aed' : '#6b7280'
                      }} />
                      <span>{source.source}</span>
                    </div>
                    <span style={styles.sourcePercentage}>{source.percentage}%</span>
                  </div>
                ))}
              </div>
              <div style={styles.sourceChart}>
                {analyticsData.customerInsights.customerSources.map((source, index) => (
                  <div key={index} style={{ marginBottom: '0.5rem' }}>
                    <div style={{
                      ...styles.progressBar,
                      marginTop: '0.25rem'
                    }}>
                      <div style={{
                        ...styles.progressFill,
                        width: `${source.percentage}%`,
                        background: index === 0 ? '#2563eb' : 
                                   index === 1 ? '#059669' : 
                                   index === 2 ? '#7c3aed' : '#6b7280'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.insightCard}>
              <h3 style={styles.insightTitle}>Financial Summary</h3>
              <ul style={styles.insightList}>
                <li style={styles.insightItem}>
                  <span style={styles.insightLabel}>Total Earnings</span>
                  <span style={{ ...styles.insightValue, color: '#059669' }}>
                    ₦{analyticsData.financials.totalEarnings.toLocaleString()}
                  </span>
                </li>
                <li style={styles.insightItem}>
                  <span style={styles.insightLabel}>Pending Payouts</span>
                  <span style={{ ...styles.insightValue, color: '#d97706' }}>
                    ₦{analyticsData.financials.pendingPayouts.toLocaleString()}
                  </span>
                </li>
                <li style={styles.insightItem}>
                  <span style={styles.insightLabel}>Paid Out</span>
                  <span style={{ ...styles.insightValue, color: '#2563eb' }}>
                    ₦{analyticsData.financials.paidOut.toLocaleString()}
                  </span>
                </li>
                <li style={styles.insightItem}>
                  <span style={styles.insightLabel}>Avg Booking Value</span>
                  <span style={styles.insightValue}>
                    ₦{analyticsData.financials.averageBookingValue.toLocaleString()}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Goals Card */}
          <div style={styles.goalsCard}>
            <div style={styles.goalsHeader}>
              <h3 style={styles.goalsTitle}>Monthly Goals Progress</h3>
              <Target size={20} />
            </div>
            
            <div style={styles.goalItem}>
              <div style={styles.goalLabel}>
                <span>Revenue Target</span>
                <span>
                  ₦{analyticsData.goals.currentProgress.toLocaleString()} / 
                  ₦{analyticsData.goals.monthlyTarget.toLocaleString()}
                </span>
              </div>
              <div style={styles.goalProgress}>
                <div style={{
                  ...styles.goalProgressFill,
                  width: `${(analyticsData.goals.currentProgress / analyticsData.goals.monthlyTarget) * 100}%`
                }} />
              </div>
            </div>
            
            <div style={styles.goalItem}>
              <div style={styles.goalLabel}>
                <span>Booking Target</span>
                <span>
                  {analyticsData.goals.currentBookings} / {analyticsData.goals.bookingTarget}
                </span>
              </div>
              <div style={styles.goalProgress}>
                <div style={{
                  ...styles.goalProgressFill,
                  width: `${(analyticsData.goals.currentBookings / analyticsData.goals.bookingTarget) * 100}%`
                }} />
              </div>
            </div>
            
            <div style={styles.goalItem}>
              <div style={styles.goalLabel}>
                <span>Rating Target</span>
                <span>
                  {analyticsData.goals.currentRating} / {analyticsData.goals.ratingTarget}
                </span>
              </div>
              <div style={styles.goalProgress}>
                <div style={{
                  ...styles.goalProgressFill,
                  width: `${(analyticsData.goals.currentRating / analyticsData.goals.ratingTarget) * 100}%`
                }} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Other metric views can be added here */}
      {selectedMetric !== 'overview' && (
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>
              {metricTabs.find(t => t.id === selectedMetric)?.label} Analytics
            </h3>
          </div>
          <div style={styles.chartContainer}>
            <div style={styles.chartPlaceholder}>
              <BarChart3 size={48} />
              <p>{metricTabs.find(t => t.id === selectedMetric)?.label} View</p>
              <small>Detailed analytics for this category coming soon</small>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 50
        }}>
          <div style={styles.loadingSpinner}></div>
        </div>
      )}

      {/* Add CSS animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ProviderAnalytics;