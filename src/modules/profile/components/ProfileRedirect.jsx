// src/modules/profile/components/ProfileRedirect.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';

const ProfileRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  switch (user.role) {
    case 'tenant':
      return <Navigate to="/dashboard/profile" replace />;
    
    case 'landlord':
      return <Navigate to="/dashboard/profile" replace />;
    
    case 'estate-firm':
    case 'manager':
    case 'admin':
      // For estate roles, you could redirect to their public profile
      // Or to dashboard profile. Let's use dashboard profile for now
      // If you want public profile: `/estate-firms/${user.id}`
      return <Navigate to="/dashboard/profile" replace />;
    
    default:
      return <Navigate to="/dashboard/profile" replace />;
  }
};

export default ProfileRedirect;