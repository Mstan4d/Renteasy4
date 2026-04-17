// src/modules/estate-firm/pages/PaymentsList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import {
  DollarSign, Filter, Download, Eye, Calendar,
  Search, ArrowLeft, FileText, Printer, Receipt,
  CheckCircle, Clock, XCircle, ChevronRight
} from 'lucide-react';
import './PaymentsList.css';

const PaymentsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    property: '',
    unit: '',
    startDate: '',
    endDate: '',
    status: 'all',
  });
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalAmount: 0,
    confirmedAmount: 0,
    pendingAmount: 0
  });

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Get estate firm profile ID
      const { data: profile, error: profileError } = await supabase
        .from('estate_firm_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // 2. Fetch all properties for this estate firm
      const { data: props, error: propsError } = await supabase
        .from('properties')
        .select('id, name, address')
        .eq('estate_firm_id', profile.id);

      if (propsError) throw propsError;
      setProperties(props || []);

      // 3. Fetch all units for these properties
      const propertyIds = (props || []).map(p => p.id);
      let unitsData = [];
      if (propertyIds.length > 0) {
        const { data: unitsRes, error: unitsError } = await supabase
          .from('units')
          .select('id, unit_number, property_id, tenant_name, tenant_phone')
          .in('property_id', propertyIds);
        if (!unitsError) unitsData = unitsRes || [];
        setUnits(unitsData);
      }

      // 4. Fetch all payments with related info
      const unitIds = unitsData.map(u => u.id);
      let paymentsData = [];
      if (unitIds.length > 0) {
        const { data: pays, error: paysError } = await supabase
          .from('payments')
          .select(`
            id,
            amount,
            payment_date,
            status,
            receipt_url,
            attachment_url,
            description,
            reference,
            created_at,
            unit:unit_id (
              id,
              unit_number,
              property:property_id (id, name)
            )
          `)
          .in('unit_id', unitIds)
          .eq('payment_type', 'rent')
          .order('payment_date', { ascending: false });

        if (paysError) throw paysError;

        // Create a map for quick unit lookup
        const unitsMap = {};
        unitsData.forEach(u => {
          unitsMap[u.id] = u;
        });

        paymentsData = (pays || []).map(payment => {
          const unit = unitsMap[payment.unit_id];
          return {
            ...payment,
            receipt_url: payment.receipt_url || payment.attachment_url,
            tenant_name: unit?.tenant_name || 'Unknown',
            tenant_phone: unit?.tenant_phone || '',
            unit_number: unit?.unit_number,
            property_name: payment.unit?.property?.name,
            property_id: payment.unit?.property?.id
          };
        });
      }

      setPayments(paymentsData);
      applyFilters(paymentsData, filters, searchTerm);
      calculateStats(paymentsData);
    } catch (err) {
      console.error('Error loading payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data, currentFilters, search) => {
    let filtered = [...data];

    // Apply property filter
    if (currentFilters.property) {
      filtered = filtered.filter(p => p.property_id === currentFilters.property);
    }

    // Apply unit filter
    if (currentFilters.unit) {
      filtered = filtered.filter(p => p.unit_id === currentFilters.unit);
    }

    // Apply date range filter
    if (currentFilters.startDate) {
      filtered = filtered.filter(p => p.payment_date >= currentFilters.startDate);
    }
    if (currentFilters.endDate) {
      filtered = filtered.filter(p => p.payment_date <= currentFilters.endDate);
    }

    // Apply status filter
    if (currentFilters.status !== 'all') {
      filtered = filtered.filter(p => p.status === currentFilters.status);
    }

    // Apply search
    if (search.trim()) {
      const term = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.tenant_name?.toLowerCase().includes(term) ||
        p.unit_number?.toLowerCase().includes(term) ||
        p.property_name?.toLowerCase().includes(term) ||
        p.reference?.toLowerCase().includes(term)
      );
    }

    setFilteredPayments(filtered);
  };

  const calculateStats = (data) => {
    const totalAmount = data.reduce((sum, p) => sum + (p.amount || 0), 0);
    const confirmedAmount = data
      .filter(p => p.status === 'confirmed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const pendingAmount = data
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    setStats({
      totalPayments: data.length,
      totalAmount,
      confirmedAmount,
      pendingAmount
    });
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    if (key === 'property') {
      newFilters.unit = ''; // Reset unit when property changes
    }
    setFilters(newFilters);
    applyFilters(payments, newFilters, searchTerm);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyFilters(payments, filters, value);
  };

  const clearFilters = () => {
    const resetFilters = {
      property: '',
      unit: '',
      startDate: '',
      endDate: '',
      status: 'all',
    };
    setFilters(resetFilters);
    setSearchTerm('');
    applyFilters(payments, resetFilters, '');
  };

  const viewReceipt = (payment) => {
    if (payment.receipt_url) {
      window.open(payment.receipt_url, '_blank');
    } else {
      alert('No receipt available for this payment');
    }
  };

  const downloadReceipt = (payment) => {
    if (payment.receipt_url) {
      const link = document.createElement('a');
      link.href = payment.receipt_url;
      link.download = `receipt_${payment.reference || payment.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('No receipt available for download');
    }
  };

  const formatCurrency = (amount) => `₦${(amount || 0).toLocaleString()}`;
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-warning', icon: <Clock size={12} />, text: 'Pending' },
      confirmed: { class: 'badge-success', icon: <CheckCircle size={12} />, text: 'Confirmed' },
      rejected: { class: 'badge-danger', icon: <XCircle size={12} />, text: 'Rejected' }
    };
    const b = badges[status] || { class: 'badge-secondary', icon: null, text: status };
    return (
      <span className={`status-badge ${b.class}`}>
        {b.icon} {b.text}
      </span>
    );
  };

  if (loading) {
    return <RentEasyLoader message="Loading payments..." fullScreen />;
  }

  return (
    <div className="payments-list">
      {/* Header */}
      <header className="page-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate('/dashboard/estate-firm')}>
            <ArrowLeft size={20} /> Back
          </button>
          <div>
            <h1>Rent Payments</h1>
            <p className="subtitle">All payments received from tenants</p>
          </div>
        </div>
        <button 
          className="btn-outline" 
          onClick={() => navigate('/dashboard/estate-firm/rent-tracking')}
        >
          <Receipt size={18} /> Go to Rent Tracking
        </button>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total"><DollarSign size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalPayments}</span>
            <span className="stat-label">Total Payments</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon total"><DollarSign size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{formatCurrency(stats.totalAmount)}</span>
            <span className="stat-label">Total Amount</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon paid"><CheckCircle size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{formatCurrency(stats.confirmedAmount)}</span>
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
      </div>

      {/* Filters */}
      <div className="filters-card">
        <div className="filter-row">
          <div className="filter-group">
            <label>Property</label>
            <select
              value={filters.property}
              onChange={(e) => handleFilterChange('property', e.target.value)}
            >
              <option value="">All Properties</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Unit</label>
            <select
              value={filters.unit}
              onChange={(e) => handleFilterChange('unit', e.target.value)}
              disabled={!filters.property}
            >
              <option value="">All Units</option>
              {units.filter(u => u.property_id === filters.property).map(u => (
                <option key={u.id} value={u.id}>{u.unit_number}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="filter-actions">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by tenant, unit, or property..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button className="clear-filters" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="payments-table-container">
        {filteredPayments.length === 0 ? (
          <div className="empty-state">
            <DollarSign size={48} />
            <h3>No payments found</h3>
            <p>Try adjusting your filters or record a new payment.</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/dashboard/estate-firm/rent-tracking')}
            >
              Go to Rent Tracking
            </button>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="payments-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Property</th>
                    <th>Unit</th>
                    <th>Tenant</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Reference</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map(payment => (
                    <tr key={payment.id}>
                      <td data-label="Date">{formatDate(payment.payment_date)}</td>
                      <td data-label="Property">{payment.property_name || '—'}</td>
                      <td data-label="Unit">{payment.unit_number || '—'}</td>
                      <td data-label="Tenant">
                        <div className="tenant-info">
                          <strong>{payment.tenant_name}</strong>
                          <small>{payment.tenant_phone}</small>
                        </div>
                      </td>
                      <td data-label="Amount" className="amount">{formatCurrency(payment.amount)}</td>
                      <td data-label="Status">{getStatusBadge(payment.status)}</td>
                      <td data-label="Reference">
                        <code className="reference">{payment.reference || '—'}</code>
                      </td>
                      <td data-label="Actions">
                        <div className="action-buttons">
                          {payment.receipt_url && (
                            <>
                              <button
                                className="icon-btn"
                                onClick={() => viewReceipt(payment)}
                                title="View Receipt"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                className="icon-btn"
                                onClick={() => downloadReceipt(payment)}
                                title="Download Receipt"
                              >
                                <Download size={16} />
                              </button>
                            </>
                          )}
                          {!payment.receipt_url && (
                            <span className="no-receipt">No receipt</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <div className="results-info">
                Showing {filteredPayments.length} of {payments.length} payments
              </div>
              <button 
                className="btn-export"
                onClick={() => {
                  // Export to CSV
                  const headers = ['Date', 'Property', 'Unit', 'Tenant', 'Amount', 'Status', 'Reference'];
                  const rows = filteredPayments.map(p => [
                    formatDate(p.payment_date),
                    p.property_name,
                    p.unit_number,
                    p.tenant_name,
                    p.amount,
                    p.status,
                    p.reference
                  ]);
                  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download size={16} /> Export CSV
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentsList;