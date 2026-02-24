import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient'; // Added Supabase Import
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
  MessageCircle,
  Bell,
  FileText,
  Tool // Added missing icon if needed
} from 'lucide-react';
import './Reports.css';

const Reports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [stats, setStats] = useState({
    totalReports: 0,
    openReports: 0,
    resolvedReports: 0,
    urgentReports: 0,
    maintenanceReports: 0,
    newMaintenance: 0
  });

  useEffect(() => {
    if (user?.id) {
      loadReportsData();
    }
  }, [user?.id]);

  const loadReportsData = async () => {
    setLoading(true);
    try {
      // Fetch maintenance_requests from Supabase where landlord_id matches current user
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          tenant:tenant_id (full_name, email, phone_number),
          property:property_id (title, address)
        `)
        .eq('landlord_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform Supabase data to match your component's expected structure
      const formattedReports = data.map(item => ({
        id: item.id,
        tenantId: item.tenant_id,
        tenantName: item.tenant?.full_name || 'Unknown Tenant',
        tenantEmail: item.tenant?.email || 'No email',
        tenantPhone: item.tenant?.phone_number || 'No phone',
        propertyId: item.property_id,
        propertyName: item.property?.title || 'Unknown Property',
        propertyAddress: item.property?.address || 'Address not specified',
        type: 'maintenance',
        subType: item.category,
        title: item.title,
        description: item.description,
        severity: item.emergency ? 'urgent' : (item.priority === 'high' ? 'high' : 'medium'),
        status: item.status,
        dateReported: item.created_at,
        dateResolved: item.estimated_completion,
        assignedTo: item.assigned_to,
        attachments: item.images || [],
        priority: item.priority,
        lastUpdated: item.created_at,
        notes: item.notes,
        actionsTaken: item.actions_taken || [], // Assuming actions_taken is an array column
        source: 'tenant_maintenance',
        viewed: item.viewed || false,
        emergency: item.emergency || false
      }));

      // Calculate stats
      setReports(formattedReports);
      setStats({
        totalReports: formattedReports.length,
        openReports: formattedReports.filter(r => r.status === 'open').length,
        resolvedReports: formattedReports.filter(r => r.status === 'resolved').length,
        urgentReports: formattedReports.filter(r => r.priority === 'high' || r.severity === 'urgent').length,
        maintenanceReports: formattedReports.length,
        newMaintenance: formattedReports.filter(r => !r.viewed).length
      });
    } catch (err) {
      console.error("Error fetching reports:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ 
          status: newStatus,
          viewed: true // Auto-mark as viewed when updated
        })
        .eq('id', reportId);

      if (error) throw error;

      // Update local state
      const updated = reports.map(r => r.id === reportId ? { ...r, status: newStatus, viewed: true } : r);
      setReports(updated);
      if (selectedReport?.id === reportId) {
        setSelectedReport({ ...selectedReport, status: newStatus, viewed: true });
      }
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleAssignTo = async (reportId, assignee) => {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ assigned_to: assignee })
        .eq('id', reportId);

      if (error) throw error;

      const updated = reports.map(r => r.id === reportId ? { ...r, assignedTo: assignee } : r);
      setReports(updated);
      if (selectedReport?.id === reportId) {
        setSelectedReport({ ...selectedReport, assignedTo: assignee });
      }
    } catch (err) {
      alert("Failed to assign: " + err.message);
    }
  };

  const handleAddAction = async (reportId, action) => {
    const report = reports.find(r => r.id === reportId);
    const newActions = [...(report.actionsTaken || []), action];

    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ actions_taken: newActions })
        .eq('id', reportId);

      if (error) throw error;

      const updated = reports.map(r => r.id === reportId ? { ...r, actionsTaken: newActions } : r);
      setReports(updated);
      if (selectedReport?.id === reportId) {
        setSelectedReport({ ...selectedReport, actionsTaken: newActions });
      }
    } catch (err) {
      alert("Failed to add action: " + err.message);
    }
  };

  const handleViewReport = async (report) => {
    setSelectedReport(report);
    if (!report.viewed) {
      await supabase
        .from('maintenance_requests')
        .update({ viewed: true })
        .eq('id', report.id);
      
      setReports(prev => prev.map(r => r.id === report.id ? { ...r, viewed: true } : r));
    }
  };

  const markAllAsViewed = async () => {
    try {
      await supabase
        .from('maintenance_requests')
        .update({ viewed: true })
        .eq('landlord_id', user.id)
        .eq('viewed', false);
      
      loadReportsData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    if (filter === 'open') return report.status === 'open';
    if (filter === 'in_progress') return report.status === 'in_progress';
    if (filter === 'resolved') return report.status === 'resolved';
    if (filter === 'urgent') return report.priority === 'high' || report.severity === 'urgent';
    if (filter === 'new') return !report.viewed;
    return true;
  });

  const getStatusBadge = (status) => {
    const config = {
      open: { label: 'Open', color: '#ef4444', icon: <AlertTriangle size={14} /> },
      pending: { label: 'Pending', color: '#f59e0b', icon: <Clock size={14} /> },
      in_progress: { label: 'In Progress', color: '#3b82f6', icon: <Clock size={14} /> },
      resolved: { label: 'Resolved', color: '#10b981', icon: <CheckCircle size={14} /> }
    };
    const { label, color, icon } = config[status] || { label: status, color: '#6b7280', icon: null };
    return (
      <span className="status-badge" style={{ backgroundColor: `${color}15`, color, borderColor: color }}>
        {icon} {label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = { high: '#dc2626', medium: '#d97706', low: '#059669' };
    const color = colors[priority] || '#6b7280';
    return (
      <span className="priority-badge" style={{ backgroundColor: `${color}15`, color, borderColor: color }}>
        {priority?.toUpperCase()}
      </span>
    );
  };

  const getTypeIcon = (type, subType) => {
    const icons = { plumbing: <Droplets size={16} />, electrical: <Zap size={16} />, structural: <Hammer size={16} />, decoration: <PaintBucket size={16} /> };
    return icons[subType] || <Wrench size={16} />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Pending';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) return <div className="reports-loading"><div className="loading-spinner"></div><p>Syncing with database...</p></div>;

  return (
    <div className="reports-container">
      <div className="reports-header">
        <div className="header-left">
          <button className="btn btn-back" onClick={() => navigate('/dashboard/landlord')}>← Back</button>
          <h1>Property Reports</h1>
          <p>Real-time maintenance & complaints from Supabase</p>
        </div>
        <div className="header-right">
          {stats.newMaintenance > 0 && (
            <button className="btn btn-warning" onClick={markAllAsViewed}>
              <Bell size={18} /> Mark Viewed ({stats.newMaintenance})
            </button>
          )}
        </div>
      </div>

      <div className="reports-stats">
        <div className="stat-card"><h3>Total</h3><div className="stat-value">{stats.totalReports}</div></div>
        <div className="stat-card"><h3>Open</h3><div className="stat-value">{stats.openReports}</div></div>
        <div className="stat-card"><h3>Urgent</h3><div className="stat-value">{stats.urgentReports}</div></div>
      </div>

      <div className="reports-filters">
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
        <button className={`filter-btn ${filter === 'new' ? 'active' : ''}`} onClick={() => setFilter('new')}>New</button>
        <button className={`filter-btn ${filter === 'open' ? 'active' : ''}`} onClick={() => setFilter('open')}>Open</button>
        <button className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`} onClick={() => setFilter('resolved')}>Resolved</button>
      </div>

      <div className="reports-table">
        <table>
          <thead>
            <tr>
              <th>Issue</th>
              <th>Tenant</th>
              <th>Property</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map(report => (
              <tr key={report.id} className={!report.viewed ? 'unread-row' : ''}>
                <td>
                  <div className="report-title-cell">
                    {getTypeIcon(null, report.subType)}
                    <strong>{report.title}</strong>
                    {!report.viewed && <span className="new-dot"></span>}
                  </div>
                </td>
                <td>{report.tenantName}</td>
                <td>{report.propertyName}</td>
                <td>{getStatusBadge(report.status)}</td>
                <td><button className="btn btn-sm btn-outline" onClick={() => handleViewReport(report)}><Eye size={14} /> View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedReport && (
        <div className="report-modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="report-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedReport.title}</h2>
              <button onClick={() => setSelectedReport(null)}>×</button>
            </div>
            <div className="modal-content">
              <div className="info-grid">
                <div className="info-block">
                  <label>Tenant Details</label>
                  <p><strong>{selectedReport.tenantName}</strong></p>
                  <p>{selectedReport.tenantPhone}</p>
                </div>
                <div className="info-block">
                  <label>Property</label>
                  <p>{selectedReport.propertyName}</p>
                </div>
              </div>
              <div className="description-area">
                <label>Issue Description</label>
                <p>{selectedReport.description}</p>
              </div>

              <div className="action-updates">
                <label>Update Status</label>
                <select 
                  value={selectedReport.status} 
                  onChange={(e) => handleUpdateStatus(selectedReport.id, e.target.value)}
                  className="status-select"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;