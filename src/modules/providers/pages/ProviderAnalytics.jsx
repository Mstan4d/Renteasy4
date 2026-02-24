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
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';

const ProviderAnalytics = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      totalRevenue: 0,
      avgRating: 0,
      responseRate: 0,
      conversionRate: 0,
      repeatCustomers: 0
    },
    trends: {
      bookings: [],
      revenue: [],
      ratings: []
    },
    servicePerformance: [],
    customerInsights: {
      newCustomers: 0,
      returningCustomers: 0,
      topCustomerCities: [],
      peakBookingHours: [],
      customerSources: []
    },
    financials: {
      totalEarnings: 0,
      pendingPayouts: 0,
      paidOut: 0,
      commissionDeducted: 0,
      averageBookingValue: 0,
      topEarningMonth: ''
    },
    goals: {
      monthlyTarget: 1500000,
      currentProgress: 0,
      bookingTarget: 150,
      currentBookings: 0,
      ratingTarget: 4.8,
      currentRating: 0
    }
  });

  // Fetch analytics data when timeRange changes
  useEffect(() => {
    if (!user) return;
    fetchAnalyticsData();
  }, [user, timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);

    try {
      const providerId = user.id;

      // Determine date range based on timeRange
      const now = new Date();
      let startDate;
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
          startDate = new Date(now.setMonth(now.getMonth() - 1));
      }
      const startISO = startDate.toISOString();

      // 1. Fetch service_requests (bookings) for this provider
      const { data: bookings, error: bookingsError } = await supabase
        .from('service_requests')
        .select('id, status, amount, created_at, client_id, service_type')
        .eq('provider_id', providerId)
        .gte('created_at', startISO);

      if (bookingsError) throw bookingsError;

      const totalBookings = bookings?.length || 0;
      const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;
      const cancelledBookings = bookings?.filter(b => b.status === 'cancelled').length || 0;
      const totalRevenue = bookings
        ?.filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.amount || 0), 0) || 0;

      // 2. Fetch provider_reviews for ratings
      const { data: reviews, error: reviewsError } = await supabase
        .from('provider_reviews')
        .select('rating, created_at')
        .eq('provider_id', providerId)
        .gte('created_at', startISO);

      if (reviewsError) throw reviewsError;

      const avgRating = reviews?.length
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
        : 0;

      // 3. Customer insights: unique clients, repeat customers
      const clientIds = [...new Set(bookings?.map(b => b.client_id).filter(Boolean) || [])];
      const repeatCustomers = clientIds.filter(id => 
        bookings?.filter(b => b.client_id === id).length > 1
      ).length;
      const newCustomers = clientIds.length - repeatCustomers;

      // 4. Service performance (group by service_type)
      const serviceMap = {};
      bookings?.forEach(b => {
        const serviceType = b.service_type || 'Other';
        if (!serviceMap[serviceType]) {
          serviceMap[serviceType] = { bookings: 0, revenue: 0, completed: 0 };
        }
        serviceMap[serviceType].bookings++;
        if (b.status === 'completed') {
          serviceMap[serviceType].revenue += b.amount || 0;
          serviceMap[serviceType].completed++;
        }
      });

      const servicePerformance = Object.entries(serviceMap).map(([name, stats], idx) => ({
        id: idx,
        name,
        bookings: stats.bookings,
        revenue: stats.revenue,
        rating: 4.5, // placeholder – you'd need average rating per service
        completionRate: stats.bookings ? Math.round((stats.completed / stats.bookings) * 100) : 0
      }));

      // 5. Trends (monthly over last 12 months)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyBookings = new Array(12).fill(0);
      const monthlyRevenue = new Array(12).fill(0);
      const monthlyRatings = new Array(12).fill(0).map(() => []);

      bookings?.forEach(b => {
        const month = new Date(b.created_at).getMonth();
        monthlyBookings[month]++;
        if (b.status === 'completed') {
          monthlyRevenue[month] += b.amount || 0;
        }
      });

      reviews?.forEach(r => {
        const month = new Date(r.created_at).getMonth();
        monthlyRatings[month].push(r.rating);
      });

      const avgMonthlyRatings = monthlyRatings.map(arr => 
        arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
      );

      // 6. Financials (placeholder for pending/paid)
      const pendingPayouts = 0;
      const paidOut = totalRevenue * 0.9; // assuming 10% commission
      const commissionDeducted = totalRevenue * 0.1;
      const averageBookingValue = totalBookings ? totalRevenue / totalBookings : 0;
      const topEarningMonth = ''; // could be computed

      // 7. Customer sources (example, could be real from tracking)
      const customerSources = [
        { source: 'Marketplace', percentage: 65 },
        { source: 'Direct Referral', percentage: 20 },
        { source: 'Social Media', percentage: 10 },
        { source: 'Other', percentage: 5 }
      ];

      // 8. Goals
      const currentProgress = totalRevenue;
      const currentBookings = totalBookings;
      const currentRating = avgRating;

      // 9. Top cities from client profiles
      let cities = [];
      if (clientIds.length > 0) {
        const { data: clients, error: clientError } = await supabase
          .from('profiles')
          .select('city')
          .in('id', clientIds);

        if (!clientError && clients) {
          const cityCounts = {};
          clients.forEach(c => {
            if (c.city) cityCounts[c.city] = (cityCounts[c.city] || 0) + 1;
          });
          cities = Object.entries(cityCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([city]) => city);
        }
      }

      // 10. Peak booking hours
      const hours = bookings?.map(b => new Date(b.created_at).getHours()) || [];
      const hourCounts = new Array(24).fill(0);
      hours.forEach(h => hourCounts[h]++);
      const peakHours = hourCounts
        .map((count, hour) => ({ hour, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map(({ hour }) => `${hour}:00-${hour+1}:00`);

      // Update state
      setAnalyticsData({
        overview: {
          totalBookings,
          completedBookings,
          cancelledBookings,
          totalRevenue,
          avgRating: parseFloat(avgRating.toFixed(1)),
          responseRate: 92, // placeholder
          conversionRate: 18.5, // placeholder
          repeatCustomers
        },
        trends: {
          bookings: monthlyBookings,
          revenue: monthlyRevenue,
          ratings: avgMonthlyRatings
        },
        servicePerformance,
        customerInsights: {
          newCustomers,
          returningCustomers: repeatCustomers,
          topCustomerCities: cities,
          peakBookingHours: peakHours,
          customerSources
        },
        financials: {
          totalEarnings: totalRevenue,
          pendingPayouts,
          paidOut,
          commissionDeducted,
          averageBookingValue,
          topEarningMonth
        },
        goals: {
          monthlyTarget: 1500000,
          currentProgress,
          bookingTarget: 150,
          currentBookings,
          ratingTarget: 4.8,
          currentRating
        }
      });

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => fetchAnalyticsData();
  const handleExport = () => alert('Export functionality coming soon');

  // ========== Styles (keep exactly as provided) ==========
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

  // Chart placeholder generators (keep as is)
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
                  {analyticsData.goals.currentRating.toFixed(1)} / {analyticsData.goals.ratingTarget}
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

      {/* Other metric views */}
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

      {/* CSS animation */}
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