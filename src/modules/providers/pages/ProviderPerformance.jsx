import React, { useState } from 'react';
import ProviderPageTemplate from '../templates/ProviderPageTemplate';
import {
  FaChartLine, FaChartBar, FaChartPie, FaCalendarAlt,
  FaFilter, FaDownload, FaArrowUp, FaArrowDown, FaStar,
  FaClock, FaUsers, FaMoneyBill, FaThumbsUp, FaEye,
  FaCalendar, FaCog
} from 'react-icons/fa';

const ProviderPerformance = () => {
  const [timeRange, setTimeRange] = useState('month'); // day, week, month, quarter, year
  const [selectedMetric, setSelectedMetric] = useState('overview');

  // Performance Metrics Data
  const [metrics, setMetrics] = useState({
    overview: {
      totalEarnings: 285000,
      bookings: 42,
      completionRate: 94,
      avgRating: 4.7,
      responseTime: '15m',
      repeatClients: 18,
      cancellationRate: 6,
      customerSatisfaction: 92
    },
    trends: {
      earnings: [
        { month: 'Oct', value: 125000 },
        { month: 'Nov', value: 185000 },
        { month: 'Dec', value: 210000 },
        { month: 'Jan', value: 285000 }
      ],
      bookings: [
        { month: 'Oct', value: 8 },
        { month: 'Nov', value: 12 },
        { month: 'Dec', value: 15 },
        { month: 'Jan', value: 7 }
      ],
      ratings: [
        { month: 'Oct', value: 4.5 },
        { month: 'Nov', value: 4.6 },
        { month: 'Dec', value: 4.7 },
        { month: 'Jan', value: 4.8 }
      ]
    },
    comparisons: {
      vsLastPeriod: {
        earnings: '+22%',
        bookings: '+15%',
        rating: '+0.2',
        satisfaction: '+5%'
      },
      vsPlatformAvg: {
        earnings: '+45%',
        bookings: '+28%',
        rating: '+0.5',
        satisfaction: '+12%'
      }
    }
  });

  // Top Services Data
  const [topServices] = useState([
    { id: 1, name: 'Deep House Cleaning', bookings: 15, revenue: 225000, rating: 4.8 },
    { id: 2, name: 'Office Painting', bookings: 8, revenue: 320000, rating: 4.7 },
    { id: 3, name: 'Carpet Cleaning', bookings: 7, revenue: 98000, rating: 4.9 },
    { id: 4, name: 'Plumbing Repairs', bookings: 6, revenue: 75000, rating: 4.6 },
    { id: 5, name: 'Electrical Wiring', bookings: 4, revenue: 120000, rating: 4.7 }
  ]);

  // Client Insights
  const [clientInsights] = useState({
    topClients: [
      { id: 1, name: 'John Doe', bookings: 5, totalSpent: 75000, lastBooking: '2024-01-15' },
      { id: 2, name: 'Jane Smith', bookings: 4, totalSpent: 120000, lastBooking: '2024-01-12' },
      { id: 3, name: 'Mike Johnson', bookings: 3, totalSpent: 45000, lastBooking: '2024-01-10' },
      { id: 4, name: 'Sarah Williams', bookings: 3, totalSpent: 54000, lastBooking: '2024-01-08' },
      { id: 5, name: 'David Brown', bookings: 2, totalSpent: 30000, lastBooking: '2024-01-05' }
    ],
    repeatRate: 42, // percentage
    acquisition: {
      organic: 65,
      referrals: 25,
      platform: 10
    }
  });

  // Performance Goals
  const [goals] = useState([
    { id: 1, name: 'Monthly Earnings', target: 300000, current: 285000, progress: 95 },
    { id: 2, name: 'Customer Rating', target: 4.8, current: 4.7, progress: 98 },
    { id: 3, name: 'Response Time', target: '10m', current: '15m', progress: 67 },
    { id: 4, name: 'Repeat Clients', target: 25, current: 18, progress: 72 }
  ]);

  // Time Ranges
  const timeRanges = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  // Metrics Categories
  const metricCategories = [
    { id: 'overview', label: 'Overview', icon: <FaChartLine /> },
    { id: 'earnings', label: 'Earnings', icon: <FaMoneyBill /> },
    { id: 'bookings', label: 'Bookings', icon: <FaCalendarAlt /> },
    { id: 'clients', label: 'Clients', icon: <FaUsers /> },
    { id: 'quality', label: 'Quality', icon: <FaStar /> }
  ];

  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };

  const getTrendColor = (value) => {
    if (value.includes('+')) return '#4caf50';
    if (value.includes('-')) return '#f44336';
    return '#666';
  };

  const calculateProgressBarWidth = (current, target) => {
    if (typeof current === 'string') return 0;
    return Math.min((current / target) * 100, 100);
  };

  return (
    <ProviderPageTemplate
      title="Performance Analytics"
      subtitle="Track your business performance and growth"
      actions={
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="time-range-selector">
            <FaCalendarAlt style={{ marginRight: '0.5rem' }} />
            <select 
              className="form-control"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{ minWidth: '150px' }}
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
          
          <button className="btn-secondary">
            <FaDownload style={{ marginRight: '0.5rem' }} />
            Export Report
          </button>
          
          <button className="btn-secondary">
            <FaCog style={{ marginRight: '0.5rem' }} />
            Settings
          </button>
        </div>
      }
    >
      {/* Time Range Filters */}
      <div className="provider-card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">Quick Filters</h3>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {timeRanges.map(range => (
            <button
              key={range.value}
              className={`time-range-btn ${timeRange === range.value ? 'active' : ''}`}
              onClick={() => setTimeRange(range.value)}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Navigation */}
      <div className="metrics-navigation" style={{ marginBottom: '2rem' }}>
        {metricCategories.map(category => (
          <button
            key={category.id}
            className={`metric-category-btn ${selectedMetric === category.id ? 'active' : ''}`}
            onClick={() => setSelectedMetric(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-label">{category.label}</span>
          </button>
        ))}
      </div>

      {/* Key Metrics Grid */}
      <div className="provider-grid" style={{ marginBottom: '2rem' }}>
        <div className="provider-card">
          <div className="card-header">
            <h3 className="card-title">Total Earnings</h3>
            <FaMoneyBill style={{ color: '#4caf50', fontSize: '1.5rem' }} />
          </div>
          <div className="metric-value">{formatCurrency(metrics.overview.totalEarnings)}</div>
          <div className="metric-trend" style={{ color: getTrendColor(metrics.comparisons.vsLastPeriod.earnings) }}>
            <FaArrowUp /> {metrics.comparisons.vsLastPeriod.earnings} vs last period
          </div>
        </div>

        <div className="provider-card">
          <div className="card-header">
            <h3 className="card-title">Total Bookings</h3>
            <FaCalendarAlt style={{ color: '#2196f3', fontSize: '1.5rem' }} />
          </div>
          <div className="metric-value">{metrics.overview.bookings}</div>
          <div className="metric-trend" style={{ color: getTrendColor(metrics.comparisons.vsLastPeriod.bookings) }}>
            <FaArrowUp /> {metrics.comparisons.vsLastPeriod.bookings} vs last period
          </div>
        </div>

        <div className="provider-card">
          <div className="card-header">
            <h3 className="card-title">Average Rating</h3>
            <FaStar style={{ color: '#ff9800', fontSize: '1.5rem' }} />
          </div>
          <div className="metric-value">{metrics.overview.avgRating}<span style={{ fontSize: '1rem', color: '#666' }}>/5.0</span></div>
          <div className="metric-trend" style={{ color: getTrendColor(metrics.comparisons.vsLastPeriod.rating) }}>
            <FaArrowUp /> {metrics.comparisons.vsLastPeriod.rating} vs last period
          </div>
        </div>

        <div className="provider-card">
          <div className="card-header">
            <h3 className="card-title">Completion Rate</h3>
            <FaThumbsUp style={{ color: '#9c27b0', fontSize: '1.5rem' }} />
          </div>
          <div className="metric-value">{metrics.overview.completionRate}%</div>
          <div className="metric-trend">
            <FaArrowUp /> +2% vs platform average
          </div>
        </div>
      </div>

      {/* Performance Charts & Detailed Metrics */}
      <div className="provider-grid" style={{ marginBottom: '2rem' }}>
        {/* Earnings Chart */}
        <div className="provider-card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3 className="card-title">Earnings Trend</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="chart-btn active">Monthly</button>
              <button className="chart-btn">Weekly</button>
            </div>
          </div>
          
          <div className="chart-container">
            <div className="chart">
              {metrics.trends.earnings.map((item, index) => (
                <div key={item.month} className="chart-bar-container">
                  <div 
                    className="chart-bar" 
                    style={{ 
                      height: `${(item.value / 300000) * 100}%`,
                      background: `linear-gradient(to top, #4caf50 ${(item.value / 300000) * 100}%, #e8f5e9 0%)`
                    }}
                  />
                  <div className="chart-label">{item.month}</div>
                  <div className="chart-value">{formatCurrency(item.value)}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="chart-summary">
            <div className="summary-item">
              <strong>Current Month:</strong>
              <span style={{ color: '#4caf50', fontWeight: '600' }}>
                {formatCurrency(metrics.trends.earnings[3].value)}
              </span>
            </div>
            <div className="summary-item">
              <strong>Growth:</strong>
              <span style={{ color: '#4caf50', fontWeight: '600' }}>
                {metrics.comparisons.vsLastPeriod.earnings}
              </span>
            </div>
            <div className="summary-item">
              <strong>Platform Avg:</strong>
              <span>{formatCurrency(150000)}</span>
            </div>
          </div>
        </div>

        {/* Goals Progress */}
        <div className="provider-card">
          <div className="card-header">
            <h3 className="card-title">Performance Goals</h3>
            <FaChartPie style={{ color: '#ff9800', fontSize: '1.5rem' }} />
          </div>
          
          <div className="goals-list">
            {goals.map(goal => (
              <div key={goal.id} className="goal-item">
                <div className="goal-info">
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{goal.name}</h4>
                  <div className="goal-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <div className="goal-stats">
                      <span className="current">{goal.current}</span>
                      <span className="target">/ {goal.target}</span>
                      <span className="percentage">{goal.progress}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="goals-summary">
            <div className="summary-stats">
              <div className="stat">
                <strong>Overall Progress</strong>
                <span className="stat-value">83%</span>
              </div>
              <div className="stat">
                <strong>Goals Met</strong>
                <span className="stat-value">2/4</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Services & Client Insights */}
      <div className="provider-grid">
        {/* Top Services */}
        <div className="provider-card">
          <div className="card-header">
            <h3 className="card-title">Top Performing Services</h3>
            <FaChartBar style={{ color: '#2196f3', fontSize: '1.5rem' }} />
          </div>
          
          <div className="top-services-list">
            {topServices.map(service => (
              <div key={service.id} className="service-item">
                <div className="service-info">
                  <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '1rem' }}>{service.name}</h4>
                  <div className="service-stats">
                    <span className="stat">{service.bookings} bookings</span>
                    <span className="stat">•</span>
                    <span className="stat">Rating: {service.rating}</span>
                  </div>
                </div>
                <div className="service-revenue">
                  <div className="revenue-amount">{formatCurrency(service.revenue)}</div>
                  <div className="revenue-percentage">
                    {Math.round((service.revenue / metrics.overview.totalEarnings) * 100)}% of total
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="services-summary">
            <div className="summary-item">
              <strong>Total Services:</strong>
              <span>{topServices.length}</span>
            </div>
            <div className="summary-item">
              <strong>Avg. Booking Value:</strong>
              <span>{formatCurrency(Math.round(metrics.overview.totalEarnings / metrics.overview.bookings))}</span>
            </div>
          </div>
        </div>

        {/* Client Insights */}
        <div className="provider-card">
          <div className="card-header">
            <h3 className="card-title">Client Insights</h3>
            <FaUsers style={{ color: '#9c27b0', fontSize: '1.5rem' }} />
          </div>
          
          <div className="client-stats">
            <div className="stat-card">
              <div className="stat-value">{clientInsights.repeatRate}%</div>
              <div className="stat-label">Repeat Client Rate</div>
            </div>
            
            <div className="acquisition-chart">
              <h5 style={{ margin: '0 0 1rem 0' }}>Client Acquisition</h5>
              <div className="acquisition-bars">
                <div className="acquisition-bar organic" style={{ width: `${clientInsights.acquisition.organic}%` }}>
                  <span>Organic: {clientInsights.acquisition.organic}%</span>
                </div>
                <div className="acquisition-bar referrals" style={{ width: `${clientInsights.acquisition.referrals}%` }}>
                  <span>Referrals: {clientInsights.acquisition.referrals}%</span>
                </div>
                <div className="acquisition-bar platform" style={{ width: `${clientInsights.acquisition.platform}%` }}>
                  <span>Platform: {clientInsights.acquisition.platform}%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="top-clients">
            <h5 style={{ margin: '0 0 1rem 0' }}>Top Clients</h5>
            <div className="clients-list">
              {clientInsights.topClients.map(client => (
                <div key={client.id} className="client-item">
                  <div className="client-info">
                    <h6 style={{ margin: '0 0 0.3rem 0' }}>{client.name}</h6>
                    <div className="client-meta">
                      <span>{client.bookings} bookings</span>
                      <span>•</span>
                      <span>Last: {client.lastBooking}</span>
                    </div>
                  </div>
                  <div className="client-spent">
                    <div className="spent-amount">{formatCurrency(client.totalSpent)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quality Metrics */}
        <div className="provider-card">
          <div className="card-header">
            <h3 className="card-title">Quality Metrics</h3>
            <FaStar style={{ color: '#ff9800', fontSize: '1.5rem' }} />
          </div>
          
          <div className="quality-metrics">
            <div className="metric-item">
              <div className="metric-header">
                <span>Response Time</span>
                <span className="metric-value">{metrics.overview.responseTime}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${(15 / 30) * 100}%`,
                    background: `linear-gradient(to right, #4caf50 0%, #8bc34a 100%)`
                  }}
                />
              </div>
              <div className="metric-comparison">
                <FaArrowDown style={{ color: '#4caf50' }} />
                <span>2m faster than last month</span>
              </div>
            </div>
            
            <div className="metric-item">
              <div className="metric-header">
                <span>Cancellation Rate</span>
                <span className="metric-value">{metrics.overview.cancellationRate}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${metrics.overview.cancellationRate}%`,
                    background: `linear-gradient(to right, ${metrics.overview.cancellationRate > 10 ? '#f44336' : '#ff9800'} 0%, #ffcc80 100%)`
                  }}
                />
              </div>
              <div className="metric-comparison">
                <FaArrowDown style={{ color: '#4caf50' }} />
                <span>3% lower than platform average</span>
              </div>
            </div>
            
            <div className="metric-item">
              <div className="metric-header">
                <span>Customer Satisfaction</span>
                <span className="metric-value">{metrics.overview.customerSatisfaction}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${metrics.overview.customerSatisfaction}%`,
                    background: `linear-gradient(to right, #4caf50 0%, #8bc34a 100%)`
                  }}
                />
              </div>
              <div className="metric-comparison">
                <FaArrowUp style={{ color: '#4caf50' }} />
                <span>{metrics.comparisons.vsLastPeriod.satisfaction} vs last period</span>
              </div>
            </div>
            
            <div className="metric-item">
              <div className="metric-header">
                <span>On-time Completion</span>
                <span className="metric-value">{metrics.overview.completionRate}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${metrics.overview.completionRate}%`,
                    background: `linear-gradient(to right, #4caf50 0%, #8bc34a 100%)`
                  }}
                />
              </div>
              <div className="metric-comparison">
                <FaArrowUp style={{ color: '#4caf50' }} />
                <span>4% higher than target</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="provider-card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">Performance Recommendations</h3>
          <FaChartLine style={{ color: '#1a237e', fontSize: '1.5rem' }} />
        </div>
        
        <div className="recommendations-grid">
          <div className="recommendation-card">
            <div className="rec-icon" style={{ background: '#e8f5e9' }}>
              <FaMoneyBill style={{ color: '#4caf50' }} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Increase Service Prices</h4>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                Your ratings are 0.5 above average. Consider 10% price increase.
              </p>
            </div>
          </div>
          
          <div className="recommendation-card">
            <div className="rec-icon" style={{ background: '#e3f2fd' }}>
              <FaUsers style={{ color: '#2196f3' }} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Focus on Repeat Clients</h4>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                Offer 15% discount on next booking to increase repeat rate.
              </p>
            </div>
          </div>
          
          <div className="recommendation-card">
            <div className="rec-icon" style={{ background: '#fff3e0' }}>
              <FaClock style={{ color: '#ff9800' }} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Improve Response Time</h4>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                Set up auto-responses to reduce average response time to 10m.
              </p>
            </div>
          </div>
          
          <div className="recommendation-card">
            <div className="rec-icon" style={{ background: '#f3e5f5' }}>
              <FaStar style={{ color: '#9c27b0' }} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Request More Reviews</h4>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                Ask satisfied clients for reviews to reach 4.8 average rating.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .time-range-selector {
          display: flex;
          align-items: center;
        }
        
        .time-range-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #ddd;
          background: white;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .time-range-btn.active {
          background: #1a237e;
          color: white;
          border-color: #1a237e;
        }
        
        .time-range-btn:hover:not(.active) {
          border-color: #1a237e;
        }
        
        .metrics-navigation {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .metric-category-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          border: 1px solid #e0e0e0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .metric-category-btn.active {
          background: #1a237e;
          color: white;
          border-color: #1a237e;
        }
        
        .metric-category-btn:hover:not(.active) {
          background: #f8f9fa;
          border-color: #1a237e;
        }
        
        .category-icon {
          font-size: 1.2rem;
        }
        
        .metric-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a237e;
          margin: 1rem 0;
        }
        
        .metric-trend {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
        }
        
        .chart-container {
          padding: 1rem 0 2rem;
        }
        
        .chart {
          display: flex;
          align-items: flex-end;
          gap: 2rem;
          height: 200px;
          padding: 0 1rem;
          border-bottom: 1px solid #e0e0e0;
          position: relative;
        }
        
        .chart-bar-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
        }
        
        .chart-bar {
          width: 40px;
          border-radius: 4px 4px 0 0;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .chart-bar:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .chart-label {
          margin-top: 0.5rem;
          font-size: 0.9rem;
          color: #666;
        }
        
        .chart-value {
          font-size: 0.8rem;
          color: #333;
          font-weight: 600;
          margin-top: 0.3rem;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .chart-bar-container:hover .chart-value {
          opacity: 1;
        }
        
        .chart-summary {
          display: flex;
          justify-content: space-around;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          margin-top: 1rem;
        }
        
        .summary-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .summary-item strong {
          font-size: 0.9rem;
          color: #666;
        }
        
        .chart-btn {
          padding: 0.3rem 0.8rem;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }
        
        .chart-btn.active {
          background: #1a237e;
          color: white;
          border-color: #1a237e;
        }
        
        .goals-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin: 1rem 0;
        }
        
        .goal-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .goal-progress {
          width: 100%;
        }
        
        .progress-bar {
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
          transition: width 0.3s ease;
        }
        
        .goal-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
        }
        
        .goal-stats .current {
          font-weight: 600;
          color: #333;
        }
        
        .goal-stats .target {
          color: #666;
        }
        
        .goal-stats .percentage {
          font-weight: 600;
          color: #4caf50;
        }
        
        .goals-summary {
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          margin-top: 1.5rem;
        }
        
        .summary-stats {
          display: flex;
          justify-content: space-around;
        }
        
        .summary-stats .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .summary-stats .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a237e;
          margin-top: 0.5rem;
        }
        
        .top-services-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin: 1rem 0;
        }
        
        .service-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .service-item:hover {
          border-color: #1a237e;
          box-shadow: 0 2px 8px rgba(26, 35, 126, 0.1);
        }
        
        .service-stats {
          display: flex;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #666;
        }
        
        .service-revenue {
          text-align: right;
        }
        
        .revenue-amount {
          font-weight: 600;
          color: #1a237e;
        }
        
        .revenue-percentage {
          font-size: 0.8rem;
          color: #666;
        }
        
        .services-summary {
          display: flex;
          justify-content: space-between;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          margin-top: 1rem;
        }
        
        .client-stats {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin: 1rem 0;
        }
        
        .stat-card {
          text-align: center;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
        }
        
        .stat-card .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: #9c27b0;
          margin: 0;
        }
        
        .stat-card .stat-label {
          color: #666;
          margin-top: 0.5rem;
        }
        
        .acquisition-chart {
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }
        
        .acquisition-bars {
          display: flex;
          height: 30px;
          border-radius: 15px;
          overflow: hidden;
        }
        
        .acquisition-bar {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.8rem;
          font-weight: 600;
          transition: width 0.3s ease;
        }
        
        .acquisition-bar.organic {
          background: #4caf50;
        }
        
        .acquisition-bar.referrals {
          background: #2196f3;
        }
        
        .acquisition-bar.platform {
          background: #ff9800;
        }
        
        .top-clients {
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 12px;
          margin-top: 1.5rem;
        }
        
        .clients-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .client-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.8rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }
        
        .client-meta {
          display: flex;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #666;
        }
        
        .spent-amount {
          font-weight: 600;
          color: #1a237e;
        }
        
        .quality-metrics {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin: 1rem 0;
        }
        
        .metric-item {
          padding: 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
        }
        
        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .metric-header .metric-value {
          font-size: 1.2rem;
          font-weight: 700;
          margin: 0;
        }
        
        .metric-comparison {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #666;
          margin-top: 0.5rem;
        }
        
        .recommendations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }
        
        .recommendation-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
          border-left: 4px solid #1a237e;
        }
        
        .rec-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }
        
        @media (max-width: 1200px) {
          .provider-card[style*="grid-column: span 2"] {
            grid-column: span 1;
          }
          
          .provider-grid {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 768px) {
          .metrics-navigation {
            flex-direction: column;
          }
          
          .metric-category-btn {
            justify-content: center;
          }
          
          .chart {
            gap: 1rem;
          }
          
          .chart-bar {
            width: 30px;
          }
          
          .recommendations-grid {
            grid-template-columns: 1fr;
          }
          
          .services-summary,
          .summary-stats {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </ProviderPageTemplate>
  );
};

export default ProviderPerformance;