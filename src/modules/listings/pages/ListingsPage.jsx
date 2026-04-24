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
import ListingCard from '../components/ListingCard';
import HorizontalScrollList from '../components/HorizontalScrollList';
import RentEasyLoader from '../../../shared/components/RentEasyLoader';
import { locationService } from '../../../shared/services/locationService';
import { 
  Search, Filter, Bell, Shield, UserCheck, Building, Home, 
  AlertCircle, Clock, CheckCircle, MapPin, MessageSquare, 
  ChevronDown, ChevronUp, DollarSign, Navigation, Link
} from 'lucide-react';
import './ListingsPage.css';

const ITEMS_PER_PAGE = 20;
const BOOST_RATIO = 0.8;

const ListingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // State Management
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [IsLoading, setIsLoading] = useState(true);
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
  const [tenantListings, setTenantListings] = useState([]);
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
    if (boostedUserIds === null) return;
    loadListingsWithBoost();
  }, [userLocation, boostedUserIds, page, filters]);

  const loadListingsWithBoost = async () => {
    setIsLoading(true);
    try {
      // Base query for listings (without joins)
      let baseQuery = supabase
        .from('listings')
        .select('*', { count: 'exact' });

      // Apply filters
      const filterState = filters.state || null;
      const filterLga = filters.lga || null;
      if (filterState) {
        baseQuery = baseQuery.eq('state', filterState);
        if (filterLga) baseQuery = baseQuery.eq('lga', filterLga);
      }
      if (filters.propertyType) baseQuery = baseQuery.eq('property_type', filters.propertyType);
      if (filters.minPrice) baseQuery = baseQuery.gte('price', filters.minPrice);
      if (filters.maxPrice) baseQuery = baseQuery.lte('price', filters.maxPrice);
      if (filters.userRole && filters.userRole !== 'all') {
        baseQuery = baseQuery.eq('poster_role', filters.userRole);
      }
      if (filters.status === 'verified') {
        baseQuery = baseQuery.eq('verified', true).eq('status', 'approved');
      } else if (filters.status === 'pending') {
        baseQuery = baseQuery.eq('status', 'pending');
      } else if (filters.status === 'rejected') {
        baseQuery = baseQuery.eq('status', 'rejected');
      } else {
        baseQuery = baseQuery.not('status', 'eq', 'rented');
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

      // Fetch listings for current page
      const fetchLimit = ITEMS_PER_PAGE * 2;
      const from = (page - 1) * fetchLimit;
      const to = from + fetchLimit - 1;
      const { data: rawListings, error: listingsError } = await baseQuery
        .order('created_at', { ascending: false })
        .range(from, to);
      if (listingsError) throw listingsError;

      // Collect IDs for related data
      const estateFirmIds = rawListings.map(l => l.estate_firm_id).filter(Boolean);
      const landlordIds = rawListings.map(l => l.landlord_id).filter(Boolean);
      const tenantIds = rawListings.map(l => l.tenant_id).filter(Boolean);

      // Fetch related data in parallel
      const [estateFirmsRes, landlordsRes, tenantsRes] = await Promise.all([
        estateFirmIds.length
          ? supabase
              .from('estate_firm_profiles')
              .select('id, firm_name, logo_url, verification_status')
              .in('id', estateFirmIds)
          : { data: [] },
        landlordIds.length
          ? supabase
              .from('profiles')
              .select('id, full_name, name, avatar_url, kyc_status')
              .in('id', landlordIds)
          : { data: [] },
        tenantIds.length
          ? supabase
              .from('profiles')
              .select('id, full_name, name, avatar_url, kyc_status')
              .in('id', tenantIds)
          : { data: [] }
      ]);



      // Create lookup maps
      const estateFirmMap = Object.fromEntries((estateFirmsRes.data || []).map(ef => [ef.id, ef]));
      const landlordMap = Object.fromEntries((landlordsRes.data || []).map(l => [l.id, l]));
      const tenantMap = Object.fromEntries((tenantsRes.data || []).map(t => [t.id, t]));

      // Enhance listings with computed fields
      const enhanced = rawListings.map(listing => {
        let posterRole = null;
        let posterName = 'Anonymous';
        let posterAvatar = null;
        let userVerified = false;
    

        if (listing.estate_firm_id && estateFirmMap[listing.estate_firm_id]) {
          const firm = estateFirmMap[listing.estate_firm_id];
          posterRole = 'estate-firm';
          posterName = firm.firm_name || 'Estate Firm';
          posterAvatar = firm.logo_url;
          userVerified = firm.verification_status === 'verified';
        } else if (listing.landlord_id && landlordMap[listing.landlord_id]) {
          const landlord = landlordMap[listing.landlord_id];
          posterRole = 'landlord';
          posterName = landlord.full_name || landlord.name || 'Landlord';
          posterAvatar = landlord.avatar_url;
          userVerified = landlord.kyc_status === 'approved';
        } else if (listing.tenant_id && tenantMap[listing.tenant_id]) {
          const tenant = tenantMap[listing.tenant_id];
          posterRole = 'tenant';
          posterName = tenant.full_name || tenant.name || 'Tenant';
          posterAvatar = tenant.avatar_url;
          userVerified = tenant.kyc_status === 'approved';
        }

        
if (!posterRole) {
  posterRole = listing.poster_role;
  posterName = listing.poster_name || 'Anonymous';
  // If the listing has a userVerified field (e.g., from profiles), use it, but we don't have that here.
}

        return {
          ...listing,
          posterRole,
          posterName,
          posterAvatar,
          userVerified,
          images: listing.images || listing.image_urls || [],
          video_url: listing.video_url || null,           // Single video URL
          video_urls: listing.video_urls || [],           // Multiple video URLs
          has_video: !!(listing.video_url || (listing.video_urls && listing.video_urls.length > 0)) 
        };  
      });

      // Location and boost sorting
      const sortState = filterState ? null : (userLocation?.state || null);
      const sortLga = filterLga ? null : (userLocation?.lga || null);

      const withFlags = enhanced.map(listing => {
        const posterId = listing.estate_firm_id || listing.landlord_id || listing.tenant_id;
        const isBoosted = posterId && boostedUserIds.includes(posterId);
        const sameState = sortState && listing.state === sortState;
        const sameLga = sortLga && listing.lga === sortLga;
        return {
          ...listing,
          isBoosted: isBoosted || false,
          sameState,
          sameLga
        };
      });

      const sorted = withFlags.sort((a, b) => {
        if (a.isBoosted !== b.isBoosted) return a.isBoosted ? -1 : 1;
        if (a.sameState !== b.sameState) return a.sameState ? -1 : 1;
        if (a.sameLga !== b.sameLga) return a.sameLga ? -1 : 1;
        return new Date(b.created_at) - new Date(a.created_at);
      });

      const pageListings = sorted.slice(0, ITEMS_PER_PAGE);

      setListings(pageListings);
      setFilteredListings(pageListings);
      calculateStats(pageListings);
    } catch (error) {
      console.error('Error loading listings:', error);
      setListings([]);
      setFilteredListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  // After loading listings, filter tenant listings
useEffect(() => {
  if (listings.length > 0) {
    const tenants = listings.filter(l => l.posterRole === 'tenant');
    setTenantListings(tenants);
  }
}, [listings]);

  const calculateStats = (listingsData) => {
    const total = listingsData.length;
    const verified = listingsData.filter(l => l.verified && l.status === 'approved').length;
    const pending = listingsData.filter(l => l.status === 'pending').length;
    const rejected = listingsData.filter(l => l.status === 'rejected').length;
    const tenants = listingsData.filter(l => l.posterRole === 'tenant').length;
    const landlords = listingsData.filter(l => l.posterRole === 'landlord').length;
    const estates = listingsData.filter(l => l.posterRole === 'estate-firm').length;
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

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    if (name === 'state') setFilters(prev => ({ ...prev, state: value, lga: '' }));
    setPage(1);
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

  const getVerificationType = (listing) => {
    const role = listing.posterRole || listing.user?.role || 'user';
    if (role === 'estate-firm') return 'estate';
    if (role === 'landlord') return 'landlord';
    if (role === 'tenant') return 'tenant';
    if (listing.verificationLevel === 'premium') return 'property';
    if (listing.userVerified) return 'landlord';
    return 'user';
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
    const userId = listing.landlord_id || listing.tenant_id;
    if (!userId) {
      alert('User ID not found for this listing.');
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
    if (user.id === listing.landlord_id || user.id === listing.tenant_id || user.id === listing.estate_firm_id) {
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

  // Loading skeleton
  if (IsLoading) {
  return (
    <div className="listings-page">
      <Header />
      <RentEasyLoader message="Finding properties for you..." />
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

        
{tenantListings.length > 0 && (
  <HorizontalScrollList
    listings={tenantListings}
    title="Latest from Outgoing Tenants"
    onViewDetails={handleViewDetails}
  />
)}

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
                <span className="stat-label">Unverified Users</span>
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
                    {filteredListings.map((listing) => (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                        onViewDetails={() => handleViewDetails(listing)}
                        onContact={() => handleContact(listing)}
                        onVerify={() => handleVerify(listing.id)}
                        userRole={user?.role}
                      />
                    ))}
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