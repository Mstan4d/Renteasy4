// src/modules/dashboard/components/landlord/Reports.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import './Reports.css';

const Reports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [reportType, setReportType] = useState('financial');
  const [dateRange, setDateRange] = useState('monthly');
  const [reportData, setReportData] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const loadReportData = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockData = {
          financial: {
            totalRevenue: 12500000,
            totalCommission: 937500,
            totalExpenses: 125000,
            netIncome: 810500,
            monthlyBreakdown: [
              { month: 'Jan', revenue: 1050000, commission: 78750 },
              { month: 'Feb', revenue: 1100000, commission: 82500 },
              { month: 'Mar', revenue: 1200000, commission: 90000 },
              { month: 'Apr', revenue: 1150000, commission: 86250 },
              { month: 'May', revenue: 1250000, commission: 93750 },
              { month: 'Jun', revenue: 1300000, commission: 97500 }
            ]
          },
          properties: {
            totalProperties: 12,
            occupied: 8,
            vacant: 3,
            pending: 1,
            averageRent: 2850000,
            occupancyRate: '67%',
            topPerforming: [
              { name: '3 Bedroom Duplex Lekki', revenue: 4200000, occupancy: '100%' },
              { name: '4 Bedroom Terrace VI', revenue: 5200000, occupancy: '100%' },
              { name: '2 Bedroom Flat Ikeja', revenue: 1800000, occupancy: '75%' }
            ]
          },
          tenants: {
            totalTenants: 8,
            averageTenure: '18 months',
            paymentHistory: '97% on-time',
            activeLeases: 8,
            expiringSoon: 2,
            tenantBreakdown: [
              { type: 'Corporate', count: 3, percentage: '38%' },
              { type: 'Individual', count: 5, percentage: '62%' }
            ]
          }
        };
        
        setReportData(mockData);
      } catch (error) {
        console.error('Error loading report data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadReportData();
    }
  }, [user, reportType, dateRange]);

  const goBack = () => {
    navigate('/dashboard/landlord');
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a download link for the report
      const reportContent = `RentEasy Landlord Report
Generated on: ${new Date().toLocaleDateString()}
Report Type: ${reportType}
Period: ${dateRange}

Summary:
${JSON.stringify(reportData[reportType], null, 2)}

© ${new Date().getFullYear()} RentEasy. All rights reserved.`;
      
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `renteasy-report-${reportType}-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('Report downloaded successfully!');
    } catch (error) {
      alert('Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
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
      <div className="reports-loading">
        <div className="loading-spinner"></div>
        <p>Loading report data...</p>
      </div>
    );
  }

  return (
    <div className="reports-container">
      {/* Header */}
      <div className="reports-header">
        <button className="btn btn-back" onClick={goBack}>
          ← Back to Dashboard
        </button>
        <h1>Reports & Analytics</h1>
        <p>Generate detailed reports and insights about your property portfolio</p>
      </div>

      {/* Report Controls */}
      <div className="report-controls">
        <div className="control-group">
          <label>Report Type</label>
          <div className="type-buttons">
            <button 
              className={`type-btn ${reportType === 'financial' ? 'active' : ''}`}
              onClick={() => setReportType('financial')}
            >
              💰 Financial
            </button>
            <button 
              className={`type-btn ${reportType === 'properties' ? 'active' : ''}`}
              onClick={() => setReportType('properties')}
            >
              🏠 Properties
            </button>
            <button 
              className={`type-btn ${reportType === 'tenants' ? 'active' : ''}`}
              onClick={() => setReportType('tenants')}
            >
              👥 Tenants
            </button>
            <button 
              className={`type-btn ${reportType === 'tax' ? 'active' : ''}`}
              onClick={() => setReportType('tax')}
            >
              📊 Tax Summary
            </button>
          </div>
        </div>

        <div className="control-group">
          <label>Date Range</label>
          <div className="range-buttons">
            <button 
              className={`range-btn ${dateRange === 'weekly' ? 'active' : ''}`}
              onClick={() => setDateRange('weekly')}
            >
              Weekly
            </button>
            <button 
              className={`range-btn ${dateRange === 'monthly' ? 'active' : ''}`}
              onClick={() => setDateRange('monthly')}
            >
              Monthly
            </button>
            <button 
              className={`range-btn ${dateRange === 'quarterly' ? 'active' : ''}`}
              onClick={() => setDateRange('quarterly')}
            >
              Quarterly
            </button>
            <button 
              className={`range-btn ${dateRange === 'yearly' ? 'active' : ''}`}
              onClick={() => setDateRange('yearly')}
            >
              Yearly
            </button>
            <button 
              className={`range-btn ${dateRange === 'custom' ? 'active' : ''}`}
              onClick={() => setDateRange('custom')}
            >
              Custom
            </button>
          </div>
        </div>
      </div>

      {/* Report Summary */}
      <div className="report-summary">
        <div className="summary-card total-revenue">
          <div className="summary-icon">💰</div>
          <div className="summary-content">
            <h3>Total Revenue</h3>
            <div className="summary-value">
              {formatCurrency(reportData?.financial?.totalRevenue || 0)}
            </div>
            <p className="summary-period">Last 6 months</p>
          </div>
        </div>
        
        <div className="summary-card net-income">
          <div className="summary-icon">📈</div>
          <div className="summary-content">
            <h3>Net Income</h3>
            <div className="summary-value">
              {formatCurrency(reportData?.financial?.netIncome || 0)}
            </div>
            <p className="summary-period">After commission & expenses</p>
          </div>
        </div>
        
        <div className="summary-card properties-count">
          <div className="summary-icon">🏠</div>
          <div className="summary-content">
            <h3>Properties</h3>
            <div className="summary-value">
              {reportData?.properties?.totalProperties || 0}
            </div>
            <p className="summary-period">{reportData?.properties?.occupancyRate || '0%'} occupancy</p>
          </div>
        </div>
        
        <div className="summary-card commission-earned">
          <div className="summary-icon">🎯</div>
          <div className="summary-content">
            <h3>Commission Earned</h3>
            <div className="summary-value">
              {formatCurrency(reportData?.financial?.totalCommission || 0)}
            </div>
            <p className="summary-period">7.5% of total revenue</p>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="report-content">
        
        {/* Financial Report */}
        {reportType === 'financial' && reportData?.financial && (
          <div className="financial-report">
            <div className="section-header">
              <h2>Financial Report</h2>
              <div className="header-actions">
                <button className="btn btn-outline">
                  📊 View Charts
                </button>
                <button className="btn btn-outline">
                  📈 Compare Periods
                </button>
              </div>
            </div>
            
            <div className="financial-stats">
              <div className="stat-card">
                <h4>Revenue Breakdown</h4>
                <div className="revenue-breakdown">
                  {reportData.financial.monthlyBreakdown.map((item, index) => (
                    <div key={index} className="breakdown-item">
                      <span className="month">{item.month}</span>
                      <div className="bar-container">
                        <div 
                          className="revenue-bar" 
                          style={{ width: `${(item.revenue / 1500000) * 100}%` }}
                        >
                          <span className="bar-value">
                            {formatCurrency(item.revenue)}
                          </span>
                        </div>
                      </div>
                      <span className="commission">
                        {formatCurrency(item.commission)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="stat-card">
                <h4>Income Statement</h4>
                <div className="income-statement">
                  <div className="statement-item">
                    <span className="label">Total Rental Revenue</span>
                    <span className="value">
                      {formatCurrency(reportData.financial.totalRevenue)}
                    </span>
                  </div>
                  <div className="statement-item">
                    <span className="label">Less: Commission (7.5%)</span>
                    <span className="value negative">
                      -{formatCurrency(reportData.financial.totalCommission)}
                    </span>
                  </div>
                  <div className="statement-item">
                    <span className="label">Less: Operating Expenses</span>
                    <span className="value negative">
                      -{formatCurrency(reportData.financial.totalExpenses)}
                    </span>
                  </div>
                  <div className="statement-item total">
                    <span className="label">Net Income</span>
                    <span className="value positive">
                      {formatCurrency(reportData.financial.netIncome)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Properties Report */}
        {reportType === 'properties' && reportData?.properties && (
          <div className="properties-report">
            <div className="section-header">
              <h2>Properties Report</h2>
              <div className="header-actions">
                <button className="btn btn-outline">
                  🗺️ View Map
                </button>
                <button className="btn btn-outline">
                  📋 Export List
                </button>
              </div>
            </div>
            
            <div className="properties-stats">
              <div className="stat-card">
                <h4>Portfolio Overview</h4>
                <div className="portfolio-stats">
                  <div className="stat-item">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                      <span className="label">Occupied</span>
                      <span className="value">{reportData.properties.occupied} properties</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-content">
                      <span className="label">Vacant</span>
                      <span className="value">{reportData.properties.vacant} properties</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">📋</div>
                    <div className="stat-content">
                      <span className="label">Pending</span>
                      <span className="value">{reportData.properties.pending} properties</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                      <span className="label">Occupancy Rate</span>
                      <span className="value">{reportData.properties.occupancyRate}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <h4>Top Performing Properties</h4>
                <div className="top-properties">
                  {reportData.properties.topPerforming.map((property, index) => (
                    <div key={index} className="property-item">
                      <div className="property-rank">#{index + 1}</div>
                      <div className="property-info">
                        <h5>{property.name}</h5>
                        <div className="property-stats">
                          <span className="stat">
                            Revenue: {formatCurrency(property.revenue)}
                          </span>
                          <span className="stat">
                            Occupancy: {property.occupancy}
                          </span>
                        </div>
                      </div>
                      <button className="btn btn-sm btn-outline">
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Tenants Report */}
        {reportType === 'tenants' && reportData?.tenants && (
          <div className="tenants-report">
            <div className="section-header">
              <h2>Tenants Report</h2>
              <div className="header-actions">
                <button className="btn btn-outline">
                  👥 Tenant Directory
                </button>
                <button className="btn btn-outline">
                  📅 Lease Calendar
                </button>
              </div>
            </div>
            
            <div className="tenants-stats">
              <div className="stat-card">
                <h4>Tenant Overview</h4>
                <div className="overview-stats">
                  <div className="stat-item">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                      <span className="label">Total Tenants</span>
                      <span className="value">{reportData.tenants.totalTenants}</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">⏱️</div>
                    <div className="stat-content">
                      <span className="label">Average Tenure</span>
                      <span className="value">{reportData.tenants.averageTenure}</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                      <span className="label">Payment History</span>
                      <span className="value">{reportData.tenants.paymentHistory}</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">📅</div>
                    <div className="stat-content">
                      <span className="label">Expiring Soon</span>
                      <span className="value">{reportData.tenants.expiringSoon}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <h4>Tenant Demographics</h4>
                <div className="demographics-chart">
                  <div className="chart-placeholder">
                    {reportData.tenants.tenantBreakdown.map((item, index) => (
                      <div key={index} className="demographic-item">
                        <div className="item-header">
                          <span className="type">{item.type}</span>
                          <span className="percentage">{item.percentage}</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: item.percentage }}
                          ></div>
                        </div>
                        <div className="item-count">
                          {item.count} tenants
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Tax Report */}
        {reportType === 'tax' && (
          <div className="tax-report">
            <div className="section-header">
              <h2>Tax Summary Report</h2>
              <div className="header-actions">
                <button className="btn btn-outline">
                  📋 Tax Forms
                </button>
                <button className="btn btn-outline">
                  📊 Tax Calculator
                </button>
              </div>
            </div>
            
            <div className="tax-content">
              <div className="tax-card">
                <h4>Annual Tax Summary</h4>
                <div className="tax-statement">
                  <div className="tax-item">
                    <span className="label">Total Rental Income</span>
                    <span className="value">{formatCurrency(12500000)}</span>
                  </div>
                  <div className="tax-item">
                    <span className="label">Allowable Deductions</span>
                    <span className="value negative">-{formatCurrency(2500000)}</span>
                  </div>
                  <div className="tax-item">
                    <span className="label">Taxable Income</span>
                    <span className="value">{formatCurrency(10000000)}</span>
                  </div>
                  <div className="tax-item">
                    <span className="label">Tax Rate (10%)</span>
                    <span className="value">10%</span>
                  </div>
                  <div className="tax-item total">
                    <span className="label">Estimated Tax Liability</span>
                    <span className="value negative">-{formatCurrency(1000000)}</span>
                  </div>
                </div>
              </div>
              
              <div className="tax-card">
                <h4>Tax Deadlines</h4>
                <div className="deadlines-list">
                  <div className="deadline-item">
                    <div className="deadline-icon">📅</div>
                    <div className="deadline-info">
                      <h5>Q1 Tax Payment</h5>
                      <p>Due: March 31, 2024</p>
                    </div>
                    <span className="status upcoming">Upcoming</span>
                  </div>
                  <div className="deadline-item">
                    <div className="deadline-icon">📅</div>
                    <div className="deadline-info">
                      <h5>Annual Tax Return</h5>
                      <p>Due: April 30, 2024</p>
                    </div>
                    <span className="status upcoming">Upcoming</span>
                  </div>
                  <div className="deadline-item">
                    <div className="deadline-icon">📅</div>
                    <div className="deadline-info">
                      <h5>Q4 Tax Payment</h5>
                      <p>Paid: Dec 31, 2023</p>
                    </div>
                    <span className="status paid">Paid</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Report Actions */}
      <div className="report-actions">
        <div className="action-card">
          <h3>Export Options</h3>
          <div className="export-buttons">
            <button className="btn btn-outline">
              📄 PDF Report
            </button>
            <button className="btn btn-outline">
              📊 Excel Spreadsheet
            </button>
            <button className="btn btn-outline">
              📈 CSV Data
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleGenerateReport}
              disabled={generating}
            >
              {generating ? 'Generating...' : '📥 Generate Full Report'}
            </button>
          </div>
        </div>
        
        <div className="action-card">
          <h3>Schedule Reports</h3>
          <div className="schedule-options">
            <div className="schedule-item">
              <input type="checkbox" id="weekly-report" />
              <label htmlFor="weekly-report">
                <span className="schedule-label">Weekly Report</span>
                <span className="schedule-time">Every Monday, 9:00 AM</span>
              </label>
            </div>
            <div className="schedule-item">
              <input type="checkbox" id="monthly-report" defaultChecked />
              <label htmlFor="monthly-report">
                <span className="schedule-label">Monthly Report</span>
                <span className="schedule-time">1st of each month</span>
              </label>
            </div>
            <div className="schedule-item">
              <input type="checkbox" id="quarterly-report" />
              <label htmlFor="quarterly-report">
                <span className="schedule-label">Quarterly Report</span>
                <span className="schedule-time">End of each quarter</span>
              </label>
            </div>
            <button className="btn btn-outline">
              ⚙️ Configure Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;