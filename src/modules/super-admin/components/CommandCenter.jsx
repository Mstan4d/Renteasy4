// src/modules/super-admin/components/CommandCenter.jsx (Simple)
import React, { useState, useEffect } from 'react';
import './CommandCenter.css';

const CommandCenter = () => {
  const [data, setData] = useState({
    listings: { total: 0, live: 0, verified: 0, rented: 0 },
    revenue: { today: 0, month: 0, lifetime: 0 },
    commission: { manager: 0, referrer: 0, platform: 0 }
  });

  useEffect(() => {
    console.log('CommandCenter mounted - Using MOCK DATA');
    
    // Use mock data directly
    const mockData = {
      listings: {
        total: 1247,
        live: 892,
        unverified: 213,
        verified: 679,
        rented: 142
      },
      chats: {
        active: 156,
        tenantLandlord: 89,
        tenantManager: 67
      },
      managers: {
        total: 84,
        online: 67,
        offline: 17
      },
      revenue: {
        today: 125000,
        month: 2850000,
        lifetime: 15200000
      },
      commission: {
        manager: 62500,
        referrer: 25000,
        platform: 102500
      }
    };
    
    setData(mockData);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="command-center" style={{padding: '20px'}}>
      <h1 style={{color: '#2563eb', marginBottom: '30px'}}>
        📊 SUPER ADMIN COMMAND CENTER (MOCK DATA)
      </h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {/* Listings Card */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3>🏠 Listings Overview</h3>
          <div style={{marginTop: '15px'}}>
            <p>Total: <strong>{data.listings.total}</strong></p>
            <p>Live: <strong style={{color: '#10b981'}}>{data.listings.live}</strong></p>
            <p>Verified: <strong style={{color: '#3b82f6'}}>{data.listings.verified}</strong></p>
            <p>Rented: <strong style={{color: '#8b5cf6'}}>{data.listings.rented}</strong></p>
          </div>
        </div>
        
        {/* Revenue Card */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3>💰 Revenue</h3>
          <div style={{marginTop: '15px'}}>
            <p>Today: <strong style={{color: '#059669'}}>{formatCurrency(data.revenue.today)}</strong></p>
            <p>This Month: <strong style={{color: '#059669'}}>{formatCurrency(data.revenue.month)}</strong></p>
            <p>Lifetime: <strong style={{color: '#059669'}}>{formatCurrency(data.revenue.lifetime)}</strong></p>
          </div>
        </div>
        
        {/* Commission Card */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3>💸 Commission Split</h3>
          <div style={{marginTop: '15px'}}>
            <p>Manager (2.5%): <strong>{formatCurrency(data.commission.manager)}</strong></p>
            <p>Referrer (1%): <strong>{formatCurrency(data.commission.referrer)}</strong></p>
            <p>Platform (4%): <strong>{formatCurrency(data.commission.platform)}</strong></p>
            <p style={{marginTop: '10px', color: '#dc2626'}}>
              Total Commission: 7.5%
            </p>
          </div>
        </div>
      </div>
      
      {/* Debug Info */}
      <div style={{
        marginTop: '40px',
        padding: '20px',
        background: '#f8fafc',
        borderRadius: '10px',
        border: '1px solid #e2e8f0'
      }}>
        <h4>🛠️ Debug Information</h4>
        <pre style={{fontSize: '12px', color: '#64748b'}}>
          Path: {window.location.pathname}
          Token: {localStorage.getItem('superAdminToken') ? '✅ Present' : '❌ Missing'}
          Data Source: Mock Data (Frontend Only)
          Time: {new Date().toLocaleTimeString()}
        </pre>
      </div>
    </div>
  );
};

export default CommandCenter;