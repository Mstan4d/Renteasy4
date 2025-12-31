import React, { useState } from 'react';
import {
  BarChart3, PieChart, TrendingUp, Download,
  Filter, Calendar, FileText, Users, DollarSign,
  Building, Target, AlertCircle, CheckCircle
} from 'lucide-react';
import './EstateReports.css';

const EstateReports = () => {
  const [dateRange, setDateRange] = useState('monthly');
  const [reportType, setReportType] = useState('financial');

  const reports = [
    {
      id: 'report_001',
      title: 'Monthly Financial Report',
      type: 'financial',
      period: 'November 2024',
      generated: '2024-12-01',
      size: '2.4 MB',
      status: 'ready',
      downloads: 12
    },
    {
      id: 'report_002',
      title: 'Property Portfolio Analysis',
      type: 'portfolio',
      period: 'Q4 2024',
      generated: '2024-11-28',
      size: '1.8 MB',
      status: 'ready',
      downloads: 8
    },
    {
      id: 'report_003',
      title: 'Client Performance Report',
      type: 'clients',
      period: 'November 2024',
      generated: '2024-11-25',
      size: '1.2 MB',
      status: 'ready',
      downloads: 15
    },
    {
      id: 'report_004',
      title: 'Rent Collection Report',
      type: 'financial',
      period: 'October 2024',
      generated: '2024-11-01',
      size: '1.5 MB',
      downloads: 6
    },
    {
      id: 'report_005',
      title: 'Market Analysis Report',
      type: 'market',
      period: 'Q3 2024',
      generated: '2024-10-15',
      size: '3.2 MB',
      downloads: 9
    },
    {
      id: 'report_006',
      title: 'Staff Performance Report',
      type: 'staff',
      period: 'November 2024',
      generated: '2024-11-30',
      size: '1.0 MB',
      status: 'generating',
      downloads: 0
    }
  ];

  const metrics = [
    { label: 'Total Revenue', value: '₦45.2M', change: '+12%', icon: DollarSign },
    { label: 'Properties Managed', value: '156', change: '+8%', icon: Building },
    { label: 'Active Clients', value: '89', change: '+5%', icon: Users },
    { label: 'Occupancy Rate', value: '92%', change: '+3%', icon: CheckCircle }
  ];

  const generateReport = async (type) => {
    console.log(`Generating ${type} report...`);
    // API call to generate report
  };

  const downloadReport = (reportId) => {
    console.log(`Downloading report ${reportId}`);
    // API call to download report
  };

  const filteredReports = reports.filter(report => 
    reportType === 'all' ? true : report.type === reportType
  );

  return (
    <div className="estate-reports">
      {/* Header */}
      <div className="reports-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p className="subtitle">Generate and download business reports</p>
        </div>
        
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => generateReport('financial')}>
            <FileText size={18} />
            Generate Report
          </button>
          <button className="btn btn-outline">
            <Download size={18} />
            Export All
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="stat-card">
              <div className="stat-icon">
                <Icon size={24} />
              </div>
              <div className="stat-details">
                <span className="stat-value">{metric.value}</span>
                <span className="stat-label">{metric.label}</span>
                <span className="stat-change positive">
                  <TrendingUp size={12} />
                  {metric.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="reports-controls">
        <div className="filters">
          <div className="filter-group">
            <label>
              <Calendar size={16} />
              Period
            </label>
            <select 
              className="filter-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="daily">Today</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="quarterly">This Quarter</option>
              <option value="yearly">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>
              <Filter size={16} />
              Report Type
            </label>
            <select 
              className="filter-select"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="all">All Reports</option>
              <option value="financial">Financial</option>
              <option value="portfolio">Portfolio</option>
              <option value="clients">Clients</option>
              <option value="market">Market</option>
              <option value="staff">Staff</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div className="reports-grid">
        {filteredReports.map(report => (
          <div key={report.id} className="report-card">
            <div className="report-header">
              <div className="report-icon">
                {report.type === 'financial' && <DollarSign size={20} />}
                {report.type === 'portfolio' && <Building size={20} />}
                {report.type === 'clients' && <Users size={20} />}
                {report.type === 'market' && <BarChart3 size={20} />}
                {report.type === 'staff' && <Users size={20} />}
              </div>
              
              <div className="report-info">
                <h4>{report.title}</h4>
                <div className="report-meta">
                  <span className="period">
                    <Calendar size={12} />
                    {report.period}
                  </span>
                  <span className="size">{report.size}</span>
                </div>
              </div>
              
              {report.status === 'generating' && (
                <span className="status-badge processing">
                  <AlertCircle size={12} />
                  Processing
                </span>
              )}
            </div>

            <div className="report-footer">
              <div className="report-details">
                <span>Generated: {report.generated}</span>
                <span>Downloads: {report.downloads}</span>
              </div>
              
              <div className="report-actions">
                <button 
                  className="btn btn-sm"
                  onClick={() => downloadReport(report.id)}
                  disabled={report.status === 'generating'}
                >
                  <Download size={14} />
                  Download
                </button>
                <button className="btn btn-sm btn-outline">
                  Preview
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Preview */}
      <div className="analytics-preview">
        <div className="analytics-header">
          <h3>Analytics Dashboard</h3>
          <div className="view-options">
            <button className="view-option active">
              <BarChart3 size={16} />
              Bar Chart
            </button>
            <button className="view-option">
              <PieChart size={16} />
              Pie Chart
            </button>
            <button className="view-option">
              <TrendingUp size={16} />
              Line Chart
            </button>
          </div>
        </div>
        
        <div className="charts-container">
          <div className="chart-placeholder">
            <BarChart3 size={48} />
            <p>Revenue Growth Chart</p>
            <small>Monthly revenue comparison</small>
          </div>
          
          <div className="chart-placeholder">
            <PieChart size={48} />
            <p>Property Distribution</p>
            <small>By type and location</small>
          </div>
          
          <div className="chart-placeholder">
            <TrendingUp size={48} />
            <p>Client Acquisition</p>
            <small>Monthly client growth</small>
          </div>
        </div>
      </div>

      {/* Report Templates */}
      <div className="report-templates">
        <h3>Report Templates</h3>
        <div className="templates-grid">
          {[
            { name: 'Financial Summary', icon: DollarSign, color: '#10b981' },
            { name: 'Portfolio Health', icon: Building, color: '#3b82f6' },
            { name: 'Client Report', icon: Users, color: '#8b5cf6' },
            { name: 'Market Analysis', icon: Target, color: '#f59e0b' },
            { name: 'Rent Collection', icon: DollarSign, color: '#ef4444' },
            { name: 'Performance Review', icon: TrendingUp, color: '#ec4899' }
          ].map((template, index) => (
            <div key={index} className="template-card">
              <div 
                className="template-icon"
                style={{ backgroundColor: `${template.color}20` }}
              >
                <template.icon size={24} color={template.color} />
              </div>
              <h4>{template.name}</h4>
              <button 
                className="btn btn-sm btn-outline"
                onClick={() => generateReport(template.name.toLowerCase())}
              >
                Generate
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EstateReports;