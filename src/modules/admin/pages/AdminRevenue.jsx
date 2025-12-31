// src/modules/admin/pages/AdminRevenue.jsx
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, BarChart3, 
  PieChart, Calendar, Download, Filter, RefreshCw,
  Home, Users, Building, CreditCard, Target, Percent
} from 'lucide-react';
import './AdminRevenue.css';

const AdminRevenue = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    commission: 0,
    growth: 0,
    target: 0,
    transactions: 0,
    avgTransaction: 0
  });

  useEffect(() => {
    loadRevenueData();
  }, [timeRange]);

  const loadRevenueData = () => {
    setLoading(true);
    
    setTimeout(() => {
      // Generate sample revenue data based on time range
      const sampleData = generateRevenueData(timeRange);
      setRevenueData(sampleData);
      calculateStats(sampleData);
      setLoading(false);
    }, 1000);
  };

  const generateRevenueData = (range) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = Array.from({ length: 30 }, (_, i) => i + 1);
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    
    let labels = [];
    let data = [];
    
    switch(range) {
      case 'week':
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        data = labels.map(() => Math.floor(Math.random() * 500000) + 100000);
        break;
      case 'month':
        labels = weeks;
        data = weeks.map(() => Math.floor(Math.random() * 2000000) + 500000);
        break;
      case 'quarter':
        labels = ['Q1', 'Q2', 'Q3', 'Q4'];
        data = labels.map(() => Math.floor(Math.random() * 5000000) + 2000000);
        break;
      case 'year':
        labels = months.slice(0, 12);
        data = months.map(() => Math.floor(Math.random() * 3000000) + 1000000);
        break;
      default:
        labels = months.slice(0, 6);
        data = labels.map(() => Math.floor(Math.random() * 2000000) + 500000);
    }
    
    return {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data,
          backgroundColor: '#3b82f6',
          borderColor: '#2563eb',
          borderWidth: 2
        },
        {
          label: 'Commission',
          data: data.map(value => value * 0.075), // 7.5% commission
          backgroundColor: '#10b981',
          borderColor: '#059669',
          borderWidth: 2
        }
      ]
    };
  };

  const calculateStats = (data) => {
    const totalRevenue = data.datasets[0].data.reduce((a, b) => a + b, 0);
    const commission = data.datasets[1].data.reduce((a, b) => a + b, 0);
    const previousPeriodRevenue = totalRevenue * 0.85; // Simulate 15% growth
    const growth = ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100;
    const target = totalRevenue * 1.2; // 20% above current
    const transactions = Math.floor(totalRevenue / 50000); // Approximate
    const avgTransaction = totalRevenue / (transactions || 1);
    
    setStats({
      totalRevenue,
      commission,
      growth,
      target,
      transactions,
      avgTransaction
    });
  };

  const getRevenueSources = () => {
    return [
      { name: 'Rent Payments', value: 65, color: '#3b82f6', icon: <Home size={16} /> },
      { name: 'Service Fees', value: 20, color: '#10b981', icon: <Building size={16} /> },
      { name: 'Commissions', value: 10, color: '#8b5cf6', icon: <Percent size={16} /> },
      { name: 'Other', value: 5, color: '#f59e0b', icon: <CreditCard size={16} /> }
    ];
  };

  const getTopPerformers = () => {
    return [
      { id: 1, name: 'Lagos Mainland', revenue: 4500000, growth: 25, listings: 120 },
      { id: 2, name: 'Abuja Central', revenue: 3800000, growth: 18, listings: 95 },
      { id: 3, name: 'Port Harcourt', revenue: 3200000, growth: 12, listings: 78 },
      { id: 4, name: 'Ibadan Metro', revenue: 2800000, growth: 8, listings: 65 },
      { id: 5, name: 'Enugu City', revenue: 2100000, growth: 15, listings: 52 }
    ];
  };

  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
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
          <div className="stat-icon">
            <DollarSign size={32} />
          </div>
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
          <div className="stat-icon">
            <Percent size={32} />
          </div>
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
          <div className="stat-icon">
            <CreditCard size={32} />
          </div>
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
          <div className="stat-icon">
            <Target size={32} />
          </div>
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

      {/* Charts Section */}
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
            {/* In a real app, you would use a chart library like Chart.js or Recharts */}
            <div className="simulated-chart">
              <div className="chart-bars">
                {revenueData.datasets[0].data.map((value, index) => (
                  <div key={index} className="chart-bar-group">
                    <div className="bar-container">
                      <div 
                        className="bar revenue-bar" 
                        style={{ height: `${(value / Math.max(...revenueData.datasets[0].data)) * 100}%` }}
                      >
                        <span className="bar-value">{formatCurrency(value)}</span>
                      </div>
                      <div 
                        className="bar commission-bar" 
                        style={{ height: `${(value * 0.075 / Math.max(...revenueData.datasets[0].data)) * 100}%` }}
                      ></div>
                    </div>
                    <div className="bar-label">{revenueData.labels[index]}</div>
                  </div>
                ))}
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-color revenue"></span>
                  <span>Revenue</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color commission"></span>
                  <span>Commission (7.5%)</span>
                </div>
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
                {getRevenueSources().map((source, index, array) => {
                  const total = array.reduce((sum, s) => sum + s.value, 0);
                  const percentage = (source.value / total) * 100;
                  const startAngle = array.slice(0, index).reduce((sum, s) => sum + (s.value / total) * 360, 0);
                  
                  return (
                    <div 
                      key={source.name}
                      className="pie-segment"
                      style={{
                        backgroundColor: source.color,
                        transform: `rotate(${startAngle}deg)`,
                        clipPath: `conic-gradient(${source.color} 0% ${percentage}%, transparent ${percentage}% 100%)`
                      }}
                    ></div>
                  );
                })}
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

      {/* Performance Section */}
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
              <div className="insight-icon">
                <TrendingUp size={24} />
              </div>
              <div className="insight-content">
                <h4>Revenue Growth</h4>
                <p>Revenue has grown by {Math.abs(stats.growth).toFixed(1)}% compared to last period</p>
              </div>
            </div>
            
            <div className="insight-card info">
              <div className="insight-icon">
                <Users size={24} />
              </div>
              <div className="insight-content">
                <h4>User Engagement</h4>
                <p>High-value users contribute to 70% of total revenue</p>
              </div>
            </div>
            
            <div className="insight-card warning">
              <div className="insight-icon">
                <Target size={24} />
              </div>
              <div className="insight-content">
                <h4>Target Progress</h4>
                <p>{Math.round((stats.totalRevenue / stats.target) * 100)}% of monthly target achieved</p>
              </div>
            </div>
            
            <div className="insight-card success">
              <div className="insight-icon">
                <Building size={24} />
              </div>
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
        <button className="action-card">
          <Download size={20} />
          <span>Download Detailed Report</span>
        </button>
        <button className="action-card">
          <Calendar size={20} />
          <span>Schedule Revenue Review</span>
        </button>
        <button className="action-card">
          <Filter size={20} />
          <span>Advanced Filters</span>
        </button>
        <button className="action-card">
          <DollarSign size={20} />
          <span>Forecast Next Period</span>
        </button>
      </div>
    </div>
  );
};

export default AdminRevenue;