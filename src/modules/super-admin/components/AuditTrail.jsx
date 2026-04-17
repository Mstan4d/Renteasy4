// src/modules/super-admin/components/AuditTrail.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import { 
  Search, Filter, Download, Calendar, RefreshCw,
  ChevronLeft, ChevronRight, Eye, FileText, Users,
  Home, Building, Shield, User, Settings, AlertCircle
} from 'lucide-react';
import './AuditTrail.css';

const AuditTrail = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all'); // all, today, week, month
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  // Fetch logs from Supabase
  useEffect(() => {
    fetchLogs();
  }, [page, dateRange, actionFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('admin_activities')
        .select(`
          *,
          admin:admin_id (id, full_name, email)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      // Apply date filter
      if (dateRange !== 'all') {
        const now = new Date();
        let start = new Date();
        if (dateRange === 'today') start.setHours(0,0,0,0);
        else if (dateRange === 'week') start.setDate(now.getDate() - 7);
        else if (dateRange === 'month') start.setMonth(now.getMonth() - 1);
        query = query.gte('created_at', start.toISOString());
      }

      // Apply action type filter (if we have a 'type' column)
      if (actionFilter !== 'all') {
        query = query.eq('type', actionFilter);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      setLogs(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Client‑side search (because Supabase doesn't support full‑text search on JSONB easily)
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredLogs(logs);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = logs.filter(log =>
      (log.admin?.full_name?.toLowerCase().includes(term)) ||
      (log.admin?.email?.toLowerCase().includes(term)) ||
      (log.action?.toLowerCase().includes(term)) ||
      (log.type?.toLowerCase().includes(term)) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(term))
    );
    setFilteredLogs(filtered);
  }, [logs, searchTerm]);

  const getActionIcon = (action) => {
    if (action.includes('user')) return <User size={14} />;
    if (action.includes('listing')) return <Home size={14} />;
    if (action.includes('service')) return <FileText size={14} />;
    if (action.includes('verification')) return <Shield size={14} />;
    if (action.includes('payment') || action.includes('commission')) return <Building size={14} />;
    if (action.includes('settings')) return <Settings size={14} />;
    return <AlertCircle size={14} />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-NG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const exportLogs = () => {
    const dataToExport = filteredLogs.length ? filteredLogs : logs;
    const csv = [
      ['Timestamp', 'Admin', 'Email', 'Action', 'Type', 'Entity ID', 'Details'].join(','),
      ...dataToExport.map(log => [
        log.created_at,
        log.admin?.full_name || 'Unknown',
        log.admin?.email || '',
        log.action,
        log.type || '',
        log.entity_id || '',
        JSON.stringify(log.details).replace(/,/g, ';')
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && logs.length === 0) {
    return <div className="audit-loading">Loading audit trail...</div>;
  }

  return (
    <div className="audit-trail">
      <div className="audit-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by admin, action, details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="filter-select"
          >
            <option value="all">All time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
          </select>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All actions</option>
            <option value="user">User actions</option>
            <option value="listing">Listing actions</option>
            <option value="payment">Payment actions</option>
            <option value="verification">Verification</option>
            <option value="settings">Settings</option>
          </select>
          <button className="btn-export" onClick={exportLogs} title="Export to CSV">
            <Download size={18} />
          </button>
          <button className="btn-refresh" onClick={fetchLogs} title="Refresh">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="audit-table-container">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Admin</th>
              <th>Action</th>
              <th>Type</th>
              <th>Entity ID</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-message">
                  No logs found.
                </td>
              </tr>
            ) : (
              filteredLogs.map(log => (
                <tr key={log.id}>
                  <td title={log.created_at}>
                    <span className="timestamp">{formatDate(log.created_at)}</span>
                  </td>
                  <td>
                    <div className="admin-cell">
                      <span className="admin-name">{log.admin?.full_name || 'System'}</span>
                      <span className="admin-email">{log.admin?.email || ''}</span>
                    </div>
                  </td>
                  <td>
                    <span className="action-badge">
                      {getActionIcon(log.action)}
                      {log.action}
                    </span>
                  </td>
                  <td>{log.type || '—'}</td>
                  <td className="entity-id">
                    {log.entity_id ? log.entity_id.slice(0,8) + '…' : '—'}
                  </td>
                  <td>
                    <div className="details-json">
                      {log.details && Object.keys(log.details).length > 0 ? (
                        <pre>{JSON.stringify(log.details, null, 2)}</pre>
                      ) : (
                        '—'
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="audit-pagination">
        <button
          disabled={page === 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <span>Page {page} of {Math.ceil(totalCount / pageSize) || 1}</span>
        <button
          disabled={page >= Math.ceil(totalCount / pageSize)}
          onClick={() => setPage(p => p + 1)}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default AuditTrail;