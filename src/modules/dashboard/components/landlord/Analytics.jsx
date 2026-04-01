// src/modules/dashboard/pages/landlord/Analytics.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import {
  TrendingUp, DollarSign, Home, BarChart3,
  ArrowLeft, Download, MapPin, Zap,
  Users, Calendar, Clock, CheckCircle, XCircle,
  HelpCircle, FileText
} from 'lucide-react';
import './Analytics.css';

const Analytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('monthly');
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    if (user) fetchAnalytics();
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);

      // 1. Get all listings (properties) owned by this landlord
      const { data: listings, error: listError } = await supabase
        .from('listings')
        .select('*')
        .eq('landlord_id', user.id)
        .order('created_at', { ascending: false });

      if (listError) throw listError;

      const listingIds = (listings || []).map(l => l.id);

      // 2. Get all units linked to these listings (by listing_id)
      let units = [];
      if (listingIds.length > 0) {
        const { data: unitsData, error: unitsError } = await supabase
          .from('units')
          .select('*')
          .in('listing_id', listingIds);
        if (!unitsError) units = unitsData || [];
      }

      const unitIds = units.map(u => u.id);

      // 3. Fetch rent payments for these units
      let payments = [];
      if (unitIds.length > 0) {
        const { data: pays, error: payError } = await supabase
          .from('rent_payments')
          .select(`
            *,
            unit:unit_id (*),
            tenant:tenant_id (id, full_name, email, phone)
          `)
          .in('unit_id', unitIds)
          .order('due_date', { ascending: false });
        if (payError) throw payError;
        payments = pays || [];
      }

      // 4. Fetch commissions (if any – adjust table name if needed)
      const { data: commissions, error: commError } = await supabase
        .from('commissions')
        .select('*')
        .eq('landlord_id', user.id)
        .eq('status', 'paid');
      if (commError && commError.code !== 'PGRST116') throw commError;

      // 5. Process data
      const totalProperties = listings?.length || 0;
      const totalUnits = units.length;
      const occupiedUnits = units.filter(u => u.tenant_id).length;

      const totalRentDue = payments.reduce((sum, p) => sum + (p.amount_due || 0), 0);
      const totalRentCollected = payments
        .filter(p => p.status === 'confirmed')
        .reduce((sum, p) => sum + (p.amount_due || 0), 0);
      const pendingRent = payments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + (p.amount_due || 0), 0);
      const overdueCount = payments.filter(p =>
        p.status !== 'confirmed' && new Date(p.due_date) < new Date()
      ).length;

      // Monthly chart data
      const monthlyData = {};
      payments.forEach(p => {
        if (p.status === 'confirmed') {
          const date = new Date(p.paid_date || p.due_date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthlyData[monthKey] = (monthlyData[monthKey] || 0) + p.amount_due;
        }
      });
      const sortedMonths = Object.keys(monthlyData).sort().slice(-6);
      const chartData = sortedMonths.map(m => monthlyData[m]);

      // Top tenants by total rent paid
      const tenantRentMap = {};
      payments.forEach(p => {
        if (p.status === 'confirmed' && p.tenant?.id) {
          const tenantId = p.tenant.id;
          if (!tenantRentMap[tenantId]) {
            tenantRentMap[tenantId] = {
              tenant: p.tenant,
              totalRent: 0,
              lastPayment: p.paid_date
            };
          }
          tenantRentMap[tenantId].totalRent += p.amount_due;
        }
      });
      const topTenants = Object.values(tenantRentMap)
        .sort((a, b) => b.totalRent - a.totalRent)
        .slice(0, 5);

      const totalCommission = commissions?.reduce((sum, c) => sum + Number(c.amount || c.commission_amount), 0) || 0;

      // Prepare properties with units (for table)
      const propertiesWithUnits = (listings || []).map(property => {
        const propertyUnits = units.filter(u => u.listing_id === property.id);
        return {
          ...property,
          units: propertyUnits
        };
      });

      setAnalyticsData({
        totalProperties,
        totalUnits,
        occupiedUnits,
        occupancyRate: totalUnits ? Math.round((occupiedUnits / totalUnits) * 100) : 0,
        totalRentDue,
        totalRentCollected,
        pendingRent,
        overdueCount,
        collectionRate: totalRentDue ? Math.round((totalRentCollected / totalRentDue) * 100) : 0,
        totalCommission,
        topTenants,
        chartData,
        chartMonths: sortedMonths.map(m => {
          const [y, mo] = m.split('-');
          return `${mo}/${y.slice(2)}`;
        }),
        properties: propertiesWithUnits,
        payments
      });

    } catch (error) {
      console.error('Analytics Error:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => `₦${Number(amount).toLocaleString('en-NG')}`;

  if (isLoading) return <div className="loading-state">Generating Insights...</div>;
  if (!analyticsData) return <div className="error-state">No data available</div>;

  return (
    <div className="analytics-container">
      {/* Header */}
      <header className="analytics-header">
        <button className="back-btn-minimal" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div className="header-text">
          <h1>Rental Performance Analytics</h1>
          <p>Real-time insights for your portfolio</p>
        </div>
        <div className="header-actions">
          <button className="support-btn" onClick={() => navigate('/dashboard/landlord/support')}>
            <HelpCircle size={18} /> Support
          </button>
          <button className="report-btn" onClick={() => navigate('/dashboard/landlord/reports')}>
            <FileText size={18} /> Reports
          </button>
          <button className="export-btn" onClick={() => alert('Export to CSV')}>
            <Download size={18} /> Export
          </button>
        </div>
      </header>

      {/* Key Stats Row */}
      <div className="hero-stats-grid">
        <div className="hero-stat-card primary">
          <div className="stat-info">
            <label>Rent Collected</label>
            <h2>{formatCurrency(analyticsData.totalRentCollected)}</h2>
          </div>
          <div className="stat-chart-mini">
            <DollarSign size={32} color="rgba(255,255,255,0.4)" />
          </div>
        </div>

        <div className="hero-stat-card">
          <div className="stat-info">
            <label>Pending Rent</label>
            <h2>{formatCurrency(analyticsData.pendingRent)}</h2>
          </div>
          <div className="stat-chart-mini">
            <Clock size={32} color="rgba(255,255,255,0.4)" />
          </div>
        </div>

        <div className="hero-stat-card">
          <div className="stat-info">
            <label>Overdue</label>
            <h2>{analyticsData.overdueCount}</h2>
          </div>
          <div className="stat-chart-mini">
            <XCircle size={32} color="rgba(255,255,255,0.4)" />
          </div>
        </div>

        <div className="hero-stat-card">
          <div className="stat-info">
            <label>Occupancy</label>
            <h2>{analyticsData.occupancyRate}%</h2>
          </div>
          <div className="stat-bar-outer">
            <div className="stat-bar-inner" style={{ width: `${analyticsData.occupancyRate}%` }}></div>
          </div>
        </div>
      </div>

      {/* Second Row Stats */}
      <div className="stats-grid-secondary">
        <div className="stat-card">
          <div className="stat-icon"><Home size={20} /></div>
          <div className="stat-info">
            <span className="stat-value">{analyticsData.totalProperties}</span>
            <span className="stat-label">Properties</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Users size={20} /></div>
          <div className="stat-info">
            <span className="stat-value">{analyticsData.occupiedUnits}</span>
            <span className="stat-label">Occupied Units</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><DollarSign size={20} /></div>
          <div className="stat-info">
            <span className="stat-value">{formatCurrency(analyticsData.totalCommission)}</span>
            <span className="stat-label">Commissions Earned</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><TrendingUp size={20} /></div>
          <div className="stat-info">
            <span className="stat-value">{analyticsData.collectionRate}%</span>
            <span className="stat-label">Collection Rate</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="analytics-main-grid">
        {/* Chart Section */}
        <section className="chart-box">
          <div className="box-header">
            <h3>Monthly Rent Collection</h3>
            <select
              className="range-select"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="monthly">Last 6 Months</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="visual-chart">
            {analyticsData.chartData.length > 0 ? (
              analyticsData.chartData.map((value, i) => (
                <div key={i} className="bar-wrapper">
                  <div
                    className="bar"
                    style={{ height: `${(value / Math.max(...analyticsData.chartData)) * 100}%` }}
                  ></div>
                  <span>{analyticsData.chartMonths[i]}</span>
                </div>
              ))
            ) : (
              <p className="no-data">No payment data yet</p>
            )}
          </div>
        </section>

        {/* Top Tenants */}
        <section className="top-list-box">
          <h3>Top Tenants by Rent</h3>
          {analyticsData.topTenants.length > 0 ? (
            analyticsData.topTenants.map((item, idx) => (
              <div className="top-prop-item" key={item.tenant.id}>
                <div className="rank">{idx + 1}</div>
                <div className="prop-info">
                  <h4>{item.tenant.full_name || item.tenant.name}</h4>
                  <p><Calendar size={12} /> Last: {new Date(item.lastPayment).toLocaleDateString()}</p>
                </div>
                <div className="prop-val">
                  {formatCurrency(item.totalRent)}
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">No tenant payments yet</p>
          )}
        </section>
      </div>

      {/* Property Performance */}
      <section className="property-performance">
        <h3>Property Performance</h3>
        <div className="property-table">
          <table>
            <thead>
              <tr>
                <th>Property</th>
                <th>Units</th>
                <th>Occupied</th>
                <th>Rent Collected</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.properties.map(prop => {
                const units = prop.units || [];
                const occupied = units.filter(u => u.tenant_id).length;
                const propPayments = analyticsData.payments.filter(p => p.unit?.listing_id === prop.id);
                const collected = propPayments
                  .filter(p => p.status === 'confirmed')
                  .reduce((sum, p) => sum + p.amount_due, 0);
                return (
                  <tr key={prop.id}>
                    <td>{prop.title}</td>
                    <td>{units.length}</td>
                    <td>{occupied}</td>
                    <td>{formatCurrency(collected)}</td>
                    <td>
                      <span className={`badge ${occupied === units.length ? 'badge-success' : 'badge-warning'}`}>
                        {occupied === units.length ? 'Full' : 'Vacancies'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Smart Recommendations */}
      <section className="recommend-section">
        <h3><Zap size={18} color="#f59e0b" fill="#f59e0b" /> RentEasy AI Tips</h3>
        <div className="tips-scroll">
          <div className="tip-card">
            <h4>Maximize Profit</h4>
            <p>Your properties in high-demand areas could see 5% rent increase.</p>
          </div>
          <div className="tip-card">
            <h4>Reduce Overdue</h4>
            <p>Send payment reminders 3 days before due date to improve collection rate.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Analytics;