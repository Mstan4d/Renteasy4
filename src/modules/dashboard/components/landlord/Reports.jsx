// src/modules/dashboard/components/landlord/Reports.jsx - UPDATED
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import {
  AlertTriangle,
  Home,
  User,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  Eye,
  Phone,
  Mail,
  Wrench,
  Droplets,
  Zap,
  Hammer,
  PaintBucket,
  Tool,
  MessageCircle,
  Bell,
  FileText
} from 'lucide-react';
import './Reports.css';

const Reports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [maintenanceComplaints, setMaintenanceComplaints] = useState([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    openReports: 0,
    resolvedReports: 0,
    urgentReports: 0,
    maintenanceReports: 0,
    newMaintenance: 0
  });

  useEffect(() => {
    loadReportsData();
  }, [user?.id]);

  const loadReportsData = () => {
    setLoading(true);

    // Load maintenance complaints from localStorage
    const loadMaintenanceComplaints = () => {
      if (!user?.id) return [];
      
      // Try to get maintenance complaints for this landlord
      // We'll look in multiple places since tenants might store them differently
      const landlordId = user.id;
      const reportsKey = `landlord_maintenance_reports_${landlordId}`;
      
      // Also check for maintenance reports in the global reports key
      const globalReportsKey = `maintenance_reports_landlord_${landlordId}`;
      
      let maintenanceReports = [];
      
      // Check primary storage
      const primaryReports = JSON.parse(localStorage.getItem(reportsKey) || '[]');
      if (primaryReports.length > 0) {
        maintenanceReports = [...maintenanceReports, ...primaryReports];
      }
      
      // Check global storage
      const globalReports = JSON.parse(localStorage.getItem(globalReportsKey) || '[]');
      if (globalReports.length > 0) {
        maintenanceReports = [...maintenanceReports, ...globalReports];
      }
      
      // Also check if there are any tenant maintenance submissions
      // We'll look for patterns in localStorage keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('maintenance') && key.includes('tenant')) {
          const tenantReports = JSON.parse(localStorage.getItem(key) || '[]');
          // Filter for reports that might be for this landlord's properties
          const relevantReports = tenantReports.filter(report => 
            report.property && report.property.includes('Lekki') // Example: Match by property location
          );
          if (relevantReports.length > 0) {
            maintenanceReports = [...maintenanceReports, ...relevantReports.map(report => ({
              id: report.id || `maint_${Date.now()}`,
              tenantId: report.tenantId || 'unknown',
              tenantName: report.tenantName || 'Tenant',
              tenantEmail: report.tenantEmail || 'No email',
              tenantPhone: report.tenantContact || 'No phone',
              propertyId: 'PROP-999', // Default
              propertyName: report.property || 'Property',
              propertyAddress: report.property || 'Address not specified',
              type: 'maintenance',
              subType: report.category || 'other',
              title: report.title || 'Maintenance Request',
              description: report.description || 'No description provided',
              severity: report.emergency ? 'urgent' : (report.priority === 'high' ? 'high' : 'medium'),
              status: 'open', // Default for new maintenance requests
              dateReported: report.date || new Date().toISOString().split('T')[0],
              dateResolved: null,
              assignedTo: null,
              attachments: report.images || [],
              priority: report.priority || 'medium',
              lastUpdated: report.createdAt || new Date().toISOString(),
              notes: report.notes || 'Submitted via tenant maintenance dashboard',
              actionsTaken: [],
              source: 'tenant_maintenance',
              viewed: report.viewed || false,
              emergency: report.emergency || false
            }))];
          }
        }
      }
      
      // Remove duplicates by id
      const uniqueReports = maintenanceReports.filter((report, index, self) =>
        index === self.findIndex(r => r.id === report.id)
      );
      
      return uniqueReports;
    };

    // Mock data for other reports
    const mockReports = [
      {
        id: 'REP-001',
        tenantId: 'tenant_001',
        tenantName: 'John Doe',
        tenantEmail: 'john@example.com',
        tenantPhone: '+2348012345678',
        propertyId: 'PROP-123',
        propertyName: '3-Bedroom Duplex, Lekki',
        propertyAddress: 'Lekki Phase 1, Lagos',
        type: 'maintenance',
        subType: 'plumbing',
        title: 'Burst Pipe in Kitchen',
        description: 'Water pipe in kitchen has burst, causing water to leak. Need urgent repair.',
        severity: 'urgent',
        status: 'open',
        dateReported: '2024-12-15',
        dateResolved: null,
        assignedTo: null,
        attachments: ['pipe_damage.jpg'],
        priority: 'high',
        lastUpdated: '2024-12-15 10:30',
        notes: 'Tenant reported at 10:15 AM. Water still leaking.',
        actionsTaken: [],
        source: 'direct_report'
      },
      {
        id: 'REP-002',
        tenantId: 'tenant_002',
        tenantName: 'Sarah Johnson',
        tenantEmail: 'sarah@example.com',
        tenantPhone: '+2348023456789',
        propertyId: 'PROP-124',
        propertyName: '2-Bedroom Flat, Ikeja',
        propertyAddress: 'Ikeja GRA, Lagos',
        type: 'complaint',
        subType: 'noise',
        title: 'Excessive Noise from Neighbors',
        description: 'Neighbors playing loud music until 2 AM daily. Affecting sleep and work.',
        severity: 'medium',
        status: 'in_progress',
        dateReported: '2024-12-12',
        dateResolved: null,
        assignedTo: 'Manager_001',
        attachments: [],
        priority: 'medium',
        lastUpdated: '2024-12-14 15:45',
        notes: 'Spoken to building manager. Monitoring situation.',
        actionsTaken: ['Reported to building management'],
        source: 'direct_report'
      },
      {
        id: 'REP-003',
        tenantId: 'tenant_003',
        tenantName: 'Michael Brown',
        tenantEmail: 'michael@example.com',
        tenantPhone: '+2348034567890',
        propertyId: 'PROP-125',
        propertyName: 'Studio Apartment, VI',
        propertyAddress: 'Victoria Island, Lagos',
        type: 'hold',
        subType: 'rent_payment',
        title: 'Request to Hold Rent Payment',
        description: 'Requesting 2-week extension on rent due to unexpected medical bills.',
        severity: 'medium',
        status: 'open',
        dateReported: '2024-12-10',
        dateResolved: null,
        assignedTo: null,
        attachments: ['medical_bill.pdf'],
        priority: 'medium',
        lastUpdated: '2024-12-10 14:20',
        notes: 'Tenant has good payment history. Considering request.',
        actionsTaken: [],
        source: 'direct_report'
      },
      {
        id: 'REP-004',
        tenantId: 'tenant_004',
        tenantName: 'Emma Wilson',
        tenantEmail: 'emma@example.com',
        tenantPhone: '+2348045678901',
        propertyId: 'PROP-126',
        propertyName: '4-Bedroom House, Abuja',
        propertyAddress: 'Maitama, Abuja',
        type: 'maintenance',
        subType: 'electrical',
        title: 'Power Outage in Master Bedroom',
        description: 'No electricity in master bedroom for 3 days. Electrician needed.',
        severity: 'high',
        status: 'resolved',
        dateReported: '2024-12-05',
        dateResolved: '2024-12-07',
        assignedTo: 'Electrician_001',
        attachments: ['circuit_photo.jpg'],
        priority: 'high',
        lastUpdated: '2024-12-07 16:30',
        notes: 'Fixed by electrician. Circuit breaker replaced.',
        actionsTaken: ['Electrician dispatched', 'Circuit breaker replaced', 'Tested and confirmed working'],
        source: 'direct_report'
      }
    ];

    // Load maintenance complaints from tenants
    const tenantMaintenanceComplaints = loadMaintenanceComplaints();
    
    // Combine all reports
    const allReports = [...mockReports, ...tenantMaintenanceComplaints];
    
    // Calculate stats
    const totalReports = allReports.length;
    const openReports = allReports.filter(r => r.status === 'open').length;
    const resolvedReports = allReports.filter(r => r.status === 'resolved').length;
    const urgentReports = allReports.filter(r => r.priority === 'high' || r.severity === 'urgent').length;
    const maintenanceReports = allReports.filter(r => r.type === 'maintenance').length;
    const newMaintenance = tenantMaintenanceComplaints.filter(r => !r.viewed).length;

    setReports(allReports);
    setMaintenanceComplaints(tenantMaintenanceComplaints);
    setStats({
      totalReports,
      openReports,
      resolvedReports,
      urgentReports,
      maintenanceReports,
      newMaintenance
    });
    setLoading(false);
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    if (filter === 'open') return report.status === 'open';
    if (filter === 'in_progress') return report.status === 'in_progress';
    if (filter === 'resolved') return report.status === 'resolved';
    if (filter === 'urgent') return report.priority === 'high' || report.severity === 'urgent';
    if (filter === 'maintenance') return report.type === 'maintenance';
    if (filter === 'complaint') return report.type === 'complaint';
    if (filter === 'hold') return report.type === 'hold';
    if (filter === 'dispute') return report.type === 'dispute';
    if (filter === 'new') return !report.viewed && report.source === 'tenant_maintenance';
    return true;
  });

  const getStatusBadge = (status) => {
    const config = {
      open: { label: 'Open', color: '#ef4444', icon: <AlertTriangle size={14} /> },
      in_progress: { label: 'In Progress', color: '#f59e0b', icon: <Clock size={14} /> },
      resolved: { label: 'Resolved', color: '#10b981', icon: <CheckCircle size={14} /> },
      closed: { label: 'Closed', color: '#6b7280', icon: <XCircle size={14} /> }
    };
    
    const { label, color, icon } = config[status] || { label: status, color: '#6b7280', icon: null };
    
    return (
      <span className="status-badge" style={{ backgroundColor: `${color}15`, color, borderColor: color }}>
        {icon}
        {label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const config = {
      high: { label: 'High Priority', color: '#dc2626' },
      medium: { label: 'Medium Priority', color: '#d97706' },
      low: { label: 'Low Priority', color: '#059669' }
    };
    
    const { label, color } = config[priority] || { label: 'Normal', color: '#6b7280' };
    
    return (
      <span className="priority-badge" style={{ backgroundColor: `${color}15`, color, borderColor: color }}>
        {label}
      </span>
    );
  };

  const getTypeIcon = (type, subType) => {
    if (type === 'maintenance') {
      const maintenanceIcons = {
        plumbing: <Droplets size={16} />,
        electrical: <Zap size={16} />,
        structural: <Hammer size={16} />,
        air_conditioning: <Tool size={16} />,
        decoration: <PaintBucket size={16} />,
        furniture: <Tool size={16} />,
        other: <Wrench size={16} />
      };
      return maintenanceIcons[subType] || <Wrench size={16} />;
    }
    
    const icons = {
      maintenance: <Wrench size={16} />,
      complaint: <MessageCircle size={16} />,
      hold: <Clock size={16} />,
      dispute: <AlertTriangle size={16} />
    };
    return icons[type] || <FileText size={16} />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not resolved';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleViewReport = (report) => {
    // Mark as viewed if it's a tenant maintenance report
    if (report.source === 'tenant_maintenance' && !report.viewed) {
      const updatedReports = reports.map(r => 
        r.id === report.id ? { ...r, viewed: true } : r
      );
      setReports(updatedReports);
      
      // Update localStorage
      const landlordId = user?.id;
      if (landlordId) {
        const reportsKey = `landlord_maintenance_reports_${landlordId}`;
        const existingReports = JSON.parse(localStorage.getItem(reportsKey) || '[]');
        const updatedLocalReports = existingReports.map(r => 
          r.id === report.id ? { ...r, viewed: true } : r
        );
        localStorage.setItem(reportsKey, JSON.stringify(updatedLocalReports));
      }
    }
    setSelectedReport(report);
  };

  const handleUpdateStatus = (reportId, newStatus) => {
    const updatedReports = reports.map(report => 
      report.id === reportId ? { 
        ...report, 
        status: newStatus, 
        lastUpdated: new Date().toISOString(),
        dateResolved: newStatus === 'resolved' ? new Date().toISOString().split('T')[0] : report.dateResolved
      } : report
    );
    setReports(updatedReports);
    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport({ 
        ...selectedReport, 
        status: newStatus, 
        lastUpdated: new Date().toISOString(),
        dateResolved: newStatus === 'resolved' ? new Date().toISOString().split('T')[0] : selectedReport.dateResolved
      });
    }
    
    // Update localStorage for tenant maintenance reports
    const report = reports.find(r => r.id === reportId);
    if (report?.source === 'tenant_maintenance') {
      const landlordId = user?.id;
      if (landlordId) {
        const reportsKey = `landlord_maintenance_reports_${landlordId}`;
        const existingReports = JSON.parse(localStorage.getItem(reportsKey) || '[]');
        const updatedLocalReports = existingReports.map(r => 
          r.id === reportId ? { 
            ...r, 
            status: newStatus, 
            lastUpdated: new Date().toISOString(),
            dateResolved: newStatus === 'resolved' ? new Date().toISOString().split('T')[0] : r.dateResolved
          } : r
        );
        localStorage.setItem(reportsKey, JSON.stringify(updatedLocalReports));
      }
    }
  };

  const handleAssignTo = (reportId, assignee) => {
    const updatedReports = reports.map(report => 
      report.id === reportId ? { ...report, assignedTo: assignee, lastUpdated: new Date().toISOString() } : report
    );
    setReports(updatedReports);
    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport({ ...selectedReport, assignedTo: assignee, lastUpdated: new Date().toISOString() });
    }
    
    // Update localStorage for tenant maintenance reports
    const report = reports.find(r => r.id === reportId);
    if (report?.source === 'tenant_maintenance') {
      const landlordId = user?.id;
      if (landlordId) {
        const reportsKey = `landlord_maintenance_reports_${landlordId}`;
        const existingReports = JSON.parse(localStorage.getItem(reportsKey) || '[]');
        const updatedLocalReports = existingReports.map(r => 
          r.id === reportId ? { ...r, assignedTo: assignee, lastUpdated: new Date().toISOString() } : r
        );
        localStorage.setItem(reportsKey, JSON.stringify(updatedLocalReports));
      }
    }
  };

  const handleAddAction = (reportId, action) => {
    const updatedReports = reports.map(report => 
      report.id === reportId ? { 
        ...report, 
        actionsTaken: [...report.actionsTaken, action],
        lastUpdated: new Date().toISOString()
      } : report
    );
    setReports(updatedReports);
    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport({ 
        ...selectedReport, 
        actionsTaken: [...selectedReport.actionsTaken, action],
        lastUpdated: new Date().toISOString()
      });
    }
    
    // Update localStorage for tenant maintenance reports
    const report = reports.find(r => r.id === reportId);
    if (report?.source === 'tenant_maintenance') {
      const landlordId = user?.id;
      if (landlordId) {
        const reportsKey = `landlord_maintenance_reports_${landlordId}`;
        const existingReports = JSON.parse(localStorage.getItem(reportsKey) || '[]');
        const updatedLocalReports = existingReports.map(r => 
          r.id === reportId ? { 
            ...r, 
            actionsTaken: [...r.actionsTaken, action],
            lastUpdated: new Date().toISOString()
          } : r
        );
        localStorage.setItem(reportsKey, JSON.stringify(updatedLocalReports));
      }
    }
  };

  const markAllAsViewed = () => {
    const updatedReports = reports.map(report => 
      report.source === 'tenant_maintenance' && !report.viewed ? { ...report, viewed: true } : report
    );
    setReports(updatedReports);
    
    // Update localStorage
    const landlordId = user?.id;
    if (landlordId) {
      const reportsKey = `landlord_maintenance_reports_${landlordId}`;
      const existingReports = JSON.parse(localStorage.getItem(reportsKey) || '[]');
      const updatedLocalReports = existingReports.map(report => 
        ({ ...report, viewed: true })
      );
      localStorage.setItem(reportsKey, JSON.stringify(updatedLocalReports));
      
      // Reload stats
      loadReportsData();
    }
  };

  if (loading) {
    return (
      <div className="reports-loading">
        <div className="loading-spinner"></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="reports-container">
      {/* Header */}
      <div className="reports-header">
        <div className="header-left">
          <button className="btn btn-back" onClick={() => navigate('/dashboard/landlord')}>
            ← Back to Dashboard
          </button>
          <h1>Tenant Reports & Complaints</h1>
          <p>Manage tenant reports, maintenance requests, and complaints</p>
        </div>
        <div className="header-right">
          {stats.newMaintenance > 0 && (
            <button 
              className="btn btn-warning"
              onClick={markAllAsViewed}
              style={{ marginRight: '10px' }}
            >
              <Bell size={18} />
              Mark all maintenance as viewed ({stats.newMaintenance})
            </button>
          )}
          <button className="btn btn-primary">
            <Download size={18} />
            Export Reports
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="reports-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Total Reports</h3>
            <div className="stat-value">{stats.totalReports}</div>
            <p className="stat-period">All time</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>Open Reports</h3>
            <div className="stat-value">{stats.openReports}</div>
            <p className="stat-period">Requiring attention</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🔧</div>
          <div className="stat-content">
            <h3>Maintenance</h3>
            <div className="stat-value">{stats.maintenanceReports}</div>
            <p className="stat-period">Repair requests</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🚨</div>
          <div className="stat-content">
            <h3>Urgent</h3>
            <div className="stat-value">{stats.urgentReports}</div>
            <p className="stat-period">High priority</p>
          </div>
        </div>
      </div>

      {/* Maintenance Alerts */}
      {stats.newMaintenance > 0 && (
        <div className="maintenance-alert">
          <div className="alert-content">
            <Bell size={24} />
            <div>
              <h4>New Maintenance Requests from Tenants!</h4>
              <p>You have {stats.newMaintenance} new maintenance complaint{stats.newMaintenance > 1 ? 's' : ''} submitted via tenant dashboard</p>
            </div>
          </div>
          <button className="btn btn-warning" onClick={() => setFilter('new')}>
            View New Requests
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="reports-filters">
        <div className="filter-section">
          <h3>Filter Reports</h3>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Reports
            </button>
            <button 
              className={`filter-btn ${filter === 'new' ? 'active' : ''}`}
              onClick={() => setFilter('new')}
            >
              <Bell size={14} />
              New ({stats.newMaintenance})
            </button>
            <button 
              className={`filter-btn ${filter === 'open' ? 'active' : ''}`}
              onClick={() => setFilter('open')}
            >
              Open
            </button>
            <button 
              className={`filter-btn ${filter === 'in_progress' ? 'active' : ''}`}
              onClick={() => setFilter('in_progress')}
            >
              In Progress
            </button>
            <button 
              className={`filter-btn ${filter === 'urgent' ? 'active' : ''}`}
              onClick={() => setFilter('urgent')}
            >
              Urgent
            </button>
          </div>
        </div>
        
        <div className="filter-section">
          <h3>Filter by Type</h3>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'maintenance' ? 'active' : ''}`}
              onClick={() => setFilter('maintenance')}
            >
              🔧 Maintenance
            </button>
            <button 
              className={`filter-btn ${filter === 'complaint' ? 'active' : ''}`}
              onClick={() => setFilter('complaint')}
            >
              📢 Complaint
            </button>
            <button 
              className={`filter-btn ${filter === 'hold' ? 'active' : ''}`}
              onClick={() => setFilter('hold')}
            >
              ⏸️ Hold Request
            </button>
            <button 
              className={`filter-btn ${filter === 'dispute' ? 'active' : ''}`}
              onClick={() => setFilter('dispute')}
            >
              ⚖️ Dispute
            </button>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="reports-table-section">
        <div className="section-header">
          <h2>Tenant Reports ({filteredReports.length})</h2>
          <div className="header-actions">
            <button className="btn btn-outline">
              <Filter size={16} />
              Sort By
            </button>
          </div>
        </div>
        
        {filteredReports.length > 0 ? (
          <div className="reports-table">
            <table>
              <thead>
                <tr>
                  <th>Report Details</th>
                  <th>Tenant</th>
                  <th>Property</th>
                  <th>Date Reported</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map(report => (
                  <tr 
                    key={report.id} 
                    className={`report-row ${report.priority} ${!report.viewed && report.source === 'tenant_maintenance' ? 'unread' : ''}`}
                  >
                    <td>
                      <div className="report-details">
                        <div className="report-type">
                          <span className="type-icon">
                            {getTypeIcon(report.type, report.subType)}
                          </span>
                          <span className="type-label">
                            {report.type}
                            {report.subType && `: ${report.subType}`}
                          </span>
                          {!report.viewed && report.source === 'tenant_maintenance' && (
                            <span className="new-badge">NEW</span>
                          )}
                        </div>
                        <div className="report-title">{report.title}</div>
                        <div className="report-description">{report.description.substring(0, 60)}...</div>
                      </div>
                    </td>
                    <td>
                      <div className="tenant-info">
                        <div className="tenant-name">{report.tenantName}</div>
                        <div className="tenant-contact">
                          <Phone size={12} />
                          <span>{report.tenantPhone}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="property-info">
                        <Home size={14} />
                        <span>{report.propertyName}</span>
                      </div>
                    </td>
                    <td>{formatDate(report.dateReported)}</td>
                    <td>{getPriorityBadge(report.priority)}</td>
                    <td>{getStatusBadge(report.status)}</td>
                    <td>
                      <div className="report-source">
                        {report.source === 'tenant_maintenance' ? (
                          <span className="source-badge tenant-source">
                            <Wrench size={12} />
                            Tenant Dashboard
                          </span>
                        ) : (
                          <span className="source-badge direct-source">
                            <MessageCircle size={12} />
                            Direct Report
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => handleViewReport(report)}
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-reports">
            <div className="empty-icon">📄</div>
            <h3>No Reports Found</h3>
            <p>No reports match your selected filters.</p>
            <button 
              className="btn btn-outline"
              onClick={() => setFilter('all')}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="report-modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="report-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Report Details</h2>
              <div className="modal-header-right">
                {selectedReport.source === 'tenant_maintenance' && (
                  <span className="source-indicator">
                    <Wrench size={14} />
                    From Tenant Maintenance Dashboard
                  </span>
                )}
                <button className="close-modal" onClick={() => setSelectedReport(null)}>
                  ×
                </button>
              </div>
            </div>
            
            <div className="modal-content">
              {/* Report Header */}
              <div className="report-header">
                <div className="report-title-section">
                  <div className="report-type-badge">
                    <span className="type-icon">
                      {getTypeIcon(selectedReport.type, selectedReport.subType)}
                    </span>
                    <span className="type-label">{selectedReport.type.toUpperCase()}</span>
                    {selectedReport.subType && (
                      <span className="subtype-label"> - {selectedReport.subType}</span>
                    )}
                  </div>
                  <h3>{selectedReport.title}</h3>
                  <div className="report-meta">
                    <span className="meta-item">
                      <Calendar size={14} />
                      Reported: {formatDate(selectedReport.dateReported)}
                    </span>
                    <span className="meta-item">
                      <AlertTriangle size={14} />
                      Severity: {selectedReport.severity}
                    </span>
                    {selectedReport.emergency && (
                      <span className="meta-item emergency">
                        🚨 Emergency Request
                      </span>
                    )}
                  </div>
                </div>
                <div className="report-actions">
                  {getStatusBadge(selectedReport.status)}
                  {getPriorityBadge(selectedReport.priority)}
                </div>
              </div>
              
              {/* Report Body */}
              <div className="report-body">
                {/* Tenant Information */}
                <div className="info-section">
                  <h4>Tenant Information</h4>
                  <div className="tenant-details">
                    <div className="detail-item">
                      <User size={16} />
                      <div>
                        <strong>{selectedReport.tenantName}</strong>
                        <small>Tenant ID: {selectedReport.tenantId}</small>
                      </div>
                    </div>
                    <div className="detail-item">
                      <Phone size={16} />
                      <span>{selectedReport.tenantPhone}</span>
                    </div>
                    <div className="detail-item">
                      <Mail size={16} />
                      <span>{selectedReport.tenantEmail}</span>
                    </div>
                  </div>
                </div>
                
                {/* Property Information */}
                <div className="info-section">
                  <h4>Property Information</h4>
                  <div className="property-details">
                    <div className="detail-item">
                      <Home size={16} />
                      <div>
                        <strong>{selectedReport.propertyName}</strong>
                        <small>{selectedReport.propertyAddress}</small>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Report Description */}
                <div className="info-section">
                  <h4>Report Description</h4>
                  <div className="description-box">
                    <p>{selectedReport.description}</p>
                    {selectedReport.source === 'tenant_maintenance' && (
                      <div className="maintenance-note">
                        <small>Submitted via Tenant Maintenance Dashboard</small>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Attachments */}
                {selectedReport.attachments && selectedReport.attachments.length > 0 && (
                  <div className="info-section">
                    <h4>Attachments ({selectedReport.attachments.length})</h4>
                    <div className="attachments-list">
                      {selectedReport.attachments.map((attachment, index) => (
                        <div key={index} className="attachment-item">
                          <FileText size={16} />
                          <span>{attachment.name || `Attachment ${index + 1}`}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Actions Taken */}
                <div className="info-section">
                  <h4>Actions Taken</h4>
                  {selectedReport.actionsTaken && selectedReport.actionsTaken.length > 0 ? (
                    <ul className="actions-list">
                      {selectedReport.actionsTaken.map((action, index) => (
                        <li key={index}>✅ {action}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-actions">No actions taken yet.</p>
                  )}
                  
                  <div className="add-action-form">
                    <input 
                      type="text" 
                      placeholder="Add new action..."
                      className="action-input"
                      id={`action-input-${selectedReport.id}`}
                    />
                    <button 
                      className="btn btn-sm"
                      onClick={() => {
                        const input = document.getElementById(`action-input-${selectedReport.id}`);
                        if (input.value.trim()) {
                          handleAddAction(selectedReport.id, input.value);
                          input.value = '';
                        }
                      }}
                    >
                      Add Action
                    </button>
                  </div>
                </div>
                
                {/* Notes */}
                <div className="info-section">
                  <h4>Notes</h4>
                  <div className="notes-box">
                    <p>{selectedReport.notes || 'No additional notes.'}</p>
                    {selectedReport.lastUpdated && (
                      <small className="last-updated">
                        Last updated: {new Date(selectedReport.lastUpdated).toLocaleString()}
                      </small>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="modal-footer">
                <div className="footer-left">
                  <div className="status-controls">
                    <label>Update Status:</label>
                    <select 
                      value={selectedReport.status}
                      onChange={(e) => handleUpdateStatus(selectedReport.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  
                  <div className="assign-controls">
                    <label>Assign To:</label>
                    <select 
                      value={selectedReport.assignedTo || ''}
                      onChange={(e) => handleAssignTo(selectedReport.id, e.target.value)}
                      className="assign-select"
                    >
                      <option value="">Unassigned</option>
                      <option value="Manager_001">Manager 001</option>
                      <option value="Manager_002">Manager 002</option>
                      <option value="Electrician_001">Electrician 001</option>
                      <option value="Plumber_001">Plumber 001</option>
                      <option value="Security_001">Security 001</option>
                      <option value="Maintenance_Crew">Maintenance Crew</option>
                    </select>
                  </div>
                </div>
                
                <div className="footer-right">
                  <button className="btn btn-outline" onClick={() => setSelectedReport(null)}>
                    Close
                  </button>
                  <button className="btn btn-primary">
                    <MessageSquare size={16} />
                    Contact Tenant
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;