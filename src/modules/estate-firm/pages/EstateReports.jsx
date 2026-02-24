import React, { useState, useEffect } from 'react';
import {
  BarChart3, PieChart, TrendingUp, Download,
  Filter, Calendar, FileText, Users, DollarSign,
  Building, Target, AlertCircle, CheckCircle
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import './EstateReports.css';

const EstateReports = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('monthly');
  const [reportType, setReportType] = useState('all');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [metrics, setMetrics] = useState([
    { label: 'Total Revenue', value: '₦0', change: '+0%', icon: DollarSign },
    { label: 'Properties Managed', value: '0', change: '+0%', icon: Building },
    { label: 'Active Clients', value: '0', change: '+0%', icon: Users },
    { label: 'Occupancy Rate', value: '0%', change: '+0%', icon: CheckCircle }
  ]);

  useEffect(() => {
    if (user) {
      loadReports();
      loadMetrics();
    }
  }, [user, dateRange]);

  const loadReports = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('estate_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('generated_at', { ascending: false });

      // Filter by date range if needed
      if (dateRange !== 'all') {
        const startDate = getDateRangeStart(dateRange);
        query = query.gte('generated_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setReports(data || []);

    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      // Load firm profile for stats
      const { data: profile } = await supabase
        .from('estate_firm_profiles')
        .select('stats')
        .eq('user_id', user.id)
        .single();

      if (profile?.stats) {
        setMetrics([
          { 
            label: 'Total Revenue', 
            value: `₦${(profile.stats.monthly_revenue || 0).toLocaleString()}`, 
            change: '+12%', 
            icon: DollarSign 
          },
          { 
            label: 'Properties Managed', 
            value: (profile.stats.total_properties || 0).toString(), 
            change: '+8%', 
            icon: Building 
          },
          { 
            label: 'Active Clients', 
            value: (profile.stats.active_clients || 0).toString(), 
            change: '+5%', 
            icon: Users 
          },
          { 
            label: 'Occupancy Rate', 
            value: '92%', 
            change: '+3%', 
            icon: CheckCircle 
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const getDateRangeStart = (range) => {
    const now = new Date();
    switch(range) {
      case 'daily': return new Date(now.setDate(now.getDate() - 1));
      case 'weekly': return new Date(now.setDate(now.getDate() - 7));
      case 'monthly': return new Date(now.setMonth(now.getMonth() - 1));
      case 'quarterly': return new Date(now.setMonth(now.getMonth() - 3));
      case 'yearly': return new Date(now.setFullYear(now.getFullYear() - 1));
      default: return new Date(0);
    }
  };

  const generateReport = async (type) => {
    if (!user) return;

    try {
      setGenerating(true);

      // Create report entry
      const reportData = {
        user_id: user.id,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report - ${new Date().toLocaleDateString()}`,
        report_type: type,
        period: getPeriodText(dateRange),
        file_url: '', // Will be updated after generation
        status: 'generating',
        parameters: {
          date_range: dateRange,
          generated_at: new Date().toISOString()
        }
      };

      const { data: report, error } = await supabase
        .from('estate_reports')
        .insert(reportData)
        .select()
        .single();

      if (error) throw error;

      // Generate report content (simulated)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update report with file URL
      const { error: updateError } = await supabase
        .from('estate_reports')
        .update({
          status: 'ready',
          file_url: `/reports/${report.id}.pdf`,
          generated_at: new Date().toISOString()
        })
        .eq('id', report.id);

      if (updateError) throw updateError;

      // Log activity
      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'report',
        action: 'generate',
        description: `Generated ${type} report`,
        created_at: new Date().toISOString()
      });

      alert('Report generated successfully!');
      loadReports();

    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = async (reportId) => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) return;

      // Update download count
      await supabase
        .from('estate_reports')
        .update({ 
          downloads: (report.downloads || 0) + 1 
        })
        .eq('id', reportId);

      // Simulate download
      const link = document.createElement('a');
      link.href = report.file_url || '#';
      link.download = `${report.title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      link.click();

      // Log activity
      await supabase.from('activities').insert({
        user_id: user.id,
        type: 'report',
        action: 'download',
        description: `Downloaded report: ${report.title}`,
        created_at: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  const getPeriodText = (range) => {
    const now = new Date();
    switch(range) {
      case 'daily': return 'Today';
      case 'weekly': return 'This Week';
      case 'monthly': return `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;
      case 'quarterly': return `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`;
      case 'yearly': return now.getFullYear().toString();
      default: return 'All Time';
    }
  };

  const filteredReports = reportType === 'all' 
    ? reports 
    : reports.filter(report => report.report_type === reportType);

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