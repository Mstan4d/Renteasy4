// src/modules/estate-firm/pages/PaymentsList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import {
  DollarSign, Filter, Download, Eye, Calendar,
  Search, ArrowLeft, FileText, Printer
} from 'lucide-react';
import './PaymentsList.css';

const PaymentsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    property: '',
    unit: '',
    startDate: '',
    endDate: '',
    status: 'all',
  });
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch all properties for this estate firm
      const { data: props } = await supabase
        .from('properties')
        .select('id, name')
        .eq('estate_firm_id', user.id);
      setProperties(props || []);

      // Fetch all units for these properties
      if (props && props.length > 0) {
        const propIds = props.map(p => p.id);
        const { data: unitData } = await supabase
          .from('units')
          .select('id, unit_number, property_id')
          .in('property_id', propIds);
        setUnits(unitData || []);
      }

      // Fetch all payments with related info
      const { data: paymentData, error } = await supabase
        .from('payments')
        .select(`
          *,
          unit:unit_id (
            id,
            unit_number,
            property:property_id (id, name)
          )
        `)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPayments(paymentData || []);
    } catch (err) {
      console.error('Error loading payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(p => {
    if (filters.property && p.unit?.property?.id !== filters.property) return false;
    if (filters.unit && p.unit_id !== filters.unit) return false;
    if (filters.startDate && p.payment_date < filters.startDate) return false;
    if (filters.endDate && p.payment_date > filters.endDate) return false;
    return true;
  });

  const formatCurrency = (amount) => `₦${(amount || 0).toLocaleString()}`;

  const generateReceipt = (payment) => {
    // Placeholder: In real app, generate PDF or open a receipt page
    alert(`Receipt for payment ₦${payment.amount} on ${payment.payment_date}`);
  };

  const downloadReceipt = (payment) => {
    // Placeholder: download PDF
    alert(`Download receipt for payment ₦${payment.amount}`);
  };

  if (loading) {
    return <div className="loading">Loading payments...</div>;
  }

  return (
    <div className="payments-list">
      <header className="page-header">
        <button className="back-button" onClick={() => navigate('/dashboard/estate-firm')}>
          <ArrowLeft size={20} /> Back
        </button>
        <h1>Rent Payments</h1>
        <p className="subtitle">All payments received from tenants</p>
      </header>

      {/* Filters */}
      <div className="filters-card">
        <div className="filter-row">
          <div className="filter-group">
            <label>Property</label>
            <select
              value={filters.property}
              onChange={(e) => setFilters({ ...filters, property: e.target.value, unit: '' })}
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
              onChange={(e) => setFilters({ ...filters, unit: e.target.value })}
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
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>

          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="payments-table-container">
        {filteredPayments.length === 0 ? (
          <div className="empty-state">
            <DollarSign size={48} />
            <h3>No payments found</h3>
            <p>Record your first rent payment to see it here.</p>
          </div>
        ) : (
          <table className="payments-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Property</th>
                <th>Unit</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(payment => (
                <tr key={payment.id}>
                  <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                  <td>{payment.unit?.property?.name || '—'}</td>
                  <td>{payment.unit?.unit_number || '—'}</td>
                  <td className="amount">{formatCurrency(payment.amount)}</td>
                  <td>{payment.description || '—'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="icon-btn"
                        onClick={() => generateReceipt(payment)}
                        title="View Receipt"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => downloadReceipt(payment)}
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PaymentsList;