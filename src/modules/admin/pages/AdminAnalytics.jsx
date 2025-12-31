// src/modules/admin/pages/AdminAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import {
  BarChart3, TrendingUp, Users, Home, DollarSign, 
  Download, Calendar, Filter, RefreshCw, Shield,
  Building, MessageSquare, Eye, Clock
} from 'lucide-react';
import './AdminStyles.css';

const AdminAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    overview: {},
    growth: {},
    revenue: {},
    userStats: {},
    platformHealth: {}
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days'); // 7days, 30days, 90days, 1year
  const [selectedMetric, setSelectedMetric] = useState('all');

  useEffect(() => {
    if (user?.role !== 'admin') return;
    loadAnalytics();
  }, [user, timeRange]);

  const loadAnalytics = () => {
    try {
      setLoading(true);
      
      // Load all data
      const users = JSON.parse(localStorage.getItem('rentEasyUsers') || '[]');
      const listings = JSON.parse(localStorage.getItem('listings') || '[]');
      const providers = JSON.parse(localStorage.getItem('serviceProviders') || '[]');
      const managers = JSON.parse(localStorage.getItem('managers') || '[]');
      const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
      
      // Calculate analytics based on time range
      const filteredData = filterByTimeRange(users, listings, providers, managers, timeRange);
      
      const overview = calculateOverview(filteredData);
      const growth = calculateGrowth(filteredData, timeRange);
      const revenue = calculateRevenue(filteredData);
      const userStats = calculateUserStats(filteredData);
      const platformHealth = calculatePlatformHealth(filteredData, activities);
      
      setAnalytics({
        overview,
        growth,
        revenue,
        userStats,
        platformHealth
      });
      
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterByTimeRange = (users, listings, providers, managers, range) => {
    const now = new Date();
    let startDate = new Date();
    
    switch(range) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }
    
    return {
      users: users.filter(u => new Date(u.createdAt) >= startDate),
      listings: listings.filter(l => new Date(l.postedDate) >= startDate),
      providers: providers.filter(p => new Date(p.createdAt) >= startDate),
      managers: managers.filter(m => new Date(m.createdAt) >= startDate)
    };
  };

  const calculateOverview = (data) => {
    return {
      totalUsers: data.users.length,
      totalListings: data.listings.length,
      totalProviders: data.providers.length + data.managers.length,
      activeListings: data.listings.filter(l => !l.rejected).length,
      verifiedUsers: data.users.filter(u => u.verified).length,
      verifiedListings: data.listings.filter(l => l.verified).length
    };
  };

  const calculateGrowth = (data, range) => {
    // Simplified growth calculation
    const previousPeriodData = getPreviousPeriodData(range);
    
    const userGrowth = calculatePercentageChange(
      data.users.length,
      previousPeriodData.users
    );
    
    const listingGrowth = calculatePercentageChange(
      data.listings.length,
      previousPeriodData.listings
    );
    
    const revenueGrowth = calculatePercentageChange(
      calculateTotalValue(data.listings),
      calculateTotalValue(previousPeriodData.listings)
    );
    
    return {
      userGrowth,
      listingGrowth,
      revenueGrowth,
      activeGrowth: 12.5 // Mock data
    };
  };

  const calculateRevenue = (data) => {
    const totalValue = data.listings.reduce((sum, l) => sum + (parseFloat(l.price) || 0), 0);
    const commission = totalValue * 0.02; // 2% commission
    
    return {
      totalValue,
      commission,
      avgTransaction: data.listings.length > 0 ? totalValue / data.listings.length : 0,
      projectedMonthly: commission * 30
    };
  };

  const calculateUserStats = (data) => {
    const userRoles = {
      tenant: data.users.filter(u => u.role === 'tenant').length,
      landlord: data.users.filter(u => u.role === 'landlord').length,
      manager: data.users.filter(u => u.role === 'manager').length,
      estate: data.users.filter(u => u.role === 'estate-firm').length,
      admin: data.users.filter(u => u.role === 'admin').length
    };
    
    return {
      roles: userRoles,
      activePercentage: Math.round((data.users.filter(u => !u.isSuspended).length / data.users.length) * 100) || 0,
      verificationRate: Math.round((data.users.filter(u => u.verified).length / data.users.length) * 100) || 0,
      avgSessionDuration: '4m 32s' // Mock data
    };
  };

  const calculatePlatformHealth = (data, activities) => {
    const pendingVerifications = data.users.filter(u => u.needsVerification).length;
    const pendingListings = data.listings.filter(l => !l.verified && !l.rejected).length;
    
    return {
      score: calculateHealthScore(data),
      pendingVerifications,
      pendingListings,
      recentActivities: activities.length,
      avgResponseTime: '2.4 hours', // Mock data
      satisfactionScore: '4.7/5.0' // Mock data
    };
  };

  const calculateHealthScore = (data) => {
    let score = 100;
    
    // Deduct for unverified users
    const unverifiedUsers = data.users.filter(u => !u.verified).length;
    score -= (unverifiedUsers / data.users.length) * 30;
    
    // Deduct for rejected listings
    const rejectedListings = data.listings.filter(l => l.rejected).length;
    score -= (rejectedListings / data.listings.length) * 40;
    
    // Deduct for inactive providers
    const inactiveProviders = data.providers.filter(p => p.status === 'rejected').length;
    score -= (inactiveProviders / data.providers.length) * 30;
    
    return Math.max(0, Math.round(score));
  };

  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const getPreviousPeriodData = (range) => {
    // Return mock previous period data
    return {
      users: 50,
      listings: 30,
      providers: 15,
      managers: 8
    };
  };

  const calculateTotalValue = (listings) => {
    return listings.reduce((sum, l) => sum + (parseFloat(l.price) || 0), 0);
  };

  const handleExportReport = (type) => {
    const reportData = {
      generated: new Date().toISOString(),
      timeRange,
      analytics
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `renteasy-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const generateChartData = (type) => {
    // Generate mock chart data
    const labels = [];
    const data = [];
    
    switch(timeRange) {
      case '7days':
        labels.push('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun');
        data.push(45, 52, 48, 60, 55, 58, 62);
        break;
      case '30days':
        for (let i = 1; i <= 30; i += 5) {
          labels.push(`Day ${i}`);
          data.push(Math.floor(Math.random() * 100) + 20);
        }
        break;
      default:
        labels.push('Week 1', 'Week 2', 'Week 3', 'Week 4');
        data.push(150, 180, 210, 240);
    }
    
    return { labels, data };
  };

  const getGrowthColor = (value) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthIcon = (score) => {
    if (score >= 80) return '🟢';
    if (score >= 60) return '🟡';
    return '🔴';
  };

  if (user?.role !== 'admin') {
    return (
      <div className="admin-access-denied">
        <h2>⛔ Admin Access Required</h2>
        <p>You need administrator privileges to access this page.</p>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-analytics">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <h1><BarChart3 size={24} /> Analytics Dashboard</h1>
            <p>Platform performance, user growth, and revenue insights</p>
          </div>
          <div className="header-right">
            <div className="time-range-selector">
              <Calendar size={18} />
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
                <option value="1year">Last year</option>
              </select>
            </div>
            <button 
              className="btn-refresh"
              onClick={loadAnalytics}
              title="Refresh Data"
            >
              <RefreshCw size={18} />
            </button>
            <button 
              className="btn-export"
              onClick={() => handleExportReport('full')}
            >
              <Download size={18} /> Export Report
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="overview-stats">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon users">
                <Users />
              </div>
              <div className={`growth-badge ${getGrowthColor(analytics.growth.userGrowth || 0)}`}>
                {analytics.growth.userGrowth >= 0 ? '↑' : '↓'} {Math.abs(analytics.growth.userGrowth || 0).toFixed(1)}%
              </div>
            </div>
            <div className="stat-content">
              <h3>{analytics.overview.totalUsers || 0}</h3>
              <p>Total Users</p>
              <small>Active: {analytics.userStats.activePercentage || 0}%</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon listings">
                <Home />
              </div>
              <div className={`growth-badge ${getGrowthColor(analytics.growth.listingGrowth || 0)}`}>
                {analytics.growth.listingGrowth >= 0 ? '↑' : '↓'} {Math.abs(analytics.growth.listingGrowth || 0).toFixed(1)}%
              </div>
            </div>
            <div className="stat-content">
              <h3>{analytics.overview.totalListings || 0}</h3>
              <p>Property Listings</p>
              <small>Verified: {analytics.overview.verifiedListings || 0}</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon providers">
                <Building />
              </div>
              <div className="growth-badge">
                ↑ 8.2%
              </div>
            </div>
            <div className="stat-content">
              <h3>{analytics.overview.totalProviders || 0}</h3>
              <p>Service Providers</p>
              <small>Active partners</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon revenue">
                <DollarSign />
              </div>
              <div className={`growth-badge ${getGrowthColor(analytics.growth.revenueGrowth || 0)}`}>
                {analytics.growth.revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(analytics.growth.revenueGrowth || 0).toFixed(1)}%
              </div>
            </div>
            <div className="stat-content">
              <h3>₦{(analytics.revenue.commission || 0).toLocaleString()}</h3>
              <p>Platform Revenue</p>
              <small>2% commission</small>
            </div>
          </div>
        </div>

        {/* Main Analytics Grid */}
        <div className="analytics-grid">
          {/* User Growth Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3><TrendingUp size={20} /> User Growth</h3>
              <select 
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
              >
                <option value="all">All Metrics</option>
                <option value="users">New Users</option>
                <option value="listings">New Listings</option>
                <option value="revenue">Revenue</option>
              </select>
            </div>
            <div className="chart-container">
              <div className="mock-chart">
                <div className="chart-bars">
                  {generateChartData().data.map((value, index) => (
                    <div 
                      key={index} 
                      className="chart-bar"
                      style={{ height: `${value}%` }}
                      title={`${value} units`}
                    ></div>
                  ))}
                </div>
                <div className="chart-labels">
                  {generateChartData().labels.map((label, index) => (
                    <span key={index}>{label}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="chart-footer">
              <span>Period: {timeRange}</span>
              <span>Total growth: {analytics.growth.userGrowth?.toFixed(1) || '0'}%</span>
            </div>
          </div>

          {/* User Distribution */}
          <div className="distribution-card">
            <h3><Users size={20} /> User Distribution</h3>
            <div className="distribution-chart">
              {Object.entries(analytics.userStats.roles || {}).map(([role, count]) => (
                <div key={role} className="distribution-item">
                  <div className="role-info">
                    <span className="role-name">{role}</span>
                    <span className="role-count">{count}</span>
                  </div>
                  <div className="role-bar">
                    <div 
                      className="role-fill"
                      style={{ 
                        width: `${(count / analytics.overview.totalUsers) * 100 || 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="distribution-stats">
              <div className="stat-item">
                <span className="stat-label">Verification Rate</span>
                <span className="stat-value">{analytics.userStats.verificationRate || 0}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avg Session</span>
                <span className="stat-value">{analytics.userStats.avgSessionDuration || '0m'}</span>
              </div>
            </div>
          </div>

          {/* Platform Health */}
          <div className="health-card">
            <h3><Shield size={20} /> Platform Health</h3>
            <div className="health-score">
              <div className="score-circle">
                <span className="score-value">{analytics.platformHealth.score || 0}</span>
                <span className="score-label">Score</span>
              </div>
              <div className="health-details">
                <div className="health-item">
                  <span className="health-icon">{getHealthIcon(analytics.platformHealth.score || 0)}</span>
                  <span className="health-status">
                    {analytics.platformHealth.score >= 80 ? 'Excellent' : 
                     analytics.platformHealth.score >= 60 ? 'Good' : 'Needs Attention'}
                  </span>
                </div>
                <div className="health-item">
                  <span className="health-icon">⏳</span>
                  <span>{analytics.platformHealth.pendingVerifications || 0} pending verifications</span>
                </div>
                <div className="health-item">
                  <span className="health-icon">🏠</span>
                  <span>{analytics.platformHealth.pendingListings || 0} pending listings</span>
                </div>
                <div className="health-item">
                  <span className="health-icon">⏱️</span>
                  <span>Avg response: {analytics.platformHealth.avgResponseTime || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="revenue-card">
            <h3><DollarSign size={20} /> Revenue Breakdown</h3>
            <div className="revenue-details">
              <div className="revenue-item">
                <span className="revenue-label">Total Value Listed</span>
                <span className="revenue-value">
                  ₦{(analytics.revenue.totalValue || 0).toLocaleString()}
                </span>
              </div>
              <div className="revenue-item">
                <span className="revenue-label">Platform Commission (2%)</span>
                <span className="revenue-value">
                  ₦{(analytics.revenue.commission || 0).toLocaleString()}
                </span>
              </div>
              <div className="revenue-item">
                <span className="revenue-label">Avg Transaction Value</span>
                <span className="revenue-value">
                  ₦{Math.round(analytics.revenue.avgTransaction || 0).toLocaleString()}
                </span>
              </div>
              <div className="revenue-item">
                <span className="revenue-label">Projected Monthly</span>
                <span className="revenue-value">
                  ₦{Math.round(analytics.revenue.projectedMonthly || 0).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="revenue-chart">
              <div className="chart-legend">
                <span className="legend-item">
                  <span className="legend-color commission"></span>
                  Commission
                </span>
                <span className="legend-item">
                  <span className="legend-color value"></span>
                  Listed Value
                </span>
              </div>
            </div>
          </div>

          {/* Activity Metrics */}
          <div className="activity-card">
            <h3><Clock size={20} /> Activity Metrics</h3>
            <div className="activity-grid">
              <div className="metric-item">
                <div className="metric-icon">
                  <Eye />
                </div>
                <div className="metric-content">
                  <span className="metric-value">1,245</span>
                  <span className="metric-label">Daily Views</span>
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-icon">
                  <MessageSquare />
                </div>
                <div className="metric-content">
                  <span className="metric-value">89</span>
                  <span className="metric-label">New Messages</span>
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-icon">
                  <Home />
                </div>
                <div className="metric-content">
                  <span className="metric-value">23</span>
                  <span className="metric-label">New Listings</span>
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-icon">
                  <Users />
                </div>
                <div className="metric-content">
                  <span className="metric-value">15</span>
                  <span className="metric-label">New Users</span>
                </div>
              </div>
            </div>
            <div className="activity-summary">
              <p>Platform activity is <strong>{analytics.growth.activeGrowth >= 0 ? 'increasing' : 'decreasing'}</strong> by {Math.abs(analytics.growth.activeGrowth || 0).toFixed(1)}%</p>
            </div>
          </div>

          {/* Quick Insights */}
          <div className="insights-card">
            <h3>💡 Quick Insights</h3>
            <div className="insights-list">
              <div className="insight-item positive">
                <strong>Top Performing:</strong>
                <p>Lagos state leads with {Math.round(analytics.overview.totalListings * 0.4)} listings</p>
              </div>
              <div className="insight-item warning">
                <strong>Attention Needed:</strong>
                <p>{analytics.platformHealth.pendingVerifications || 0} verification requests pending</p>
              </div>
              <div className="insight-item info">
                <strong>Growth Opportunity:</strong>
                <p>Estate firms segment grew by 25% this period</p>
              </div>
              <div className="insight-item success">
                <strong>Success Metric:</strong>
                <p>User satisfaction score: {analytics.platformHealth.satisfactionScore || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Summary */}
        <div className="data-summary">
          <div className="summary-header">
            <h3>📊 Data Summary</h3>
            <button 
              className="btn-export-small"
              onClick={() => handleExportReport('summary')}
            >
              <Download size={14} /> Summary
            </button>
          </div>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Time Period</span>
              <span className="summary-value">{timeRange}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Data Generated</span>
              <span className="summary-value">{new Date().toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Records</span>
              <span className="summary-value">
                {analytics.overview.totalUsers + analytics.overview.totalListings + analytics.overview.totalProviders}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Data Freshness</span>
              <span className="summary-value">Live</span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="analytics-loading">
            <div className="loading-spinner"></div>
            <p>Loading analytics data...</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;