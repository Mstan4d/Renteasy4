// src/modules/dashboard/pages/DashboardIndex.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';

const DashboardIndex = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user?.role === 'landlord') {
      navigate('/dashboard/landlord', { replace: true });
    } else if (user?.role === 'tenant') {
      navigate('/dashboard/tenant', { replace: true });
    } else if (user?.role === 'estate-firm') {
      navigate('/dashboard/estate-firm', { replace: true });
    } else if (user?.role === 'service-provider') {
        navigate('/dashboard/provider', { replace: true });
    } else if (user?.role === 'manager') {
        navigate('/dashboard/manager', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);
  
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <div className="loading-spinner"></div>
      <p>Redirecting to your dashboard...</p>
    </div>
  );
};

export default DashboardIndex;