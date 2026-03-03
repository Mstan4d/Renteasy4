// src/modules/admin/pages/AdminRevenue.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import {
  DollarSign, TrendingUp, TrendingDown, BarChart3,
  PieChart, Calendar, Download, Filter, RefreshCw,
  Home, Users, Building, CreditCard, Target, Percent,
  CheckCircle, XCircle
} from 'lucide-react';
import './AdminRevenue.css';

const AdminRevenue = () => {
  const { user } = useAuth();
  const [revenueData, setRevenueData] = useState({
    labels: [],
    datasets: [
      { label: 'Revenue', data: [] },
      { label: 'Commission', data: [] }
    ]
  });
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    commission: 0,
    growth: 0,
    target: 10000000, // ₦10M target
    transactions: 0,
    avgTransaction: 0
  });
  const [pendingCommissions, setPendingCommissions] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  // Load revenue data and pending commissions
  useEffect(() => {
    loadRevenueData();
    loadPendingCommissions();
  }, []);

  const loadRevenueData = async () => {
    setLoading(true);
    try {
      // Fetch real data from view (last 30 days)
      const { data, error } = await supabase
        .from('admin_revenue_stats')
        .select('*')
        .limit(30);

      if (error) throw error;

      if (data && data.length > 0) {
        const labels = data.map(d => new Date(d.day).toLocaleDateString('en-NG', {
          day: 'numeric',
          month: 'short'
        })).reverse();

        const revenueValues = data.map(d => d.daily_rent_volume).reverse();
        const commissionValues = data.map(d => d.daily_commission).reverse();

        setRevenueData({
          labels,
          datasets: [
            { label: 'Revenue', data: revenueValues },
            { label: 'Commission', data: commissionValues }
          ]
        });

        // Calculate totals
        const totalRevenue = revenueValues.reduce((a, b) => a + b, 0);
        const totalCommission = commissionValues.reduce((a, b) => a + b, 0);
        const totalTransactions = data.reduce((a, b) => a + b.transaction_count, 0);

        // Calculate growth (compare with previous 30 days)
        const prevData = await supabase
          .from('admin_revenue_stats')
          .select('daily_rent_volume')
          .limit(30)
          .range(30, 59); // next 30 days

        const prevTotal = prevData.data?.reduce((a, b) => a + b.daily_rent_volume, 0) || 0;
        const growth = prevTotal ? ((totalRevenue - prevTotal) / prevTotal) * 100 : 0;

        setStats({
          totalRevenue,
          commission: totalCommission,
          growth,
          target: 10000000,
          transactions: totalTransactions,
          avgTransaction: totalTransactions ? totalRevenue / totalTransactions : 0
        });
      } else {
        // No data – set empty
        setRevenueData({
          labels: [],
          datasets: [
            { label: 'Revenue', data: [] },
            { label: 'Commission', data: [] }
          ]
        });
      }
    } catch (error) {
      console.error('Error loading revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingCommissions = async () => {
    setPendingLoading(true);
    try {
      const { data, error } = await supabase
        .from('commissions')
        .select(`
          id,
          rental_amount,
          manager_share,
          referrer_share,
          platform_share,
          created_at,
          listing:listings!listing_id (id, title),
          manager:manager_id (full_name, email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingCommissions(data || []);
    } catch (error) {
      console.error('Error loading pending commissions:', error);
    } finally {
      setPendingLoading(false);
    }
  };

  const confirmRental = async (commissionId) => {
    if (!window.confirm('Confirm this rental and update revenue?')) return;

    try {
      // Update commission status to confirmed
      const { error } = await supabase
        .from('commissions')
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString()
        })
        .eq('id', commissionId);

      if (error) throw error;

      // Optionally update listing status (if not already rented)
      const commission = pendingCommissions.find(c => c.id === commissionId);
      if (commission?.listing?.id) {
        await supabase
          .from('listings')
          .update({ status: 'rented', rented_at: new Date().toISOString() })
          .eq('id', commission.listing.id);
      }

      alert('Commission confirmed!');
      loadRevenueData(); // refresh charts
      loadPendingCommissions(); // remove from pending list
    } catch (error) {
      console.error('Error confirming rental:', error);
      alert('Failed to confirm.');
    }
  };

  const exportRevenueReport = () => {
    const report = {
      generated: new Date().toISOString(),
      timeRange,
      stats,
      sources: getRevenueSources(),
      performers: getTopPerformers()
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue_report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Static helpers (can later be replaced with real data)
  const getRevenueSources = () => [
    { name: 'Rent Payments', value: 65, color: '#3b82f6', icon: <Home size={16} /> },
    { name: 'Service Fees', value: 20, color: '#10b981', icon: <Building size={16} /> },
    { name: 'Commissions', value: 10, color: '#8b5cf6', icon: <Percent size={16} /> },
    { name: 'Other', value: 5, color: '#f59e0b', icon: <CreditCard size={16} /> }
  ];

  const getTopPerformers = () => [
    { id: 1, name: 'Lagos Mainland', revenue: 4500000, growth: 25, listings: 120 },
    { id: 2, name: 'Abuja Central', revenue: 3800000, growth: 18, listings: 95 },
    { id: 3, name: 'Port Harcourt', revenue: 3200000, growth: 12, listings: 78 },
    { id: 4, name: 'Ibadan Metro', revenue: 2800000, growth: 8, listings: 65 },
    { id: 5, name: 'Enugu City', revenue: 2100000, growth: 15, listings: 52 }
  ];

  const formatCurrency = (amount) => `₦${amount.toLocaleString()}`;

  if (loading) {
    return (
      <div className="admin-revenue loading">
        <div className="loading-spinner"></div>
        <p>Loading revenue data...</p>
      </div>
    );
  }

  return (
    <div className="admin-revenue">
      <div className="revenue-header">
        <div className="header-left">
          <h1><DollarSign size={28} /> Revenue Dashboard</h1>
          <p>Track and analyze platform revenue performance</p>
        </div>
        <div className="header-right">
          <div className="time-selector">
            <Calendar size={18} />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="time-select"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <button className="btn-export" onClick={exportRevenueReport}>
            <Download size={18} /> Export Report
          </button>
          <button className="btn-refresh" onClick={loadRevenueData}>
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="revenue-main-stats">
        <div className="main-stat-card total-revenue">
          <div className="stat-icon"><DollarSign size={32} /></div>
          <div className="stat-content">
            <h2>{formatCurrency(stats.totalRevenue)}</h2>
            <p>Total Revenue</p>
            <div className="growth-indicator">
              {stats.growth > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className={stats.growth > 0 ? 'positive' : 'negative'}>
                {Math.abs(stats.growth).toFixed(1)}%
              </span>
              <small>vs last period</small>
            </div>
          </div>
        </div>
        <div className="main-stat-card commission">
          <div className="stat-icon"><Percent size={32} /></div>
          <div className="stat-content">
            <h2>{formatCurrency(stats.commission)}</h2>
            <p>Platform Commission</p>
            <div className="commission-rate">
              <span className="rate">7.5%</span>
              <small>of total revenue</small>
            </div>
          </div>
        </div>
        <div className="main-stat-card transactions">
          <div className="stat-icon"><CreditCard size={32} /></div>
          <div className="stat-content">
            <h2>{stats.transactions.toLocaleString()}</h2>
            <p>Total Transactions</p>
            <div className="avg-transaction">
              <span className="avg">{formatCurrency(stats.avgTransaction)}</span>
              <small>average per transaction</small>
            </div>
          </div>
        </div>
        <div className="main-stat-card target">
          <div className="stat-icon"><Target size={32} /></div>
          <div className="stat-content">
            <h2>{formatCurrency(stats.target)}</h2>
            <p>Revenue Target</p>
            <div className="target-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(stats.totalRevenue / stats.target) * 100}%` }}
                ></div>
              </div>
              <span className="progress-text">
                {Math.round((stats.totalRevenue / stats.target) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section (keep as is, but use revenueData) */}
      <div className="revenue-charts">
        <div className="chart-card revenue-trend">
          <div className="chart-header">
            <h3><BarChart3 size={20} /> Revenue Trend</h3>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="chart-select"
            >
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
              <option value="quarter">Quarterly</option>
              <option value="year">Yearly</option>
            </select>
          </div>
          <div className="chart-container">
            {/* Simulated chart using revenueData – same as before but use real data */}
            <div className="simulated-chart">
              <div className="chart-bars">
                {revenueData.datasets[0].data.map((value, index) => {
                  const maxVal = Math.max(...revenueData.datasets[0].data, 1);
                  const revenueHeight = (value / maxVal) * 100;
                  const commissionValue = revenueData.datasets[1].data[index] || 0;
                  const commissionHeight = (commissionValue / maxVal) * 100;
                  return (
                    <div key={index} className="chart-bar-group">
                      <div className="bar-container">
                        <div
                          className="bar revenue-bar"
                          style={{ height: `${revenueHeight}%` }}
                          title={formatCurrency(value)}
                        >
                          <span className="bar-value">{formatCurrency(value)}</span>
                        </div>
                        <div
                          className="bar commission-bar"
                          style={{ height: `${commissionHeight}%` }}
                        ></div>
                      </div>
                      <div className="bar-label">{revenueData.labels[index]}</div>
                    </div>
                  );
                })}
              </div>
              <div className="chart-legend">
                <div className="legend-item"><span className="legend-color revenue"></span>Revenue</div>
                <div className="legend-item"><span className="legend-color commission"></span>Commission (7.5%)</div>
              </div>
            </div>
          </div>
        </div>

        <div className="chart-card revenue-sources">
          <div className="chart-header">
            <h3><PieChart size={20} /> Revenue Sources</h3>
          </div>
          <div className="chart-container">
            <div className="pie-chart-container">
              <div className="pie-chart">
                {/* Static pie chart remains – could be replaced with real data later */}
              </div>
              <div className="sources-list">
                {getRevenueSources().map(source => (
                  <div key={source.name} className="source-item">
                    <div className="source-info">
                      <span className="source-icon">{source.icon}</span>
                      <span className="source-name">{source.name}</span>
                    </div>
                    <div className="source-stats">
                      <span className="source-percentage">{source.value}%</span>
                      <span className="source-value">
                        {formatCurrency((stats.totalRevenue * source.value) / 100)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Commissions Section (NEW) */}
      <div className="pending-commissions">
        <h3><CheckCircle size={20} /> Pending Rentals to Confirm</h3>
        {pendingLoading ? (
          <div className="loading-small">Loading...</div>
        ) : pendingCommissions.length === 0 ? (
          <div className="empty-state">No pending commissions.</div>
        ) : (
          <div className="pending-list">
            {pendingCommissions.map(comm => (
              <div key={comm.id} className="pending-card">
                <div className="pending-info">
                  <strong>{comm.listing?.title || 'Unknown Listing'}</strong>
                  <div className="pending-details">
                    <span>Rental: {formatCurrency(comm.rental_amount)}</span>
                    <span>Commission: {formatCurrency(comm.platform_share)} (7.5%)</span>
                    <span>Manager: {comm.manager?.full_name || 'N/A'}</span>
                  </div>
                  <small>Submitted: {new Date(comm.created_at).toLocaleDateString()}</small>
                </div>
                <button className="btn-confirm" onClick={() => confirmRental(comm.id)}>
                  <CheckCircle size={16} /> Confirm Rental
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance Section (unchanged) */}
      <div className="performance-section">
        <div className="top-performers">
          <h3><TrendingUp size={20} /> Top Performing Locations</h3>
          <div className="performers-list">
            {getTopPerformers().map(location => (
              <div key={location.id} className="performer-card">
                <div className="performer-rank">{location.id}</div>
                <div className="performer-info">
                  <h4>{location.name}</h4>
                  <div className="performer-stats">
                    <span className="revenue">{formatCurrency(location.revenue)}</span>
                    <span className={`growth ${location.growth > 0 ? 'positive' : 'negative'}`}>
                      {location.growth > 0 ? '+' : ''}{location.growth}%
                    </span>
                    <span className="listings">{location.listings} listings</span>
                  </div>
                </div>
                <div className="performer-actions">
                  <button className="btn-view">View Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="revenue-insights">
          <h3><BarChart3 size={20} /> Key Insights</h3>
          <div className="insights-list">
            <div className="insight-card positive">
              <div className="insight-icon"><TrendingUp size={24} /></div>
              <div className="insight-content">
                <h4>Revenue Growth</h4>
                <p>Revenue has grown by {Math.abs(stats.growth).toFixed(1)}% compared to last period</p>
              </div>
            </div>
            <div className="insight-card info">
              <div className="insight-icon"><Users size={24} /></div>
              <div className="insight-content">
                <h4>User Engagement</h4>
                <p>High‑value users contribute to 70% of total revenue</p>
              </div>
            </div>
            <div className="insight-card warning">
              <div className="insight-icon"><Target size={24} /></div>
              <div className="insight-content">
                <h4>Target Progress</h4>
                <p>{Math.round((stats.totalRevenue / stats.target) * 100)}% of monthly target achieved</p>
              </div>
            </div>
            <div className="insight-card success">
              <div className="insight-icon"><Building size={24} /></div>
              <div className="insight-content">
                <h4>Commission Efficiency</h4>
                <p>Commission collection rate stands at 95% across all transactions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="revenue-actions">
        <button className="action-card" onClick={exportRevenueReport}>
          <Download size={20} /> Download Detailed Report
        </button>
        <button className="action-card">
          <Calendar size={20} /> Schedule Revenue Review
        </button>
        <button className="action-card">
          <Filter size={20} /> Advanced Filters
        </button>
        <button className="action-card">
          <DollarSign size={20} /> Forecast Next Period
        </button>
      </div>
    </div>
  );
};

export default AdminRevenue;