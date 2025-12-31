// src/modules/dashboard/components/landlord/Analytics.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import './Analytics.css';

const Analytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockData = {
          overview: {
            totalProperties: 12,
            activeRentals: 8,
            vacancyRate: '33%',
            averageRent: '₦2,850,000',
            totalCommission: '₦12,500,000',
            averageOccupancy: '67%'
          },
          performance: {
            monthlyRevenue: [2500000, 3200000, 2800000, 3500000, 4200000, 3800000],
            occupancyRate: [65, 72, 68, 75, 80, 78],
            newInquiries: [12, 18, 15, 22, 20, 25],
            propertyViews: [450, 520, 480, 600, 650, 620]
          },
          topProperties: [
            { id: 1, name: '3 Bedroom Duplex Lekki', revenue: 4200000, occupancy: '100%', views: 1250 },
            { id: 2, name: '4 Bedroom Terrace VI', revenue: 5200000, occupancy: '100%', views: 980 },
            { id: 3, name: '2 Bedroom Flat Ikeja', revenue: 1800000, occupancy: '75%', views: 850 },
            { id: 4, name: 'Self-contain Garki', revenue: 400000, occupancy: '100%', views: 720 }
          ],
          trends: {
            peakMonth: 'December',
            bestLocation: 'Lekki Phase 1',
            averageDaysVacant: 14,
            conversionRate: '42%'
          }
        };
        
        setAnalyticsData(mockData);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadAnalyticsData();
    }
  }, [user, timeRange]);

  const goBack = () => {
    navigate('/dashboard/landlord');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="landlord-analytics">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-left">
          <button className="btn btn-back" onClick={goBack}>
            ← Back to Dashboard
          </button>
          <h1>Property Analytics</h1>
          <p>Track your property performance and revenue insights</p>
        </div>
        
        <div className="header-right">
          <div className="time-range-selector">
            <button 
              className={`time-btn ${timeRange === 'weekly' ? 'active' : ''}`}
              onClick={() => setTimeRange('weekly')}
            >
              Weekly
            </button>
            <button 
              className={`time-btn ${timeRange === 'monthly' ? 'active' : ''}`}
              onClick={() => setTimeRange('monthly')}
            >
              Monthly
            </button>
            <button 
              className={`time-btn ${timeRange === 'quarterly' ? 'active' : ''}`}
              onClick={() => setTimeRange('quarterly')}
            >
              Quarterly
            </button>
            <button 
              className={`time-btn ${timeRange === 'yearly' ? 'active' : ''}`}
              onClick={() => setTimeRange('yearly')}
            >
              Yearly
            </button>
          </div>
          
          <button className="btn btn-primary">
            📥 Export Report
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="overview-grid">
        <div className="stat-card total-revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Commission</h3>
            <div className="stat-value">
              {formatCurrency(analyticsData?.overview.totalCommission || 0)}
            </div>
            <p className="stat-change">↑ 12% from last period</p>
          </div>
        </div>
        
        <div className="stat-card occupancy-rate">
          <div className="stat-icon">🏠</div>
          <div className="stat-content">
            <h3>Occupancy Rate</h3>
            <div className="stat-value">{analyticsData?.overview.averageOccupancy || '0%'}</div>
            <p className="stat-change">↑ 8% from last month</p>
          </div>
        </div>
        
        <div className="stat-card average-rent">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Average Rent</h3>
            <div className="stat-value">{analyticsData?.overview.averageRent || '₦0'}</div>
            <p className="stat-change">↑ 5% from last quarter</p>
          </div>
        </div>
        
        <div className="stat-card properties-count">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Active Properties</h3>
            <div className="stat-value">{analyticsData?.overview.activeRentals || 0}</div>
            <p className="stat-change">of {analyticsData?.overview.totalProperties || 0} total</p>
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="performance-section">
        <div className="section-header">
          <h2>Performance Overview</h2>
          <select className="chart-selector">
            <option value="revenue">Revenue</option>
            <option value="occupancy">Occupancy Rate</option>
            <option value="inquiries">New Inquiries</option>
            <option value="views">Property Views</option>
          </select>
        </div>
        
        <div className="chart-container">
          <div className="chart-placeholder">
            <div className="chart-bars">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="chart-bar" style={{ height: `${60 + Math.random() * 40}%` }}>
                  <div className="bar-value">
                    ₦{((2 + Math.random() * 3) * 1000000).toLocaleString().slice(0, 4)}K
                  </div>
                </div>
              ))}
            </div>
            <div className="chart-labels">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Properties */}
      <div className="top-properties-section">
        <h2>Top Performing Properties</h2>
        <div className="properties-grid">
          {analyticsData?.topProperties.map(property => (
            <div key={property.id} className="property-card">
              <div className="property-rank">#{property.id}</div>
              <h4>{property.name}</h4>
              <div className="property-stats">
                <div className="stat">
                  <span className="label">Revenue:</span>
                  <span className="value">{formatCurrency(property.revenue)}</span>
                </div>
                <div className="stat">
                  <span className="label">Occupancy:</span>
                  <span className="value">{property.occupancy}</span>
                </div>
                <div className="stat">
                  <span className="label">Views:</span>
                  <span className="value">{property.views.toLocaleString()}</span>
                </div>
              </div>
              <button 
                className="btn btn-sm btn-outline"
                onClick={() => navigate(`/dashboard/landlord/properties/${property.id}`)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Trends & Insights */}
      <div className="trends-section">
        <h2>Market Trends & Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">📅</div>
            <div className="insight-content">
              <h4>Peak Rental Month</h4>
              <p>{analyticsData?.trends.peakMonth || 'N/A'}</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">📍</div>
            <div className="insight-content">
              <h4>Best Performing Location</h4>
              <p>{analyticsData?.trends.bestLocation || 'N/A'}</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">⏱️</div>
            <div className="insight-content">
              <h4>Average Vacancy Period</h4>
              <p>{analyticsData?.trends.averageDaysVacant || '0'} days</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">🎯</div>
            <div className="insight-content">
              <h4>Inquiry Conversion Rate</h4>
              <p>{analyticsData?.trends.conversionRate || '0%'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="recommendations-section">
        <h2>Recommendations</h2>
        <div className="recommendations-list">
          <div className="recommendation">
            <div className="rec-icon">💡</div>
            <div className="rec-content">
              <h4>Increase Rent for High-Demand Properties</h4>
              <p>Your properties in Lekki have 98% occupancy. Consider increasing rent by 5-10%.</p>
            </div>
          </div>
          
          <div className="recommendation">
            <div className="rec-icon">💡</div>
            <div className="rec-content">
              <h4>Improve Vacant Property Listings</h4>
              <p>Add professional photos to your vacant properties to increase views by 40%.</p>
            </div>
          </div>
          
          <div className="recommendation">
            <div className="rec-icon">💡</div>
            <div className="rec-content">
              <h4>Renew Tenant Contracts Early</h4>
              <p>Start renewal discussions 60 days before lease ends to maintain occupancy.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;