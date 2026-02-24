import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import { supabase } from '../../../../shared/lib/supabaseClient';
import { 
  TrendingUp, DollarSign, Home, BarChart3, 
  ArrowLeft, Download, MapPin, Zap 
} from 'lucide-react';
import './Analytics.css';

const Analytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('monthly');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user) fetchRealAnalytics();
  }, [user, timeRange]);

  const fetchRealAnalytics = async () => {
    try {
      setIsLoading(true);
      
      // 1. Fetch all properties posted by this landlord
      const { data: properties, error: propError } = await supabase
        .from('listings')
        .select('*')
        .eq('poster_id', user.id);

      if (propError) throw propError;

      // 2. Fetch all earned commissions (1.5%)
      const { data: commissions, error: commError } = await supabase
        .from('tenant_commissions')
        .select('*')
        .eq('tenant_id', user.id) // Landlord as poster
        .eq('status', 'paid');

      if (commError) throw commError;

      // 3. Process Data
      const totalProps = properties?.length || 0;
      const rentedProps = properties?.filter(p => p.status === 'rented').length || 0;
      const totalComm = commissions?.reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;
      const occupancyRate = totalProps > 0 ? Math.round((rentedProps / totalProps) * 100) : 0;

      setStats({
        totalProperties: totalProps,
        activeRentals: rentedProps,
        occupancyRate: `${occupancyRate}%`,
        totalCommission: totalComm,
        topProperties: properties?.sort((a, b) => b.price - a.price).slice(0, 3) || []
      });

    } catch (error) {
      console.error('Analytics Error:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => `₦${Number(amount).toLocaleString('en-NG')}`;

  if (isLoading) return <div className="loading-state">Generating Insights...</div>;

  return (
    <div className="analytics-container">
      {/* Header */}
      <header className="analytics-header">
        <button className="back-btn-minimal" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div className="header-text">
          <h1>Performance Insights</h1>
          <p>Real-time data for your portfolio</p>
        </div>
        <button className="export-btn">
          <Download size={18} /> Export
        </button>
      </header>

      {/* Hero Stats */}
      <div className="hero-stats-grid">
        <div className="hero-stat-card primary">
          <div className="stat-info">
            <label>Total Commissions (1.5%)</label>
            <h2>{formatCurrency(stats.totalCommission)}</h2>
          </div>
          <div className="stat-chart-mini">
            <TrendingUp size={32} color="rgba(255,255,255,0.4)" />
          </div>
        </div>

        <div className="hero-stat-card">
          <div className="stat-info">
            <label>Occupancy Rate</label>
            <h2>{stats.occupancyRate}</h2>
          </div>
          <div className="stat-bar-outer">
            <div className="stat-bar-inner" style={{ width: stats.occupancyRate }}></div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="analytics-main-grid">
        {/* Chart Section */}
        <section className="chart-box">
          <div className="box-header">
            <h3>Revenue Trend</h3>
            <select className="range-select">
              <option>Last 6 Months</option>
            </select>
          </div>
          <div className="visual-chart">
            {/* Simple CSS-based bar visualization */}
            {[40, 70, 55, 90, 65, 85].map((h, i) => (
              <div key={i} className="bar-wrapper">
                <div className="bar" style={{ height: `${h}%` }}></div>
                <span>M{i+1}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Top Properties */}
        <section className="top-list-box">
          <h3>Top Performers</h3>
          {stats.topProperties.map((prop, idx) => (
            <div className="top-prop-item" key={prop.id}>
              <div className="rank">{idx + 1}</div>
              <div className="prop-info">
                <h4>{prop.title}</h4>
                <p><MapPin size={12}/> {prop.address.split(',')[0]}</p>
              </div>
              <div className="prop-val">
                {formatCurrency(prop.price)}
              </div>
            </div>
          ))}
        </section>
      </div>

      {/* Smart Recommendations */}
      <section className="recommend-section">
        <h3><Zap size={18} color="#f59e0b" fill="#f59e0b"/> RentEasy AI Tips</h3>
        <div className="tips-scroll">
          <div className="tip-card">
            <h4>Maximize Profit</h4>
            <p>Your {stats.topProperties[0]?.property_type} in Lekki is in high demand. Consider a 5% increase on renewal.</p>
          </div>
          <div className="tip-card">
            <h4>Faster Conversion</h4>
            <p>Properties with 5+ photos rent 3x faster. Update your {stats.topProperties[stats.topProperties.length - 1]?.title} images.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Analytics;