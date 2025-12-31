// src/shared/components/AdminLoading.jsx
import React from 'react';

const AdminLoading = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100vh',
    flexDirection: 'column',
    background: '#f9fafb'
  }}>
    <div className="loading-spinner" style={{
      width: '50px',
      height: '50px',
      border: '5px solid #e5e7eb',
      borderTop: '5px solid #3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading Admin Panel...</p>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export default AdminLoading;