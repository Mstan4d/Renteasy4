// src/modules/manager/pages/ManagerCommission.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';

const ManagerCommission = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [commissionData, setCommissionData] = useState({
    totalEarned: 0,
    pending: 0,
    withdrawn: 0,
    transactions: []
  });

  useEffect(() => {
    if (user?.role !== 'manager') {
      navigate('/dashboard');
      return;
    }

    // Load commission data from localStorage
    const managerCommissions = JSON.parse(localStorage.getItem('managerCommissions') || '[]');
    const userCommissions = managerCommissions.filter(c => c.managerId === user?.id);
    
    const totalEarned = userCommissions.reduce((sum, c) => sum + (c.amount || 0), 0);
    const pending = userCommissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + (c.amount || 0), 0);
    const withdrawn = userCommissions.filter(c => c.status === 'withdrawn').reduce((sum, c) => sum + (c.amount || 0), 0);

    setCommissionData({
      totalEarned,
      pending,
      withdrawn,
      transactions: userCommissions.slice(0, 10) // Last 10 transactions
    });
  }, [user, navigate]);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Commission Report</h1>
        <button onClick={() => navigate('/dashboard/manager')} style={{ padding: '8px 16px', background: '#4a6fa5', color: 'white', border: 'none', borderRadius: '4px' }}>
          Back to Dashboard
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#388e3c' }}>₦{commissionData.totalEarned.toLocaleString()}</h3>
          <p>Total Commission Earned</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#f57c00' }}>₦{commissionData.pending.toLocaleString()}</h3>
          <p>Pending Commission</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#1976d2' }}>₦{commissionData.withdrawn.toLocaleString()}</h3>
          <p>Withdrawn</p>
        </div>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h3>Recent Commission Transactions</h3>
        {commissionData.transactions.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No commission transactions yet</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Property</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Amount</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {commissionData.transactions.map((transaction, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{new Date(transaction.date).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>{transaction.property || 'N/A'}</td>
                  <td style={{ padding: '12px' }}>₦{transaction.amount?.toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '12px',
                      background: transaction.status === 'withdrawn' ? '#e8f5e9' : '#fff3e0',
                      color: transaction.status === 'withdrawn' ? '#388e3c' : '#f57c00'
                    }}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManagerCommission;