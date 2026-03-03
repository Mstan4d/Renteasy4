// src/modules/listings/pages/ListingsPage.jsx - CORRECTED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/lib/supabaseClient';
import { listingsService } from '../../../shared/services/listingsService';
import { messagesService } from '../../../shared/services/messagesService';
import Header from '../../../shared/components/Header';
import VerifiedBadge, { InlineVerifiedBadge } from '../../../shared/components/VerifiedBadge';
import ListingDetails from '../components/ListingDetails';
import FilterBar from '../components/FilterBar';
import StatsSummary from '../components/StatsSummary';
import PropertyImage from '../../../shared/components/PropertyImage';
import { nigerianStates, getLGAsForState } from '../../../shared/data/nigerianLocations';
import { 
  Search, Filter, Bell, Shield, UserCheck, Building, Home, 
  AlertCircle, Clock, CheckCircle, MapPin, MessageSquare 
} from 'lucide-react';
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

  const getImageUrl = (listing) => {
  // Check if it's a valid image URL (not a blob URL)
  const image = listing.images?.[0] || listing.image_urls?.[0];
  
  if (!image) {
    return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop';
  }
  
  // If it's a blob URL (starts with blob:), return fallback
  if (image.startsWith('blob:')) {
    return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop';
  }
  
  // If it's a Supabase URL but not properly formed
  if (image.includes('supabase.co') && !image.startsWith('https://')) {
    return `https://${image}`;
  }
  
  return image;
};
  
  // Filter States
  const [filters, setFilters] = useState({
    state: '',
    lga: '',
    propertyType: '',
    searchQuery: '',
    minPrice: '',
    maxPrice: '',
    verifiedOnly: false,
    status: 'approved',
    userRole: 'all',
    sortBy: 'newest'
  });

  // Load listings from backend
  useEffect(() => {
    loadListings();
  }, []);

  // Apply filters when filters change
  useEffect(() => {
    applyFilters();
  }, [filters, listings]);

  const loadListings = async () => {
    try {
      setLoading(true);

      
      
      // Build query params
      const params = {};
      if (filters.state) params.state = filters.state;
      if (filters.lga) params.lga = filters.lga;
      if (filters.propertyType) params.propertyType = filters.propertyType;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.userRole && filters.userRole !== 'all') params.posterRole = filters.userRole;
      if (filters.searchQuery) params.searchQuery = filters.searchQuery;
      if (filters.verifiedOnly) params.verifiedOnly = true;
      if (filters.status && filters.status !== 'all') params.status = filters.status;
      params.sortBy = filters.sortBy;

      // Use Supabase service
      // Use the fixed service
    const result = await listingsService.getAll(filters);
    
    // Ensure images array exists
    const listingsWithImages = result.map(listing => ({
      ...listing,
      images: listing.images || listing.image_urls || []
    }));
    
    setListings(listingsWithImages);
    calculateStats(listingsWithImages);
    
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
    const pending = listingsData.filter(l => l.status === 'pending').length;
    const rejected = listingsData.filter(l => l.status === 'rejected').length;
    const tenants = listingsData.filter(l => l.posterRole === 'tenant').length;
    const landlords = listingsData.filter(l => l.posterRole === 'landlord').length;
    const estates = listingsData.filter(l => l.posterRole === 'estate-firm').length;
    const unverifiedUsers = listingsData.filter(l => !l.postedBy?.isVerified).length;
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
      filtered = filtered.filter(listing => listing.posterRole === filters.userRole);
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
        (listing.lga?.toLowerCase().includes(query)) ||
        (listing.city?.toLowerCase().includes(query))
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
    } else if (filters.status === 'all') {
      filtered = filtered.filter(listing => listing.status === 'approved' || listing.status === 'pending');
    } else if (filters.status === 'rejected') {
      filtered = filtered.filter(listing => listing.status === 'rejected');
    } else if (filters.status === 'all') {
      // Show all statuses except 'rented' for browsing
      filtered = filtered.filter(listing => listing.status !== 'rented');
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
          const aPending = (a.status === 'pending') ? 1 : 0;
          const bPending = (b.status === 'pending') ? 1 : 0;
          return bPending - aPending;
        });
        break;
      case 'user_verified':
        filtered.sort((a, b) => {
          const aUserVerified = a.postedBy?.isVerified ? 1 : 0;
          const bUserVerified = b.postedBy?.isVerified ? 1 : 0;
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

  const clearFilters = () => {
    setFilters({
      state: '',
      lga: '',
      propertyType: '',
      searchQuery: '',
      minPrice: '',
      maxPrice: '',
      verifiedOnly: false,
      status: 'approved',
      userRole: 'all',
      sortBy: 'newest'
    });
  };

  // Get verification type for badge
  const getVerificationType = (listing) => {
    if (listing.posterRole === 'estate-firm') return 'estate';
    if (listing.posterRole === 'landlord') return 'landlord';
    if (listing.posterRole === 'tenant') return 'tenant';
    return 'user';
  };

  // Get listing status for display
  const getListingStatus = (listing) => {
    if (listing.rejected) return 'rejected';
    if (listing.verified && listing.status === 'approved') return 'verified';
    if (listing.status === 'pending' || (!listing.verified && !listing.rejected)) return 'pending';
    return 'unknown';
  };

  

  // Handle listing click
  const handleViewDetails = (listing) => {
    setSelectedListing(listing);
  };

  // Handle back to listings
  const handleBackToListings = () => {
    setSelectedListing(null);
  };

  // BUSINESS RULE: Handle accept to manage with API call
  const handleAcceptToManage = async (listingId) => {
    if (!user) {
      navigate('/login', { state: { from: `/listings/${listingId}` } });
      return;
    }

    if (user.role !== 'manager') {
      alert('Only managers can accept to manage listings.');
      return;
    }

    try {
      await listingsService.acceptToManage(listingId, user.id);
      alert('You are now managing this listing!');
      // Refresh listings
      loadListings();
    } catch (error) {
      alert(error.message || 'Failed to accept management');
    }
  };

  // BUSINESS RULE: Handle verify listing with API call
  const handleVerify = async (listingId) => {
    if (!user) {
      alert('Please login to verify listings');
      return;
    }

    if (!['admin', 'manager'].includes(user.role)) {
      alert('Only admins and managers can verify listings.');
      return;
    }

    try {
      await listingsService.verify(listingId, user.id);
      alert('Listing verified successfully!');
      loadListings();
    } catch (error) {
      alert(error.message || 'Failed to verify listing');
    }
  };

 // BUSINESS RULE: Handle verify user (admin only)
const handleVerifyUser = async (listingId) => {
  if (!user || user.role !== 'admin') {
    alert('Only admins can verify users.');
    return;
  }

  const listing = listings.find(l => l.id === listingId);
  if (!listing) {
    alert('Listing not found.');
    return;
  }

  // The user ID is stored in posterId (from the service transformation)
  const userId = listing.posterId;
  if (!userId) {
    alert('User ID not found for this listing.');
    console.error('Missing posterId in listing:', listing);
    return;
  }

  if (!window.confirm(`Are you sure you want to verify the user "${listing.posterName}"?`)) return;

  try {
    // Update the user's profile
    const { error } = await supabase
      .from('profiles')
      .update({
        kyc_status: 'approved',
        verified: true,
        is_kyc_verified: true,
        kyc_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;

    // Log admin activity
    await supabase.from('admin_activities').insert({
      admin_id: user.id,
      action: `Verified user: ${listing.posterName}`,
      entity_id: userId,
      details: { admin_name: user.name, listing_id: listing.id },
      created_at: new Date().toISOString()
    });

    alert('User verified successfully!');
    loadListings(); // refresh to update the badge
  } catch (error) {
    console.error('Error verifying user:', error);
    alert('Failed to verify user: ' + error.message);
  }
};
  // BUSINESS RULE: Handle reject listing with API call
  const handleReject = async (listingId, reason = 'Does not meet guidelines') => {
    if (!user || user.role !== 'admin') {
      alert('Only admins can reject listings.');
      return;
    }
    console.log('Listing object:', listing);
console.log('User ID from profile:', listing.profile?.id);
console.log('User ID from user_id:', listing.user_id);

    if (!window.confirm('Are you sure you want to reject this listing?')) return;
    
    try {
      await listingsService.reject(listingId, reason, user.id);
      alert('Listing rejected!');
      loadListings();
    } catch (error) {
      alert(error.message || 'Failed to reject listing');
    }
  };

  // BUSINESS RULE: Handle contact with API call
  const handleContact = async (listing) => {
    if (!user) {
      navigate('/login', { state: { from: `/listings/${listing.id}` } });
      return;
    }

    // BUSINESS RULE: Check if user is trying to contact themselves
    if (user.id === listing.posterId) {
      alert('You cannot contact yourself for your own listing');
      return;
    }

    try {
      const result = await messagesService.initiateContact(listing.id, user.id, user.role);
      
      if (result) {
        navigate(`/dashboard/messages/chat/${result.chatId}`);
      }
    } catch (error) {
      alert(error.message || 'Failed to initiate contact');
    }
  };

  // Check if manager can accept to manage
  const canManagerAccept = () => {
    if (!user || user.role !== 'manager') return false;
    // Check if manager is verified (passed KYC)
    return user.verified === true;
  };

  const canManagerVerify = () => {
    if (!user || user.role !== 'manager') return false;
    // Check if manager is verified (passed KYC)
    return user.verified === true;
  };


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
              canManagerVerify={canManagerVerify()}
              canManagerAccept={canManagerAccept()}
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
                    const isUserVerified = listing.postedBy?.isVerified || listing.userVerified;
                    const isListingVerified = listing.verified && listing.status === 'approved';
                    const listingStatus = getListingStatus(listing);
                    const isRejected = listing.status === 'rejected';
                    const isPending = listingStatus === 'pending';
                    const isManaged = listing.isManaged || listing.managedBy;
                    const posterRole = listing.posterRole || listing.userRole;
                    
                    return (
                      <div key={listing.id} className={`listing-card-enhanced ${listingStatus} ${isManaged ? 'managed' : ''} ${posterRole === 'estate-firm' ? 'estate-firm' : ''}`}>
                        {/* Image Container */}
                        <div className="listing-image-container">
                         <PropertyImage 
                        src={listing.images?.[0]} 
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
                                  <span className="unverified-text">Unverified {posterRole}</span>
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
                            {posterRole === 'estate-firm' && (
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
                            <span className={`role-badge role-${posterRole}`}>
                              {posterRole === 'estate-firm' ? '🏢 Estate' : 
                               posterRole === 'landlord' ? '🏠 Landlord' : 
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
                                  ⚠️ Unverified {posterRole}
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
                              <span className="detail-value location">{listing.address || `${listing.lga}, ${listing.state}`}</span>
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
                              <span className={`detail-value commission ${posterRole === 'estate-firm' ? 'no-commission' : 'with-commission'}`}>
                                {posterRole === 'estate-firm' ? '0% (Estate Firm)' : '7.5%'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="listing-footer">
                            <div className="poster-info">
                              <span className="poster-name">
                                Posted by: {listing.posterName || listing.postedBy?.fullName || 'Unknown'}
                              </span>
                              <span className="poster-role">
                                {posterRole === 'estate-firm' ? '🏢 Estate Firm' : 
                                 posterRole === 'landlord' ? '🏠 Landlord' : 
                                 '👤 Outgoing Tenant'}
                              </span>
                              {isManaged && (
                                <span className="poster-managed">
                                  Managed by: {listing.managedBy || 'Manager'}
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
                              
                              <button 
                                className="btn-contact"
                                onClick={() => handleContact(listing)}
                                disabled={!user}
                              >
                                <MessageSquare size={16} />
                                {user ? 'Contact' : 'Login to Contact'}
                              </button>
                              
                              {/* Admin/Manager Actions */}
                              {(user?.role === 'admin' || user?.role === 'manager') && (
                                <div className="admin-actions">
                                  {user?.role === 'manager' && !canManagerVerify() && (
                                    <div className="kyc-warning">
                                      Complete KYC to verify listings
                                    </div>
                                  )}
                                  
                                  {!isListingVerified && !isRejected && (
                                    <button 
                                      className="btn-verify-listing"
                                      onClick={() => handleVerify(listing.id)}
                                      disabled={user?.role === 'manager' && !canManagerVerify()}
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
                                  
                                  {user?.role === 'manager' && !isManaged && posterRole !== 'estate-firm' && (
                                    <button 
                                      className="btn-accept-manage"
                                      onClick={() => handleAcceptToManage(listing.id)}
                                      disabled={!canManagerAccept()}
                                    >
                                      {canManagerAccept() 
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

export default ListingsPage;