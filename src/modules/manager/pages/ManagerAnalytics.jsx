// src/modules/manager/pages/ManagerAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';

const ManagerAnalytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState({
    totalListings: 0,
    verifiedCount: 0,
    pendingCount: 0,
    responseTime: '24h',
    performanceScore: 85
  });

  useEffect(() => {
    if (user?.role !== 'manager') {
      navigate('/dashboard');
      return;
    }

    // Calculate analytics from localStorage
    const allListings = JSON.parse(localStorage.getItem('listings') || '[]');
    const managerListings = allListings.filter(l => l.managedById === user?.id);
    const verifiedListings = managerListings.filter(l => l.verified);
    const pendingListings = managerListings.filter(l => !l.verified && !l.rejected);

    setAnalytics({
      totalListings: managerListings.length,
      verifiedCount: verifiedListings.length,
      pendingCount: pendingListings.length,
      responseTime: '24h',
      performanceScore: managerListings.length > 0 ? Math.round((verifiedListings.length / managerListings.length) * 100) : 0
    });
  }, [user, navigate]);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Performance Analytics</h1>
        <button onClick={() => navigate('/dashboard/manager')} style={{ padding: '8px 16px', background: '#4a6fa5', color: 'white', border: 'none', borderRadius: '4px' }}>
          Back to Dashboard
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3>{analytics.totalListings}</h3>
          <p>Total Listings Managed</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3>{analytics.verifiedCount}</h3>
          <p>Verified Listings</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3>{analytics.pendingCount}</h3>
          <p>Pending Verifications</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3>{analytics.performanceScore}%</h3>
          <p>Performance Score</p>
        </div>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h3>Performance Metrics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <div>
            <p>Verification Rate</p>
            <div style={{ width: '100%', height: '10px', background: '#f0f0f0', borderRadius: '5px', marginTop: '10px' }}>
              <div style={{ 
                width: `${analytics.performanceScore}%`, 
                height: '100%', 
                background: '#388e3c', 
                borderRadius: '5px' 
              }}></div>
            </div>
            <p style={{ textAlign: 'right', marginTop: '5px' }}>{analytics.performanceScore}%</p>
          </div>
          <div>
            <p>Average Response Time</p>
            <h2 style={{ color: '#1976d2' }}>{analytics.responseTime}</h2>
            <small>Time to respond to new listings</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerAnalytics;