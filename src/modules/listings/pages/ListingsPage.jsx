// src/modules/listings/pages/ListingsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import Header from '../../../shared/components/Header';
import VerifiedBadge, { InlineVerifiedBadge } from '../../../shared/components/VerifiedBadge';
import ListingCard from '../components/ListingCard';
import ListingDetails from '../components/ListingDetails';
import FilterBar from '../components/FilterBar';
import StatsSummary from '../components/StatsSummary';
import { nigerianStates, getLGAsForState } from '../../../shared/data/nigerianLocations';
import { Search, Filter, Bell, Shield, UserCheck, Building, Home, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import './ListingsPage.css';

// Mock geolib function (you should install actual geolib package)
const getDistance = (coord1, coord2) => {
  // Mock distance calculation - replace with actual geolib implementation
  return Math.random() * 2000; // Returns distance between 0-2000 meters
};

const ListingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // State Management
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [filters, setFilters] = useState({
    state: '',
    lga: '',
    propertyType: '',
    searchQuery: '',
    minPrice: '',
    maxPrice: '',
    verifiedOnly: false,
    status: 'all', // all, verified, pending, rejected
    userRole: 'all', // all, tenant, landlord, estate-firm, manager
    sortBy: 'newest' // newest, price_low, price_high, verified, pending, user_verified
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0,
    tenants: 0,
    landlords: 0,
    estates: 0,
    avgPrice: 0,
    unverifiedUsers: 0
  });

  // Managers state
  const [managers, setManagers] = useState([]);

  // Initialize data
  useEffect(() => {
    loadListings();
    loadManagers();
    
    // Check for listing from home page
    const homeSelectedListing = JSON.parse(localStorage.getItem('currentListing') || 'null');
    if (homeSelectedListing) {
      const existingListings = JSON.parse(localStorage.getItem('listings') || '[]');
      const updatedListings = [homeSelectedListing, ...existingListings.filter(l => l.id !== homeSelectedListing.id)];
      localStorage.setItem('listings', JSON.stringify(updatedListings));
      localStorage.removeItem('currentListing');
      loadListings();
    }
  }, []);

  // Apply filters when filters change
  useEffect(() => {
    applyFilters();
  }, [filters, listings]);

  // Check for new listings periodically
  useEffect(() => {
    const interval = setInterval(checkForNewListings, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, [listings]);

  // Load listings from localStorage
  const loadListings = () => {
    try {
      setLoading(true);
      const storedListings = JSON.parse(localStorage.getItem('listings') || '[]');
      
      // Add sample listings if none exist
      if (storedListings.length === 0) {
        const sampleListings = getSampleListings();
        localStorage.setItem('listings', JSON.stringify(sampleListings));
        setListings(sampleListings);
      } else {
        setListings(storedListings);
      }
      
      calculateStats(storedListings);
    } catch (error) {
      console.error('Error loading listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  // Load managers from localStorage
  const loadManagers = () => {
    const storedManagers = JSON.parse(localStorage.getItem('managers') || '[]');
    setManagers(storedManagers);
  };

  const calculateStats = (listingsData) => {
    const total = listingsData.length;
    const verified = listingsData.filter(l => l.verified && l.status === 'approved').length;
    const pending = listingsData.filter(l => l.status === 'pending' || (!l.verified && !l.rejected)).length;
    const rejected = listingsData.filter(l => l.rejected).length;
    const tenants = listingsData.filter(l => l.userRole === 'tenant').length;
    const landlords = listingsData.filter(l => l.userRole === 'landlord').length;
    const estates = listingsData.filter(l => l.userRole === 'estate-firm').length;
    const unverifiedUsers = listingsData.filter(l => !l.userVerified).length;
    const totalPrice = listingsData.reduce((sum, l) => sum + (parseFloat(l.price) || 0), 0);
    const avgPrice = total > 0 ? totalPrice / total : 0;
    
    setStats({
      total,
      verified,
      pending,
      rejected,
      tenants,
      landlords,
      estates,
      unverifiedUsers,
      avgPrice: Math.round(avgPrice)
    });
  };

  // Get verification type for badge
  const getVerificationType = (listing) => {
    if (listing.userRole === 'estate-firm') return 'estate';
    if (listing.userRole === 'landlord') return 'landlord';
    if (listing.userRole === 'tenant') return 'tenant';
    return 'user';
  };

  // Get listing status for display
  const getListingStatus = (listing) => {
    if (listing.rejected) return 'rejected';
    if (listing.verified && listing.status === 'approved') return 'verified';
    if (listing.status === 'pending' || (!listing.verified && !listing.rejected)) return 'pending';
    return 'unknown';
  };

  // BUSINESS RULE: Check if manager can verify (must have KYC)
  const canManagerVerify = (managerId) => {
    if (!managerId) return false;
    const manager = managers.find(m => m.userId === managerId || m.id === managerId);
    return manager?.kycVerified && manager?.status === 'active';
  };

  // BUSINESS RULE: Check if manager can accept to manage (must have KYC)
  const canManagerAccept = (managerId) => {
    if (!managerId) return false;
    const manager = managers.find(m => m.userId === managerId || m.id === managerId);
    return manager?.kycVerified && manager?.status === 'active';
  };

  // BUSINESS RULE: Get nearby managers for a listing (within 1km)
  const getNearbyManagers = (listing) => {
    if (!listing?.coordinates) return [];
    
    return managers.filter(manager => {
      // Only consider KYC-verified active managers
      if (!(manager?.kycVerified && manager?.status === 'active')) return false;
      
      // Check if manager has location
      if (!manager.location?.coordinates) return false;
      
      // Calculate distance (in meters)
      const distance = getDistance(
        listing.coordinates,
        manager.location.coordinates
      );
      
      // Return managers within 1km radius (1000 meters)
      return distance <= 1000;
    });
  };

  // Apply filters
  const applyFilters = useCallback(() => {
    let filtered = [...listings];

    // Apply state filter
    if (filters.state) {
      filtered = filtered.filter(listing => listing.state === filters.state);
    }

    // Apply LGA filter
    if (filters.lga) {
      filtered = filtered.filter(listing => listing.lga === filters.lga);
    }

    // Apply property type filter
    if (filters.propertyType) {
      filtered = filtered.filter(listing => listing.propertyType === filters.propertyType);
    }

    // Apply user role filter
    if (filters.userRole && filters.userRole !== 'all') {
      filtered = filtered.filter(listing => listing.userRole === filters.userRole);
    }

    // Apply search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(listing =>
        (listing.title?.toLowerCase().includes(query)) ||
        (listing.description?.toLowerCase().includes(query)) ||
        (listing.address?.toLowerCase().includes(query)) ||
        (listing.posterName?.toLowerCase().includes(query)) ||
        (listing.state?.toLowerCase().includes(query)) ||
        (listing.lga?.toLowerCase().includes(query))
      );
    }

    // Apply price filters
    if (filters.minPrice) {
      filtered = filtered.filter(listing => 
        parseFloat(listing.price) >= parseFloat(filters.minPrice)
      );
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(listing => 
        parseFloat(listing.price) <= parseFloat(filters.maxPrice)
      );
    }

    // Apply verification status filter
    if (filters.status === 'verified') {
      filtered = filtered.filter(listing => listing.verified && listing.status === 'approved');
    } else if (filters.status === 'pending') {
      filtered = filtered.filter(listing => listing.status === 'pending' || (!listing.verified && !listing.rejected));
    } else if (filters.status === 'rejected') {
      filtered = filtered.filter(listing => listing.rejected);
    }

    // Apply verified only filter
    if (filters.verifiedOnly) {
      filtered = filtered.filter(listing => listing.verified && listing.status === 'approved');
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price_low':
        filtered.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
        break;
      case 'price_high':
        filtered.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
        break;
      case 'verified':
        filtered.sort((a, b) => {
          const aVerified = (a.verified && a.status === 'approved') ? 1 : 0;
          const bVerified = (b.verified && b.status === 'approved') ? 1 : 0;
          return bVerified - aVerified;
        });
        break;
      case 'pending':
        filtered.sort((a, b) => {
          const aPending = (a.status === 'pending' || (!a.verified && !a.rejected)) ? 1 : 0;
          const bPending = (b.status === 'pending' || (!b.verified && !b.rejected)) ? 1 : 0;
          return bPending - aPending;
        });
        break;
      case 'user_verified':
        filtered.sort((a, b) => {
          const aUserVerified = a.userVerified ? 1 : 0;
          const bUserVerified = b.userVerified ? 1 : 0;
          return bUserVerified - aUserVerified;
        });
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
    }

    setFilteredListings(filtered);
  }, [filters, listings]);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset LGA when state changes
    if (name === 'state') {
      setFilters(prev => ({
        ...prev,
        state: value,
        lga: ''
      }));
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      state: '',
      lga: '',
      propertyType: '',
      searchQuery: '',
      minPrice: '',
      maxPrice: '',
      verifiedOnly: false,
      status: 'all',
      userRole: 'all',
      sortBy: 'newest'
    });
  };

  // Check for new listings
  const checkForNewListings = () => {
    const currentListings = JSON.parse(localStorage.getItem('listings') || '[]');
    const currentIds = currentListings.map(l => l.id);
    const previousIds = listings.map(l => l.id);
    
    const newListings = currentListings.filter(l => !previousIds.includes(l.id));
    
    if (newListings.length > 0) {
      // BUSINESS RULE: Send proximity notifications to managers for new listings
      newListings.forEach(listing => {
        // Only send notifications for tenant and landlord listings (not estate firms)
        if (listing.userRole !== 'estate-firm') {
          sendProximityNotification(listing);
        }
      });
      
      // Play notification sound (only for admin/manager)
      if (user?.role === 'admin' || user?.role === 'manager') {
        const audio = new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg');
        audio.play().catch(() => {});
      }
      
      // Reload listings
      loadListings();
    }
  };

  // BUSINESS RULE: Send proximity notification to nearby managers
  const sendProximityNotification = (listing) => {
    const nearbyManagers = getNearbyManagers(listing);
    
    if (nearbyManagers.length === 0) return;
    
    const notifications = JSON.parse(localStorage.getItem('managerNotifications') || '[]');
    
    nearbyManagers.forEach(manager => {
      const newNotification = {
        id: `notif_${Date.now()}_${Math.random()}`,
        managerId: manager.userId || manager.id,
        type: 'new_listing',
        message: `New ${listing.userRole} listing nearby: "${listing.title}"`,
        listingId: listing.id,
        listingTitle: listing.title,
        listingType: listing.userRole,
        location: listing.coordinates,
        price: listing.price,
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: `/listings/${listing.id}`,
        proximity: true
      };
      
      notifications.push(newNotification);
    });
    
    localStorage.setItem('managerNotifications', JSON.stringify(notifications));
  };

  // BUSINESS RULE: Notify other managers that listing is taken
  const notifyOtherManagers = (listing, assignedManagerId) => {
    const nearbyManagers = getNearbyManagers(listing);
    const otherManagers = nearbyManagers.filter(m => 
      (m.userId !== assignedManagerId) && (m.id !== assignedManagerId)
    );
    
    const notifications = JSON.parse(localStorage.getItem('managerNotifications') || '[]');
    
    otherManagers.forEach(manager => {
      notifications.push({
        id: Date.now() + Math.random(),
        managerId: manager.userId || manager.id,
        type: 'listing_taken',
        message: `Listing "${listing.title}" has been assigned to another manager`,
        listingId: listing.id,
        timestamp: new Date().toISOString(),
        read: false
      });
    });
    
    localStorage.setItem('managerNotifications', JSON.stringify(notifications));
  };

  // BUSINESS RULE: Setup manager chat for tenant listings
  const setupManagerChat = (listingId, managerId) => {
    const listing = listings.find(l => l.id === listingId);
    const chats = JSON.parse(localStorage.getItem('chats') || '[]');
    
    // Check if chat already exists
    const existingChat = chats.find(c => c.listingId === listingId);
    
    if (!existingChat) {
      const newChat = {
        id: `chat_${Date.now()}`,
        listingId,
        participants: {
          tenant: listing.posterId,
          manager: managerId,
          admin: null // Admin can join if needed
        },
        messages: [],
        type: 'tenant_manager_chat',
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      
      localStorage.setItem('chats', JSON.stringify([...chats, newChat]));
    }
  };

  // Handle listing click
  const handleViewDetails = (listing) => {
    setSelectedListing(listing);
  };

  // Handle back to listings
  const handleBackToListings = () => {
    setSelectedListing(null);
  };

  // BUSINESS RULE: Handle contact button with proper routing
  const handleContact = (listing) => {
    if (!user) {
      navigate('/login', { state: { from: `/listings/${listing.id}` } });
      return;
    }

    // BUSINESS RULE 1: If tenant posts, incoming tenants must go through manager
    if (listing.userRole === 'tenant') {
      // Check if user is the outgoing tenant themselves
      if (user.id === listing.posterId) {
        alert('You cannot contact yourself for your own listing');
        return;
      }
      
      // BUSINESS RULE: Incoming tenants go through manager
      // Check if manager is assigned
      if (listing.managedById) {
        const contactData = {
          listingId: listing.id,
          title: listing.title,
          posterName: listing.posterName,
          posterId: listing.posterId,
          managerId: listing.managedById,
          managerName: listing.managedBy,
          type: 'tenant_listing',
          userVerified: listing.userVerified,
          price: listing.price,
          state: listing.state,
          lga: listing.lga
        };
        
        localStorage.setItem('activeContact', JSON.stringify(contactData));
        navigate(`/dashboard/messages?listing=${encodeURIComponent(listing.id)}&type=tenant_listing`);
      } else {
        alert('This listing is being assigned to a manager. Please check back soon.');
      }
      return;
    }
    
    // BUSINESS RULE 2: Landlord listings - direct contact with manager monitoring
    if (listing.userRole === 'landlord') {
      // Check if user is the landlord themselves
      if (user.id === listing.posterId) {
        alert('You cannot contact yourself for your own listing');
        return;
      }
      
      const contactData = {
        listingId: listing.id,
        title: listing.title,
        posterName: listing.posterName,
        posterId: listing.posterId,
        type: 'landlord_listing',
        userVerified: listing.userVerified,
        price: listing.price,
        state: listing.state,
        lga: listing.lga,
        // Include manager info if assigned
        managerId: listing.managedById,
        managerName: listing.managedBy
      };
      
      localStorage.setItem('activeContact', JSON.stringify(contactData));
      navigate(`/dashboard/messages?listing=${encodeURIComponent(listing.id)}&type=landlord_listing`);
      return;
    }
    
    // BUSINESS RULE 3: Estate Firm listings - direct contact, NO manager involvement
    if (listing.userRole === 'estate-firm') {
      // Check if user is from the same estate firm
      if (user.id === listing.posterId) {
        alert('You cannot contact your own estate firm listing');
        return;
      }
      
      const contactData = {
        listingId: listing.id,
        title: listing.title,
        posterName: listing.posterName,
        posterId: listing.posterId,
        type: 'estate_firm_listing',
        userVerified: listing.userVerified,
        price: listing.price,
        state: listing.state,
        lga: listing.lga,
        commissionRate: 0 // Estate firm listings have 0% commission
      };
      
      localStorage.setItem('activeContact', JSON.stringify(contactData));
      navigate(`/dashboard/messages?listing=${encodeURIComponent(listing.id)}&type=estate_firm_listing`);
      return;
    }
  };

  // BUSINESS RULE: Handle verify button with KYC check
  const handleVerify = (listingId) => {
    // BUSINESS RULE: Managers must have KYC to verify
    if (user?.role === 'manager') {
      if (!canManagerVerify(user.id)) {
        alert('You must complete KYC verification before you can verify listings.');
        return;
      }
      
      // BUSINESS RULE: Managers can only verify listings they manage
      const listingToVerify = listings.find(l => l.id === listingId);
      if (listingToVerify.managedById !== user.id) {
        alert('You can only verify listings that you are managing.');
        return;
      }
    }
    
    const listingToVerify = listings.find(l => l.id === listingId);
    const updatedListings = listings.map(listing => 
      listing.id === listingId ? { 
        ...listing, 
        verified: true, 
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: user?.name,
        approvedById: user?.id,
        // BUSINESS RULE: If manager verifies, they become permanently assigned
        ...(user?.role === 'manager' && {
          managedBy: user?.name,
          managedById: user?.id,
          isManaged: true
        })
      } : listing
    );
    
    localStorage.setItem('listings', JSON.stringify(updatedListings));
    setListings(updatedListings);
    
    // Add to admin activities
    const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
    activities.unshift({
      id: Date.now(),
      action: `Approved listing: ${listingToVerify?.title}`,
      type: 'listing',
      admin: user?.name,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('adminActivities', JSON.stringify(activities.slice(0, 100)));
    
    // Show success notification
    alert('Listing verified successfully!');
  };

  // Handle user verification
  const handleVerifyUser = (listingId) => {
    const listingToVerify = listings.find(l => l.id === listingId);
    const updatedListings = listings.map(listing => 
      listing.id === listingId ? { 
        ...listing, 
        userVerified: true,
        userVerifiedAt: new Date().toISOString(),
        userVerifiedBy: user?.name
      } : listing
    );
    
    localStorage.setItem('listings', JSON.stringify(updatedListings));
    setListings(updatedListings);
    
    // Add to admin activities
    const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
    activities.unshift({
      id: Date.now(),
      action: `Verified user: ${listingToVerify?.posterName} (${listingToVerify?.userRole})`,
      type: 'user',
      admin: user?.name,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('adminActivities', JSON.stringify(activities.slice(0, 100)));
    
    // Show success notification
    alert('User verified successfully!');
  };

  // Handle reject listing (admin only)
  const handleReject = (listingId, reason = 'Does not meet guidelines') => {
    if (!window.confirm('Are you sure you want to reject this listing?')) return;
    
    const listingToReject = listings.find(l => l.id === listingId);
    const updatedListings = listings.map(listing => 
      listing.id === listingId ? { 
        ...listing, 
        verified: false,
        rejected: true,
        status: 'rejected',
        rejectionReason: reason,
        rejectedAt: new Date().toISOString(),
        rejectedBy: user?.name
      } : listing
    );
    
    localStorage.setItem('listings', JSON.stringify(updatedListings));
    setListings(updatedListings);
    
    // Add to admin activities
    const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
    activities.unshift({
      id: Date.now(),
      action: `Rejected listing: ${listingToReject?.title}`,
      type: 'listing',
      admin: user?.name,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('adminActivities', JSON.stringify(activities.slice(0, 100)));
    
    alert('Listing rejected!');
  };

  // BUSINESS RULE: Handle accept to manage with KYC and proximity checks
  const handleAcceptToManage = (listingId) => {
    // BUSINESS RULE: Managers must have KYC
    if (user?.role === 'manager') {
      if (!canManagerAccept(user.id)) {
        alert('You must complete KYC verification before you can manage listings.');
        return;
      }
      
      const listingToManage = listings.find(l => l.id === listingId);
      
      // BUSINESS RULE: Check proximity (1km radius)
      const nearbyManagers = getNearbyManagers(listingToManage);
      const isNearby = nearbyManagers.some(m => 
        (m.userId === user.id) || (m.id === user.id)
      );
      
      if (!isNearby) {
        alert('You must be within 1km radius of the property to manage it.');
        return;
      }
      
      // BUSINESS RULE: Only for tenant and landlord listings, NOT estate firm
      if (listingToManage.userRole === 'estate-firm') {
        alert('Estate firm listings do not require manager management.');
        return;
      }
      
      // Get current managed listings
      const managedListings = JSON.parse(localStorage.getItem('managedListings') || '[]');
      const alreadyManaged = managedListings.find(l => l.listingId === listingId);
      
      if (alreadyManaged) {
        alert('This listing is already being managed!');
        return;
      }
      
      // BUSINESS RULE: Send notification to other nearby managers that this listing is taken
      notifyOtherManagers(listingToManage, user.id);
      
      // Add to managed listings
      const newManagedListing = {
        listingId,
        title: listingToManage.title,
        state: listingToManage.state,
        lga: listingToManage.lga,
        price: listingToManage.price,
        acceptedAt: new Date().toISOString(),
        managerName: user?.name,
        managerId: user?.id,
        status: 'active',
        posterRole: listingToManage.userRole,
        commissionRate: 7.5, // BUSINESS RULE: Always 7.5% commission
        managerCommission: 2.5, // BUSINESS RULE: Manager gets 2.5%
        rentEasyCommission: 4 // BUSINESS RULE: RentEasy gets 4%
      };
      
      localStorage.setItem('managedListings', JSON.stringify([...managedListings, newManagedListing]));
      
      // Update listing
      const updatedListings = listings.map(listing => 
        listing.id === listingId ? { 
          ...listing, 
          isManaged: true,
          managedBy: user?.name,
          managedById: user?.id,
          managedAt: new Date().toISOString(),
          managerAssigned: true,
          commissionRate: 7.5,
          managerCommission: 2.5,
          rentEasyCommission: 4
        } : listing
      );
      
      localStorage.setItem('listings', JSON.stringify(updatedListings));
      setListings(updatedListings);
      
      // BUSINESS RULE: If this is a tenant listing, add manager to chat
      if (listingToManage.userRole === 'tenant') {
        setupManagerChat(listingId, user.id);
      }
      
      alert('You are now managing this listing!');
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="listings-page">
        <Header />
        <div className="listings-loading">
          <div className="loading-spinner"></div>
          <p>Loading listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="listings-page">
      <Header />
      
      {/* Main Content */}
      <main className="listings-main">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-inner">
            <div className="header-content">
              <h1>Available Properties</h1>
              <p>Browse homes posted by outgoing tenants and landlords</p>
              
              {/* Quick Stats */}
              <div className="quick-stats">
                <div className="quick-stat">
                  <CheckCircle size={16} className="stat-icon verified" />
                  <span className="stat-count">{stats.verified}</span>
                  <span className="stat-label">Verified</span>
                </div>
                <div className="quick-stat">
                  <Clock size={16} className="stat-icon pending" />
                  <span className="stat-count">{stats.pending}</span>
                  <span className="stat-label">Pending</span>
                </div>
                <div className="quick-stat">
                  <AlertCircle size={16} className="stat-icon rejected" />
                  <span className="stat-count">{stats.rejected}</span>
                  <span className="stat-label">Rejected</span>
                </div>
                <div className="quick-stat">
                  <UserCheck size={16} className="stat-icon unverified" />
                  <span className="stat-count">{stats.unverifiedUsers}</span>
                  <span className="stat-label">Unverified Users</span>
                </div>
              </div>
              
              <div className="verification-promo">
                <Shield size={20} />
                <span>Verified listings are marked with badges for your safety</span>
              </div>
            </div>
            <StatsSummary stats={stats} />
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar 
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          states={nigerianStates}
          lgas={filters.state ? getLGAsForState(filters.state) : []}
        />

        {/* Results Count */}
        <div className="results-count">
          <div className="count-info">
            <span className="count-text">
              Showing {filteredListings.length} of {listings.length} properties
            </span>
            <div className="user-role-stats">
              <span className="stat-item"><UserCheck size={14} /> Tenants: {stats.tenants}</span>
              <span className="stat-item"><Home size={14} /> Landlords: {stats.landlords}</span>
              <span className="stat-item"><Building size={14} /> Estates: {stats.estates}</span>
            </div>
          </div>
          <div className="sort-options">
            <select 
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="verified">Verified First</option>
              <option value="pending">Pending First</option>
              <option value="user_verified">User Verified First</option>
            </select>
          </div>
        </div>

        {/* Content Area */}
        <div className="listings-content">
          {selectedListing ? (
            // Details View
            <ListingDetails 
              listing={selectedListing}
              onBack={handleBackToListings}
              onContact={() => handleContact(selectedListing)}
              onVerify={() => handleVerify(selectedListing.id)}
              onVerifyUser={() => handleVerifyUser(selectedListing.id)}
              onReject={() => handleReject(selectedListing.id)}
              onAcceptToManage={() => handleAcceptToManage(selectedListing.id)}
              userRole={user?.role}
              getVerificationType={getVerificationType}
              getListingStatus={getListingStatus}
            />
          ) : (
            // Grid View
            <>
              {filteredListings.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <Search size={48} />
                  </div>
                  <h3>No properties found</h3>
                  <p>Try adjusting your search criteria or filters</p>
                  <button 
                    className="btn btn-primary"
                    onClick={clearFilters}
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="listings-grid">
                  {filteredListings.map((listing) => {
                    const verificationType = getVerificationType(listing);
                    const isUserVerified = listing.userVerified;
                    const isListingVerified = listing.verified && listing.status === 'approved';
                    const listingStatus = getListingStatus(listing);
                    const isRejected = listing.rejected;
                    const isPending = listingStatus === 'pending';
                    const isManaged = listing.isManaged;
                    
                    return (
                      <div key={listing.id} className={`listing-card-enhanced ${listingStatus} ${isManaged ? 'managed' : ''} ${listing.userRole === 'estate-firm' ? 'estate-firm' : ''}`}>
                        {/* Image Container */}
                        <div className="listing-image-container">
                          <img 
                            src={listing.images?.[0] || 'https://picsum.photos/seed/listing1/600/400'} 
                            alt={listing.title}
                            className="listing-image"
                          />
                          
                          {/* Status Badges */}
                          <div className="status-badges-overlay">
                            {/* Property Verification Badge */}
                            {isListingVerified && (
                              <div className="verified-badge-overlay">
                                <VerifiedBadge type="property" size="small" showTooltip={true} />
                              </div>
                            )}
                            
                            {/* Pending Status Badge */}
                            {isPending && (
                              <div className="pending-badge-overlay">
                                <span className="pending-badge">
                                  <Clock size={12} />
                                  <span className="pending-text">Pending Approval</span>
                                </span>
                              </div>
                            )}
                            
                            {/* Rejected Status Badge */}
                            {isRejected && (
                              <div className="rejected-badge-overlay">
                                <span className="rejected-badge">
                                  <AlertCircle size={12} />
                                  <span className="rejected-text">Rejected</span>
                                </span>
                              </div>
                            )}
                            
                            {/* User Verification Badge */}
                            {isUserVerified && (
                              <div className="user-verified-badge-overlay">
                                <VerifiedBadge type={verificationType} size="small" showTooltip={true} />
                              </div>
                            )}
                            
                            {/* Unverified User Badge */}
                            {!isUserVerified && (
                              <div className="unverified-badge-overlay">
                                <span className="unverified-badge">
                                  <span className="unverified-icon">⚠️</span>
                                  <span className="unverified-text">Unverified {listing.userRole}</span>
                                </span>
                              </div>
                            )}
                            
                            {/* Managed Badge */}
                            {isManaged && (
                              <div className="managed-badge-overlay">
                                <span className="managed-badge">
                                  <Building size={12} />
                                  <span className="managed-text">Managed</span>
                                </span>
                              </div>
                            )}
                            
                            {/* Estate Firm Commission Badge */}
                            {listing.userRole === 'estate-firm' && (
                              <div className="commission-badge-overlay">
                                <span className="commission-badge">
                                  <span className="commission-icon">💰</span>
                                  <span className="commission-text">0% Commission</span>
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* User Role Indicator */}
                          <div className="user-role-indicator">
                            <span className={`role-badge role-${listing.userRole}`}>
                              {listing.userRole === 'estate-firm' ? '🏢 Estate' : 
                               listing.userRole === 'landlord' ? '🏠 Landlord' : 
                               '👤 Tenant'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="listing-content">
                          <div className="listing-header">
                            <h3 className="listing-title">{listing.title}</h3>
                            <div className="listing-verification-status">
                              {isUserVerified ? (
                                <InlineVerifiedBadge type={verificationType} />
                              ) : (
                                <span className="unverified-inline">
                                  ⚠️ Unverified {listing.userRole}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <p className="listing-description">{listing.description}</p>
                          
                          <div className="listing-details">
                            <div className="detail-row">
                              <span className="detail-label">Price:</span>
                              <span className="detail-value price">₦{listing.price?.toLocaleString()}</span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Location:</span>
                              <span className="detail-value location">{listing.address}</span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Type:</span>
                              <span className="detail-value type">{listing.propertyType}</span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Status:</span>
                              <span className={`detail-value status status-${listingStatus}`}>
                                {listingStatus === 'verified' ? '✓ Verified' : 
                                 listingStatus === 'pending' ? '⏳ Pending' : 
                                 listingStatus === 'rejected' ? '✗ Rejected' : 'Unknown'}
                              </span>
                            </div>
                            {/* Commission Info */}
                            <div className="detail-row">
                              <span className="detail-label">Commission:</span>
                              <span className={`detail-value commission ${listing.userRole === 'estate-firm' ? 'no-commission' : 'with-commission'}`}>
                                {listing.userRole === 'estate-firm' ? '0% (Estate Firm)' : '7.5%'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="listing-footer">
                            <div className="poster-info">
                              <span className="poster-name">
                                Posted by: {listing.posterName}
                              </span>
                              <span className="poster-role">
                                {listing.userRole === 'estate-firm' ? '🏢 Estate Firm' : 
                                 listing.userRole === 'landlord' ? '🏠 Landlord' : 
                                 '👤 Outgoing Tenant'}
                              </span>
                              {isManaged && (
                                <span className="poster-managed">
                                  Managed by: {listing.managedBy}
                                </span>
                              )}
                            </div>
                            
                            <div className="listing-actions">
                              <button 
                                className="btn-view-details"
                                onClick={() => handleViewDetails(listing)}
                              >
                                View Details
                              </button>
                              
                              {/* Admin/Manager Actions */}
                              {(user?.role === 'admin' || user?.role === 'manager') && (
                                <div className="admin-actions">
                                  {user?.role === 'manager' && !canManagerVerify(user.id) && (
                                    <div className="kyc-warning">
                                      Complete KYC to verify listings
                                    </div>
                                  )}
                                  
                                  {!isListingVerified && !isRejected && (
                                    <button 
                                      className="btn-verify-listing"
                                      onClick={() => handleVerify(listing.id)}
                                      disabled={user?.role === 'manager' && !canManagerVerify(user.id)}
                                    >
                                      {user?.role === 'manager' ? 'Verify (KYC Required)' : 'Verify Listing'}
                                    </button>
                                  )}
                                  
                                  {user?.role === 'admin' && !isUserVerified && (
                                    <button 
                                      className="btn-verify-user"
                                      onClick={() => handleVerifyUser(listing.id)}
                                    >
                                      Verify User
                                    </button>
                                  )}
                                  
                                  {!isListingVerified && !isRejected && (
                                    <button 
                                      className="btn-reject-listing"
                                      onClick={() => handleReject(listing.id)}
                                    >
                                      Reject
                                    </button>
                                  )}
                                  
                                  {user?.role === 'manager' && !isManaged && listing.userRole !== 'estate-firm' && (
                                    <button 
                                      className="btn-accept-manage"
                                      onClick={() => handleAcceptToManage(listing.id)}
                                      disabled={!canManagerAccept(user.id)}
                                    >
                                      {canManagerAccept(user.id) 
                                        ? 'Accept to Manage' 
                                        : 'Complete KYC to Manage'}
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Verification Legend */}
        <div className="verification-legend">
          <h4>Verification Badges Legend</h4>
          <div className="legend-items">
            <div className="legend-item">
              <VerifiedBadge type="landlord" size="small" />
              <span>Verified Landlord</span>
            </div>
            <div className="legend-item">
              <VerifiedBadge type="tenant" size="small" />
              <span>Verified Tenant</span>
            </div>
            <div className="legend-item">
              <VerifiedBadge type="estate" size="small" />
              <span>Verified Estate Firm</span>
            </div>
            <div className="legend-item">
              <VerifiedBadge type="property" size="small" />
              <span>Verified Property</span>
            </div>
            <div className="legend-item">
              <span className="pending-legend">⏳ Pending</span>
              <span>Awaiting Admin Approval</span>
            </div>
            <div className="legend-item">
              <span className="unverified-legend">⚠️ Unverified</span>
              <span>Unverified Poster</span>
            </div>
            <div className="legend-item">
              <span className="managed-legend">🏢 Managed</span>
              <span>Property Manager Assigned</span>
            </div>
            <div className="legend-item">
              <span className="commission-legend">💰 0% Commission</span>
              <span>Estate Firm Listing</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Enhanced sample listings with real-world scenarios
const getSampleListings = () => {
  return [
    {
      id: '1',
      title: 'Cozy Self-Contained Apartment',
      description: 'A small cozy place perfect for singles. Fully furnished with kitchenette.',
      propertyType: 'Self Contain',
      price: 120000,
      state: 'Lagos',
      lga: 'Ikeja',
      address: '123 Allen Avenue, Ikeja',
      coordinates: { lat: 6.605874, lng: 3.349149 },
      images: ['https://picsum.photos/seed/listing1/600/400'],
      verified: true,
      userVerified: true,
      userRole: 'landlord',
      status: 'approved',
      timestamp: new Date('2024-01-15').toISOString(),
      createdAt: '2024-01-15',
      posterName: 'John Verified Properties',
      posterId: 'landlord_001',
      approvedAt: '2024-01-16',
      approvedBy: 'Admin User',
      views: 45,
      inquiries: 12,
      needsAdminApproval: false,
      // BUSINESS RULE: Commission rates
      commissionRate: 7.5,
      managerCommission: 2.5,
      referrerCommission: 1,
      rentEasyCommission: 4,
      isManaged: true,
      managedBy: 'Manager Jane',
      managedById: 'manager_001'
    },
    {
      id: '2',
      title: 'Luxury 2-Bedroom Apartment',
      description: 'Spacious apartment in prime location. Modern amenities and 24/7 security.',
      propertyType: '2 Bedroom',
      price: 500000,
      state: 'Lagos',
      lga: 'Lekki',
      address: '45 Admiralty Way, Lekki Phase 1',
      coordinates: { lat: 6.428055, lng: 3.452222 },
      images: ['https://picsum.photos/seed/listing2/600/400'],
      verified: false, // NOT YET ADMIN-APPROVED
      userVerified: true,
      userRole: 'tenant',
      status: 'pending', // PENDING ADMIN APPROVAL
      timestamp: new Date('2024-01-10').toISOString(),
      createdAt: '2024-01-10',
      posterName: 'Jane Smith (Outgoing Tenant)',
      posterId: 'tenant_001',
      views: 32,
      inquiries: 8,
      needsAdminApproval: true,
      postedDate: '2024-01-10',
      // BUSINESS RULE: Commission rates
      commissionRate: 7.5,
      managerCommission: 2.5,
      referrerCommission: 1,
      rentEasyCommission: 4,
      isManaged: false // No manager assigned yet
    },
    {
      id: '3',
      title: 'Modern 3-Bedroom Duplex',
      description: 'Brand new duplex with state-of-the-art facilities. Ideal for family.',
      propertyType: '3 Bedroom Duplex',
      price: 750000,
      state: 'Abuja',
      lga: 'Garki',
      address: '78 Aminu Kano Crescent, Garki',
      coordinates: { lat: 9.057075, lng: 7.471308 },
      images: ['https://picsum.photos/seed/listing3/600/400'],
      verified: true,
      userVerified: true,
      userRole: 'estate-firm',
      status: 'approved',
      timestamp: new Date('2024-01-12').toISOString(),
      createdAt: '2024-01-12',
      posterName: 'Prime Real Estate Ltd.',
      posterId: 'estate_001',
      approvedAt: '2024-01-13',
      approvedBy: 'Admin User',
      views: 56,
      inquiries: 15,
      needsAdminApproval: false,
      // BUSINESS RULE: Estate firm has 0% commission
      commissionRate: 0,
      managerCommission: 0,
      referrerCommission: 0,
      rentEasyCommission: 0,
      subscriptionActive: true,
      isManaged: false // Estate firm listings don't need manager
    },
    {
      id: '4',
      title: '1-Bedroom Flat',
      description: 'Affordable flat in quiet neighborhood. Perfect for young professionals.',
      propertyType: '1 Bedroom',
      price: 180000,
      state: 'Lagos',
      lga: 'Surulere',
      address: '22 Bode Thomas, Surulere',
      coordinates: { lat: 6.5010, lng: 3.3580 },
      images: ['https://picsum.photos/seed/listing4/600/400'],
      verified: false, // NOT ADMIN-APPROVED
      userVerified: false, // User not verified either
      userRole: 'landlord',
      status: 'pending', // PENDING ADMIN APPROVAL
      timestamp: new Date('2024-01-14').toISOString(),
      createdAt: '2024-01-14',
      posterName: 'Unverified Owner',
      posterId: 'landlord_002',
      views: 18,
      inquiries: 3,
      needsAdminApproval: true,
      postedDate: '2024-01-14',
      // BUSINESS RULE: Commission rates
      commissionRate: 7.5,
      managerCommission: 2.5,
      referrerCommission: 1,
      rentEasyCommission: 4,
      isManaged: false
    },
    {
      id: '5',
      title: 'Studio Apartment',
      description: 'Compact studio for students. Close to universities and markets.',
      propertyType: 'Studio',
      price: 95000,
      state: 'Ogun',
      lga: 'Abeokuta South',
      address: '15 Ibara Housing Estate, Abeokuta',
      coordinates: { lat: 7.1475, lng: 3.3619 },
      images: ['https://picsum.photos/seed/listing5/600/400'],
      verified: true,
      userVerified: false, // User not verified
      userRole: 'tenant',
      status: 'approved',
      timestamp: new Date('2024-01-13').toISOString(),
      createdAt: '2024-01-13',
      posterName: 'Student Moving Out',
      posterId: 'tenant_002',
      approvedAt: '2024-01-14',
      approvedBy: 'Admin User',
      views: 27,
      inquiries: 6,
      needsAdminApproval: false,
      // BUSINESS RULE: Commission rates
      commissionRate: 7.5,
      managerCommission: 2.5,
      referrerCommission: 1,
      rentEasyCommission: 4,
      isManaged: true,
      managedBy: 'Manager Mike',
      managedById: 'manager_002'
    },
    {
      id: '6',
      title: 'Rejected Property - Low Quality Photos',
      description: 'Property with poor quality images, rejected by admin.',
      propertyType: '2 Bedroom',
      price: 320000,
      state: 'Lagos',
      lga: 'Yaba',
      address: 'University Road, Yaba',
      images: ['https://picsum.photos/seed/listing6/600/400'],
      verified: false,
      userVerified: true,
      userRole: 'landlord',
      status: 'rejected',
      timestamp: new Date('2024-01-16').toISOString(),
      createdAt: '2024-01-16',
      posterName: 'New User',
      posterId: 'landlord_003',
      rejected: true,
      rejectedAt: '2024-01-17',
      rejectedBy: 'Admin User',
      rejectionReason: 'Low quality photos, needs better images',
      views: 5,
      inquiries: 0,
      needsAdminApproval: false,
      // BUSINESS RULE: Commission rates
      commissionRate: 7.5,
      managerCommission: 2.5,
      referrerCommission: 1,
      rentEasyCommission: 4
    },
    {
      id: '7',
      title: 'Brand New Listing - Just Posted',
      description: 'Fresh listing posted today, awaiting admin approval.',
      propertyType: '3 Bedroom',
      price: 650000,
      state: 'Lagos',
      lga: 'Victoria Island',
      address: 'Adeola Odeku Street, VI',
      images: ['https://picsum.photos/seed/listing7/600/400'],
      verified: false,
      userVerified: true,
      userRole: 'estate-firm',
      status: 'pending',
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      posterName: 'New Estate Firm',
      posterId: 'estate_002',
      views: 0,
      inquiries: 0,
      needsAdminApproval: true,
      postedDate: new Date().toISOString().split('T')[0],
      // BUSINESS RULE: Estate firm has 0% commission
      commissionRate: 0,
      managerCommission: 0,
      referrerCommission: 0,
      rentEasyCommission: 0,
      subscriptionActive: false // New estate firm might not have subscription yet
    }
  ];
};

export default ListingsPage;