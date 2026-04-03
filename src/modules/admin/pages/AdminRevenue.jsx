// src/modules/admin/pages/AdminRevenue.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import {
  DollarSign, TrendingUp, TrendingDown, BarChart3,
  Calendar, Download, Filter, RefreshCw,
  Home, Users, Building, CreditCard, Target, Percent,
  CheckCircle, XCircle, Crown, Zap
} from 'lucide-react';
import './AdminRevenue.css';

const AdminRevenue = () => {
  const { user: authUser } = useAuth();
  const [revenueData, setRevenueData] = useState({
    labels: [],
    datasets: [
      { label: 'Rent Commission (3.5%)', data: [], color: '#3b82f6' },
      { label: 'Subscriptions', data: [], color: '#8b5cf6' },
      { label: 'Boosts', data: [], color: '#f59e0b' }
    ]
  });
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [revenueTarget, setRevenueTarget] = useState(10000000);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    commissionRevenue: 0,
    subscriptionRevenue: 0,
    boostRevenue: 0,
    growth: 0,
    target: 10000000,
    completedRentals: 0,
    activeSubscriptions: 0,
    activeBoosts: 0
  });
  const [pendingCommissions, setPendingCommissions] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  // Load revenue data and pending commissions
  useEffect(() => {
    if (authUser?.role === 'super-admin' || authUser?.role === 'admin') {
      loadRevenueTarget();
      loadRevenueData();
      loadPendingCommissions();
    }
  }, [timeRange]);

  const loadRevenueTarget = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'revenue_target')
        .maybeSingle();
      if (!error && data) {
        const target = parseFloat(data.value);
        setRevenueTarget(target);
        setStats(prev => ({ ...prev, target }));
      }
    } catch (err) {
      console.warn('Could not load revenue target', err);
    }
  };

  const loadRevenueData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let startDate;
      switch (timeRange) {
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'quarter':
          startDate = new Date(now.setMonth(now.getMonth() - 3));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(now.setMonth(now.getMonth() - 1));
      }
      const startISO = startDate.toISOString();

      // 1. Completed commissions (platform share)
      const { data: commissions, error: commError } = await supabase
        .from('commissions')
        .select('created_at, platform_share')
        .eq('status', 'paid')
        .gte('created_at', startISO)
        .order('created_at', { ascending: true });
      if (commError) throw commError;

      // 2. Completed subscription payments
      const { data: subscriptions, error: subError } = await supabase
        .from('transactions')
        .select('created_at, amount')
        .eq('type', 'subscription')
        .eq('status', 'completed')
        .gte('created_at', startISO)
        .order('created_at', { ascending: true });
      if (subError) throw subError;

      // 3. Completed boost payments
      const { data: boosts, error: boostError } = await supabase
        .from('transactions')
        .select('created_at, amount')
        .eq('type', 'boost')
        .eq('status', 'completed')
        .gte('created_at', startISO)
        .order('created_at', { ascending: true });
      if (boostError) throw boostError;

      // Group by day
      const dailyMap = new Map(); // key: YYYY-MM-DD, value: { commission, subscription, boost }
      const addToDay = (dateStr, type, amount) => {
        if (!dailyMap.has(dateStr)) {
          dailyMap.set(dateStr, { commission: 0, subscription: 0, boost: 0 });
        }
        const entry = dailyMap.get(dateStr);
        entry[type] += amount;
      };

      commissions.forEach(c => {
        const day = c.created_at.split('T')[0];
        addToDay(day, 'commission', c.platform_share || 0);
      });
      subscriptions.forEach(s => {
        const day = s.created_at.split('T')[0];
        addToDay(day, 'subscription', s.amount || 0);
      });
      boosts.forEach(b => {
        const day = b.created_at.split('T')[0];
        addToDay(day, 'boost', b.amount || 0);
      });

      const sortedDays = Array.from(dailyMap.keys()).sort();
      const labels = sortedDays.map(d => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }));
      const commissionData = sortedDays.map(d => dailyMap.get(d).commission);
      const subscriptionData = sortedDays.map(d => dailyMap.get(d).subscription);
      const boostData = sortedDays.map(d => dailyMap.get(d).boost);

      setRevenueData({
        labels,
        datasets: [
          { label: 'Rent Commission (3.5%)', data: commissionData, color: '#3b82f6' },
          { label: 'Subscriptions', data: subscriptionData, color: '#8b5cf6' },
          { label: 'Boosts', data: boostData, color: '#f59e0b' }
        ]
      });

      // Calculate totals
      const totalCommission = commissionData.reduce((a, b) => a + b, 0);
      const totalSubscription = subscriptionData.reduce((a, b) => a + b, 0);
      const totalBoost = boostData.reduce((a, b) => a + b, 0);
      const totalRevenue = totalCommission + totalSubscription + totalBoost;
      const completedRentals = commissions.length;
      const activeSubscriptions = subscriptions.length;
      const activeBoosts = boosts.length;

      // Calculate growth (compare with previous period)
      const prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - (timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : timeRange === 'quarter' ? 90 : 365));
      const prevStartISO = prevStartDate.toISOString();
      const { data: prevCommissions } = await supabase
        .from('commissions')
        .select('platform_share')
        .eq('status', 'paid')
        .gte('created_at', prevStartISO)
        .lt('created_at', startISO);
      const prevCommissionTotal = prevCommissions?.reduce((s, c) => s + (c.platform_share || 0), 0) || 0;
      const { data: prevSubscriptions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'subscription')
        .eq('status', 'completed')
        .gte('created_at', prevStartISO)
        .lt('created_at', startISO);
      const prevSubscriptionTotal = prevSubscriptions?.reduce((s, t) => s + (t.amount || 0), 0) || 0;
      const { data: prevBoosts } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'boost')
        .eq('status', 'completed')
        .gte('created_at', prevStartISO)
        .lt('created_at', startISO);
      const prevBoostTotal = prevBoosts?.reduce((s, t) => s + (t.amount || 0), 0) || 0;
      const prevTotal = prevCommissionTotal + prevSubscriptionTotal + prevBoostTotal;
      const growth = prevTotal ? ((totalRevenue - prevTotal) / prevTotal) * 100 : 0;

      setStats({
        totalRevenue,
        commissionRevenue: totalCommission,
        subscriptionRevenue: totalSubscription,
        boostRevenue: totalBoost,
        growth,
        target: revenueTarget,
        completedRentals,
        activeSubscriptions,
        activeBoosts
      });
    } catch (error) {
      console.error('Error loading revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingCommissions = async () => {
    setPendingLoading(true);
    try {
      const { data, error } = await supabase
        .from('commissions')
        .select(`
          id,
          rental_amount,
          platform_share,
          created_at,
          listing:listings!listing_id (id, title),
          manager:manager_id (full_name, email)
        `)
        .eq('status', 'verified')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPendingCommissions(data || []);
    } catch (error) {
      console.error('Error loading pending commissions:', error);
    } finally {
      setPendingLoading(false);
    }
  };

  const confirmRental = async (commissionId) => {
    if (!window.confirm('Confirm this rental? Platform commission (3.5%) will be added to revenue.')) return;
    try {
      const { error } = await supabase
        .from('commissions')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', commissionId);
      if (error) throw error;
      alert('Commission confirmed and added to revenue!');
      loadRevenueData();
      loadPendingCommissions();
    } catch (error) {
      console.error('Error confirming rental:', error);
      alert('Failed to confirm.');
    }
  };

  const exportRevenueReport = () => {
    const report = {
      generated: new Date().toISOString(),
      timeRange,
      stats,
      dailyData: revenueData.labels.map((label, i) => ({
        date: label,
        commission: revenueData.datasets[0].data[i],
        subscription: revenueData.datasets[1].data[i],
        boost: revenueData.datasets[2].data[i]
      }))
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => `₦${(amount || 0).toLocaleString()}`;

  if (loading) return <RentEasyLoader message="Loading revenue data..." fullScreen />;

  return (
    <div className="admin-revenue">
      <div className="revenue-header">
        <div className="header-left">
          <h1><DollarSign size={28} /> Revenue Dashboard</h1>
          <p>Track RentEasy income from rentals, subscriptions, and boosts</p>
        </div>
        <div className="header-right">
          <div className="time-selector">
            <Calendar size={18} />
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="time-select">
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
              <option value="year">Last 365 Days</option>
            </select>
          </div>
          <button className="btn-export" onClick={exportRevenueReport}>
            <Download size={18} /> Export Report
          </button>
          <button className="btn-refresh" onClick={() => { loadRevenueData(); loadPendingCommissions(); }}>
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="revenue-main-stats">
        <div className="main-stat-card total-revenue">
          <div className="stat-icon"><DollarSign size={32} /></div>
          <div className="stat-content">
            <h2>{formatCurrency(stats.totalRevenue)}</h2>
            <p>Total Revenue</p>
            <div className="growth-indicator">
              {stats.growth > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className={stats.growth > 0 ? 'positive' : 'negative'}>
                {Math.abs(stats.growth).toFixed(1)}%
              </span>
              <small>vs previous period</small>
            </div>
          </div>
        </div>
        <div className="main-stat-card commission">
          <div className="stat-icon"><Percent size={32} /></div>
          <div className="stat-content">
            <h2>{formatCurrency(stats.commissionRevenue)}</h2>
            <p>Rent Commission (3.5%)</p>
            <small>{stats.completedRentals} completed rentals</small>
          </div>
        </div>
        <div className="main-stat-card subscription">
          <div className="stat-icon"><Crown size={32} /></div>
          <div className="stat-content">
            <h2>{formatCurrency(stats.subscriptionRevenue)}</h2>
            <p>Subscriptions</p>
            <small>{stats.activeSubscriptions} active subscriptions</small>
          </div>
        </div>
        <div className="main-stat-card boost">
          <div className="stat-icon"><Zap size={32} /></div>
          <div className="stat-content">
            <h2>{formatCurrency(stats.boostRevenue)}</h2>
            <p>Boosts</p>
            <small>{stats.activeBoosts} boosts purchased</small>
          </div>
        </div>
        <div className="main-stat-card target">
          <div className="stat-icon"><Target size={32} /></div>
          <div className="stat-content">
            <h2>{formatCurrency(stats.target)}</h2>
            <p>Revenue Target (Super Admin)</p>
            <div className="target-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min(100, (stats.totalRevenue / stats.target) * 100)}%` }}></div>
              </div>
              <span className="progress-text">{Math.round((stats.totalRevenue / stats.target) * 100)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="revenue-charts">
        <div className="chart-card revenue-trend">
          <div className="chart-header">
            <h3><BarChart3 size={20} /> Daily Revenue Breakdown</h3>
          </div>
          <div className="chart-container">
            <div className="simulated-chart">
              <div className="chart-bars">
                {revenueData.labels.map((label, index) => {
                  const maxVal = Math.max(
                    ...revenueData.datasets[0].data,
                    ...revenueData.datasets[1].data,
                    ...revenueData.datasets[2].data,
                    1
                  );
                  const commissionHeight = (revenueData.datasets[0].data[index] / maxVal) * 100;
                  const subHeight = (revenueData.datasets[1].data[index] / maxVal) * 100;
                  const boostHeight = (revenueData.datasets[2].data[index] / maxVal) * 100;
                  return (
                    <div key={index} className="chart-bar-group">
                      <div className="bar-container">
                        <div className="bar commission-bar" style={{ height: `${commissionHeight}%`, backgroundColor: revenueData.datasets[0].color }} title={`Commission: ${formatCurrency(revenueData.datasets[0].data[index])}`}>
                          {commissionHeight > 15 && <span className="bar-value">{formatCurrency(revenueData.datasets[0].data[index])}</span>}
                        </div>
                        <div className="bar subscription-bar" style={{ height: `${subHeight}%`, backgroundColor: revenueData.datasets[1].color }} title={`Subscription: ${formatCurrency(revenueData.datasets[1].data[index])}`}>
                          {subHeight > 15 && <span className="bar-value">{formatCurrency(revenueData.datasets[1].data[index])}</span>}
                        </div>
                        <div className="bar boost-bar" style={{ height: `${boostHeight}%`, backgroundColor: revenueData.datasets[2].color }} title={`Boost: ${formatCurrency(revenueData.datasets[2].data[index])}`}>
                          {boostHeight > 15 && <span className="bar-value">{formatCurrency(revenueData.datasets[2].data[index])}</span>}
                        </div>
                      </div>
                      <div className="bar-label">{label}</div>
                    </div>
                  );
                })}
              </div>
              <div className="chart-legend">
                {revenueData.datasets.map(ds => (
                  <div key={ds.label} className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: ds.color }}></span>
                    {ds.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Rentals to Confirm */}
      <div className="pending-commissions">
        <h3><CheckCircle size={20} /> Pending Rentals to Confirm</h3>
        {pendingLoading ? (
          <div className="loading-small">Loading...</div>
        ) : pendingCommissions.length === 0 ? (
          <div className="empty-state">No pending rentals. All commissions are processed.</div>
        ) : (
          <div className="pending-list">
            {pendingCommissions.map(comm => (
              <div key={comm.id} className="pending-card">
                <div className="pending-info">
                  <strong>{comm.listing?.title || 'Unknown Listing'}</strong>
                  <div className="pending-details">
                    <span>Rental: {formatCurrency(comm.rental_amount)}</span>
                    <span>Platform Commission (3.5%): {formatCurrency(comm.platform_share)}</span>
                    <span>Manager: {comm.manager?.full_name || 'N/A'}</span>
                  </div>
                  <small>Verified on: {new Date(comm.created_at).toLocaleDateString()}</small>
                </div>
                <button className="btn-confirm" onClick={() => confirmRental(comm.id)}>
                  <CheckCircle size={16} /> Confirm & Add Revenue
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="revenue-actions">
        <button className="action-card" onClick={exportRevenueReport}>
          <Download size={20} /> Download Detailed Report
        </button>
        {authUser?.role === 'super-admin' && (
          <button className="action-card" onClick={async () => {
            const newTarget = prompt('Enter new revenue target (₦):', stats.target);
            if (newTarget && !isNaN(parseFloat(newTarget))) {
              const { error } = await supabase
                .from('system_settings')
                .upsert({ key: 'revenue_target', value: newTarget.toString() }, { onConflict: 'key' });
              if (!error) {
                setRevenueTarget(parseFloat(newTarget));
                setStats(prev => ({ ...prev, target: parseFloat(newTarget) }));
                alert('Target updated!');
              } else {
                alert('Failed to update target');
              }
            }
          }}>
            <Target size={20} /> Set Revenue Target
          </button>
        )}
        <button className="action-card">
          <Calendar size={20} /> Schedule Review
        </button>
        <button className="action-card">
          <Filter size={20} /> Advanced Filters
        </button>
      </div>
    </div>
  );
};

export default AdminRevenue;