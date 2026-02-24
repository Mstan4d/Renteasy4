// src/modules/admin/pages/AdminProviderOverview.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../shared/lib/supabaseClient';
import {
  Users, DollarSign, FileText, Shield, Zap, Calendar,
  CheckCircle, XCircle, Clock, AlertCircle, Eye,
  Download, Filter, RefreshCw
} from 'lucide-react';
import './AdminProviderOverview.css';

const AdminProviderOverview = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [providers, setProviders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    activeBoosts: 0,
    totalEarnings: 0,
    pendingPayouts: 0
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProviderData();
  }, []);

  const fetchProviderData = async () => {
    setLoading(true);
    try {
      // Get all providers with role service-provider or provider
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          phone,
          is_kyc_verified,
          kyc_status,
          free_booking_used,
          free_booking_limit,
          created_at
        `)
        .in('role', ['service-provider', 'provider'])
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // For each provider, fetch additional data
      const enriched = await Promise.all((profiles || []).map(async (provider) => {
        // Earnings
        const { data: earnings } = await supabase
          .from('provider_earnings')
          .select('amount, status')
          .eq('provider_id', provider.id);

        const totalEarnings = (earnings || []).reduce((sum, e) => sum + (e.amount || 0), 0);
        const paidEarnings = (earnings || []).filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);

        // Payouts
        const { data: payouts } = await supabase
          .from('provider_payouts')
          .select('amount, status')
          .eq('provider_id', provider.id);

        const pendingPayouts = (payouts || []).filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
        const completedPayouts = (payouts || []).filter(p => p.status === 'processed').reduce((sum, p) => sum + p.amount, 0);
        const availableBalance = paidEarnings - completedPayouts;

        // Documents
        const { data: docs } = await supabase
          .from('provider_documents')
          .select('verification_status')
          .eq('provider_id', provider.id);

        const docsApproved = (docs || []).filter(d => d.verification_status === 'approved').length;
        const docsPending = (docs || []).filter(d => d.verification_status === 'pending').length;

        // Compliance items
        const { data: compliance } = await supabase
          .from('compliance_items')
          .select('status')
          .eq('provider_id', provider.id);

        const mandatoryDone = (compliance || [])
          .filter(i => i.requirement === 'mandatory' && ['signed','valid','acknowledged'].includes(i.status)).length;
        const mandatoryTotal = (compliance || []).filter(i => i.requirement === 'mandatory').length;

        // Active boost
        const { data: boosts } = await supabase
          .from('active_boosts')
          .select('*')
          .eq('user_id', provider.id)
          .eq('status', 'active')
          .gte('expires_at', new Date().toISOString());

        const activeBoost = (boosts || []).length > 0;

        // Recent booking
        const { data: recentBooking } = await supabase
          .from('service_requests')
          .select('scheduled_date, status')
          .eq('provider_id', provider.id)
          .order('scheduled_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          ...provider,
          totalEarnings,
          pendingPayouts,
          availableBalance,
          docsApproved,
          docsPending,
          mandatoryDone,
          mandatoryTotal,
          activeBoost,
          recentBooking: recentBooking?.scheduled_date || null,
          recentBookingStatus: recentBooking?.status || null
        };
      }));

      setProviders(enriched);

      // Calculate overall stats
      setStats({
        total: enriched.length,
        verified: enriched.filter(p => p.is_kyc_verified).length,
        pending: enriched.filter(p => p.kyc_status === 'pending').length,
        activeBoosts: enriched.filter(p => p.activeBoost).length,
        totalEarnings: enriched.reduce((sum, p) => sum + p.totalEarnings, 0),
        pendingPayouts: enriched.reduce((sum, p) => sum + p.pendingPayouts, 0)
      });

    } catch (err) {
      console.error('Error fetching provider data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = providers.filter(p =>
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-provider-overview loading">
        <div className="loading-spinner"></div>
        <p>Loading provider data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-provider-overview error">
        <AlertCircle size={48} />
        <h3>Error loading data</h3>
        <p>{error}</p>
        <button onClick={fetchProviderData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="admin-provider-overview">
      <div className="header">
        <h1><Users size={28} /> Provider Overview</h1>
        <p>Monitor all provider activities, earnings, and compliance</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><Users size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Total Providers</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><CheckCircle size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Verified</span>
            <span className="stat-value">{stats.verified}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow"><Clock size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Pending KYC</span>
            <span className="stat-value">{stats.pending}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><Zap size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Active Boosts</span>
            <span className="stat-value">{stats.activeBoosts}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><DollarSign size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Total Earnings</span>
            <span className="stat-value">₦{stats.totalEarnings.toLocaleString()}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><Clock size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Pending Payouts</span>
            <span className="stat-value">₦{stats.pendingPayouts.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Search & Refresh */}
      <div className="search-bar">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Filter size={18} className="search-icon" />
        </div>
        <button className="refresh-btn" onClick={fetchProviderData}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Providers Table */}
      <div className="table-container">
        <table className="providers-table">
          <thead>
            <tr>
              <th>Provider</th>
              <th>Verification</th>
              <th>Documents</th>
              <th>Compliance</th>
              <th>Earnings</th>
              <th>Payouts</th>
              <th>Boost</th>
              <th>Last Booking</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProviders.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="provider-info">
                    <strong>{p.full_name || 'Unnamed'}</strong>
                    <small>{p.email}</small>
                  </div>
                </td>
                <td>
                  {p.is_kyc_verified ? (
                    <span className="badge success"><CheckCircle size={12} /> Verified</span>
                  ) : p.kyc_status === 'pending' ? (
                    <span className="badge warning"><Clock size={12} /> Pending</span>
                  ) : (
                    <span className="badge secondary"><XCircle size={12} /> Unverified</span>
                  )}
                </td>
                <td>
                  <div className="progress">
                    <span className="progress-label">
                      {p.docsApproved} / {p.docsApproved + p.docsPending} approved
                    </span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${(p.docsApproved / (p.docsApproved + p.docsPending || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td>
                  {p.mandatoryTotal > 0 ? (
                    <span>{p.mandatoryDone}/{p.mandatoryTotal} mandatory</span>
                  ) : (
                    <span>N/A</span>
                  )}
                </td>
                <td>₦{p.totalEarnings.toLocaleString()}</td>
                <td>
                  <div>Pending: ₦{p.pendingPayouts.toLocaleString()}</div>
                  <small>Avail: ₦{p.availableBalance.toLocaleString()}</small>
                </td>
                <td>
                  {p.activeBoost ? (
                    <span className="badge purple"><Zap size={12} /> Active</span>
                  ) : (
                    <span className="badge secondary">Inactive</span>
                  )}
                </td>
                <td>
                  {p.recentBooking ? (
                    <>
                      <div>{new Date(p.recentBooking).toLocaleDateString()}</div>
                      <small>{p.recentBookingStatus}</small>
                    </>
                  ) : (
                    <span>No bookings</span>
                  )}
                </td>
                <td>
                  <Link to={`/admin/provider-details/${p.id}`} className="btn-icon">
                    <Eye size={16} /> View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProviderOverview;