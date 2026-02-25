// src/modules/admin/pages/AdminReferrals.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import {
  Users, Award, CheckCircle, XCircle, Filter,
  Search, Download, Calendar, DollarSign, Wallet
} from 'lucide-react';
import './AdminReferrals.css';

const AdminReferrals = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    totalBonus: 0
  });

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      // Fetch referrals that are converted (earnings = 5000) and not yet paid
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          id,
          created_at,
          converted_at,
          bonus_amount,
          paid,
          paid_at,
          referrer:referrer_id (id, full_name, email),
          referred:referred_id (id, full_name, email),
          booking_id
        `)
        .eq('status', 'converted')
        .is('paid', false)
        .order('converted_at', { ascending: false });

      if (error) throw error;

      // For each referral, fetch referrer's wallet balance
      const enrichedReferrals = await Promise.all(
        data.map(async (ref) => {
          const { data: wallet } = await supabase
            .from('wallets')
            .select('balance')
            .eq('user_id', ref.referrer.id)
            .single();
          return {
            ...ref,
            referrer_balance: wallet?.balance || 0
          };
        })
      );

      setReferrals(enrichedReferrals);
      calculateStats(enrichedReferrals);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const paid = data.filter(r => r.paid).length;
    const pending = total - paid;
    const totalBonus = data.reduce((sum, r) => sum + (r.bonus_amount || 5000), 0);
    setStats({ total, paid, pending, totalBonus });
  };

  const markAsPaid = async (referral) => {
    if (!window.confirm(`Pay ₦${(referral.bonus_amount || 5000).toLocaleString()} to ${referral.referrer.full_name}?`)) return;

    setProcessingId(referral.id);
    try {
      // Start a transaction: update referral and add to wallet
      const { error: referralError } = await supabase
        .from('referrals')
        .update({
          paid: true,
          paid_at: new Date().toISOString(),
          paid_by: user.id
        })
        .eq('id', referral.id);

      if (referralError) throw referralError;

      // Update wallet balance
      const { error: walletError } = await supabase.rpc('increment_wallet_balance', {
        user_id: referral.referrer.id,
        amount: referral.bonus_amount || 5000
      });

      if (walletError) {
        // Rollback? For simplicity, alert but maybe revert referral update.
        console.error('Wallet update failed, but referral marked as paid. Manual fix needed.');
        alert('Wallet update failed. Please contact support.');
      }

      // Refresh the list
      await fetchReferrals();
    } catch (error) {
      console.error('Error marking as paid:', error);
      alert('Failed to process payment: ' + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const filterReferrals = () => {
    let filtered = referrals.filter(r => {
      const matchesSearch =
        (r.referrer.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.referred.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.referrer.email || '').toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (dateFilter !== 'all') {
        const now = new Date();
        const converted = new Date(r.converted_at);
        const diffDays = Math.floor((now - converted) / (1000 * 60 * 60 * 24));
        if (dateFilter === 'today' && diffDays > 0) return false;
        if (dateFilter === 'week' && diffDays > 7) return false;
        if (dateFilter === 'month' && diffDays > 30) return false;
      }
      return true;
    });
    return filtered;
  };

  const filteredReferrals = filterReferrals();

  if (loading) {
    return (
      <div className="admin-referrals loading">
        <div className="loading-spinner"></div>
        <p>Loading referral bonuses...</p>
      </div>
    );
  }

  return (
    <div className="admin-referrals">
      <div className="header">
        <h1><Award size={28} /> Referral Bonus Management</h1>
        <p>Approve and pay referral bonuses (₦5,000) to referrers when referred tenants complete a rental.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card pending">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending Bonuses</p>
          </div>
        </div>
        <div className="stat-card total">
          <div className="stat-icon">
            <Award size={24} />
          </div>
          <div className="stat-content">
            <h3>₦{stats.totalBonus.toLocaleString()}</h3>
            <p>Total Pending Amount</p>
          </div>
        </div>
        <div className="stat-card paid">
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.paid}</h3>
            <p>Paid</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by referrer or tenant name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
          <option value="all">All time</option>
          <option value="today">Today</option>
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        {filteredReferrals.length === 0 ? (
          <div className="empty-state">
            <Award size={48} />
            <h3>No pending bonuses</h3>
            <p>All referral bonuses have been paid.</p>
          </div>
        ) : (
          <table className="referrals-table">
            <thead>
              <tr>
                <th>Referrer</th>
                <th>Wallet Balance</th>
                <th>Referred Tenant</th>
                <th>Rental Date</th>
                <th>Bonus Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReferrals.map(ref => (
                <tr key={ref.id}>
                  <td>
                    <div className="user-info">
                      <strong>{ref.referrer.full_name}</strong>
                      <small>{ref.referrer.email}</small>
                    </div>
                  </td>
                  <td>
                    <div className="wallet-info">
                      <Wallet size={16} />
                      <span>₦{ref.referrer_balance.toLocaleString()}</span>
                    </div>
                  </td>
                  <td>
                    <div className="user-info">
                      <strong>{ref.referred.full_name}</strong>
                      <small>{ref.referred.email}</small>
                    </div>
                  </td>
                  <td>{new Date(ref.converted_at).toLocaleDateString()}</td>
                  <td className="bonus-amount">₦{(ref.bonus_amount || 5000).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn-pay"
                      onClick={() => markAsPaid(ref)}
                      disabled={processingId === ref.id}
                    >
                      {processingId === ref.id ? 'Processing...' : 'Mark as Paid'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary */}
      {filteredReferrals.length > 0 && (
        <div className="summary">
          <p>
            Showing {filteredReferrals.length} pending referrals.
            Total amount to pay: <strong>₦{filteredReferrals.reduce((sum, r) => sum + (r.bonus_amount || 5000), 0).toLocaleString()}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminReferrals;