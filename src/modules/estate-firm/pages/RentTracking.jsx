import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import {
  DollarSign, Calendar, CheckCircle, XCircle, Clock,
  Filter, Search, Download, Eye, FileText,
  ChevronDown, ChevronUp, AlertCircle, ArrowLeft
} from 'lucide-react';
import './RentTracking.css';

const RentTracking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for data
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Stats
  const [stats, setStats] = useState({
    totalDue: 0,
    totalPaid: 0,
    pendingAmount: 0,
    overdueCount: 0
  });

  // Properties for filter dropdown
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Get estate firm profile ID
      const { data: profile, error: profileError } = await supabase
        .from('estate_firm_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error('Estate firm profile not found');

      // 2. Fetch all properties for this firm
      const { data: props, error: propsError } = await supabase
        .from('properties')
        .select('id, name, title, address')
        .eq('estate_firm_id', profile.id);

      if (propsError) throw propsError;
      setProperties(props || []);

      // 3. Get all units for these properties
      const propertyIds = (props || []).map(p => p.id);
      let units = [];
      if (propertyIds.length > 0) {
        const { data: unitsData, error: unitsError } = await supabase
          .from('units')
          .select('id, unit_number, property_id, tenant_id')
          .in('property_id', propertyIds);
        if (unitsError) throw unitsError;
        units = unitsData || [];
      }

      // 4. Fetch rent payments for these units
      const unitIds = units.map(u => u.id);
      let paymentsData = [];
      if (unitIds.length > 0) {
        const { data: pays, error: paysError } = await supabase
          .from('rent_payments')
          .select(`
            *,
            unit:unit_id (
              unit_number,
              property:property_id (id, name, title)
            ),
            tenant:tenant_id (id, name, email, phone)
          `)
          .in('unit_id', unitIds)
          .order('due_date', { ascending: false });
        if (paysError) throw paysError;
        paymentsData = pays || [];
      }

      setPayments(paymentsData);
      applyFilters(paymentsData, statusFilter, propertyFilter, dateRange, searchTerm);
      calculateStats(paymentsData);
    } catch (err) {
      console.error('Error loading rent payments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data, status, property, date, search) => {
    let filtered = [...data];
    
    if (status !== 'all') {
      filtered = filtered.filter(p => p.status === status);
    }
    
    if (property !== 'all') {
      filtered = filtered.filter(p => p.unit?.property?.id === property);
    }
    
    if (date.start && date.end) {
      const start = new Date(date.start);
      const end = new Date(date.end);
      filtered = filtered.filter(p => {
        const due = new Date(p.due_date);
        return due >= start && due <= end;
      });
    }
    
    if (search.trim()) {
      const term = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.tenant?.name?.toLowerCase().includes(term) ||
        p.unit?.unit_number?.toLowerCase().includes(term) ||
        p.unit?.property?.name?.toLowerCase().includes(term)
      );
    }
    
    setFilteredPayments(filtered);
  };

  const calculateStats = (data) => {
    const totalDue = data.reduce((sum, p) => sum + (p.amount_due || 0), 0);
    const totalPaid = data
      .filter(p => p.status === 'confirmed')
      .reduce((sum, p) => sum + (p.amount_due || 0), 0);
    const pendingAmount = data
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + (p.amount_due || 0), 0);
    const today = new Date();
    const overdueCount = data.filter(p => 
      p.status !== 'confirmed' && new Date(p.due_date) < today
    ).length;

    setStats({ totalDue, totalPaid, pendingAmount, overdueCount });
  };

  const handleFilterChange = (type, value) => {
    let newStatus = statusFilter;
    let newProperty = propertyFilter;
    let newDate = dateRange;
    let newSearch = searchTerm;

    if (type === 'status') newStatus = value;
    else if (type === 'property') newProperty = value;
    else if (type === 'date') newDate = value;
    else if (type === 'search') newSearch = value;

    setStatusFilter(newStatus);
    setPropertyFilter(newProperty);
    setDateRange(newDate);
    setSearchTerm(newSearch);
    applyFilters(payments, newStatus, newProperty, newDate, newSearch);
  };

  const handleConfirm = async (paymentId) => {
    if (!window.confirm('Confirm this payment? It will be marked as confirmed.')) return;
    try {
      const { error } = await supabase
        .from('rent_payments')
        .update({ 
          status: 'confirmed', 
          confirmed_by: user.id,
          confirmed_at: new Date().toISOString()
        })
        .eq('id', paymentId);
      if (error) throw error;
      loadData(); // refresh
    } catch (err) {
      alert('Failed to confirm payment');
    }
  };

  const handleReject = async (paymentId) => {
    const reason = prompt('Enter rejection reason (optional)');
    try {
      const { error } = await supabase
        .from('rent_payments')
        .update({ 
          status: 'rejected', 
          notes: reason || 'Rejected by estate firm'
        })
        .eq('id', paymentId);
      if (error) throw error;
      loadData();
    } catch (err) {
      alert('Failed to reject payment');
    }
  };

  const formatCurrency = (amount) => `₦${(amount || 0).toLocaleString()}`;
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  const getStatusBadge = (status) => {
    const classes = {
      pending: 'badge-warning',
      paid: 'badge-info',
      confirmed: 'badge-success',
      rejected: 'badge-danger'
    };
    const icons = {
      pending: <Clock size={14} />,
      paid: <CheckCircle size={14} />,
      confirmed: <CheckCircle size={14} />,
      rejected: <XCircle size={14} />
    };
    return (
      <span className={`status-badge ${classes[status] || ''}`}>
        {icons[status]} {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="rent-tracking-page">
        <div className="loading-spinner">Loading payments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rent-tracking-page">
        <div className="error-state">
          <AlertCircle size={48} />
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={loadData}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="rent-tracking-page">
      {/* Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard/estate-firm')}>
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <h1>Rent Payments Tracking</h1>
        <p>Monitor and manage all rent payments across your properties</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total"><DollarSign size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{formatCurrency(stats.totalDue)}</span>
            <span className="stat-label">Total Due</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon paid"><CheckCircle size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{formatCurrency(stats.totalPaid)}</span>
            <span className="stat-label">Confirmed</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending"><Clock size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{formatCurrency(stats.pendingAmount)}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon overdue"><AlertCircle size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.overdueCount}</span>
            <span className="stat-label">Overdue</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <label>Status:</label>
          <select value={statusFilter} onChange={(e) => handleFilterChange('status', e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="confirmed">Confirmed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Property:</label>
          <select value={propertyFilter} onChange={(e) => handleFilterChange('property', e.target.value)}>
            <option value="all">All Properties</option>
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.name || p.title || p.address}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Date Range:</label>
          <input 
            type="date" 
            value={dateRange.start} 
            onChange={(e) => handleFilterChange('date', { ...dateRange, start: e.target.value })}
          />
          <span>to</span>
          <input 
            type="date" 
            value={dateRange.end} 
            onChange={(e) => handleFilterChange('date', { ...dateRange, end: e.target.value })}
          />
        </div>

        <div className="search-group">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search tenant, unit, property..."
            value={searchTerm}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <button className="btn-export" onClick={() => alert('Export to CSV')}>
          <Download size={16} /> Export
        </button>
      </div>

      {/* Payments Table */}
      <div className="payments-table-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Property / Unit</th>
              <th>Tenant</th>
              <th>Due Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Proof</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map(payment => (
                <tr key={payment.id}>
                  <td>
                    <div className="property-info">
                      <strong>{payment.unit?.property?.name || payment.unit?.property?.title}</strong>
                      <span className="unit-number">Unit {payment.unit?.unit_number}</span>
                    </div>
                  </td>
                  <td>
                    <div className="tenant-info">
                      <span className="tenant-name">{payment.tenant?.name || 'Unknown'}</span>
                      <small>{payment.tenant?.phone}</small>
                    </div>
                  </td>
                  <td>{formatDate(payment.due_date)}</td>
                  <td className="amount">{formatCurrency(payment.amount_due)}</td>
                  <td>{getStatusBadge(payment.status)}</td>
                  <td>
                    {payment.proof_url ? (
                      <a href={payment.proof_url} target="_blank" rel="noopener" className="btn-proof">
                        <Eye size={16} /> View
                      </a>
                    ) : (
                      <span className="no-proof">No proof</span>
                    )}
                  </td>
                  <td>
                    {payment.status === 'pending' && (
                      <div className="action-buttons">
                        <button className="btn-confirm" onClick={() => handleConfirm(payment.id)}>
                          <CheckCircle size={16} /> Confirm
                        </button>
                        <button className="btn-reject" onClick={() => handleReject(payment.id)}>
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    )}
                    {payment.status === 'paid' && (
                      <span className="action-pending">Awaiting confirmation</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty-table">No rent payments found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RentTracking;