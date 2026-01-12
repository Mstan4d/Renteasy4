// src/modules/admin/context/AdminContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const { user } = useAuth();
  const [adminData, setAdminData] = useState({
    users: [],
    listings: [],
    providers: [],
    verifications: [],
    analytics: {}
  });
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    userType: 'all',
    dateRange: 'today',
    searchQuery: ''
  });

  const loadAdminData = async () => {
    if (user?.role !== 'admin') return;
    
    setIsLoading(true);
    try {
      // Load all data from localStorage
      const users = JSON.parse(localStorage.getItem('rentEasyUsers') || '[]');
      const listings = JSON.parse(localStorage.getItem('listings') || '[]');
      const providers = JSON.parse(localStorage.getItem('serviceProviders') || '[]');
      const verifications = JSON.parse(localStorage.getItem('verificationRequests') || '[]');
      
      // Calculate analytics
      const analytics = calculateAnalytics(users, listings, providers);
      
      setAdminData({
        users,
        listings,
        providers,
        verifications,
        analytics
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAnalytics = (users, listings, providers) => {
    // Implementation of analytics calculation
    return {
      totalUsers: users.length,
      totalListings: listings.length,
      totalProviders: providers.length,
      verifiedUsers: users.filter(u => u.verified).length,
      verifiedListings: listings.filter(l => l.verified).length,
      //monthlyGrowth: calculateGrowthRate(users),
      revenue: calculateRevenue(listings)
    };
  };

  // Add this function to AdminContext.jsx
const calculateRevenue = () => {
  // Mock revenue calculation
  const listings = JSON.parse(localStorage.getItem('listings') || '[]');
  const rentedListings = listings.filter(l => l.status === 'rented');
  
  let totalRevenue = 0;
  let commissionRevenue = 0;
  
  rentedListings.forEach(listing => {
    const price = listing.price || 0;
    totalRevenue += price;
    
    // Apply 7.5% commission for non-estate firm listings
    if (listing.posterRole !== 'estate_firm') {
      commissionRevenue += price * 0.075;
    }
  });
  
  return {
    total: totalRevenue,
    commission: commissionRevenue,
    breakdown: {
      manager: commissionRevenue * 0.333, // 2.5% of 7.5%
      referrer: commissionRevenue * 0.133, // 1% of 7.5%
      platform: commissionRevenue * 0.534  // 4% of 7.5%
    }
  };
};

  // ... More admin-specific functions

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminData();
    }
  }, [user]);

  const value = {
    adminData,
    isLoading,
    filters,
    setFilters,
    loadAdminData,
    // Add more functions as needed
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};