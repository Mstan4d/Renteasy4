// src/modules/admin/pages/AdminReports.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Filter, Download, Calendar, Search, 
  BarChart2, TrendingUp, TrendingDown, AlertCircle,
  Eye, Edit, Trash2, Printer, Share2, FileBarChart
} from 'lucide-react';
import './AdminReports.css';

const AdminReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    resolved: 0,
    pending: 0,
    urgent: 0
  });

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [searchTerm, dateFilter, typeFilter, reports]);

  const loadReports = () => {
    try {
      // Load reports from localStorage
      const reportsData = JSON.parse(localStorage.getItem('adminReports') || '[]');
      
      // If no reports exist, create sample data
      if (reportsData.length === 0) {
        const sampleReports = generateSampleReports();
        localStorage.setItem('adminReports', JSON.stringify(sampleReports));
        setReports(sampleReports);
      } else {
        setReports(reportsData);
      }
      
      calculateStats(reportsData.length > 0 ? reportsData : generateSampleReports());
      setLoading(false);
    } catch (error) {
      console.error('Error loading reports:', error);
      setLoading(false);
    }
  };

  const generateSampleReports = () => {
    const reportTypes = ['Financial', 'User Activity', 'System', 'Security', 'Performance'];
    const statuses = ['pending', 'in-progress', 'completed', 'urgent'];
    const priorities = ['low', 'medium', 'high', 'critical'];
    
    const sampleReports = Array.from({ length: 15 }, (_, index) => ({
      id: `report-${Date.now()}-${index}`,
      title: `${reportTypes[index % reportTypes.length]} Report - Q${(index % 4) + 1}`,
      type: reportTypes[index % reportTypes.length],
      description: `Detailed analysis of ${reportTypes[index % reportTypes.length].toLowerCase()} metrics`,
      generatedBy: ['System', 'Admin User'][index % 2],
      status: statuses[index % statuses.length],
      priority: priorities[index % priorities.length],
      date: new Date(Date.now() - index * 86400000).toISOString(),
      views: Math.floor(Math.random() * 100),
      downloads: Math.floor(Math.random() * 50),
      lastUpdated: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
      fileSize: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
      format: ['PDF', 'CSV', 'Excel', 'JSON'][index % 4]
    }));
    
    return sampleReports;
  };

  const calculateStats = (reportsData) => {
    const total = reportsData.length;
    const resolved = reportsData.filter(r => r.status === 'completed').length;
    const pending = reportsData.filter(r => r.status === 'pending' || r.status === 'in-progress').length;
    const urgent = reportsData.filter(r => r.priority === 'critical' || r.priority === 'high').length;
    
    setStats({ totalReports: total, resolved, pending, urgent });
  };

  const filterReports = () => {
    let filtered = [...reports];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch(dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(report => new Date(report.date) >= filterDate);
          break;
        case 'week':
          filterDate.setDate(filterDate.getDate() - 7);
          filtered = filtered.filter(report => new Date(report.date) >= filterDate);
          break;
        case 'month':
          filterDate.setMonth(filterDate.getMonth() - 1);
          filtered = filtered.filter(report => new Date(report.date) >= filterDate);
          break;
        case 'year':
          filterDate.setFullYear(filterDate.getFullYear() - 1);
          filtered = filtered.filter(report => new Date(report.date) >= filterDate);
          break;
      }
    }
    
    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(report => report.type === typeFilter);
    }
    
    setFilteredReports(filtered);
  };

  const generateNewReport = () => {
    const reportTypes = ['Financial', 'User Activity', 'System', 'Security', 'Performance'];
    const type = reportTypes[Math.floor(Math.random() * reportTypes.length)];
    
    const newReport = {
      id: `report-${Date.now()}`,
      title: `${type} Report - ${new Date().toLocaleDateString()}`,
      type,
      description: `Automatically generated ${type.toLowerCase()} report`,
      generatedBy: 'System',
      status: 'pending',
      priority: 'medium',
      date: new Date().toISOString(),
      views: 0,
      downloads: 0,
      lastUpdated: new Date().toISOString(),
      fileSize: '1.5 MB',
      format: 'PDF'
    };
    
    const updatedReports = [newReport, ...reports];
    setReports(updatedReports);
    localStorage.setItem('adminReports', JSON.stringify(updatedReports));
    calculateStats(updatedReports);
  };

  const deleteReport = (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    
    const updatedReports = reports.filter(report => report.id !== reportId);
    setReports(updatedReports);
    localStorage.setItem('adminReports', JSON.stringify(updatedReports));
    calculateStats(updatedReports);
  };

  const exportReport = (reportId) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;
    
    // Increment download count
    const updatedReports = reports.map(r => 
      r.id === reportId ? { ...r, downloads: r.downloads + 1 } : r
    );
    setReports(updatedReports);
    localStorage.setItem('adminReports', JSON.stringify(updatedReports));
    
    // Create and download a dummy file
    const content = `Report: ${report.title}\nType: ${report.type}\nGenerated: ${new Date(report.date).toLocaleString()}\nStatus: ${report.status}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const viewReport = (reportId) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;
    
    // Increment view count
    const updatedReports = reports.map(r => 
      r.id === reportId ? { ...r, views: r.views + 1 } : r
    );
    setReports(updatedReports);
    localStorage.setItem('adminReports', JSON.stringify(updatedReports));
    
    // Navigate to report detail or show modal
    alert(`Viewing report: ${report.title}\n\n${report.description}`);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      case 'pending': return 'info';
      case 'urgent': return 'danger';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="admin-reports loading">
        <div className="loading-spinner"></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="admin-reports">
      <div className="reports-header">
        <div className="header-left">
          <h1><FileBarChart size={28} /> Reports Dashboard</h1>
          <p>Manage and analyze system reports</p>
        </div>
        <div className="header-right">
          <button className="btn-generate" onClick={generateNewReport}>
            <FileText size={18} /> Generate New Report
          </button>
          <button className="btn-export-all" onClick={() => alert('Exporting all reports...')}>
            <Download size={18} /> Export All
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="reports-stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalReports}</h3>
            <p>Total Reports</p>
          </div>
        </div>
        
        <div className="stat-card resolved">
          <div className="stat-icon">
            <BarChart2 size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.resolved}</h3>
            <p>Completed</p>
          </div>
        </div>
        
        <div className="stat-card pending">
          <div className="stat-icon">
            <AlertCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending Review</p>
          </div>
        </div>
        
        <div className="stat-card urgent">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.urgent}</h3>
            <p>High Priority</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="reports-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
          
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="Financial">Financial</option>
            <option value="User Activity">User Activity</option>
            <option value="System">System</option>
            <option value="Security">Security</option>
            <option value="Performance">Performance</option>
          </select>
          
          <button className="btn-filter" onClick={() => {
            setSearchTerm('');
            setDateFilter('all');
            setTypeFilter('all');
          }}>
            <Filter size={16} /> Clear Filters
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="reports-table-container">
        <table className="reports-table">
          <thead>
            <tr>
              <th>Report Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Date</th>
              <th>Views</th>
              <th>Downloads</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length > 0 ? (
              filteredReports.map(report => (
                <tr key={report.id}>
                  <td>
                    <div className="report-title">
                      <strong>{report.title}</strong>
                      <small>{report.description}</small>
                    </div>
                  </td>
                  <td>
                    <span className={`report-type ${report.type.toLowerCase()}`}>
                      {report.type}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td>
                    <span className={`priority-badge ${getPriorityColor(report.priority)}`}>
                      {report.priority}
                    </span>
                  </td>
                  <td>
                    {new Date(report.date).toLocaleDateString()}
                    <br />
                    <small>{new Date(report.date).toLocaleTimeString()}</small>
                  </td>
                  <td>
                    <div className="metric">
                      <Eye size={14} /> {report.views}
                    </div>
                  </td>
                  <td>
                    <div className="metric">
                      <Download size={14} /> {report.downloads}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-view"
                        onClick={() => viewReport(report.id)}
                        title="View Report"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="btn-export"
                        onClick={() => exportReport(report.id)}
                        title="Export Report"
                      >
                        <Download size={16} />
                      </button>
                      <button 
                        className="btn-print"
                        onClick={() => window.print()}
                        title="Print"
                      >
                        <Printer size={16} />
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => deleteReport(report.id)}
                        title="Delete Report"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-results">
                  <FileText size={48} />
                  <p>No reports found</p>
                  <button onClick={generateNewReport} className="btn-create">
                    Create Your First Report
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="reports-summary">
        <div className="summary-card">
          <h3><TrendingUp size={20} /> Report Analytics</h3>
          <div className="summary-stats">
            <div className="summary-stat">
              <span className="label">Avg. Generation Time</span>
              <span className="value">2.4 mins</span>
            </div>
            <div className="summary-stat">
              <span className="label">Most Viewed</span>
              <span className="value">Financial Reports</span>
            </div>
            <div className="summary-stat">
              <span className="label">Storage Used</span>
              <span className="value">45.2 MB</span>
            </div>
            <div className="summary-stat">
              <span className="label">Auto-generated</span>
              <span className="value">{Math.floor(stats.totalReports * 0.6)} reports</span>
            </div>
          </div>
        </div>
        
        <div className="summary-card">
          <h3><Calendar size={20} /> Recent Activity</h3>
          <div className="activity-list">
            {reports.slice(0, 3).map(report => (
              <div key={report.id} className="activity-item">
                <div className="activity-icon">
                  {report.type === 'Financial' && '💰'}
                  {report.type === 'User Activity' && '👤'}
                  {report.type === 'System' && '⚙️'}
                  {report.type === 'Security' && '🔒'}
                  {report.type === 'Performance' && '📈'}
                </div>
                <div className="activity-content">
                  <p>{report.title}</p>
                  <small>
                    {new Date(report.lastUpdated).toLocaleDateString()} • 
                    {report.generatedBy}
                  </small>
                </div>
                <span className={`status-dot ${getStatusColor(report.status)}`}></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;