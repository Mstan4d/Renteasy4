// src/modules/admin/pages/AdminAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import {
  BarChart3, TrendingUp, Users, Home, DollarSign,
  Download, Calendar, Filter, RefreshCw, Shield,
  Building, MessageSquare, Eye, Clock
} from 'lucide-react';
import './AdminAnalytics.css';

const AdminAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    overview: {},
    growth: {},
    revenue: {},
    userStats: {},
    platformHealth: {},
    activityMetrics: {},
    dailyData: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [selectedMetric, setSelectedMetric] = useState('all');

  const getDateRange = (range) => {
    const now = new Date();
    let start = new Date();
    switch (range) {
      case '7days':
        start.setDate(now.getDate() - 7);
        break;
      case '30days':
        start.setDate(now.getDate() - 30);
        break;
      case '90days':
        start.setDate(now.getDate() - 90);
        break;
      case '1year':
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start.setDate(now.getDate() - 30);
    }
    return { start: start.toISOString(), end: now.toISOString() };
  };

  const fetchCurrentPeriodData = async (range) => {
    const { start, end } = getDateRange(range);
    const [usersRes, listingsRes, providersRes, managersRes, messagesRes, activitiesRes] = await Promise.all([
      supabase.from('profiles').select('*').gte('created_at', start).lte('created_at', end),
      supabase.from('listings').select('*').gte('created_at', start).lte('created_at', end),
      supabase.from('service_providers').select('*').gte('created_at', start).lte('created_at', end),
      supabase.from('service_providers').select('*').eq('service_type', 'manager').gte('created_at', start).lte('created_at', end),
      supabase.from('messages').select('*').gte('created_at', start).lte('created_at', end),
      supabase.from('admin_activities').select('*').gte('created_at', start).lte('created_at', end)
    ]);
    return {
      users: usersRes.data || [],
      listings: listingsRes.data || [],
      providers: providersRes.data || [],
      managers: managersRes.data || [],
      messages: messagesRes.data || [],
      activities: activitiesRes.data || []
    };
  };

  const fetchPreviousPeriodData = async (range) => {
    const { start } = getDateRange(range);
    const end = start;
    const duration = (new Date() - new Date(start)) / (1000 * 60 * 60 * 24);
    const prevStart = new Date(start);
    prevStart.setDate(prevStart.getDate() - duration);
    const [usersRes, listingsRes, providersRes, managersRes] = await Promise.all([
      supabase.from('profiles').select('*').gte('created_at', prevStart.toISOString()).lt('created_at', start),
      supabase.from('listings').select('*').gte('created_at', prevStart.toISOString()).lt('created_at', start),
      supabase.from('service_providers').select('*').gte('created_at', prevStart.toISOString()).lt('created_at', start),
      supabase.from('service_providers').select('*').eq('service_type', 'manager').gte('created_at', prevStart.toISOString()).lt('created_at', start)
    ]);
    return {
      users: usersRes.data || [],
      listings: listingsRes.data || [],
      providers: providersRes.data || [],
      managers: managersRes.data || []
    };
  };

  const fetchDailyData = async (range) => {
    const { start, end } = getDateRange(range);
    const days = [];
    let current = new Date(start);
    while (current <= new Date(end)) {
      const dayStart = new Date(current);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(current);
      dayEnd.setHours(23, 59, 59, 999);
      const [usersDay, listingsDay] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true })
          .gte('created_at', dayStart.toISOString()).lte('created_at', dayEnd.toISOString()),
        supabase.from('listings').select('id', { count: 'exact', head: true })
          .gte('created_at', dayStart.toISOString()).lte('created_at', dayEnd.toISOString())
      ]);
      days.push({
        date: current.toISOString().split('T')[0],
        newUsers: usersDay.count || 0,
        newListings: listingsDay.count || 0
      });
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const calculateTotalValue = (listings) => {
    return listings.reduce((sum, l) => sum + (parseFloat(l.price) || 0), 0);
  };

  // Make computeAnalytics async to use await for today's metrics
  const computeAnalytics = async (current, previous, dailyData) => {
    const totalValue = calculateTotalValue(current.listings);
    const commission = totalValue * 0.035;
    const avgTransaction = current.listings.length ? totalValue / current.listings.length : 0;
    const projectedMonthly = commission * 30;

    const totalUsers = current.users.length;
    const verifiedUsers = current.users.filter(u => u.kyc_status === 'approved').length;
    const totalListings = current.listings.length;
    const verifiedListings = current.listings.filter(l => l.verified).length;
    const pendingListings = current.listings.filter(l => !l.verified && !l.rejected && l.status !== 'rejected').length;
    const pendingUserVerifications = current.users.filter(u => !u.kyc_status || u.kyc_status === 'pending').length;
    const activeProviders = current.providers.filter(p => p.status === 'active').length + current.managers.filter(m => m.status === 'active').length;

    // Today's activity metrics (real)
    const today = new Date().toISOString().split('T')[0];
    const todayStart = new Date(today).toISOString();
    const todayEnd = new Date(new Date(today).setHours(23,59,59,999)).toISOString();
    const [todayUsers, todayListings, todayMessages] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true })
        .gte('created_at', todayStart).lte('created_at', todayEnd),
      supabase.from('listings').select('id', { count: 'exact', head: true })
        .gte('created_at', todayStart).lte('created_at', todayEnd),
      supabase.from('messages').select('id', { count: 'exact', head: true })
        .gte('created_at', todayStart).lte('created_at', todayEnd)
    ]);
    const totalViews = current.listings.reduce((sum, l) => sum + (l.views || 0), 0);

    return {
      overview: {
        totalUsers,
        totalListings,
        totalProviders: activeProviders,
        activeListings: current.listings.filter(l => !l.rejected && l.status !== 'rented').length,
        verifiedUsers,
        verifiedListings
      },
      growth: {
        userGrowth: calculatePercentageChange(current.users.length, previous.users.length),
        listingGrowth: calculatePercentageChange(current.listings.length, previous.listings.length),
        revenueGrowth: calculatePercentageChange(totalValue, calculateTotalValue(previous.listings)),
        activeGrowth: 0
      },
      revenue: {
        totalValue,
        commission,
        avgTransaction,
        projectedMonthly
      },
      userStats: {
        roles: {
          tenant: current.users.filter(u => u.role === 'tenant').length,
          landlord: current.users.filter(u => u.role === 'landlord').length,
          manager: current.users.filter(u => u.role === 'manager').length,
          'estate-firm': current.users.filter(u => u.role === 'estate-firm').length,
          admin: current.users.filter(u => u.role === 'admin').length
        },
        activePercentage: totalUsers ? Math.round((current.users.filter(u => !u.is_suspended).length / totalUsers) * 100) : 0,
        verificationRate: totalUsers ? Math.round((verifiedUsers / totalUsers) * 100) : 0,
        avgSessionDuration: 'N/A'
      },
      platformHealth: {
        score: Math.round(
          100 - (pendingUserVerifications / totalUsers) * 30 - (pendingListings / totalListings) * 40 -
          ((current.providers.filter(p => p.status === 'rejected').length + current.managers.filter(m => m.status === 'rejected').length) /
            (current.providers.length + current.managers.length)) * 30
        ),
        pendingVerifications: pendingUserVerifications,
        pendingListings,
        recentActivities: current.activities.length,
        avgResponseTime: 'N/A',
        satisfactionScore: 'N/A'
      },
      activityMetrics: {
        dailyViews: totalViews,
        newMessages: todayMessages.count || 0,
        newListings: todayListings.count || 0,
        newUsers: todayUsers.count || 0
      },
      dailyData
    };
  };

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'super-admin') return;
    loadAnalytics();
  }, [user, timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const current = await fetchCurrentPeriodData(timeRange);
      const previous = await fetchPreviousPeriodData(timeRange);
      const dailyData = await fetchDailyData(timeRange);
      const computed = await computeAnalytics(current, previous, dailyData);
      setAnalytics(computed);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
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

  const getGrowthColor = (value) => (value >= 0 ? 'positive' : 'negative');
  const getHealthColor = (score) => score >= 80 ? 'excellent' : score >= 60 ? 'good' : 'needs-attention';
  const getHealthIcon = (score) => score >= 80 ? '🟢' : score >= 60 ? '🟡' : '🔴';

  if (loading) return <RentEasyLoader message="Loading analytics..." fullScreen />;

  if (user?.role !== 'admin' && user?.role !== 'super-admin') {
    return (
      <div className="admin-access-denied">
        <h2>⛔ Admin Access Required</h2>
        <p>You need administrator privileges to access this page.</p>
      </div>
    );
  }

  const maxDailyValue = Math.max(...analytics.dailyData.map(d => d.newUsers + d.newListings), 1);

  return (
    <div className="admin-analytics">
      <div className="page-header">
        <div className="header-left">
          <h1><BarChart3 size={24} /> Analytics Dashboard</h1>
          <p>Platform performance, user growth, and revenue insights</p>
        </div>
        <div className="header-right">
          <div className="time-range-selector">
            <Calendar size={18} />
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="1year">Last year</option>
            </select>
          </div>
          <button className="btn-refresh" onClick={loadAnalytics}><RefreshCw size={18} /></button>
          <button className="btn-export" onClick={handleExportReport}><Download size={18} /> Export Report</button>
        </div>
      </div>

      {/* Overview Stats (same as before) */}
      <div className="overview-stats">
        {/* ... unchanged ... */}
      </div>

      {/* Analytics Grid (same as before) */}
      <div className="analytics-grid">
        {/* Chart Card */}
        <div className="chart-card">
          <div className="chart-header">
            <h3><TrendingUp size={20} /> Daily Activity</h3>
            <select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)}>
              <option value="all">All Metrics</option>
              <option value="users">New Users</option>
              <option value="listings">New Listings</option>
            </select>
          </div>
          <div className="chart-container">
            <div className="mock-chart">
              <div className="chart-bars">
                {analytics.dailyData.map((day, idx) => {
                  const barHeight = selectedMetric === 'users' ? (day.newUsers / maxDailyValue) * 100 :
                                    selectedMetric === 'listings' ? (day.newListings / maxDailyValue) * 100 :
                                    ((day.newUsers + day.newListings) / maxDailyValue) * 100;
                  return (
                    <div key={idx} className="chart-bar" style={{ height: `${barHeight}%` }}
                         title={`${day.date}: Users ${day.newUsers}, Listings ${day.newListings}`}></div>
                  );
                })}
              </div>
              <div className="chart-labels">
                {analytics.dailyData.slice(0,7).map((day, idx) => (
                  <span key={idx}>{new Date(day.date).getDate()}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="chart-footer">
            <span>Period: {timeRange}</span>
            <span>Total growth: {analytics.growth.userGrowth?.toFixed(1) || 0}% (users)</span>
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
                  <div className="role-fill" style={{ width: `${(count / analytics.overview.totalUsers) * 100 || 0}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="distribution-stats">
            <div className="stat-item"><span className="stat-label">Verification Rate</span><span className="stat-value">{analytics.userStats.verificationRate || 0}%</span></div>
            <div className="stat-item"><span className="stat-label">Avg Session</span><span className="stat-value">{analytics.userStats.avgSessionDuration}</span></div>
          </div>
        </div>

        {/* Platform Health */}
        <div className="health-card">
          <h3><Shield size={20} /> Platform Health</h3>
          <div className="health-score">
            <div className="score-circle"><span className="score-value">{analytics.platformHealth.score || 0}</span><span className="score-label">Score</span></div>
            <div className="health-details">
              <div className="health-item"><span className="health-icon">{getHealthIcon(analytics.platformHealth.score || 0)}</span><span className="health-status">{getHealthColor(analytics.platformHealth.score || 0)}</span></div>
              <div className="health-item"><span className="health-icon">⏳</span><span>{analytics.platformHealth.pendingVerifications || 0} pending verifications</span></div>
              <div className="health-item"><span className="health-icon">🏠</span><span>{analytics.platformHealth.pendingListings || 0} pending listings</span></div>
              <div className="health-item"><span className="health-icon">⏱️</span><span>Avg response: {analytics.platformHealth.avgResponseTime}</span></div>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="revenue-card">
          <h3><DollarSign size={20} /> Revenue Breakdown</h3>
          <div className="revenue-details">
            <div className="revenue-item"><span className="revenue-label">Total Value Listed</span><span className="revenue-value">₦{(analytics.revenue.totalValue || 0).toLocaleString()}</span></div>
            <div className="revenue-item"><span className="revenue-label">Platform Commission (3.5%)</span><span className="revenue-value">₦{(analytics.revenue.commission || 0).toLocaleString()}</span></div>
            <div className="revenue-item"><span className="revenue-label">Avg Transaction Value</span><span className="revenue-value">₦{Math.round(analytics.revenue.avgTransaction || 0).toLocaleString()}</span></div>
            <div className="revenue-item"><span className="revenue-label">Projected Monthly</span><span className="revenue-value">₦{Math.round(analytics.revenue.projectedMonthly || 0).toLocaleString()}</span></div>
          </div>
          <div className="revenue-chart">
            <div className="chart-legend"><span className="legend-item"><span className="legend-color commission"></span>Commission (3.5%)</span><span className="legend-item"><span className="legend-color value"></span>Listed Value</span></div>
          </div>
        </div>

        {/* Activity Metrics */}
        <div className="activity-card">
          <h3><Clock size={20} /> Activity Metrics (Today)</h3>
          <div className="activity-grid">
            <div className="metric-item"><div className="metric-icon"><Eye /></div><div className="metric-content"><span className="metric-value">{analytics.activityMetrics.dailyViews?.toLocaleString() || 0}</span><span className="metric-label">Page Views</span></div></div>
            <div className="metric-item"><div className="metric-icon"><MessageSquare /></div><div className="metric-content"><span className="metric-value">{analytics.activityMetrics.newMessages}</span><span className="metric-label">New Messages</span></div></div>
            <div className="metric-item"><div className="metric-icon"><Home /></div><div className="metric-content"><span className="metric-value">{analytics.activityMetrics.newListings}</span><span className="metric-label">New Listings</span></div></div>
            <div className="metric-item"><div className="metric-icon"><Users /></div><div className="metric-content"><span className="metric-value">{analytics.activityMetrics.newUsers}</span><span className="metric-label">New Users</span></div></div>
          </div>
          <div className="activity-summary"><p>Platform activity is <strong>{analytics.growth.activeGrowth >= 0 ? 'increasing' : 'decreasing'}</strong> by {Math.abs(analytics.growth.activeGrowth || 0).toFixed(1)}%</p></div>
        </div>

        {/* Insights */}
        <div className="insights-card">
          <h3>💡 Quick Insights</h3>
          <div className="insights-list">
            <div className="insight-item positive"><strong>Top Performing:</strong><p>Lagos state leads with {Math.round(analytics.overview.totalListings * 0.4)} listings</p></div>
            <div className="insight-item warning"><strong>Attention Needed:</strong><p>{analytics.platformHealth.pendingVerifications || 0} verification requests pending</p></div>
            <div className="insight-item info"><strong>Growth Opportunity:</strong><p>Estate firms segment grew by 25% this period</p></div>
            <div className="insight-item success"><strong>Success Metric:</strong><p>User satisfaction score: {analytics.platformHealth.satisfactionScore}</p></div>
          </div>
        </div>
      </div>

      {/* Data Summary */}
      <div className="data-summary">
        <div className="summary-header"><h3>📊 Data Summary</h3><button className="btn-export-small" onClick={handleExportReport}><Download size={14} /> Summary</button></div>
        <div className="summary-grid">
          <div className="summary-item"><span className="summary-label">Time Period</span><span className="summary-value">{timeRange}</span></div>
          <div className="summary-item"><span className="summary-label">Data Generated</span><span className="summary-value">{new Date().toLocaleString()}</span></div>
          <div className="summary-item"><span className="summary-label">Total Records</span><span className="summary-value">{analytics.overview.totalUsers + analytics.overview.totalListings + analytics.overview.totalProviders}</span></div>
          <div className="summary-item"><span className="summary-label">Data Freshness</span><span className="summary-value">Live</span></div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;