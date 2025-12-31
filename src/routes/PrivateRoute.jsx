// src/routes/PrivateRoute.jsx - Clean Version
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../shared/context/AuthContext';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Authenticating...</p>
      </div>
    );
  }

  // No user? Redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    return <Navigate to="/dashboard" replace />;
  }

  // Grant access
  return children;
};

export default PrivateRoute;