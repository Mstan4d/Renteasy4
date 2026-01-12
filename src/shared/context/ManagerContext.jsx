// src/shared/context/ManagerContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const ManagerContext = createContext();

export const useManager = () => {
  const context = useContext(ManagerContext);
  if (!context) {
    throw new Error('useManager must be used within a ManagerProvider');
  }
  return context;
};

export const ManagerProvider = ({ children }) => {
  const [managers, setManagers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [currentManager, setCurrentManager] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadManagers();
    loadNotifications();
  }, []);

  // Load managers from localStorage
  const loadManagers = () => {
    try {
      const storedManagers = JSON.parse(localStorage.getItem('managers') || '[]');
      setManagers(storedManagers);
      
      // If no managers exist, create sample managers
      if (storedManagers.length === 0) {
        const sampleManagers = getSampleManagers();
        localStorage.setItem('managers', JSON.stringify(sampleManagers));
        setManagers(sampleManagers);
      }
    } catch (error) {
      console.error('Error loading managers:', error);
      setManagers([]);
    }
  };

  // Load notifications from localStorage
  const loadNotifications = () => {
    try {
      const storedNotifications = JSON.parse(localStorage.getItem('managerNotifications') || '[]');
      setNotifications(storedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    }
  };

  // Get manager by ID
  const getManagerById = (managerId) => {
    return managers.find(manager => 
      manager.id === managerId || manager.userId === managerId
    );
  };

  // Get manager by user ID
  const getManagerByUserId = (userId) => {
    return managers.find(manager => manager.userId === userId);
  };

  // Check if manager can verify (must have KYC)
  const canManagerVerify = (managerId) => {
    const manager = getManagerById(managerId);
    return manager?.kycVerified && manager?.status === 'active';
  };

  // Check if manager can accept to manage (must have KYC)
  const canManagerAccept = (managerId) => {
    const manager = getManagerById(managerId);
    return manager?.kycVerified && manager?.status === 'active';
  };

  // Get nearby managers for a listing (within 1km)
  const getNearbyManagers = (listing) => {
    if (!listing?.coordinates) return [];
    
    return managers.filter(manager => {
      // Only consider KYC-verified active managers
      if (!(manager?.kycVerified && manager?.status === 'active')) return false;
      
      // Check if manager has location
      if (!manager.location?.coordinates) return false;
      
      // Mock distance calculation - replace with actual geolib
      const distance = Math.random() * 2000;
      
      // Return managers within 1km radius (1000 meters)
      return distance <= 1000;
    });
  };

  // Update manager KYC status
  const updateManagerKYC = (managerId, kycData) => {
    const updatedManagers = managers.map(manager => {
      if (manager.id === managerId || manager.userId === managerId) {
        return {
          ...manager,
          kycVerified: true,
          kycData: {
            ...kycData,
            verifiedAt: new Date().toISOString(),
            verifiedBy: 'admin' // or system
          },
          status: 'active'
        };
      }
      return manager;
    });
    
    setManagers(updatedManagers);
    localStorage.setItem('managers', JSON.stringify(updatedManagers));
    
    // Update current manager if it's the same
    if (currentManager && (currentManager.id === managerId || currentManager.userId === managerId)) {
      setCurrentManager(prev => ({
        ...prev,
        kycVerified: true,
        kycData: {
          ...kycData,
          verifiedAt: new Date().toISOString(),
          verifiedBy: 'admin'
        },
        status: 'active'
      }));
    }
    
    return updatedManagers.find(m => m.id === managerId || m.userId === managerId);
  };

  // Add new manager (when user signs up as manager)
  const addManager = (managerData) => {
    const newManager = {
      id: `manager_${Date.now()}`,
      ...managerData,
      kycVerified: false,
      status: 'pending',
      createdAt: new Date().toISOString(),
      managedListings: [],
      totalCommission: 0,
      rating: 0,
      reviews: []
    };
    
    const updatedManagers = [...managers, newManager];
    setManagers(updatedManagers);
    localStorage.setItem('managers', JSON.stringify(updatedManagers));
    
    return newManager;
  };

  // Add notification
  const addNotification = (notification) => {
    const newNotification = {
      id: `notif_${Date.now()}_${Math.random()}`,
      ...notification,
      read: false,
      timestamp: new Date().toISOString()
    };
    
    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    localStorage.setItem('managerNotifications', JSON.stringify(updatedNotifications));
    
    return newNotification;
  };

  // Mark notification as read
  const markNotificationAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );
    
    setNotifications(updatedNotifications);
    localStorage.setItem('managerNotifications', JSON.stringify(updatedNotifications));
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    
    setNotifications(updatedNotifications);
    localStorage.setItem('managerNotifications', JSON.stringify(updatedNotifications));
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
    localStorage.setItem('managerNotifications', JSON.stringify([]));
  };

  // Get unread notifications count
  const getUnreadNotificationsCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  // Set active manager (when manager logs in)
  const setActiveManager = (manager) => {
    setCurrentManager(manager);
  };

  // Update manager location
  const updateManagerLocation = (managerId, location) => {
    const updatedManagers = managers.map(manager => {
      if (manager.id === managerId || manager.userId === managerId) {
        return {
          ...manager,
          location: {
            coordinates: location,
            lastUpdated: new Date().toISOString()
          }
        };
      }
      return manager;
    });
    
    setManagers(updatedManagers);
    localStorage.setItem('managers', JSON.stringify(updatedManagers));
    
    if (currentManager && (currentManager.id === managerId || currentManager.userId === managerId)) {
      setCurrentManager(prev => ({
        ...prev,
        location: {
          coordinates: location,
          lastUpdated: new Date().toISOString()
        }
      }));
    }
  };

  // Add managed listing
  const addManagedListing = (managerId, listingData) => {
    const updatedManagers = managers.map(manager => {
      if (manager.id === managerId || manager.userId === managerId) {
        const managedListings = [...(manager.managedListings || []), listingData];
        return {
          ...manager,
          managedListings,
          activeListingsCount: managedListings.length
        };
      }
      return manager;
    });
    
    setManagers(updatedManagers);
    localStorage.setItem('managers', JSON.stringify(updatedManagers));
  };

  // Remove managed listing
  const removeManagedListing = (managerId, listingId) => {
    const updatedManagers = managers.map(manager => {
      if (manager.id === managerId || manager.userId === managerId) {
        const managedListings = (manager.managedListings || []).filter(
          listing => listing.listingId !== listingId
        );
        return {
          ...manager,
          managedListings,
          activeListingsCount: managedListings.length
        };
      }
      return manager;
    });
    
    setManagers(updatedManagers);
    localStorage.setItem('managers', JSON.stringify(updatedManagers));
  };

  // Send proximity notification for new listing
  const sendProximityNotification = (listing) => {
    const nearbyManagers = getNearbyManagers(listing);
    
    if (nearbyManagers.length === 0) return;
    
    nearbyManagers.forEach(manager => {
      addNotification({
        managerId: manager.id,
        type: 'new_listing',
        message: `New ${listing.userRole} listing nearby: "${listing.title}"`,
        listingId: listing.id,
        listingTitle: listing.title,
        listingType: listing.userRole,
        location: listing.coordinates,
        price: listing.price,
        actionUrl: `/listings/${listing.id}`,
        proximity: true
      });
    });
  };

  // Notify other managers that listing is taken
  const notifyListingTaken = (listing, assignedManagerId) => {
    const nearbyManagers = getNearbyManagers(listing);
    const otherManagers = nearbyManagers.filter(m => 
      (m.id !== assignedManagerId) && (m.userId !== assignedManagerId)
    );
    
    otherManagers.forEach(manager => {
      addNotification({
        managerId: manager.id,
        type: 'listing_taken',
        message: `Listing "${listing.title}" has been assigned to another manager`,
        listingId: listing.id,
        priority: 'low'
      });
    });
  };

  // Add commission to manager
  const addCommission = (managerId, commissionData) => {
    const updatedManagers = managers.map(manager => {
      if (manager.id === managerId || manager.userId === managerId) {
        const totalCommission = (manager.totalCommission || 0) + commissionData.amount;
        const commissionHistory = [
          ...(manager.commissionHistory || []),
          {
            ...commissionData,
            timestamp: new Date().toISOString()
          }
        ];
        
        return {
          ...manager,
          totalCommission,
          commissionHistory,
          lastCommissionDate: new Date().toISOString()
        };
      }
      return manager;
    });
    
    setManagers(updatedManagers);
    localStorage.setItem('managers', JSON.stringify(updatedManagers));
  };

  const value = {
    managers,
    notifications,
    currentManager,
    loading,
    loadManagers,
    loadNotifications,
    getManagerById,
    getManagerByUserId,
    canManagerVerify,
    canManagerAccept,
    getNearbyManagers,
    updateManagerKYC,
    addManager,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    getUnreadNotificationsCount,
    setActiveManager,
    updateManagerLocation,
    addManagedListing,
    removeManagedListing,
    sendProximityNotification,
    notifyListingTaken,
    addCommission
  };

  return (
    <ManagerContext.Provider value={value}>
      {children}
    </ManagerContext.Provider>
  );
};

// Sample managers data
const getSampleManagers = () => {
  return [
    {
      id: 'manager_001',
      userId: 'user_manager_001',
      name: 'Jane Manager',
      email: 'jane.manager@example.com',
      phone: '+2348012345678',
      kycVerified: true,
      kycData: {
        idCardUrl: 'https://example.com/id.jpg',
        proofOfAddressUrl: 'https://example.com/address.jpg',
        photoUrl: 'https://example.com/photo.jpg',
        verifiedAt: '2024-01-10T10:00:00Z',
        verifiedBy: 'admin'
      },
      status: 'active',
      location: {
        coordinates: { lat: 6.605874, lng: 3.349149 },
        lastUpdated: '2024-01-15T10:00:00Z'
      },
      managedListings: ['1', '5'],
      totalCommission: 125000,
      rating: 4.8,
      reviews: [
        {
          userId: 'user_001',
          rating: 5,
          comment: 'Great manager! Very professional.',
          timestamp: '2024-01-12T14:30:00Z'
        }
      ],
      createdAt: '2024-01-01T10:00:00Z',
      isAvailable: true,
      maxListings: 10,
      activeListingsCount: 2
    },
    {
      id: 'manager_002',
      userId: 'user_manager_002',
      name: 'Mike Property Manager',
      email: 'mike.manager@example.com',
      phone: '+2348098765432',
      kycVerified: true,
      kycData: {
        idCardUrl: 'https://example.com/id2.jpg',
        proofOfAddressUrl: 'https://example.com/address2.jpg',
        photoUrl: 'https://example.com/photo2.jpg',
        verifiedAt: '2024-01-05T09:00:00Z',
        verifiedBy: 'admin'
      },
      status: 'active',
      location: {
        coordinates: { lat: 6.428055, lng: 3.452222 },
        lastUpdated: '2024-01-14T11:00:00Z'
      },
      managedListings: ['5'],
      totalCommission: 75000,
      rating: 4.5,
      reviews: [],
      createdAt: '2024-01-03T09:00:00Z',
      isAvailable: true,
      maxListings: 8,
      activeListingsCount: 1
    },
    {
      id: 'manager_003',
      userId: 'user_manager_003',
      name: 'Unverified Manager',
      email: 'unverified.manager@example.com',
      phone: '+2348033333333',
      kycVerified: false,
      kycData: null,
      status: 'pending',
      location: {
        coordinates: { lat: 6.5010, lng: 3.3580 },
        lastUpdated: '2024-01-10T15:00:00Z'
      },
      managedListings: [],
      totalCommission: 0,
      rating: 0,
      reviews: [],
      createdAt: '2024-01-08T14:00:00Z',
      isAvailable: false,
      maxListings: 5,
      activeListingsCount: 0
    }
  ];
};


export default ManagerContext;