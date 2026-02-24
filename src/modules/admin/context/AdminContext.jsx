// src/modules/admin/context/AdminContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';

const AdminContext = createContext();

// Hook - NO export keyword here
const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

// Provider - NO export keyword here
const AdminProvider = ({ children }) => {
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
    return {
      totalUsers: users.length,
      totalListings: listings.length,
      totalProviders: providers.length,
      verifiedUsers: users.filter(u => u.verified).length,
      verifiedListings: listings.filter(l => l.verified).length,
      monthlyGrowth: calculateGrowthRate(users),
      revenue: calculateRevenue()
    };
  };

  // Fixed: calculateRevenue doesn't need parameters now
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

  // Fixed: Added missing calculateGrowthRate function
  const calculateGrowthRate = (users) => {
    // Simple growth calculation based on user creation dates
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    const recentUsers = users.filter(user => {
      const userDate = new Date(user.createdAt || now);
      return userDate > lastMonth;
    });
    
    return recentUsers.length > 0 ? (recentUsers.length / users.length) * 100 : 0;
  };

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

// Export everything at the end (FIXED PATTERN)
export { AdminProvider, useAdmin };
export default AdminContext;