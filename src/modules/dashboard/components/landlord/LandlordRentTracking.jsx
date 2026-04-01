// src/modules/dashboard/components/landlord/LandlordRentTracking.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import RentEasyLoader from '../../../../shared/components/RentEasyLoader';
import {
  DollarSign, Calendar, CheckCircle, XCircle, Clock,
  Filter, Search, Download, Eye, FileText,
  ChevronDown, ChevronUp, AlertCircle, ArrowLeft, Home, Users
} from 'lucide-react';
import './LandlordRentTracking.css';

const LandlordRentTracking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
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
    totalProperties: 0,
    totalUnits: 0,
    totalDue: 0,
    totalPaid: 0,
    pendingAmount: 0,
    overdueCount: 0
  });

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch properties owned by this landlord
      const { data: propertiesData, error: propError } = await supabase
        .from('properties')
        .select('*')
        .eq('landlord_id', user.id)
        .order('created_at', { ascending: false });

      if (propError) throw propError;
      setProperties(propertiesData || []);

      const propertyIds = (propertiesData || []).map(p => p.id);

      // 2. Fetch units for these properties
      let unitsData = [];
      if (propertyIds.length > 0) {
        const { data: unitsRes, error: unitsError } = await supabase
          .from('units')
          .select(`
            *,
            tenant:tenant_renteasy_id (
              id, full_name, email, phone
            )
          `)
          .in('property_id', propertyIds)
          .not('tenant_renteasy_id', 'is', null); // Only units with tenants
        if (unitsError) throw unitsError;
        unitsData = unitsRes || [];
      }
      setUnits(unitsData);

      // 3. Fetch rent payments for these units
      const unitIds = unitsData.map(u => u.id);
      let paymentsData = [];
      if (unitIds.length > 0) {
        const { data: pays, error: paysError } = await supabase
          .from('rent_payments')
          .select(`
            *,
            tenant:tenant_id (id, full_name, email, phone)
          `)
          .in('unit_id', unitIds)
          .order('due_date', { ascending: false });
        if (paysError) throw paysError;
        paymentsData = pays || [];
      }
      setPayments(paymentsData);
      applyFilters(paymentsData, statusFilter, propertyFilter, dateRange, searchTerm);
      calculateStats(paymentsData, propertiesData || [], unitsData);
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
      // Find unit ids belonging to that property
      const propertyUnits = units.filter(u => u.property_id === property).map(u => u.id);
      filtered = filtered.filter(p => propertyUnits.includes(p.unit_id));
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
        p.tenant?.full_name?.toLowerCase().includes(term) ||
        p.tenant?.email?.toLowerCase().includes(term) ||
        p.notes?.toLowerCase().includes(term)
      );
    }

    setFilteredPayments(filtered);
  };

  const calculateStats = (paymentsData, propertiesData, unitsData) => {
    const totalDue = paymentsData.reduce((sum, p) => sum + (p.amount_due || 0), 0);
    const totalPaid = paymentsData
      .filter(p => p.status === 'confirmed' || p.status === 'paid')
      .reduce((sum, p) => sum + (p.amount_due || 0), 0);
    const pendingAmount = paymentsData
      .filter(p => p.status === 'pending' || p.status === 'proof_submitted')
      .reduce((sum, p) => sum + (p.amount_due || 0), 0);
    const today = new Date();
    const overdueCount = paymentsData.filter(p =>
      (p.status === 'pending' || p.status === 'proof_submitted') && new Date(p.due_date) < today
    ).length;

    setStats({
      totalProperties: propertiesData.length,
      totalUnits: unitsData.length,
      totalDue,
      totalPaid,
      pendingAmount,
      overdueCount
    });
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
          notes: reason || 'Rejected by landlord'
        })
        .eq('id', paymentId);
      if (error) throw error;
      loadData();
    } catch (err) {
      alert('Failed to reject payment');
    }
  };

  const formatCurrency = (amount) => `₦${(amount || 0).toLocaleString()}`;
  const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString() : 'N/A';

  const getStatusBadge = (status) => {
    const config = {
      pending: { class: 'badge-warning', icon: <Clock size={14} />, label: 'Pending' },
      proof_submitted: { class: 'badge-info', icon: <FileText size={14} />, label: 'Proof Submitted' },
      confirmed: { class: 'badge-success', icon: <CheckCircle size={14} />, label: 'Confirmed' },
      paid: { class: 'badge-success', icon: <CheckCircle size={14} />, label: 'Paid' },
      rejected: { class: 'badge-danger', icon: <XCircle size={14} />, label: 'Rejected' }
    };
    const cfg = config[status] || config.pending;
    return (
      <span className={`status-badge ${cfg.class}`}>
        {cfg.icon} {cfg.label}
      </span>
    );
  };

  if (loading) {
    return <RentEasyLoader message="Loading rent payments..." fullScreen />;
  }

  if (error) {
    return (
      <div className="landlord-rent-tracking">
        <div className="error-state">
          <AlertCircle size={48} />
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={loadData}>Retry</button>
        </div>
      </div>
    );
  }

  // Helper to get unit details for a payment
  const getUnitDetails = (payment) => {
    const unit = units.find(u => u.id === payment.unit_id);
    if (!unit) return { property: null, unitNumber: '' };
    const property = properties.find(p => p.id === unit.property_id);
    return { property, unitNumber: unit.unit_number };
  };

  return (
    <div className="landlord-rent-tracking">
      {/* Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard/landlord')}>
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <h1>Rent Payments Tracking</h1>
        <p>Monitor rent payments from your tenants</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon properties"><Home size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalProperties}</span>
            <span className="stat-label">Properties</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon units"><Users size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalUnits}</span>
            <span className="stat-label">Occupied Units</span>
          </div>
        </div>
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
            <option value="proof_submitted">Proof Submitted</option>
            <option value="confirmed">Confirmed</option>
            <option value="paid">Paid</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Property:</label>
          <select value={propertyFilter} onChange={(e) => handleFilterChange('property', e.target.value)}>
            <option value="all">All Properties</option>
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.title || p.address}</option>
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
            placeholder="Search tenant name, email..."
            value={searchTerm}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <button className="btn-export" onClick={() => {
          // Simple CSV export
          const headers = ['Property', 'Unit', 'Tenant', 'Amount', 'Due Date', 'Status', 'Reference'];
          const rows = filteredPayments.map(p => {
            const { property, unitNumber } = getUnitDetails(p);
            return [
              property?.title || 'Unknown',
              unitNumber,
              p.tenant?.full_name || 'Unknown',
              formatCurrency(p.amount_due),
              formatDate(p.due_date),
              p.status,
              p.reference
            ];
          });
          const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `rent_payments_${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        }}>
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
              filteredPayments.map(payment => {
                const { property, unitNumber } = getUnitDetails(payment);
                return (
                  <tr key={payment.id}>
                    <td>
                      <div className="property-info">
                        <strong>{property?.title || 'Unknown Property'}</strong>
                        <span className="unit-number">Unit {unitNumber}</span>
                      </div>
                    </td>
                    <td>
                      <div className="tenant-info">
                        <span className="tenant-name">{payment.tenant?.full_name || 'Unknown'}</span>
                        <small>{payment.tenant?.email}</small>
                      </div>
                    </td>
                    <td>{formatDate(payment.due_date)}</td>
                    <td className="amount">{formatCurrency(payment.amount_due)}</td>
                    <td>{getStatusBadge(payment.status)}</td>
                    <td>
                      {payment.proof_url ? (
                        <a href={payment.proof_url} target="_blank" rel="noopener noreferrer" className="btn-proof">
                          <Eye size={16} /> View
                        </a>
                      ) : (
                        <span className="no-proof">No proof</span>
                      )}
                    </td>
                    <td>
                      {payment.status === 'pending' || payment.status === 'proof_submitted' ? (
                        <div className="action-buttons">
                          <button className="btn-confirm" onClick={() => handleConfirm(payment.id)}>
                            <CheckCircle size={16} /> Confirm
                          </button>
                          <button className="btn-reject" onClick={() => handleReject(payment.id)}>
                            <XCircle size={16} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="action-completed">Completed</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="empty-table">
                  <div className="empty-state">
                    <DollarSign size={48} />
                    <h4>No rent payments found</h4>
                    <p>When tenants make payments, they'll appear here.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LandlordRentTracking;