// src/modules/manager/pages/ManagerAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import './ManagerAnalytics.css';

const ManagerAnalytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState({
    totalListings: 0,
    verifiedCount: 0,
    pendingCount: 0,
    responseTime: '24h',
    performanceScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'manager') {
      navigate('/dashboard');
      return;
    }

    const fetchAnalytics = async () => {
      try {
        // 1. Get all listings managed by this manager
        const { data: listings, error: listingsError } = await supabase
          .from('listings')
          .select('*')
          .eq('managed_by', user.id); // adjust column name if needed

        if (listingsError) throw listingsError;

        const total = listings?.length || 0;
        const verified = listings?.filter(l => l.verified === true).length || 0;
        const pending = listings?.filter(l => !l.verified).length || 0;
        const performanceScore = total > 0 ? Math.round((verified / total) * 100) : 0;

        // 2. Calculate average response time from manager_assignments
        let responseTime = '24h'; // default

        const { data: assignments, error: assignError } = await supabase
          .from('manager_assignments')
          .select('created_at, accepted_at')
          .eq('manager_id', user.id)
          .not('accepted_at', 'is', null);

        if (!assignError && assignments && assignments.length > 0) {
          const totalHours = assignments.reduce((sum, a) => {
            const created = new Date(a.created_at);
            const accepted = new Date(a.accepted_at);
            const diffHours = (accepted - created) / (1000 * 60 * 60);
            return sum + diffHours;
          }, 0);
          const avgHours = totalHours / assignments.length;
          responseTime = Math.round(avgHours * 10) / 10 + 'h';
        }

        setAnalytics({
          totalListings: total,
          verifiedCount: verified,
          pendingCount: pending,
          responseTime,
          performanceScore
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, navigate]);

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>Performance Analytics</h1>
        <button 
          onClick={() => navigate('/dashboard/manager')}
          className="btn btn-primary"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{analytics.totalListings}</h3>
          <p>Total Listings Managed</p>
        </div>
        <div className="stat-card">
          <h3>{analytics.verifiedCount}</h3>
          <p>Verified Listings</p>
        </div>
        <div className="stat-card">
          <h3>{analytics.pendingCount}</h3>
          <p>Pending Verifications</p>
        </div>
        <div className="stat-card">
          <h3>{analytics.performanceScore}%</h3>
          <p>Performance Score</p>
        </div>
      </div>

      <div className="metrics-card">
        <h3>Performance Metrics</h3>
        <div className="metrics-grid">
          <div className="metric-item">
            <p>Verification Rate</p>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill"
                style={{ width: `${analytics.performanceScore}%` }}
              ></div>
            </div>
            <p className="progress-label">{analytics.performanceScore}%</p>
          </div>
          <div className="metric-item">
            <p>Average Response Time</p>
            <h2 className="response-time">{analytics.responseTime}</h2>
            <small>Time to respond to new listings</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerAnalytics;