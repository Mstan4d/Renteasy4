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

  // Initialize data
  useEffect(() => {
    loadListings();
    
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

  // Apply filters
const applyFilters = useCallback(() => {
  let filtered = [...listings];

  // REMOVED the user role filter that hides unverified listings
  
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

  // Apply user role filter (for filtering by poster's role, not viewing permissions)
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

  // Apply verification status filter (if user specifically wants to filter by status)
  if (filters.status === 'verified') {
    filtered = filtered.filter(listing => listing.verified && listing.status === 'approved');
  } else if (filters.status === 'pending') {
    filtered = filtered.filter(listing => listing.status === 'pending' || (!listing.verified && !listing.rejected));
  } else if (filters.status === 'rejected') {
    filtered = filtered.filter(listing => listing.rejected);
  }

  // Apply verified only filter (if user checks "verified only" checkbox)
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
      // Play notification sound (only for admin/manager)
      if (user?.role === 'admin' || user?.role === 'manager') {
        const audio = new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg');
        audio.play().catch(() => {});
      }
      
      // Reload listings
      loadListings();
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

  // Handle contact button
  const handleContact = (listing) => {
    const contactData = {
      listingId: listing.id,
      title: listing.title,
      posterName: listing.posterName || 'Unknown',
      price: listing.price,
      state: listing.state,
      lga: listing.lga,
      type: listing.userRole || 'landlord',
      userVerified: listing.userVerified,
      posterId: listing.posterId
    };
    
    localStorage.setItem('activeContact', JSON.stringify(contactData));
    navigate(`/messages?listing=${encodeURIComponent(listing.id)}`);
  };

  // Handle verify button (admin/manager)
  const handleVerify = (listingId) => {
    const listingToVerify = listings.find(l => l.id === listingId);
    const updatedListings = listings.map(listing => 
      listing.id === listingId ? { 
        ...listing, 
        verified: true, 
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: user?.name,
        approvedById: user?.id
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

  // Handle accept to manage (manager)
  const handleAcceptToManage = (listingId) => {
    const listingToManage = listings.find(l => l.id === listingId);
    
    // Get current managed listings
    const managedListings = JSON.parse(localStorage.getItem('managedListings') || '[]');
    const alreadyManaged = managedListings.find(l => l.listingId === listingId);
    
    if (alreadyManaged) {
      alert('You are already managing this listing!');
      return;
    }
    
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
      status: 'active'
    };
    
    localStorage.setItem('managedListings', JSON.stringify([...managedListings, newManagedListing]));
    
    // Update listing to show it's being managed
    const updatedListings = listings.map(listing => 
      listing.id === listingId ? { 
        ...listing, 
        isManaged: true,
        managedBy: user?.name,
        managedById: user?.id,
        managedAt: new Date().toISOString()
      } : listing
    );
    
    localStorage.setItem('listings', JSON.stringify(updatedListings));
    setListings(updatedListings);
    
    alert('You are now managing this listing!');
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
                      <div key={listing.id} className={`listing-card-enhanced ${listingStatus} ${isManaged ? 'managed' : ''}`}>
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
                                  {!isListingVerified && !isRejected && (
                                    <button 
                                      className="btn-verify-listing"
                                      onClick={() => handleVerify(listing.id)}
                                    >
                                      Verify Listing
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
                                  
                                  {user?.role === 'manager' && !isManaged && (
                                    <button 
                                      className="btn-accept-manage"
                                      onClick={() => handleAcceptToManage(listing.id)}
                                    >
                                      Accept to Manage
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
      needsAdminApproval: false
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
      postedDate: '2024-01-10'
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
      isManaged: true,
      managedBy: 'Manager Joe',
      managedAt: '2024-01-14'
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
      postedDate: '2024-01-14'
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
      needsAdminApproval: false
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
      needsAdminApproval: false
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
      postedDate: new Date().toISOString().split('T')[0]
    }
  ];
};



export default ListingsPage;