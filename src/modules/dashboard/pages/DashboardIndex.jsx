import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';

const DashboardIndex = () => {
  const { user, loading } = useAuth(); // Ensure your context provides 'loading'
  const navigate = useNavigate();
  
 useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    const role = user.role?.toLowerCase();

    // MATCH THESE TO YOUR AppRoutes.jsx PATHS EXACTLY
    if (role === 'admin') {
      navigate('/admin', { replace: true });
    } 
    else if (role === 'super-admin') {
      navigate('/super-admin', { replace: true });
    } 
    else if (role === 'tenant') {
      // Changed from /tenant to the correct path in your AppRoutes
      navigate('/dashboard/tenant', { replace: true }); 
    } 
    else if (role === 'landlord') {
      navigate('/dashboard/landlord', { replace: true });
    } 
    else if (role === 'manager') {
      // Use full path if it's standalone, or /dashboard/manager if nested
      navigate('/dashboard/manager', { replace: true });
    } 
    else if (['estate-firm', 'estate_firm'].includes(role)) {
      navigate('/dashboard/estate-firm', { replace: true });
    } 
    else if (['provider', 'service-provider'].includes(role)) {
      navigate('/dashboard/provider', { replace: true });
    } 
    else {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: '#f8fafc' 
    }}>
      <div className="loading-spinner"></div>
      <p style={{ marginTop: '15px', color: '#64748b', fontWeight: '500' }}>
        Securing session and redirecting...
      </p>
    </div>
  );
};

export default DashboardIndex;