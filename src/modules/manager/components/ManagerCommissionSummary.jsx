// src/modules/manager/components/ManagerCommissionSummary.jsx
import React from 'react'

const ManagerCommissionSummary = ({ earnings }) => {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      margin: '30px 0',
      border: '1px solid #e9ecef'
    }}>
      <h3 style={{ marginBottom: '20px' }}>💰 Commission Summary</h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
            ₦{earnings?.toLocaleString() || '0'}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Total Earnings</div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
            2.5%
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Your Commission</div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6c757d' }}>
            7.5%
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Total Commission</div>
        </div>
      </div>
      
      <div style={{
        background: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#666'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Manager (You):</span>
          <span style={{ fontWeight: 'bold', color: '#28a745' }}>2.5%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Referrer:</span>
          <span style={{ fontWeight: 'bold', color: '#6c757d' }}>1.5%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>RentEasy Platform:</span>
          <span style={{ fontWeight: 'bold', color: '#007bff' }}>3.5%</span>
        </div>
      </div>
    </div>
  )
}

export default ManagerCommissionSummary