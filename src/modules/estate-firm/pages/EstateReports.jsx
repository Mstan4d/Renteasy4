// src/modules/estate-firm/pages/EstateReports.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, PieChart, TrendingUp, Download,
  Filter, Calendar, FileText, Users, DollarSign,
  Building, Target, AlertCircle, CheckCircle,
  Home, Receipt, Clock, UserCheck, XCircle
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import { documentGenerator } from '../../../shared/lib/documentGenerator';
import './EstateReports.css';

const EstateReports = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [estateFirmId, setEstateFirmId] = useState(null);
  
  // Date range filter
  const [dateRange, setDateRange] = useState('monthly');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Report type filter
  const [reportType, setReportType] = useState('all');
  
  // Data states
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    previousRevenue: 0,
    propertiesManaged: 0,
    previousProperties: 0,
    activeClients: 0,
    previousClients: 0,
    occupancyRate: 0,
    previousOccupancy: 0
  });

  const [reports, setReports] = useState([]);
  const [financialData, setFinancialData] = useState({
    monthlyRevenue: [],
    paymentMethods: [],
    revenueByProperty: []
  });

  const [portfolioData, setPortfolioData] = useState({
    propertyTypes: [],
    occupancyByType: [],
    revenueByType: []
  });

  const [clientData, setClientData] = useState({
    topTenants: [],
    tenantPayments: [],
    newClients: []
  });

  // Load estate firm profile ID
  useEffect(() => {
    const loadEstateFirmId = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('estate_firm_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!error && data) {
        setEstateFirmId(data.id);
      }
    };
    
    loadEstateFirmId();
  }, [user]);

  // Load all data when filters change
  useEffect(() => {
    if (estateFirmId) {
      loadAllData();
      loadSavedReports();
    }
  }, [estateFirmId, dateRange, customStartDate, customEndDate]);

  const getDateRangeFilter = () => {
    const now = new Date();
    let startDate = new Date();
    
    switch(dateRange) {
      case 'daily':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarterly':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'yearly':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          return { gte: customStartDate, lte: customEndDate };
        }
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }
    
    return { gte: startDate.toISOString() };
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const dateFilter = getDateRangeFilter();
      const previousPeriodStart = getPreviousPeriodStart();
      
      // Load properties (listings + external)
      const [listingsRes, propertiesRes, unitsRes, paymentsRes] = await Promise.all([
        supabase
          .from('listings')
          .select('id, title, price, status, property_type, created_at, tenant_id')
          .eq('estate_firm_id', estateFirmId),
        
        supabase
          .from('properties')
          .select('id, name, status, property_type, created_at')
          .eq('estate_firm_id', estateFirmId),
        
        supabase
          .from('units')
          .select('id, property_id, status, rent_amount, tenant_id')
          .in('property_id', []) // Will be populated after properties fetched
          .then(async (res) => {
            // This will be handled after properties load
            return { data: [] };
          }),
        
        supabase
          .from('payments')
          .select('id, amount, payment_date, unit_id, status')
          .gte('payment_date', dateFilter.gte)
          .order('payment_date', { ascending: false })
      ]);

      // Get all property IDs from listings and properties
      const propertyIds = [
        ...(listingsRes.data || []).map(l => l.id),
        ...(propertiesRes.data || []).map(p => p.id)
      ];

      // Load units for these properties
      const { data: unitsData } = await supabase
        .from('units')
        .select('id, property_id, status, rent_amount, tenant_id')
        .in('property_id', propertyIds);

      // Load rent payments
      const { data: rentPayments } = await supabase
        .from('rent_payments')
        .select('id, amount_due, paid_date, unit_id, status')
        .gte('paid_date', dateFilter.gte);

      // Combine all data
      const allProperties = [
        ...(listingsRes.data || []).map(l => ({ ...l, source: 'rent-easy' })),
        ...(propertiesRes.data || []).map(p => ({ ...p, source: 'external' }))
      ];

      // Calculate metrics
      const totalProperties = allProperties.length;
      
      // Count occupied units
      const occupiedUnits = (unitsData || []).filter(u => 
        u.status === 'occupied' && u.tenant_id
      ).length;
      
      const totalUnits = (unitsData || []).length;
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

      // Calculate revenue
      const payments = [...(paymentsRes.data || []), ...(rentPayments || [])];
      const totalRevenue = payments.reduce((sum, p) => 
        sum + (p.amount || p.amount_due || 0), 0
      );

      // Get previous period revenue for comparison
      const { data: previousPayments } = await supabase
        .from('payments')
        .select('amount')
        .gte('payment_date', previousPeriodStart.gte)
        .lt('payment_date', dateFilter.gte);

      const previousRevenue = previousPayments?.reduce((sum, p) => 
        sum + (p.amount || 0), 0
      ) || 0;

      // Count unique tenants
      const tenantIds = new Set(
        (unitsData || [])
          .filter(u => u.tenant_id)
          .map(u => u.tenant_id)
      );
      const activeClients = tenantIds.size;

      // Prepare monthly revenue for chart
      const monthlyRevenue = {};
      payments.forEach(p => {
        const date = new Date(p.paid_date || p.payment_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + (p.amount || p.amount_due || 0);
      });

      const monthlyRevenueArray = Object.entries(monthlyRevenue)
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => a.month.localeCompare(b.month));

      // Prepare property type distribution
      const propertyTypes = {};
      allProperties.forEach(p => {
        const type = p.property_type || 'other';
        propertyTypes[type] = (propertyTypes[type] || 0) + 1;
      });

      const propertyTypeArray = Object.entries(propertyTypes)
        .map(([type, count]) => ({ type, count }));

      // Set metrics
      setMetrics({
        totalRevenue,
        previousRevenue,
        propertiesManaged: totalProperties,
        previousProperties: 0, // Calculate if needed
        activeClients,
        previousClients: 0,
        occupancyRate: Math.round(occupancyRate * 10) / 10,
        previousOccupancy: 0
      });

      // Set financial data
      setFinancialData({
        monthlyRevenue: monthlyRevenueArray,
        paymentMethods: [], // Add if you track payment methods
        revenueByProperty: [] // Add if needed
      });

      // Set portfolio data
      setPortfolioData({
        propertyTypes: propertyTypeArray,
        occupancyByType: [], // Add if needed
        revenueByType: []
      });

      // Set client data (top tenants by payment)
      const tenantPayments = {};
      payments.forEach(p => {
        if (p.unit_id) {
          const unit = (unitsData || []).find(u => u.id === p.unit_id);
          if (unit?.tenant_id) {
            tenantPayments[unit.tenant_id] = (tenantPayments[unit.tenant_id] || 0) + (p.amount || p.amount_due || 0);
          }
        }
      });

      const topTenants = await Promise.all(
        Object.entries(tenantPayments)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(async ([tenantId, amount]) => {
            const { data } = await supabase
              .from('profiles')
              .select('full_name, name')
              .eq('id', tenantId)
              .single();
            return {
              name: data?.full_name || data?.name || 'Unknown',
              amount
            };
          })
      );

      setClientData({
        topTenants,
        tenantPayments: [], // Add if needed
        newClients: [] // Add if needed
      });

    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPreviousPeriodStart = () => {
    const now = new Date();
    const start = new Date();
    
    switch(dateRange) {
      case 'daily':
        start.setDate(now.getDate() - 2);
        break;
      case 'weekly':
        start.setDate(now.getDate() - 14);
        break;
      case 'monthly':
        start.setMonth(now.getMonth() - 2);
        break;
      case 'quarterly':
        start.setMonth(now.getMonth() - 6);
        break;
      case 'yearly':
        start.setFullYear(now.getFullYear() - 2);
        break;
      default:
        start.setMonth(now.getMonth() - 2);
    }
    
    return { gte: start.toISOString() };
  };

  const loadSavedReports = async () => {
  try {
    const { data, error } = await supabase
      .from('estate_reports')
      .select('id, user_id, title, report_type, period, file_url, file_size, status, downloads, generated_at, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setReports(data);
    }
  } catch (error) {
    console.error('Error loading saved reports:', error);
  }
};

  const generateReport = async (type) => {
  if (!estateFirmId) return;

  setGenerating(true);
  try {
    // 1. Create report record with exact matching columns
    const reportData = {
      user_id: user.id,  // Note: it's user_id, not estate_firm_id
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report - ${new Date().toLocaleDateString()}`,
      report_type: type,
      period: getDateRangeLabel(), // This will be a string like "This Month", "Custom Range", etc.
      file_url: 'pending',
      status: 'generating',
      downloads: 0,
      parameters: {
        metrics,
        financial: financialData,
        portfolio: portfolioData,
        clients: clientData,
        date_range: dateRange,
        custom_start: customStartDate,
        custom_end: customEndDate
      },
      created_at: new Date().toISOString()
    };

    const { data: report, error } = await supabase
      .from('estate_reports')
      .insert(reportData)
      .select()
      .single();

    if (error) throw error;

    // 2. Generate PDF document
    const pdfDefinition = {
      content: [
        { text: reportData.title, style: 'header' },
        { text: `Generated: ${new Date().toLocaleString()}`, alignment: 'right' },
        { text: `Period: ${reportData.period}`, alignment: 'right' },
        { text: '\n' },
        { text: 'Executive Summary', style: 'subheader' },
        {
          columns: [
            {
              width: '*',
              text: [
                { text: 'Total Revenue: ', bold: true },
                `₦${metrics.totalRevenue.toLocaleString()}\n`,
                { text: 'Properties Managed: ', bold: true },
                `${metrics.propertiesManaged}\n`,
                { text: 'Active Clients: ', bold: true },
                `${metrics.activeClients}\n`,
                { text: 'Occupancy Rate: ', bold: true },
                `${metrics.occupancyRate}%`
              ]
            }
          ]
        },
        { text: '\n' },
        { text: 'Financial Summary', style: 'subheader' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto'],
            body: [
              ['Month', 'Revenue'],
              ...(financialData.monthlyRevenue.length > 0 
                ? financialData.monthlyRevenue.map(m => [m.month, `₦${m.amount.toLocaleString()}`])
                : [['No data', '₦0']])
            ]
          }
        },
        { text: '\n' },
        { text: 'Portfolio Summary', style: 'subheader' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto'],
            body: [
              ['Property Type', 'Count'],
              ...(portfolioData.propertyTypes.length > 0
                ? portfolioData.propertyTypes.map(p => [p.type, p.count.toString()])
                : [['No data', '0']])
            ]
          }
        },
        { text: '\n' },
        { text: 'Top Tenants', style: 'subheader' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto'],
            body: [
              ['Tenant Name', 'Total Paid'],
              ...(clientData.topTenants.length > 0
                ? clientData.topTenants.map(t => [t.name, `₦${t.amount.toLocaleString()}`])
                : [['No tenants', '₦0']])
            ]
          }
        }
      ],
      styles: {
        header: { fontSize: 22, bold: true, margin: [0, 0, 0, 20] },
        subheader: { fontSize: 16, bold: true, margin: [0, 10, 0, 5] }
      }
    };

    // 3. Generate PDF using documentGenerator
    const pdfDoc = await documentGenerator.generateReport(pdfDefinition, {
      title: `${type}-report-${Date.now()}`,
      user_id: user.id  // Pass user_id for the document record
    });

    // 4. Update report with file URL and status
    const { error: updateError } = await supabase
      .from('estate_reports')
      .update({
        status: 'ready',
        file_url: pdfDoc.file_url,
        file_size: pdfDoc.file_size,
        generated_at: new Date().toISOString()
      })
      .eq('id', report.id);

    if (updateError) throw updateError;

    // 5. Refresh reports list
    loadSavedReports();
    
    alert('Report generated successfully!');

  } catch (error) {
    console.error('Error generating report:', error);
    alert('Failed to generate report. Please try again.');
  } finally {
    setGenerating(false);
  }
};
  const downloadReport = async (reportId, fileUrl) => {
  try {
    // Increment download count
    await supabase
      .from('estate_reports')
      .update({ downloads: supabase.raw('COALESCE(downloads, 0) + 1') })
      .eq('id', reportId);

    // Open file in new tab
    window.open(fileUrl, '_blank');
  } catch (error) {
    console.error('Error downloading report:', error);
  }
};

  const calculateChange = (current, previous) => {
    if (previous === 0) return '+0%';
    const change = ((current - previous) / previous) * 100;
    return change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  };

  const formatCurrency = (amount) => `₦${(amount || 0).toLocaleString()}`;

  const getReportIcon = (type) => {
    switch(type) {
      case 'financial': return DollarSign;
      case 'portfolio': return Building;
      case 'clients': return Users;
      case 'market': return BarChart3;
      case 'staff': return Users;
      default: return FileText;
    }
  };

  const getDateRangeLabel = () => {
  switch(dateRange) {
    case 'daily': return 'Today';
    case 'weekly': return 'This Week';
    case 'monthly': return 'This Month';
    case 'quarterly': return 'This Quarter';
    case 'yearly': return 'This Year';
    case 'custom': 
      return customStartDate && customEndDate 
        ? `${customStartDate} to ${customEndDate}` 
        : 'Custom Range';
    default: return 'This Month';
  }
};

  if (loading) {
    return (
      <div className="estate-reports">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="estate-reports">
      {/* Header */}
      <div className="reports-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p className="subtitle">Real-time insights from your property portfolio</p>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => generateReport('financial')}
            disabled={generating}
          >
            <FileText size={18} />
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
          <button className="btn btn-outline" onClick={() => loadAllData()}>
            <Download size={18} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-icon"><DollarSign size={24} /></div>
          <div className="stat-details">
            <span className="stat-value">{formatCurrency(metrics.totalRevenue)}</span>
            <span className="stat-label">Total Revenue</span>
            <span className={`stat-change ${metrics.totalRevenue >= metrics.previousRevenue ? 'positive' : 'negative'}`}>
              <TrendingUp size={12} />
              {calculateChange(metrics.totalRevenue, metrics.previousRevenue)}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><Building size={24} /></div>
          <div className="stat-details">
            <span className="stat-value">{metrics.propertiesManaged}</span>
            <span className="stat-label">Properties Managed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><Users size={24} /></div>
          <div className="stat-details">
            <span className="stat-value">{metrics.activeClients}</span>
            <span className="stat-label">Active Clients</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><CheckCircle size={24} /></div>
          <div className="stat-details">
            <span className="stat-value">{metrics.occupancyRate}%</span>
            <span className="stat-label">Occupancy Rate</span>
          </div>
        </div>
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

          {dateRange === 'custom' && (
            <>
              <div className="filter-group">
                <label>Start Date</label>
                <input
                  type="date"
                  className="filter-select"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>End Date</label>
                <input
                  type="date"
                  className="filter-select"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </>
          )}

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

      {/* Saved Reports */}
      {reports.length > 0 && (
        <>
          <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>Recent Reports</h3>
          <div className="reports-grid">
            {reports
  .filter(r => reportType === 'all' || r.report_type === reportType)
  .map(report => {
    const Icon = getReportIcon(report.report_type);
    return (
      <div key={report.id} className="report-card">
        <div className="report-header">
          <div className="report-icon">
            <Icon size={20} />
          </div>
          <div className="report-info">
            <h4>{report.title}</h4>
            <div className="report-meta">
              <span>
                <Calendar size={12} />
                {new Date(report.created_at).toLocaleDateString()}
              </span>
              <span>
                <Download size={12} />
                {report.downloads || 0} downloads
              </span>
              <span>
                <Clock size={12} />
                {report.period}
              </span>
            </div>
          </div>
          {report.status === 'generating' && (
            <span className="status-badge processing">
              <Clock size={12} />
              Processing
            </span>
          )}
        </div>

        <div className="report-footer">
          <div className="report-details">
            <span>Size: {report.file_size ? `${(report.file_size / 1024).toFixed(1)} KB` : 'N/A'}</span>
            <span>Type: {report.report_type}</span>
          </div>
          <div className="report-actions">
            {report.status === 'ready' && report.file_url && (
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => downloadReport(report.id, report.file_url)}
              >
                <Download size={14} />
                Download
              </button>
            )}
            {report.status === 'generating' && (
              <button className="btn btn-sm" disabled>
                <Clock size={14} />
                Generating...
              </button>
            )}
          </div>
        </div>
      </div>
    );
  })}
          </div>
        </>
      )}

      {/* Analytics Preview */}
      <div className="analytics-preview">
        <div className="analytics-header">
          <h3>Financial Overview - {getDateRangeLabel()}</h3>
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
            <p>Revenue Trend</p>
            <small>
              {financialData.monthlyRevenue.length > 0 
                ? `${financialData.monthlyRevenue.length} months of data` 
                : 'No data available'}
            </small>
          </div>
          
          <div className="chart-placeholder">
            <PieChart size={48} />
            <p>Property Distribution</p>
            <small>
              {portfolioData.propertyTypes.length > 0
                ? `${portfolioData.propertyTypes.length} property types`
                : 'No data available'}
            </small>
          </div>
          
          <div className="chart-placeholder">
            <TrendingUp size={48} />
            <p>Top Tenants</p>
            <small>
              {clientData.topTenants.length > 0
                ? `${clientData.topTenants.length} top tenants`
                : 'No data available'}
            </small>
          </div>
        </div>
      </div>

      {/* Report Templates */}
      <div className="report-templates">
        <h3>Quick Generate Reports</h3>
        <div className="templates-grid">
          {[
            { name: 'Financial Summary', icon: DollarSign, color: '#10b981', type: 'financial' },
            { name: 'Portfolio Health', icon: Building, color: '#3b82f6', type: 'portfolio' },
            { name: 'Client Report', icon: Users, color: '#8b5cf6', type: 'clients' },
            { name: 'Market Analysis', icon: Target, color: '#f59e0b', type: 'market' },
            { name: 'Rent Collection', icon: Receipt, color: '#ef4444', type: 'financial' },
            { name: 'Performance Review', icon: TrendingUp, color: '#ec4899', type: 'portfolio' }
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
                onClick={() => generateReport(template.type)}
                disabled={generating}
              >
                {generating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EstateReports;