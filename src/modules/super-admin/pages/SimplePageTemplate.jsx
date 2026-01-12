// src/modules/super-admin/pages/SimplePageTemplate.jsx
import React from 'react';

const SimplePageTemplate = ({ title }) => {
  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', borderBottom: '2px solid #4CAF50', paddingBottom: '10px' }}>
        {title} - RentEasy Super Admin
      </h1>
      <div style={{ 
        background: '#f9f9f9', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3>🎯 Functionality Coming Soon</h3>
        <p>This page will contain {title.toLowerCase()} features.</p>
        <div style={{ marginTop: '20px', padding: '15px', background: '#e8f5e9', borderRadius: '5px' }}>
          <strong>Status:</strong> Page rendered successfully ✓
        </div>
      </div>
    </div>
  );
};

export default SimplePageTemplate;