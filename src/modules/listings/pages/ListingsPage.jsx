// src/modules/listings/pages/ListingsPage.jsx
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
import PropertyImage from '../../../shared/components/PropertyImage';
import { locationService } from '../../../shared/services/locationService';
import { 
  Search, Filter, Bell, Shield, UserCheck, Building, Home, 
  AlertCircle, Clock, CheckCircle, MapPin, MessageSquare, 
  ChevronDown, ChevronUp, DollarSign, Navigation
} from 'lucide-react';
import './ListingsPage.css';

const ITEMS_PER_PAGE = 10;
const BOOST_RATIO = 0.8; // 80% boosted, 20% non-boosted

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

  // UI collapse states
  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [availableStates, setAvailableStates] = useState([]);
  const [lgasForState, setLgasForState] = useState([]);

  // Location state
  const [userLocation, setUserLocation] = useState(null);
  const [locationDetected, setLocationDetected] = useState(false);
  const [boostedUserIds, setBoostedUserIds] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filter States
  const [filters, setFilters] = useState({
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

  // Load states on mount
  useEffect(() => {
    const loadStates = async () => {
      try {
        const states = await locationService.getStates();
        setAvailableStates(states);
      } catch (error) {
        console.error('Error loading states:', error);
      }
    };
    loadStates();
    detectUserLocation();
  }, []);

  // Detect user location
  const detectUserLocation = async () => {
    try {
      const location = await locationService.detectUserLocation();
      if (location?.state) {
        setUserLocation(location);
        setLocationDetected(true);
        // Optionally pre‑fill filters with detected state (user can override)
        // setFilters(prev => ({ ...prev, state: location.state, lga: location.lga || '' }));
      }
    } catch (error) {
      console.warn('Location detection failed:', error);
    }
  };

  // Load LGAs when selected state changes
  useEffect(() => {
    const loadLGAs = async () => {
      if (!filters.state) {
        setLgasForState([]);
        return;
      }
      try {
        const lgas = await locationService.getLGAsForState(filters.state);
        setLgasForState(lgas);
      } catch (error) {
        console.error('Error loading LGAs:', error);
        setLgasForState([]);
      }
    };
    loadLGAs();
  }, [filters.state]);

  // Fetch boosted user IDs from active_boosts
  useEffect(() => {
    const fetchBoostedUsers = async () => {
      const { data, error } = await supabase
        .from('active_boosts')
        .select('user_id')
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString());
      if (!error && data) {
        setBoostedUserIds(data.map(b => b.user_id));
      }
    };
    fetchBoostedUsers();
  }, []);

  // Main data fetching with boosting and location
  useEffect(() => {
    if (boostedUserIds === null) return; // still loading
    loadListingsWithBoost();
  }, [userLocation, boostedUserIds, page, filters]);

  const loadListingsWithBoost = async () => {
    setLoading(true);
    try {
      // Build base query with location and other filters
      let baseQuery = supabase.from('listings').select('*', { count: 'exact' });

      // Apply location filter if detected (and user hasn't manually overridden)
      const effectiveState = filters.state || (userLocation?.state || null);
      const effectiveLga = filters.lga || (userLocation?.lga || null);
      if (effectiveState) {
        baseQuery = baseQuery.eq('state', effectiveState);
        if (effectiveLga) baseQuery = baseQuery.eq('lga', effectiveLga);
      }

      // Apply other filters
      if (filters.propertyType) baseQuery = baseQuery.eq('propertyType', filters.propertyType);
      if (filters.minPrice) baseQuery = baseQuery.gte('price', filters.minPrice);
      if (filters.maxPrice) baseQuery = baseQuery.lte('price', filters.maxPrice);
      if (filters.userRole && filters.userRole !== 'all') {
        baseQuery = baseQuery.eq('posterRole', filters.userRole);
      }
      if (filters.status === 'verified') {
        baseQuery = baseQuery.eq('verified', true).eq('status', 'approved');
      } else if (filters.status === 'pending') {
        baseQuery = baseQuery.eq('status', 'pending');
      } else if (filters.status === 'rejected') {
        baseQuery = baseQuery.eq('status', 'rejected');
      } else {
        baseQuery = baseQuery.neq('status', 'rented'); // hide rented
      }
      if (filters.verifiedOnly) {
        baseQuery = baseQuery.eq('verified', true).eq('status', 'approved');
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        baseQuery = baseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,address.ilike.%${query}%`);
      }

      // Get total count
      const { count, error: countError } = await baseQuery;
      if (countError) throw countError;
      setTotalCount(count || 0);

      // Separate boosted and non-boosted queries
      let boostedQuery = baseQuery;
      let nonBoostedQuery = baseQuery;

      if (boostedUserIds.length > 0) {
        const boostedIds = boostedUserIds.join(',');
        // OR condition across all possible poster ID columns
        boostedQuery = boostedQuery.or(
          `estate_firm_id.in.(${boostedIds}),landlord_id.in.(${boostedIds}),tenant_id.in.(${boostedIds})`
        );
        nonBoostedQuery = nonBoostedQuery
          .not('estate_firm_id', 'in', `(${boostedIds})`)
          .not('landlord_id', 'in', `(${boostedIds})`)
          .not('tenant_id', 'in', `(${boostedIds})`);
      } else {
        boostedQuery = boostedQuery.filter('id', 'eq', '0'); // return none
      }

      // Calculate pagination offsets
      const boostedNeeded = Math.round(ITEMS_PER_PAGE * BOOST_RATIO); // 8
      const nonBoostedNeeded = ITEMS_PER_PAGE - boostedNeeded; // 2

      const boostedOffset = (page - 1) * boostedNeeded;
      const nonBoostedOffset = (page - 1) * nonBoostedNeeded;

      // Fetch boosted listings
      const { data: boostedData, error: boostedError } = await boostedQuery
        .order('created_at', { ascending: false })
        .range(boostedOffset, boostedOffset + boostedNeeded - 1);

      if (boostedError) throw boostedError;

      // Fetch non-boosted listings
      const { data: nonBoostedData, error: nonBoostedError } = await nonBoostedQuery
        .order('created_at', { ascending: false })
        .range(nonBoostedOffset, nonBoostedOffset + nonBoostedNeeded - 1);

      if (nonBoostedError) throw nonBoostedError;

      // Randomize each group (shuffle)
      const shuffledBoosted = shuffleArray(boostedData || []);
      const shuffledNonBoosted = shuffleArray(nonBoostedData || []);

      // Interleave: 8 boosted, 2 non-boosted (or fill with whatever available)
      const combined = [];
      const maxLength = Math.max(shuffledBoosted.length, shuffledNonBoosted.length);
      for (let i = 0; i < maxLength; i++) {
        if (i < shuffledBoosted.length) combined.push(shuffledBoosted[i]);
        if (i < shuffledNonBoosted.length) combined.push(shuffledNonBoosted[i]);
      }

      // Take first ITEMS_PER_PAGE
      const pageListings = combined.slice(0, ITEMS_PER_PAGE);

      // Enhance with images
      const enhanced = pageListings.map(listing => ({
        ...listing,
        images: listing.images || listing.image_urls || []
      }));
      setListings(enhanced);
      calculateStats(enhanced);
    } catch (error) {
      console.error('Error loading listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const shuffleArray = (array) => {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Apply local filtering (if needed) – we just set filteredListings = listings
  const applyFilters = useCallback(() => {
    setFilteredListings(listings);
  }, [listings]);

  useEffect(() => {
    applyFilters();
  }, [listings, applyFilters]);

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

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    if (name === 'state') setFilters(prev => ({ ...prev, state: value, lga: '' }));
    setPage(1); // reset to first page on filter change
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
      status: 'all',
      userRole: 'all',
      sortBy: 'newest'
    });
    setPage(1);
  };

  // Helper functions
  const getVerificationType = (listing) => {
    if (listing.posterRole === 'landlord') return 'landlord';
    if (listing.posterRole === 'tenant') return 'tenant';
    if (listing.posterRole === 'estate-firm') return 'estate';
    return 'landlord';
  };

  const getListingStatus = (listing) => {
    if (listing.verified && listing.status === 'approved') return 'verified';
    if (listing.status === 'pending') return 'pending';
    if (listing.status === 'rejected') return 'rejected';
    return 'unknown';
  };

  // Handlers
  const handleViewDetails = (listing) => setSelectedListing(listing);
  const handleBackToListings = () => setSelectedListing(null);

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
      loadListingsWithBoost();
    } catch (error) {
      alert(error.message || 'Failed to accept management');
    }
  };

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
      loadListingsWithBoost();
    } catch (error) {
      alert(error.message || 'Failed to verify listing');
    }
  };

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
    const userId = listing.posterId;
    if (!userId) {
      alert('User ID not found for this listing.');
      console.error('Missing posterId in listing:', listing);
      return;
    }
    if (!window.confirm(`Are you sure you want to verify the user "${listing.posterName}"?`)) return;

    try {
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

      await supabase.from('admin_activities').insert({
        admin_id: user.id,
        action: `Verified user: ${listing.posterName}`,
        entity_id: userId,
        details: { admin_name: user.name, listing_id: listing.id },
        created_at: new Date().toISOString()
      });
      alert('User verified successfully!');
      loadListingsWithBoost();
    } catch (error) {
      console.error('Error verifying user:', error);
      alert('Failed to verify user: ' + error.message);
    }
  };

  const handleReject = async (listingId, reason = 'Does not meet guidelines') => {
    if (!user || user.role !== 'admin') {
      alert('Only admins can reject listings.');
      return;
    }
    if (!window.confirm('Are you sure you want to reject this listing?')) return;
    try {
      await listingsService.reject(listingId, reason, user.id);
      alert('Listing rejected!');
      loadListingsWithBoost();
    } catch (error) {
      alert(error.message || 'Failed to reject listing');
    }
  };

  const handleContact = async (listing) => {
    if (!user) {
      navigate('/login', { state: { from: `/listings/${listing.id}` } });
      return;
    }
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

  const canManagerAccept = () => user?.role === 'manager' && user.verified === true;
  const canManagerVerify = () => user?.role === 'manager' && user.verified === true;

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

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

      <main className="listings-main">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-inner">
            <div className="header-content">
              <h1>Available Properties</h1>
              <p>Browse homes posted by outgoing tenants and landlords</p>
              {userLocation && (
                <div className="location-info">
                  <Navigation size={16} />
                  <span>Showing listings near {userLocation.city ? `${userLocation.city}, ` : ''}{userLocation.state}</span>
                </div>
              )}
              <div className="verification-promo">
                <Shield size={20} />
                <span>Verified listings are marked with badges for your safety</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Control Bar */}
        <div className="top-control-bar">
          <div className="control-left">
            <button
              className={showStats ? 'active' : ''}
              onClick={() => setShowStats(!showStats)}
            >
              {showStats ? 'Hide Stats' : 'Show Stats'}
              {showStats ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <button
              className={showFilters ? 'active' : ''}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
          <div className="control-right">
            <span className="results-count-small">
              {filteredListings.length} of {totalCount} properties
            </span>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="sort-select-small"
            >
              <option value="newest">Newest</option>
              <option value="price_low">Price ↑</option>
              <option value="price_high">Price ↓</option>
              <option value="verified">Verified First</option>
              <option value="pending">Pending First</option>
              <option value="user_verified">User Verified First</option>
            </select>
          </div>
        </div>

        {/* Collapsible Stats Section */}
        {showStats && (
          <div className="stats-section">
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
                <span className="stat-label">Unverified</span>
              </div>
              <div className="quick-stat">
                <DollarSign size={16} className="stat-icon price" />
                <span className="stat-count">₦{stats.avgPrice.toLocaleString()}</span>
                <span className="stat-label">Avg Price</span>
              </div>
            </div>
          </div>
        )}

        {/* Collapsible Filter Section */}
        {showFilters && (
          <div className="filter-section">
            <div className="filter-header" onClick={() => setShowFilters(!showFilters)}>
              <h3>Advanced Filters</h3>
              <button className="toggle-filters-btn">
                Hide <ChevronUp size={14} />
              </button>
            </div>
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              states={availableStates}
              lgas={lgasForState}
            />
          </div>
        )}

        {/* Content Area */}
        <div className="listings-content">
          {selectedListing ? (
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
            <>
              {filteredListings.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><Search size={48} /></div>
                  <h3>No properties found</h3>
                  <p>Try adjusting your search criteria or filters</p>
                  <button className="btn btn-primary" onClick={clearFilters}>Clear All Filters</button>
                </div>
              ) : (
                <>
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
                            {/* Status Badges Overlay */}
                            <div className="status-badges-overlay">
                              {isListingVerified && (
                                <div className="verified-badge-overlay">
                                  <VerifiedBadge type="property" size="small" showTooltip={true} />
                                </div>
                              )}
                              {isPending && (
                                <div className="pending-badge-overlay">
                                  <span className="pending-badge"><Clock size={12} /><span className="pending-text">Pending Approval</span></span>
                                </div>
                              )}
                              {isRejected && (
                                <div className="rejected-badge-overlay">
                                  <span className="rejected-badge"><AlertCircle size={12} /><span className="rejected-text">Rejected</span></span>
                                </div>
                              )}
                              {isUserVerified && (
                                <div className="user-verified-badge-overlay">
                                  <VerifiedBadge type={verificationType} size="small" showTooltip={true} />
                                </div>
                              )}
                              {!isUserVerified && (
                                <div className="unverified-badge-overlay">
                                  <span className="unverified-badge"><span className="unverified-icon">⚠️</span><span className="unverified-text">Unverified {posterRole}</span></span>
                                </div>
                              )}
                              {isManaged && (
                                <div className="managed-badge-overlay">
                                  <span className="managed-badge"><Building size={12} /><span className="managed-text">Managed</span></span>
                                </div>
                              )}
                              {posterRole === 'estate-firm' && (
                                <div className="commission-badge-overlay">
                                  <span className="commission-badge"><span className="commission-icon">💰</span><span className="commission-text">0% Commission</span></span>
                                </div>
                              )}
                            </div>
                            <div className="user-role-indicator">
                              <span className={`role-badge role-${posterRole}`}>
                                {posterRole === 'estate-firm' ? '🏢 Estate' : posterRole === 'landlord' ? '🏠 Landlord' : '👤 Tenant'}
                              </span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="listing-content">
                            <div className="listing-header">
                              <h3 className="listing-title">{listing.title}</h3>
                              <div className="listing-verification-status">
                                {isUserVerified ? <InlineVerifiedBadge type={verificationType} /> : <span className="unverified-inline">⚠️ Unverified {posterRole}</span>}
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
                                  {listingStatus === 'verified' ? '✓ Verified' : listingStatus === 'pending' ? '⏳ Pending' : listingStatus === 'rejected' ? '✗ Rejected' : 'Unknown'}
                                </span>
                              </div>
                              <div className="detail-row">
                                <span className="detail-label">Commission:</span>
                                <span className={`detail-value commission ${posterRole === 'estate-firm' ? 'no-commission' : 'with-commission'}`}>
                                  {posterRole === 'estate-firm' ? '0% (Estate Firm)' : '7.5%'}
                                </span>
                              </div>
                            </div>

                            <div className="listing-footer">
                              <div className="poster-info">
                                <span className="poster-name">Posted by: {listing.posterName || listing.postedBy?.fullName || 'Unknown'}</span>
                                <span className="poster-role">
                                  {posterRole === 'estate-firm' ? '🏢 Estate Firm' : posterRole === 'landlord' ? '🏠 Landlord' : '👤 Outgoing Tenant'}
                                </span>
                                {isManaged && <span className="poster-managed">Managed by: {listing.managedBy || 'Manager'}</span>}
                              </div>

                              <div className="listing-actions">
                                <button className="btn-view-details" onClick={() => handleViewDetails(listing)}>View Details</button>
                                <button className="btn-contact" onClick={() => handleContact(listing)} disabled={!user}>
                                  <MessageSquare size={16} />
                                  {user ? 'Contact' : 'Login to Contact'}
                                </button>

                                {(user?.role === 'admin' || user?.role === 'manager') && (
                                  <div className="admin-actions">
                                    {user?.role === 'manager' && !canManagerVerify() && <div className="kyc-warning">Complete KYC to verify listings</div>}

                                    {!isListingVerified && !isRejected && (
                                      <button className="btn-verify-listing" onClick={() => handleVerify(listing.id)} disabled={user?.role === 'manager' && !canManagerVerify()}>
                                        {user?.role === 'manager' ? 'Verify (KYC Required)' : 'Verify Listing'}
                                      </button>
                                    )}

                                    {user?.role === 'admin' && !isUserVerified && (
                                      <button className="btn-verify-user" onClick={() => handleVerifyUser(listing.id)}>Verify User</button>
                                    )}

                                    {!isListingVerified && !isRejected && (
                                      <button className="btn-reject-listing" onClick={() => handleReject(listing.id)}>Reject</button>
                                    )}

                                    {user?.role === 'manager' && !isManaged && posterRole !== 'estate-firm' && (
                                      <button className="btn-accept-manage" onClick={() => handleAcceptToManage(listing.id)} disabled={!canManagerAccept()}>
                                        {canManagerAccept() ? 'Accept to Manage' : 'Complete KYC to Manage'}
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

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="pagination">
                      <button 
                        disabled={page === 1} 
                        onClick={() => setPage(p => p - 1)}
                      >
                        Previous
                      </button>
                      <span>Page {page} of {totalPages}</span>
                      <button 
                        disabled={page === totalPages} 
                        onClick={() => setPage(p => p + 1)}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Verification Legend */}
        <div className="verification-legend">
          <h4>Verification Badges Legend</h4>
          <div className="legend-items">
            <div className="legend-item"><VerifiedBadge type="landlord" size="small" /><span>Verified Landlord</span></div>
            <div className="legend-item"><VerifiedBadge type="tenant" size="small" /><span>Verified Tenant</span></div>
            <div className="legend-item"><VerifiedBadge type="estate" size="small" /><span>Verified Estate Firm</span></div>
            <div className="legend-item"><VerifiedBadge type="property" size="small" /><span>Verified Property</span></div>
            <div className="legend-item"><span className="pending-legend">⏳ Pending</span><span>Awaiting Admin Approval</span></div>
            <div className="legend-item"><span className="unverified-legend">⚠️ Unverified</span><span>Unverified Poster</span></div>
            <div className="legend-item"><span className="managed-legend">🏢 Managed</span><span>Property Manager Assigned</span></div>
            <div className="legend-item"><span className="commission-legend">💰 0% Commission</span><span>Estate Firm Listing</span></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ListingsPage;