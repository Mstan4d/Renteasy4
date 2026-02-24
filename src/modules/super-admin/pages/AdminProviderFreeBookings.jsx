// src/modules/admin/pages/AdminProviderFreeBookings.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuth } from '../../../shared/context/AuthContext';
import {
  Users, Search, Filter, Plus, Minus, RefreshCw,
  Save, XCircle, CheckCircle, AlertCircle
} from 'lucide-react';
import './AdminProviderFreeBookings.css';

const AdminProviderFreeBookings = () => {
  const { user } = useAuth();
  const [providers, setProviders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState(null);
  const [edits, setEdits] = useState({}); // local edit state

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    filterProviders();
  }, [searchTerm, providers]);

  const fetchProviders = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, free_booking_used, free_booking_limit')
        .in('role', ['service-provider', 'provider'])
        .order('full_name', { ascending: true });

      if (error) throw error;
      setProviders(data || []);
      setFiltered(data || []);
    } catch (err) {
      console.error('Error fetching providers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterProviders = () => {
    if (!searchTerm.trim()) {
      setFiltered(providers);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = providers.filter(p => 
      p.full_name?.toLowerCase().includes(term) ||
      p.email?.toLowerCase().includes(term) ||
      p.phone?.includes(term)
    );
    setFiltered(filtered);
  };

  const handleEdit = (id, field, value) => {
    setEdits(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleSave = async (providerId) => {
    setSavingId(providerId);
    setError(null);
    try {
      const edit = edits[providerId];
      if (!edit) return;

      const updates = {};
      if (edit.free_booking_limit !== undefined) {
        updates.free_booking_limit = parseInt(edit.free_booking_limit, 10);
      }
      if (edit.free_booking_used !== undefined) {
        updates.free_booking_used = parseInt(edit.free_booking_used, 10);
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', providerId);

      if (error) throw error;

      // Update local state
      setProviders(prev => prev.map(p => 
        p.id === providerId ? { ...p, ...updates } : p
      ));
      setEdits(prev => {
        const newEdits = { ...prev };
        delete newEdits[providerId];
        return newEdits;
      });
    } catch (err) {
      console.error('Error updating provider:', err);
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const handleResetUsed = (providerId) => {
    handleEdit(providerId, 'free_booking_used', 0);
  };

  const handleIncreaseLimit = (providerId, increment = 5) => {
    const provider = providers.find(p => p.id === providerId);
    const currentLimit = provider.free_booking_limit;
    const newLimit = currentLimit + increment;
    handleEdit(providerId, 'free_booking_limit', newLimit);
  };

  if (loading) {
    return (
      <div className="admin-provider-freebookings loading">
        <div className="loading-spinner"></div>
        <p>Loading providers...</p>
      </div>
    );
  }

  return (
    <div className="admin-provider-freebookings">
      <div className="header">
        <h1><Users size={28} /> Provider Free Booking Management</h1>
        <p>Adjust free booking limits and usage for service providers</p>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="search-bar">
        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="refresh-btn" onClick={fetchProviders}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="providers-table-container">
        <table className="providers-table">
          <thead>
            <tr>
              <th>Provider</th>
              <th>Contact</th>
              <th>Free Bookings Used</th>
              <th>Free Booking Limit</th>
              <th>Remaining</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(provider => {
              const edit = edits[provider.id] || {};
              const used = edit.free_booking_used ?? provider.free_booking_used;
              const limit = edit.free_booking_limit ?? provider.free_booking_limit;
              const remaining = limit - used;
              const hasEdits = !!edits[provider.id];

              return (
                <tr key={provider.id}>
                  <td>
                    <div className="provider-info">
                      <strong>{provider.full_name || 'Unnamed'}</strong>
                      <small>{provider.email}</small>
                    </div>
                  </td>
                  <td>{provider.phone || '—'}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max={limit}
                      value={used}
                      onChange={(e) => handleEdit(provider.id, 'free_booking_used', e.target.value)}
                      className="small-input"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={limit}
                      onChange={(e) => handleEdit(provider.id, 'free_booking_limit', e.target.value)}
                      className="small-input"
                    />
                  </td>
                  <td>
                    <span className={`remaining-badge ${remaining <= 2 ? 'low' : remaining <= 5 ? 'medium' : 'high'}`}>
                      {remaining} left
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="icon-btn"
                        onClick={() => handleResetUsed(provider.id)}
                        title="Reset used to 0"
                      >
                        <RefreshCw size={14} />
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => handleIncreaseLimit(provider.id, 5)}
                        title="Add 5 free bookings"
                      >
                        <Plus size={14} />
                      </button>
                      {hasEdits && (
                        <button
                          className="save-btn"
                          onClick={() => handleSave(provider.id)}
                          disabled={savingId === provider.id}
                        >
                          {savingId === provider.id ? '...' : <Save size={14} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" className="no-results">
                  No providers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProviderFreeBookings;